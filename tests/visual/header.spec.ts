import { expect, test } from "@playwright/test";
import { visualRoutes, visualViewports } from "./config";

test("header stays above the tablet sticky page heading @header-scroll-behavior", async ({
  page,
}) => {
  await page.setViewportSize(visualViewports.tablet);
  await page.goto(visualRoutes.mdxTest);
  const header = page.locator("[data-site-header]");
  const heading = page.locator("[data-mobile-page-heading]");

  await page.evaluate(() => window.scrollTo(0, 520));
  await expect
    .poll(async () => Math.round((await header.boundingBox())?.y ?? Number.NaN))
    .toBe(0);
  await expect
    .poll(async () =>
      Math.round((await heading.boundingBox())?.y ?? Number.NaN),
    )
    .toBe(88);
});

test("header stays fixed at the 768px tablet boundary @header-scroll-behavior", async ({
  page,
}) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto(visualRoutes.mdxTest);
  const header = page.locator("[data-site-header]");

  await page.evaluate(() => window.scrollTo(0, 520));
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => resolve());
        });
      }),
  );
  await expect(header).not.toHaveClass(/is-hidden/);
  await expect
    .poll(async () => Math.round((await header.boundingBox())?.y ?? Number.NaN))
    .toBe(0);
});

test("mobile header follows scroll direction and the page toc overlay state @header-scroll-behavior", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(visualRoutes.world);
  const header = page.locator("[data-site-header]");
  const trigger = page.locator("[data-mobile-page-toc-trigger]");

  await page.evaluate(() => window.scrollTo(0, 900));
  await expect(header).toHaveClass(/is-hidden/);

  await page.evaluate(() => window.scrollTo(0, 420));
  await expect(header).not.toHaveClass(/is-hidden/);
  await page.waitForTimeout(40);
  await expect
    .poll(async () => {
      return await page.evaluate(() => {
        const headerElement = document.querySelector("[data-site-header]");
        const headingElement = document.querySelector(
          "[data-mobile-page-heading]",
        );

        if (!headerElement || !headingElement) {
          return Number.NaN;
        }

        return Math.round(
          headingElement.getBoundingClientRect().top -
            headerElement.getBoundingClientRect().bottom,
        );
      });
    })
    .toBeLessThanOrEqual(1);
  await expect
    .poll(async () => Math.round((await header.boundingBox())?.y ?? Number.NaN))
    .toBe(0);

  await page.evaluate(() => window.scrollTo(0, 900));
  await expect(header).toHaveClass(/is-hidden/);
  await trigger.click();
  await expect(header).not.toHaveClass(/is-hidden/);
  await expect(page.locator("[data-mobile-page-toc-panel]")).toBeVisible();
});
