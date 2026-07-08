# 対応済みAgent Failure履歴

このファイルは、`docs/agent-failure-log.md` から退避した対応済みfailureの履歴を保持する。

`docs/agent-failure-log.md` は未反映・未確認failureを中心に保つ。failureを退避する場合は、削除ではなくこのファイルへ移す。

退避判断と恒久対応案の監査は `.agents/skills/failure-log-audit/SKILL.md` に従う。

## 退避条件

- 対象failureへの恒久対応が完了している
- 対応先の `AGENTS.md`、`.agents/skills/*`、`.agents/rules/*`、または関連docsが明記されている
- ユーザーが対応済み扱いを確認している
- コミット指示が出た直前、またはfailure-log監査の承認済み整理として実行する

plan / TODOの完了退避とは条件が異なる。単に作業が終わっただけ、または一時対応だけのfailureは退避しない。

## 記録形式

```md
### failure category

#### YYYY-MM-DD

- 発生箇所:
- 観測した失敗:
- 一次対応:
- 恒久対応:
- moved: YYYY-MM-DD
```

## 対応済み

### PR creation through gh caused body corruption

#### 2026-07-08

- source: user
- 発生箇所: `phase-2-prep-markdown-formatting` のPR #25作成
- 観測した失敗: `gh pr create --body "..."` にMarkdown本文を直接渡したため、shellがバッククォート内をコマンド置換として解釈し、PR本文の `docs/issue/...`、`review-to-issue`、`docs/agent-failure-log.md` が壊れた。さらに `gh pr edit` はGitHub側GraphQLのclassic Projectsフィールドエラーで失敗し、REST API fallbackが必要になった。
- 一次対応: PR本文をREST APIで修正した。
- 恒久対応: PR作成とPR metadata更新をGitHub connector経由で行い、`gh pr create` / `gh pr edit` / `gh api` を標準のPR書き込み経路にしないよう `AGENTS.md`、`.agents/skills/create-pr/SKILL.md`、`.agents/skills/README.md`、`.agents/rules/git-operations.md` へ反映した。
- moved: 2026-07-08
