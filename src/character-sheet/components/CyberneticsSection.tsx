import { ListPlus } from "lucide-react";
import { useState } from "react";

import type { Cybernetic } from "../../lib/types/item";
import { withBase } from "../../lib/utils/paths";
import { characterSheetDictionary, getNamePickerTooltip } from "../dictionary";
import type { CyberneticFixedPartKey } from "../form-values";
import { formatDisplayValue } from "../format-display-value";
import type { CyberneticsDerivedValues } from "../logic/cybernetics";
import styles from "./CyberneticsSection.module.css";
import FormulaTooltip from "./FormulaTooltip";

export type CyberneticsPickerTarget =
  | { kind: "fixed"; part: CyberneticFixedPartKey }
  | { kind: "other"; rowId: string };

type CyberneticsRow = {
  cybernetic: Cybernetic | null;
  rowId: string;
};

type FixedCyberneticsRow = CyberneticsRow & { part: CyberneticFixedPartKey };

type ModifierInputProps = {
  field: "implantLimitModifier" | "implantTotalModifier";
  label: string;
  onModifierChange: CyberneticsSectionProps["onModifierChange"];
  value: number;
};

export type CyberneticsSectionProps = {
  derived: CyberneticsDerivedValues;
  fixedRows: readonly FixedCyberneticsRow[];
  implantLimitModifier: number;
  implantTotalModifier: number;
  onAddOther: () => void;
  onClearFixed: (part: CyberneticFixedPartKey) => void;
  onClearOther: (rowId: string) => void;
  onModifierChange: (
    field: "implantLimitModifier" | "implantTotalModifier",
    value: string,
  ) => number;
  onPickerRequest: (
    target: CyberneticsPickerTarget,
    trigger: HTMLButtonElement,
  ) => void;
  onRemoveOther: (rowId: string) => void;
  onSelect: (target: CyberneticsPickerTarget, cyberneticId: string) => void;
  otherRows: readonly CyberneticsRow[];
};

const partLabels = {
  arm: "腕",
  head: "頭",
  leg: "足",
  torso: "胴体",
} as const satisfies Record<CyberneticFixedPartKey, string>;

function ModifierInput({
  field,
  label,
  onModifierChange,
  value,
}: ModifierInputProps) {
  return (
    <input
      aria-label={label}
      className={styles.modifierInput}
      defaultValue={value}
      onBlur={(event) => {
        event.currentTarget.value = String(
          onModifierChange(field, event.currentTarget.value),
        );
      }}
      onChange={(event) => {
        const inputValue = event.currentTarget.value;

        if (
          !event.currentTarget.validity.badInput &&
          inputValue !== "" &&
          inputValue !== "-"
        ) {
          onModifierChange(field, inputValue);
        }
      }}
      step="1"
      type="number"
    />
  );
}

function CyberneticsRow({
  canRemove,
  clearLabel,
  onClear,
  onPickerRequest,
  onRemove,
  row,
  target,
}: {
  canRemove: boolean;
  clearLabel: string;
  onClear: () => void;
  onPickerRequest: CyberneticsSectionProps["onPickerRequest"];
  onRemove: () => void;
  row: CyberneticsRow & {
    accessiblePartLabel?: string;
    partLabel: string;
  };
  target: CyberneticsPickerTarget;
}) {
  const copy = characterSheetDictionary.characterSheet.cybernetics;
  const [expanded, setExpanded] = useState(false);
  const name = row.cybernetic?.name ?? copy.unselected;
  const rowLabel = `${row.accessiblePartLabel ?? row.partLabel}：${name}`;
  const detailsId = `cybernetics-details-${row.rowId}`;

  return (
    <fieldset className={styles.row} data-cybernetics-row={row.rowId}>
      <legend className={styles.visuallyHidden}>{rowLabel}</legend>
      <div className={styles.line}>
        <span className={styles.part}>{row.partLabel}</span>
        <button
          aria-label={rowLabel}
          className={styles.itemPicker}
          onClick={(event) => onPickerRequest(target, event.currentTarget)}
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
          {formatDisplayValue(row.cybernetic?.credit ?? null)}
        </span>
        <span className={styles.cell}>
          {formatDisplayValue(row.cybernetic?.implantPoints ?? null)}
        </span>
        <button
          aria-controls={detailsId}
          aria-expanded={expanded}
          aria-label={`${rowLabel}${expanded ? copy.closeDetails : copy.openDetails}`}
          className={styles.detailsToggle}
          onClick={() => setExpanded((value) => !value)}
          type="button"
        >
          <span aria-hidden="true">{expanded ? "▾" : "▸"}</span>
        </button>
        {canRemove ? (
          <button
            aria-label={`${rowLabel}${copy.remove}`}
            className="character-sheet-remove-button character-sheet-remove-button--mobile-compact"
            onClick={onRemove}
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        ) : (
          <button
            aria-label={`${rowLabel}を${clearLabel}`}
            className="character-sheet-clear-button"
            onClick={onClear}
            type="button"
          >
            {clearLabel}
          </button>
        )}
      </div>
      {expanded ? (
        <p className={styles.details} id={detailsId}>
          {row.cybernetic?.effect ?? ""}
        </p>
      ) : null}
    </fieldset>
  );
}

export default function CyberneticsSection({
  derived,
  fixedRows,
  implantLimitModifier,
  implantTotalModifier,
  onAddOther,
  onClearFixed,
  onClearOther,
  onModifierChange,
  onPickerRequest,
  onRemoveOther,
  otherRows,
}: CyberneticsSectionProps) {
  const copy = characterSheetDictionary.characterSheet.cybernetics;

  return (
    <div
      aria-invalid={derived.hasImplantLimitError || undefined}
      className={styles.section}
      data-cybernetics-section
    >
      <div className={`${styles.headerRow} ${styles.line}`}>
        <span>{copy.headers.part}</span>
        <span>
          <FormulaTooltip
            ariaLabel={copy.headers.name}
            formula={getNamePickerTooltip(copy.name)}
          >
            <span>{copy.headers.name}</span>
          </FormulaTooltip>
        </span>
        <span>{copy.headers.credit}</span>
        <span className={styles.pointsHeader}>
          {copy.headers.implantPoints}
        </span>
        <span>{copy.headers.effect}</span>
        <span aria-hidden="true" />
      </div>
      {fixedRows.map((row) => (
        <CyberneticsRow
          canRemove={false}
          clearLabel={copy.clear}
          key={row.rowId}
          onClear={() => onClearFixed(row.part)}
          onPickerRequest={onPickerRequest}
          onRemove={() => {}}
          row={{ ...row, partLabel: partLabels[row.part] }}
          target={{ kind: "fixed", part: row.part }}
        />
      ))}
      {otherRows.map((row, index) => (
        <CyberneticsRow
          canRemove={index > 0}
          clearLabel={copy.clear}
          key={row.rowId}
          onClear={() => onClearOther(row.rowId)}
          onPickerRequest={onPickerRequest}
          onRemove={() => onRemoveOther(row.rowId)}
          row={{
            ...row,
            accessiblePartLabel: `${copy.otherPart}${index + 1}`,
            partLabel: copy.otherPart,
          }}
          target={{ kind: "other", rowId: row.rowId }}
        />
      ))}
      <div className={styles.footer}>
        <button
          className={`${styles.addButton} character-sheet-add-button`}
          disabled={otherRows.length >= 4}
          onClick={onAddOther}
          type="button"
        >
          {copy.addOther}
        </button>
        <div
          aria-invalid={derived.hasImplantLimitError || undefined}
          className={styles.summary}
        >
          <FormulaTooltip
            ariaLabel={copy.summaryLabel}
            formula={copy.summaryTooltip}
            multiline
          >
            <span className={styles.summaryLabel}>{copy.summaryLabel}</span>
          </FormulaTooltip>
          <div className={styles.pairedValueExpression}>
            <div className={styles.desktopValueExpression}>
              <output
                aria-label={`${copy.totalBaseLabel}／${copy.limitBaseLabel}`}
                className={`character-sheet-number-value character-sheet-number-value--compact ${styles.baseValue}`}
              >
                {derived.implantPoints} ／{" "}
                {formatDisplayValue(
                  derived.implantLimit === null
                    ? null
                    : derived.implantLimit - implantLimitModifier,
                )}
              </output>
              <span aria-hidden="true" className={styles.expressionOperator}>
                ＋
              </span>
              <span className={styles.modifierValues}>
                <ModifierInput
                  field="implantTotalModifier"
                  label={copy.totalModifierLabel}
                  onModifierChange={onModifierChange}
                  value={implantTotalModifier}
                />
                <span aria-hidden="true">／</span>
                <ModifierInput
                  field="implantLimitModifier"
                  label={copy.limitModifierLabel}
                  onModifierChange={onModifierChange}
                  value={implantLimitModifier}
                />
              </span>
              <span aria-hidden="true" className={styles.expressionOperator}>
                ＝
              </span>
              <output
                aria-label={`${copy.totalLabel}／${copy.limitLabel}`}
                className={`character-sheet-number-value character-sheet-number-value--compact ${styles.finalValue}`}
              >
                {derived.implantPointTotal} ／{" "}
                {formatDisplayValue(derived.implantLimit)}
              </output>
            </div>
            <div className={styles.mobileValueExpressions}>
              <div className={styles.mobileValueExpression}>
                <output
                  aria-label={copy.totalBaseLabel}
                  className={`character-sheet-number-value character-sheet-number-value--compact ${styles.baseValue}`}
                >
                  {derived.implantPoints}
                </output>
                <span aria-hidden="true" className={styles.expressionOperator}>
                  ＋
                </span>
                <ModifierInput
                  field="implantTotalModifier"
                  label={copy.totalModifierLabel}
                  onModifierChange={onModifierChange}
                  value={implantTotalModifier}
                />
                <span aria-hidden="true" className={styles.expressionOperator}>
                  ＝
                </span>
                <output
                  aria-label={copy.totalLabel}
                  className={`character-sheet-number-value character-sheet-number-value--compact ${styles.finalValue}`}
                >
                  {derived.implantPointTotal}
                </output>
              </div>
              <div className={styles.mobileValueExpression}>
                <output
                  aria-label={copy.limitBaseLabel}
                  className={`character-sheet-number-value character-sheet-number-value--compact ${styles.baseValue}`}
                >
                  {formatDisplayValue(
                    derived.implantLimit === null
                      ? null
                      : derived.implantLimit - implantLimitModifier,
                  )}
                </output>
                <span aria-hidden="true" className={styles.expressionOperator}>
                  ＋
                </span>
                <ModifierInput
                  field="implantLimitModifier"
                  label={copy.limitModifierLabel}
                  onModifierChange={onModifierChange}
                  value={implantLimitModifier}
                />
                <span aria-hidden="true" className={styles.expressionOperator}>
                  ＝
                </span>
                <output
                  aria-label={copy.limitLabel}
                  className={`character-sheet-number-value character-sheet-number-value--compact ${styles.finalValue}`}
                >
                  {formatDisplayValue(derived.implantLimit)}
                </output>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className={styles.noncombatPenaltyNotice}>
        {copy.noncombatPenaltyNotice}
        <br />
        {copy.noncombatPenaltyRulesPrefix}
        <a
          href={withBase("/data/items/cybernetics")}
          rel="noopener noreferrer"
          target="_blank"
        >
          サイバネのルール
        </a>
        {copy.noncombatPenaltyRulesSuffix}
      </p>
    </div>
  );
}
