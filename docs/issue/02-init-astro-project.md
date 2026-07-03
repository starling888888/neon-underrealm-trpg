# 02-init-astro-project

## 目的

Astro + TypeScript の静的サイトプロジェクトを初期化し、以後のMDX、レイアウト、データ表示実装の土台を作る。

## 背景

`docs/plan.md` の Phase 0 にある初期化タスクとして、サイトコードを配置できる最小構成が必要である。

関連する要件は以下を参照する。

- `docs/requirements.md`
- `docs/out-of-scope.md`
- `docs/plan.md`

## 対象範囲

このタスクで変更してよい範囲は以下とする。

- Astroプロジェクト初期化に必要な設定ファイル
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `astro.config.mjs`
- `src/` 配下の最小ページと環境定義
- `public/` 配下のAstro初期化に必要な最小ファイル
- 必要な場合のみ、初期化に伴うルート直下の設定ファイル

## 初期スコープ外

このタスクでは以下を実装しない。

- MDX対応を追加しない
- サイトの本格レイアウトを作らない
- Header / Footer / SiteMenu / PageToc を作らない
- 検索機能を実装しない
- Excel変換処理を作らない
- JSONデータスキーマやデータ取得層を作らない
- キャラクターシート機能を作らない
- アクセス解析を追加しない
- DB、認証、SSR必須機能、CMS、APIサーバーを追加しない
- 初期スコープ外の項目は `docs/out-of-scope.md` に従う

## 完了条件

- [ ] Astroプロジェクトの最小構成が作成されている
- [ ] `package.json` が作成され、開発・ビルドに必要なscriptsが定義されている
- [ ] `tsconfig.json` が作成され、TypeScript strict 前提の設定になっている
- [ ] 最小ページが静的サイトとして表示できる
- [ ] `npm run build` が通る
- [ ] 必要に応じて `npm run check` が通る

## チェックポイント

- [ ] 既存ドキュメントを破壊していない
- [ ] GitHub Pagesのサブパス公開に関する本格対応は次タスク以降に残している
- [ ] 不要な依存関係を追加していない
- [ ] 初期スコープ外の機能を実装していない
- [ ] ユーザーの未コミット変更を破壊していない

## 想定変更ファイル

- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `astro.config.mjs`
- `src/env.d.ts`
- `src/pages/index.astro`
- `public/`

## 依存関係を増やす場合

想定する追加packageは以下とする。

- `astro`
  - 追加理由: 静的サイト生成の基盤として必要
  - 代替案: Vite + React SPA、Next.js、静的HTML手書き
  - 初期スコープに必要な理由: `docs/requirements.md` でAstroを初期実装の第一候補としているため

MDX、Zod、Pagefind、ExcelJSなどは後続タスクで追加する。

## レビュー観点

- このタスクの範囲が「Astro + TypeScript の最小初期化」に収まっているか
- 後続タスクで扱うMDX、base path、CSS、SEO、データ基盤を先取りしすぎていないか
- `npm run build` と必要に応じた `npm run check` を完了条件に含めることで十分か
- 追加依存関係の扱いが妥当か

## 備考

Astro初期化コマンドの実行時にテンプレート選択や依存インストールが必要になる可能性がある。ネットワークアクセスが必要な場合は、実装開始後に確認する。
