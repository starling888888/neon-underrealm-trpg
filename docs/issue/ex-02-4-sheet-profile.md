# ex-02-4-sheet-profile

## 目的

Webキャラクターシートの`profile` slotに、PC名・PL名・二つ名・年齢・性別の独立した自由入力、開閉式のキャラクター設定、信用の編集値と派生値表示を追加する。文字列の空欄と信用入力の整数制約を両立し、後続Gateが同じRHF formを拡張できる最小の編集値境界を定める。

## 背景

親Gate planのG4は、G1〜G3で用意したReact Island、2列layout、section frameを前提に、基本情報・キャラクター設定・信用を扱うGateである。`docs/requirements/character-sheet.md`はPC名などの自由入力、設定の改行保持と初期非表示、信用の入力・派生値・表示位置を定めている。

入力値の型は`null`を許容せず、文字列入力のdefault valueは空文字列（`""`）とする。PC名・PL名・二つ名・年齢・性別とキャラクター設定は空欄を許可する。取得信用、融通した信用、融通された信用は`0`以上の整数だけを受け付け、小銭修正は負数を許可する整数とする。取得信用は`10`、融通した信用・融通された信用・小銭修正は`0`をdefault valueとし、信用の4入力が空欄になる操作では`0`へ戻す。数値入力は右揃えとする。

関連する要件・設計は以下を参照する。

- `docs/requirements/character-sheet.md`
- `docs/architectures/character-sheet.md`
- `docs/design/character-sheet/notes.md`
- `docs/out-of-scope.md`
- `docs/plan.md`

`docs/TODO.md`にG4の範囲を直接扱う項目はない。JSON schema version互換性、クラウド等の永続保存、ルール文言整理はこのGateで扱わない。

## Gate関係

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`
- Gate: `G4: 基本情報、キャラクター設定、信用`

G1、G2、G3が完了済みである。G4はこのissueだけで実装でき、G5のdialog共通基盤、G6の画像、G7の流儀・生き様・能力値・経験点、G17以降のアイテムは前提にしない。

## 対象範囲

- `profile` slotへ、PC名、PL名、二つ名、年齢、性別を、それぞれ独立した1行の自由入力として表示する。
- 基本情報内のプロフィール入力群の直下に、初期状態で閉じた`設定`操作と、改行を保持するプレーンテキスト入力を追加する。設定の開閉状態はRHF値・保存・JSONの対象に含めない。
- 信用は、取得信用、融通した、融通された、合計信用、消費信用、小銭修正、小銭の順に表示する。取得信用、融通した信用、融通された信用は`0`以上の整数、小銭修正は負数を許可する整数として編集できる。合計信用、消費信用、小銭は読み取り専用である。取得信用は`10`、融通した信用・融通された信用・小銭修正は`0`をdefault valueとし、信用の4入力が空欄になる操作では`0`へ戻す。G4時点の消費信用は後続のアイテム入力がないため`0`として表示し、合計信用と小銭は要件の式で算出する。
- G4で追加するform value、default value、Component props、算出入力へ`null`を持ち込まない。文字列は`""`をdefaultにして空欄を許可し、信用の4入力は`number`のまま扱う。
- `CharacterSheetContainer`のRHF default valuesと型、RHF adapterであるcustom hook、profile用Presenter / CSS Module、既存form shellのslot接続を必要範囲で追加する。form値は`profile`と`credit`の意味単位でobjectにまとめ、RHFを唯一の編集stateとし、別storeへ複製しない。Presenter以下のComponentはRHFや派生算出へ依存せず、必要な表示値と操作callbackをPropsで受け取る。Component内のstateは設定の開閉など閉じたUI状態に限定する。
- 取得信用・融通した信用・融通された信用の`0`以上制約、小銭修正の負数、信用欄の空欄操作が`0`へ戻ること、合計信用と小銭の派生式、設定の改行と開閉をNode testおよびユーザー観測可能なbrowser behaviorで確認する。
- desktop、tablet、mobileで基本情報が横overflowせず、labelと入力の対応、数値入力の右揃え、開閉操作、visible focusを保つ。UI変更後のPRレビュー直前に、G4で確定したVRT targetだけを比較する。

## 初期スコープ外

- キャラクター画像の選択・変換・保存・失敗dialogを実装しない（G6）。
- 取得経験点、流儀、生き様、能力値、経験点の派生値・検証を実装しない（G7以降）。
- アイテム選択、消費信用の集計、信用超過エラー表示を実装しない（G17以降およびG25）。G4では消費信用を`0`の読み取り専用値として扱う。
- ブラウザ内保存・復元、JSON import/export、schema version、全消去、CCFOLIA出力を実装しない。
- 認証、サーバー・DB・クラウド保存、共有URL、PDF出力、作成ウィザード、ルールエンジンを実装しない。
- React Component / Hook専用test runner、状態管理ライブラリ、その他の新規依存を追加しない。
- canonical VRT baselineを更新しない。更新が必要な場合は別途ユーザー承認を得る。

## 完了条件

- [x] G4向けのdesign intentとVRT参照情報を`docs/design/character-sheet/notes.md`へ記録し、ユーザー承認を受けている。
- [x] PC名、PL名、二つ名、年齢、性別を、それぞれ独立した自由入力として空欄のまま編集できる。
- [x] `設定`は初期状態で閉じ、操作で改行を保持するプレーンテキスト入力を表示・非表示できる。
- [x] G4の全form valueは`null`非許容であり、文字列のdefault valueは`""`、取得信用のdefault valueは`10`、融通した信用・融通された信用・小銭修正のdefault valueは`0`である。
- [x] 取得信用、融通した信用、融通された信用は`0`以上の整数だけを受け付け、小銭修正は負数を許可する整数として編集できる。
- [x] 信用を、取得信用、融通した、融通された、合計信用、消費信用、小銭修正、小銭の順に表示する。信用の4入力が空欄になる操作では`0`へ戻り、合計信用と小銭をその値で表示する。数値入力を右揃えで表示する。
- [x] G4時点の消費信用は`0`と表示し、アイテム由来の集計や信用超過エラーを先行実装していない。
- [ ] Node testとPlaywrightで、取得信用の初期値`10`、信用の`0`以上制約、空欄操作後の`0`、小銭修正の負数、合計信用と小銭の派生表示、数値入力の右揃え、設定の改行・開閉、label / keyboard操作を確認している。
- [ ] design targetとVRT baselineの扱いを記録し、PRレビュー直前にG4で確定したtargetだけをVisual Reviewする。
- [x] 不要な依存を追加せず、`npm run check` と `npm run build` が通る。

## チェックポイント

- [x] 既存ルートとG0〜G3のlayout・section frame操作を壊していない。
- [x] GitHub Pagesのサブパス公開に影響しない。
- [x] `react-hook-form`を唯一の編集stateとして維持し、値を`null`で初期化または更新していない。
- [x] 文字列の空欄を`null`へ置換せず、信用の4入力だけは空欄になる操作を`0`へ正規化している。
- [x] 数値入力を右揃えにし、数値に見合う短い幅を維持している。
- [x] `docs/requirements/character-sheet.md`、`docs/design/character-sheet/notes.md`、`docs/TODO.md`と矛盾していない。
- [x] 初期スコープ外の画像、dialog、保存、JSON、アイテム、作成ウィザードを混ぜていない。
- [x] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `src/character-sheet/CharacterSheetContainer.tsx`
- `src/character-sheet/components/CharacterSheetFormPresenter.tsx`
- `src/character-sheet/components/CharacterSheetFormPresenter.module.css`
- `src/character-sheet/components/`配下のprofile用ComponentとCSS Module
- `src/character-sheet/`配下のG4で必要なform value型・純粋な信用算出logic
- `tests/node/character-sheet/`配下のG4の入力値・信用算出test
- `tests/visual/character-sheet.spec.ts`
- `tests/visual/vrt/character-sheet.spec.ts`（G4のVRT targetを確定する場合のみ）

## レビュー観点

- G4を基本情報、設定、信用に限定し、画像、経験点、アイテム、保存・出力を後続Gateへ残せているか。
- PC名、PL名、二つ名、年齢、性別を独立した自由入力とし、文字列入力は空欄を許可して`null`ではなく`""`で初期化できるか。信用の4入力は`null`も空欄も保持せず`number`として扱え、取得・融通した・融通された信用の`0`以上制約と、小銭修正の負数許可を満たすか確認したい。
- 信用の入力・派生値を基本情報内で取得経験点の近傍へ置くdesign方向、設定の初期非表示と操作の表現、desktop / tablet / mobileのVRT状態を`design-image-generation`で先に確定すべきか。
- G4時点の消費信用を`0`として表示し、後続Gateのアイテム集計とエラーを先行実装しない境界が妥当か。
- 既存のNode / Playwright testだけでG4の空欄値とユーザー操作を十分に確認でき、新しいテスト用依存が不要か。

## 備考

現在の`docs/design/character-sheet/notes.md`には、G4の入力配置・信用の初期値・VRT stateの具体的なdesign intentがない。実装前に`design-image-generation`を実行し、G4に限定したdesktop、tablet、mobileの表示方針とVRT比較対象を記録してユーザー承認を得る必要がある。

このissueの`null`非許容方針はG4で追加する入力値の契約である。後続Gateが同じformを拡張するときも、G4既存フィールドを`null`許容へ後退させない。
