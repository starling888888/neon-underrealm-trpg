# ex-02-27-sheet-json-import

## 最優先のデザイン入力

- 実装時に、対象の`.tmp/design/character-sheet/`配下にある承認済みdesign画像を遵守する。既存の操作ペイン、JSON入力button、確認dialog、通知dialogの実装が同じ目的のdraft画像より優先する。
- ユーザーの最新指示は画像デザインを上書きする。今回、画像エラー通知はvisible title / headerなしで、本文「入力データの画像に誤りがあり表示できませんでした。」と可視の`確認`buttonだけを表示する。
- design notes、既存source code、実装結果のscreenshot、reviewer出力を、画像デザインまたは既存実装UIの代わりに画面配置・導線・状態表現を決める入力として扱わない。不明点または競合がある場合は、source codeを変更せずに停止してユーザー判断を求める。

## 目的

JSON入力を、G26で出力した現行形式とG24のshared restore adapterへ接続する。構造・型として受理できるフォーム値だけを確認後に現在のフォームと端末内保存へ置換し、画像はフォーム値から独立して処理する。画像入力が不正でもフォーム値の復元を妨げず、専用の失敗通知を表示する。

## 背景

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- 親Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md` のG27。依存Gate G5、G24、G25、G26は`done`である。
- 要件正本: `docs/requirements/character-sheet.md` の「保存、復元、出力」。JSON入力は確認後に現在の編集内容と端末内保存を置換し、不正なJSONは現在の状態を変更せず部分復元しない。
- architecture: `docs/architectures/character-sheet.md` の「実装時のアーキテクチャ遵守」「自動保存と復元」「JSON入出力フォーマット」「テストアーキテクチャ」。RHFを唯一の編集stateとし、G24の`reset` / `useFieldArray` / read-only master-data lookupを使うshared restore adapterを再利用する。
- 入出力構造の参照は`docs/architectures/character-sheet-export-import-sample.json`とする。トップレベルはフォーム値と`imageBase64String`で構成し、G26のJSON出力と同じ現行形式だけを扱う。
- design target: `docs/design/character-sheet/notes.md` の操作領域、検証・作業継続・出力。desktopは操作ペイン、tablet / mobileは右下sticky menuの既存`JSON入力`buttonを使う。JSON入力の置換確認、失敗時の編集内容維持、titleなし通知dialogを既存dialog shellへ接続する。
- `docs/TODO.md`の「JSONのスキーマバージョン差異との互換性を担保する」は将来taskのままとし、このGateではversion、旧形式の互換、移行を追加しない。

## Gate関係

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`
- Gate: `G27: JSON入力を扱う`

このissueはG27だけの実装契約である。親会話、過去のGate子issue、temporary review fileを読まなくても、上記の正本と本issueだけで実装を開始できる。

## 実装時のアーキテクチャ遵守

| architecture節             | G27で許可する変更                                                                                                                                                                                             | G27で禁止する変更                                                                                                                     | 確認するテスト層                               |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 実装時のアーキテクチャ遵守 | `CharacterSheetContainer`とroot-stateで、JSON file API、確認・通知dialog、操作ロック、RHF reset、browser / persistence adapterを順序付けて接続する。                                                          | 表示Componentからbrowser API、RHF、localStorage、IndexedDBへ直接アクセスさせない。別Container、Context、編集state storeを追加しない。 | hook、browser behavior                         |
| 状態と派生値の境界         | shared restore adapterが返す受理済み値だけを`reset`または既存`useFieldArray`契約で反映する。                                                                                                                  | 最大Lv超過などゲーム上の不整合をclamp・削除・初期化しない。dialog / loading stateをRHF、JSON、永続化値へ入れない。                    | Node、hook、browser behavior                   |
| データ境界                 | JSONのフォーム値はpersistence / schema、画像はbrowser / image adapterで別々に扱う。読み取り専用master-data lookupをshared restore adapter内だけで使う。                                                       | `logic/`へmaster ID解決、JSON file API、画像base64検証、永続化副作用を混ぜない。画像recordをlocalStorageやRHFへ混在させない。         | Node、hook                                     |
| 自動保存と復元             | 確認後のフォーム置換をG24と同じ復元・自動保存接続へ渡し、画像処理を独立して完了させる。画像初期復元が完了するまでJSON入力を開始可能にしない。                                                                 | localStorageの初回復元・削除・例外通知方式を変更しない。画像検証・IndexedDB失敗でフォーム復元を巻き戻さない。                         | Node、hook、browser behavior                   |
| JSON入出力フォーマット     | 現行のトップレベルフォーム値と`imageBase64String`だけを検証・入力する。`null` / property欠落は画像なしとしてIndexedDB recordを削除し、成功時だけ未選択表示にする。                                            | schema version、旧形式互換、移行、派生値、UI state、master data、画像永続化metadataを追加しない。                                     | Node、hook、browser behavior                   |
| テスト層と配置             | schema / restore / image検証はNode、Container結線はhook、確認・file選択・dialog・focus・responsive操作導線はbrowser behaviorと最小E2Eで確認する。ユーザーレビュー後だけ対象VRTとactual screenshotを確認する。 | VRTでJSON構造、画像decode、状態置換の正しさを代替確認しない。canonical baselineを更新しない。                                         | Node、hook、browser behavior、最小E2E、限定VRT |

## 対象範囲

- 既存の`JSON入力`buttonからファイル選択を開始し、選択したJSONテキストを解析してG26の現行トップレベル形式を検証する。ファイル選択のキャンセルでは何も変更しない。
- JSON構文、必須構造、型、fixed row identity、関連row参照、重複special item categoryなどフォーム復元不能な値は、G24 shared restore adapterと同じ基準で全体を拒否する。現在のフォーム、localStorage、画像recordを変更せず、要件のJSON入力失敗通知を表示する。
- 構造・型として受理できるゲーム上の不整合値、最大Lv超過、重複、固定サイバネ部位不一致はG24と同様に値を保持し、既存の局所errorへ渡す。未知IDの単一選択は空欄化、可変行は除外し、必要な空欄行だけを補う。
- フォーム復元候補が有効な場合だけ、現在の編集内容と端末内保存を置き換える確認dialogを表示する。`キャンセル`とEscapeでは、フォーム、localStorage、画像recordを変更しない。確認後はG24と同じ一括`reset`と自動保存の接続でフォームを反映する。
- JSONのトップレベル`imageBase64String`は、フォーム復元schemaから独立して取り出す。値が`null`または`undefined`なら画像エラーにはせず、画像なしとしてG24のrecord不在と同じ未選択状態へ反映する。確認後に既存のIndexedDB image recordを削除し、削除成功時だけ表示を未選択へ切り替える。
- `imageBase64String`が`null` / `undefined`以外なら、`String(value)`で文字列化した後、WebPのbase64文字列として画像専用に検証する。数値・objectを含む任意の非null値が不正でもフォーム候補の受理・確認・復元を妨げない。
- 画像文字列が正しい場合は、G6のIndexedDB image adapterを通して画像を復元する。画像が不正な場合も、JSON importの置換対象として先に既存のIndexedDB image recordを削除し、visible title / headerなしの既存dialogで「入力データの画像に誤りがあり表示できませんでした。」と`確認`だけを表示する。フォーム復元後も編集を続行できる。
- `null` / `undefined`からの画像record削除、不正画像時の画像record削除、または正しい画像のIndexedDB書込みが技術的に失敗した場合も、フォーム復元を巻き戻さない。画像表示は削除または書込みの成功時だけ切り替える。`null` / `undefined`自体を入力データの画像エラーとして通知しない。
- 既存の操作ロック、loading、dialogのEscape・可視dismiss・focus復帰、desktop操作ペインとtablet / mobile menuのresponsive配置を維持する。JSON入力が表示する確認・失敗・画像失敗のdialog stateはRHF、localStorage、JSONへ含めない。
- 現行形式のJSON入力と画像処理のNode / hook / browser behaviorテスト、および変更stateを含む最小限のE2Eを追加・更新する。UI変更のため、ユーザーレビュー完了後にだけG27の対象state・desktop / tablet / mobileへ限定したVRTとactual screenshot確認を行い、canonical VRT baselineは更新しない。

## 初期スコープ外

- JSON schema version、旧形式互換、移行、複数ファイルの一括入力、クラウド保存、共有、サーバー処理を追加しない。
- G24のlocalStorage保存・復元契約、G6の通常の画像選択・変換・容量制限、G25のerror summary、G28のCCFOLIA出力、G29の全消去を変更しない。
- 画像が不正なとき、フォーム値の復元を取り消す、部分的に巻き戻す、またはJSONファイルを書き換える処理を追加しない。
- ブラウザ組み込みの`alert` / `confirm`、別の編集state store、不要な依存ライブラリ、canonical VRT baseline更新を追加しない。

## 完了条件

- [ ] G26の現行JSON形式をファイルから読み、構造・型として有効なフォーム値だけを確認後に一括復元できる。
- [ ] 不正JSON、復元不能な構造・identity、関連row参照、重複categoryでは、フォーム、localStorage、画像recordを変更せず、既存のJSON入力失敗通知を表示する。
- [ ] 確認dialogのキャンセルとEscapeでは現在のフォーム・端末内保存・画像を維持し、確認時だけフォームと端末内保存を置換する。
- [ ] `imageBase64String`が`null`または`undefined`ならエラーにせず、画像なしをG24のrecord不在と同じ未選択状態として反映する。
- [ ] `null`または`undefined`の確認後はIndexedDB image recordを削除し、削除成功時だけ画像を未選択へ切り替える。次回マウント時に削除前の画像を再表示しない。
- [ ] `imageBase64String`が非nullなら必ず`String`変換後にWebP base64として独立検証し、正しい画像だけをIndexedDB経由で復元する。
- [ ] 不正な画像文字列、数値、objectなどはフォーム値の復元を妨げず、既存のIndexedDB image recordを削除したうえで、title / headerなしの画像エラーdialog本文「入力データの画像に誤りがあり表示できませんでした。」と`確認`だけを表示する。
- [ ] G24のunknown ID除外、最小行補完、row identity、`useFieldArray`、uncontrolled inputの`reset`同期、ゲーム上の不整合値の局所error表示をJSON入力でも維持する。
- [ ] JSON入力の確認・失敗・画像失敗のdialogが、Escape、visible dismiss、操作元へのfocus復帰、操作ロックを既存dialog契約どおり維持する。
- [ ] 画像初期復元中はJSON入力を開始できず、初期読込みがJSON入力後の画像状態を上書きしない。`null`削除失敗、不正画像時の削除失敗、正しい画像の書込み失敗のいずれもフォーム復元を維持する。
- [ ] 関連TODOを確認し、schema version互換性をこのGateへ混在させない理由を記録する。
- [ ] 対象のNode / hook / browser behavior testと、必要な最小E2Eが通る。
- [ ] ユーザーレビュー後に対象VRTのactual screenshotをdesktop / tablet / mobileで開いて確認し、canonical VRT baselineを更新していない。
- [ ] `npm run check` と `npm run build` が通る。

## チェックポイント

- [ ] `CharacterSheetContainer`だけがRHF、browser file API、画像adapter、dialog / loading stateの結線を担い、表示Componentがbrowser APIや保存処理へ直接アクセスしない。
- [ ] JSON入力はshared restore adapterを再利用し、localStorage固有の読取り・削除や初回自動復元の副作用を持ち込まない。
- [ ] フォーム復元と画像検証・復元の失敗境界が独立し、画像不正をフォーム復元失敗として扱わない。
- [ ] 既存route、GitHub Pagesのsubpath公開、G6画像復元、G24自動保存、G25 error summary、G26 JSON出力を壊さない。
- [ ] 不要な依存関係を追加せず、初期スコープ外の機能を実装しない。
- [ ] `docs/design/character-sheet/notes.md`のdesktop / tablet / mobile操作領域とdialog契約を維持する。
- [ ] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `src/character-sheet/CharacterSheetContainer.tsx`
- `src/character-sheet/useCharacterSheetRootState.ts`
- `src/character-sheet/persistence/character-sheet-form.ts`
- `src/character-sheet/schemas/character-sheet-persistence.ts` またはJSON入力専用schema
- `src/character-sheet/persistence/character-image.ts` と画像base64検証を置く既存または最小限のbrowser / schema module
- `src/character-sheet/components/CharacterSheetActionPane.tsx`、responsive action menu、既存dialogを組み立てる最小限のComponent / dictionary
- `tests/node/character-sheet/persistence/`、`tests/node/character-sheet/browser/`、`tests/hooks/character-sheet/`、`tests/visual/character-sheet.spec.ts`、`tests/visual/vrt/character-sheet.spec.ts` の必要最小限

実際の変更は、既存moduleの責務と上記architecture節を確認して最小限に絞る。新規依存は追加しない。

## レビュー観点

- 画像をトップレベルから先に独立抽出し、フォームschemaに画像の不正値を混ぜず、`null` / `undefined`と非null値の扱いがユーザー指定どおりか。
- 不正画像でも正常なフォーム値を復元する一方、構造不正なフォーム値では一切置換しない、失敗境界が明確か。
- `String(value)`後のWebP base64検証と、不正時の既存画像削除・titleなし通知の組み合わせが、JSON importの置換契約と整合するか。
- JSON入力の確認、失敗通知、画像失敗通知がdesktop / tablet / mobileの既存操作導線・dialog focus契約に収まり、schema version対応などへscopeが広がっていないか。
- VRTはユーザーレビュー後の変更targetだけに限定し、baseline更新を行わない計画でよいか。

## 備考

- branchはユーザー指定により新規作成しない。現在branch `ex-02-web-character-sheet`上でこのGate子issueを準備する。
- `imageBase64String`はG26が出力する`null`またはbase64文字列に加え、手編集JSONの`undefined`相当（property欠落）をエラーにしない。確認後はproperty欠落も`null`と同様に既存image recordを削除する。JSONとして表現できるobjectやnumberは、JSON parserを経由して取得できる非null値として`String`変換して画像専用検証する。
- JSON parserで表現できるobjectやnumberの`imageBase64String`は、フォーム値の成否と切り離して画像不正として通知する。不正画像もJSON importの画像置換対象なので、既存image recordを削除する。画像復元・削除・検証の例外も同じくフォーム値の復元を巻き戻さない。
- JSON schema versionの将来互換は`docs/TODO.md`に残し、現行形式として処理できないフォーム値は要件どおり一律エラーにする。
