# ex-02-6-sheet-image

## 最優先のデザイン入力

このGateの画面配置と状態表現の実装入力は、`.tmp/design/character-sheet/`配下の承認済みdesign画像である。実装時はこの画像デザインを遵守する。ユーザーの最新指示は画像デザインを上書きする。

画像デザインを遵守した実装を基準に、ユーザー指示を受けて微調整を行う。design notes、既存source code、実装結果のscreenshot、reviewer出力は画像デザインの代わりに画面配置・導線・状態表現を決めない。画像デザインまたはユーザー指示にない内容を実装都合で補完せず、不明点または競合がある場合はsource codeを変更せずに停止してユーザー判断を求める。

## 目的

`/character-sheet/`で、承認済みのキャラクターシートdesign draftが定めるdesktop、tablet、mobileの基本情報内配置に、キャラクター画像の選択・表示・端末内保存を接続する。

WebPへ変換した画像のbase64エンコード文字列をIndexedDBへ保存するところまでを、このG6で完了する。ユーザーの明示指示に従い、このGateではbranchを作成しない。

## 背景

画像選択の機能実装と、基本情報内での画像入力の可視配置を分離せずに扱ったため、過去のレビュー対応とその対応コードをG6の正本として扱わない。現在のsource codeと未コミット差分は実装候補であり、このissueの設計入力ではない。

このissueは、会話中にユーザーが明示した要件と、既存の承認済みcharacter-sheet design draftの配置契約を、G6だけで新しいsessionから確認できる形へ再構成する。レビュー節、reviewer出力、agentが独自に追加した画像UI案は含めない。

関連する正本:

- `docs/issue/done/ex-02-web-character-sheet.md`
- `docs/issue/ex-02-web-character-sheet/plan.md`
- `docs/requirements/character-sheet.md`
- `docs/architectures/character-sheet.md`
- `docs/design/character-sheet/notes.md`
- `docs/requirements.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`

配置を確認した承認済みdesign draft:

- `.tmp/design/character-sheet/index.html`
- `.tmp/design/character-sheet/desktop.png`
- `.tmp/design/character-sheet/tablet.png`
- `.tmp/design/character-sheet/mobile.png`

## Gate関係

- 親issue: `docs/issue/done/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`
- Gate: `G6: キャラクター画像を扱う`
- 依存Gate: `G4`（基本情報・キャラクター設定）、`G5`（ダイアログの共通基盤）

このissueはG6だけを実装するための自己完結した契約である。G24の画像以外のフォーム値のlocalStorage復元、G26/G27のJSON入出力、G29の全クリアに伴う画像削除は扱わない。

## デザイン配置契約

- desktopでは、基本情報の左カラム内で、プロフィール入力群と`設定`を左、画像入力を右に置く。画像入力はプロフィール入力群と`設定`の高さを跨ぐ。経験点・信用はこのprofile / image行の下に置く。
- tabletでは、site menu railの右にある基本情報内で、desktopと同じprofile / imageの横組みを保つ。画像入力の横幅だけを縮め、プロフィール・画像・信用の関係を崩さない。
- mobileでは、基本情報を1列にする。プロフィール入力、`設定`、画像入力、経験点・信用の順に縦積みする。desktop / tabletの右側画像を縮小して残さない。
- PC名・PL名、二つ名、年齢・性別の既承認のprofile配置を変更しない。画像だけを独立cardや別sectionにしない。
- 未選択画像は、既存draftと同じコンパクトな破線の画像領域、D&Dの案内、容量表示、直下のファイル選択操作で示す。画像選択専用のdialog、確認専用preview、画像編集UIは追加しない。
- 選択済みの画像は同じ画像領域へ表示し、同じ導線から差し替えられる。画像の表示位置と操作の位置をdesktop / tablet / mobileで別々に確認する。
- 実装結果の確認は既存のtarget限定`visual:capture`を使う。個別のPlaywright screenshot commandを実装確認の代替にしない。canonical VRT baselineは更新しない。

## 対象範囲

- `ProfileSection`へ、上記の配置契約に従う画像表示領域、drag and drop、画像領域直下のファイル選択buttonを接続する。
- `image/*`かつ5 MiB（5,242,880 bytes）以下のファイルを、ブラウザでdecodeできた場合だけ処理する。長辺を約500pxまで縮小し、拡大せず、WebP品質`0.8`で1回だけ変換する。
- WebP画像のMIME typeとbase64エンコード文字列を、`neon-underrealm-character-sheet` database、`character-images` store、`current-character-image` keyのIndexedDB recordへ保存する。
- base64文字列と画像recordの参照をRHF、localStorage、URL query、ログ、Git管理ファイルへ混ぜない。画像成功後だけ表示を切り替え、失敗時は既存画像を保持する。
- 初期化時にIndexedDB画像recordを独立して読み、正常なrecordだけを画像表示へ復元する。画像recordがない場合は未選択状態のままにし、読取り・復元失敗時もlocalStorageのキャラクターシート値の復元を停止・失敗させない。全クリアに伴う画像recordの削除やlocalStorageのフォーム値への混在は行わない。
- 形式、容量、decode、変換、IndexedDB書込みの失敗は、G5のdialog shellで通知する。エラー一覧へ積まず、browser native `alert`を使わない。
- 画像の変換・保存中は、キャラクターシートIsland全体を操作不可にする、回転indicatorを持つ汎用loading overlayを表示する。`prefers-reduced-motion`ではindicatorの回転を停止する。
- Root横断のform、dialog、focus ref、loading状態はroot-state custom hookへ置く。Contextは先行導入せず、必要なloading値とcallbackをPresenter hook経由で明示的に渡す。`logic/`はroot stateやContextへ依存させない。
- drag and drop用のUI library、画像変換用library、global CSS、共通Header / Footerへのcharacter-sheet固有分岐を追加しない。

## 初期スコープ外

- 画像以外のフォーム値のlocalStorage自動保存・復元は実装しない（G24）。
- JSON export / importでの画像表現、画像base64文字列のJSONへの出力・入力は実装しない（G26/G27）。
- 全消去時の画像record削除は実装しない（G29）。
- 複数画像、画像編集、トリミング、回転、透明背景検出、JPEGとの容量比較、アップロード、サーバー・DB・クラウド同期・認証を追加しない。
- canonical VRT baselineを追加・更新しない。
- 過去の`レビュー指摘 1`から`レビュー指摘 5`、ならびに`.tmp/review/ex-02-web-character-sheet/`配下のreviewer出力を、実装要件または設計判断として復活させない。会話中にユーザーが明示した要件だけを本issueへ統合済みとする。

## 完了条件

- [x] desktop、tablet、mobileで、承認済みdesign draftどおりのprofile、設定、画像、信用の位置関係を再現する。
- [x] 画像表示領域へのdrag and dropと、その直下のファイル選択buttonから画像を選択できる。
- [x] `image/*`、5 MiB上限、decode可否、長辺約500px・非拡大、WebP品質`0.8`・1回の変換を満たす。
- [x] WebP画像のMIME typeとbase64エンコード文字列を含む画像recordをIndexedDBへ保存し、RHFとlocalStorageには保持しない。
- [x] 起動時にIndexedDB画像recordを復元し、画像recordの不在・失敗がlocalStorageのフォーム値復元を止めない。
- [x] 保存成功後に新画像を表示し、変換またはIndexedDB書込みの失敗時は既存画像を保持したまま失敗dialogを表示する。
- [x] 画像処理中の全画面loading overlay、操作ブロック、reduced motionを満たす。
- [x] 対象viewportの既存`visual:capture`でactualを確認し、canonical VRT baselineを更新していない。
- [x] 必要な既存test、`npm run check`、`npm run build`が通る。

## チェックポイント

- [x] G4のプロフィール・信用入力、G5のdialog、既存`/character-sheet/`のdesktop / tablet / mobile layoutを壊していない。
- [x] 画像入力を、承認済みdraftのprofile / setting / creditとの位置関係から切り離していない。
- [x] GitHub Pagesのサブパス公開と静的ホスティングに影響しない。
- [x] 成功前に既存画像recordを削除・置換せず、失敗時は既存画像を保持する。
- [x] 画像復元とフォーム値のlocalStorage復元を別経路として扱い、片方の失敗で他方を停止させない。
- [x] 実ユーザー画像のbase64文字列をlocalStorage、URL query、ログ、test fixture、Git管理ファイルへ含めていない。
- [x] 不要なdependency、UI library、global CSS、共通layout / Header / Footerへのcharacter-sheet固有分岐を追加していない。
- [x] `docs/TODO.md`の永続スキル参照に関するID変更検出を、このGateへ取り込んでいない。
- [x] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `src/character-sheet/CharacterSheetContainer.tsx`
- `src/character-sheet/components/ProfileSection.tsx`
- `src/character-sheet/components/ProfileSection.module.css`
- `src/character-sheet/components/CharacterSheetLoadingOverlay.tsx`
- `src/character-sheet/components/CharacterSheetLoadingOverlay.module.css`
- `src/character-sheet/useCharacterSheetRootState.ts`
- `src/character-sheet/form/useCharacterImage.ts`
- `src/character-sheet/form/useCharacterSheetFormPresenterProps.ts`
- `src/character-sheet/form/useProfileSectionProps.ts`
- `src/character-sheet/browser/`配下の画像adapter
- `src/character-sheet/persistence/`配下の画像adapter
- `src/character-sheet/dictionary.ts`
- `tests/components/character-sheet/`、`tests/hooks/character-sheet/`、`tests/node/character-sheet/`
- `docs/architectures/character-sheet.md`、`docs/design/character-sheet/notes.md`、`docs/issue/ex-02-web-character-sheet/plan.md`

## レビュー観点

- 既存design draftのdesktop / tablet / mobileの配置を、画像入力だけでなくprofile、設定、信用との関係まで再現しているか。
- ユーザーの直接要件だけをG6の判断材料とし、破棄したreview指摘を再導入していないか。
- 画像base64のIndexedDB保存境界と、RHF / localStorageからの除外が保たれているか。
- 全画面loadingが画像固有の失敗表示ではなく、後続Gateにも再利用できるRoot操作ブロックになっているか。
- actual captureとdesign draftを混同せず、canonical VRT baselineを更新していないか。

## ビジュアルレビュー 1

### VRT対象

- design target: `character-sheet`
- VRT test / tags: `tests/visual/vrt/character-sheet.spec.ts`、`@vrt @character-sheet`
- route / states / viewports: `/character-sheet/`、default、desktop / tablet / mobile（既存targetはultrawideも含む）

### レビュー結果

| 対象                           | 判定       | 差分                                                                                 | 対応                           |
| ------------------------------ | ---------- | ------------------------------------------------------------------------------------ | ------------------------------ |
| desktop / tablet / mobile      | actual確認 | profile / setting / image / creditの位置関係を`.tmp/design/character-sheet/`と照合   | `visual:capture`でactualを確認 |
| canonical VRT baselineとの比較 | 要人間判断 | desktop / tabletは画像領域追加による差分。ultrawide / mobileにはbaselineが存在しない | baselineは更新していない       |

### 対応完了チェックリスト

- [x] 変更targetだけをVRT比較した
- [x] 変更targetだけの一時snapshotを取得した
- [x] VRT差分を修正した、または修正不要と判断した
- [x] baseline更新が必要な差分を人間判断として記録した
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## レビュー指摘 6

### 指摘事項

- 現在IndexedDBへ保存されているキャラクター画像を、このGate内でユーザーがクリアできるようにする。
- `CharacterSheetContainer`にある画像error codeから表示文言を選ぶ多段conditionalを、Containerの責務として残さない。
- Root loading overlayが画像処理専用の状態・文言へ依存しているため、後続GateのRoot操作にも再利用できる設計へ改める。

### 判定

- source: human（ユーザー対話）
- classification: valid
- local validation: 現在のG6実装は画像recordの読取り・書込みだけを持ち、選択済み画像をunsetに戻す操作とIndexedDB key削除adapterを持たない。`CharacterSheetContainer`には画像error codeから文言を選ぶ多段conditionalがあり、Rootの構成とdialogの表示責務を混在させている。`CharacterSheetLoadingOverlay`は画像用dictionaryのloading文言を直接参照し、Rootの操作ロック状態も画像処理名で公開している。
- scope: ユーザーの最新指示により、G29の全クリアとは別に、選択済みキャラクター画像だけをクリアする操作をG6へ追加する。既存の「G29で画像recordを削除する」は全クリア時の削除に限定して後続Gateへ残す。

### 対応方針

- 選択済み画像のときだけ、既存の差し替え導線に続けて`画像をクリア`操作を表示する。画像recordのkeyだけをIndexedDBから削除し、削除成功後に表示を未選択へ切り替える。削除中は既存のRoot loading overlayでIsland全体を操作不可にし、削除失敗時は既存画像を保持してG5の失敗dialogを表示する。RHF、localStorage、URL、JSONへの画像混在は追加しない。
- 画像error dialogを専用のRoot直下表示Componentへ分離し、error codeと辞書の文言対応をそのComponentまたはdictionary側へ閉じ込める。`CharacterSheetContainer`はRoot stateとdialog Componentの構成だけを担い、error文言を選ぶconditionalを持たない。
- loading overlayは画像用dictionaryや画像処理stateを直接参照しない汎用表示Componentとし、表示文言をPropsで受け取る。Rootには画像処理に限定しない単一の操作ロック状態と開始・終了境界を置き、画像の変換・保存・削除はその利用者にする。後続Gateの保存、出力、入力なども、同じoverlay、Island操作ロック、reduced motion表示を共有できるようにする。Contextは導入しない。
- 実装時に、G6 issueとarchitectureの「画像record削除はG29」記述を、上記の個別クリアとG29の全クリアへ区別して更新する。

### 対応完了チェックリスト

- [x] 選択済み画像だけに`画像をクリア`操作を表示し、成功時にIndexedDB recordと表示を未選択へ戻す。
- [x] クリア中はIsland全体を操作不可にし、削除失敗時は既存画像を保持して失敗dialogを表示する。
- [x] `CharacterSheetContainer`から画像error文言選択のconditionalを除き、dialog表示責務を専用Componentへ分離する。
- [x] loading overlayとRoot操作ロックを画像専用から分離し、後続Gateが文言を渡して再利用できる。
- [x] 画像クリアの成功・失敗とerror dialog表示の局所テストを追加または更新する。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## 備考

- このissueの再整理ではsource codeを変更しない。既存の未コミットsource差分は、このissueをユーザーが承認した後に、直接要件とdesign配置契約に照らして採否を判断する。
- `docs/design/character-sheet/notes.md`は、現時点では要件復元とデザイン準備のノートであり、最終layoutの承認ではない。既存の承認済みdraftが持つ配置契約を実装入力として本issueへ明文化した。
