import { useId, useRef } from "react";

import { characterSheetDictionary } from "../../dictionary";
import CharacterSheetButton from "../CharacterSheetButton";
import CharacterSheetDialog, {
  CharacterSheetDialogActions,
  CharacterSheetDialogContent,
} from "./CharacterSheetDialog";
import styles from "./CharacterSheetResetConfirmDialog.module.css";

type Props = {
  isOpen: boolean;
  onConfirm: () => void;
  onRequestClose: () => void;
  returnFocusRef: React.RefObject<HTMLButtonElement | null>;
};

/** Confirms discarding the entire character-sheet form and image. */
export default function CharacterSheetResetConfirmDialog({
  isOpen,
  onConfirm,
  onRequestClose,
  returnFocusRef,
}: Props) {
  const descriptionId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const { general, characterSheet } = characterSheetDictionary;

  return (
    <CharacterSheetDialog
      ariaDescribedBy={descriptionId}
      ariaLabel={characterSheet.reset.confirmLabel}
      initialFocusRef={cancelButtonRef}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      returnFocusRef={returnFocusRef}
    >
      <CharacterSheetDialogContent>
        <p className={styles.message} id={descriptionId}>
          {characterSheet.reset.confirm}
        </p>
      </CharacterSheetDialogContent>
      <CharacterSheetDialogActions>
        <CharacterSheetButton
          color="muted"
          onClick={onRequestClose}
          ref={cancelButtonRef}
          size="medium"
          variant="outline"
        >
          {general.cancel}
        </CharacterSheetButton>
        <CharacterSheetButton
          color="danger"
          onClick={onConfirm}
          size="medium"
          variant="solid"
        >
          {characterSheet.actions.reset}
        </CharacterSheetButton>
      </CharacterSheetDialogActions>
    </CharacterSheetDialog>
  );
}
