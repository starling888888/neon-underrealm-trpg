# 51-53-deployed-site-audit Gate plan

## 親issue

- `docs/issue/51-53-deployed-site-audit.md`

## Gate一覧

| Gate | 状態    | 依存Gate | 子issue                              | 概要                                                                   |
| ---- | ------- | -------- | ------------------------------------ | ---------------------------------------------------------------------- |
| G1   | planned | なし     | なし（ユーザー指示により作成しない） | 公開ページの軽量性を確認する。                                         |
| G2   | planned | G1       | なし（ユーザー指示により作成しない） | GitHub Pagesサブパスと公開asset・個別アンカーを確認する。              |
| G3   | planned | G2       | なし（ユーザー指示により作成しない） | 主要ページ、ナビゲーション、検索、データカードの公開smoke testを行う。 |

状態は `planned`、`in progress`、`done` を使う。

## 完了Gateの引継ぎ

完了後には、各Gateで確定した詳細要件、判断、後続Gateへの注意だけを追記する。調査証跡、
実装ログ、詳細な修正計画は親issueが定める `.tmp/review/51-53-deployed-site-audit/` に置く。
