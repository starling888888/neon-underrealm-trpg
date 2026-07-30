import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  CharacterImageError,
  convertCharacterImage,
} from "./browser/character-image";
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
  deleteCharacterImage,
  readCharacterImage,
  writeCharacterImage,
} from "./persistence/character-image";
import {
  readCharacterSheetForm,
  writeCharacterSheetForm,
} from "./persistence/character-sheet-form";
import { characterSheetFormSchema } from "./schemas/character-sheet-form";
import { parseCharacterSheetRestoreJson } from "./schemas/character-sheet-persistence";

export type CharacterImageErrorState = {
  code: CharacterImageErrorCode | "restore";
};

type CharacterSheetRootOperations = {
  convertCharacterImage: typeof convertCharacterImage;
  deleteCharacterImage: typeof deleteCharacterImage;
  readCharacterImage: typeof readCharacterImage;
  writeCharacterImage: typeof writeCharacterImage;
  readCharacterSheetForm: typeof readCharacterSheetForm;
  writeCharacterSheetForm: typeof writeCharacterSheetForm;
};

type CharacterSheetRootDependencies = Partial<CharacterSheetRootOperations>;

const defaultOperations: CharacterSheetRootOperations = {
  convertCharacterImage,
  deleteCharacterImage,
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
  const [isFormRestoring, setIsFormRestoring] = useState(true);
  const [isFormRestoreErrorOpen, setIsFormRestoreErrorOpen] = useState(false);
  const formRestoreConfirmButtonRef = useRef<HTMLButtonElement>(null);
  const formRestoreReturnFocusRef = useRef<HTMLInputElement>(null);
  const imageReturnFocusRef = useRef<HTMLButtonElement>(null);
  const imageErrorCloseButtonRef = useRef<HTMLButtonElement>(null);
  const hasCommittedImageRef = useRef(false);

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
          setImageError({ code: "restore" });
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
      setImageError(toImageErrorState(error));
    }
  }

  async function onCharacterImageCleared(): Promise<void> {
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
      setImageError(toImageErrorState(error));
    }
  }

  return {
    characterImage,
    form,
    imageError,
    imageErrorCloseButtonRef,
    imageReturnFocusRef,
    formRestoreConfirmButtonRef,
    formRestoreReturnFocusRef,
    isFormRestoreErrorOpen,
    isFormRestoring,
    isRootOperationInProgress: rootOperation !== null,
    onCharacterImageSelected,
    onCharacterImageCleared,
    onCharacterImageOperationStarted,
    setImageError,
    setIsFormRestoreErrorOpen,
    rootOperation,
  };
}
