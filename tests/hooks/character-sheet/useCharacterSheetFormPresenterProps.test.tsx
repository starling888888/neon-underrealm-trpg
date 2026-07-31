// @vitest-environment jsdom

import { zodResolver } from "@hookform/resolvers/zod";
import { act, renderHook } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";

import useCharacterSheetFormPresenterProps from "../../../src/character-sheet/form/useCharacterSheetFormPresenterProps";
import type { CharacterSheetFormValues } from "../../../src/character-sheet/form-values";
import { characterSheetDefaultValues } from "../../../src/character-sheet/form-values";
import { getCommonSkillCandidates } from "../../../src/character-sheet/master-data/common-skills";
import { getDrugs } from "../../../src/character-sheet/master-data/drugs";
import { getIkizamaSkillGroups } from "../../../src/character-sheet/master-data/ikizama-skills";
import { getOmamori } from "../../../src/character-sheet/master-data/omamori";
import { getOtherRyugiSkillGroups } from "../../../src/character-sheet/master-data/other-ryugi-skills";
import { getPrimarySkillGroups } from "../../../src/character-sheet/master-data/primary-skills";
import { characterSheetFormSchema } from "../../../src/character-sheet/schemas/character-sheet-form";

const imageState = {
  characterImage: null,
  isRootOperationInProgress: false,
  onCharacterImageCleared: async () => {},
  onCharacterImageOperationStarted: () => {},
  onCharacterImageSelected: async () => {},
};

function usePresenterHarness() {
  const form = useForm<CharacterSheetFormValues>({
    defaultValues: characterSheetDefaultValues,
    mode: "onChange",
    resolver: zodResolver(characterSheetFormSchema),
  });

  return {
    form,
    presenterProps: useCharacterSheetFormPresenterProps(form, imageState),
  };
}

describe("useCharacterSheetFormPresenterProps", () => {
  it("keeps ikizama props and the error summary stable across an unrelated render", () => {
    const { result, rerender } = renderHook(() => usePresenterHarness());
    const before = {
      errorSummary: result.current.presenterProps.errorSummary,
      ikizamaSkillsSection: result.current.presenterProps.ikizamaSkillsSection,
    };

    rerender();

    expect(result.current.presenterProps.errorSummary).toBe(
      before.errorSummary,
    );
    expect(result.current.presenterProps.ikizamaSkillsSection).toBe(
      before.ikizamaSkillsSection,
    );
  });

  it("keeps unaffected section props and callbacks stable across a profile update", () => {
    const { result } = renderHook(() => usePresenterHarness());
    const before = {
      commonSkillsSection: result.current.presenterProps.commonSkillsSection,
      commonSkillOnSelect:
        result.current.presenterProps.commonSkillPicker.onSelect,
      primarySkillsSection: result.current.presenterProps.primarySkillsSection,
      primarySkillOnSelect:
        result.current.presenterProps.primarySkillPicker.onSelect,
    };

    act(() => {
      result.current.form.setValue("profile.pcName", "ネオン");
    });

    expect(result.current.presenterProps.commonSkillsSection).toBe(
      before.commonSkillsSection,
    );
    expect(result.current.presenterProps.commonSkillPicker.onSelect).toBe(
      before.commonSkillOnSelect,
    );
    expect(result.current.presenterProps.primarySkillsSection).toBe(
      before.primarySkillsSection,
    );
    expect(result.current.presenterProps.primarySkillPicker.onSelect).toBe(
      before.primarySkillOnSelect,
    );
  });

  it("connects normalized credit inputs and derived values through RHF", () => {
    const { result } = renderHook(() => usePresenterHarness());
    const { profileSection } = result.current.presenterProps;

    act(() => {
      profileSection.onCreditChange("acquired", "15");
      profileSection.onCreditChange("provided", "-3");
      profileSection.onCreditChange("received", "4");
      profileSection.onCreditChange("changeAdjustment", "-2");
    });

    expect(result.current.form.getValues("credit")).toEqual({
      acquired: 15,
      changeAdjustment: -2,
      provided: 0,
      received: 4,
    });
    expect(result.current.presenterProps.profileSection.creditSummary).toEqual({
      change: 17,
      hasCreditError: false,
      totalCredit: 19,
    });
  });

  it("returns an emptied credit field to zero and updates profile props", () => {
    const { result } = renderHook(() => usePresenterHarness());

    act(() => {
      result.current.presenterProps.profileSection.onCreditBlur("acquired", "");
      result.current.presenterProps.profileSection.onProfileChange(
        "pcName",
        "ネオン",
      );
    });

    expect(result.current.form.getValues("credit.acquired")).toBe(0);
    expect(result.current.presenterProps.profileSection.profile.pcName).toBe(
      "ネオン",
    );
  });

  it("updates consumed credit after selecting an omamori", () => {
    const { result } = renderHook(() => usePresenterHarness());
    const [omamori] = getOmamori();
    if (omamori === undefined) {
      throw new Error("お守り候補を取得できません。");
    }

    act(() => {
      result.current.presenterProps.omamoriSection.onAdd();
    });
    const rowId = result.current.form.getValues("omamori.rows.0.rowId");

    act(() => {
      result.current.presenterProps.omamoriSection.onSelect(rowId, omamori.id);
    });

    expect(result.current.form.getValues("omamori.rows.0.omamoriId")).toBe(
      omamori.id,
    );
    expect(result.current.presenterProps.profileSection.spentCredit).toBe(2);
    expect(
      result.current.presenterProps.profileSection.creditSummary.change,
    ).toBe(8);
  });

  it("updates consumed credit when selecting a drug with the default quantity", () => {
    const { result } = renderHook(() => usePresenterHarness());
    const [drug] = getDrugs();
    const row = result.current.form.getValues("drugs.rows.0");
    if (drug === undefined || drug.credit === null || row === undefined) {
      throw new Error("ドラッグ候補または初期行を取得できません。");
    }
    const credit = drug.credit;

    act(() => {
      result.current.presenterProps.drugsSection.onSelect(row.rowId, drug.id);
    });

    expect(result.current.form.getValues("drugs.rows.0.quantity")).toBe(1);
    expect(result.current.presenterProps.profileSection.spentCredit).toBe(
      credit,
    );
    expect(
      result.current.presenterProps.profileSection.creditSummary.change,
    ).toBe(10 - credit);
  });

  it("keeps consecutive build selections instead of overwriting the first one", () => {
    const { result } = renderHook(() => usePresenterHarness());

    act(() => {
      result.current.presenterProps.buildSection.onPrimaryRyugiChange(
        "kenkaya",
      );
      result.current.presenterProps.buildSection.onIkizamaChange("burai");
    });

    expect(result.current.form.getValues("build.primaryRyugiId")).toBe(
      "kenkaya",
    );
    expect(result.current.form.getValues("build.ikizamaId")).toBe("burai");
    expect(
      result.current.presenterProps.buildSection.derived.reference
        .ikizamaHealthCoefficient,
    ).toBe(11);
  });

  it("connects acquired experience through the basic-information props", () => {
    const { result } = renderHook(() => usePresenterHarness());

    act(() => {
      result.current.presenterProps.profileSection.experience.onAcquiredChange(
        "70",
      );
    });

    expect(result.current.form.getValues("build.acquiredExperience")).toBe(70);
    expect(
      result.current.presenterProps.profileSection.experience.acquired,
    ).toBe(70);
  });

  it("connects common-skill selections, levels, the level limit, and experience", () => {
    const { result } = renderHook(() => usePresenterHarness());
    const [skill] = getCommonSkillCandidates();
    const firstRowId = result.current.form.getValues(
      "commonSkills.rows.0.rowId",
    );
    if (skill === undefined) {
      throw new Error("共通スキル候補を取得できません。");
    }

    act(() => {
      result.current.presenterProps.commonSkillPicker.onSelect(
        firstRowId,
        skill.id,
      );
      result.current.presenterProps.commonSkillsSection.onLevelChange(
        firstRowId,
        "2",
      );
    });

    expect(result.current.form.getValues("commonSkills.rows.0")).toMatchObject({
      level: 2,
      skillId: skill.id,
    });
    expect(
      result.current.presenterProps.commonSkillsSection.selectedLevelTotal,
    ).toBe(2);
    expect(result.current.presenterProps.commonSkillsSection.levelLimit).toBe(
      1,
    );
    expect(
      result.current.presenterProps.commonSkillsSection
        .hasCommonSkillLevelError,
    ).toBe(true);
    expect(
      result.current.presenterProps.profileSection.experience.derived
        .spentExperience,
    ).toBe(10);
    expect(
      result.current.presenterProps.buildSection.derived.hasBuildError,
    ).toBe(false);
    expect(
      result.current.presenterProps.profileSection.experience
        .hasCommonSkillLevelError,
    ).toBe(true);
  });

  it("keeps invalid common-skill levels without reducing spent experience", () => {
    const { result } = renderHook(() => usePresenterHarness());
    const [skill] = getCommonSkillCandidates();
    const firstRowId = result.current.form.getValues(
      "commonSkills.rows.0.rowId",
    );
    if (skill === undefined) {
      throw new Error("共通スキル候補を取得できません。");
    }

    act(() => {
      result.current.presenterProps.commonSkillPicker.onSelect(
        firstRowId,
        skill.id,
      );
      result.current.presenterProps.commonSkillsSection.onLevelChange(
        firstRowId,
        "-1",
      );
    });

    expect(result.current.form.getValues("commonSkills.rows.0.level")).toBe(-1);
    expect(
      result.current.presenterProps.commonSkillsSection.selectedLevelTotal,
    ).toBe(0);
    expect(
      result.current.presenterProps.profileSection.experience.derived
        .spentExperience,
    ).toBe(0);
    expect(
      result.current.presenterProps.commonSkillsSection
        .invalidMaximumLevelRowIds,
    ).toContain(firstRowId);
  });

  it("retains common-skill row IDs and invalid levels across an external reset", () => {
    const { result } = renderHook(() => usePresenterHarness());
    const [skill] = getCommonSkillCandidates();
    const firstRowId = result.current.form.getValues(
      "commonSkills.rows.0.rowId",
    );
    if (skill === undefined) {
      throw new Error("共通スキル候補を取得できません。");
    }

    act(() => {
      const values = result.current.form.getValues();
      result.current.form.reset({
        ...values,
        commonSkills: {
          rows: values.commonSkills.rows.map((row) =>
            row.rowId === firstRowId
              ? { ...row, level: skill.maxLevel + 1, skillId: skill.id }
              : row,
          ),
        },
      });
    });

    expect(result.current.form.getValues("commonSkills.rows.0.rowId")).toBe(
      firstRowId,
    );
    expect(
      result.current.presenterProps.commonSkillsSection.rows[0],
    ).toMatchObject({ level: skill.maxLevel + 1, rowId: firstRowId });
    expect(
      result.current.presenterProps.commonSkillsSection
        .invalidMaximumLevelRowIds,
    ).toContain(firstRowId);
  });

  it("changes the skill synchronization key after a same-value external reset", () => {
    const { result } = renderHook(() => usePresenterHarness());
    const beforeReset =
      result.current.presenterProps.primarySkillsSection.synchronizationKey;

    act(() => {
      result.current.form.reset(result.current.form.getValues());
    });

    expect(
      result.current.presenterProps.primarySkillsSection.synchronizationKey,
    ).not.toBe(beforeReset);
  });

  it("keeps out-of-range primary skill levels in RHF as local errors", () => {
    const { result } = renderHook(() => usePresenterHarness());

    act(() => {
      result.current.presenterProps.buildSection.onPrimaryRyugiChange(
        "kenkaya",
      );
    });

    const firstRowId = result.current.form.getValues(
      "primarySkills.rows.0.rowId",
    );
    const [skill] = getPrimarySkillGroups("kenkaya", 1).basic;
    if (skill === undefined) {
      throw new Error("プライマリスキル候補を取得できません。");
    }

    act(() => {
      result.current.presenterProps.primarySkillPicker.onSelect(
        firstRowId,
        skill.id,
      );
      result.current.presenterProps.primarySkillsSection.onLevelChange(
        firstRowId,
        "9",
      );
      result.current.presenterProps.primarySkillsSection.onAdd();
    });

    expect(result.current.form.getValues("primarySkills.rows.0")).toMatchObject(
      {
        level: 9,
        skillId: skill.id,
      },
    );
    expect(result.current.form.getValues("primarySkills.rows")).toHaveLength(5);
    expect(
      result.current.presenterProps.primarySkillsSection.bonusSkills.length,
    ).toBe(1);
    expect(
      result.current.presenterProps.primarySkillsSection
        .hasPrimarySkillLevelTotalError,
    ).toBe(true);
    expect(
      result.current.presenterProps.primarySkillsSection
        .invalidMaximumLevelRowIds,
    ).toContain(firstRowId);

    const secondRowId = result.current.form.getValues(
      "primarySkills.rows.1.rowId",
    );
    act(() => {
      result.current.presenterProps.primarySkillPicker.onSelect(
        secondRowId,
        skill.id,
      );
    });
    expect(
      result.current.presenterProps.primarySkillsSection
        .invalidDuplicateSkillRowIds,
    ).toEqual([firstRowId, secondRowId]);
  });

  it("summarizes advanced skills with their owning ryugi or ikizama level", () => {
    const { result } = renderHook(() => usePresenterHarness());
    const [primarySkill] = getPrimarySkillGroups("kenkaya", 6).advanced;
    const [ikizamaSkill] = getIkizamaSkillGroups("burai", 4).advanced;
    const [otherRyugiSkill] = getOtherRyugiSkillGroups("kenkaya", 6).advanced;
    if (
      primarySkill === undefined ||
      ikizamaSkill === undefined ||
      otherRyugiSkill === undefined
    ) {
      throw new Error("上級スキル候補を取得できません。");
    }

    act(() => {
      result.current.presenterProps.buildSection.onPrimaryRyugiChange(
        "kenkaya",
      );
      result.current.presenterProps.buildSection.onIkizamaChange("burai");
      result.current.presenterProps.buildSection.onOtherRyugiAdd();
    });

    const primaryRowId = result.current.form.getValues(
      "primarySkills.rows.0.rowId",
    );
    const ikizamaRowId = result.current.form.getValues(
      "ikizamaSkills.rows.0.rowId",
    );
    const [otherRyugi] = result.current.form.getValues("build.otherRyugi");
    const [otherRyugiRow] = result.current.form.getValues(
      "otherRyugiSkills.rows",
    );
    if (otherRyugi === undefined || otherRyugiRow === undefined) {
      throw new Error("その他流儀の上級スキル行を取得できません。");
    }

    act(() => {
      result.current.presenterProps.buildSection.onOtherRyugiChange(
        0,
        "ryugiId",
        "kenkaya",
      );
      result.current.presenterProps.buildSection.onOtherRyugiChange(
        0,
        "level",
        "1",
      );
      result.current.presenterProps.primarySkillPicker.onSelect(
        primaryRowId,
        primarySkill.id,
      );
      result.current.presenterProps.ikizamaSkillPicker.onSelect(
        ikizamaRowId,
        ikizamaSkill.id,
      );
      result.current.presenterProps.otherRyugiSkillPicker.onSelect(
        otherRyugiRow.rowId,
        otherRyugiSkill.id,
      );
    });

    expect(result.current.presenterProps.errorSummary.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "primary-skill-advanced",
          message: `プライマリ流儀スキル「${primarySkill.name}」：流儀Lv 6以上が必要です（現在Lv 1）。`,
        }),
        expect.objectContaining({
          code: "ikizama-skill-advanced",
          message: `生き様スキル「${ikizamaSkill.name}」：生き様Lv 4以上が必要です（現在Lv 1）。`,
        }),
        expect.objectContaining({
          code: "other-ryugi-skill-advanced",
          message: `その他流儀「ケンカヤ」のスキル「${otherRyugiSkill.name}」：流儀Lv 6以上が必要です（現在Lv 1）。`,
        }),
      ]),
    );
  });

  it("moves primary skill rows one step without crossing the boundaries", () => {
    const { result } = renderHook(() => usePresenterHarness());
    const [firstRow, secondRow] =
      result.current.form.getValues("primarySkills.rows");
    if (firstRow === undefined || secondRow === undefined) {
      throw new Error("並べ替え確認用のスキル行を取得できません。");
    }

    act(() => {
      result.current.presenterProps.primarySkillsSection.onMove(
        firstRow.rowId,
        "up",
      );
      result.current.presenterProps.primarySkillsSection.onMove(
        firstRow.rowId,
        "down",
      );
    });

    expect(result.current.form.getValues("primarySkills.rows.0.rowId")).toBe(
      secondRow.rowId,
    );
    expect(result.current.form.getValues("primarySkills.rows.1.rowId")).toBe(
      firstRow.rowId,
    );
  });

  it("keeps other-ryugi rows and their normal skill rows together in RHF", () => {
    const { result } = renderHook(() => usePresenterHarness());

    act(() => {
      result.current.presenterProps.buildSection.onOtherRyugiAdd();
    });

    const [otherRyugi] = result.current.form.getValues("build.otherRyugi");
    const [otherRyugiSkill] = result.current.form.getValues(
      "otherRyugiSkills.rows",
    );
    if (otherRyugi === undefined || otherRyugiSkill === undefined) {
      throw new Error("その他流儀またはスキル行を追加できません。");
    }

    const [skill] = getOtherRyugiSkillGroups("kenkaya", 1).basic;
    if (skill === undefined) {
      throw new Error("その他流儀スキル候補を取得できません。");
    }

    act(() => {
      result.current.presenterProps.buildSection.onOtherRyugiChange(
        0,
        "ryugiId",
        "kenkaya",
      );
      result.current.presenterProps.buildSection.onOtherRyugiChange(
        0,
        "level",
        "1",
      );
      result.current.presenterProps.otherRyugiSkillPicker.onSelect(
        otherRyugiSkill.rowId,
        skill.id,
      );
      result.current.presenterProps.otherRyugiSkillsSection.onLevelChange(
        otherRyugiSkill.rowId,
        "2",
      );
      result.current.presenterProps.otherRyugiSkillsSection.onAdd(
        otherRyugi.rowId,
      );
    });

    expect(
      result.current.form.getValues("otherRyugiSkills.rows.0"),
    ).toMatchObject({
      level: 2,
      ryugiRowId: otherRyugi.rowId,
      skillId: skill.id,
    });
    expect(result.current.form.getValues("otherRyugiSkills.rows")).toHaveLength(
      2,
    );
    expect(
      result.current.presenterProps.otherRyugiSkillsSection.sections[0]
        ?.hasSkillLevelTotalError,
    ).toBe(true);
    expect(
      result.current.presenterProps.buildSection
        .invalidOtherRyugiSkillLevelRowIds,
    ).toEqual([otherRyugi.rowId]);
  });

  it("isolates other-ryugi field-array moves and removals by ryugi row ID", () => {
    const { result } = renderHook(() => usePresenterHarness());

    act(() => {
      result.current.presenterProps.buildSection.onOtherRyugiAdd();
      result.current.presenterProps.buildSection.onOtherRyugiAdd();
    });

    const [firstRyugi, secondRyugi] =
      result.current.form.getValues("build.otherRyugi");
    const [firstRow, secondRow] = result.current.form.getValues(
      "otherRyugiSkills.rows",
    );
    if (
      firstRyugi === undefined ||
      secondRyugi === undefined ||
      firstRow === undefined ||
      secondRow === undefined
    ) {
      throw new Error("複数その他流儀の初期行を取得できません。");
    }

    let addedFirstRowId = "";
    let addedSecondRowId = "";
    act(() => {
      result.current.presenterProps.otherRyugiSkillsSection.onAdd(
        firstRyugi.rowId,
      );
      result.current.presenterProps.otherRyugiSkillsSection.onAdd(
        secondRyugi.rowId,
      );
      const rows = result.current.form.getValues("otherRyugiSkills.rows");
      addedFirstRowId = rows[2]?.rowId ?? "";
      addedSecondRowId = rows[3]?.rowId ?? "";
      result.current.presenterProps.otherRyugiSkillsSection.onMove(
        addedFirstRowId,
        "up",
      );
      result.current.presenterProps.otherRyugiSkillsSection.onRemove(
        firstRow.rowId,
      );
    });

    expect(addedFirstRowId).not.toBe("");
    expect(addedSecondRowId).not.toBe("");
    expect(
      result.current.form
        .getValues("otherRyugiSkills.rows")
        .map((row) => ({ rowId: row.rowId, ryugiRowId: row.ryugiRowId })),
    ).toEqual([
      { rowId: addedFirstRowId, ryugiRowId: firstRyugi.rowId },
      { rowId: secondRow.rowId, ryugiRowId: secondRyugi.rowId },
      { rowId: addedSecondRowId, ryugiRowId: secondRyugi.rowId },
    ]);

    act(() => {
      result.current.presenterProps.otherRyugiSkills.removeRows(
        secondRyugi.rowId,
      );
      result.current.presenterProps.buildSection.onOtherRyugiRemove(1);
    });

    expect(result.current.form.getValues("build.otherRyugi")).toEqual([
      expect.objectContaining({ rowId: firstRyugi.rowId }),
    ]);
    expect(result.current.form.getValues("otherRyugiSkills.rows")).toEqual([
      expect.objectContaining({
        rowId: addedFirstRowId,
        ryugiRowId: firstRyugi.rowId,
      }),
    ]);
  });

  it("keeps ikizama rows in RHF, resets bonus on an ikizama change, and preserves it across level changes", () => {
    const { result } = renderHook(() => usePresenterHarness());

    act(() => {
      result.current.presenterProps.buildSection.onIkizamaChange("burai");
    });

    const [skill] = getIkizamaSkillGroups("burai", 1).basic;
    if (skill === undefined) {
      throw new Error("生き様スキル候補を取得できません。");
    }
    const firstRowId = result.current.form.getValues(
      "ikizamaSkills.rows.0.rowId",
    );
    const bonusSkillId =
      result.current.presenterProps.ikizamaSkillsSection.bonusSkill?.id;
    if (bonusSkillId === undefined) {
      throw new Error("生き様bonusスキルを取得できません。");
    }

    act(() => {
      result.current.presenterProps.ikizamaSkillsSection.onLevelChange(
        `ikizama-bonus-${bonusSkillId}`,
        "3",
      );
      result.current.presenterProps.ikizamaSkillPicker.onSelect(
        firstRowId,
        skill.id,
      );
      result.current.presenterProps.ikizamaSkillsSection.onLevelChange(
        firstRowId,
        "9",
      );
      result.current.presenterProps.ikizamaSkillsSection.onAdd();
      result.current.presenterProps.buildSection.onIkizamaLevelChange("4");
    });

    expect(result.current.form.getValues("ikizamaSkills.bonusLevel")).toBe(3);
    expect(result.current.form.getValues("ikizamaSkills.rows.0")).toMatchObject(
      {
        level: 9,
        skillId: skill.id,
      },
    );
    expect(result.current.form.getValues("ikizamaSkills.rows")).toHaveLength(3);
    expect(
      result.current.presenterProps.ikizamaSkillPicker.candidateGroups.advanced
        .length,
    ).toBeGreaterThan(0);
    expect(
      result.current.presenterProps.ikizamaSkillsSection
        .hasIkizamaSkillLevelTotalError,
    ).toBe(true);
    expect(
      result.current.presenterProps.ikizamaSkillsSection
        .invalidMaximumLevelRowIds,
    ).toContain(firstRowId);

    act(() => {
      result.current.presenterProps.buildSection.onIkizamaChange("kage");
    });

    expect(result.current.form.getValues("ikizamaSkills.bonusLevel")).toBe(1);
  });

  it("uses field-array operations to remove every ikizama normal row", () => {
    const { result } = renderHook(() => usePresenterHarness());
    const [firstRow, secondRow] =
      result.current.form.getValues("ikizamaSkills.rows");
    if (firstRow === undefined || secondRow === undefined) {
      throw new Error("生き様スキル行を取得できません。");
    }

    act(() => {
      result.current.presenterProps.ikizamaSkillsSection.onMove(
        firstRow.rowId,
        "down",
      );
      result.current.presenterProps.ikizamaSkillsSection.onRemove(
        secondRow.rowId,
      );
      result.current.presenterProps.ikizamaSkillsSection.onRemove(
        firstRow.rowId,
      );
    });

    expect(result.current.form.getValues("ikizamaSkills.rows")).toHaveLength(0);
  });

  it("marks only the ikizama build and skill section invalid when selected levels exceed its level", () => {
    const { result } = renderHook(() => usePresenterHarness());
    const [firstRow, secondRow] =
      result.current.form.getValues("ikizamaSkills.rows");
    const [skill] = getIkizamaSkillGroups("burai", 1).basic;
    if (
      firstRow === undefined ||
      secondRow === undefined ||
      skill === undefined
    ) {
      throw new Error("生き様スキル行または候補を取得できません。");
    }

    act(() => {
      result.current.presenterProps.buildSection.onIkizamaChange("burai");
      result.current.presenterProps.ikizamaSkillPicker.onSelect(
        firstRow.rowId,
        skill.id,
      );
      result.current.presenterProps.ikizamaSkillPicker.onSelect(
        secondRow.rowId,
        skill.id,
      );
    });

    expect(
      result.current.presenterProps.ikizamaSkillsSection
        .hasIkizamaSkillLevelTotalError,
    ).toBe(true);
    expect(
      result.current.presenterProps.buildSection.hasIkizamaSkillLevelError,
    ).toBe(true);
    expect(
      result.current.presenterProps.buildSection.hasPrimarySkillLevelError,
    ).toBe(false);
  });

  it("counts bonus levels above the free first level toward the ikizama total", () => {
    const { result } = renderHook(() => usePresenterHarness());

    act(() => {
      result.current.presenterProps.buildSection.onIkizamaChange("burai");
      result.current.presenterProps.buildSection.onIkizamaLevelChange("1");
      result.current.presenterProps.ikizamaSkillsSection.onRemove(
        result.current.form.getValues("ikizamaSkills.rows.0.rowId"),
      );
      result.current.presenterProps.ikizamaSkillsSection.onRemove(
        result.current.form.getValues("ikizamaSkills.rows.0.rowId"),
      );
    });
    const bonusSkillId =
      result.current.presenterProps.ikizamaSkillsSection.bonusSkill?.id;
    if (bonusSkillId === undefined) {
      throw new Error("生き様bonusスキルを取得できません。");
    }

    act(() => {
      result.current.presenterProps.ikizamaSkillsSection.onLevelChange(
        `ikizama-bonus-${bonusSkillId}`,
        "3",
      );
    });

    expect(result.current.form.getValues("build.ikizamaLevel")).toBe(1);
    expect(result.current.form.getValues("ikizamaSkills.bonusLevel")).toBe(3);
    expect(result.current.form.getValues("ikizamaSkills.rows")).toHaveLength(0);
    expect(result.current.presenterProps.buildSection.build.ikizamaLevel).toBe(
      1,
    );
    expect(result.current.presenterProps.ikizamaSkillsSection.bonusLevel).toBe(
      3,
    );
    expect(
      result.current.presenterProps.ikizamaSkillsSection
        .hasIkizamaSkillLevelTotalError,
    ).toBe(true);
    expect(
      result.current.presenterProps.buildSection.hasIkizamaSkillLevelError,
    ).toBe(true);
  });

  it("connects secondary corrections and temporary-value choices through RHF", () => {
    const { result } = renderHook(() => usePresenterHarness());

    act(() => {
      result.current.presenterProps.secondaryAttributesSection.onNumberChange(
        "movementModifier",
        "-2",
      );
      result.current.presenterProps.secondaryAttributesSection.onTemporaryAppliedChange(
        "applyTemporaryMovement",
        true,
      );
    });

    expect(
      result.current.form.getValues("secondaryAttributes.movementModifier"),
    ).toBe(-2);
    expect(
      result.current.form.getValues(
        "secondaryAttributes.applyTemporaryMovement",
      ),
    ).toBe(true);
  });

  it("keeps resolved bonds locked until the resolve checkbox is removed", () => {
    const { result } = renderHook(() => usePresenterHarness());
    const firstRowId = result.current.form.getValues("bonds.rows.0.rowId");

    act(() => {
      result.current.presenterProps.bondsSection.onRowChange(
        firstRowId,
        "target",
        "アキラ",
      );
      result.current.presenterProps.bondsSection.onRowChange(
        firstRowId,
        "isResolved",
        true,
      );
    });

    expect(result.current.form.getValues("bonds.rows.0")).toMatchObject({
      isResolved: true,
      target: "アキラ",
    });

    act(() => {
      result.current.presenterProps.bondsSection.onRowClear(firstRowId);
    });

    expect(result.current.form.getValues("bonds.rows.0")).toMatchObject({
      isResolved: true,
      rowId: firstRowId,
      target: "アキラ",
    });

    act(() => {
      result.current.presenterProps.bondsSection.onRowChange(
        firstRowId,
        "isResolved",
        false,
      );
      result.current.presenterProps.bondsSection.onRowClear(firstRowId);
    });

    expect(result.current.form.getValues("bonds.rows.0")).toMatchObject({
      isResolved: false,
      relation: "",
      rowId: firstRowId,
      target: "",
    });
  });

  it("removes empty bond rows after a limit decrease and preserves overflow rows", () => {
    const { result } = renderHook(() => usePresenterHarness());

    act(() => {
      result.current.presenterProps.secondaryAttributesSection.onNumberChange(
        "bondLimitModifier",
        "2",
      );
    });

    act(() => {
      result.current.presenterProps.bondsSection.onRowChange(
        result.current.form.getValues("bonds.rows.0.rowId"),
        "target",
        "アキラ",
      );
      result.current.presenterProps.bondsSection.onRowChange(
        result.current.form.getValues("bonds.rows.1.rowId"),
        "target",
        "ベラ",
      );
      result.current.presenterProps.secondaryAttributesSection.onNumberChange(
        "bondLimitModifier",
        "-3",
      );
    });

    expect(result.current.form.getValues("bonds.rows")).toHaveLength(2);
    expect(result.current.presenterProps.bondsSection.derived.isOverLimit).toBe(
      true,
    );
    expect(
      result.current.presenterProps.bondsSection.derived.overflowRowIds,
    ).toEqual([result.current.form.getValues("bonds.rows.1.rowId")]);

    act(() => {
      result.current.presenterProps.bondsSection.onRowDelete(
        result.current.form.getValues("bonds.rows.1.rowId"),
      );
    });

    expect(result.current.form.getValues("bonds.rows")).toHaveLength(1);
  });

  it("only deletes unresolved bond rows that are currently over the limit", () => {
    const { result } = renderHook(() => usePresenterHarness());
    const firstRowId = result.current.form.getValues("bonds.rows.0.rowId");
    const secondRowId = result.current.form.getValues("bonds.rows.1.rowId");

    act(() => {
      result.current.presenterProps.bondsSection.onRowDelete(firstRowId);
    });

    expect(result.current.form.getValues("bonds.rows")).toHaveLength(4);

    act(() => {
      result.current.presenterProps.bondsSection.onRowChange(
        firstRowId,
        "target",
        "アキラ",
      );
      result.current.presenterProps.bondsSection.onRowChange(
        firstRowId,
        "isResolved",
        true,
      );
      result.current.presenterProps.bondsSection.onRowChange(
        secondRowId,
        "target",
        "ベラ",
      );
      result.current.presenterProps.secondaryAttributesSection.onNumberChange(
        "bondLimitModifier",
        "-3",
      );
    });

    act(() => {
      result.current.presenterProps.bondsSection.onRowDelete(firstRowId);
    });

    expect(result.current.form.getValues("bonds.rows")).toHaveLength(2);

    act(() => {
      result.current.presenterProps.bondsSection.onRowDelete(secondRowId);
    });

    expect(result.current.form.getValues("bonds.rows")).toHaveLength(1);
  });

  it("keeps attack rows, reaction rows, and their derived counts in the RHF boundary", () => {
    const { result } = renderHook(() => usePresenterHarness());
    const checks = result.current.presenterProps.checksSection;

    act(() => {
      checks.onAttackAdd();
      checks.onAttackSkillChange("attack-1", "shooting");
      checks.onAttackModifierChange("attack-1", "-2");
      checks.onReactionAttributeChange("reaction-defense", "agility");
      checks.onReactionModifierChange("reaction-defense", "3");
    });

    expect(result.current.form.getValues("checks.attacks")).toHaveLength(2);
    expect(result.current.form.getValues("checks.attacks.0")).toMatchObject({
      attribute: "perception",
      modifier: -2,
      skill: "shooting",
    });
    expect(result.current.form.getValues("checks.reactions.0")).toEqual({
      attribute: "agility",
      modifier: 3,
      name: "defense",
      rowId: "reaction-defense",
    });
    expect(
      result.current.presenterProps.checksSection.attacks[0],
    ).toMatchObject({
      permanentAttribute: null,
      permanentCheck: null,
      temporaryAttribute: null,
      temporaryCheck: null,
    });

    act(() => {
      result.current.presenterProps.checksSection.onAttackRemove("attack-1");
      result.current.presenterProps.checksSection.onAttackRemove(
        result.current.form.getValues("checks.attacks.0.rowId"),
      );
    });

    expect(result.current.form.getValues("checks.attacks")).toHaveLength(1);
  });

  it("keeps attack rows at five or fewer", () => {
    const { result } = renderHook(() => usePresenterHarness());

    act(() => {
      for (let index = 0; index < 5; index += 1) {
        result.current.presenterProps.checksSection.onAttackAdd();
      }
    });

    expect(result.current.form.getValues("checks.attacks")).toHaveLength(5);
  });
});
