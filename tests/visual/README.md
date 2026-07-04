# Visual Review Tests

このディレクトリは、Visual Review 用のPlaywrightテストを置く場所です。

Visual Reviewは、承認済みUI実装後に `visual-implementation-review` skill から実行します。branch作成、issue作成、`docs/plan.md` 更新、commit、pushは行いません。

## 実行前提

初回のみChromiumをインストールします。

```sh
npm run visual:install
```

別ターミナルで開発サーバーを起動します。

```sh
npm run dev
```

対象URLを指定してスクリーンショットを取得します。

```sh
VISUAL_TARGET_URL=http://localhost:4321/neon-underrealm-trpg/ npm run visual:capture
```

`VISUAL_TARGET_URL` を省略した場合は `http://localhost:4321/neon-underrealm-trpg/` を対象にします。

## 成果物

Playwrightの標準出力先を使います。

- `test-results/`
- `playwright-report/`

これらはGit管理しません。

## デザイン正本

比較対象となるデザイン正本は `docs/design/<design-target>/` に置きます。issue単位の `docs/design/<issue-slug>/` は前提にしません。
