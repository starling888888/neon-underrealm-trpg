# items-armors

## Mode

- design fix

## Target

- page / component: 防具一覧ページ
- route: `/data/items/armors/`
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

- Hero、導入、凡例、防具カード一覧を既存本文レイアウトで表示する。
- desktopはカード1カラム＋説明2カラム、mobileは凡例と一覧を2カラムで維持する。
- 白寄り背景、低彩度ボーダー、青緑リンクの既存方針を守る。

## Existing design constraints

- `ArmorCard`の既存表示契約と、凡例右カラムの項目説明を維持する。
- Header、SiteMenu、PageToc、Heroを再設計しない。

## Out of scope

- 検索、絞り込み、ソート、比較、詳細ページ、パンくず、前後ナビゲーション。

## Comparison points for implementation

- Hero、導入、凡例、カード一覧の構成と余白が保たれる。
- desktop／mobileとも横overflowやカードの重なりを生まない。

## Generation source

<!-- visual-canonicalization:start -->

- command: `npm run visual:canonicalize -- items-armors --route /data/items/armors/`
- source branch: `34-2-items-pages`
- source commit: `6b6ea46b4d099e2d843bfae8c3454089edc14852`
- route: `/data/items/armors/`
- state: `default`
- viewport: desktop 1440x1200, mobile 390x900
- capture manifest: `test-results/visual/capture-manifest.json`

<!-- visual-canonicalization:end -->

## Open questions

- なし。
