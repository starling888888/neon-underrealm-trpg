# mobile-menu

## Mode

- initial draft

## Target

- page / component: `Header.astro` の左メニューボタンから開閉するスマホ版サイトメニューdrawer。既存 `SiteMenu.astro` / `SiteMenuItem.astro` / `siteMenuItems` を共用する前提。
- route: 共通Layout内の全ページ。最初の確認対象は `/`
- viewport: mobile `390x900`
- states: closed state / open state。closed stateは通常のmobile Headerと本文表示、open stateはHeader左ボタンから開いたサイトメニューdrawerを示す。

## Referenced SSoT

- `AGENTS.md`
- `.agents/skills/design-image-generation/SKILL.md`
- `docs/requirements.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- `docs/issue/12-mobile-menu.md`
- `docs/issue/11-site-menu.md`
- `docs/issue/12-1-site-menu-layout-copy.md`
- `docs/design/global-styles/notes.md`
- `docs/design/base-layout/notes.md`
- `docs/design/header-footer/notes.md`
- `docs/design/header-footer/design-mobile.png`
- `docs/design/site-menu/notes.md`
- `docs/design/site-menu/design-desktop.png`

## Design direction

- visual direction: 既存mobile Headerの暗めニュートラルグレー、白文字ロゴ、左右アイコン枠を維持し、左メニューdrawerだけを追加する。drawerはルール参照中に素早く階層を辿るための実務的なナビゲーションとして扱い、派手なneon glowや演出的overlayにしない。
- layout direction: closed stateではmobile Header左にmenu button、中央にロゴ、右に検索アイコン枠、下に本文1カラムを表示する。open stateでは画面左からdrawerが現れ、背後本文は暗く抑えるか操作対象外に見える状態にする。drawer上部には閉じる操作と短い状態表示 `メニュー` を置く。drawer内のSiteMenu本体には `SITE MENU` / `サイトメニュー` 相当の可視見出しを置かず、メニュー項目から開始する。drawer内は縦スクロール可能で、閉じる操作があることを明確にする。
- typography direction: PC版SiteMenuと同じsystem font方針を維持する。drawerヘッダーの可視テキストは `メニュー` とし、drawer内の親リンク、子リンク、3階層目リンクはサイズ差とweight差を控えめに使う。階層はリンク本文の左インデントで読ませ、disclosure indicatorは階層レベルに関係なく同じ右端ラインに揃える。画像内の長い日本語文言には依存せず、短い代表ラベルで構造を示す。
- color / accent usage: Header / Footerの暗めグレー、本文面の白寄り背景、青緑accentを維持する。drawer本体は白寄りまたは薄いグレーの面にし、focus / hover / activeに見える強調は控えめなaccent、outline、背景差で表現する。現在ページハイライトに見える強い左線や選択色は使わない。

## Existing design constraints

- `docs/design/global-styles/` の白寄り背景、暗めグレーHeader、控えめな青緑accent、実務的な密度を維持する。
- `docs/design/header-footer/` のmobile Header方針を維持する。左アイコン枠はmenu drawerの開閉ボタンとして扱い、右検索アイコン枠は検索dialog未実装のままに見せる。
- `docs/design/site-menu/` のmenu data再利用方針を維持する。親カテゴリはグループ見出しではなくリンクとして見える必要がある。
- `12-1-site-menu-layout-copy` では、drawerヘッダーの可視テキストを `メニュー` にする。drawer内のSiteMenu本体には `SITE MENU` / `サイトメニュー` 相当の可視見出しを置かない。
- `12-1-site-menu-layout-copy` では、子項目開閉トグルを項目左側ではなく右端へ移動する。親階層と子階層でトグル位置を段階的にずらさず、すべて同じ右端ラインに揃える。階層差はリンク本文の左インデントだけで表現する。子項目を持たない項目の左側には、トグル用の不要なspacerを置かない。
- `SiteMenu.astro` / `SiteMenuItem.astro` / `siteMenuItems` をPC / mobileで共用する前提を崩さない。スマホ専用の別メニュー定義が必要に見えるデザインにしない。
- `MobileMenu.astro` の新規作成を前提にしない。drawerの外側wrapperや表示モード追加で成立する見た目にする。
- 3階層表示は読めるが、スマホ幅では過密になりやすいため、drawer幅、インデント、タップ領域、縦スクロール余地を優先する。
- drawer表示中は背景本文が操作対象ではないことが分かる。背景本文を完全に読ませる必要はないが、検索dialogやページ内目次に見える別パネルは描かない。
- closed state / open state の2枚で、開閉前後の変化、drawerの位置、背景抑止、閉じる操作、階層メニューの見え方を確認できるようにする。

## Out of scope

- 検索dialog本体、検索結果表示、Pagefind導入
- Header右側検索ボタンの有効化状態
- ページ内目次、スマホ用ページ内目次、ページ内目次の現在位置ハイライト
- 現在ページハイライト、`aria-current="page"` の完成表現
- 親カテゴリの現在ページに応じた自動展開状態
- パンくずリスト
- ページ末尾の前後ナビゲーション
- 新規ページ骨組みや未作成ページ本文
- 生成JSONやデータ取得層から流儀・生き様の子項目を追加した状態
- キャラクターシート、ダイスローラー、戦闘シミュレーター等のツール導線
- DB、認証、SSR、CMS、APIサーバー、外部検索サービス
- 外部UIライブラリ追加を前提にした見た目
- 高度なアニメーション、過剰な発光表現、装飾的なneon overlay

## Comparison points for implementation

- closed stateで、mobile Headerの左menu button、中央ロゴ、右検索アイコン枠が既存 `header-footer` designと矛盾しない。
- open stateで、Header左ボタンからサイトメニューdrawerが開いた状態だと分かる。
- drawer内に明示的な閉じる操作があり、開閉buttonの状態差を実装時に `aria-expanded` と同期できる構造になっている。
- drawerヘッダーの可視テキストは `メニュー` で、drawer内のSiteMenu本体に `SITE MENU` / `サイトメニュー` の重複見出しがない。
- drawer表示中、背景本文がスクロール・操作対象ではないことが視覚的に分かる。
- drawer本体は縦スクロール可能に見え、長いメニューでも画面外にはみ出したままにならない。
- drawer内のサイトメニューが `nav` landmarkとして成立し、適切な `aria-label` を付けられる構造になっている。
- 既存SiteMenuの親リンク、子リンク、3階層目リンク、同一右端ラインのdisclosure indicatorがスマホ幅でも読める。
- 子項目を持たない項目の左側に、トグル用の空白が残っていない。
- メニュー項目選択後にdrawerを閉じる挙動を想定できるが、画像内でページ遷移や現在地ハイライトを描かない。
- focus trap、Esc close、close後のfocus復帰は実装時の挙動として扱い、画像では閉じるボタンや最初の操作可能要素にfocus ringを置ける余地を示す。
- PC左サイトメニューの再設計に見えない。PC用右レール、PageToc、検索結果UIを描かない。
- 差分として許容できるもの: drawer幅、overlay濃度、閉じるボタン位置、短い代表ラベル、階層項目数、右端トグルの共通ラインを保った範囲での微調整、インデント量の微調整。
- レビューが必要な差分: drawerヘッダーの `メニュー` を別文言に変える、drawer内に `SITE MENU` / `サイトメニュー` の可視見出しを戻す、スマホ専用の別メニュー定義に見える構造、検索dialogに見える右側panel、現在ページハイライトに見える強調、背景本文を操作可能に見せる表現、tap targetが小さすぎる配置。

## Generation source

- generator or capture source: SVGモックをImageMagick `convert` でPNGへ変換した。元SVGは `.tmp/mobile-menu-design-closed.svg` と `.tmp/mobile-menu-design-open.svg` に置く。
- source branch / commit when applicable: initial version `12-mobile-menu`; updated for `12-1-site-menu-layout-copy`
- route when applicable: `/`
- viewport: mobile `390x900`
- output images: `design-mobile-closed.png`, `design-mobile-open.png`
- prompt summary or capture notes: closed stateでは既存mobile Headerと本文1カラムを表示した。open stateでは左menu buttonから開いたサイトメニューdrawer、閉じる操作、既存SiteMenuを再利用した階層リンク、背景本文の操作抑止、drawer内スクロール可能性を示した。`12-1-site-menu-layout-copy` 向けに、drawerヘッダーの可視テキストを `メニュー` にし、drawer内SiteMenu本体から `SITE MENU` / `サイトメニュー` 相当の可視見出しを削除し、disclosure indicatorを階層レベルに関係なく同じ右端ラインへ移動した。検索dialog、ページ内目次、現在ページハイライト、パンくず、前後ナビゲーション、データ駆動の流儀・生き様子項目は描いていない。`design-mobile-open.png` はSVGをPNG化した後、ImageMagick annotateで日本語ラベル `メニュー` を合成した。

## Open questions

- drawer幅は、`390px` viewportで階層リンクと閉じる操作が読める範囲を見て判断する。
- open stateの背景抑止は、暗いscrimにするか、本文面を淡く固定するかを画像確認後に決める。
- drawer上部の閉じる操作は、Header左ボタンの状態変化で表すか、drawer内に独立した閉じるbuttonを置くかを画像確認後に判断する。
- focus state画像を別途作るかは、closed/open draft確認後に必要性を判断する。

## site-layout正本化後の扱い

- `mobile-menu` はスマホ版サイトメニューdrawer単体の初期draftとして維持する。
- 現在ページハイライト、ancestor表示、親カテゴリ自動展開を含む現行実装状態は、`docs/design/current-menu-highlight/` と `docs/design/site-layout/` を参照する。
- `docs/design/site-layout/design-mobile-menu-open.png` は、`/data/items/weapons/` を代表routeとして、現在ページハイライトを含むMobileMenu open stateを確認する正本である。
- `mobile-menu` のout of scopeにある現在ページハイライトは、`12-mobile-menu` 時点の初期draft範囲を示すものであり、後続 `15-current-menu-highlight` と `16-layout-screenshot-design-refresh` の正本化を否定しない。
