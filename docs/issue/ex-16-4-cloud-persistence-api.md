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

- `POST /character-sheets`は、id未指定ではserver発行IDによる作成、存在するid指定ではowner本人によるupsertとする。id指定で対象recordが未存在の場合は新規作成せずnot-found errorで拒否する。character `type`をrequestで受け取らず、作成時は`user`、更新時は既存値を維持する。
- read APIは公開し、optional authが有効なときだけ`isOwner`を計算する。write/deleteは検証済みtokenの`userId`とrecordの`userId`が一致するときだけ許可し、内部`userId`はrequestまたはresponseへ出さない。
- `GET /character-sheets`は全件を取得し、`user`と`sample`に分けたresponseを返す。`user`は`updatedAt DESC`、`sample`は`createdAt ASC`とする。server-side pagination、検索、sort APIは追加しない。
- `type`はD1の`VARCHAR(20)`に`user`または`sample`として保存する。管理者は自分の`userId`で作成したrecordをDBで直接`sample`へ変更できる。`userId`を変えないため、その管理者はsampleをUIから更新・削除できる。
- HTTP statusをerror contractとして設計する。期限切れtokenだけは`419`を返し、clientがstatusだけで再ログインを促せるようにする。その他の失敗はclientで共通エラー表示にまとめる。任意の不正requestへフィールド単位の親切なvalidation messageは返さず、汎用errorにとどめる。

### Backend implementation

- Hono handler、validation、service、repositoryを必要最小限に分離する。Clean Architectureの形式化や不要な層は追加しない。
- serviceはD1/R2固有のbindingや型を知らず、domain objectを扱う。repository interfaceはmetadataとsnapshotを一つのcharacter sheetとして操作し、DIで差し替えられるようにする。
- production compositionではD1/R2 repositoryとGoogle ID Token verifierを注入する。local executionとtestではWranglerのlocal D1/R2 binding、および決め打ちtokenからuser ID・有効・期限切れ・無効を返すtest verifierを明示注入する。production verifierを条件分岐でskipしない。
- production verifierはsignature、`iss`、`aud`、`exp`を検証する。test verifierを使うlocal E2Eとは別に、production verifier自体の検証をunit/contract testする。
- D1 metadataと、`user`の更新日時降順および`sample`の作成日時昇順を支えるindex、R2 snapshotの非transaction方針、部分失敗時のerror、R2 key、request body上限を親issueの方針どおり実装する。

### Documentation and tests

- `docs/requirements/architecture.md`へ、API contractの責務、validation/service/repository/verifierの境界、DI composition、production/local adapter、error contractを記録する。
- shared schema/type、service、repository、production verifier、owner authorization、`type`不変、一覧の分割と各sortをunit/contract testする。
- Wrangler local WorkerのD1/R2 bindingを使うlocal API E2Eを追加し、4 endpoint、作成/更新/取得/削除、公開read、owner判定、期限切れtoken、sampleの分類を確認する。既存backend integration CIで実行できる構成を維持・更新する。

## 初期スコープ外

- G5のfrontend API client、login/logout UI、character選択dialog、read-only UI、DB保存/削除操作、Help、Visual Review
- Google以外のIdentity Provider、独自OAuth callback、refresh tokenの保存または独自refresh処理
- character JSONのserver-side game schema validation、schema version migration、マスタID照合
- server-side pagination、検索、任意sort、共有URL、共同編集、revision history、管理画面
- D1/R2分散transaction、rollback、compensating transaction、orphan object自動cleanup
- output Zod schema、clientでのruntime response parse、入力のフィールド別エラーmessage

## 完了条件

- [ ] shared packageにinput Zod schemaとoutput TypeScript DTO/error typeが追加され、output Zod schemaを追加していない。
- [ ] 指定した4 endpointが共有contractどおりに動作し、id指定で未存在recordを新規作成しない。
- [ ] D1 metadataとR2 snapshotがrepositoryの背後へ隠蔽され、production/local/test adapterをDIで差し替えられる。
- [ ] Google ID Tokenのproduction verifierと、明示注入するtest verifierが分離され、productionで検証skipの条件分岐がない。
- [ ] 期限切れtokenが`419`で返り、clientがstatusだけで他の認証失敗から区別できる。error contractがbackend architectureに記録されている。
- [ ] `type`は作成時に`user`、更新時に不変であり、一覧は`user`を更新日時降順、`sample`を作成日時昇順で返す。
- [ ] D1のindexが`user`の更新日時降順と`sample`の作成日時昇順の一覧を支えている。
- [ ] internal `userId`をrequestまたは公開responseへ出さず、owner以外のwrite/deleteを拒否する。
- [ ] local D1/R2 binding API E2Eが4 endpointと認証・所有権・sample分類を確認し、backend CIで実行できる。
- [ ] `npm run check`、shared/backendのtestとbuild、backend integration testが通る。
- [ ] 関連TODOを回収せず、このissueで扱わない理由が記録されている。

## チェックポイント

- [ ] D1/R2のbindingやSDK型をhandler/service/shared packageへ漏らしていない。
- [ ] validationはshared Zod schemaを正本とし、character JSON本体のゲーム規則をbackendで検証していない。
- [ ] 不正requestのresponseがfield-levelの利用者向けmessageへ肥大化していない。
- [ ] `sample`へ変更したrecordの`userId`を維持し、作成者のowner権限を失わせていない。
- [ ] local/test verifierがproduction compositionから選択されない。
- [ ] 新規dependencyを追加する場合、選定理由、代替案、初期スコープに必要な理由をこのissueへ記録する。
- [ ] credential、token、Wrangler local stateをGit管理しない。
- [ ] G5 UI機能やscope外のAPIを混在させていない。
- [ ] ユーザーの未コミット変更を破壊していない。

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
- production/local/testのrepository・verifierのDI境界が明確で、productionの認証検証をtest用分岐で弱めていないか。
- `sample`の分類とsort、`type`の更新不変、作成者のowner権限が一貫しているか。
- D1/R2固有の詳細をserviceまたはshared contractへ漏らさず、local API E2Eが実際のWrangler local bindingと通信するか。
- TODOのschema version互換性とスキルID変更検出を、判断なしにこのGateへ含めていないか。

## 備考

- APIのHTTP statusの詳細な対応は実装時に設計する。期限切れtokenだけは必ず`419`とする。
- local WorkerはWranglerがD1/R2 bindingを提供するため、外部serviceやDocker volumeを追加せずに実行する。
