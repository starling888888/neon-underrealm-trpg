// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import IkizamaSkillsSection, {
  type IkizamaSkillsSectionProps,
} from "../../../src/character-sheet/components/IkizamaSkillsSection";
import { getIkizamaSkillGroups } from "../../../src/character-sheet/master-data/ikizama-skills";

function createProps(): IkizamaSkillsSectionProps {
  const groups = getIkizamaSkillGroups("burai", 1);
  const [skill] = groups.basic;

  if (skill === undefined) {
    throw new Error("生き様スキル候補を取得できません。");
  }

  return {
    bonusLevel: 1,
    bonusSkill: groups.bonus[0] ?? null,
    hasIkizamaSkillLevelTotalError: false,
    invalidAdvancedSkillRowIds: [],
    invalidDuplicateSkillRowIds: [],
    invalidMaximumLevelRowIds: [],
    ikizamaName: "ブライ",
    ikizamaSelected: true,
    maximumSkillNameLength: 8,
    onAdd: vi.fn(),
    onLevelChange: vi.fn((_rowId, value: string) => Number(value)),
    onMove: vi.fn(),
    onPickerRequest: vi.fn(),
    onRemove: vi.fn(),
    rows: [{ level: 1, rowId: "only", skill, skillId: skill.id }],
  };
}

afterEach(cleanup);

describe("IkizamaSkillsSection", () => {
  it("allows removing the last normal row while retaining bonus and add controls", () => {
    const props = createProps();
    const normalRow = props.rows[0];
    if (normalRow === undefined || normalRow.skill === null) {
      throw new Error("通常スキル行を取得できません。");
    }

    const { rerender } = render(<IkizamaSkillsSection {...props} />);
    const removeButton = screen.getByRole("button", {
      name: `${normalRow.skill.name}を削除`,
    });

    expect(removeButton).toHaveProperty("disabled", false);
    fireEvent.click(removeButton);
    expect(props.onRemove).toHaveBeenCalledWith(normalRow.rowId);

    rerender(<IkizamaSkillsSection {...props} rows={[]} />);
    expect(
      screen.queryByRole("button", { name: `${normalRow.skill.name}を削除` }),
    ).toBeNull();
    expect(
      screen.getByRole("button", { name: /スキルを追加$/ }),
    ).not.toBeNull();
    expect(
      screen.getByRole("group", { name: props.bonusSkill?.name ?? "" }),
    ).not.toBeNull();
  });

  it("names the editable bonus row and links its details toggle to details", () => {
    const props = createProps();
    const bonusName = props.bonusSkill?.name;
    if (bonusName === undefined) {
      throw new Error("ボーナススキルを取得できません。");
    }

    render(<IkizamaSkillsSection {...props} />);

    expect(screen.getByRole("group", { name: bonusName })).not.toBeNull();
    expect(screen.getByLabelText(`${bonusName}Lv`)).not.toBeNull();

    const detailsToggle = screen.getByRole("button", {
      name: `${bonusName}の詳細を開く`,
    });
    fireEvent.click(detailsToggle);

    const detailsId = detailsToggle.getAttribute("aria-controls");
    expect(detailsId).not.toBeNull();
    expect(document.getElementById(detailsId ?? "")).not.toBeNull();
  });
});
