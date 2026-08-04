import { describe, expect, it } from "vitest";

import DrugCard from "../../../src/components/data/DrugCard.astro";
import { renderAstroComponent } from "../../support/render-astro-component";

describe("DrugCard", () => {
  it("renders fixed props into a drug card", async () => {
    const html = await renderAstroComponent(DrugCard, {
      props: {
        anchorId: "drug-contract",
        name: "テストドラッグ",
        credit: 3,
        timing: "常時",
        setQuantity: 1,
        badTripIntensity: 2,
        effect: "固定propsのドラッグ効果。",
      },
    });

    expect(html).toContain('id="drug-contract"');
    expect(html).toContain("data-drug-card");
    expect(html).toContain("使用タイミング：常時");
    expect(html).toContain("BT強度");
    expect(html).toContain("固定propsのドラッグ効果。");
  });
});
