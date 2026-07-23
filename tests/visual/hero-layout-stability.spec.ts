import { expect, test } from "@playwright/test";
import { visualOutputDir, visualRoutes, visualViewports } from "./config";

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
  visualRoutes.dataRyugiKenkaya,
  visualRoutes.dataIkizamaBurai,
] as const;

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

test("top logo reserves its layout area on desktop and mobile @hero-layout-stability", async ({
  page,
}) => {
  for (const [viewport, name] of [
    [visualViewports.desktop, "desktop"],
    [visualViewports.mobile, "mobile"],
  ] as const) {
    await page.setViewportSize(viewport);
    await page.goto(visualRoutes.home);

    const logo = page.locator("img[src$='images/top_logo.webp']");

    await expect(logo).toHaveCount(1);
    await expect(logo).toHaveAttribute("width", "1015");
    await expect(logo).toHaveAttribute("height", "762");
    await expect(logo).toBeVisible();
    await page.screenshot({
      fullPage: true,
      path: `${visualOutputDir}/hero-layout-stability-${name}.png`,
    });
  }
});
