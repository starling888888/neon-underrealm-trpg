import { expect, type Locator, test } from "@playwright/test";
import { visualBaseUrl, visualRoutes, visualViewports } from "./config";

const staticHeroRoutes = [
  visualRoutes.world,
  visualRoutes.advancement,
  visualRoutes.characterMaking,
  visualRoutes.rules,
  visualRoutes.scenarioPlay,
  visualRoutes.battle,
  visualRoutes.data,
  visualRoutes.dataRyugi,
  visualRoutes.dataIkizama,
  visualRoutes.dataItems,
  visualRoutes.dataItemsWeapons,
  visualRoutes.dataItemsArmors,
  visualRoutes.dataItemsOmamori,
  visualRoutes.dataItemsCybernetics,
  visualRoutes.dataItemsNanomachines,
  visualRoutes.dataItemsDrugs,
] as const;

const dynamicHeroRoutes = [
  visualRoutes.dataRyugiDetail("kenkaya"),
  visualRoutes.dataIkizamaDetail("burai"),
] as const;

const imageBasePath = new URL(visualBaseUrl).pathname.replace(/\/$/u, "");

const layoutShiftScenarios = [
  {
    name: "top logo",
    route: visualRoutes.home,
    imageSelector: "img[src$='images/top_logo.webp']",
    followingSelector: "#release-notes-title",
    imagePath: "/images/top_logo.webp",
  },
  {
    name: "normal hero",
    route: visualRoutes.world,
    imageSelector: "article img[src$='images/world/hero.webp']",
    followingSelector: "article > p",
    imagePath: "/images/world/hero.webp",
  },
  {
    name: "item hero",
    route: visualRoutes.dataItemsWeapons,
    imageSelector: "article img[src$='images/data/items/weapons_hero.webp']",
    followingSelector: "article > p",
    imagePath: "/images/data/items/weapons_hero.webp",
  },
  {
    name: "dynamic hero",
    route: visualRoutes.dataRyugiDetail("kenkaya"),
    imageSelector: "article img.ryugi-hero",
    followingSelector: "article > p",
    imagePath: "/images/data/ryugi/kenkaya_hero.webp",
  },
] as const;

function createDeferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((next) => {
    resolve = next;
  });

  return { promise, resolve };
}

async function getY(locator: Locator) {
  const box = await locator.boundingBox();

  expect(box).not.toBeNull();
  return box?.y ?? Number.NaN;
}

test("hero images reserve their layout area @hero-layout-stability", async ({
  page,
}) => {
  for (const route of staticHeroRoutes) {
    await page.goto(route);
    const hero = page.locator("article img[src$='hero.webp']");

    await expect(hero).toHaveCount(1);
    await expect(hero).toHaveAttribute("width", "1672");
    await expect(hero).toHaveAttribute("height", "941");
  }

  for (const route of dynamicHeroRoutes) {
    await page.goto(route);
    const hero = page.locator("article img[class$='hero']");

    await expect(hero).toHaveCount(1);
    await expect(hero).toHaveAttribute("width", "1672");
    await expect(hero).toHaveAttribute("height", "941");
  }
});

for (const scenario of layoutShiftScenarios) {
  for (const [viewport, viewportName] of [
    [visualViewports.desktop, "desktop"],
    [visualViewports.mobile, "mobile"],
  ] as const) {
    test(`${scenario.name} keeps the following content in place on ${viewportName} @hero-layout-stability`, async ({
      page,
    }) => {
      const assetPath = `${imageBasePath}${scenario.imagePath}`;
      const assetRequest = createDeferred();
      const releaseAsset = createDeferred();
      const assetPattern = new RegExp(
        `${assetPath.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}$`,
        "u",
      );

      await page.setViewportSize(viewport);
      await page.route(assetPattern, async (route) => {
        assetRequest.resolve();
        await releaseAsset.promise;
        await route.continue();
      });

      try {
        await page.goto(scenario.route, { waitUntil: "domcontentloaded" });

        const image = page.locator(scenario.imageSelector);
        const following = page.locator(scenario.followingSelector).first();

        await expect(image).toHaveCount(1);
        await expect(image).toHaveAttribute("src", assetPath);
        await expect(following).toHaveCount(1);
        await image.scrollIntoViewIfNeeded();
        await assetRequest.promise;

        const yBeforeImageLoad = await getY(following);
        const responsePromise = page.waitForResponse(
          (response) => new URL(response.url()).pathname === assetPath,
        );

        releaseAsset.resolve();

        const response = await responsePromise;
        expect(response.ok()).toBeTruthy();
        await expect
          .poll(() =>
            image.evaluate(
              (element) => (element as HTMLImageElement).naturalWidth,
            ),
          )
          .toBeGreaterThan(0);

        const yAfterImageLoad = await getY(following);
        expect(yAfterImageLoad).toBe(yBeforeImageLoad);
      } finally {
        releaseAsset.resolve();
        await page.unroute(assetPattern);
      }
    });
  }
}
