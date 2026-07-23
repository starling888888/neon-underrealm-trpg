# Visual Regression Tests

このディレクトリは、VRTと、VRTだけでは確認できないUI操作を確認するPlaywrightテストを置く場所です。

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

Visual Reviewまたはcontents reviewへ一時snapshotを渡すときは、対象targetだけをcaptureする。

```sh
npm run visual:capture -- --grep '@vrt.*@home'
```

`visual:capture`は`playwright.capture.config.ts`を使い、`test-results/visual/`へsnapshotを書き出す。canonical baselineは更新せず、視覚差分では失敗しない。route遷移、状態準備、表示のassertionが失敗した場合はcaptureも失敗する。snapshotは次のPlaywright実行で削除され得る一時artifactであり、Git管理しない。

## 実行ポリシー

VRTは高コストなため、Markdownのみの変更や画面に影響しない開発中の反復確認では実行しない。UI、CSS、layout、page、Componentを変更した場合だけ、PRレビュー直前に変更した画面のtargetへ限定して実行する。

たとえば`site-layout`だけを確認する場合は次を使う。

```sh
npm run visual:test -- --grep '@vrt.*@site-layout'
```

ローカルで`npm run visual:test`による全件VRTを通常の開発手順に含めない。全件比較は、GitHub Actionsの定期実行または公開直後の実行を整備した後にCIで行う。ローカル全件実行は、ユーザーが明示した場合や比較基盤の調査時だけにする。

`visual:capture`も、Visual Reviewまたはcontents reviewでユーザーが求める画面を渡す場合だけ、target限定で実行する。

## 成果物

Playwrightの標準出力先を使います。

- `test-results/`
- `playwright-report/`

これらはGit管理しません。

比較用baselineは、repository rootの `canonical-snapshots/visual/<target>/` に置くPlaywright snapshotでGit管理する。targetごとのVRT testは `tests/visual/vrt/<target>.spec.ts` に置き、各caseへ `@vrt`、`@<target>`、`@desktop` / `@tablet` / `@mobile`、必要なstate tagを付ける。通常実行は比較のみで更新しない。baselineの初回作成・更新は、ユーザーが明示指示した場合だけ `npm run visual:update` を実行する。

## テスト責務

VRTは、画面の基本構造、responsive layout、横overflow、ナビゲーションの静的状態を確認する。各ページのlegacy screenshot取得や、固定文言・値・件数の確認は置かない。

VRTだけでは確認できない境界width、scroll、overlay排他、検索、画像load前後のlayout shiftは、`site-layout.spec.ts`、`search-modal.spec.ts`、`hero-layout-stability.spec.ts`だけで確認する。

Card Componentが固定propsを受けたときの文言、値、fallback、タグ、属性は、将来のComponent contract testで確認する。release notesなど外部データの内容、並び順、変換結果は、Nodeのデータ変換・schema・取得層テストで確認する。

## デザイン正本

design targetの意図、route、状態、viewport、snapshot名は `docs/design/<design-target>/notes.md` に記録する。issue単位の `docs/design/<issue-slug>/` は前提にしない。

Visual Reviewのactual screenshotを `docs/design/` にコピーしてはいけない。
