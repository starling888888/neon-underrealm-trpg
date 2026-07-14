# 28-2-common-skills-page

## 目的

共通スキルをカテゴリごとに参照できる静的な `/data/common-skills` ページを作成する。ユーザー指示により `28-1-common-skills-components` で予定されていた `SkillList` を同時に実装し、既存の `SkillCard` に表示責務を集約する。

## 背景

`docs/plan.md` の `28-2-common-skills-page` は、共通スキル一覧ページ、`.raw/contents/common-skills.md` に基づく本文、カテゴリ別データ表示を求めている。`docs/requirements/data-display.md` の FR-04-01 と `docs/requirements/pages.md` は、この一覧に `SkillList` / `SkillCard` を利用し、生成JSONのカテゴリ・配列順を維持することを定めている。

関連TODOは以下のとおり。

- `docs/TODO.md` の「最初のページ作成タスクで、ローカルコンテンツ作成SKILLを実際に使って動作確認する」は、このissueで `.raw/contents/common-skills.md` を確認・更新して扱う。Google Driveへの同期は行わない。
- `docs/TODO.md` の「`/data/common-skills` のページ作成を計画項目として追跡する」は、このissueでページ実装まで扱う。TODOの完了・done移動はmerge後の処理に委ねる。

現状は上級スキルのデータがないため、最新のユーザー指示に従い、`上級スキル` の見出しと空の一覧は作成しない。`bonus`、`basic` の順で、存在するデータだけを表示する。

`28-1-common-skills-components` は `docs/plan.md` 上では未完了の独立項目である。このissueではユーザー指示により同項目の `SkillList` 実装範囲を統合するが、`docs/plan.md` のチェック変更は行わない。merge後のtracking更新で、`28-1` の完了・計画上の扱いを確認する。

## 対象範囲

- `.raw/contents/common-skills.md` のfrontmatter、本文、HTMLコメント指示を、最新のユーザー指示と既存要件に照合する。
- `src/components/data/SkillList.astro` を追加する。
  - 受け取った `Skill[]` を順序変更せずに既存 `SkillCard` へ渡す。
  - 個別スキルの `id` をカードのアンカーIDとして利用する。
  - スマホ幅は2列、デスクトップ幅はカードの最低幅を維持した3列または4列のgridとする。
  - カードの項目や表示順は重複実装せず、`SkillCard` に委ねる。
- `src/pages/data/common-skills.mdx` を追加し、`getCommonSkillsByCategory()` の生成JSONデータを使って `/data/common-skills` を実装する。
  - `.raw/contents/common-skills.md` のH1本文とカテゴリごとの本文を反映する。表示するH2は `自動習得スキル` を `bonus`、`初期作成時から取得可能なスキル` を `basic` に対応させる。
  - `bonus`、`basic` をこの順に `SkillList` へ渡す。
  - 現状データがない `advanced` は、H2・空一覧とも出力しない。
  - ページ内目次はcontentsのfrontmatterに従って有効にする。
- 実装後、既存の `docs/design/data/`、`docs/design/skill-card/`、`docs/design/site-layout/` を参照してVisual Reviewを行い、結果をこのissueへ記録する。
- Visual Reviewと人間確認の後、最後の作業として `design-image-generation` のdesign fix modeで `docs/design/common-skills/` のdesign正本を作成または更新する。Visual Reviewのactual screenshotを直接コピーして正本にしない。

## 初期スコープ外

- 初期designドラフトは作成しない。`docs/design/common-skills/` の正本化は、実装・Visual Review・人間確認の後に行う最後の作業に限定する。
- 上級スキルの仮データ、空見出し、準備中表示を追加しない。
- 共通スキルデータのExcel変換、JSON、schema、取得層、スキルID生成規則を変更しない。
- 検索、絞り込み、ソート、ページネーション、カード詳細ページ、選択・計算UIを追加しない。
- `SkillLegend`などの凡例専用Component、新しい依存関係、クライアント状態管理を追加しない。
- Header、Footer、SiteMenu、PageToc、MobilePageTocを再設計しない。
- Google Driveへの同期、DB、認証、SSR、CMS、キャラクターシートは `docs/out-of-scope.md` に従い実装しない。

## 完了条件

- [ ] `/data/common-skills` が静的に生成され、共通スキルを既存の生成JSONから表示する。
- [ ] `SkillList` が受け取った配列を並び替えずに `SkillCard` へ渡し、カード表示仕様を重複実装していない。
- [ ] 個別スキルの生成JSON `id` をHTMLアンカーとして利用できる。
- [ ] `bonus`、`basic` をこの順に表示し、各カテゴリ内では生成JSONの配列順を維持する。
- [ ] 現状データがない `advanced` は、見出し・空一覧とも表示しない。
- [ ] `.raw/contents/common-skills.md` のfrontmatterとHTMLコメントを確認し、本文・カテゴリ指示との矛盾を残していない。Google Drive同期は未実行である。
- [ ] 実装後にVisual Reviewを行い、既存design targetとの差分をこのissueへ記録する。
- [ ] 初期designドラフトを作らず、Visual Reviewと人間確認の後に `design-image-generation` のdesign fix modeで `docs/design/common-skills/` を正本化する。
- [ ] `npm run check` と `npm run build` が通る。

## チェックポイント

- [ ] 既存ルート、とくに `/data` 配下が壊れていない。
- [ ] 内部リンクと個別アンカーがGitHub Pagesのサブパス配下でも機能する。
- [ ] 不要な依存関係を追加していない。
- [ ] 初期スコープ外の機能を実装していない。
- [ ] `docs/TODO.md` の関連項目と矛盾していない。
- [ ] `docs/design/data/`、`docs/design/skill-card/`、`docs/design/site-layout/` の既存designと矛盾していない。
- [ ] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `.raw/contents/common-skills.md`
- `src/components/data/SkillList.astro`
- `src/pages/data/common-skills.mdx`
- `docs/issue/28-2-common-skills-page.md`
- Visual Reviewで必要となるテスト・設定・成果物

## レビュー観点

- `SkillList` が一覧gridだけを担当し、カードの表示仕様を `SkillCard` に重複実装していないか。
- `28-1-common-skills-components` の `SkillList` 範囲をこのissueへ統合し、merge後のtracking更新で計画上の扱いを確認する方針でよいか。
- `bonus`、`basic` の順序と各配列の順序が保たれ、現状は上級スキルの空見出しを出さない方針が適切か。
- `.raw/contents/common-skills.md` の導入文、`bonus`に対応する`自動習得スキル`、`basic`に対応する`初期作成時から取得可能なスキル`、HTMLコメント指示をページの表示範囲に正しく反映できるか。
- 初期designドラフトを作成せず、既存のdata・skill-card・site-layout designを参照し、最後にdesign fix modeで `docs/design/common-skills/` を正本化する順序でよいか。
- 関連TODOをこのissueで実装まで扱い、TODOの完了処理をmerge後へ残す方針でよいか。

## 備考

- design画像の初期ドラフトを作成しないのは、最新のユーザー指示による。実装後は既存design targetを参照してVisual Reviewを行い、人間確認後の最後の作業で `design-image-generation` のdesign fix modeを使って `docs/design/common-skills/` を正本化する。Visual Reviewのactual screenshotを `docs/design/` へ直接コピーしない。
- `docs/requirements/data-display.md` と `docs/requirements/pages.md` はカテゴリ順として `bonus`、`basic`、`advanced` を定める。現状データがない `advanced` を空表示しない判断は、同順序を保ったまま最新ユーザー指示に従うものとする。上級スキルを追加する際は、contents指示書とこのページの表示条件を見直す。
- `28-1-common-skills-components` の計画上のチェックとTODOの完了・done移動は、このissueの実装中には変更しない。merge後のtracking更新で、`28-1` を本issueの統合実装として扱えるか確認する。
- Git commit / push、Google Drive同期、`docs/plan.md` と `docs/TODO.md` の完了更新は、このissueでは行わない。
