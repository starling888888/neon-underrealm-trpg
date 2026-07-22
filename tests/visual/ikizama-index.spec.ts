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

async function expectIkizamaIndexPage(page: Page) {
  const article = page.locator("article.ikizama-index");
  const dataSection = article.locator("[data-ikizama-data-section]");
  const ikizamaList = article.locator("[data-ikizama-list]");

  await expect(page).toHaveTitle(
    "生き様 | 光都暗域〈ネオン・アンダーレルム〉TRPG",
  );
  await expect(
    article.getByRole("heading", { name: "生き様", exact: true }),
  ).toHaveCount(1);
  await expect(
    article.getByRole("heading", { name: "生き様データの見方", exact: true }),
  ).toHaveCount(1);
  await expect(
    article.getByRole("heading", { name: "生き様一覧", exact: true }),
  ).toHaveCount(1);
  await expect(
    article.locator("img[src$='images/data/ikizama_hero.webp']"),
  ).toHaveCount(1);
  await expect(dataSection).toHaveAttribute("data-ikizama-id", "burai");
  await expect(dataSection.locator("[data-skill-card]")).toHaveCount(1);
  await expect.poll(() => ikizamaList.locator("li").count()).toBeGreaterThan(0);
  await expect
    .poll(() =>
      ikizamaList.locator("li").evaluateAll((items) =>
        items.every((item) => {
          const links = item.querySelectorAll("a[href]");
          const description = item.querySelector("span");
          const itemHref = links.item(1)?.getAttribute("href") ?? "";

          return (
            links.length === 2 &&
            Boolean(description?.textContent?.trim()) &&
            itemHref.includes("/data/items/")
          );
        }),
      ),
    )
    .toBe(true);
  const tocs = await expectGeneratedPageToc(page, "生き様一覧");
  const expectedTocHeadings = ["生き様データの見方", "生き様一覧"];

  await expect(tocs.desktop.locator(".page-toc-link")).toHaveText(
    expectedTocHeadings,
  );
  await expect(tocs.mobile.locator(".page-toc-link")).toHaveText(
    expectedTocHeadings,
  );
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

test("生き様一覧 desktop @ikizama-index-desktop", async ({ page }) => {
  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.dataIkizama);
  await expectIkizamaIndexPage(page);
  await hideAstroDevToolbar(page);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/ikizama-index-desktop.png`,
  });
});

test("生き様一覧 mobile @ikizama-index-mobile", async ({ page }) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.dataIkizama);
  await expectIkizamaIndexPage(page);
  await expect(page.locator("[data-mobile-page-toc-trigger]")).toBeVisible();
  await hideAstroDevToolbar(page);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/ikizama-index-mobile.png`,
  });
});
