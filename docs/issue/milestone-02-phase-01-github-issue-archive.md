# milestone-02-phase-01-github-issue-archive

## 目的

完了済みのローカルissue archiveをGitHubのclosed Issueへ移し、リポジトリには進行中issueと軽量なplanだけを残す運用へ切り替える。通常のagent探索対象から過去の詳細issueを外し、現行SSoTと実装契約を判別しやすくする。

## 背景

`docs/issue/milestone-01/done/` には完了済みissueが113件、約2.5MB存在する。Git管理文書から同archiveへの参照も85ファイル・312箇所あり、後続の作業で完了済みissueを現行の契約やSSoTと混同しやすい。

ユーザー指示により、完了済みissueは同名のGitHub Issueへ移してclosedにし、ローカル文書の履歴参照はMarkdownリンクではなくplain-textのGitHub Issue番号と名前へ置き換える。milestone planとGate planはローカルに残し、完了issueの詳細要件・完了条件・引継ぎは削除して、対象issueの名称とGitHub Issue番号だけを保持する。

参照する正本は以下とする。

- `AGENTS.md`
- `.agents/skills/issue-first-development/SKILL.md`
- `.agents/skills/post-merge-plan-update/SKILL.md`
- `.github/ISSUE_TEMPLATE/issue-first-development.md`
- `.github/ISSUE_TEMPLATE/issue-gate-plan.md`
- `docs/issue/milestone-02/plan.md`
- `docs/issue/milestone-01/plan.md`
- `docs/requirements.md`
- `docs/ai-ops.md`
- `docs/development-structure.md`
- `docs/TODO.md`

## 対象範囲

- `docs/issue/milestone-01/done/` 配下の113 Markdownファイルを分類する。
  - 通常の完了issueは、元filenameのslugと同名のGitHub Issueを作成し、最終Markdown本文、元path、関連するPR・commit・完了記録を残してclosedにする。
  - Gate planはGitHub Issueへ移さず、`docs/issue/milestone-01/plans/`へ移して軽量化する。各完了Gateについて、詳細要件・完了条件・引継ぎを削除し、対象issueの名称とGitHub Issue番号だけを残す。
  - phase / archiveのREADMEはGitHub Issueへ移さず、ローカルarchiveとともに削除する。
- 一時inventoryを `.tmp/` に作成し、各対象の元path、slug、分類、現行SSoT監査結果、GitHub Issue番号、本文確認、closed確認、またはGate planの移動先pathを記録する。inventoryはGit管理しない。
- 各GitHub Issue本文には元pathを機械的に照合できるmarkerとして含める。marker検索が0件でinventoryに既存Issue番号がなければ新規作成し、1件なら再利用する。marker検索が複数件の場合、またはinventoryに既存Issue番号があるのにmarker検索が0件の場合は、重複作成・ローカルarchive削除を行わず停止する。
- GitHub Issue作成後、GitHub Issue番号とslugの対応を使って、Git管理文書に残る旧archive path参照をplain-textの `<slug> — GitHub Issue #<number>` 形式へ更新する。Markdownリンクは作らない。
- 完了済みissueごとに、履歴のみか、現行の要件・設計・後続対応をrequirements、design notes、TODO、milestone plan、またはAGENTS / SKILLへ昇格したかをinventoryへ記録する。昇格先と反映済み根拠を確認できない対象は削除しない。
- `docs/issue/milestone-01/done/` と、そのarchive専用のREADMEを削除する。
- 新しいissue運用を、AGENTS、issue-first、post-merge、Gate plan template、README、AI Ops、development structure、milestone planなど必要なGit管理文書へ反映する。
  - 進行中issueだけを `docs/issue/` に置く。milestone planとGate planは、その例外としてローカルに残す。
  - 完了時にはGitHub Issueへ最終契約・完了記録を残してclosedにし、ローカルissueを削除する。
  - milestone planでは、完了issueの詳細要件・完了条件・引継ぎを削除して、issueの名称とGitHub Issue番号だけを残す。check状態の変更は既存の人間確認ルールに従う。
  - 完了済みparentのGate planは `docs/issue/milestone-<NN>/plans/` へ移し、完了Gateごとにissueの名称とGitHub Issue番号だけを残す。
  - GitHub Issue番号は履歴参照の識別子として使い、closed Issueを後続実装のSSoTにはしない。
- 今回の一括移行と将来のpost-mergeで必要なGitHub Issue作成・closeは、ユーザーが常設許可した運用として実行する。GitHub Issueの内容とclosed状態を確認できない場合は、ローカルissueを削除せずに停止する。

## 初期スコープ外

- ルール本文、データ、ページ、UI、Component、CSS、テスト、生成データを変更しない。
- GitHub Issue以外のGitHubリソース（PR、Release、Project、label、milestone、remote branch）を新規作成・変更しない。
- archive以外の完了履歴、`docs/TODO-done.md`、`docs/agent-failure-log-done.md`を削除しない。必要な参照表記だけを更新する。
- GitHub Issue番号とslugの永続的な対応表をローカルに追加しない。
- milestone planのcheck状態を、人間確認なしに更新しない。

## 完了条件

- [ ] `docs/issue/milestone-01/done/` の通常issue、Gate plan、READMEを分類した一時inventoryを作成し、移行対象漏れがないことを確認する。
- [x] 通常issueごとに、元filenameのslugと同名のGitHub Issueが1件だけ作成または再利用され、元path marker、元Markdown本文、完了時点の記録を保持したclosed状態になっている。
- [x] Gate planは `docs/issue/milestone-01/plans/` へ移し、完了Gateの詳細要件・完了条件・引継ぎを削除して、対象issueの名称とGitHub Issue番号だけを保持している。
- [ ] 各移行対象について、履歴のみ、または現行SSoTへの昇格先と確認根拠がinventoryに記録されている。昇格先を確認できない対象は削除していない。
- [x] Git管理文書に残る旧 `docs/issue/milestone-01/done/` path参照を、対応するplain-textのGitHub Issue番号とslugへ置換した、または現行SSoTへ必要な内容を昇格した。
- [ ] inventoryの全対象についてGitHub Issue本文、closed状態、参照置換またはSSoT昇格を確認した後に、`docs/issue/milestone-01/done/` とarchive専用READMEを削除した。
- [x] 今後の完了issueをGitHub closed Issueへ移す運用が、AGENTS、関連SKILL、テンプレート、運用文書で一貫している。
- [x] 今後のmilestone planとGate planをローカルに残し、完了issueの名称とGitHub Issue番号だけを履歴として保持する運用が、AGENTS、関連SKILL、テンプレート、運用文書で一貫している。
- [x] `npm run check:md` が通る。

## チェックポイント

- [x] GitHub Issue番号はGitHub APIまたはGitHub UIで実在・closed状態を確認し、title、元path、本文の対応がinventoryと一致する。
- [x] 移行用の一時inventory、script、認証情報、`.tmp/`成果物をGit管理しない。
- [ ] GitHub Issue本文の元path markerで既存Issueを照合し、0件なら新規作成、1件なら再利用、複数件またはinventoryと不整合なら停止する手順で、重複Issueがないことを確認した。途中失敗時は、inventoryを使って未確認対象だけを再開できる。
- [x] Git管理対象の旧archive path参照が残っていないことを検索で確認する。ただし、このissue自身および移行方針の説明に必要な一般表記は除く。
- [x] GitHub Issue番号なしの「同名issue」参照を作らない。
- [ ] closed GitHub Issueが要件、design、TODO、現行issueに対する唯一の参照先になっていない。
- [x] milestone planとGate planには、完了issueの詳細要件・完了条件・引継ぎを残さず、対象issueの名称とGitHub Issue番号だけが残っている。対応するローカルissueがなかった`01-docs-requirements`は、GitHub Issue未発行の理由と既存plan内容を例外として残す。
- [x] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `AGENTS.md`
- `.agents/skills/issue-first-development/SKILL.md`
- `.agents/skills/post-merge-plan-update/SKILL.md`
- `.agents/skills/README.md`
- `.github/ISSUE_TEMPLATE/issue-gate-plan.md`
- `README.md`
- `docs/ai-ops.md`
- `docs/development-structure.md`
- `docs/issue/milestone-01/README.md`
- `docs/issue/milestone-01/plan.md`
- `docs/issue/milestone-01/plans/*.md`
- `docs/issue/milestone-01/done/**/*.md`
- `docs/agent-failure-log.md`
- `docs/agent-failure-log-done.md`
- `docs/TODO-done.md`
- `docs/design/**/notes.md`
- Git管理文書のうち旧archive pathを参照する必要最小限のファイル

## レビュー観点

- 完了済みissueをリポジトリから除く目的と、GitHub Issueを現在のSSoTにしない境界が明確か。
- GitHub Issueの同名title、Issue番号、ローカルに残す軽量Gate plan、README非移行の扱いが、履歴の追跡に十分か。
- 参照更新がMarkdownリンクを増やさず、旧ローカルpathへの依存をなくせているか。
- 常設許可を前提としたGitHub Issue作成・closeが、post-mergeの完了確認前に実行されないか。
- 一括削除の対象が `docs/issue/milestone-01/done/` に限定され、現行SSoTや未完了情報を失わないか。
- milestone planとGate planが、完了済みissueの詳細を抱えず、後続issue作成に必要な軽量な履歴索引として残るか。

## 備考

- branch: `milestone-02-phase-01-github-issue-archive`
- GitHub Issue作成・closeは、このissue承認後にユーザー指示済みの移行範囲で実行する。
- ユーザーは、将来のpost-mergeで必要なGitHub Issue作成・closeを常設許可した。
- Markdownのみのtaskのため、`npm run check` と `npm run build` は通常実行しない。

## レビュー指摘 1

### 指摘事項

- ユーザーが、GitHub Issue #81 がopenのまま残っていることを指摘した。

### 判定

- source: user
- classification: valid
- 原因: `gh api` がnetwork errorを返したため失敗と判断したが、Issue #81の作成自体は成功しており、close処理が実行されなかった。その後、GitHub connectorで同じ元pathのIssue #78を作成してclosedにしたため、同一archive元の重複Issueが残った。

### 対応

- Issue #81はclosedへ訂正した後、ユーザーがGitHub上で削除した。GitHub APIは削除済みIssueに対して410を返すことを確認した。
- #78を `55-0-sample-characters` の唯一のarchive Issueとして残した。

### 対応完了チェックリスト

- [x] GitHub Issue #81をclosedへ更新した。
- [x] `55-0-sample-characters` の重複Issueをユーザー指示に従って整理した。

## レビュー指摘 2

### 指摘事項

- ユーザーが、`51-performance-pass`、`52-github-pages-base-check`、`53-content-smoke-test` は `51-53-deployed-site-audit` のGitHub Issueに対応すると指摘した。

### 判定

- source: user
- classification: valid
- 原因: plan task名と同名のarchive issueだけを対応表で照合し、3 taskをまとめて扱った親issue `51-53-deployed-site-audit` を見落とした。

### 対応

- 3 taskの履歴参照を `51-53-deployed-site-audit — GitHub Issue #181` に訂正した。
