import { readFile } from "node:fs/promises";

import { expect, test } from "@playwright/test";
import { siteBaseUrl, siteViewports } from "../support/site";

test.describe("character sheet page", () => {
  test("scrolls only a long responsive error list on mobile", async ({
    page,
  }) => {
    await page.setViewportSize(siteViewports.mobile);
    await page.goto("character-sheet/");
    const menuTrigger = page.getByRole("button", {
      exact: true,
      name: "操作メニューを開く、エラーはありません。",
    });
    await menuTrigger.click();

    const menu = page.getByRole("region", {
      name: "キャラクターシートの操作メニュー",
    });
    const errorSummary = menu.locator("section[aria-live]");
    const errorList = errorSummary.locator("ul");
    await errorList.evaluate((list) => {
      for (let index = 0; index < 24; index += 1) {
        const item = document.createElement("li");
        item.textContent = `テストエラー ${index + 1}`;
        list.append(item);
      }
    });

    const errorCountBefore = await errorSummary
      .getByText("エラーはありません。")
      .boundingBox();
    const resetButtonBefore = await menu
      .getByRole("button", { exact: true, name: "初期化" })
      .boundingBox();
    const scrolled = await errorList.evaluate((list) => {
      list.scrollTop = list.scrollHeight;
      return {
        overflowY: getComputedStyle(list).overflowY,
        scrollHeight: list.scrollHeight,
        scrollTop: list.scrollTop,
      };
    });

    expect(scrolled.overflowY).toBe("auto");
    expect(scrolled.scrollHeight).toBeGreaterThan(scrolled.scrollTop);
    expect(scrolled.scrollTop).toBeGreaterThan(0);
    expect(
      await errorSummary.getByText("エラーはありません。").boundingBox(),
    ).toEqual(errorCountBefore);
    expect(
      await menu
        .getByRole("button", { exact: true, name: "初期化" })
        .boundingBox(),
    ).toEqual(resetButtonBefore);
  });

  test("exports JSON from desktop and responsive action buttons", async ({
    page,
  }) => {
    await page.setViewportSize(siteViewports.desktop);
    await page.goto("character-sheet/");
    await expect(
      page.getByRole("status", { name: "保存済みの入力を復元しています" }),
    ).toBeHidden();

    await page.getByLabel("PC名", { exact: true }).fill("テストPC");
    await page.getByLabel("PL名", { exact: true }).fill("テストPL");
    const desktopDownloadPromise = page.waitForEvent("download");
    await page
      .getByRole("button", { exact: true, name: "エクスポート" })
      .click();
    expect((await desktopDownloadPromise).suggestedFilename()).toMatch(
      /^neon-underrealm_character-sheet_\d{4}-\d{2}-\d{2}_テストPL_テストPC\.json$/,
    );

    await page.setViewportSize(siteViewports.mobile);
    const menuTrigger = page.getByRole("button", {
      exact: true,
      name: "操作メニューを開く、エラーはありません。",
    });
    await menuTrigger.click();
    const responsiveDownloadPromise = page.waitForEvent("download");
    await page
      .getByRole("region", { name: "キャラクターシートの操作メニュー" })
      .getByRole("button", { exact: true, name: "エクスポート" })
      .click();
    expect((await responsiveDownloadPromise).suggestedFilename()).toMatch(
      /^neon-underrealm_character-sheet_\d{4}-\d{2}-\d{2}_テストPL_テストPC\.json$/,
    );
  });

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

  test("notifies CCFOLIA clipboard success and failure", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: () => Promise.resolve() },
      });
    });
    await page.goto("character-sheet/");

    const copy = async () => {
      const actionMenuTrigger = page.getByRole("button", {
        exact: true,
        name: "操作メニューを開く、エラーはありません。",
      });
      if (await actionMenuTrigger.isVisible()) {
        await actionMenuTrigger.click();
      }
      await page
        .getByRole("button", { exact: true, name: "CCFOLIAコピー" })
        .click();
      await page
        .getByRole("dialog", { name: "CCFOLIAコピー" })
        .getByRole("button", { exact: true, name: "コピー" })
        .click();
    };

    await copy();
    await expect(
      page.getByRole("dialog", { name: "CCFOLIAコピー完了" }),
    ).toBeVisible();
    await page
      .getByRole("dialog", { name: "CCFOLIAコピー完了" })
      .getByRole("button", { exact: true, name: "確認" })
      .click();

    await page.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: () => Promise.reject(new Error("rejected")) },
      });
    });
    await copy();
    await expect(
      page.getByRole("dialog", { name: "CCFOLIAコピー失敗" }),
    ).toBeVisible();
  });

  test("imports JSON through the file input and reports an invalid image", async ({
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
    await page.locator('input[accept="image/*"]').setInputFiles({
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLh+wAAAABJRU5ErkJggg==",
        "base64",
      ),
      mimeType: "image/png",
      name: "character.png",
    });
    await expect(
      page.getByRole("img", { name: "選択したキャラクター画像" }),
    ).toBeVisible();

    await openResponsiveActionMenu();
    const downloadPromise = page.waitForEvent("download");
    await page
      .getByRole("button", { exact: true, name: "エクスポート" })
      .click();
    const downloadPath = await (await downloadPromise).path();
    if (downloadPath === null) throw new Error("Expected an exported JSON.");
    const imported = JSON.parse(await readFile(downloadPath, "utf8")) as Record<
      string,
      unknown
    >;
    imported.profile = {
      ...(imported.profile as Record<string, unknown>),
      pcName: "JSON入力PC",
    };

    const importFile = async (value: Record<string, unknown>) => {
      await openResponsiveActionMenu();
      await page
        .getByRole("button", { exact: true, name: "インポート" })
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

    await page.getByRole("button", { name: "画像をクリア" }).click();
    await expect(
      page.getByRole("img", { name: "選択したキャラクター画像" }),
    ).toBeHidden();
    await importFile(imported);
    await expect(page.getByLabel("PC名", { exact: true })).toHaveValue(
      "JSON入力PC",
    );
    await expect(
      page.getByRole("img", { name: "選択したキャラクター画像" }),
    ).toBeVisible();
    await importFile({ ...imported, imageBase64String: 42 });
    await expect(
      page.getByRole("dialog", { name: "入力データの画像の誤り" }),
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

  test("keeps the desktop action rail at the right and centers the form column", async ({
    page,
  }) => {
    await page.setViewportSize(siteViewports.desktop);
    await page.goto("character-sheet/");
    const actionPane = page.locator('[aria-label="キャラクターシートの操作"]');
    const form = page.locator("[data-character-sheet-layout]");
    const layout = form.locator("xpath=..");

    await expect(actionPane).toBeVisible();
    await expect
      .poll(() => form.evaluate((element) => element.clientWidth))
      .toBe(704);
    await expect
      .poll(() =>
        actionPane.evaluate((element) => element.getBoundingClientRect().width),
      )
      .toBe(240);
    await expect
      .poll(async () => {
        const [formBox, layoutBox, actionPaneBox] = await Promise.all([
          form.boundingBox(),
          layout.boundingBox(),
          actionPane.boundingBox(),
        ]);
        if (formBox === null || layoutBox === null || actionPaneBox === null) {
          return Number.NaN;
        }
        const formColumnWidth = layoutBox.width - actionPaneBox.width - 24;
        return Math.max(
          Math.abs(
            formBox.x + formBox.width / 2 - (layoutBox.x + formColumnWidth / 2),
          ),
          Math.abs(
            actionPaneBox.x +
              actionPaneBox.width -
              (layoutBox.x + layoutBox.width),
          ),
        );
      })
      .toBeLessThan(1);

    const sectionTarget = page.locator("#skills");
    await page
      .getByRole("navigation", { name: "セクションにジャンプ" })
      .getByRole("button", { exact: true, name: "スキル" })
      .click();
    await expect
      .poll(() =>
        page.evaluate(() => {
          const header = document.querySelector("[data-site-header]");
          const target = document.getElementById("skills");
          if (header === null || target === null) return Number.NaN;
          return Math.abs(
            target.getBoundingClientRect().top -
              header.getBoundingClientRect().height,
          );
        }),
      )
      .toBeLessThan(2);
    await expect(sectionTarget).toBeInViewport();

    await page.evaluate(() => window.scrollTo(0, 1600));
    await expect
      .poll(() =>
        actionPane.evaluate((element) => element.getBoundingClientRect().top),
      )
      .toBeGreaterThan(0);

    await page.setViewportSize(siteViewports.tablet);
    await expect
      .poll(() => form.evaluate((element) => element.clientWidth))
      .toBe(704);
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
