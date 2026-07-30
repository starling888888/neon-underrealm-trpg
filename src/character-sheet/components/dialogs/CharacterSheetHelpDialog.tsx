import { useId, useRef } from "react";

import { characterSheetDictionary } from "../../dictionary";
import CharacterSheetDialog, {
  CharacterSheetDialogHeader,
} from "./CharacterSheetDialog";
import styles from "./CharacterSheetHelpDialog.module.css";

type Props = {
  isOpen: boolean;
  onRequestClose: () => void;
  returnFocusRef: React.RefObject<HTMLElement | null>;
};

/** Presents the currently empty help dialog without changing character data. */
export default function CharacterSheetHelpDialog({
  isOpen,
  onRequestClose,
  returnFocusRef,
}: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const headingId = useId();
  const { actions } = characterSheetDictionary.characterSheet;

  return (
    <CharacterSheetDialog
      ariaLabelledBy={headingId}
      className={styles.dialog}
      initialFocusRef={closeButtonRef}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      returnFocusRef={returnFocusRef}
    >
      <CharacterSheetDialogHeader
        closeButtonRef={closeButtonRef}
        headingId={headingId}
        onRequestClose={onRequestClose}
      >
        {actions.help}
      </CharacterSheetDialogHeader>
    </CharacterSheetDialog>
  );
}
