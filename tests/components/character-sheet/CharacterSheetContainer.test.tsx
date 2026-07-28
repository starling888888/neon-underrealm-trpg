// @vitest-environment jsdom

import { zodResolver } from "@hookform/resolvers/zod";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CharacterSheetContainer from "../../../src/character-sheet/CharacterSheetContainer";
import {
  type CharacterSheetFormValues,
  characterSheetDefaultValues,
} from "../../../src/character-sheet/form-values";
import { getIkizamaSkillGroups } from "../../../src/character-sheet/master-data/ikizama-skills";
import { getOtherRyugiSkillGroups } from "../../../src/character-sheet/master-data/other-ryugi-skills";
import { characterSheetFormSchema } from "../../../src/character-sheet/schemas/character-sheet-form";

const { useRootStateMock } = vi.hoisted(() => ({ useRootStateMock: vi.fn() }));

vi.mock("../../../src/character-sheet/useCharacterSheetRootState", () => ({
  default: useRootStateMock,
}));

function useRootStateHarness() {
  const form = useForm<CharacterSheetFormValues>({
    defaultValues: characterSheetDefaultValues,
    mode: "onChange",
    resolver: zodResolver(characterSheetFormSchema),
  });

  return {
    characterImage: null,
    form,
    imageError: null,
    imageErrorCloseButtonRef: useRef<HTMLButtonElement>(null),
    imageReturnFocusRef: useRef<HTMLButtonElement>(null),
    isRootOperationInProgress: false,
    onCharacterImageCleared: async () => {},
    onCharacterImageOperationStarted: () => {},
    onCharacterImageSelected: async () => {},
    rootOperation: null,
    setImageError: vi.fn(),
  };
}

beforeEach(() => {
  useRootStateMock.mockImplementation(useRootStateHarness);
  Object.defineProperties(HTMLDialogElement.prototype, {
    close: {
      configurable: true,
      value() {
        this.open = false;
      },
    },
    showModal: {
      configurable: true,
      value() {
        this.open = true;
      },
    },
  });
});

afterEach(() => {
  cleanup();
  useRootStateMock.mockReset();
});

describe("CharacterSheetContainer", () => {
  it("confirms an ikizama change only when normal ikizama skills are selected", async () => {
    const user = userEvent.setup();
    const [skill] = getIkizamaSkillGroups("burai", 1).basic;
    if (skill === undefined) {
      throw new Error("生き様スキル候補を取得できません。");
    }

    render(<CharacterSheetContainer />);

    const ikizamaSelect = screen.getByLabelText("生き様");
    await user.selectOptions(ikizamaSelect, "burai");
    await user.click(screen.getByRole("button", { name: "未選択スキル1" }));
    await user.click(screen.getByRole("button", { name: skill.name }));

    expect(screen.getByRole("button", { name: skill.name })).not.toBeNull();

    await user.selectOptions(ikizamaSelect, "kejime");
    const dialog = screen.getByRole("dialog", { name: "生き様の変更確認" });
    expect(dialog).not.toBeNull();
    expect(ikizamaSelect).toHaveProperty("value", "burai");

    act(() => {
      fireEvent(dialog, new Event("cancel", { cancelable: true }));
    });

    expect(document.activeElement).toBe(ikizamaSelect);
    expect(ikizamaSelect).toHaveProperty("value", "burai");
    expect(screen.getByRole("button", { name: skill.name })).not.toBeNull();

    await user.selectOptions(ikizamaSelect, "kejime");
    await user.click(screen.getByRole("button", { name: "変更" }));

    expect(ikizamaSelect).toHaveProperty("value", "kejime");
    expect(screen.queryByRole("button", { name: skill.name })).toBeNull();
  });

  it("confirms changing or removing an other ryugi only when it has selected skills", async () => {
    const user = userEvent.setup();
    const [skill] = getOtherRyugiSkillGroups("kenkaya", 1).basic;
    if (skill === undefined) {
      throw new Error("その他流儀スキル候補を取得できません。");
    }

    render(<CharacterSheetContainer />);

    await user.click(
      screen.getByRole("button", { name: "＋ その他流儀を追加" }),
    );
    const otherRyugiSelect = screen.getByLabelText("その他流儀1");
    await user.selectOptions(otherRyugiSelect, "kenkaya");
    await user.click(screen.getByRole("button", { name: "未選択スキル1" }));
    await user.click(screen.getByRole("button", { name: skill.name }));

    await user.selectOptions(otherRyugiSelect, "emono");
    const changeDialog = screen.getByRole("dialog", {
      name: "その他流儀の変更確認",
    });
    expect(otherRyugiSelect).toHaveProperty("value", "kenkaya");

    act(() => {
      fireEvent(changeDialog, new Event("cancel", { cancelable: true }));
    });

    expect(document.activeElement).toBe(otherRyugiSelect);
    expect(otherRyugiSelect).toHaveProperty("value", "kenkaya");

    await user.selectOptions(otherRyugiSelect, "emono");
    await user.click(screen.getByRole("button", { name: "変更" }));
    expect(otherRyugiSelect).toHaveProperty("value", "emono");
    expect(screen.queryByRole("button", { name: skill.name })).toBeNull();

    await user.click(screen.getByRole("button", { name: "未選択スキル1" }));
    const [emonoSkill] = getOtherRyugiSkillGroups("emono", 1).basic;
    if (emonoSkill === undefined) {
      throw new Error("その他流儀スキル候補を取得できません。");
    }
    await user.click(screen.getByRole("button", { name: emonoSkill.name }));
    const removeButton = screen.getByRole("button", {
      name: "その他流儀1を削除",
    });
    await user.click(removeButton);

    const removeDialog = screen.getByRole("dialog", {
      name: "その他流儀の削除確認",
    });
    expect(
      screen.getByText(
        "削除すると、現在選択中のスキルが消去されます。本当によろしいですか？",
      ),
    ).not.toBeNull();
    await user.click(screen.getByRole("button", { name: "キャンセル" }));
    expect(document.activeElement).toBe(removeButton);

    await user.click(removeButton);
    expect(removeDialog).not.toBeNull();
    await user.click(screen.getByRole("button", { name: "削除" }));
    expect(screen.queryByLabelText("その他流儀1")).toBeNull();
    expect(screen.queryByRole("button", { name: emonoSkill.name })).toBeNull();
  });
});
