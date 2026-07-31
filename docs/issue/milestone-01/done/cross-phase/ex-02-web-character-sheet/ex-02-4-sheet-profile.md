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
- `docs/issue/milestone-01/plan.md`

`docs/TODO.md`にG4の範囲を直接扱う項目はない。JSON schema version互換性、クラウド等の永続保存、ルール文言整理はこのGateで扱わない。

## Gate関係

- 親issue: `docs/issue/milestone-01/done/cross-phase/ex-02-web-character-sheet/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/milestone-01/done/cross-phase/ex-02-web-character-sheet/plan.md`
- Gate: `G4: 基本情報、キャラクター設定、信用`

G1、G2、G3が完了済みである。G4はこのissueだけで実装でき、G5のdialog共通基盤、G6の画像、G7の流儀・生き様・能力値・経験点、G17以降のアイテムは前提にしない。

## 対象範囲

- `profile` slotはdesign draftに合わせてsurface・border・radius、mutedなタイトル領域、分割線を持つ基本情報カードとして表示する。カードは`CharacterSheetSectionFrame`の`expandable`を省略した非折りたたみ表示を使い、title要素は`span`または`h1`〜`h6`を指定できる。PC名・PL名は1行目の左右半分、2行目は二つ名を左半分、年齢・性別を右半分の内側で並べ、それぞれ独立した1行の自由入力として表示する。G4では後続Gateのキャラクター画像・経験点を先行表示しない。
- 基本情報内のプロフィール入力群の直下に、初期状態で閉じた`設定`操作と、改行を保持するプレーンテキスト入力を追加する。設定の開閉状態はRHF値・保存・JSONの対象に含めない。
- 信用は、取得信用、融通した、融通された、合計信用、消費信用、小銭修正、小銭の順に、基本情報カード内の7セルgridで表示する。取得信用、融通した信用、融通された信用は`0`以上の整数、小銭修正は負数を許可する整数として編集できる。合計信用、消費信用、小銭は読み取り専用の表示値であり、input要素を追加しない。取得信用は`10`、融通した信用・融通された信用・小銭修正は`0`をdefault valueとし、信用の4入力が空欄になる操作では`0`へ戻す。G4時点の消費信用は後続のアイテム入力がないため`0`として表示し、合計信用と小銭は要件の式で算出する。読み取り専用の3値は、子要素をトリガーにする`FormulaTooltip`で計算式を必要時だけ表示し、タップ端末ではタップで開き、コンポーネント外のタップで閉じる。
- G4で追加するform value、default value、Component props、算出入力へ`null`を持ち込まない。文字列は`""`をdefaultにして空欄を許可し、信用の4入力は`number`のまま扱う。
- `CharacterSheetContainer`のRHF default valuesと型、RHF adapterであるcustom hook、profile用Presenter / CSS Module、既存form shellのslot接続を必要範囲で追加する。form値は`profile`と`credit`の意味単位でobjectにまとめ、RHFを唯一の編集stateとし、別storeへ複製しない。Presenter以下のComponentはRHFや派生算出へ依存せず、必要な表示値と操作callbackをPropsで受け取る。Component内のstateは設定の開閉など閉じたUI状態に限定する。
- 取得信用・融通した信用・融通された信用の`0`以上制約、小銭修正の負数、信用欄の空欄操作が`0`へ戻ること、合計信用と小銭の派生式、設定の改行と開閉をNode testおよびユーザー観測可能なbrowser behaviorで確認する。
- desktop、tablet、mobileで基本情報が横overflowせず、labelと入力の対応、数値入力の右揃え、開閉操作、visible focusを保つ。UI変更後のPRレビュー直前に、G4で確定したVRT targetだけを比較する。

## レビュー指摘 1

### 指摘事項

1. G4のPlaywright testが信用入力の正規化、計算値、右揃え、read-only要素という仕様・実装詳細をまとめて確認しており、最終smokeとしてのE2E境界を越えている。ユーザーがテストを変更しないよう明示した後にも、test fileを変更・実行した。
2. `CharacterSheetFormValues`のruntime validation schemaがなく、HTML number constraintと`normalizeCreditInput`が信用の制約・空欄の扱いを持っている。既存Zodを使うarchitectureのschema境界が未実装である。
3. Container / PresenterとRHF adapter hookを分けた検証境界を使うため、Component / hook test toolingを選定していない。E2Eを増やさず、Presenter propsとRHF adapter hookの振る舞いを小さい単位で検証する手段が必要である。

### 判定

- source: human / `.tmp/review/ex-02-4-sheet-profile/current-feedback.md`
- classification: valid
- local validation: `tests/visual/character-sheet.spec.ts`のG4信用testは、4つの入力・空欄・負値・派生式・CSS・`readonly`属性を確認しており、`docs/architectures/character-sheet.md`の「E2Eへドメイン計算の全組合せや内部実装を置かない」契約と矛盾する。`CharacterSheetContainer`はresolverなしの`useForm`を使い、`src/character-sheet/schemas/`に現在のform値を検証するschemaはない。`zod`は既存依存であり、architectureはschemaとNode testの境界を定めている。Component / Hook専用test runnerはarchitectureとcurrent issueで未採用としているため、追加はユーザー承認後の明示的なdependency選定が必要である。

### 対応方針

- G4 E2Eを、領域表示と2〜3個の代表的なユーザー操作だけを確認する最終smokeへ縮小する。入力制約・計算式・DOM属性の網羅は置かない。
- `schemas/`に現在のcharacter sheet form用Zod schemaを置き、`null`非許容、信用の整数・範囲、空欄を`0`へ戻す入力境界を正本化する。純粋logicとschemaの境界値はNode testで確認する。
- Component / hook test toolingは、`vitest`、`jsdom`、`@testing-library/react`、`@testing-library/user-event`、`@vitejs/plugin-react`をdev dependencyとして採用する。既存Node / Playwrightとの役割、RHF adapter hookの検証方法をこのsectionへ明記し、PresenterをRHFなしのprops test、adapter hookをRHF接続testとして検証する。
- `@hookform/resolvers`をruntime dependencyとして採用し、Zod schemaを`zodResolver`経由でRHFへ接続する。
- このreview sectionの承認までは、source codeとtest fileを変更しない。

### テスト修正・削除・追加計画

1. E2Eを削除・縮小する。
   - `tests/visual/character-sheet.spec.ts`の`normalizes editable credit and presents derived values`を削除する。信用4入力の空欄・負値・整数化、派生式、right align、`readonly`属性の確認をE2Eから除く。
   - `edits profile fields and toggles the multiline setting`は、基本情報領域が表示されること、PC名の代表自由入力、設定の開閉と複数行入力だけを確認するsmokeへ縮小する。
   - 取得信用の代表数値入力を1操作だけ追加または上記smokeへ含める。値の制約・派生値・すべての信用入力をE2Eで確認しない。
   - FormulaTooltipの計算式、tap外側dismiss、DOM属性をE2Eへ追加しない。
2. Node testをschemaと純粋logicへ整理する。
   - `tests/node/character-sheet/credit.test.ts`から、入力正規化の境界値をZod schema testへ移す。`calculateCredit`は派生式だけを純粋logicとして残す。
   - `tests/node/character-sheet/schemas/character-sheet-form.test.ts`を追加し、profileの`null`拒否、信用の整数・非負制約、小銭修正の負数、空欄を`0`へ戻す変換を表形式で確認する。
3. Component / hook test基盤を追加する。導入ライブラリは以下で確定する。
   - dev dependency: `vitest`をComponent / hook test runner、`jsdom`をDOM環境、`@testing-library/react`をComponent render / `renderHook`、`@testing-library/user-event`をユーザー操作の再現、`@vitejs/plugin-react`をVitestでのReact TSX変換に使う。PlaywrightなしでPresenterとadapter hookを局所検証するために必要であり、既存Node `node:test`による純粋logic / schema testは置き換えない。`@testing-library/jest-dom`は標準`expect`で十分なため導入しない。
   - runtime dependency: `@hookform/resolvers`をZod schemaとRHFを結ぶ`zodResolver`に使う。手書きの`safeParse` adapterはRHF errorとの同期を独自実装することになり、React Hook Formのresolver contractを重複させるため採用しない。
   - 不採用: Playwrightの追加利用はE2Eの境界を広げるため、React Hook Testing Library単体は`@testing-library/react`の`renderHook`へ統合済みのため、手製JSDOM + `node:test`はTSX変換・DOM cleanup・hook lifecycleをプロジェクト固有に持ち込むため採用しない。Vitest 4のOXC変換ではAstroのTypeScript設定だけでTSXを変換できないため、Astro配下のtransitive packageには依存せず`@vitejs/plugin-react`を明示dependencyにする。
   - `tests/components/character-sheet/ProfileSection.test.tsx`を追加し、props表示、設定の局所開閉、FormulaTooltipのtrigger / dismiss、callback通知だけを確認する。計算式・RHF・Zodを置かない。
   - `tests/hooks/character-sheet/useCharacterSheetFormPresenterProps.test.tsx`を追加し、RHF formとZod resolverを使ったcredit入力境界、ViewModelへの派生値接続、`setValue`後の表示用propsを確認する。Presenter DOMやbrowser viewportは置かない。
4. packageごとの理由・代替案・初期スコープに必要な理由は上記のとおり記録済みである。レビュー対応の承認後に依存を追加し、既存のNode test、Component / hook test、最小E2Eを別scriptで実行できるようにする。

### 対応完了チェックリスト

- [x] E2Eを領域表示と2〜3個の代表browser behaviorへ縮小する
- [x] character sheet form用Zod schemaとNodeの境界値testを追加する
- [x] 確定したComponent / hook test toolingを追加し、PresenterとRHF adapter hookのtestを追加する
- [x] dependency追加理由・代替案・初期スコープ上の必要性をこのissueへ記録する
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## レビュー指摘 2

### 指摘事項

- `CreditField`がfocus中の親`value`更新をすべて無視するため、後続Gateのreset・復元がfocus中に発生した場合、blur時に古いDOM値で上書きする可能性がある。

### 判定

- source: local-agent / cross-cutting technical review
- classification: valid
- local validation: `ProfileSection`は`useEffect`で`isFocused`中のすべての`value`同期を抑止し、blur callbackでDOM値をRHFへ再投入する。現G4にはreset・復元がないが、入力途中の`-`を保つための局所状態としては同期対象を先取りしすぎている。

### 対応方針

- `CreditField`の`useEffect`、`useRef`、`isFocused`を削除する。`type="number"`はuncontrolledのまま維持し、onChangeでは`badInput`の`-`途中状態をRHFへ送らず、それ以外の値をRHFへ通知する。
- `onCreditBlur`はZodで正規化してRHFへ保存した`number`を返す。`CreditField`はblur時にその返り値を自身のDOM valueへ設定し、空欄を`0`、通常信用の負数を`0`、小銭修正の負数を整数として確定表示する。
- 親からのreset・復元値をuncontrolled inputへ同期する要件はG4で先行実装しない。該当Gateでreset / restoreの明示的なinput同期契約を追加する。
- Tooltipのfocus表示はユーザー指示によりG4対象外であり、本review sectionでは対応しない。

### 対応完了チェックリスト

- [x] CreditFieldのfocus依存同期を削除し、blur確定へ置き換える
- [x] Component testで`-1`の途中入力、空欄の`0`確定、blur後の表示値を確認する
- [x] `npm run test:component` が通る
- [x] `npm run check` が通る

## 初期スコープ外

- キャラクター画像の選択・変換・保存・失敗dialogを実装しない（G6）。
- 取得経験点、流儀、生き様、能力値、経験点の派生値・検証を実装しない（G7以降）。
- アイテム選択、消費信用の集計、信用超過エラー表示を実装しない（G17以降およびG25）。G4では消費信用を`0`の読み取り専用値として扱う。
- ブラウザ内保存・復元、JSON import/export、schema version、全消去、CCFOLIA出力を実装しない。
- 認証、サーバー・DB・クラウド保存、共有URL、PDF出力、作成ウィザード、ルールエンジンを実装しない。
- 状態管理ライブラリ、その他の新規依存を追加しない。
- canonical VRT baselineを更新しない。更新が必要な場合は別途ユーザー承認を得る。

## 完了条件

- [x] G4向けのdesign intentとVRT参照情報を`docs/design/character-sheet/notes.md`へ記録し、ユーザー承認を受けている。
- [x] PC名、PL名、二つ名、年齢、性別を、それぞれ独立した自由入力として空欄のまま編集できる。
- [x] `設定`は初期状態で閉じ、操作で改行を保持するプレーンテキスト入力を表示・非表示できる。
- [x] G4の全form valueは`null`非許容であり、文字列のdefault valueは`""`、取得信用のdefault valueは`10`、融通した信用・融通された信用・小銭修正のdefault valueは`0`である。
- [x] 取得信用、融通した信用、融通された信用は`0`以上の整数だけを受け付け、小銭修正は負数を許可する整数として編集できる。
- [x] 信用を、取得信用、融通した、融通された、合計信用、消費信用、小銭修正、小銭の順に表示する。信用の4入力が空欄になる操作では`0`へ戻り、合計信用と小銭をその値で表示する。数値入力を右揃えで表示する。
- [x] G4時点の消費信用は`0`と表示し、アイテム由来の集計や信用超過エラーを先行実装していない。
- [x] 合計信用、消費信用、小銭の計算式を、子要素のhover / tapで開くTooltipから確認でき、タップ端末ではコンポーネント外タップとEscで閉じられる。
- [x] Node schema / logic test、Component / hook test、最小Playwright smokeで、信用の入力境界、派生式、設定の局所開閉、代表的な自由入力・数値入力を責務境界ごとに確認している。
- [ ] design targetとVRT baselineの扱いを記録し、PRレビュー直前にG4で確定したtargetだけをVisual Reviewする。
- [x] 必要な依存だけを追加し、`npm run check` と `npm run build` が通る。

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
- `src/character-sheet/schemas/character-sheet-form.ts`
- `tests/node/character-sheet/`配下のG4のschema・信用算出test
- `tests/components/character-sheet/ProfileSection.test.tsx`
- `tests/hooks/character-sheet/useCharacterSheetFormPresenterProps.test.tsx`
- `tests/visual/character-sheet.spec.ts`
- `tests/visual/vrt/character-sheet.spec.ts`（G4のVRT targetを確定する場合のみ）
- `vitest.config.ts`
- `package.json`

## レビュー観点

- G4を基本情報、設定、信用に限定し、画像、経験点、アイテム、保存・出力を後続Gateへ残せているか。
- PC名、PL名、二つ名、年齢、性別を独立した自由入力とし、文字列入力は空欄を許可して`null`ではなく`""`で初期化できるか。信用の4入力は`null`も空欄も保持せず`number`として扱え、取得・融通した・融通された信用の`0`以上制約と、小銭修正の負数許可を満たすか確認したい。
- 信用の入力・派生値を基本情報内で取得経験点の近傍へ置くdesign方向、設定の初期非表示と操作の表現、desktop / tablet / mobileのVRT状態を`design-image-generation`で先に確定すべきか。
- G4時点の消費信用を`0`として表示し、後続Gateのアイテム集計とエラーを先行実装しない境界が妥当か。
- 既存のNode / Playwright testだけでG4の空欄値とユーザー操作を十分に確認でき、新しいテスト用依存が不要か。

## 備考

現在の`docs/design/character-sheet/notes.md`には、G4の入力配置・信用の初期値・VRT stateの具体的なdesign intentがない。実装前に`design-image-generation`を実行し、G4に限定したdesktop、tablet、mobileの表示方針とVRT比較対象を記録してユーザー承認を得る必要がある。

このissueの`null`非許容方針はG4で追加する入力値の契約である。後続Gateが同じformを拡張するときも、G4既存フィールドを`null`許容へ後退させない。
