# Frontend workspace

Astroで静的ルールサイトとWebキャラクターシートを提供するworkspaceです。GitHub Pagesへの公開、Firebase Authenticationのbrowser client、Pagefind検索、Google Spreadsheetのローカル作業入力を担当します。

## 主要コマンド

repository rootで実行します。

```sh
npm --workspace=@neon-underrealm/frontend run dev
npm --workspace=@neon-underrealm/frontend run check
npm --workspace=@neon-underrealm/frontend run build
npm --workspace=@neon-underrealm/frontend run build:public
npm --workspace=@neon-underrealm/frontend run build:search-index
npm --workspace=@neon-underrealm/frontend run test:coverage
npm --workspace=@neon-underrealm/frontend run test:e2e
npm --workspace=@neon-underrealm/frontend run preview
npm --workspace=@neon-underrealm/frontend run visual:build
npm --workspace=@neon-underrealm/frontend run visual:test
```

- `build:public`は公開buildを作成し、`frontend/dist/`から`-local` routeを除外する。
- `build:search-index`は既存の`frontend/dist/`からPagefind indexとdeployment markerを生成する。
- `test:e2e`は`-local` fixtureとPagefind indexを含むlocal buildを作り、port `4322`のpreviewでbrowser behaviorを確認する。
- Visual Reviewとbaselineの扱いは[Visual Review Tests](tests/vrt/README.md)を参照する。

## ローカル設定

`frontend/.env.example`を`frontend/.env`へコピーする。`.env`はGit管理しない。

```sh
cp frontend/.env.example frontend/.env
```

| 設定値                               | 用途                                 | 入手先 / 配置先                  |
| ------------------------------------ | ------------------------------------ | -------------------------------- |
| `PUBLIC_API_BASE_PATH`               | Cloudflare backend APIのbase path    | local development backend URL    |
| `PUBLIC_FIREBASE_API_KEY`            | Firebase Web Appの公開設定           | Firebase ConsoleのWeb App config |
| `PUBLIC_FIREBASE_AUTH_DOMAIN`        | Firebase Authenticationのdomain      | Firebase ConsoleのWeb App config |
| `PUBLIC_FIREBASE_PROJECT_ID`         | Firebase project ID                  | Firebase ConsoleのWeb App config |
| `PUBLIC_FIREBASE_APP_ID`             | Firebase Web App ID                  | Firebase ConsoleのWeb App config |
| `GOOGLE_DRIVE_ROOT_FOLDER_ID`        | Spreadsheet同期対象のDrive folder ID | Google Drive folder URL          |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL`       | Spreadsheet同期用service account     | Google Cloud service account     |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | Spreadsheet同期用private key         | local `.env`だけに保存           |

Firebase / Google Cloudでは、利用するFirebase projectへWeb Appを登録し、Firebase AuthenticationのGoogle providerを有効化する。Authorized domainsにはGitHub Pagesのhostと`localhost`を登録する。frontendが必要とするのは上表の公開Web App設定だけであり、Firebase service account JSONや秘密鍵は作成・配置しない。

production buildはGitHub Actions Repository Variablesの`FIREBASE_API_KEY`、`FIREBASE_AUTH_DOMAIN`、`FIREBASE_PROJECT_ID`、`FIREBASE_APP_ID`を対応する`PUBLIC_FIREBASE_*`へ渡す。これらはWeb Appへ配布される公開設定であり、Repository Secretには置かない。

## Google Spreadsheetのローカル入力

Google Spreadsheetをlocal作業入力へ同期する場合、Google Cloudのservice accountを用意し、同期対象Drive folderをそのservice accountのメールアドレスへ閲覧共有する。Google Drive APIを有効化してから、上記の`GOOGLE_*`設定を`frontend/.env`へ入れる。

```sh
npm --workspace=@neon-underrealm/frontend run sync:google-sheets
```

このcommandは指定folder配下のGoogle SpreadsheetだけをXLSXとして同じfolder構造のままrepository rootの`.raw/`へ保存する。Google Docsその他のfile、Google Driveへの書込み、差分・削除同期は行わない。個別fileの失敗は残りの処理を継続し、1件でも失敗すれば最後にexit code `1`で終了する。

`.raw/`はGit非管理のlocal作業入力である。公開用の生成JSONは`frontend/data/generated/`、公開本文・可視構成のGit管理上の正本は`frontend/src/pages/`配下のMDX / Astroとする。

## contents指示書

`.raw/contents/<slug>.md`は必要に応じて手動で置くGit非管理の補助入力である。本文とHTML commentは作業時の参考にできるが、Git管理上の正本より優先しない。詳細は[contents markdown authoring skill](../.agents/skills/contents-markdown-authoring/SKILL.md)と[contents rules](../.agents/rules/contents-markdown.md)を参照する。

Callout配置を指示する場合は、Markdown本文へ独自記法を混ぜず、HTML commentへagent向けの指示を書く。

```md
## 判定の補足

通常本文として判定手順を説明する。

<!-- agent:
ここに type="note" の Callout を配置する。
title は省略し、既定ラベル「補足」を使う。
本文:
この補足は判定に慣れていないPL向けの読み替えです。
-->
```

実装時は対象MDXへ`<Callout type="note">...</Callout>`を配置する。`.raw/contents/*.md`でAstro Componentを直接実行する仕組みや`:::warning`などの独自directiveは使わない。

## 関連ドキュメント

- [公開手順](../docs/deployment.md)
- [テストと検証方針](../docs/testing.md)
- [アーキテクチャ要件](../docs/requirements/architecture.md)
- [生成データ方針](data/generated/README.md)
