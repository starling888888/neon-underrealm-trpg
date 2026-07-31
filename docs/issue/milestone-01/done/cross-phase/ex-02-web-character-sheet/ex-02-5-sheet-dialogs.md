# ex-02-5-sheet-dialogs

> 履歴注記: このissueは、当時の実装・design・仕様を基準に完了済みとする。以後のdesignまたは仕様変更には追従せず、変更が必要な場合は後続issueで扱う。

## 目的

後続Gateで使うキャラクターシート固有のダイアログ共通基盤を整備する。確認、通知、エラー、ヘルプ、候補選択の各ダイアログが、同じmodal・アクセシビリティ・閉じる操作の契約を共有しつつ、用途固有の構造と見た目を個別に定義できる状態にする。

## 背景

親issueのG5は、G1、G2、G3で整備済みのReact Island、responsive layout、section frameを前提として、ダイアログの横断基盤を担当する。共通基盤を実際に確認できるよう、G5では明示的なダミーの確認dialog openerを1つ追加する。各機能の実装は後続Gateに残し、このGateではJSON入出力、全消去、画像、CCFOLIA、候補選択の業務処理や本来の操作buttonを追加しない。

関連する要件・正本:

- `docs/requirements/character-sheet.md` の確認・通知ダイアログ、`alert`不使用、ヘルプの要件
- `docs/architectures/character-sheet.md` のContainerがdialogの開閉・選択対象を持ち、表示Componentはpropsとcallbackだけを受け取る境界
- `docs/design/character-sheet/notes.md` の「ダイアログ」、選択UI、レスポンシブと操作の制約
- `docs/out-of-scope.md` のWebキャラクターシート初期範囲外
- `docs/TODO.md` の既存Node testのVitest移行、およびPresenter propsのmemo化は本Gateの対象外として残す

現行design notesには、確認・通知・エラー・ヘルプの視覚的な方向と一部文言がある一方、全ダイアログ共通のdismiss操作、focus処理、Clipboard API失敗時の扱いが未決定である。非機能要件はdialogのアクセシビリティをdesignで定義するよう求めているため、実装前に`design-image-generation`でG5のdesign intentとVRT参照方針を補完し、ユーザー承認を得る。

## Gate関係

- 親issue: `docs/issue/milestone-01/done/cross-phase/ex-02-web-character-sheet/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/milestone-01/done/cross-phase/ex-02-web-character-sheet/plan.md`
- Gate: `G5: ダイアログの共通基盤を整備する`

G5の依存GateであるG1、G2、G3は完了済みである。後続のG6、G23、G27〜G30などは、このissueで確定する共通Componentの公開propsと利用契約に従って個別のdialogを接続する。

## 対象範囲

- 実装前に、`design-image-generation`で`docs/design/character-sheet/notes.md`へ以下を記録し、ユーザー承認を得る。
  - 通知、確認、エラー、ヘルプ、候補選択に共通するmodal構造、見出し・本文・actionの優先順位、desktop / tablet / mobileでの幅・最大高・scroll領域
  - 閉じる`×`、キャンセル、Escape、dialog外側click、確認actionの扱い
  - 開いた直後のfocus、modal内のkeyboard focus、閉じた後の操作元へのfocus復帰、支援技術へ伝えるrole・label・description
  - G5単体でcanonical VRTを追加・更新しないこと、後続Gateで実際のdialog stateを追加する際のVRT state / comparison point
- 承認済みdesignに従い、`src/character-sheet/components/dialogs/`へ制御式の共通dialog shell、header / content / actionsの合成部品、CSS Moduleを追加する。shellは`variant`で全用途の構造・配色を切り替えず、各dialogの固有構造と配色は後続Gateの専用Componentまたは専用内容に委ねる。
- 共通shellのpropsを、開閉状態、accessible name、任意のdescription、初期focus、閉じる要求、操作元へのfocus復帰に必要な情報だけに限定する。開閉状態、選択対象、業務上の確定・取消の判断は呼出し側の`CharacterSheetContainer`に残す。
- `CharacterSheetContainer`のroot直下に、確認dialogだけを開く可視のダミーbuttonを置く。buttonのlabel、配置、dialogの見出し・本文・actionは承認済みdesignに従う。確認・取消のどちらもdialogを閉じるだけとし、RHF値、保存、画像、JSON、Clipboardなどの業務状態を変更しない。
- このダミーbuttonはtest専用の非表示DOMや内部stateではなく、G5の共通dialogを確認する一時的な画面上の導線とする。G23以降で実際の操作buttonを接続するときに置換または削除し、最終公開UIへ残さない。
- Component testで、表示・非表示、accessible name / modal semantics、設計で確定した閉じる操作、focus復帰、確認・取消callbackをユーザー観測可能な契約として確認する。
- 後続Gateが利用できる共通Componentの責務と、未実装の各dialog固有内容をissueの備考へ明記する。

## 初期スコープ外

- JSON export / import、全消去、CCFOLIAコピー、画像選択・変換、保存・復元、エラー集約、ヘルプ本文、候補データ・候補選択を実装しない。
- 操作ペイン、tablet / mobileのsticky操作メニュー、個別の操作buttonを実装しない（G23以降）。ただし、G5の共通dialogを確認する可視のダミー確認button 1つは対象範囲に含める。
- dialogの業務状態をPresenterやleaf Componentへ持ち込まない。RHFのform値、保存値、JSONへdialogの開閉状態を含めない。
- browser組み込みの`alert` / `confirm`を採用しない。
- UI library、状態管理library、dialog専用dependencyを追加しない。既存のReact、CSS Modules、Component test基盤で満たせない必要性が判明した場合は、実装を止めてissueを更新しユーザーへ判断を求める。
- canonical VRT baselineを更新しない。VRTの実行・更新は、実際のdialog状態を接続する後続GateのPRレビュー直前に限定する。
- 認証、サーバー・DB・クラウド保存、共有URL、PDF出力、作成ウィザード、ルールエンジンなど`docs/out-of-scope.md`の項目を追加しない。

## 完了条件

- [x] `design-image-generation`でG5に必要なdialog共通のdesign intent、アクセシビリティ、VRT参照方針を`docs/design/character-sheet/notes.md`へ記録し、ユーザー承認を受けている。
- [x] 確認、通知、エラー、ヘルプ、候補選択が利用できる、制御式の共通dialog shellとheader / content / actionsの合成部品を追加している。shellは全用途を`variant`で表さず、各用途の業務処理、固有構造、固有配色と、G5のダミー確認button以外の個別の呼出しUIは追加していない。
- [x] dialogの開閉・選択対象は`CharacterSheetContainer`が所有でき、Presenter以下の表示Componentはpropsとcallbackだけで利用できる。
- [x] designで確定したrole、accessible name、必要な場合だけのdescription、Escape、各dialogの可視の閉じる操作、focus処理、操作元へのfocus復帰を満たしている。
- [x] 可視のダミー確認buttonから確認dialogを開け、確認・取消のどちらもdialogを閉じるだけで、フォーム値・保存・ブラウザAPIの副作用を起こさない。
- [x] ダミーbuttonをG23以降の実操作buttonへ置換または削除する引継ぎを記録している。
- [x] `alert` / `confirm`を追加しておらず、dialog開閉状態をRHF、保存、JSONへ含めていない。
- [x] Component testで、見出しを持つ確認dialogと`aria-label`だけを持つ通知dialogの表示、閉じる操作、確認・取消callback、focusのユーザー観測可能な契約を確認している。
- [x] G5単体でcanonical VRT baselineを追加・更新せず、ダミー確認dialogのdesktop / tablet / mobileでの表示、横overflow、dialog内scrollをbrowser behaviorで確認している。
- [x] PRレビュー直前に、G5のcharacter-sheet targetだけをVisual Reviewする。canonical baselineを更新する場合は別途ユーザー承認を得る。
- [x] `npm run check` と `npm run build` が通る。

## チェックポイント

- [x] 既存の`/character-sheet/` route、G0〜G4のlayout、profile入力、section frame操作を壊していない。
- [x] GitHub Pagesのサブパス公開に影響しない。
- [x] ダミーbuttonと確認dialogをdesktop、tablet、mobileで開け、ページ全体の横overflowを生じさせず、designで定めたdialog内scrollだけを許容している。
- [x] ダミーbuttonをtest専用の隠しUIや内部実装の観測手段にせず、G23以降で実操作buttonへ置換または削除する範囲に限定している。
- [x] 不要な依存関係、global CSS、サイト共通Header / Footer / layoutへのcharacter-sheet固有分岐を追加していない。
- [x] `docs/requirements/character-sheet.md`、`docs/architectures/character-sheet.md`、`docs/design/character-sheet/notes.md`、`docs/TODO.md`と矛盾していない。
- [x] 既存Node testのVitest移行とPresenter propsのmemo化を、このGateへ取り込んでいない。
- [x] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `docs/design/character-sheet/notes.md`（明示的に`design-image-generation`を実行して承認された場合だけ）
- `src/character-sheet/components/dialogs/`配下の共通dialog ComponentとCSS Module
- `src/character-sheet/CharacterSheetContainer.tsx`（共通基盤のroot接続とダミー確認button）
- `tests/components/character-sheet/`配下のdialog Component test
- `tests/visual/character-sheet.spec.ts`（ダミー確認dialogの最小browser behavior）
- `tests/visual/vrt/character-sheet.spec.ts`（G5のdialog stateを比較対象として定義する場合だけ。canonical baselineは更新しない）

## レビュー観点

- G5を共通dialogの表示・アクセシビリティ契約だけに限定し、後続Gateの業務処理や操作ペインを混ぜていないか。
- design notesの未決定事項を`design-image-generation`で先に確定する前提、特にdismiss、focus、focus復帰、dialog外側click、VRT stateの扱いが適切か。
- 共通Componentを制御式にしてContainerが横断状態を所有する境界が、architectureと後続Gateでの再利用に適合するか。
- dialog専用dependencyを追加せずに必要なアクセシビリティを満たせる見通しが妥当か。満たせない場合は実装を止めて判断を求める境界でよいか。
- G5のダミー確認buttonを、共通dialogの確認に必要な最小の可視導線として扱い、確認・取消では業務状態を変えず、G23以降で置換または削除する方針が妥当か。
- ダミー確認dialogのbrowser behaviorと、PRレビュー直前に限定するVisual Reviewでresponsive・横overflow・dialog内scrollを確認する方針が妥当か。

## 備考

このissueはG5の実装契約である。実装開始前に、design notesの不足を`design-image-generation`で補い、ユーザー承認を得る必要がある。ダミー確認buttonはG5で共通dialogの表示・操作を確認するためだけの可視導線であり、確認・取消のいずれも副作用を持たない。G23以降で実際の操作buttonを追加するときに、このbuttonを置換または削除する。現行notesで文言まで確定しているのは、CCFOLIAコピー成功、初期化確認、エラー確認、ヘルプの一部であり、これらの個別dialog内容・trigger・副作用はG6、G23、G27〜G30などの後続Gateで接続する。確認とエラーは専用Component候補であり、ヘルプと候補選択はrich contentを持つ専用Componentまたはshellの合成で扱う。全用途へ一律のtitle / description / `×`を強制しない。

G5完了後は、後続Gateへ必要な公開props、アクセシビリティ契約、VRTの扱いだけを親Gate planのG5行へ引き継ぐ。実装経緯や一時的なreview記録は親planへ戻さない。
