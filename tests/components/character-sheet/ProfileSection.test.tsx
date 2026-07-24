// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import ProfileSection, {
  type ProfileSectionProps,
} from "../../../src/character-sheet/components/ProfileSection";
import { characterSheetDefaultValues } from "../../../src/character-sheet/form-values";

function createProps(): ProfileSectionProps {
  return {
    credit: characterSheetDefaultValues.credit,
    creditSummary: { change: 10, totalCredit: 10 },
    onCreditBlur: vi.fn((_, value: string) => Number(value)),
    onCreditChange: vi.fn(),
    onProfileChange: vi.fn(),
    profile: characterSheetDefaultValues.profile,
  };
}

afterEach(cleanup);

describe("ProfileSection", () => {
  it("keeps setting expansion local and reports editable field changes", async () => {
    const user = userEvent.setup();
    const props = createProps();

    render(<ProfileSection {...props} />);

    const settingToggle = screen.getByRole("button", {
      name: /^設定$/,
    });
    const setting = screen.getByLabelText("設定", { exact: true });
    const settingContent = setting.parentElement;

    if (settingContent === null) {
      throw new Error("設定入力の表示領域を取得できません。");
    }

    expect(settingToggle.getAttribute("aria-expanded")).toBe("false");
    expect(settingContent.hidden).toBe(true);

    await user.click(settingToggle);

    expect(settingToggle.getAttribute("aria-expanded")).toBe("true");
    expect(settingContent.hidden).toBe(false);

    fireEvent.change(screen.getByLabelText("PC名", { exact: true }), {
      target: { value: "ネオン" },
    });
    fireEvent.change(setting, { target: { value: "雨の夜\nネオン" } });

    expect(props.onProfileChange).toHaveBeenCalledWith("pcName", "ネオン");
    expect(props.onProfileChange).toHaveBeenCalledWith(
      "setting",
      "雨の夜\nネオン",
    );
  });

  it("opens and dismisses the formula tooltip without involving form state", () => {
    render(<ProfileSection {...createProps()} />);

    fireEvent.click(screen.getByRole("button", { name: /合計信用/ }));

    expect(screen.getByRole("tooltip").textContent).toBe(
      "取得信用 + 融通された信用 - 融通した信用",
    );

    fireEvent.click(
      screen.getByRole("button", { name: "計算式の説明を閉じる" }),
    );

    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("keeps a signed number field editable through its minus intermediate state", async () => {
    const user = userEvent.setup();
    const props = createProps();

    render(<ProfileSection {...props} />);

    const changeAdjustment = screen.getByRole("spinbutton", {
      name: "小銭修正",
    });

    await user.clear(changeAdjustment);

    expect(props.onCreditChange).toHaveBeenCalledWith("changeAdjustment", "");

    await user.type(changeAdjustment, "-1");

    expect((changeAdjustment as HTMLInputElement).value).toBe("-1");
    expect(props.onCreditChange).toHaveBeenLastCalledWith(
      "changeAdjustment",
      "-1",
    );

    await user.tab();

    expect(props.onCreditBlur).toHaveBeenCalledWith("changeAdjustment", "-1");
    expect((changeAdjustment as HTMLInputElement).value).toBe("-1");
  });

  it("commits an emptied credit field as zero on blur", async () => {
    const user = userEvent.setup();
    const props = createProps();

    render(<ProfileSection {...props} />);

    const acquiredCredit = screen.getByRole("spinbutton", {
      name: "取得信用",
    });

    await user.clear(acquiredCredit);
    await user.tab();

    expect(props.onCreditBlur).toHaveBeenCalledWith("acquired", "");
    expect((acquiredCredit as HTMLInputElement).value).toBe("0");
  });
});
