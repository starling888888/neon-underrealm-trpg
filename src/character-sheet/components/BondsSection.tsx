import { characterSheetDictionary } from "../dictionary";
import type {
  BondEditableFieldName,
  BondValues,
  ResolveEffectName,
} from "../form-values";
import type { BondsDerivedValues } from "../logic/bonds";
import styles from "./BondsSection.module.css";
import FormulaTooltip from "./FormulaTooltip";

export type BondsSectionProps = {
  bonds: BondValues[];
  derived: BondsDerivedValues;
  onEffectModifierChange: (field: ResolveEffectName, value: string) => number;
  onRowChange: (
    rowId: string,
    field: BondEditableFieldName,
    value: boolean | string,
  ) => void;
  onRowClear: (rowId: string) => void;
};

function EffectFormula({
  baseValues,
  finalValues,
  id,
  label,
  modifier,
  onEffectModifierChange,
}: BondsDerivedValues["effects"][number] & {
  label: string;
  onEffectModifierChange: BondsSectionProps["onEffectModifierChange"];
}) {
  const accessibleName = `${label}の覚悟効果修正`;

  return (
    <div className={styles.effectFormula}>
      <h4>{label}</h4>
      <div className={styles.effectExpression}>
        <span className={styles.effectValues}>{baseValues.join(" / ")}</span>
        <span aria-hidden="true" className={styles.effectOperator}>
          +
        </span>
        <input
          aria-label={accessibleName}
          className={styles.effectModifier}
          defaultValue={modifier}
          onBlur={(event) => {
            event.currentTarget.value = String(
              onEffectModifierChange(id, event.currentTarget.value),
            );
          }}
          onChange={(event) => {
            if (!event.currentTarget.validity.badInput) {
              onEffectModifierChange(id, event.currentTarget.value);
            }
          }}
          step="1"
          type="number"
        />
        <span
          aria-hidden="true"
          className={`${styles.effectOperator} ${styles.effectEquals}`}
        >
          =
        </span>
        <span className={styles.effectValues}>{finalValues.join(" / ")}</span>
      </div>
    </div>
  );
}

export default function BondsSection({
  bonds,
  derived,
  onEffectModifierChange,
  onRowChange,
  onRowClear,
}: BondsSectionProps) {
  const { bonds: labels } = characterSheetDictionary.characterSheet;

  return (
    <div className={styles.root}>
      <div className={styles.rows}>
        <div className={styles.headers}>
          <span>{labels.headers.target}</span>
          <span>{labels.headers.relationship}</span>
          <FormulaTooltip
            ariaLabel={`${labels.headers.resolve}の説明`}
            className={styles.resolveTooltip}
            formula={labels.resolveTooltip}
          >
            <span className={styles.resolveHeader}>
              {labels.headers.resolve}
            </span>
          </FormulaTooltip>
          <span className={styles.visuallyHidden}>クリア</span>
        </div>
        {bonds.map((bond, index) => {
          const rowName = `縁${index + 1}`;

          return (
            <div className={styles.row} key={bond.rowId}>
              <input
                aria-label={`${rowName}の${labels.headers.target}`}
                disabled={bond.isResolved}
                onChange={(event) =>
                  onRowChange(bond.rowId, "target", event.currentTarget.value)
                }
                type="text"
                value={bond.target}
              />
              <input
                aria-label={`${rowName}の${labels.headers.relationship}`}
                disabled={bond.isResolved}
                onChange={(event) =>
                  onRowChange(bond.rowId, "relation", event.currentTarget.value)
                }
                type="text"
                value={bond.relation}
              />
              <input
                aria-label={`${rowName}の${labels.headers.resolve}`}
                checked={bond.isResolved}
                onChange={(event) =>
                  onRowChange(
                    bond.rowId,
                    "isResolved",
                    event.currentTarget.checked,
                  )
                }
                type="checkbox"
              />
              <button
                aria-label={`${rowName}を${labels.clear}`}
                className={styles.clearButton}
                disabled={bond.isResolved}
                onClick={() => onRowClear(bond.rowId)}
                type="button"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
          );
        })}
      </div>
      {derived.isOverLimit ? (
        <p className={styles.warning} role="status">
          {labels.overLimit}
        </p>
      ) : null}
      <section
        aria-labelledby="resolve-effects-heading"
        className={styles.effects}
      >
        <div className={styles.effectsHeading}>
          <h3 id="resolve-effects-heading">{labels.resolveEffectHeading}</h3>
          <span>{labels.resolveEffectDescription}</span>
        </div>
        <div className={styles.effectsGrid}>
          {derived.effects.map((effect) => (
            <EffectFormula
              {...effect}
              key={effect.id}
              label={labels.resolveEffects[effect.id]}
              onEffectModifierChange={onEffectModifierChange}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
