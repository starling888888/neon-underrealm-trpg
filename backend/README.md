# Backend workspace

HonoをHTTP entrypointにするCloudflare Workerです。キャラクターシートのcloud persistence API、D1、R2、Firebase ID Token検証を担当します。静的frontendとはHTTP APIだけで接続し、frontend内部moduleをimportしません。

## 主要コマンド

repository rootで実行します。

```sh
npm --workspace=@neon-underrealm/backend run lint
npm --workspace=@neon-underrealm/backend run typecheck
npm --workspace=@neon-underrealm/backend run build
npm --workspace=@neon-underrealm/backend run test
npm --workspace=@neon-underrealm/backend run integration:reset
npm --workspace=@neon-underrealm/backend run migrate:integration
npm --workspace=@neon-underrealm/backend run dev:integration
npm --workspace=@neon-underrealm/backend run test:integration
npm --workspace=@neon-underrealm/backend run migrate:local
npm --workspace=@neon-underrealm/backend run dev:local
npm --workspace=@neon-underrealm/backend run wrangler:dev -- deploy
```

`integration:reset`、`migrate:integration`、`dev:integration`、`test:integration`はintegration専用stateを使う。local developmentは`backend/.wrangler/state/`、integration testは`backend/.wrangler/integration-state/`を使い、いずれもGit管理しない。

## ローカル設定

`backend/.env.example`を`backend/.env`へコピーする。`.env`はGit管理しない。

```sh
cp backend/.env.example backend/.env
```

| 設定値                 | 用途                                 | 配置先                                                 |
| ---------------------- | ------------------------------------ | ------------------------------------------------------ |
| `CLOUDFLARE_API_TOKEN` | WranglerによるCloudflare remote操作  | `backend/.env`だけ                                     |
| `CORS_ALLOW_ORIGIN`    | development Workerが受け付けるorigin | localでは`http://localhost:4321,http://localhost:4322` |
| `FIREBASE_PROJECT_ID`  | Firebase ID Tokenのproject確認       | frontendと同じFirebase project ID                      |

`CLOUDFLARE_API_TOKEN`には対象accountのWorkers Scripts: Write、D1: Edit、Workers R2 Storage: Writeを持つtokenを使う。Firebaseの`apiKey`、`authDomain`、`appId`、service account JSON、private keyはbackendへ設定しない。

## Cloudflare運用

`wrangler.jsonc`のtop-level設定はproduction、`env.dev`はCloudflare上のdevelopment environmentであり、productionとは別のWorker、D1、R2 bindingを使う。local Workerはremote resourceへ書き込まない。

development environmentの初回はresourceをprovisionするため`wrangler:dev -- deploy`を先に実行する。作成後のschema更新はmigration、deployの順にする。

```sh
npm --workspace=@neon-underrealm/backend run wrangler:dev -- deploy
npm --workspace=@neon-underrealm/backend run wrangler:dev -- d1 migrations apply DB --remote
npm --workspace=@neon-underrealm/backend run wrangler:dev -- deploy
```

productionのremote migrationとdeployはmain限定のGitHub Actions workflowが担う。localからproduction commandを実行するのは、ユーザーの明示承認後だけにする。production workflowは`CLOUDFLARE_API_TOKEN`をRepository Secret、`FIREBASE_PROJECT_ID`をRepository Variableから受け取る。CORS originはGitHub Pages hostから導出する。

詳細なbinding、migration、authentication verifier、production smokeは[backend architecture](../docs/architectures/backend.md)と[公開手順](../docs/deployment.md)を正本とする。
