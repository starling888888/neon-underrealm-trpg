import { useId, useRef } from "react";
import { characterSheetDictionary } from "../../dictionary";
import CharacterSheetDialog, {
  CharacterSheetDialogActions,
  CharacterSheetDialogContent,
} from "./CharacterSheetDialog";

type PrimaryRyugiChangeConfirmDialogProps = {
  confirmation: string;
  dialogLabel: string;
  isOpen: boolean;
  onConfirm: () => void;
  onRequestClose: () => void;
  returnFocusRef: React.RefObject<HTMLElement | null>;
};

/** Confirms clearing selected primary skills before changing primary ryugi. */
export default function PrimaryRyugiChangeConfirmDialog({
  confirmation,
  dialogLabel,
  isOpen,
  onConfirm,
  onRequestClose,
  returnFocusRef,
}: PrimaryRyugiChangeConfirmDialogProps) {
  const { general } = characterSheetDictionary;
  const descriptionId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <CharacterSheetDialog
      ariaDescribedBy={descriptionId}
      ariaLabel={dialogLabel}
      initialFocusRef={cancelButtonRef}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      returnFocusRef={returnFocusRef}
    >
      <CharacterSheetDialogContent>
        <p id={descriptionId}>{confirmation}</p>
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
