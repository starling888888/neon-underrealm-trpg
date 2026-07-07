# 完了済みTODO履歴

このファイルは、`docs/TODO.md` から退避した完了済みTODOの履歴を保持する。

`docs/TODO.md` は未対応TODOを中心に保つ。完了済みTODOを退避する場合は、削除ではなくこのファイルへ移す。

## 退避条件

- TODOが対応済みである
- 対応内容がmerge済み、またはユーザーが完了扱いを承認している
- 完了日、対応PRまたはcommit、元TODOのsourceが記録できる
- ユーザーがTODO整理またはpost-merge tracking更新を指示している

## 記録形式

```md
- [x] TODO title
  - completed: YYYY-MM-DD
  - PR: #N または commit: `<hash>`
  - source:
  - handling:
```

## 完了済み

現時点では未退避。
