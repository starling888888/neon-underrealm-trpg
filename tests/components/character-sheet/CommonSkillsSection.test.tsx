// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import CommonSkillsSection from "../../../src/character-sheet/components/CommonSkillsSection";
import { getBasicAttackSkill } from "../../../src/character-sheet/master-data/common-skills";
import { getMaximumSkillNameLength } from "../../../src/character-sheet/master-data/primary-skills";

afterEach(cleanup);

describe("CommonSkillsSection", () => {
  it("shows the automatic basic attack and the common-only action summary", () => {
    const basicAttack = getBasicAttackSkill();
    if (basicAttack === null) throw new Error("基本の一撃を取得できません。");

    render(
      <CommonSkillsSection
        basicAttack={basicAttack}
        hasCommonSkillLevelError={false}
        invalidDuplicateSkillRowIds={[]}
        invalidMaximumLevelRowIds={[]}
        levelLimit={1}
        maximumSkillNameLength={getMaximumSkillNameLength()}
        onAdd={vi.fn()}
        onLevelChange={vi.fn()}
        onMove={vi.fn()}
        onPickerRequest={vi.fn()}
        onRemove={vi.fn()}
        rows={[
          { level: 1, rowId: "common-1", skill: null, skillId: null },
          { level: 1, rowId: "common-2", skill: null, skillId: null },
        ]}
        selectedLevelTotal={0}
      />,
    );

    expect(screen.getAllByText("基本の一撃")).toHaveLength(2);
    expect(
      screen.getByText("取得合計レベル：0／合計レベル上限：1"),
    ).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "共通スキル未選択スキル1" }),
    ).not.toBeNull();
  });
});
