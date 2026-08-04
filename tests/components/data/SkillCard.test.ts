import { describe, expect, it } from "vitest";

import SkillCard from "../../../src/components/data/SkillCard.astro";
import { renderAstroComponent } from "../../support/render-astro-component";

describe("SkillCard", () => {
  it("renders fixed props, fallback values, and no summary", async () => {
    const html = await renderAstroComponent(SkillCard, {
      props: {
        anchorId: "skill-contract",
        name: "テストスキル",
        maxLevel: 3,
        timing: "M",
        cost: null,
        proficiency: undefined,
        acquisitionRestriction: "流儀: テスト",
        usageRestriction: null,
        target: "自身",
        range: "至近",
        effect: "固定propsの効果本文。",
        summary: "表示してはいけない概要。",
        variant: "legend",
      },
    });

    expect(html).toContain('id="skill-contract"');
    expect(html).toContain("data-skill-card");
    expect(html).toContain("skill-card-legend");
    expect(html).toContain("最大LV: 3");
    expect(html).toContain("流儀: テスト");
    expect(html).toMatch(/M<\/span><span[^>]*>-<\/span><span[^>]*>-<\/span>/);
    expect(html).not.toContain("表示してはいけない概要。");
  });
});
