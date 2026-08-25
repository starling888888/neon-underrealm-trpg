# ex-16-6-firebase-authentication

## 最優先のユーザー確定仕様

このGateでは、G3で導入したGoogle Identity Services（GIS）によるbrowser-only認証をFirebase Authenticationへ置き換える。

目的は、Googleログイン自体は維持したまま、

- page reload後もログイン状態を維持する
- browser側の認証状態永続化をFirebase Authentication SDKへ委譲する
- Firebase SDKのtoken refreshを利用する
- backendへFirebase ID Tokenを送信する
- Cloudflare WorkerでFirebase ID Tokenを検証する

ことである。

以下を明示的に置き換える。

```txt
旧:
Google Identity Services
→ Google ID Token
→ React memory-only
→ reload時はOne Tap / auto_select等でcredential再取得
→ WorkerがGoogle ID Tokenを検証

新:
Firebase Authentication
→ Google provider
→ Firebase SDK-managed browser persistence
→ reload時はFirebase Auth stateを復元
→ Firebase ID Tokenを必要時にSDKから取得
→ WorkerがFirebase ID Tokenを検証
```

Google ID Tokenをapplication sessionとして扱うG3/G4の旧認証境界はG6完了後に廃止する。

以下は導入しない。

- 独自OAuth callback
- authorization code exchange
- Google refresh tokenの保存
- 独自refresh token処理
- application独自session cookie
- cross-site session cookie
- password認証
- Google以外のIdentity Provider

Firebase AuthenticationがSDK内部で行うauth state / refresh credentialのbrowser persistenceは許可する。

application code自身がID Tokenやrefresh tokenをlocalStorage / sessionStorage / IndexedDBへ保存する処理は追加しない。

---

# 目的

Webキャラクターシートの認証境界をFirebase Authenticationへ移行し、以下を成立させる。

- Google Accountでログインできる
- login済み状態がpage reload後も復元される
- Firebase SDKが認証状態とtoken refreshを管理する
- API requestごとに取得時点で有効なFirebase ID Tokenを利用する
- Firebase ID TokenをCloudflare Workerで検証する
- 検証済みFirebase `uid`を内部`userId`として利用する
- G5までに完成したownership / private visibility / DB保存UIを変更せず利用できる
- logout後はremote characterがread-onlyになる
- reload後にowner remote characterのownershipを再取得できる

G6は認証基盤の置換Gateであり、character API、D1/R2 data model、G5 UIそのものを再設計しない。

---

# 背景

G3では`@react-oauth/google`を使い、Google Identity ServicesからGoogle ID Tokenを取得してReact memoryだけに保持する構成を導入した。

現行frontendは概ね以下である。

```txt
GoogleOAuthProvider
→ GoogleLogin
→ CredentialResponse
→ useGoogleAuthentication
→ React stateへGoogle ID Token保存
```

Google ID Tokenはbrowser persistenceへ保存されないため、page reload時にはmemory stateが消滅する。

G3ではOne Tap / `auto_select`等によるcredential再取得を前提としたが、この方式はbrowser / FedCM / Google側状態に依存し、application sessionの永続化手段にはしない。

G6ではFirebase Authentication SDKに認証state persistenceを委譲する。

Firebase Authentication Web SDKはbrowser persistenceを提供し、Firebase ID Tokenはcustom backendへ送信して検証できる。

backendは現在`jose`を使ってGoogle ID Tokenのsignature、issuer、audience、expirationを検証しているため、G6でも`jose`を維持し、Firebase ID Token verifierへ置き換える。

Firebase Admin SDKはこのGateでは追加しない。

Cloudflare Worker上ですでに利用中の`jose`でFirebase ID Tokenを検証する。

---

# Gate関係

- 親issue: `docs/issue/ex-16-character-sheet-cloud-persistence.md`
- Gate plan: `docs/issue/ex-16-character-sheet-cloud-persistence/plan.md`
- Gate: `G6: Firebase Authentication`
- 依存Gate: G5

G6ではG5で完成したremote persistence UI / lifecycleを前提とする。

G5 reviewでユーザーが許容した既知事項はG6へ持ち込まない。

クラウド保存用snapshotのBase64エンコード済み画像、フォーム値のlocalStorage自動保存・復元、画像recordのIndexedDB保存はG5までの実装を維持する。これらを変更する旧`ex-02`のGate番号だけを参照する記述は、`ex-16`のG6へ持ち込まない。

---

# dependency方針

## frontend

Firebase公式Web SDKを利用する。

```txt
firebase
```

をfrontend dependencyへ追加する。

以下を削除する。

```txt
@react-oauth/google
```

Firebase AuthenticationのGoogle provider、auth state persistence、sign-in / sign-out、ID Token取得をFirebase公式SDKへ委譲する。

Google OAuth / OIDC protocolをapplication codeで自前実装しない。

## backend

既存dependency:

```txt
jose
```

を維持する。

Firebase ID Token検証のためにFirebase Admin SDKや新しいJWT libraryを追加しない。

Firebase公式仕様がthird-party JWT libraryによるID Token検証を許可しており、現在のCloudflare Workerと`jose`の構成をそのまま利用できるためである。

---

# Firebase project / user configuration

## 1. Firebase project

ユーザーがFirebase Console上でFirebase projectを準備する。

可能であれば現在Google認証に利用しているGoogle Cloud projectと対応するprojectを使用し、認証基盤のprojectを不要に分散させない。

agentはユーザーの明示許可なしにFirebase / Google Cloud Consoleを変更しない。

## 2. Web App

Firebase projectへWeb Appを登録する。

frontendが必要とするFirebase public configurationを取得する。

少なくとも以下を扱う。

```txt
apiKey
authDomain
projectId
appId
```

これらはFirebase Web Appへ埋め込むpublic configurationであり、service account credentialやapplication secretとして扱わない。

ただし既存project運用に合わせ、GitHub Repository Variablesとlocal `.env`からfrontend buildへ渡す。

## 3. Google provider

Firebase AuthenticationでGoogle providerを有効化する。

初期scopeではGoogle providerだけを使用する。

以下は有効化しない。

- Email / Password
- Anonymous Auth
- GitHub
- Apple
- Microsoft
- Phone
- その他provider

## 4. Authorized domains

少なくとも利用する環境をFirebase AuthenticationのAuthorized domainsへ登録する。

production:

```txt
starling888888.github.io
```

local development:

```txt
localhost
```

実際のrepository subpathはdomain登録値へ含めない。

---

# frontend environment contract

## 5. environment variables

旧:

```txt
PUBLIC_GOOGLE_OAUTH_CLIENT_ID
```

を削除する。

frontendではFirebase public configurationを以下のようなpublic environment variablesとして扱う。

```txt
PUBLIC_FIREBASE_API_KEY
PUBLIC_FIREBASE_AUTH_DOMAIN
PUBLIC_FIREBASE_PROJECT_ID
PUBLIC_FIREBASE_APP_ID
```

実際の値はGit管理しない。

`frontend/.env.example`へkeyだけを記載する。

GitHub ActionsではRepository Variablesをfrontend buildへ渡す。

例えばRepository Variablesは以下を使用する。

```txt
FIREBASE_API_KEY
FIREBASE_AUTH_DOMAIN
FIREBASE_PROJECT_ID
FIREBASE_APP_ID
```

CIでは必要値が未設定ならbuild開始前に明示的に失敗する。

---

# Firebase frontend初期化

## 6. Firebase App

Firebase initializationをcharacter sheet固有の認証moduleへ閉じ込める。

component renderごとにFirebase App / Auth instanceを再初期化しない。

概念上、

```txt
firebase app initialization
        ↓
Firebase Auth singleton
        ↓
authentication hook
        ↓
CharacterSheetContainer
```

とする。

Firebase initializationをform stateやremote persistence hookへ直接混在させない。

---

# auth persistence

## 7. persistence mode

Firebase Authenticationのbrowser local persistenceを明示的に利用する。

概念上:

```ts
setPersistence(auth, browserLocalPersistence)
```

相当とする。

これにより、

```txt
Google login成功
↓
Firebase Authentication session確立
↓
page reload
↓
Firebase SDKがauth stateを復元
↓
signed-in
```

を成立させる。

application code自身でFirebase ID TokenをlocalStorage等へコピーしてはならない。

Firebase SDKが内部的に利用するbrowser persistenceはこの制約の対象外とする。

---

# auth state

## 8. authentication state

現行の単純な、

```txt
signed-out
signing-in
signed-in
error
```

に加えて、Firebase persistenceの初期復元中であることを区別する。

概念上:

```txt
initializing
signed-out
signing-in
signed-in
error
```

とする。

page mount直後にFirebase Auth stateが判明する前から`logged-out`と確定してはならない。

これによりreload時に、

```txt
signed-out button表示
↓
数百ms後にsigned-inへ変更
```

のような不要なログアウト状態のflashを避ける。

`initializing`中もlocal-first character sheet自体の読み込み・表示を妨げない。

認証必須操作だけはauth state確定まで利用不可としてよい。

---

# auth state observer

## 9. persisted authentication restore

Firebase SDKのauth state observerを認証状態の正本とする。

概念上:

```ts
onAuthStateChanged(...)
```

等のFirebase公式APIを利用する。

page mount時:

```txt
Firebase Auth initialization
↓
persisted auth state確認
↓
userあり
  → signed-in
userなし
  → signed-out
```

とする。

page reload時にGoogle popup、One Tap、FedCMを再実行して認証stateを復元する実装にはしない。

---

# login

## 10. Google login

Firebase Authenticationの`GoogleAuthProvider`を利用する。

初期実装では、

```txt
signInWithPopup
```

によるGoogle loginを使用する。

`signInWithRedirect`、One Tap、FedCM、GIS `auto_select`はこのGateでは利用しない。

理由:

- GitHub PagesとFirebase auth domain間のredirect helper追加を避ける
- G6の目的をsession persistenceへの移行に限定する
- 現在問題となっているGIS / FedCMへのreload依存を除去する

login成功後のauth stateはFirebase observerから反映する。

sign-in resultからGoogle Access Tokenを取り出して保存・利用しない。

email、displayName、photoURL等をD1 / local application stateへ保存しない。

---

# login UI

## 11. UI placement

G5までの認証UI配置を維持する。

desktop:

```txt
Googleログイン / ログアウト
キャラクター一覧
セクションにジャンプ
```

tablet / mobile:

```txt
Googleログイン / ログアウト
キャラクター一覧
セクションにジャンプ
```

位置、余白、responsive behaviorをG6で変更しない。

GIS iframeによる`GoogleLogin` componentは削除し、Firebase login actionを呼ぶbuttonへ置き換える。

表示labelはGoogle Accountでログインすることが分かるものとする。

既存Action Paneのdesign systemを利用する。

新しいdesign draftを作成しない。

---

# logout

## 12. logout

logoutはFirebase Authenticationの公式`signOut()`へ委譲する。

logout成功後:

- Firebase auth stateをsigned-outへする
- character一覧cacheを破棄する
- current local characterは通常編集可能なまま維持する
- current remote characterは内容を維持したままread-onlyにする
- remote ID bindingを削除しない
- DB recordを変更しない

G5のlogout lifecycleを維持する。

Google Accountそのものからbrowser全体をlogoutさせる処理は行わない。

---

# Firebase ID Token

## 13. token ownership

Firebase ID TokenをReact stateへ長期cacheすることをauthentication contractにしない。

API request時に、Firebase Authentication SDKのcurrent userから有効なFirebase ID Tokenを取得する。

概念上:

```txt
API request開始
↓
Firebase current user
↓
getIdToken()
↓
Authorization: Bearer <Firebase ID Token>
```

とする。

Firebase SDKがtoken expiration / refreshを管理する。

applicationはrefresh tokenを直接取得、保存、更新しない。

---

# frontend authentication interface

## 14. raw token依存の除去

現行`GoogleAuthentication`は、

```ts
idToken: string | null
```

をapplication stateとして公開している。

G6では、remote persistence layerが固定token文字列へ依存しないinterfaceへ変更する。

概念上は以下の責務を持つ。

```ts
type Authentication = {
  status: AuthenticationStatus;
  sessionKey: string | null;
  getIdToken(forceRefresh?: boolean): Promise<string | null>;
  onLogin(): Promise<void>;
  onLogout(): Promise<void>;
};
```

具体的な型名は既存architectureに合わせてよい。

重要なのは、

- API実行時にtokenを取得する
- token文字列そのものをauthentication identityとして使わない
- token refreshだけでlogin/logout lifecycleを発火しない

ことである。

---

# session identityとcache

## 15. token refreshとauthentication changeを分離する

G5ではcharacter一覧cache lifecycleがGoogle ID Token値に依存している。

Firebase ID TokenはSDKによってrefreshされるため、

```txt
token文字列変更
=
ユーザー変更
```

としてはならない。

Firebase ID Token refreshだけでは、

- character一覧cacheを破棄しない
- remote characterを再取得しない
- ownership stateを初期化しない

こと。

cache invalidationは、

```txt
signed-out → signed-in
signed-in → signed-out
signed-in user A → signed-in user B
```

など、実際のauthentication identity変更時だけ行う。

frontend内部ではFirebase user `uid`そのものをAPI authorizationへ使わず、必要ならsession change検出用の内部keyとして扱ってよい。

server authorizationはFirebase ID Tokenだけを正本とする。

---

# reload後のremote ownership restore

## 16. persisted login + remote ID

page reload時、

- localStorageにremote IDあり
- Firebase Authenticationにpersisted userあり

の場合、

```txt
local character restore
↓
remote ID restore
↓
Firebase auth state restore
↓
authenticated GET /character-sheets/:id
↓
snapshot + isOwner取得
↓
current remote state更新
```

とする。

これによりowner remote characterはreload後にも編集可能状態へ戻る。

Firebase auth initialization前のtemporary stateを最終ownershipとして扱わない。

---

# API client

## 17. Authorization header

G5の4 endpoint contractは変更しない。

```txt
GET    /character-sheets
POST   /character-sheets
GET    /character-sheets/:id
DELETE /character-sheets/:id
```

authenticated requestではFirebase ID Tokenを、

```txt
Authorization: Bearer <Firebase ID Token>
```

として送る。

anonymous GETはtokenなしで従来どおり利用可能とする。

---

# expired token

## 18. 419 handling

backendの既存contract:

```txt
expired token → 419
```

は維持する。

通常requestではFirebase SDKの`getIdToken()`を利用するため、期限切れtokenを意図的に送信しない。

それでもbackendから419を受け取った場合は、

```txt
Firebase SDKでforce refresh
→ requestを1回だけretry
```

してよい。

force refreshもFirebase SDKへ委譲する。

独自refresh token処理は実装しない。

retry後も419の場合:

- signed-outまたは再認証が必要なstateへ遷移
- session expiredのToast / auth errorを表示
- requestを無限retryしない

network errorや通常の5xxを理由にFirebase sessionを自動logoutしない。

---

# backend token verifier

## 19. verifier置換

現行:

```txt
GoogleIdTokenVerifier
```

をFirebase ID Token verifierへ置き換える。

概念上:

```txt
FirebaseIdTokenVerifier
```

とする。

既存`TokenVerifier` interfaceとauthentication middlewareの責務分離を維持する。

service layerへFirebase固有型を流入させない。

---

# Firebase ID Token verification

## 20. verification contract

production verifierはFirebase公式のthird-party JWT verification contractに従う。

少なくとも以下を検証する。

### header

```txt
alg === RS256
kid がFirebase Secure Tokenの公開keyに対応する
```

### signature

Googleが公開するFirebase Secure Token用public keyでsignatureを検証する。

既存`jose`のremote JWK supportを利用してよい。

### payload

```txt
exp       future
iat       past
aud       Firebase project ID
iss       https://securetoken.google.com/<projectId>
sub       non-empty string
auth_time past
```

を確認する。

検証済み`sub`をFirebase `uid`として扱う。

backend内部では、

```txt
Firebase uid
=
actorUserId
=
D1 owner_user_id
```

とする。

email、name、picture、provider dataはauthorizationに利用しない。

---

# backend binding

## 21. runtime configuration

旧:

```txt
GOOGLE_OAUTH_CLIENT_ID
```

をbackend runtime contractから削除する。

代わりに、

```txt
FIREBASE_PROJECT_ID
```

を利用する。

Firebase project IDはsecretとして扱わない。

production CIではGitHub Repository VariableからWorker `var`へ渡す。

development Workerも同じproject ID contractを使う。

---

# verifier composition

## 22. production / local / integration

G5完了時点のcomposition boundaryを維持する。

```txt
production
→ FirebaseIdTokenVerifier

dev:local
→ FirebaseIdTokenVerifier

dev:integration
→ TestTokenVerifier
```

とする。

integration test用の`TestTokenVerifier`は維持する。

production / normal local runtimeでtest verifierへ切り替える環境変数や条件分岐を追加しない。

---

# userId移行

## 23. Google `sub` → Firebase `uid`

G4/G5ではGoogle ID Tokenの`sub`を`owner_user_id`として使用している。

G6以降はFirebase `uid`を使用する。

D1 column自体は`TEXT`のままなのでschema変更は不要。

ただしGoogle `sub`とFirebase `uid`が同一であることを前提としてはならない。

### parent issue未公開の場合

G6開始時点でこのcloud persistence機能がproduction公開前であることを確認する。

production user recordが存在しない場合、Google `sub` → Firebase `uid`のmigrationは実装しない。

development D1に旧Google `sub`所有recordが残っている場合、必要に応じてユーザー承認後にdevelopment dataをresetしてFirebase認証で再作成する。

remote development dataを自動削除してはならない。

### production dataが存在する場合

G6着手時点でGoogle `sub`所有のproduction user dataがすでに存在することが判明した場合、本Gate内で推測によるownership migrationを行わない。

migration方式をユーザーへ提示し、別途明示的に決定してから実装する。

既存characterをsilent orphan化してはならない。

---

# Firebase configとCI

## 24. frontend deploy

`.github/workflows/frontend-deploy.yml`から、

```txt
GOOGLE_OAUTH_CLIENT_ID
PUBLIC_GOOGLE_OAUTH_CLIENT_ID
```

依存を削除する。

代わりにFirebase public configを必須Repository Variablesとしてvalidationする。

例:

```txt
FIREBASE_API_KEY
FIREBASE_AUTH_DOMAIN
FIREBASE_PROJECT_ID
FIREBASE_APP_ID
```

build時には対応する`PUBLIC_FIREBASE_*`へ渡す。

`PUBLIC_API_BASE_PATH`は変更しない。

---

## 25. backend deploy

`.github/workflows/backend-deploy.yml`から、

```txt
GOOGLE_OAUTH_CLIENT_ID
```

を削除する。

代わりに、

```txt
FIREBASE_PROJECT_ID
```

をWorker runtime variableとして渡す。

CORS configuration、D1 migration、R2、deploy orderは変更しない。

---

# local environment

## 26. `.env.example`

frontend:

```txt
PUBLIC_FIREBASE_API_KEY=
PUBLIC_FIREBASE_AUTH_DOMAIN=
PUBLIC_FIREBASE_PROJECT_ID=
PUBLIC_FIREBASE_APP_ID=
PUBLIC_API_BASE_PATH=
```

相当へ更新する。

backend:

```txt
FIREBASE_PROJECT_ID=
CORS_ALLOW_ORIGIN=
```

等、現在必要なdevelopment keyと整合させる。

実値をcommitしない。

Firebase service account JSONを追加しない。

---

# 既存GIS実装の削除

## 27. 削除対象

不要になった以下を削除する。

- `@react-oauth/google`
- `GoogleOAuthProvider`
- `GoogleLogin`
- GIS One Tap
- GIS `auto_select`
- `googleLogout`
- `CredentialResponse`
- `PUBLIC_GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_ID`
- `GoogleIdTokenVerifier`
- GIS固有のtest / mock
- GIS client ID必須check

Firebase移行後にdead compatibility layerとして残さない。

Google Cloud側の既存OAuth client自体を自動削除することは本Gateの対象外。

---

# G5 remote persistence維持

## 28. G5 behavior

認証実装を変えても以下のG5 contractを変更しない。

- public characterは未ログインでも一覧 / 個別GET可能
- private characterはownerだけ取得可能
- non-owner privateは404
- owner remoteだけ編集可能
- public non-ownerはread-only
- DB保存
- コピー保存
- DB削除
- 初期化
- character一覧cache
- Toast
- Help
- JSON import移行導線
- CCFOLIAコピー

Firebase migrationを理由にAPI DTOやD1/R2 snapshot schemaを変更しない。

---

# UI behavior

## 29. reload

ログイン済みでreload:

```txt
Firebase auth initializing
↓
persisted user復元
↓
signed-in
↓
remote IDありならownership再取得
↓
通常利用
```

ユーザーに毎reloadでGoogle login操作を要求しない。

## 30. logout

```txt
signOut
↓
signed-out
↓
list cache clear
↓
remote current characterはread-only
↓
local data維持
```

## 31. login

```txt
Google login button
↓
Firebase signInWithPopup
↓
Firebase user確立
↓
auth observer
↓
signed-in
↓
remote IDありならownership再取得
```

---

# error handling

## 32. Firebase initialization error

Firebase config不足やinitialization failureはsilent failureにしない。

local developmentでは原因を判別できるerrorを出す。

production UIでは既存auth error contractへまとめてよい。

character sheetのlocal-first編集自体は継続可能とする。

## 33. login popup failure

popup cancel / blocked / authentication failureでは、

- current formを変更しない
- remote bindingを変更しない
- DB requestを行わない
- auth errorを表示する
- local-first editingを継続可能にする

こと。

## 34. token取得失敗

Firebase userがsigned-inでもID Token取得に失敗した場合、対象API requestを送らない。

通常のDB操作errorとして通知し、network errorだけを理由にlocal dataを破壊しない。

---

# Documentation

## 35. active SSoT

以下をFirebase Authenticationへ整合させる。

- `docs/issue/ex-16-character-sheet-cloud-persistence.md`
- `docs/issue/ex-16-character-sheet-cloud-persistence/plan.md`
- `docs/requirements/character-sheet.md`
- `docs/requirements/architecture.md`
- `docs/testing.md`
- `docs/out-of-scope.md`
- `docs/deployment.md` または現在のdeployment正本
- `README.md`
- frontend / backend `.env.example`

特に以下の旧記述をactive SSoTとして残さない。

- Google ID TokenをReact memory-onlyでsessionとして扱う
- reloadごとにGIS credentialを再取得する
- One Tap / Automatic Sign-in / FedCMへsession restoreを依存する
- `PUBLIC_GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_ID`
- backendがGoogle ID Tokenを検証する
- Google `sub`を新規recordの`userId`にする

historical G3/G4 issueの完了記録は履歴として書き換えなくてよい。

---

# Tests

## 36. frontend auth unit tests

Firebase SDK自体の内部実装をtestしない。

application integrationとして少なくとも以下を確認する。

### initialization

- initial stateは`initializing`
- persisted Firebase userあり → `signed-in`
- persisted userなし → `signed-out`
- initialization error → `error`

### login

- login actionがFirebase Google providerへ委譲される
- login成功後のsigned-in stateはauth observer経由で反映される
- popup cancel / error時にlocal dataを変更しない
- Google Access Tokenをapplication stateへ保存しない

### logout

- Firebase `signOut`へ委譲する
- signed-out stateへ移行する
- local formを維持する

### token

- API実行時にFirebase userからID Tokenを取得する
- fixed token文字列をlong-lived React stateへ保持しない
- token refreshだけではauthentication identity changeとして扱わない
- force refreshが必要な場合もFirebase SDKへ委譲する

---

# remote persistence tests

## 37. G5とのintegration

少なくとも以下を確認する。

- Firebase signed-out → public list取得
- Firebase signed-in → authenticated list取得
- auth restore後にcurrent remote IDをindividual GET
- owner remoteがreload後にeditableへ戻る
- logoutでcurrent remoteがread-onlyになる
- login/logoutでlist cacheをinvalidate
- Firebase ID Token refreshだけではlist cacheをinvalidateしない
- Firebase ID Token refreshだけではcurrent remoteを再restoreしない
- API 419 → force refresh → 1回retry
- retry 419 → session expired処理
- normal network failureでautomatic logoutしない

---

# backend verifier tests

## 38. Firebase verifier

networkへ依存しないfixture / injected key setで少なくとも以下をtestする。

```txt
valid token                 → valid + Firebase uid
expired token               → expired
invalid signature           → invalid
wrong algorithm             → invalid
wrong audience              → invalid
wrong issuer                → invalid
empty / missing sub         → invalid
future iat                  → invalid
future auth_time            → invalid
```

公開key rotationをapplication独自cacheとして過剰実装せず、`jose`のremote JWK handlingを利用する。

---

# backend middleware / API tests

## 39. existing status contract

Firebase verifierへ交換しても以下を維持する。

- valid token → authenticated actor
- expired token → `419`
- invalid token → existing unauthorized contract
- anonymous optional GET → anonymous read
- owner write/delete → allow
- non-owner write/delete → reject
- private non-owner GET → 404

service testでFirebase SDK / JWT implementationをmockしない。

serviceは引き続き`actorUserId`だけを扱う。

---

# integration tests

## 40. local integration

既存`dev:integration`では`TestTokenVerifier`を維持する。

CIでFirebase本番projectやGoogle login popupを要求しない。

既存integration token:

```txt
test-token-owner
test-token-other
test-token-expired
```

等を利用する現在の方式を維持してよい。

Firebase production verifierそのものはunit testで検証する。

---

# browser / E2E

## 41. automated browser tests

CI browser E2EではGoogle本番loginを要求しない。

認証adapter / Firebase moduleをtest boundaryで差し替え、

- initializing
- signed-out
- signed-in
- reload restoration相当
- logout
- remote ownership lifecycle

を確認できる構成にする。

本番Firebase account credentialをGitHub Actionsへ保存しない。

---

# manual real-environment validation

## 42. user-controlled validation

Firebase Console設定後、ユーザーの明示許可を得た場合のみdevelopment environmentへ実リクエストして確認する。

最低限以下を確認する。

1. Google login成功
2. DB保存成功
3. owner character一覧取得
4. page reload
5. login操作なしでsigned-inへ復元
6. remote characterがownerとして再評価される
7. DB上書き成功
8. logout
9. current remote characterがread-onlyになる
10. 再login
11. ownershipが復元される
12. private characterをanonymous / non-ownerから取得できない

remote Worker / D1 / R2操作は既存のユーザー許可制を維持する。

このvalidationのためにproduction environmentを使用しない。

---

# userId migration validation

## 43. production release確認

G6 implementation開始時に、

```txt
Google subをowner_user_idとして保存したproduction recordが存在するか
```

を確認する。

存在しない場合:

- schema migrationなし
- Firebase uid contractへ直接切替

存在する場合:

- 自動migrationしない
- Gateを完了扱いにしない
- ownership migration方針をユーザー判断へ戻す

こと。

---

# 初期スコープ外

- Firebase AuthenticationのGoogle以外のprovider
- Firebase Realtime Database
- Firestore
- Firebase Storage
- Firebase Hosting
- Firebase Cloud Functions
- Firebase App Check
- Firebase Security Rulesを使ったcharacter DB authorization
- Firebase Admin SDK
- service account JSON
- custom token
- session cookie
- refresh tokenのapplication管理
- Google Access Tokenの保存
- user email / display name / profile image保存
- account linking UI
- account deletion UI
- revoke token UI
- MFA
- anonymous account
- redirect login
- One Tap
- FedCM
- GIS fallback
- Google ID TokenとFirebase ID Tokenのdual acceptance
- old Google verifierとのproduction互換期間
- Google sub → Firebase uidの推測migration
- character API / D1 / R2 schema再設計
- G5 UI redesign
- Visual baseline更新

---

# 完了条件

**TODO:** creditがリセットされたらcodexでチェックし直してarchiveする。

- [ ] Firebase公式Web SDKがfrontend dependencyとして追加されている。
- [ ] `@react-oauth/google`が削除されている。
- [ ] Firebase App / Authが一度だけ初期化される。
- [ ] Google providerによるFirebase Authentication loginが動作する。
- [ ] Firebase browser local persistenceが明示的に設定されている。
- [ ] page reload後にFirebase auth stateが復元される。
- [ ] auth initialization中とsigned-outを区別している。
- [ ] Firebase ID Tokenをapplication独自browser persistenceへ保存していない。
- [ ] API request時にFirebase SDKから有効なID Tokenを取得している。
- [ ] token refreshだけでlist cache / ownership stateをinvalidateしない。
- [ ] 419時のrefresh / retryがFirebase SDKへ委譲され、無限retryしない。
- [ ] logoutがFirebase `signOut`へ委譲される。
- [ ] logout後もlocal-first dataを維持する。
- [ ] logout後のremote characterがread-onlyになる。
- [ ] reload後にremote IDが存在する場合、auth restore後にindividual GETでownershipを再評価する。
- [ ] backend verifierがGoogle ID TokenからFirebase ID Tokenへ置き換わっている。
- [ ] Firebase verifierがsignature、RS256、`aud`、`iss`、`exp`、`iat`、`auth_time`、`sub`を検証する。
- [ ] 検証済みFirebase `uid`だけを内部`userId`として使う。
- [ ] `userId`をrequest / public responseへ追加していない。
- [ ] backendの`GOOGLE_OAUTH_CLIENT_ID`依存を削除している。
- [ ] frontendの`PUBLIC_GOOGLE_OAUTH_CLIENT_ID`依存を削除している。
- [ ] backendは`FIREBASE_PROJECT_ID`をruntime configurationとして利用する。
- [ ] frontend deployがFirebase public configをRepository Variablesから受け取る。
- [ ] backend deployがFirebase project IDをRepository Variableから受け取る。
- [ ] Firebase service account credentialを追加していない。
- [ ] `dev:local`はFirebase verifier、`dev:integration`はTestTokenVerifierを利用する。
- [ ] G5 API / UI / privacy contractを変更していない。
- [ ] Google provider以外の認証方式を追加していない。
- [ ] frontend auth / remote persistence testsが更新されている。
- [ ] backend Firebase verifier testが追加されている。
- [ ] backend integration testがFirebase実環境へ依存していない。
- [ ] active SSoTがFirebase Authenticationへ更新されている。
- [ ] production userId migrationの要否を確認している。
- [ ] `npm run check`が通る。
- [ ] frontend test / buildが通る。
- [ ] backend test / integration / buildが通る。
- [ ] shared変更がある場合はfrontend/backend両consumer変更を伴い、shared guardを満たしている。
- [ ] canonical VRT baselineをユーザー承認なしに更新していない。

---

# チェックポイント

- [ ] Firebase SDKのauth persistenceへ委譲しながら、application code自身でraw tokenを保存していない。
- [ ] Firebase refresh tokenへ直接アクセスしていない。
- [ ] Firebase ID TokenをGoogle ID Token verifierへ渡していない。
- [ ] Google ID TokenとFirebase ID Tokenをproductionで同時acceptするfallbackを追加していない。
- [ ] Firebase userのemail等をowner判定に利用していない。
- [ ] clientが送ったuidをserver authorizationへ利用していない。
- [ ] token refreshとaccount changeを同じeventとして扱っていない。
- [ ] page mount直後にsigned-outを確定してlogin buttonをflashさせていない。
- [ ] reload時にGoogle popup / One Tapを自動起動していない。
- [ ] current remote IDありのreloadでownership再評価が失われていない。
- [ ] logout時にremote IDやlocal formを誤って消していない。
- [ ] public anonymous readをFirebase login必須にしていない。
- [ ] Firebase project ID / Web configとservice account credentialを混同していない。
- [ ] frontend public Firebase configをsecret扱いして不必要なbackend proxyを追加していない。
- [ ] Firebase Admin SDKを不要に追加していない。
- [ ] service layerへFirebase-specific objectを流入させていない。
- [ ] integration testへFirebase real credentialを要求していない。
- [ ] production remote dataをユーザー許可なくmigration / deleteしていない。
- [ ] G5で許容済みのreview事項をG6のscopeとして再度修正していない。
- [ ] unrelated UI / character sheet ruleを変更していない。
- [ ] ユーザーの未コミット変更を破壊していない。

---

# 想定変更ファイル

## frontend

- `frontend/package.json`
- `package-lock.json`
- `frontend/src/pages/character-sheet.astro`
- `frontend/src/env.d.ts`
- `frontend/src/character-sheet/CharacterSheetContainer.tsx`
- `frontend/src/character-sheet/auth/`
- `frontend/src/character-sheet/components/CharacterSheetGoogleAuthentication.tsx`
  - 必要に応じてFirebase前提の名称へrename
- `frontend/src/character-sheet/hooks/useRemoteCharacterPersistence.ts`
- `frontend/src/character-sheet/api/`
- `frontend/src/character-sheet/dictionary.ts`
- `frontend/tests/character-sheet/`
- `frontend/.env.example`

## backend

- `backend/src/auth/token-verifier.ts`
- `backend/src/auth/authentication-middleware.ts`
  - contract変更が不要なら最小差分
- `backend/src/bindings.ts`
- `backend/src/index.ts`
- `backend/src/integration-index.ts`
- `backend/bin/wrangler.sh`
- `backend/tests/`
- `backend/.env.example`
- `backend/package.json`
  - `jose`は維持、Firebase Admin SDKは追加しない

## CI / docs

- `.github/workflows/frontend-deploy.yml`
- `.github/workflows/backend-deploy.yml`
- 必要に応じて`.github/workflows/ci.yml`
- `README.md`
- `docs/issue/ex-16-character-sheet-cloud-persistence.md`
- `docs/issue/ex-16-character-sheet-cloud-persistence/plan.md`
- `docs/requirements/character-sheet.md`
- `docs/requirements/architecture.md`
- `docs/architectures/backend.md`
- `docs/architectures/character-sheet.md`
- `docs/testing.md`
- `docs/out-of-scope.md`
- 必要に応じて`docs/deployment.md`

実際のfile分割はexisting architectureを優先し、この一覧へ合わせるためだけの不要なrename / abstractionを行わない。

---

# レビュー観点

- page reload後にGoogleとの再対話なしでFirebase auth stateが復元されるか。
- Firebase SDK-managed persistenceとapplication独自token storageの境界が守られているか。
- raw ID Tokenの値をReact session identityとして扱っていないか。
- Firebase token refreshだけでcharacter list cacheが破棄されないか。
- login/logout/account changeでG5 ownership lifecycleが正しく動作するか。
- current remote characterがreload後に最新`isOwner`を取得するか。
- backendがFirebase ID TokenをFirebase公式contractどおり検証しているか。
- Firebase `uid`以外のclaimを内部owner IDとして使っていないか。
- invalid / expired tokenのHTTP contractがG4/G5から回帰していないか。
- anonymous public readが維持されているか。
- private non-owner dataの404 contractが維持されているか。
- TestTokenVerifierがproduction/local normal compositionへ混入していないか。
- GIS / Google ID Token implementationがdead codeとして残っていないか。
- Firebase Admin SDKやservice accountを不要に導入していないか。
- CI / local environmentから旧Google OAuth client ID依存が除去されているか。
- G6導入前のproduction owner dataが存在する場合にsilent orphan化しないか。
- G5 UIを不必要に再設計していないか。

---

# 備考

- Firebase Authentication Web SDKのauth state persistenceを利用することがG6の中心目的である。
- Firebase Web App configはpublic client configurationであり、service account secretとは異なる。
- backendはFirebase Admin SDKを使わず、既存`jose`を利用してFirebase ID Tokenを検証する。
- Firebase ID Token verification後の`sub`をFirebase `uid`として内部`userId`に利用する。
- G6ではpopup loginを採用し、redirect / One Tap / FedCMを追加しない。
- Firebase ID TokenのrefreshはSDKへ任せ、application独自refresh機構を実装しない。
- G6実装完了後、親issue最終段階でdesktop / tablet / mobileを含む統合Visual Reviewを実施する。
- canonical VRT baselineはユーザー承認なしに更新しない。

### Local validation summary

- branch: `ex-16-6-firebase-authentication`
- local issue: `docs/issue/ex-16-6-firebase-authentication.md`
- parent Gate plan: `docs/issue/ex-16-character-sheet-cloud-persistence/plan.md`（G5 `done`、G6 `planned`）
- `frontend/src/character-sheet/api/character-sheet-input.ts`で、クラウド保存用snapshotへ画像のBase64文字列を含める既存実装を確認した。
- `frontend/src/character-sheet/persistence/character-sheet-form.ts`と`frontend/src/character-sheet/persistence/remote-character.ts`で、フォーム値とremote IDをlocalStorageへ保存する既存実装を確認した。画像は独立したIndexedDB recordで扱う。
- `docs/requirements/character-sheet.md`の旧`ex-02` Gate番号による画像・localStorageの制約を、上記の現行実装とparent issueへ整合させた。G6はFirebase Authenticationへの認証境界置換だけを扱う。
- `docs/TODO.md`にG6またはFirebase Authenticationを対象とする未処理項目はない。`docs/design/character-sheet/notes.md`の既存Action Pane配置を維持し、新しいdesign notesまたはVRT baseline更新は前提としない。
- 実装前準備のため、`npm run check`、workspace test、build、remote environment validationは未実行である。
