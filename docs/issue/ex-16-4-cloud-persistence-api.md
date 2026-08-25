# ex-16-4-cloud-persistence-api

## 目的

Cloudflare Worker backendへ、共有API contract、character sheetのD1/R2永続化、公開readとowner限定write/deleteを追加する。

## 背景

親issue `ex-16-character-sheet-cloud-persistence` のG4として、G1のworkspace、G2のCloudflare infrastructure、G3のGoogle ID Token取得を前提に、G5のクラウド保存UIが利用するHTTP APIを実装する。

`docs/TODO.md`のJSON schema version互換性と永続スキルID変更検出は保存導入に関連するが、仕様が未決定のためこのGateでは回収しない。character JSON本体のゲームschema validationやmigrationも扱わない。

関連する正本は以下とする。

- 親issue: `docs/issue/ex-16-character-sheet-cloud-persistence.md`
- Gate plan: `docs/issue/ex-16-character-sheet-cloud-persistence/plan.md`
- backend architecture: `docs/requirements/architecture.md`
- backend test/CI方針: `docs/testing.md`
- 初期スコープ外: `docs/out-of-scope.md`

## Gate関係

- 親issue: `docs/issue/ex-16-character-sheet-cloud-persistence.md`
- Gate plan: `docs/issue/ex-16-character-sheet-cloud-persistence/plan.md`
- Gate: `G4: Cloud persistence API`

このissueはG4だけの実装契約である。G5のfrontend UI、character sheet restore、保存確認dialog、一覧画面は実装しない。

## 対象範囲

### API contract

- `packages/shared/`に入力値validation用のZod schemaを置く。backendは同じschemaをrequest validationに使い、clientも必要最小限の事前validationに利用できるようにする。
- `packages/shared/`にresponse DTO、error envelope、domain objectに必要なTypeScript型を公開する。output用Zod schemaやclientでのruntime response parseは追加しない。
- endpointは以下に限定する。

  ```txt
  GET    /character-sheets
  POST   /character-sheets
  GET    /character-sheets/:id
  DELETE /character-sheets/:id
  ```

- `POST /character-sheets`は、id未指定ではserver発行IDによる作成、存在するid指定ではowner本人によるupsertとする。id指定で対象recordが未存在の場合は新規作成せずnot-found errorで拒否する。character `type`をrequestで受け取らず、作成時は`user`、更新時は既存値を維持する。画像のBase64値は別fieldにせず、既存JSON exportと同じ復元用`snapshot`に含める。
- read APIは公開し、optional authが有効なときだけ`isOwner`を計算する。write/deleteは検証済みtokenの`userId`とrecordの`userId`が一致するときだけ許可し、内部`userId`はrequestまたはresponseへ出さない。
- `GET /character-sheets`はD1から`updatedAt DESC`で全件を一度だけ取得し、serviceで`user`と`sample`に分けたresponseを返す。`sample`だけをserviceで`createdAt ASC`に並べ替え、`user`は取得順を維持する。server-side pagination、検索、sort APIは追加しない。
- `type`はD1の`TEXT`に`user`または`sample`として保存する。管理者は自分の`userId`で作成したrecordをDBで直接`sample`へ変更できる。`userId`を変えないため、その管理者はsampleをUIから更新・削除できる。
- `primaryRyugiId`と`ikizamaId`は、現行の固定master IDだけを許可するshared Zod schemaで検証する。公開DTOの`createdAt`と`updatedAt`はD1のUnix epoch millisecondsを`number`のまま返し、serverでISO文字列へ変換しない。
- inputとresponseは、`id`、`metadata`、`snapshot`を基本構造として揃える。listとPOST responseは`id`とserver側metadataを返すsnapshotなしsummary、individual GET responseだけがsnapshotを含むdetailとする。
- HTTP statusをerror contractとして設計する。期限切れtokenだけは`419`を返し、clientがstatusだけで再ログインを促せるようにする。その他の失敗はclientで共通エラー表示にまとめる。任意の不正requestへフィールド単位の親切なvalidation messageは返さず、汎用errorにとどめる。

### Backend implementation

- Hono handler、authentication middleware、validation、service、repositoryを必要最小限に分離する。`backend/src`は単数形の`domain/`、`service/`、`repository/`、`validation/`、`auth/`へ分け、`domain/`、`service/`、`repository/`、`validation/`は各directoryの`index.ts`を公開入口にする。認証固有ではない`ApplicationError`は`src/`直下に置く。Clean Architectureの形式化や不要な層は追加しない。
- serviceはD1/R2固有のbindingや型、Authorization header、token verifierを知らず、認証middlewareが解決した`actorUserId: string | null`とdomain objectを扱う。Cloudflare repositoryはD1 metadata操作とR2 snapshot操作を個別に隠し、private fieldに`env.DB`と`env.OBJECTS`を持つ。serviceが複数repository操作を組み合わせてcharacter sheetを扱う。database adapterやinfrastructure layerは作らない。
- productionとlocal executionは同じCloudflare repositoryを、それぞれWorkerから渡されるD1/R2 bindingで生成する。認証middlewareはproduction/localでそれぞれGoogle verifierまたはtest verifierを明示注入する。service unit testは同じpublic method形状のmock repositoryを注入し、spyによる差し替えを使わない。test verifierは決め打ちtokenからuser ID・有効・期限切れ・無効を返す。production verifierを条件分岐でskipしない。
- production verifierはsignature、`iss`、`aud`、`exp`を検証する。test verifierを使うlocal E2Eとは別に、production verifier自体の検証をunit/contract testする。
- D1 metadataの全件更新日時降順query、R2 snapshotの非transaction方針、部分失敗時のerror、R2 key、request body上限を親issueの方針どおり実装する。sampleの作成日時順はserviceで扱う。

### Documentation and tests

- `docs/requirements/architecture.md`へ、API contractの責務、authentication middleware/validation/service/repository/verifierの境界、mock repositoryを使うservice unit test、ApplicationErrorとHTTP status mappingを記録する。Cloudflare repositoryはprivate fieldにD1/R2 bindingを持ち、database adapterやinfrastructure layerを作らない。`wrangler.jsonc`の`env.dev`によるCloudflare development Worker、productionとのD1/R2・設定値分離、初回deployがmigrationより先に必要なdevelopment migration/deploy手順も記録する。`backend/bin/wrangler.sh`がenvironment選択を集約し、developmentで`backend/.env`が存在する時だけsourceする。`deploy`時だけGoogle client IDとCORS allow originをWorker `vars`へ渡し、production CIはGitHub Repository Variableとrepository ownerから値を与える。
- shared schema/type、authentication middleware、service、repository、production verifier、owner authorization、`type`不変、一覧の分割と各sortをunit/contract testする。
- Wrangler local WorkerのD1/R2 bindingを使うlocal API E2Eを追加し、4 endpoint、作成/更新/取得/削除、公開read、owner判定、期限切れtoken、sampleの分類を確認する。既存backend integration CIで実行できる構成を維持・更新する。

## 初期スコープ外

- G5のfrontend API client、login/logout UI、character選択dialog、read-only UI、DB保存/削除操作、Help、Visual Review
- Google以外のIdentity Provider、独自OAuth callback、refresh tokenの保存または独自refresh処理
- character JSONのserver-side game schema validation、schema version migration、マスタID照合
- server-side pagination、検索、任意sort、共有URL、共同編集、revision history、管理画面
- D1/R2分散transaction、rollback、compensating transaction、orphan object自動cleanup
- output Zod schema、clientでのruntime response parse、入力のフィールド別エラーmessage

## ユーザー指示による関連外変更

- 無料枠の不要な消費を防ぐため、developmentを含む実環境のAPI requestとremote操作をユーザーの明示許可制にする常設ルールを`AGENTS.md`へ追加した。local binding、Miniflare、workerdを使うtestは対象外である。この変更はG4のAPI機能契約を変更しない。

## 完了条件

- [x] shared packageにinput Zod schemaとoutput TypeScript DTO/error typeが追加され、output Zod schemaを追加していない。fixed master ID、snapshot内の画像、numeric timestamp、input/responseの構造統一を共有contractへ反映する。
- [x] 指定した4 endpointが共有contractどおりに動作し、id指定で未存在recordを新規作成しない。
- [x] D1 metadataとR2 snapshotの個別操作がCloudflare repositoryの背後へ隠蔽され、serviceがそれらを組み合わせる。同じrepositoryをproduction/local bindingで使い、service unit testはmock repositoryを注入する。
- [x] Google ID Tokenのproduction verifierと、明示注入するtest verifierがauthentication middlewareへ分離され、productionで検証skipの条件分岐がない。
- [x] 期限切れtokenが`419`で返り、clientがstatusだけで他の認証失敗から区別できる。ApplicationError codeからHTTP statusをpresentation層で対応付け、error contractをbackend architectureに記録する。
- [x] `type`は作成時に`user`、更新時に不変であり、一覧は全件を`updatedAt DESC`で取得後にserviceが`user`と`sample`へ分け、sampleだけを`createdAt ASC`で返す。
- [x] D1 metadata queryは全件の`updatedAt DESC`取得を扱い、sampleの表示順はserviceが決定する。
- [x] internal `userId`をrequestまたは公開responseへ出さず、owner以外のwrite/deleteを拒否する。
- [x] local D1/R2 binding API E2Eが4 endpointとauthentication middleware・所有権・sample分類・numeric timestamp・response構造を確認し、backend CIで実行できる。
- [x] Cloudflare上のdevelopment Workerはproduction Worker、D1、R2、設定値を共有せず、localからdevelopment migration/deployを実行できる。
- [x] development `deploy`は`backend/.env`から、production deployはGitHub Repository VariableのGoogle client IDとrepository ownerから導出するCORS allow originを、公開Worker `vars`として注入する。local `wrangler dev`はWranglerの`.env`自動読込でbindingを得るため、wrapperによる追加対応を必要としない。
- [x] `npm run check`、shared/backendのtestとbuild、backend integration testが通る。
- [x] 関連TODOを回収せず、このissueで扱わない理由が記録されている。

## チェックポイント

- [x] D1/R2のbindingやSDK型をhandler/service/shared packageへ漏らしていない。
- [x] validationはshared Zod schemaを正本とし、character JSON本体のゲーム規則をbackendで検証していない。
- [x] 不正requestのresponseがfield-levelの利用者向けmessageへ肥大化していない。
- [x] `sample`へ変更したrecordの`userId`を維持し、作成者のowner権限を失わせていない。
- [x] local/test verifierがproduction compositionから選択されない。
- [x] 新規dependencyを追加する場合、選定理由、代替案、初期スコープに必要な理由をこのissueへ記録する。
- [x] credential、token、Wrangler local stateをGit管理しない。
- [x] G5 UI機能やscope外のAPIを混在させていない。
- [x] ユーザーの未コミット変更を破壊していない。
- [ ] 実装完了と全完了条件の確認後に、Draft PRをReady for reviewへ変更し、確認結果に合わせてPR本文を更新する。

## Development environment API確認

2026-08-25にCloudflare development WorkerへGoogle ID Tokenで実リクエストを送り、`frontend/public/sample-character/`の10件を使って次を確認した。tokenと一時scriptは処理後に削除し、最終的にdevelopment environmentの全recordをAPI経由で削除して一覧が空であることを確認した。

- `POST /character-sheets`: 10件を登録した。2件目から10件目は各requestの間を1秒空けた。管理者がD1で一部の`type`を`sample`へ変更した後も、`POST` upsertでownerと`sample` typeが維持されることを確認した。
- `GET /character-sheets`: `user`は`updatedAt DESC`、`sample`は`createdAt ASC`で分類・返却されることを確認した。
- `GET /character-sheets/:id`: metadataと既存JSON export形式のsnapshotを取得し、`imageBase64String`を含むことを確認した。
- 生成したWebP（5,178,064 bytes、約5 MB）をBase64化してsample snapshotの`imageBase64String`へ入れ、6,908,574 bytesの`POST` upsertが8 MiB request上限内で成功することを確認した。
- 同recordのcharacter nameをmetadataとsnapshot内の両方で変更してupsertし、個別GETで両値と`sample` typeの維持を確認した。
- `DELETE /character-sheets/:id`: individual delete後の個別GETが`404`になることを確認した。最後に残り9件を削除し、list responseが`{ "sample": [], "user": [] }`となることを確認した。

## ユーザー指示: backend test architecture

- backend test runnerは`docs/testing.md`の標準どおりVitestへ統一する。`backend/tests/unit/`を通常Vitest configの対象、`backend/tests/integration/`をintegration専用Vitest configの対象にする。通常`test`はintegrationを除外し、`test:integration`はintegration directoryだけを実行する。
- `tsconfig.json`はWorker source、unit/integration test、Vitest configを全件型検査する。`tsconfig.build.json`はそれをextendsしてtestsを除外するWorker build用configとする。Cloudflare WorkersとNode/Vitestの外部宣言競合には`skipLibCheck`を使い、project source/testの型検査を省略しない。
- 過去のreview対応で採用した`tsx --test`とtest専用型検査を追加しない判断は、このユーザー指示で置換する。
- 新規dependencyの`vitest`はfrontendと同じunit test runnerをbackendで明示利用するため、`@types/node`はbackendのNode/Vitest test型を明示的に解決するために追加する。Node test runnerの継続は`docs/testing.md`のVitest標準と矛盾し、test実行対象のunit/integration分離も表現できないため採用しない。
- test assertionはVitestの`expect`へ統一し、Node組み込みの`assert`は使わない。integration testはendpointごとのcaseへ分け、評価対象endpoint以外で必要な既存stateを、`getPlatformProxy`で同じlocal stateを開いた`CloudflareCharacterSheetRepository`から登録する。各caseは`afterEach`で登録したD1 metadataとR2 snapshotを削除する。Wrangler CLIを`execFile`で起動してstateを書き換えない。

## レビュー指摘 1

### 指摘事項

- `wrangler:prod -- deploy`が公開runtime varsの未設定時にも空値を渡せるため、production設定を誤って上書きできる。local用とproduction用のGoogle client IDを分ける実運用とREADMEも整合していない。
- `dev:local`の公開runtime varsの読込経路を、wrapper独自の`.env`読込とWrangler標準の自動読込のどちらにするかが未整理である。
- production Workerが無認証の`/diagnostics/probe`でD1/R2書込みを公開している。character APIへ置換するG4でproduction routeから除去する必要がある。
- G4でshared API contractをbackendがimportした後も、`packages/shared/**`単独変更でbackend test、integration、production deployが起動しない。
- migration先行deploy時の旧Workerとの後方互換性、およびbackend unit/integration testのTypeScript型検査範囲が未定義である。
- Draft PR #217はmainとの差分としてG1〜G3の累積変更も含むが、本文がG4の準備だけに見える。

### 判定

- source: local-pr-review
- classification: valid
- local validation: `backend/bin/wrangler.sh`は`deploy`だけに`--var`を追加し、未設定を拒否しない。`backend/src/app.ts`のdiagnostic routeはproduction compositionからも到達できる。`.github/workflows/ci.yml`と`.github/workflows/backend-deploy.yml`のbackend対象には`packages/shared/**`がない。READMEのGoogle client ID手順はlocalとproductionを同じ値としている。migration lifecycleと`backend/tsconfig.json`もreview指摘どおりの未定義範囲を持つ。Gate planはG1〜G3をdoneと記録し、PR #217のbaseはmainである。

### 対応方針

- `wrangler dev`はWrangler標準の`.env`自動読込で公開varsをWorker bindingとして得るため、wrapperでの追加対応は不要とする。remote `deploy`は`.env`自動読込だけではWorker varsを登録しないため、development wrapperが`backend/.env`を存在時だけsourceし、`deploy`時だけ`--var`で注入する。production CIはproduction用のGoogle client IDが未設定なら失敗させ、job環境変数から同じ`--var`注入を行う。CORS originはrepository ownerから常に導出する。
- local frontend/backendとproduction frontend/backendのGoogle client IDを環境単位で分離して文書化する。
- G4 API実装とともにproductionのdiagnostic write routeを除去し、local API E2Eへ置き換える。
- shared packageだけを変更するPRは、frontendまたはbackend consumerの変更漏れとしてCIで失敗させる。consumerを変更した場合は、そのworkspaceの既存testを実行する。
- migrationの後方・前方互換性は、このserviceの運用特性上、G4では扱わない。backendの`tsc`はWorker sourceを対象にし、Node test runnerの型はWorkers runtime型と競合するためunit testは`tsx --test`で実行する。test専用のtypecheck configは追加しない。
- Gate reviewの初回差分は親branch、途中・再reviewの差分は前回review commit以後を対象にする。mainとの差分を前提にPR本文へG1〜G3の累積差分を列挙しない。実装完了時にはReady for reviewへの変更と最終本文更新を行う。

### 対応完了チェックリスト

- [x] local `wrangler dev`は既存のWrangler標準読込に委ね、remote deployは`--var`で公開varsを注入する。production deployはGoogle client ID未設定時に失敗し、localとproductionのGoogle client IDが混在しない。
- [x] productionの`/diagnostics/probe`をG4 APIへ置換し、外部からR2を書き込めない。
- [x] shared packageだけの変更をCIで拒否し、consumerの変更時に対応するworkspace testを実行する。
- [x] migrationの後方互換性をG4で扱わず、backendの`tsc`はWorker sourceを確認する。Node test runnerの型はWorkers runtime型と競合するため、unit testは`tsx --test`で実行し、test専用typecheck configは追加しない。
- [ ] Gate reviewを親branchまたは前回review commit以後の差分に限定し、PR本文を実装完了時に更新する。
- [x] `npm run check`が通る。
- [x] backendのbuild、test、local integration testが通る。

## レビュー指摘 2

### 指摘事項

- `backend/src`のmoduleがflatに置かれ、layerごとの入口と依存方向を読み取りにくい。単数形の`domain/`、`service/`、`repository/`、`validation/`、`auth/`へ分け、`domain/`、`service/`、`repository/`、`validation/`は`index.ts`を公開入口にする。認証固有ではないApplicationErrorはroot直下に置く。
- repositoryが`user`と`sample`を別々のD1 queryで取得している。D1からは全件を`updatedAt DESC`で取得し、responseの分類とsampleの`createdAt ASC` sortはserviceに置く。
- `primaryRyugiId`と`ikizamaId`が任意文字列であり、入力schemaが固定master IDを表していない。`imageBase64`がsnapshotの外にあり、取得したsnapshotを既存のclient restoreへそのまま渡せない。公開timestampもISO文字列へ変換している。
- ServiceがAuthorization headerとtoken verifierを扱い、`ApiError`がHTTP statusを保持している。認証はmiddlewareで検証して`actorUserId`だけをhandler/serviceへ渡し、Serviceと認証logicは意味コードを持つ`ApplicationError`だけを扱う。HTTP statusへの対応とresponse作成は`app.onError`へ集約する。

### 判定

- source: human + self-review
- classification: valid
- local validation: `backend/src`のapplication codeはflatに置かれている。`CloudflareCharacterSheetRepository.listMetadata()`はtype別の2 queryを実行し、`CharacterSheetService`はその順序に依存して分類だけを行う。shared schemaは両master IDを`string`として受け、`imageBase64`はtop-level inputとR2 payloadに分離されている。`toMetadata()`はepoch millisecondsをISO 8601へ変換している。Serviceはtoken verifierをconstructor注入してAuthorization tokenを受け、`ApiError`はstatusを保持する。
- self-review: list responseをmetadataだけ、individual GETをsnapshot付きdetailとして分ける現在のcontractは要件に適合しており、変更不要である。初回保存をclient発行UUIDにしてretryを冪等化する案は、親issueのserver発行IDと衝突するため、このGateの対応には含めない。

### 対応方針

- moduleを指定directoryへ移し、`domain/`、`service/`、`repository/`、`validation/`のpublic importを各`index.ts`に集約する。`auth/`にはtoken verifierとauthentication middlewareを置き、ApplicationErrorはroot直下に置く。
- repositoryはD1/R2 native APIの隠蔽だけを担い、`listMetadata()`は`updated_at DESC`で全recordを返す。serviceがresponseを`user`と`sample`へ詰め替え、sampleだけを`createdAt ASC`でsortする。
- shared input schemaの`primaryRyugiId`と`ikizamaId`を現行固定master IDに限定する。画像をsnapshotへ戻し、snapshotをR2 objectとしてそのまま保存・返却する。公開DTOのtimestampはepoch millisecondsの`number`とする。
- authentication middleware factoryへproduction/localのverifierをDIする。tokenなしはanonymous user、invalid/expired tokenはmiddlewareからApplicationErrorにする。Serviceは`actorUserId: string | null`だけを受け、認証済みであることとownerを判定する。
- `ApplicationErrorCode`を固定し、`app.onError`だけが網羅的なcode-to-status対応でerror responseを返す。期限切れcodeは必ず`419`へ対応させる。HTTP statusをservice、repository、token verifier、validationへ漏らさない。

### 対応完了チェックリスト

- [x] backend moduleを単数形layer directoryへ再配置し、指定の`index.ts`公開入口と依存方向を確認する。
- [x] repositoryの全件queryとserviceの分類・sample sortを実装し、unit testで順序を確認する。
- [x] shared schema/typeとR2 snapshotを、固定master ID、snapshot内画像、numeric timestampのcontractへ更新する。
- [x] authentication middlewareでverifier DIとoptional/required authを扱い、Serviceからtoken/header依存を除く。
- [x] ApplicationErrorとpresentation層のHTTP status mappingへ置換し、expired tokenが`419`になることを確認する。
- [x] service unit、verifier/middleware test、local API E2Eを更新する。mock repositoryを明示注入し、spyを使わない。
- [x] backend architecture、requirements architecture、testing documentを実装と整合させる。
- [x] `npm run check`が通る。
- [x] shared/backendのtest、backend build、local API integration testが通る。

## 想定変更ファイル

- `backend/src/`
- `backend/tests/`
- `backend/package.json`
- `backend/wrangler.jsonc`
- `packages/shared/src/`
- `packages/shared/tests/`
- `packages/shared/package.json`
- `docs/requirements/architecture.md`
- `docs/architectures/backend.md`
- `docs/testing.md`
- `.github/workflows/ci.yml`
- `.github/workflows/backend-deploy.yml`
- `docs/issue/ex-16-character-sheet-cloud-persistence.md`

## レビュー観点

- shared packageの入力schemaとoutput typeの責務が分かれ、runtime response validationを追加していないか。
- 期限切れtokenの`419`をclientが再ログイン判断でき、他のfailureを共通エラー表示へまとめられるか。
- Cloudflare repositoryがD1/R2 bindingをprivateに閉じ、service unit testがmock repositoryをspyなしで注入し、productionの認証検証をtest用分岐で弱めていないか。
- `sample`の分類とsort、`type`の更新不変、作成者のowner権限が一貫しているか。
- D1/R2固有の詳細をserviceまたはshared contractへ漏らさず、local API E2Eが実際のWrangler local bindingと通信するか。
- TODOのschema version互換性とスキルID変更検出を、判断なしにこのGateへ含めていないか。

## 備考

- APIのHTTP statusの詳細な対応は実装時に設計する。期限切れtokenだけは必ず`419`とする。
- local WorkerはWranglerがD1/R2 bindingを提供するため、外部serviceやDocker volumeを追加せずに実行する。
- 新規dependencyとして、sharedの入力schemaには`zod`を追加する。frontendで既に採用済みであり、独自validation実装ではfrontend/backend間のschema重複を避けられないためである。Google ID Token verifierにはWorkers互換の`jose`をbackendへ追加する。JWKS取得、署名、issuer、audience、expirationを独自実装せずに検証するためである。
