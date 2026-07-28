// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PrimaryRyugiChangeConfirmDialog from "../../../src/character-sheet/components/dialogs/PrimaryRyugiChangeConfirmDialog";
import PrimarySkillPickerDialog from "../../../src/character-sheet/components/dialogs/PrimarySkillPickerDialog";
import { getPrimarySkillGroups } from "../../../src/character-sheet/master-data/primary-skills";

beforeEach(() => {
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

afterEach(cleanup);

describe("primary skill dialogs", () => {
  it("groups only basic and unlocked advanced candidates with their effects", async () => {
    const user = userEvent.setup();
    const sourceGroups = getPrimarySkillGroups("kenkaya", 6);
    const groups = {
      ...sourceGroups,
      basic: sourceGroups.basic.map((skill, index) =>
        index === 0 ? { ...skill, name: "長い\n候補名" } : skill,
      ),
    };
    const onSelect = vi.fn();

    render(
      <PrimarySkillPickerDialog
        groups={groups}
        isOpen
        onRequestClose={vi.fn()}
        onSelect={onSelect}
        returnFocusRef={createRef<HTMLButtonElement>()}
      />,
    );

    expect(screen.getByRole("heading", { name: "初期作成" })).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Lv6以上" })).not.toBeNull();
    expect(
      screen.getByText(
        "スキル名称をクリックすると選択したスキルがキャラクターシートに反映されます。",
      ),
    ).not.toBeNull();
    const multilineNameButton = screen.getByRole("button", {
      name: /長い\s+候補名/,
    });
    expect(multilineNameButton.textContent).toBe("長い\n候補名");
    expect(screen.getByText(groups.basic[0]?.effect ?? "")).not.toBeNull();
    expect(screen.getAllByText("名称")).toHaveLength(2);
    expect(screen.getAllByText("使用制限")).toHaveLength(2);
    expect(screen.getAllByText("技能：")).toHaveLength(
      groups.basic.length + groups.advanced.length,
    );
    expect(screen.getAllByText("取得制限：")).toHaveLength(
      groups.basic.length + groups.advanced.length,
    );
    expect(screen.queryByText(groups.bonus[0]?.name ?? "")).toBeNull();

    await user.click(multilineNameButton);
    expect(onSelect).toHaveBeenCalledWith(groups.basic[0]?.id);
  });

  it("uses the specified confirmation copy and leaves cancellation to the caller", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onRequestClose = vi.fn();

    render(
      <PrimaryRyugiChangeConfirmDialog
        isOpen
        onConfirm={onConfirm}
        onRequestClose={onRequestClose}
        returnFocusRef={createRef<HTMLSelectElement>()}
      />,
    );

    expect(
      screen.getByText(
        "変更すると、現在選択中のスキルが消去されます。本当によろしいですか？",
      ),
    ).not.toBeNull();
    expect(
      screen.getByRole("dialog", { name: "プライマリ流儀の変更確認" }),
    ).not.toBeNull();
    expect(screen.queryByRole("heading", { name: "確認" })).toBeNull();
    expect(screen.getByRole("button", { name: "変更" })).not.toBeNull();
    await user.click(screen.getByRole("button", { name: "キャンセル" }));
    expect(onRequestClose).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
