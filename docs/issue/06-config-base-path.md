# 06-config-base-path

## 目的

GitHub Pagesなどのサブパス公開に対応できるように、Astroの `site` / `base` 設定と、内部リンク・静的アセット参照の初期方針を用意する。

## 背景

このサイトはGitHub Pages等の静的ホスティングで公開する想定であり、`https://username.github.io/repository-name/` のようなサブパス配下でも壊れない構成が必要である。

`docs/plan.md` のPhase 1では、Astro基盤として `astro.config.mjs` の `site` / `base` 設定、base path helper、内部リンク・画像パス方針の作成が予定されている。

関連する要件は以下を参照する。

- `docs/requirements.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/deployment.md`

## 対象範囲

- `astro.config.mjs`
- `src/lib/utils/paths.ts` または同等のbase path helper
- 既存ページ・確認用ページでの最小限のhelper利用確認
- `docs/deployment.md` または既存ドキュメントへの内部リンク・画像パス方針追記
- 必要に応じた `src/env.d.ts` または型定義

## 初期スコープ外

- GitHub Actions workflowを作成しない
- GitHub Pagesへの実デプロイ設定を作らない
- OGP Componentや個別OGP画像対応を実装しない
- サイト全体のレイアウト、ナビゲーション、SEO Componentを作り込まない
- 本文ページ群を本格作成しない
- 検索機能、Pagefindインデックス生成を実装しない
- Excel変換処理、JSONデータ表示を実装しない
- UIライブラリ、大規模フレームワーク、状態管理ライブラリを追加しない
- DB、認証、SSR、CMSを追加しない
- 初期スコープ外の項目は `docs/out-of-scope.md` に従う

## 完了条件

- [ ] `astro.config.mjs` にGitHub Pagesサブパス公開を想定した `site` / `base` 設定が追加されている
- [ ] 内部リンクや静的アセット参照に使えるbase path helperが用意されている
- [ ] 既存ページまたは最小確認ページで、helperを使ったリンク・パス生成が確認できる
- [ ] 内部リンク・画像パスがサブパス公開で壊れないための方針がドキュメント化されている
- [ ] 追加依存関係がない、または追加する場合は理由・代替案・初期スコープに必要な理由を作業報告に記載できる
- [ ] `npm run build` が通る
- [ ] `npm run check` が通る

## チェックポイント

- [ ] 既存ルート `/` が壊れていない
- [ ] `/mdx-test/` が壊れていない
- [ ] GitHub Pagesのサブパス公開に必要な設定だけに留めている
- [ ] ルート `/` 固定の内部リンク・画像パスを新しく増やしていない
- [ ] 不要な依存関係を追加していない
- [ ] 初期スコープ外の機能を実装していない
- [ ] ユーザーの未コミット変更を破壊していない

## 想定変更ファイル

- `astro.config.mjs`
- `src/lib/utils/paths.ts`
- `src/pages/index.astro`
- `src/pages/mdx-test.mdx`
- `docs/deployment.md`

## レビュー観点

- `site` / `base` の値がGitHub Pages公開前提として妥当か
- base path helperのAPIが過剰でなく、Astro ComponentやMDXから使いやすいか
- 06以降のSEO/OGP、レイアウト、ナビゲーション実装範囲を先取りしていないか
- ドキュメントの方針が、今後の内部リンク・画像参照に使える粒度になっているか

## 備考

GitHub Pages実デプロイ、GitHub Actions workflow、OGP画像URLの最終調整は後続タスクで扱う。このタスクでは、静的ビルド時にサブパス前提のURLを組み立てるための最小基盤を対象とする。
