# search-modal

## Mode

- initial draft

## Target

- page / component: `SearchButton.astro`、`SearchModal.astro`、`Header.astro` と `AppContainer.astro` の検索UI接続
- route: 共通Layout。design draftの代表routeは、desktop / mobileともに `/mdx-test/` とする。
- viewport:
  - desktop: `1440x1200`
  - mobile: `390x900`
- states:
  - desktop Headerの検索入力欄と、その直下に展開した結果panel
  - mobile Header右側の検索アイコンから開いた検索panel
  - どちらも検索結果が未接続である空の結果枠を示す

## Referenced SSoT

- `AGENTS.md`
- `.agents/skills/design-image-generation/SKILL.md`
- historical issue: `docs/issue/done/phase-4/44-search-modal-ui.md`
- `docs/requirements/search.md`
- `docs/requirements/layout-navigation.md`
- `docs/requirements/architecture.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- `docs/design/global-styles/notes.md`
- `docs/design/header-footer/notes.md`
- `docs/design/site-layout/notes.md`
- `docs/design/mobile-menu/notes.md`
- `docs/design/mobile-page-toc/notes.md`

## Design direction

- visual direction: 白寄りの本文面、暗めニュートラルグレーHeader、控えめな青緑accentを維持する。検索UIを独立したアプリ画面や強いneon演出にせず、既存ルールサイトの実務的な密度で扱う。
- layout direction: desktopではHeader右側の検索入力欄を使い、その直下に検索結果panelを展開する。検索表示中はHeaderを除く本文と左右レールを薄いscrimで抑え、入力欄と結果panelを明るく保つ。mobileではHeaderの下からviewport下端までを使う検索panelとし、Headerのロゴと左右の操作領域を覆わない。mobileのsearch panelはsite menuの左drawerやH1付近のpage TOC panelに見えない配置にする。
- search contents: desktopの検索入力欄とmobile panelには検索語入力欄と検索結果領域を置く。mobile panel内には閉じるbuttonを重複して置かず、Header右側の検索アイコンを表示中の `×` 操作に切り替える。task 44では実検索を接続しないため、結果領域には検索結果の代わりに「検索機能は準備中です」のように未接続状態を誤認させない短い案内を置く。
- typography direction: 見出しと入力欄の用途が区別できるsystem fontと既存の文字サイズ階層を使う。入力欄のplaceholderや未接続案内を装飾的な英語ラベルだけにしない。
- color / accent usage: 入力欄、Header右側の `×`、検索起点のfocus / hoverを既存のborder、focus ring、青緑accentで示す。検索panel全体をmagentaや発光で強調しない。scrimは背景が操作対象ではないと分かる濃度に抑える。

## Existing design constraints

- `global-styles` の白寄り背景、暗めHeader、控えめな青緑accent、実務的な余白と角丸を維持する。
- `header-footer` のdesktop Header高さ `88px`、mobile Header高さ `64px`、desktopの検索入力欄風の起点、mobileの右側検索アイコンの位置を維持する。
- desktopの検索起点は既存の入力欄mockと同じHeader右側の領域を使い、実装では検索語を入力できる実入力欄とする。検索結果panelはこの入力欄の直下に揃える。
- mobileではfull logoを維持し、右側検索アイコンと左側menu buttonを同じ大きさの操作領域として扱う。検索表示中の右側操作は `×` に切り替え、検索panelを閉じる。
- `site-layout`、`mobile-menu`、`mobile-page-toc` の役割差を維持する。検索panelはsite menuの階層リンクやpage TOCの見出しリンクを含まず、mobileではこれらのoverlayと同時に開かない。
- 検索を開く前にmenuまたはpage TOCが開いている場合はそれらを閉じる。検索表示中にmenuまたはpage TOCを開く場合は検索を閉じる。
- mobile検索表示中は背景本文をスクロールさせず、Headerを表示状態に維持する。

## Out of scope

- Pagefindの検索実行、検索index生成、検索結果クリックによる遷移
- 検索対象の除外、ページタイトル、見出し、抜粋、種別ラベルなどの検索結果metadata
- 検索専用ページ、検索履歴、保存検索、候補表示、絞り込み、ソート、ページネーション
- 外部検索サービス、APIキー、認証、DB、SSR、APIサーバー
- SiteMenu、MobileSiteMenuDrawer、PageToc、MobilePageToc、Footerの再設計
- パンくずリスト、前後ナビゲーション、現在位置ハイライト、analytics UI
- 追加のicon package、UI framework、大きなUIライブラリ、過剰なanimation

## Comparison points for implementation

- desktopでHeader右側の検索入力欄、その直下の結果panel、薄いscrim、未接続の結果枠が既存layoutと視覚的に整合する。scrimはHeaderを覆わず、入力欄と結果panelの可読性を下げない。
- mobileでHeaderのロゴと左右buttonを残したまま、Header下から検索panelが表示される。右側buttonは `×` に切り替わり、panelはmobile menu drawerやmobile page TOC panelと見分けられる。
- desktop / mobileともに入力欄、結果領域、未接続案内の順序が視覚的にもキーボード操作順としても自然である。
- focus ring、hover、disabledではない検索起点が、既存Header buttonの見た目と矛盾しない。
- mobileで背景本文が操作可能に見えず、検索、site menu、page TOCのoverlayが同時表示されない。
- 許容できる差分: desktop結果panelの幅、mobile panelの余白、scrim濃度、検索iconと閉じるiconの細部、未接続案内の短い文言。
- レビューが必要な差分: desktopの結果panelを検索入力欄と無関係な位置へ置くこと、Headerを覆い隠すmobile panel、検索panelを左drawerやH1付近のTOC panelに見せる構成、実検索結果に見える固定コンテンツ、過剰なneon演出、新しい検索機能やfilter UIの追加。

## Generation source

- prototype or generator source: `.tmp/design/search-modal/prototype.html` と `.tmp/design/search-modal/capture.mjs` を使い、Playwright Chromiumでstandalone prototypeをcaptureした。実アプリのrouteや実装スクリーンショットは使っていない。
- source branch / commit when applicable: `44-search-modal-ui` / `513ed9c`
- route when applicable: prototype内で既存の `/mdx-test/` 相当のHeader、本文、左右レール、mobile page TOCの文脈を再現する。実アプリのrouteはcapture元にしない。
- viewport: desktop `1440x1200`、mobile `390x900`
- output images:
  - `docs/design/search-modal/design-desktop.png`
  - `docs/design/search-modal/design-mobile.png`
- prototype path / prompt summary / capture notes: desktop / mobileとも検索表示状態をcaptureした。desktopはHeader右側の検索入力欄の直下へ結果panelを置き、Header下の背景に薄いグレーscrimを重ねた。mobileはHeaderを表示したままその下を全高panelにし、右側検索アイコンを `×` へ切り替えた。両方で検索語入力欄、未接続の結果枠、Escの案内を表示し、mobileでsite menu / page TOCと見分けられることを確認した。

## Open questions

- なし。画像作成時に、未接続案内の最終文言だけをdesignの可読性に合わせて短く調整してよい。
