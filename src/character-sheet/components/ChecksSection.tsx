import type { ReactNode } from "react";
import { characterSheetDictionary } from "../dictionary";
import type {
  AttackSkillName,
  AttributeName,
  ReactionCheckName,
} from "../form-values";
import { attackSkillNames, attributeNames } from "../form-values";
import { formatDisplayValue } from "../format-display-value";
import type { ChecksDerivedValues, DerivedCheckRow } from "../logic/checks";
import styles from "./ChecksSection.module.css";
import FormulaTooltip from "./FormulaTooltip";

export type ChecksSectionProps = {
  attacks: ChecksDerivedValues["attacks"];
  onAttackAdd: () => void;
  onAttackAttributeChange: (rowId: string, attribute: AttributeName) => void;
  onAttackModifierChange: (rowId: string, value: string) => number;
  onAttackRemove: (rowId: string) => void;
  onAttackSkillChange: (rowId: string, skill: AttackSkillName) => void;
  onReactionAttributeChange: (
    name: ReactionCheckName,
    attribute: AttributeName,
  ) => void;
  onReactionModifierChange: (name: ReactionCheckName, value: string) => number;
  reactions: ChecksDerivedValues["reactions"];
};

type CheckRowProps = {
  label: string;
  onAttributeChange: (attribute: AttributeName) => void;
  onModifierChange: (value: string) => number;
  row: DerivedCheckRow;
  skillControl: ReactNode;
};

function AttributeSelect({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (attribute: AttributeName) => void;
  value: AttributeName;
}) {
  const attributeNamesById =
    characterSheetDictionary.gameDomain.terms.attributeNames;

  return (
    <select
      aria-label={`${label}の対応能力`}
      onChange={(event) => onChange(event.currentTarget.value as AttributeName)}
      value={value}
    >
      {attributeNames.map((attribute) => (
        <option key={attribute} value={attribute}>
          {attributeNamesById[attribute]}
        </option>
      ))}
    </select>
  );
}

function CheckRow({
  label,
  onAttributeChange,
  onModifierChange,
  row,
  skillControl,
}: CheckRowProps) {
  return (
    <div className={styles.row}>
      {skillControl}
      <AttributeSelect
        label={label}
        onChange={onAttributeChange}
        value={row.attribute}
      />
      <div className={styles.checkExpression}>
        <output
          aria-label={`${label}の常時能力値／一時能力値`}
          className="character-sheet-number-value character-sheet-number-value--compact"
        >
          {formatDisplayValue(row.permanentAttribute)} ／{" "}
          {formatDisplayValue(row.temporaryAttribute)}
        </output>
        <span aria-hidden="true" className={styles.operator}>
          +
        </span>
        <input
          aria-label={`${label}の判定修正`}
          defaultValue={row.modifier}
          onBlur={(event) => {
            event.currentTarget.value = String(
              onModifierChange(event.currentTarget.value),
            );
          }}
          onChange={(event) => {
            if (!event.currentTarget.validity.badInput) {
              onModifierChange(event.currentTarget.value);
            }
          }}
          step="1"
          type="number"
        />
        <span aria-hidden="true" className={styles.operator}>
          =
        </span>
        <output
          aria-label={`${label}の常時判定数／一時判定数`}
          className="character-sheet-number-value character-sheet-number-value--compact"
        >
          {formatDisplayValue(row.permanentCheck)} ／{" "}
          {formatDisplayValue(row.temporaryCheck)}
        </output>
      </div>
    </div>
  );
}

function CheckHeaders({ sectionName }: { sectionName: string }) {
  const { checks: labels } = characterSheetDictionary.characterSheet;

  return (
    <div className={styles.headers}>
      <span>{labels.headers.skill}</span>
      <span>{labels.headers.attribute}</span>
      <FormulaTooltip
        ariaLabel={`${sectionName}の${labels.headers.checkCount}の説明`}
        className={styles.checkCountTooltip}
        formula={labels.formula}
      >
        <span className={styles.checkCountHeader}>
          {labels.headers.checkCount}
          <span>{labels.headers.temporary}</span>
        </span>
      </FormulaTooltip>
    </div>
  );
}

export default function ChecksSection({
  attacks,
  onAttackAdd,
  onAttackAttributeChange,
  onAttackModifierChange,
  onAttackRemove,
  onAttackSkillChange,
  onReactionAttributeChange,
  onReactionModifierChange,
  reactions,
}: ChecksSectionProps) {
  const { checks: labels } = characterSheetDictionary.characterSheet;

  return (
    <div className={styles.root}>
      <section aria-labelledby="attack-checks-heading" className={styles.group}>
        <h3 id="attack-checks-heading">{labels.attacks}</h3>
        <CheckHeaders sectionName={labels.attacks} />
        <div className={styles.rows}>
          {attacks.map((attack) => {
            const label = `${labels.attacks}${attacks.indexOf(attack) + 1}`;

            return (
              <div className={styles.attackRow} key={attack.rowId}>
                <CheckRow
                  label={label}
                  onAttributeChange={(attribute) =>
                    onAttackAttributeChange(attack.rowId, attribute)
                  }
                  onModifierChange={(value) =>
                    onAttackModifierChange(attack.rowId, value)
                  }
                  row={attack}
                  skillControl={
                    <select
                      aria-label={`${label}の技能`}
                      onChange={(event) =>
                        onAttackSkillChange(
                          attack.rowId,
                          event.currentTarget.value as AttackSkillName,
                        )
                      }
                      value={attack.skill}
                    >
                      {attackSkillNames.map((skill) => (
                        <option key={skill} value={skill}>
                          {labels.skills[skill]}
                        </option>
                      ))}
                    </select>
                  }
                />
                <button
                  aria-label={`${label}${labels.removeAttack}`}
                  className="character-sheet-remove-button"
                  disabled={attacks.length <= 1}
                  onClick={() => onAttackRemove(attack.rowId)}
                  type="button"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
            );
          })}
        </div>
        <button
          className={styles.addButton}
          disabled={attacks.length >= 5}
          onClick={onAttackAdd}
          type="button"
        >
          {labels.addAttack}
        </button>
      </section>

      <section
        aria-labelledby="reaction-checks-heading"
        className={styles.group}
      >
        <h3 id="reaction-checks-heading">{labels.reactions}</h3>
        <CheckHeaders sectionName={labels.reactions} />
        <div className={styles.rows}>
          {reactions.map((reaction) => {
            const label = labels.reactionsByName[reaction.name];

            return (
              <CheckRow
                key={reaction.name}
                label={label}
                onAttributeChange={(attribute) =>
                  onReactionAttributeChange(reaction.name, attribute)
                }
                onModifierChange={(value) =>
                  onReactionModifierChange(reaction.name, value)
                }
                row={reaction}
                skillControl={
                  <span className={styles.reactionName}>{label}</span>
                }
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
