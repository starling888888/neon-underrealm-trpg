# ex-16-5-cloud-persistence-ui

## 最優先のユーザー確定仕様

このGateでは、以下のユーザー最新指示をG5のUI / UXおよびCloud persistence contractの最優先入力とする。

親issue `docs/issue/ex-16-character-sheet-cloud-persistence.md`、G4完了時点のshared / backend contract、既存design notesに本issueと矛盾する記述がある場合、本issueの最新仕様を優先し、実装と同時にactive SSoTを整合させる。

特に以下の旧方針を置き換える。

- UI上の名称は`キャラクター選択`ではなく`キャラクター一覧`とする。
- character metadataへ公開フラグを追加する。
- 未ログイン時は公開characterだけを閲覧可能とする。
- ログイン済みでも、他人が所有する非公開characterは一覧・個別取得とも閲覧不可とする。
- 自分が所有するcharacterは公開 / 非公開に関係なく閲覧可能とする。
- `DB保存`では新規保存時の公開フラグdefaultをONとする。
- owner remoteの上書き保存時は、現在保存されている公開フラグをdefaultとして表示する。
- `コピー保存`では公開フラグdefaultをOFFとする。
- 公開設定のcheckbox labelは`全員に公開する`とする。
- 旧案の「DB保存したキャラクターは誰でも閲覧可能になります。」という注意文は使用しない。
- `コピー保存`を追加し、sample、他人のcharacter、自分のcharacter、local characterを、自分所有の新規remote characterとして複製できるようにする。
- JSONエクスポートのユーザー向けUIは削除する。
- JSONインポートは移行期間として残し、button内2行目へ`DB保存に移行するため9/1に削除されます。`とdanger色の小さい文字で表示する。
- tablet / mobileではエクスポート削除後の空き領域を残さず、インポートbuttonを横幅いっぱいにする。
- 他人または未認証のremote characterを表示中でも、初期化、インポート、CCFOLIAコピー、Helpは利用可能とする。
- 成功・失敗の結果通知は結果通知専用dialogではなく、新規共通Toastで表示する。
- Helpの文言はエージェントが直接改稿せず、現行文言を`.raw/character-sheet-help.md`へ一度抽出し、ユーザー編集後のMarkdownをcomponent markupへ反映する。

今回のユーザー指示によってG5の主要な配置、色、dialog、公開設定、操作条件は決定済みであるため、別途design draftを生成することを実装前提条件にはしない。

既存の色token、button component、dialog component、focus、responsive breakpoint、余白など、今回明示されていないdesignは既存character sheetのdesign notesと実装へ合わせる。

---

## 目的

G1 / G3 / G4で準備したworkspace、Google認証、Cloud persistence APIを既存Webキャラクターシートへ統合し、以下をユーザー機能として完成させる。

- characterの公開 / 非公開
- 公開範囲を考慮した一覧 / 個別取得
- 公開キャラクター一覧とsample一覧
- remote characterの選択・復元
- owner / read-only状態
- DB保存
- コピー保存
- DB削除
- local-first状態とremote IDの紐付け
- 認証変更時のownership再評価
- 一覧cache
- 共通Toast
- Help更新
- 旧JSONインポートからDB保存への移行導線

既存のlocalStorage / IndexedDBによるlocal-first保存、初期化、JSONインポート、CCFOLIAコピーは維持する。

JSONエクスポートのユーザー向け導線は本Gateで削除する。

---

## 背景

親issue `ex-16-character-sheet-cloud-persistence` のG5として、G4までに以下が実装済みである。

- frontend / backend / shared workspace
- Google Identity Servicesによるfrontend認証
- frontend memory上のGoogle ID Token
- Cloudflare Worker API
- D1 metadata
- R2 snapshot
- 公開read
- optional authによる`isOwner`
- owner限定write/delete
- `GET /character-sheets`
- `POST /character-sheets`
- `GET /character-sheets/:id`
- `DELETE /character-sheets/:id`

G5着手前の最新ユーザー判断により、characterごとの公開 / 非公開を追加する必要が生じた。

このためG5ではfrontend UI統合だけでなく、G4で作成したshared API contract、D1 metadata schema、backend visibility判定を必要最小限修正する。

新しいendpointや別の認証方式は追加しない。

関連する正本は以下とする。

- 親issue: `docs/issue/ex-16-character-sheet-cloud-persistence.md`
- Gate plan: `docs/issue/ex-16-character-sheet-cloud-persistence/plan.md`
- character sheet要件: `docs/requirements/character-sheet.md`
- architecture: `docs/requirements/architecture.md`
- testing: `docs/testing.md`
- out of scope: `docs/out-of-scope.md`
- design: `docs/design/character-sheet/notes.md`
- shared API contract: `packages/shared/`

`docs/TODO.md`のJSON schema version互換性と永続スキルID変更検出は、このGateでも仕様を追加せず保留する。

現在のfrontend restore処理を再利用し、character JSON本体のschema migration機構は追加しない。

---

## Gate関係

- 親issue: `docs/issue/ex-16-character-sheet-cloud-persistence.md`
- Gate plan: `docs/issue/ex-16-character-sheet-cloud-persistence/plan.md`
- Gate: `G5: Cloud persistence UI`
- 依存Gate: G1, G3, G4

このissueはG5の実装契約である。

G5開始前の最新仕様変更に伴い、G4で作成したshared / backendの公開範囲contractだけはこのGateで修正対象に含める。

以下は扱わない。

- endpoint追加
- Cloudflare resource構成の再設計
- Google認証protocol変更
- 独立したcharacter閲覧page
- 管理画面
- server-side pagination

---

# 公開フラグとbackend contract

## 1. `isPublic`

character metadataへ公開フラグを追加する。

概念上の名称は以下とする。

```ts
isPublic: boolean
```

公開フラグはcharacter snapshot内のゲームデータではなく、D1 metadataおよびshared API contractのserver metadataとして扱う。

公開 / 非公開は閲覧権限だけを制御する。

ownershipとは独立させる。

```txt
owner + public      → 閲覧可・編集可
owner + private     → 閲覧可・編集可
non-owner + public  → 閲覧可・編集不可
non-owner + private → 閲覧不可
```

### D1

D1 metadataへboolean相当のcolumnを追加する。

SQLite / D1上ではboolean相当の整数として保持してよい。

migration時点ですでに存在するcharacterは、既存の公開read contractを維持するためpublicとしてmigrationする。

例:

```sql
is_public INTEGER NOT NULL DEFAULT 1
```

必要に応じて`0` / `1`だけを許可するconstraintを持たせる。

---

## 2. shared API contract

request / response metadataへ`isPublic`を追加する。

frontendから保存する際には`isPublic`を明示的なbooleanとして送る。

backendは、

- DB保存経由
- コピー保存経由

というUI上の操作種別を知らない。

新規DB保存時にtrue、コピー保存時にfalseという違いはfrontend defaultであり、API contract自体は単純に`isPublic: boolean`を受け取る。

response metadataにも`isPublic`を含める。

これによりownerが既存remote characterを再保存するとき、現在の公開設定を保存dialogへ復元できる。

内部`userId`は引き続き公開responseへ含めない。

---

## 3. `GET /character-sheets`

一覧APIはauthentication stateとownershipを考慮してvisibilityを制限する。

### 未ログイン

返すcharacterは以下だけ。

```txt
isPublic === true
```

private characterは一覧へ一切含めない。

### ログイン済み

返すcharacterは以下。

```txt
isPublic === true
OR
ownerUserId === actorUserId
```

したがって、

```txt
自分のpublic       → 表示
自分のprivate      → 表示
他人のpublic       → 表示
他人のprivate      → 非表示
```

とする。

その後、既存contractどおり`user`と`sample`へ分割して返す。

sort contractは維持する。

- `user`: `updatedAt DESC`
- `sample`: `createdAt ASC`

server-side pagination、検索、追加sortは実装しない。

---

## 4. `GET /character-sheets/:id`

個別取得も一覧と同じvisibility contractを使う。

取得可能なのは以下。

```txt
isPublic === true
OR
ownerUserId === actorUserId
```

private characterをnon-ownerまたは未認証userが取得しようとした場合は`404`を返す。

```txt
存在しないcharacter              → 404
存在するが閲覧不可のprivate data → 404
```

とし、private characterの存在自体を外部へ明示しない。

`403`でprivate recordの存在を推測可能にしない。

---

## 5. write / delete authorization

公開フラグはwrite authorizationへ影響させない。

`POST`による既存character更新と`DELETE`は従来どおりowner本人だけに許可する。

public characterでもnon-ownerは更新 / 削除できない。

server側authorizationをfrontendのdisabled状態だけに依存させない。

---

## 6. sample

sampleも特別扱いせず同じ`isPublic` contractを持つ。

通常公開するsampleは`isPublic=true`とする。

管理者が準備中のsampleを`isPublic=false`にした場合、

- owner本人には表示される
- 他人 / 未ログインuserには表示されない

とする。

`type=sample`であることを理由にbackendで強制publicにはしない。

---

# frontend API clientと認証token境界

## 7. frontend API client

G4の4 endpointを利用するfrontend API clientを追加する。

- `GET /character-sheets`
- `POST /character-sheets`
- `GET /character-sheets/:id`
- `DELETE /character-sheets/:id`

認証付きrequestでは、G3でReact memoryに保持しているGoogle ID Tokenを、

```txt
Authorization: Bearer <token>
```

として送信する。

Google ID Tokenを以下へ永続化しない。

- localStorage
- sessionStorage
- IndexedDB
- cookie

現行`useGoogleAuthentication`はtokenをhook内部に保持しているため、G5ではAPI clientがmemory tokenを利用できる必要最小限のinterfaceを追加する。

frontendはshared packageのDTO / input schema / error contractを利用し、backend内部moduleをimportしない。

`419`は期限切れ認証として他のAPI errorと区別し、再認証可能なauthentication stateへ戻す。

API失敗時は現在のcharacter data、remote binding、ownership、cacheを成功したものとして変更しない。

結果通知には共通Toastを使う。

---

# current characterのremote state

## 8. state分類

現在表示中のcharacterを少なくとも以下として区別する。

- local / remote未登録character
- 自分がownerであるremote character
- 自分がownerではないpublic remote character
- 未ログイン状態で表示しているpublic remote character

他人のprivate remote characterはbackendから取得できないため、frontend stateとして成立しない。

`type=user|sample`自体を編集可否の条件にはしない。

remote characterの編集可否はauthentication stateとAPIが返す`isOwner`で判断する。

### local / remote未登録

- 認証有無に関係なく通常編集可能
- ログイン済みならDB保存可能
- remote IDを持たない

### owner remote

- ログイン済みかつ`isOwner=true`なら通常編集可能
- DB保存可能
- DB削除可能
- logoutするとAPI fetchなしでread-onlyへ切り替える

### non-owner / unauthenticated remote

以下をread-onlyとする。

- form input
- picker
- character画像変更・削除
- 可変行追加・削除
- その他character本体を変更する編集操作

ただし以下は利用可能。

- Google login / logout
- キャラクター一覧
- コピー保存（ログイン時）
- 初期化
- インポート
- CCFOLIAコピー
- Help

---

# remote ID

## 9. remote binding

remote characterを選択または保存した場合、現在のlocal characterへremote IDを紐付ける。

remote IDは通常のlocal-first保存・再読込後も、現在のlocal characterがどのremote recordへ対応しているか判別できる形で保持する。

client側へ保存した`isOwner`だけをserver authorizationの正本にはしない。

以下ではremote bindingを解除する。

- DB削除成功
- 初期化
- JSONインポート

remote binding解除時にDB recordを暗黙削除しない。

旧JSONデータへremote ID、`isOwner`、Google token、その他cloud内部状態を追加しない。

---

# authentication state変更

## 10. logout

logout時:

- Google ID Tokenを破棄する
- character一覧cacheを破棄する
- 現在local characterなら編集状態を維持する
- 現在remote characterならAPI fetchを行わずread-onlyへ切り替える
- 現在表示内容を失わない

---

## 11. login

login時:

- character一覧cacheを破棄する
- 現在local characterならremote API fetchを行わない
- 現在remote IDを持つ場合は、そのIDに対して認証付き`GET /character-sheets/:id`を1回実行する
- responseの最新snapshotを既存restore処理へ通す
- `metadata.isOwner`でownershipを再評価する
- `metadata.isPublic`も最新状態へ更新する
- restore成功時は最新remote dataへ現在表示を更新する
- restoreまたは通信失敗時は成功扱いで現在状態を破壊しない

ログイン後に、それまで未認証で閲覧していたpublic characterが自分所有だった場合は`isOwner=true`となり編集可能になる。

---

# キャラクター一覧

## 12. Action Pane上の配置

### desktop

上から以下の順とする。

```txt
Googleログイン / ログアウト
キャラクター一覧
セクションにジャンプ
...
```

`キャラクター一覧`buttonはGoogle認証UIの直下、セクションジャンプの直上へ置く。

### tablet / mobile

既存control pane内で以下の順とする。

```txt
ログイン / ログアウト
キャラクター一覧

セクションへジャンプ
```

---

## 13. キャラクター一覧dialog

`キャラクター一覧`を押すとdialogを開く。

上部に以下の説明を表示する。

```txt
あなたが登録したキャラクターのみ編集できます。
未ログイン時は全てのキャラクターが編集できません。
```

その下に一覧種別を選択するradio buttonを配置する。

```txt
○ 登録キャラクター    ○ サンプルキャラクター
   □ 自分で登録したキャラクターのみ
```

- defaultは`登録キャラクター`
- `登録キャラクター`はAPI responseの`user`
- `サンプルキャラクター`はAPI responseの`sample`
- `自分で登録したキャラクターのみ`はcheckbox
- checkboxのdefaultは未チェック
- checkbox ONでは`metadata.isOwner === true`だけを表示する
- `サンプルキャラクター`選択中はcheckboxをdisabledにする
- 未ログイン時にowner filterを選択した場合は結果0件になってよい
- filterはclient-side
- radio / filter変更でAPIを再取得しない
- radio / filter変更時はpaginationを先頭pageへ戻す

private non-owner characterはbackend response自体へ含まれない。

frontendでprivate characterをfilterしてvisibilityを保証する実装にはしない。

---

## 14. 一覧表示契約

一覧には以下を表示する。

- PC名
- PL名
- 流儀／生き様
- 格
- 更新日

表示契約:

- 未設定値は`-`
- PC名・PL名は一覧幅の各25%を取り、長い値はellipsis
- 一覧に横scrollを発生させない
- 1page 10件
- paginationはclient-side
- server-side paginationなし
- `user`と`sample`のsortはAPI response順を利用

一覧summaryだけからformを復元しない。

characterを選択した場合は、そのIDに対してindividual GETを行う。

---

## 15. character選択とrestore

individual GET成功後はresponseのsnapshotを既存frontend restore処理へ通す。

- form dataを復元する
- snapshotに画像がある場合は現在画像として復元する
- 画像がない場合は以前表示していたcharacterの画像を引き継がない
- remote IDを現在characterへbindする
- `metadata.isOwner`をownership stateへ反映する
- `metadata.isPublic`をremote metadata stateへ反映する
- restore成功後に一覧dialogを閉じる
- non-owner / unauthenticated remoteならread-onlyにする

restoreに失敗した場合:

- 現在表示中のcharacterを変更しない
- remote bindingを変更しない
- error Toastを表示する

---

# 一覧cache

## 16. cache lifecycle

一覧はmemory cacheとする。

### 初回

```txt
キャラクター一覧を初めて開く
→ GET /character-sheets
→ memory cache
→ dialog表示
```

### 同じauthentication state

一度一覧を取得した後は、同じauthentication stateでdialogを再度開いてもAPIを再取得しない。

外部ユーザーによる追加・変更・削除をrealtime同期しない。

### 自分のDB保存 / コピー保存 / DB削除

一覧cacheが存在する場合だけ、成功responseを使ってclient側cacheを更新する。

cacheがまだ存在しない場合、保存 / 削除操作を理由に一覧GETを発生させない。

### 公開設定変更

owner characterのDB保存で`isPublic`が変わった場合、cacheが存在する場合だけ該当summaryを更新する。

自分自身はprivate characterも一覧で閲覧可能なため、private化を理由にowner側cacheから削除しない。

### login / logout

authentication stateが変化した場合は一覧cacheを破棄する。

---

# Action Pane

## 17. desktop配置

desktopの`セクションにジャンプ`より下は、上から以下の順とする。

```txt
ヘルプ
DB保存
コピー保存
DB削除
初期化
インポート
CCFOLIAコピー
```

エクスポートbuttonは削除する。

---

## 18. tablet / mobile配置

既存control paneでは以下とする。

```txt
[ DB保存       ][ コピー保存 ]
[ DB削除       ][ 初期化     ]

[          インポート          ]
[ DB保存に移行するため9/1に削除されます。 ]

[        CCFOLIAコピー         ]
```

- DB保存 / コピー保存は1行2button
- DB削除 / 初期化は1行2button
- インポートは横幅いっぱい
- CCFOLIAコピーも横幅いっぱい
- Helpは現在と同じ独立button / 導線を維持する
- exact breakpointは既存responsive implementationを維持する

インポートbutton内の2行目は小さいdanger色の文字とする。

desktopでも同じ2行button labelを使い、削除予定を常に確認できるようにする。

---

# DB保存

## 19. DB保存button

- label: `DB保存`
- style: filled primary
- ログイン済みかつ現在characterを自分が編集可能な場合だけenabled
- remote未登録のlocal characterは保存可能
- owner remoteは上書き可能
- non-owner remoteはdisabled
- 未ログインはdisabled

既存のroot operation / network operation中の一時的な操作lockは別途維持する。

---

## 20. DB保存dialog

DB保存buttonクリック時は、毎回確認兼入力dialogを表示する。

本文:

```txt
DBに保存するためにはPC名が必須です。
```

PC名入力欄を表示する。

- 現在formのPC名がある場合はdefault valueとして表示する
- PC名が未入力なら空欄
- whitespaceだけのPC名も未入力として扱う
- PC名が空欄の場合、`保存`actionはdisabled

公開設定checkboxを表示する。

```txt
☑ 全員に公開する
```

### 公開checkbox default

remote IDを持たない新規DB保存:

```txt
default = checked / true
```

既存owner remoteの上書き:

```txt
default = 現在DBに保存されているmetadata.isPublic
```

非公開characterを再保存するだけで自動的にpublicへ戻してはならない。

旧案の以下の文言は表示しない。

```txt
DB保存したキャラクターは誰でも閲覧可能になります。
```

dialog action:

```txt
キャンセル
保存
```

- `キャンセル`は既存dialog implementationに合わせる
- `保存`はprimary action

dialogでPC名を変更した場合:

```txt
formのPC名を更新
→ snapshot / metadataを同じPC名で生成
→ API保存
```

一覧metadataとsnapshot内PC名を食い違わせない。

### 新規保存

remote IDを持たない場合:

- idをrequestへ指定しない
- `isPublic`はcheckbox値
- server発行IDで作成する

成功後:

- server発行IDを現在characterへbindする
- owner stateをtrueにする
- `isPublic`をresponse metadataから反映する
- current local persistenceへremote bindingを反映する
- cacheが存在する場合は新しいsummaryを反映する
- success Toastを表示する

### 上書き

owner remoteの場合:

- 現在remote IDを指定してupsert
- `isPublic`はcheckbox値で更新可能

成功後:

- remote IDを維持する
- response metadataを現在remote metadataへ反映する
- cacheが存在する場合は該当summaryを更新する
- success Toastを表示する

---

# コピー保存

## 21. コピー保存button

- label: `コピー保存`
- style: warning filled
- ログイン済みならenabled

source characterのownership / type / remote登録有無には依存しない。

以下からコピー保存できる。

- local character
- 自分のremote character
- 他人のpublic remote character
- sample character

コピー保存はread-only remote characterでも利用できる。

他人のprivate characterはそもそも取得できない。

---

## 22. コピー保存dialog

dialogはwarningの枠線を使う。

本文:

```txt
現在表示されているキャラクターのコピーを保存します。PC名は必須です。PL名は必要に応じて入力してください。
```

その下にgrayの少し小さい文字で以下を表示する。

```txt
コピー保存では画像は保存されません。保存後に設定してDB保存を行ってください。
```

PC名とPL名の入力欄を表示する。

- PC名: 必須
- PL名: 任意
- 両方ともsource characterの値をdefaultにせず毎回空欄から開始
- PC名が空欄 / whitespaceだけの場合は`保存`disabled
- PL名は空欄を許可

公開設定checkboxを表示する。

```txt
□ 全員に公開する
```

コピー保存時のdefaultは、

```txt
unchecked / false
```

とする。

旧案の公開注意文は表示しない。

dialog action:

```txt
キャンセル
保存
```

---

## 23. コピー保存内容

source characterを新規characterとして複製する。

- source remote IDを引き継がない
- API requestにidを指定しない
- serverが新しいIDを発行する
- `type`はG4 contractどおり`user`
- `isPublic`はdialog checkbox値
- PC名をdialog入力値へ変更
- PL名をdialog入力値へ変更
- character画像のBase64を削除して保存する
- その他のcharacter dataはsourceを引き継ぐ

コピーの初回保存ではR2画像容量を消費しない。

---

## 24. コピー保存成功後

成功したcopyを現在表示中のcharacterへ切り替える。

- 新しいremote IDをbindする
- owner=true
- read-onlyを解除する
- `isPublic`をresponseから反映する
- formのPC名 / PL名をdialog入力値へ変更する
- 現在character画像を未設定状態にする
- IndexedDB側の現在画像もcopy元から引き継がない
- cacheが存在する場合は新規summaryを追加する
- success Toastを表示する

source characterそのものは変更しない。

その後ユーザーが画像を設定して通常の`DB保存`を行えば、画像を含めて保存できる。

---

# DB削除

## 25. DB削除button

- label: `DB削除`
- style: danger filled

以下をすべて満たす場合だけenabled。

- ログイン済み
- 現在characterがowner
- remote IDが存在する

```txt
未ログイン            → disabled
non-owner remote      → disabled
local / DB未登録      → disabled
owner + remote IDあり → enabled
```

---

## 26. DB削除dialog

本文:

```txt
DBに保存されたキャラクターを削除します。よろしいですか？
現在表示中のブラウザに保存されたキャラクターは初期化されません。
```

dialog action:

```txt
キャンセル
削除
```

- `キャンセル`は既存dialogに合わせる
- `削除`はdanger action

### 成功

- DB recordを削除する
- 現在form dataを維持する
- 現在character画像を維持する
- remote IDとのbindingだけを解除する
- local / remote未登録characterとして編集を継続可能にする
- cacheが存在する場合は該当summaryを削除する
- success Toastを表示する

### 失敗

- formを変更しない
- remote IDを解除しない
- cacheを変更しない
- error Toastを表示する

---

# 初期化

## 27. 初期化

認証状態、ownership、remote IDを理由とするdisabled条件を設けない。

以下でも実行できる。

- 未ログイン
- non-owner remote
- sample
- owner remote
- local character

既存の初期化確認dialogと初期化処理を維持し、確認文言へ以下を追記する。

```txt
DBに保存されたキャラクターは削除されません。
```

初期化成功時:

- 現在form / imageを既存仕様どおり初期化する
- remote ID bindingを解除する
- DB APIを呼ばない
- DB上のcharacterを削除しない
- DB上のcharacterを空dataで上書きしない
- local / remote未登録characterとして通常編集可能にする

---

# JSONエクスポート / インポート

## 28. エクスポート

JSONエクスポートのユーザー向けbuttonをAction Pane / control paneから削除する。

private DB保存が利用可能になるため、非公開characterの保存用途はDBへ移行する。

既存serialize logicについては、

- DB保存
- コピー保存
- CCFOLIA
- test
- その他既存内部処理

から必要な部分を削除しない。

エクスポートbuttonを消すためだけに、共用されているserialize / snapshot logicまで削除してはならない。

---

## 29. インポート

既存JSON import機能は移行期間として維持する。

認証状態、ownership、remote IDに関係なく利用可能。

buttonは2行表示とする。

```txt
インポート
DB保存に移行するため9/1に削除されます。
```

- 1行目は通常label
- 2行目は小さいdanger色
- desktopでも2行表示
- tablet / mobileでは横幅いっぱい
- 9/1まで既存import flowを維持する

このGateでは日付によって自動的にbuttonを非表示にする処理を追加しない。

```ts
if (date >= "2026-09-01") {
  hideImport();
}
```

のようなruntime calendar判定は実装しない。

9/1の実削除は別の明示的なcode changeで行う。

import成功後:

- remote ID bindingを解除する
- 新しいlocal / remote未登録characterとして扱う
- 既存remote characterを暗黙に上書きしない

---

# CCFOLIAコピー

## 30. CCFOLIAコピー

既存のCCFOLIA出力内容と実行前確認flowを維持する。

認証状態、ownership、remote IDに関係なく利用可能。

non-owner / unauthenticated remoteでも現在表示中dataをCCFOLIA形式へコピーできる。

成功 / 失敗の結果通知専用dialogは共通Toastへ置き換える。

---

# Help

## 31. Help操作

Helpは認証状態、ownership、remote IDに関係なく利用可能とする。

既存の独立Help button / responsive導線を維持する。

---

## 32. Help文言更新workflow

エージェントはHelp本文を直接改稿してはならない。

まず現行Help componentから現在表示されているHelp文言を忠実に抽出し、

```txt
.raw/character-sheet-help.md
```

へMarkdownとして出力する。

この時点では内容を、

- 要約
- 再構成
- 追加
- 削除

しない。

`.raw/character-sheet-help.md`を作成したら、ユーザーが内容を編集するためHelp本文反映作業を一度停止する。

ユーザー編集後、そのMarkdownを正として既存Help componentのHTML / JSX markupへ反映する。

markup反映時は、

- Help dialogの既存scroll構造
- heading
- close操作
- responsive layout
- accessibility

を維持する。

Helpの最終文言はユーザー編集済みMarkdownを優先し、エージェントが勝手に補足説明を追加しない。

---

# 共通Toast

## 33. Toast component

character sheet内の成功 / 失敗結果通知に使う新規共通Toast componentを追加する。

### 表示

- viewport右上
- fixed notification stack
- success: `primary`
  - 現行カラーパレット上のaccent color
- error: `danger`

### lifetime

- 各Toastは表示開始から5秒後に自動消去
- 手動close buttonは持たない
- 各Toastは独立して5秒を計測する

### stack

複数Toastが存在する場合、

```txt
新しいToast
古いToast
さらに古いToast
```

の順に積む。

新しいToastを最上段へ追加し、既存Toastを下へずらす。

### responsive

mobile / tabletでも右上基準を維持する。

具体的な幅と余白は既存layoutに合わせて調整してよいが、

- viewportからはみ出さない
- 本文が実用上読める幅を確保する
- horizontal overflowを発生させない

こと。

### accessibility

success / errorがscreen readerから結果通知として認識できるlive regionを持つ。

---

## 34. 既存結果dialogの置換

ユーザーの判断や入力を必要としない、成功 / 失敗を通知するためだけの既存dialogはToastへ置き換える。

対象例:

- CCFOLIAコピー成功 / 失敗
- character restore失敗
- character画像処理失敗
- JSON import失敗
- DB操作成功 / 失敗

確認や入力を必要とするdialogは維持する。

対象例:

- 初期化確認
- JSON import確認
- CCFOLIAコピー確認
- DB保存
- コピー保存
- DB削除
- 既存のcharacter変更確認

---

# read-onlyと操作可否

## 35. 操作契約

remote read-only時も画面全体を単純に`inert`にはしない。

character dataを直接変更する領域だけをread-onlyとする。

| 操作             | 未ログインremote | non-owner remote | owner remote | local        |
| ---------------- | ---------------- | ---------------- | ------------ | ------------ |
| form編集         | 不可             | 不可             | 可           | 可           |
| 画像編集         | 不可             | 不可             | 可           | 可           |
| picker / 行操作  | 不可             | 不可             | 可           | 可           |
| キャラクター一覧 | 可               | 可               | 可           | 可           |
| DB保存           | 不可             | 不可             | 可           | ログイン時可 |
| コピー保存       | 不可             | 可               | 可           | ログイン時可 |
| DB削除           | 不可             | 不可             | IDありなら可 | 不可         |
| 初期化           | 可               | 可               | 可           | 可           |
| インポート       | 可               | 可               | 可           | 可           |
| CCFOLIAコピー    | 可               | 可               | 可           | 可           |
| Help             | 可               | 可               | 可           | 可           |
| login / logout   | 可               | 可               | 可           | 可           |

他人のprivate remoteはAPIから取得できないため、この表の`non-owner remote`はpublic characterだけを指す。

一時的なAPI operation / image operationなど既存の排他制御によるdisabledは、このbusiness ruleとは別に維持してよい。

---

# Documentation

## 36. active SSoT更新

今回の最新仕様へ以下を整合させる。

- `docs/requirements/character-sheet.md`
- `docs/requirements/architecture.md`
- `docs/testing.md`
- `docs/design/character-sheet/notes.md`
- 必要に応じて`docs/out-of-scope.md`
- 親issue `docs/issue/ex-16-character-sheet-cloud-persistence.md` のactive requirement部分

少なくとも以下をactive SSoTへ反映する。

- `isPublic`
- private character visibility
- individual GETのprivate 404
- DB保存default public
- コピー保存default private
- `全員に公開する`checkbox
- JSONエクスポートUI削除
- JSONインポートの9/1削除予告
- read-onlyでも初期化 / import / CCFOLIA / Help利用可能
- Toast
- Help編集workflow

親issue由来の以下の旧記述はactive SSoTへ残さない。

- 全remote characterが常にpublic
- JSON import / exportを両方削除する
- read-onlyで初期化を禁止する
- read-onlyでCCFOLIAコピーを禁止する
- read-onlyでHelpを禁止する
- Helpからimport説明を即時削除する

Help本文そのものはユーザー編集済み`.raw/character-sheet-help.md`を反映する。

---

# Tests

## 37. backend / shared tests

少なくとも以下を確認する。

### migration / repository

- 既存recordがmigration後publicになる
- `isPublic=true/false`を保存 / 更新できる
- response metadataへ`isPublic`が含まれる

### list visibility

未認証:

```txt
public → 表示
private → 非表示
```

認証済みowner:

```txt
自分public  → 表示
自分private → 表示
```

認証済みnon-owner:

```txt
他人public  → 表示
他人private → 非表示
```

### individual GET

```txt
public + anonymous       → 200
public + non-owner       → 200
private + owner          → 200
private + anonymous      → 404
private + non-owner      → 404
unknown ID               → 404
```

private non-ownerとunknown IDを外部から区別できないことを確認する。

### write

- createで`isPublic`を受け取る
- updateで`isPublic`を変更できる
- non-owner write/deleteはpublic/privateに関係なく拒否
- `type` contractは従来どおり維持

---

## 38. frontend API / authentication tests

- anonymous read
- authenticated requestへのBearer token付与
- `419` handling
- API failure時にcurrent stateを成功扱いで変更しない
- Google tokenをbrowser persistenceへ保存しない
- sharedの`isPublic` contractを利用する

---

## 39. character state tests

- local / owner remote / non-owner remote / unauthenticated remote
- logout時にremoteがfetchなしでread-onlyになる
- login時にremote IDがあればindividual GETでownershipを再評価する
- login時にlocalならremote GETを行わない
- remote bindingの保存 / 解除
- `isPublic`のcurrent metadata反映

---

## 40. character一覧tests

- first openだけ一覧GET
- 同authentication stateで再openしても再取得しない
- login / logoutでcache破棄
- registered / sample radio
- owner filter
- sample選択中のowner filter disabled
- 10件pagination
- filter / type変更でpage reset
- fallback `-`
- long nameの表示契約
- individual GET後のrestore
- restore失敗時にcurrent character維持
- private non-ownerをfrontend filterに頼らずbackendから受け取らない

---

## 41. DB保存tests

- enable条件
- PC名default
- PC名空欄で保存disabled
- 新規保存時`全員に公開する`がchecked
- 既存remoteでは現在の`isPublic`がcheckbox default
- private remoteを再保存するだけで勝手にpublicへ戻らない
- checkbox変更がrequestの`isPublic`へ反映される
- dialog PC名変更がform / metadata / snapshotへ同時反映
- 新規ID binding
- owner remote上書き
- cache更新

---

## 42. コピー保存tests

- login時だけenabled
- source ownershipに依存しない
- warning variant
- PC名 / PL名が空欄開始
- PC名必須
- PL名任意
- `全員に公開する`defaultがunchecked
- checkbox変更が`isPublic`へ反映される
- image Base64を送信しない
- 新規IDを発行するrequest
- 成功後に新copyへbind
- owner=true
- PC名 / PL名更新
- image未設定化
- read-only解除
- cache更新

---

## 43. DB削除tests

- enable条件
- 確認dialog
- 成功後もform / imageを維持
- remote IDだけ解除
- cache削除
- failure時にbindingを維持

---

## 44. local operation tests

- read-onlyでも初期化可能
- 初期化でDB APIを呼ばない
- 初期化でremote ID解除
- read-onlyでもimport可能
- import成功でremote ID解除
- read-onlyでもCCFOLIAコピー可能
- read-onlyでもHelp利用可能
- JSON export buttonが表示されない
- import buttonに9/1削除予告が表示される

---

## 45. Toast tests

fake timer等を使い、

- success variant
- error variant
- 5秒後の自動消去
- manual closeなし
- 新しいToastが上
- 複数Toastが独立して消える
- live region

を確認する。

---

## 46. representative browser confirmation

このGateではpublic E2Eを追加・実行しない。E2Eから実DBへcharacter登録が発生することを避けるためである。

ローカルbackendとlocal D1/R2を使用する手動browser確認では、次の代表flowを確認対象とする。

Google本番認証へ直接依存せず、少なくとも代表flowとして以下を確認する。

- 未ログイン一覧ではpublicだけ表示
- login後、自分のprivate characterが一覧へ表示される
- 他人のprivate characterを一覧 / individual GETで取得できない
- 一覧取得 → character選択 → restore
- owner character選択 → 編集可能
- public non-owner character選択 → read-only
- public non-owner → コピー保存 → 新owner private characterとして編集可能
- local → DB保存 → default public → remote ID取得
- owner remote → privateへ変更して上書き
- private ownerを再保存してもdefaultがprivateのまま
- DB削除 → local data維持
- logout → remote read-only
- login → current remote ownership再評価
- import → remote binding解除

---

# Visual / design

## 47. design handling

今回のユーザー指示をG5 design intentとして扱うため、実装前の新規design draft生成は不要。

`docs/design/character-sheet/notes.md`へ、今回確定した以下を記録する。

- `キャラクター一覧`配置
- list dialog
- radio / owner checkbox
- DB保存button / dialog
- コピー保存button / warning dialog
- `全員に公開する`checkbox
- DB削除button / dialog
- desktop Action Pane順
- tablet / mobile button grid
- export削除
- import full-width + deprecation text
- Toast
- read-only state

canonical VRT baselineはユーザーの明示承認なしに更新しない。

親issueの方針どおり、G5 PR review単体では統合Visual Reviewを完了扱いにせず、G5統合後の親issue最終段階で`/character-sheet/`のdesktop / tablet / mobileを対象にVisual Reviewする。

---

# 初期スコープ外

- 新しいbackend endpoint
- D1 / R2 resource構成の再設計
- server-side pagination
- server-side検索 / 任意sort
- realtime同期
- polling
- WebSocket
- 共有URL専用page
- 複数character tab
- collaborative editing
- revision history
- 管理画面
- Google以外のIdentity Provider
- refresh token永続化
- character JSONのserver-side game schema validation
- schema version migration
- 永続skill ID migration
- private characterを他人へ個別共有するACL
- invite / share token
- copy時のsource画像複製
- Toastの手動close
- Toast履歴
- backend側のcopy endpoint
- 9/1を検出してimport UIを自動削除するruntime処理
- 本Gate内での9/1以降のimport code実削除

---

# 完了条件

- [ ] D1 metadata、shared API contract、frontend metadataへ`isPublic`が追加されている。
- [x] 既存D1 recordがmigration後publicとして扱われる。
- [x] 未ログイン一覧ではpublic characterだけを返す。
- [x] ログイン一覧ではpublic characterと自分所有のprivate characterだけを返す。
- [x] 他人のprivate characterをindividual GETすると`404`になり、存在しないIDと区別できない。
- [x] write / delete authorizationが公開フラグに関係なくowner限定のまま維持されている。
- [x] sampleにも同じ公開フラグcontractを適用している。
- [ ] G4の4 endpointを利用するfrontend API clientが追加され、Google ID TokenをmemoryからAuthorization headerへ渡せる。
- [ ] Google ID Tokenをbrowser persistenceへ保存していない。
- [ ] local / owner remote / non-owner remote / unauthenticated remoteの状態が区別され、remote ID bindingがlocal-first stateと統合されている。
- [ ] login / logout時のownership再評価と一覧cache invalidationが仕様どおり動作する。
- [ ] `キャラクター一覧`buttonがdesktop / tablet / mobileの指定位置へ追加されている。
- [ ] character一覧dialogが指定説明文、radio、owner filter、表示契約、10件paginationを満たす。
- [ ] 一覧cacheが初回open時だけ取得され、同authentication stateで再openしてもfetchしない。
- [ ] character選択がindividual GETと既存restore処理を使い、remote ID / ownership / `isPublic` / imageを正しく反映する。
- [ ] non-owner / unauthenticated remoteのcharacter編集操作がread-onlyになり、許可された非編集操作は利用できる。
- [ ] desktop Action Paneとtablet / mobile control paneのbutton順・layoutが指定どおりである。
- [ ] DB保存button、dialog、PC名必須、新規保存時public default ON、既存保存時current `isPublic` default、remote ID bindingが仕様どおり動作する。
- [ ] `DB保存したキャラクターは誰でも閲覧可能になります。`という旧注意文を表示していない。
- [ ] コピー保存button、warning dialog、PC名 / PL名入力、public default OFF、画像除外、新規ID、成功後のowner character切替が仕様どおり動作する。
- [ ] DB削除button、確認dialog、成功後のlocal data維持とremote binding解除が仕様どおり動作する。
- [ ] 初期化がownershipに関係なく利用でき、DB recordを削除・更新せずremote bindingだけ解除する。
- [ ] JSONエクスポートbuttonがユーザー向けAction Pane / control paneから削除されている。
- [ ] JSONインポートを維持し、button内2行目へdanger色の小さい文字で`DB保存に移行するため9/1に削除されます。`と表示している。
- [ ] tablet / mobileのインポートbuttonが横幅いっぱいになっている。
- [ ] importに日付判定による自動削除ロジックを追加していない。
- [ ] import成功後はremote bindingを解除している。
- [ ] CCFOLIAコピーとHelpがownershipに関係なく利用できる。
- [ ] 新規共通Toastがsuccess / error、5秒、自動消去、manual closeなし、新着上stackを満たす。
- [ ] 結果通知だけを目的とする既存success / error dialogがToastへ移行されている。
- [ ] 現行Help文言を`.raw/character-sheet-help.md`へ忠実に抽出し、ユーザー編集後の内容をcomponent markupへ反映している。
- [ ] active SSoTが今回の最新G5仕様へ更新され、親issue / G4由来の旧公開・UI判断を残していない。
- [ ] shared/backend/frontendのunit / component / hook / integration testと代表browser確認が追加・更新されている。public E2Eは追加・実行していない。
- [ ] backend integration testを含む必要なCIが通る。
- [ ] `npm run check`、shared/backend/frontend test、必要なbuildが通る。
- [ ] schema migration / 永続skill ID TODOをこのGateへ混在させていない。
- [ ] canonical VRT baselineをユーザー承認なしに更新していない。

---

# チェックポイント

- [x] G5 implementation開始前にcurrent parent branchとG4 API / shared contractを再確認している。
- [ ] G3 tokenを利用するためだけにGoogle認証flowを再実装していない。
- [ ] frontendがbackend内部moduleをimportしていない。
- [x] private visibilityをfrontend filteringだけで保証していない。
- [x] private non-ownerのindividual GETが`403`ではなく`404`になっている。
- [x] client側`isOwner`をserver authorizationの代替にしていない。
- [x] `isPublic`をownership判定へ流用していない。
- [ ] read-only実装でAction Pane / control pane全体を一律操作不能にしていない。
- [ ] DB保存、コピー保存、DB削除の二重送信を防いでいる。
- [ ] network failure時にremote bindingやcacheを成功扱いで変更していない。
- [ ] localStorage / IndexedDBの既存local-first保存を壊していない。
- [ ] remote snapshotの画像restoreとcopy時の画像除外を混同していない。
- [ ] JSON import data contractへremote ID、`isOwner`、`isPublic`、Google token等のcloud内部状態を混入していない。
- [ ] export UI削除のためにDB保存等で共有するserialize logicを破壊していない。
- [ ] 一覧dialog openごとにAPI requestを発生させていない。
- [ ] save/deleteを理由に未取得一覧cacheを強制取得していない。
- [ ] resetがremote DB recordへwrite/deleteしていない。
- [ ] Toastへ確認・入力責務を移していない。
- [ ] Help本文をユーザー編集前にエージェント判断で改稿していない。
- [ ] desktop / tablet / mobileでhorizontal overflow、操作不能、dialog overflowを発生させていない。
- [ ] import削除予定をruntime日時判定で実装していない。
- [ ] 不要なstate management library、Toast library、UI libraryを追加していない。
- [ ] G5初期スコープ外機能を追加していない。
- [ ] ユーザーの未コミット変更を破壊していない。

---

## レビュー指摘 1

### 指摘事項

- `キャラクター一覧`buttonは、desktop / tablet / mobileともGoogleログイン / ログアウトの直下、`セクションにジャンプ`の直上へ置く。現実装の操作button群内配置は契約違反である。
- 一覧dialogの選択UIには`一覧種別`という表示文言を置かない。`登録キャラクター`と`自分で登録したキャラクターのみ`を同じグループとして配置し、`サンプルキャラクター`を別のradio選択肢とする。radioは横並び、checkboxはその下に置く。
- sample選択中はowner checkboxをdisabledにし、owner filterをsample一覧へ適用しない。radio / checkboxは既存controlと同じaccent colorを使い、説明文・controlの文字と寸法は一覧tableを優先できる小さい密度にする。
- 一覧はcard型ではなくtableで表示し、PC名、PL名、プライマリ流儀、生き様、格、最終更新日のheaderを持つ。流儀・生き様はIDでなく表示名を使い、未設定値は`-`とする。長いPC名 / PL名はellipsisとする。
- 最終更新日は時刻を含めず日付として表示する。current issueの`最終更新日時`は、最新ユーザー指示とdesign notesの`最終更新日`へ整合させる。
- tableはclient-sideで1 page 10件としてpaginationし、10件超の表示・page移動・filterまたはradio変更時の先頭page復帰を確認可能にする。
- character一覧dialogにfooter actionは置かない。閉じる導線は右上のclose buttonとEscapeだけとする。
- current issueが求めるDB保存、コピー保存、DB削除、Toast、JSON export UI削除、import移行導線、Help workflowなどを未実装のまま、部分実装だけでユーザレビューを開始した。
- read-onlyの入力欄は操作不能であることが明確に分かるdisabled視覚表現を持つ必要がある。現実装は`fieldset disabled`だけで、input fieldがdisabledに見えない。

### 判定

- source: human
- classification: valid
- local validation: current issueのAction Pane配置、一覧dialog、表示契約、pagination、read-only契約と、現実装の`CharacterSheetActionPane.tsx`、`CharacterSheetCharacterListDialog.tsx`、`CharacterSheetContainer.tsx`を照合した。全項目はcurrent issue内の未完了scopeに属する。最終更新日の表記だけはcurrent issueとdesign notesが競合しているため、最新ユーザー指示を優先する。

### 対応方針

- まずG5の未実装機能をcurrent issueの順序で実装し、一覧dialogは上記のtable・選択UI・pagination・read-only visual contractへ作り直す。
- UIユーザレビューは、current issueの実装と必要なlocal validationを完了した後に再開する。
- public E2Eは追加・実行せず、node / component / hook testとlocal backendを使う手動browser確認で検証する。

### 対応完了チェックリスト

- [ ] Action Pane / control pane、一覧dialog、read-only visual stateをレビュー指摘どおりに修正する。
- [ ] DB保存、コピー保存、DB削除、Toast、JSON export UI削除、import移行導線、Help workflowをcurrent issueどおりに実装する。
- [x] `npm --workspace=@neon-underrealm/frontend run check` が通る。
- [x] `npm --workspace=@neon-underrealm/frontend run build` が通る。
- [ ] public E2Eを追加・実行せず、local backendで手動browser確認する。

---

## レビュー指摘 2

### 指摘事項

- Action Paneでは、`キャラクター一覧`と`セクションにジャンプ`の間だけに区切り線を置く。Googleログイン / ログアウトと`キャラクター一覧`の間には置かない。
- `DB保存`、`コピー保存`、`DB削除`、`JSONインポート`、`CCFOLIAコピー`、`初期化`は既存`CharacterSheetButton`の`outline`表示へ統一する。
- 一覧tableは、流儀と生き様をheader・本文とも`流儀\n／生き様`として表示する。日付headerは`更新日`とし、PC名・PL名は各50%幅、text overflowはellipsisで表示する。横scrollは発生させない。
- `登録キャラクター`と`サンプルキャラクター`は上揃えにしてradio行を揃え、`あなたが登録した…`の補足文は小さくする。
- non-owner / unauthenticated remoteのread-only表示はform全体のopacityや一律のdisabled視覚表現を使わず、編集不可のinput、select、textareaだけがdisabledと分かる状態にする。
- DB保存、コピー保存、DB削除dialogのtitleは置かない。キャンセルbuttonは既存`CharacterSheetButton`の`muted` colorを使い、buttonのsize・variant・配置を初期化とCCFOLIAコピーのdialogに揃える。
- Help本文以外の今回追加した表示文言は既存`characterSheetDictionary`を優先し、未定義の文言だけを同じdictionaryへ追加する。componentへのベタ書きは残さない。
- 追加・変更した実装を既存character sheetの流儀と照合し、propsの渡し方、命名、責務分割、component・CSS・dictionary・testの使い方、`memo` / `useMemo` / callbackの必要性を自己レビューする。

### 判定

- source: human
- classification: valid
- local validation: `docs/requirements/character-sheet.md`のAction Pane、一覧、read-only、dialog契約と、`CharacterSheetActionPane.tsx`、`CharacterSheetCharacterListDialog.tsx`、DB操作dialog、`CharacterSheetButton.tsx`、`dictionary.ts`を照合した。区切り線、outline、一覧table、dialog、dictionary、read-only、component設計はすべてcurrent issueの未完了scopeに属する。`更新日`は既存requirementsの`最終更新日`と異なるが、最新のユーザー指示を優先する。

### 対応方針

- 既存`CharacterSheetButton`の`variant`、`color`、`size`を再利用し、Action PaneとDB操作dialogの見た目を揃える。
- 一覧tableはfixed layoutと列幅・ellipsisを使い、指定された改行headerと小さい補足文・揃ったfilter controlsを実装する。
- read-onlyはform全体の視覚的な減衰を外し、native disabled controlだけを対象にする。
- 文言をdictionaryへ集約したうえで、追加実装とContainerを既存character sheetのcomponent、CSS、dictionary、testの流儀と比較して整理する。

### 対応完了チェックリスト

- [x] Action Paneの区切り線と操作buttonのoutline表示をレビュー指摘どおりに修正する。
- [x] 一覧tableの列、改行header、50%幅、ellipsis、overflowなし、filter controlsと補足文をレビュー指摘どおりに修正する。
- [x] read-only時のform全体disabled視覚表現をなくし、編集不可controlだけをdisabled表示にする。
- [x] DB保存、コピー保存、DB削除dialogを既存dialog button contractへ揃える。
- [x] Help以外の追加UI copyを`characterSheetDictionary`へ集約する。
- [x] 変更実装を既存character sheetの命名、責務分割、component、CSS、dictionary、test、props / memo化の流儀と照合して自己レビューする。
- [x] frontend component / hook testを更新する。
- [x] `npm --workspace=@neon-underrealm/frontend run check` が通る。
- [x] `npm --workspace=@neon-underrealm/frontend run build` が通る。
- [ ] desktop / tablet / mobileで対象dialogと一覧をlocal browser確認する。

---

## レビュー指摘 3

### 指摘事項

- `キャラクター一覧`dialogは高さを固定し、header、説明・filter、paginationを常時表示する。表示件数が収まらない場合は、headerより下かつpaginationより上にある一覧行だけを縦scrollさせる。登録characterとsample characterの切替、または一覧scrollによってdialog・操作領域の高さを変えない。
- 一覧のページ切替時は、一覧行のscroll位置を先頭へ戻す。
- 一覧tableの列幅はPC名30%、PL名20%を基準にする。流儀／生き様の値は必要なら小さくしてよい。更新日はellipsisで切り詰めずに読める幅を確保し、横scrollは発生させない。
- 一覧dialogはdesktop / tabletで既存データ選択dialogと同じ最大幅まで広げる。mobileでは更新日だけを最小限まで小さくし、clipさせない。
- mobileではPC名、PL名、格も更新日と同じ小さい本文文字サイズにする。
- local Workerの通常開発entryは本番と同じ正規Google token verifierを使う`src/index.ts`へ統一し、同じ内容を複製した`local-index.ts`を残さない。mock verifierはintegration専用entryだけに閉じる。
- Cloud persistence追加後に肥大化した`CharacterSheetContainer`は、既存の`useActionPane`、`useCharacterChangeWarning`、dialog groupの流儀へ戻す。remote API・一覧cache・保存操作・dialog stateを専用hookとdialog groupへ分離し、Containerは既存hookの接続と配置だけを担う。local-first form / imageと密結合のremote metadata・restore処理は`useCharacterSheetRootState`に残す。

### 判定

- source: human
- classification: valid
- local validation: `CharacterSheetCharacterListDialog.tsx`とCSSは現在、dialog content全体が可変高で、一覧行だけを独立scrollする領域もpage遷移時のscroll復帰も持たない。列幅はPC名・PL名とも25%であり、更新日を省略しない保証がない。`backend/src/local-index.ts`は`src/index.ts`と同じ`GoogleIdTokenVerifier`を持つ重複entryで、`dev:local`だけがそれを指定している。`CharacterSheetContainer.tsx`は今回のremote persistence状態と操作を直接所有して592行となっており、既存hookとdialog groupによる責務分割から外れている。すべてG5の一覧、local review環境、frontend統合の未完了scopeに属する。

### 対応方針

- 一覧dialogのcontentを固定高のlayoutへ組み替え、table body相当の一覧領域だけをscroll containerにする。ページ、radio、owner filterの変更時には一覧scroll refを先頭へ戻す。
- tableの固定layoutを維持したまま、PC名30%・PL名20%と更新日の非省略表示を満たす列幅へ配分し、流儀／生き様の値だけを局所的に小さくする。
- 一覧dialogは既存pickerの最大幅をdesktop / tabletへ再利用し、mobileだけ更新日列と文字サイズを局所的に縮める。
- mobileのPC名、PL名、格も更新日と同じ本文文字サイズへ揃える。
- `dev:local`を`src/index.ts`へ向け、`local-index.ts`を削除する。`integration-index.ts`とintegration用stateは維持する。
- `useRemoteCharacterPersistence`とremote persistence dialog groupを新設し、一覧・DB保存・コピー保存・DB削除に関する非同期処理、UI state、props組み立てを移す。Toastも専用hookへ分離し、Containerは各hookの連結と描画配置に限定する。
- 一覧dialogと新しいhook / dialog groupのcomponent testを更新し、frontendのcheck・test・buildを実行する。表示契約の肯定確認はdesktop / tablet / mobileのactual画面を確認するまで完了扱いにしない。

### 対応完了チェックリスト

- [x] 一覧dialogを固定高にし、一覧行だけのscrollとページ遷移時のscroll先頭復帰を実装する。
- [x] 一覧tableをPC名30%・PL名20%、更新日を省略しない列幅へ調整する。
- [x] desktop / tabletの一覧dialog幅を既存データ選択dialogへ揃え、mobile更新日をclipなく表示する。
- [x] 通常local Worker entryを`src/index.ts`へ統一し、重複した`local-index.ts`を削除する。
- [x] remote persistenceとToastの状態・操作・dialog propsを専用hook / dialog groupへ分離し、Containerを既存流儀へ戻す。
- [x] 一覧dialogと分離したhook / dialog groupのtestを更新する。
- [x] `npm --workspace=@neon-underrealm/frontend run check` が通る。
- [x] `npm --workspace=@neon-underrealm/frontend run test` が通る。
- [x] `npm --workspace=@neon-underrealm/frontend run build` が通る。
- [ ] desktop / tablet / mobileで一覧dialogの固定操作領域、scroll、ページ遷移をlocal browser確認する。

---

# 想定変更ファイル

- `packages/shared/src/`
- `packages/shared/**/*.{test,spec}.ts`
- `backend/migrations/`
- `backend/src/domain/`
- `backend/src/service/`
- `backend/src/repository/`
- `backend/src/validation/`
- `backend/src/app.ts`
- `backend/tests/`
- `frontend/src/character-sheet/CharacterSheetContainer.tsx`
- `frontend/src/character-sheet/auth/`
- `frontend/src/character-sheet/api/` または同等のAPI client境界
- `frontend/src/character-sheet/hooks/`
- `frontend/src/character-sheet/logic/`
- `frontend/src/character-sheet/components/CharacterSheetActionPane.tsx`
- `frontend/src/character-sheet/components/CharacterSheetActionPane.module.css`
- `frontend/src/character-sheet/components/dialogs/`
- `frontend/src/character-sheet/components/_common/`
- `frontend/src/character-sheet/dictionary.ts`
- `frontend/src/character-sheet/**/*.{test,spec}.{ts,tsx}`
- `frontend/tests/` または既存browser / E2E test
- `.raw/character-sheet-help.md`
- `docs/design/character-sheet/notes.md`
- `docs/requirements/character-sheet.md`
- `docs/requirements/architecture.md`
- `docs/testing.md`
- 必要に応じて`docs/out-of-scope.md`
- `docs/issue/ex-16-character-sheet-cloud-persistence.md`

実際のcomponent / hook分割は既存構造を優先し、この一覧に合わせるためだけの不要なfile分割は行わない。

---

# レビュー観点

- `isPublic`が単なるfrontend表示設定ではなく、backend read authorizationとして実装されているか。
- anonymous / authenticated owner / authenticated non-ownerでvisibility contractが正しいか。
- private non-owner characterの存在をindividual GETのstatusから推測できないか。
- public/private変更がwrite ownershipへ影響していないか。
- current characterのlocal / remote / owner / read-only stateが単一の整合したstate transitionとして扱われているか。
- logout / login / select / save / copy / delete / reset / importでremote IDが正しくbind / unbindされるか。
- non-owner remoteをread-onlyにしつつ、コピー保存、初期化、import、CCFOLIA、Helpを過剰にdisabledにしていないか。
- 一覧cache lifecycleが不要なAPI requestを発生させないか。
- DB保存の新規default publicと、既存remoteの現在設定維持が混同されていないか。
- コピー保存がdefault privateになっているか。
- コピー保存がsource imageをR2へ複製せず、新しいowner characterとして自然に編集へ移行するか。
- DB削除と初期化の違いがdata/state双方で守られているか。
- result notificationとconfirmation / input dialogの責務がToast導入後も分離されているか。
- JSON export UI削除後も必要なserialize logicが維持されているか。
- JSON importが旧データからDB保存への移行導線として9/1まで利用可能か。
- import削除予定の表示がdesktop / tablet / mobileで読めるか。
- Helpがユーザー編集済みMarkdownを正として反映されているか。
- desktop / tablet / mobileのAction Pane / control paneが指定された操作順とresponsive layoutを満たすか。
- G5の最新要件のために必要な範囲を超えてbackend / shared architectureを作り直していないか。

---

# 備考

- G5のdesign intentは本issueに記録したユーザー最新指示を正とする。
- parent issueまたはG4完了時点のcontractと本issueが衝突する場合、本issueのユーザー最新仕様を優先し、active requirements / architecture / design notesを同じ仕様へ更新する。
- `docs/TODO.md`のJSON schema version互換性と永続skill ID変更検出は、本Gateの完成条件へ追加しない。
- インポートの`9/1`削除は告知だけを本Gateで実装する。実際の削除は9/1時点の明示的な変更で行う。
- G5完了後、親issueの最終統合段階でVisual Reviewを実施する。

### Local validation summary

- branch: `ex-16-5-cloud-persistence-ui`
- local issue: `docs/issue/ex-16-5-cloud-persistence-ui.md`
- parent Gate plan: `docs/issue/ex-16-character-sheet-cloud-persistence/plan.md`
- child issue、parent issue、requirements、backend architecture、testing、out-of-scope、character-sheet design notes、関連TODOを照合した。G5のユーザー確定仕様を優先し、名称、公開範囲、read-only操作、JSON入出力、Help、design前提の相反するactive記述を更新した。
- JSON schema version互換性のTODOは現在のG5 scope外のままとし、永続skill ID migrationはissueの初期スコープ外を維持する。
- UI implementationとcanonical VRT baselineの更新は未実施であり、ユーザー承認後にだけ開始する。
