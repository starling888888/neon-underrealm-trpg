# ex-16-character-sheet-cloud-persistence

## 目的

WebキャラクターシートへGoogle認証、Cloudflare上のキャラクター永続保存、およびキャラクター一覧を追加する。

既存のAstro + React frontendとGitHub Pages公開は維持し、Cloudflare Workers、D1、R2による独立backendを追加する。frontend、backend、shared packageをworkspaceとして分離し、各層を独立して検証・deployできるようにする。

## 背景

現行のキャラクターシートはlocalStorageとIndexedDBへ最新1件を保存するlocal-first構成であり、認証、クラウド保存、複数キャラクター管理、backendは初期スコープ外である。

このissueでは、上記のうちGoogle認証、クラウド保存、複数キャラクター一覧、backendを正式な実装対象へ変更する。ローカル保存は廃止せず、ログイン不要で編集を継続できる作業用保存として維持する。

Gateの一覧と依存関係は親issue本文ではなく、`docs/issue/ex-16-character-sheet-cloud-persistence/plan.md` を正本とする。各Gateは着手時に独立したchild issueを作成・承認してから実装する。

## 対象範囲

### 要件・運用文書の正本化

- `docs/requirements/character-sheet.md`を、ローカル保存に加えてGoogle認証、クラウド保存、複数キャラクター一覧を扱う要件へ更新する。
- `docs/requirements/architecture.md`を、GitHub Pagesの静的frontendと独立したCloudflare backendを許容する構成へ更新する。
- `docs/out-of-scope.md`から今回正式に対象化する認証、サーバー・DB・クラウド保存、複数キャラクター管理を除外し、対象外を再定義する。
- `docs/development-structure.md`、`docs/testing.md`、必要に応じて`docs/deployment.md`を、workspace、backend、独立CI/CD、Wranglerの責務へ整合させる。
- 現行要件が「画像はJSONへ含めない」とする点は、R2へ保存するクラウド用snapshotにはBase64エンコード済み画像を含める仕様へ更新する。ローカルのIndexedDB画像recordの責務は維持する。

### Workspaceと独立CI/CD

- 現在のAstroサイトを`frontend/`へ移動し、`backend/`と`packages/shared/`を追加する。rootには`.agents/`、`.github/`、`.codex/`、`docs/`、`AGENTS.md`、workspace管理設定を残す。
- frontendとbackendは互いの内部moduleをimportせず、API DTO、metadata型、validation schema、API error型はshared packageを経由して共有する。
- frontendとbackendは、dependency install、format/lint、type check、unit/contract test、build、deployを独立して実行できる。CIはrootの共通checkを先行して実行し、workspaceのtestは各directory、root依存設定、workflowの変更時だけ並列実行する。shared packageの変更ではsharedを検証し、依存workspaceの型検査はroot checkで確認する。
- frontendはGitHub Pages、backendはCloudflareへdeployする。Gateと親branchではbackendのGitHub Actions deployを行わない。local開発者が実API接続を確認するため、Wranglerのdevelopment environmentへ専用WorkerとD1/R2をdeployできるようにする。`backend/bin/wrangler.sh`がdevelopment / productionのenvironment選択を集約する。local `wrangler dev`の公開設定はWranglerがGit ignoreした`backend/.env`を自動読込し、development remote deployは同fileを存在時だけsourceして`--var`で注入する。production CIはGitHub Repository Variableのproduction Google client IDとrepository ownerから導出するCORS allow originを`--var`で注入する。Google client IDとCORS allow originをCloudflare secretにしない。productionへのlocal Wrangler deployはユーザー承認後にだけ実行する。GitHub Actionsによるproduction backend deployは`main` merge後のpushだけに限定し、`workflow_dispatch`を含む手動起動を許可しない。
- Gate child issueの差分reviewは、初回はchild branchと親branchとの差分を対象にする。実装途中または再reviewでは、前回reviewしたchild commit以後の差分だけを対象にする。いずれもmainとの差分をGate reviewの対象にしない。

### BackendとInfrastructure as Code

- backendはTypeScriptのCloudflare Workerとし、HTTP API、Google ID Token検証、D1、R2を扱う。
- `wrangler.jsonc`でWorkerとD1/R2 bindingを管理し、Wranglerがremote migrationとbackend deployを実行する。resource deployのauthorityを複数toolへ二重化しない。
- D1/R2 resourceがない初回deployではWrangler automatic provisioningを使う。このBeta機能の制約が初期スコープを超える場合は、明示的なresource管理方針を別taskで決める。
- Cloudflare API token、Google設定値などのsecretはGit管理しない。
- Google Cloud project、Google Auth Platformのbranding、GIS用Web OAuth client、Authorized JavaScript originsはユーザーがCloud Consoleで事前に作成・登録する。これらはWrangler管理対象に含めない。G3は発行済みclient IDを設定値として受け取る。
- 主要な新規dependencyは、公式性、継続保守、利用実績、security上の懸念を実装時点で確認し、選定理由を該当child issueへ記録する。

### 認証、データ、API

- frontendはGoogle Identity ServicesでID Tokenを取得する。client secret、独自OAuth callback、refresh tokenの保存・独自refresh処理は追加しない。
- 認証必須APIではJWT signature、`iss`、`aud`、`exp`を検証し、検証済みGoogle `sub`だけを内部`userId`として使う。`userId`をclient入力から受け取らず、公開responseへ返さない。email、display name、profile imageは保存しない。
- D1にはcharacter ID、内部`userId`、`TEXT`の`type`（`user`または`sample`）、`isPublic`、PC名、PL名、格、プライマリ流儀ID、生き様ID、作成・更新日時をmetadataとして保存する。既存recordはmigration後にpublicとして扱う。APIの作成・更新requestは`type`を受け取らず、新規作成時は`user`、更新時は既存値を維持する。管理者は自分の`userId`で作成したrecordの`type`だけをDBで`sample`へ変更できる。
- R2 object keyは`{userId}/{id}.json`とし、character snapshotとBase64エンコード済み画像を保存する。character IDはserverがopaqueなglobal unique IDとして発行する。
- D1とR2の分散transaction、rollback、compensating transaction、孤児R2 objectの自動cleanupは実装しない。部分失敗は通常のAPI errorとして返す。
- APIは一覧取得、個別取得、個別upsert、個別deleteに限定する。GETは`isPublic === true`、または認証済みactorがownerの場合だけ返す。非ownerのprivate recordは一覧に含めず、個別GETも存在しないrecordと同じ`404`を返す。`user`は`updatedAt DESC`、`sample`は`createdAt ASC`とする。write/deleteは公開設定に関係なく`userId`が一致するowner本人だけを許可する。
- 一覧は`id`、表示用metadata、`isPublic`、timestamps、`isOwner`を返せるが、内部`userId`は返さない。認証なしでは`isOwner`をfalseとし、不正なAuthorization headerの扱いはshared API contractで統一する。
- backendはAPI envelopeとmetadataをvalidationするが、character JSON本体のゲームschemaをvalidationしない。取得時のschema検証、現在のマスタID照合、warning/error表示は既存frontend restore処理を再利用する。
- frontendとbackendが別originになるため、productionでは公式frontend origin、developmentでは必要なlocalhost originだけを許可するCORS contractを定義する。
- application固有のrequest body上限は、画像上限、変換後画像サイズ、正常fixtureを根拠にbackend API Gateで決定し、testへ固定する。

### キャラクターシートのクラウド操作

- 見出し行にGoogle login/logoutと`キャラクター一覧`を追加する。Google sessionが利用可能なときは、公式のOne Tap、Automatic Sign-in、FedCM等で不要な再ログインを避ける。logout時はapplication認証状態を破棄し、公式APIで直後の意図しない再ログインを抑止する。
- 現在のcharacterを「新規/ローカル」「自分のremote」「他人または未認証のremote」として区別し、認証変更時に所有状態を再評価する。永続化済みのclient側`isOwner`だけをauthorization判断に使わない。
- `キャラクター一覧` dialogはPC名、PL名、プライマリ流儀、生き様、格、最終更新日を表示する。取得済み一覧をclient-sideで10件ずつページ分割し、ログイン時だけ`自分のキャラクターのみ` filterを使えるようにする。未設定値は`-`、長いPC名・PL名はellipsisで扱う。
- 一覧から取得したcharacterは既存restore処理を通して同じ`/character-sheet/`へ反映する。個別閲覧pageは追加しない。
- 他人または未認証のremote characterはread-onlyとする。input、picker、画像操作、行操作、DB保存、DB削除は無効化するが、初期化、JSONインポート、CCFOLIAコピー、Help、login/logout、キャラクター一覧は利用可能にする。server側のwrite authorizationはUI disabledと独立して必須とする。
- JSONエクスポートのユーザー向けUIをAction Pane / control paneから除き、JSONインポートは9/1の削除予告を表示して移行期間中維持する。同じ操作領域へ`DB保存`、`コピー保存`、`DB削除`を置く。既存serialize/restore内部logicはクラウド保存で再利用できる場合に利用する。
- `DB保存`はPC名とログインを必須とし、初回はserver発行IDへ紐付け、ownerのremote characterは上書きする。新規保存の`全員に公開する`は既定ON、既存remoteの上書きでは現在の`isPublic`を既定にする。保存前にデータと画像がserverへ保存されることを説明する確認dialogを表示する。
- `コピー保存`はログイン済みならowner以外のpublic remote characterにも許可する。新しいIDへ保存し、`全員に公開する`の既定はOFF、コピー元画像は保存しない。
- `DB削除`はownerだけに許可し、確認dialogを表示する。成功後はフォームを消去せずremote IDの紐付けだけを解除する。resetはremote characterを暗黙に削除または空データで上書きしない。
- Helpは認証、DB保存/削除、一覧、権限、ローカル保存とDB保存の違いを説明する。本文はユーザーが編集する`.raw/character-sheet-help.md`を正としてcomponent markupへ反映する。

### Design、test、review

- 既存の`docs/design/character-sheet/notes.md`を既存画面のdesign正本として扱う。
- G5のUI design intentは`docs/issue/ex-16-5-cloud-persistence-ui.md`のユーザー確定仕様を最優先とする。G5の実装時に`docs/design/character-sheet/notes.md`へ同じ意図と対象stateを記録する。canonical VRT baselineはユーザー承認なしに更新しない。
- shared/backendはmetadata validation、DTO、token rejection、owner authorization、ID発行、一覧順、`userId`非公開、optional auth、R2 key、adapter、payload上限、error contractをunit/contract testする。
- frontendは認証状態、remote state、所有状態再評価、dialog、pagination/filter、fallback/ellipsis、restore failure、read-only、保存/削除確認、remote ID、PC名必須、HelpをComponent/hook/logic testする。
- E2Eは選択、自分の編集、他人のread-only、保存確認、削除確認の代表flowに絞り、Google本番認証へ直接依存しない。
- Visual ReviewはすべてのUI Gateを統合した親issueの最終段階で、追加状態を含む対象route・viewportだけを対象に一度実施する。各GateのPR reviewではVisual Reviewを実施しない。canonical VRT baselineはユーザー承認なしに更新しない。

## 初期スコープ外

- 独自ユーザー登録、password認証、Google以外のIdentity Provider
- email、Google profile情報の保存
- server-side pagination、検索、sort、共有URL専用page、共同編集、revision history、管理画面
- character JSONのserver-side game schema validation、JSON schema version migration
- D1/R2の分散transaction、compensation、orphan objectの自動cleanup
- refresh tokenを保存する独自認証基盤、paid infrastructureを前提とする機能
- campaign、session管理、ダイスローラー、戦闘シミュレーション

## 完了条件

- [ ] Gate planに従う全child issueがユーザー承認を受け、完了記録の監査を通過している。
- [ ] frontend、backend、shared packageがworkspaceとして分離され、frontend/backend間の直接内部importがない。
- [ ] frontendとbackendのCI、test、build、deployが独立し、shared変更では双方の検証が動く。
- [ ] WranglerでWorker、D1、R2、binding、remote migration、deployの運用が再現可能である。
- [ ] Google ID Tokenをserver側で検証し、内部`userId`と所有権を安全に扱う。
- [ ] D1 metadataとR2 snapshotが指定のkey・公開範囲・部分失敗方針に従う。
- [ ] 公開GETとowner限定write/delete、CORS、error contract、payload上限がtestで確認されている。
- [ ] login/logout、キャラクター一覧、read-only、DB保存/コピー保存/削除、Helpが指定どおり動作する。
- [ ] ローカル保存が維持され、remote IDと所有状態を安全に再評価できる。
- [ ] 関連するrequirements、out-of-scope、構造、testing、deployment文書が実装と整合する。
- [ ] 関連TODOの扱いを明示し、判断なしに完了または削除していない。
- [ ] 必要なcheck、build、test、UI GateのVisual Reviewが現在のローカル根拠で完了している。

## チェックポイント

- [ ] frontend移動Gateに不要なfrontend挙動変更を混在させない。
- [ ] package managerの変更や新規dependencyは必要性・代替案・初期スコープ上の理由をchild issueへ記録する。
- [ ] client secret、Cloudflare credential、Wrangler local stateをGit管理しない。
- [ ] `userId`をclient入力または公開responseで扱わない。
- [ ] UI disabledをserver authorizationの代替にしない。
- [ ] local保存とクラウド保存の責務を混同しない。
- [ ] 現在のrestore failure UIと画像decode処理を可能な範囲で再利用する。
- [ ] UI Gateではdesktop、tablet、mobileのoverflow、focus trap、Escape、close、return focusを確認する。
- [ ] Gate branchを`main`へ直接mergeせず、全Gate完了前に親branchを`main`へmergeしない。
- [ ] ユーザーの未コミット変更を破壊しない。

## 想定変更領域

- workspace rootのpackage/workflow/configuration
- `frontend/`へ移動する既存Astro、React、public、data、scripts、tests、設定
- `backend/`のWorker、auth、D1/R2 adapter、API、tests、Wrangler設定
- `packages/shared/`のAPI DTO、metadata、schema、error contract
- `.github/workflows/`、`docs/requirements/`、`docs/out-of-scope.md`、`docs/development-structure.md`、`docs/testing.md`、`docs/deployment.md`
- `docs/design/character-sheet/notes.md`（design-image-generationとユーザー承認後のみ）

## レビュー観点

- Astro frontendをbackend都合でSSR化していないか。
- workspaceのdependency方向とdeploy ownershipが明確か。
- Google認証、token検証、Cloudflare resource管理を不必要に自前実装していないか。
- public APIからGoogle account identifierや他人の更新権限が漏れないか。
- D1をmetadata index、R2をsnapshot storeとして分離し、非transaction方針を一貫させているか。
- local-firstの編集継続性、既存restore failure処理、画像変換処理を失っていないか。
- 追加UIがdesign intent、accessibility、responsive表示、Visual Reviewの契約を満たすか。

## 備考

- mainへmergeする直前に、対象差分に対してroot check、frontend/shared/backendの各test、およびdeploy前提jobの起動条件を再確認する。

### Local validation summary

- branch: `ex-16-character-sheet-cloud-persistence`
- local issue: `docs/issue/ex-16-character-sheet-cloud-persistence.md`
- parent Gate plan: `docs/issue/ex-16-character-sheet-cloud-persistence/plan.md`
- local SSoT、既存character-sheetのlocalStorage/IndexedDB persistence、Action Pane、JSON restore/import境界、character-sheet design notesを確認した。
- `docs/issue/milestone-02/plan.md`にはex-16が未登録だったため、このissueをPhase 5の計画項目として追加する。
- `docs/TODO.md`のJSON schema version互換性と永続スキルID変更検出は、今回の保存導入に関連するが、仕様決定なしに回収しない。各child issueのスコープ判断で継続または扱うことを明記する。

### Historical remote snapshot

このissueの初稿はremote `main` snapshotから作成された。上記のlocal validation summaryが、そのremote draftの未検証項目に優先する。Google CloudのOAuth Client/authorized origin、Cloudflare resource、Wrangler automatic provisioning、実装時点のlibrary最新性は、対応Gateの着手時に別途確認が必要である。
