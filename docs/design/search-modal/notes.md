# search-modal

## Mode

- design fix

## Target

- page / component: `SearchModal.astro`、`SearchButton.astro`、`Header.astro` と `AppContainer.astro` の検索UI接続
- route: `/data/common-skills/`
- viewport:
  - desktop: `1440x1200`
  - mobile: `390x900`
- states:
  - desktop / mobileの検索モーダル初期状態
  - desktop / mobileのデータカード検索結果表示状態

## Referenced SSoT

- `AGENTS.md`
- `.agents/skills/design-image-generation/SKILL.md`
- historical issue: `docs/issue/done/phase-4/45-search-pagefind-integration.md`
- `docs/requirements/search.md`
- `docs/requirements/layout-navigation.md`
- `docs/requirements/architecture.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- `docs/design/global-styles/notes.md`
- `docs/design/header-footer/notes.md`
- `docs/design/site-layout/notes.md`

## Design direction

- visual direction: 白寄りの本文面、暗めニュートラルグレーHeader、控えめな青緑accentを維持する。検索語の一致箇所は操作accentと区別できる黄色で示す。
- layout direction: desktopではHeader右側の検索入力欄から、その直下に展開する結果panelを使う。結果表示時はpanel全体をscroll領域とし、二重のグレー枠を作らない。mobileではHeader下からviewport下端までを使う検索panelとする。
- typography direction: ページタイトル、該当セクション、抜粋、種別ラベルを用途ごとに区別し、同じページタイトルを重複表示しない。
- color / accent usage: 検索起点のfocus / hoverには既存の青緑accentを使い、結果抜粋と遷移先本文の検索語には `#ffe36e` の黄色を使う。scrimは背景が操作対象ではないと分かる濃度に抑える。

## Existing design constraints

- `global-styles` の白寄り背景、暗めHeader、控えめな青緑accent、実務的な余白と角丸を維持する。
- `header-footer` のdesktop Header高さ `88px`、mobile Header高さ `64px`、desktopの検索入力欄、mobileの右側検索アイコンの位置を維持する。
- desktopの検索結果panelは検索入力欄の直下に揃え、Headerを覆わない。検索表示中はHeader下の背景本文と左右レールをscrimで抑える。
- mobile検索panelはHeaderのロゴと左右の操作領域を覆わず、site menu・page TOCと同時に開かない。
- desktopでは検索表示中の背景本文をscrollさせず、結果の長さはpanel内のscrollで扱う。Escまたはscrimで閉じたdesktop入力はfocusを外す。

## Out of scope

- 検索専用ページ、検索履歴、保存検索、候補表示、絞り込み、ソート、ページネーション
- 外部検索サービス、APIキー、認証、DB、SSR、APIサーバー
- SiteMenu、MobileSiteMenuDrawer、PageToc、MobilePageToc、Footerの再設計
- パンくずリスト、前後ナビゲーション、現在位置ハイライト、analytics UI
- ブラウザ標準Text Fragmentによる検索遷移先ハイライト

## Comparison points for implementation

- desktop初期状態ではHeader右側の検索入力欄、直下の案内枠、薄いscrimを示す。検索結果状態ではpanelの高さをviewport上半分程度に収め、結果カードとscrollbarをpanel内に置く。
- mobile初期状態ではHeader下の全高panel、検索入力と送信button、案内枠を示す。検索結果状態では同じpanel内に結果カードを並べる。
- desktop / mobileともに結果カードは種別ラベル、ページタイトル、該当セクション、抜粋を表示し、検索語を黄色で明確に示す。
- 違いがレビュー対象: Headerを覆い隠すmobile panel、desktopで背景本文がscrollする状態、desktop結果時の二重枠・内側scrollbar、検索結果のページタイトル重複、黄色以外で見分けにくい検索語highlight。

## Generation source

- implementation source: reviewed task 45 implementation on `45-search-pagefind-integration`.
- output images:
  - `docs/design/search-modal/design-desktop.png`
  - `docs/design/search-modal/design-mobile.png`
  - `docs/design/search-modal/design-desktop-results.png`
  - `docs/design/search-modal/design-mobile-results.png`

<!-- visual-canonicalization:start -->

- command: `npm run visual:canonicalize -- search-modal --route /data/common-skills/ --state results`
- source branch: `45-search-pagefind-integration`
- source commit: `e6867f8662471b6741e0232b49679e2b431592c3`
- route: `/data/common-skills/`
- state: `results`
- also canonicalized: default state from the same capture manifest
- viewport: desktop 1440x1200, mobile 390x900
- capture manifest: `test-results/visual/capture-manifest.json`

<!-- visual-canonicalization:end -->

## Open questions

- なし。
