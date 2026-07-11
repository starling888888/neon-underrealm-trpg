import { expect, type Page, test } from "@playwright/test";
import { visualOutputDir, visualRoutes, visualViewports } from "./config";

async function hideAstroDevToolbar(page: Page) {
  await page.locator("astro-dev-toolbar").evaluateAll((elements) => {
    for (const element of elements) {
      element.remove();
    }
  });
}

async function expectNpcCardCatalog(page: Page) {
  const cards = page.locator("[data-npc-card]");
  const epithet = page.locator(".npc-card-epithet");

  await expect(page).toHaveTitle(
    "NPCカード カタログ | 光都暗域〈ネオン・アンダーレルム〉TRPG",
  );
  await expect(
    page.getByRole("heading", { name: "NPCカード カタログ" }),
  ).toHaveCount(1);
  await expect(cards).toHaveCount(4);
  await expect(epithet).toHaveCount(2);
  await expect(epithet.locator("em")).toHaveCount(0);
  await expect(epithet.locator("rt")).toHaveText([
    "レガシー",
    "アナイアレイター",
  ]);
  await expect(
    page.locator(".npc-card-portrait[aria-hidden='true']"),
  ).toHaveCount(4);

  const styles = await page
    .locator(".npc-card-epithet")
    .first()
    .evaluate((element) => {
      const epithetStyle = window.getComputedStyle(element);
      const name = element
        .closest("[data-npc-card]")
        ?.querySelector(".npc-card-name");

      if (!name) {
        throw new Error("NPCカードの名前要素が見つかりません。");
      }

      const nameStyle = window.getComputedStyle(name);

      return {
        epithetColor: epithetStyle.color,
        epithetFontStyle: epithetStyle.fontStyle,
        nameColor: nameStyle.color,
      };
    });

  expect(styles.epithetColor).not.toBe(styles.nameColor);
  expect(styles.epithetFontStyle).toBe("normal");
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

test("NPCカード カタログ desktop @npc-card-desktop", async ({ page }) => {
  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.npcCards);
  await expectNpcCardCatalog(page);
  const portraitSize = await page
    .locator(".npc-card-portrait")
    .first()
    .evaluate((element) => {
      const { width, height } = element.getBoundingClientRect();
      return { width, height };
    });
  expect(portraitSize.width).toBeCloseTo(132);
  expect(portraitSize.height).toBeCloseTo(165);
  await hideAstroDevToolbar(page);
  await page.screenshot({
    fullPage: false,
    path: `${visualOutputDir}/npc-card-desktop.png`,
  });
});

test("NPCカード カタログ mobile @npc-card-mobile", async ({ page }) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.npcCards);
  await expectNpcCardCatalog(page);
  const portraitSize = await page
    .locator(".npc-card-portrait")
    .first()
    .evaluate((element) => {
      const { width, height } = element.getBoundingClientRect();
      return { width, height };
    });
  expect(portraitSize.width).toBeCloseTo(102);
  expect(portraitSize.height).toBeCloseTo(127.5);
  await hideAstroDevToolbar(page);
  await page.screenshot({
    fullPage: false,
    path: `${visualOutputDir}/npc-card-mobile.png`,
  });
});
