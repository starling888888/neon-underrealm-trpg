import { characterSheetDictionary } from "../dictionary";
import type {
  AttributeName,
  AttributeValues,
  BuildValues,
  OtherRyugiValues,
} from "../form-values";
import type { BuildDerivedValues } from "../logic/build";
import type { CharacterSheetSelectOption } from "../master-data/build";
import styles from "./BuildSection.module.css";

type BuildNumberInputProps = {
  ariaInvalid?: boolean;
  label: string;
  onChange: (value: string) => void;
  onCommit: (value: string) => number;
  value: number;
};

type ReadOnlyMetricProps = {
  label: string;
  value: number | null;
};

export type BuildSectionProps = {
  build: BuildValues;
  derived: BuildDerivedValues;
  ikizamaOptions: readonly CharacterSheetSelectOption[];
  onAcquiredExperienceChange: (value: string) => number;
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
  onIkizamaChange: (id: string | null) => void;
  onIkizamaLevelChange: (value: string) => number;
  onOtherRyugiAdd: () => void;
  onOtherRyugiChange: (
    index: number,
    field: keyof OtherRyugiValues,
    value: string,
  ) => void;
  onOtherRyugiCommit: (index: number, value: string) => number;
  onOtherRyugiRemove: (index: number) => void;
  onPrimaryRyugiChange: (id: string | null) => void;
  onPrimaryRyugiLevelChange: (value: string) => void;
  onPrimaryRyugiLevelCommit: (value: string) => number;
  ryugiOptions: readonly CharacterSheetSelectOption[];
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

function ReadOnlyMetric({ label, value }: ReadOnlyMetricProps) {
  return (
    <div className={styles.metric}>
      <span className={styles.metricLabel}>{label}</span>
      <output className={styles.metricValue}>{value ?? "—"}</output>
    </div>
  );
}

function SelectField({
  ariaInvalid = false,
  label,
  onChange,
  options,
  value,
}: {
  ariaInvalid?: boolean;
  label: string;
  onChange: (value: string | null) => void;
  options: readonly CharacterSheetSelectOption[];
  value: string | null;
}) {
  return (
    <label className={styles.selectField}>
      <span className={styles.label}>{label}</span>
      <select
        aria-invalid={ariaInvalid || undefined}
        className={styles.select}
        onChange={(event) => onChange(event.target.value || null)}
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

/** G7 direct-edit section for build, attributes, and experience. */
export default function BuildSection({
  build,
  derived,
  ikizamaOptions,
  onAcquiredExperienceChange,
  onAttributeChange,
  onAttributeCommit,
  onIkizamaChange,
  onIkizamaLevelChange,
  onOtherRyugiAdd,
  onOtherRyugiChange,
  onOtherRyugiCommit,
  onOtherRyugiRemove,
  onPrimaryRyugiChange,
  onPrimaryRyugiLevelChange,
  onPrimaryRyugiLevelCommit,
  ryugiOptions,
}: BuildSectionProps) {
  const { build: buildCopy } = characterSheetDictionary.characterSheet;

  return (
    <div className={styles.section}>
      <section
        aria-label={buildCopy.ryugiAndIkizama}
        className={styles.buildPane}
        data-invalid={derived.hasRyugiError || undefined}
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
        {build.otherRyugi.map((otherRyugi, index) => (
          <div className={styles.otherRow} key={otherRyugi.rowId}>
            <SelectField
              ariaInvalid={derived.otherRyugiDuplicateRowIds.includes(
                otherRyugi.rowId,
              )}
              label={`${buildCopy.otherRyugi}${index + 1}`}
              onChange={(value) =>
                onOtherRyugiChange(index, "ryugiId", value ?? "")
              }
              options={ryugiOptions}
              value={otherRyugi.ryugiId}
            />
            <div className={styles.levelField}>
              <span className={styles.label}>{buildCopy.level}</span>
              <BuildNumberInput
                ariaInvalid={derived.otherRyugiLevelInvalidRowIds.includes(
                  otherRyugi.rowId,
                )}
                label={`${buildCopy.otherRyugi}${index + 1}${buildCopy.level}`}
                onChange={(value) => onOtherRyugiChange(index, "level", value)}
                onCommit={(value) => onOtherRyugiCommit(index, value)}
                value={otherRyugi.level}
              />
            </div>
            <button
              aria-label={`${buildCopy.otherRyugi}${index + 1}${buildCopy.remove}`}
              className={styles.removeButton}
              onClick={() => onOtherRyugiRemove(index)}
              type="button"
            >
              ×
            </button>
          </div>
        ))}
        <button
          className={styles.addButton}
          onClick={onOtherRyugiAdd}
          type="button"
        >
          {buildCopy.addOtherRyugi}
        </button>
      </section>

      <section
        aria-label={buildCopy.attributes}
        className={styles.attributePane}
        data-invalid={derived.hasAttributeError || undefined}
      >
        <div className={styles.attributeMeta}>
          <span>{`${derived.ikizamaName ?? buildCopy.ikizama}：${buildCopy.points}: ${[
            ...derived.ikizamaAttributePoints,
            ...(derived.ikizamaName === null ? [] : [0]),
          ].join(", ")}`}</span>
          <span>{`${buildCopy.growthPoints}: ${derived.growthPoints ?? "—"}`}</span>
        </div>
        <div className={styles.attributeGrid}>
          <span>{buildCopy.attribute}</span>
          <span>{buildCopy.base}</span>
          <span>{buildCopy.points}</span>
          <span>{buildCopy.growth}</span>
          <span>{buildCopy.permanentModifier}</span>
          <span>{buildCopy.permanent}</span>
          <span>{buildCopy.temporaryModifier}</span>
          <span>{buildCopy.temporary}</span>
          {Object.entries(build.attributes).map(([attribute, values]) => {
            const attributeName = attribute as AttributeName;
            const derivedValues = derived.attributes[attributeName];

            return (
              <div className={styles.attributeRow} key={attributeName}>
                <span>{buildCopy.attributeNames[attributeName]}</span>
                <output>{derivedValues.base ?? "—"}</output>
                <BuildNumberInput
                  ariaInvalid={derived.hasAttributeError}
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
                  ariaInvalid={derived.hasAttributeError}
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
                <output>{derivedValues.permanent ?? "—"}</output>
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
                <output>{derivedValues.temporary ?? "—"}</output>
              </div>
            );
          })}
        </div>
      </section>

      <section
        aria-label={buildCopy.experience}
        className={styles.experience}
        data-invalid={derived.hasExperienceError || undefined}
      >
        <div className={styles.experienceInput}>
          <span className={styles.label}>{buildCopy.acquiredExperience}</span>
          <BuildNumberInput
            ariaInvalid={derived.hasExperienceError}
            label={buildCopy.acquiredExperience}
            onChange={onAcquiredExperienceChange}
            onCommit={onAcquiredExperienceChange}
            value={build.acquiredExperience}
          />
        </div>
        <ReadOnlyMetric
          label={buildCopy.spentExperience}
          value={derived.spentExperience}
        />
        <ReadOnlyMetric
          label={buildCopy.remainingExperience}
          value={derived.remainingExperience}
        />
        <ReadOnlyMetric label={buildCopy.rank} value={derived.rank} />
      </section>
    </div>
  );
}
