# ex-16-1-workspace-foundation

## 目的

`ex-16-character-sheet-cloud-persistence`のG1として、現在rootにあるAstro frontendをworkspace配下へ移動し、backendとshared packageを後続Gateで安全に追加できるmonorepo基盤を作る。

移動後もfrontendはGitHub Pages向けの静的サイトとして、既存のcheck、build、test、subpath公開を維持する。

## 背景

親issueは、frontend、backend、shared packageの内部依存を分離し、frontendとbackendを独立して検証・deployする方針を定めている。このGateはそのうちworkspace、frontend移動、shared packageの空の責務境界だけを扱う。

現在はrootの`src/`、`public/`、`data/`、`scripts/`、`tests/`、Astro/Vite/Vitest/Playwright設定、`package.json`がfrontendの実装・検証を担う。backend、Cloudflare Worker、D1、R2、Terraform、Google認証、APIはまだ存在しない。

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
- installはrootの`npm ci`を正式入口とする。frontendのformat/lint、type check、unit/contract test、buildは、rootのworkspace scriptまたは`npm --workspace`から実行できる入口を用意する。
- rootの`package.json`には、frontendと将来のbackendが共用する`format`、`lint`、`typecheck`だけをworkspace横断の共通入口として置く。個別workspaceのscriptを置き換えず、root scriptはworkspace scriptを組み合わせる。
- `dev`、`build`、`preview`、`check`、`test`、`visual:*`、`convert:*`、`sync:google-sheets`は、frontendまたは後続backendの個別責務とする。CIはdirectory単位で必要なworkspaceのscriptだけを実行する。
- `.raw/`は移動後もrepo root直下の`<repo-root>/.raw/`だけを入力rootとする。同期・変換scriptのcwd依存pathを更新し、frontendの`data/generated/`とbuild output `frontend/dist/`を明示的に扱う。`sync:google-sheets`、必要な変換、`build`、`build:public`がこのpath契約を維持することを検証する。
- rootとfrontendのnpm scripts、CI workflow、GitHub Pages deploy workflow、test設定の参照先を移動後の構成へ更新する。
- path filterをfrontendとshared packageの変更へ対応させる。ただしbackend CI/CDの実装はG2で扱う。
- `docs/development-structure.md`と、workspace構成に直接関係する`docs/requirements/architecture.md`、`docs/testing.md`、`docs/deployment.md`を実装後の構造と検証入口へ整合させる。

## 初期スコープ外

- `backend/`のWorker、D1、R2、Terraform、Cloudflare resource、backend CI/CDの実装
- Google Cloud project、Google Auth Platform、GIS client、login/logout、ID Token検証
- shared packageへのAPI DTO、metadata schema、API error contractの実装
- キャラクターシートの保存、選択、read-only、DB保存/削除、既存UIの振る舞い変更
- `docs/requirements/character-sheet.md`、`docs/out-of-scope.md`に定義される認証・クラウド保存の機能要件変更
- design notes、VRT baseline、Visual Reviewの更新
- package managerの変更、不要な新規runtime dependencyの追加

## 完了条件

- [ ] root、`frontend/`、`packages/shared/`の責務と依存方向が明確である。
- [ ] 既存Astro frontendが`frontend/`配下から静的buildされ、GitHub Pagesのsubpath公開を維持する。
- [ ] `packages/shared/`をfrontendからworkspace dependencyとして参照できる最小のpackage境界がある。
- [ ] frontendのformat/lint、type check、unit/contract test、buildを独立したscriptから実行できる。
- [ ] rootの`npm run format`、`npm run lint`、`npm run typecheck`が、frontendと`packages/shared/`を対象として実行できる。
- [ ] `dev`、build、preview、test、visual、変換、同期は、対応するworkspaceから個別に実行できる。
- [ ] rootの`npm ci`だけでworkspace dependenciesを再現installでき、frontend配下にlockfileがない。
- [ ] `.raw/`がrepo root直下に維持され、同期・変換・build後処理が`frontend/.raw/`やrootの旧`dist/`へ誤って依存していない。
- [ ] CIがfrontendまたはshared packageの変更で必要なfrontend検証を実行する。
- [ ] GitHub Pages deploy workflowが移動後のfrontendをbuild・deployする。
- [ ] 関連する構造、architecture、testing、deployment文書が実装と整合する。
- [ ] `npm run check`、`npm run build`、必要なfrontend testが通る。
- [ ] 関連TODOを追加、完了、削除していないこと、または扱いを明記していること。

## チェックポイント

- [ ] frontend移動と無関係な表示・操作・キャラクターシート仕様の変更を混在させていない。
- [ ] frontendと将来のbackendが互いの内部moduleを直接importしない構造である。
- [ ] shared packageを相対pathコピーや型の二重管理に使っていない。
- [ ] rootのformat/lint/typecheck scriptがworkspaceごとの実装を重複せず、TypeScript workspaceの共通入口になっている。
- [ ] directory単位のCIが、frontendまたは後続backendの個別scriptを適切に実行し、rootへ不必要な実行入口を増やしていない。
- [ ] package managerを変更していない。新規packageが必要なら、理由、代替案、初期スコープ上の必要性をissueへ記録している。
- [ ] 既存のroot script、CI、deploy workflow、test configurationに残った移動前pathがない。
- [ ] workspace commandのcwdにかかわらず、同期・変換・build後処理の入力と出力pathが明示的に解決される。
- [ ] `data/generated/`を手編集していない。
- [ ] `.raw/`、`.tmp/`、secret、build成果物をGit管理へ追加していない。
- [ ] 既存routeとGitHub Pages subpath公開が壊れていない。
- [ ] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- rootの`package.json`、lockfile、workspace設定、root scripts
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
