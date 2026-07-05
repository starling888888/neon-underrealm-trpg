# AGENTS.md

このリポジトリは、ネオン・アンダーレルムTRPG 公式ルールサイトを構築するための静的サイトプロジェクトである。

本ファイルは、Codex / 生成AIエージェントがこのリポジトリで安全に作業するための最上位行動規約である。

詳細な定型ワークフローは `.agents/skills/*/SKILL.md` に分離する。

---

## 目的

このプロジェクトの目的は、ネオン・アンダーレルムTRPG のルール、データ、更新情報を公開するための静的Webサイトを構築することである。

初期実装では、以下を優先する。

* 静的サイトとして公開できること
* Markdown / MDXで本文を管理できること
* Excel由来のJSONデータを表示できること
* GitHub Pages等の静的ホスティングで公開できること
* ユーザーが継続管理しやすいこと
* 余計なアプリケーション機能を実装しないこと

---

## 最重要ルール

### 1. 勝手に git commit しない

生成AIエージェントは、ユーザーから明示的に指示されない限り、`git commit` を実行してはならない。

禁止事項：

* `git commit`
* `git push`
* `git tag`
* Pull Request作成
* リモートブランチ作成
* GitHub Releases作成

変更は作業ツリー上に残し、人間がレビューしてからcommitする。

---

### 2. 実装前に必ず人間レビューを挟む

ユーザーから開発タスクを指示された場合、すぐに実装してはならない。

まず `.agents/skills/issue-first-development/SKILL.md` に従い、以下を行う。

1. タスク番号・内容を確認する
2. 専用branchを作成する
3. `docs/issue/` 配下にタスク定義ファイルを作成する
4. `docs/TODO.md` に関連する未対応項目があれば確認する
5. タスクの目標、完了条件、チェックポイント、対象範囲、初期スコープ外、関連TODO、design参照を記述する
6. そこで停止し、ユーザーのレビューを待つ

ユーザーがタスク定義を承認してから、実装作業を開始する。

---

### 3. 開発タスク開始時は issue-first workflow を使う

以下の場合、必ず `.agents/skills/issue-first-development/SKILL.md` を参照する。

* ユーザーが `docs/plan.md` のタスク番号を指定した
* ユーザーが「タスク開始」と言った
* ユーザーが「branchを切って」と言った
* ユーザーが「issueを作って」と言った
* ユーザーが「計画の次を進めて」と言った
* ユーザーが開発作業の開始を指示した

issue-first workflow は、実装前準備の手順である。

この手順では、branch作成と `docs/issue/*.md` 作成または検証までを行い、そこで停止する。

GitHub snapshotからissue草案を作る場合は、remote snapshot draft modeとして扱う。remote draftはローカルrepoで検証されるまで正式なissueではない。

---

### 4. 作業ブランチを必ず切る

開発タスクを行う場合、必ず専用branchを作成する。

ブランチ名は以下の形式とする。

```txt
NN-slug
```

子タスクの場合は以下の形式とする。

```txt
NN-M-slug
```

例：

```txt
01-docs-requirements
06-config-base-path
12-1-mobile-menu-drawer
39-2-ryugi-detail-template
```

既に同名branchが存在する場合は、勝手に上書きせず、作業を停止してユーザーに確認する。

---

### 5. タスク定義ファイルを必ず作る

タスク開始時には、対応するissueファイルを作成する。

配置場所：

```txt
docs/issue/
```

ファイル名はbranch名と一致させる。

例：

```txt
docs/issue/06-config-base-path.md
docs/issue/12-1-mobile-menu-drawer.md
docs/issue/39-2-ryugi-detail-template.md
```

issueファイルの詳細な形式は `.agents/skills/issue-first-development/SKILL.md` に従う。

---

## 実装開始条件

実装を開始してよいのは、ユーザーが明示的に承認した場合のみである。

承認例：

```txt
OK、進めて
この内容で実装して
レビューした。開発して
承認。実装開始
```

承認がない場合、issueファイル作成後に実装を始めてはならない。

remote snapshot draftから作られたissue草案は、ローカルrepoで検証されるまで実装開始条件を満たさない。

---

## 実装中のルール

### 1. タスク範囲を超えない

`docs/issue/NN-slug.md` に書かれた対象範囲を超えて実装してはならない。

関連して修正が必要に見える場合でも、以下のいずれかにする。

* issueファイルに追記案を出してユーザーに確認する
* 別タスクとして分離する
* current issueで対応しない有効な項目として `docs/TODO.md` に追跡する

---

### 2. review-to-issue と TODO の扱い

`.tmp/*.md` のレビュー指摘を扱う場合は、`.agents/skills/review-to-issue/SKILL.md` に従う。

review-to-issue の intake では、指摘をローカルSSoTと照合し、以下へ振り分ける。

* current issueで対応すべき指摘は `docs/issue/*.md` の `レビュー指摘 N` に取り込む
* current issueで対応しないが有効な指摘は `docs/TODO.md` にチェックボックスで追記する
* 対応すべき計画がないTODOは、`docs/plan.md` の適切な箇所に未完了タスクを追加したうえでTODOへ紐づける

`docs/TODO.md` は、current issue外の有効な後続作業を追跡するためのファイルである。current issueで対応すべき修正をTODOへ逃がしてはならない。

---

### 3. PRレビュー草案の扱い

GitHub PR snapshotからレビュー草案を作る場合は、`.agents/skills/pr-review-draft/SKILL.md` に従う。

PRレビュー草案は `.tmp/*.md` に転記できる入力であり、ローカル検証済みレビューではない。

PRレビュー草案は、直接 `docs/issue/*.md`、`docs/TODO.md`、`docs/plan.md` を更新しない。正式な取り込みは `review-to-issue` でローカルSSoTと照合してから行う。

---

### 4. UI実装前にdesign画像を生成する

UI、CSS、layout、page、Componentを実装するタスクでは、実装開始前に対象画面またはComponentのdesign画像を確認する。

必要なdesign画像がない場合は、`.agents/skills/design-image-generation/SKILL.md` の initial draft mode に従ってdesign画像を作成する。

生成したdesign画像は、承認後にVisual Reviewの正本として `docs/design/<design-target>/` 配下に配置する。

UI実装タスクのissueファイルには、参照するdesign targetと主要なdesign画像、またはdesign画像生成が必要な前提条件を記載する。

未承認のinitial draftを、最終的なdesign正本として扱ってはならない。

---

### 5. Visual Review と design正本化を分離する

Visual Reviewは、承認済みUI実装後に `.agents/skills/visual-implementation-review/SKILL.md` に従って行う。

Visual Reviewで取得するスクリーンショットはactual artifactであり、design正本ではない。

実装スクリーンショットを新しいdesign正本として採用する場合は、`.agents/skills/design-image-generation/SKILL.md` の design fix mode に従う。

design fix modeでは、既存designとの差分と正本化理由を記録し、明示承認後に `docs/design/<design-target>/` へ反映する。

Visual Reviewの失敗を隠す目的で、actual screenshotを直接 `docs/design/` にコピーしてはならない。

---

### 6. 余計な機能を実装しない

以下は初期スコープ外である。

* GMガイド
* シナリオ本文
* キャンペーン管理
* キャラクター作成ウィザード
* Webキャラクターシート
* ダイスローラー
* 戦闘シミュレーター
* CMS
* ログイン・認証
* コメント・投稿機能
* DB利用
* サーバーサイド処理
* 外部検索サービス連携
* PDF自動生成
* PWA対応
* 多言語対応
* 高度な画像最適化
* 高度な一覧フィルタ
* 用語集専用ページ
* パンくずリスト
* ページ末尾の前後ナビゲーション
* ページ内目次の現在位置ハイライト
* 個別OGP画像生成
* 高度なアニメーション
* 過剰なUIライブラリ導入

詳細は `docs/out-of-scope.md` を参照する。

これらは実装だけでなく、design画像にも描き込んではならない。必要に見える場合は、将来対応候補として `docs/TODO.md` または `docs/plan.md` に分離する。

---

### 7. 静的サイト方針を守る

このサイトは静的サイトとして構築する。

初期実装では以下に依存してはならない。

* DB
* 常駐サーバー
* SSR必須機能
* 認証
* 管理画面
* APIサーバー
* 外部検索サービス
* Secrets必須の構成

GitHub Pages等の静的ホスティングで公開できる構成を維持する。

---

### 8. データ管理方針を守る

Excel本体は `.raw/` 配下でローカル管理する。

`.raw/` はGit管理しない。

Git管理するのは、Excelから変換された `data/generated/` 配下のJSONである。

`data/generated/` のJSONは原則として生成物であり、手編集を前提にしない。

Excel変換仕様が未確定の段階で、変換処理を過剰に作り込んではならない。

一時レビュー用ファイル、比較用メモ、作業中のスクラッチファイルなど、Git管理しない一時ファイルは `.tmp/` 配下に置く。

`.tmp/` の内容は共有成果物として扱わず、必要な情報だけを正式なドキュメントや作業報告へ反映する。

Visual Reviewで参照するデザイン正本は `docs/design/<design-target>/` に置く。

Visual Reviewで取得するスクリーンショットやレポートはPlaywrightの `test-results/` / `playwright-report/` に出力し、Git管理しない。

---

### 9. `.raw/` と `.tmp/` をGit管理しない

`.raw/` はローカル作業用ディレクトリである。

`.gitignore` に以下を含める。

```gitignore
.raw/
.tmp/
test-results/
playwright-report/
*.xlsx
*.xlsm
~$*.xlsx
```

`.raw/` 配下のファイルをGit管理してはならない。

`.tmp/` 配下のファイルをGit管理してはならない。

Visual Review成果物として生成される `test-results/` と `playwright-report/` をGit管理してはならない。

---

### 10. `docs/plan.md` のチェックは勝手に完了扱いしない

`docs/plan.md` または `plan.md` にチェックボックスがある場合、生成AIエージェントは勝手に完了チェックを入れてはならない。

完了チェックは、人間レビュー後にユーザーの指示で更新する。

---

### 11. 依存関係を増やす場合は理由を書く

新しいnpm packageを追加する場合は、issueファイルまたは作業報告に以下を書く。

* 追加したpackage名
* 追加理由
* 代替案
* 初期スコープに必要な理由

UIライブラリ、大規模フレームワーク、状態管理ライブラリは原則追加しない。

---

## 禁止コマンド

明示指示がない限り、以下を実行してはならない。

```sh
git commit
git push
git tag
git reset --hard
git clean -fd
git rebase
git merge
```

特に `git reset --hard` と `git clean -fd` は、ユーザーの未保存作業を破壊する可能性があるため禁止する。

---

## 破壊的変更の扱い

以下に該当する作業は、必ず事前にユーザー確認を取る。

* ファイル削除
* ディレクトリ削除
* 大規模な移動
* 既存APIの変更
* 既存URLの変更
* packageの大幅変更
* formatterによる大量差分
* 生成データの大量更新

---

## 作業後の報告

実装作業が終わったら、commitせずに停止する。

報告には以下を含める。

```md
## 作業結果

- 実装した内容
- 変更したファイル
- 実行したコマンド
- 成功した確認
- 失敗または未確認の項目
- レビューしてほしい点

## Git操作

- commit: 未実行
- push: 未実行
```

可能であれば以下を実行する。

```sh
npm run check
npm run build
```

ただし、プロジェクト初期段階で該当コマンドが存在しない場合は、その旨を報告する。

---

## 参照優先順位

作業時は、以下の順で参照する。

1. ユーザーの最新指示
2. この `AGENTS.md`
3. 該当する `.agents/skills/*/SKILL.md`
4. `docs/issue/NN-slug.md`
5. `docs/requirements.md`
6. `docs/out-of-scope.md`
7. `docs/plan.md`
8. `docs/TODO.md`
9. 関連する `docs/design/<design-target>/`
10. その他のドキュメント
11. 既存コード

矛盾がある場合は、勝手に解釈して進めず、ユーザーに確認する。

---

## 技術スタック方針

初期実装の技術スタックは以下を前提とする。

* Astro
* MDX
* TypeScript strict
* Zod
* Pagefind
* Node.js / TypeScript scripts
* ExcelJS
* GitHub Actions
* GitHub Pages
* Astro scoped CSS + CSS variables

このサイトはサーバーサイド処理、DB、認証、CMSを前提にしない。

Markdown / MDX本文、Excelから変換したJSON、Astro Componentを組み合わせて静的HTMLを生成する。

---

## コーディング方針

### TypeScript

* TypeScriptを使用する
* 可能な範囲でstrict前提にする
* `any` の多用を避ける
* データ構造はZod schemaと型で定義する

### Astro / MDX

* 手書き本文はMDXを基本とする
* データ駆動ページはAstroで生成する
* Markdown本文とデータ表示Componentを分離する
* MDX内に大量の生データを直接書かない

### CSS

* Astro Componentのscoped CSSと共通CSSを使う
* 大規模UIライブラリを前提にしない
* 可読性、保守性、軽量性を優先する

### データ表示

* スキル、アイテム、流儀、生き様はJSONデータから表示する
* 表示Componentにデータ取得ロジックを散らしすぎない
* `src/lib/data/` を経由してデータを取得する

---

## 将来拡張に関する扱い

以下は将来対応可能だが、初期実装には含めない。

### アクセス解析

Cloudflare Web Analytics、Plausible、Umami等のJSスニペット型アクセス解析は将来追加可能。

ただし、初期実装では追加しない。

追加する場合は、独立したタスクとbranchで行う。

### キャラクターシート作成

将来的に `/tools/character-sheet` のようなクライアントサイドツールとして実装可能。

想定機能：

* PDF出力
* JSON出力
* JSON読み込み
* DBなし
* localStorageによる補助保存

ただし、初期実装では作らない。

追加する場合は、ルールサイト本体とは分離したサブアプリとして設計する。

---

## 完了の定義

タスク完了とは、以下を満たす状態を指す。

* issueファイルに書かれた完了条件を満たしている
* 初期スコープ外の機能を実装していない
* 不要な依存関係を追加していない
* 既存ページや既存導線を壊していない
* 関連する `docs/TODO.md` 項目を処理した、または未処理理由を記録している
* UI系タスクでは、必要なdesign正本とVisual Reviewの扱いが記録されている
* 可能な範囲で `npm run check` が通る
* 可能な範囲で `npm run build` が通る
* commitしていない
* 作業結果を人間レビュー可能な形で報告している

---

## このリポジトリでの生成AIエージェントの役割

生成AIエージェントの役割は、実装を勝手に進めることではない。

役割は以下である。

* 指示された範囲を明確化する
* レビュー可能な単位に分割する
* 安全にbranchを切る
* 作業前にissueファイルを作る
* PRレビュー草案やremote issue草案を正式作業と混同しない
* 必要に応じて `docs/TODO.md` に後続対応を追跡する
* 人間レビュー後に実装する
* commitせずに作業結果を提示する

不明点がある場合は、推測で実装せず、停止して確認する。
