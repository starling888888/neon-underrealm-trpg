import { expect, type Locator, type Page } from "@playwright/test";

export interface PageTocs {
  desktop: Locator;
  mobile: Locator;
}

export function getPageTocs(page: Page): PageTocs {
  return {
    desktop: page.locator(".page-toc [data-page-toc-content]"),
    mobile: page.locator("[data-mobile-page-toc] [data-page-toc-content]"),
  };
}

export async function expectGeneratedPageToc(
  page: Page,
  expectedHeading: string,
): Promise<PageTocs> {
  const tocs = getPageTocs(page);

  await expect(tocs.desktop).toContainText(expectedHeading);
  await expect(tocs.mobile).toContainText(expectedHeading);

  return tocs;
}
