// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import SkillPickerDialog from "../../../src/character-sheet/components/dialogs/pickers/SkillPickerDialog";
import { getCommonSkillCandidates } from "../../../src/character-sheet/master-data/common-skills";

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

describe("SkillPickerDialog", () => {
  it("keeps selected skills unavailable and reports a selectable common skill", async () => {
    const user = userEvent.setup();
    const [selectedSkill, selectableSkill] = getCommonSkillCandidates(6);
    if (selectedSkill === undefined || selectableSkill === undefined) {
      throw new Error("skill picker test用のmaster dataがありません。");
    }
    const onSelect = vi.fn();

    render(
      <SkillPickerDialog
        groups={[
          {
            id: "common",
            skills: [selectedSkill, selectableSkill],
          },
        ]}
        isOpen
        onRequestClose={vi.fn()}
        onSelect={onSelect}
        returnFocusRef={createRef<HTMLButtonElement>()}
        selectedSkillIds={[selectedSkill.id]}
        selectionGuide="スキルを選択します。"
        title="共通スキルを選択"
      />,
    );

    expect(
      (
        screen.getByRole("button", {
          name: selectedSkill.name,
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    await user.click(
      screen.getByRole("button", { name: selectableSkill.name }),
    );
    expect(onSelect).toHaveBeenCalledWith(selectableSkill.id);
  });
});
