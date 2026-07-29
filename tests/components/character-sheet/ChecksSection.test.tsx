// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import ChecksSection, {
  type ChecksSectionProps,
} from "../../../src/character-sheet/components/ChecksSection";
import { characterSheetDefaultValues } from "../../../src/character-sheet/form-values";
import { calculateChecks } from "../../../src/character-sheet/logic/checks";

const attributes = {
  agility: { permanent: 2, temporary: 3 },
  body: { permanent: 4, temporary: 5 },
  mind: { permanent: 6, temporary: 7 },
  perception: { permanent: 8, temporary: 9 },
  strength: { permanent: 10, temporary: 11 },
};

function createProps(): ChecksSectionProps {
  const checks = structuredClone(characterSheetDefaultValues.checks);
  const derived = calculateChecks(checks, attributes);

  return {
    attacks: derived.attacks,
    onAttackAdd: vi.fn(),
    onAttackAttributeChange: vi.fn(),
    onAttackModifierChange: vi.fn((_, value: string) => Number(value)),
    onAttackRemove: vi.fn(),
    onAttackSkillChange: vi.fn(),
    onNoncombatFavoriteChange: vi.fn(),
    onNoncombatModifierChange: vi.fn((_, value: string) => Number(value)),
    onReactionAttributeChange: vi.fn(),
    onReactionModifierChange: vi.fn((_, value: string) => Number(value)),
    noncombat: derived.noncombat,
    reactions: derived.reactions,
  };
}

afterEach(cleanup);

describe("ChecksSection", () => {
  it("shows the requested headers, formula tooltip, and default rows", () => {
    const props = createProps();

    render(<ChecksSection {...props} />);

    expect(screen.getAllByText("技能")).toHaveLength(2);
    expect(screen.getAllByText("対応能力")).toHaveLength(2);
    expect(screen.getAllByText("常時／一時")).toHaveLength(2);
    expect(screen.getByLabelText("攻撃1の技能")).toHaveProperty(
      "value",
      "brawl",
    );
    expect(screen.getByLabelText("攻撃1の対応能力")).toHaveProperty(
      "value",
      "strength",
    );
    expect(
      Array.from(
        (screen.getByLabelText("攻撃1の技能") as HTMLSelectElement).options,
        (option) => option.text,
      ),
    ).toEqual(["喧嘩", "暗殺", "発砲", "格闘", "干渉"]);
    expect(
      Array.from(
        (screen.getByLabelText("攻撃1の対応能力") as HTMLSelectElement).options,
        (option) => option.text,
      ),
    ).toEqual(["筋力", "敏捷", "感覚", "肉体", "精神"]);
    expect(screen.getByRole("group", { name: "攻撃1" })).not.toBeNull();
    expect(screen.getByRole("group", { name: "防御" })).not.toBeNull();
    expect(screen.getByRole("group", { name: "抵抗" })).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "攻撃の判定数の説明" }));

    expect(screen.getByRole("tooltip").textContent).toBe(
      "判定数=対応能力 + 修正。\n\n修正はサイバネなど能力値ではなく判定数に影響を与えるスキル、アイテムの効果の数値を入力します。",
    );
  });

  it("keeps the final attack remove action unavailable and exposes row actions", () => {
    const props = createProps();

    render(<ChecksSection {...props} />);

    const remove = screen.getByRole("button", { name: "攻撃1を削除" });
    expect(remove).toHaveProperty("disabled", true);

    fireEvent.click(screen.getByRole("button", { name: "＋ 攻撃を追加" }));
    fireEvent.change(screen.getByLabelText("攻撃1の技能"), {
      target: { value: "shooting" },
    });
    fireEvent.change(screen.getByLabelText("防御の対応能力"), {
      target: { value: "agility" },
    });
    fireEvent.change(screen.getByLabelText("攻撃1の判定修正"), {
      target: { value: "2" },
    });

    expect(props.onAttackAdd).toHaveBeenCalledOnce();
    expect(props.onAttackSkillChange).toHaveBeenCalledWith(
      "attack-1",
      "shooting",
    );
    expect(props.onReactionAttributeChange).toHaveBeenCalledWith(
      "reaction-defense",
      "agility",
    );
    expect(props.onAttackModifierChange).toHaveBeenCalledWith("attack-1", "2");
  });

  it("disables attack addition at five rows", () => {
    const props = createProps();
    props.attacks = Array.from({ length: 5 }, (_, index) => ({
      ...props.attacks[0],
      rowId: `attack-${index + 1}`,
    }));

    render(<ChecksSection {...props} />);

    expect(
      screen.getByRole("button", { name: "＋ 攻撃を追加" }),
    ).toHaveProperty("disabled", true);
  });

  it("groups noncombat skills by attribute and explains them from the title tooltip", () => {
    const props = createProps();

    render(<ChecksSection {...props} />);

    const toggle = screen.getByRole("button", { name: "非戦闘技能を開閉" });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(screen.getAllByText("技能")).toHaveLength(2);
    expect(screen.getAllByText("対応能力")).toHaveLength(2);
    expect(screen.getAllByText("常時／一時")).toHaveLength(2);
    expect(screen.queryByText("対応能力：筋力")).toBeNull();
    expect(screen.queryByText("対応能力：精神")).toBeNull();
    expect(screen.queryByRole("checkbox")).toBeNull();

    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("対応能力：筋力")).not.toBeNull();
    expect(screen.getByText("対応能力：精神")).not.toBeNull();
    expect(screen.getAllByRole("checkbox")).toHaveLength(15);
    expect(screen.getByLabelText("脅迫を得意技能にする")).not.toBeNull();
    expect(screen.getByLabelText("ハッキングの判定修正")).not.toBeNull();
    expect(screen.getByRole("group", { name: "脅迫" })).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "非戦闘技能の説明" }));
    expect(screen.getByRole("tooltip").textContent).toBe(
      "チェックを入れると得意技能となります。得意技能は能力値を2倍にして判定数を算出します。修正は2倍になりません。\n修正はサイバネなど能力値ではなく、判定数に影響を与えるスキル、アイテムの効果の数値を入力します。\n判定数は「常時能力値を用いた判定数／一時能力値を用いた判定数」です。\n折りたたみ中は得意技能だけ表示されます。",
    );
  });

  it("reports noncombat favorite and modifier changes before collapsing", () => {
    const props = createProps();

    const { rerender } = render(<ChecksSection {...props} />);

    fireEvent.click(screen.getByRole("button", { name: "非戦闘技能を開閉" }));
    fireEvent.click(screen.getByLabelText("脅迫を得意技能にする"));
    fireEvent.change(screen.getByLabelText("脅迫の判定修正"), {
      target: { value: "-12" },
    });
    props.noncombat = props.noncombat.map((row) =>
      row.id === "intimidation" ? { ...row, isFavorite: true } : row,
    );
    rerender(<ChecksSection {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "非戦闘技能を開閉" }));

    expect(props.onNoncombatFavoriteChange).toHaveBeenCalledWith(
      "intimidation",
      true,
    );
    expect(props.onNoncombatModifierChange).toHaveBeenCalledWith(
      "intimidation",
      "-12",
    );
    expect(screen.getByRole("checkbox")).not.toBeNull();
    expect(screen.queryByText("対応能力：筋力")).toBeNull();
  });
});
