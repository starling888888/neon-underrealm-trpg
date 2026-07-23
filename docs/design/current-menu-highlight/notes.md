# current-menu-highlight

## VRT baseline

- test: `tests/visual/vrt/current-menu-highlight.spec.ts` の `@vrt @current-menu-highlight @<state> @<viewport>`
- route: `/world/`
- state: default
- snapshots:
  - desktop `1440x1200`: `current-menu-highlight-default-desktop.png`
  - tablet `820x1180`: `current-menu-highlight-default-tablet.png`
  - mobile `390x900`: `current-menu-highlight-default-mobile.png`
- baseline update: 通常実行では比較のみ行う。差分を確認したうえでユーザーが明示指示した場合だけ `npm run visual:update` を実行する。

## Mode

- initial draft

## Target

- page / component: `SiteMenu.astro` / `SiteMenuItem.astro`
- route: 共通Layout内のサイトメニュー。代表確認ルートは `/data/items/weapons`
- viewport: desktop `1440x1200`, mobile `390x900`
- states: PC左サイトメニューの現在ページ表示、スマホdrawer内サイトメニューの現在ページ表示

## Referenced SSoT

- `AGENTS.md`
- `.agents/skills/design-image-generation/SKILL.md`
- `docs/requirements.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- `docs/design/global-styles/notes.md`
- `docs/design/base-layout/notes.md`
- `docs/design/site-menu/notes.md`
- `docs/design/mobile-menu/notes.md`

## Historical source issues

- `docs/issue/done/phase-2/15-current-menu-highlight.md`

## Design direction

- visual direction: 既存の白寄り本文面、暗めHeader、低彩度グレーのサイトメニュー、青緑accentを維持する。現在ページだけを強く読めるが、派手な発光やアプリ風の選択タブにはしない。
- layout direction: PCでは左レール内の既存SiteMenu構造に現在ページ状態を追加する。スマホでは既存drawer内のSiteMenuに同じ状態表現を適用する。現在ページを含む親カテゴリは展開され、ancestorとして控えめに強調する。
- typography direction: active linkはfont weightを上げ、ancestorは通常より少し強い程度に留める。階層は既存のインデントと右端disclosure indicatorで維持する。
- color / accent usage: active linkは文字色、font weight、薄い青緑背景で示す。外枠や左線はhover / focusや強い選択状態に見えやすいため使わない。ancestorは文字色を少し強め、薄い背景に留め、active linkより弱くする。色だけに依存しない。

## Existing design constraints

- `docs/design/global-styles/` の白寄り背景、暗めグレーHeader、青緑accent、実務的な密度を維持する。
- `docs/design/site-menu/` の構造を維持し、`SITE MENU` / `サイトメニュー` の可視見出しは戻さない。
- `docs/design/mobile-menu/` のdrawer構造を維持し、drawer内SiteMenu本体に重複見出しを置かない。
- 親カテゴリはグループ見出しではなくリンクとして扱う。
- 開閉トグルは階層レベルに関係なく同じ右端ラインに揃える。
- exact matchする現在ページリンクだけが active 状態になる。祖先カテゴリは ancestor 状態であり、`aria-current="page"` 対象ではない。
- メニュー定義に存在しない詳細ページでは、最も近い親カテゴリだけをancestorとして示し、存在しないリンクを描き足さない。

## Out of scope

- ページ内目次の現在見出しハイライト
- IntersectionObserverによるスクロール位置追跡
- PageToc / MobilePageTocのactive heading表示
- パンくずリスト
- ページ末尾の前後ナビゲーション
- 検索UI、検索結果、Pagefind導入
- サイトメニューの開閉状態永続化
- 生成JSONやデータ取得層から流儀・生き様の子項目を追加した状態
- 新規ページ本文、未作成ページ本文
- キャラクターシート、ダイスローラー、戦闘シミュレーター等のツール導線
- DB、認証、SSR、CMS、APIサーバー
- 高度なアニメーション、過剰な発光表現

## Comparison points for implementation

- 現在ページそのもののactive表示と、親カテゴリのancestor表示が見分けられる。
- active linkは文字色、font weight、薄背景など複数要素で識別できる。
- ancestorはactiveより弱く、親カテゴリ自体に `aria-current="page"` が付いたように見えない。
- PC左サイトメニューとスマホdrawer内サイトメニューで同じ状態表現を使っている。
- 現在ページを含む親カテゴリが初期表示で展開されている。
- hover / focusに見える一時的な強調ではなく、現在地として読める。
- 右端disclosure indicatorの位置、子項目インデント、可視見出しなしの構造は既存designと矛盾しない。
- 背景本文、Header、Footer、PageToc予定領域が現在地表示より目立ちすぎない。
- 差分として許容できるもの: active / ancestorの色濃度、薄背景の濃度、drawer幅に合わせた余白微調整。
- レビューが必要な差分: active / ancestorに外枠や左線を追加する、activeとancestorが見分けにくい、active表示がhover/focusに見える、祖先カテゴリが現在ページそのものに見える、検索やパンくずなど別機能が混入している。

## Generation source

- generator or capture source: SVGモックをImageMagick `convert` でPNGへ変換した。元SVGは `.tmp/current-menu-highlight-design-desktop.svg` と `.tmp/current-menu-highlight-design-mobile.svg` に置く。
- source branch / commit when applicable: `15-current-menu-highlight`
- route when applicable: `/data/items/weapons`
- viewport: desktop `1440x1200`, mobile `390x900`
- output images: `design-desktop.png`, `design-mobile.png`
- prompt summary or capture notes: 既存SiteMenuとmobile drawerの構造を維持し、`/data/items/weapons` を代表例として `DATA` と `ITEMS` をancestor、`WEAPONS` をactive current pageとして描いた。画像内の英字ラベルは構造確認用の短い代表ラベルであり、実装時の日本語文言を固定しない。ページ内目次の現在位置ハイライト、検索、パンくず、前後ナビゲーション、生成JSON由来の追加子項目は描いていない。

## Open questions

- active / ancestorの色濃度は実装後のVisual Reviewで、hover / focusとの混同がないか確認する。
- 詳細ページでexact matchがない場合のancestor表示は、最も近い親カテゴリだけで十分かを実装レビュー時に確認する。
