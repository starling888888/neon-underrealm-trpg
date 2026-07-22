import { expect, type Page, test } from "@playwright/test";
import { visualOutputDir, visualRoutes, visualViewports } from "./config";

async function hideAstroDevToolbar(page: Page) {
  await page.locator("astro-dev-toolbar").evaluateAll((elements) => {
    for (const element of elements) {
      element.remove();
    }
  });
}

async function expectItemsIndexPage(page: Page) {
  const article = page.locator("article.mdx-layout");
  const hero = article.locator("img[src$='images/data/items_hero.webp']");
  const itemTable = article.locator("table");
  const expectedItemLinks = [
    ["武器", "/neon-underrealm-trpg/data/items/weapons"],
    ["防具", "/neon-underrealm-trpg/data/items/armors"],
    ["お守り", "/neon-underrealm-trpg/data/items/omamori"],
    ["サイバネ", "/neon-underrealm-trpg/data/items/cybernetics"],
    ["ナノマシン", "/neon-underrealm-trpg/data/items/nanomachines"],
    ["ドラッグ", "/neon-underrealm-trpg/data/items/drugs"],
  ];
  const expectedIkizamaLinks = [
    ["ブライ", "/neon-underrealm-trpg/data/ikizama/burai"],
    ["ケジメ", "/neon-underrealm-trpg/data/ikizama/kejime"],
    ["スミ", "/neon-underrealm-trpg/data/ikizama/sumi"],
    ["ヤク", "/neon-underrealm-trpg/data/ikizama/yaku"],
  ];

  await expect(page).toHaveTitle(
    "アイテム | 光都暗域〈ネオン・アンダーレルム〉TRPG",
  );
  await expect(
    article.getByRole("heading", { name: "アイテム", exact: true }),
  ).toHaveCount(1);
  await expect(
    article.getByRole("heading", { name: "アイテムの種類", exact: true }),
  ).toHaveCount(1);
  await expect(hero).toHaveCount(1);
  await expect(hero).toHaveAttribute("alt", "");
  await expect(hero).toHaveAttribute("loading", "eager");
  await expect(
    hero.locator("xpath=ancestor::figure").locator("figcaption"),
  ).toHaveCount(0);
  await expect(article).toContainText("必要となります。具体的には");
  await expect(article).toContainText("生き様専用アイテム");
  await expect(article).toContainText("原則効果は重複しません。");
  await expect(
    article.getByRole("link", { name: "戦闘ルール", exact: true }),
  ).toHaveAttribute("href", "/neon-underrealm-trpg/rules/battle");
  await expect(itemTable).toHaveCount(1);
  await expect(itemTable.locator("tbody tr")).toHaveCount(6);
  await expect(
    itemTable
      .locator("tbody tr")
      .evaluateAll((rows) =>
        rows.map((row) => row.querySelector("td")?.textContent?.trim()),
      ),
  ).resolves.toEqual(expectedItemLinks.map(([name]) => name));

  for (const [name, href] of expectedItemLinks) {
    await expect(
      itemTable.getByRole("link", { name, exact: true }),
    ).toHaveAttribute("href", href);
  }

  for (const [name, href] of expectedIkizamaLinks) {
    await expect(
      itemTable.getByRole("link", { name, exact: true }),
    ).toHaveAttribute("href", href);
  }

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

test("アイテム一覧 desktop @items-index-desktop", async ({ page }) => {
  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.dataItems);
  await expectItemsIndexPage(page);
  await hideAstroDevToolbar(page);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/items-index-desktop.png`,
  });
});

test("アイテム一覧 mobile @items-index-mobile", async ({ page }) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.dataItems);
  await expectItemsIndexPage(page);
  await hideAstroDevToolbar(page);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/items-index-mobile.png`,
  });
});
