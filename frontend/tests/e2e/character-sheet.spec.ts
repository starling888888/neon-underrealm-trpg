import { expect, test } from "@playwright/test";
import { characterSheetDefaultValues } from "../../src/character-sheet/form/values";
import { siteBaseUrl, siteViewports } from "../support/site";

const importedCharacterImageBase64 =
  "UklGRiIAAABXRUJQVlA4IBYAAADQAQCdASoBAAEALmk0mk0iIiIiIgBoSywA";

function createCharacterSheetJsonImport() {
  const values = structuredClone(characterSheetDefaultValues);
  values.profile.pcName = "JSON入力PC";

  return {
    ...values,
    imageBase64String: importedCharacterImageBase64,
  };
}

test.describe("character sheet page", () => {
  test("opens the CCFOLIA confirmation dialog from every action pane", async ({
    page,
  }) => {
    await page.goto("character-sheet/");
    const dialog = page.getByRole("dialog", { name: "CCFOLIAコピー" });

    for (const viewport of [
      siteViewports.desktop,
      siteViewports.tablet,
      siteViewports.mobile,
    ]) {
      await page.setViewportSize(viewport);
      const menuTrigger = page.getByRole("button", {
        exact: true,
        name: "操作メニューを開く、エラーはありません。",
      });
      if (await menuTrigger.isVisible()) await menuTrigger.click();
      await page
        .getByRole("button", { exact: true, name: "CCFOLIAコピー" })
        .click();
      await expect(dialog).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
    }
  });

  test("imports JSON with an image through the file input", async ({
    page,
  }) => {
    await page.goto("character-sheet/");
    const actionMenuTrigger = page.getByRole("button", {
      exact: true,
      name: "操作メニューを開く、エラーはありません。",
    });
    const actionMenu = page.getByRole("region", {
      name: "キャラクターシートの操作メニュー",
    });
    const openResponsiveActionMenu = async () => {
      if (
        (await actionMenuTrigger.isVisible()) &&
        !(await actionMenu.isVisible())
      ) {
        await actionMenuTrigger.click();
      }
    };
    const importFile = async (value: object) => {
      await openResponsiveActionMenu();
      await page
        .getByRole("button", { name: /^インポート/ })
        .click();
      await page
        .locator('input[accept="application/json,.json"]')
        .setInputFiles({
          buffer: Buffer.from(JSON.stringify(value)),
          mimeType: "application/json",
          name: "character.json",
        });
      await page
        .getByRole("dialog", { name: "JSON入力の確認" })
        .getByRole("button", { exact: true, name: "インポート" })
        .click();
    };

    await importFile(createCharacterSheetJsonImport());
    await expect(page.getByLabel("PC名", { exact: true })).toHaveValue(
      "JSON入力PC",
    );
    await expect(
      page.getByRole("img", { name: "選択したキャラクター画像" }),
    ).toBeVisible();
  });

  test("dismisses an open dialog before the responsive action menu", async ({
    page,
  }) => {
    await page.setViewportSize(siteViewports.mobile);
    await page.goto("character-sheet/");
    const trigger = page.getByRole("button", {
      exact: true,
      name: "操作メニューを開く、エラーはありません。",
    });
    const menu = page.getByRole("region", {
      name: "キャラクターシートの操作メニュー",
    });
    await trigger.click();
    await page
      .getByRole("region", { exact: true, name: "武器" })
      .getByRole("button", { exact: true, name: "武器1：武器を選択" })
      .press("Enter");
    await expect(
      page.getByRole("dialog", { name: "武器を選択" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
  });

  test("switches navigation rails and controls at character sheet breakpoints", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1023, height: 1180 });
    await page.goto("character-sheet/");

    const siteMenuRail = page.locator(".character-sheet-menu-rail");
    const sectionNavigation = page.getByRole("navigation", {
      name: "セクションにジャンプ",
    });
    const actionMenuTrigger = page.getByRole("button", {
      name: "操作メニューを開く、エラーはありません。",
    });
    const headerMenuTrigger = page.getByRole("button", {
      name: "サイトメニューを開く",
    });

    for (const { width, hasDesktopActionRail, hasSiteMenuRail } of [
      { width: 1023, hasDesktopActionRail: false, hasSiteMenuRail: false },
      { width: 1024, hasDesktopActionRail: false, hasSiteMenuRail: true },
      { width: 1343, hasDesktopActionRail: false, hasSiteMenuRail: true },
      { width: 1344, hasDesktopActionRail: true, hasSiteMenuRail: true },
    ]) {
      await page.setViewportSize({ width, height: 1180 });

      if (hasSiteMenuRail) {
        await expect(siteMenuRail).toBeVisible();
        await expect(headerMenuTrigger).toBeHidden();
      } else {
        await expect(siteMenuRail).toBeHidden();
        await expect(headerMenuTrigger).toBeVisible();
      }

      if (hasDesktopActionRail) {
        await expect(sectionNavigation).toBeVisible();
        await expect(actionMenuTrigger).toBeHidden();
      } else {
        await expect(sectionNavigation).toBeHidden();
        await expect(actionMenuTrigger).toBeVisible();
      }

      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.scrollWidth - window.innerWidth,
          ),
        )
        .toBe(0);
    }
  });

  test("jumps to a first-level section from the action menu", async ({
    page,
  }) => {
    await page.setViewportSize(siteViewports.mobile);
    await page.goto("character-sheet/");
    const menu = page.getByRole("region", {
      name: "キャラクターシートの操作メニュー",
    });
    await page
      .getByRole("button", {
        name: "操作メニューを開く、エラーはありません。",
      })
      .click();
    await menu.getByRole("button", { name: "武器・防具" }).click();

    await expect(menu).toBeVisible();
    await page.waitForFunction(() => window.scrollY > 50);
    await expect(page.locator("#weapons-and-armor")).toBeInViewport();
  });

  test("keeps header drawer and action menu Escape handling ordered on mobile", async ({
    page,
  }) => {
    await page.setViewportSize(siteViewports.mobile);
    await page.goto("character-sheet/");
    const actionMenuTrigger = page.getByRole("button", {
      name: "操作メニューを開く、エラーはありません。",
    });
    const actionMenu = page.getByRole("region", {
      name: "キャラクターシートの操作メニュー",
    });
    const headerMenuTrigger = page.locator(
      "[data-character-sheet-menu-open]:visible",
    );
    const headerDrawer = page.locator("#character-sheet-site-menu-drawer");

    await actionMenuTrigger.click();
    await expect(actionMenu).toBeVisible();
    await headerMenuTrigger.click();
    await expect(headerDrawer).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(headerDrawer).toBeHidden();
    await expect(actionMenu).toBeHidden();
    await expect(page.locator(".character-sheet-logo-link")).toHaveAttribute(
      "href",
      `${new URL(siteBaseUrl).pathname}`,
    );
  });

  test("marks the page as excluded from the Pagefind index", async ({
    page,
  }) => {
    await page.goto("character-sheet/");
    await expect(page.locator("body")).toHaveAttribute(
      "data-pagefind-ignore",
      "",
    );
  });
});
