import { type RefObject, useId } from "react";

import { characterSheetDictionary } from "../../dictionary";
import CharacterSheetButton from "../CharacterSheetButton";
import styles from "./CharacterSheetCcfoliaCopyNoticeDialog.module.css";
import CharacterSheetDialog, {
  CharacterSheetDialogActions,
  CharacterSheetDialogContent,
} from "./CharacterSheetDialog";

type Props = {
  confirmButtonRef: RefObject<HTMLButtonElement | null>;
  dialogLabel: string;
  isOpen: boolean;
  message: string;
  onRequestClose: () => void;
  returnFocusRef: RefObject<HTMLElement | null>;
};

/** Presents CCFOLIA Clipboard API success or failure without a visible title. */
export default function CharacterSheetCcfoliaCopyNoticeDialog({
  confirmButtonRef,
  dialogLabel,
  isOpen,
  message,
  onRequestClose,
  returnFocusRef,
}: Props) {
  const descriptionId = useId();

  return (
    <CharacterSheetDialog
      ariaDescribedBy={descriptionId}
      ariaLabel={dialogLabel}
      initialFocusRef={confirmButtonRef}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      returnFocusRef={returnFocusRef}
    >
      <CharacterSheetDialogContent>
        <p className={styles.message} id={descriptionId}>
          {message}
        </p>
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
