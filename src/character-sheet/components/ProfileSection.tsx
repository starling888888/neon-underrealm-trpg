import { useState } from "react";

import type {
  CreditFieldName,
  CreditValues,
  ProfileFieldName,
  ProfileValues,
} from "../form-values";
import type { CreditSummary } from "../logic/credit";
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
  onBlur: (field: CreditFieldName, value: string) => void;
  onChange: (
    field: CreditFieldName,
    value: string,
    isInvalidNumber: boolean,
  ) => void;
  value: number;
};

type ReadOnlyCreditFieldProps = {
  formula?: string;
  label: string;
  value: number;
};

export type ProfileSectionProps = {
  credit: CreditValues;
  creditSummary: CreditSummary;
  onCreditBlur: (field: CreditFieldName, value: string) => void;
  onCreditChange: (
    field: CreditFieldName,
    value: string,
    isInvalidNumber: boolean,
  ) => void;
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
        id={id}
        min={allowNegative ? undefined : 0}
        onBlur={(event) => onBlur(name, event.target.value)}
        onChange={(event) =>
          onChange(name, event.target.value, event.target.validity.badInput)
        }
        step="1"
        type="number"
        value={value}
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
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {formula === undefined ? null : (
          <span className={styles.formula}>{formula}</span>
        )}
      </label>
      <input
        aria-readonly="true"
        className={styles.numberInput}
        id={id}
        readOnly
        type="number"
        value={value}
      />
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

  return (
    <section
      aria-labelledby="character-sheet-profile-heading"
      className={styles.section}
    >
      <h2 id="character-sheet-profile-heading">基本情報</h2>
      <div className={styles.profileGrid}>
        <TextField
          label="PC名"
          name="pcName"
          onChange={onProfileChange}
          value={profile.pcName}
        />
        <TextField
          label="PL名"
          name="playerName"
          onChange={onProfileChange}
          value={profile.playerName}
        />
        <TextField
          label="二つ名"
          name="nickname"
          onChange={onProfileChange}
          value={profile.nickname}
        />
        <TextField
          label="年齢"
          name="age"
          onChange={onProfileChange}
          value={profile.age}
        />
        <TextField
          label="性別"
          name="gender"
          onChange={onProfileChange}
          value={profile.gender}
        />
      </div>
      <div className={styles.setting}>
        <button
          aria-controls={settingContentId}
          aria-expanded={isSettingExpanded}
          className={styles.settingToggle}
          onClick={() => setIsSettingExpanded((expanded) => !expanded)}
          type="button"
        >
          <span>設定</span>
          <span aria-hidden="true" className={styles.chevron} />
        </button>
        <div hidden={!isSettingExpanded} id={settingContentId}>
          <label className={styles.label} htmlFor="character-sheet-setting">
            設定
          </label>
          <textarea
            className={styles.settingInput}
            id="character-sheet-setting"
            onChange={(event) => onProfileChange("setting", event.target.value)}
            value={profile.setting}
          />
        </div>
      </div>
      <section
        aria-labelledby="character-sheet-credit-heading"
        className={styles.credit}
      >
        <h3 id="character-sheet-credit-heading">信用</h3>
        <div className={styles.creditGrid}>
          <CreditField
            label="取得信用"
            name="acquired"
            onBlur={onCreditBlur}
            onChange={onCreditChange}
            value={credit.acquired}
          />
          <CreditField
            label="融通した"
            name="provided"
            onBlur={onCreditBlur}
            onChange={onCreditChange}
            value={credit.provided}
          />
          <CreditField
            label="融通された"
            name="received"
            onBlur={onCreditBlur}
            onChange={onCreditChange}
            value={credit.received}
          />
          <ReadOnlyCreditField
            formula="取得信用 + 融通された - 融通した"
            label="合計信用"
            value={creditSummary.totalCredit}
          />
          <ReadOnlyCreditField label="消費信用" value={0} />
          <CreditField
            allowNegative
            label="小銭修正"
            name="changeAdjustment"
            onBlur={onCreditBlur}
            onChange={onCreditChange}
            value={credit.changeAdjustment}
          />
          <ReadOnlyCreditField
            formula="合計信用 - 消費信用 + 小銭修正"
            label="小銭"
            value={creditSummary.change}
          />
        </div>
      </section>
    </section>
  );
}
