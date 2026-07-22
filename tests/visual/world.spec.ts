import { expect, type Page, test } from "@playwright/test";
import { visualOutputDir, visualRoutes, visualViewports } from "./config";
import { expectGeneratedPageToc } from "./helpers/page-toc";

async function hideAstroDevToolbar(page: Page) {
  await page.locator("astro-dev-toolbar").evaluateAll((elements) => {
    for (const element of elements) {
      element.remove();
    }
  });
}

async function expectWorldGuide(page: Page) {
  await expect(page).toHaveTitle(
    "ワールドガイド | 光都暗域〈ネオン・アンダーレルム〉TRPG",
  );
  await expect(
    page.getByRole("heading", { name: "ワールドガイド" }),
  ).toHaveCount(1);
  await expect(
    page.getByRole("img", {
      name: "雨の夜のオオサカ副都の路地。遠景に通天閣を思わせる塔が見える。",
    }),
  ).toHaveAttribute("loading", "eager");
  await expect(page.getByRole("heading", { name: "強大な敵" })).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "外道" })).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "機龍" })).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "ホムンクルス" })).toHaveCount(
    1,
  );
  await expect(page.getByRole("heading", { name: "悪魔" })).toHaveCount(1);
  await expectGeneratedPageToc(page, "強大な敵");
  await expect(page.locator("[data-npc-card]")).toHaveCount(11);
  await expect(page.locator(".npc-card-epithet")).toHaveCount(8);
  await expect(page.locator(".npc-card-quote")).toHaveCount(11);
  await expect(page.locator('[data-npc-portrait-position="left"]')).toHaveCount(
    6,
  );
  await expect(
    page.locator('[data-npc-portrait-position="right"]'),
  ).toHaveCount(5);
  await expect(page.locator('img[src*="no_image.webp"]')).toHaveCount(1);
  await expect
    .poll(async () => {
      return await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
    })
    .toBe(0);
}

test("world desktop @world-desktop", async ({ page }) => {
  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.world);
  await expectWorldGuide(page);
  await hideAstroDevToolbar(page);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/world-desktop.png`,
  });
});

test("world mobile @world-mobile", async ({ page }) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.world);
  await expectWorldGuide(page);
  await expect(page.locator("[data-mobile-page-toc-trigger]")).toBeVisible();
  await hideAstroDevToolbar(page);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/world-mobile.png`,
  });
});

test("world desktop keeps navigation rails independently scrollable @world-scroll-behavior", async ({
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
  test(`world ${name} page toc anchors clear the sticky page heading @world-scroll-behavior`, async ({
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
