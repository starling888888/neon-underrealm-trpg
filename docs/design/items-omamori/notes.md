# items-omamori

## Mode

- design fix

## Target

- page / component: お守り一覧ページ
- route: `/data/items/omamori/`
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

- Hero、取得条件のwarning、凡例、お守りカード一覧を一貫した本文構造で表示する。
- desktopはカード1カラム＋説明2カラム、mobileは凡例と一覧を2カラムで維持する。
- warningは通常本文と視覚的に区別し、過剰な装飾を加えない。

## Existing design constraints

- `OmamoriCard`、`LegendContainer`、既存Calloutとレイアウト契約を維持する。
- Header、SiteMenu、PageToc、Heroを再設計しない。

## Out of scope

- 検索、絞り込み、ソート、比較、詳細ページ、パンくず、前後ナビゲーション。

## Comparison points for implementation

- Hero、warning、凡例、カード一覧の順序と余白が保たれる。
- desktop／mobileとも横overflowやカードの重なりを生まない。

## Generation source

<!-- visual-canonicalization:start -->

- command: `npm run visual:canonicalize -- items-omamori --route /data/items/omamori/`
- source branch: `34-2-items-pages`
- source commit: `6b6ea46b4d099e2d843bfae8c3454089edc14852`
- route: `/data/items/omamori/`
- state: `default`
- viewport: desktop 1440x1200, mobile 390x900
- capture manifest: `test-results/visual/capture-manifest.json`

<!-- visual-canonicalization:end -->

## Open questions

- なし。
