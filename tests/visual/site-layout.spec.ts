import { expect, test } from "@playwright/test";
import { visualRoutes } from "./config";

for (const [width, expected] of [
  [767, { siteMenu: false, pageToc: false, mobilePageToc: true }],
  [768, { siteMenu: true, pageToc: false, mobilePageToc: true }],
  [1023, { siteMenu: true, pageToc: false, mobilePageToc: true }],
  [1024, { siteMenu: true, pageToc: false, mobilePageToc: true }],
  [1279, { siteMenu: true, pageToc: false, mobilePageToc: true }],
  [1280, { siteMenu: true, pageToc: true, mobilePageToc: false }],
  [1359, { siteMenu: true, pageToc: true, mobilePageToc: false }],
  [1360, { siteMenu: true, pageToc: true, mobilePageToc: false }],
  [1440, { siteMenu: true, pageToc: true, mobilePageToc: false }],
] as const) {
  test(`site layout switches navigation rails at ${width}px @site-layout-breakpoints`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(visualRoutes.mdxTest);

    await expect(page.locator(".site-menu-desktop")).toHaveCount(1);
    await expect(page.locator(".page-toc")).toHaveCount(1);
    await expect(page.locator("[data-mobile-page-toc-trigger]")).toHaveCount(1);

    if (expected.siteMenu) {
      await expect(page.locator(".site-menu-desktop")).toBeVisible();
    } else {
      await expect(page.locator(".site-menu-desktop")).toBeHidden();
    }

    if (expected.pageToc) {
      await expect(page.locator(".page-toc")).toBeVisible();
    } else {
      await expect(page.locator(".page-toc")).toBeHidden();
    }

    if (expected.mobilePageToc) {
      await expect(
        page.locator("[data-mobile-page-toc-trigger]"),
      ).toBeVisible();
    } else {
      await expect(page.locator("[data-mobile-page-toc-trigger]")).toBeHidden();
    }

    await expect
      .poll(async () => {
        return await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        );
      })
      .toBe(0);
  });
}

test("site layout desktop navigation rails scroll independently @site-layout-scroll-behavior", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 700 });
  await page.goto(visualRoutes.world);
  const header = page.locator("[data-site-header]");

  for (let index = 0; index < 20; index += 1) {
    const collapsed = page.locator(
      ".site-menu-desktop .site-menu-toggle[aria-expanded='false']",
    );

    if ((await collapsed.count()) === 0) {
      break;
    }

    await collapsed.first().click();
  }

  await page.evaluate(() => window.scrollTo(0, 900));
  await expect
    .poll(async () => Math.round((await header.boundingBox())?.y ?? Number.NaN))
    .toBe(0);

  const rails = await page.evaluate(() => {
    const leftRail = document.querySelector<HTMLElement>(".site-menu-desktop");
    const rightRail = document.querySelector<HTMLElement>(".page-toc");

    if (!leftRail || !rightRail) {
      throw new Error("Desktop navigation rails were not found.");
    }

    const pageScrollY = window.scrollY;
    leftRail.scrollTop = 200;
    rightRail.scrollTop = 200;

    return {
      pageScrollY,
      left: {
        overflowY: getComputedStyle(leftRail).overflowY,
        clientHeight: leftRail.clientHeight,
        scrollHeight: leftRail.scrollHeight,
        scrollTop: leftRail.scrollTop,
      },
      right: {
        overflowY: getComputedStyle(rightRail).overflowY,
        clientHeight: rightRail.clientHeight,
        scrollHeight: rightRail.scrollHeight,
        scrollTop: rightRail.scrollTop,
      },
      pageScrollYAfter: window.scrollY,
    };
  });

  expect(rails.left.overflowY).toBe("auto");
  expect(rails.left.scrollHeight).toBeGreaterThan(rails.left.clientHeight);
  expect(rails.left.scrollTop).toBeGreaterThan(0);
  expect(rails.right.overflowY).toBe("auto");
  expect(rails.right.scrollHeight).toBeGreaterThan(rails.right.clientHeight);
  expect(rails.right.scrollTop).toBeGreaterThan(0);
  expect(rails.pageScrollYAfter).toBe(rails.pageScrollY);
});
