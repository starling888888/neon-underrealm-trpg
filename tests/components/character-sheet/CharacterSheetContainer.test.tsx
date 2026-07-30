// @vitest-environment jsdom

import { zodResolver } from "@hookform/resolvers/zod";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CharacterSheetContainer from "../../../src/character-sheet/CharacterSheetContainer";
import {
  type CharacterSheetFormValues,
  characterSheetDefaultValues,
} from "../../../src/character-sheet/form-values";
import { getCybernetics } from "../../../src/character-sheet/master-data/cybernetics";
import { getDrugs } from "../../../src/character-sheet/master-data/drugs";
import { getIkizamaSkillGroups } from "../../../src/character-sheet/master-data/ikizama-skills";
import { getNanomachines } from "../../../src/character-sheet/master-data/nanomachines";
import { getOmamori } from "../../../src/character-sheet/master-data/omamori";
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
    isImageErrorFromJsonImport: false,
    isImageErrorFromReset: false,
    imageErrorCloseButtonRef: useRef<HTMLButtonElement>(null),
    imageReturnFocusRef: useRef<HTMLButtonElement>(null),
    isCharacterImageRestoring: false,
    isRootOperationInProgress: false,
    onCharacterImageCleared: async () => {},
    onCharacterImageOperationStarted: () => {},
    onCharacterImageSelected: async () => {},
    onJsonExport: () => {},
    onResetConfirmed: async () => {},
    rootOperation: null,
    setImageError: vi.fn(),
  };
}

function useJsonImportImageErrorHarness() {
  const rootState = useRootStateHarness();
  const jsonImportReturnFocusRef = useRef<HTMLButtonElement>(null);
  const [imageError, setImageError] = useState<{ code: "storage" } | null>({
    code: "storage",
  });

  return {
    ...rootState,
    imageError,
    isImageErrorFromJsonImport: true,
    jsonImportReturnFocusRef,
    onJsonImportRequested: (trigger: HTMLButtonElement) => {
      jsonImportReturnFocusRef.current = trigger;
    },
    setImageError,
  };
}

function useResetImageErrorHarness() {
  const rootState = useRootStateHarness();
  const [imageError, setImageError] = useState<{ code: "storage" } | null>(
    null,
  );

  return {
    ...rootState,
    imageError,
    isImageErrorFromReset: imageError !== null,
    onResetConfirmed: async () => setImageError({ code: "storage" }),
    setImageError,
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
  it("keeps focus while typing a bond target and relation", async () => {
    const user = userEvent.setup();
    render(<CharacterSheetContainer />);

    const target = screen.getByLabelText("縁1の対象");
    const relation = screen.getByLabelText("縁1の関係");

    await user.type(target, "アキラ");
    expect((target as HTMLInputElement).value).toBe("アキラ");
    expect(document.activeElement).toBe(target);

    await user.type(relation, "仕事仲間");
    expect((relation as HTMLInputElement).value).toBe("仕事仲間");
    expect(document.activeElement).toBe(relation);
  });

  it("renders action buttons and an empty desktop error summary", () => {
    render(<CharacterSheetContainer />);

    const exportButton = screen.getByRole("button", {
      name: "エクスポート",
    });

    expect(exportButton).not.toBeNull();
    expect(exportButton.getAttribute("aria-controls")).toBeNull();
    expect(screen.getAllByText("エラーはありません。")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "確認" })).not.toBeNull();
  });

  it("confirms reset with the specified copy, actions, and focus behaviour", async () => {
    const user = userEvent.setup();
    const onResetConfirmed = vi.fn(async () => {});
    useRootStateMock.mockImplementation(() => ({
      ...useRootStateHarness(),
      onResetConfirmed,
    }));
    render(<CharacterSheetContainer />);

    const trigger = screen.getAllByRole("button", { name: "初期化" })[0];
    if (trigger === undefined) throw new Error("初期化buttonがありません。");
    await user.click(trigger);

    const dialog = screen.getByRole("dialog", { name: "入力内容を初期化" });
    expect(dialog.querySelector("h2")).toBeNull();
    const message = Array.from(dialog.querySelectorAll("p")).find(
      (element) =>
        element.textContent ===
        "入力済みのデータと画像を初期状態に戻します。\n本当によろしいですか？",
    );
    if (message === undefined) {
      throw new Error("改行を含む初期化確認本文がありません。");
    }
    const resetButton = Array.from(dialog.querySelectorAll("button")).find(
      (button) => button.textContent === "初期化",
    );
    if (resetButton === undefined) {
      throw new Error("確認dialog内に初期化buttonがありません。");
    }
    expect(message.textContent).toBe(
      "入力済みのデータと画像を初期状態に戻します。\n本当によろしいですか？",
    );
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "キャンセル" }),
    );
    expect(
      screen
        .getByRole("button", { name: "キャンセル" })
        .getAttribute("data-character-sheet-button-color"),
    ).toBe("muted");
    expect(
      screen
        .getByRole("button", { name: "キャンセル" })
        .getAttribute("data-character-sheet-button-variant"),
    ).toBe("outline");
    expect(resetButton.getAttribute("data-character-sheet-button-color")).toBe(
      "danger",
    );
    expect(
      resetButton.getAttribute("data-character-sheet-button-variant"),
    ).toBe("solid");

    await user.click(screen.getByRole("button", { name: "キャンセル" }));
    expect(onResetConfirmed).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(trigger);

    await user.click(trigger);
    await user.click(
      Array.from(
        screen
          .getByRole("dialog", { name: "入力内容を初期化" })
          .querySelectorAll("button"),
      ).find((button) => button.textContent === "初期化") ??
        (() => {
          throw new Error("確認dialog内に初期化buttonがありません。");
        })(),
    );
    expect(onResetConfirmed).toHaveBeenCalledOnce();
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it("returns a JSON-import image persistence error to the import trigger", async () => {
    const user = userEvent.setup();
    useRootStateMock.mockImplementation(useJsonImportImageErrorHarness);
    render(<CharacterSheetContainer />);

    const importButton = screen.getByRole("button", { name: "インポート" });
    await user.click(importButton);
    await user.click(screen.getByRole("button", { name: "閉じる" }));

    await waitFor(() => expect(document.activeElement).toBe(importButton));
  });

  it("returns responsive reset dialogs and errors to the menu trigger", async () => {
    const user = userEvent.setup();
    useRootStateMock.mockImplementation(useResetImageErrorHarness);
    render(<CharacterSheetContainer />);

    const trigger = screen.getByRole("button", {
      name: "操作メニューを開く、エラーはありません。",
    });
    await user.click(trigger);
    await user.click(
      within(
        screen.getByRole("region", {
          name: "キャラクターシートの操作メニュー",
        }),
      ).getByRole("button", { name: "初期化" }),
    );
    await user.click(screen.getByRole("button", { name: "キャンセル" }));
    await waitFor(() => expect(document.activeElement).toBe(trigger));

    await user.click(trigger);
    await user.click(
      within(
        screen.getByRole("region", {
          name: "キャラクターシートの操作メニュー",
        }),
      ).getByRole("button", { name: "初期化" }),
    );
    fireEvent.keyDown(window, { key: "Escape" });
    await waitFor(() => expect(document.activeElement).toBe(trigger));

    await user.click(trigger);
    await user.click(
      within(
        screen.getByRole("region", {
          name: "キャラクターシートの操作メニュー",
        }),
      ).getByRole("button", { name: "初期化" }),
    );
    await user.click(
      within(
        screen.getByRole("dialog", { name: "入力内容を初期化" }),
      ).getByRole("button", { name: "初期化" }),
    );
    const errorDialog = screen.getByRole("dialog", {
      name: "画像を処理できませんでした",
    });
    await user.click(
      within(errorDialog).getByRole("button", { name: "閉じる" }),
    );
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it("opens and closes the desktop error dialog from the status", async () => {
    const user = userEvent.setup();
    render(<CharacterSheetContainer />);

    const trigger = screen.getByRole("button", { name: "確認" });
    await user.click(trigger);
    expect(screen.getByRole("dialog", { name: "エラー" })).not.toBeNull();

    const closeButtons = screen.getAllByRole("button", { name: "閉じる" });
    const dialogCloseButton = closeButtons[closeButtons.length - 1];
    if (dialogCloseButton === undefined) {
      throw new Error("エラーdialogの閉じるbuttonがありません。");
    }
    await user.click(dialogCloseButton);

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "エラー" })).toBeNull();
      expect(document.activeElement).toBe(trigger);
    });
  });

  it("opens the action menu, then closes it with Escape and returns focus", async () => {
    const user = userEvent.setup();
    render(<CharacterSheetContainer />);

    const trigger = screen.getByRole("button", {
      name: "操作メニューを開く、エラーはありません。",
    });
    await user.click(trigger);

    expect(
      screen.getByRole("region", {
        name: "キャラクターシートの操作メニュー",
      }),
    ).not.toBeNull();
    const closeTrigger = screen.getByRole("button", {
      name: "操作メニューを閉じる、エラーはありません。",
    });
    expect(closeTrigger.querySelector("svg")?.getAttribute("class")).toContain(
      "lucide-x",
    );

    fireEvent.keyDown(window, { key: "Escape" });

    await waitFor(() => {
      expect(
        screen.queryByRole("region", {
          name: "キャラクターシートの操作メニュー",
        }),
      ).toBeNull();
      expect(document.activeElement).toBe(trigger);
    });
  });

  it("reorders entered bonds instead of requiring an over-limit row to be deleted", async () => {
    const user = userEvent.setup();
    render(<CharacterSheetContainer />);

    await user.type(screen.getByLabelText("縁1の対象"), "アキラ");
    await user.type(screen.getByLabelText("縁2の対象"), "ベラ");
    await user.click(screen.getByRole("button", { name: "縁2上へ移動" }));

    expect(screen.getByLabelText("縁1の対象")).toHaveProperty("value", "ベラ");
    expect(screen.getByLabelText("縁2の対象")).toHaveProperty(
      "value",
      "アキラ",
    );
  });

  it("closes the omamori picker on Escape or close, selects one row, and returns focus", async () => {
    const user = userEvent.setup();
    const omamori = getOmamori()[0];
    if (omamori === undefined)
      throw new Error("お守りmaster dataがありません。");
    render(<CharacterSheetContainer />);

    await user.click(screen.getByRole("button", { name: "お守りを追加" }));
    await user.click(screen.getByRole("button", { name: "＋ お守りを追加" }));
    const trigger = screen.getByRole("button", {
      name: "お守り1：お守りを選択",
    });
    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "お守りを選択" });

    expect(screen.getByText(omamori.effect)).not.toBeNull();
    act(() => {
      fireEvent(dialog, new Event("cancel", { cancelable: true }));
    });
    expect(document.activeElement).toBe(trigger);

    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "閉じる" }));
    expect(document.activeElement).toBe(trigger);

    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: omamori.name }));

    expect(
      screen.getByRole("button", { name: `お守り1：${omamori.name}` }),
    ).not.toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("closes the weapon picker on Escape or selection and returns focus to its row", async () => {
    const user = userEvent.setup();
    render(<CharacterSheetContainer />);

    const trigger = screen.getByRole("button", {
      name: "武器1：武器を選択",
    });
    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "武器を選択" });

    act(() => {
      fireEvent(dialog, new Event("cancel", { cancelable: true }));
    });

    expect(document.activeElement).toBe(trigger);

    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "刀" }));

    expect(screen.getByRole("button", { name: "武器1：刀" })).not.toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("closes the cybernetics picker and selects only its requested row", async () => {
    const user = userEvent.setup();
    const cybernetic = getCybernetics()[0];
    if (cybernetic === undefined)
      throw new Error("サイバネmaster dataがありません。");
    render(<CharacterSheetContainer />);

    await user.click(screen.getByRole("button", { name: "サイバネを追加" }));

    const headTrigger = screen.getByRole("button", {
      name: "頭：サイバネを選択",
    });
    await user.click(headTrigger);
    const dialog = screen.getByRole("dialog", { name: "サイバネを選択" });

    act(() => {
      fireEvent(dialog, new Event("cancel", { cancelable: true }));
    });
    expect(document.activeElement).toBe(headTrigger);

    await user.click(headTrigger);
    await user.click(screen.getByRole("button", { name: "閉じる" }));
    expect(document.activeElement).toBe(headTrigger);

    await user.click(headTrigger);
    await user.click(screen.getByRole("button", { name: cybernetic.name }));
    expect(
      screen.getByRole("button", { name: `頭：${cybernetic.name}` }),
    ).not.toBeNull();
    expect(document.activeElement).toBe(headTrigger);

    await user.click(
      screen.getByRole("button", { name: "＋ その他の部位を追加" }),
    );
    const otherTrigger = screen.getByRole("button", {
      name: "その他2：サイバネを選択",
    });
    await user.click(otherTrigger);
    await user.click(screen.getByRole("button", { name: cybernetic.name }));

    expect(
      screen.getByRole("button", { name: `その他2：${cybernetic.name}` }),
    ).not.toBeNull();
    expect(
      screen.getByRole("button", { name: `頭：${cybernetic.name}` }),
    ).not.toBeNull();
    expect(document.activeElement).toBe(otherTrigger);
  });

  it("closes the nanomachines picker and returns focus after selection", async () => {
    const user = userEvent.setup();
    const nanomachine = getNanomachines()[0];
    if (nanomachine === undefined) {
      throw new Error("ナノマシンmaster dataがありません。");
    }
    render(<CharacterSheetContainer />);

    await user.click(screen.getByRole("button", { name: "ナノマシンを追加" }));

    const trigger = screen.getByRole("button", {
      name: "頭：ナノマシンを選択",
    });
    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "ナノマシンを選択" });

    act(() => {
      fireEvent(dialog, new Event("cancel", { cancelable: true }));
    });
    expect(document.activeElement).toBe(trigger);

    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "閉じる" }));
    expect(document.activeElement).toBe(trigger);

    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: nanomachine.name }));
    expect(
      screen.getByRole("button", { name: `頭：${nanomachine.name}` }),
    ).not.toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("disables drugs selected in another row and returns focus after selection", async () => {
    const user = userEvent.setup();
    const [firstDrug, secondDrug] = getDrugs();
    if (firstDrug === undefined || secondDrug === undefined) {
      throw new Error("ドラッグmaster dataが不足しています。");
    }
    render(<CharacterSheetContainer />);

    await user.click(screen.getByRole("button", { name: "ドラッグを追加" }));

    const firstTrigger = screen.getByRole("button", {
      name: "ドラッグ1：ドラッグを選択",
    });
    await user.click(firstTrigger);
    await user.click(screen.getByRole("button", { name: firstDrug.name }));
    expect(document.activeElement).toBe(firstTrigger);

    const secondTrigger = screen.getByRole("button", {
      name: "ドラッグ2：ドラッグを選択",
    });
    await user.click(secondTrigger);
    expect(screen.getAllByText("使用タイミング：").length).toBe(
      getDrugs().length,
    );
    expect(screen.getAllByText("1セット数量：").length).toBe(getDrugs().length);
    const disabledDrugButton = screen.getByRole("button", {
      name: firstDrug.name,
    }) as HTMLButtonElement;
    expect(disabledDrugButton.disabled).toBe(true);
    expect(disabledDrugButton.closest("[data-disabled]")).not.toBeNull();
    await user.click(screen.getByRole("button", { name: secondDrug.name }));

    expect(
      screen.getByRole("button", { name: `ドラッグ2：${secondDrug.name}` }),
    ).not.toBeNull();
    expect(document.activeElement).toBe(secondTrigger);
  });

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
  }, 10_000);

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
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "＋ その他流儀を追加" }),
    );
  }, 10_000);
});
