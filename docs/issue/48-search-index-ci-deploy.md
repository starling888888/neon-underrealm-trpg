# 48-search-index-ci-deploy

## 目的

GitHub Pagesへのデプロイ前にPagefind検索indexを生成し、公開成果物に含める。

## 背景

task 43でPagefindを導入し、task 45で検索UIと検索runtimeを実装した。現在のdeploy workflowは`npm run build:public`で終了するため、`dist/pagefind/`が生成されず、公開環境の検索UIはindexを参照できない。

関連する正本:

- `docs/requirements/search.md`（公開用ビルド時の検索index生成）
- `docs/requirements/architecture.md`（AC-02、AC-03。Pagefind導入後のCI/CD更新とGitHub Pagesサブパス対応）
- `docs/requirements/non-functional.md`（NFR-01、NFR-04）
- `docs/out-of-scope.md`（静的検索、外部検索サービスを使わない）
- `docs/plan.md` の `48-search-index-ci-deploy`
- `docs/issue/done/phase-4/43-install-pagefind.md`
- `docs/issue/done/phase-4/45-search-pagefind-integration.md`

`docs/TODO.md`に本taskに関連する未対応項目はない。検索UIのdesign targetはtask 45で正本化済みであり、本taskはUI/CSS変更を行わないため、design画像作成は前提としない。

## 対象範囲

- `.github/workflows/deploy.yml`で、`npm run build:public`の完了後に`npm run build:search-index`を実行する。
- 生成済みの`dist/`をGitHub Pages artifactとしてuploadし、`dist/pagefind/`を成果物に含める。
- `docs/deployment.md`と`docs/requirements/architecture.md`を、検索indexを生成・deployする現行CI/CDの説明へ更新する。
- ローカルで同じ順序のbuildを実行し、生成物とGitHub Pagesサブパスを前提にした検索runtimeの参照先を確認する。
- deploy完了後、公開環境で検索UIがPagefind indexを参照できることを確認する。

## 初期スコープ外

- Pagefind、Astro、または既存npm依存関係の追加・更新
- 検索UI、検索runtime、検索結果、検索対象、metadata、highlightの変更
- GitHub Pages以外のホスティング、外部検索サービス、APIキー、DB、SSR、APIサーバーの導入
- main以外のbranchまたはPRでdeployなしCIを実行する仕組み（`docs/TODO.md`の`56-ci-non-main-branches`で扱う）
- UI/CSS/design画像の変更

## 完了条件

- [x] `.github/workflows/deploy.yml`が`npm run check`を実行する。
- [x] `.github/workflows/deploy.yml`が`npm run build:public`の後に`npm run build:search-index`を実行する。
- [x] Pagefind生成物を含む`dist/`がGitHub Pages artifactとしてuploadされる。
- [x] `docs/deployment.md`と`docs/requirements/architecture.md`が、検索indexの生成・artifactへの組込み・deployを正しく説明する。
- [x] ローカルで`npm run build:public`、`npm run build:search-index`の順に成功し、`dist/pagefind/pagefind.js`を確認する。
- [ ] GitHub Pagesの公開環境で検索UIがPagefind indexを参照し、検索結果を表示できる。
- [x] GitHub Pagesサブパス`/neon-underrealm-trpg/`配下で検索indexのpathが壊れない。
- [x] `npm run check`が通る。

## チェックポイント

- [x] workflowのartifact upload対象が検索index生成後の`dist/`のままである。
- [x] CI/CDはExcel、`.raw/`、外部検索サービス、Secretsに依存しない。
- [x] `src/scripts/search-modal.ts`の`import.meta.env.BASE_URL`による`pagefind/`参照と、生成物の配置が整合する。
- [x] 既存ルートとGitHub Pagesのサブパス公開に影響しない。
- [x] 不要な依存関係を追加していない。
- [x] 初期スコープ外の機能を実装していない。
- [x] 関連する`docs/TODO.md`項目と矛盾していない。
- [x] ユーザーの未コミット変更（`public/images/data/`配下の画像を含む）を破壊・stage・commitしない。

## 想定変更ファイル

- `.github/workflows/deploy.yml`
- `docs/deployment.md`
- `docs/requirements/architecture.md`
- `docs/issue/48-search-index-ci-deploy.md`

## レビュー観点

- Pagefind index生成が公開artifact upload前に行われ、workflow順序が正しいか。
- `dist/pagefind/`を含む成果物がGitHub Pagesへ渡る構成か。
- CI/CDの責務がindex生成・deploy統合だけに留まり、task 45の検索UI/runtimeや後続の非main CIへ拡張していないか。
- 公開環境とGitHub Pagesサブパスでの動作確認条件がレビュー可能か。

## 備考

- `npm run build:search-index`は既存の`pagefind --site dist`であり、`npm run build:public`が先行しなければならない。
- ローカルで`npm run check`、`npm run build:public`、`npm run build:search-index`を実行し、`dist/pagefind/pagefind.js`を確認した。検索runtimeの`import.meta.env.BASE_URL`による`pagefind/`参照と、GitHub Pagesのbase設定は整合する。
- GitHub Pages上の実検索はユーザー指示によりマージ後の人間確認とし、確認できるまで該当完了条件は未チェックにする。
- `.tmp/review/48-search-index-ci-deploy/`はreviewer出力の一時領域であり、commitしない。
