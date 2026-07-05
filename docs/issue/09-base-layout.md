# 09-base-layout

## 目的

サイト全体で共通利用するデスクトップ向けLayout基盤を作成し、各ページが個別にHTML骨格、SEO、共通CSS読み込み、本文幅、基本構造を重複実装しなくてよい状態にする。

具体的には、以下を作成する。

* `src/layouts/BaseLayout.astro`
* `src/layouts/ContentLayout.astro`

`BaseLayout.astro` は、HTML全体の基本骨格、`Seo.astro` の組み込み、共通CSS読み込み、ヘッダー・メイン・フッター領域の基本構造を担当する。今回はHeader / Footer / SiteMenu Componentを分離せず、後続タスクで差し替えやすい最小限の表示をlayout内へベタ書きする。

`ContentLayout.astro` は、ルール本文やMDXページ向けに、本文表示領域と `prose` スタイルを扱いやすくするためのレイアウトとする。

## 背景

`docs/plan.md` の Phase 2 では、レイアウト・ナビゲーションの最初のタスクとして `09-base-layout` が定義されている。

対象タスクは以下。

* designを生成する
* `src/layouts/BaseLayout.astro` 作成
* `src/layouts/ContentLayout.astro` 作成
* ヘッダー・本文・フッターの基本構造を作成

現状、`src/pages/index.astro` はページ内で直接 `<!doctype html>`、`<html>`、`<head>`、`<body>`、`Seo.astro`、共通CSS import を持っている。後続で複数ページを作ると、この構造が各ページへ重複しやすい。

また、`docs/TODO.md` には `Seo.astro` を共通Layoutへ組み込むTODOがあり、このタスクで回収する。

関連する要件は以下を参照する。

* `docs/requirements.md`
* `docs/out-of-scope.md`
* `docs/plan.md`
* `docs/TODO.md`
* `docs/design/global-styles/`
* `.agents/skills/design-image-generation/SKILL.md`

特に `docs/requirements.md` では、サイトはヘッダー、フッター、サイトメニュー、メインコンテンツ、ページ内目次で構成されること、PC・タブレット・スマホで閲覧できるレスポンシブデザインであること、GitHub Pages等のサブパス公開で壊れないことが求められている。

ただし、このissueでは Header / Footer Component分離、正式なサイトメニュー、モバイルメニュー、ページ内目次そのものは実装しない。これらは後続タスクで扱う。

ユーザーレビューにより、今回の作成範囲はデスクトップレイアウトのみとする。SiteMenuのモバイルでのハイド、モバイル専用レイアウト、モバイルメニューは扱わない。

## 対象範囲

* `src/layouts/BaseLayout.astro`

  * HTML全体の基本骨格
  * `<html lang="ja">`
  * `<head>` 内の基本meta
  * `Seo.astro` の組み込み
  * 共通CSS import
  * `title` / `description` / `og:*` などをLayout props経由で渡せる構造
  * デスクトップ向けの header / main / footer の基本領域
  * layout内にベタ書きする最小限のサイト名、仮のナビゲーション領域、フッター領域
  * 後続の Header / Footer / SiteMenu / PageToc を差し込める構造
* `src/layouts/ContentLayout.astro`

  * MDX本文・ルール本文向けの本文ラッパー
  * `BaseLayout.astro` を内部利用
  * `prose` 適用領域
  * ページタイトル、説明文、本文slotの扱い
* `src/pages/index.astro`

  * 既存トップページの最小限のLayout適用
  * ページ固有のHTML骨格重複を削除
* 必要に応じて `src/pages/mdx-test.mdx`

  * MDXページで `ContentLayout.astro` を使えることの確認
* 必要に応じた最小限のCSS調整

  * 既存 `global.css` の `main` 直指定がLayout構造と衝突する場合のみ調整
  * 後続タスクで扱うナビゲーションや本格的なレスポンシブUIは実装しない
  * SiteMenuのモバイル非表示やモバイル専用CSSは実装しない
* `docs/TODO.md` の以下項目の扱いをissueまたは作業報告に記録

  * `Seo.astro` を共通Layoutへ組み込む

## 初期スコープ外

* `Header.astro` を作成しない
* `Footer.astro` を作成しない
* PC左サイトメニューを実装しない
* SiteMenuのモバイルでのハイドを実装しない
* モバイル専用レイアウトを実装しない
* スマホ用開閉メニューを実装しない
* ページ内目次を実装しない
* 現在ページハイライトを実装しない
* 検索UIまたはPagefind連携を実装しない
* トップページの本格デザインを作り込まない
* 404ページを作成しない
* パンくずリストを実装しない
* ページ末尾の前後ナビゲーションを実装しない
* キャラクターシート、ダイスローラー、戦闘シミュレーター等のツール機能を実装しない
* DB、認証、SSR、CMS、APIサーバーを追加しない
* 大規模UIライブラリを追加しない
* 個別OGP画像生成、アクセス解析、sitemap、RSS、robots.txt生成を追加しない
* 初期スコープ外の項目は `docs/out-of-scope.md` に従う

## 完了条件

以下の完了条件・チェックポイントは、人間レビュー完了後に最終チェックするため、実装時点では未チェックのままとする。
ローカル検証済みの項目は、後段の「ローカル検証結果」および「ビジュアルレビュー」に記録する。

* [ ] `docs/design/base-layout/notes.md` が作成されている、または design-image-generation initial draft mode の実行が前提条件として明記されている
* [ ] `docs/design/base-layout/design-desktop.png` が作成されている、または未作成理由と実装前に必要な扱いが記録されている
* [ ] `docs/design/base-layout/design-mobile.png` は今回のデスクトップ限定スコープ外として未作成理由が記録されている
* [ ] `src/layouts/BaseLayout.astro` が作成されている
* [ ] `src/layouts/ContentLayout.astro` が作成されている
* [ ] `BaseLayout.astro` が `Seo.astro` を `<head>` 内で利用している
* [ ] Layout props経由で `title` を指定できる
* [ ] Layout props経由で `description` を指定できる
* [ ] 必要に応じて `og:title` / `og:description` / `og:type` / `og:image` / `og:url` を渡せる
* [ ] `Seo.astro` の既存デフォルト値・base path対応を壊していない
* [ ] 共通CSSの読み込みがLayout側へ集約され、ページ側で重複しない
* [ ] `index.astro` が `BaseLayout.astro` または `ContentLayout.astro` を利用している
* [ ] デスクトップ向けのヘッダー・本文・フッターの基本領域が存在する
* [ ] layout内ベタ書きの仮表示が、後続の Header / Footer / SiteMenu Componentへ差し替えやすい範囲に留まっている
* [ ] 後続の `10-header-footer`、`11-site-menu`、`13-page-toc` が差し込みやすい構造になっている
* [ ] Header / Footer Component、サイトメニュー、ページ内目次そのものを実装していない
* [ ] `docs/TODO.md` の `Seo.astro` 共通Layout組み込みTODOについて、対応結果または未対応理由が記録されている
* [ ] 関連TODOを扱った場合は、対応結果または未対応理由が記録されている
* [ ] UI系タスクとして、参照するdesign targetとdesign画像の扱いが記録されている
* [ ] design画像作成が必要な場合は、`design-image-generation` の実行を前提条件として記録している
* [ ] `npm run build` が通る
* [ ] 必要に応じて `npm run check` が通る

## チェックポイント

* [ ] 既存ルートが壊れていない
* [ ] GitHub Pagesのサブパス公開に影響しない
* [ ] `Seo.astro` のURL生成契約と矛盾していない
* [ ] `index.astro` からHTML骨格重複が減っている
* [ ] MDX本文ページで利用できる構造になっている
* [ ] `global.css` / `prose.css` / `tokens.css` の責務を過剰に崩していない
* [ ] `docs/design/global-styles/` の白寄り背景、暗めグレーヘッダー、青緑系アクセント、長文可読性の方向性と矛盾していない
* [ ] デスクトップレイアウトに限定されている
* [ ] 後続の Header / Footer / SiteMenu / PageToc 実装を先取りしすぎていない
* [ ] 不要な依存関係を追加していない
* [ ] 初期スコープ外の機能を実装していない
* [ ] 関連する `docs/TODO.md` 項目と矛盾していない
* [ ] 関連する `docs/design/` と矛盾していない
* [ ] ユーザーの未コミット変更を破壊していない

## 想定変更ファイル

* `docs/issue/09-base-layout.md`
* `docs/design/base-layout/notes.md`
* `docs/design/base-layout/design-desktop.png`
* `src/layouts/BaseLayout.astro`
* `src/layouts/ContentLayout.astro`
* `src/pages/index.astro`
* `src/pages/mdx-test.mdx`
* `src/styles/global.css`
* `src/styles/prose.css`

上記のうち、`docs/design/base-layout/notes.md` と `docs/design/base-layout/design-desktop.png` は design-image-generation initial draft mode で作成する想定とする。`design-mobile.png` は今回のデスクトップ限定スコープ外とする。

`src/pages/mdx-test.mdx`、`src/styles/global.css`、`src/styles/prose.css` は必要な場合のみ変更する。

## レビュー観点

`BaseLayout.astro` の責務が、HTML骨格、SEO、共通CSS、ページ全体の基本領域に限定されているか確認する。

`ContentLayout.astro` の責務が、本文ページ向けのラッパーに限定されているか確認する。

`Seo.astro` の組み込み方が、後続ページごとの `title` / `description` / `og:*` 上書きに耐える形になっているか確認する。

GitHub Pagesのサブパス公開に対して、内部リンク、画像、OGP URL、CSS / JS 参照が壊れない構造になっているか確認する。

後続の `10-header-footer`、`11-site-menu`、`12-mobile-menu`、`13-page-toc`、`14-mobile-page-toc` の実装を妨げない構造になっているか確認する。

このissueで Header / Footer Component、サイトメニュー、ページ内目次、検索UIなどを作り込みすぎていないか確認する。

`docs/TODO.md` の `Seo.astro` 共通Layout組み込みTODOを、このissueで回収してよいか確認する。

デスクトップ限定のdesign画像で、今回の実装判断に十分か確認する。

## 備考

このタスクはUI / layoutタスクであるため、実装前に `docs/design/base-layout/` のデスクトップdesign画像を用意する必要がある。

ローカル検証では、`docs/design/global-styles/` は存在するが、`docs/design/site-layout/` は未作成である。

実装前に `.agents/skills/design-image-generation/SKILL.md` の initial draft mode に従い、以下を作成した。

* `docs/design/base-layout/notes.md`
* `docs/design/base-layout/design-desktop.png`
* `docs/design/base-layout/design-mobile.png` は今回作成しない。モバイルレイアウト、SiteMenuのモバイル非表示、モバイルメニューは後続タスクで扱う。

design画像では、以下を描き込みすぎないこと。

* 完成版のサイトメニュー
* 完成版のモバイルメニュー
* 完成版のページ内目次
* 検索UI
* パンくずリスト
* 前後ナビゲーション
* ダイスローラー、キャラクターシート等のツール機能

このissueで扱うのは、あくまで共通Layoutの土台である。

## ローカル検証結果

このissueはremote snapshot draftとして生成された後、ローカルリポジトリで検証した。

検証済み:

* current branch: `09-base-layout`
* `09-base-layout` branch: 新規作成済み
* working tree: 実装変更あり
* `docs/issue/09-base-layout.md`: ローカルに存在
* `docs/plan.md`: `09-base-layout` が未完了タスクとして存在
* `docs/TODO.md`: `Seo.astro` を共通Layoutへ組み込むTODOが `09-base-layout` に紐づいている
* `docs/design/global-styles/`: `notes.md`、`style-tile.png`、`style-tile-mobile.png` が存在
* `docs/design/base-layout/`: `notes.md`、`design-desktop.png` が存在
* `docs/design/site-layout/`: 未作成
* `src/pages/index.astro`: ページ内にHTML骨格、`Seo.astro`、共通CSS importが存在
* `src/components/seo/Seo.astro`: 存在
* `src/pages/mdx-test.mdx`: 存在
* `package.json`: `npm run build` と `npm run check` が定義されている

実装後に実行:

* `npm run check`: 成功
* `npm run build`: 成功
* `design-image-generation` initial draft mode: デスクトップdesign画像作成まで実行済み

モバイルdesign画像は今回のデスクトップ限定スコープ外とする。

## ビジュアルレビュー 1

### デザイン参照

* design target: `docs/design/base-layout/`
* reference desktop: `docs/design/base-layout/design-desktop.png`
* reference mobile: なし。今回のissueはデスクトップ限定スコープのため `design-mobile.png` は作成しない。
* notes: `docs/design/base-layout/notes.md`

### 成果物

* actual desktop: `test-results/visual/actual-desktop.png`
* actual mobile: `test-results/visual/actual-mobile.png`
* report: `playwright-report/` は生成されていない

### レビュー結果

| 領域 | 判定 | 差分 | 対応 |
|---|---|---|---|
| レイアウト | OK | desktopでheader、左rail、本文、右rail、footerの基本構造が表示されている | 修正なし |
| 余白 | OK | designと完全一致ではないが、本文幅とrail余白は概ね意図どおり | 修正なし |
| タイポグラフィ | OK | 実装は日本語本文の実データ表示、designは英字サンプル中心 | ページ内容差分として許容 |
| 色 | OK | 右補助エリアは白寄り背景で、色面として強く分離していない | 修正なし |
| 配置・整列 | OK | header placeholder、rail placeholder、本文カラムが安定している | 修正なし |
| レスポンシブ | 要人間判断 | mobile screenshotは取得したが、今回のissueはデスクトップ限定でSiteMenu mobile hide等はスコープ外 | 後続タスクで判断 |
| overflow / scroll | OK | desktop layoutとして破綻なし。mobileは横幅より広いデスクトップシェルとして表示される | mobileはスコープ外 |
| 既存デザインとの整合 | OK | `docs/design/global-styles/` の白寄り背景、暗めヘッダー、青緑アクセントと矛盾しない | 修正なし |
| 既存Componentとの整合 | OK | `Seo.astro`、`InternalLink.astro`、MDX Componentが利用可能 | 修正なし |
| accessibility basics | OK | site titleはリンク、装飾placeholderは `aria-hidden`、railには `aria-label` を設定 | 修正なし |

### 自己修正した項目

* [x] `npm run check` が `.tmp/` の一時SVGをBiome対象に含めて失敗したため、`biome.json` で `.tmp/`、`test-results/`、`playwright-report/` を対象外にした。
* [x] MDXページは管理しやすいように、本文内でLayout Componentを包む形ではなくfrontmatterの `layout` 指定へ変更した。
* [x] frontmatter layout変更後に `/mdx-test/` のVisual captureを再実行し、MDXページにもheader、left rail、main、right rail、footerが表示されることを確認した。

### 人間判断が必要な差分

* mobile screenshotは取得したが、今回のissueはデスクトップ限定である。mobile layout、SiteMenuのmobile hide、mobile menuは後続タスクで扱う。
* `/` は本文量が少ないため、design referenceの本文サンプルとは見た目密度が異なる。MDX本文ページ `/mdx-test/` では長文・表・codeを含む本文表示を確認済み。

### design-image-generation への引き継ぎ候補

* [ ] 実装スクリーンショットをdesign正本化する必要がある場合は、design fix modeへ引き継ぐ

### 対応完了チェックリスト

* [x] desktop screenshot を取得した
* [x] mobile screenshot を取得した
* [x] reference と actual を比較した
* [x] 明らかな visual mismatch を修正した、または修正不要と判断した
* [x] design正本の更新が必要な場合は、人間判断項目として記録した
* [x] `npm run check` が通る
* [x] `npm run build` が通る

## レビュー指摘 1

### 指摘事項

- `docs/TODO.md` の `Seo.astro` 共通Layout組み込みTODOが、実装後も未対応のまま残っている。
- `docs/issue/09-base-layout.md` の完了条件・チェックポイントが未チェックのまま残っている一方、後段では `npm run check` / `npm run build` / Visual Review 等が検証済みとして記録されており、状態が読み取りづらい。
- MCP / Context7 / agent failure log 関連変更が同一PRに含まれている点は通常なら分離推奨だが、今回はユーザー意向により速度優先で同一PRへ含めたものとして扱い、このPRでは対応不要とする。

### 判定

- source: browser-draft
- classification: valid
- local validation: `.tmp/09-review.md` はPR #11 review draft。ローカルでは `BaseLayout.astro` が `<head>` 内で `Seo.astro` を利用し、Layout props経由でSEO項目を渡せる構造になっている。一方で `docs/TODO.md` では `Seo.astro` 共通Layout組み込みTODOが未対応に残っている。また、このissueの完了条件・チェックポイントは未チェックのままだが、同一ファイル後段のローカル検証結果とビジュアルレビューでは複数項目が検証済みとして記録されている。

### 対応方針

- `docs/TODO.md` の `Seo.astro` 共通Layout組み込みTODOを `完了済み` へ移動し、PR #11 での対応内容を記録する。
- `docs/issue/09-base-layout.md` の完了条件・チェックポイントは、人間レビュー前に全項目を完了扱いにしない運用を明示する注記を追加する。ローカル検証済みの内容は後段の「ローカル検証結果」および「ビジュアルレビュー」を正として参照する。
- MCP / Context7 / agent failure log 関連変更の同一PR混入は、今回のreview responseでは追加対応しない。

### 対応完了チェックリスト

- [x] `docs/TODO.md` の `Seo.astro` TODOを完了済みに移動する
- [x] `docs/issue/09-base-layout.md` に完了条件・チェックポイントの未チェック運用に関する注記を追加する
- [x] `npm run check` が通る
- [x] `npm run build` が通る
