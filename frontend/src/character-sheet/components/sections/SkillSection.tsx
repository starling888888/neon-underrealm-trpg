import { ListPlus } from "lucide-react";
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import type { Skill } from "../../../lib/types/skill";
import {
  formatDisplayText,
  formatDisplayValue,
} from "../../../lib/utils/display-value";
import {
  characterSheetDictionary,
  getNamePickerTooltip,
} from "../../dictionary";
import CharacterSheetButton from "../_common/CharacterSheetButton";
import DeleteButton from "../_common/DeleteButton";
import FormulaTooltip from "../_common/FormulaTooltip";
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
  actionDescription?: ReactNode;
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
  synchronizationKey?: unknown;
  unavailableMessage: string;
};

type SkillMetadataProps = {
  skill: Skill | null;
};

function formatCompactValue(
  value: string | null | undefined,
  separator: string,
) {
  if (value === null || value === undefined || value.trim() === "") {
    return formatDisplayValue(value);
  }

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
        {formatDisplayText(skill?.effect)}
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
    <>
      {/* biome-ignore lint/a11y/useSemanticElements: Native button inherits disabled from the read-only fieldset, but this display-only disclosure must remain interactive. */}
      <span
        aria-controls={detailsId}
        aria-expanded={isExpanded}
        aria-label={`${name}${isExpanded ? copy.closeDetails : copy.openDetails}`}
        className={styles.detailsToggle}
        onClick={onClick}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          onClick();
        }}
        role="button"
        tabIndex={0}
      >
        <span aria-hidden="true">{isExpanded ? "▾" : "▸"}</span>
      </span>
    </>
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
  synchronizationKey,
}: {
  canMoveDown: boolean;
  canMoveUp: boolean;
  onLevelChange: (rowId: string, value: string) => number;
  onPickerRequest: (rowId: string, trigger: HTMLButtonElement) => void;
  onRemove: (rowId: string) => void;
  onMove: (rowId: string, direction: "up" | "down") => void;
  row: SkillSectionRow;
  synchronizationKey: unknown;
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
    // A reset can retain the same numeric level while replacing RHF defaults.
    void synchronizationKey;
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
  }, [row.level, synchronizationKey]);

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
              className={styles.levelNumericInput}
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
          <DeleteButton
            ariaLabel={`${accessibilityName}${copy.remove}`}
            className={styles.removeButton}
            disabled={!row.removalEnabled}
            onClick={() => onRemove(row.rowId)}
          />
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
  synchronizationKey,
  unavailableMessage,
}: SkillSectionProps) {
  const skillCopy = characterSheetDictionary.gameDomain.terms.skill;
  const skillCategoryName = characterSheetDictionary.gameDomain.terms.skills;
  const [isExpanded, setIsExpanded] = useState(true);
  const hasSectionRowError = rows.some((row) => row.hasRowError);
  const hasError = isInvalid || hasSectionRowError;
  const nameWidthStyle = {
    "--primary-skill-name-width": `${nameColumnWidthCh}ch`,
  } as CSSProperties;

  const toggleExpanded = () => {
    setIsExpanded((expanded) => !expanded);
  };

  return (
    <section
      aria-invalid={hasError || undefined}
      aria-label={ariaLabel}
      className={
        hasError ? `${styles.section} ${styles.invalid}` : styles.section
      }
      data-invalid={hasError || undefined}
      data-skill-section
      style={nameWidthStyle}
    >
      <h3>
        {/* biome-ignore lint/a11y/useSemanticElements: Native button inherits disabled from the read-only fieldset, but this display-only disclosure must remain interactive. */}
        <span
          aria-controls={sectionId}
          aria-expanded={isExpanded}
          className={styles.toggle}
          onClick={toggleExpanded}
          onKeyDown={(event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            toggleExpanded();
          }}
          role="button"
          tabIndex={0}
        >
          <span>{heading}</span>
          <span aria-hidden="true" className={styles.chevron} />
        </span>
      </h3>
      <div className={styles.content} hidden={!isExpanded} id={sectionId}>
        {isAvailable ? (
          <>
            <div className={styles.headerRow}>
              <span />
              <span className={styles.headerTooltip}>
                <FormulaTooltip
                  ariaLabel={skillCopy.name}
                  formula={getNamePickerTooltip(skillCategoryName)}
                >
                  <span>{skillCopy.name}</span>
                </FormulaTooltip>
              </span>
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
                synchronizationKey={synchronizationKey}
              />
            ))}
            {onAdd === undefined ? null : (
              <div className={styles.actions}>
                <CharacterSheetButton
                  className={styles.addButton}
                  onClick={onAdd}
                >
                  {addLabel}
                </CharacterSheetButton>
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
