import { useId, useRef } from "react";
import { characterSheetDictionary } from "../../dictionary";
import CharacterSheetButton from "../_common/CharacterSheetButton";
import CharacterSheetDialog, {
  CharacterSheetDialogActions,
  CharacterSheetDialogContent,
} from "./CharacterSheetDialog";

type Props = {
  isDeleting: boolean;
  isOpen: boolean;
  onConfirm: () => void;
  onRequestClose: () => void;
};

export default function CharacterSheetDeleteDialog({
  isDeleting,
  isOpen,
  onConfirm,
  onRequestClose,
}: Props) {
  const descriptionId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const { general, characterSheet } = characterSheetDictionary;
  const { delete: deleteCopy } = characterSheet.remotePersistence;

  return (
    <CharacterSheetDialog
      ariaDescribedBy={descriptionId}
      ariaLabel={deleteCopy.label}
      initialFocusRef={cancelButtonRef}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
    >
      <CharacterSheetDialogContent>
        <p id={descriptionId}>{deleteCopy.description}</p>
        <p>{deleteCopy.localCharacterNotice}</p>
      </CharacterSheetDialogContent>
      <CharacterSheetDialogActions>
        <CharacterSheetButton
          color="muted"
          disabled={isDeleting}
          onClick={onRequestClose}
          ref={cancelButtonRef}
          size="medium"
        >
          {general.cancel}
        </CharacterSheetButton>
        <CharacterSheetButton
          color="danger"
          disabled={isDeleting}
          onClick={onConfirm}
          size="medium"
          variant="outline"
        >
          {general.delete}
        </CharacterSheetButton>
      </CharacterSheetDialogActions>
    </CharacterSheetDialog>
  );
}
