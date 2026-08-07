import { useId, useRef } from "react";

import type { Armor } from "../../../../lib/types/item";
import { formatDisplayValue } from "../../../../lib/utils/display-value";
import { characterSheetDictionary } from "../../../dictionary";
import CharacterSheetDialog, {
  CharacterSheetDialogContent,
  CharacterSheetDialogHeader,
} from "../CharacterSheetDialog";
import styles from "./ArmorPickerDialog.module.css";
import PickerTableHeader from "./PickerTableHeader";

const itemTerms = characterSheetDictionary.gameDomain.terms.items;

type Props = {
  armors: readonly Armor[];
  isOpen: boolean;
  onRequestClose: () => void;
  onSelect: (id: string) => void;
  returnFocusRef: React.RefObject<HTMLElement | null>;
};
export default function ArmorPickerDialog({
  armors,
  isOpen,
  onRequestClose,
  onSelect,
  returnFocusRef,
}: Props) {
  const copy = characterSheetDictionary.characterSheet.weaponsAndArmor;
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
        {copy.chooseArmor}
      </CharacterSheetDialogHeader>
      <CharacterSheetDialogContent>
        <div className={styles.content}>
          <p className={styles.selectionGuide}>
            <strong>{copy.armorPickerGuide}</strong>
          </p>
          <PickerTableHeader
            cells={[
              { content: itemTerms.common.name },
              { content: itemTerms.common.credit },
              { content: itemTerms.weaponsAndArmor.defense },
              {
                className: styles.damageReductionHeader,
                content: "ダメージ\n軽減",
              },
              {
                className: styles.restrictionHeader,
                content: itemTerms.weaponsAndArmor.equipmentRestriction,
              },
            ]}
            className={styles.headerRow}
          />
          {armors.map((armor) => (
            <div className={styles.candidate} key={armor.id}>
              <div className={styles.firstLine}>
                <button
                  className={styles.candidateName}
                  onClick={() => onSelect(armor.id)}
                  type="button"
                >
                  {armor.name}
                </button>
                <span>{formatDisplayValue(armor.credit)}</span>
                <span>{armor.defense}</span>
                <span>{formatDisplayValue(armor.damageReduction)}</span>
                <span className={styles.restriction}>
                  {formatDisplayValue(armor.restriction)}
                </span>
              </div>
              <div className={styles.details}>
                <p className={styles.restrictionDetails}>
                  <strong>
                    {itemTerms.weaponsAndArmor.equipmentRestriction}：
                  </strong>
                  {formatDisplayValue(armor.restriction)}
                </p>
                <p>
                  <strong>{itemTerms.common.effect}：</strong>
                  {formatDisplayValue(armor.effect)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CharacterSheetDialogContent>
    </CharacterSheetDialog>
  );
}
