# items-weapons

+## VRT baseline

- test: `tests/visual/vrt.spec.ts` の `VRT items-weapons default <viewport>`
- route: `/data/items/weapons/`
- state: default
- snapshots:
  - desktop `1440x1200`: `items-weapons-default-desktop.png`
  - tablet `820x1180`: `items-weapons-default-tablet.png`
  - mobile `390x900`: `items-weapons-default-mobile.png`
- baseline update: 通常実行では比較のみ行う。差分を確認したうえでユーザーが明示指示した場合だけ `npm run visual:update` を実行する。

## Mode

- design fix

## Target

- page / component: 武器一覧ページ
- route: `/data/items/weapons/`
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

- Hero、導入、凡例、武器種別ごとのカード一覧を、白寄り本文面に収める。
- desktopは左右ナビゲーションを含む3レール、mobileは本文と2列カード一覧を維持する。
- 青緑はリンクと現在地表示に限定し、カードとCalloutは既存の低彩度な表現を維持する。

## Existing design constraints

- `LegendContainer`はdesktopでカード1カラム＋説明2カラム、mobileで2カラムとする。
- `WeaponCard`の既存表示契約、Hero、SiteMenu、PageTocを変更しない。

## Out of scope

- 検索、絞り込み、ソート、比較、詳細ページ、パンくず、前後ナビゲーション。

## Comparison points for implementation

- Hero、導入、凡例、種別見出し、カード一覧の順序と余白が保たれる。
- desktop／mobileとも横overflowやカードの重なりを生まない。

## Generation source

## Open questions

- なし。
