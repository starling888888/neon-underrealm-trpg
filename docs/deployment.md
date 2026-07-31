# 公開手順

このドキュメントは、ネオン・アンダーレルムTRPG ルールサイトの公開方針と、GitHub Pages公開手順を整理するための初期版です。

GitHub Actionsによる基本デプロイは `.github/workflows/deploy.yml` で管理します。

## 公開方針

- 静的サイトとして公開する。
- GitHub Pagesなどの静的ホスティングで公開できる構成を維持する。
- DB、常駐サーバー、認証、CMS、APIサーバーを前提にしない。
- CI/CD上のビルドはExcel本体に依存しない。
- 公開用ビルドは、Git管理されたMarkdown / MDX、生成済みJSON、サイトコード、設定ファイルだけで成立させる。

## 現時点の確認手順

ローカルで依存関係をインストールします。

```sh
npm install
```

公開前の基本確認として、以下を実行します。

```sh
npm run check
npm run build
```

ビルド済みサイトをローカルで確認する場合は、以下を実行します。

```sh
npm run preview
```

## 検索indexのローカル生成

Pagefind検索indexは、公開用build成果物に対してローカルで明示生成します。

```sh
npm run build:public
npm run build:search-index
```

`build:search-index` はサイト自体をbuildせず、既にある `dist/` を入力にPagefindの静的検索bundleを `dist/pagefind/` へ生成します。生成物はGit管理しません。

GitHub Actionsのdeploy workflowも、公開用build後に同じ順序で検索indexを生成します。`dist/pagefind/`を含む`dist/`全体をGitHub Pages artifactとして配布します。

## GitHub Pages公開手順

GitHub Pages公開はGitHub Actionsで実行します。

workflowの基本処理は以下です。

1. `npm ci` を実行する。
2. `npm run check` を実行する。
3. `npm run build:public` を実行する。
4. `npm run build:search-index` を実行する。
5. `dist/pagefind/`を含む`dist/`をGitHub Pages artifactとしてアップロードする。
6. GitHub Pagesへデプロイする。

検索UIはGitHub Pagesのサブパス配下から`pagefind/`を参照するため、indexは公開用buildと同じ`dist/`へ生成する必要があります。

workflowは `main` へのpushで実行します。

手動実行用に `workflow_dispatch` も設定しています。

ドキュメント更新、AGENTS / SKILL更新、README更新のみではデプロイが走らないよう、以下を `paths-ignore` に含めます。

- `docs/**`
- `.agents/**`
- `AGENTS.md`
- `README.md`

## CIとPublic E2E

`.github/workflows/quality.yml`は、再利用するQuality処理を定義する。Qualityでは、次を順に実行する。

1. `npm ci`
2. `npm run check`
3. `npm run build`
4. `npm run test`

`npm run test`はNode、Component、build contractなどの通常testを実行する。ローカルpreviewを起動するE2EとVRTは含めない。

`.github/workflows/ci.yml`は、main以外のbranchへのpushとPull RequestでQualityだけを実行する。GitHub Pagesへのdeploy、Pages artifact upload、`pages: write`、`id-token: write`は含めない。pushとPull Requestが同じcommitで同時に起動した場合は、commit SHA単位のconcurrencyで実行中の古いQualityをcancelする。

mainへのサイト公開対象のpushでは、deploy workflowが同じQualityの成功後に公開用build、Pagefind index生成、artifact upload、GitHub Pages deployを実行する。`docs/**`、`.agents/**`、`AGENTS.md`、`README.md`だけの変更は、main以外のbranchとPull Requestを含め、Qualityを起動しない。`src/pages/**/*.mdx`や`.github/**`の変更は除外しない。

deploy成功後は、GitHub Pages environment URLを`E2E_BASE_URL`として既存のE2E suiteをPublic E2Eとして実行する。`@local-fixture` tagのtestだけを除外し、公開routeを扱う既存testはすべて実行する。`E2E_BASE_URL`があるときはPlaywright configのlocal preview `webServer`を定義しない。有限回の到達確認後に実行し、ローカルpreview、`-local` fixture、VRT testは使わない。失敗時にはPlaywright report、test result、screenshot、traceを7日間artifactとして保存する。Public E2Eの失敗はdeployをrollbackしない。

## VRT運用

VRTのcanonical baselineは`canonical-snapshots/visual/`に置くGit管理外のローカル比較入力である。`test-results/`と`playwright-report/`もGit管理しない。

UI、CSS、layout、page、Componentを変更したときだけ、PRレビュー直前に変更targetへ限定してローカルVRTを実行する。baselineの作成・更新は、差分確認後のユーザー明示指示時だけ行う。

このCIではVRTを実行せず、baselineをupload、download、artifact保存、自動更新しない。GitHub Actionsで全件VRTを扱う方法は、Git管理外baselineの比較入力をどう提供するかを含め、`docs/TODO.md`の別taskで判断する。

## アクセス解析

初回公開告知前の `ex-05-access-analytics` では、Cloudflare Web Analyticsだけをmanual beaconで導入する。GitHub Pages、DNS、hostingの構成は変更しない。

beaconは本番deployのbuild時だけ、各公開HTML documentへ最大1つ出力する。通常のlocal build、PR検証、Visual Testではtokenを渡さないため、beaconは出力されず、Cloudflareへの実計測も発生しない。

### deploy前の設定

1. Cloudflare Web Analyticsで `starling888888.github.io` をsite hostnameとして登録する。`/neon-underrealm-trpg` はhostnameとして登録しない。
2. Cloudflareが表示したmanual snippetからsite tokenだけを取得する。
3. GitHub repositoryの `Settings` → `Secrets and variables` → `Actions` → `Variables` に、次のRepository Variableを作成する。

   ```text
   Name: CLOUDFLARE_WEB_ANALYTICS_TOKEN
   Value: Cloudflareから取得したsite token
   ```

4. token値をsource code、Git管理ファイル、commit message、PR本文、review comment、GitHub Actions log、ChatGPTやCodexとの会話へ貼らない。

deploy workflowはbuild前にこのRepository Variableが空でないことを確認する。未設定ならtoken値を表示せず、artifact uploadより前に失敗する。tokenは認証用の秘密鍵ではなく公開HTMLへ出力されるsite識別子だが、環境ごとの設定分離と誤設定防止のためRepository Variableで管理する。

### 計測範囲と公開後の確認

Cloudflare Web Analyticsは、Visits、Page views、Path、Referer host、Device type、Browser、Operating system、Country、Page load time、Core Web Vitalsを確認するために使う。`spa: false` とし、document loadだけをPage viewとして扱う。

公開後は、広告ブロッカーまたはtracking防止機能を無効にしたブラウザーでトップページと下層ページを開き、Cloudflare dashboardで以下を確認する。

- Page viewが記録されている
- Pathが `/neon-underrealm-trpg/` 配下である
- beacon scriptまたは計測送信で恒常的なCORS errorが出ていない

manual beaconは広告ブロッカー、tracking防止機能、network errorの影響を受ける。そのため解析値は、serverへ到達した全HTTP requestの正確な件数ではなく、傾向把握に用いる。UTM query parameter、custom event、閲覧者単位の追跡、長期保存、raw log exportは扱わない。

Cloudflareのautomatic injectionは有効化しない。manual beaconと同一ページへ複数のsnippetを出力しない。CSPを将来導入する場合だけ、`https://static.cloudflareinsights.com/beacon.min.js` と `cloudflareinsights.com` への許可要否を別taskで確認する。

参照: [Cloudflare Web Analytics FAQ](https://developers.cloudflare.com/web-analytics/faq/)、[SPA measurement](https://developers.cloudflare.com/web-analytics/get-started/web-analytics-spa/)

## サブパス公開

GitHub Pagesでは、以下のようなサブパス配下で公開される可能性があります。

```text
https://username.github.io/repository-name/
```

このリポジトリでは、Astroの `site` / `base` を以下の前提で設定します。

- `site`: `https://starling888888.github.io`
- `base`: `/neon-underrealm-trpg`

Astro ComponentやLayoutで内部リンクや `public/` 配下の静的アセットを参照するときは、ルート `/` 固定の文字列を直接埋め込まず、`src/lib/utils/paths.ts` の `withBase()` を使います。

```astro
---
import { withBase } from "../lib/utils/paths";
---

<a href={withBase("/rules/")}>ルール</a>
<img src={withBase("/images/example.png")} alt="" />
```

Markdown / MDX本文では、通常の内部リンクはMarkdownリンク記法を優先します。

```mdx
[戦闘ルール](/rules/battle/)
```

base path補正や将来の外部リンク判定など、実装側の処理が必要なリンクは、MDX本文に `withBase()` を直接書かず、内部リンクComponentへ寄せます。

```mdx
<InternalLink href="/rules/battle/">戦闘ルール</InternalLink>
```

Markdown / MDX本文からAstro Componentを呼ぶ場合も、Component側で `withBase()` を使ってリンクや画像パスを組み立てます。

## SEO / OGP

共通SEO/OGP Componentは実装済みです。

共通OGP画像は `public/neon-underrealm-ogp.png` を使用し、GitHub Pagesのサブパス配下でも絶対URLとして解決できるようにします。

個別ページごとのOGP情報は上書き可能ですが、個別OGP画像生成は初期スコープ外です。個別OGP画像がないページは共通OGP画像を使用します。

ブラウザタブや `<title>` に表示される文言は、ページ固有 `title` がある場合は `ページ固有title | defaultSeo.title` とします。`defaultSeo.title` と `defaultSeo.siteName` はサイト共通のゲームタイトル定数 `gameTitle` を参照します。トップページ `/` は `defaultSeo.title` をそのまま使うため、`src/pages/index.astro` からLayoutへ `title` を渡しません。

## Excelデータの扱い

Excel本体は `.raw/` 配下でローカル管理し、Git管理しません。

CI/CDではExcel変換を必須工程にしません。ビルドでは、Git管理済みの `data/generated/` 配下のJSONを参照する方針です。

## favicon

公開サイトのfaviconは、ユーザー提供の `public/favicon.ico` を使用します。

実装側ではfaviconの生成、変換、再デザインを行いません。

Layoutでは `withBase("/favicon.ico")` を使って参照し、GitHub Pagesのサブパス配下でも解決できるようにします。

## まだ実装していないもの

- 個別OGP画像生成
- 本番公開環境でのリンク確認
