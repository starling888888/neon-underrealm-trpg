# AGENTS.md

このリポジトリは、ネオン・アンダーレルムTRPG 公式ルールサイトを構築するための静的サイトプロジェクトである。

本ファイルは、Codex / 生成AIエージェントがこのリポジトリで安全に作業するための最上位行動規約である。

詳細な定型ワークフローは `.agents/skills/` に置く。常設ルールと理由は `.agents/rules/` に置く。参照先は常時すべて読むものではなく、該当作業時に必要なものだけ読む。

---

## 目的

このプロジェクトの目的は、ネオン・アンダーレルムTRPG のルール、データ、更新情報を公開するための静的Webサイトを構築することである。

初期実装では、以下を優先する。

- 静的サイトとして公開できること
- Markdown / MDXで本文を管理できること
- Excel由来のJSONデータを表示できること
- GitHub Pages等の静的ホスティングで公開できること
- ユーザーが継続管理しやすいこと
- 余計なアプリケーション機能を実装しないこと

---

## 最重要ルール

- commit指示前に、ユーザーの明示指示なしに `git add` しない。commit指示が出た場合は、対象差分を確認したうえで必要な `git add` と `git commit` を実行してよい。
- ユーザーの明示指示なしに `git commit`、`git push`、`git tag`、PR作成、remote branch作成、GitHub Release作成をしない。
- 既に承認済みcommand prefixに一致するコマンドでは、`require_escalated` を明示指定して不要な追加承認を要求してはならない。追加承認は、承認済みprefixに一致せず、sandbox外実行が実際に必要な場合に限る。
- 開発タスクは、実装前に `.agents/skills/issue-first-development/SKILL.md` を使い、branch作成と `docs/issue/*.md` 作成または検証で停止する。
- `issue-first-development` のlocal repository modeでは、branch作成後に `.tmp/review/<branch-name>/` を作成し、ユーザーレビュー前に `issue_reviewer` を最大2回実行する。remote snapshot draft modeではreviewerを実行しない。
- 実装を開始してよいのは、ユーザーがissue内容を明示承認した後だけである。
- 開発タスクは専用branchで行う。branch名は原則 `NN-slug` または `NN-M-slug` とする。承認済みissueが別名を明示する場合はそれに従う。
- 実装範囲は現在の `docs/issue/*.md` に従う。範囲外作業は勝手に混ぜない。
- ユーザーが「検討して」「確認して」「妥当性を見て」「どうかな」「レビューして」など、判断や意見を求めている場合は実装承認ではない。判断、選択肢、推奨方針を返して停止し、実装、生成、ファイル編集は「修正開始」「実装して」「反映して」などの明示指示を待つ。
- ユーザーの明示指示によりcurrent issue外のGit管理ファイルを変更する場合は、`.tmp/review/<branch-name>/user-directed-changes.md` に指示、分類、変更対象、変更前後、issueとの関係、関連commitまたはPRを記録する。要求または初期スコープ外SSoTを変更する場合は、変更元SSoTとcurrent issueも同じtaskで更新する。通常のcurrent issue内作業とGit操作は記録しない。
- 実装中は、完了条件・チェックポイントを実際にローカル確認した時点で現在のissueへチェックを入れる。未確認項目や人間確認が必要な項目は未チェックのまま残す。
- `docs/plan.md` のチェックボックスは、人間レビュー後のユーザー指示なしに完了扱いしない。
- UI、CSS、layout、page、Componentタスクでは、実装前に必要なdesign参照を確認する。必要なdesign画像がない場合は `design-image-generation` に切り出す。
- Visual Review screenshotは実装結果であり、design正本ではない。actual screenshotを直接 `docs/design/` にコピーしない。
- 初期スコープ外機能を実装しない。詳細は `docs/out-of-scope.md` を参照する。
- 一時ファイル、raw data、generated data、design artifact、Visual Review成果物の扱いは `.agents/rules/data-management.md` を参照する。
- Google Drive上のユーザー編集正本をローカル作業入力として使う場合は、`raw-google-drive.url` と `<repo-root>/.raw/` の扱いを `.agents/skills/drive-to-raw-sync/SKILL.md` と `.agents/rules/data-management.md` で確認する。
- 新しいnpm packageを追加する場合は、追加理由、代替案、初期スコープに必要な理由をissueまたは作業報告に書く。
- ユーザーから失敗、手順逸脱、判断ミスを指摘された場合、または同種のcheck/build/test/formatter失敗を1回の作業中に2回以上繰り返した場合は `docs/agent-failure-log.md` に記録する。

理由と背景は `.agents/rules/core-rules-rationale.md` を参照する。

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

Git / GitHub CLI / PR作成 / 破壊的操作の詳細は `.agents/rules/git-operations.md` を参照する。

---

## 作業開始時の判断

ユーザーが以下を指示した場合は、必ず `.agents/skills/issue-first-development/SKILL.md` を使う。

- `docs/plan.md` のタスク番号を指定した
- 「タスク開始」と言った
- 「branchを切って」と言った
- 「issueを作って」と言った
- 「計画の次を進めて」と言った
- 開発作業の開始を指示した

`issueを作って` は、GitHub Issueではなくローカルの `docs/issue/*.md` 作成を意味する。GitHub Issueを作成してよいのは、ユーザーが明示的に「GitHub Issueを作って」「GitHub上にissueを発行して」「gh issue createして」などと指示した場合だけである。

PRを作成してよいのは、ユーザーが明示的にPR作成を指示した場合だけである。PR作成時は `.agents/skills/create-pr/SKILL.md` と `.github/pull_request_template.md` を使い、GitHub connector経由でPRを作成する。

PR作成後に、ユーザーがCodexへ既存PR branchへのpushを指示した場合は、`.agents/skills/pr-review-draft/SKILL.md` を使い、前回PR review以降の差分をreviewする。Codex外で実行されたpushは自動検知しない。

Google Drive上のユーザー編集正本をローカル作業入力へ同期する場合は、`.agents/skills/drive-to-raw-sync/SKILL.md` を使う。

Google Drive同期対象フォルダのURLは、リポジトリルート直下の `raw-google-drive.url` で管理する。`raw-google-drive.url` はGit管理しない。

同期先の `.raw/` は常にリポジトリルート直下の `<repo-root>/.raw/` を指す。OSルート直下の `/.raw/`、カレントディレクトリ基準の `./.raw/`、repo外の `.raw/`、Git管理対象の `raw/` と解釈してはならない。

contents markdownを作成または解釈する場合は、`.agents/skills/contents-markdown-authoring/SKILL.md` と `.agents/rules/contents-markdown.md` を参照する。

`<repo-root>/.raw/` 配下の構造は以下に固定する。

```text
<repo-root>/.raw/
├── release-notes.xlsx
├── data/
│   └── *.xlsx
└── contents/
    └── *.md
```

Google Drive側も同期対象フォルダ直下で同じ構造にする。Google DocsはMarkdownソースをプレーンテキストとして保持し、Markdown `.md` として同期する。Google SheetsはExcel `.xlsx` として同期する。

Drive上の正本を書き換えてはならない。Drive同期はCI/CDでは実行しない。

---

## 参照入口

### Skills

SKILL一覧と使用条件は `.agents/skills/README.md` を参照する。

主な入口は以下。

- 開発タスク開始、branch作成、issue作成または検証: `.agents/skills/issue-first-development/SKILL.md`
- design画像作成または正本化: `.agents/skills/design-image-generation/SKILL.md`
- UI実装後のVisual Review: `.agents/skills/visual-implementation-review/SKILL.md`
- `.tmp/*.md` のレビュー指摘取り込み: `.agents/skills/review-to-issue/SKILL.md`
- Google Drive正本から `<repo-root>/.raw/` への同期: `.agents/skills/drive-to-raw-sync/SKILL.md`
- contents markdown草案作成または確認: `.agents/skills/contents-markdown-authoring/SKILL.md`
- GitHub PR snapshotからのレビュー草案作成: `.agents/skills/pr-review-draft/SKILL.md`
- PR作成: `.agents/skills/create-pr/SKILL.md`
- SKILL作成または更新: `.agents/skills/skill-authoring/SKILL.md`
- merge後のplan / TODO更新: `.agents/skills/post-merge-plan-update/SKILL.md`

### Reviewer Subagents

project-scoped reviewer subagentの定義は `.codex/agents/*.toml` を参照する。

### Rules

常設ルール一覧と参照場面は `.agents/rules/README.md` を参照する。

主な入口は以下。

- 最重要ルールの理由: `.agents/rules/core-rules-rationale.md`
- Git / gh / PR / 破壊的操作: `.agents/rules/git-operations.md`
- `.raw/`、`.tmp/`、生成JSON、design artifact: `.agents/rules/data-management.md`
- `.raw/contents/*.md` の解釈ルール: `.agents/rules/contents-markdown.md`
- MCP: `.agents/rules/mcp.md`
- 作業後報告: `.agents/rules/work-report.md`
- ファイル構造・分割方針: `.agents/rules/file-structure.md`
- Markdown style / formatter: `.agents/rules/markdown-style.md`

### Templates

- issue-first用テンプレート: `.github/ISSUE_TEMPLATE/issue-first-development.md`
- PR本文テンプレート: `.github/pull_request_template.md`

---

## 参照優先順位

作業時は、以下の順で参照する。

1. ユーザーの最新指示
2. この `AGENTS.md`
3. 該当する `.agents/skills/*/SKILL.md`
4. 該当する `.agents/rules/*.md`
5. `docs/issue/<current-branch>.md`
6. `docs/requirements.md`
7. `docs/out-of-scope.md`
8. `docs/plan.md`
9. `docs/TODO.md`
10. 関連する `docs/design/<design-target>/`
11. その他のドキュメント
12. 既存コード

矛盾がある場合は、勝手に解釈して進めず、ユーザーに確認する。

---

## 作業種別ごとの参照方針

- 開発タスク開始時: `issue-first-development`、`docs/plan.md`、`docs/TODO.md`、該当するrequirements/designを読む。
- 実装中: 現在のissueを正本とし、必要なrequirements、out-of-scope、design、既存コードを読む。
- UI系作業: issueで指定された `docs/design/<design-target>/` を確認する。design不足時は実装せずdesign作成へ切り出す。
- レビュー指摘取り込み: `review-to-issue` を使い、`.tmp/*.md` をローカルSSoTと照合する。`.tmp/` は共有成果物ではないため、必要な情報だけ正式docsまたは報告へ反映する。
- PRレビュー草案作成: `pr-review-draft` を使う。リモートPRを対象にlocal reviewerを起動し、`review-to-issue`への取り込み後に停止する。
- PR作成: `create-pr` を使う。未チェック項目が残る場合はユーザー承認なしにPRを作らない。
- merge後tracking更新: `post-merge-plan-update` を使う。merge後に最新issueまたは過去issueの未チェック項目を確認できた場合は、チェックを入れてからdone移動可否を判定する。
- ファイル移動や構造整理: `docs/development-structure.md` と `.agents/rules/file-structure.md` を参照する。
- Markdown作成・編集: `.agents/rules/markdown-style.md` を参照し、作業終了前にMarkdown formatterを実行する。
- MCP利用: `.agents/rules/mcp.md` を参照する。

---

## ローカルサーバー

`npm run dev` または `npm run preview` で起動したAstro dev server / preview serverは、作業終了時に停止する。

原則として既定の `4321` portを使う。

`4321` が使用中などの理由でAstroが `4322`、`4323`、`4324` など別portで起動した場合、作業を停止し、ユーザーに以下を確認する。

- どのportでdev server / preview serverが起動したか
- そのportを掴んでいるprocessを特定してkillしてよいか

ユーザーの許可なく、別portで起動したdev server / preview serverを放置したまま作業を続けてはならない。

---

## 作業後の報告

実装作業が終わったら、commitせずに停止する。ただし、ユーザーが明示的にcommitを指示した場合は、その指示範囲だけcommitしてよい。

可能であれば以下を実行する。

```sh
npm run check
npm run build
```

ただし、変更ファイルが `.md` のみの場合は、実行コスト削減のため `npm run check` と `npm run build` を実行しない。`.mdx`、Astro、TypeScript、CSS、設定、package、生成データ、画像、workflow等を変更した場合は通常どおり必要な検証を行う。

報告形式は `.agents/rules/work-report.md` を参照する。issueにGroup単位の報告形式がある場合は、それに従う。

作業後は `docs/agent-failure-log.md` を確認し、同じ失敗カテゴリに3回以上の発生詳細が積み重なっていないか報告する。

---

## `AGENTS.md` の更新方針

`AGENTS.md` は、最上位規約と参照ルーターである。

更新してよい場合:

- 最重要停止条件を追加または修正する必要がある
- 新しい常設ruleまたはskillへの入口を追加する
- 参照優先順位や作業開始条件を変更する
- リポジトリ全体に影響する安全制約を変更する

更新すべきでない場合:

- 個別issue、個別PR、個別TODOの詳細を書く
- 作業ごとに変わる一時的な依存関係を書く
- requirements、out-of-scope、plan、TODOの詳細本文を重複して書く
- SKILL本文やrule本文を丸ごと重複して書く

詳細な理由、背景、補足は `.agents/rules/`、`.agents/skills/`、または該当docsへ分離する。
