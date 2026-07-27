// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import ProfileSection, {
  type ProfileSectionProps,
} from "../../../src/character-sheet/components/ProfileSection";
import { characterSheetDefaultValues } from "../../../src/character-sheet/form-values";
import { calculateBuild } from "../../../src/character-sheet/logic/build";

function createProps(): ProfileSectionProps {
  return {
    characterImage: null,
    credit: characterSheetDefaultValues.credit,
    creditSummary: { change: 10, totalCredit: 10 },
    experience: {
      acquired: characterSheetDefaultValues.build.acquiredExperience,
      derived: calculateBuild(characterSheetDefaultValues.build),
      onAcquiredChange: vi.fn((value: string) => Number(value)),
    },
    isRootOperationInProgress: false,
    onCharacterImageCleared: vi.fn(),
    onCharacterImageSelected: vi.fn(),
    onCharacterImageOperationStarted: vi.fn(),
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

  it("shows experience near credit and explains the rank formula", () => {
    render(<ProfileSection {...createProps()} />);

    expect(
      (
        screen.getByRole("spinbutton", {
          name: "取得経験点",
        }) as HTMLInputElement
      ).value,
    ).toBe("50");
    expect(
      screen.getByText("2", { exact: true, selector: "output" }),
    ).not.toBeNull();
    expect(screen.queryByRole("button", { name: "消費経験点" })).toBeNull();
    expect(screen.queryByRole("button", { name: "残経験点" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /格/ }));

    expect(screen.getByRole("tooltip").textContent).toBe(
      "プライマリ流儀レベル + 生き様レベル",
    );
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

  it("reports files selected by the input and the drop area", () => {
    const props = createProps();
    const { container } = render(<ProfileSection {...props} />);
    const file = new File(["image"], "character.png", { type: "image/png" });
    const fileInput =
      container.querySelector<HTMLInputElement>('input[type="file"]');

    if (fileInput === null) {
      throw new Error("画像入力を取得できません。");
    }

    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.drop(
      screen.getByRole("button", { name: "画像を選択またはドロップ" }),
      {
        dataTransfer: { files: [file] },
      },
    );

    expect(props.onCharacterImageSelected).toHaveBeenCalledTimes(2);
    expect(props.onCharacterImageSelected).toHaveBeenLastCalledWith(file);
    expect(props.onCharacterImageOperationStarted).toHaveBeenCalledWith(
      screen.getByRole("button", { name: "画像を選択またはドロップ" }),
    );
  });

  it("shows a saved image in the same input area", () => {
    const props = createProps();

    render(
      <ProfileSection
        {...props}
        characterImage={{ base64: "cHJldmlldw==", mimeType: "image/webp" }}
      />,
    );

    expect(
      screen
        .getByRole("img", { name: "選択したキャラクター画像" })
        .getAttribute("src"),
    ).toBe("data:image/webp;base64,cHJldmlldw==");
    expect(
      screen.getByRole("button", { name: "画像を差し替えまたはドロップ" }),
    ).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "画像をクリア" }));

    expect(props.onCharacterImageCleared).toHaveBeenCalledOnce();
    expect(props.onCharacterImageOperationStarted).toHaveBeenCalledWith(
      screen.getByRole("button", { name: "画像をクリア" }),
    );
  });
});
