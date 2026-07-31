import { useId, useRef } from "react";

import type { Drug } from "../../../lib/types/item";
import {
  formatDisplayText,
  formatDisplayValue,
} from "../../../lib/utils/display-value";
import { characterSheetDictionary } from "../../dictionary";
import CharacterSheetDialog, {
  CharacterSheetDialogContent,
  CharacterSheetDialogHeader,
} from "./CharacterSheetDialog";
import styles from "./DrugsPickerDialog.module.css";
import PickerTableHeader from "./PickerTableHeader";

const itemTerms = characterSheetDictionary.gameDomain.terms.items;

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
          <PickerTableHeader
            cells={[
              { content: itemTerms.common.name },
              { content: itemTerms.common.credit },
              { content: copy.pickerHeaders.timing },
              { content: copy.pickerHeaders.setQuantity },
              { content: itemTerms.drugs.badTripIntensity },
            ]}
            className={styles.headerRow}
          />
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
                  <span>{formatDisplayValue(drug.timing)}</span>
                  <span>{formatDisplayValue(drug.setQuantity)}</span>
                  <span>{formatDisplayValue(drug.badTripIntensity)}</span>
                </div>
                <div className={styles.mobileDetailsMetadata}>
                  <span>
                    <strong>{itemTerms.drugs.timing}：</strong>
                    {formatDisplayValue(drug.timing)}
                  </span>
                  <span>
                    <strong>{itemTerms.drugs.setQuantity}：</strong>
                    {formatDisplayValue(drug.setQuantity)}
                  </span>
                </div>
                <p>
                  <strong>{itemTerms.common.effect}：</strong>
                  {formatDisplayText(drug.effect)}
                </p>
              </div>
            );
          })}
        </div>
      </CharacterSheetDialogContent>
    </CharacterSheetDialog>
  );
}
