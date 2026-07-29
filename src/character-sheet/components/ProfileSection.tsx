import {
  type ChangeEvent,
  type DragEvent,
  type MouseEvent,
  type ReactNode,
  useRef,
  useState,
} from "react";

import {
  type CharacterImageRecord,
  characterImageDataUrl,
} from "../character-image";
import { characterSheetDictionary } from "../dictionary";
import type {
  CreditFieldName,
  CreditValues,
  ProfileFieldName,
  ProfileValues,
} from "../form-values";
import { formatDisplayValue } from "../format-display-value";
import type { BuildDerivedValues } from "../logic/build";
import type { CreditSummary } from "../logic/credit";
import FormulaTooltip from "./FormulaTooltip";
import styles from "./ProfileSection.module.css";

type TextFieldProps = {
  label: string;
  name: Exclude<ProfileFieldName, "setting">;
  onChange: (
    field: Exclude<ProfileFieldName, "setting">,
    value: string,
  ) => void;
  value: string;
};

type CreditFieldProps = {
  allowNegative?: boolean;
  label: string;
  name: CreditFieldName;
  onBlur: (field: CreditFieldName, value: string) => number;
  onChange: (field: CreditFieldName, value: string) => void;
  value: number;
};

type ReadOnlyCreditFieldProps = {
  ariaLabel?: string;
  formula?: string;
  invalid?: boolean;
  label: ReactNode;
  value: number | string;
};

type ExperienceProps = {
  acquired: number;
  derived: Pick<
    BuildDerivedValues,
    "hasExperienceError" | "rank" | "remainingExperience" | "spentExperience"
  >;
  hasCommonSkillLevelError: boolean;
  commonSkillLevelLimit: number;
  commonSkillLevelTotal: number;
  onAcquiredChange: (value: string) => number;
};

export type ProfileSectionProps = {
  characterImage: CharacterImageRecord | null;
  credit: CreditValues;
  creditSummary: CreditSummary;
  experience: ExperienceProps;
  isRootOperationInProgress: boolean;
  onCharacterImageCleared: () => Promise<void>;
  onCharacterImageSelected: (file: File) => Promise<void>;
  onCharacterImageOperationStarted: (trigger: HTMLButtonElement) => void;
  onCreditBlur: (field: CreditFieldName, value: string) => number;
  onCreditChange: (field: CreditFieldName, value: string) => void;
  onProfileChange: (field: ProfileFieldName, value: string) => void;
  profile: ProfileValues;
  spentCredit?: number;
};

type CharacterImageFieldProps = {
  image: CharacterImageRecord | null;
  isRootOperationInProgress: boolean;
  onImageCleared: () => Promise<void>;
  onImageSelected: (file: File) => Promise<void>;
  onImageOperationStarted: (trigger: HTMLButtonElement) => void;
};

function CharacterImageField({
  image,
  isRootOperationInProgress,
  onImageCleared,
  onImageSelected,
  onImageOperationStarted,
}: CharacterImageFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { image: imageCopy } = characterSheetDictionary.characterSheet;

  function selectFile(event: MouseEvent<HTMLButtonElement>): void {
    onImageOperationStarted(event.currentTarget);
    fileInputRef.current?.click();
  }

  function receiveFile(file: File | undefined): void {
    if (file !== undefined) {
      void onImageSelected(file);
    }
  }

  function onFileInputChange(event: ChangeEvent<HTMLInputElement>): void {
    receiveFile(event.currentTarget.files?.[0]);
    event.currentTarget.value = "";
  }

  function onDrop(event: DragEvent<HTMLButtonElement>): void {
    event.preventDefault();
    onImageOperationStarted(event.currentTarget);
    receiveFile(event.dataTransfer.files[0]);
  }

  return (
    <div className={styles.imageField}>
      <button
        aria-label={
          image === null
            ? imageCopy.chooseFileOrDrop
            : imageCopy.replaceFileOrDrop
        }
        className={styles.imageDropZone}
        disabled={isRootOperationInProgress}
        onClick={selectFile}
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
        type="button"
      >
        {image === null ? (
          <span className={styles.imageEmptyState}>
            <span aria-hidden="true" className={styles.imagePlus}>
              +
            </span>
            <span>{imageCopy.description}</span>
            <span className={styles.imageLimit}>{imageCopy.limit}</span>
          </span>
        ) : (
          <img
            alt={imageCopy.preview}
            className={styles.imagePreview}
            src={characterImageDataUrl(image)}
          />
        )}
      </button>
      <input
        accept="image/*"
        className={styles.fileInput}
        onChange={onFileInputChange}
        ref={fileInputRef}
        tabIndex={-1}
        type="file"
      />
      <button
        className={`${styles.imageSelectButton} character-sheet-add-button`}
        disabled={isRootOperationInProgress}
        onClick={selectFile}
        type="button"
      >
        {image === null ? imageCopy.chooseFile : imageCopy.replaceFile}
      </button>
      {image !== null ? (
        <button
          className={styles.imageClearButton}
          disabled={isRootOperationInProgress}
          onClick={(event) => {
            onImageOperationStarted(event.currentTarget);
            void onImageCleared();
          }}
          type="button"
        >
          {imageCopy.clearFile}
        </button>
      ) : null}
    </div>
  );
}

function TextField({ label, name, onChange, value }: TextFieldProps) {
  const id = `character-sheet-profile-${name}`;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <input
        className={styles.textInput}
        id={id}
        onChange={(event) => onChange(name, event.target.value)}
        type="text"
        value={value}
      />
    </div>
  );
}

function CreditField({
  allowNegative = false,
  label,
  name,
  onBlur,
  onChange,
  value,
}: CreditFieldProps) {
  const id = `character-sheet-credit-${name}`;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <input
        className={styles.numberInput}
        defaultValue={value}
        id={id}
        min={allowNegative ? undefined : 0}
        onBlur={(event) => {
          event.currentTarget.value = String(
            onBlur(name, event.currentTarget.value),
          );
        }}
        onChange={(event) => {
          if (event.target.validity.badInput) {
            return;
          }

          onChange(name, event.target.value);
        }}
        step="1"
        type="number"
      />
    </div>
  );
}

function ReadOnlyCreditField({
  ariaLabel,
  formula,
  invalid = false,
  label,
  value,
}: ReadOnlyCreditFieldProps) {
  const id = `character-sheet-${ariaLabel ?? "metric"}`;
  const labelContent = <span className={styles.metricLabel}>{label}</span>;

  return (
    <div className={styles.metric} data-invalid={invalid || undefined}>
      {formula === undefined ? (
        labelContent
      ) : (
        <FormulaTooltip
          ariaLabel={ariaLabel}
          className={styles.metricTooltip}
          formula={formula}
        >
          {labelContent}
        </FormulaTooltip>
      )}
      <output
        aria-invalid={invalid || undefined}
        className={`${styles.metricValue} character-sheet-number-value`}
        id={id}
      >
        {value}
      </output>
    </div>
  );
}

function ExperienceField({
  acquired,
  commonSkillLevelLimit,
  commonSkillLevelTotal,
  derived,
  hasCommonSkillLevelError,
  onAcquiredChange,
}: ExperienceProps) {
  const { characterSheet, gameDomain } = characterSheetDictionary;
  const buildCopy = gameDomain.terms;
  const skillCopy = characterSheet.skills;

  return (
    <section
      aria-label={buildCopy.experience}
      className={styles.experience}
      data-invalid={derived.hasExperienceError || undefined}
    >
      <div className={styles.experienceGrid}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="character-sheet-experience">
            {buildCopy.acquiredExperience}
          </label>
          <input
            aria-invalid={derived.hasExperienceError || undefined}
            className={styles.numberInput}
            defaultValue={acquired}
            id="character-sheet-experience"
            onBlur={(event) => {
              event.currentTarget.value = String(
                onAcquiredChange(event.currentTarget.value),
              );
            }}
            onChange={(event) => {
              if (!event.currentTarget.validity.badInput) {
                onAcquiredChange(event.currentTarget.value);
              }
            }}
            step="1"
            type="number"
          />
        </div>
        <ReadOnlyCreditField
          ariaLabel={buildCopy.spentExperience}
          label={buildCopy.spentExperience}
          value={formatDisplayValue(derived.spentExperience)}
        />
        <ReadOnlyCreditField
          ariaLabel={buildCopy.remainingExperience}
          label={buildCopy.remainingExperience}
          value={formatDisplayValue(derived.remainingExperience)}
        />
        <ReadOnlyCreditField
          ariaLabel={buildCopy.rank}
          formula={characterSheet.build.formulas.rank}
          label={buildCopy.rank}
          value={formatDisplayValue(derived.rank)}
        />
        <ReadOnlyCreditField
          ariaLabel={skillCopy.commonSkillSummaryLabel}
          formula={skillCopy.commonSkillLevelLimitFormula}
          invalid={hasCommonSkillLevelError}
          label={
            <>
              共通スキルレベル合計
              <br className={styles.commonSkillLabelBreak} />
              ／共通スキル上限
            </>
          }
          value={`${commonSkillLevelTotal}／${commonSkillLevelLimit}`}
        />
      </div>
    </section>
  );
}

/** Basic profile and credit fields controlled by the containing presenter. */
export default function ProfileSection({
  characterImage,
  credit,
  creditSummary,
  experience,
  isRootOperationInProgress,
  onCharacterImageCleared,
  onCharacterImageSelected,
  onCharacterImageOperationStarted,
  onCreditBlur,
  onCreditChange,
  onProfileChange,
  profile,
  spentCredit = 0,
}: ProfileSectionProps) {
  const [isSettingExpanded, setIsSettingExpanded] = useState(false);
  const settingContentId = "character-sheet-setting-content";
  const { characterSheet, gameDomain } = characterSheetDictionary;
  const { credit: creditTerms } = gameDomain.terms;

  return (
    <div className={styles.section}>
      <div className={styles.profileAndImage}>
        <div className={styles.profileDetails}>
          <div className={styles.profileGrid}>
            <div className={styles.profileField}>
              <TextField
                label={gameDomain.terms.pcName}
                name="pcName"
                onChange={onProfileChange}
                value={profile.pcName}
              />
            </div>
            <div className={styles.profileField}>
              <TextField
                label={gameDomain.terms.playerName}
                name="playerName"
                onChange={onProfileChange}
                value={profile.playerName}
              />
            </div>
            <div className={styles.profileField}>
              <TextField
                label={characterSheet.profile.nickname}
                name="nickname"
                onChange={onProfileChange}
                value={profile.nickname}
              />
            </div>
            <div className={styles.ageAndGender}>
              <TextField
                label={characterSheet.profile.age}
                name="age"
                onChange={onProfileChange}
                value={profile.age}
              />
              <TextField
                label={characterSheet.profile.gender}
                name="gender"
                onChange={onProfileChange}
                value={profile.gender}
              />
            </div>
          </div>
          <div className={styles.setting}>
            <button
              aria-controls={settingContentId}
              aria-expanded={isSettingExpanded}
              className={styles.settingToggle}
              onClick={() => setIsSettingExpanded((expanded) => !expanded)}
              type="button"
            >
              <span>{characterSheet.profile.setting}</span>
              <span aria-hidden="true" className={styles.chevron} />
            </button>
            <div hidden={!isSettingExpanded} id={settingContentId}>
              <textarea
                aria-label={characterSheet.profile.setting}
                className={styles.settingInput}
                id="character-sheet-setting"
                onChange={(event) =>
                  onProfileChange("setting", event.target.value)
                }
                value={profile.setting}
              />
            </div>
          </div>
        </div>
        <CharacterImageField
          image={characterImage}
          isRootOperationInProgress={isRootOperationInProgress}
          onImageCleared={onCharacterImageCleared}
          onImageSelected={onCharacterImageSelected}
          onImageOperationStarted={onCharacterImageOperationStarted}
        />
      </div>
      <section
        aria-label={creditTerms.name}
        className={styles.credit}
        data-invalid={creditSummary.hasCreditError || undefined}
      >
        <div className={styles.creditGrid}>
          <CreditField
            label={creditTerms.acquired}
            name="acquired"
            onBlur={onCreditBlur}
            onChange={onCreditChange}
            value={credit.acquired}
          />
          <CreditField
            label={creditTerms.provided}
            name="provided"
            onBlur={onCreditBlur}
            onChange={onCreditChange}
            value={credit.provided}
          />
          <CreditField
            label={creditTerms.received}
            name="received"
            onBlur={onCreditBlur}
            onChange={onCreditChange}
            value={credit.received}
          />
          <ReadOnlyCreditField
            formula={characterSheet.credit.formulas.total}
            label={creditTerms.total}
            value={creditSummary.totalCredit}
          />
          <ReadOnlyCreditField
            formula={characterSheet.credit.formulas.consumed}
            label={creditTerms.consumed}
            invalid={creditSummary.hasCreditError}
            value={spentCredit}
          />
          <CreditField
            allowNegative
            label={creditTerms.changeAdjustment}
            name="changeAdjustment"
            onBlur={onCreditBlur}
            onChange={onCreditChange}
            value={credit.changeAdjustment}
          />
          <ReadOnlyCreditField
            formula={characterSheet.credit.formulas.change}
            label={creditTerms.change}
            value={creditSummary.change}
          />
        </div>
      </section>
      <ExperienceField {...experience} />
    </div>
  );
}
