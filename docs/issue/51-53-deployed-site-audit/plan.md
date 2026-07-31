# 51-53-deployed-site-audit Gate plan

## 親issue

- `docs/issue/51-53-deployed-site-audit.md`

## Gate一覧

| Gate | 状態 | 依存Gate | 子issue                              | 概要                                                                   |
| ---- | ---- | -------- | ------------------------------------ | ---------------------------------------------------------------------- |
| G1   | done | なし     | なし（ユーザー指示により作成しない） | 公開ページの軽量性を確認する。                                         |
| G2   | done | G1       | なし（ユーザー指示により作成しない） | GitHub Pagesサブパスと公開asset・個別アンカーを確認する。              |
| G3   | done | G2       | なし（ユーザー指示により作成しない） | 主要ページ、ナビゲーション、検索、データカードの公開smoke testを行う。 |

状態は `planned`、`in progress`、`done` を使う。

## 完了Gateの引継ぎ

### G1: 公開ページの軽量性

- 確定事項: 通常ページの公開HTMLは静的にカード本文を含む。確認した共通moduleは検索、mobile menu、header制御だけを担い、検索indexは検索panelを開いた後にdynamic importする。Playwrightで通常35 routeを補完確認し、eager画像はheroだけ、通常ページの実行時JavaScriptは共通2本、外部originへのresource要求は0件だった。キャラクターシートのReact Islandと専用依存は評価対象外とする。
- 後続Gateへの注意: `curl`限定では動的操作と実画面は確認できない。G2 / G3でもHTTPで判断できる結果と未確認事項を分けて記録する。
- archive: 子issueなし。調査証跡は `.tmp/review/51-53-deployed-site-audit/g1-performance-report.md`。

### G2: GitHub Pagesサブパスと公開asset・個別アンカー

- 確定事項: 代表内部route、CSS、JS、画像、OGP、PagefindがGitHub Pages base path配下でHTTP 200。スキル・アイテムの代表個別IDは公開HTMLに含まれる。
- 後続Gateへの注意: 初回の`curl`確認では検索・本文リンクからのフラグメント遷移と画面上のスクロール位置を確認できなかったが、G3後の追加browser smoke testで代表検索結果・個別アンカーは確認済み。全カード・全viewportの網羅確認は実施しない。
- archive: 子issueなし。調査証跡は `.tmp/review/51-53-deployed-site-audit/g2-github-pages-base-report.md`。

### G3: 主要ページ、ナビゲーション、検索、データカードの公開smoke test

- 確定事項: Pagefindの公開content数35と、HTTP 200を確認した35 routeが一致する。404 pageとunknown routeの404応答も確認した。公開HTMLにはサイトメニュー、PageToc、検索UI、データカードがある。
- 後続Gateへの注意: 追加browser smoke testでdesktop検索、tablet MobilePageToc、mobile menu / 検索、代表検索結果と直接個別アンカー、404を確認済み。全カード・全viewportの網羅的Visual Reviewは実施しない。
- archive: 子issueなし。調査証跡は `.tmp/review/51-53-deployed-site-audit/g3-content-smoke-report.md`。

完了後には、各Gateで確定した詳細要件、判断、後続Gateへの注意だけを追記する。調査証跡、
実装ログ、詳細な修正計画は親issueが定める `.tmp/review/51-53-deployed-site-audit/` に置く。
