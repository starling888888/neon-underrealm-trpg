# Cloud persistence backendのアーキテクチャ

## 目的と適用範囲

本書は、`ex-16-4-cloud-persistence-api`で実装するcharacter sheet cloud persistence backendの設計正本である。HTTP API、shared contract、validation、service、repository、token verifier、production/local/testのcomposition、error contract、テスト境界を定義する。

frontendのクラウド保存UI、character sheetのrestore、Google login UIはG5の対象であり、本書では扱わない。ゲーム規則に対するcharacter JSONのserver-side validation、character JSON schema version migration、検索、server-side pagination、共有URL、D1/R2の分散transactionも対象外とする。

## 正本と制約

- 実装契約: `docs/issue/ex-16-4-cloud-persistence-api.md`
- 親要件: `docs/issue/ex-16-character-sheet-cloud-persistence.md`
- プロジェクトのアーキテクチャ要件: `docs/requirements/architecture.md`
- テストとCI: `docs/testing.md`
- 初期スコープ外: `docs/out-of-scope.md`

frontendは静的GitHub Pagesとして公開し、Cloudflare Worker backendとはHTTP APIだけで接続する。frontendはbackend内部moduleをimportしない。backendはHonoをHTTP entrypointとし、`wrangler.jsonc`をproduction resourceの管理とdeployの正本にする。`env.dev`はlocal開発者が実API接続を確認するためのCloudflare development environmentであり、production Workerとresourceを共有しない。

## 構成と依存方向

```text
HTTP request
  -> Hono handler
  -> input validation
  -> character sheet service
       -> token verifier
       -> character sheet repository
  -> HTTP response

production composition
  -> Google ID Token verifier + Cloudflare repository

local/test composition
  -> test token verifier + Cloudflare repository + Wrangler local D1/R2 binding
```

- Hono handlerはroute、HTTP request/response、shared input schemaの呼出し、error responseへの変換だけを扱う。
- validationは独立moduleに置く。API envelopeとmetadataを検証するが、character JSON snapshotのゲームschemaや現在のマスタIDは検証しない。
- serviceはdomain objectとrepositoryのpublic method形状、verifier interfaceだけに依存する。D1、R2、Cloudflare binding、Honoの型を参照しない。
- Cloudflare repositoryはD1 metadata操作とR2 snapshot操作を個別に扱い、private fieldにD1/R2 bindingを持つ。serviceが両操作を順序付けてcharacter sheetとして扱う。D1/R2の二重書込みをtransaction化せず、部分失敗はserviceへ通常の失敗として返す。
- DIはcomposition rootだけで行う。handlerやserviceに`test`/`production`の条件分岐を置かない。

Clean Architectureの形式的な層追加、repository interfaceとinfrastructure directoryの分離、database adapter、use caseごとのdirectory分割は導入しない。Cloudflare以外のdatabaseへ移行する場合はrepository自体をrefactorする。この節の境界を満たす最小のmodule構成にする。

## Domainと永続化

### Character sheet

domain objectは少なくとも、次の情報を扱う。

- opaqueでserver発行のcharacter sheet ID
- 非公開のowner `userId`
- `type`: `user`または`sample`
- 表示用metadata（PC名、PL名、格、プライマリ流儀ID、生き様ID、作成・更新日時）
- character JSON snapshotとBase64エンコード済み画像

`userId`は認可専用の内部情報であり、request bodyと公開responseに含めない。`isOwner`は、optional authで検証できたuser IDとdomain objectのownerが一致するときだけresponseへ付与する。

### D1とR2

D1はmetadata index、R2はsnapshot storeとして使う。D1 rowには`type VARCHAR(20)`を保存し、値は`user`または`sample`だけを許可する。D1には、`user`を更新日時降順、`sample`を作成日時昇順で一覧にするために必要なindexを置く。

R2 keyは`{userId}/{id}.json`とする。`type`を`sample`へ変更しても`userId`とR2 keyは変えない。

new recordはid未指定の`POST /character-sheets`だけで作成し、serviceがIDを発行する。既存idの更新では、serviceがrepositoryからrecordを取得してownerを照合する。id指定でrecordが見つからない場合は新規作成せずnot-found errorにする。

管理者は、自分がownerであるrecordを通常APIで作成した後、D1の`type`だけを直接`sample`へ変更できる。この操作用のAPI、role、管理画面は作らない。owner `userId`は維持するため、同じ管理者はsampleをUIから更新・削除できる。

### D1 schema

G4の初回migrationは、以下のschemaを作る。時刻はUTCのUnix epoch millisecondsを`INTEGER`で保存する。

```sql
CREATE TABLE character_sheets (
  id TEXT PRIMARY KEY NOT NULL,
  owner_user_id TEXT NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'user'
    CHECK (type IN ('user', 'sample')),
  pc_name TEXT NOT NULL,
  pl_name TEXT,
  rank INTEGER NOT NULL,
  primary_ryugi_id TEXT,
  ikizama_id TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_character_sheets_user_updated_at
  ON character_sheets (type, updated_at DESC);

CREATE INDEX idx_character_sheets_sample_created_at
  ON character_sheets (type, created_at ASC);
```

- `id`はserverが発行するopaqueなglobal unique IDである。
- `owner_user_id`はGoogle `sub`から導く内部値であり、公開APIへ出さない。
- `type`は作成request・更新requestで受け取らない。新規作成はdefaultの`user`、更新は既存値を維持する。管理者だけがD1へ直接変更できる。
- `pl_name`、`primary_ryugi_id`、`ikizama_id`は未設定を許可する。`pc_name`と`rank`はDB保存前の入力制約により必須である。
- `created_at`と`updated_at`はWorkerが`Date.now()`で設定する。公開DTOで日時文字列が必要な場合だけ、API response境界でISO 8601へ変換する。
- 2つのindexはそれぞれ`WHERE type = 'user' ORDER BY updated_at DESC`と`WHERE type = 'sample' ORDER BY created_at ASC`の一覧queryを支える。

### Migration lifecycle

- executable SQLは`backend/migrations/`へ連番で追加する。適用済みmigrationを編集・削除せず、schema変更は次の連番migrationで行う。
- local実行はWrangler / Miniflare / workerdのD1・R2 bindingを使う。`dev:local`と`migrate:local`は`wrangler:dev`を通じてGit ignoreした`backend/.wrangler/state/`を明示的なlocal stateにし、`local:reset`、`migrate:local`、`dev:local`の順で実行する。local integration testも同じstateで実際のWorkerへHTTP requestを送る。`local:reset`はstateとWranglerの一時bundleである`.wrangler/tmp/`を削除するため、作業後は必ず再実行してlocal artifactを残さない。
- development cloud environmentの初回は`wrangler:dev -- deploy`でD1/R2をprovisionする。その後と以後のschema更新では、`wrangler:dev -- d1 migrations apply DB --remote`がdevelopment D1へ未適用migrationを適用し、`wrangler:dev -- deploy`がdevelopment Workerを更新する。Wranglerのenvironment名によりWorkerは`neon-underrealm-backend-dev`となる。`backend/bin/wrangler.sh`はdevelopmentの`backend/.env`を存在時だけsourceし、`deploy`時だけ`GOOGLE_OAUTH_CLIENT_ID`と`CORS_ALLOW_ORIGIN`を公開Worker `vars`へ渡す。local `wrangler dev`はWrangler標準の`.env`自動読込で同じ値をbindingとして得るため、wrapperは`--var`を追加しない。development CORS allow originは`http://localhost:4321,http://localhost:4322`である。
- productionでは2026-08-25に初回`wrangler:prod -- deploy`でD1/R2をprovisionし、初回migrationを適用済みである。以後は`wrangler:prod -- d1 migrations apply DB --remote`がremote D1へ未適用migrationを適用し、その後`wrangler:prod -- deploy`がWorkerを更新する。D1のmigration tableが適用済みSQLを管理する。
- production deployはGitHub Repository Variableのproduction Google client IDと、`${{ github.repository_owner }}`から導出するCORS allow originをjob環境変数から`--var`へ渡す。GitHub Pagesのcustom domainへ移行した場合だけ、CORS originを明示設定へ切り替える。CIはGoogle client IDが未設定ならdeploy前に失敗する。Google client IDとCORS allow originをCloudflare secretへ登録しない。
- `wrangler.jsonc`のproductionと`env.dev`のD1/R2 draft bindingを正本とし、それぞれresourceが未作成の初回deployではWranglerが作成・bindingする。D1/R2 bindingと`vars`はenvironment間で継承されない。resource名・location・lifecycleを明示管理する必要が出たときは、automatic provisioningのBeta採用を再評価する。

## Shared API contract

### Input

入力値のZod schemaは`packages/shared`で公開する。backendはrequest validationの正本として使い、clientは送信前の最低限のvalidationに利用できる。

`POST /character-sheets`のbodyは次の形とする。`snapshot`はゲーム規則を検証しない任意のJSON object、`imageBase64`はbase64文字列または`null`である。body全体は8 MiBまでとする。

```ts
{
  id?: string;
  metadata: {
    pcName: string;
    plName?: string | null;
    rank: number;
    primaryRyugiId?: string | null;
    ikizamaId?: string | null;
  };
  snapshot: Record<string, unknown>;
  imageBase64: string | null;
}
```

requestには`userId`と`type`を含めない。`POST`のidは任意であり、未指定なら作成、存在するidなら更新を表す。input validation failureは、個々のfieldの利用者向け説明を持たない汎用errorにする。

### Output

response DTO、error envelope、公開metadata、list response、domainの公開型は`packages/shared`のTypeScript型として公開する。output用のZod schemaは作らず、clientはresponseが共有型どおりであることを前提に型を絞り込む。clientでのruntime response parseも行わない。

公開metadataには`id`、`type`、表示用metadata、timestamps、`isOwner`を含められるが、内部`userId`は含めない。

### Endpoints

| Method | Path                    | Auth     | 動作                                          |
| ------ | ----------------------- | -------- | --------------------------------------------- |
| GET    | `/character-sheets`     | optional | 全件を取得し、`user`と`sample`へ分けて返す。  |
| POST   | `/character-sheets`     | required | idなしで作成、存在するidでowner限定更新する。 |
| GET    | `/character-sheets/:id` | optional | snapshotを含む1件を取得する。                 |
| DELETE | `/character-sheets/:id` | required | owner限定で1件を削除する。                    |

list responseはserver-side paginationなしで、`user`と`sample`の配列を返す。`user`は`updatedAt DESC`、`sample`は`createdAt ASC`とする。検索、任意sort、pagination parameterは設けない。

## 認証とerror contract

### Token verifier

verifier interfaceはtokenを検証し、検証済みの`userId`または認証失敗の分類を返す。production implementationはGoogle ID Tokenのsignature、`iss`、`aud`、`exp`を検証する。

local API E2Eとtestはtest verifierを明示注入する。test verifierは決め打ちtokenを、有効、期限切れ、無効の結果へ対応付ける。production verifierを`if`文でskipしたり、環境変数で検証を無効化したりしない。production verifier自体はunit/contract testする。

Authorization headerがない公開GETはanonymous readとして処理する。headerが存在する場合は検証し、期限切れまたは無効ならpublic GETでもerrorを返す。required auth endpointでheaderがない場合もerrorを返す。

### Error response

失敗responseは共有error envelopeに汎用`message`を持たせる。clientは期限切れtokenの`419`だけをstatusで判定し、その他の4xx/5xxは一律のエラー表示にする。validation field detail、token内容、internal error、`userId`は返さない。

| HTTP status | 用途                                                        |
| ----------- | ----------------------------------------------------------- |
| 400         | request schemaまたはmetadataが不正。                        |
| 401         | required endpointにtokenがない、またはtokenが検証不能。     |
| 403         | 認証済みだがownerではない。                                 |
| 404         | 指定idのrecordが存在しない。                                |
| 413         | application固有のbody上限を超過。                           |
| 419         | tokenの有効期限切れ。clientはstatusだけで再ログインを促す。 |
| 500         | 想定外のbackend failure。                                   |

D1/R2の部分失敗は、保存成功を装わず500として返す。rollback、compensating transaction、孤児objectの自動cleanupは実装しない。

## Repositoryとcomposition

`CloudflareCharacterSheetRepository`がD1 query、R2 key、metadataのread/write/delete、snapshotのread/write/deleteを個別に担当する。constructorでWorker bindingsを受け、`DB`と`OBJECTS`をprivate fieldへ保持する。`saveCharacterSheet`や`deleteCharacterSheet`のようにD1/R2をまたぐrepository methodは作らない。serviceはこのclassのpublic method形状を型として受け、create/update/deleteの順序と部分失敗を扱う。testでは同じ形状のmock repositoryを直接渡せる。mockは各testで明示的に作り、spyによる差し替えを使わない。

- production: WorkerのCloudflare D1/R2 bindingから`CloudflareCharacterSheetRepository`を生成する。
- local: 同じclassをWrangler local WorkerのD1/R2 bindingから生成する。
- service unit test: in-memory mock repositoryを直接注入する。databaseを差し替えるadapterは作らない。
- local API E2E: Wrangler local Workerにtest verifierを注入し、同じCloudflare repository経由でlocal D1/R2 bindingへ接続する。

local、test、productionで同じserviceとhandler contractを通す。storage SDK errorとCloudflare bindingはrepositoryまたはcomposition rootで閉じる。

## テストとCI

- shared input schema、公開output type、error envelopeをcontract testする。
- serviceではID発行、owner authorization、`type`の作成時`user`・更新時不変、listの分類とsort、未存在idの拒否、R2/D1部分失敗をtestする。
- verifierではproductionのtoken検証契約とtest verifierの有効・期限切れ・無効tokenをtestする。
- Cloudflare repositoryはmetadataとsnapshotの個別read/write/delete、および一覧用indexを使うqueryをtestする。serviceは複数repository操作の順序と部分失敗をtestする。
- local API E2Eは4 endpoint、anonymous read、owner以外のwrite/delete拒否、期限切れtokenの`419`、sample分類を確認する。
- backendの`tsc`はWorker sourceとworkspace boundaryを確認する。Node test runnerの型はWorkers runtime型とglobalが競合するため、unit testは`tsx --test`で実行する。testの型検査専用configは追加しない。

CIは既存のbackend integration jobでWrangler local Workerを起動し、local API E2Eを実行する。Cloudflare credentialやGoogle本番認証には依存しない。

## 実装時の確認

- `packages/shared`はinput schemaとoutput typeを混同しない。
- handler/service/shared packageへD1/R2固有の型を漏らさない。
- production compositionでtest verifierやlocal repositoryを選択できないようにする。
- 期限切れtokenを必ず`419`で返し、clientがbodyを読まずに再ログイン処理を選べる。
- `type`の更新をAPIで受け付けず、sample化後もowner `userId`を変えない。
- frontend UI、schema migration、管理機能をこのGateへ持ち込まない。
