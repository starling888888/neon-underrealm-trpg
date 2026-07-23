# support

## VRT baseline

- test: `tests/visual/vrt/support.spec.ts` の `@vrt @support @<state> @<viewport>`
- route: `/support/`
- state: default
- snapshots:
  - desktop `1440x1200`: `support-default-desktop.png`
  - tablet `820x1180`: `support-default-tablet.png`
  - mobile `390x900`: `support-default-mobile.png`
- baseline update: 通常実行では比較のみ行う。差分を確認したうえでユーザーが明示指示した場合だけ `npm run visual:update` を実行する。

## Mode

- design fix

## Target

- page / component: オンラインセッションの準備と問い合わせを案内するサポートページ
- route: `/support/`
- viewport:
  - desktop: `1440x1200` viewport, full-page capture
  - mobile: `390x900` viewport, full-page capture
- states:
  - desktop standard layout with SiteMenu and PageToc
  - mobile standard layout with MobilePageToc

## Referenced SSoT

- `AGENTS.md`
- `docs/requirements/pages.md`
- `docs/requirements/layout-navigation.md`
- `docs/requirements/assets-seo.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- `.raw/contents/support.md`
- `docs/design/global-styles/notes.md`
- `docs/design/site-layout/notes.md`
- `docs/design/page-toc/notes.md`
- `docs/design/mobile-page-toc/notes.md`
- `docs/design/callout/notes.md`
- `docs/design/page-navigation-links/notes.md`

## Historical Source Issue

- `docs/issue/done/phase-3/41-2-support-page.md`

## Design Direction

- visual direction: 白寄りの本文面、暗めのHeader / Footer、青緑のリンクと現在地表示を維持する。オンラインツールの説明は、派手なヒーローや専用UIではなく、既存の本文ページとして読む。
- layout direction: desktopでは左SiteMenu、中央本文、右PageTocの3カラムを使う。mobileではSiteMenuをドロワーに切り替え、H1横のMobilePageTocから見出しへ移動できる。
- typography direction: 見出し、箇条書き、コード例、Calloutの読み順を保つ。コマンド例は既存の等幅コードブロックで表示し、長い1行はコードブロック内で横スクロールできる。
- color / accent usage: 青緑は内部・外部リンクと現在地表示に限定し、判定例は既存の淡い青灰色`example` Calloutで本文と区別する。

## Existing Design Constraints

- `global-styles` の白寄り背景、暗めグレーHeader、青緑accent、実務的な情報密度を維持する。
- `site-layout` の本文幅、desktopの左右レール、mobileのHeaderとMobilePageTocを維持する。
- `page-toc` と `mobile-page-toc` は現在ページ内の移動に限定し、SiteMenuや検索UIと混同させない。
- `callout` はタイトルを既定で見出し化せず、PageTocへ混入させない。
- SiteMenuの「サポート」は「キャラクター成長」の下かつ「更新履歴」の上に置く。

## Out of Scope

- Webダイスローラー、達成値・効果値・気合の自動計算、戦闘支援、マップ操作、キャラクター登録フォーム
- 特定オンラインセッションツールの必須化、外部サービスAPI連携、保存、ログイン、投稿、CMS
- hero画像、仮画像、ページ固有の追加UI、SiteMenuの再設計
- ページ下部の前後ナビゲーション、パンくず、検索UI、DB、認証、SSR、API

## Comparison Points for Implementation

- desktopでSiteMenu、本文、PageTocが本文幅を不自然に圧迫せずに並ぶ。
- mobileで本文、Callout、Footer、MobilePageTocにページ全体の横overflowがない。
- 箇条書きと2つの`example` Calloutが、オンラインセッション準備の順序を妨げずに区別できる。
- マップとお問い合わせの外部導線が、既存のリンク色と余白に沿って本文内に収まる。
- `/support` に前後ナビゲーションやダイスローラーなどの初期スコープ外機能を描かない。

## Generation Source

実装済み `/support/` のPlaywright Visual Reviewを、ユーザー承認済みのdesign fixとして正本化する。

## Open Questions

- なし。
