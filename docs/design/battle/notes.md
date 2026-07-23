# battle

## VRT baseline

- test: `tests/visual/vrt/battle.spec.ts` の `@vrt @battle @<state> @<viewport>`
- route: `/rules/battle/`
- state: default
- snapshots:
  - desktop `1440x1200`: `battle-default-desktop.png`
  - tablet `820x1180`: `battle-default-tablet.png`
  - mobile `390x900`: `battle-default-mobile.png`
- baseline update: 通常実行では比較のみ行う。差分を確認したうえでユーザーが明示指示した場合だけ `npm run visual:update` を実行する。

## Mode

- design fix

## Target

- page / component: `/rules/battle` のPL向け戦闘ルール本文。`MDXLayout`、`ImageBlock`、Callout、PageToc、MobilePageTocを含む。
- route: `/rules/battle/`
- viewport:
  - desktop: `1440x1200`、full-page capture
  - mobile: `390x900`、full-page capture
- states:
  - Hero、攻撃・リアクション表、コンボ例、特別ルールを含む通常表示

## Referenced SSoT

- `AGENTS.md`
- `docs/issue/done/phase-3/25-2-battle-page.md`（historical source issue）
- `docs/requirements.md`
- `docs/requirements/pages.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- `docs/design/global-styles/notes.md`
- `docs/design/site-layout/notes.md`
- `docs/design/rules/notes.md`
- `docs/design/page-toc/notes.md`
- `docs/design/mobile-page-toc/notes.md`
- `docs/design/callout/notes.md`

## Design Direction

- visual direction: 白寄りのルール本文面に、近接戦闘のHeroをH1直後へ置く。長い戦闘ルールを参照する本文ページとして、画像やCalloutが本文を支配しない密度にする。
- layout direction: desktopは左SiteMenu、中央本文、右PageTocの既存3カラムを維持する。mobileではH1横のMobilePageTocと本文幅内のHero・表を維持する。
- typography direction: 攻撃、リアクション、手番、攻撃基準値、コンボ、掛け合い、特別ルールをH2/H3で追えるようにする。計算例は`example` Calloutで本文と区別する。
- color / accent usage: 既存の白寄り背景、濃いグレーの見出し罫線、青緑のリンク、青灰色の`example` Calloutを維持する。Heroの火花や暖色を本文UIへ広げない。

## Existing Design Constraints

- Header、Footer、SiteMenu、PageToc、MobilePageTocを再設計しない。
- Heroは中央本文幅内に置き、captionや追加overlayを加えない。
- Callout titleは通常の見出しにせず、PageTocへ混入させない。
- desktop・mobileともページ全体の横overflowを起こさない。

## Out Of Scope

- ダイスローラー、ダメージ計算機、戦闘シミュレーター、コンボビルダー、行動順・状態管理、キャラクターシート。
- GM向け裁定、エネミー運用、マップ作成、シナリオ本文、オンラインツール運用。
- Header、Footer、SiteMenu、PageToc、MobilePageTocの再設計、検索、パンくず、前後ナビゲーション。
- Heroの再生成・差し替え・追加overlay、画像最適化パイプライン。

## Comparison Points For Implementation

- H1直後のHero、本文カラム、desktop PageToc、mobile MobilePageTocが既存ルール本文ページと同じ構造で成立する。
- 3列表とCalloutが本文内で読み分けられ、mobileでもページ全体が横に溢れない。
- Heroの色彩が本文UIの色や装飾へ波及しない。
- 許容差分: 戦闘用Hero、本文量、表・Calloutの縦方向の長さ。
- 要レビュー差分: 本文幅を超えるHero・表、captionや追加overlay、共通layoutの変更、画像が原因の可読性低下。

## Generation Source

- prototype or generator source: ユーザーが明示承認した現行実装をdesign fixとして正本化した。
- source branch / commit: `25-2-battle-page` / `594448a5b3a0fd8bc3b228505f325b49e00ce544`
- route: `/rules/battle/`
- viewport:
  - `design-desktop.png`: `1440x1200`、full-page
  - `design-mobile.png`: `390x900`、full-page
- capture source: `tests/visual/battle.spec.ts` のPlaywright capture。`test-results/visual/battle-desktop.png` と `battle-mobile.png` を、Visual Reviewの差分を隠すためではなく、レビュー済み実装を後続比較の正本として採用した。

## Open Questions

- なし。
