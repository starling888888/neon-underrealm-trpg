# 32-2-ikizama-detail-page

## 目的

変換済みの生き様データと生き様スキルデータから、各生き様の詳細を静的生成する
`/data/ikizama/[ikizamaId]` を1つのAstroテンプレートとして実装する。

## 背景

`docs/plan.md` の `32-2-ikizama-detail-page` は、生き様詳細ページを共通テンプレートから生成し、
生き様説明、生き様データ、生き様スキル一覧、専用アイテムリンクを表示することを
求めている。

ユーザー編集済みの `.raw/contents/ikizama-detail.md` は、ページ本文と可視構成の最優先正本である。
H1直後に生き様ごとのheroを置き、`生き様データ`（H3の`生き様ボーナス`、`能力値ポイント`、`副能力係数`）、
`生き様スキル`、`専用アイテム` の順で表示する。desktopでは生き様ボーナス、能力値ポイント、副能力係数を
この順の1行3列、mobileでは生き様ボーナスと能力値ポイントを上段2列、副能力係数を下段の全幅で表示する。
従来の `専用ルール`、`関連アイテム`、`関連ページリンク` の表示指示は
contentsと矛盾するため、このissue作成時に `docs/plan.md` と `docs/requirements/pages.md` をcontentsへ
整合させる。

`getIkizamaDetail(ikizamaId)` は生き様基礎情報とカテゴリ別スキルを返す。専用アイテムは
`ikizama.exclusiveItem` のアイテム種別であり、個別アイテムや個別アンカーではない。各生き様のhero画像は
`public/images/data/ikizama/<ikizamaId>_hero.webp` にある。

関連資料:

- `.raw/contents/ikizama-detail.md`
- `docs/requirements/pages.md` の FR-06
- `docs/requirements/data-display.md` の FR-04-01、FR-04-04
- `docs/requirements/architecture.md` の AC-14、AC-15
- `docs/conversion/ikizama-index.md`
- `docs/conversion/ikizama-skills.md`
- `docs/design/site-layout/`
- `docs/design/page-toc/`
- `docs/design/skill-card/`

`docs/design/ikizama-detail/` は未作成である。UI実装前に `design-image-generation` のinitial draft modeで
同targetのdesign正本候補を作成し、ユーザーが確認できる状態にする。

## 対象範囲

- `docs/design/ikizama-detail/` のdesign notesとdesktop / mobile design画像を、実装前提として作成・確認する
- `src/pages/data/ikizama/[ikizamaId].astro` を追加し、生き様IDごとの静的ページを共通テンプレートから生成する
- `src/lib/data/ikizama-detail.ts` の `getIkizamaDetail(ikizamaId)` と既存の変換済みJSONを表示に利用する
- 生き様データを再利用可能なコンポーネントにする。生き様IDをキーに、生き様ボーナス、能力値ポイント、副能力係数を
  表示する値を渡し、生き様一覧の凡例にも利用できるよう、詳細ページ固有のhero、説明、基本・上級スキル一覧、専用アイテムへ
  依存させない
- `.raw/contents/ikizama-detail.md` のfrontmatter、Markdown本文、HTMLコメント指示を実装へ反映する
- `public/images/data/ikizama/<ikizamaId>_hero.webp` を各生き様詳細ページのhero画像として利用する
- H1に `生き様：${ikizama.name}` を表示し、`ikizama.description`、任意の `ikizama.note`、`ikizama.attributePoints`、
  `ikizama.secondaryAttributeCoefficients` を表示する
- `ikizama.note` がある場合は既存の `Callout` へ `type` と `content` を渡し、ない場合はCalloutを出力しない
- `skills.bonus` の先頭要素だけを、生き様データ内のH3 `生き様ボーナス` として `SkillCard` で表示する
- `skills.basic`、`skills.advanced` を `生き様スキル` 内にこの順で `CardContainer` と `SkillCard` を使って表示する。
  カテゴリ内の配列順を変えず、空のカテゴリでは対応する見出しとカード一覧を出力しない
- スキルカードの個別アンカーには生成済みスキルIDを使い、カードへID・所属・区分を可視表示しない
- `ikizama.exclusiveItem.name` をリンク文言にして、種別IDに対応するアイテム一覧へリンクする。個別アイテム、
  Item ID、個別ItemCardのアンカーは追加しない
- designに対する実装後のVisual Reviewを行い、このissueのVisual Review記録を更新する
- Visual Testはローカルの画面構造、responsive layout、横overflow、スクリーンショット取得だけを確認し、
  外部データの固有の文言、値、件数、本文内容へ依存するE2E期待値を追加しない

## 初期スコープ外

- 生き様データ・生き様スキルデータのExcel変換、生成JSON、schema、取得層の変更
- 個別生き様ごとのページファイル複製、手書きの生き様・スキルデータ
- 生き様一覧ページ、サイドメニューへの生き様一覧追加、流儀詳細ページ
- 専用アイテムの実体データ、個別アイテムページ、個別ItemCard、個別アイテムアンカー、アイテム種別固有の
  ルール本文の追加
- 検索、絞り込み、ソート、ページネーション、詳細遷移、クライアント状態管理
- キャラクター作成ウィザード、能力値・ボーナスの自動計算、ダイスローラー、キャラクターシート
- 新しいUIライブラリ、DB、認証、SSR、CMS、APIサーバー
- Header、Footer、SiteMenu、PageToc、MobilePageToc、`CardContainer` の再設計

## 完了条件

- [x] `design-image-generation` initial draft modeで `docs/design/ikizama-detail/notes.md`、
      `design-desktop.png`、`design-mobile.png` を作成し、実装前の比較対象を記録している
- [x] `/data/ikizama/[ikizamaId]` が既存生き様IDごとに静的生成され、個別ページファイルを複製していない
- [x] 生き様データが、生き様IDをキーに渡す生き様ボーナス、能力値ポイント、副能力係数を受け取る再利用可能なコンポーネントになっており、
      詳細ページ固有のhero・説明・基本・上級スキル一覧・専用アイテムへ依存していない
- [x] 生き様データコンポーネントはdesktopで生き様ボーナス、能力値ポイント、副能力係数の1行3列、mobileで
      生き様ボーナスと能力値ポイントの上段2列および副能力係数の下段全幅として表示する
- [x] 各ページで、生き様名、説明、任意の補足、hero、生き様ボーナス、能力値ポイント、副能力係数、
      生き様スキル一覧、専用アイテムリンクをcontentsの見出し順で表示する
- [x] hero画像と代替テキストが、対象生き様を誤認させず、desktop / mobileで破綻なく表示される
- [x] `ikizama.note` がある場合は既存 `Callout` のtypeと本文を反映し、ない場合は空のCalloutを表示しない
- [x] 生き様ボーナスはH3とし、`skills.bonus` の先頭要素だけを表示する。生き様スキルは`basic`、`advanced` の順と
      カテゴリ内の配列順を保つ。`bonus`、`basic`、`advanced` の空カテゴリは見出しや空一覧を表示しない
- [x] 専用アイテムリンクが種別IDの固定対応を使い、個別Item ID・個別アンカーを追加しない
- [x] 既存の `SkillCard` と `CardContainer` の表示契約、SiteMenu、PageToc、MobilePageTocを壊していない
- [x] 実装後のVisual Reviewでdesignとの具体的な差分を確認し、必要な修正と結果をこのissueへ記録している
- [x] 関連TODOを扱った場合は対応結果を記録し、扱わない関連TODOは未対応理由を記録している
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## チェックポイント

- [x] `getIkizamaDetail(ikizamaId)` が存在する生き様とスキルデータだけを共通テンプレートへ渡している
- [x] GitHub Pagesのサブパス配下で、hero画像、専用アイテムリンク、スキルカード個別アンカーが壊れない
- [x] `ikizama.note` がある生き様では既存Calloutのtypeと本文を反映し、ない生き様では空のCalloutを表示しない
- [x] 生き様ボーナスはH3としてカテゴリ全体を重複表示せず、contents指定どおり`skills.bonus`の先頭要素だけを表示する
- [x] Visual Test対象のdesktop `1440px`、tablet `820px`、mobile `390px`で、長い説明、補足、係数表、
      長いスキル本文に横overflowや切り詰めがない
- [x] 生き様データコンポーネントがdesktop `1440px`では生き様ボーナス、能力値ポイント、副能力係数の順で1行3列、mobile `390px`では前2者の上段2列と副能力係数の下段全幅で表示される
- [x] desktopでは既存の `CardContainer`、mobileでは既存の2列配置を維持する
- [x] Visual Testは外部データの固有内容へ依存せず、画面構造、responsive layout、横overflow、
      スクリーンショット取得だけを確認する
- [x] 不要な依存関係を追加していない
- [x] 初期スコープ外の機能を実装していない
- [x] サイドメニューの生き様リスト表示TODOは、一覧ページまたはナビゲーション補完タスクの責務として未対応のまま維持している
- [x] `docs/design/site-layout/`、`docs/design/page-toc/`、`docs/design/skill-card/` と、作成する
      `docs/design/ikizama-detail/` に矛盾していない
- [x] ユーザーの未コミットのhero画像とcontents修正を破壊していない

## 想定変更ファイル

- `.raw/contents/ikizama-detail.md`
- `public/images/data/ikizama/*.webp`
- `docs/design/ikizama-detail/notes.md`
- `docs/design/ikizama-detail/design-desktop.png`
- `docs/design/ikizama-detail/design-mobile.png`
- `src/pages/data/ikizama/[ikizamaId].astro`
- `src/components/data/IkizamaDataSection.astro`
- `tests/visual/ikizama-detail.spec.ts`
- `docs/plan.md`
- `docs/requirements/pages.md`
- `docs/issue/32-2-ikizama-detail-page.md`

## レビュー観点

- `.raw/contents/ikizama-detail.md` のH1、hero、生き様データ内のH3生き様ボーナス・能力値ポイント・副能力係数、
  生き様スキル、専用アイテムの構成が過不足なく実装要件へ対応しているか
- `skills.bonus` の先頭要素だけを表示する指定と、`basic`、`advanced` の表示順・空カテゴリ非表示が
  レビュー可能か
- 専用アイテムを種別リンクだけに留め、個別アイテムやアイテム種別固有ルールを混在させない範囲が適切か
- design画像作成をこのissueの実装前提として扱い、既存のlayout / PageToc / SkillCard正本を再設計しない範囲になっているか
- 関連TODOを本issueで回収せず、一覧・ナビゲーションの後続作業へ残す判断が適切か

## 備考

- ローカルissue作成時点で `docs/design/ikizama-detail/` は存在しない。ユーザーによるdesign作成の明示指示があるまで、design画像は生成しない。
- ユーザー確認済み: 生き様ボーナス、能力値ポイント、副能力係数は `生き様データ` 内に置く。生き様ボーナスはH3とし、
  desktopはこの順の1行3列、mobileは生き様ボーナスと能力値ポイントの上段2列および副能力係数の下段全幅とする。
  `skills.bonus` が空の場合は生き様ボーナスのH3とカードを表示しない。可視H1は `生き様：{名称}` とする。
- `public/images/data/ikizama/*.webp` と `public/images/data/ikizama_hero.webp` はユーザーの未追跡画像であり、
  本issueでは表示に利用するが、変更・削除・commit対象には含めない。
- `docs/TODO.md` の「生成JSONとデータ取得層ができた後、サイドメニューに流儀リストと生き様リストを表示する」は、
  生き様詳細ページのナビゲーション変更を求めるものではないため本issueでは扱わない。
- 関連するアイテム種別ページは後続taskで実装する。リンク先の種別対応は既存変換仕様に従い、このissueで
  アイテム実体やリンク先の存在検証を追加しない。
- `docs/conversion/ikizama-index.md` と `docs/conversion/ikizama-skills.md` の「関連アイテム」は、
  `exclusiveItem`をアイテム種別とし種別一覧へリンクするデータ契約を指す。contentsの専用アイテム指示と矛盾しないため変更しない。
  `docs/plan-done.md` と `docs/issue/done/` の過去時点の記録は履歴として保持し、現行要件の正本にはしない。

## ビジュアルレビュー 1

### デザイン参照

- design target: `docs/design/ikizama-detail/`
- reference desktop: `docs/design/ikizama-detail/design-desktop.png`
- reference mobile: `docs/design/ikizama-detail/design-mobile.png`
- notes: `docs/design/ikizama-detail/notes.md`。既存`SkillCard`の可変高さと、実データによるカード件数・本文量は許容差分とする。

### 成果物

- actual desktop: `test-results/visual/ikizama-detail-desktop.png`
- actual mobile: `test-results/visual/ikizama-detail-mobile.png`
- report: `test-results/visual/capture-manifest.json`

### レビュー結果

| 領域                  | 判定 | 差分                                                | 対応     |
| --------------------- | ---- | --------------------------------------------------- | -------- |
| レイアウト            | OK   | 指定した3列・2行構成を維持                          | 修正不要 |
| 余白                  | OK   | 実データのSkillCard高さに伴う縦方向の差分は許容範囲 | 修正不要 |
| タイポグラフィ        | OK   | H3の生き様ボーナスを含む既存見出し階層を維持        | 修正不要 |
| 色                    | OK   | 既存の本文色、border、青緑accentを維持              | 修正不要 |
| 配置・整列            | OK   | desktopはボーナス、ポイント、係数の1行3列           | 修正不要 |
| レスポンシブ          | OK   | mobileはボーナス・ポイントの上段2列と係数の下段全幅 | 修正不要 |
| overflow / scroll     | OK   | desktop / mobileのVisual Testで横overflowなし       | 修正不要 |
| 既存デザインとの整合  | OK   | site layout、PageToc、hero表示を維持                | 修正不要 |
| 既存Componentとの整合 | OK   | 既存`SkillCard`と`CardContainer`をそのまま利用      | 修正不要 |
| accessibility basics  | OK   | heroのalt、table scope、見出し階層、リンクを確認    | 修正不要 |

### 自己修正した項目

- [x] dev serverではpage TOC postprocessが行われないため、build済みpreviewを使ってVisual Testを再実行した

### 人間判断が必要な差分

- なし

### design-image-generation への引き継ぎ候補

- [x] スミの実装スクリーンショットをdesign fix modeで正本化した（`/data/ikizama/sumi/`）

### 対応完了チェックリスト

- [x] desktop screenshot を取得した
- [x] mobile screenshot を取得した
- [x] reference と actual を比較した
- [x] 明らかな visual mismatch を修正した、または修正不要と判断した
- [x] design正本の更新が必要な場合は、人間判断項目として記録した
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## レビュー指摘 1

### 指摘事項

- `IkizamaDataSection` を同一ページに複数配置すると、固定のH2/H3 IDと
  `aria-labelledby` が重複する。通常の目次対象ではPageTocのpostprocessがbuildを失敗させ、
  `excludeDetailHeadingsFromToc` 有効時もDOM上の見出し参照が一意にならない。

### 判定

- source: local-pr-review（PR #57、`.tmp/review/32-2-ikizama-detail-page/pr-review-1.md`）
- classification: invalid
- local validation: 同Componentの再利用は異なるページでの利用を想定しており、同一ページに複数配置する契約はない。
  ユーザー確認により、同一ページ内で再利用しないため、固定IDによる重複は現行scopeの不具合ではない。

### 対応方針

- 実装変更は行わない。

### 対応完了チェックリスト

- [x] 同一ページ内で再利用しない契約を確認し、実装変更不要と判断した
