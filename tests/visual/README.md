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

既定の4321 previewからスクリーンショットを取得します。

```sh
npm run visual:capture
```

capture先は常に `http://127.0.0.1:4321/neon-underrealm-trpg/` です。別portや別URLを指定してcaptureしません。

## 成果物

Playwrightの標準出力先を使います。

- `test-results/`
- `playwright-report/`

これらはGit管理しません。

Playwrightで取得したスクリーンショットは、実装結果を確認するための actual artifact です。取得したスクリーンショットは、そのままデザイン正本ではありません。

## デザイン正本

比較対象となるデザイン正本は `docs/design/<design-target>/` に置きます。issue単位の `docs/design/<issue-slug>/` は前提にしません。

デザイン正本は、`design-image-generation` skill または同等の承認済みプロセスで作成・更新します。

実装スクリーンショットを新しいデザイン正本として採用する場合は、`design-image-generation` skill の design fix mode で、既存デザインとの差分と正本化理由を記録し、明示承認後に `docs/design/<design-target>/` へ反映します。

Visual Reviewの失敗を隠す目的で、Playwrightのactual screenshotを直接 `docs/design/` にコピーしてはいけません。
