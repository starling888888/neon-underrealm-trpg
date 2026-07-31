# 56-ci-non-main-branches

## 目的

main以外のbranchおよびPull Requestで、GitHub Pagesを更新せずに品質確認を実行できるCIを整備する。

mainへのpushでは、同じ品質確認の成功後にだけ既存のGitHub Pages deployを実行し、deploy完了後は公開サイトを対象とするPublic E2Eを実行する。

VRTのcanonical baselineはGit管理外のローカル比較入力として維持し、CIではVRTを実行・保存・更新しない運用を明文化する。

## 背景

`docs/plan.md` の `56-ci-non-main-branches` と、関連TODO「main以外のbranch / PRでdeployなしCIを回せるようにする」を扱う。

現行の `.github/workflows/deploy.yml` はmainへのpushでのみ実行され、`npm ci`、`npm run check`、公開用build、Pagefind index生成、GitHub Pages deployを担う。main以外のbranchとPull Requestには、deployを伴わない品質確認がない。

また、公開buildは `-local` routeを除外する一方、既存のローカルE2Eには`-local` fixtureを使うtestが含まれる。Public E2Eは既存suiteをそのまま使い、公開siteで成立しないtestだけを`@local-fixture` tagで除外する。

関連する正本・制約は以下である。

- `docs/requirements/architecture.md` のAC-02、AC-03、AC-09
- `docs/requirements/non-functional.md` のNFR-01、NFR-04
- `docs/out-of-scope.md` のCI/CDでExcel変換を必須工程にしない制約
- `docs/deployment.md`
- `docs/TODO.md` のnon-main CI TODOと全件VRT CI TODO
- `AGENTS.md` のVRT運用
- `.agents/rules/data-management.md` のcanonical VRT baselineのローカル管理

`docs/TODO.md` の全件VRT CI TODOは、このissueでは解消・削除しない。将来の別taskで、Git管理外baselineを前提とした比較入力の取得・保存方法を含めて判断する。

## 対象範囲

- main以外のbranchへのpushとPull Requestで実行する、deployなしQuality CIを追加する。`docs/**`、`.agents/**`、`AGENTS.md`、`README.md`だけの変更は実行対象外とする。
- Quality CIで、`npm ci`、`npm run check`、`npm run build`、`npm run test`を実行する。
- mainのdeploy workflowが、同一のQuality処理の成功後にのみ公開用build、Pagefind index生成、artifact upload、GitHub Pages deployへ進む構成にする。
- main以外のQuality CIに、`pages: write`および`id-token: write`を付与しない。
- mainのdeploy完了後、GitHub Pages environment URLを対象にPublic E2Eを実行する。
- `playwright.e2e.config.ts`を、通常時はlocal previewを起動し、`E2E_BASE_URL`指定時は`webServer`を定義しない共通configにする。
- Public E2Eは既存の`tests/e2e/**`を実行し、`@local-fixture` tagを付けた`-local` fixture依存testだけを除外する。
- Public E2Eで、既存E2Eが確認する公開トップページ・主要route、サイトメニュー、ページ内目次、Pagefind検索、データカードanchor、GitHub Pages subpathを確認する。
- Public E2E前に公開URLの到達を有限回retryで確認し、失敗時には調査可能なPlaywright report・test result・screenshot・traceをartifactとして保存する。
- deploy成功後にPublic E2Eが失敗してもrollbackしない。deploy失敗とPublic E2E失敗を区別できるようにする。
- `docs/deployment.md`へ、Quality、deploy、Public E2Eの実行順、docs-only・AGENTS・SKILL更新時のCI方針、VRTのローカル限定運用を記録する。
- canonical VRT baselineが`canonical-snapshots/visual/`配下のGit管理外入力であり、作成・更新にはユーザーの明示指示が必要なことを、関連ドキュメントと矛盾しない範囲で明記する。

## 初期スコープ外

- GitHub ActionsでのVRT実行、定期VRT、公開後VRT、VRT baselineのdownload/upload、artifact保存、自動更新
- `docs/TODO.md` の全件VRT CI TODOの完了・削除
- Public E2E失敗時の自動rollback、通知、issue作成
- Firefox・WebKitを含むbrowser matrix
- fork Pull Request向けの追加権限や専用workflow
- 差分ファイルごとのtest選択、独自cache最適化、Lighthouse、performance計測、アクセシビリティ専用検査
- Excel変換のCI実行、`.raw/`の参照、generated JSONの更新
- GitHub Actionsからのcommit、push、Release、外部storage、Git LFS
- UI、CSS、ページ本文、VRT test定義、canonical baselineの変更

## 完了条件

- [ ] main以外のbranchへのpushとPull Requestで、deployなしQuality CIが実行される
- [ ] Quality CIで`npm ci`、`npm run check`、`npm run build`、`npm run test`を実行する
- [x] Quality CIはE2EとVRTを実行しない
- [x] `npm run test`がE2EとVRTを含まない通常testの入口である
- [ ] mainのdeployはQuality成功後にのみ、`npm run build:public`、`npm run build:search-index`、artifact upload、GitHub Pages deployを実行する
- [ ] main以外のCIがGitHub Pagesを更新せず、Pages deploy権限を持たない
- [ ] main deploy完了後に、公開URLを対象とするPublic E2Eが実行される
- [ ] Public E2Eはローカルpreview、`webServer`、`-local` fixture、VRT test、canonical baselineへ依存しない
- [ ] Public E2Eが公開siteの既存E2E操作、Pagefind検索、subpath、公開データカードanchorを確認する
- [ ] Public E2Eの失敗時に調査用artifactを保存し、成功済みdeployをrollbackしない
- [ ] Public E2Eに不要なwrite権限を付与しない
- [ ] docs-only、AGENTS、SKILL、README、`.github`更新時のQuality CI実行方針が明文化されている
- [x] VRTのcanonical baselineがGit管理外で、CIに持ち込まず、ローカルの変更target比較だけに用いる運用が明文化されている
- [ ] `docs/TODO.md`の全件VRT CI TODOをこのissueで変更していない
- [x] CI/CD buildがExcelファイルと`.raw/`へ依存しない
- [x] `npm run check`が通る
- [x] `npm run build`が通る
- [x] `npm run test`が通る
- [x] ローカルE2Eが従来どおり実行できる

## チェックポイント

- [ ] 既存のmain GitHub Pages deploy、environment URL、subpath公開、Pagefind index生成を維持している
- [ ] Quality処理のNode.js version、npm cache、実行順がmainとnon-mainで重複定義されていない
- [ ] mainの通常品質確認を重複実行せず、Quality失敗時にdeployとPublic E2Eが開始されない
- [ ] main以外のbranchとPull Requestで同一commitに重複実行が生じる場合は、明示的な運用判断または安全なconcurrency設定を記録している
- [x] Public E2E開始前に公開URLの到達を確認し、無制限retryや長時間待機をしない
- [ ] deployとPublic E2Eの失敗状態を区別できる
- [ ] package-lockと異なるPlaywright versionをCIで導入していない
- [x] 公開用testは`-local` routeを参照せず、既存のローカルE2E testを不要に移動・renameしていない
- [x] canonical VRT baseline、`test-results/`、`playwright-report/`をGit管理していない
- [x] 不要なnpm dependencyを追加していない
- [x] 初期スコープ外の機能を実装していない
- [x] ユーザーの未commit変更を破壊していない
- [x] 関連する`docs/TODO.md`、`AGENTS.md`、requirements、out-of-scopeと矛盾していない

## 想定変更ファイル

- `.github/workflows/ci.yml`または同等のnon-main / Pull Request Quality workflow
- `.github/workflows/quality.yml`または同等の再利用可能なQuality定義
- `.github/workflows/deploy.yml`
- `package.json`
- `playwright.e2e.config.ts`
- `tests/e2e/**`
- `tests/vrt/**`
- `tests/support/site.ts`
- `docs/deployment.md`
- `docs/issue/56-ci-non-main-branches.md`

既存のE2EとVRTは、Public E2Eとの責務境界を明確にするために`tests/e2e/**`、`tests/vrt/**`へ分ける。test内容は、`@local-fixture` tagの付与以外では変更しない。

## レビュー観点

- non-main branchとPull Requestで必要なQuality CIが実行され、deploy権限を持たないこと。
- mainのQuality、deploy、Public E2Eが安全な順序で接続されること。
- Public E2Eが公開URLだけを使い、`-local` fixtureやローカルpreviewへ依存しないこと。
- 既存のローカルE2E・VRTの責務を壊さない最小限のtest分離になっていること。
- VRTのcanonical baselineをGit管理・CI artifact化せず、全件VRT CI TODOを将来taskとして維持すること。
- docs-only等のCI方針と、不要なCI複雑化のバランスが適切であること。

## 備考

### Public E2E testの判断

- 追加していた公開トップページ、menu / TOC、Pagefind検索のtestは、既存の`tests/e2e/`に同等の確認があるため削除した。
- not-found導線のbrowser E2Eは既存suiteにない。Public E2Eを既存suite全件から`@local-fixture`だけ除外する方針に合わせ、このissueでは追加しない。not-found画面の表示比較は既存の`tests/vrt/404.spec.ts`に残る。

### 想定実行順

```text
non-main branch / Pull Request
→ Quality
→ 終了

main push
→ Quality
→ public build
→ Pagefind index
→ GitHub Pages deploy
→ Public E2E
```

### VRT運用

- canonical VRT baselineは`canonical-snapshots/visual/`のGit管理外ローカル入力である。
- VRTはUI、CSS、layout、page、Component変更時に、PRレビュー直前に変更targetだけをローカルで比較する。
- baselineの作成・更新は、差分確認後のユーザー明示指示時だけ行う。
- GitHub Actionsで全件VRTをどう実現するかは、baselineをGit管理しない制約を含めて別taskで判断する。

## Local Validation

- branch: `56-ci-non-main-branches`
- local working tree: remote draft本体のみ未追跡。既存Git管理ファイルへの未commit変更なし。
- existing workflow: `.github/workflows/deploy.yml`のみ。main pushと`workflow_dispatch`が対象で、`docs/**`、`.agents/**`、`AGENTS.md`、`README.md`をdeploy対象外にしている。
- existing quality commands: `npm run check`、`npm run build`、`npm run test`が存在する。`npm run test`はNode、component、公開build contract、analytics production-build testを実行し、E2E・VRTは含まない。
- local E2E: `npm run test:e2e`は`visual:build`、port 4322のlocal preview、`tests/e2e/`を使う。公開buildから除外される`-local` fixtureを参照するtestには`@local-fixture` tagを付け、Public E2Eではtagで除外する。
- public build: `npm run build:public`は`-local` routeを`dist/`から除外する。Pagefind indexは別の`npm run build:search-index`で生成する。
- VRT artifacts: `canonical-snapshots/visual/`、`test-results/`、`playwright-report/`は`.gitignore`で除外済み。canonical baselineは`.agents/rules/data-management.md`でローカル専用の比較入力として定義されている。
- related TODO: non-main CI TODOはこのissueで扱う。全件VRT CI TODOは未対応のまま保持する。
- design target: なし。CI / test infrastructure taskであり、UI design intentまたはVRT baseline更新を必要としない。
- command verification: `npm run check`、`npm run build`、`npm run test`、`npm run test:e2e`は、実装前のissue検証では未実行。実装後の完了条件として確認する。

### Implementation Validation

- `npm run check`: passed.
- `npm run build`: passed. Existing Vite chunk-size warning only.
- `npm run test`: passed.
- `npm run test:e2e`: passed (43 tests). Its Playwright preview was stopped after the run.
- Public E2E config: with `E2E_BASE_URL`, `playwright.e2e.config.ts` uses that URL and does not define `webServer`.
- Public E2E selection: `--grep-invert '@local-fixture' --list` selects 30 existing tests; the 13 `-local` fixture-dependent tests are excluded.
- workflow YAML: `.github/workflows/ci.yml`、`quality.yml`、`deploy.yml` parsed without YAML errors.
