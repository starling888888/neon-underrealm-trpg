# Visual Review Tests

このディレクトリは、Visual Review 用のPlaywrightテストを置く場所です。

Visual Reviewは、承認済みUI実装後に `visual-implementation-review` skill から実行します。branch作成、issue作成、`docs/plan.md` 更新、commit、pushは行いません。

## 実行前提

初回のみChromiumをインストールします。

```sh
npm run visual:install
```

最初に、`-local` fixtureとPagefind indexを含むVRT用buildを作成します。

```sh
npm run visual:build
```

別ターミナルでpreviewサーバーを起動します。

```sh
npm run preview
```

既定の4321 previewからVRTを実行します。

```sh
npm run visual:test
```

capture先は常に `http://127.0.0.1:4321/neon-underrealm-trpg/` です。別portや別URLを指定してcaptureしません。

## 成果物

Playwrightの標準出力先を使います。

- `test-results/`
- `playwright-report/`

これらはGit管理しません。

比較用baselineは、repository rootの `canonical-snapshots/visual/<target>/` に置くPlaywright snapshotでGit管理する。targetごとのVRT testは `tests/visual/vrt/<target>.spec.ts` に置き、各caseへ `@vrt`、`@<target>`、`@desktop` / `@tablet` / `@mobile`、必要なstate tagを付ける。通常実行は比較のみで更新しない。baselineの初回作成・更新は、ユーザーが明示指示した場合だけ `npm run visual:update` を実行する。

## テスト責務

Visual Testは、画面の基本構造、responsive layout、横overflow、ナビゲーション状態、スクリーンショット取得を確認する。ローカルカタログのfixtureや外部データの、固有の文言、値、件数、本文の内容を期待値に含めない。

Card Componentが固定propsを受けたときの文言、値、fallback、タグ、属性は、将来のComponent contract testで確認する。release notesなど外部データの内容、並び順、変換結果は、Nodeのデータ変換・schema・取得層テストで確認する。

## デザイン正本

design targetの意図、route、状態、viewport、snapshot名は `docs/design/<design-target>/notes.md` に記録する。issue単位の `docs/design/<issue-slug>/` は前提にしない。

Visual Reviewのactual screenshotを `docs/design/` にコピーしてはいけない。
