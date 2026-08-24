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
- 既に承認済みcommand prefixに一致するコマンドでは、`require_escalated` を明示指定して不要な追加承認を要求してはならない。追加承認は、承認済みprefixに一致せず、sandbox外実行が実際に必要な場合に限る。承認済みの状態変更Git操作（`git add`、`git commit`、`git push`など）は1つずつ実行し、`&&`、`;`、pipe、subshellでほかのGit操作と連結してはならない。
- agentが直接発行するshell commandで、`XXX=hogehoge command` のように環境変数をコマンド行で指定する形式は実行してはならない。環境変数の設定が必要なツールは、対象の`.env`ファイルで指定する。package script内部の固定設定はこの規則の対象外とする。
- 実装タスクは、実装前に `.agents/skills/issue-first-development/SKILL.md` を使い、ユーザーが明示的に許可した `docs/issue/*.md` 作成または検証で停止する。task番号、`$issue-first-development` の呼び出し、branch作成指示、開発開始指示だけではissue作成を許可しない。
- ユーザーがscope調整、requirements調整、contents作成だけを指示した場合は、issueを作成せずに該当skillまたは作業だけを行い、その完了時に判断・未確定事項を返して停止する。ユーザーがissueを作成しないと明示した場合は、その指定を優先する。
- `issue-first-development` のlocal repository modeでissue review agent（`issue_reviewer`または`gate_issue_reviewer`）を実行してよいのは、このworkflowでユーザー許可済みのローカルissueを作成した後だけである。issueを作成していないbranch準備、scope調整、requirements調整、contents作成ではreviewerを実行しない。remote snapshot draft modeではreviewerを実行しない。
- 実装を開始してよいのは、ユーザーがissue内容を明示承認した後だけである。
- 開発タスクは専用branchで行う。branch名は原則 `NN-slug` または `NN-M-slug` とする。承認済みissueが別名を明示する場合はそれに従う。
- Gate planとGate子issueを使うのは、ユーザーがGate作成またはGate分割を明示指示した場合だけとする。通常のissue作成では、`docs/issue/<issue名>.md` を単独の実装契約とし、`docs/issue/<issue名>/plan.md` を作成しない。
- `docs/issue/milestone-<NN>/plan.md` は、milestoneの計画・履歴専用pathでありGate planではない。Gate一覧やGate固有の引継ぎを置かず、`docs/issue/<parent-issue>/plan.md` のGate planと混同しない。
- Gateを実装する時は、対象Gate専用の子issueを作成し、その子issueを実装契約とする。子issueは、親issue全体の会話や履歴を前提にせず、新しいsessionだけで作業を開始できる最小限で自己完結した情報を持つ。
- 完了済みissueの最終契約・完了記録は同名のGitHub closed Issueへ残し、ローカルのissue fileは削除する。GitHub Issueの番号は履歴識別子であり、後続実装のSSoTにはしない。
- milestone planとGate planはローカルに残す例外である。完了issueのplan記録は `<issue-slug> — GitHub Issue #<number>` だけに縮約し、詳細要件・完了条件・実装経緯は残さない。完了した親issueのGate planは `docs/issue/milestone-<NN>/plans/` に置く。
- Gate完了後は、子issueの完了確認、同名GitHub closed Issueへの記録、Gate planの軽量な履歴更新を済ませてから、子issueを削除する。実装中の経緯、重複した背景、会話依存の情報はplanへ戻さない。
- 実装範囲は、通常issueでは現在のissue、Gateを使う場合は現在のGate子issueと親issueの専用Gate planに従う。範囲外作業は勝手に混ぜない。
- ユーザーが「検討して」「確認して」「妥当性を見て」「どうかな」「レビューして」など、判断や意見を求めている場合は実装承認ではない。判断、選択肢、推奨方針を返して停止し、実装、生成、ファイル編集は「修正開始」「実装して」「反映して」などの明示指示を待つ。
- ユーザーの明示指示によりcurrent issue外のGit管理ファイルを変更する場合は、`.tmp/review/<branch-name>/user-directed-changes.md` に指示、分類、変更対象、変更前後、issueとの関係、関連commitまたはPRを記録する。要求または初期スコープ外SSoTを変更する場合は、変更元SSoTとcurrent issueも同じtaskで更新する。通常のcurrent issue内作業とGit操作は記録しない。
- 実装中は、完了条件・チェックポイントを実際にローカル確認した時点で現在のissueへチェックを入れる。未確認項目や人間確認が必要な項目は未チェックのまま残す。
- レビューと完了チェックの前に、対象条件ごとの現在の根拠を照合する。根拠が不足する場合は完了扱いにせず停止し、ユーザーの指示を受けて修正する。
- `docs/issue/milestone-<NN>/plan.md` のチェックボックスは、人間レビュー後のユーザー指示なしに完了扱いしない。
- UI、CSS、layout、page、Componentタスクでは、実装前に必要なdesign intentとVRT参照情報を確認する。必要なdesign notesがない場合は `design-image-generation` に切り出す。
- Visual Review screenshotは実装結果であり、design正本ではない。actual screenshotを直接 `docs/design/` にコピーしない。
- Visual Reviewで`確認済み`、`問題なし`、`枠内に収まる`などの肯定報告をしてよいのは、対象route・state・viewportごとのactual screenshotを実際に開き、issueの表示契約に対して確認した後だけである。対象stateはVRT specだけでなく、current issueの受入条件と最終diffから列挙する。tooltip、dialog、drawer、validationのように表示状態を変えるUIを変更した場合、defaultだけで肯定報告してはならない。`visual:capture`の成功、snapshotの生成、VRT commandの終了出力だけを実画面確認の根拠にしてはならない。
- 肯定報告後にユーザーまたはagentが視覚上の失敗を発見した場合は、実装不備と分けて「未確認または誤った確認結果を報告した失敗」として`docs/agent-failure-log/active.md`とcurrent issueを訂正する。対象issueをGitHubへcloseしてローカルから削除せず、各対象actual screenshotを再確認してから未完了チェックを更新する。
- VRTは高コストな比較である。Markdownのみの変更、または画面に影響しない開発中の反復確認では実行しない。UI、CSS、layout、page、Componentを変更した場合だけ、PRレビュー直前に変更した画面のtargetへ限定して実行する。ローカルで全件VRTを通常実行しない。全件VRTはGitHub Actionsの定期実行または公開直後の実行として別taskで整備する。
- 初期スコープ外機能を実装しない。詳細は `docs/out-of-scope.md` を参照する。
- 一時ファイル、raw data、generated data、design artifact、Visual Review成果物の扱いは `.agents/rules/data-management.md` を参照する。
- Google Spreadsheetをローカル入力へ同期する場合は、`frontend/.env`の認証情報を使う`npm --workspace=@neon-underrealm/frontend run sync:google-sheets`だけを用いる。Google Driveへ書き込んではならず、Google Docsの自動同期は行わない。
- 新しいnpm packageを追加する場合は、追加理由、代替案、初期スコープに必要な理由をissueまたは作業報告に書く。
- ユーザーから失敗、手順逸脱、判断ミスを指摘された場合、またはagent自身が通常のbuild、test、型検査で同一testまたは同一commandの失敗を1回の作業中に3回以上連続して観測した場合は `docs/agent-failure-log/active.md` に記録する。formatterまたはlinterの指摘は、同一作業中に修正して最終確認できれば通常の開発ループとして扱い、failure logへ記録・報告しない。
- Chromiumのsandbox起動失敗はfailure logへ記録せず、必要な権限手順を経てsandbox外で同じbrowser testを再実行する。sandbox外でも失敗した場合は通常の検証失敗として扱う。

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

- `docs/issue/milestone-<NN>/plan.md` のタスク番号を指定した
- 「タスク開始」と言った
- 「branchを切って」と言った
- 「issueを作って」と言った
- 「計画の次を進めて」と言った
- 開発作業の開始を指示した

`issueを作って` は、GitHub Issueではなくローカルの `docs/issue/*.md` 作成を意味する。GitHub Issueを作成してよいのは、ユーザーが明示的に「GitHub Issueを作って」「GitHub上にissueを発行して」「gh issue createして」などと指示した場合、またはユーザー承認済みのpost-merge完了処理である場合だけである。

`docs/issue/milestone-<NN>/plan.md` のタスク番号指定、`$issue-first-development` の呼び出し、task開始、branch作成は、該当skillを参照してユーザー指示を安全に実行する契機であり、ローカルissue作成の許可ではない。issueを作成しないと明示された場合、またはscope、requirements、contentsだけが指示された場合は、issue作成とissue review agentを行わない。

PRを作成してよいのは、ユーザーが明示的にPR作成を指示した場合だけである。PR作成時は `.agents/skills/create-pr/SKILL.md` と `.github/pull_request_template.md` を使い、GitHub connector経由でPRを作成する。

PR作成後に、ユーザーがCodexへ既存PR branchへのpushを指示した場合は、`.agents/skills/pr-review-draft/SKILL.md` を使い、前回PR review以降の差分をreviewする。Codex外で実行されたpushは自動検知しない。

Google Spreadsheetをローカル作業入力へ同期する場合は、`frontend/.env`で指定したDriveフォルダIDを使い、`npm --workspace=@neon-underrealm/frontend run sync:google-sheets`を手動で実行する。

同期先の `.raw/` は常にリポジトリルート直下の `<repo-root>/.raw/` を指す。OSルート直下の `/.raw/`、カレントディレクトリ基準の `./.raw/`、repo外の `.raw/`、Git管理対象の `raw/` と解釈してはならない。

contents markdownを作成または解釈する場合は、`.agents/skills/contents-markdown-authoring/SKILL.md` と `.agents/rules/contents-markdown.md` を参照する。

`.raw/contents/<slug>.md`は、必要に応じてユーザーが手動で置くGit非管理の補助入力である。ページ本文・可視構成のGit管理上の正本は`frontend/src/pages/`配下のMDX / Astroとし、contentsが矛盾しても自動的に既存実装やGit管理文書を上書きしない。

Google Spreadsheet同期は、指定Driveフォルダ配下のフォルダ構造をそのまま`.raw/`配下へ再帰的にコピーする。Google Docsその他のファイルは同期しない。同期はローカル開発用の手動scriptだけに閉じ、CI/CD、build、runtimeでは実行しない。

---

## 参照入口

### Skills

SKILL一覧と使用条件は `.agents/skills/README.md` を参照する。

主な入口は以下。

- 開発タスク開始、branch作成、issue作成または検証: `.agents/skills/issue-first-development/SKILL.md`
- design intent / VRT参照情報の作成またはbaseline更新: `.agents/skills/design-image-generation/SKILL.md`
- UI実装後のVisual Review: `.agents/skills/visual-implementation-review/SKILL.md`
- `.tmp/*.md` のレビュー指摘取り込み: `.agents/skills/review-to-issue/SKILL.md`
- Google Spreadsheetから `<repo-root>/.raw/` への同期: `npm --workspace=@neon-underrealm/frontend run sync:google-sheets`
- contents markdown草案作成または確認: `.agents/skills/contents-markdown-authoring/SKILL.md`
- ChatGPTからのcontents markdown草案作成または確認: `.agents/skills/remote-contents-markdown-authoring/SKILL.md`
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
3. 該当する `.agents/skills/*/SKILL.md` と `.agents/rules/*.md` の安全・workflow規約
4. 現在のissue（Gate実装時は `docs/issue/<child-issue>.md`）
5. Gate実装時は親issueの `docs/issue/<parent-issue>/plan.md`
6. `docs/requirements.md`
7. `docs/out-of-scope.md`
8. `docs/issue/milestone-<NN>/plan.md`
9. `docs/TODO.md`
10. 関連する `docs/design/<design-target>/`
11. その他のGit管理ドキュメント
12. `src/pages/`配下のMDX / Astro実装
13. 対応する`.raw/contents/<slug>.md`の本文とHTMLコメント（手動の補助入力）

contentsがGit管理の正本と矛盾する場合は、最新のユーザー指示がない限りGit管理の正本を採用する。ユーザー指示または本ファイルの安全・workflow規約と矛盾する場合は、実装せずユーザーに確認する。

---

## 作業種別ごとの参照方針

- 開発タスク開始時: `issue-first-development`、`docs/issue/milestone-<NN>/plan.md`、`docs/TODO.md`、該当するrequirements/designを読む。Gate作成またはGate分割を明示指示された場合だけ、親issueと同時に `docs/issue/<親issue名>/plan.md` を作成し、Gateを列挙する。
- Gate実装開始時: 親issueの専用Gate planから対象Gateだけを読み、専用子issueを作成または検証する。子issueは新しいsessionで独立して作業できることを確認してから、ユーザー承認を待つ。
- 実装中: 現在のissueを正本とし、Gateを使う場合は必要な親issueの専用Gate plan、requirements、out-of-scope、design、Git管理のMDX / Astro実装を読む。`.raw/contents/`がある場合は手動の補助入力として参照できるが、Git管理の正本より優先しない。
- UI系作業: issueで指定された `docs/design/<design-target>/` を確認する。design不足時は実装せずdesign作成へ切り出す。
- レビュー指摘取り込み: `review-to-issue` を使い、`.tmp/*.md` をローカルSSoTと照合する。`.tmp/` は共有成果物ではないため、必要な情報だけ正式docsまたは報告へ反映する。
- PRレビュー草案作成: `pr-review-draft` を使う。リモートPRを対象にlocal reviewerを起動し、`review-to-issue`への取り込み後に停止する。
- PR作成: `create-pr` を使う。未チェック項目が残る場合はユーザー承認なしにPRを作らない。
- merge後tracking更新: `post-merge-plan-update` を使う。merge後にissueの未チェック項目を確認できた場合は、GitHub closed Issueへの記録とローカルissue削除の可否を判定する。
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

作業後は `docs/agent-failure-log/active.md` の全文を常時コンテキストへ載せず、3回以上のactive categoryを集計して確認・報告する。失敗を追記する時は、関連するcategoryとtitleだけを検索する。`failure-log-audit`を明示された時だけactive log全文を読む。

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
