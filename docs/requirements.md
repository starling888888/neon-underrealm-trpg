# 要件索引

このファイルは、ネオン・アンダーレルムTRPG公式ルールサイトの要件参照入口である。詳細要件は `docs/requirements/` 配下へ、作業時の参照単位で分割する。

作業時に全詳細ファイルを常時読む必要はない。変更対象に関係する要件ファイルと、必要な正本だけを参照する。

## 位置づけ

- サイト全体の要求事項は、この索引と `docs/requirements/*` を参照する。
- 初期スコープ外の判定は `docs/out-of-scope.md` を正本とする。
- Excel変換仕様、JSON出力仕様、変換処理の詳細は、作成後の `docs/conversion/*` を正本とする。
- 実装ファイル、script、Component、補助ドキュメントの配置方針は `docs/development-structure.md` を正本とする。
- 具体的な作業範囲と完了条件は、承認済みの `docs/issue/<issue-slug>.md` を優先する。
- 対応する `.raw/contents/<slug>.md` があるページでは、ユーザー編集のMarkdown本文とHTMLコメントを、ページ本文・可視の表示構成に関する正本とする。ユーザーの最新指示、および `AGENTS.md` と該当skill・ruleの安全・workflow規約を除き、issue、要件、out-of-scope、plan、TODO、design、既存実装より優先する。

## 参照優先順位

要件・計画・issue間で判断が必要な場合は、次の順で確認する。

1. ユーザーの最新指示
2. `AGENTS.md`
3. 対応する `.raw/contents/<slug>.md` のMarkdown本文とHTMLコメント（ページ本文・可視の表示構成に限る）
4. 該当skill・ruleの安全・workflow規約
5. 承認済みの `docs/issue/<issue-slug>.md`
6. この索引と関連する `docs/requirements/*`
7. `docs/out-of-scope.md`
8. `docs/conversion/*`
9. `docs/development-structure.md`
10. `docs/plan.md`
11. `docs/TODO.md`

contentsと下位文書が矛盾する場合は、ユーザー承認のもとで下位文書をcontentsへ合わせて修正してから実装する。ユーザーの最新指示または安全・workflow規約と矛盾する場合は、推測で実装せずユーザーに確認する。

## 要件ファイル一覧

| ファイル                                 | 扱う内容                                                  | 主な参照場面                       |
| ---------------------------------------- | --------------------------------------------------------- | ---------------------------------- |
| `docs/requirements/overview.md`          | サイト目的、基本方針、初期スコープ外                      | タスクの前提確認、scope guard      |
| `docs/requirements/architecture.md`      | 静的サイト、コンテンツ管理、Excel由来データ、技術スタック | 基盤、データ変換、ビルド、構成判断 |
| `docs/requirements/non-functional.md`    | コマンド、アクセシビリティ、レスポンシブ、性能、権利表記  | 品質確認、検証、非機能判断         |
| `docs/requirements/pages.md`             | 初期公開ページ、トップページ、流儀・生き様詳細、404       | ページ追加・変更                   |
| `docs/requirements/layout-navigation.md` | Layout、Header、Footer、SiteMenu、PageToc                 | layout、navigation、導線変更       |
| `docs/requirements/search.md`            | サイト内検索                                              | 検索導入・検索UI・index生成        |
| `docs/requirements/data-display.md`      | データカード、スキル、アイテム、凡例、アンカー            | データ表示Component                |
| `docs/requirements/data-id-policy.md`    | スキル・タイミング・アイテムID                            | 変換仕様、schema、リンク安定性     |
| `docs/requirements/release-notes.md`     | リリースノートのデータ構造と表示                          | 更新情報ページ、変換仕様           |
| `docs/requirements/assets-seo.md`        | 画像、OGP、SEO                                            | asset、metadata、SEO Component     |
| `docs/requirements/components.md`        | コールアウトComponent                                     | MDX本文Component                   |
| `docs/requirements/character-sheet.md`   | Webキャラクターシートの機能、保存、出力、検証             | `ex-02`の要件正本化・実装          |

## 作業種別ごとの参照先

- 新規タスク定義: `overview.md`、関連する詳細要件、`docs/out-of-scope.md`
- Astro / MDX / build基盤: `architecture.md`、`non-functional.md`
- ページ実装: `pages.md`、必要に応じて `layout-navigation.md`、`assets-seo.md`
- Layout / navigation実装: `layout-navigation.md`、`non-functional.md`
- データ表示実装: `data-display.md`、`data-id-policy.md`、必要に応じて `architecture.md`
- Excel変換・schema実装: `architecture.md`、`data-id-policy.md`、`release-notes.md`、作成後の `docs/conversion/*`
- 検索実装: `search.md`、`architecture.md`
- SEO / OGP / asset対応: `assets-seo.md`、`non-functional.md`
- Webキャラクターシート: `character-sheet.md`、`non-functional.md`、`architecture.md`
- 開発構造整理: `docs/development-structure.md`

## 分割方針

詳細要件は章番号ではなく、作業時に必要になる参照単位で分ける。同じ要件を複数ファイルへ複製しない。別ファイルの要件が必要な場合は、索引で参照先を示す。

推奨ディレクトリ構成、`.gitignore` 方針、package scripts案は、要件本文ではなく開発構造・運用方針として扱う。作業時は `docs/development-structure.md`、`AGENTS.md`、および `package.json` を確認する。
