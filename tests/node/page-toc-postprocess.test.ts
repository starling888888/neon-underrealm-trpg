import { describe, expect, it } from "vitest";
import {
  createHeadingId,
  processPageTocHtml,
} from "../../scripts/postprocess-page-toc/lib";

const html = String.raw;

describe("page toc postprocess", () => {
  it("skips pages without enabled marker", () => {
    const source = html`<!doctype html><main data-page-content><h2>見出し</h2></main>`;
    const result = processPageTocHtml(source);

    expect(result.processed).toBe(false);
    expect(result.html).toBe(source);
  });

  it("generates toc items from h2 and h3 headings", () => {
    const result = processPageTocHtml(
      pageWithHeadings(html`
        <h1>Page title</h1>
        <h2>見出し A</h2>
        <p>Body</p>
        <h3>小見出し</h3>
        <h4>対象外</h4>
        <h2>見出し B</h2>
      `),
    );

    expect(result.processed).toBe(true);
    expect(result.tocItems.map((item) => item.depth)).toEqual([2, 3, 2]);
    expect(result.html).toMatch(/<ol class="page-toc-list">/);
    expect(result.html).toMatch(/class="page-toc-item page-toc-item-depth-3"/);
    expect(result.html).not.toMatch(/対象外<\/a>/);
  });

  it("generates the same toc items for multiple enabled slots", () => {
    const result = processPageTocHtml(
      pageWithHeadings(
        html`
          <h1>ページタイトル</h1>
          <h2>見出し A</h2>
          <h3>小見出し</h3>
          <h2>見出し B</h2>
        `,
        { mobileSlot: true },
      ),
    );

    expect(result.processed).toBe(true);
    expect(result.tocItems.length).toBe(3);
    expect(countMatches(result.html, /<ol class="page-toc-list">/g)).toBe(2);
    expect(countMatches(result.html, /href="#h-[a-f0-9]{8}"/g)).toBe(6);
    expect(result.html).toMatch(
      /<div class="mobile-page-heading" data-mobile-page-heading=""><h1>ページタイトル<\/h1><section data-page-toc-slot="" data-page-toc-enabled="true" data-mobile-page-toc="">/,
    );
  });

  it("generates stable ascii hash ids", () => {
    const id = createHeadingId(2, " コンボ  中の リアクション ");

    expect(id).toMatch(/^h-[a-f0-9]{8}$/);
    expect(id).toBe(createHeadingId(2, "コンボ 中の リアクション"));
  });

  it("fails on duplicate generated ids instead of suffixing silently", () => {
    expect(() =>
      processPageTocHtml(
        pageWithHeadings(html`
            <h2>重複</h2>
            <h2>重複</h2>
          `),
      ),
    ).toThrow(/Duplicate PageToc heading id/);
  });

  it("accepts explicit data-anchor-id", () => {
    const result = processPageTocHtml(
      pageWithHeadings(html`
        <h2 data-anchor-id="reaction-check">判定</h2>
        <h2>次の見出し</h2>
      `),
    );

    expect(result.html).toMatch(/id="reaction-check"/);
    expect(result.html).toMatch(/href="#reaction-check"/);
  });

  it("replaces non-ascii generated html ids with ascii hash ids", () => {
    const result = processPageTocHtml(
      pageWithHeadings(html`
        <h2 id="判定">判定</h2>
        <h2>次の見出し</h2>
      `),
    );

    expect(result.warnings[0]).toMatch(/Replaced non-ASCII heading id/);
    expect(result.html).not.toMatch(/id="判定"/);
    expect(result.html).toMatch(/id="h-[a-f0-9]{8}"/);
  });

  it("excludes data-toc-exclude headings", () => {
    const result = processPageTocHtml(
      pageWithHeadings(html`
        <h2>表示する見出し</h2>
        <h2 data-toc-exclude>除外する見出し</h2>
        <h2>もう一つの見出し</h2>
      `),
    );

    expect(result.tocItems.length).toBe(2);
    expect(result.html).not.toMatch(/除外する見出し<\/a>/);
  });

  it("renders a toc link for a single toc item", () => {
    const result = processPageTocHtml(
      pageWithHeadings(html`
        <h2>単独見出し</h2>
      `),
    );

    expect(result.tocItems.length).toBe(1);
    expect(result.html).not.toMatch(/data-page-toc-empty="true"/);
    expect(result.html).toMatch(/<ol class="page-toc-list">/);
    expect(result.html).toMatch(/単独見出し<\/a>/);
  });

  it("renders every enabled toc shell for a single toc item", () => {
    const result = processPageTocHtml(
      pageWithHeadings(
        html`
          <h2>単独見出し</h2>
        `,
        { mobileSlot: true },
      ),
    );

    expect(result.tocItems.length).toBe(1);
    expect(countMatches(result.html, /<ol class="page-toc-list">/g)).toBe(2);
    expect(countMatches(result.html, /単独見出し<\/a>/g)).toBe(2);
  });

  it("renders an empty message in every enabled toc shell without toc items", () => {
    const result = processPageTocHtml(
      pageWithHeadings(html`<p>見出しはありません。</p>`, {
        mobileSlot: true,
      }),
    );

    expect(result.tocItems.length).toBe(0);
    expect(countMatches(result.html, /data-page-toc-empty="true"/g)).toBe(2);
    expect(countMatches(result.html, /見出しがありません/g)).toBe(2);
    expect(countMatches(result.html, /hidden=""/g)).toBe(0);
    expect(result.html).not.toMatch(/page-toc-list/);
  });
});

function pageWithHeadings(
  content: string,
  options: { mobileSlot?: boolean } = {},
): string {
  return html`<!doctype html>
    <html lang="ja">
      <body>
        <main data-page-content>${content}</main>
        <nav data-page-toc-slot data-page-toc-enabled="true">
          <p>目次</p>
          <div data-page-toc-content></div>
        </nav>
        ${
          options.mobileSlot
            ? html`<section data-page-toc-slot data-page-toc-enabled="true" data-mobile-page-toc>
              <button type="button" aria-expanded="false">目次</button>
              <div data-page-toc-content></div>
            </section>`
            : ""
        }
      </body>
    </html>`;
}

function countMatches(source: string, pattern: RegExp): number {
  return [...source.matchAll(pattern)].length;
}
