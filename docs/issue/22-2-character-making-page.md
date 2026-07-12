# 22-2-character-making-page

## 目的

`/character-making` に、仕事人を作るための基本要素、初期縁、コンストラクション、フルスクラッチの手順を掲載する静的なキャラクターメイキングページを作成する。読者がキャラクターシートを用意して、本文とデータ参照導線を使いながら作成手順を追える状態にする。

## 背景

`docs/plan.md` の `22-2-character-making-page` は、初期公開範囲のキャラクターメイキングページを作るタスクである。ローカル作業入力 `.raw/contents/character-making.md` は、ユーザーフィードバックと2回のコンテンツレビューを反映済みである。

ページは、キャラクター作成を補助するアプリケーションではなく、作成手順とデータ参照を提供する静的なルール本文として実装する。

参照する正本・資料:

- `docs/requirements/pages.md`
- `docs/requirements/components.md`
- `docs/requirements/non-functional.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- `.raw/contents/character-making.md`
- `docs/design/global-styles/notes.md`
- `docs/design/site-layout/notes.md`
- `docs/design/callout/notes.md`
- `src/pages/introduction.mdx`
- `src/pages/world.mdx`

## 対象範囲

- `src/pages/character-making.mdx` を作成し、`MDXLayout`、ページ固有の`title`・`description`、`showPageToc: true`を設定する。
- `.raw/contents/character-making.md` のfrontmatter、Markdown本文、HTMLコメントの指示をもとに、次を順に配置する。
  - キャラクターの基本要素、能力値、流儀と生き様、格、スキル、副能力値、アイテム、技能、縁
  - 初期縁のRoC方式と一覧表
  - コンストラクションの能力値配分、スキル、共通スキルボーナス、最大体力・最大精神力、アイテム、得意技能の手順
  - フルスクラッチの経験点配分、共通スキル上限、最大体力・最大精神力、アイテム、得意技能の手順
- 既存の`Callout`を使い、contentsの指示どおり`tip`、`example`、`warning`のCalloutを表示する。各Calloutのタイトルは通常のラベルとし、ページ内目次へ追加しない。
- 既存の`InternalLink`を用い、contentsで指定された`/data/ryugi`、`/data/ikizama`、`/data/common-skills`、`/data/items`、`/rules`への参照導線を配置する。未実装の参照先は将来routeへのリンクとして残し、このissueで新設しない。
- 既存の`site-layout`、PageToc、MobilePageToc、Callout designを保ったdesktop・mobileの画面を確認し、Visual Reviewを行う。
- ユーザー指定により、実装前の`design-image-generation` initial draftは作成しない。実装後の画面スクリーンショットとdesign正本化の扱いは、`docs/plan.md`の完了条件およびVisual Reviewの結果に従って人間確認を受ける。

## 初期スコープ外

- キャラクター作成ウィザード、能力値・副能力値の自動計算、スキル・アイテムの選択支援、入力フォーム、保存機能、Webキャラクターシートを作らない。
- ダイスローラー、戦闘シミュレーター、検索、パンくず、前後ナビゲーションを追加しない。
- 流儀、生き様、共通スキル、アイテム、ルールの詳細ページやデータ表示Componentを新規作成・変更しない。
- Header、Footer、SiteMenu、PageToc、MobilePageToc、Calloutの設計・実装を変更しない。
- 新しいnpm package、CMS、DB、認証、SSR、API、PWAを追加しない。
- `.raw/contents/character-making.md`をGoogle Driveへ同期しない。

## 完了条件

- [x] `/character-making` のMDXページがあり、`title`、`description`、`showPageToc: true`を設定している。
- [x] `.raw/contents/character-making.md` の作成手順、初期縁表、能力値・副能力値・格・スキル・アイテム・技能・縁の説明を、意味を変えずに掲載している。
- [x] コンストラクションとフルスクラッチの手順、能力値・経験点・最大体力・最大精神力の例を掲載している。
- [x] `tip`、`example`、`warning`のCalloutを既存Componentで表示し、Calloutタイトルが不要にPageTocへ入らない。
- [x] contentsで指定されたデータ・ルール参照導線を`InternalLink`で配置し、GitHub Pagesのbase pathを通している。
- [x] 未実装の`/data/ryugi`、`/data/ikizama`、`/data/common-skills`、`/rules`は将来routeへのリンクとして残し、このissueで新設していない。
- [x] 未実装の参照先をこのissueで新設していない。
- [x] キャラクター作成ウィザード、自動計算、入力フォーム、保存機能を実装していない。
- [x] desktop / mobileで本文、表、Callout、PageToc / MobilePageTocに横overflowや見出し構造の破綻がないことをVisual Reviewで確認している。
- [x] 実装後のスクリーンショット取得とdesign正本化の要否を記録し、design正本を更新する場合はユーザー確認済みのdesign fix modeで行っている。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## チェックポイント

- [x] 既存ルートが壊れていない。
- [x] GitHub Pagesのサブパス公開でページと内部リンクが壊れない。
- [x] 表、Callout、リンクがdesktop / tablet / mobileで横overflowしない。
- [x] H1から始まる見出し階層が不自然に飛ばず、既存PageToc / MobilePageTocが本文見出しを扱える。
- [x] Calloutは色だけに依存せず、既存のラベルと記号マーカーを維持する。
- [x] ページ固有の画像、画像生成、ヒーロー表現を追加していない。
- [x] 不要な依存関係を追加していない。
- [x] 初期スコープ外のキャラクター作成支援機能を実装していない。
- [x] 関連する`docs/TODO.md`項目と矛盾していない。
- [x] `docs/design/global-styles/`、`docs/design/site-layout/`、`docs/design/callout/`と矛盾していない。
- [x] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `docs/issue/22-2-character-making-page.md`
- `src/pages/character-making.mdx`
- 必要に応じて`tests/visual/character-making.spec.ts`
- 必要に応じてVisual Reviewとユーザー確認後の`docs/design/character-making/`配下の正本

## レビュー観点

- `.raw/contents/character-making.md`のHTMLコメントにあるCallout種別・タイトル・対象範囲を、既存`Callout`の仕様に正しく対応付けられているか。
- 基本要素、初期縁、コンストラクション、フルスクラッチを上から読んだときに、キャラクター作成の手順として迷わず追えるか。
- 移動力、行動値、防御力、ダメージ軽減の決定方法と、最大体力・最大精神力の決定手順が矛盾なく読めるか。
- 既存layout内で長い表とCalloutがdesktop / mobileとも読みやすく、横overflowしないか。
- contentsで指定された内部リンクが`InternalLink`を用い、base pathと整合しているか。未実装4 routeは将来routeへのリンクとして残り、このissueで新設していないか。
- 自動計算、入力フォーム、保存などの初期スコープ外機能を混入させていないか。
- 実装前design draftを作らないというユーザー指定を守りつつ、実装後のVisual Reviewとdesign正本化の判断を適切に残せているか。

## 備考

- 関連TODOに、このページへ直接対応する項目はない。`/support`、データ正規化、CIなどの既存TODOは本issueで回収しない。
- `.raw/contents/character-making.md`はGit管理外のローカル作業入力であり、Google Driveへの書込みは`raw-to-drive-sync`の明示指示があるまで行わない。
- contents内で参照先として指定されたうち、`/data/items`は実装済みである。`/data/ryugi`、`/data/ikizama`、`/data/common-skills`、`/rules`は未実装だが、ユーザー指示により将来routeへの内部リンクとして残す。このページの実装だけで完結させ、参照先の新設は後続taskで扱う。
- `docs/plan.md`の「designを生成する」は、ユーザーの明示指示により実装前のinitial draftをスキップする。実装後のVisual Reviewとdesign正本化は別の判断として扱う。

## ビジュアルレビュー 1

### デザイン参照

- design target: `docs/design/character-making/`、`docs/design/site-layout/`、`docs/design/callout/`
- reference desktop: `docs/design/site-layout/design-desktop.png`、`docs/design/callout/design-desktop.png`
- reference mobile: `docs/design/site-layout/design-mobile.png`、`docs/design/callout/design-mobile.png`
- notes: ページ固有のinitial draftはユーザー指示により作成しない。既存site layoutとCalloutの正本を比較基準とし、実装actualはユーザー承認済みのdesign fixでページ固有の正本へ反映する。

### 成果物

- actual desktop: `test-results/visual/character-making-desktop.png`
- actual mobile: `test-results/visual/character-making-mobile.png`
- report: `tests/visual/character-making.spec.ts`

### レビュー結果

| 領域                  | 判定 | 差分                                                                    | 対応 |
| --------------------- | ---- | ----------------------------------------------------------------------- | ---- |
| レイアウト            | OK   | 既存site layout内で本文、表、PageTocが成立する。                        | 不要 |
| 余白                  | OK   | 表、Callout、手順の間隔は既存proseとCalloutの間隔を使う。               | 不要 |
| タイポグラフィ        | OK   | H1からH3までで作成手順を追え、Calloutタイトルは見出しにしない。         | 不要 |
| 色                    | OK   | 本文はneutral、Calloutは既存のtip、example、warningの色とラベルを使う。 | 不要 |
| 配置・整列            | OK   | 初期縁表、能力値表、経験点表が本文カラムに収まる。                      | 不要 |
| レスポンシブ          | OK   | mobileでMobilePageToc triggerと本文が成立する。                         | 不要 |
| overflow / scroll     | OK   | desktop / mobileのVisual testでdocument横overflowがない。               | 不要 |
| 既存デザインとの整合  | OK   | site-layoutとcalloutの正本に整合する。                                  | 不要 |
| 既存Componentとの整合 | OK   | `Callout`と`InternalLink`を既存仕様どおり使う。                         | 不要 |
| accessibility basics  | OK   | 見出し階層、Calloutのラベル・記号、内部リンクを確認した。               | 不要 |

### 自己修正した項目

- [x] 重複する「2. 能力値を決める」見出しに`data-anchor-id`を指定し、PageTocのbuild時ID衝突を解消した。
- [x] Visual testの内部リンク検証を本文領域に限定し、SiteMenuの同名リンクを数えないようにした。

### 人間判断が必要な差分

- なし。ユーザー承認により、実装actualをdesign fixとして正本化する。

### design-image-generation への引き継ぎ候補

- [x] ユーザー承認により、`test-results/visual/character-making-desktop.png`と`character-making-mobile.png`を`docs/design/character-making/`のdesign正本へ反映する。

### 対応完了チェックリスト

- [x] desktop screenshot を取得した
- [x] mobile screenshot を取得した
- [x] reference と actual を比較した
- [x] 明らかな visual mismatch を修正した、または修正不要と判断した
- [x] ユーザー承認済みのdesign正本化を`design-image-generation`のdesign fix modeで反映する
- [x] `npm run check` が通る
- [x] `npm run build` が通る
