import { type CSSProperties, type DragEvent, useState } from "react";

import type { Skill } from "../../lib/types/skill";
import { characterSheetDictionary } from "../dictionary";
import { formatDisplayValue } from "../format-display-value";
import type { PrimarySkillGroups } from "../master-data/primary-skills";
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
  invalidMaximumLevelRowIds: readonly string[];
  maximumSkillNameLength: number;
  onAdd: () => void;
  onLevelChange: (rowId: string, value: string) => number;
  onPickerRequest: (rowId: string, trigger: HTMLButtonElement) => void;
  onRemove: (rowId: string) => void;
  onReorder: (draggedRowId: string, targetRowId: string) => void;
  onSelect: (rowId: string, skillId: string) => void;
  onSelectionClear: () => void;
  primaryRyugiSelected: boolean;
  rows: readonly PrimarySkillRowView[];
};

type SkillMetadataProps = {
  skill: Skill | null;
};

function SkillMetadata({ skill }: SkillMetadataProps) {
  const copy = characterSheetDictionary.gameDomain.terms.skill;

  return (
    <>
      <span className={styles.metadata} data-primary-skill-metadata="maximum">
        <span>{copy.maximumLevel}</span>
        <strong>{formatDisplayValue(skill?.maxLevel ?? null)}</strong>
      </span>
      <span className={styles.metadata} data-primary-skill-metadata="cost">
        <span>{copy.cost}</span>
        <strong>{formatDisplayValue(skill?.cost ?? null)}</strong>
      </span>
      <span
        className={styles.metadata}
        data-primary-skill-metadata="proficiency"
      >
        <span>{copy.proficiency}</span>
        <strong>{formatDisplayValue(skill?.proficiency ?? null)}</strong>
      </span>
      <span className={styles.metadata} data-primary-skill-metadata="usage">
        <span>{copy.usageRestriction}</span>
        <strong>{formatDisplayValue(skill?.usageRestriction ?? null)}</strong>
      </span>
      <span className={styles.metadata} data-primary-skill-metadata="target">
        <span>{copy.target}</span>
        <strong>{formatDisplayValue(skill?.target ?? null)}</strong>
      </span>
      <span className={styles.metadata} data-primary-skill-metadata="range">
        <span>{copy.range}</span>
        <strong>{formatDisplayValue(skill?.range ?? null)}</strong>
      </span>
      <span
        className={styles.metadata}
        data-primary-skill-metadata="acquisition"
      >
        <span>{copy.acquisitionRestriction}</span>
        <strong>
          {formatDisplayValue(skill?.acquisitionRestriction ?? null)}
        </strong>
      </span>
    </>
  );
}

function SkillEffect({ skill }: SkillMetadataProps) {
  const copy = characterSheetDictionary.gameDomain.terms.skill;

  return (
    <p className={styles.effect}>
      <span>{copy.effect}</span>
      {skill?.effect ?? ""}
    </p>
  );
}

function PrimaryBonusSkillRow({ skill }: { skill: Skill }) {
  const { general, gameDomain } = characterSheetDictionary;
  const copy = gameDomain.terms.skill;

  return (
    <div className={styles.row} data-primary-skill-kind="bonus">
      <div className={styles.firstLine}>
        <span aria-hidden="true" className={styles.handlePlaceholder} />
        <span className={styles.skillName}>{skill.name}</span>
        <span className={styles.levelValue}>
          <span>{copy.level}</span>
          <strong>{general.automatic}</strong>
        </span>
        <SkillMetadata skill={skill} />
      </div>
      <SkillEffect skill={skill} />
    </div>
  );
}

function PrimarySkillRow({
  canRemove,
  hasMaximumLevelError,
  onLevelChange,
  onPickerRequest,
  onRemove,
  onReorder,
  row,
}: {
  canRemove: boolean;
  hasMaximumLevelError: boolean;
  onLevelChange: (rowId: string, value: string) => number;
  onPickerRequest: (rowId: string, trigger: HTMLButtonElement) => void;
  onRemove: (rowId: string) => void;
  onReorder: (draggedRowId: string, targetRowId: string) => void;
  row: PrimarySkillRowView;
}) {
  const copy = characterSheetDictionary.characterSheet.skills;
  const skillCopy = characterSheetDictionary.gameDomain.terms.skill;
  const [draggedRowId, setDraggedRowId] = useState<string | null>(null);

  function onDragStart(event: DragEvent<HTMLButtonElement>): void {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", row.rowId);
    setDraggedRowId(row.rowId);
  }

  function onDrop(event: DragEvent<HTMLFieldSetElement>): void {
    event.preventDefault();
    const sourceRowId =
      event.dataTransfer.getData("text/plain") || draggedRowId;
    if (sourceRowId !== null) onReorder(sourceRowId, row.rowId);
    setDraggedRowId(null);
  }

  return (
    <fieldset
      className={styles.row}
      data-primary-skill-kind="normal"
      data-invalid={hasMaximumLevelError || undefined}
      data-primary-skill-row={row.rowId}
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
    >
      <legend className={styles.visuallyHidden}>
        {row.skill?.name ?? copy.unselected}
      </legend>
      <div className={styles.firstLine}>
        <button
          aria-label={`${copy.reorderPrefix}${row.skill?.name ?? copy.unselected}`}
          className={styles.dragHandle}
          draggable
          onDragEnd={() => setDraggedRowId(null)}
          onDragStart={onDragStart}
          type="button"
        >
          <span aria-hidden="true">≡</span>
        </button>
        <button
          className={styles.skillPicker}
          onClick={(event) => onPickerRequest(row.rowId, event.currentTarget)}
          type="button"
        >
          <span aria-hidden="true" className={styles.chooseIcon}>
            ◇
          </span>
          <span>{row.skill?.name ?? copy.unselected}</span>
        </button>
        <label className={styles.levelInput}>
          <span>{skillCopy.level}</span>
          <input
            aria-invalid={hasMaximumLevelError || undefined}
            aria-label={`${row.skill?.name ?? copy.unselected}${skillCopy.level}`}
            defaultValue={row.level}
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
          />
        </label>
        <SkillMetadata skill={row.skill} />
        <button
          aria-label={`${row.skill?.name ?? copy.unselected}${copy.remove}`}
          className="character-sheet-remove-button"
          disabled={!canRemove}
          onClick={() => onRemove(row.rowId)}
          type="button"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <SkillEffect skill={row.skill} />
    </fieldset>
  );
}

/** G12 presentation for the selected primary ryugi's skills only. */
export default function PrimarySkillsSection({
  bonusSkills,
  hasPrimarySkillLevelTotalError,
  invalidMaximumLevelRowIds,
  maximumSkillNameLength,
  onAdd,
  onLevelChange,
  onPickerRequest,
  onRemove,
  onReorder,
  primaryRyugiSelected,
  rows,
}: PrimarySkillsSectionProps) {
  const copy = characterSheetDictionary.characterSheet.skills;
  const [isExpanded, setIsExpanded] = useState(true);
  const nameWidthStyle = {
    "--primary-skill-name-width": `${maximumSkillNameLength}em`,
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
          <span>{copy.primary}</span>
          <span aria-hidden="true" className={styles.chevron}>
            {isExpanded ? "▾" : "▸"}
          </span>
        </button>
      </h3>
      <div hidden={!isExpanded} id="primary-skills-content">
        {primaryRyugiSelected ? (
          <>
            {bonusSkills.map((skill) => (
              <PrimaryBonusSkillRow key={skill.id} skill={skill} />
            ))}
            {rows.map((row) => (
              <PrimarySkillRow
                canRemove={rows.length > 1}
                hasMaximumLevelError={invalidMaximumLevelRowIds.includes(
                  row.rowId,
                )}
                key={row.rowId}
                onLevelChange={onLevelChange}
                onPickerRequest={onPickerRequest}
                onRemove={onRemove}
                onReorder={onReorder}
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
