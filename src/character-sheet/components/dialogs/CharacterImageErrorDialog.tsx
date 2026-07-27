import { type RefObject, useId } from "react";

import type { CharacterImageErrorCode } from "../../character-image";
import { characterSheetDictionary } from "../../dictionary";
import CharacterSheetDialog, {
  CharacterSheetDialogActions,
  CharacterSheetDialogContent,
  CharacterSheetDialogHeader,
} from "./CharacterSheetDialog";

type CharacterImageErrorDialogProps = {
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  errorCode: CharacterImageErrorCode | "restore" | null;
  onRequestClose: () => void;
  returnFocusRef: RefObject<HTMLElement | null>;
};

const imageErrorMessages = {
  decode: characterSheetDictionary.characterSheet.image.errors.decode,
  "file-too-large":
    characterSheetDictionary.characterSheet.image.errors.fileTooLarge,
  "invalid-type":
    characterSheetDictionary.characterSheet.image.errors.invalidType,
  restore: characterSheetDictionary.characterSheet.image.errors.restore,
  storage: characterSheetDictionary.characterSheet.image.errors.storage,
} as const satisfies Record<CharacterImageErrorCode | "restore", string>;

/** Presents image-operation failures through the shared dialog shell. */
export default function CharacterImageErrorDialog({
  closeButtonRef,
  errorCode,
  onRequestClose,
  returnFocusRef,
}: CharacterImageErrorDialogProps) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <CharacterSheetDialog
      ariaDescribedBy={descriptionId}
      ariaLabelledBy={titleId}
      initialFocusRef={closeButtonRef}
      isOpen={errorCode !== null}
      onRequestClose={onRequestClose}
      returnFocusRef={returnFocusRef}
    >
      <CharacterSheetDialogHeader headingId={titleId}>
        {characterSheetDictionary.characterSheet.image.errorTitle}
      </CharacterSheetDialogHeader>
      <CharacterSheetDialogContent>
        <p id={descriptionId}>
          {errorCode === null ? "" : imageErrorMessages[errorCode]}
        </p>
      </CharacterSheetDialogContent>
      <CharacterSheetDialogActions>
        <button
          data-tone="primary"
          onClick={onRequestClose}
          ref={closeButtonRef}
          type="button"
        >
          {characterSheetDictionary.general.close}
        </button>
      </CharacterSheetDialogActions>
    </CharacterSheetDialog>
  );
}
