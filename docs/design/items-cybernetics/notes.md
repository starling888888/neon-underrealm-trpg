# items-cybernetics

+## VRT baseline

- test: `tests/visual/vrt.spec.ts` の `VRT items-cybernetics default <viewport>`
- route: `/data/items/cybernetics/`
- state: default
- snapshots:
  - desktop `1440x1200`: `items-cybernetics-default-desktop.png`
  - tablet `820x1180`: `items-cybernetics-default-tablet.png`
  - mobile `390x900`: `items-cybernetics-default-mobile.png`
- baseline update: 通常実行では比較のみ行う。差分を確認したうえでユーザーが明示指示した場合だけ `npm run visual:update` を実行する。

## Mode

- design fix

## Target

- page / component: サイバネ一覧ページ
- route: `/data/items/cybernetics/`
- viewport: desktop `1440x1200`、mobile `390x900`
- states: standard

## Referenced SSoT

- `docs/issue/34-2-items-pages.md`
- `docs/requirements.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- `docs/design/global-styles/notes.md`
- `docs/design/site-layout/notes.md`
- `docs/design/items/notes.md`

## Design direction

- Hero、導入、warning、破壊ルール、凡例、部位別一覧を本文の階層として表示する。
- desktopはカード1カラム＋説明2カラム、mobileは凡例と一覧を2カラムで維持する。
- 長い一覧でも部位見出しとPageTocで区分を追える構成を保つ。

## Existing design constraints

- `CyberneticCard`、`LegendContainer`、Callout、既存レイアウト契約を維持する。
- Header、SiteMenu、PageToc、Heroを再設計しない。

## Out of scope

- 検索、絞り込み、ソート、比較、詳細ページ、パンくず、前後ナビゲーション。

## Comparison points for implementation

- 導入、warning、破壊ルール、凡例、部位別一覧の階層を保つ。
- desktop／mobileとも横overflowやカードの重なりを生まない。

## Generation source

## Open questions

- なし。
