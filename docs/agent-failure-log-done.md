# 対応済みAgent Failure履歴

このファイルは、`docs/agent-failure-log.md` から退避した対応済みfailureの履歴を保持する。

`docs/agent-failure-log.md` は未反映・未確認failureを中心に保つ。failureを退避する場合は、削除ではなくこのファイルへ移す。

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

現時点では未退避。
