import { useState } from "react";
import { formatDisplayValue } from "../../../lib/utils/display-value";
import { characterSheetDictionary } from "../../dictionary";
import { attributeNames } from "../../form/values";
import type { ChecksDerivedValues } from "../../logic/checks";
import type { NoncombatSkillName } from "../../master-data/noncombat-skills";
import FormulaTooltip from "../_common/FormulaTooltip";
import styles from "./NoncombatChecksSection.module.css";

export type NoncombatChecksSectionProps = {
  onFavoriteChange: (name: NoncombatSkillName, isFavorite: boolean) => void;
  onModifierChange: (name: NoncombatSkillName, value: string) => number;
  rows: ChecksDerivedValues["noncombat"];
};

function NoncombatCheckRow({
  onFavoriteChange,
  onModifierChange,
  row,
}: {
  onFavoriteChange: NoncombatChecksSectionProps["onFavoriteChange"];
  onModifierChange: NoncombatChecksSectionProps["onModifierChange"];
  row: ChecksDerivedValues["noncombat"][number];
}) {
  const name =
    characterSheetDictionary.gameDomain.terms.noncombatSkillNames[row.id];

  return (
    <fieldset
      className={styles.row}
      data-favorite={row.isFavorite || undefined}
    >
      <legend className={styles.visuallyHidden}>{name}</legend>
      <input
        aria-label={`${name}を得意技能にする`}
        checked={row.isFavorite}
        onChange={(event) =>
          onFavoriteChange(row.id, event.currentTarget.checked)
        }
        type="checkbox"
      />
      <span className={styles.name}>{name}</span>
      <input
        aria-label={`${name}の判定修正`}
        className={styles.modifier}
        defaultValue={row.modifier}
        onBlur={(event) => {
          event.currentTarget.value = String(
            onModifierChange(row.id, event.currentTarget.value),
          );
        }}
        onChange={(event) => {
          if (!event.currentTarget.validity.badInput) {
            onModifierChange(row.id, event.currentTarget.value);
          }
        }}
        step="1"
        type="number"
      />
      <output
        aria-label={`${name}の常時判定数／一時判定数`}
        className="character-sheet-number-value character-sheet-number-value--compact"
      >
        {formatDisplayValue(row.permanentCheck)}／
        {formatDisplayValue(row.temporaryCheck)}
      </output>
    </fieldset>
  );
}

/** Owns the noncombat-specific collapsed presentation and its local toggle state. */
export default function NoncombatChecksSection({
  onFavoriteChange,
  onModifierChange,
  rows,
}: NoncombatChecksSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { checks: labels } = characterSheetDictionary.characterSheet;
  const terms = characterSheetDictionary.gameDomain.terms;
  const attributeNamesById =
    characterSheetDictionary.gameDomain.terms.attributeNames;
  const contentId = "noncombat-checks-content";

  return (
    <section
      aria-labelledby="noncombat-checks-heading"
      className={styles.frame}
    >
      <h3 className={styles.heading} id="noncombat-checks-heading">
        <FormulaTooltip
          ariaLabel={`${terms.checks.noncombat}の説明`}
          className={styles.titleTooltip}
          formula={labels.noncombat.tooltip}
          multiline
        >
          <span>{terms.checks.noncombat}</span>
        </FormulaTooltip>
        <button
          aria-label={`${terms.checks.noncombat}を開閉`}
          aria-controls={contentId}
          aria-expanded={isExpanded}
          className={styles.toggle}
          onClick={() => setIsExpanded((value) => !value)}
          type="button"
        >
          <span aria-hidden="true" className={styles.chevron} />
        </button>
      </h3>
      <section className={styles.content} id={contentId}>
        {isExpanded ? (
          <div className={styles.groups}>
            {attributeNames.map((attribute) => {
              const attributeRows = rows.filter(
                (row) => row.attribute === attribute,
              );

              return (
                <section className={styles.attributeGroup} key={attribute}>
                  <h4>
                    {terms.checks.attribute}：{attributeNamesById[attribute]}
                  </h4>
                  <div className={styles.rows}>
                    {attributeRows.map((row) => (
                      <NoncombatCheckRow
                        key={row.id}
                        onFavoriteChange={onFavoriteChange}
                        onModifierChange={onModifierChange}
                        row={row}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className={styles.collapsedRows}>
            {rows
              .filter((row) => row.isFavorite)
              .map((row) => (
                <NoncombatCheckRow
                  key={row.id}
                  onFavoriteChange={onFavoriteChange}
                  onModifierChange={onModifierChange}
                  row={row}
                />
              ))}
          </div>
        )}
      </section>
    </section>
  );
}
