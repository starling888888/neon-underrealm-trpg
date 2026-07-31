import { readFile } from "node:fs/promises";

import { expect, test } from "@playwright/test";
import { visualBaseUrl, visualViewports } from "./config";

test.describe("character sheet page", () => {
  test("exports JSON from desktop and responsive action buttons", async ({
    page,
  }) => {
    await page.setViewportSize(visualViewports.desktop);
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

    await page.setViewportSize(visualViewports.mobile);
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
      visualViewports.desktop,
      visualViewports.tablet,
      visualViewports.mobile,
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
    await page.setViewportSize(visualViewports.mobile);
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

  test("uses a menu rail only when the one-column sheet has enough width", async ({
    page,
  }) => {
    await page.setViewportSize(visualViewports.desktop);
    await page.goto("character-sheet/");
    await expect(page.locator(".character-sheet-menu-rail")).toBeHidden();
    await page.setViewportSize({ width: 1024, height: 1180 });
    await expect(page.locator(".character-sheet-menu-rail")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "キャラクターシート", exact: true }),
    ).toHaveAttribute("aria-current", "page");
  });

  test("uses a header menu on mobile and keeps subpath links", async ({
    page,
  }) => {
    await page.setViewportSize(visualViewports.mobile);
    await page.goto("character-sheet/");
    await page.locator("[data-character-sheet-menu-open]:visible").click();
    await expect(
      page.locator("#character-sheet-site-menu-drawer"),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator(".character-sheet-logo-link")).toHaveAttribute(
      "href",
      `${new URL(visualBaseUrl).pathname}`,
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
