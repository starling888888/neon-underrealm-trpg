# release-notes

## VRT baseline

- test: `tests/visual/vrt/release-notes.spec.ts` の `@vrt @release-notes @<state> @<viewport>`
- route: `/release-notes/`
- state: default
- snapshots:
  - desktop `1440x1200`: `release-notes-default-desktop.png`
  - tablet `820x1180`: `release-notes-default-tablet.png`
  - mobile `390x900`: `release-notes-default-mobile.png`
- baseline update: 通常実行では比較のみ行う。差分を確認したうえでユーザーが明示指示した場合だけ `npm run visual:update` を実行する。

## Mode

- design fix
- 19-2-release-notes-page の実装後Visual Review結果を正本化する。
- current VRTは`tests/visual/vrt/release-notes.spec.ts`の`@vrt @release-notes`で、desktop / tablet / mobileを比較する。

## Target

- page / component: 更新履歴ページ `/release-notes`
- route: `/release-notes`
- viewport:
  - desktop: `1440x1200`
  - mobile: `390x900`
- states:
  - desktop full-page screenshot
  - mobile full-page screenshot
  - 現行 `data/generated/release-notes.json` の1件を表示する標準状態
- planned design images:
  - `docs/design/release-notes/design-desktop.png`
    - desktop `1440x1224`
    - `@vrt @release-notes @desktop` のfull-page snapshot。
  - `docs/design/release-notes/design-mobile.png`
    - mobile `390x900`
    - `@vrt @release-notes @mobile` のfull-page snapshot。

## Referenced SSoT

- `AGENTS.md`
- `.agents/skills/design-image-generation/SKILL.md`
- `docs/requirements.md`
- `docs/requirements/release-notes.md`
- `docs/requirements/layout-navigation.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- `docs/design/global-styles/notes.md`
- `docs/design/site-layout/notes.md`
- `docs/design/home/notes.md`
- `docs/design/page-toc/notes.md`
- `data/generated/release-notes.json`

## Design Direction

- visual direction:
  - 現行サイトの白から薄灰の本文面、暗めのHeader / Footer、濃色本文、控えめな青緑accentを維持する。
  - 更新履歴は派手なheroやmarketing cardではなく、公式ルールサイトの更新確認用一覧として落ち着いた密度で見せる。
  - 近未来・裏社会の気配は既存Header、SiteMenu、色token、控えめなaccentに任せ、ページ本体では可読性と履歴の追いやすさを優先する。
- layout direction:
  - `NoTocPageLayout.astro` または同等のToCなしページ用ラッパーを前提にする。
  - `/release-notes` ではPageToc / MobilePageTocを表示しない。
  - desktopでは既存site-layoutと同じHeader、左SiteMenu、中央本文、Footerの構成を維持し、右PageToc領域や空TOC枠を表示しない。
  - mobileでは既存HeaderとMobileMenuの挙動を前提にし、MobilePageToc triggerを表示しない。
  - トップページと同じToCなしページ用ラッパーの共通余白を使う。更新履歴ページ固有の本文幅調整が必要な場合は、ページ側のscoped CSSへ閉じる。
- typography direction:
  - H1は通常のページタイトルとして表示する。
  - H1直下に「公開サイトの更新内容を...」のような説明文は置かない。
  - リリースノート一覧の各項目では、上に日付、下に本文を置く。
  - 日付は実装時に `<time datetime="YYYY-MM-DD">` として扱える見た目にする。
  - 本文内改行が見えるよう、本文ブロックは `white-space: pre-line` 相当の余白と行間を想定する。
  - 概要は独立した見出しやラベルとして表示しない。本文が空欄の場合のfallbackに限ってsummaryを本文位置へ表示する。
  - canonical design imageのリリースノート本文は、現行 `data/generated/release-notes.json` の実データを表示する。
- color / accent usage:
  - 青緑accentはリンク、focus、控えめなsection markerに限定する。
  - 日付や補足は `text muted` 相当で弱める。
  - 更新履歴の各項目は細い罫線で区切る。card風の囲み、角丸枠、強い背景面、cardの入れ子は避ける。

## Content Instructions

- `.raw/contents/release-notes.md` は配置済みで、frontmatterとH1を主なページ入力として扱う。
- 画像生成時は、H1直下に説明文を表示しない。タイトルの下にそのまま更新履歴一覧を置く。
- `data/generated/release-notes.json` 由来のリリースノート全件表示を前提にする。
- 現在の生成JSONには以下の1件がある。
  - date: `2026-07-07`
  - summary: `仮公開しました。`
  - body: `仮公開しました。\n現在作成中です。`
- bodyが `null` または空文字相当の場合は、summaryを本文位置にfallback表示する。ただし、通常状態でsummaryを本文とは別に表示しない。
- canonical design imageでは、現行生成JSONの正確な件数である1件を表示する。
- 実装では0件でも壊れない簡潔な空状態を持つが、通常運用では1件以上ある想定のため、空状態のdesign画像は作成しない。
- リリースノート件数が増えても縦に自然に伸びる構造にする。

## Existing Design Constraints

- `global-styles` の方向性を維持する。
  - 白から薄灰の本文面
  - 暗めのHeader / Footer
  - 高コントラストの濃色テキスト
  - 控えめな青緑accent
  - 日本語本文が読める本文リズム
  - 過剰なglow、blur、gradient、高彩度neonを使わない
- `site-layout` の方向性を維持する。
  - desktopでは既存Header / Footerと左SiteMenuのlayout挙動を前提にする。
  - mobileでは既存HeaderとMobileMenuの挙動を前提にする。
  - `/release-notes` では不要なPageToc / MobilePageTocや空のTOC枠を表示しない。
- `page-toc` の非表示方針を維持する。
  - 更新履歴ページでは右サイドにPageToc枠や「目次なし」表示を出さない。
  - 更新履歴ページは全リリースノートの一覧であり、ページ内見出し移動のUIを主導線にしない。
- `home` の既存トップページと整合させる。
  - トップページの「更新履歴を見る」導線から遷移した先として自然に見える。
  - トップページより装飾を強くしすぎず、同じ公式サイト内の一覧ページとして見える。
- ToCなしページ用ラッパーの導入を前提にする。
  - トップページと更新履歴ページの基本余白が大きく乖離しない。
  - 本文幅のページ固有調整は、ToCなし共通ラッパーではなく各ページ側のscoped CSSで扱う。
  - ただし、トップページ固有のロゴやキャッチコピー表現を更新履歴ページへ持ち込まない。

## Out Of Scope

- search UI
- advanced filters
- category tabs
- tag filters
- pagination
- individual release-note detail pages
- breadcrumbs
- previous / next navigation
- PageToc / MobilePageToc
- current-position table of contents highlighting
- CMS、編集UI、投稿フォーム、login、authentication、API server、DB、SSR、PWA
- release-note Excel変換処理の変更
- `data/generated/release-notes.json` の手編集
- トップページの最新リリースノート表示仕様変更
- Footerからのcredit導線
- site menu redesign
- 大きなhero背景画像、装飾cyberpunk art、過剰なneon glow

## Comparison Points For Implementation

- planned images:
  - `design-desktop.png` と `design-mobile.png` では、full-pageの余白、ページタイトル、現行リリースノート項目、ToC非表示状態を確認する。
- `/release-notes` がToCなしページ用ラッパーを使っている前提に見えること。
- H1直下に説明文が表示されていないこと。
- PageToc / MobilePageToc、空TOC枠、`目次はありません` のような表示が出ていないこと。
- Header、左SiteMenu、Footerが既存site-layoutと一貫していること。
- SiteMenuの「更新履歴」が現在ページとして識別できる余地があること。
- 各リリースノートは上に日付、下に本文というシンプルな構造で、summaryが独立表示されていないこと。
- 本文fallback時にも、summaryが本文位置に違和感なく表示できる構造であること。
- 本文内改行が詰まって見えず、段落として読めること。
- リリースノートが1件でもページが貧弱に見えすぎず、複数件に増えたときもlistとして自然に伸びること。
- トップページと同じサイト、同じToCなしページ群に見えること。
- reviewが必要な差分:
  - 更新履歴ページにPageToc / MobilePageTocが出ている。
  - H1直下に説明文が表示されている。
  - 検索、絞り込み、タグ、ページネーションなどが描かれている。
  - 個別リリースノート詳細へのカード導線が主導線になっている。
  - card-heavyなmarketing pageになっている。
  - summaryが本文とは別の概要見出しとして表示されている。
  - トップページと別サイトのような色、余白、見出し処理になっている。
  - 標準画面内で横overflowが出ている。

## Generation Source

- current VRT: `tests/visual/vrt/release-notes.spec.ts` の`@vrt @release-notes`。
- source branch / commit when applicable: `19-2-release-notes-page` / `a9997b0`
- historical issue: `docs/issue/done/phase-3/19-2-release-notes-page.md`
- route when applicable: `/release-notes`
- viewport / planned output:
  - `/release-notes`, desktop `1440x1200` viewportのfull-page screenshot `1440x1224`: `design-desktop.png`
  - `/release-notes`, mobile `390x900` full-page screenshot: `design-mobile.png`
- prompt summary or capture notes:
  - `19-2-release-notes-page` の実装後Visual Review結果を、ユーザー指示によりdesign fix modeで正本化した。
  - 旧design draftは複数件の代表更新履歴を描いていたが、現行実装と生成JSONは1件であるため、canonical imageは現行データ1件の表示を正とする。
  - カード風の囲みを使わず、上に日付、下に本文を置くシンプルな罫線区切りを維持する。
  - summaryは独立表示しない。bodyが空欄の場合のみ本文位置へfallback表示する。
  - H1直下に説明文を表示しない。
  - 初期スコープ外UIや新しいアプリ機能は描かない。

## Open Questions

- なし。
