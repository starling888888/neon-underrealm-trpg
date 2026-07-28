import type { RefObject } from "react";

import { characterSheetDictionary } from "../dictionary";
import type {
  AttributeName,
  AttributeValues,
  BuildValues,
  OtherRyugiEditableFieldName,
} from "../form-values";
import { attributeNames } from "../form-values";
import { formatDisplayValue } from "../format-display-value";
import type { BuildDerivedValues } from "../logic/build";
import type { CommonSkillBonusLevel } from "../logic/common-skills";
import type { CharacterSheetSelectOption } from "../master-data/build";
import styles from "./BuildSection.module.css";
import FormulaTooltip from "./FormulaTooltip";

type BuildNumberInputProps = {
  ariaInvalid?: boolean;
  label: string;
  onChange: (value: string) => void;
  onCommit: (value: string) => number;
  value: number;
};

type ReferenceMetricProps = {
  label: string;
  value: number | null;
};

export type BuildSectionProps = {
  build: BuildValues;
  derived: BuildDerivedValues;
  hasIkizamaSkillLevelError: boolean;
  invalidOtherRyugiSkillLevelRowIds: readonly string[];
  hasPrimarySkillLevelError: boolean;
  ikizamaOptions: readonly CharacterSheetSelectOption[];
  onAttributeChange: (
    attribute: AttributeName,
    field: keyof AttributeValues,
    value: string,
  ) => void;
  onAttributeCommit: (
    attribute: AttributeName,
    field: keyof AttributeValues,
    value: string,
  ) => number;
  onIkizamaChange: (id: string | null, trigger?: HTMLSelectElement) => void;
  onIkizamaLevelChange: (value: string) => number;
  onOtherRyugiAdd: () => void;
  otherRyugiAddButtonRef?: RefObject<HTMLButtonElement | null>;
  onOtherRyugiChange: (
    index: number,
    field: OtherRyugiEditableFieldName,
    value: string,
    trigger?: HTMLSelectElement,
  ) => void;
  onOtherRyugiCommit: (index: number, value: string) => number;
  onOtherRyugiRemove: (index: number, trigger?: HTMLButtonElement) => void;
  onPrimaryRyugiChange: (
    id: string | null,
    trigger?: HTMLSelectElement,
  ) => void;
  onPrimaryRyugiLevelChange: (value: string) => void;
  onPrimaryRyugiLevelCommit: (value: string) => number;
  ryugiOptions: readonly CharacterSheetSelectOption[];
  unlockedCommonSkillBonusLevels: readonly CommonSkillBonusLevel[];
};

function BuildNumberInput({
  ariaInvalid = false,
  label,
  onChange,
  onCommit,
  value,
}: BuildNumberInputProps) {
  return (
    <input
      aria-invalid={ariaInvalid || undefined}
      aria-label={label}
      className={styles.numberInput}
      defaultValue={value}
      onBlur={(event) => {
        event.currentTarget.value = String(onCommit(event.currentTarget.value));
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

function ReferenceMetric({ label, value }: ReferenceMetricProps) {
  return (
    <div className={styles.referenceMetric}>
      <span className={styles.referenceLabel}>{label}</span>
      <output
        className={`${styles.referenceValue} character-sheet-number-value character-sheet-number-value--compact`}
      >
        {formatDisplayValue(value)}
      </output>
    </div>
  );
}

function SelectField({
  ariaInvalid = false,
  label,
  onChange,
  options,
  value,
  visuallyHiddenLabel = false,
}: {
  ariaInvalid?: boolean;
  label: string;
  onChange: (value: string | null, trigger: HTMLSelectElement) => void;
  options: readonly CharacterSheetSelectOption[];
  value: string | null;
  visuallyHiddenLabel?: boolean;
}) {
  return (
    <label className={styles.selectField}>
      <span
        className={visuallyHiddenLabel ? styles.visuallyHidden : styles.label}
      >
        {label}
      </span>
      <select
        aria-invalid={ariaInvalid || undefined}
        className={styles.select}
        onChange={(event) =>
          onChange(event.target.value || null, event.currentTarget)
        }
        value={value ?? ""}
      >
        <option value="">
          {characterSheetDictionary.characterSheet.build.unselected}
        </option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  );
}

/** G7 direct-edit section for build choices, attributes, and references. */
export default function BuildSection({
  build,
  derived,
  hasIkizamaSkillLevelError,
  invalidOtherRyugiSkillLevelRowIds,
  hasPrimarySkillLevelError,
  ikizamaOptions,
  onAttributeChange,
  onAttributeCommit,
  onIkizamaChange,
  onIkizamaLevelChange,
  onOtherRyugiAdd,
  otherRyugiAddButtonRef,
  onOtherRyugiChange,
  onOtherRyugiCommit,
  onOtherRyugiRemove,
  onPrimaryRyugiChange,
  onPrimaryRyugiLevelChange,
  onPrimaryRyugiLevelCommit,
  ryugiOptions,
  unlockedCommonSkillBonusLevels,
}: BuildSectionProps) {
  const { characterSheet, gameDomain } = characterSheetDictionary;
  const buildCopy = gameDomain.terms;
  const buildUiCopy = characterSheet.build;

  return (
    <div className={styles.section} data-build-section>
      <section
        aria-invalid={
          derived.hasRyugiError ||
          hasPrimarySkillLevelError ||
          hasIkizamaSkillLevelError ||
          undefined
        }
        aria-label={buildUiCopy.ryugiAndIkizama}
        className={styles.buildPane}
        data-invalid={
          derived.hasRyugiError ||
          hasPrimarySkillLevelError ||
          hasIkizamaSkillLevelError ||
          undefined
        }
      >
        <div className={styles.choiceRow}>
          <SelectField
            ariaInvalid={derived.primaryRyugiDuplicate}
            label={buildCopy.primaryRyugi}
            onChange={onPrimaryRyugiChange}
            options={ryugiOptions}
            value={build.primaryRyugiId}
          />
          <div className={styles.levelField}>
            <span className={styles.label}>{buildCopy.level}</span>
            <BuildNumberInput
              ariaInvalid={derived.primaryRyugiLevelInvalid}
              label={`${buildCopy.primaryRyugi}${buildCopy.level}`}
              onChange={onPrimaryRyugiLevelChange}
              onCommit={onPrimaryRyugiLevelCommit}
              value={build.primaryRyugiLevel}
            />
          </div>
        </div>
        <div className={styles.choiceRow}>
          <SelectField
            label={buildCopy.ikizama}
            onChange={onIkizamaChange}
            options={ikizamaOptions}
            value={build.ikizamaId}
          />
          <div className={styles.levelField}>
            <span className={styles.label}>{buildCopy.level}</span>
            <BuildNumberInput
              ariaInvalid={derived.ikizamaLevelInvalid}
              label={`${buildCopy.ikizama}${buildCopy.level}`}
              onChange={onIkizamaLevelChange}
              onCommit={onIkizamaLevelChange}
              value={build.ikizamaLevel}
            />
          </div>
        </div>
        {build.otherRyugi.length > 0 ? (
          <div aria-hidden="true" className={styles.otherHeader}>
            <span>{buildCopy.otherRyugi}</span>
            <span>{buildCopy.level}</span>
          </div>
        ) : null}
        {build.otherRyugi.map((otherRyugi, index) => (
          <div className={styles.otherRow} key={otherRyugi.rowId}>
            <SelectField
              ariaInvalid={
                derived.otherRyugiDuplicateRowIds.includes(otherRyugi.rowId) ||
                invalidOtherRyugiSkillLevelRowIds.includes(otherRyugi.rowId)
              }
              label={`${buildCopy.otherRyugi}${index + 1}`}
              onChange={(value, trigger) =>
                onOtherRyugiChange(index, "ryugiId", value ?? "", trigger)
              }
              options={ryugiOptions}
              value={otherRyugi.ryugiId}
              visuallyHiddenLabel
            />
            <div className={styles.levelField}>
              <span className={styles.visuallyHidden}>{buildCopy.level}</span>
              <BuildNumberInput
                ariaInvalid={
                  derived.otherRyugiLevelInvalidRowIds.includes(
                    otherRyugi.rowId,
                  ) ||
                  invalidOtherRyugiSkillLevelRowIds.includes(otherRyugi.rowId)
                }
                label={`${buildCopy.otherRyugi}${index + 1}${buildCopy.level}`}
                onChange={(value) => onOtherRyugiChange(index, "level", value)}
                onCommit={(value) => onOtherRyugiCommit(index, value)}
                value={otherRyugi.level}
              />
            </div>
            <button
              aria-label={`${buildCopy.otherRyugi}${index + 1}${buildUiCopy.remove}`}
              className="character-sheet-remove-button character-sheet-remove-button--mobile-compact"
              onClick={(event) =>
                onOtherRyugiRemove(index, event.currentTarget)
              }
              type="button"
            >
              ×
            </button>
          </div>
        ))}
        <button
          className={styles.addButton}
          onClick={onOtherRyugiAdd}
          ref={otherRyugiAddButtonRef}
          type="button"
        >
          {buildUiCopy.addOtherRyugi}
        </button>
      </section>

      <section
        aria-label={buildCopy.attributes}
        className={styles.attributePane}
        data-invalid={derived.hasAttributeError || undefined}
      >
        <div className={styles.attributeMeta}>
          <span className={styles.attributeMetaItem}>
            <FormulaTooltip formula={buildUiCopy.formulas.points}>
              <span>{buildCopy.points}</span>
            </FormulaTooltip>
            <span>{`: ${formatDisplayValue(
              derived.ikizamaAttributePoints === null
                ? null
                : [...derived.ikizamaAttributePoints, 0].join(", "),
            )}`}</span>
          </span>
          <span className={styles.attributeMetaItem}>
            <FormulaTooltip formula={buildUiCopy.formulas.growthPoints}>
              <span>{buildCopy.growthPoints}</span>
            </FormulaTooltip>
            <span>{`: ${formatDisplayValue(derived.growthPoints)}`}</span>
          </span>
        </div>
        <div className={styles.attributeGrid}>
          <span className={styles.attributeHeader}>{buildCopy.attribute}</span>
          <span
            className={`${styles.attributeHeader} ${styles.stackedAttributeHeader}`}
          >
            <span>{buildCopy.base}</span>
            <span>{buildCopy.attributes}</span>
          </span>
          <span className={styles.pointsHeader}>
            <span>{buildCopy.attributes}</span>
            <span>{buildCopy.point}</span>
          </span>
          <span className={styles.attributeHeader}>{buildCopy.growth}</span>
          <FormulaTooltip
            ariaLabel={buildCopy.permanentModifier}
            formula={buildUiCopy.tooltips.permanentModifier}
          >
            <span
              className={`${styles.attributeHeader} ${styles.stackedAttributeHeader}`}
            >
              <span>{buildCopy.permanent}</span>
              <span>{buildCopy.modifier}</span>
            </span>
          </FormulaTooltip>
          <span
            className={`${styles.attributeHeader} ${styles.stackedAttributeHeader}`}
          >
            <span>{buildCopy.permanent}</span>
            <span>{buildCopy.attributes}</span>
          </span>
          <FormulaTooltip
            ariaLabel={buildCopy.temporaryModifier}
            formula={buildUiCopy.tooltips.temporaryModifier}
          >
            <span
              className={`${styles.attributeHeader} ${styles.stackedAttributeHeader}`}
            >
              <span>{buildCopy.temporary}</span>
              <span>{buildCopy.modifier}</span>
            </span>
          </FormulaTooltip>
          <span
            className={`${styles.attributeHeader} ${styles.stackedAttributeHeader}`}
          >
            <span>{buildCopy.temporary}</span>
            <span>{buildCopy.attributes}</span>
          </span>
          {attributeNames.map((attributeName) => {
            const values = build.attributes[attributeName];
            const derivedValues = derived.attributes[attributeName];

            return (
              <div className={styles.attributeRow} key={attributeName}>
                <span>{buildCopy.attributeNames[attributeName]}</span>
                <output className="character-sheet-number-value character-sheet-number-value--compact">
                  {formatDisplayValue(derivedValues.base)}
                </output>
                <BuildNumberInput
                  ariaInvalid={derived.hasPointAllocationError}
                  label={`${buildCopy.attributeNames[attributeName]}${buildCopy.points}`}
                  onChange={(value) =>
                    onAttributeChange(attributeName, "points", value)
                  }
                  onCommit={(value) =>
                    onAttributeCommit(attributeName, "points", value)
                  }
                  value={values.points}
                />
                <BuildNumberInput
                  ariaInvalid={derived.hasGrowthError}
                  label={`${buildCopy.attributeNames[attributeName]}${buildCopy.growth}`}
                  onChange={(value) =>
                    onAttributeChange(attributeName, "growth", value)
                  }
                  onCommit={(value) =>
                    onAttributeCommit(attributeName, "growth", value)
                  }
                  value={values.growth}
                />
                <BuildNumberInput
                  label={`${buildCopy.attributeNames[attributeName]}${buildCopy.permanentModifier}`}
                  onChange={(value) =>
                    onAttributeChange(attributeName, "permanentModifier", value)
                  }
                  onCommit={(value) =>
                    onAttributeCommit(attributeName, "permanentModifier", value)
                  }
                  value={values.permanentModifier}
                />
                <output className="character-sheet-number-value character-sheet-number-value--compact">
                  {formatDisplayValue(derivedValues.permanent)}
                </output>
                <BuildNumberInput
                  label={`${buildCopy.attributeNames[attributeName]}${buildCopy.temporaryModifier}`}
                  onChange={(value) =>
                    onAttributeChange(attributeName, "temporaryModifier", value)
                  }
                  onCommit={(value) =>
                    onAttributeCommit(attributeName, "temporaryModifier", value)
                  }
                  value={values.temporaryModifier}
                />
                <output className="character-sheet-number-value character-sheet-number-value--compact">
                  {formatDisplayValue(derivedValues.temporary)}
                </output>
              </div>
            );
          })}
        </div>
      </section>
      <section
        aria-label={buildCopy.commonSkillBonuses}
        className={styles.referencePane}
      >
        <div className={styles.referenceGrid}>
          <ReferenceMetric
            label={buildCopy.healthIncrease}
            value={derived.reference.primaryHealthIncrease}
          />
          <ReferenceMetric
            label={buildCopy.mindIncrease}
            value={derived.reference.primaryMindIncrease}
          />
          <ReferenceMetric
            label={buildCopy.healthCoefficient}
            value={derived.reference.ikizamaHealthCoefficient}
          />
          <ReferenceMetric
            label={buildCopy.mindCoefficient}
            value={derived.reference.ikizamaMindCoefficient}
          />
        </div>
        <div className={styles.commonSkillBonuses}>
          <span className={styles.commonSkillTitle}>
            {buildCopy.commonSkillBonuses}
          </span>
          <div
            className={styles.commonSkillBonusGrid}
            data-common-skill-bonus-grid
          >
            {(
              [
                [
                  2,
                  buildCopy.level2CommonSkillBonus,
                  derived.reference.commonSkillBonuses?.level2,
                ],
                [
                  5,
                  buildCopy.level5CommonSkillBonus,
                  derived.reference.commonSkillBonuses?.level5,
                ],
                [
                  9,
                  buildCopy.level9CommonSkillBonus,
                  derived.reference.commonSkillBonuses?.level9,
                ],
              ] as const
            ).map(([requiredLevel, label, content]) => (
              <div
                className={`${styles.commonSkillBonus} ${
                  unlockedCommonSkillBonusLevels.includes(requiredLevel)
                    ? styles.commonSkillBonusUnlocked
                    : ""
                }`}
                key={label}
              >
                <span>{label}</span>
                <span>{formatDisplayValue(content)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
