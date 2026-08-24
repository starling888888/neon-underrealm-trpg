# ex-16-1-workspace-foundation

## 目的

`ex-16-character-sheet-cloud-persistence`のG1として、現在rootにあるAstro frontendをworkspace配下へ移動し、backendとshared packageを後続Gateで安全に追加できるmonorepo基盤を作る。

移動後もfrontendはGitHub Pages向けの静的サイトとして、既存のcheck、build、test、subpath公開を維持する。

## 背景

親issueは、frontend、backend、shared packageの内部依存を分離し、frontendとbackendを独立して検証・deployする方針を定めている。このGateはそのうちworkspace、frontend移動、shared packageの空の責務境界だけを扱う。

現在はrootの`src/`、`public/`、`data/`、`scripts/`、`tests/`、Astro/Vite/Vitest/Playwright設定、`package.json`がfrontendの実装・検証を担う。backendは空のworkspace境界だけを置き、Cloudflare Worker、D1、R2、Terraform、Google認証、APIはまだ存在しない。

## Gate関係

- 親issue: `docs/issue/ex-16-character-sheet-cloud-persistence.md`
- Gate plan: `docs/issue/ex-16-character-sheet-cloud-persistence/plan.md`
- Gate: `G1: Workspace化、frontend移動、shared packageの境界、関連SSoTの基盤を整える。`

このissueはG1だけの実装契約である。G2以降のbackend、認証、API、UIを実装しない。

## 対象範囲

- npm workspaceを用いてrootをworkspace管理の入口とし、既存のpackage managerを維持する。rootの単一`package-lock.json`をworkspaceの再現installの正本とし、frontend配下にlockfileを作成しない。
- rootのAstro frontendを`frontend/`へ移動する。移動対象には少なくとも`src/`、`public/`、`data/`、`scripts/`、`tests/`、Astro/Vite/Vitest/Playwright/TypeScript設定、frontendの`package.json`を含める。
- rootには`.agents/`、`.github/`、`.codex/`、`docs/`、`AGENTS.md`、workspace全体のpackage設定、単一lockfile、共有設定だけを残す。
- `packages/shared/`を通常のworkspace packageとして作成し、frontendと後続backendが参照できる最小のpackage/export/test基盤を置く。API DTO、Google認証、Cloudflare依存、業務機能は入れない。
- `backend/`にpackage設定、空のsource、型検査で確認するdummy testを置き、後続Gateが独立workspaceとして実装を始められる境界を用意する。Worker、API、Cloudflare設定、runtime dependencyは入れない。
- installはrootの`npm ci`を正式入口とする。frontendのformat/lint、type check、unit/contract test、buildは、rootのworkspace scriptまたは`npm --workspace`から実行できる入口を用意する。
- rootの`package.json`には、frontendと将来のbackendが共用するformat検査、`lint`、`typecheck`をまとめたCI用`check`と、開発用の`format`をworkspace横断の共通入口として置く。個別workspaceのscriptを置き換えず、root scriptはworkspace scriptを組み合わせる。
- `dev`、`build`、`preview`、`check`、`test`、`visual:*`、`convert:*`、`sync:google-sheets`は、frontendまたは後続backendの個別責務とする。CIはdirectory単位で必要なworkspaceのscriptだけを実行する。
- `.raw/`は移動後もrepo root直下の`<repo-root>/.raw/`だけを入力rootとする。同期・変換scriptのcwd依存pathを更新し、frontendの`data/generated/`とbuild output `frontend/dist/`を明示的に扱う。`sync:google-sheets`、必要な変換、`build`、`build:public`がこのpath契約を維持することを検証する。
- `frontend/.env`と`frontend/.env.example`、frontendのtest / Playwright output、canonical VRT baselineはfrontend内に置く。rootの`.gitignore`はworkspace共通のローカル入力を扱い、各workspaceのbuild・test・runtime outputは個別`.gitignore`で無視する。
- rootとfrontendのnpm scripts、CI workflow、GitHub Pages deploy workflow、test設定の参照先を移動後の構成へ更新する。
- CIはrootの共通checkを常時の先行jobとし、frontend、shared package、将来の`backend/`のtestだけを各directory、root依存設定、workflowの変更時に二段目で並列実行する。frontend testはshared packageだけの変更では起動しない。backendの実体・deployはG2で扱う。
- GitHub Pages deployも同じroot checkと差分testの成功後にfrontendをbuildする。mainへのmerge直前には、実際の差分に対する各jobの起動条件を再確認する。
- `docs/development-structure.md`と、workspace構成に直接関係する`docs/requirements/architecture.md`、`docs/testing.md`、`docs/deployment.md`を実装後の構造と検証入口へ整合させる。

## 初期スコープ外

- `backend/`のWorker、D1、R2、Terraform、Cloudflare resource、Cloudflare deploy、backendの業務test suiteの実装
- Google Cloud project、Google Auth Platform、GIS client、login/logout、ID Token検証
- shared packageへのAPI DTO、metadata schema、API error contractの実装
- キャラクターシートの保存、選択、read-only、DB保存/削除、既存UIの振る舞い変更
- `docs/requirements/character-sheet.md`、`docs/out-of-scope.md`に定義される認証・クラウド保存の機能要件変更
- design notes、VRT baseline、Visual Reviewの更新
- package managerの変更、不要な新規runtime dependencyの追加

## 完了条件

- [x] root、`backend/`、`frontend/`、`packages/shared/`の責務と依存方向が明確である。
- [x] 既存Astro frontendが`frontend/`配下から静的buildされ、GitHub Pagesのsubpath公開を維持する。
- [x] `packages/shared/`をfrontendからworkspace dependencyとして参照できる最小のpackage境界がある。
- [x] `backend/`に独立workspaceのpackage設定、source、testがあり、rootとbackendのscriptから型検査できる。
- [x] frontendのformat/lint、type check、unit/contract test、buildを独立したscriptから実行できる。
- [x] rootの`npm run check`、`npm run format`、`npm run lint`、`npm run typecheck`が、backend、frontend、`packages/shared/`を対象として実行できる。
- [x] `dev`、build、preview、test、visual、変換、同期は、対応するworkspaceから個別に実行できる。
- [x] rootの`npm ci`だけでworkspace dependenciesを再現installでき、frontend配下にlockfileがない。
- [x] `.raw/`がrepo root直下に維持され、同期・変換・build後処理が`frontend/.raw/`やrootの旧`dist/`へ誤って依存していない。
- [x] `frontend/.env`と`frontend/.env.example`、frontendのtest / Playwright outputがfrontend内へ置かれ、rootとworkspaceの`.gitignore`責務が分かれている。
- [x] frontend専用のcanonical VRT baselineが`frontend/canonical-snapshots/visual/`へ置かれ、frontendのPlaywright設定から参照される。
- [x] CIがroot checkを常時実行し、frontend、shared package、将来のbackendの差分testを必要時に並列実行する。
- [x] GitHub Pages deploy workflowが同じroot checkと必要な差分testの後に、移動後のfrontendをbuild・deployする。
- [x] 関連する構造、architecture、testing、deployment文書が実装と整合する。
- [x] `npm run check`、frontendのbuildとtest、shared packageのtestが通る。
- [x] 関連TODOを追加、完了、削除していないこと、または扱いを明記していること。

## チェックポイント

- [x] frontend移動と無関係な表示・操作・キャラクターシート仕様の変更を混在させていない。
- [x] frontendと将来のbackendが互いの内部moduleを直接importしない構造である。
- [x] shared packageを相対pathコピーや型の二重管理に使っていない。
- [x] rootのformat/lint/typecheck scriptがworkspaceごとの実装を重複せず、TypeScript workspaceの共通入口になっている。
- [x] directory単位のCIが、root checkの後にfrontend、shared package、後続backendの個別testを適切に並列実行し、rootへ不必要な実行入口を増やしていない。
- [x] package managerを変更していない。新規packageが必要なら、理由、代替案、初期スコープ上の必要性をissueへ記録している。
- [x] 既存のroot script、CI、deploy workflow、test configurationに残った移動前pathまたはMarkdown-only専用quality flowがない。
- [x] workspace commandのcwdにかかわらず、同期・変換・build後処理の入力と出力pathが明示的に解決される。
- [x] `data/generated/`を手編集していない。
- [x] `.raw/`、`.tmp/`、secret、build成果物をGit管理へ追加していない。
- [x] 既存routeとGitHub Pages subpath公開が壊れていない。
- [x] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- rootの`package.json`、lockfile、workspace設定、root scripts
- `backend/package.json`、`backend/src/`、`backend/tests/`、TypeScript設定、workspace固有`.gitignore`
- `frontend/package.json`、`frontend/src/`、`frontend/public/`、`frontend/data/`、`frontend/scripts/`、`frontend/tests/`
- `frontend/astro.config.*`、`frontend/tsconfig.json`、`frontend/vite.config.*`、`frontend/vitest.config.*`、`frontend/playwright*.config.*`
- `packages/shared/package.json`、TypeScript設定、最小のsource/test
- `.github/workflows/ci.yml`、`.github/workflows/deploy.yml`、必要なreusable workflow
- `docs/development-structure.md`、`docs/requirements/architecture.md`、`docs/testing.md`、`docs/deployment.md`

## レビュー観点

- workspace分割が単なるdirectory移動としてレビュー可能で、G2以降のbackend機能を先取りしていないか。
- frontendの実行・検証・GitHub Pages deployが移動後も独立しているか。
- rootのformat/lint/typecheckがworkspaceを横断する開発入口として機能し、frontend単独のscriptを壊していないか。
- directory単位のCIと個別workspace scriptの責務が、rootの共通scriptと重複していないか。
- shared packageの責務が将来の型共有に限定され、frontend/backendの密結合を作っていないか。
- CI path filterとworkflowの参照先が新しい構造に整合し、shared変更でfrontend検証を漏らさないか。
- ドキュメントが実際のworkspace構造と実行コマンドに一致するか。

## 備考

- `docs/TODO.md`にG1が直接回収すべき項目はない。JSON schema version互換性と永続スキルID変更検出は、G4/G5で明示判断するまで継続TODOとする。
- UI、CSS、layout、page、Componentの変更を対象にしないため、design-image-generation、VRT、Visual ReviewはこのGateの前提条件に含めない。
- Google Cloud projectとGIS用Web clientはユーザー作成の事前準備であり、G1では扱わない。
- ユーザー指定により、親issueへmain merge直前のCI/CD起動条件の再確認を記録する。
- ユーザー指定により、reviewer routingはfrontend、package、AI Opsへ分離する。backend reviewerの定義はG2で追加し、Gate PRは単一の軽量reviewerを維持する。

## レビュー指摘 1

### 指摘事項

- `docs/deployment.md`の前半手順が、deploy workflowのroot Qualityと差分workspace testの必須前提を省略している。
- contents authoring/review系のAI Ops規約に、移動前の`src/pages/`が残っている。
- `AGENTS.md`とwork report規約が、削除済みのroot `npm run build`を通常の必須検証としている。
- reviewer artifact treeが、role別report名ではなく削除済みの`technical-review-N.md`を示している。
- Playwrightが生成する`frontend/test-results/`をroot Biomeが検査し、test実行後の`npm run check`が失敗する。

### 判定

- source: local-pr-review
- classification: valid
- local validation: `frontend/src/pages/`が実装正本である一方、contents系の複数規約が`src/pages/`を参照していること、root `package.json`に`build` scriptがないこと、deploy workflowがroot Qualityと差分workspace testをbuild前提とすること、data-managementのartifact treeがrole別report名と不整合であること、Playwright実行後の`.last-run.json`をBiomeが検査することを確認した。

### 対応方針

- deployment文書をdeploy workflowの実際のjob順と前提へ合わせる。
- AI Ops規約・contents skill・work reportのpathとworkspace単位の検証commandを移動後の構成へ統一する。
- reviewer artifact treeを`pr-review-draft`のrole別filenameへ合わせる。
- root Biomeからfrontendのtest / Playwright outputを除外する。

### 対応完了チェックリスト

- [x] deployment手順をroot Quality、差分workspace test、frontend build、Pagefind、artifact、deployの順へ更新する。
- [x] contents系の実装正本pathを`frontend/src/pages/`へ更新する。
- [x] 作業後検証をrootの`npm run check`と、変更の影響があるworkspaceのbuild commandへ更新する。
- [x] reviewer artifact treeをrole別report名へ更新する。
- [x] root Biomeからfrontendのtest / Playwright outputを除外する。
- [x] `npm run check`が通る。
- [x] `npm --workspace=@neon-underrealm/frontend run build`が通る。
