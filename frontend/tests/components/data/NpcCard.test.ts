import { describe, expect, it } from "vitest";

import NpcCard from "../../../src/components/_common/NpcCard.astro";
import { renderAstroComponent } from "../../support/render-astro-component";

describe("NpcCard", () => {
  it("renders fixed props, portrait metadata, and the right-side variant", async () => {
    const html = await renderAstroComponent(NpcCard, {
      props: {
        npc: {
          id: "contract-npc",
          group: "テスト",
          name: "テストNPC",
          epithet: { reading: "しけん", text: "試験" },
          quote: "固定propsの台詞。",
          description: "固定propsの説明。",
          sourceOrder: 1,
        },
        portraitPath: "/images/npc/contract-npc.webp",
        portraitPosition: "right",
      },
    });

    expect(html).toContain("data-npc-card");
    expect(html).toContain('data-npc-portrait-position="right"');
    expect(html).toContain("npc-card-right");
    expect(html).toContain("テストNPCの肖像");
    expect(html).toContain("試験");
    expect(html).toContain("固定propsの台詞。");
  });
});
