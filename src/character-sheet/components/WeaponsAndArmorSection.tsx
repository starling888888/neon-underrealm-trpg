import { ListPlus } from "lucide-react";
import { useState } from "react";

import type { Armor, Weapon } from "../../lib/types/item";
import { characterSheetDictionary } from "../dictionary";
import { formatDisplayValue } from "../format-display-value";
import FormulaTooltip from "./FormulaTooltip";
import styles from "./WeaponsAndArmorSection.module.css";

type WeaponRow = {
  attack: number | null;
  attackModifier: number | null;
  guard: number | null;
  guardModifier: number | null;
  rowId: string;
  weapon: Weapon | null;
};

type ArmorRow = {
  armor: Armor | null;
  damageReduction: number | null;
  damageReductionModifier: number | null;
  defense: number | null;
  defenseModifier: number | null;
};

export type WeaponsAndArmorSectionProps = {
  armor: ArmorRow;
  onAddWeapon: () => void;
  onArmorModifierChange: (
    field: "defenseModifier" | "damageReductionModifier",
    value: string,
  ) => void;
  onArmorPickerRequest: (trigger: HTMLButtonElement) => void;
  onArmorSelect: (armorId: string) => void;
  onClearArmor: () => void;
  onMoveWeapon: (rowId: string, direction: "up" | "down") => void;
  onRemoveWeapon: (rowId: string) => void;
  onWeaponModifierChange: (
    rowId: string,
    field: "attackModifier" | "guardModifier",
    value: string,
  ) => void;
  onWeaponPickerRequest: (rowId: string, trigger: HTMLButtonElement) => void;
  onWeaponSelect: (rowId: string, weaponId: string) => void;
  weaponRows: readonly WeaponRow[];
};

function DetailsToggle({
  expanded,
  id,
  label,
  onClick,
}: {
  expanded: boolean;
  id: string;
  label: string;
  onClick: () => void;
}) {
  const copy = characterSheetDictionary.characterSheet.weaponsAndArmor;
  return (
    <button
      aria-controls={id}
      aria-expanded={expanded}
      aria-label={`${label}${expanded ? copy.closeDetails : copy.openDetails}`}
      className={styles.detailsToggle}
      onClick={onClick}
      type="button"
    >
      <span aria-hidden="true">{expanded ? "▾" : "▸"}</span>
    </button>
  );
}

function PairedValueExpression({
  baseValues,
  finalValues,
  labels,
  modifiers,
  onModifierChange,
}: {
  baseValues: readonly [number | "特殊" | null, number | "特殊" | null];
  finalValues: readonly [number | null, number | null];
  labels: readonly [string, string];
  modifiers: readonly [number | null, number | null];
  onModifierChange: (index: 0 | 1, value: string) => void;
}) {
  return (
    <div className={styles.pairedValueExpression}>
      <div className={styles.desktopValueExpression}>
        <output
          aria-label={`${labels[0]}／${labels[1]}の元値`}
          className={`character-sheet-number-value character-sheet-number-value--compact ${styles.baseValue}`}
        >
          {formatDisplayValue(baseValues[0])} ／{" "}
          {formatDisplayValue(baseValues[1])}
        </output>
        <span aria-hidden="true" className={styles.expressionOperator}>
          ＋
        </span>
        <span className={styles.modifierValues}>
          <input
            aria-label={`${labels[0]}の修正`}
            className={styles.modifierInput}
            onChange={(event) => onModifierChange(0, event.currentTarget.value)}
            type="number"
            value={modifiers[0] ?? ""}
          />
          <span aria-hidden="true">／</span>
          <input
            aria-label={`${labels[1]}の修正`}
            className={styles.modifierInput}
            onChange={(event) => onModifierChange(1, event.currentTarget.value)}
            type="number"
            value={modifiers[1] ?? ""}
          />
        </span>
        <span aria-hidden="true" className={styles.expressionOperator}>
          ＝
        </span>
        <output
          aria-label={`${labels[0]}／${labels[1]}の最終値`}
          className={`character-sheet-number-value character-sheet-number-value--compact ${styles.finalValue}`}
        >
          {formatDisplayValue(finalValues[0])} ／{" "}
          {formatDisplayValue(finalValues[1])}
        </output>
      </div>
      <div className={styles.mobileValueExpressions}>
        {[0, 1].map((index) => (
          <div className={styles.mobileValueExpression} key={labels[index]}>
            <output
              aria-label={`${labels[index]}の元値`}
              className={`character-sheet-number-value character-sheet-number-value--compact ${styles.baseValue}`}
            >
              {formatDisplayValue(baseValues[index])}
            </output>
            <span aria-hidden="true" className={styles.expressionOperator}>
              ＋
            </span>
            <input
              aria-label={`${labels[index]}の修正`}
              className={styles.modifierInput}
              onChange={(event) =>
                onModifierChange(index as 0 | 1, event.currentTarget.value)
              }
              type="number"
              value={modifiers[index] ?? ""}
            />
            <span aria-hidden="true" className={styles.expressionOperator}>
              ＝
            </span>
            <output
              aria-label={`${labels[index]}の最終値`}
              className={`character-sheet-number-value character-sheet-number-value--compact ${styles.finalValue}`}
            >
              {formatDisplayValue(finalValues[index])}
            </output>
          </div>
        ))}
      </div>
    </div>
  );
}

function WeaponDetails({ weapon, id }: { weapon: Weapon | null; id: string }) {
  const copy = characterSheetDictionary.characterSheet.weaponsAndArmor;
  return (
    <div className={styles.details} id={id}>
      <div className={styles.detailMeta}>
        <span>
          <strong>{copy.headers.kind}：</strong>
          {formatDisplayValue(weapon?.kind ?? null)}
        </span>
        <span>
          <strong>{copy.headers.skill}：</strong>
          {formatDisplayValue(weapon?.check ?? null)}
        </span>
        <span>
          <strong>{copy.headers.range}：</strong>
          {formatDisplayValue(weapon?.range ?? null)}
        </span>
        <span>
          <strong>{copy.headers.ammo}：</strong>
          {formatDisplayValue(weapon?.ammo ?? null)}
        </span>
      </div>
      <p>
        <strong>{copy.effect}：</strong>
        {weapon?.effect ?? ""}
      </p>
    </div>
  );
}

function WeaponFormRow({
  canMoveDown,
  canMoveUp,
  onMove,
  onPickerRequest,
  onRemove,
  onModifierChange,
  removalEnabled,
  rowNumber,
  row,
}: {
  canMoveDown: boolean;
  canMoveUp: boolean;
  onMove: WeaponsAndArmorSectionProps["onMoveWeapon"];
  onPickerRequest: WeaponsAndArmorSectionProps["onWeaponPickerRequest"];
  onRemove: WeaponsAndArmorSectionProps["onRemoveWeapon"];
  onModifierChange: WeaponsAndArmorSectionProps["onWeaponModifierChange"];
  removalEnabled: boolean;
  rowNumber: number;
  row: WeaponRow;
}) {
  const copy = characterSheetDictionary.characterSheet.weaponsAndArmor;
  const [expanded, setExpanded] = useState(false);
  const name = row.weapon?.name ?? copy.unselectedWeapon;
  const rowLabel = `武器${rowNumber}：${name}`;
  const detailsId = `weapon-details-${row.rowId}`;
  return (
    <fieldset
      className={styles.row}
      data-weapons-and-armor-weapon-row={row.rowId}
    >
      <legend className={styles.visuallyHidden}>{rowLabel}</legend>
      <div className={styles.weaponLine}>
        <div className={styles.reorderControls}>
          {canMoveUp ? (
            <button
              aria-label={`${rowLabel}${copy.moveUp}`}
              className={styles.reorderButton}
              onClick={() => onMove(row.rowId, "up")}
              type="button"
            >
              ▲
            </button>
          ) : null}
          {canMoveDown ? (
            <button
              aria-label={`${rowLabel}${copy.moveDown}`}
              className={styles.reorderButton}
              onClick={() => onMove(row.rowId, "down")}
              type="button"
            >
              ▼
            </button>
          ) : null}
        </div>
        <button
          aria-label={rowLabel}
          className={styles.itemPicker}
          onClick={(event) => onPickerRequest(row.rowId, event.currentTarget)}
          type="button"
        >
          <ListPlus
            aria-hidden="true"
            className={styles.chooseIcon}
            size={15}
          />
          <span>{name}</span>
        </button>
        <span className={styles.cell}>
          {formatDisplayValue(row.weapon?.credit ?? null)}
        </span>
        <div className={styles.valueExpressions}>
          <PairedValueExpression
            baseValues={[row.weapon?.attack ?? null, row.weapon?.guard ?? null]}
            finalValues={[row.attack, row.guard]}
            labels={[`${rowLabel}攻撃力`, `${rowLabel}ガード値`]}
            modifiers={[row.attackModifier, row.guardModifier]}
            onModifierChange={(index, value) =>
              onModifierChange(
                row.rowId,
                index === 0 ? "attackModifier" : "guardModifier",
                value,
              )
            }
          />
        </div>
        <DetailsToggle
          expanded={expanded}
          id={detailsId}
          label={rowLabel}
          onClick={() => setExpanded((value) => !value)}
        />
        <button
          aria-label={`${rowLabel}を削除`}
          className={`${styles.removeButton} character-sheet-remove-button character-sheet-remove-button--mobile-compact`}
          disabled={!removalEnabled}
          onClick={() => onRemove(row.rowId)}
          type="button"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
      {expanded ? <WeaponDetails id={detailsId} weapon={row.weapon} /> : null}
    </fieldset>
  );
}

function ArmorFormRow({
  armor,
  onClear,
  onModifierChange,
  onPickerRequest,
}: {
  armor: ArmorRow;
  onClear: () => void;
  onModifierChange: WeaponsAndArmorSectionProps["onArmorModifierChange"];
  onPickerRequest: WeaponsAndArmorSectionProps["onArmorPickerRequest"];
}) {
  const copy = characterSheetDictionary.characterSheet.weaponsAndArmor;
  const [expanded, setExpanded] = useState(false);
  const name = armor.armor?.name ?? copy.unselectedArmor;
  const detailsId = "armor-details";
  return (
    <fieldset className={styles.row} data-weapons-and-armor-armor-row>
      <legend className={styles.visuallyHidden}>{name}</legend>
      <div className={styles.armorLine}>
        <button
          className={styles.itemPicker}
          onClick={(event) => onPickerRequest(event.currentTarget)}
          type="button"
        >
          <ListPlus
            aria-hidden="true"
            className={styles.chooseIcon}
            size={15}
          />
          <span>{name}</span>
        </button>
        <span className={styles.cell}>
          {formatDisplayValue(armor.armor?.credit ?? null)}
        </span>
        <div className={styles.valueExpressions}>
          <PairedValueExpression
            baseValues={[
              armor.armor?.defense ?? null,
              armor.armor?.damageReduction ?? null,
            ]}
            finalValues={[armor.defense, armor.damageReduction]}
            labels={[`${name}防御力`, `${name}ダメージ軽減`]}
            modifiers={[armor.defenseModifier, armor.damageReductionModifier]}
            onModifierChange={(index, value) =>
              onModifierChange(
                index === 0 ? "defenseModifier" : "damageReductionModifier",
                value,
              )
            }
          />
        </div>
        <DetailsToggle
          expanded={expanded}
          id={detailsId}
          label={name}
          onClick={() => setExpanded((value) => !value)}
        />
        <button className={styles.clearButton} onClick={onClear} type="button">
          {copy.clearArmor}
        </button>
      </div>
      {expanded ? (
        <div className={styles.details} id={detailsId}>
          <p>
            <strong>{copy.headers.restriction}：</strong>
            {armor.armor?.restriction ?? ""}
          </p>
          <p>
            <strong>{copy.effect}：</strong>
            {armor.armor?.effect ?? ""}
          </p>
        </div>
      ) : null}
    </fieldset>
  );
}

export default function WeaponsAndArmorSection(
  props: WeaponsAndArmorSectionProps,
) {
  const copy = characterSheetDictionary.characterSheet.weaponsAndArmor;
  return (
    <div className={styles.section} data-weapons-and-armor-section>
      <section aria-label={copy.weapon} className={styles.itemSection}>
        <h3>{copy.weapon}</h3>
        <div className={`${styles.headerRow} ${styles.weaponLine}`}>
          <span aria-hidden="true" />
          <span>{copy.headers.name}</span>
          <span>{copy.headers.credit}</span>
          <span className={styles.headerTooltip}>
            <FormulaTooltip
              ariaLabel={copy.headers.attackGuard}
              formula={copy.formulaTooltips.weapon}
            >
              <span>{copy.headers.attackGuard}</span>
            </FormulaTooltip>
          </span>
          <span>展開</span>
          <span aria-hidden="true" />
        </div>
        {props.weaponRows.map((row, index) => (
          <WeaponFormRow
            canMoveDown={index < props.weaponRows.length - 1}
            canMoveUp={index > 0}
            key={row.rowId}
            onModifierChange={props.onWeaponModifierChange}
            onMove={props.onMoveWeapon}
            onPickerRequest={props.onWeaponPickerRequest}
            onRemove={props.onRemoveWeapon}
            removalEnabled={props.weaponRows.length > 1}
            row={row}
            rowNumber={index + 1}
          />
        ))}
        <button
          className={styles.addButton}
          onClick={props.onAddWeapon}
          type="button"
        >
          {copy.addWeapon}
        </button>
      </section>
      <section aria-label={copy.armor} className={styles.itemSection}>
        <h3>{copy.armor}</h3>
        <div className={`${styles.headerRow} ${styles.armorLine}`}>
          <span>{copy.headers.name}</span>
          <span>{copy.headers.credit}</span>
          <span className={styles.headerTooltip}>
            <FormulaTooltip
              ariaLabel={copy.headers.armorDefense}
              formula={copy.formulaTooltips.armor}
            >
              <span>{copy.headers.armorDefense}</span>
            </FormulaTooltip>
          </span>
          <span>展開</span>
          <span aria-hidden="true" />
        </div>
        <ArmorFormRow
          armor={props.armor}
          onClear={props.onClearArmor}
          onModifierChange={props.onArmorModifierChange}
          onPickerRequest={props.onArmorPickerRequest}
        />
      </section>
    </div>
  );
}
