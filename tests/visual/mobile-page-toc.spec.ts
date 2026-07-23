import { expect, test } from "@playwright/test";
import { visualRoutes, visualViewports } from "./config";

test("mobile page toc opens and closes from its trigger @mobile-page-toc-toggle", async ({
  page,
}) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.mdxTest);
  const trigger = page.locator("[data-mobile-page-toc-trigger]");
  const panel = page.locator("[data-mobile-page-toc-panel]");

  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(panel).toBeHidden();

  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(panel).toBeVisible();

  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(panel).toBeHidden();
});

test("mobile page toc heading stays sticky @mobile-page-toc-scroll-behavior", async ({
  page,
}) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.mdxTest);
  const heading = page.locator("[data-mobile-page-heading]");

  await expect(heading).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 520));
  await expect
    .poll(async () => {
      const box = await heading.boundingBox();
      return Math.round(box?.y ?? Number.NaN);
    })
    .toBe(0);
});

for (const [name, viewport] of [
  ["tablet", visualViewports.tablet],
  ["mobile", visualViewports.mobile],
] as const) {
  test(`${name} page toc anchors clear the sticky page heading @mobile-page-toc-scroll-behavior`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto(visualRoutes.world);
    await page.locator("[data-mobile-page-toc-trigger]").click();
    await page
      .locator(".mobile-page-toc-content .page-toc-link", {
        hasText: "強大な敵",
      })
      .click();

    await expect
      .poll(async () => {
        return await page.evaluate(() => {
          const stickyHeading = document.querySelector<HTMLElement>(
            "[data-mobile-page-heading]",
          );
          const target = Array.from(document.querySelectorAll("h2, h3")).find(
            (element) => element.textContent?.trim() === "強大な敵",
          );

          if (!stickyHeading || !target) {
            return Number.NaN;
          }

          return Math.round(
            target.getBoundingClientRect().top -
              stickyHeading.getBoundingClientRect().bottom,
          );
        });
      })
      .toBeGreaterThanOrEqual(0);
  });
}
