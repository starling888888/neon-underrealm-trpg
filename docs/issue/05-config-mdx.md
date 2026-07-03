# 05-config-mdx

## 目的

AstroプロジェクトにMDX対応を追加し、Markdown / MDXで本文を管理できる初期基盤を用意する。

## 背景

このサイトでは、ルール本文や世界観本文をMarkdown / MDXで継続管理する方針である。`docs/plan.md` のPhase 1では、Astro基盤としてMDX integrationの追加、`.mdx` ページの表示確認、MDX内Component埋め込み方針の確認が予定されている。

関連する要件は以下を参照する。

- `docs/requirements.md`
- `docs/out-of-scope.md`
- `docs/plan.md`

## 対象範囲

- `astro.config.mjs`
- `package.json`
- `package-lock.json`
- `src/pages/**/*.mdx`
- `src/components/**/*.astro`
- MDX内Component埋め込み方針を記載する既存ドキュメント、または必要最小限の新規ドキュメント

## 初期スコープ外

- サイト全体のレイアウトやナビゲーションを作り込まない
- グローバルCSS、デザイントークン、本文用CSSを追加しない
- 本文ページ群を本格作成しない
- Excel変換処理、JSONデータ表示、検索機能を実装しない
- GitHub Pagesサブパス対応を実装しない
- UIライブラリ、大規模フレームワーク、状態管理ライブラリを追加しない
- キャラクターシート、ダイスローラー、戦闘シミュレーターを追加しない
- DB、認証、SSR、CMSを追加しない
- 初期スコープ外の項目は `docs/out-of-scope.md` に従う

## 完了条件

- [ ] Astro MDX integrationが追加され、`astro.config.mjs` に設定されている
- [ ] `.mdx` ページが1つ以上追加され、Astroの静的ページとして表示できる
- [ ] MDX内でAstro Componentを埋め込む最小例が確認できる
- [ ] MDX内Component埋め込み方針がドキュメント化されている
- [ ] 追加依存関係の理由、代替案、初期スコープに必要な理由を作業報告に記載できる
- [ ] `npm run build` が通る
- [ ] `npm run check` が通る

## チェックポイント

- [ ] 既存ルート `/` が壊れていない
- [ ] GitHub Pagesのサブパス公開に影響する設定変更をしていない
- [ ] 不要な依存関係を追加していない
- [ ] 初期スコープ外の機能を実装していない
- [ ] ユーザーの未コミット変更を破壊していない

## 想定変更ファイル

- `astro.config.mjs`
- `package.json`
- `package-lock.json`
- `src/pages/mdx-test.mdx` または同等の最小確認ページ
- `src/components/MdxExample.astro` または同等の最小確認Component
- `docs/content-writing-guide.md` またはMDX方針を記載するドキュメント

## レビュー観点

- MDX確認ページとComponent例が、初期基盤として過剰でないか
- MDX内Component埋め込み方針が、今後の本文管理に使える粒度になっているか
- `06-config-base-path` 以降のタスク範囲を先取りしていないか
- 追加依存関係が `@astrojs/mdx` に限定されているか

## 備考

`@astrojs/mdx` の追加が必要になる見込みである。これはAstro公式のMDX integrationであり、MDX本文管理の初期要件を満たすために必要な依存関係として扱う。
