# ex-16-2-backend-infrastructure

## 目的

Cloudflare Workers、D1、R2 と Terraform を用いる backend 基盤を整え、ローカルでは Docker Compose 上の D1 / R2 互換サービスへ Hono の診断用モック API から接続できる状態にする。

本番用の Cloudflare credential はローカルでは Git 管理しない `.env` または `*.tfvars` で扱い、CI では GitHub Actions の Repository Secret からだけ渡す。backend deploy は `main` に限定し、Gate branch と親 branch からは実行しない。

## 背景

親issue `docs/issue/ex-16-character-sheet-cloud-persistence.md` は、静的な frontend を維持したまま Cloudflare backend を追加することを定める。G1 は workspace 境界だけを導入したため、`backend/` は marker type と型検査だけであり、Worker、D1、R2、Terraform、ローカル開発環境、backend deploy は未実装である。

親 Gate plan の G2 は、Worker、D1、R2、Terraform、backend の独立 CI/CD 基盤を整える Gate である。現行の `docs/requirements/architecture.md` と `docs/out-of-scope.md` には backend 導入前の制約が残るため、この Gate の実装と矛盾しない範囲へ更新する。

関連する正本・追跡項目:

- `docs/issue/ex-16-character-sheet-cloud-persistence.md`
- `docs/issue/ex-16-character-sheet-cloud-persistence/plan.md`
- `docs/requirements/architecture.md`
- `docs/out-of-scope.md`
- `docs/development-structure.md`
- `docs/testing.md`
- `docs/deployment.md`
- `docs/TODO.md` の「キャラクターシートの永続スキル参照でID変更を検出してエラーにする」は、永続データの仕様・APIを扱う G4 以降で判断する。この Gate では回収しない。

## Gate関係

- 親issue: `docs/issue/ex-16-character-sheet-cloud-persistence.md`
- Gate plan: `docs/issue/ex-16-character-sheet-cloud-persistence/plan.md`
- Gate: G2: backend infrastructure

## 対象範囲

- `backend/` を Cloudflare Worker の workspace として整備し、Hono を HTTP entrypoint に使う。D1 と R2 は Cloudflare bindings 経由でのみ扱い、frontend が backend の内部 module を直接 import しない境界を維持する。
- D1 と R2 の各 binding が実際に接続できることだけを確認する診断用モック API を実装する。モック API は health / probe のような最小 endpoint に限定し、D1 の query と名前空間を限定した R2 object の write / read / cleanup を実行して疎通結果を返す。
- `compose.yml` と local-only 設定を追加し、Docker Compose で D1 互換 DB と R2 互換 object storage、ならびにそれらを binding した backend のローカル実行を起動できるようにする。ローカル起動は実際の Cloudflare account、D1、R2 へ接続しない。
- backend の local integration command または test を追加し、Compose 起動後に Hono モック API へ request して、D1 と R2 の双方の write / read が成功することを確認する。diagnostic R2 object は test 後に cleanup する。
- Terraform を Cloudflare Worker、D1、R2、bindings、backend deploy に必要な resource の唯一の管理 authority として追加する。remote state の bootstrap、local / CI が同じ state backend を使うための手順、`terraform init`、`validate`、plan / apply の実行境界を文書化する。Wrangler 等との二重 resource 管理は導入しない。
- ローカルの Cloudflare credential、Terraform variable、object-storage credential、state credential は Git 管理しない `.env` または `*.tfvars` に置く。キー名だけを示す `.env.example` と `*.tfvars.example` を必要に応じて Git 管理し、実値・state file・Compose volume・credential file を ignore 対象にする。
- backend の CI / CD workflow を整備する。通常 CI は backend の format、lint、typecheck、unit / integration test を変更 path に応じて実行する。実際の Cloudflare deploy は `main` だけで起動し、必要な値を GitHub Actions の Repository Secret から環境変数へ明示的に渡す。Gate branch、親 branch、PR では credential を必要とする deploy を実行しない。
- backend package、root workspace 設定、lockfile、workflow、ignore 設定、および開発・test・deployment・architecture・out-of-scope 文書を必要範囲で更新する。Hono と Cloudflare / Terraform 関連の新規 dependency は、公式性、継続保守、代替案、初期スコープに必要な理由をこの issue の完了記録へ残す。

## 初期スコープ外

- Google Identity Services、ID Token 検証、login / logout、ユーザー識別・所有権判定を実装しない（G3以降）。
- character の公開 API、metadata / DTO / error contract、永続 character JSON、画像 payload、一覧、upsert、delete を実装しない（G4以降）。
- frontend から backend を呼ぶ処理、キャラクター選択、read-only、DB保存 / 削除 UI を実装しない（G5以降）。
- 本番 Cloudflare resource の apply、Terraform state bootstrap、実 credential の登録を自動実行しない。必要な手順と実行条件だけを文書化し、外部状態を変更する操作はユーザー承認後に行う。
- Gate branch または親 branch を `main` へ直接 merge しない。`main` を base とする PR を作成せず、将来の Gate PR は親 branch を base とする。
- D1 / R2 と無関係な server、CMS、検索、アカウント機能、独自認証、SSR を追加しない。

## 完了条件

- [ ] `backend/` が Cloudflare Worker と Hono の最小 HTTP entrypoint を持ち、D1 / R2 binding を型安全に参照できる。
- [ ] `compose.yml` で D1 互換 DB、R2 互換 object storage、backend のローカル実行を起動でき、実 Cloudflare resource や credential を使わない。
- [ ] Hono の診断用モック API に対する request で、D1 query と R2 object の write / read / cleanup が確認できる。
- [ ] ローカル integration test または再現可能な確認 command が Compose 起動後の上記疎通を確認し、失敗時に DB / storage のどちらが失敗したか識別できる。
- [ ] Terraform が Worker、D1、R2、bindings、backend deploy の resource 定義を一元管理し、format / validate と remote state bootstrap・実行手順が確認できる。
- [ ] 実値を含む `.env`、`*.tfvars`、state、credential file、Compose volume は Git 管理されず、Git 管理する template に secret value を含めない。
- [ ] Cloudflare / Terraform の credential は backend deploy workflow の `main` 実行時だけ Repository Secret から渡され、Gate branch、親 branch、PR の CI / deploy では使われない。
- [ ] backend の test / build / deploy の責務、ローカル Compose 起動・疎通確認、secret の設定先、Terraform の authority を関連文書へ記録し、architecture / out-of-scope の backend 導入前の記述を解消している。
- [ ] `docs/TODO.md` の永続スキルID互換性 TODO を回収せず、G4 以降で扱う記録を維持している。
- [ ] `npm run check`、backend workspace の build / test、Terraform format / validate、および Compose を使う backend integration 確認が通る。

## チェックポイント

- [ ] Worker resource、D1、R2、binding、backend deploy の resource management authority を Terraform 以外へ重複させていない。
- [ ] ローカルの Compose 環境が production Cloudflare account または本番データへ接続しない。
- [ ] 診断用モック API が認証、character API contract、ユーザー入力の永続保存へ拡張されていない。
- [ ] diagnostic R2 object に予測可能な限定 prefix を使い、確認後に cleanup する。
- [ ] Repository Secret 名、用途、渡す workflow job を文書化し、log、test fixture、example file、error message に値を出力しない。
- [ ] `terraform apply`、remote state bootstrap、Cloudflare resource 作成を CI / local script が暗黙実行しない。
- [ ] backend deploy は `main` に限定され、Gate branch と親 branch から実行されない。
- [ ] Gate branch を `main` へ直接 merge せず、`main` を base とする PR を作成しない。
- [ ] frontend の GitHub Pages deploy、既存 frontend / shared workspace、既存 route とサブパス公開を壊していない。
- [ ] 新規 dependency の必要性・代替案・初期スコープに必要な理由を記録している。
- [ ] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `compose.yml`
- `.gitignore`
- `package.json`
- `package-lock.json`
- `backend/package.json`
- `backend/src/**`
- `backend/tests/**`
- `backend/terraform/**`
- `backend/.env.example`
- `backend/terraform/*.tfvars.example`
- `backend/.gitignore`
- `.github/workflows/**`
- `README.md`
- `docs/requirements/architecture.md`
- `docs/out-of-scope.md`
- `docs/development-structure.md`
- `docs/testing.md`
- `docs/deployment.md`

## レビュー観点

- G2 の最小基盤・疎通確認に留まり、G3 の認証、G4 の character API、G5 の frontend UI を先取りしていないか。
- Compose 上の D1 / R2 互換実装と Worker binding の接続が、将来の Cloudflare 本番 binding と異なる独自 API に依存していないか。
- Hono モックが単なる固定 response でなく、D1 と R2 の双方への実接続を再現可能に検証できるか。一方で診断用途を超える API contract を固定していないか。
- local `.env` / `*.tfvars`、Git 管理 template、CI Repository Secret の責務境界と漏えい防止が明確か。
- Terraform の resource authority、main 限定の backend deploy、Gate / 親 branch から `main` への非マージ方針が親issueと整合するか。
- architecture、out-of-scope、development structure、testing、deployment の記述更新が backend 導入後の実装と矛盾しないか。

## 備考

- branch: `ex-16-2-backend-infrastructure`
- local issue: `docs/issue/ex-16-2-backend-infrastructure.md`
- 親 Gate plan の G2 は `planned` のままとし、本issueのユーザー承認後にだけ実装を開始する。
- Cloudflare account ID、API token、Terraform state credential、object-storage credential の実値はこの issue、Git 管理 file、test fixture、CI log へ記載しない。
