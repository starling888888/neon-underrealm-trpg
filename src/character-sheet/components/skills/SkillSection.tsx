import { ListPlus } from "lucide-react";
import { type CSSProperties, useEffect, useRef, useState } from "react";

import type { Skill } from "../../../lib/types/skill";
import { characterSheetDictionary } from "../../dictionary";
import { formatDisplayValue } from "../../format-display-value";
import FormulaTooltip from "../FormulaTooltip";
import styles from "./SkillSection.module.css";

export type SkillRowKind = "automatic" | "normal";

export type SkillSectionRow = {
  accessibilityName: string;
  hasLevelError: boolean;
  hasRowError: boolean;
  kind: SkillRowKind;
  level: number;
  levelEditable: boolean;
  movable: boolean;
  removable: boolean;
  removalEnabled: boolean;
  rowId: string;
  selectable: boolean;
  skill: Skill | null;
  skillId: string | null;
};

export type SkillSectionProps = {
  actionDescription?: string;
  actionDescriptionInvalid?: boolean;
  addLabel: string;
  ariaLabel: string;
  heading: string;
  isAvailable: boolean;
  isInvalid: boolean;
  nameColumnWidthCh: number;
  onAdd?: () => void;
  onLevelChange: (rowId: string, value: string) => number;
  onPickerRequest: (rowId: string, trigger: HTMLButtonElement) => void;
  onRemove: (rowId: string) => void;
  onMove: (rowId: string, direction: "up" | "down") => void;
  rows: readonly SkillSectionRow[];
  sectionId: string;
  unavailableMessage: string;
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
  const copy = characterSheetDictionary.gameDomain.terms.skill;

  return (
    <>
      <span className={styles.cell} data-skill-metadata="maximum">
        <span className={styles.visuallyHidden}>{copy.maximumLevel}：</span>
        {formatDisplayValue(skill?.maxLevel ?? null)}
      </span>
      <span className={styles.cell} data-skill-metadata="timing">
        <span className={styles.visuallyHidden}>{copy.timing}：</span>
        {formatDisplayValue(skill?.timing ?? null)}
      </span>
      <span className={styles.cell} data-skill-metadata="cost">
        <span className={styles.visuallyHidden}>{copy.cost}：</span>
        {formatDisplayValue(skill?.cost ?? null)}
      </span>
      <span className={styles.cell} data-skill-metadata="usage">
        <span className={styles.visuallyHidden}>{copy.usageRestriction}：</span>
        {formatCompactValue(skill?.usageRestriction, "&")}
      </span>
    </>
  );
}

function SkillDetails({
  detailsId,
  skill,
}: SkillMetadataProps & { detailsId: string }) {
  const copy = characterSheetDictionary.gameDomain.terms.skill;

  return (
    <div className={styles.details} id={detailsId}>
      <div className={styles.mobileMetadata} data-skill-mobile-metadata>
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
  detailsId,
  isExpanded,
  name,
  onClick,
}: {
  detailsId: string;
  isExpanded: boolean;
  name: string;
  onClick: () => void;
}) {
  const copy = characterSheetDictionary.gameDomain.terms.skill;

  return (
    <button
      aria-controls={detailsId}
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

function SkillRow({
  canMoveDown,
  canMoveUp,
  onLevelChange,
  onPickerRequest,
  onRemove,
  onMove,
  row,
}: {
  canMoveDown: boolean;
  canMoveUp: boolean;
  onLevelChange: (rowId: string, value: string) => number;
  onPickerRequest: (rowId: string, trigger: HTMLButtonElement) => void;
  onRemove: (rowId: string) => void;
  onMove: (rowId: string, direction: "up" | "down") => void;
  row: SkillSectionRow;
}) {
  const copy = characterSheetDictionary.characterSheet.skills;
  const skillCopy = characterSheetDictionary.gameDomain.terms.skill;
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const levelInputRef = useRef<HTMLInputElement>(null);
  const previousLevelRef = useRef(row.level);
  const hasError = row.hasRowError || row.hasLevelError;
  const name = row.skill?.name ?? copy.unselected;
  const accessibilityName = row.accessibilityName;
  const detailsId = `skill-details-${row.rowId}`;

  useEffect(() => {
    const input = levelInputRef.current;
    if (input === null) return;

    const nextValue = String(row.level);
    const hasExternalValueUpdate = previousLevelRef.current !== row.level;
    previousLevelRef.current = row.level;

    if (
      input.value !== nextValue &&
      (hasExternalValueUpdate ||
        document.activeElement !== input ||
        !input.validity.badInput)
    ) {
      input.value = nextValue;
    }
  }, [row.level]);

  return (
    <fieldset
      aria-invalid={hasError || undefined}
      className={styles.row}
      data-invalid={hasError || undefined}
      data-skill-row-kind={row.kind}
      data-skill-row={row.rowId}
    >
      <legend className={styles.visuallyHidden}>{accessibilityName}</legend>
      <div className={styles.firstLine}>
        {row.movable ? (
          <div className={styles.reorderControls}>
            {canMoveUp ? (
              <button
                aria-label={`${accessibilityName}${copy.moveUp}`}
                className={styles.reorderButton}
                onClick={() => onMove(row.rowId, "up")}
                type="button"
              >
                <span aria-hidden="true">▲</span>
              </button>
            ) : null}
            {canMoveDown ? (
              <button
                aria-label={`${accessibilityName}${copy.moveDown}`}
                className={styles.reorderButton}
                onClick={() => onMove(row.rowId, "down")}
                type="button"
              >
                <span aria-hidden="true">▼</span>
              </button>
            ) : null}
          </div>
        ) : (
          <span aria-hidden="true" className={styles.handlePlaceholder} />
        )}
        {row.selectable ? (
          <button
            aria-label={row.skill === null ? accessibilityName : undefined}
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
        ) : (
          <span className={styles.skillName}>{name}</span>
        )}
        {row.levelEditable ? (
          <label className={styles.levelInput}>
            <span className={styles.visuallyHidden}>{skillCopy.level}</span>
            <input
              aria-invalid={hasError || undefined}
              aria-label={`${accessibilityName}${skillCopy.level}`}
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
              defaultValue={row.level}
              ref={levelInputRef}
            />
          </label>
        ) : (
          <span className={styles.levelValue}>{row.level}</span>
        )}
        <SkillMetadata skill={row.skill} />
        <DetailsToggle
          detailsId={detailsId}
          isExpanded={isDetailsExpanded}
          name={accessibilityName}
          onClick={() => setIsDetailsExpanded((expanded) => !expanded)}
        />
        {row.removable ? (
          <button
            aria-label={`${accessibilityName}${copy.remove}`}
            className="character-sheet-remove-button character-sheet-remove-button--mobile-compact"
            disabled={!row.removalEnabled}
            onClick={() => onRemove(row.rowId)}
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        ) : (
          <span aria-hidden="true" className={styles.removePlaceholder} />
        )}
      </div>
      {isDetailsExpanded ? (
        <SkillDetails detailsId={detailsId} skill={row.skill} />
      ) : null}
    </fieldset>
  );
}

/** Shared presentation for one character-sheet skill category. */
export default function SkillSection({
  actionDescription,
  actionDescriptionInvalid = false,
  addLabel,
  ariaLabel,
  heading,
  isAvailable,
  isInvalid,
  nameColumnWidthCh,
  onAdd,
  onLevelChange,
  onPickerRequest,
  onMove,
  onRemove,
  rows,
  sectionId,
  unavailableMessage,
}: SkillSectionProps) {
  const copy = characterSheetDictionary.characterSheet.skills;
  const skillCopy = characterSheetDictionary.gameDomain.terms.skill;
  const [isExpanded, setIsExpanded] = useState(true);
  const hasRowError = rows.some((row) => row.hasRowError || row.hasLevelError);
  const hasError = isInvalid || hasRowError;
  const nameWidthStyle = {
    "--primary-skill-name-width": `${nameColumnWidthCh}ch`,
  } as CSSProperties;

  return (
    <section
      aria-invalid={hasError || undefined}
      aria-label={ariaLabel}
      className={styles.section}
      data-invalid={hasError || undefined}
      data-skill-section
      style={nameWidthStyle}
    >
      <h3>
        <button
          aria-controls={sectionId}
          aria-expanded={isExpanded}
          className={styles.toggle}
          onClick={() => setIsExpanded((expanded) => !expanded)}
          type="button"
        >
          <span>{heading}</span>
          <span aria-hidden="true" className={styles.chevron} />
        </button>
      </h3>
      <div className={styles.content} hidden={!isExpanded} id={sectionId}>
        {isAvailable ? (
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
            {rows.map((row, index) => (
              <SkillRow
                canMoveDown={
                  row.movable &&
                  rows.slice(index + 1).some((item) => item.movable)
                }
                canMoveUp={
                  row.movable &&
                  rows.slice(0, index).some((item) => item.movable)
                }
                key={row.rowId}
                onLevelChange={onLevelChange}
                onMove={onMove}
                onPickerRequest={onPickerRequest}
                onRemove={onRemove}
                row={row}
              />
            ))}
            {onAdd === undefined ? null : (
              <div className={styles.actions}>
                <button
                  className={styles.addButton}
                  onClick={onAdd}
                  type="button"
                >
                  {addLabel}
                </button>
                {actionDescription === undefined ? null : (
                  <output
                    aria-invalid={actionDescriptionInvalid || undefined}
                    className={styles.actionDescription}
                  >
                    {actionDescription}
                  </output>
                )}
              </div>
            )}
          </>
        ) : (
          <p className={styles.unselected}>{unavailableMessage}</p>
        )}
      </div>
    </section>
  );
}
