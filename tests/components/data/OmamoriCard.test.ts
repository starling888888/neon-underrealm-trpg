import { describe, expect, it } from "vitest";

import OmamoriCard from "../../../src/components/data/OmamoriCard.astro";
import { renderAstroComponent } from "../../support/render-astro-component";

describe("OmamoriCard", () => {
  it("renders fixed props into a compact effect card", async () => {
    const html = await renderAstroComponent(OmamoriCard, {
      props: {
        anchorId: "omamori-contract",
        name: "テストお守り",
        credit: 2,
        effect: "固定propsのお守り効果。",
      },
    });

    expect(html).toContain('id="omamori-contract"');
    expect(html).toContain("data-omamori-card");
    expect(html).toContain("data-card-effect-compact");
    expect(html).toContain("固定propsのお守り効果。");
  });
});
