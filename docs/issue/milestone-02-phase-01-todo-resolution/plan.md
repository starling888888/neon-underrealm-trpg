# milestone-02-phase-01-todo-resolution Gate plan

## 親issue

- `docs/issue/milestone-02-phase-01-todo-resolution.md`

## 実行方式

- ユーザー指示により子issueは作成しない。親issueを実装契約とする。
- 各Gateは該当TODOだけを対象にし、Gate単位でcommitする。
- `子issue`列の`なし`は、このユーザー指示による例外である。

## Gate一覧

| Gate | 状態    | 依存Gate | 子issue | 概要                                        |
| ---- | ------- | -------- | ------- | ------------------------------------------- |
| G1   | done    | なし     | なし    | TODOの保留・Phase 3への紐付けを記録する     |
| G2   | planned | なし     | なし    | Astro Component contract test基盤を導入する |
| G3   | planned | G2       | なし    | Node testをVitestへ全面移行する             |
| G4   | planned | なし     | なし    | スキルsummary列と保持を削除する             |
| G5   | planned | なし     | なし    | `-local`をPagefind indexから除外する        |
| G6   | planned | なし     | なし    | 派生logicからマスタID解決を分離する         |
| G7   | planned | なし     | なし    | TODO-doneへ退避する項目を記録する           |
