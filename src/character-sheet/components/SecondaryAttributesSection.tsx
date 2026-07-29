import { formatDisplayValue } from "../../lib/utils/display-value";
import { characterSheetDictionary } from "../dictionary";
import type {
  SecondaryAttributeFieldName,
  SecondaryAttributeValues,
} from "../form-values";
import type { SecondaryAttributeDerivedValues } from "../logic/secondary-attributes";
import FormulaTooltip from "./FormulaTooltip";
import styles from "./SecondaryAttributesSection.module.css";

type NumericSecondaryAttributeField = Exclude<
  SecondaryAttributeFieldName,
  "applyTemporaryAction" | "applyTemporaryMovement"
>;

type NumberInputProps = {
  label: string;
  onChange: (value: string) => number;
  value: number;
};

type SecondaryRowProps = {
  baseValue: number | null;
  finalFormula: string;
  finalLabel: string;
  finalValue: number | null;
  modifierField: NumericSecondaryAttributeField;
  modifierLabel: string;
  modifierValue: number;
  onNumberChange: (
    field: NumericSecondaryAttributeField,
    value: string,
  ) => number;
  temporary?: {
    checked: boolean;
    field: "applyTemporaryAction" | "applyTemporaryMovement";
    label: string;
    onChange: (
      field: "applyTemporaryAction" | "applyTemporaryMovement",
      checked: boolean,
    ) => void;
  };
};

export type SecondaryAttributesSectionProps = {
  derived: SecondaryAttributeDerivedValues;
  healthFormulaSuffix?: string;
  onNumberChange: (
    field: NumericSecondaryAttributeField,
    value: string,
  ) => number;
  onTemporaryAppliedChange: (
    field: "applyTemporaryAction" | "applyTemporaryMovement",
    checked: boolean,
  ) => void;
  secondaryAttributes: SecondaryAttributeValues;
};

function FinalMetric({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  return (
    <output
      aria-label={label}
      className="character-sheet-number-value character-sheet-number-value--compact"
    >
      {formatDisplayValue(value)}
    </output>
  );
}

function NumberInput({ label, onChange, value }: NumberInputProps) {
  return (
    <input
      aria-label={label}
      className={styles.numberInput}
      defaultValue={value}
      onBlur={(event) => {
        event.currentTarget.value = String(onChange(event.currentTarget.value));
      }}
      onChange={(event) => {
        if (!event.currentTarget.validity.badInput) {
          onChange(event.currentTarget.value);
        }
      }}
      step="1"
      type="number"
    />
  );
}

function SecondaryRow({
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
  const baseValueLabel = `${finalLabel}の自動算出値`;
  const modifierInputLabel =
    modifierLabel === "修正"
      ? `${finalLabel}の${modifierLabel}`
      : modifierLabel;
  const temporaryCheckboxLabel = temporary
    ? `${finalLabel}の一時修正を適用`
    : undefined;

  return (
    <fieldset className={styles.row}>
      <legend className={styles.visuallyHidden}>{finalLabel}</legend>
      <div className={styles.rowHeading}>
        <FormulaTooltip
          ariaLabel={finalLabel}
          className={styles.rowLabelTooltip}
          formula={finalFormula}
        >
          <span className={styles.rowLabel}>{finalLabel}</span>
        </FormulaTooltip>
        {temporary === undefined ? null : (
          <span className={styles.temporaryControl}>
            <input
              aria-label={temporaryCheckboxLabel}
              checked={temporary.checked}
              onChange={(event) =>
                temporary.onChange(temporary.field, event.currentTarget.checked)
              }
              type="checkbox"
            />
            <FormulaTooltip
              ariaLabel={`${temporaryCheckboxLabel}の説明`}
              className={styles.inlineTooltip}
              formula={temporary.label}
            >
              <span>一時修正を適用</span>
            </FormulaTooltip>
          </span>
        )}
      </div>
      <div className={styles.rowContent}>
        <output
          aria-label={baseValueLabel}
          className="character-sheet-number-value character-sheet-number-value--compact"
        >
          {formatDisplayValue(baseValue)}
        </output>
        <span aria-hidden="true" className={styles.operator}>
          +
        </span>
        <NumberInput
          label={modifierInputLabel}
          onChange={(value) => onNumberChange(modifierField, value)}
          value={modifierValue}
        />
        <span aria-hidden="true" className={styles.operator}>
          =
        </span>
        <FinalMetric label={finalLabel} value={finalValue} />
      </div>
    </fieldset>
  );
}

export default function SecondaryAttributesSection({
  derived,
  healthFormulaSuffix,
  onNumberChange,
  onTemporaryAppliedChange,
  secondaryAttributes,
}: SecondaryAttributesSectionProps) {
  const { characterSheet, gameDomain } = characterSheetDictionary;
  const { formulas, labels } = characterSheet.secondaryAttributes;
  const terms = gameDomain.terms;

  return (
    <div className={styles.grid}>
      <SecondaryRow
        baseValue={derived.baseHealth}
        finalFormula={`${formulas.health}${healthFormulaSuffix ?? ""}`}
        finalLabel={terms.maximumHealth}
        finalValue={derived.health}
        modifierField="healthModifier"
        modifierLabel={labels.healthModifier}
        modifierValue={secondaryAttributes.healthModifier}
        onNumberChange={onNumberChange}
      />
      <SecondaryRow
        baseValue={derived.baseMental}
        finalFormula={formulas.mental}
        finalLabel={terms.maximumMental}
        finalValue={derived.mental}
        modifierField="mentalModifier"
        modifierLabel={labels.mentalModifier}
        modifierValue={secondaryAttributes.mentalModifier}
        onNumberChange={onNumberChange}
      />
      <SecondaryRow
        baseValue={derived.baseMovement}
        finalFormula={formulas.movement}
        finalLabel={terms.movement}
        finalValue={derived.movement}
        modifierField="movementModifier"
        modifierLabel={labels.movementModifier}
        modifierValue={secondaryAttributes.movementModifier}
        onNumberChange={onNumberChange}
        temporary={{
          checked: secondaryAttributes.applyTemporaryMovement,
          field: "applyTemporaryMovement",
          label: labels.applyTemporaryMovement,
          onChange: onTemporaryAppliedChange,
        }}
      />
      <SecondaryRow
        baseValue={derived.baseActionValue}
        finalFormula={formulas.actionValue}
        finalLabel={terms.actionValue}
        finalValue={derived.actionValue}
        modifierField="actionModifier"
        modifierLabel={labels.actionModifier}
        modifierValue={secondaryAttributes.actionModifier}
        onNumberChange={onNumberChange}
        temporary={{
          checked: secondaryAttributes.applyTemporaryAction,
          field: "applyTemporaryAction",
          label: labels.applyTemporaryAction,
          onChange: onTemporaryAppliedChange,
        }}
      />
      <SecondaryRow
        baseValue={derived.baseActionCount}
        finalFormula={formulas.actionCount}
        finalLabel={terms.actionCount}
        finalValue={derived.actionCount}
        modifierField="actionCountModifier"
        modifierLabel={labels.actionCountModifier}
        modifierValue={secondaryAttributes.actionCountModifier}
        onNumberChange={onNumberChange}
      />
      <SecondaryRow
        baseValue={derived.baseBondLimit}
        finalFormula={formulas.bondLimit}
        finalLabel={terms.bondCapacity}
        finalValue={derived.bondLimit}
        modifierField="bondLimitModifier"
        modifierLabel={labels.bondLimitModifier}
        modifierValue={secondaryAttributes.bondLimitModifier}
        onNumberChange={onNumberChange}
      />
    </div>
  );
}
