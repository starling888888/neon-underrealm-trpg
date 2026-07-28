// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import BuildSection, {
  type BuildSectionProps,
} from "../../../src/character-sheet/components/BuildSection";
import styles from "../../../src/character-sheet/components/BuildSection.module.css";
import { characterSheetDictionary } from "../../../src/character-sheet/dictionary";
import { characterSheetDefaultValues } from "../../../src/character-sheet/form-values";
import { calculateBuild } from "../../../src/character-sheet/logic/build";

function createProps(): BuildSectionProps {
  const build = characterSheetDefaultValues.build;

  return {
    build,
    derived: calculateBuild(build),
    hasIkizamaSkillLevelError: false,
    invalidOtherRyugiSkillLevelRowIds: [],
    hasPrimarySkillLevelError: false,
    ikizamaOptions: [{ id: "burai", name: "ブライ" }],
    onAttributeChange: vi.fn(),
    onAttributeCommit: vi.fn((_, __, value: string) => Number(value)),
    onIkizamaChange: vi.fn(),
    onIkizamaLevelChange: vi.fn((value: string) => Number(value)),
    onOtherRyugiAdd: vi.fn(),
    onOtherRyugiChange: vi.fn(),
    onOtherRyugiCommit: vi.fn((_, value: string) => Number(value)),
    onOtherRyugiRemove: vi.fn(),
    onPrimaryRyugiChange: vi.fn(),
    onPrimaryRyugiLevelChange: vi.fn((value: string) => Number(value)),
    onPrimaryRyugiLevelCommit: vi.fn((value: string) => Number(value)),
    ryugiOptions: [{ id: "kenkaya", name: "ケンカヤ" }],
    unlockedCommonSkillBonusLevels: [],
  };
}

afterEach(cleanup);

describe("BuildSection", () => {
  it("shows the specified unselected state and lets the player choose data", async () => {
    const user = userEvent.setup();
    const props = createProps();

    render(<BuildSection {...props} />);

    expect(screen.getAllByText("-").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", { name: "能力値ポイント" }),
    ).not.toBeNull();
    expect(screen.getByText(": -")).not.toBeNull();
    expect(screen.getByRole("button", { name: "成長点" })).not.toBeNull();
    expect(screen.getByText(": 0")).not.toBeNull();
    expect(screen.getByText("Lv 2で獲得")).not.toBeNull();
    expect(
      (screen.getByLabelText("プライマリ流儀Lv") as HTMLInputElement).value,
    ).toBe("1");
    expect((screen.getByLabelText("生き様Lv") as HTMLInputElement).value).toBe(
      "1",
    );

    fireEvent.click(screen.getByRole("button", { name: /成長点/ }));

    expect(screen.getByRole("tooltip").textContent).toBe(
      characterSheetDictionary.characterSheet.build.formulas.growthPoints,
    );

    fireEvent.click(screen.getByRole("button", { name: "常時修正" }));

    expect(
      screen.getByText(
        characterSheetDictionary.characterSheet.build.tooltips
          .permanentModifier,
      ),
    ).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "一時修正" }));

    expect(
      screen.getByText(
        characterSheetDictionary.characterSheet.build.tooltips
          .temporaryModifier,
      ),
    ).not.toBeNull();

    await user.selectOptions(
      screen.getByLabelText("プライマリ流儀"),
      "kenkaya",
    );
    await user.selectOptions(screen.getByLabelText("生き様"), "burai");
    await user.click(
      screen.getByRole("button", { name: "＋ その他流儀を追加" }),
    );

    expect(props.onPrimaryRyugiChange).toHaveBeenCalledWith(
      "kenkaya",
      expect.any(HTMLSelectElement),
    );
    expect(props.onIkizamaChange).toHaveBeenCalledWith(
      "burai",
      expect.any(HTMLSelectElement),
    );
    expect(props.onOtherRyugiAdd).toHaveBeenCalledOnce();
  });

  it("marks the ryugi pane invalid when primary skill levels are insufficient", () => {
    const props = createProps();
    render(<BuildSection {...props} hasPrimarySkillLevelError />);

    expect(
      screen
        .getByRole("region", { name: "流儀・生き様" })
        .getAttribute("aria-invalid"),
    ).toBe("true");
  });

  it("marks the ryugi pane invalid when ikizama skill levels exceed its level", () => {
    const props = createProps();
    render(<BuildSection {...props} hasIkizamaSkillLevelError />);

    expect(
      screen
        .getByRole("region", { name: "流儀・生き様" })
        .getAttribute("aria-invalid"),
    ).toBe("true");
  });

  it("highlights only the common-skill bonuses whose thresholds are reached", () => {
    const props = createProps();
    render(<BuildSection {...props} unlockedCommonSkillBonusLevels={[2, 5]} />);

    const level2 = screen.getByText("Lv 2で獲得").parentElement;
    const level5 = screen.getByText("Lv 5で獲得").parentElement;
    const level9 = screen.getByText("Lv 9で獲得").parentElement;

    expect(level2?.classList.contains(styles.commonSkillBonusUnlocked)).toBe(
      true,
    );
    expect(level5?.classList.contains(styles.commonSkillBonusUnlocked)).toBe(
      true,
    );
    expect(level9?.classList.contains(styles.commonSkillBonusUnlocked)).toBe(
      false,
    );
  });

  it("uses headers for other ryugi rows and keeps removal accessible", () => {
    const props = createProps();
    props.build = {
      ...props.build,
      otherRyugi: [{ level: 1, rowId: "other-ryugi-1", ryugiId: null }],
    };
    props.derived = calculateBuild(props.build);

    render(<BuildSection {...props} />);

    expect(
      screen.getByText("その他流儀", { exact: true }).parentElement
        ?.textContent,
    ).toBe("その他流儀Lv");
    expect(screen.getByText("その他流儀1").className).toContain(
      "visuallyHidden",
    );

    fireEvent.click(screen.getByRole("button", { name: "その他流儀1を削除" }));

    expect(props.onOtherRyugiRemove).toHaveBeenCalledWith(
      0,
      expect.any(HTMLButtonElement),
    );
  });

  it("keeps attribute rows in canonical order after values are reconstructed", () => {
    const props = createProps();
    props.build = {
      ...props.build,
      attributes: {
        mind: props.build.attributes.mind,
        body: props.build.attributes.body,
        perception: props.build.attributes.perception,
        agility: props.build.attributes.agility,
        strength: props.build.attributes.strength,
      },
    };
    props.derived = calculateBuild(props.build);

    render(<BuildSection {...props} />);

    const pointInputs = ["筋力", "敏捷", "感覚", "肉体", "精神"].map(
      (attributeName) =>
        screen.getByLabelText(`${attributeName}能力値ポイント`),
    );

    expect(
      pointInputs.every(
        (input, index) =>
          index === 0 ||
          (pointInputs[index - 1].compareDocumentPosition(input) &
            Node.DOCUMENT_POSITION_FOLLOWING) !==
            0,
      ),
    ).toBe(true);
  });
});
