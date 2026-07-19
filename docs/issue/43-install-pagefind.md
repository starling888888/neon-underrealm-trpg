# 43-install-pagefind

## 目的

Pagefindをビルド時専用の依存関係として導入し、公開用に生成した静的HTMLから検索indexをローカルで明示生成できるようにする。

## 背景

`docs/plan.md` のTask 43は、後続の検索UI・Pagefind連携・検索metadata調整・CI/CD統合の前提として、Pagefind packageとindex生成コマンドを整備するタスクである。

検索はサーバーサイド、DB、外部検索サービスに依存しない静的検索とする。`docs/requirements/search.md` のFR-02、`docs/requirements/non-functional.md` のNFR-01、`docs/requirements/architecture.md` のAC-01〜03に従う。

関連TODOはない。現在の未追跡WebPはユーザー作業であり、このtaskの変更・format・commit対象に含めない。

## 対象範囲

- `pagefind` を、index生成時だけに必要な開発用dependencyとして追加する。
- `package.json` に `npm run build:search-index` を追加する。
  - 既に存在する `dist/` を入力とし、公開用build後にPagefind indexを生成する明示コマンドとする。
  - indexは静的成果物内に生成し、ソース・生成JSON・`.raw/` は変更しない。
- `npm run build:public` 実行後に `npm run build:search-index` を順に実行し、`dist/` に検索indexが生成されることを確認する。
- `docs/deployment.md` の現行GitHub Pages workflow説明を実装に合わせて `npm run build:public` に訂正し、ローカルでの検索index生成手順と、CI/CD統合はTask 48で扱うことを記録する。

## 初期スコープ外

- 検索ボタン、検索モーダル、検索結果表示、キーボード操作などのUI実装（Task 44、47）
- Pagefind client APIを使う検索実行・結果遷移（Task 45）
- 検索対象の除外、タイトル・種別metadata、データカードanchorの調整（Task 46）
- `.github/workflows/deploy.yml`、CI/CDのbuild手順、GitHub Pagesへのindex配布の変更（Task 48）
- Pagefind以外の検索ライブラリ、外部検索サービス、APIキー、DB、SSR、認証の追加
- `.raw/`、生成JSON、既存ページ本文、未追跡WebPの変更・format・commit

初期スコープ外の項目は `docs/out-of-scope.md` に従う。

## 完了条件

- [ ] `pagefind` がindex生成専用の開発用dependencyとして追加され、lockfileが更新されている
- [ ] `npm run build:search-index` が `dist/` を入力にPagefind indexを生成できる
- [ ] `npm run build:public` の後に `npm run build:search-index` を実行し、公開用成果物内にindexが生成されることを確認している
- [ ] `docs/deployment.md` の公開用build説明が現行実装の `npm run build:public` と一致し、ローカル実行手順とTask 48との責務分離が記録されている
- [ ] Pagefind追加の理由、代替案、初期スコープに必要な理由がこのissueまたは作業報告に記録されている
- [ ] `npm run check` が通る
- [ ] `npm run build` が通る

## チェックポイント

- [ ] `npm run build:search-index` はサイトbuildを暗黙実行せず、`dist/` を明示入力とする
- [ ] `npm run build:public` 後のindex生成で、`-local` routeを公開用indexに含めない
- [ ] index生成物はGit管理対象のソースではなく `dist/` にだけ出力される
- [ ] GitHub Pagesサブパスを前提に、ルート絶対パスを新規導入していない
- [ ] 不要な依存関係を追加していない
- [ ] CI/CD統合、検索UI、検索metadataの責務をTask 43へ混在させていない
- [ ] 関連する `docs/TODO.md` 項目と矛盾していない
- [ ] ユーザーの未コミット変更（WebPを含む）を破壊していない

## 想定変更ファイル

- `package.json`
- `package-lock.json`
- `docs/deployment.md`
- `docs/issue/43-install-pagefind.md`

## レビュー観点

- PagefindをdevDependencyとし、`dist/` を対象にする責務分離が妥当か。
- `npm run build:public` と `npm run build:search-index` を分離し、CI/CD変更をTask 48へ残す範囲が妥当か。
- `docs/deployment.md` の更新をこのtaskに含めることが、コマンド追加の利用手順として適切か。
- 検索UI・metadata・CI/CDを初期スコープ外として十分に切り分けられているか。

## 備考

- Pagefindを採用する理由は、FR-02が第一候補として定める静的検索index生成を、外部サービスやサーバーサイド処理なしで満たすためである。
- 代替案は、外部検索サービス（初期スコープ外）、自前の検索index・検索UI実装（後続taskの責務を重複し保守対象を増やす）、別の静的検索ライブラリである。既存要件がPagefindを第一候補に指定するため、Task 43では比較導入を行わない。
- `dist/` はGit管理対象外である。生成確認後もindex成果物をcommitしない。
- UI/CSS/layout/page/Componentタスクではないため、design targetおよびdesign-image-generationの前提はない。
