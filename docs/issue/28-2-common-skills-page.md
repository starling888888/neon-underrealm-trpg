# 28-2-common-skills-page

## 目的

共通スキルをカテゴリごとに参照できる静的な `/data/common-skills` ページを作成する。ユーザー指示により、カードをslotで受けて配置だけを担う `CardContainer` を同時に実装し、既存の `SkillCard` に表示責務を集約する。

## 背景

`docs/plan.md` の `28-2-common-skills-page` は、共通スキル一覧ページ、`.raw/contents/common-skills.md` に基づく本文、カテゴリ別データ表示を求めている。`docs/requirements/data-display.md` の FR-04-01 と `docs/requirements/pages.md` は、この一覧に `CardContainer` / `SkillCard` を利用し、生成JSONのカテゴリ・配列順を維持することを定めている。

関連TODOは以下のとおり。

- `docs/TODO.md` の「最初のページ作成タスクで、ローカルコンテンツ作成SKILLを実際に使って動作確認する」は、このissueで `.raw/contents/common-skills.md` を確認・更新して扱う。Google Driveへの同期は行わない。
- `docs/TODO.md` の「`/data/common-skills` のページ作成を計画項目として追跡する」は、このissueでページ実装まで扱う。TODOの完了・done移動はmerge後の処理に委ねる。

現状は上級スキルのデータがないため、最新のユーザー指示に従い、`上級スキル` の見出しと空の一覧は作成しない。`bonus`、`basic` の順で、存在するデータだけを表示する。

## 対象範囲

- `.raw/contents/common-skills.md` のfrontmatter、本文、HTMLコメント指示を、最新のユーザー指示と既存要件に照合する。
- `src/components/_common/CardContainer.astro` を追加する。
  - slotで受け取ったCardを、カード内の項目や表示順を実装せずに配置する。
  - スマホ幅は2列、デスクトップ幅はカードの最低幅を維持した3列または4列で配置する。内部レイアウトの実装方式は固定しない。
  - データ配列の展開、個別アンカーID、Cardのpropsは呼び出し側が担当する。
- 既存のスキル専用一覧Componentを削除し、ページとローカルカタログのカード配置を `CardContainer` に統一する。
- `src/pages/data/common-skills.mdx` を追加し、`getCommonSkillsByCategory()` の生成JSONデータを使って `/data/common-skills` を実装する。
  - `.raw/contents/common-skills.md` のH1本文とカテゴリごとの本文を反映する。表示するH2は `自動習得スキル` を `bonus`、`初期作成時から取得可能なスキル` を `basic` に対応させる。
  - `bonus`、`basic` をこの順に展開して `SkillCard` を生成し、各カテゴリの `CardContainer` slotへ渡す。
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
- [ ] `CardContainer` がslotで受け取ったカードを配置し、カード表示仕様を重複実装していない。
- [ ] 個別スキルの生成JSON `id` をHTMLアンカーとして利用できる。
- [ ] `bonus`、`basic` をこの順に表示し、各カテゴリ内では生成JSONの配列順を維持する。
- [ ] 現状データがない `advanced` は、見出し・空一覧とも表示しない。
- [x] `.raw/contents/common-skills.md` のfrontmatterとHTMLコメントを確認し、本文・カテゴリ指示との矛盾を残していない。Google Drive同期は未実行である。
- [ ] 実装後にVisual Reviewを行い、既存design targetとの差分をこのissueへ記録する。
- [ ] 初期designドラフトを作らず、Visual Reviewと人間確認の後に `design-image-generation` のdesign fix modeで `docs/design/common-skills/` を正本化する。
- [ ] `npm run check` と `npm run build` が通る。

## チェックポイント

- [ ] 既存ルート、とくに `/data` 配下が壊れていない。
- [ ] 内部リンクと個別アンカーがGitHub Pagesのサブパス配下でも機能する。
- [x] 不要な依存関係を追加していない。
- [x] 初期スコープ外の機能を実装していない。
- [x] `docs/TODO.md` の関連項目と矛盾していない。
- [ ] `docs/design/data/`、`docs/design/skill-card/`、`docs/design/site-layout/` の既存designと矛盾していない。
- [x] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `.raw/contents/common-skills.md`
- `src/components/_common/CardContainer.astro`
- 既存のスキル専用一覧Componentの削除
- `src/pages/data/common-skills.mdx`
- `docs/issue/28-2-common-skills-page.md`
- Visual Reviewで必要となるテスト・設定・成果物

## レビュー観点

- `CardContainer` がslot内のカード配置だけを担当し、カードの表示仕様を `SkillCard` に重複実装していないか。
- `CardContainer` の名称が特定のレイアウト実装に依存せず、将来のカード種別でも利用できるか。
- `bonus`、`basic` の順序と各配列の順序が保たれ、現状は上級スキルの空見出しを出さない方針が適切か。
- `.raw/contents/common-skills.md` の導入文、`bonus`に対応する`自動習得スキル`、`basic`に対応する`初期作成時から取得可能なスキル`、HTMLコメント指示をページの表示範囲に正しく反映できるか。
- 初期designドラフトを作成せず、既存のdata・skill-card・site-layout designを参照し、最後にdesign fix modeで `docs/design/common-skills/` を正本化する順序でよいか。
- 関連TODOをこのissueで実装まで扱い、TODOの完了処理をmerge後へ残す方針でよいか。

## 備考

- design画像の初期ドラフトを作成しないのは、最新のユーザー指示による。実装後は既存design targetを参照してVisual Reviewを行い、人間確認後の最後の作業で `design-image-generation` のdesign fix modeを使って `docs/design/common-skills/` を正本化する。Visual Reviewのactual screenshotを `docs/design/` へ直接コピーしない。
- `docs/requirements/data-display.md` と `docs/requirements/pages.md` はカテゴリ順として `bonus`、`basic`、`advanced` を定める。現状データがない `advanced` を空表示しない判断は、同順序を保ったまま最新ユーザー指示に従うものとする。上級スキルを追加する際は、contents指示書とこのページの表示条件を見直す。
- `CardContainer` は共通Componentとして実装し、データ配列の展開と個別アンカーIDの付与はページまたはテンプレート側の責務とする。
- `CardContainer` への置換前に記録したビジュアルレビュー 1〜4は旧構成の記録として残す。置換後は、新しい実装結果に対して改めてVisual Reviewを行う。
- Git commit / push、Google Drive同期、`docs/plan.md` と `docs/TODO.md` の完了更新は、このissueでは行わない。

## ビジュアルレビュー 1

### デザイン参照

- design target: `docs/design/skill-card/`
- reference desktop: `docs/design/skill-card/design-desktop.png`
- reference mobile: `docs/design/skill-card/design-mobile.png`
- supporting references: `docs/design/data/notes.md`、`docs/design/site-layout/notes.md`
- notes: `advanced` の見出しと一覧を出さないのは、空配列である現状と最新ユーザー指示による意図した差分である。初期designドラフトは作成しない。

### 成果物

- actual desktop: `test-results/visual/common-skills-desktop.png`
- actual mobile: `test-results/visual/common-skills-mobile.png`
- report: `test-results/visual/capture-manifest.json`

### レビュー結果

| 領域                  | 判定 | 差分                                                                          | 対応 |
| --------------------- | ---- | ----------------------------------------------------------------------------- | ---- |
| レイアウト            | OK   | desktopは3列、mobileは2列のカード一覧配置。                                   | 不要 |
| 余白                  | OK   | section間とカード間に既存のspace tokenを使用。                                | 不要 |
| タイポグラフィ        | OK   | SkillCardの既存の情報密度と本文サイズを維持。                                 | 不要 |
| 色                    | OK   | 既存border、白寄りsurface、青緑accentのみを使用。                             | 不要 |
| 配置・整列            | OK   | 同一grid行のカード高が揃い、長い本文はカード内で自然に伸長する。              | 不要 |
| レスポンシブ          | OK   | mobile 2列で情報を保持し、desktopは既存rails内で3列を維持。                   | 不要 |
| overflow / scroll     | OK   | desktop・mobileとも横overflowなしをVisual Testで確認。                        | 不要 |
| 既存デザインとの整合  | OK   | 上級スキルの省略は空データと最新ユーザー指示による意図した差分。              | 不要 |
| 既存Componentとの整合 | OK   | 一覧Componentは配列順のままSkillCardを呼び出し、生成JSON idをアンカーへ渡す。 | 不要 |
| accessibility basics  | OK   | H1/H2、PageToc、mobile PageToc、個別アンカー遷移を確認。                      | 不要 |

### 自己修正した項目

- `SkillCard` の `proficiency` が生成JSONのnullを受け取れるようにし、既存の空値表示`-`へ揃えた。
- 個別アンカーのサブパス遷移をVisual Testへ追加した。

### 人間判断が必要な差分

- 実装スクリーンショットを `docs/design/common-skills/` の正本へ反映するかは、ユーザーレビュー後に判断する。

### design-image-generation への引き継ぎ候補

- [x] ユーザーレビュー後、実装スクリーンショットを直接コピーせず、design fix modeで `docs/design/common-skills/` を正本化する。

### 対応完了チェックリスト

- [x] desktop screenshot を取得した
- [x] mobile screenshot を取得した
- [x] reference と actual を比較した
- [x] 明らかな visual mismatch を修正した、または修正不要と判断した
- [x] design正本の更新が必要な場合は、人間判断項目として記録した
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## ビジュアルレビュー 2

### デザイン参照

- design target: `docs/design/skill-card/`
- reference desktop: `docs/design/skill-card/design-desktop.png`
- reference mobile: `docs/design/skill-card/design-mobile.png`
- notes: 最新ユーザー指示により、スキル名はカード内の他の情報と同じ `text-sm` にし、太字を維持する。

### 成果物

- actual desktop: `test-results/visual/common-skills-desktop.png`
- actual mobile: `test-results/visual/common-skills-mobile.png`
- report: `test-results/visual/capture-manifest.json`

### レビュー結果

| 領域                  | 判定 | 差分                                                                     | 対応     |
| --------------------- | ---- | ------------------------------------------------------------------------ | -------- |
| タイポグラフィ        | OK   | スキル名を`text-xl`から`text-sm`へ下げ、太字を維持した。                 | 対応済み |
| レイアウト            | OK   | 名称サイズ変更後もdesktop 3列、mobile 2列のgridを維持。                  | 不要     |
| レスポンシブ          | OK   | mobileで名称だけが拡大されず、カード内の情報密度を維持。                 | 不要     |
| overflow / scroll     | OK   | desktop・mobileとも横overflowなし。                                      | 不要     |
| 既存Componentとの整合 | OK   | 名前を太字で識別しつつ、カード内の既存情報順と空値表示を変更していない。 | 不要     |

### 自己修正した項目

- `SkillCard` のスキル名を`text-sm`・`font-weight: 800`へ変更し、mobileの個別拡大指定を削除した。

### 人間判断が必要な差分

- design正本化はユーザーレビュー後に行うため、今回の名称サイズ変更を含めた `docs/design/common-skills/` の正本化は未実行である。

### design-image-generation への引き継ぎ候補

- [x] ユーザーレビュー後、design fix modeで `docs/design/common-skills/` を正本化する。

### 対応完了チェックリスト

- [x] desktop screenshot を取得した
- [x] mobile screenshot を取得した
- [x] reference と actual を比較した
- [x] 明らかな visual mismatch を修正した、または修正不要と判断した
- [x] design正本の更新が必要な場合は、人間判断項目として記録した
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## ビジュアルレビュー 3

### デザイン参照

- design target: `docs/design/skill-card/`
- reference desktop: `docs/design/skill-card/design-desktop.png`
- reference mobile: `docs/design/skill-card/design-mobile.png`
- notes: 最新ユーザー指示により、スキル名を単独の最上段へ置き、`最大LV` をタイミング・コスト・技能のメタ行右端へ移動する。

### 成果物

- actual desktop: `test-results/visual/common-skills-desktop.png`
- actual mobile: `test-results/visual/common-skills-mobile.png`
- report: `test-results/visual/capture-manifest.json`

### レビュー結果

| 領域                  | 判定 | 差分                                                                   | 対応     |
| --------------------- | ---- | ---------------------------------------------------------------------- | -------- |
| タイポグラフィ        | OK   | スキル名は専用の最上段、`最大LV`は同じ情報密度のメタ行右端へ配置。     | 対応済み |
| レイアウト            | OK   | スキル名が最大幅を使えるため、名称と最大LVが横に競合しない。           | 対応済み |
| レスポンシブ          | OK   | mobile 2列でも名称と最大LVが別行となり、折り返しリスクを下げている。   | 対応済み |
| overflow / scroll     | OK   | desktop・mobileとも横overflowなし。                                    | 不要     |
| 既存Componentとの整合 | OK   | カードの表示項目・表示順は維持し、最大LVの視認性だけをメタ行へ移した。 | 不要     |

### 自己修正した項目

- `SkillCard` のheaderを名称専用にし、`最大LV` をタイミング・コスト・技能と同じメタ行の右端へ移動した。

### 人間判断が必要な差分

- design正本化はユーザーレビュー後に行うため、今回のheaderと最大LVの配置変更を含めた `docs/design/common-skills/` の正本化は未実行である。

### design-image-generation への引き継ぎ候補

- [x] ユーザーレビュー後、design fix modeで `docs/design/common-skills/` を正本化する。

### 対応完了チェックリスト

- [x] desktop screenshot を取得した
- [x] mobile screenshot を取得した
- [x] reference と actual を比較した
- [x] 明らかな visual mismatch を修正した、または修正不要と判断した
- [x] design正本の更新が必要な場合は、人間判断項目として記録した
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## ビジュアルレビュー 4

### デザイン参照

- design target: `docs/design/site-layout/`
- reference desktop: `docs/design/site-layout/design-desktop.png`
- reference mobile: `docs/design/site-layout/design-mobile.png`
- supporting references: `docs/design/skill-card/notes.md`、`docs/design/data/notes.md`
- notes: 最大表示幅で`46rem`のMDX本文が`64rem`の中央カラム左端に寄っていたユーザー報告を確認した。既存designはstandard desktop / mobileだけを正本とし、超横長画面の非対称な余白を意図として定めていない。

### 成果物

- actual desktop: `test-results/visual/common-skills-desktop.png`
- actual mobile: `test-results/visual/common-skills-mobile.png`
- report: `test-results/visual/capture-manifest.json`

### レビュー結果

| 領域                 | 判定 | 差分                                                                                                | 対応     |
| -------------------- | ---- | --------------------------------------------------------------------------------------------------- | -------- |
| レイアウト           | OK   | `MDXLayout`の`46rem`本文を中央寄せにし、最大表示幅で余剰の`18rem`が右側だけへ偏る状態を解消。       | 対応済み |
| 配置・整列           | OK   | 左SiteMenu・中央本文・右PageTocの3領域に対し、本文の左右余白を同じ基準で確保。                      | 対応済み |
| レスポンシブ         | OK   | standard desktopでは既存の本文幅を維持し、mobileでは親幅が`46rem`未満のため従来どおり全幅で表示。   | 不要     |
| overflow / scroll    | OK   | 共通スキルのdesktop・mobileで横overflowなし。                                                       | 不要     |
| 既存デザインとの整合 | OK   | 既存正本のstandard desktop / mobileの本文可読幅、左右レール、カード3列・2列の構成を変更していない。 | 不要     |

### 自己修正した項目

- `src/layouts/MDXLayout.astro` の`.mdx-layout`へ`margin-inline: auto`を追加し、最大幅のMDX本文を中央カラム内で中央寄せにした。

### 人間判断が必要な差分

- `docs/design/site-layout/`には超横長viewportの正本がない。今回の修正は既存のstandard desktop / mobile正本を変えないため、design画像の更新は行わない。

### design-image-generation への引き継ぎ候補

- [x] 共通スキルページの正本化は、ユーザーレビュー後に`docs/design/common-skills/`をdesign fix modeで扱う。
- [ ] 超横長viewportを`site-layout`の正本として追加する必要がある場合は、別途ユーザー判断後にdesign fix modeで扱う。

### 対応完了チェックリスト

- [x] desktop screenshot を取得した
- [x] mobile screenshot を取得した
- [x] reference と actual を比較した
- [x] 明らかな visual mismatch を修正した、または修正不要と判断した
- [x] design正本の更新が必要な場合は、人間判断項目として記録した
- [x] `npm run check` が通る
- [x] `npm run build` が通る
