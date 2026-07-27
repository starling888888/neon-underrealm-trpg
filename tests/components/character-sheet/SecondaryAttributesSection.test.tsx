// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import SecondaryAttributesSection, {
  type SecondaryAttributesSectionProps,
} from "../../../src/character-sheet/components/SecondaryAttributesSection";
import { characterSheetDictionary } from "../../../src/character-sheet/dictionary";
import { characterSheetDefaultValues } from "../../../src/character-sheet/form-values";
import { calculateBuild } from "../../../src/character-sheet/logic/build";
import { calculateSecondaryAttributes } from "../../../src/character-sheet/logic/secondary-attributes";

function createProps(): SecondaryAttributesSectionProps {
  const derivedBuild = calculateBuild(characterSheetDefaultValues.build);

  return {
    derived: calculateSecondaryAttributes(
      derivedBuild,
      characterSheetDefaultValues.secondaryAttributes,
    ),
    onNumberChange: vi.fn((_, value: string) => Number(value)),
    onTemporaryAppliedChange: vi.fn(),
    secondaryAttributes: characterSheetDefaultValues.secondaryAttributes,
  };
}

afterEach(cleanup);

describe("SecondaryAttributesSection", () => {
  it("uses the requested value sequence and makes formulas available from labels", () => {
    const props = createProps();

    render(<SecondaryAttributesSection {...props} />);

    expect(screen.getAllByText("+", { selector: "span" })).toHaveLength(6);
    expect(screen.getAllByText("=", { selector: "span" })).toHaveLength(6);
    expect(screen.getByRole("button", { name: "最大体力" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "最大精神力" })).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "最大体力" }));

    expect(screen.getByRole("tooltip").textContent).toBe(
      characterSheetDictionary.characterSheet.secondaryAttributes.formulas
        .health,
    );

    fireEvent.click(screen.getByRole("button", { name: "最大体力" }));
    fireEvent.click(screen.getByRole("button", { name: "最大精神力" }));

    expect(screen.getByRole("tooltip").textContent).toBe(
      characterSheetDictionary.characterSheet.secondaryAttributes.formulas
        .mental,
    );

    fireEvent.click(screen.getByRole("button", { name: "最大精神力" }));
    fireEvent.click(screen.getByRole("button", { name: "移動力" }));

    expect(screen.getByRole("tooltip").textContent).toBe(
      characterSheetDictionary.characterSheet.secondaryAttributes.formulas
        .movement,
    );
  });

  it("reports manual corrections and temporary-value checkbox changes", () => {
    const props = createProps();

    render(<SecondaryAttributesSection {...props} />);

    fireEvent.change(screen.getByLabelText("移動力修正"), {
      target: { value: "-2" },
    });
    fireEvent.click(
      screen.getAllByRole("checkbox", { name: "一時修正を適用" })[0],
    );

    expect(props.onNumberChange).toHaveBeenCalledWith("movementModifier", "-2");
    expect(props.onTemporaryAppliedChange).toHaveBeenCalledWith(
      "applyTemporaryMovement",
      true,
    );

    fireEvent.click(
      screen.getAllByRole("button", { name: "一時修正を適用" })[0],
    );

    expect(screen.getByRole("tooltip").textContent).toBe(
      "チェックを入れると一時能力値で移動力を表示します",
    );
  });
});
