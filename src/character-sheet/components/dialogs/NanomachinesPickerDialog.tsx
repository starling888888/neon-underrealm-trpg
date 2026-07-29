import { useId, useRef } from "react";
import type { Nanomachine } from "../../../lib/types/item";
import { characterSheetDictionary } from "../../dictionary";
import { formatDisplayValue } from "../../format-display-value";
import CharacterSheetDialog, {
  CharacterSheetDialogContent,
  CharacterSheetDialogHeader,
} from "./CharacterSheetDialog";
import styles from "./NanomachinesPickerDialog.module.css";

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
          <div className={styles.headerRow}>
            <span>{copy.headers.name}</span>
            <span>{copy.headers.credit}</span>
            <span>{copy.headers.implantPoints}</span>
            <span>{copy.headers.activationMentalCost}</span>
          </div>
          {candidates.map((nanomachine) => (
            <div className={styles.candidate} key={nanomachine.id}>
              <div className={styles.firstLine}>
                <button onClick={() => onSelect(nanomachine.id)} type="button">
                  {nanomachine.name}
                </button>
                <span>{formatDisplayValue(nanomachine.credit)}</span>
                <span>{nanomachine.implantPoints}</span>
                <span>{nanomachine.activationMentalCost}</span>
              </div>
              <p>
                <strong>効果：</strong>
                {nanomachine.effect}
              </p>
            </div>
          ))}
        </div>
      </CharacterSheetDialogContent>
    </CharacterSheetDialog>
  );
}
