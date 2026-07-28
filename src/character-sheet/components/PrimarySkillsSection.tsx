import { ListPlus } from "lucide-react";
import { type CSSProperties, useState } from "react";

import type { Skill } from "../../lib/types/skill";
import { characterSheetDictionary } from "../dictionary";
import { formatDisplayValue } from "../format-display-value";
import type { PrimarySkillGroups } from "../master-data/primary-skills";
import FormulaTooltip from "./FormulaTooltip";
import styles from "./PrimarySkillsSection.module.css";

export type PrimarySkillRowView = {
  level: number;
  rowId: string;
  skill: Skill | null;
  skillId: string | null;
};

export type PrimarySkillsSectionProps = {
  bonusSkills: readonly Skill[];
  candidateGroups: PrimarySkillGroups;
  hasPrimarySkillLevelTotalError: boolean;
  invalidDuplicateSkillRowIds: readonly string[];
  invalidMaximumLevelRowIds: readonly string[];
  maximumSkillNameLength: number;
  onAdd: () => void;
  onLevelChange: (rowId: string, value: string) => number;
  onPickerRequest: (rowId: string, trigger: HTMLButtonElement) => void;
  onRemove: (rowId: string) => void;
  onMove: (rowId: string, direction: "up" | "down") => void;
  onSelect: (rowId: string, skillId: string) => void;
  onSelectionClear: () => void;
  primaryRyugiName: string | null;
  primaryRyugiSelected: boolean;
  rows: readonly PrimarySkillRowView[];
};

type SkillMetadataProps = {
  skill: Skill | null;
};

function formatCompactValue(
  value: string | null | undefined,
  separator: string,
) {
  if (value === null || value === undefined || value === "") return "-";

  return value
    .split(separator)
    .map((part, index) => (
      <span key={part}>{index === 0 ? part : `${separator}${part}`}</span>
    ));
}

function SkillMetadata({ skill }: SkillMetadataProps) {
  return (
    <>
      <span className={styles.cell} data-primary-skill-metadata="maximum">
        {formatDisplayValue(skill?.maxLevel ?? null)}
      </span>
      <span className={styles.cell} data-primary-skill-metadata="timing">
        {formatDisplayValue(skill?.timing ?? null)}
      </span>
      <span className={styles.cell} data-primary-skill-metadata="cost">
        {formatDisplayValue(skill?.cost ?? null)}
      </span>
      <span className={styles.cell} data-primary-skill-metadata="usage">
        {formatCompactValue(skill?.usageRestriction, "&")}
      </span>
    </>
  );
}

function SkillDetails({ skill }: SkillMetadataProps) {
  const copy = characterSheetDictionary.gameDomain.terms.skill;

  return (
    <div className={styles.details}>
      <div className={styles.mobileMetadata} data-primary-skill-mobile-metadata>
        <p>
          <span>{copy.cost}</span>
          {formatDisplayValue(skill?.cost ?? null)}
        </p>
        <p>
          <span>{copy.usageRestriction}</span>
          {formatDisplayValue(skill?.usageRestriction ?? null)}
        </p>
      </div>
      <div className={styles.detailMeta}>
        <p>
          <span>{copy.proficiency}</span>
          {formatDisplayValue(skill?.proficiency ?? null)}
        </p>
        <p>
          <span>{copy.acquisitionRestriction}</span>
          {formatDisplayValue(skill?.acquisitionRestriction ?? null)}
        </p>
      </div>
      <p className={styles.effect}>
        <span>{copy.effect}</span>
        {skill?.effect ?? ""}
      </p>
    </div>
  );
}

function DetailsToggle({
  isExpanded,
  name,
  onClick,
}: {
  isExpanded: boolean;
  name: string;
  onClick: () => void;
}) {
  const copy = characterSheetDictionary.gameDomain.terms.skill;

  return (
    <button
      aria-expanded={isExpanded}
      aria-label={`${name}${isExpanded ? copy.closeDetails : copy.openDetails}`}
      className={styles.detailsToggle}
      onClick={onClick}
      type="button"
    >
      <span aria-hidden="true">{isExpanded ? "▾" : "▸"}</span>
    </button>
  );
}

function PrimaryBonusSkillRow({ skill }: { skill: Skill }) {
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

  return (
    <div className={styles.row} data-primary-skill-kind="bonus">
      <div className={styles.firstLine}>
        <span aria-hidden="true" className={styles.handlePlaceholder} />
        <span className={styles.skillName}>{skill.name}</span>
        <span className={styles.levelValue}>1</span>
        <SkillMetadata skill={skill} />
        <DetailsToggle
          isExpanded={isDetailsExpanded}
          name={skill.name}
          onClick={() => setIsDetailsExpanded((expanded) => !expanded)}
        />
        <span aria-hidden="true" className={styles.removePlaceholder} />
      </div>
      {isDetailsExpanded ? <SkillDetails skill={skill} /> : null}
    </div>
  );
}

function PrimarySkillRow({
  canRemove,
  canMoveDown,
  canMoveUp,
  hasDuplicateSkillError,
  hasMaximumLevelError,
  onLevelChange,
  onPickerRequest,
  onRemove,
  onMove,
  row,
}: {
  canRemove: boolean;
  canMoveDown: boolean;
  canMoveUp: boolean;
  hasDuplicateSkillError: boolean;
  hasMaximumLevelError: boolean;
  onLevelChange: (rowId: string, value: string) => number;
  onPickerRequest: (rowId: string, trigger: HTMLButtonElement) => void;
  onRemove: (rowId: string) => void;
  onMove: (rowId: string, direction: "up" | "down") => void;
  row: PrimarySkillRowView;
}) {
  const copy = characterSheetDictionary.characterSheet.skills;
  const skillCopy = characterSheetDictionary.gameDomain.terms.skill;
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const name = row.skill?.name ?? copy.unselected;

  return (
    <fieldset
      className={styles.row}
      data-invalid={hasDuplicateSkillError || hasMaximumLevelError || undefined}
      data-primary-skill-kind="normal"
      data-primary-skill-row={row.rowId}
    >
      <legend className={styles.visuallyHidden}>{name}</legend>
      <div className={styles.firstLine}>
        <div className={styles.reorderControls}>
          {canMoveUp ? (
            <button
              aria-label={`${name}${copy.moveUp}`}
              className={styles.reorderButton}
              onClick={() => onMove(row.rowId, "up")}
              type="button"
            >
              <span aria-hidden="true">▲</span>
            </button>
          ) : null}
          {canMoveDown ? (
            <button
              aria-label={`${name}${copy.moveDown}`}
              className={styles.reorderButton}
              onClick={() => onMove(row.rowId, "down")}
              type="button"
            >
              <span aria-hidden="true">▼</span>
            </button>
          ) : null}
        </div>
        <button
          className={styles.skillPicker}
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
        <label className={styles.levelInput}>
          <span className={styles.visuallyHidden}>{skillCopy.level}</span>
          <input
            aria-invalid={hasMaximumLevelError || undefined}
            aria-label={`${name}${skillCopy.level}`}
            max={row.skill?.maxLevel}
            min="1"
            onBlur={(event) => {
              event.currentTarget.value = String(
                onLevelChange(row.rowId, event.currentTarget.value),
              );
            }}
            onChange={(event) => {
              if (!event.currentTarget.validity.badInput) {
                onLevelChange(row.rowId, event.currentTarget.value);
              }
            }}
            step="1"
            type="number"
            value={row.level}
          />
        </label>
        <SkillMetadata skill={row.skill} />
        <DetailsToggle
          isExpanded={isDetailsExpanded}
          name={name}
          onClick={() => setIsDetailsExpanded((expanded) => !expanded)}
        />
        <button
          aria-label={`${name}${copy.remove}`}
          className="character-sheet-remove-button character-sheet-remove-button--mobile-compact"
          disabled={!canRemove}
          onClick={() => onRemove(row.rowId)}
          type="button"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
      {isDetailsExpanded ? <SkillDetails skill={row.skill} /> : null}
    </fieldset>
  );
}

/** G12 presentation for the selected primary ryugi's skills only. */
export default function PrimarySkillsSection({
  bonusSkills,
  hasPrimarySkillLevelTotalError,
  invalidDuplicateSkillRowIds,
  invalidMaximumLevelRowIds,
  maximumSkillNameLength,
  onAdd,
  onLevelChange,
  onPickerRequest,
  onMove,
  onRemove,
  primaryRyugiName,
  primaryRyugiSelected,
  rows,
}: PrimarySkillsSectionProps) {
  const copy = characterSheetDictionary.characterSheet.skills;
  const skillCopy = characterSheetDictionary.gameDomain.terms.skill;
  const [isExpanded, setIsExpanded] = useState(true);
  const nameWidthStyle = {
    "--primary-skill-name-width": `${maximumSkillNameLength}ch`,
  } as CSSProperties;

  return (
    <section
      aria-invalid={hasPrimarySkillLevelTotalError || undefined}
      aria-label={copy.label}
      className={styles.section}
      data-invalid={hasPrimarySkillLevelTotalError || undefined}
      data-primary-skills-section
      style={nameWidthStyle}
    >
      <h3>
        <button
          aria-controls="primary-skills-content"
          aria-expanded={isExpanded}
          className={styles.toggle}
          onClick={() => setIsExpanded((expanded) => !expanded)}
          type="button"
        >
          <span>
            {primaryRyugiName === null
              ? copy.primary
              : `${copy.primary}：${primaryRyugiName}`}
          </span>
          <span aria-hidden="true" className={styles.chevron} />
        </button>
      </h3>
      <div
        className={styles.content}
        hidden={!isExpanded}
        id="primary-skills-content"
      >
        {primaryRyugiSelected ? (
          <>
            <div className={styles.headerRow}>
              <span />
              <FormulaTooltip
                ariaLabel={skillCopy.name}
                formula={copy.nameTooltip}
              >
                <span>{skillCopy.name}</span>
              </FormulaTooltip>
              <span>{skillCopy.level}</span>
              <span>
                {skillCopy.maximumLevel.replace(skillCopy.level, "")}
                <br />
                {skillCopy.level}
              </span>
              <span>{skillCopy.timing}</span>
              <span>{skillCopy.cost}</span>
              <span>{skillCopy.usageRestriction}</span>
              <span>{skillCopy.expand}</span>
              <span />
            </div>
            {bonusSkills.map((skill) => (
              <PrimaryBonusSkillRow key={skill.id} skill={skill} />
            ))}
            {rows.map((row, index) => (
              <PrimarySkillRow
                canRemove={rows.length > 1}
                canMoveDown={index < rows.length - 1}
                canMoveUp={index > 0}
                hasDuplicateSkillError={invalidDuplicateSkillRowIds.includes(
                  row.rowId,
                )}
                hasMaximumLevelError={invalidMaximumLevelRowIds.includes(
                  row.rowId,
                )}
                key={row.rowId}
                onLevelChange={onLevelChange}
                onMove={onMove}
                onPickerRequest={onPickerRequest}
                onRemove={onRemove}
                row={row}
              />
            ))}
            <button className={styles.addButton} onClick={onAdd} type="button">
              {copy.add}
            </button>
          </>
        ) : (
          <p className={styles.unselected}>{copy.selectPrimaryRyugi}</p>
        )}
      </div>
    </section>
  );
}
