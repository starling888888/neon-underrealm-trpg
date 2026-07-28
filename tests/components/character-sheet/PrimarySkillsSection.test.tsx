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
    hasPrimarySkillLevelTotalError: false,
    invalidDuplicateSkillRowIds: [],
    invalidMaximumLevelRowIds: [],
    maximumSkillNameLength: 8,
    onAdd: vi.fn(),
    onLevelChange: vi.fn((_rowId, value: string) => Number(value)),
    onMove: vi.fn(),
    onPickerRequest: vi.fn(),
    onRemove: vi.fn(),
    primaryRyugiName: "ケンカヤ",
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

    expect(
      screen.getByRole("group", { name: props.bonusSkills[0]?.name ?? "" }),
    ).not.toBeNull();
    expect(screen.getAllByRole("button", { name: /へ移動$/ })).toHaveLength(2);
    expect(screen.getByText("名称")).not.toBeNull();
    expect(screen.getByText("タイミング")).not.toBeNull();
    expect(
      document.querySelector('[data-skill-row-kind="automatic"]')?.textContent,
    ).toContain("1");
    expect(screen.queryByText("取得制限")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "名称" }));
    expect(
      screen.getByRole("tooltip", {
        name: "名称欄をクリックするとスキル選択ダイアログが開きます。",
      }),
    ).not.toBeNull();

    fireEvent.click(
      screen.getByRole("button", { name: props.rows[0]?.skill?.name ?? "" }),
    );

    expect(props.onPickerRequest).toHaveBeenCalledWith(
      "first",
      expect.any(HTMLButtonElement),
    );

    fireEvent.click(screen.getByRole("button", { name: "旋風の詳細を開く" }));
    expect(screen.getByText("取得制限")).not.toBeNull();
    expect(
      document.querySelectorAll("[data-skill-mobile-metadata]"),
    ).toHaveLength(1);
    expect(
      document.querySelector("[data-skill-mobile-metadata]")?.textContent,
    ).toContain("コスト");
    expect(
      document.querySelector("[data-skill-mobile-metadata]")?.textContent,
    ).toContain("使用制限");
  });

  it("moves normal rows one step with only valid direction buttons", () => {
    const props = createProps();
    render(<PrimarySkillsSection {...props} />);

    const firstName = props.rows[0]?.skill?.name ?? "未選択";
    const secondName = props.rows[1]?.skill?.name ?? "未選択";
    expect(
      screen.queryByRole("button", { name: `${firstName}上へ移動` }),
    ).toBeNull();
    expect(
      screen.getByRole("button", { name: `${firstName}下へ移動` }),
    ).not.toBeNull();
    expect(
      screen.getByRole("button", { name: `${secondName}上へ移動` }),
    ).not.toBeNull();
    expect(
      screen.queryByRole("button", { name: `${secondName}下へ移動` }),
    ).toBeNull();

    fireEvent.click(
      screen.getByRole("button", { name: `${firstName}下へ移動` }),
    );
    expect(props.onMove).toHaveBeenCalledWith("first", "down");

    cleanup();
    const [firstRow] = props.rows;
    if (firstRow === undefined) {
      throw new Error("先頭スキル行を取得できません。");
    }
    render(<PrimarySkillsSection {...props} rows={[firstRow]} />);
    expect(screen.queryByRole("button", { name: /へ移動$/ })).toBeNull();
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
    expect(screen.queryByRole("button", { name: /へ移動$/ })).toBeNull();
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
    const toggle = screen.getByRole("button", {
      name: "プライマリ流儀：ケンカヤ",
    });
    const level = screen.getByLabelText("旋風Lv");

    expect(section.getAttribute("aria-invalid")).toBe("true");
    expect(level.getAttribute("aria-invalid")).toBe("true");
    expect(level.getAttribute("max")).toBe(
      String(props.rows[0]?.skill?.maxLevel),
    );

    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("button", { name: /へ移動$/ })).toBeNull();
  });

  it("keeps a skill level input uncontrolled and synchronizes an external update", () => {
    const props = createProps();
    const { rerender } = render(<PrimarySkillsSection {...props} />);
    const level = screen.getByLabelText("旋風Lv") as HTMLInputElement;

    level.focus();
    fireEvent.change(level, { target: { value: "2" } });
    expect(props.onLevelChange).toHaveBeenCalledWith("first", "2");

    rerender(
      <PrimarySkillsSection
        {...props}
        rows={props.rows.map((row) =>
          row.rowId === "first" ? { ...row, level: 9 } : row,
        )}
      />,
    );

    expect(level.value).toBe("9");
    expect(document.activeElement).toBe(level);
  });

  it("marks every duplicate selected skill row as invalid", () => {
    const props = createProps();
    const [firstRow, secondRow] = props.rows;
    if (firstRow === undefined || secondRow === undefined) {
      throw new Error("重複確認用のスキル行を取得できません。");
    }

    render(
      <PrimarySkillsSection
        {...props}
        invalidDuplicateSkillRowIds={[firstRow.rowId, secondRow.rowId]}
      />,
    );

    expect(
      screen
        .getByRole("region", { name: "プライマリ流儀スキル" })
        .getAttribute("aria-invalid"),
    ).toBe("true");
    expect(
      document
        .querySelector(`[data-skill-row="${firstRow.rowId}"]`)
        ?.getAttribute("data-invalid"),
    ).toBe("true");
    expect(
      document
        .querySelector(`[data-skill-row="${secondRow.rowId}"]`)
        ?.getAttribute("data-invalid"),
    ).toBe("true");
    expect(
      screen
        .getByLabelText(`${firstRow.skill?.name ?? ""}Lv`)
        .getAttribute("aria-invalid"),
    ).toBe("true");
    expect(
      screen
        .getByLabelText(`${secondRow.skill?.name ?? ""}Lv`)
        .getAttribute("aria-invalid"),
    ).toBe("true");
  });

  it("gives each unselected row a distinct accessible name", () => {
    const props = createProps();
    const blankRows = props.rows.map((row) => ({
      ...row,
      skill: null,
      skillId: null,
    }));

    render(<PrimarySkillsSection {...props} rows={blankRows} />);

    expect(
      screen.getByRole("button", { name: "未選択スキル1" }),
    ).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "未選択スキル2" }),
    ).not.toBeNull();
    expect(screen.getByLabelText("未選択スキル1Lv")).not.toBeNull();
    expect(screen.getByLabelText("未選択スキル2Lv")).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "未選択スキル1下へ移動" }),
    ).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "未選択スキル2上へ移動" }),
    ).not.toBeNull();
  });

  it("updates the displayed level when a selected skill resets it", () => {
    const props = createProps();
    const selectedRow = props.rows.find(
      (row) => (row.skill?.maxLevel ?? 0) >= 2,
    );
    if (selectedRow?.skill === null || selectedRow?.skill === undefined) {
      throw new Error("Lv2以上のスキル行を取得できません。");
    }
    const selectedName = selectedRow.skill.name;
    const selectedRows = props.rows.map((row) =>
      row.rowId === selectedRow.rowId ? { ...row, level: 2 } : row,
    );
    const { rerender } = render(
      <PrimarySkillsSection {...props} rows={selectedRows} />,
    );

    expect(screen.getByLabelText(`${selectedName}Lv`)).toHaveProperty(
      "value",
      "2",
    );

    rerender(
      <PrimarySkillsSection
        {...props}
        rows={selectedRows.map((row) =>
          row.rowId === selectedRow.rowId ? { ...row, level: 1 } : row,
        )}
      />,
    );

    expect(screen.getByLabelText(`${selectedName}Lv`)).toHaveProperty(
      "value",
      "1",
    );
  });
});
