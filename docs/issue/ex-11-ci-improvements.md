# ex-11-ci-improvements

## 目的

非 main branch の CI を branch push のみで実行し、同じ commit に対する
push と Pull Request の二重実行をなくす。あわせて Quality job で Vitest の
coverage summary を確認できるようにする。

## 背景

現在の `.github/workflows/ci.yml` は branch push と Pull Request の両方で起動し、
同じ commit で Quality が二重に走る。concurrency により一方を cancel しているが、
不要な workflow run 自体は作成される。

現在の Quality は `npm run test` を実行するが、coverage を出力しない。CI log で
テスト対象の coverage summary を確認できるようにする。

関連する正本は以下。

- `docs/testing.md`
- `docs/deployment.md`
- `docs/issue/milestone-01/plan.md` の完了済み `56-ci-non-main-branches`
- `docs/issue/milestone-02/plan.md` の Phase 5（コードベースの改善）

`ex-11` は現在の milestone plan に未記載のユーザー指定実験タスク番号である。
この issue を実装契約とし、milestone plan のチェックは変更しない。

## 対象範囲

- `.github/workflows/ci.yml` の trigger を main 以外の branch push のみにする
- Quality CI の path 分類と Markdown-only / `.codex/**/*.toml` の既存方針を保つ
- `.github/workflows/quality.yml` から coverage を有効にした test script を実行する
- `package.json` に coverage 用 script を追加し、必要な Vitest coverage provider を追加する
- `package-lock.json` を依存関係変更に追従させる
- `docs/testing.md` と `docs/deployment.md` に CI trigger と coverage 実行内容を反映する
- レビュー指摘 3 として、`src/lib/utils/paths.ts` の URL 分岐を unit test で担保する

## 初期スコープ外

- coverage の最低値・差分閾値による CI fail を導入しない
- Codecov など外部 coverage service、token、artifact upload、PR comment を追加しない
- deploy workflow の Quality 実行順・Pages deploy・Public E2E を変更しない
- E2E、VRT、レビュー指摘 3 以外のテストケースの追加・削除や既存テストの意味変更を行わない
- GitHub Actions 以外の CI 基盤を追加しない

## 完了条件

- [x] `ci.yml` は main 以外の branch push でのみ起動し、Pull Request event では起動しない
- [x] 同じ branch commit に対して push / Pull Request 起因の Quality CI が二重に作成されない
- [x] Quality job が coverage を有効にした全既存 test suite を実行し、成功後に完了する
- [x] 新設する coverage 用 test script がローカルで成功する
- [ ] 既存の Vitest 実行単位ごとに、GitHub Actions log へ text coverage summary が出力される
- [x] coverage の HTML、JSON、artifact などの filesystem report を生成・保存しない
- [x] coverage provider の追加理由、代替案、初期スコープに必要な理由が issue または作業報告に記録されている
- [x] coverage 閾値・外部 service・artifact upload を追加していない
- [x] `docs/testing.md` と `docs/deployment.md` が実装後の CI 方針と一致する
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## チェックポイント

- [ ] 実装、設定、workflow、`.mdx`、または Markdown との混在では Quality が実行される
- [x] main への公開対象 push の deploy workflow は従来どおり Quality の後に実行される
- [x] GitHub Pages のサブパス公開に影響しない
- [x] 不要な依存関係を追加していない
- [x] 初期スコープ外の機能を実装していない
- [x] 関連する `docs/TODO.md` 項目と矛盾していない
- [x] 関連する `docs/design/` と矛盾していない
- [x] ユーザーの未コミット変更を破壊していない

> 以下の未チェック項目は GitHub Actions の実行結果でのみ確認する。ユーザーが結果を確認した後、対象の確認内容を添えて「CI確認済み」と指示すれば、対応するチェックを更新する。

## 想定変更ファイル

- `.github/workflows/ci.yml`
- `.github/workflows/quality.yml`
- `package.json`
- `package-lock.json`
- `docs/testing.md`
- `docs/deployment.md`
- `docs/issue/ex-11-ci-improvements.md`
- `tests/node/paths.test.ts`

## レビュー観点

- Pull Request を開いた後も、repository 内 branch の CI status check が branch push の一回だけで維持されるか
- path filter の既存分類が trigger の変更後も変わらないか
- coverage summary が既存の Vitest 実行単位ごとの text log 出力に限られ、閾値や外部連携へ scope を広げていないか
- Vitest coverage provider の追加が妥当で、別の coverage tool を増やす必要がないか
- `docs/testing.md` と `docs/deployment.md` の説明が実装に一致するか

## 備考

- coverage は CI log の summary 確認を目的とする。既存の test suite が別々の Vitest process で実行されるため、各 Vitest 実行単位の text summary を確認対象とする。全 suite を跨ぐ集約率は作らない。report の保存・公開・比較は行わない。
- 予定する `@vitest/coverage-v8` は Vitest の V8 coverage を有効にするために必要である。別ツールを追加せず既存の Vitest に揃える。閾値を設けないため、coverage は品質状況の可視化であり merge gate にはしない。
- 関連する active TODO はない。`docs/TODO-done.md` の Vitest 移行済み項目は再オープンしない。
- fork 由来 Pull Request は、この repository 内 branch の push だけを対象にする今回のCIでは対象外とする。

## レビュー指摘 1

### 指摘事項

- `test:node:coverage` など通常 test と coverage test の重複 script をなくす。
- Vitest の自動検出から Playwright の E2E / VRT を除外し、通常 test は `vitest run` を起点に対象 directory を引数で指定できるようにする。

### 判定

- source: human
- classification: valid
- local validation: 現在の `test` は Node、script、component、hook を個別 script で列挙し、coverage 用にも同じ実行対象を重複定義している。`tests/e2e/**` と `tests/vrt/**` は Playwright の `.spec.ts` である。`tests/contract/**` は `dist/`、または Cloudflare token を前提にするため、前処理なしの `vitest run` へ混在させられない。

### 対応方針

- `vitest.config.ts` で E2E、VRT、および前処理が必要な contract test を通常の Vitest 自動検出から除外する。
- `test` を `vitest run` に集約し、対象を絞るときは npm の引数転送で directory または test file を渡す。
- contract test は既存の前処理付き script を維持する。
- `test:coverage` は、通常 test と contract script へ `--coverage`、V8 provider、text summary reporter を引数転送し、`test:XXX:coverage` の個別定義は削除する。coverage の計測オーバーヘッドで既定の5秒を超える既存component testに限り、通常 test 実行へ10秒の timeout を渡す。
- `package.json`、`vitest.config.ts`、`vitest.contract.config.ts`、`docs/testing.md`、`docs/deployment.md`、およびこの issue を実装時に更新する。E2E、VRT、contract test の内容や Quality の対象範囲は変更しない。

### 対応完了チェックリスト

- [x] `test:XXX:coverage` の重複 script を削除している
- [x] `npm run test` が通常の Vitest test を実行する
- [x] `npm run test -- <directory-or-file>` で対象を絞れる
- [x] E2E、VRT、contract test が通常の Vitest 自動検出から除外される
- [x] Quality が coverage 有効で通常 test と既存 contract test の両方を実行する
- [x] `npm run test:coverage` が成功し、text coverage summary を出す
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## レビュー指摘 2

### 指摘事項

- 本番かつ token ありで Cloudflare Web Analytics beacon を表示する条件は、contract test ではなく既存のユニットテストで担保する。
- token を設定する analytics 専用の追加 build をなくし、contract test は環境変数を設定しない一回の public build に集約する。
- 固定の coverage provider と reporter は Vitest config に置き、coverage script は計測の有効化だけを担う。

### 判定

- source: human
- classification: valid
- local validation: `tests/node/web-analytics.test.ts` は token 未設定、空白 token、本番以外、本番かつ token ありの各条件と beacon 設定を検証している。`tests/contract/web-analytics-production-build.test.ts` は同条件を実ビルド結果でも検証するため、coverage 実行時に token 付きの二回目の build が必要になる。`tests/contract/page-navigation-build.test.ts` は token なしの公開 build を前提に実行できる。coverage provider と reporter は CI 固有ではなく固定方針であり、`test:coverage` の各実行引数に重複している。

### 対応方針

- `tests/contract/web-analytics-production-build.test.ts` と、その token を設定する専用 npm script を削除する。
- `test:contract` を新設し、環境変数を設定せず `build:public` を一回実行した後、残る `tests/contract/` をまとめて実行する。
- `test:coverage` は通常 test と `test:contract` に coverage 用引数を転送し、contract build を一回だけ実行する。
- coverage provider と text summary reporter は通常用・contract用の Vitest config に固定し、script には `--coverage` と coverage 計測時だけ必要な timeout だけを残す。
- `docs/testing.md`、`docs/deployment.md`、およびこの issue を実装に合わせて更新する。Cloudflare Web Analytics の表示条件を検証する既存ユニットテストは維持する。

### 対応完了チェックリスト

- [x] 本番 token 付き beacon の contract test と専用 script を削除している
- [x] `test:contract` が環境変数を設定せず、一回の public build 後に残る contract test を実行する
- [x] `test:coverage` が通常 test と `test:contract` を coverage 有効で実行する
- [x] coverage provider と text summary reporter を Vitest config に固定し、script から重複指定を除去している
- [x] Cloudflare Web Analytics の表示条件を検証するユニットテストを維持している
- [x] `npm run test:coverage` が成功し、text coverage summary を出す
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## レビュー指摘 3

### 指摘事項

- coverage 調査で branch coverage が 50% だった `src/lib/utils/paths.ts` に、URL 分岐の unit test を追加する。
- browser API が不在の場合など、利用者にとって価値が低い browser API 境界の unit test は追加しない。

### 判定

- source: human
- classification: valid
- local validation: `withBase` は空文字、fragment、protocol-relative URL、外部 URL、内部 path を分岐し、`toAbsoluteUrl` は fragment とその他の URL を分岐する。`src/pages/`、layout、Astro component から広く使用される一方、`tests/` に専用 test はなく、coverage では branch 50% だった。browser API を使う character sheet の代表操作は既存 E2E / VRT で確認される。

### 対応方針

- `tests/node/paths.test.ts` を追加し、内部 path の base 付与、空文字・fragment・protocol-relative URL・外部 URL の透過、および `toAbsoluteUrl` の変換を検証する。
- coverage 閾値を導入せず、browser API 不在時の分岐や E2E / VRT の対象は変更しない。

### 対応完了チェックリスト

- [x] `withBase` と `toAbsoluteUrl` の URL 分岐を unit test で検証している
- [x] browser API 境界の unit test を追加していない
- [x] `npm run test -- tests/node/paths.test.ts` が通る
- [x] `npm run test:coverage` が成功し、URL helper の branch coverage が向上している
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## レビュー指摘 4

### 指摘事項

- `tests/node/paths.test.ts` が Vitest の既定 `BASE_URL`（`/`）で評価されるため、GitHub Pages の公開 subpath `/neon-underrealm-trpg/` が欠落する回帰を検出できない。
- `docs/testing.md` の `npm run test` の説明が、contract test を分離した実装と矛盾している。
- issue の fork 由来 Pull Request の扱いが「ユーザー確認後に確定」と保留のままだが、実装と関連文書は push-only 方針の帰結として対象外で確定している。

### 判定

- source: local-pr-review
- classification: valid
- local validation: `astro.config.mjs` は `base: "/neon-underrealm-trpg"` を設定する一方、追加したURL helper testの期待値はすべて `/` base である。`vitest.config.ts` は contract test を通常の `test` から除外するが、`docs/testing.md` のローカル検証は `npm run test` が build contract test を実行すると記載している。issue の備考だけが fork PR の可否を未確定としており、`ci.yml` と `docs/testing.md` / `docs/deployment.md` は fork PR を対象外と明記している。

### 対応方針

- test の module import 前に本番の `BASE_URL` を設定して読み込み直す、または base を注入できる小さな純粋関数へ切り出し、公開 subpath を付与する結果を unit test で検証する。
- `docs/testing.md` に、`test` は通常の Vitest test、`test:contract` は public build 後の contract test、`test:coverage` はその両方を CI 相当で実行する command として明記する。新規 Vitest 用 directory の方針も、前処理が必要な contract test の例外を含めて整合させる。
- fork 由来 Pull Request は repository 内 branch の push だけを対象にする今回の trigger 方針では CI 対象外であると issue に明記し、保留表現をなくす。

### 対応完了チェックリスト

- [x] GitHub Pages の公開 subpath を付与する `withBase` の結果を unit test で検証している
- [x] `docs/testing.md` が `test`、`test:contract`、`test:coverage` の責務と実行範囲を正しく説明している
- [x] fork 由来 Pull Request を今回の push-only CI の対象外とする方針が issue と関連文書で一致している
- [x] 対象の unit test が通る
- [x] `npm run test:coverage` が通る
- [x] `npm run check` が通る
- [x] `npm run build` が通る
