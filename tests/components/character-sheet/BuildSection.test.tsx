// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import BuildSection, {
  type BuildSectionProps,
} from "../../../src/character-sheet/components/BuildSection";
import { characterSheetDefaultValues } from "../../../src/character-sheet/form-values";
import { calculateBuild } from "../../../src/character-sheet/logic/build";

function createProps(): BuildSectionProps {
  const build = characterSheetDefaultValues.build;

  return {
    build,
    derived: calculateBuild(build),
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
  };
}

afterEach(cleanup);

describe("BuildSection", () => {
  it("shows the specified unselected state and lets the player choose data", async () => {
    const user = userEvent.setup();
    const props = createProps();

    render(<BuildSection {...props} />);

    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
    expect(screen.getByText("能力値ポイント: 0, 0, 0, 0")).not.toBeNull();
    expect(screen.getByText("Lv 2で獲得")).not.toBeNull();

    await user.selectOptions(
      screen.getByLabelText("プライマリ流儀"),
      "kenkaya",
    );
    await user.click(
      screen.getByRole("button", { name: "＋ その他流儀を追加" }),
    );

    expect(props.onPrimaryRyugiChange).toHaveBeenCalledWith("kenkaya");
    expect(props.onOtherRyugiAdd).toHaveBeenCalledOnce();
  });
});
