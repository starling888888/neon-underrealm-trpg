# 51-53-deployed-site-audit Gate plan

## 親issue

- `docs/issue/51-53-deployed-site-audit.md`

## Gate一覧

| Gate | 状態    | 依存Gate | 子issue                              | 概要                                                                   |
| ---- | ------- | -------- | ------------------------------------ | ---------------------------------------------------------------------- |
| G1   | done    | なし     | なし（ユーザー指示により作成しない） | 公開ページの軽量性を確認する。                                         |
| G2   | done    | G1       | なし（ユーザー指示により作成しない） | GitHub Pagesサブパスと公開asset・個別アンカーを確認する。              |
| G3   | planned | G2       | なし（ユーザー指示により作成しない） | 主要ページ、ナビゲーション、検索、データカードの公開smoke testを行う。 |

状態は `planned`、`in progress`、`done` を使う。

## 完了Gateの引継ぎ

### G1: 公開ページの軽量性

- 確定事項: 通常ページの公開HTMLは静的にカード本文を含む。確認した共通moduleは検索、mobile menu、header制御だけを担い、検索indexは検索panelを開いた後にdynamic importする。キャラクターシートのReact Islandと専用依存は評価対象外とする。
- 後続Gateへの注意: `curl`限定では動的操作と実画面は確認できない。G2 / G3でもHTTPで判断できる結果と未確認事項を分けて記録する。
- archive: 子issueなし。調査証跡は `.tmp/review/51-53-deployed-site-audit/g1-performance-report.md`。

### G2: GitHub Pagesサブパスと公開asset・個別アンカー

- 確定事項: 代表内部route、CSS、JS、画像、OGP、PagefindがGitHub Pages base path配下でHTTP 200。スキル・アイテムの代表個別IDは公開HTMLに含まれる。
- 後続Gateへの注意: `curl`では検索・本文リンクからのフラグメント遷移と画面上のスクロール位置を確認できない。G3では全公開routeのHTTP到達性を確認し、動的操作は未確認として残す。
- archive: 子issueなし。調査証跡は `.tmp/review/51-53-deployed-site-audit/g2-github-pages-base-report.md`。

完了後には、各Gateで確定した詳細要件、判断、後続Gateへの注意だけを追記する。調査証跡、
実装ログ、詳細な修正計画は親issueが定める `.tmp/review/51-53-deployed-site-audit/` に置く。
