import { ListPlus } from "lucide-react";
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
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const name = row.skill?.name ?? copy.unselected;

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
      data-invalid={hasMaximumLevelError || undefined}
      data-primary-skill-kind="normal"
      data-primary-skill-row={row.rowId}
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
    >
      <legend className={styles.visuallyHidden}>{name}</legend>
      <div className={styles.firstLine}>
        <button
          aria-label={`${copy.reorderPrefix}${name}`}
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
          className="character-sheet-remove-button"
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
  invalidMaximumLevelRowIds,
  maximumSkillNameLength,
  onAdd,
  onLevelChange,
  onPickerRequest,
  onRemove,
  onReorder,
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
            <div aria-hidden="true" className={styles.headerRow}>
              <span />
              <span>{skillCopy.name}</span>
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
