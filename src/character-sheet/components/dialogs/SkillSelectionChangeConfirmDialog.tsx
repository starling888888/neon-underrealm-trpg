import { useId, useRef } from "react";
import { characterSheetDictionary } from "../../dictionary";
import CharacterSheetButton from "../CharacterSheetButton";
import CharacterSheetDialog, {
  CharacterSheetDialogActions,
  CharacterSheetDialogContent,
} from "./CharacterSheetDialog";

type SkillSelectionChangeConfirmDialogProps = {
  confirmLabel?: string;
  confirmation: string;
  dialogLabel: string;
  isOpen: boolean;
  onConfirm: () => void;
  onRequestClose: () => void;
  returnFocusRef: React.RefObject<HTMLElement | null>;
};

/** Confirms clearing selected skills before applying a destructive selection change. */
export default function SkillSelectionChangeConfirmDialog({
  confirmLabel,
  confirmation,
  dialogLabel,
  isOpen,
  onConfirm,
  onRequestClose,
  returnFocusRef,
}: SkillSelectionChangeConfirmDialogProps) {
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
        <CharacterSheetButton
          color="muted"
          onClick={onRequestClose}
          ref={cancelButtonRef}
          size="medium"
        >
          {general.cancel}
        </CharacterSheetButton>
        <CharacterSheetButton onClick={onConfirm} size="medium" variant="solid">
          {confirmLabel ?? general.change}
        </CharacterSheetButton>
      </CharacterSheetDialogActions>
    </CharacterSheetDialog>
  );
}
