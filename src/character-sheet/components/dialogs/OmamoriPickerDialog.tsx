import { useId, useRef } from "react";

import type { Omamori } from "../../../lib/types/item";
import {
  formatDisplayText,
  formatDisplayValue,
} from "../../../lib/utils/display-value";
import { characterSheetDictionary } from "../../dictionary";
import CharacterSheetDialog, {
  CharacterSheetDialogContent,
  CharacterSheetDialogHeader,
} from "./CharacterSheetDialog";
import styles from "./OmamoriPickerDialog.module.css";
import PickerTableHeader from "./PickerTableHeader";

type Props = {
  candidates: readonly Omamori[];
  isOpen: boolean;
  onRequestClose: () => void;
  onSelect: (id: string) => void;
  returnFocusRef: React.RefObject<HTMLElement | null>;
};

export default function OmamoriPickerDialog({
  candidates,
  isOpen,
  onRequestClose,
  onSelect,
  returnFocusRef,
}: Props) {
  const copy = characterSheetDictionary.characterSheet.omamori;
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <CharacterSheetDialog
      ariaLabelledBy={titleId}
      className={styles.dialog}
      initialFocusRef={closeButtonRef}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      returnFocusRef={returnFocusRef}
    >
      <CharacterSheetDialogHeader
        closeButtonRef={closeButtonRef}
        headingId={titleId}
        onRequestClose={onRequestClose}
      >
        {copy.choose}
      </CharacterSheetDialogHeader>
      <CharacterSheetDialogContent>
        <div className={styles.content}>
          <p className={styles.selectionGuide}>
            <strong>{copy.pickerGuide}</strong>
          </p>
          <PickerTableHeader
            cells={[
              { content: copy.headers.name },
              { content: copy.headers.credit },
            ]}
            className={styles.headerRow}
          />
          {candidates.map((omamori) => (
            <div className={styles.candidate} key={omamori.id}>
              <div className={styles.firstLine}>
                <button
                  className={styles.candidateName}
                  onClick={() => onSelect(omamori.id)}
                  type="button"
                >
                  {omamori.name}
                </button>
                <span>{formatDisplayValue(omamori.credit)}</span>
              </div>
              <p>
                <strong>効果：</strong>
                {formatDisplayText(omamori.effect)}
              </p>
            </div>
          ))}
        </div>
      </CharacterSheetDialogContent>
    </CharacterSheetDialog>
  );
}
