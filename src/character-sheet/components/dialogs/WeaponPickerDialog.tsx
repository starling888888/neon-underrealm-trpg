import { useId, useRef } from "react";

import type { Weapon } from "../../../lib/types/item";
import { characterSheetDictionary } from "../../dictionary";
import { formatDisplayValue } from "../../format-display-value";
import type { WeaponCandidateGroup } from "../../master-data/weapons-and-armor";
import CharacterSheetDialog, {
  CharacterSheetDialogContent,
  CharacterSheetDialogHeader,
} from "./CharacterSheetDialog";
import styles from "./WeaponPickerDialog.module.css";

type Props = {
  groups: readonly WeaponCandidateGroup[];
  isOpen: boolean;
  onRequestClose: () => void;
  onSelect: (id: string) => void;
  returnFocusRef: React.RefObject<HTMLElement | null>;
};

function Candidate({
  weapon,
  onSelect,
}: {
  weapon: Weapon;
  onSelect: (id: string) => void;
}) {
  const copy = characterSheetDictionary.characterSheet.weaponsAndArmor;
  return (
    <div className={styles.candidate}>
      <div className={styles.firstLine}>
        <button onClick={() => onSelect(weapon.id)} type="button">
          {weapon.name}
        </button>
        <span>{formatDisplayValue(weapon.credit)}</span>
        <span>{formatDisplayValue(weapon.attack)}</span>
        <span>{formatDisplayValue(weapon.guard)}</span>
      </div>
      <div className={styles.details}>
        <span>
          <strong>{copy.headers.kind}：</strong>
          {weapon.kind}
        </span>
        <span>
          <strong>{copy.headers.skill}：</strong>
          {weapon.check}
        </span>
        <span>
          <strong>{copy.headers.range}：</strong>
          {weapon.range}
        </span>
        <span>
          <strong>{copy.headers.ammo}：</strong>
          {formatDisplayValue(weapon.ammo)}
        </span>
      </div>
      <p>
        <strong>{copy.effect}：</strong>
        {weapon.effect ?? ""}
      </p>
    </div>
  );
}

export default function WeaponPickerDialog({
  groups,
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
        {copy.chooseWeapon}
      </CharacterSheetDialogHeader>
      <CharacterSheetDialogContent>
        <div className={styles.content}>
          <p className={styles.selectionGuide}>
            <strong>{copy.weaponPickerGuide}</strong>
          </p>
          {groups.map((group) =>
            group.weapons.length === 0 ? null : (
              <section className={styles.group} key={group.id}>
                {group.heading === undefined ? null : <h3>{group.heading}</h3>}
                <div className={styles.headerRow}>
                  <span>{copy.headers.name}</span>
                  <span>{copy.headers.credit}</span>
                  <span>攻撃力</span>
                  <span>ガード値</span>
                </div>
                {group.weapons.map((weapon) => (
                  <Candidate
                    key={weapon.id}
                    onSelect={onSelect}
                    weapon={weapon}
                  />
                ))}
              </section>
            ),
          )}
        </div>
      </CharacterSheetDialogContent>
    </CharacterSheetDialog>
  );
}
