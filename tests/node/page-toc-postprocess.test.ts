import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createHeadingId,
  processPageTocHtml,
} from "../../scripts/postprocess-page-toc/lib";

const html = String.raw;

describe("page toc postprocess", () => {
  it("skips pages without enabled marker", () => {
    const source = html`<!doctype html><main data-page-content><h2>見出し</h2></main>`;
    const result = processPageTocHtml(source);

    assert.equal(result.processed, false);
    assert.equal(result.html, source);
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

    assert.equal(result.processed, true);
    assert.deepEqual(
      result.tocItems.map((item) => item.depth),
      [2, 3, 2],
    );
    assert.match(result.html, /<ol class="page-toc-list">/);
    assert.match(result.html, /class="page-toc-item page-toc-item-depth-3"/);
    assert.doesNotMatch(result.html, /対象外<\/a>/);
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

    assert.equal(result.processed, true);
    assert.equal(result.tocItems.length, 3);
    assert.equal(countMatches(result.html, /<ol class="page-toc-list">/g), 2);
    assert.equal(countMatches(result.html, /href="#h-[a-f0-9]{8}"/g), 6);
    assert.match(
      result.html,
      /<div class="mobile-page-heading" data-mobile-page-heading=""><h1>ページタイトル<\/h1><section data-page-toc-slot="" data-page-toc-enabled="true" data-mobile-page-toc="">/,
    );
  });

  it("generates stable ascii hash ids", () => {
    const id = createHeadingId(2, " コンボ  中の リアクション ");

    assert.match(id, /^h-[a-f0-9]{8}$/);
    assert.equal(id, createHeadingId(2, "コンボ 中の リアクション"));
  });

  it("fails on duplicate generated ids instead of suffixing silently", () => {
    assert.throws(
      () =>
        processPageTocHtml(
          pageWithHeadings(html`
            <h2>重複</h2>
            <h2>重複</h2>
          `),
        ),
      /Duplicate PageToc heading id/,
    );
  });

  it("accepts explicit data-anchor-id", () => {
    const result = processPageTocHtml(
      pageWithHeadings(html`
        <h2 data-anchor-id="reaction-check">判定</h2>
        <h2>次の見出し</h2>
      `),
    );

    assert.match(result.html, /id="reaction-check"/);
    assert.match(result.html, /href="#reaction-check"/);
  });

  it("replaces non-ascii generated html ids with ascii hash ids", () => {
    const result = processPageTocHtml(
      pageWithHeadings(html`
        <h2 id="判定">判定</h2>
        <h2>次の見出し</h2>
      `),
    );

    assert.match(result.warnings[0], /Replaced non-ASCII heading id/);
    assert.doesNotMatch(result.html, /id="判定"/);
    assert.match(result.html, /id="h-[a-f0-9]{8}"/);
  });

  it("excludes data-toc-exclude headings", () => {
    const result = processPageTocHtml(
      pageWithHeadings(html`
        <h2>表示する見出し</h2>
        <h2 data-toc-exclude>除外する見出し</h2>
        <h2>もう一つの見出し</h2>
      `),
    );

    assert.equal(result.tocItems.length, 2);
    assert.doesNotMatch(result.html, /除外する見出し<\/a>/);
  });

  it("hides the toc shell when there are too few toc items", () => {
    const result = processPageTocHtml(
      pageWithHeadings(html`
        <h2>単独見出し</h2>
      `),
    );

    assert.equal(result.tocItems.length, 1);
    assert.match(result.html, /data-page-toc-empty="true"/);
    assert.match(result.html, /<nav[^>]*hidden=""/);
    assert.doesNotMatch(result.html, /page-toc-list/);
  });

  it("hides every enabled toc shell when there are too few toc items", () => {
    const result = processPageTocHtml(
      pageWithHeadings(
        html`
          <h2>単独見出し</h2>
        `,
        { mobileSlot: true },
      ),
    );

    assert.equal(result.tocItems.length, 1);
    assert.equal(countMatches(result.html, /data-page-toc-empty="true"/g), 2);
    assert.equal(countMatches(result.html, /hidden=""/g), 2);
    assert.doesNotMatch(result.html, /page-toc-list/);
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
