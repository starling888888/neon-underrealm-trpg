# ex-01-page-navigation-links

## 目的

スマホでルールサイトを読み進めるPLが、サイトメニューを開き直さずに次のページまたは前のページへ移動できるようにする。

1st stepの目的である「初回告知を見た人がなるべく長くサイトを読み、遊んでみたいと思えること」に対し、ルール本文とデータをサイトメニュー順に連続して読める導線を追加する。

## 背景

`docs/plan.md` の `ex-01-page-navigation-links` は、ページ下部に前ページ・次ページへのナビゲーションリンクを追加するtaskである。

対象ページは、サイトメニューの順序で `/introduction` から `/advancement` までとする。親ページ、子ページ、孫ページを、親ページの直後にその子孫をたどる順序で扱う。

`docs/requirements/layout-navigation.md` の FR-01-07 は、読書順を定義するページの本文末尾に前ページ・次ページへのリンクを表示し、スマホでも十分なタップ領域と視認性を確保することを定める。

`.raw/contents/data.md` と `.raw/contents/items.md` には、ページ末尾の前後ナビゲーションを置かない旧指示がある。今回のユーザー最新指示は両ページを対象に含めるため、この機能に限りその旧指示を上書きする。`.raw/` のユーザー編集正本はこのissueでは変更しない。

関連TODOはない。

## 対象範囲

- `AppContainer` に任意の `prevPath` / `nextPath` propsを追加する。
  - propsの値はパス文字列とする。
  - `siteMenuItems` を親・子・孫の順に再帰的に平坦化し、`href` と `label` の配列からパスに対応するサイトメニュー表示名を解決する。
  - 指定されたパスが平坦化したサイトメニューに存在しない場合、および同じ `href` が重複する場合は、build時にエラーとする。
  - propsが渡されなかった場合は、該当するリンクを表示しない。
  - ナビゲーションは各ページ本文の直後、Footerの前に表示する。
- MDXページでは、frontmatterの `prevPath` / `nextPath` から `AppContainer` へ値を渡す。
- Astroページでは、各ページが `AppContainer` へ `prevPath` / `nextPath` を明示して渡す。
- ユーザー指示により、長い両リンクラベルを同時に確認する公開対象外の `/-local/page-navigation` を追加する。
  - `prevPath` は `/character-making`、`nextPath` は `/advancement` とする。
  - PageTocありのlayoutを使い、確認用本文は`h1`だけを置く。目次項目となる`h2`以下は置かない。
  - `build:public` では既存の `-local` 除外処理により公開しない。
- 対象ページごとの前後関係は、共通configへ集約せず、各ページで愚直に設定する。
- 流儀詳細と生き様詳細だけは、それぞれの一覧データから前後関係を生成する。
  - `getRyugiList()` と `getIkizamaList()` の順序を使う。
  - 一覧ページ自身と各詳細ページは、サイトメニューの親・子・孫の順に接続する。
- 読書順の始端と終端は以下とする。
  - `/introduction` は `prevPath` を持たず、`nextPath` を `/world` とする。
  - `/advancement` は `prevPath` を `/data/items/drugs` とし、`nextPath` を持たない。
  - 読書順の外側にあるページへの前後リンクを作らない。
- 対象ページは以下とする。
  - `/introduction`
  - `/world`
  - `/character-making`
  - `/rules`
  - `/rules/scenario-play`
  - `/rules/battle`
  - `/data`
  - `/data/ryugi` と各 `/data/ryugi/[ryugiId]`
  - `/data/ikizama` と各 `/data/ikizama/[ikizamaId]`
  - `/data/common-skills`
  - `/data/items`
  - `/data/items/weapons`
  - `/data/items/armors`
  - `/data/items/omamori`
  - `/data/items/cybernetics`
  - `/data/items/nanomachines`
  - `/data/items/drugs`
  - `/advancement`
- 実装前に `design-image-generation` のinitial draft modeで、以下を作成する。
  - `docs/design/page-navigation-links/notes.md`
  - `docs/design/page-navigation-links/design-desktop.png`
  - `docs/design/page-navigation-links/design-mobile.png`

## 初期スコープ外

- トップページ `/`、更新履歴 `/release-notes`、サポート `/support`、Webキャラクターシート `/character-sheet`、404ページ `/404` に前後ナビゲーションを追加しない。
- `siteMenuItems` または別の共通configから、対象ページ全体の前後関係を生成しない。サイトメニューの表示名を解決するための平坦化・検索だけは行う。
- 流儀詳細と生き様詳細以外で、前後関係の自動生成処理を作らない。
- サイトメニュー、ページ内目次、パンくずリスト、検索UIの機能や並び順を変更しない。
- ダイスローラー、キャラクター作成ウィザード、永続保存、DB、認証、SSR、CMSを追加しない。
- 初期スコープ外の項目は `docs/out-of-scope.md` に従う。

## 完了条件

- [x] `AppContainer` が `prevPath` / `nextPath` を任意propsとして受け取り、未指定のリンクを表示しない。
- [x] サイトメニューを親・子・孫の順に平坦化した `href` と `label` の配列から、各pathのリンク表示名を解決する。
- [x] 存在しないpathまたは重複する `href` が指定・検出された場合、build時にエラーとなる。
- [x] ナビゲーションが対象ページの本文直後かつFooterの前に表示される。
- [x] MDXページがfrontmatterの `prevPath` / `nextPath` を使う。
- [x] Astroページが各ページで前後関係を明示して渡す。
- [x] 流儀詳細と生き様詳細が、それぞれの一覧データ順で前後ページを生成する。
- [x] 対象ページが、サイトメニューの親・子・孫を含む深さ優先順で連続する。
- [x] `/introduction` は前ページを表示せず、`/world` への次ページリンクだけを表示する。
- [x] `/advancement` は `/data/items/drugs` への前ページリンクだけを表示し、次ページを表示しない。
- [x] 対象外ページには前後ナビゲーションを表示しない。
- [x] GitHub Pagesのサブパス配下でもリンク先へ遷移できる。
- [x] `docs/design/page-navigation-links/` のdesign正本を参照し、desktop・mobileの見た目を確認する。
- [x] 実装後のdesktop・mobile actual screenshotを取得し、initial designと比較する。
- [x] actual screenshotを自動でdesign正本として扱わず、正本化が必要な場合はユーザーの明示承認後に `design-image-generation` のdesign fix modeへ引き継ぐ。
- [x] `npm test` が通る。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## チェックポイント

- [x] 既存ルート、サイトメニュー、ページ内目次、検索UIが壊れていない。
- [x] 前後ナビゲーションがスマホで十分なタップ領域と視認性を持ち、サイトメニュー・ページ内目次と役割が混同されない。
- [x] `withBase` 等の既存path utilityを使い、GitHub Pagesのサブパス公開に影響しない。
- [x] 不要な依存関係とクライアントJSを追加していない。
- [x] 初期スコープ外の機能を実装していない。
- [x] 関連する `docs/TODO.md` 項目と矛盾していない。
- [x] `docs/design/page-navigation-links/` をinitial draftのまま実装正本として扱わず、ユーザー承認後に使用する。
- [ ] planの「完成画面のスクリーンショットを取得し、design正本を更新する」は、Visual Reviewとユーザー承認を経て確認する。承認待ちの場合は未チェックのまま残す。
- [x] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `src/layouts/AppContainer.astro`
- `src/layouts/MDXLayout.astro`
- `src/components/layout/` 配下の前後ナビゲーションComponent
- 対象となる `src/pages/**/*.mdx` と `src/pages/**/*.astro`
- `src/pages/data/ryugi/[ryugiId].astro`
- `src/pages/data/ikizama/[ikizamaId].astro`
- `src/pages/-local/page-navigation.astro`
- 前後関係を検証するtest
- `docs/design/page-navigation-links/`
- `docs/issue/ex-01-page-navigation-links.md`

## レビュー観点

- 対象ページと対象外ページの境界が、サイトメニュー順およびユーザー指定どおりか。
- 親・子・孫を含む深さ優先順が、実際のサイトメニューと一致するか。
- 各ページに設定を明示する方針と、流儀詳細・生き様詳細だけを一覧データから生成する例外が守られているか。
- `prevPath` / `nextPath` の指定だけで、対応するサイトメニュー項目の表示名が解決されるか。存在しないpathや重複hrefを見逃さないか。
- `prevPath`、`nextPath` のprops名が既存の型・コンポーネントと整合するか。
- design image generationを実装前の独立した前提作業として扱う範囲が適切か。

## 備考

- `docs/design/base-layout/`、`docs/design/site-layout/`、`docs/design/page-toc/`、`docs/design/mobile-page-toc/`、`docs/design/site-menu/` は、既存のlayout・ナビゲーションとの役割差を確認する参考資料とする。前後ナビゲーション専用のdesign targetとdesign画像は未作成である。
- `docs/requirements/architecture.md` のAC-01に従い、静的ホスティングで成立する実装にする。
- 前後関係testは、静的ページの順序、流儀・生き様の一覧データ順、両データ群の境界接続、`/introduction` と `/advancement` の片側リンク非表示を確認する。
- リンクラベルは、平坦化したサイトメニューから対応する表示名を解決する。流儀・生き様詳細も同じ解決処理を使う。

## ビジュアルレビュー 1

### デザイン参照

- design target: `docs/design/page-navigation-links/`
- reference desktop: `docs/design/page-navigation-links/design-desktop.png`
- reference mobile: `docs/design/page-navigation-links/design-mobile.png`
- notes: 枠なしのリンク文字列と横向き三角を使い、リンク文字列だけに下線を付ける。本文と同じ白い背景に、区切り線・見出しを置かない。

### 成果物

- actual desktop: `test-results/visual/page-navigation-desktop.png`
- actual mobile: `test-results/visual/page-navigation-mobile.png`
- report: `test-results/visual/capture-manifest.json`

### レビュー結果

| 領域                  | 判定 | 差分                                                           | 対応 |
| --------------------- | ---- | -------------------------------------------------------------- | ---- |
| レイアウト            | OK   | 本文直後・Footer前に配置                                       | -    |
| 余白                  | OK   | 本文面を余白で接続                                             | -    |
| タイポグラフィ        | OK   | 本文フォントサイズで長いラベルも単一行                         | -    |
| 色                    | OK   | 青緑のリンク・icon                                             | -    |
| 配置・整列            | OK   | 前リンクを左、次リンクを右へ配置                               | -    |
| レスポンシブ          | OK   | 390px幅で両リンクを表示                                        | -    |
| overflow / scroll     | OK   | horizontal overflowなし                                        | -    |
| 既存デザインとの整合  | OK   | Header、Footer、本文面を変更しない                             | -    |
| 既存Componentとの整合 | OK   | `AppContainer`と既存path utilityを使用                         | -    |
| accessibility basics  | OK   | `nav`のaria-label、リンクテキスト、装飾iconのaria-hiddenを設定 | -    |

### 自己修正した項目

- [x] global link styleがiconへ適用する下線を解除し、labelだけへ下線を適用した。
- [x] link文字列を本文フォントサイズへ変更し、390px幅のワールドガイド・ドラッグでも折り返し・横overflowがないことを確認した。

### 人間判断が必要な差分

- なし。

### design-image-generation への引き継ぎ候補

- [ ] 実装スクリーンショットをdesign正本化する必要がある場合は、design fix modeへ引き継ぐ

### 対応完了チェックリスト

- [x] desktop screenshot を取得した
- [x] mobile screenshot を取得した
- [x] reference と actual を比較した
- [x] 明らかな visual mismatch を修正した、または修正不要と判断した
- [x] design正本の更新が必要な場合は、人間判断項目として記録した
- [x] `npm run check` が通る
- [x] `npm run build` が通る
