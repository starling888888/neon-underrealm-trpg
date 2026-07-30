# ex-02-24-sheet-persistence

## 最優先のデザイン入力

- ユーザーの最新指示を優先し、画像の復元処理はG6で実装済みのため変更しない。G24は画像以外の`CharacterSheetFormValues`だけを対象にする。
- `docs/design/character-sheet/notes.md`の「検証、作業継続、出力」にある、復元完了前に保存済みデータを上書きしない状態を伝える要件を守る。復元失敗時は既存の`CharacterSheetDialog`を再利用し、title / headerを置かず本文だけに「自動復元に失敗しました。」、action buttonを`確認`だけとする。新たな画面配置や独自の通知UIは追加しない。
- design notes、実装結果のscreenshot、reviewer出力は、ユーザー指示または既存UIにない表示導線を決める根拠にしない。不足する表示文言・導線が必要になった場合は、source codeを変更せずにユーザー判断を求める。

## 目的

画像と独立した最新1件のフォーム値を端末内へ自動保存し、構造・型として利用可能な保存値を起動後に一括復元する。復元値がゲーム上のエラー状態を含んでも自動補正せず保持し、G27のJSON importが同じ復元・検証境界を再利用できるようにする。

## 背景

G6は画像recordをIndexedDBへ復元する処理だけを実装済みであり、フォーム値のlocalStorage自動保存・復元はG24まで未実装である。`CharacterSheetFormValues`はすでにserializableなRHF唯一の編集値であり、G16で可変行のrow IDと`reset`時のuncontrolled input同期契約を確定している。

保存データを単に`JSON.parse`した結果として`form.reset()`へ渡すと、壊れた値の部分反映、初期値による既存下書きの上書き、または将来のJSON importとの検証境界の重複を招く。このGateでは、保存済みフォーム値を`unknown`から受け取って一度だけ検証・マスタ照合・復元可能値への変換を行う境界を定める。

関連する正本・参照先は以下とする。

- `docs/issue/ex-02-web-character-sheet/plan.md` のG24、およびG16のrow ID / reset同期の確定事項
- `docs/requirements/character-sheet.md` の「エラーと警告」「保存、復元、出力」
- `docs/architectures/character-sheet.md` の「状態と派生値の境界」「自動保存と復元」「データ境界」「実装時のアーキテクチャ遵守」
- `docs/design/character-sheet/notes.md` の「検証、作業継続、出力」
- `docs/out-of-scope.md`
- `docs/TODO.md` のG24着手前のRHF field array境界、およびmaster ID解決の分離に関する未完了項目

## Gate関係

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`
- Gate: `G24: 自動保存と保存済み項目の自動復元`

このissueはG24だけを実装する自己完結した契約である。現在の作業branchはユーザー指示により親branchの`ex-02-web-character-sheet`を継続利用する。子branchは作成しないが、issue名はGate planに対応する`ex-02-24-sheet-persistence`を使う。

## アーキテクチャ適用

| 適用節                       | 許可する変更                                                                                                                                                                                    | 禁止する変更                                                                                                                | 確認するテスト層                                         |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `実装時のアーキテクチャ遵守` | 最終diffをこの表と本issueの対象範囲へ対応付け、G24に必要なroot-state、persistence、schemaだけを変更する。                                                                                       | ほかのGateのUI、JSON export / import、全消去、派生logicの設計変更を混在させる。                                             | 最終diff照合、Node、hook、必要時のbrowser behavior       |
| `状態と派生値の境界`         | RHFを唯一の編集stateとして保ち、復元済み値を`reset`または既存field array契約に従って反映する。復元中・利用可能・失敗のroot状態と復元失敗dialogの開閉・focus復帰をroot-state custom hookへ置く。 | RHF値の別store複製、外部更新でのclamp・自動削除、画像record・dialog・menu・section開閉stateの保存値への混在。               | hook、既存uncontrolled input同期の回帰、browser behavior |
| `自動保存と復元`             | localStorage adapter、RHF `subscribe`、debounce、離脱時flush、マウント後の構造検証済み`reset`、画像読取りと独立した初期化を実装する。                                                           | `useWatch`による保存専用再描画、復元完了前の保存、復元失敗時の部分反映、画像復元とフォーム復元の相互停止。                  | persistence Node、root-state hook                        |
| `データ境界`                 | `schemas/`で復元入力を検証し、`master-data/`の読み取り結果を明示入力として未知IDを扱うshared restore adapterを置く。                                                                            | `logic/`へStorage / React依存を混在させること、既存TODOが求める派生logicからのmaster ID解決分離をこのGate内で回収すること。 | schema / persistence Node、master-data境界の既存回帰     |
| `テスト層と配置`             | serializable persistenceとschemaをNode test、RHFと副作用の結線をhook testで確認する。既存画面表示を変更しない範囲ではVRTを実行しない。                                                          | Storage実装へ直結したテスト、VRTへ構造・復元競合の検証を置くこと、test-onlyの製品状態・DOMを追加すること。                  | Node、hook、必要最小限のbrowser behavior                 |

## 対象範囲

- `CharacterSheetFormValues`だけを対象にするlocalStorage persistence adapterを`src/character-sheet/persistence/`へ置く。保存keyはfeature内で定数化し、最新1件だけを読み書きできるようにする。画像record、派生値、dialog・menu・section開閉などのUI stateは含めない。
- `unknown`の保存入力を、JSON textの解析、フォーム構造・プリミティブ型・配列要件・row IDの検証、現在のマスタID照合、復元可能な`CharacterSheetFormValues`への変換の順に扱うshared restore adapterを定める。このadapterはブラウザAPIやReact stateを持たず、G27がファイル読取り後に同じ検証・正規化境界を利用できる公開APIにする。
- 構造と型が正しい値は、経験点・信用・能力値配分・重複・スキルLvの下限または最大Lv超過など、既存logicが局所errorとして扱う不整合を含んでも除外・clamp・初期値への置換をせず復元する。派生値とerror表示は既存のRHF値から再計算する。
- 現在のマスタにない選択IDは、該当する単一選択値を空欄へ、可変行を行単位で除外する。除外後にfield arrayの最小行数、固定rowのidentity、関連する`ryugiRowId`参照を含む必須構造を満たせず完全な互換性を保てない場合は、フォームへ一切反映しない。
- JSONとして解析できない、必須構造・型・列挙値・row IDが不正、または上記マスタ除外後に完全な互換性を保てない保存値は「復元不可」として扱う。初期RHF値または現在の編集値を部分変更せず、該当localStorage recordも自動削除・書換えしない。
- root-state custom hookで、マウント後にフォーム復元を開始し、検証済み値だけを`form.reset()`で一括反映する。復元が完了または失敗して保存値を破棄するまで自動保存を開始しない。画像IndexedDB読取りとは独立して進め、片方の失敗で他方を停止させない。
- RHFの`subscribe`を使ってフォーム値を監視し、短時間の連続入力はまとめて保存する。unmount / page離脱時は保留中の最新値を保存する。`useWatch`で保存専用の再描画を発生させず、RHF外の編集state storeを追加しない。
- JSON解析、構造・型検証、マスタ照合のいずれかで復元に失敗した場合は、既存の`CharacterSheetDialog`を使う。title / headerとheaderのclose buttonは置かず、本文だけに「自動復元に失敗しました。」を表示する。visibleなaction buttonは`確認`だけとし、確認後は初期フォーム値を編集可能な状態へ戻す。dialogのaccessible name、開閉・確認後のfocus復帰はroot-state custom hookが所有し、保存値は変更しない。
- localStorage APIの読取り・書込みが例外になった場合は`console.error`を出して握りつぶす。編集・画像復元・以降の入力を停止せず、dialogや恒久的な警告表示を追加しない。復元中と復元終了後の保存開始境界は、既存root-level loading overlayで識別できるようにする。
- persistence adapterとshared restore adapterのNode test、root-stateのhook testを追加する。少なくとも、空保存、正常保存、復元前の保存抑止、エラー状態を含む復元、壊れたJSONの拒否と非部分反映・record保持・dialog表示、未知ID除外の成功・失敗、遅延復元と新規編集の競合、画像復元からの独立、localStorage例外時の`console.error`と非停止を確認する。

## 初期スコープ外

- G6で実装済みの画像recordの保存・読取り・削除・表示、または画像をlocalStorage / フォーム値 / JSONへ混在させること。
- JSON export、ファイル選択、JSON import確認dialog、JSON importのユーザー向け失敗文言を実装すること（G26 / G27）。ただしG27が共有するrestore adapterのAPIとテストfixtureはこのGateで定めてよい。
- エラー・警告の集約表示、action paneのbutton文言・レイアウト・新しい通知dialogの実装（G25、G23の既存境界を維持する）。ただし、復元失敗の既存`CharacterSheetDialog`接続はこのGateに含める。
- 全消去に伴うform reset、localStorageまたは画像recordの削除操作（G29）。復元不能な自動保存値の削除・書換えもこのGateでは行わない。
- スキーマバージョン、旧JSON形式の移行、複数キャラクター、クラウド同期、サーバー・DB・認証、追加npm package。
- `docs/TODO.md`で別taskとされる、派生logicからのmaster ID解決の分離を、このGateへ拡張して実装すること。復元境界でread-only master-data adapterを入力として使うことは許可するが、既存`logic/`のID解決責務は変更しない。

## 完了条件

- [ ] 画像を含まない最新1件のserializableなフォーム値をlocalStorageへ自動保存できる。
- [ ] 起動後の復元完了前に初期値で既存保存値を上書きせず、復元済み値は`form.reset()`で一括反映される。
- [ ] 構造・型として正しい不整合値は、clamp・削除・初期値化をせず復元され、既存の局所error判定へ渡る。
- [ ] 解析不能または構造・型として復元不能な保存値は、formへの部分反映なしに拒否され、端末内保存を変更しない。
- [ ] 現在のマスタにないIDは要件どおり除外し、除外後に必須構造を維持できない値はformと端末内保存を変更せず、復元失敗として扱う。
- [ ] shared restore adapterをG27のJSON importが再利用でき、localStorage固有の削除やReact副作用をimport入力へ持ち込まない。
- [ ] 画像復元の成功・不在・失敗がフォーム復元を停止させず、フォーム復元の失敗も画像表示を変更しない。
- [ ] localStorage APIの読取り・書込み例外で`console.error`を出し、現在の編集を停止または破壊せず、dialogを表示しない。
- [ ] 復元失敗時に、`CharacterSheetDialog`で「自動復元に失敗しました。」と`確認`だけを表示し、確認後に初期フォーム値を編集できる。
- [ ] `docs/TODO.md`の関連2項目を現行SSoTと照合し、このGateで回収しないものを明記している。
- [ ] `npm run check` が通る。
- [ ] `npm run build` が通る。

## チェックポイント

- [ ] architectureのRHF唯一の編集state、`useFieldArray`、`reset`、uncontrolled input同期、browser副作用分離の契約を守る。
- [ ] 保存専用の`useWatch`、別のstate store、React ComponentからのlocalStorage直接操作、不要な依存関係を追加していない。
- [ ] 正常な復元、保存済みデータなし、recordを保持する破損保存値、構造は正しいerror状態、未知ID除外、`console.error`するlocalStorage例外、画像復元との並行をテストで確認している。
- [ ] 既存route、GitHub Pagesのsubpath公開、G6画像復元、G16のfield array row ID / reset同期を壊していない。
- [ ] `docs/TODO.md`の関連TODOをこのGateへ混在させず、read-only master-data adapterを使う復元境界だけを実装している。
- [ ] 復元失敗dialogが既存`CharacterSheetDialog`のfocus・Escape・閉じる契約を壊さず、title / headerとheaderのclose buttonを置かず、本文とvisibleなaction buttonを`確認`だけにしている。
- [ ] 初期スコープ外の機能を実装していない。
- [ ] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `src/character-sheet/persistence/character-sheet-form.ts`（新規）
- `src/character-sheet/schemas/character-sheet-persistence.ts`（新規、または既存form schemaと責務を分離した適切なschema module）
- `src/character-sheet/useCharacterSheetRootState.ts`
- `src/character-sheet/dictionary.ts`
- `src/character-sheet/components/dialogs/CharacterSheetDialog.tsx`を組み立てる既存または最小限の復元失敗dialog Component
- `tests/node/character-sheet/persistence/character-sheet-form.test.ts`（新規）
- `tests/hooks/character-sheet/useCharacterSheetRootState.test.tsx`
- 必要最小限のshared restore adapterのtest fixture

## レビュー観点

- 「構造・型として利用可能」と「既存logicが表示するゲーム上の不整合」を分離し、error状態のフォーム値を誤って破棄・補正しない契約になっているか。
- 壊れたlocalStorage recordをフォームへ反映せず、record自体とJSON import予定の入力または現在の編集値を変更しない責務分離になっているか。
- 未知IDの除外と、row ID・field array最小行数・関連参照の完全性確認が、部分復元を許さない要件と両立しているか。
- G24関連の`docs/TODO.md`のRHF操作境界・master ID解決分離を別scopeへ広げず、read-only master-data adapterを使う復元境界だけに限定できているか。
- title / headerなしの復元失敗dialog本文、`確認`だけのvisible action、確認後の編集可能状態とfocus復帰が、既存dialog契約と要件に適合するか。
- localStorage API例外を`console.error`だけで握りつぶし、復元不能な保存データのdialogと混同していないか。

## 備考

- 親Gate planのG24依存Gateはすべて`done`である。
- `docs/TODO.md`にはG24関連の未チェック項目が2件ある。一方、親Gate planのG16 handoffは全field arrayの`useFieldArray`操作とreset同期を「確定」と記録している。実コードとarchitectureを照合して、G24は既存field array契約に従うだけとする。
- ユーザーの実装開始指示により、`logic/build.ts`に残るmaster ID解決分離はG24の前提ではなく別taskとして維持する。G24はread-only master-data adapterを明示入力にして未知IDを復元境界で扱い、既存`logic/`の責務を変更しない。
- requirementsとarchitectureは、復元不能データをフォームへ部分反映せず、端末内保存も変更せずにエラー表示することを定める。ユーザー指示の「キック」は、このrecordを削除する意味ではなく、フォームへ受け入れず拒否する意味として扱う。
- ユーザー指示により、復元失敗は既存の`CharacterSheetDialog`でtitle / headerを置かず、本文「自動復元に失敗しました。」とvisibleなaction buttonの`確認`だけを表示する。localStorage API例外は`console.error`だけで握りつぶし、dialogを表示しない。
- JSON schema version互換性は`docs/TODO.md`で将来taskへ分離済みであり、このGateではversionを保存・比較・移行しない。現在の形式として構造・型を受理できない値は復元不可として扱う。
- Git commit / push はこのissue作成時点で実行しない。

## ビジュアルレビュー 1

### VRT対象

- design target: `docs/design/character-sheet/notes.md`
- VRT test / tags: `@persistence-restore-error`
- route / states / viewports: `/character-sheet/`、構造不正なlocalStorageによる復元失敗dialog、desktop / tablet / mobile

### レビュー結果

| 対象           | 判定   | 差分                                                                 | 対応                                  |
| -------------- | ------ | -------------------------------------------------------------------- | ------------------------------------- |
| 復元失敗dialog | 未確認 | Chromiumが起動前にsandbox環境エラーで停止し、capture・比較とも未実行 | browser環境回復後にtarget限定で再実行 |

### 対応完了チェックリスト

- [ ] 変更targetだけをVRT比較した（Chromium起動失敗）
- [ ] 変更targetだけの一時snapshotを取得した（Chromium起動失敗）
- [x] current issueの受入条件と最終diffから対象stateを列挙した
- [ ] 宣言したすべてのroute / state / viewportで、局所表示契約ごとの原寸locator screenshotを開いて確認した（Chromium起動失敗）
- [x] full-page screenshotを局所表示契約の確認根拠に使っていない
- [ ] VRT差分を修正した、または修正不要と判断した（比較未実行）
- [ ] baseline更新が必要な差分を人間判断として記録した（比較未実行）
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## レビュー指摘 1

### 指摘事項

1. restore adapterがresolver用form schemaだけを使うため、構造・型の検証、ゲーム上の不整合の保持、現在のmaster ID照合を分離していない。未知IDを除外せず、ドラッグ重複など保存を妨げない局所error状態を復元不能として拒否する。
2. debounce待機中にunmountまたはページ離脱すると、最新入力を同期保存せずにtimeoutを破棄する。
3. 起動時に表示する復元失敗dialogの確認後のfocus先をroot-stateが持たず、明示的な編集可能要素へ戻らない。
4. G24のroot-state結線に必要なrestore、保存抑止、flush、storage例外、画像復元との独立、未知IDのhook testが不足している。

### 判定

- source: browser-draft（`.tmp/chatgpt-review.md`）
- classification: valid
- local validation: `parseCharacterSheetRestoreValue`は`characterSheetFormSchema.safeParse()`だけを実行し、master-data入力・ID除外・関連rowの完全性検証を持たない。既存form schemaはIDを`string | null`として受理する一方、ドラッグ重複をsuperRefineで拒否する。root-state cleanupは保留timeoutをclearするだけで同期writeまたは`pagehide`処理を行わない。restore dialogには`returnFocusRef`が渡されず、G24用hook testは未追加である。

### 対応方針

- persistence専用の構造・identity schemaと、read-only master-dataを明示入力とするshared restore adapterを分離する。局所errorとなるゲーム上の不整合は保持し、未知IDだけを要件どおり空欄化または行除外した後に関連参照と最小行数を検証する。
- pending状態を持つ共通flushをdebounce、effect cleanup、`pagehide`から呼び、書込み例外は`console.error`だけで非停止とする。
- 復元失敗dialogを閉じるときのfocus先をroot-stateで定め、確認buttonとEscapeの両方をbrowser testで固定する。
- fake timerとstorage / image operation test doubleを使うhook testを追加し、上記の復元・保存境界を固定する。

### 対応完了チェックリスト

- [x] 構造・identity・ゲーム上の不整合・master ID照合を分離したrestore adapterを実装する
- [x] 未知IDの除外後にfield array最小行数と関連row IDの完全性を検証する
- [x] debounce中の最新入力をcleanupと`pagehide`でflushする
- [x] 復元失敗dialogの確認・Escape後のfocus先を定める
- [x] G24 root-stateのrestore、保存抑止、flush、storage例外、画像独立のhook testを追加する
- [x] `npm run check` が通る
- [x] `npm run build` が通る
