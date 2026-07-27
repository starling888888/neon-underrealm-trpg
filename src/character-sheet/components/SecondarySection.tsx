import { characterSheetDictionary } from "../dictionary";
import type { SecondaryFieldName, SecondaryValues } from "../form-values";
import { formatDisplayValue } from "../format-display-value";
import type { SecondaryDerivedValues } from "../logic/secondary";
import FormulaTooltip from "./FormulaTooltip";
import styles from "./SecondarySection.module.css";

type NumericSecondaryField = Exclude<
  SecondaryFieldName,
  "applyTemporaryAction" | "applyTemporaryMovement"
>;

type MetricProps = {
  formula: string;
  label: string;
  value: number | null;
};

type NumberInputProps = {
  label: string;
  onChange: (value: string) => number;
  value: number;
};

type SecondaryRowProps = {
  baseFormula: string;
  baseLabel: string;
  baseValue: number | null;
  finalFormula: string;
  finalLabel: string;
  finalValue: number | null;
  modifierField: NumericSecondaryField;
  modifierLabel: string;
  modifierValue: number;
  onNumberChange: (field: NumericSecondaryField, value: string) => number;
  temporary?: {
    checked: boolean;
    field: "applyTemporaryAction" | "applyTemporaryMovement";
    onChange: (
      field: "applyTemporaryAction" | "applyTemporaryMovement",
      checked: boolean,
    ) => void;
  };
};

export type SecondarySectionProps = {
  derived: SecondaryDerivedValues;
  onNumberChange: (field: NumericSecondaryField, value: string) => number;
  onTemporaryAppliedChange: (
    field: "applyTemporaryAction" | "applyTemporaryMovement",
    checked: boolean,
  ) => void;
  secondary: SecondaryValues;
};

function Metric({ formula, label, value }: MetricProps) {
  return (
    <div className={styles.metric}>
      <FormulaTooltip formula={formula}>
        <span className={styles.metricLabel}>{label}</span>
      </FormulaTooltip>
      <output className={styles.metricValue}>
        {formatDisplayValue(value)}
      </output>
    </div>
  );
}

function NumberInput({ label, onChange, value }: NumberInputProps) {
  return (
    <label className={styles.modifier}>
      <span className={styles.modifierLabel}>{label}</span>
      <input
        className={styles.numberInput}
        defaultValue={value}
        onBlur={(event) => {
          event.currentTarget.value = String(
            onChange(event.currentTarget.value),
          );
        }}
        onChange={(event) => {
          if (!event.currentTarget.validity.badInput) {
            onChange(event.currentTarget.value);
          }
        }}
        step="1"
        type="number"
      />
    </label>
  );
}

function SecondaryRow({
  baseFormula,
  baseLabel,
  baseValue,
  finalFormula,
  finalLabel,
  finalValue,
  modifierField,
  modifierLabel,
  modifierValue,
  onNumberChange,
  temporary,
}: SecondaryRowProps) {
  const { applyTemporary } =
    characterSheetDictionary.characterSheet.secondary.labels;

  return (
    <div className={styles.row}>
      <Metric formula={baseFormula} label={baseLabel} value={baseValue} />
      <span aria-hidden="true" className={styles.operator}>
        +
      </span>
      <NumberInput
        label={modifierLabel}
        onChange={(value) => onNumberChange(modifierField, value)}
        value={modifierValue}
      />
      <span aria-hidden="true" className={styles.operator}>
        =
      </span>
      <Metric formula={finalFormula} label={finalLabel} value={finalValue} />
      {temporary === undefined ? null : (
        <label className={styles.temporaryControl}>
          <input
            checked={temporary.checked}
            onChange={(event) =>
              temporary.onChange(temporary.field, event.currentTarget.checked)
            }
            type="checkbox"
          />
          <span>{applyTemporary}</span>
        </label>
      )}
    </div>
  );
}

export default function SecondarySection({
  derived,
  onNumberChange,
  onTemporaryAppliedChange,
  secondary,
}: SecondarySectionProps) {
  const { formulas, labels } =
    characterSheetDictionary.characterSheet.secondary;

  return (
    <section
      aria-labelledby="character-sheet-secondary-title"
      className={styles.section}
    >
      <h2 className={styles.heading} id="character-sheet-secondary-title">
        {characterSheetDictionary.characterSheet.sections.secondary}
      </h2>
      <div className={styles.grid}>
        <SecondaryRow
          baseFormula={formulas.baseHealth}
          baseLabel={labels.baseHealth}
          baseValue={derived.baseHealth}
          finalFormula={formulas.health}
          finalLabel={labels.health}
          finalValue={derived.health}
          modifierField="healthModifier"
          modifierLabel={labels.healthModifier}
          modifierValue={secondary.healthModifier}
          onNumberChange={onNumberChange}
        />
        <SecondaryRow
          baseFormula={formulas.baseMental}
          baseLabel={labels.baseMental}
          baseValue={derived.baseMental}
          finalFormula={formulas.mental}
          finalLabel={labels.mental}
          finalValue={derived.mental}
          modifierField="mentalModifier"
          modifierLabel={labels.mentalModifier}
          modifierValue={secondary.mentalModifier}
          onNumberChange={onNumberChange}
        />
        <SecondaryRow
          baseFormula={formulas.baseMovement}
          baseLabel={labels.baseMovement}
          baseValue={derived.baseMovement}
          finalFormula={formulas.movement}
          finalLabel={labels.movement}
          finalValue={derived.movement}
          modifierField="movementModifier"
          modifierLabel={labels.movementModifier}
          modifierValue={secondary.movementModifier}
          onNumberChange={onNumberChange}
          temporary={{
            checked: secondary.applyTemporaryMovement,
            field: "applyTemporaryMovement",
            onChange: onTemporaryAppliedChange,
          }}
        />
        <SecondaryRow
          baseFormula={formulas.baseActionValue}
          baseLabel={labels.baseActionValue}
          baseValue={derived.baseActionValue}
          finalFormula={formulas.actionValue}
          finalLabel={labels.actionValue}
          finalValue={derived.actionValue}
          modifierField="actionModifier"
          modifierLabel={labels.actionModifier}
          modifierValue={secondary.actionModifier}
          onNumberChange={onNumberChange}
          temporary={{
            checked: secondary.applyTemporaryAction,
            field: "applyTemporaryAction",
            onChange: onTemporaryAppliedChange,
          }}
        />
        <SecondaryRow
          baseFormula={formulas.baseActionCount}
          baseLabel={labels.baseActionCount}
          baseValue={derived.baseActionCount}
          finalFormula={formulas.actionCount}
          finalLabel={labels.actionCount}
          finalValue={derived.actionCount}
          modifierField="actionCountModifier"
          modifierLabel={labels.actionCountModifier}
          modifierValue={secondary.actionCountModifier}
          onNumberChange={onNumberChange}
        />
        <SecondaryRow
          baseFormula={formulas.baseBondLimit}
          baseLabel={labels.baseBondLimit}
          baseValue={derived.baseBondLimit}
          finalFormula={formulas.bondLimit}
          finalLabel={labels.bondLimit}
          finalValue={derived.bondLimit}
          modifierField="bondLimitModifier"
          modifierLabel={labels.bondLimitModifier}
          modifierValue={secondary.bondLimitModifier}
          onNumberChange={onNumberChange}
        />
      </div>
    </section>
  );
}
