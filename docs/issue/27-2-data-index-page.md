# 27-2-data-index-page

## 目的

`/data` を、仕事人の流儀・生き様・スキル・アイテムへ進む入口と、スキルカードの見方を確認できるデータトップページとして実装する。

あわせて、データページから参照するクロスコンボの固定アンカーと、コンボ中のスキルタイミング表を `/rules/battle` に反映する。

## 背景

`docs/plan.md` の `27-2-data-index-page` は、データトップページ、スキル凡例、データ項目・タイミング・コスト・制限の説明を対象にしている。

現状の `src/pages/data/index.mdx` は現在地ハイライト確認用ダミーであり、`docs/TODO.md` の該当項目で本実装への置換が追跡されている。

ユーザー編集済みの `.raw/contents/data.md` と `.raw/contents/battle.md` をローカル作業入力として使う。`public/images/data/hero.webp` はユーザー提供assetである。現行 `SkillCard` と `docs/requirements/data-display.md` の仕様を、V1.0参照資料より優先する。

関連参照:

- `docs/requirements/pages.md` の `/data`
- `docs/requirements/data-display.md` の FR-04-01、FR-04-03
- `docs/requirements/layout-navigation.md` の PageToc / MobilePageToc
- `docs/requirements/assets-seo.md` の画像・alt・サブパス要件
- `docs/TODO.md` のデータページ用ダミーMDX置換
- `docs/design/global-styles/notes.md`
- `docs/design/site-layout/notes.md`
- `docs/design/skill-card/notes.md`
- `docs/design/battle/notes.md`

## 対象範囲

- `docs/design/data/` に、`/data` の初期designドラフト（desktop 1440x1200、mobile 390x900）と `notes.md` を作成する。
- `src/pages/data/index.mdx` を本実装へ置き換える。
  - `ImageBlock` で `public/images/data/hero.webp` をH1直後へ表示する。
  - 説明用凡例の静的propsを既存props型に合わせて `SkillCard` へ渡し、`variant="legend"` でスキル凡例を表示する。新しい凡例専用Componentは作らない。
  - `.raw/contents/data.md` の本文・HTMLコメント指示に従い、データ導線、スキルの見方、データ項目、タイミング、コスト、制限、特別なスキル、クロスコンボ、アイテム導線を配置する。
  - 特別なスキルは `Callout type="danger"` で表示する。
  - タイミングの`SP`とコストの`SP`は分離せず、現行contentsの文脈ごとの説明を維持する。
- `src/pages/rules/battle.mdx` に `.raw/contents/battle.md` のコンボ中のスキルタイミング表を反映する。
  - クロスコンボ見出しへ `cross-combo` の固定IDを付与する。
  - `/data` から `InternalLink` を使って `/rules/battle#cross-combo` を参照できるようにする。
- 現行のdummy `/data` を本実装へ置き換える。対応する `docs/TODO.md` 項目の完了・done移動は、merge後の `post-merge-plan-update` で扱う。
- 実装後はdesignドラフトと比較するVisual Reviewを行い、ユーザー承認済みの場合のみdesign正本を更新する。

## 初期スコープ外

- 流儀、生き様、共通スキル、各アイテム種別の一覧・詳細ページを実装しない。
- Excel変換、JSON、schema、データ取得、スキルID生成規則を変更しない。
- 検索、絞り込み、ソート、ページネーション、カード詳細遷移、選択・計算UIを追加しない。
- `SkillLegend` などの凡例専用Component、新しい依存関係、クライアント状態管理を追加しない。
- Header、Footer、SiteMenu、PageToc、MobilePageTocを再設計しない。
- パンくず、前後ナビゲーション、未実装ページへの導線を追加しない。
- DB、認証、SSR、CMS、戦闘シミュレーター、キャラクターシートは `docs/out-of-scope.md` に従い実装しない。

## 完了条件

- [x] `docs/design/data/notes.md`、desktop画像、mobile画像による初期designドラフトを作成し、人間レビュー前のドラフトであることを記録する。
- [x] `/data` がダミーではなく、ユーザー編集済み `.raw/contents/data.md` に沿うデータトップページになる。
- [x] H1直後にユーザー提供のdata heroを、指定alt・captionなし・追加overlayなしで表示する。
- [x] SkillCardの既存props型に合う静的propsの凡例データを渡し、`variant="legend"` で表示する。凡例の番号を示す`maxLevel`だけ、理由コメント付きの局所的な`any`例外で文字列を渡す。
- [x] タイミング、コスト、制限、覚悟、特別なスキル、クロスコンボの説明と導線を配置する。
- [x] 特別なスキルが `danger` Calloutで表示され、クロスコンボは独立した本文セクションになる。
- [x] `/rules/battle` にコンボ中のタイミング表と `cross-combo` 固定アンカーを反映する。
- [x] `/data` からクロスコンボへのリンクがGitHub Pagesのサブパス配下でも機能する。
- [x] データページ用dummy MDXを本実装へ置き換え、`docs/TODO.md` の完了・done移動はmerge後処理まで行わない。
- [x] 実装後にVisual Reviewを行い、designとの差分を現在issueへ記録する。
- [x] `npm run check` と `npm run build` が通る。

## チェックポイント

- [x] 既存ルート、特にデータ配下と `/rules/battle` が壊れていない。
- [x] 画像・内部リンク・固定アンカーがGitHub Pagesのサブパス公開に影響されない。
- [x] 新しい依存関係を追加していない。
- [x] 初期スコープ外の機能を実装していない。
- [x] 関連する `docs/TODO.md` 項目と矛盾していない。
- [x] `docs/design/data/`、global styles、site layout、SkillCard、battleのdesignと矛盾していない。
- [x] ユーザー提供の `public/images/data/hero.webp` と未コミット変更を破壊していない。

## 想定変更ファイル

- `docs/design/data/notes.md`
- `docs/design/data/design-desktop.png`
- `docs/design/data/design-mobile.png`
- `src/pages/data/index.mdx`
- `src/pages/rules/battle.mdx`
- `docs/issue/27-2-data-index-page.md`

## レビュー観点

- `/data` が静的な入口・凡例ページに留まり、検索やデータ選択UIへ広がっていないか。
- H1直後のhero、データ導線、SkillCard凡例、通常本文、`danger` Calloutの順序と情報密度がdesignドラフトおよび既存本文ページと整合するか。
- desktopのPageTocとmobileのMobilePageTocに対して、見出しとCallout titleの扱いが適切か。
- 特別なスキルを重大事項として表示しつつ、クロスコンボを独立セクションとして戦闘ページへ導けているか。
- 戦闘ページに追加する記号表と `cross-combo` 固定アンカーが、データページの説明・リンクと一致するか。
- data dummyの置換後も、`docs/TODO.md` の完了・done移動をmerge後処理へ委ねる方針でよいか。
- issue承認後にdesign画像の初期ドラフトを作成する順序でよいか。

## 備考

- 現在 `docs/design/data/` は存在しない。ユーザーがissueを承認した後に、`design-image-generation` のinitial draft modeを実行する。
- 初期designドラフトは人間レビューまで正本ではない。実装はissue内容とdesignドラフトの承認後に開始する。
- ユーザー指示により、実在データではない説明用のスキル凡例・アイテム凡例はすべて、既存Card Componentへ静的propsを渡して表示してよい。`maxLevel`へ番号付き文字列を渡す必要がある今回のスキル凡例だけ、理由コメント付きの局所的な`any`例外を使う。

## ビジュアルレビュー 1

### デザイン参照

- design target: `docs/design/data/`
- reference desktop: `docs/design/data/design-desktop.png`
- reference mobile: `docs/design/data/design-mobile.png`
- notes: heroを含むページ全体はdesign確認対象外のため、SkillCard凡例と右側説明領域が見えるviewportを比較した。

### 成果物

- actual desktop: `test-results/visual/data-desktop.png`
- actual mobile: `test-results/visual/data-mobile.png`
- report: `test-results/visual/capture-manifest.json`

### レビュー結果

| 領域                  | 判定 | 差分                                                       | 対応 |
| --------------------- | ---- | ---------------------------------------------------------- | ---- |
| レイアウト            | OK   | desktopはカード1列＋説明2列、mobileは2列。                 | 不要 |
| 余白                  | OK   | 既存proseとSkillCardのspacingを使用。                      | 不要 |
| タイポグラフィ        | OK   | 右側は通常の順序付きリストと太字の項目名。                 | 不要 |
| 色                    | OK   | 既存accentとborderのみ。                                   | 不要 |
| 配置・整列            | OK   | 右側説明の上端をカードと揃えた。                           | 不要 |
| レスポンシブ          | OK   | mobile 2列で横overflowなし。説明文は列幅に応じて折り返す。 | 不要 |
| overflow / scroll     | OK   | desktop・mobileとも横overflowなし。                        | 不要 |
| 既存デザインとの整合  | OK   | site layoutとSkillCardのgrid方向を維持。                   | 不要 |
| 既存Componentとの整合 | OK   | 静的propsを既存`SkillCard`へ直接渡した。                   | 不要 |
| accessibility basics  | OK   | hero alt、見出し、順序付きリスト、内部リンクを確認。       | 不要 |

### 自己修正した項目

- [x] Visual Review用の`/data` desktop・mobile captureと、戦闘ページの新しい記号表・固定アンカーの検証を追加した。

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

## レビュー指摘 1

### 指摘事項

- SkillCard凡例の静的propsを、右側の項目説明と対応する`①`から`⑩`で示す。`summary`は番号を付けず、`effect`を`⑩`とする。
- `maxLevel`は凡例の対応関係を示すためだけに文字列`②1`を渡し、局所的な`any`で既存の数値props型を回避する。凡例限定でやむを得ない処理であることをMDX上のコメントで明記する。
- 取得制限、使用制限、対象、射程について、`docs/game-design/skills.md`に定義される表記と説明文をデータページへ追加する。
- 凡例propsには、同仕様の「共通スキルの例」にある値と説明文を使う。
- 覚悟コストの説明にある「根性の縁」を「今生の縁」へ訂正する。
- 凡例カードの高さを抑えるため、右側の項目リストの文字サイズを通常本文より小さくする。
- `usageRestriction`へ`⑦-`を渡し、使用制限も凡例カード上で番号対応を確認できるようにする。
- 戦闘ページのコンボ中タイミング表で、`×-A`と`☆-A`、`A-×`と`A-☆`をそれぞれ同じ行へ統合する。
- 戦闘ページのタイミング表の近くに、データページの「スキルのタイミング」へ進むリンクを置く。

### 判定

- source: human
- classification: valid
- local validation: `src/components/data/SkillCard.astro`は`name`、`maxLevel`、`timing`、`cost`、`proficiency`、`acquisitionRestriction`、`usageRestriction`、`target`、`range`、`summary`、`effect`の11 propsをその順に表示する。現在の静的凡例は、右側の説明と対応する`①`から`⑩`、番号を付けない`summary`、仕様例の本文を満たしていない。`docs/game-design/skills.md`は取得制限・対象・射程・使用制限の表記と説明文、および「基本の一撃」の各項目例を定義している。`src/pages/data/index.mdx`には「根性の縁」という誤記があり、`.skill-legend-guide > ol`には文字サイズの局所指定がない。`src/pages/rules/battle.mdx`のタイミング表は星記号の行を分離しており、データページへのリンクはクロスコンボ節の末尾にしかない。
- current issue conflict: 完了条件の「型回避として`any`を使わない」は、この凡例限定の最新ユーザー指示と矛盾する。対応時に、静的な説明用propsへ文字列の番号を付ける例外として置き換える。
- TODO routing: なし。すべて`/data`の凡例と本文のcurrent issue内で対応できる。
- failure-log routing: なし。通常の実装レビュー指摘であり、手順逸脱ではない。

### 対応方針

- `①基本の一撃`から`⑩攻撃を行う。`まで、右側の説明リストと対応する項目へ番号を付ける。`summary`は番号を付けず、スキル仕様の概要文を使う。右側の説明リストは、ユーザー指示済みの「効果のみ」の10項目構成を維持する。
- `maxLevel`へのJSDoc `any` castを凡例呼び出しに限定し、その直前へ理由を示すコメントを置く。Componentのprops型は変更しない。
- 取得制限、対象、射程、使用制限の各節または表へ、仕様の表記と説明文を転載する。凡例値には仕様の「共通スキルの例」を使う。
- 覚悟コストの説明を「今生の縁」へ訂正し、右側の順序付きリストに既存Card本文と同じ小さい文字サイズを局所適用する。
- `usageRestriction`には`⑦-`を渡す。battleの表はデータページと同じ3行のコンボ中タイミング表記に揃え、直後に`/data#h-e1218826`の「スキルのタイミング」への導線を置く。
- `/data`のVisual Reviewテストを更新し、番号付きprops・仕様表・subpathリンクを再確認する。

### 対応完了チェックリスト

- [x] `summary`を除く10項目が右側の説明と対応する番号付き静的値になる
- [x] `maxLevel`の凡例限定`any`例外と理由コメントを追加する
- [x] 取得制限、使用制限、対象、射程の仕様表記と説明文を掲載する
- [x] 凡例値にスキル仕様の「共通スキルの例」を使う
- [x] 覚悟コストの「根性の縁」を「今生の縁」へ訂正する
- [x] 凡例右側の項目リストを小さい文字サイズにする
- [x] `usageRestriction`へ`⑦-`を渡す
- [x] battleのコンボ中タイミング表を星記号を含む2行へ統合する
- [x] battleのタイミング表の近くにスキルのタイミングへのリンクを置く
- [x] Visual Reviewテストを更新する
- [x] `npm run check` が通る
- [x] `npm run build` が通る
