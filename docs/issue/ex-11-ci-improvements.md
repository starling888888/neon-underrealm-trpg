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

## 初期スコープ外

- coverage の最低値・差分閾値による CI fail を導入しない
- Codecov など外部 coverage service、token、artifact upload、PR comment を追加しない
- deploy workflow の Quality 実行順・Pages deploy・Public E2E を変更しない
- E2E、VRT、テストケースの追加・削除や既存テストの意味変更を行わない
- GitHub Actions 以外の CI 基盤を追加しない

## 完了条件

- [ ] `ci.yml` は main 以外の branch push でのみ起動し、Pull Request event では起動しない
- [ ] 同じ branch commit に対して push / Pull Request 起因の Quality CI が二重に作成されない
- [ ] Quality job が coverage を有効にした全既存 test suite を実行し、成功後に完了する
- [ ] 新設する coverage 用 test script がローカルで成功する
- [ ] 既存の Vitest 実行単位ごとに、GitHub Actions log へ text coverage summary が出力される
- [ ] coverage の HTML、JSON、artifact などの filesystem report を生成・保存しない
- [ ] coverage provider の追加理由、代替案、初期スコープに必要な理由が issue または作業報告に記録されている
- [ ] coverage 閾値・外部 service・artifact upload を追加していない
- [ ] `docs/testing.md` と `docs/deployment.md` が実装後の CI 方針と一致する
- [ ] `npm run check` が通る
- [ ] `npm run build` が通る

## チェックポイント

- [ ] Markdown-only の変更では Markdown Check だけが実行される
- [ ] 実装、設定、workflow、`.mdx`、または Markdown との混在では Quality が実行される
- [ ] `.codex/**/*.toml` だけの変更では CI workflow を起動しない
- [ ] main への公開対象 push の deploy workflow は従来どおり Quality の後に実行される
- [ ] GitHub Pages のサブパス公開に影響しない
- [ ] 不要な依存関係を追加していない
- [ ] 初期スコープ外の機能を実装していない
- [ ] 関連する `docs/TODO.md` 項目と矛盾していない
- [ ] 関連する `docs/design/` と矛盾していない
- [ ] ユーザーの未コミット変更を破壊していない

## 想定変更ファイル

- `.github/workflows/ci.yml`
- `.github/workflows/quality.yml`
- `package.json`
- `package-lock.json`
- `docs/testing.md`
- `docs/deployment.md`
- `docs/issue/ex-11-ci-improvements.md`

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
- fork 由来 Pull Request では fork branch の push がこの repository の CI を起動しない。fork PR を CI 対象外とするかは、ユーザー確認後に実装契約へ確定する。
