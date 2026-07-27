// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import SecondarySection, {
  type SecondarySectionProps,
} from "../../../src/character-sheet/components/SecondarySection";
import { characterSheetDictionary } from "../../../src/character-sheet/dictionary";
import { characterSheetDefaultValues } from "../../../src/character-sheet/form-values";
import { calculateBuild } from "../../../src/character-sheet/logic/build";
import { calculateSecondary } from "../../../src/character-sheet/logic/secondary";

function createProps(): SecondarySectionProps {
  const derivedBuild = calculateBuild(characterSheetDefaultValues.build);

  return {
    derived: calculateSecondary(
      derivedBuild,
      characterSheetDefaultValues.secondary,
    ),
    onNumberChange: vi.fn((_, value: string) => Number(value)),
    onTemporaryAppliedChange: vi.fn(),
    secondary: characterSheetDefaultValues.secondary,
  };
}

afterEach(cleanup);

describe("SecondarySection", () => {
  it("uses the requested value sequence and makes formulas available from labels", () => {
    const props = createProps();

    render(<SecondarySection {...props} />);

    expect(screen.getByRole("heading", { name: "副能力値" })).not.toBeNull();
    expect(screen.getAllByText("+", { selector: "span" })).toHaveLength(6);
    expect(screen.getAllByText("=", { selector: "span" })).toHaveLength(6);
    expect(screen.getByRole("button", { name: "最大体力" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "最大精神力" })).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "最終移動力" }));

    expect(screen.getByRole("tooltip").textContent).toBe(
      characterSheetDictionary.characterSheet.secondary.formulas.movement,
    );
  });

  it("reports manual corrections and temporary-value checkbox changes", () => {
    const props = createProps();

    render(<SecondarySection {...props} />);

    fireEvent.change(screen.getByLabelText("移動力修正"), {
      target: { value: "-2" },
    });
    fireEvent.click(screen.getAllByLabelText("一時修正を適用")[0]);

    expect(props.onNumberChange).toHaveBeenCalledWith("movementModifier", "-2");
    expect(props.onTemporaryAppliedChange).toHaveBeenCalledWith(
      "applyTemporaryMovement",
      true,
    );
  });
});
