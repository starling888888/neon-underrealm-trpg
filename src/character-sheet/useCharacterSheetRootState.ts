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
import {
  type CharacterSheetFormValues,
  characterSheetDefaultValues,
} from "./form-values";
import {
  readCharacterImage,
  writeCharacterImage,
} from "./persistence/character-image";
import { characterSheetFormSchema } from "./schemas/character-sheet-form";

export type CharacterImageErrorState = {
  code: CharacterImageErrorCode | "restore";
};

type CharacterSheetRootDependencies = {
  convertCharacterImage: typeof convertCharacterImage;
  readCharacterImage: typeof readCharacterImage;
  writeCharacterImage: typeof writeCharacterImage;
};

const defaultDependencies: CharacterSheetRootDependencies = {
  convertCharacterImage,
  readCharacterImage,
  writeCharacterImage,
};

function toImageErrorState(error: unknown): CharacterImageErrorState {
  if (error instanceof CharacterImageError) {
    return { code: error.code };
  }

  return { code: "storage" };
}

/** Owns form state and cross-cutting character-sheet UI state. */
export default function useCharacterSheetRootState(
  dependencies: CharacterSheetRootDependencies = defaultDependencies,
) {
  const dependenciesRef = useRef(dependencies);
  const operations = dependenciesRef.current;
  const form = useForm<CharacterSheetFormValues>({
    defaultValues: characterSheetDefaultValues,
    mode: "onChange",
    resolver: zodResolver(characterSheetFormSchema),
  });
  const [characterImage, setCharacterImage] =
    useState<CharacterImageRecord | null>(null);
  const [isImageProcessing, setIsImageProcessing] = useState(false);
  const [imageError, setImageError] = useState<CharacterImageErrorState | null>(
    null,
  );
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const confirmationTriggerRef = useRef<HTMLButtonElement>(null);
  const confirmationCancelButtonRef = useRef<HTMLButtonElement>(null);
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

  function onCharacterImageSelectionStarted(trigger: HTMLButtonElement): void {
    imageReturnFocusRef.current = trigger;
  }

  async function onCharacterImageSelected(file: File): Promise<void> {
    setIsImageProcessing(true);

    try {
      const record = await operations.convertCharacterImage(file);

      await operations.writeCharacterImage(record);
      hasCommittedImageRef.current = true;
      setCharacterImage(record);
    } catch (error) {
      setImageError(toImageErrorState(error));
    } finally {
      setIsImageProcessing(false);
    }
  }

  return {
    characterImage,
    confirmationCancelButtonRef,
    confirmationTriggerRef,
    form,
    imageError,
    imageErrorCloseButtonRef,
    imageReturnFocusRef,
    isConfirmationOpen,
    isImageProcessing,
    onCharacterImageSelected,
    onCharacterImageSelectionStarted,
    setImageError,
    setIsConfirmationOpen,
  };
}
