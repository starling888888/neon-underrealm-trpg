# items-nanomachines

## Mode

- design fix

## Target

- page / component: ナノマシン一覧ページ
- route: `/data/items/nanomachines/`
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

- Hero、導入、warning、身体強化、凡例、通常品と武器化の一覧を本文の階層として表示する。
- desktopはカード1カラム＋説明2カラム、mobileは凡例と一覧を2カラムで維持する。
- 長い一覧でも見出しとPageTocで通常品・武器化を区別できるようにする。

## Existing design constraints

- `NanomachineCard`、`LegendContainer`、Callout、既存レイアウト契約を維持する。
- Header、SiteMenu、PageToc、Heroを再設計しない。

## Out of scope

- 検索、絞り込み、ソート、比較、詳細ページ、パンくず、前後ナビゲーション。

## Comparison points for implementation

- 導入、warning、身体強化、凡例、2種の一覧の階層を保つ。
- desktop／mobileとも横overflowやカードの重なりを生まない。

## Generation source

<!-- visual-canonicalization:start -->

- command: `npm run visual:canonicalize -- items-nanomachines --route /data/items/nanomachines/`
- source branch: `34-2-items-pages`
- source commit: `6b6ea46b4d099e2d843bfae8c3454089edc14852`
- route: `/data/items/nanomachines/`
- state: `default`
- viewport: desktop 1440x1200, mobile 390x900
- capture manifest: `test-results/visual/capture-manifest.json`

<!-- visual-canonicalization:end -->

## Open questions

- なし。
