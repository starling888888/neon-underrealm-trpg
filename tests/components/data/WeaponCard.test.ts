import { describe, expect, it } from "vitest";

import WeaponCard from "../../../src/components/data/WeaponCard.astro";
import { renderAstroComponent } from "../../support/render-astro-component";

describe("WeaponCard", () => {
  it("renders fixed props into a weapon card", async () => {
    const html = await renderAstroComponent(WeaponCard, {
      props: {
        anchorId: "weapon-contract",
        name: "テスト銃",
        credit: 4,
        kind: "発砲",
        check: "射撃",
        attack: 8,
        guard: 2,
        ammo: 6,
        range: "遠隔",
        effect: "固定propsの武器効果。",
      },
    });

    expect(html).toContain('id="weapon-contract"');
    expect(html).toContain("data-weapon-card");
    expect(html).toContain("信用：4");
    expect(html).toContain("発砲武器");
    expect(html).toContain("技能：射撃");
    expect(html).toContain("固定propsの武器効果。");
  });
});
