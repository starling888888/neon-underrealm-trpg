import { describe, expect, it } from "vitest";

import NanomachineCard from "../../../src/components/data/NanomachineCard.astro";
import { renderAstroComponent } from "../../support/render-astro-component";

describe("NanomachineCard", () => {
  it("renders fixed props into a nanomachine card", async () => {
    const html = await renderAstroComponent(NanomachineCard, {
      props: {
        anchorId: "nanomachine-contract",
        name: "テストナノマシン",
        credit: 6,
        activationMentalCost: 2,
        implantPoints: 1,
        effect: "固定propsのナノマシン効果。",
      },
    });

    expect(html).toContain('id="nanomachine-contract"');
    expect(html).toContain("data-nanomachine-card");
    expect(html).toContain("発動精神力");
    expect(html).toContain("固定propsのナノマシン効果。");
  });
});
