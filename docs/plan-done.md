# 完了済み計画履歴

このファイルは、`docs/plan.md` から退避した完了済み計画項目の履歴を保持する。

`docs/plan.md` は未完了・進行対象・直近で参照する計画を中心に保つ。完了済みの計画項目を退避する場合は、削除ではなくこのファイルへ移す。

## 退避条件

- 対象計画がmerge済みである
- 対応issueの完了条件とチェックポイントが確認済みである
- 後続作業者がactive plan側で常時読む必要がない
- ユーザーがplan更新またはpost-merge tracking更新を指示している

## 記録形式

退避する項目は、元のphase、task ID、完了日、関連PRまたはcommitが分かる形で残す。

```md
## Phase N

- [x] `NN-task-slug` — task summary
  - completed: YYYY-MM-DD
  - PR: #N または commit: `<hash>`
```

## 完了済み

現時点では未退避。
