# 20-2-introduction-page

## 目的

`/introduction` に、本作を遊び始める前の案内ページを作成する。ゲーム概要や世界観を再掲せず、必要なもの、v1.0ルールブック準拠の基本用語、ゴールデンルール、後続ページへの導線を提供する。

## 背景

`docs/plan.md` の `20-2-introduction-page` を実施する。トップページにはすでにゲーム概要と `/introduction` への導線があり、SiteMenuにも「はじめに」が定義されている。一方で、対象ページ本体は未作成である。

ユーザー指示により、ゲーム概要はトップページ、世界観は `/world`、具体的なルール処理は `/rules` に分離する。ゴールデンルールはそれらを横断する解釈・裁定・進行の上位原則として、このページを唯一の正本とする。

本文と用語の旧資料参照は、以下の順を使う。

1. `.raw/v1.0/01.ルールブック.md`
2. `.raw/v1.0/無料配布_PL向けルールブック.md`
3. `.raw/v1.0/無料配布_GMブック.md`
4. `.raw/v1.0/V1.5修正整理.md`

この順序は旧資料間の優先順であり、ユーザー指示、`AGENTS.md`、現行requirements、初期スコープ外を置き換えない。基本用語はv1.0ルールブックの「基本的な用語」に準拠し、V1.5で廃止された旧称を現行本文へ復元しない。

関連する正本・参照先は以下とする。

- `docs/requirements/pages.md` の `/introduction`、`/rules`、`/support` の責務
- `docs/requirements/non-functional.md` の見出し階層、アクセシビリティ、レスポンシブ要件
- `docs/requirements/components.md` の `Callout` 要件
- `docs/out-of-scope.md`
- `docs/TODO.md` のローカルコンテンツ作成ワークフロー確認
- `docs/design/global-styles/`、`docs/design/site-layout/`、`docs/design/callout/`
- 実装前に作成する `docs/design/introduction/`

## 対象範囲

- `design-image-generation` のinitial draft modeを別の承認段階で実行し、`docs/design/introduction/notes.md`、`design-desktop.png`、`design-mobile.png` を作成・レビューする。
- 承認済みdesignと `.raw/contents/introduction.md` のfrontmatter、Markdown本文、HTMLコメント指示をもとに `src/pages/introduction.mdx` を作成する。
- H1直下に、このページがゲーム開始前の案内であることを短く示す。ゲーム概要や世界観は再掲しない。
- 必要なものとして、GMとPL、10面体・6面体ダイスを各10個以上（20個程度を推奨）、記録用シート・筆記具、遊ぶ時間を案内する。多数のダイスを使うためオンラインセッションを推奨する。`/support` は未実装のため、今回の公開ページにはリンクを置かず、`41-2-support-page` の実装後に内部リンクを追加する。
- 基本用語として、プレイヤー、ゲームマスター、キャラクター、プレイヤーキャラクター、ノンプレイヤーキャラクター、シナリオ、キャンペーン、D／サイコロ／ダイス、判定、達成値、判定数をv1.0ルールブック準拠で掲載する。判定数のダイスは常に10面体であり、判定には6面体を使わないことを含める。
- ゴールデンルールの説明、4原則、端数処理を `warning` の `Callout` で囲む。
- `Callout` の既定title仕様と既存CalloutのPageToc非混入を変えない。ゴールデンルールに限る明示的なopt-in APIまたはページ側の構造で、Calloutの可視titleをHTML上のH2として出力できるかをdesign initial draft時に調査する。`src/components/_common/Callout.astro` を変更する場合は、既存Calloutの見た目・HTML構造・アクセシビリティと `docs/design/callout/` 正本への影響を確認する。
- ゴールデンルールを表すH2が最終HTMLに1つだけ存在し、H1→H2、PageToc、スクリーンリーダーの見出しナビゲーション、Calloutの可視titleとの意味的一致を確認する。
- ワールドガイド、キャラクターメイキング、ルールへの内部導線を既存 `InternalLink` または同等のbase path対応済み方式で配置する。`/support` は「次に読むページ」には含めない。`/support` 本体の実装後に、必要なもの節からの内部リンク追加を別途扱う。
- `tests/visual/introduction.spec.ts` と必要最小限のvisual設定を追加し、desktop・mobileの表示を確認する。
- 実装後、Visual Reviewの結果をもとに `docs/design/introduction/` のdesign正本更新可否をユーザーへ提示する。actual screenshotを正本化するには、別途ユーザー承認を要する。

## 初期スコープ外

- `/support` ページ本体、オンラインセッションの進め方、特定オンラインセッションツールの紹介・必須化
- GM向け運用ガイド、GM裁定、エネミー、シナリオ本文、ハンドアウト、オンラインセッション用ツールの掲載
- キャラクターシート、ダイスローラー、戦闘支援、計算、保存、入力フォームなどのアプリケーション機能
- `/world`、`/character-making`、`/rules` のページ本体実装
- ゴールデンルールの別ページへの全文再掲
- 用語集専用ページ、検索、パンくず、前後ナビゲーション、アカウント、CMS、DB、SSR、API、PWA
- 新規依存パッケージ、独自contents Markdown parser、HTMLコメントdirective engine、Markdown pluginの追加
- Google Driveへの書込み、`.raw/contents/introduction.md` のGit管理化
- `docs/plan.md` の完了チェック更新
- `docs/out-of-scope.md` に定義される初期スコープ外項目

## 完了条件

- [x] `docs/design/introduction/` に、レビュー済みinitial draftの `notes.md`、desktop画像、mobile画像がある
- [x] `src/pages/introduction.mdx` があり、`/introduction` を静的ページとして表示できる
- [x] `.raw/contents/introduction.md` のfrontmatter、Markdown本文、HTMLコメント指示を必要な範囲で反映している
- [x] H1直下にページの役割を示す短い導入文があり、ゲーム概要・世界観を再掲していない
- [x] 必要なものに、各10個以上・20個程度推奨の10面体／6面体ダイスと、オンラインセッション推奨が表示される。未実装の `/support` へのリンクは表示しない
- [x] 基本用語がv1.0ルールブック準拠であり、判定数には常に10面体を使い、判定には6面体を使わないと表示される
- [x] ゴールデンルールの説明、4原則、端数処理が注意枠のCallout内に表示される
- [x] ゴールデンルールのHTML見出しが1つだけあり、H1→H2、PageToc、スクリーンリーダーの見出しナビゲーションを維持する
- [x] Calloutの可視titleとHTML見出しが同じゴールデンルールを表し、重複して読み上げられない。既定のCallout title仕様と既存CalloutのPageToc非混入を変えていない
- [x] `/support` を「次に読むページ」へ追加していない
- [x] 内部リンクがGitHub Pagesのsubpathで壊れない
- [x] desktopとmobileのVisual Review対象が追加され、designとの差異を確認している
- [x] 完成画面のスクリーンショットを取得し、design正本の更新可否をユーザーレビューへ提示している
- [x] 関連TODOを扱った結果と、Google Drive同期が未実行であることを記録している
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## チェックポイント

- [x] 既存ルート、トップページの `/introduction` 導線、SiteMenuの現在ページハイライトを壊していない
- [x] GitHub Pagesのsubpath公開に影響しない
- [x] frontmatterの `description` と `showPageToc` がページに反映される
- [x] `.raw/contents/introduction.md` のHTMLコメントや旧資料の画像記法を可視テキストとして描画していない
- [x] 旧資料の用語・ルールを現行要件やV1.5整理と矛盾する形で復元していない
- [x] GM専用のシナリオ、エネミー、運用情報をPL向け導入ページへ掲載していない
- [x] Calloutを見出しに変更しても、既存のCallout利用時のHTML構造・見た目・アクセシビリティを壊していない
- [x] `src/components/_common/Callout.astro` を変更した場合、`docs/design/callout/` の正本更新要否を確認している
- [x] 不要な依存関係や新規Componentを追加していない
- [x] 初期スコープ外の機能を実装していない
- [x] 関連する `docs/TODO.md` 項目と矛盾していない
- [x] `docs/design/global-styles/`、`docs/design/site-layout/`、`docs/design/callout/`、承認済みの `docs/design/introduction/` と矛盾していない
- [x] initial draftを未レビューのままdesign正本として扱っていない
- [x] implementation actual screenshotをユーザー承認なしにdesign正本へコピーしていない
- [x] ユーザーの未コミット変更を破壊していない

## 想定変更ファイル

- `docs/design/introduction/notes.md`
- `docs/design/introduction/design-desktop.png`
- `docs/design/introduction/design-mobile.png`
- `src/pages/introduction.mdx`
- 必要な場合のみ `src/components/_common/Callout.astro`
- `tests/visual/introduction.spec.ts`
- 必要最小限の既存visual設定またはテストファイル
- `docs/issue/20-2-introduction-page.md`

以下はGit管理外のローカル入力である。

- `.raw/contents/introduction.md`

## レビュー観点

- 導入ページがゲーム概要の再掲ではなく、ゲーム開始前の案内として成立しているか。
- 旧資料の基本用語を尊重しつつ、V1.5で廃止された旧称を混在させていないか。
- ゴールデンルールを導入の上位原則として置き、`/rules` との二重管理を避けられているか。
- Callout titleのH2化が、見た目のtitle重複を避けながらページ内目次と支援技術の見出し移動を維持できるか。
- 必要なもののダイス数、オンラインセッション推奨、`/support` の位置づけが適切か。
- `/support` の実装をこのissueへ混入させず、Phase 3末尾の別タスク `41-2-support-page` に残せているか。
- design initial draftを実装より前の別承認段階として扱う前提が適切か。
- 関連TODOのローカルコンテンツ作成ワークフロー確認を、このissueで回収してよいか。

## ビジュアルレビュー 1

### デザイン参照

- design target: `docs/design/introduction/`
- reference desktop: `docs/design/introduction/design-desktop.png`（`1440x1200` viewport）
- reference mobile: `docs/design/introduction/design-mobile.png`（`390x900` viewport）
- notes: Calloutを中心にしたviewport design。既存site-layoutとwarning Calloutの方向を保ち、可視titleは枠内の単一H2とする。

### 成果物

- actual desktop: `test-results/visual/introduction-desktop.png`
- actual mobile: `test-results/visual/introduction-mobile.png`
- existing Callout regression: `test-results/visual/callout-desktop.png`、`test-results/visual/callout-mobile.png`
- report: Playwright `@introduction` と `@callout` を対象に4件成功

### レビュー結果

| 領域                  | 判定 | 差分                                                                              | 対応 |
| --------------------- | ---- | --------------------------------------------------------------------------------- | ---- |
| レイアウト            | OK   | 実装は既存site-layoutを使い、designの中央本文・左右railの方向と一致する           | 不要 |
| 余白                  | OK   | Callout内外の余白は既存warning Calloutとproseの余白に一致する                     | 不要 |
| タイポグラフィ        | OK   | Callout titleは枠内の単一H2で、枠外への同名H2重複はない                           | 不要 |
| 色                    | OK   | 既存warning token、左線、markerを維持する                                         | 不要 |
| 配置・整列            | OK   | desktop・mobileともCallout内のtitle、本文、番号リストが崩れない                   | 不要 |
| レスポンシブ          | OK   | `1440x1200` と `390x900` で確認。mobile目次の開閉後もCalloutを隠さず撮影した      | 不要 |
| overflow / scroll     | OK   | desktop・mobileのVisual testで横overflowなし                                      | 不要 |
| 既存デザインとの整合  | OK   | 通常本文ページのまま、ゴールデンルールだけをwarning Calloutで識別する             | 不要 |
| 既存Componentとの整合 | OK   | 既定Calloutは既存のspan titleを維持し、`titleAsHeading`を指定した場合だけH2になる | 不要 |
| accessibility basics  | OK   | H1→H2の順序、単一のゴールデンルールH2、PageTocとMobilePageTocの導線を確認した     | 不要 |

### 自己修正した項目

- [x] mobile Visual testで目次内容を確認した後にoverlayを閉じ、Calloutが隠れない状態を撮影するよう修正した。

### 人間判断が必要な差分

- ユーザーが実装スクリーンショットのdesign正本化を承認したため、`docs/design/introduction/` へ反映済み。

### design-image-generation への引き継ぎ候補

- [x] ユーザー承認済みのdesign fix modeで、actual screenshotを`docs/design/introduction/`の正本画像へ更新した。

### 対応完了チェックリスト

- [x] desktop screenshot を取得した
- [x] mobile screenshot を取得した
- [x] reference と actual を比較した
- [x] 明らかな visual mismatch を修正した、または修正不要と判断した
- [x] ユーザー承認済みのdesign fix modeでdesign正本を更新した
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## 備考

- mode: local repository mode
- branch: `20-2-introduction-page`
- `.tmp/review/20-2-introduction-page/` は作成済み。
- `docs/design/introduction/` はinitial draftを経て、ユーザー承認済みのdesign fix modeでactual screenshotを正本化した。
- `docs/requirements/pages.md`、`docs/plan.md`、`docs/TODO.md` の責務整理は、issue作成前にユーザーが明示した指示を反映済みである。変更記録は `.tmp/review/20-2-introduction-page/user-directed-changes.md` にある。
- `.raw/contents/introduction.md` はGoogle Driveへ同期していない。同期は `raw-to-drive-sync` の明示指示がある場合に限る。
