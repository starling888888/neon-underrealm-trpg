import { useId, useRef } from "react";
import type { Nanomachine } from "../../../../lib/types/item";
import {
  formatDisplayText,
  formatDisplayValue,
} from "../../../../lib/utils/display-value";
import { characterSheetDictionary } from "../../../dictionary";
import CharacterSheetDialog, {
  CharacterSheetDialogContent,
  CharacterSheetDialogHeader,
} from "../CharacterSheetDialog";
import styles from "./NanomachinesPickerDialog.module.css";
import PickerTableHeader from "./PickerTableHeader";

const itemTerms = characterSheetDictionary.gameDomain.terms.items;

type Props = {
  candidates: readonly Nanomachine[];
  isOpen: boolean;
  onRequestClose: () => void;
  onSelect: (id: string) => void;
  returnFocusRef: React.RefObject<HTMLElement | null>;
};

export default function NanomachinesPickerDialog({
  candidates,
  isOpen,
  onRequestClose,
  onSelect,
  returnFocusRef,
}: Props) {
  const copy = characterSheetDictionary.characterSheet.nanomachines;
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
              { content: itemTerms.common.name },
              { content: itemTerms.common.credit },
              { content: copy.headers.implantPoints },
              { content: copy.headers.activationMentalCost },
            ]}
            className={styles.headerRow}
          />
          {candidates.map((nanomachine) => (
            <div className={styles.candidate} key={nanomachine.id}>
              <div className={styles.firstLine}>
                <button
                  className={styles.candidateName}
                  onClick={() => onSelect(nanomachine.id)}
                  type="button"
                >
                  {nanomachine.name}
                </button>
                <span>{formatDisplayValue(nanomachine.credit)}</span>
                <span>{nanomachine.implantPoints}</span>
                <span>{nanomachine.activationMentalCost}</span>
              </div>
              <p>
                <strong>{itemTerms.common.effect}：</strong>
                {formatDisplayText(nanomachine.effect)}
              </p>
            </div>
          ))}
        </div>
      </CharacterSheetDialogContent>
    </CharacterSheetDialog>
  );
}
