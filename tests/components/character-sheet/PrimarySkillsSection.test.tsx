// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import PrimarySkillsSection, {
  type PrimarySkillsSectionProps,
} from "../../../src/character-sheet/components/PrimarySkillsSection";
import { getPrimarySkillGroups } from "../../../src/character-sheet/master-data/primary-skills";

function createProps(): PrimarySkillsSectionProps {
  const groups = getPrimarySkillGroups("kenkaya", 6);

  return {
    bonusSkills: groups.bonus,
    candidateGroups: groups,
    hasPrimarySkillLevelTotalError: false,
    invalidMaximumLevelRowIds: [],
    maximumSkillNameLength: 8,
    onAdd: vi.fn(),
    onLevelChange: vi.fn((_rowId, value: string) => Number(value)),
    onPickerRequest: vi.fn(),
    onRemove: vi.fn(),
    onReorder: vi.fn(),
    onSelect: vi.fn(),
    onSelectionClear: vi.fn(),
    primaryRyugiSelected: true,
    rows: [
      {
        level: 1,
        rowId: "first",
        skill: groups.basic[0] ?? null,
        skillId: groups.basic[0]?.id ?? null,
      },
      {
        level: 1,
        rowId: "second",
        skill: groups.basic[1] ?? null,
        skillId: groups.basic[1]?.id ?? null,
      },
    ],
  };
}

afterEach(cleanup);

describe("PrimarySkillsSection", () => {
  it("keeps bonus fixed and lets a normal row open the picker", () => {
    const props = createProps();
    render(<PrimarySkillsSection {...props} />);

    expect(screen.getByText(props.bonusSkills[0]?.name ?? "")).not.toBeNull();
    expect(screen.getAllByRole("button", { name: /並べ替え:/ })).toHaveLength(
      2,
    );

    fireEvent.click(
      screen.getByRole("button", { name: props.rows[0]?.skill?.name ?? "" }),
    );

    expect(props.onPickerRequest).toHaveBeenCalledWith(
      "first",
      expect.any(HTMLButtonElement),
    );
  });

  it("disables removal at the one-row minimum and forwards drag reorder", () => {
    const props = createProps();
    const dataTransfer = {
      effectAllowed: "",
      getData: vi.fn(() => "first"),
      setData: vi.fn(),
    };
    render(<PrimarySkillsSection {...props} />);

    const firstHandle = screen.getAllByRole("button", { name: /並べ替え:/ })[0];
    const secondRow = document.querySelector(
      '[data-primary-skill-row="second"]',
    );
    if (firstHandle === undefined || secondRow === null) {
      throw new Error("スキル行を取得できません。");
    }

    fireEvent.dragStart(firstHandle, { dataTransfer });
    fireEvent.drop(secondRow, { dataTransfer });
    expect(props.onReorder).toHaveBeenCalledWith("first", "second");

    cleanup();
    const [firstRow] = props.rows;
    if (firstRow === undefined) {
      throw new Error("先頭スキル行を取得できません。");
    }
    render(<PrimarySkillsSection {...props} rows={[firstRow]} />);
    expect(screen.getByRole("button", { name: /を削除$/ })).toHaveProperty(
      "disabled",
      true,
    );
  });

  it("does not expose editable rows before a primary ryugi is selected", () => {
    const props = createProps();
    render(<PrimarySkillsSection {...props} primaryRyugiSelected={false} />);

    expect(
      screen.getByText("プライマリ流儀を選択してください。"),
    ).not.toBeNull();
    expect(screen.queryByRole("button", { name: /並べ替え:/ })).toBeNull();
  });

  it("folds independently and exposes maximum-level errors on the row", () => {
    const props = createProps();
    render(
      <PrimarySkillsSection
        {...props}
        hasPrimarySkillLevelTotalError
        invalidMaximumLevelRowIds={["first"]}
      />,
    );

    const section = screen.getByRole("region", {
      name: "プライマリ流儀スキル",
    });
    const toggle = screen.getByRole("button", { name: "プライマリ流儀" });
    const level = screen.getByLabelText("旋風Lv");

    expect(section.getAttribute("aria-invalid")).toBe("true");
    expect(level.getAttribute("aria-invalid")).toBe("true");
    expect(level.getAttribute("max")).toBe(
      String(props.rows[0]?.skill?.maxLevel),
    );

    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("button", { name: /並べ替え:/ })).toBeNull();
  });
});
