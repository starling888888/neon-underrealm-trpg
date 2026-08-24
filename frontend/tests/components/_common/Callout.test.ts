import { describe, expect, it } from "vitest";

import Callout from "../../../src/components/_common/Callout.astro";
import { renderAstroComponent } from "../../support/render-astro-component";

describe("Callout", () => {
  it("renders fixed props, a heading level, and slot content", async () => {
    const html = await renderAstroComponent(Callout, {
      props: { titleHeadingLevel: 3, type: "warning" },
      slots: { default: "固定propsの本文。" },
    });

    expect(html).toContain('data-callout-type="warning"');
    expect(html).toContain("callout-warning");
    expect(html).toMatch(/<h3[^>]*>注意<\/h3>/);
    expect(html).toContain("固定propsの本文。");
  });
});
