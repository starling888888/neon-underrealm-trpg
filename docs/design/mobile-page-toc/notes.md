# mobile-page-toc

## Mode

- initial draft

## Target

- page / component: `MobilePageToc.astro` または同等のスマホ / タブレット幅向けページ内目次UI
- route: ページ内目次が有効な本文ページ / データページ。`/`、`/release-notes`、`/404`、TOC項目が0件または1件のページでは非表示
- viewport:
  - mobile: `390x900`
- states:
  - `design-mobile-closed.png`: 本文内H1要素の右側に、ボタン感を弱めた目次triggerを表示する状態
  - `design-mobile-open.png`: H1直下に、軽いoverlayとしてページ内見出しリンク一覧を表示する状態

## Referenced SSoT

- `AGENTS.md`
- `.agents/skills/design-image-generation/SKILL.md`
- `docs/requirements.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- `docs/issue/14-mobile-page-toc.md`
- `docs/issue/13-page-toc.md`
- `docs/design/global-styles/notes.md`
- `docs/design/base-layout/notes.md`
- `docs/design/page-toc/notes.md`
- `docs/design/page-toc/design-desktop-visible.png`
- `docs/design/mobile-menu/notes.md`
- `docs/design/mobile-menu/design-mobile-closed.png`
- `docs/design/mobile-menu/design-mobile-open.png`

## Design direction

- visual direction: `page-toc` の控えめなページ内リンク群を、スマホ幅の本文内H1横から開ける軽いoverlayとして表現する。白寄り本文面、暗めHeader、青緑accent、薄い境界線の方向性を維持し、サイトメニューdrawerや検索dialogに見えないようにする。
- layout direction: スマホ幅では本文内H1要素の右側に、ボタン感を弱めた目次triggerを置く。triggerは大きな枠付きボタンではなく、短いラベル、控えめなchevron、必要最小限のaccentで表現する。開いた状態ではH1直下に軽いoverlay panelを表示する。mobile-menu drawerほど強い画面占有にしない。
- typography direction: 可視文言は `このページの目次` を基本にする。目次項目は本文より少し小さく、H2 / H3 の階層差が分かる程度のweight、余白、インデントで示す。長い日本語見出しは自然に折り返せるようにする。
- color / accent usage: 通常状態は濃いグレー文字、白寄りsurface、薄いborderを基本にする。青緑accentは開閉buttonの小さな状態表示、focus、リンクhover相当に限定する。現在位置ハイライトに見える強い左線、背景色、active markerは描かない。

## Existing design constraints

- `docs/design/global-styles/` の白寄り背景、暗めグレーHeader、控えめな青緑accent、ルール参照向けの実務的密度を維持する。
- `docs/design/page-toc/` のH2 / H3ベースのページ内リンク階層を維持する。`h1` 相当のページタイトルはMobilePageTocに含めない。
- `docs/design/mobile-menu/` のサイトメニューdrawerとは役割、位置、文言、開き方を分離する。MobilePageTocはサイト全体のページ移動ではなく、現在ページ内の見出し移動である。
- Header左のサイトメニューボタン、Header右の検索アイコン枠とは別導線にする。Header内へ新しいTOCボタンを詰め込む前提にしない。
- 目次triggerは本文内H1要素横に置き、サイトHeader内のmenu / search導線とは別の導線として扱う。Header内へ新しいTOCボタンを詰め込まない。
- 目次triggerは44px相当のタップ領域を確保しつつ、枠付きボタンとして強く見せない。周囲のH1余白と小さなchevron / accentで操作可能性を示す。
- PC右サイド常設PageTocは `1024px` 未満で表示しない。MobilePageTocとPC用PageTocが同時に目立つ状態を描かない。
- トップページ `/`、更新履歴ページ `/release-notes`、404ページ `/404`、TOC項目が0件または1件のページでは、空のTOC枠、`目次はありません`、薄いplaceholderを表示しない。
- 開閉中にサイトメニューdrawerと重なって見えないようにする。必要であれば、片方が開いたら片方を閉じる実装を想定できる構造にする。
- 画像内の見出し文言は正確な本文を固定するものではない。短い代表ラベルで、階層、密度、余白、開閉状態、タップ領域を確認できればよい。

## Out of scope

- PC右サイド常設PageTocの再設計
- build後HTML postprocessの再設計
- 見出しID自動生成ルール、hash ID生成ルール、`data-anchor-id`、`data-toc-exclude` の仕様変更
- TOC対象見出しを `h2` / `h3` 以外へ拡張すること
- 現在位置ハイライト
- IntersectionObserverによるactive heading追跡
- スクロール連動表示
- スクロール位置に応じた目次自動展開
- パンくずリスト
- ページ末尾の前後ナビゲーション
- 検索UI、検索結果、Pagefind導入
- サイトメニュー現在ページハイライト、`aria-current="page"` のサイトメニュー実装
- ルール本文の本格移植、新規本文ページの大量作成
- トップページ本体、404ページ本体、更新履歴ページ本体の完成
- Excel / Spreadsheet連携、JSON変換パイプライン、データカード実装
- キャラクターシート、ダイスローラー、戦闘シミュレーター等のツール導線
- DB、認証、SSR、CMS、APIサーバー、外部検索サービス
- 外部UIライブラリの大規模導入
- 高度なアニメーション、過剰なneon glow表現、装飾的なoverlay

## Comparison points for implementation

- `1024px` 未満でPC右サイドPageTocが常設表示されず、MobilePageTocだけが表示対象になる。
- closed stateでは、本文内H1要素横に控えめな目次triggerがあり、サイトメニューや検索と混同しない。
- open stateでは、H1直下に現在ページ内のH2 / H3リンク一覧が表示され、階層差が分かる。
- `h1` 相当のページタイトルはMobilePageToc項目に含まれない。
- TOC項目が0件または1件のページで、空のTOC button / panelが表示されない。
- `/`、`/release-notes`、`/404` でMobilePageTocが表示されない。
- 目次項目は通常のアンカーリンクとして見え、GitHub Pages subpath配下でもhash移動できる実装にしやすい。
- 開閉buttonは `aria-expanded`、`aria-controls` と同期できる構造になっている。
- 目次領域は `nav` landmarkまたは同等の構造として扱え、`aria-label="このページの目次"` を付与できる。
- Escキーで閉じる、目次項目選択後に閉じる挙動を実装できる見た目になっている。
- focus outlineを消さず、タップ領域が小さすぎない。
- MobileMenuを開いた状態でMobilePageTocが残留して表示崩れしない方針と矛盾しない。
- PC幅のPageToc design、mobile-menu design、global stylesと視覚的に一貫している。
- H1横trigger + H1直下overlay案を正式採用する。
- 差分として許容できるもの: buttonの細かな高さ、border濃度、iconの向き、H3インデント量、項目数、本文上部内での縦位置の微調整。
- レビューが必要な差分: Header内へのTOC導線追加、常時floating / sticky化、drawer化してmobile-menuに似すぎる表現、現在位置ハイライトに見える強調、検索UIやパンくずの追加、空TOC表示、本文幅やHeader挙動を大きく変える変更。

## Generation source

- generator or capture source: SVGモックを `.tmp/mobile-page-toc-designs/` に生成し、ImageMagick `convert` でPNGへ変換した。元SVGと生成スクリプトはdesign正本ではない。
- source branch / commit when applicable: branch `14-mobile-page-toc`, issue commit `1d2adae`
- route when applicable: first draft should use a representative long-form content page with page TOC enabled; non-display checks should include `/`, `/release-notes`, and `/404`
- viewport: mobile `390x900`
- prompt summary or capture notes: Updated initial design draft for the mobile page table-of-contents design target. The adopted direction places a subtle TOC trigger beside the page H1 and opens a lightweight overlay directly below that H1 area. Search, breadcrumbs, current-position highlighting, previous / next navigation, and tool-like app features are not drawn.

## Open questions

- H1横triggerの縦位置、H1が長い場合の折り返し、目次triggerの可視ラベルをどこまで控えめにするか。
- overlayを開いたときに背景本文をどの程度dimするか。mobile-menu drawerほど強くしない方針は維持する。
- 目次項目が長い場合、行数制限を設けるか自然な折り返しにするか。
- サイトメニューとMobilePageTocが同時に開く操作が発生した場合、どちらを優先して閉じるか。
