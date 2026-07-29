import { useId, useRef } from "react";

import type { Drug } from "../../../lib/types/item";
import { characterSheetDictionary } from "../../dictionary";
import { formatDisplayValue } from "../../format-display-value";
import CharacterSheetDialog, {
  CharacterSheetDialogContent,
  CharacterSheetDialogHeader,
} from "./CharacterSheetDialog";
import styles from "./DrugsPickerDialog.module.css";

type Props = {
  candidates: readonly Drug[];
  isOpen: boolean;
  onRequestClose: () => void;
  onSelect: (id: string) => void;
  returnFocusRef: React.RefObject<HTMLElement | null>;
  selectedDrugIds: readonly string[];
};

export default function DrugsPickerDialog({
  candidates,
  isOpen,
  onRequestClose,
  onSelect,
  returnFocusRef,
  selectedDrugIds,
}: Props) {
  const copy = characterSheetDictionary.characterSheet.drugs;
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const selectedIds = new Set(selectedDrugIds);

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
            <span>{copy.pickerHeaders.name}</span>
            <span>{copy.pickerHeaders.credit}</span>
            <span>{copy.pickerHeaders.timing}</span>
            <span>{copy.pickerHeaders.setQuantity}</span>
            <span>{copy.pickerHeaders.badTripIntensity}</span>
          </div>
          {candidates.map((drug) => {
            const isSelected = selectedIds.has(drug.id);

            return (
              <div
                className={styles.candidate}
                data-disabled={isSelected || undefined}
                key={drug.id}
              >
                <div className={styles.firstLine}>
                  <button
                    className={styles.candidateName}
                    disabled={isSelected}
                    onClick={() => onSelect(drug.id)}
                    type="button"
                  >
                    {drug.name}
                  </button>
                  <span>{formatDisplayValue(drug.credit)}</span>
                  <span>{drug.timing}</span>
                  <span>{drug.setQuantity}</span>
                  <span>{drug.badTripIntensity}</span>
                </div>
                <div className={styles.mobileDetailsMetadata}>
                  <span>
                    <strong>{copy.mobileDetails.timing}：</strong>
                    {drug.timing}
                  </span>
                  <span>
                    <strong>{copy.mobileDetails.setQuantity}：</strong>
                    {drug.setQuantity}
                  </span>
                </div>
                <p>
                  <strong>効果：</strong>
                  {drug.effect}
                </p>
              </div>
            );
          })}
        </div>
      </CharacterSheetDialogContent>
    </CharacterSheetDialog>
  );
}
