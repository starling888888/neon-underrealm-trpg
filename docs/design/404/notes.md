# 404

## VRT baseline

- test: `tests/visual/vrt/404.spec.ts` の `@vrt @404 @<state> @<viewport>`
- route: `/not-found/`
- state: default
- snapshots:
  - desktop `1440x1200`: `404-default-desktop.png`
  - tablet `820x1180`: `404-default-tablet.png`
  - mobile `390x900`: `404-default-mobile.png`
- baseline update: 通常実行では比較のみ行う。差分を確認したうえでユーザーが明示指示した場合だけ `npm run visual:update` を実行する。

## Mode

- design fix
- `40-2-404-page` の実装後Visual Reviewで確認したactual screenshotを、ユーザー承認により404ページのdesign正本として採用する。

## Target

- page / component: 存在しないURLで表示する404ページ
- route:
  - ページ出力: `/404/`
  - canonical capture: `/not-found/`
- viewport:
  - desktop: `1440x1200`
  - mobile: `390x900`
- states:
  - desktop full-page screenshot
  - mobile full-page screenshot
- design images:
  - `docs/design/404/design-desktop.png`
  - `docs/design/404/design-mobile.png`

## Referenced SSoT

- `AGENTS.md`
- `.agents/skills/design-image-generation/SKILL.md`
- historical task issue: `docs/issue/done/phase-3/40-2-404-page.md`
- `docs/requirements/pages.md`
- `docs/requirements/layout-navigation.md`
- `docs/requirements/assets-seo.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- `docs/design/global-styles/notes.md`
- `docs/design/site-layout/notes.md`
- `docs/design/page-toc/notes.md`

## Design Direction

- visual direction: 白寄りの本文面、暗めのHeader / Footer、青緑のリンクaccentを維持する。404画像を主役にし、案内文とトップリンクだけを控えめに続ける。
- layout direction: desktopでは既存Header、左SiteMenu、中央本文、Footerを維持し、右PageToc領域を表示しない。mobileでは既存HeaderとMobileMenuを維持し、MobilePageToc triggerを表示しない。
- typography direction: `404 Not Found` のH1は文書構造と画像altのために存在させるが、視覚的には表示しない。可視本文は「お探しのページは存在しません」と「トップに戻る」だけにする。
- color / accent usage: 画像は原画像の黒、本文は既存の濃色、トップリンクは既存の青緑accentを使用する。追加のglow、gradient、card、button風の装飾を加えない。

## Existing Design Constraints

- `global-styles` の白寄り背景、暗めHeader / Footer、青緑accent、本文可読性を維持する。
- `site-layout` のHeader、Footer、SiteMenu、MobileMenuを再設計しない。
- `page-toc` の404非表示方針に従い、PageToc、MobilePageToc、空のTOC枠を表示しない。
- ユーザー提供の `public/images/404.webp` を加工せず、GitHub Pagesのbase pathを考慮して表示する。

## Out Of Scope

- 404専用の検索UI、サイトメニュー、パンくず、前後ナビゲーション
- PageToc、MobilePageToc、空の目次表示
- 404画像の加工、差し替え、再生成
- Header、Footer、SiteMenu、MobileMenu、検索機能の再設計
- SSR、CMS、DB、認証、API、分析、キャラクターシート、ダイスローラー
- 高度なアニメーション、過剰なneon glow、hero背景の追加

## Comparison Points For Implementation

- desktop・mobileともに、可視順が404画像、案内文、トップリンクである。
- H1と画像altがともに `404 Not Found` であり、H1は視覚的に隠れている。
- desktopで左SiteMenuは維持し、右PageTocまたは空の右レールを表示しない。
- mobileでMobilePageToc triggerを表示しない。
- 既存のHeader、Footer、リンク表現と同じサイトに見える。
- 画像、CSS、トップリンクがGitHub Pagesのサブパス配下で壊れない。
- standard viewportで横overflowが出ない。
- reviewが必要な差分: 追加のナビゲーション、検索UI、パンくず、PageToc、画像の加工、強い装飾の追加。

## Generation Source

- current VRT: `tests/visual/vrt/404.spec.ts` の`@vrt @404`で、desktop / tablet / mobileを比較する。
- source branch: `40-2-404-page`
- source commit: `c415aaa908cf964a4177c6cde6177968da235c63`。404実装、Visual Test、検索除外を含む固定済みcommitからcanonicalizeする。
- route: `/not-found/`
- viewport: desktop `1440x1200`、mobile `390x900`
- capture notes: ユーザーが2026-07-23に、Visual Review済みの404 actualをdesign正本化することを明示承認した。Visual Reviewの不備を隠すためではなく、ユーザー指定の簡潔な404画面を後続比較の基準にするためにcanonicalizeする。PR #63のレビュー指摘を受け、実装を含む固定済みcommitから再生成する。

## Open Questions

- なし。
