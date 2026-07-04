# 07-0-prepare-design-review

## 目的

承認済みUI実装後に、デザイン正本と実装スクリーンショットを比較して自己レビューできる Visual Review 基盤を準備する。

## 背景

今後のレイアウト、ナビゲーション、Component、スタイル実装では、デザイン画像と実装結果の差分確認が必要になる。既存の `issue-first-development` と `review-to-issue` の責務を保ったまま、Visual Review 専用のskill、成果物配置、npm script、必要最小限の依存関係を追加する。

関連する要件・指示は以下を参照する。

- `docs/requirements.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `.tmp/07-0-prepare-design-review.md`

このissueでは、Visual Review成果物の保存方針について `.tmp/07-0-prepare-design-review.md` より本issueの記述を優先する。

## 対象範囲

- Visual Review用skillの追加
- `package.json`
- `package-lock.json`
- `tests/visual/README.md`
- 必要に応じた `tests/visual/*.spec.ts`
- 必要に応じた `scripts/visual-diff.mjs`
- `docs/design/` とVisual Review成果物の配置方針を示す最小ドキュメントまたはREADME
- Visual Review成果物をGit管理外にするための `.gitignore`
- 既存ドキュメントへの必要最小限の方針追記

## 初期スコープ外

- 07のCSS基盤を実装しない
- レイアウト、ナビゲーション、Header / Footer、ページ本文を実装しない
- 実際のデザイン正本画像を作成しない
- 実際のVisual Reviewを特定UIタスクに対して実行しない
- Visual Review成果物をGit管理対象として追加しない
- `docs/plan.md` のチェックを完了扱いしない
- `docs/issue/*.md` の新規作成をVisual Review skillに担わせない
- `review-to-issue` にVisual Reviewの責務を混ぜない
- `.tmp/*.md` をVisual Review用途に使わない
- DB、認証、SSR、CMS、常駐サーバーを追加しない
- 大規模UIライブラリを追加しない
- 初期スコープ外の項目は `docs/out-of-scope.md` に従う

## 完了条件

- [ ] `visual-implementation-review` skillが既存skill配置方式に合わせて追加されている
- [ ] Visual Review skillが、承認済みUI実装後のスクリーンショット取得、比較、局所修正、issue記録だけを担うように定義されている
- [ ] design正本は `docs/design/<design-target>/` として方針化されている
- [ ] Visual Review成果物はPlaywrightの出力ディレクトリ規約に従い、Git管理外として方針化されている
- [ ] `.gitignore` にVisual Review成果物の出力先が追加されている
- [ ] `.tmp/*.md` は `review-to-issue` 入力専用であり、Visual Review用途に使わないことが明記されている
- [ ] `## ビジュアルレビュー N` と `## レビュー指摘 N` の使い分けが明記されている
- [ ] `package.json` にVisual Review用scriptが必要最小限で追加されている
- [ ] 必要最小限のdevDependenciesが追加され、追加理由・代替案・初期スコープに必要な理由を作業報告に記載できる
- [ ] 既存ドキュメントに必要であれば対応方針が追記されている
- [ ] `npm run build` が通る
- [ ] `npm run check` が通る

## チェックポイント

- [ ] 既存の `issue-first-development` の責務を変更していない
- [ ] 既存の `review-to-issue` の責務を変更していない
- [ ] Visual Review skillがbranch作成、issue新規作成、plan更新、commit、pushを行わない設計になっている
- [ ] design正本をissue単位の `docs/design/<issue-slug>/` にしない方針になっている
- [ ] Visual Review成果物を `.tmp/` やGit管理下の固定成果物ディレクトリに保存しない方針になっている
- [ ] 既存npm scriptsを削除・破壊していない
- [ ] 不要な依存関係を追加していない
- [ ] 初期スコープ外の機能を実装していない
- [ ] ユーザーの未コミット変更を破壊していない

## 想定変更ファイル

- `.agents/skills/visual-implementation-review/SKILL.md`
- `package.json`
- `package-lock.json`
- `tests/visual/README.md`
- `tests/visual/*.spec.ts`
- `scripts/visual-diff.mjs`
- `docs/design/README.md`
- `AGENTS.md`
- `README.md`
- `.gitignore`

## レビュー観点

- Visual Review skillの責務が既存workflowと衝突していないか
- design正本はGit管理し、レビュー成果物はGit管理外にする分離が明確か
- `.tmp/*.md` と `review-to-issue` の責務分離が維持されているか
- 追加依存関係がVisual Review基盤に必要な最小限になっているか
- npm scriptsが既存開発フローを壊していないか

## 備考

`@playwright/test` はスクリーンショット取得、viewport固定、desktop / mobile表示確認のために追加候補とする。`pixelmatch` と `pngjs` はdiff scriptを実装する場合のみ追加候補とし、スクリーンショット取得基盤だけで足りる場合は追加しない。

Visual Review成果物は、Playwrightの標準的な出力先である `test-results/` や `playwright-report/` を前提にGit管理外とする。`.tmp/07-0-prepare-design-review.md` に `docs/visual-review/<issue-slug>/` 配置の記載があるが、このissueでは採用しない。
