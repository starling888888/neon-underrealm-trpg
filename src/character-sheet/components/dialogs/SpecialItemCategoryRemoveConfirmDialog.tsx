import { useId, useRef } from "react";

import { characterSheetDictionary } from "../../dictionary";
import type { SpecialItemCategoryId } from "../../form-values";
import CharacterSheetButton from "../CharacterSheetButton";
import CharacterSheetDialog, {
  CharacterSheetDialogActions,
  CharacterSheetDialogContent,
} from "./CharacterSheetDialog";
import styles from "./CharacterSheetDialog.module.css";

const categoryNames: Record<SpecialItemCategoryId, string> = {
  cybernetics: "サイバネ",
  drugs: "ドラッグ",
  nanomachines: "ナノマシン",
  omamori: "お守り",
};

type Props = {
  category: SpecialItemCategoryId | null;
  isOpen: boolean;
  onConfirm: () => void;
  onRequestClose: () => void;
  returnFocusRef: React.RefObject<HTMLButtonElement | null>;
};

/** Confirms discarding all non-default values in one special-item category. */
export default function SpecialItemCategoryRemoveConfirmDialog({
  category,
  isOpen,
  onConfirm,
  onRequestClose,
  returnFocusRef,
}: Props) {
  const descriptionId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const { general } = characterSheetDictionary;
  const categoryName =
    category === null ? "このカテゴリ" : categoryNames[category];

  return (
    <CharacterSheetDialog
      ariaDescribedBy={descriptionId}
      ariaLabel={`${categoryName}カテゴリを削除`}
      initialFocusRef={cancelButtonRef}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      returnFocusRef={returnFocusRef}
    >
      <CharacterSheetDialogContent>
        <p id={descriptionId}>
          {categoryName}カテゴリの入力内容を削除します。よろしいですか？
        </p>
      </CharacterSheetDialogContent>
      <CharacterSheetDialogActions>
        <CharacterSheetButton
          className={`${styles.actionButton} ${styles.actionButtonDefault}`}
          onClick={onRequestClose}
          ref={cancelButtonRef}
        >
          {general.cancel}
        </CharacterSheetButton>
        <CharacterSheetButton
          className={styles.actionButton}
          onClick={onConfirm}
        >
          {general.delete}
        </CharacterSheetButton>
      </CharacterSheetDialogActions>
    </CharacterSheetDialog>
  );
}
