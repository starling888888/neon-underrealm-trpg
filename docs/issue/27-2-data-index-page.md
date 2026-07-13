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

- [ ] `docs/design/data/notes.md`、desktop画像、mobile画像による初期designドラフトを作成し、人間レビュー前のドラフトであることを記録する。
- [ ] `/data` がダミーではなく、ユーザー編集済み `.raw/contents/data.md` に沿うデータトップページになる。
- [ ] H1直後にユーザー提供のdata heroを、指定alt・captionなし・追加overlayなしで表示する。
- [ ] SkillCardの既存props型に合う静的propsの凡例データを渡し、`variant="legend"` で表示する。型回避として `any` を使わない。
- [ ] タイミング、コスト、制限、覚悟、特別なスキル、クロスコンボの説明と導線を配置する。
- [ ] 特別なスキルが `danger` Calloutで表示され、クロスコンボは独立した本文セクションになる。
- [ ] `/rules/battle` にコンボ中のタイミング表と `cross-combo` 固定アンカーを反映する。
- [ ] `/data` からクロスコンボへのリンクがGitHub Pagesのサブパス配下でも機能する。
- [ ] データページ用dummy MDXを本実装へ置き換え、`docs/TODO.md` の完了・done移動はmerge後処理まで行わない。
- [ ] 実装後にVisual Reviewを行い、designとの差分を現在issueへ記録する。
- [ ] `npm run check` と `npm run build` が通る。

## チェックポイント

- [ ] 既存ルート、特にデータ配下と `/rules/battle` が壊れていない。
- [ ] 画像・内部リンク・固定アンカーがGitHub Pagesのサブパス公開に影響されない。
- [ ] 新しい依存関係を追加していない。
- [ ] 初期スコープ外の機能を実装していない。
- [ ] 関連する `docs/TODO.md` 項目と矛盾していない。
- [ ] `docs/design/data/`、global styles、site layout、SkillCard、battleのdesignと矛盾していない。
- [ ] ユーザー提供の `public/images/data/hero.webp` と未コミット変更を破壊していない。

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
- ユーザー指示により、実在データではない説明用のスキル凡例・アイテム凡例はすべて、既存Card Componentへ静的propsを渡して表示してよい。`docs/requirements/data-display.md` に同じ例外を記録した。実装では `any` を使わない。
