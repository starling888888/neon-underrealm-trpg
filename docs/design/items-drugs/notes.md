# items-drugs

## VRT baseline

- test: `tests/visual/vrt/items-drugs.spec.ts` の `@vrt @items-drugs @<state> @<viewport>`
- route: `/data/items/drugs/`
- state: default
- snapshots:
  - desktop `1440x1200`: `items-drugs-default-desktop.png`
  - tablet `820x1180`: `items-drugs-default-tablet.png`
  - mobile `390x900`: `items-drugs-default-mobile.png`
- baseline update: 通常実行では比較のみ行う。差分を確認したうえでユーザーが明示指示した場合だけ `npm run visual:update` を実行する。

## Mode

- design fix

## Target

- page / component: ドラッグ一覧ページ
- route: `/data/items/drugs/`
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

- Hero、導入、warning、凡例、ドラッグ一覧を既存本文レイアウトで表示する。
- desktopはカード1カラム＋説明2カラム、mobileは凡例と一覧を2カラムで維持する。
- 注意事項と本文、カードを低彩度なCalloutとボーダーで区別する。

## Existing design constraints

- `DrugCard`、`LegendContainer`、Callout、既存レイアウト契約を維持する。
- Header、SiteMenu、PageToc、Heroを再設計しない。

## Out of scope

- 検索、絞り込み、ソート、比較、詳細ページ、パンくず、前後ナビゲーション。

## Comparison points for implementation

- Hero、導入、warning、凡例、カード一覧の順序と余白が保たれる。
- desktop／mobileとも横overflowやカードの重なりを生まない。

## Generation source

## Open questions

- なし。
