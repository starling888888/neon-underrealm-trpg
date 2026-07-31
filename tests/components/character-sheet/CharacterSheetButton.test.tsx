// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import CharacterSheetButton from "../../../src/character-sheet/components/CharacterSheetButton";

afterEach(cleanup);

describe("CharacterSheetButton", () => {
  it("forwards standard button props and falls back to the accent default and small size", () => {
    const onClick = vi.fn();
    const ref = createRef<HTMLButtonElement>();

    render(
      <CharacterSheetButton
        aria-label="その他の流儀を追加"
        className="fixed-width"
        data-testid="other-ryugi-add"
        onClick={onClick}
        ref={ref}
      >
        その他の流儀を追加
      </CharacterSheetButton>,
    );

    const button = screen.getByTestId("other-ryugi-add");
    expect(button).toHaveProperty("type", "button");
    expect(button.dataset.characterSheetButtonColor).toBe("default");
    expect(button.dataset.characterSheetButtonSize).toBe("small");
    expect(button.dataset.characterSheetButtonVariant).toBe("outline");
    expect(button.className).toContain("default");
    expect(button.className).toContain("outline");
    expect(button.className).toContain("small");
    expect(button.className).toContain("fixed-width");
    expect(ref.current).toBe(button);

    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("accepts the used colors, solid variant, medium size, disabled state, and an explicit type", () => {
    const onClick = vi.fn();

    render(
      <>
        <CharacterSheetButton color="warning" size="medium">
          サイバネを追加
        </CharacterSheetButton>
        <CharacterSheetButton color="muted">キャンセル</CharacterSheetButton>
        <CharacterSheetButton
          color="danger"
          disabled
          onClick={onClick}
          type="submit"
          variant="solid"
        >
          初期化
        </CharacterSheetButton>
      </>,
    );

    const warningButton = screen.getByRole("button", {
      name: "サイバネを追加",
    });
    expect(warningButton.dataset.characterSheetButtonColor).toBe("warning");
    expect(warningButton.dataset.characterSheetButtonSize).toBe("medium");
    expect(warningButton.dataset.characterSheetButtonVariant).toBe("outline");
    expect(warningButton.className).toContain("warning");
    expect(warningButton.className).toContain("medium");

    const mutedButton = screen.getByRole("button", { name: "キャンセル" });
    expect(mutedButton.dataset.characterSheetButtonColor).toBe("muted");
    expect(mutedButton.dataset.characterSheetButtonVariant).toBe("outline");

    const dangerButton = screen.getByRole("button", { name: "初期化" });
    expect(dangerButton).toHaveProperty("type", "submit");
    expect(dangerButton).toHaveProperty("disabled", true);
    expect(dangerButton.dataset.characterSheetButtonVariant).toBe("solid");
    fireEvent.click(dangerButton);
    expect(onClick).not.toHaveBeenCalled();
  });
});
