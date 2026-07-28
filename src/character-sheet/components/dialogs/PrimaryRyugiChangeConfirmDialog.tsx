import { useId, useRef } from "react";
import { characterSheetDictionary } from "../../dictionary";
import CharacterSheetDialog, {
  CharacterSheetDialogActions,
  CharacterSheetDialogContent,
} from "./CharacterSheetDialog";

type PrimaryRyugiChangeConfirmDialogProps = {
  isOpen: boolean;
  onConfirm: () => void;
  onRequestClose: () => void;
  returnFocusRef: React.RefObject<HTMLElement | null>;
};

/** Confirms clearing selected primary skills before changing primary ryugi. */
export default function PrimaryRyugiChangeConfirmDialog({
  isOpen,
  onConfirm,
  onRequestClose,
  returnFocusRef,
}: PrimaryRyugiChangeConfirmDialogProps) {
  const { general, characterSheet } = characterSheetDictionary;
  const copy = characterSheet.skills;
  const descriptionId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <CharacterSheetDialog
      ariaDescribedBy={descriptionId}
      ariaLabel={copy.primaryRyugiChangeConfirmationLabel}
      initialFocusRef={cancelButtonRef}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      returnFocusRef={returnFocusRef}
    >
      <CharacterSheetDialogContent>
        <p id={descriptionId}>{copy.primaryRyugiChangeConfirmation}</p>
      </CharacterSheetDialogContent>
      <CharacterSheetDialogActions>
        <button onClick={onRequestClose} ref={cancelButtonRef} type="button">
          {general.cancel}
        </button>
        <button data-tone="primary" onClick={onConfirm} type="button">
          {general.change}
        </button>
      </CharacterSheetDialogActions>
    </CharacterSheetDialog>
  );
}
