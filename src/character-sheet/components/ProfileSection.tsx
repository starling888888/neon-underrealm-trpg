import { useState } from "react";

import { characterSheetDictionary } from "../dictionary";
import type {
  CreditFieldName,
  CreditValues,
  ProfileFieldName,
  ProfileValues,
} from "../form-values";
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
  formula: string;
  label: string;
  value: number;
};

export type ProfileSectionProps = {
  credit: CreditValues;
  creditSummary: CreditSummary;
  onCreditBlur: (field: CreditFieldName, value: string) => number;
  onCreditChange: (field: CreditFieldName, value: string) => void;
  onProfileChange: (field: ProfileFieldName, value: string) => void;
  profile: ProfileValues;
};

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
  formula,
  label,
  value,
}: ReadOnlyCreditFieldProps) {
  const id = `character-sheet-${label}`;

  return (
    <div className={styles.metric}>
      <FormulaTooltip formula={formula}>
        <span>
          <span className={styles.metricLabel}>{label}</span>
          <output className={styles.metricValue} id={id}>
            {value}
          </output>
        </span>
      </FormulaTooltip>
    </div>
  );
}

/** Basic profile and credit fields controlled by the containing presenter. */
export default function ProfileSection({
  credit,
  creditSummary,
  onCreditBlur,
  onCreditChange,
  onProfileChange,
  profile,
}: ProfileSectionProps) {
  const [isSettingExpanded, setIsSettingExpanded] = useState(false);
  const settingContentId = "character-sheet-setting-content";
  const { characterSheet, gameDomain } = characterSheetDictionary;
  const { credit: creditTerms } = gameDomain.terms;

  return (
    <div className={styles.section}>
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
            onChange={(event) => onProfileChange("setting", event.target.value)}
            value={profile.setting}
          />
        </div>
      </div>
      <section aria-label={creditTerms.name} className={styles.credit}>
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
            formula={creditTerms.formulas.total}
            label={creditTerms.total}
            value={creditSummary.totalCredit}
          />
          <ReadOnlyCreditField
            formula={creditTerms.formulas.consumed}
            label={creditTerms.consumed}
            value={0}
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
            formula={creditTerms.formulas.change}
            label={creditTerms.change}
            value={creditSummary.change}
          />
        </div>
      </section>
    </div>
  );
}
