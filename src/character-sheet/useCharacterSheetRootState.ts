import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  CharacterImageError,
  convertCharacterImage,
  decodeImportedCharacterImage,
} from "./browser/character-image";
import { downloadJsonFile } from "./browser/json-download";
import { readCharacterSheetJsonFile } from "./browser/json-import";
import type {
  CharacterImageErrorCode,
  CharacterImageRecord,
} from "./character-image";
import { characterSheetDictionary } from "./dictionary";
import {
  type CharacterSheetFormValues,
  characterSheetDefaultValues,
} from "./form-values";
import {
  createCharacterSheetJsonFilename,
  serializeCharacterSheetJsonExport,
} from "./json-export";
import {
  deleteCharacterImage,
  readCharacterImage,
  writeCharacterImage,
} from "./persistence/character-image";
import {
  readCharacterSheetForm,
  writeCharacterSheetForm,
} from "./persistence/character-sheet-form";
import { characterSheetFormSchema } from "./schemas/character-sheet-form";
import {
  type CharacterSheetJsonImport,
  parseCharacterSheetJsonImport,
  parseCharacterSheetRestoreJson,
} from "./schemas/character-sheet-persistence";

export type CharacterImageErrorState = {
  code: CharacterImageErrorCode | "restore";
};

type CharacterSheetRootOperations = {
  convertCharacterImage: typeof convertCharacterImage;
  decodeImportedCharacterImage: typeof decodeImportedCharacterImage;
  deleteCharacterImage: typeof deleteCharacterImage;
  downloadJsonFile: typeof downloadJsonFile;
  readCharacterSheetJsonFile: typeof readCharacterSheetJsonFile;
  readCharacterImage: typeof readCharacterImage;
  writeCharacterImage: typeof writeCharacterImage;
  readCharacterSheetForm: typeof readCharacterSheetForm;
  writeCharacterSheetForm: typeof writeCharacterSheetForm;
};

type CharacterSheetRootDependencies = Partial<CharacterSheetRootOperations>;

const defaultOperations: CharacterSheetRootOperations = {
  convertCharacterImage,
  decodeImportedCharacterImage,
  deleteCharacterImage,
  downloadJsonFile,
  readCharacterSheetJsonFile,
  readCharacterImage,
  writeCharacterImage,
  readCharacterSheetForm,
  writeCharacterSheetForm,
};

type RootOperation = {
  label: string;
};

function toImageErrorState(error: unknown): CharacterImageErrorState {
  if (error instanceof CharacterImageError) {
    return { code: error.code };
  }

  return { code: "storage" };
}

/** Owns form state and cross-cutting character-sheet UI state. */
export default function useCharacterSheetRootState(
  dependencies: CharacterSheetRootDependencies = {},
) {
  const operationsRef = useRef({ ...defaultOperations, ...dependencies });
  const operations = operationsRef.current;
  const form = useForm<CharacterSheetFormValues>({
    defaultValues: characterSheetDefaultValues,
    mode: "onChange",
    resolver: zodResolver(characterSheetFormSchema),
  });
  const [characterImage, setCharacterImage] =
    useState<CharacterImageRecord | null>(null);
  const [rootOperation, setRootOperation] = useState<RootOperation | null>(
    null,
  );
  const [imageError, setImageError] = useState<CharacterImageErrorState | null>(
    null,
  );
  const [isImageErrorFromJsonImport, setIsImageErrorFromJsonImport] =
    useState(false);
  const [isFormRestoring, setIsFormRestoring] = useState(true);
  const [isCharacterImageRestoring, setIsCharacterImageRestoring] =
    useState(true);
  const [isFormRestoreErrorOpen, setIsFormRestoreErrorOpen] = useState(false);
  const [pendingJsonImport, setPendingJsonImport] =
    useState<CharacterSheetJsonImport | null>(null);
  const [isJsonImportErrorOpen, setIsJsonImportErrorOpen] = useState(false);
  const [isJsonImportImageErrorOpen, setIsJsonImportImageErrorOpen] =
    useState(false);
  const formRestoreConfirmButtonRef = useRef<HTMLButtonElement>(null);
  const formRestoreReturnFocusRef = useRef<HTMLInputElement>(null);
  const imageReturnFocusRef = useRef<HTMLButtonElement>(null);
  const imageErrorCloseButtonRef = useRef<HTMLButtonElement>(null);
  const jsonImportInputRef = useRef<HTMLInputElement>(null);
  const jsonImportReturnFocusRef = useRef<HTMLButtonElement>(null);
  const jsonImportErrorConfirmButtonRef = useRef<HTMLButtonElement>(null);
  const hasCommittedImageRef = useRef(false);
  const isJsonImportReadingRef = useRef(false);
  const [shouldRestoreJsonImportFocus, setShouldRestoreJsonImportFocus] =
    useState(false);

  useEffect(() => {
    if (!shouldRestoreJsonImportFocus || rootOperation !== null) return;

    setShouldRestoreJsonImportFocus(false);
    jsonImportReturnFocusRef.current?.focus();
  }, [rootOperation, shouldRestoreJsonImportFocus]);

  useEffect(() => {
    let isCurrent = true;

    void operations
      .readCharacterImage()
      .then((record) => {
        if (isCurrent && !hasCommittedImageRef.current && record !== null) {
          setCharacterImage(record);
        }
      })
      .catch(() => {
        if (isCurrent && !hasCommittedImageRef.current) {
          setIsImageErrorFromJsonImport(false);
          setImageError({ code: "restore" });
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsCharacterImageRestoring(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [operations]);

  useEffect(() => {
    try {
      const text = operations.readCharacterSheetForm(window.localStorage);
      if (text !== null) {
        const values = parseCharacterSheetRestoreJson(text);
        if (values === null) {
          setIsFormRestoreErrorOpen(true);
        } else {
          form.reset(values);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsFormRestoring(false);
    }
  }, [form, operations]);

  useEffect(() => {
    if (isFormRestoring) return;

    let timeout: ReturnType<typeof setTimeout> | undefined;
    let latestValues = form.getValues();
    let hasPendingWrite = false;
    const flush = () => {
      if (!hasPendingWrite) return;
      hasPendingWrite = false;
      if (timeout !== undefined) clearTimeout(timeout);
      try {
        operations.writeCharacterSheetForm(window.localStorage, latestValues);
      } catch (error) {
        console.error(error);
      }
    };
    const subscription = form.subscribe({
      callback: ({ values }) => {
        latestValues = values as CharacterSheetFormValues;
        if (timeout !== undefined) clearTimeout(timeout);
        hasPendingWrite = true;
        timeout = setTimeout(() => {
          flush();
        }, 200);
      },
      formState: { values: true },
    });
    window.addEventListener("pagehide", flush);

    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
      subscription();
    };
  }, [form, isFormRestoring, operations]);

  function onCharacterImageOperationStarted(trigger: HTMLButtonElement): void {
    imageReturnFocusRef.current = trigger;
  }

  async function runRootOperation<T>(
    label: string,
    operation: () => Promise<T>,
  ): Promise<T> {
    setRootOperation({ label });

    try {
      return await operation();
    } finally {
      setRootOperation(null);
    }
  }

  async function onCharacterImageSelected(file: File): Promise<void> {
    setIsImageErrorFromJsonImport(false);
    try {
      await runRootOperation(
        characterSheetDictionary.characterSheet.image.loading,
        async () => {
          const record = await operations.convertCharacterImage(file);

          await operations.writeCharacterImage(record);
          hasCommittedImageRef.current = true;
          setCharacterImage(record);
        },
      );
    } catch (error) {
      setIsImageErrorFromJsonImport(false);
      setImageError(toImageErrorState(error));
    }
  }

  async function onCharacterImageCleared(): Promise<void> {
    setIsImageErrorFromJsonImport(false);
    try {
      await runRootOperation(
        characterSheetDictionary.characterSheet.image.clearing,
        async () => {
          await operations.deleteCharacterImage();
          hasCommittedImageRef.current = true;
          setCharacterImage(null);
        },
      );
    } catch (error) {
      setIsImageErrorFromJsonImport(false);
      setImageError(toImageErrorState(error));
    }
  }

  function onJsonExport(): void {
    if (isCharacterImageRestoring) return;

    const values = form.getValues();

    operations.downloadJsonFile(
      serializeCharacterSheetJsonExport(values, characterImage),
      createCharacterSheetJsonFilename(values, new Date()),
    );
  }

  function onJsonImportRequested(trigger: HTMLButtonElement): void {
    if (
      isCharacterImageRestoring ||
      rootOperation !== null ||
      isJsonImportReadingRef.current
    )
      return;

    jsonImportReturnFocusRef.current = trigger;
    jsonImportInputRef.current?.click();
  }

  async function onJsonImportFileSelected(file: File): Promise<void> {
    if (rootOperation !== null || isJsonImportReadingRef.current) return;

    isJsonImportReadingRef.current = true;
    setPendingJsonImport(null);
    setIsJsonImportErrorOpen(false);
    try {
      await runRootOperation(
        characterSheetDictionary.characterSheet.jsonImport.loading,
        async () => {
          const parsed = parseCharacterSheetJsonImport(
            await operations.readCharacterSheetJsonFile(file),
          );
          if (parsed === null) {
            setIsJsonImportErrorOpen(true);
            return;
          }

          setPendingJsonImport(parsed);
        },
      );
    } catch {
      setIsJsonImportErrorOpen(true);
    } finally {
      isJsonImportReadingRef.current = false;
    }
  }

  async function onJsonImportConfirmed(): Promise<void> {
    const imported = pendingJsonImport;
    if (imported === null) return;

    setPendingJsonImport(null);
    let shouldRestoreFocus = true;
    await runRootOperation(
      characterSheetDictionary.characterSheet.jsonImport.loading,
      async () => {
        form.reset(imported.values);

        if (
          imported.imageBase64String === null ||
          imported.imageBase64String === undefined
        ) {
          try {
            await operations.deleteCharacterImage();
            hasCommittedImageRef.current = true;
            setCharacterImage(null);
          } catch (error) {
            shouldRestoreFocus = false;
            setIsImageErrorFromJsonImport(true);
            setImageError(toImageErrorState(error));
          }
          return;
        }

        let image: CharacterImageRecord;
        try {
          image = await operations.decodeImportedCharacterImage(
            String(imported.imageBase64String),
          );
        } catch {
          shouldRestoreFocus = false;
          try {
            await operations.deleteCharacterImage();
            hasCommittedImageRef.current = true;
            setCharacterImage(null);
          } catch {
            // The malformed-image notice remains the actionable user feedback.
          }
          setIsJsonImportImageErrorOpen(true);
          return;
        }

        try {
          await operations.writeCharacterImage(image);
          hasCommittedImageRef.current = true;
          setCharacterImage(image);
        } catch (error) {
          shouldRestoreFocus = false;
          setIsImageErrorFromJsonImport(true);
          setImageError(toImageErrorState(error));
        }
      },
    );
    if (shouldRestoreFocus) {
      setShouldRestoreJsonImportFocus(true);
    }
  }

  return {
    characterImage,
    form,
    imageError,
    isImageErrorFromJsonImport,
    imageErrorCloseButtonRef,
    isJsonImportErrorOpen,
    isJsonImportImageErrorOpen,
    imageReturnFocusRef,
    formRestoreConfirmButtonRef,
    formRestoreReturnFocusRef,
    isCharacterImageRestoring,
    isFormRestoreErrorOpen,
    isFormRestoring,
    isRootOperationInProgress: rootOperation !== null,
    onCharacterImageSelected,
    onCharacterImageCleared,
    onCharacterImageOperationStarted,
    onJsonExport,
    onJsonImportConfirmed,
    onJsonImportFileSelected,
    onJsonImportRequested,
    jsonImportErrorConfirmButtonRef,
    jsonImportInputRef,
    jsonImportReturnFocusRef,
    pendingJsonImport,
    setImageError,
    setIsFormRestoreErrorOpen,
    setIsJsonImportErrorOpen,
    setIsJsonImportImageErrorOpen,
    setPendingJsonImport,
    rootOperation,
  };
}
