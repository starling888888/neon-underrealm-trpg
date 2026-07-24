import { useState } from "react";
import { useController, useFormContext, useWatch } from "react-hook-form";

import {
  type CharacterSheetFormValues,
  characterSheetDefaultValues,
} from "../form-values";
import { calculateCredit, normalizeCreditInput } from "../logic/credit";
import styles from "./ProfileSection.module.css";

type TextFieldProps = {
  label: string;
  name: "pcName" | "playerName" | "nickname" | "age" | "gender";
};

type CreditFieldProps = {
  allowNegative?: boolean;
  label: string;
  name:
    | "acquiredCredit"
    | "creditProvided"
    | "creditReceived"
    | "changeAdjustment";
};

type ReadOnlyCreditFieldProps = {
  formula?: string;
  label: string;
  value: number;
};

function TextField({ label, name }: TextFieldProps) {
  const { register } = useFormContext<CharacterSheetFormValues>();
  const id = `character-sheet-${name}`;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <input
        className={styles.textInput}
        id={id}
        type="text"
        {...register(name)}
      />
    </div>
  );
}

function CreditField({ allowNegative = false, label, name }: CreditFieldProps) {
  const { control } = useFormContext<CharacterSheetFormValues>();
  const { field } = useController({ control, name });
  const id = `character-sheet-${name}`;

  const normalizeFieldValue = (value: string) => {
    const normalizedValue = normalizeCreditInput(value, allowNegative);

    field.onChange(normalizedValue);
    return normalizedValue;
  };

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <input
        className={styles.numberInput}
        defaultValue={field.value}
        id={id}
        min={allowNegative ? undefined : 0}
        name={field.name}
        onBlur={(event) => {
          const normalizedValue = normalizeFieldValue(event.target.value);

          event.target.value = String(normalizedValue);
          field.onBlur();
        }}
        onChange={(event) => {
          if (allowNegative && event.target.validity.badInput) {
            return;
          }

          const normalizedValue = normalizeFieldValue(event.target.value);

          event.target.value = String(normalizedValue);
        }}
        ref={field.ref}
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

/** Basic profile and credit fields owned by the character-sheet RHF form. */
export default function ProfileSection() {
  const { control, register } = useFormContext<CharacterSheetFormValues>();
  const [isSettingExpanded, setIsSettingExpanded] = useState(false);
  const acquiredCredit = useWatch({
    control,
    defaultValue: characterSheetDefaultValues.acquiredCredit,
    name: "acquiredCredit",
  });
  const creditProvided = useWatch({
    control,
    defaultValue: characterSheetDefaultValues.creditProvided,
    name: "creditProvided",
  });
  const creditReceived = useWatch({
    control,
    defaultValue: characterSheetDefaultValues.creditReceived,
    name: "creditReceived",
  });
  const changeAdjustment = useWatch({
    control,
    defaultValue: characterSheetDefaultValues.changeAdjustment,
    name: "changeAdjustment",
  });
  const credit = calculateCredit({
    acquiredCredit,
    changeAdjustment,
    creditProvided,
    creditReceived,
    spentCredit: 0,
  });
  const settingContentId = "character-sheet-setting-content";

  return (
    <section
      aria-labelledby="character-sheet-profile-heading"
      className={styles.section}
    >
      <h2 id="character-sheet-profile-heading">基本情報</h2>
      <div className={styles.profileGrid}>
        <TextField label="PC名" name="pcName" />
        <TextField label="PL名" name="playerName" />
        <TextField label="二つ名" name="nickname" />
        <TextField label="年齢" name="age" />
        <TextField label="性別" name="gender" />
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
            {...register("characterSetting")}
          />
        </div>
      </div>
      <section
        aria-labelledby="character-sheet-credit-heading"
        className={styles.credit}
      >
        <h3 id="character-sheet-credit-heading">信用</h3>
        <div className={styles.creditGrid}>
          <CreditField label="取得信用" name="acquiredCredit" />
          <CreditField label="融通した" name="creditProvided" />
          <CreditField label="融通された" name="creditReceived" />
          <ReadOnlyCreditField
            formula="取得信用 + 融通された - 融通した"
            label="合計信用"
            value={credit.totalCredit}
          />
          <ReadOnlyCreditField label="消費信用" value={0} />
          <CreditField allowNegative label="小銭修正" name="changeAdjustment" />
          <ReadOnlyCreditField
            formula="合計信用 - 消費信用 + 小銭修正"
            label="小銭"
            value={credit.change}
          />
        </div>
      </section>
    </section>
  );
}
