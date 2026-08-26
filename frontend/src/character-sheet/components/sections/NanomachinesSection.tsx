import { ListPlus } from "lucide-react";
import { memo, useState } from "react";

import type { Nanomachine } from "../../../lib/types/item";
import {
  formatDisplayText,
  formatDisplayValue,
} from "../../../lib/utils/display-value";
import {
  characterSheetDictionary,
  getNamePickerTooltip,
} from "../../dictionary";
import type { NanomachineFixedPartKey } from "../../form/values";
import type { NanomachinesDerivedValues } from "../../logic/nanomachines";
import ClearButton from "../_common/ClearButton";
import FormulaTooltip from "../_common/FormulaTooltip";
import styles from "./NanomachinesSection.module.css";

const itemTerms = characterSheetDictionary.gameDomain.terms.items;

export type NanomachinesPickerTarget = NanomachineFixedPartKey;

type FixedNanomachinesRow = {
  nanomachine: Nanomachine | null;
  part: NanomachineFixedPartKey;
  rowId: string;
};

type ModifierInputProps = {
  field: "implantLimitModifier" | "implantTotalModifier";
  label: string;
  onModifierChange: NanomachinesSectionProps["onModifierChange"];
  value: number;
};

export type NanomachinesSectionProps = {
  derived: NanomachinesDerivedValues;
  fixedRows: readonly FixedNanomachinesRow[];
  implantLimitModifier: number;
  implantTotalModifier: number;
  onClear: (part: NanomachineFixedPartKey) => void;
  onModifierChange: (
    field: "implantLimitModifier" | "implantTotalModifier",
    value: string,
  ) => number;
  onPickerRequest: (
    target: NanomachinesPickerTarget,
    trigger: HTMLButtonElement,
  ) => void;
  onSelect: (target: NanomachinesPickerTarget, nanomachineId: string) => void;
};

const partLabels = {
  arm: "腕",
  head: "頭",
  leg: "足",
  torso: "胴体",
} as const satisfies Record<NanomachineFixedPartKey, string>;

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

function NanomachinesRow({
  onClear,
  onPickerRequest,
  row,
}: {
  onClear: NanomachinesSectionProps["onClear"];
  onPickerRequest: NanomachinesSectionProps["onPickerRequest"];
  row: FixedNanomachinesRow;
}) {
  const copy = characterSheetDictionary.characterSheet.nanomachines;
  const [expanded, setExpanded] = useState(false);
  const name = row.nanomachine?.name ?? copy.unselected;
  const partLabel = partLabels[row.part];
  const rowLabel = `${partLabel}：${name}`;
  const detailsId = `nanomachines-details-${row.rowId}`;

  return (
    <fieldset className={styles.row} data-nanomachines-row={row.rowId}>
      <legend className={styles.visuallyHidden}>{rowLabel}</legend>
      <div className={styles.line}>
        <span className={styles.part}>{partLabel}</span>
        <button
          aria-label={rowLabel}
          className={styles.itemPicker}
          onClick={(event) => onPickerRequest(row.part, event.currentTarget)}
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
          {formatDisplayValue(row.nanomachine?.credit ?? null)}
        </span>
        <span className={styles.cell}>
          {formatDisplayValue(row.nanomachine?.implantPoints ?? null)}
        </span>
        <span className={styles.cell}>
          {formatDisplayValue(row.nanomachine?.activationMentalCost ?? null)}
        </span>
        {/* biome-ignore lint/a11y/useSemanticElements: Native button inherits disabled from the read-only fieldset, but this display-only disclosure must remain interactive. */}
        <span
          aria-controls={detailsId}
          aria-expanded={expanded}
          aria-label={`${rowLabel}${expanded ? copy.closeDetails : copy.openDetails}`}
          className={styles.detailsToggle}
          onClick={() => setExpanded((value) => !value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            setExpanded((value) => !value);
          }}
          role="button"
          tabIndex={0}
        >
          <span aria-hidden="true">{expanded ? "▾" : "▸"}</span>
        </span>
        <ClearButton
          ariaLabel={`${rowLabel}を${copy.clear}`}
          onClick={() => onClear(row.part)}
        />
      </div>
      {expanded ? (
        <p className={styles.details} id={detailsId}>
          <strong>効果：</strong>
          {formatDisplayText(row.nanomachine?.effect)}
        </p>
      ) : null}
    </fieldset>
  );
}

function NanomachinesSection({
  derived,
  fixedRows,
  implantLimitModifier,
  implantTotalModifier,
  onClear,
  onModifierChange,
  onPickerRequest,
}: NanomachinesSectionProps) {
  const copy = characterSheetDictionary.characterSheet.nanomachines;

  return (
    <div className={styles.section} data-nanomachines-section>
      <div className={`${styles.headerRow} ${styles.line}`}>
        <span>{itemTerms.nanomachines.part}</span>
        <span>
          <FormulaTooltip
            ariaLabel={itemTerms.common.name}
            formula={getNamePickerTooltip(itemTerms.nanomachines.name)}
          >
            <span>{itemTerms.common.name}</span>
          </FormulaTooltip>
        </span>
        <span>{itemTerms.common.credit}</span>
        <span className={styles.pointsHeader}>
          {copy.headers.implantPoints}
        </span>
        <span className={styles.activationHeader}>
          {copy.headers.activationMentalCost}
        </span>
        <span>{itemTerms.common.expand}</span>
        <span aria-hidden="true" />
      </div>
      {fixedRows.map((row) => (
        <NanomachinesRow
          key={row.rowId}
          onClear={onClear}
          onPickerRequest={onPickerRequest}
          row={row}
        />
      ))}
      <div
        data-invalid={derived.hasImplantLimitError || undefined}
        className={styles.summary}
      >
        <FormulaTooltip
          ariaLabel={copy.summaryLabel}
          formula={copy.summaryTooltip}
          multiline
        >
          <span className={styles.summaryLabel}>{copy.summaryLabel}</span>
        </FormulaTooltip>
        <div className={styles.valueExpression}>
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
            aria-invalid={derived.hasImplantLimitError || undefined}
            aria-label={`${copy.totalLabel}／${copy.limitLabel}`}
            className={`character-sheet-number-value character-sheet-number-value--compact ${styles.finalValue}`}
          >
            {derived.implantPointTotal} ／{" "}
            {formatDisplayValue(derived.implantLimit)}
          </output>
        </div>
      </div>
    </div>
  );
}

export default memo(NanomachinesSection);
