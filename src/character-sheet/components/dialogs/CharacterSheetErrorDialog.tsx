import type { RefObject } from "react";

import type { CharacterSheetErrorSummary } from "../../logic/error-summary";
import CharacterSheetButton from "../CharacterSheetButton";
import CharacterSheetDialog, {
  CharacterSheetDialogActions,
  CharacterSheetDialogContent,
} from "./CharacterSheetDialog";
import styles from "./CharacterSheetErrorDialog.module.css";

type Props = {
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  errorSummary: CharacterSheetErrorSummary;
  isOpen: boolean;
  onRequestClose: () => void;
  returnFocusRef: RefObject<HTMLElement | null>;
};

/** Shows the current aggregated game-rule errors without changing form state. */
export default function CharacterSheetErrorDialog({
  closeButtonRef,
  errorSummary,
  isOpen,
  onRequestClose,
  returnFocusRef,
}: Props) {
  return (
    <CharacterSheetDialog
      ariaLabel="エラー"
      className={
        errorSummary.hasErrors
          ? styles.dialog
          : `${styles.dialog} ${styles.noErrors}`
      }
      initialFocusRef={closeButtonRef}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      returnFocusRef={returnFocusRef}
    >
      <CharacterSheetDialogContent>
        {errorSummary.hasErrors ? (
          <>
            <p className={styles.count} role="status">
              エラーが{errorSummary.errors.length}件あります。
            </p>
            <ul className={styles.list}>
              {errorSummary.errors.map((error, index) => (
                <li key={`${error.code}-${error.rowId ?? index}`}>
                  {error.message}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>エラーはありません。</p>
        )}
      </CharacterSheetDialogContent>
      <CharacterSheetDialogActions>
        <CharacterSheetButton
          color="muted"
          onClick={onRequestClose}
          ref={closeButtonRef}
          size="medium"
        >
          閉じる
        </CharacterSheetButton>
      </CharacterSheetDialogActions>
    </CharacterSheetDialog>
  );
}
