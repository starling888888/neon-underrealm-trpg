# 02-1-add-linter

## 目的

`npm run check` で、Astro / TypeScript の基本的な静的チェックとBiomeによるlintを実行できるようにする。

## 背景

`02-init-astro-project` でAstro + TypeScriptの最小構成を作成したが、現時点では `npm run check` が未定義である。

今後のタスクでページ、Component、データ取得層が増える前に、最小限のチェックコマンドを用意して、実装ごとの確認手順を揃える。

このタスクは `docs/plan.md` にはない補助タスクとして扱う。

関連する要件は以下を参照する。

- `docs/requirements.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/issue/02-init-astro-project.md`

## 対象範囲

このタスクで変更してよい範囲は以下とする。

- `package.json`
- `package-lock.json`
- Biome / check に必要な最小設定ファイル
- 必要な場合のみ、既存のAstro最小ページに対するlint通過のための軽微な修正
- `docs/issue/02-1-add-linter.md`

## 初期スコープ外

このタスクでは以下を実装しない。

- MDX対応を追加しない
- formatterによる既存ファイルの大量整形をしない
- Husky、lint-staged、pre-commit hookを追加しない
- GitHub Actionsを追加しない
- テストフレームワークを追加しない
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

- [ ] `npm run check` が定義されている
- [ ] `npm run check` でAstro / TypeScriptの静的チェックが実行される
- [ ] `npm run check` でBiomeによるlint / formatチェックが実行される
- [ ] Biomeの対象範囲と設定が最小限に留まっている
- [ ] `npm run check` が通る
- [ ] `npm run build` が通る
- [ ] `npm audit --audit-level=low` が通る、または未解決警告の理由を報告する

## チェックポイント

- [ ] 既存ルートが壊れていない
- [ ] GitHub Pagesのサブパス公開に影響しない
- [ ] 不要な依存関係を追加していない
- [ ] 大規模UIライブラリや過剰な開発ツールを導入していない
- [ ] 初期スコープ外の機能を実装していない
- [ ] ユーザーの未コミット変更を破壊していない

## 想定変更ファイル

- `package.json`
- `package-lock.json`
- Biome / check に必要な最小設定ファイル
- 必要な場合のみ `src/pages/index.astro`

## 依存関係を増やす場合

想定する追加packageは以下とする。

- `@astrojs/check`
  - 追加理由: `astro check` でAstro / TypeScriptの診断を実行するため
  - 代替案: `astro check` を使わずBiomeのみで確認する
  - 初期スコープに必要な理由: `.astro` ファイルの診断はAstro公式チェックに任せるため
- `typescript`
  - 追加理由: Astro / TypeScriptの静的チェックを明示的に実行するため
  - 代替案: Astroの推移的依存に任せる
  - 初期スコープに必要な理由: `npm run check` を安定して実行できるようにするため
- `@biomejs/biome`
  - 追加理由: JavaScript / TypeScript / JSON / CSS等のlintとformatチェックを軽量に導入するため
  - 代替案: ESLint + Prettierを組み合わせる、または `astro check` のみに留める
  - 初期スコープに必要な理由: `npm run check` にlinterを含めるため

ESLint、Prettier、husky、lint-staged、テストフレームワークはこのタスクでは追加しない。

## レビュー観点

- `npm run check` の責務が広すぎないか
- `astro check` とBiomeの組み合わせが初期段階として妥当か
- 追加依存が必要最小限か
- formatterやCIなど、別タスクに分けるべきものを混ぜていないか

## 備考

作業開始時点で、`docs/plan.md` に `02-init-astro-project` の完了チェックを入れる未コミット変更が存在している。この変更は本タスクでは編集しない。
