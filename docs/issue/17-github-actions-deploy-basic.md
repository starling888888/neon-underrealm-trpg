# 17-github-actions-deploy-basic

## 目的

GitHub Actionsによる基本デプロイを追加し、GitHub Pagesへ静的サイトを公開できる状態にする。

このタスクでは、検索index生成を含まない最小構成のCI/CDを成立させる。

また、初回検証として、現在のissue branch `17-github-actions-deploy-basic` で一度deploy workflowを実行し、GitHub Pagesへのdeployが成功するか確認する。

初回deploy成功後は、ユーザーが公開結果を確認するまで実装作業を停止する。

ユーザー確認後、恒久運用としては `main` への反映時にdeployする構成へ整理する。

また、公開時の基本要素としてfaviconを設定する。ただし、`favicon.ico` は生成しない。ユーザーが提供した `favicon.ico` を使用する。

具体的には以下を満たす。

* `.github/workflows/deploy.yml` を作成する
* CI上で `npm ci` を実行する
* CI上で `npm run check` を実行する
* CI上で `npm run build` を実行する
* `dist/` をGitHub Pages artifactとしてuploadする
* GitHub Pagesへdeployする
* 初回確認のため、現在のissue branch `17-github-actions-deploy-basic` でも一度deployを実行できるようにする
* 初回deploy後、ユーザーの公開確認を待つ
* ユーザー確認後、恒久運用として `main` deploy中心の条件へ戻す、またはissue branch条件が一時条件であることを明確に記録する
* ドキュメント更新、AGENTS / SKILL更新だけではdeploy workflowが走らないようにする
* Excel本体なしでCI/CDビルドが成功することを確認する
* ユーザー提供の `favicon.ico` を静的siteへ配置する
* `favicon.ico` を生成・変換・再作成しない
* 検索index生成はこのIssueでは実行しない
* Pagefind / 検索関連のscript、依存関係、設定を追加しない

## 背景

`docs/plan.md` 上の `17-github-actions-deploy-basic` を実施する。

現時点の公開方針は、Git管理されたMarkdown / MDX / Astro実装 / generated JSONをもとに静的サイトをbuildし、GitHub Pagesへ公開することである。

CI/CD上でExcel本体を参照する構成にはしない。

検索index生成、Pagefind、検索UI、外部検索サービス連携は後続フェーズとし、このIssueでは扱わない。

このIssueはUI / design / Visual Reviewタスクではない。したがって、新規design targetの作成、スクリーンショットデザイン作成、Visual ReviewのCI組み込みは行わない。

ただし、GitHub Pages deployは実環境での確認が必要なため、初回だけ現在のissue branch `17-github-actions-deploy-basic` からdeployを実行し、ユーザー確認を受ける。

また、公開時の基本確認対象としてfaviconを含める。faviconはユーザーが `favicon.ico` を提供する。実装側では、それを静的siteに含めるだけとし、画像生成、変換、デザイン調整は行わない。

main以外のbranch / PRで通常CIを回す恒久整備は、このIssueでは実装しない。代わりに、`docs/TODO.md` と `docs/plan.md` に後続タスクとして追記する。

## 対象範囲

このタスクで扱う。

* `.github/workflows/deploy.yml` の作成
* GitHub Pages向けActions workflowの最小構成
* `npm ci`
* `npm run check`
* `npm run build`
* `dist/` のPages artifact upload
* GitHub Pages deploy
* 初回確認用のissue branch deploy
* 初回確認後のユーザー確認待ち停止点
* `main` push時のdeploy実行
* `workflow_dispatch`

  * ただし、`workflow_dispatch` はdefault branch上のworkflow fileを前提とするため、初回issue branch検証はpush triggerで実行する
* GitHub Pages deployに必要な最小permissions設定
* 同時deployを避けるconcurrency設定
* deployを走らせる変更対象の制御
* ドキュメント更新のみでdeployが走らない条件設定
* AGENTS / SKILL更新のみでdeployが走らない条件設定
* Excel本体なしでCIが成立することの確認
* 既存 `astro.config.mjs` の `site` / `base` 設定との整合確認
* 既存 `docs/deployment.md` の記載と実装内容の差分確認
* 必要最小限の公開手順メモ更新
* ユーザー提供の `favicon.ico` の配置
* faviconがbuild結果に含まれることの確認
* `docs/TODO.md` への後続CI整備TODO追加
* `docs/plan.md` の最終フェーズ末尾への、main以外でもdeployなしCIを回すためのテスト / CI整備タスク追加

想定するworkflow方針:

```yaml id="x8sy84"
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
      - 17-github-actions-deploy-basic # 初回検証用。一時条件として扱う。
    paths-ignore:
      - "docs/**"
      - ".agents/**"
      - "AGENTS.md"
      - "README.md"
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - checkout
      - setup-node
      - npm ci
      - npm run check
      - npm run build
      - upload-pages-artifact

  deploy:
    needs: build
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - deploy-pages
```

実装時は、GitHub公式Actionsを基本とする。

* `actions/checkout`
* `actions/setup-node`
* `actions/configure-pages`
* `actions/upload-pages-artifact`
* `actions/deploy-pages`

注意:

* `17-github-actions-deploy-basic` branch指定は初回検証用の一時条件として扱う。
* 初回deploy成功後、ユーザーが公開状態を確認するまで停止する。
* ユーザー確認後、branch条件を恒久運用として残すか、`main` のみに戻すかを判断する。
* main以外での通常CIはdeploy workflowへ混ぜず、後続タスクでdeployなしCIとして整備する。
* `favicon.ico` はユーザー提供物を使用する。
* `favicon.ico` は生成・変換・再作成しない。

## 初期対象外

このIssueでは以下を扱わない。

* Pagefind導入
* 検索index生成
* 検索UI実装
* 外部検索サービス連携
* `npm run index:search`
* `npm run build:search`
* 検索関連script追加
* 検索関連依存関係追加
* Excel変換処理のCI組み込み
* `.raw/` 配下ファイルのCI参照
* generated JSON生成パイプラインの変更
* generated JSONの手編集
* GitHub Pages以外のhosting
* custom domain
* DNS設定
* analytics
* Lighthouse CI
* Visual Regression CI
* Playwright screenshot CI
* Visual Review CI
* design画像更新
* layout修正
* UI改修
* favicon画像の生成
* favicon画像の変換
* favicon画像の再デザイン
* 既存ページ構造の変更
* ルール本文、スキル、アイテム等のコンテンツ修正
* GitHub release
* tag作成
* PR作成
* branch protection設定
* GitHub repository settings変更の自動化
* DB
* 認証
* SSR
* CMS
* API server
* PWA
* service worker
* cache strategy高度化

## 技術方針

### deploy workflow

GitHub Pages deploy用workflowを `.github/workflows/deploy.yml` として作成する。

build jobでは以下を実行する。

1. checkout
2. Node.js setup
3. npm dependency install
4. static check
5. static build
6. Pages artifact upload

deploy jobでは、build jobの成功後にGitHub Pagesへdeployする。

### trigger

恒久運用では `main` pushでdeployする。

初回検証のため、現在のissue branch `17-github-actions-deploy-basic` へのpushでも一度deployできるようにする。

`workflow_dispatch` も設定する。ただし、`workflow_dispatch` はdefault branch上のworkflow fileを前提とするため、初回issue branch検証の主手段にはしない。

### path filter

ドキュメント更新、AGENTS / SKILL更新のみではdeployが走らないようにする。

候補:

```yaml id="dpsp6j"
paths-ignore:
  - "docs/**"
  - ".agents/**"
  - "AGENTS.md"
  - "README.md"
```

この条件により、以下のような変更だけではdeployしない。

* `docs/**`
* `.agents/skills/**`
* `AGENTS.md`
* `README.md`

ただし、実装時にサイト公開物へ影響するdocsが存在する場合は、`docs/**` を丸ごと除外してよいか確認する。

このリポジトリでは `docs/` は主に開発・設計・issue管理文書として扱われる想定であり、公開ページ本文ではない前提で進める。

### permissions

GitHub Pages deployに必要な最小権限を設定する。

想定:

```yaml id="yuc3wn"
permissions:
  contents: read
  pages: write
  id-token: write
```

### concurrency

同時deployを避ける。

想定:

```yaml id="oseffq"
concurrency:
  group: pages
  cancel-in-progress: false
```

`cancel-in-progress: false` とすることで、進行中のdeployを不用意に中断しない。

### Node.js version

Node.js versionは明示する。

候補:

```yaml id="jijz6f"
with:
  node-version: 22
  cache: npm
```

最終的なversionは、ローカル環境および既存lockfileとの整合を確認して決める。

### build command

deploy前に以下を必ず通す。

```sh id="d5kxuy"
npm ci
npm run check
npm run build
```

`npm run build` はAstro build後のpostprocessを含むため、既存scriptをそのまま利用する。

### Excel非依存

CI/CDではExcel本体を参照しない。

CI/CD上で参照するのは、Git管理されている以下のみとする。

* Markdown / MDX
* Astro実装
* generated JSON
* site code
* config files
* package files

`.raw/` やローカルExcel本体をCI/CDへ要求しない。

### favicon

公開siteにfaviconを設定する。

`favicon.ico` はユーザーが提供する。

実装側では、ユーザー提供の `favicon.ico` を静的配信対象に配置し、HTML上から参照される状態にする。

想定配置:

```txt id="xn7k8i"
public/favicon.ico
```

必要であれば、layout / head設定で以下のように参照する。

```html id="ra2swi"
<link rel="icon" href={`${basePath}/favicon.ico`} />
```

または、既存のbase path処理がある場合は、その処理に従って参照する。

注意:

* `favicon.ico` は生成しない
* `favicon.ico` は変換しない
* `favicon.ico` は再デザインしない
* AI画像生成を行わない
* ユーザー提供ファイルをそのまま使用する
* build後にfaviconがartifactへ含まれることを確認する

### 初回issue branch deploy

初回のみ、現在のissue branch `17-github-actions-deploy-basic` でdeploy workflowを実行する。

目的は、workflow定義が実際にGitHub Pages deployまで到達できるかを確認することである。

初回deployが成功したら、実装者はその時点で停止し、ユーザーの公開確認を待つ。

この時点で勝手に次の修正、main merge前提の整理、追加CI整備へ進まない。

ユーザー確認後、以下を判断する。

* issue branch deploy条件を削除して `main` のみに戻す
* issue branch deploy条件を一時条件として残したままmain mergeへ進める
* workflow_dispatchで今後の手動deployを確認する
* main以外の通常CI整備を後続Issueへ進める

## 完了条件

* [x] `.github/workflows/deploy.yml` が作成されている
* [x] workflowが `main` pushで実行される
* [x] 初回検証用に、現在のissue branch `17-github-actions-deploy-basic` でも一度deploy workflowを実行できる
* [ ] 初回issue branch deployが成功した場合、ユーザーの公開確認を待つ停止点が記録されている
* [x] ユーザー確認後に、issue branch deploy条件を恒久化するか、`main` のみに戻すか判断する前提が記録されている
* [x] workflowが `workflow_dispatch` を持つ
* [x] `workflow_dispatch` はdefault branch反映後の手動実行用であり、初回issue branch検証の主手段として扱っていない
* [x] `actions/checkout` を使用している
* [x] `actions/setup-node` を使用している
* [x] Node.js versionが明示されている
* [x] `cache: npm` または同等のnpm cache設定が必要最小限で入っている
* [x] `npm ci` が実行される
* [x] `npm run check` が実行される
* [x] `npm run build` が実行される
* [x] `actions/configure-pages` が使用されている
* [x] `dist/` がPages artifactとしてuploadされる
* [x] GitHub Pages deploy jobがbuild jobの成功後に実行される
* [x] deployに必要なpermissionsが最小範囲で設定されている
* [x] deployのconcurrencyが設定されている
* [x] ドキュメント更新のみではdeployが走らない条件が設定されている
* [x] `.agents/skills/**` のSKILL更新のみではdeployが走らない条件が設定されている
* [x] `AGENTS.md` 更新のみではdeployが走らない条件が設定されている
* [x] Excel本体なしでCI/CDビルドが成功する設計になっている
* [x] `.raw/` 配下のファイルを参照していない
* [x] ユーザー提供の `favicon.ico` が使用されている
* [x] `favicon.ico` が静的配信対象に配置されている
* [x] `favicon.ico` がbuild artifactに含まれる
* [x] `favicon.ico` を生成していない
* [x] `favicon.ico` を変換していない
* [x] `favicon.ico` を再デザインしていない
* [x] 検索index生成を実行していない
* [x] `npm run index:search` を実行していない
* [x] `npm run build:search` を実行していない
* [x] `package.json` に検索関連scriptや依存関係を追加していない
* [x] `astro.config.mjs` の `site` / `base` とGitHub Pages公開先が矛盾していない
* [x] `docs/deployment.md` にGitHub Actions基本デプロイが実装済みであること、または実装後の確認手順が必要最小限で反映されている
* [x] `docs/TODO.md` に、main以外でもdeployなしCIを回せるようにする後続TODOが追加されている
* [x] `docs/plan.md` の最終フェーズ末尾に、main以外でもdeployなしCIを回すためのテスト / CI整備タスクが追加されている
* [x] `npm run build` が通る
* [x] `npm run check` が通る

## チェックポイント

* [x] 既存ルートが壊れていない
* [x] GitHub Pagesのサブパス公開に影響しない
* [x] `astro.config.mjs` の `base: "/neon-underrealm-trpg"` 前提と矛盾していない
* [x] `dist/` 以外をPages artifactとしてuploadしていない
* [ ] faviconが公開URL上で取得できる
* [x] favicon参照pathがGitHub Pagesのsubpath配下でも壊れていない
* [x] favicon対応のために不要な画像処理依存を追加していない
* [x] 不要な依存関係を追加していない
* [x] 不要なGitHub Actionsを追加していない
* [x] deploy用secretを要求していない
* [x] DB、認証、SSR、CMS、APIサーバーを前提にしていない
* [x] Excel本体をCIに要求していない
* [x] `.raw/` をCIで参照していない
* [x] 生成JSONの手編集を前提にしていない
* [x] 検索index生成をこのIssueに混ぜていない
* [x] Visual Review / screenshot captureをCIに混ぜていない
* [x] docs-only変更でdeployが走らない
* [x] `.agents/skills/**` のSKILL変更でdeployが走らない
* [x] `AGENTS.md` 変更でdeployが走らない
* [x] issue branch deployは初回確認用であり、恒久的なmain以外deploy運用と混同していない
* [x] main以外の通常CI整備は後続タスクへ分離されている
* [x] 関連する `docs/TODO.md` 項目と矛盾していない
* [x] ユーザーの未コミット変更を破壊していない

## 想定変更ファイル

* `.github/workflows/deploy.yml`
* `docs/deployment.md`
* `docs/TODO.md`
* `docs/plan.md`
* `public/favicon.ico`

必要になった場合のみ確認するファイル:

* `package.json`
* `package-lock.json`
* `astro.config.mjs`
* `README.md`
* favicon参照を定義しているlayout / head関連ファイル

原則として変更しないファイル:

* `src/**`

  * ただし、favicon参照がlayout / head側に必要な場合のみ、該当する最小ファイルを変更する
* `docs/design/**`
* `data/generated/**`
* `.raw/**`

## レビュー観点

人間レビューでは以下を確認する。

* 初回確認のために `17-github-actions-deploy-basic` branchから一度deployする方針でよいか
* 初回issue branch deploy後、ユーザー確認待ちで停止する条件が明確か
* ユーザー確認後、deploy対象branchを `main` のみに戻すべきか
* GitHub Pagesの公開元をGitHub Actionsにする前提で問題ないか
* deploy triggerが `main` push + 初回検証用issue branch push + `workflow_dispatch` で適切か
* `workflow_dispatch` を初回issue branch検証の主手段として扱っていない点が妥当か
* docs-only変更でdeployを走らせない条件が適切か
* `.agents/skills/**` のSKILL更新でdeployを走らせない条件が適切か
* `AGENTS.md` / `README.md` をdeploy対象外変更として扱ってよいか
* `pull_request` 時にdeployまで行わない方針でよいか
* main以外の通常CIをこのIssueではなく後続タスクへ分離する方針でよいか
* `docs/TODO.md` と `docs/plan.md` に追加する後続CI整備項目の粒度が適切か
* `npm run check` をdeploy前の必須条件にしてよいか
* workflow内のNode.js versionを固定するか、現行環境に合わせて指定するか
* `dist/` をartifact uploadする方針で問題ないか
* `cancel-in-progress: false` でよいか
* `docs/deployment.md` の更新粒度が過剰でないか
* 検索index生成、Visual Review、Excel変換をこのIssueから外していることが妥当か
* faviconはユーザー提供の `favicon.ico` を使う方針で問題ないか
* `favicon.ico` の配置先は `public/favicon.ico` でよいか
* favicon参照pathがGitHub Pagesのsubpath配下で正しく解決されるか
* favicon対応のために画像生成、画像変換、追加依存を入れていないか

## 追加するTODO案

`docs/TODO.md` の `未対応` に以下を追加する。

```md id="kfyjn9"
- [ ] main以外のbranch / PRでdeployなしCIを回せるようにする
  - source: `17-github-actions-deploy-basic` issue review
  - classification: follow-up
  - plan: `docs/plan.md` の `54-ci-non-main-branches`
  - handling plan: GitHub Pages deploy workflowとは分離し、main以外のbranch / pull requestで `npm ci`、`npm run check`、`npm run build`、必要なtestを実行するCIを整備する。deployは行わず、GitHub Pages環境を更新しない。docs-only更新、AGENTS / SKILL更新のみの場合の扱いもCI方針として明確化する。
```

## 追加するplan案

`docs/plan.md` の最終フェーズ末尾に以下を追加する。

```md id="wrcx8m"
* [ ] `54-ci-non-main-branches` — main以外でdeployなしCIを回すためのテスト / CIを整備する

  * [ ] branch / pull_request向けのCI workflowをdeploy workflowと分離して作成する
  * [ ] `npm ci` を実行する
  * [ ] `npm run check` を実行する
  * [ ] `npm run build` を実行する
  * [ ] 必要なtestを実行する
  * [ ] GitHub Pages deployは行わない
  * [ ] main以外のbranch / PRで、deployなしに品質確認できることを確認する
  * [ ] docs-only更新、AGENTS / SKILL更新のみの場合にCIを走らせるかどうかの方針を明記する
```

## ローカル検証

実装開始前に確認する。

```sh id="cpx4hz"
git status
git branch --show-current
test -f docs/issue/17-github-actions-deploy-basic.md && echo "issue exists"
test -f .github/workflows/deploy.yml && echo "deploy workflow exists"
test -f public/favicon.ico && echo "favicon exists"
```

issue fileが既に存在する場合は、上書きせず内容を確認する。

`favicon.ico` が未配置の場合は、ユーザー提供の `favicon.ico` を受け取ってから配置する。

実装側で `favicon.ico` を生成・変換・再作成しない。

実装後に確認する。

```sh id="734zs6"
npm ci
npm run check
npm run build
test -f dist/favicon.ico && echo "dist favicon exists"
```

初回issue branch deploy前に確認する。

```sh id="eh1zul"
git status
git branch --show-current
```

branchが `17-github-actions-deploy-basic` であることを確認する。

deploy workflow push後に確認する。

* GitHub Actions上でworkflowが起動していること
* build jobが成功していること
* deploy jobが成功していること
* GitHub Pagesの公開URLが取得できること
* 公開ページが404になっていないこと
* サブパス `/neon-underrealm-trpg` 前提でasset pathが壊れていないこと
* faviconが公開URL上で取得できること
* browser tab等でfaviconが反映されること

初回deploy成功後は、ユーザーの公開確認を待つ。

## ローカル検証サマリー

issue-first workflowとして、実装前に以下を確認した。

* local branch: `17-github-actions-deploy-basic`
* issue file: `docs/issue/17-github-actions-deploy-basic.md`
* `docs/plan.md` に `17-github-actions-deploy-basic` が存在する
* `docs/TODO.md` に、このIssueで直接回収すべき既存TODOはない
* `.github/workflows/` は未作成
* `docs/deployment.md` は存在する
* `astro.config.mjs` は存在する
* `package.json` は存在する
* `public/favicon.ico` は存在する

実装後の `npm ci`、`npm run check`、`npm run build`、GitHub Actions実行結果、GitHub Pages公開URL、ユーザーによる公開確認は未実施である。

## 備考

このタスクはUI系タスクではないため、新規design targetやdesign画像作成は不要とする。

ただし、GitHub Pages上で公開した後の見た目確認やVisual ReviewのCI組み込みは、このIssueでは扱わない。必要であれば後続IssueまたはTODOとして分離する。

初回確認のため、現在のissue branch `17-github-actions-deploy-basic` から一度deployを実行する。deploy成功後は、ユーザーが公開結果を確認するまで停止する。

main以外のbranch / PRで通常CIを回す恒久整備は、このIssueでは実装しない。`docs/TODO.md` と `docs/plan.md` に後続タスクとして追跡する。

faviconはユーザーが提供する `favicon.ico` を使用する。実装者はfaviconを生成・変換・再作成しない。
