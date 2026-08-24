import { describe, expect, it } from "vitest";

import ArmorCard from "../../../src/components/data/ArmorCard.astro";
import { renderAstroComponent } from "../../support/render-astro-component";

describe("ArmorCard", () => {
  it("renders fixed props and unavailable-value fallbacks", async () => {
    const html = await renderAstroComponent(ArmorCard, {
      props: {
        anchorId: "armor-contract",
        name: "テスト防具",
        credit: null,
        defense: 3,
        damageReduction: 1,
        restriction: null,
        effect: null,
      },
    });

    expect(html).toContain('id="armor-contract"');
    expect(html).toContain("data-armor-card");
    expect(html).toContain("防御力");
    expect(html).toContain("ダメージ軽減");
    expect(html).toContain("装備制限");
    expect(html).toContain(">-<");
  });
});
