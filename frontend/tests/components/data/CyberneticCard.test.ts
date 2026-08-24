import { describe, expect, it } from "vitest";

import CyberneticCard from "../../../src/components/data/CyberneticCard.astro";
import { renderAstroComponent } from "../../support/render-astro-component";

describe("CyberneticCard", () => {
  it("renders fixed props into a cybernetic card", async () => {
    const html = await renderAstroComponent(CyberneticCard, {
      props: {
        anchorId: "cybernetic-contract",
        name: "テストサイバネ",
        credit: 5,
        part: "腕",
        implantPoints: 2,
        effect: "固定propsのサイバネ効果。",
      },
    });

    expect(html).toContain('id="cybernetic-contract"');
    expect(html).toContain("data-cybernetic-card");
    expect(html).toContain("埋め込み点数");
    expect(html).toContain("固定propsのサイバネ効果。");
  });
});
