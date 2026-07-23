import { expect, test } from "@playwright/test";
import { visualRoutes, visualViewports } from "./config";

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

test("site menu disclosure controls keep a 32px target @site-layout-breakpoints", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.goto(visualRoutes.world);

  const toggle = page.locator(".site-menu-desktop .site-menu-toggle").first();
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveCSS("width", "32px");
  await expect(toggle).toHaveCSS("height", "32px");
});

test("site menu uses its full row width for the longest non-disclosure link @site-layout-breakpoints", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.goto(visualRoutes.world);

  const characterMaking = page
    .locator(".site-menu-desktop .site-menu-link")
    .filter({ hasText: "キャラクターメイキング" });

  await expect(characterMaking).toHaveCount(1);
  await expect
    .poll(async () => {
      return await characterMaking.evaluate((link) => {
        const row = link.parentElement;

        if (!row) {
          return false;
        }

        return (
          link.getBoundingClientRect().height <= 32 &&
          getComputedStyle(row).gridTemplateColumns.split(" ").length === 1
        );
      });
    })
    .toBe(true);
});

test("site layout tablet keeps the header above the sticky page heading @site-layout-scroll-behavior", async ({
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

test("site layout keeps the header fixed at the 768px tablet boundary @site-layout-scroll-behavior", async ({
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

test("site layout mobile menu opens @site-layout-mobile-menu-open", async ({
  page,
}) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.dataItemsWeapons);
  await page.locator("[data-mobile-menu-open]").click();
  await expect(page.locator("#mobile-site-menu-drawer")).toBeVisible();
});

test("site layout mobile page toc opens @site-layout-mobile-page-toc-open", async ({
  page,
}) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.mdxTest);
  await page.locator("[data-mobile-page-toc-trigger]").click();
  await expect(page.locator("[data-mobile-page-toc-panel]")).toBeVisible();
});

test("site layout mobile page toc sticky @site-layout-mobile-page-toc-sticky", async ({
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

test("site layout mobile header follows scroll direction and overlay state @site-layout-scroll-behavior", async ({
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

for (const [name, viewport] of [
  ["tablet", visualViewports.tablet],
  ["mobile", visualViewports.mobile],
] as const) {
  test(`site layout ${name} page toc anchors clear the sticky page heading @site-layout-scroll-behavior`, async ({
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
