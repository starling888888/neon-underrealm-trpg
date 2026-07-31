import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { writeTextToClipboard } from "./browser/ccfolia-clipboard";
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
  deleteCharacterSheetForm,
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
  writeTextToClipboard: typeof writeTextToClipboard;
  decodeImportedCharacterImage: typeof decodeImportedCharacterImage;
  deleteCharacterImage: typeof deleteCharacterImage;
  deleteCharacterSheetForm: typeof deleteCharacterSheetForm;
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
  writeTextToClipboard,
  decodeImportedCharacterImage,
  deleteCharacterImage,
  deleteCharacterSheetForm,
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
  const [isImageErrorFromReset, setIsImageErrorFromReset] = useState(false);
  const [isFormRestoring, setIsFormRestoring] = useState(true);
  const [isCharacterImageRestoring, setIsCharacterImageRestoring] =
    useState(true);
  const [isFormRestoreErrorOpen, setIsFormRestoreErrorOpen] = useState(false);
  const [pendingJsonImport, setPendingJsonImport] =
    useState<CharacterSheetJsonImport | null>(null);
  const [isJsonImportErrorOpen, setIsJsonImportErrorOpen] = useState(false);
  const [isJsonImportImageErrorOpen, setIsJsonImportImageErrorOpen] =
    useState(false);
  const [formResetVersion, setFormResetVersion] = useState(0);
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
  const resetForm = useCallback(
    (values: CharacterSheetFormValues) => {
      form.reset(values);
      setFormResetVersion((version) => version + 1);
    },
    [form],
  );

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
          resetForm(values);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsFormRestoring(false);
    }
  }, [operations, resetForm]);

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

  const onCharacterImageOperationStarted = useCallback(
    (trigger: HTMLButtonElement): void => {
      imageReturnFocusRef.current = trigger;
    },
    [],
  );

  const runRootOperation = useCallback(
    async <T>(label: string, operation: () => Promise<T>): Promise<T> => {
      setRootOperation({ label });

      try {
        return await operation();
      } finally {
        setRootOperation(null);
      }
    },
    [],
  );

  const onCharacterImageSelected = useCallback(
    async (file: File): Promise<void> => {
      setIsImageErrorFromJsonImport(false);
      setIsImageErrorFromReset(false);
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
        setIsImageErrorFromReset(false);
        setImageError(toImageErrorState(error));
      }
    },
    [operations, runRootOperation],
  );

  const onCharacterImageCleared = useCallback(async (): Promise<void> => {
    setIsImageErrorFromJsonImport(false);
    setIsImageErrorFromReset(false);
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
      setIsImageErrorFromReset(false);
      setImageError(toImageErrorState(error));
    }
  }, [operations, runRootOperation]);

  async function onResetConfirmed(): Promise<void> {
    if (isCharacterImageRestoring || rootOperation !== null) return;

    setIsImageErrorFromJsonImport(false);
    setIsImageErrorFromReset(false);
    try {
      await runRootOperation(
        characterSheetDictionary.characterSheet.reset.loading,
        async () => {
          const valuesBeforeReset = structuredClone(form.getValues());
          try {
            operations.deleteCharacterSheetForm(window.localStorage);
          } catch {
            throw new CharacterImageError("storage");
          }

          try {
            await operations.deleteCharacterImage();
          } catch (error) {
            try {
              operations.writeCharacterSheetForm(
                window.localStorage,
                valuesBeforeReset,
              );
            } catch {
              // The reset remains failed; retain the in-memory state and report it.
            }
            throw error;
          }

          hasCommittedImageRef.current = true;
          setCharacterImage(null);
          resetForm(structuredClone(characterSheetDefaultValues));
        },
      );
    } catch (error) {
      setIsImageErrorFromJsonImport(false);
      setIsImageErrorFromReset(true);
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

  async function onCcfoliaCopy(json: string): Promise<boolean> {
    if (rootOperation !== null) return false;

    try {
      await runRootOperation(
        characterSheetDictionary.characterSheet.ccfolia.loading,
        () => operations.writeTextToClipboard(json),
      );
      return true;
    } catch {
      return false;
    }
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
        resetForm(imported.values);

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
    formResetVersion,
    imageError,
    isImageErrorFromJsonImport,
    isImageErrorFromReset,
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
    onCcfoliaCopy,
    onJsonExport,
    onJsonImportConfirmed,
    onJsonImportFileSelected,
    onJsonImportRequested,
    onResetConfirmed,
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
