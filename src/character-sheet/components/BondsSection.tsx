import { characterSheetDictionary } from "../dictionary";
import type {
  BondEditableFieldName,
  BondValues,
  ResolveEffectName,
} from "../form-values";
import type { BondsDerivedValues } from "../logic/bonds";
import styles from "./BondsSection.module.css";
import CharacterSheetSectionFrame from "./CharacterSheetSectionFrame";
import ClearButton from "./ClearButton";
import DeleteButton from "./DeleteButton";
import FormulaTooltip from "./FormulaTooltip";

export type BondsSectionProps = {
  bonds: BondValues[];
  derived: BondsDerivedValues;
  onEffectModifierChange: (field: ResolveEffectName, value: string) => number;
  onRowChange: <K extends BondEditableFieldName>(
    rowId: string,
    field: K,
    value: BondValues[K],
  ) => void;
  onRowClear: (rowId: string) => void;
  onRowDelete: (rowId: string) => void;
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
    <fieldset className={styles.effectFormula}>
      <legend className={styles.visuallyHidden}>{label}</legend>
      <h4>{label}</h4>
      <div className={styles.effectExpression}>
        <output
          className={`character-sheet-number-value character-sheet-number-value--compact ${styles.effectValue}`}
        >
          {baseValues.join(" ／ ")}
        </output>
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
        <span aria-hidden="true" className={styles.effectOperator}>
          =
        </span>
        <output
          className={`character-sheet-number-value character-sheet-number-value--compact ${styles.effectValue}`}
        >
          {finalValues.join(" ／ ")}
        </output>
      </div>
    </fieldset>
  );
}

export default function BondsSection({
  bonds,
  derived,
  onEffectModifierChange,
  onRowChange,
  onRowClear,
  onRowDelete,
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
          const isOverflow = derived.overflowRowIds.includes(bond.rowId);
          const isDeletableOverflow = isOverflow && !bond.isResolved;

          return (
            <fieldset
              className={styles.row}
              data-over-limit={isOverflow || undefined}
              key={bond.rowId}
            >
              <legend className={styles.visuallyHidden}>{rowName}</legend>
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
              {isDeletableOverflow ? (
                <DeleteButton
                  ariaLabel={`${rowName}を${labels.delete}`}
                  onClick={() => onRowDelete(bond.rowId)}
                />
              ) : (
                <ClearButton
                  ariaLabel={`${rowName}を${labels.clear}`}
                  disabled={bond.isResolved}
                  onClick={() => onRowClear(bond.rowId)}
                />
              )}
            </fieldset>
          );
        })}
      </div>
      {derived.isOverLimit ? (
        <p className={styles.error} role="status">
          {labels.overLimit}
        </p>
      ) : null}
      <CharacterSheetSectionFrame
        expandable
        headingAs="h3"
        id="resolve-effects"
        title={labels.resolveEffectHeading}
      >
        <div className={styles.effects}>
          <div className={styles.effectsHeading}>
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
        </div>
      </CharacterSheetSectionFrame>
    </div>
  );
}
