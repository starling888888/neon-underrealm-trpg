import { type RefObject, useId } from "react";

import { characterSheetDictionary } from "../../dictionary";
import CharacterSheetButton from "../CharacterSheetButton";
import CharacterSheetDialog, {
  CharacterSheetDialogActions,
  CharacterSheetDialogContent,
} from "./CharacterSheetDialog";

type Props = {
  confirmButtonRef: RefObject<HTMLButtonElement | null>;
  isOpen: boolean;
  onRequestClose: () => void;
};

/** Presents a non-recoverable stored-form restore failure. */
export default function CharacterSheetRestoreErrorDialog({
  confirmButtonRef,
  isOpen,
  onRequestClose,
}: Props) {
  const descriptionId = useId();
  const { restoreError, restoreErrorDialogLabel } =
    characterSheetDictionary.characterSheet.persistence;

  return (
    <CharacterSheetDialog
      ariaDescribedBy={descriptionId}
      ariaLabel={restoreErrorDialogLabel}
      initialFocusRef={confirmButtonRef}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
    >
      <CharacterSheetDialogContent>
        <p id={descriptionId}>{restoreError}</p>
      </CharacterSheetDialogContent>
      <CharacterSheetDialogActions>
        <CharacterSheetButton
          onClick={onRequestClose}
          ref={confirmButtonRef}
          size="medium"
          variant="solid"
        >
          {characterSheetDictionary.general.confirm}
        </CharacterSheetButton>
      </CharacterSheetDialogActions>
    </CharacterSheetDialog>
  );
}
