import { useId, useRef } from "react";

import { characterSheetDictionary } from "../../dictionary";
import CharacterSheetButton from "../CharacterSheetButton";
import CharacterSheetDialog, {
  CharacterSheetDialogActions,
  CharacterSheetDialogContent,
} from "./CharacterSheetDialog";

type Props = {
  isOpen: boolean;
  onConfirm: () => void;
  onRequestClose: () => void;
  returnFocusRef: React.RefObject<HTMLElement | null>;
};

/** Confirms copying the current character as a CCFOLIA character payload. */
export default function CharacterSheetCcfoliaCopyConfirmDialog({
  isOpen,
  onConfirm,
  onRequestClose,
  returnFocusRef,
}: Props) {
  const descriptionId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const { ccfolia } = characterSheetDictionary.characterSheet;

  return (
    <CharacterSheetDialog
      ariaDescribedBy={descriptionId}
      ariaLabel={ccfolia.confirmLabel}
      initialFocusRef={cancelButtonRef}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      returnFocusRef={returnFocusRef}
    >
      <CharacterSheetDialogContent>
        <p id={descriptionId}>{ccfolia.confirm}</p>
      </CharacterSheetDialogContent>
      <CharacterSheetDialogActions>
        <CharacterSheetButton
          color="muted"
          onClick={onRequestClose}
          ref={cancelButtonRef}
          size="medium"
          variant="outline"
        >
          {characterSheetDictionary.general.cancel}
        </CharacterSheetButton>
        <CharacterSheetButton onClick={onConfirm} size="medium" variant="solid">
          {ccfolia.copy}
        </CharacterSheetButton>
      </CharacterSheetDialogActions>
    </CharacterSheetDialog>
  );
}
