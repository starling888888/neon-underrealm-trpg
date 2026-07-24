import { useEffect, useRef, useState } from "react";

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
  onBlur: (field: CreditFieldName, value: string) => void;
  onChange: (
    field: CreditFieldName,
    value: string,
    isInvalidNumber: boolean,
  ) => void;
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused && inputRef.current !== null) {
      inputRef.current.value = String(value);
    }
  }, [isFocused, value]);

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
          setIsFocused(false);
          onBlur(name, event.target.value);
        }}
        onChange={(event) => {
          if (event.target.validity.badInput) {
            return;
          }

          onChange(name, event.target.value, false);
        }}
        onFocus={() => setIsFocused(true)}
        ref={inputRef}
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

  return (
    <div className={styles.section}>
      <div className={styles.profileGrid}>
        <div className={styles.profileField}>
          <TextField
            label="PC名"
            name="pcName"
            onChange={onProfileChange}
            value={profile.pcName}
          />
        </div>
        <div className={styles.profileField}>
          <TextField
            label="PL名"
            name="playerName"
            onChange={onProfileChange}
            value={profile.playerName}
          />
        </div>
        <div className={styles.profileField}>
          <TextField
            label="二つ名"
            name="nickname"
            onChange={onProfileChange}
            value={profile.nickname}
          />
        </div>
        <div className={styles.ageAndGender}>
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
          <textarea
            aria-label="設定"
            className={styles.settingInput}
            id="character-sheet-setting"
            onChange={(event) => onProfileChange("setting", event.target.value)}
            value={profile.setting}
          />
        </div>
      </div>
      <section aria-label="信用" className={styles.credit}>
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
            formula="取得信用 + 融通された信用 - 融通した信用"
            label="合計信用"
            value={creditSummary.totalCredit}
          />
          <ReadOnlyCreditField
            formula="選択した全アイテムの信用の合計（ドラッグは信用 × 所持セット数）"
            label="消費信用"
            value={0}
          />
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
    </div>
  );
}
