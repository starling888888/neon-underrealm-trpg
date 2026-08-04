// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import SecondaryAttributesSection, {
  type SecondaryAttributesSectionProps,
} from "../../../src/character-sheet/components/SecondaryAttributesSection";
import { characterSheetDictionary } from "../../../src/character-sheet/dictionary";
import {
  type BuildValues,
  characterSheetDefaultValues,
} from "../../../src/character-sheet/form-values";
import { calculateBuild as calculateBuildFromSources } from "../../../src/character-sheet/logic/build";
import { calculateSecondaryAttributes } from "../../../src/character-sheet/logic/secondary-attributes";
import { getBuildSources } from "../../../src/character-sheet/master-data/build";

function calculateBuild(build: BuildValues, commonSkillLevelTotal = 0) {
  return calculateBuildFromSources(
    build,
    getBuildSources(build),
    commonSkillLevelTotal,
  );
}

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
      screen.getByRole("checkbox", { name: "移動力の一時修正を適用" }),
    );

    expect(props.onNumberChange).toHaveBeenCalledWith("movementModifier", "-2");
    expect(props.onTemporaryAppliedChange).toHaveBeenCalledWith(
      "applyTemporaryMovement",
      true,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "移動力の一時修正を適用の説明",
      }),
    );

    expect(screen.getByRole("tooltip").textContent).toBe(
      "チェックを入れると一時能力値で移動力を表示します",
    );
  });

  it("gives each secondary row a distinct accessible name", () => {
    const props = createProps();

    render(<SecondaryAttributesSection {...props} />);

    expect(screen.getByRole("group", { name: "最大体力" })).not.toBeNull();
    expect(screen.getByLabelText("最大体力の自動算出値")).not.toBeNull();
    expect(screen.getByLabelText("最大体力の修正")).not.toBeNull();
    expect(screen.getByLabelText("最大精神力の自動算出値")).not.toBeNull();
    expect(screen.getByLabelText("最大精神力の修正")).not.toBeNull();
    expect(
      screen.getByRole("checkbox", { name: "移動力の一時修正を適用" }),
    ).not.toBeNull();
    expect(
      screen.getByRole("checkbox", { name: "行動値の一時修正を適用" }),
    ).not.toBeNull();
  });

  it("shows the Sumi nanomachine bonus in the automatic maximum health value", () => {
    const build = calculateBuild({
      ...characterSheetDefaultValues.build,
      ikizamaId: "sumi",
      primaryRyugiId: "kenkaya",
    });
    const props = createProps();
    props.derived = calculateSecondaryAttributes(
      build,
      {
        ...characterSheetDefaultValues.secondaryAttributes,
        healthModifier: 2,
      },
      15,
    );

    render(<SecondaryAttributesSection {...props} />);

    const automaticHealth = screen.getByLabelText("最大体力の自動算出値");
    const finalHealth = screen.getByText(String(props.derived.health), {
      exact: true,
      selector: "output",
    });

    expect(automaticHealth.textContent).toBe(String(props.derived.baseHealth));
    expect(props.derived.health).toBe((props.derived.baseHealth ?? 0) + 2);
    expect(finalHealth.textContent).toBe(String(props.derived.health));
  });
});
