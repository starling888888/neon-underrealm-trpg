// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import OtherRyugiSkillsSection, {
  type OtherRyugiSkillsSectionProps,
} from "../../../src/character-sheet/components/OtherRyugiSkillsSection";
import { getOtherRyugiSkillGroups } from "../../../src/character-sheet/master-data/other-ryugi-skills";

function createProps(): OtherRyugiSkillsSectionProps {
  const groups = getOtherRyugiSkillGroups("kenkaya", 6);
  const [first, second] = groups.basic;

  if (first === undefined || second === undefined) {
    throw new Error("その他流儀スキル候補を取得できません。");
  }

  return {
    maximumSkillNameLength: 8,
    onAdd: vi.fn(),
    onLevelChange: vi.fn((_rowId, value: string) => Number(value)),
    onMove: vi.fn(),
    onPickerRequest: vi.fn(),
    onRemove: vi.fn(),
    sections: [
      {
        hasSkillLevelTotalError: true,
        invalidAdvancedSkillRowIds: [],
        invalidDuplicateSkillRowIds: [],
        invalidMaximumLevelRowIds: [],
        rows: [
          { level: 1, rowId: "first", skill: first, skillId: first.id },
          { level: 1, rowId: "second", skill: second, skillId: second.id },
        ],
        ryugiName: "ケンカヤ",
        ryugiRowId: "other-1",
        ryugiSelected: true,
      },
    ],
  };
}

afterEach(cleanup);

describe("OtherRyugiSkillsSection", () => {
  it("reuses the shared section for each other ryugi and keeps its level error local", () => {
    const props = createProps();
    const [firstRow, secondRow] = props.sections[0]?.rows ?? [];
    if (firstRow === undefined || secondRow === undefined) {
      throw new Error("その他流儀スキル行を取得できません。");
    }

    render(<OtherRyugiSkillsSection {...props} />);

    const section = screen.getByRole("region", { name: "その他流儀スキル1" });
    expect(section.getAttribute("aria-invalid")).toBe("true");
    expect(
      screen.getByRole("button", { name: "その他流儀：ケンカヤ" }),
    ).not.toBeNull();
    expect(screen.getByText("名称")).not.toBeNull();

    fireEvent.click(
      screen.getByRole("button", {
        name: `${firstRow.skill?.name ?? ""}下へ移動`,
      }),
    );
    expect(props.onMove).toHaveBeenCalledWith("first", "down");
    fireEvent.click(
      screen.getByRole("button", {
        name: `${secondRow.skill?.name ?? ""}上へ移動`,
      }),
    );
    expect(props.onMove).toHaveBeenCalledWith("second", "up");
  });

  it("does not expose rows before its other ryugi is selected", () => {
    const props = createProps();
    const [section] = props.sections;
    if (section === undefined) {
      throw new Error("その他流儀スキル区分を取得できません。");
    }

    render(
      <OtherRyugiSkillsSection
        {...props}
        sections={[{ ...section, ryugiName: null, ryugiSelected: false }]}
      />,
    );

    expect(screen.getByText("その他流儀を選択してください。")).not.toBeNull();
    expect(screen.queryByRole("button", { name: /へ移動$/ })).toBeNull();
  });
});
