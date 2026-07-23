# page-toc

## VRT baseline

- test: `tests/visual/vrt/page-toc.spec.ts` の `@vrt @page-toc @<state> @<viewport>`
- route: `/-local/mdx-test/`
- state: default
- snapshots:
  - desktop `1440x1200`: `page-toc-default-desktop.png`
  - tablet `820x1180`: `page-toc-default-tablet.png`
  - mobile `390x900`: `page-toc-default-mobile.png`
- hidden state snapshots: `page-toc-no-toc-home-desktop.png`, `page-toc-no-toc-not-found-desktop.png`, `page-toc-no-toc-release-notes-desktop.png`
- baseline update: 通常実行では比較のみ行う。差分を確認したうえでユーザーが明示指示した場合だけ `npm run visual:update` を実行する。

## Mode

- initial draft

## Target

- page / component: `PageToc.astro` または同等のPC右サイドページ内目次
- route: 本文ページ / 対象データページで表示。`/`、`/release-notes`、`/404` では非表示
- viewport: desktop `1440x1200`
- states:
  - `design-desktop-visible.png`: 本文ページでPC右サイドにページ内目次を表示する標準状態
  - `design-desktop-hidden-home.png`: トップページ `/` でページ内目次を表示しない状態
  - `design-desktop-hidden-release-notes.png`: 更新履歴ページ `/release-notes` でページ内目次を表示しない状態
  - `design-desktop-hidden-404.png`: 404ページ `/404` でページ内目次を表示しない状態

## Referenced SSoT

- `AGENTS.md`
- `.agents/skills/design-image-generation/SKILL.md`
- `docs/requirements.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- `docs/design/global-styles/notes.md`
- `docs/design/base-layout/notes.md`
- `docs/design/header-footer/notes.md`
- `docs/design/site-menu/notes.md`
- `docs/design/mobile-menu/notes.md`

## Historical source issues

- `docs/issue/done/phase-2/13-page-toc.md`

## Design direction

- visual direction: `base-layout` の右補助レールを、長い本文を読むための控えめなページ内目次へ置き換える。白寄り本文面、暗めHeader / Footer、青緑accentの方向性を維持し、右レールだけが強く浮かないようにする。
- layout direction: PC幅では左にSiteMenu、中央に本文、右にPageTocを置く3カラム構造を維持する。PageTocは本文とは独立した右サイド領域に固定表示される想定だが、本文幅を不自然に圧迫しない。
- typography direction: 目次項目は本文より小さく、H2 / H3 の階層差が分かる程度のweight、余白、インデントで示す。長い日本語見出しでも破綻しない行間と折り返しを確保する。
- color / accent usage: 通常状態は濃いグレー文字と薄い境界線を基本にする。青緑accentはリンク、focus、控えめなsection markerに限定する。現在位置ハイライトはこのIssueでは完成表現として描かない。

## Existing design constraints

- `docs/design/global-styles/` の白寄り背景、暗めグレーHeader、青緑accent、実務的な密度を維持する。
- `docs/design/base-layout/` の3カラム構造を維持し、右補助レールをPageTocへ置き換える前提にする。
- `docs/design/site-menu/` の左サイドメニューと競合しない。左のSiteMenuと右のPageTocは役割、見出し、密度、accentの使い方で区別できるようにする。
- PageTocはサイト全体のメニューではなく、現在ページ内の見出しリンクであることが分かる見た目にする。
- TOC対象は初期実装では `h2` / `h3` 相当を想定する。`h1` はページタイトル相当としてPageTocに含めない。
- 表示状態の画像では、見出しリンクでページ内ジャンプできることが分かる静的表現に留める。スクロール追跡や現在位置ハイライトは描かない。
- 非表示状態の画像では、トップページ、更新履歴ページ、404ページで右レールに空のTOC枠、薄いプレースホルダー、`目次はありません` のようなメッセージを出さない。ページ内目次が不要な画面では、右TOC領域そのものが表示対象ではないことを示す。
- `1024px` 未満のPC右サイド常設目次は表示しない方針を守る。スマホ用ページ内目次は `14-mobile-page-toc` で扱うため、このdesign targetでは開閉式モバイルTOCを描かない。
- 画像内の見出し文言は正確な本文を固定するものではない。短い代表ラベルや本文ブロックで、階層、密度、余白、視線誘導を確認できればよい。

## Out of scope

- スマホ用ページ内目次
- `MobilePageToc.astro`
- スマホ用の開閉式「このページの目次」
- スマホ用TOC drawer
- Escキーで閉じる制御
- 現在位置ハイライト
- IntersectionObserverによるactive heading追跡
- スクロール連動表示
- パンくずリスト
- ページ末尾の前後ナビゲーション
- 検索UI、検索結果、Pagefind導入
- ルール本文の本格移植
- 新規本文ページの大量作成
- トップページ本体の完成
- 404ページ本体の完成
- データカード、一覧フィルタ、Excel変換、JSON生成パイプライン
- ログイン、CMS、DB、SSR、APIサーバー
- キャラクターシート、ダイスローラー、戦闘シミュレーター等のツール導線
- 高度なアニメーション、発光表現、過剰なネオン装飾

## Comparison points for implementation

- 表示状態では、右レールがPageTocとして認識できる構造になっている。
- PageTocは `nav` landmarkとして成立し、実装時に `aria-label="目次"` などを設定できる見た目になっている。
- PageToc項目は現在ページ内の `h2` / `h3` に対応するリンクとして見え、H2 / H3 の階層差が分かる。
- `h1` 相当のページタイトルはPageToc項目に含めない。
- TOC項目が0件または1件の画面で、空のTOC枠が表示されない方針と矛盾しない。
- トップページ `/` の非表示画像では、右サイドにPageToc枠や「目次なし」表示が出ていない。
- 更新履歴ページ `/release-notes` の非表示画像では、全リリースノートを表示する一覧ページとして扱い、右サイドにPageToc枠や「目次なし」表示が出ていない。
- 404ページ `/404` の非表示画像では、右サイドにPageToc枠や「目次なし」表示が出ていない。
- Header / Footer / SiteMenu とPageTocが視覚的に競合していない。
- 右サイド目次が本文幅を不自然に圧迫していない。
- PageTocを検索UI、パンくず、前後ナビゲーション、サイトメニューとして誤認させる表示になっていない。
- 現在位置ハイライトに見える強調を入れていない。もし選択状態に見える強調が必要に見えた場合は、後続の現在位置ハイライトタスクで扱う。
- 差分として許容できるもの: 目次項目の代表ラベル、項目数、インデント量の微調整、右レール内余白の微調整、枠線や薄いsection markerの濃度調整。
- レビューが必要な差分: 現在位置ハイライトに見える強調、検索UIやパンくずの追加、トップページや404ページへの空TOC表示、スマホ用TOCの描き込み、右レール幅の大幅変更、本文幅を大きく狭める変更。

## Generation source

- generator or capture source: SVGモックを `.tmp/page-toc-designs/` に生成し、ImageMagick `convert` でPNGへ変換した。元SVGと生成スクリプトはdesign正本ではない。
- source branch / commit when applicable: `13-page-toc` / `03f3dd0`
- route when applicable:
  - `design-desktop-visible.png`: 本文ページまたは検証用本文ページ
  - `design-desktop-hidden-home.png`: `/`
  - `design-desktop-hidden-release-notes.png`: `/release-notes`
  - `design-desktop-hidden-404.png`: `/404`
- viewport: desktop `1440x1200`
- prompt summary or capture notes: PC右サイドページ内目次のinitial draft。`base-layout` の右補助レールをPageTocへ置き換え、SiteMenuとの役割差を保つ。表示状態ではH2 / H3のページ内リンク階層が分かることを優先した。非表示状態ではトップページ、更新履歴ページ、404ページにPageToc枠や空状態メッセージを出していない。スマホ用TOC、現在位置ハイライト、検索、パンくず、前後ナビゲーションは描き込んでいない。

## Open questions

- 非表示状態の画像は `/`、`/release-notes`、`/404` の3枚を作成済み。見出し1件だけの本文ページも `design-desktop-hidden-short-content.png` として追加する必要があるか。
- PageTocの可視見出しは `目次` とする。
- 右レール内でPageTocをstickyに見せる位置と、Header下の開始位置をどの程度揃えるか。
- TOC項目が長い場合の折り返しを、2行まで許容するか、行数制限を設けず自然に折り返すか。

## site-layout正本化後の扱い

- `page-toc` はPC右サイドページ内目次単体の初期draftとして維持する。
- `16-layout-screenshot-design-refresh` 時点では `/release-notes` と `/404` は未実装routeであり、`site-layout` では新規作成も新規正本画像化もしない。現在の `/release-notes` の非表示確認は `docs/design/release-notes/` で扱う。
- `docs/design/site-layout/design-desktop.png` は、実装済み本文ページ `/mdx-test/` でPC右PageTocが表示される状態を確認する横断正本である。
- `docs/design/site-layout/` では、非表示確認は実装済みの `/` を対象とする。現在の `/release-notes` の非表示確認は `docs/design/release-notes/` で扱い、`/404` は該当ページ実装後に必要に応じて扱う。
