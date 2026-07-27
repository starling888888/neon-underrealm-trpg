# ex-02-8-sheet-secondary

## 最優先のデザイン入力

- 実装時は、`/character-sheet/`の既存実装にある同種の入力UI（`ProfileSection`のlabel、数値入力、read-only値、section内の余白と色）を、対象`.tmp/design/character-sheet/`配下のdraft画像より優先して維持・再利用する。レビュー指摘1に従う数値表示の共有style移行だけは、基本情報・ビルドにも適用してよい。
- 既存実装と競合しない範囲では、`.tmp/design/character-sheet/desktop.png`、`tablet.png`、`mobile.png`を、副能力値をビルド直後に置くこと、tabletの3行圧縮、mobileで各項目を1行ずつ置くことを決めるデザイン入力とする。各項目内の計算式はreview指摘1に従い、mobileでも横並びを維持する。
- ユーザーの最新指示により、副能力値の各項目は`自動算出値 + ユーザー入力欄 = 最終値`の順にする。算出式は項目名のtooltipで表示し、移動力と行動値の一時修正適用checkboxは項目名の右に置く。体力と精神力の最終値は`最大体力`、`最大精神力`とする。この指示は、draft画像および算出式を通常表示する既存design notesを上書きする。
- design notes、実装結果のscreenshot、reviewer出力で、既存類似UIまたはユーザー指示にない配置・導線・状態表現を補完しない。不明点・競合がある場合はsource codeを変更せず停止して判断を求める。

## 目的

`/character-sheet/`の`secondary` slotへ、副能力値の直接編集UIと、G7までに確定したビルド値から算出できる副能力値を追加する。各項目で自動算出値、手動修正、最終値の関係と算出式を明確にし、desktop、tablet、mobileで横overflowなく確認できる状態にする。

## 背景

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md` の `G8`
- 要件: `docs/requirements/character-sheet.md` の「副能力値、縁、判定」と「副能力値の表示と手動修正」
- アーキテクチャ: `docs/architectures/character-sheet.md` のContainer / Presenter / form / logic / Component testの責務分離
- design target: `docs/design/character-sheet/notes.md` の「編集画面の情報architecture」「副能力値、縁、判定」と、最優先のデザイン入力に示したdraft画像
- 関連TODO: `docs/TODO.md`のReact memo化は、G8で`React.memo`を導入しないため扱わない。JSON schema version、永続Skill ID検出、縁のルール文言はG8の範囲外として維持する。

## Gate関係

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`
- Gate: `G8: 副能力値を扱う。`

このissueはG8だけを実装するための自己完結した契約である。G9以降の縁・覚悟、判定、スキル、アイテム、保存・復元、JSON入出力、全体エラー集約は扱わない。

## 対象範囲

- `secondary` slotへ、独立した副能力値Componentを置く。ComponentはPresenterから表示値と操作callbackだけを受け、マスタ検索、派生値算出、永続化、browser APIを直接扱わない。
- form値とschemaへ、体力修正、精神力修正、移動力修正、行動値修正、行動回数修正、縁最大数修正、移動力・行動値の一時修正適用booleanを追加する。数値入力は整数で、各手動修正は負数を許可し、空欄は`0`として扱う。
- 純粋logicへ、G7のプライマリ流儀、生き様、常時能力値・一時能力値とユーザー入力から副能力値を導出する責務を追加する。プライマリ流儀または生き様が未選択で基礎式を確定できない値は`-`と表示し、手動修正値は保持する。
- `基本体力 + 修正 = 最大体力`、`基本精神力 + 修正 = 最大精神力`、`基本移動力 + 移動力修正 = 最終移動力`、`基本行動値 + 行動値修正 = 最終行動値`、`基本行動回数 + 行動回数修正 = 行動回数`、`基本縁最大数 + 縁最大数修正 = 縁最大数`を、各項目内の左から右の順に表示する。体力・精神力の最終値ラベルは必ず`最大体力`、`最大精神力`にする。
- 基本体力、基本精神力、基本移動力、基本行動値、各最終値のラベルへ既存`FormulaTooltip`を付け、固定式だけを表示する。tooltipはhover、tap、Esc、component外tapの既存操作契約を保ち、数値を代入した計算過程は表示しない。手動修正ラベルに計算式tooltipを追加しない。
- 移動力・行動値では、項目名の右に一時修正適用checkboxを置く。未チェック時は常時能力値、チェック時は一時能力値を基礎式へ用いる。checkboxの変更で、同じ行の基本値と最終値を再計算する。
- 最大体力は、G8で利用可能な`基本体力 + 修正`を表示し、スミの選択中ナノマシン由来の`activationMentalCost`最大値はG20が選択状態を接続するまで`0`とする。G20が既存の副能力値logicへこの加算値を渡して最終的な要件式を完成させられる、局所的で明示的な拡張点を残す。
- 行動回数の基本値は`2`、縁最大数の基本値は`4`とする。共通スキルボーナスを自動加算しない。
- tabletは、体力系と精神力系、移動力系と行動値系、行動回数と結べる縁の3行へ圧縮する。mobileは各項目を縦に並べるが、各項目の計算式は横並びに保ち、desktop、tablet、mobileのいずれでも全行が横overflowなく操作・閲覧できるようにする。
- 固定文言と固定式は`src/character-sheet/dictionary.ts`へ置く。既存の`FormulaTooltip`を用途に適合させる必要がある場合は、そのComponentとComponent testを最小範囲で更新する。

## 初期スコープ外

- 縁の固定入力行、覚悟効果、縁上限超過の警告はG9で扱う。
- 攻撃、リアクション、非戦闘判定、スキル、武器・防具、専用アイテムの入力・算出・検証を実装しない。
- G20より前にナノマシンの選択UI、発動状態、`activationMentalCost`の選択ロジックを実装しない。
- 共通スキルボーナスや効果文を構造化・解析・自動加算しない。
- localStorage、IndexedDB、JSON、CCFOLIA、サーバー、DB、追加ライブラリ、キャラクター作成ウィザード、文章ルールを解析する汎用ルールエンジンを追加しない。
- Header、Footer、サイトメニュー、基本情報、ビルド、section frame、操作ペイン、canonical VRT baselineを再設計・更新しない。

## 完了条件

- [x] `secondary` slotに副能力値を表示し、G7のビルド入力から体力、精神力、移動力、行動値を導出できる。
- [x] 6項目すべてが`自動算出値 + ユーザー入力欄 = 最終値`の構造で、各入力と最終値を同一項目内に表示する。
- [x] 体力と精神力の最終値ラベルが`最大体力`、`最大精神力`である。
- [x] 移動力と行動値の一時修正適用checkboxが項目名の右にあり、常時・一時能力値の選択を正しく反映する。
- [x] 自動算出値と最終値のラベルから固定算出式をtooltipで確認でき、数値を代入した式を通常表示していない。
- [x] 未選択状態、正負の手動修正、checkboxの切替、tablet / mobileでの表示を純粋logic、schema / hook、Component、browser behavior testの適切な層で確認している。
- [x] `@character-sheet` targetだけをVisual Reviewし、canonical VRT baselineを更新していない。
- [x] 関連TODOを扱わず、未対応理由をこのissueに記録している。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## チェックポイント

- [x] 既存ルートが壊れていない。
- [x] GitHub Pagesのサブパス公開に影響しない。
- [x] 不要な依存関係を追加していない。
- [x] 初期スコープ外の機能を実装していない。
- [x] 関連する `docs/TODO.md` 項目と矛盾していない。
- [x] `docs/design/character-sheet/notes.md`と、ユーザー指示で更新した副能力値の表示契約に矛盾していない。
- [x] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `src/character-sheet/components/CharacterSheetFormPresenter.tsx`
- `src/character-sheet/components/SecondarySection.tsx` と対応するCSS Module
- `src/character-sheet/components/FormulaTooltip.tsx` と対応するCSS Module（必要な場合のみ）
- `src/character-sheet/form-values.ts`
- `src/character-sheet/form/useCharacterSheetFormPresenterProps.ts`
- `src/character-sheet/schemas/character-sheet-form.ts`
- `src/character-sheet/logic/` 配下の副能力値用純粋logic
- `src/character-sheet/dictionary.ts`
- `tests/components/character-sheet/`、`tests/hooks/character-sheet/`、`tests/node/character-sheet/`、`tests/visual/character-sheet.spec.ts`

## レビュー観点

- 副能力値の各項目が、ユーザー指定どおり自動算出値、手動入力、最終値の関係を横方向に読み取れるか。
- `最大体力`、`最大精神力`、移動力・行動値の最終値右側checkbox、ラベルの式tooltipが過去draftの常時表示式より優先されているか。
- 未選択の流儀・生き様、負の修正、スミのナノマシン未接続時の`0`という境界が、G9・G20以降を先取りせず自己完結しているか。
- tabletの3行圧縮とmobileの縦積みが、既存入力のサイズ・情報密度を保ちつつ横overflowを起こさないか。
- canonical VRT baseline更新と、TODOにあるmemo化・保存互換性・ルール文言整理を、このGateへ混入させていないか。

## 備考

- VRT targetは`tests/visual/vrt/character-sheet.spec.ts`の`@vrt @character-sheet`、routeは`/character-sheet/`、stateはdefault、viewportはdesktop、ultrawide、tablet、mobileとする。G8では変更targetだけを比較し、baselineの更新はユーザーの明示承認がある場合だけ行う。
- `FormulaTooltip`の既存の局所open stateと、hover、tap、Esc、component外tapの契約は`docs/architectures/character-sheet.md`を正本とする。後続Gateのためにtooltip以外のグローバルなヘルプUIを追加しない。
- ユーザーの最新指示に基づき、`docs/requirements/character-sheet.md`と`docs/design/character-sheet/notes.md`の副能力値表示契約を同時に更新した。G8の実装ではこのissueをSSoTとし、後続Gateでは同じ契約を維持する。

## ビジュアルレビュー 1

### VRT対象

- design target: `character-sheet`
- VRT test / tags: `tests/visual/vrt/character-sheet.spec.ts` / `@vrt @character-sheet`
- route / states / viewports: `/character-sheet/` / default / desktop、ultrawide、tablet、mobile

### レビュー結果

| 対象              | 判定       | 差分                                                                                          | 対応                                                                               |
| ----------------- | ---------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `character-sheet` | 要人間判断 | 副能力値追加により4 viewportのpage screenshot高さと内容が既存canonical baselineから変わった。 | 一時snapshotとactualを確認した。baselineは更新せず、既存UIへの追加だけと判断した。 |

### 自己修正した項目

- なし。副能力値の追加による差分はG8の承認済み範囲であり、UIの追加削除またはglobal style修正は不要と判断した。

### 人間判断が必要な差分

- G8の副能力値追加を反映するcanonical VRT baseline更新の要否。

### 対応完了チェックリスト

- [x] 変更targetだけをVRT比較した。
- [x] 変更targetだけの一時snapshotを取得した。
- [x] VRT差分は承認済みの副能力値追加によるもので、source code修正は不要と判断した。
- [x] baseline更新が必要な差分を人間判断として記録した。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## レビュー指摘 1

### 指摘事項

- 副能力値を既存の`CharacterSheetSectionFrame`でラップし、基本情報・ビルドと同じsection見出し、背景、border、内側余白の階層に揃える。独自のsection見出しと外枠は残さない。
- 各演算子の左右に`基本体力`、`修正`などの可視labelを反復表示しない。各項目は`自動算出値 + 修正入力 = 最終値`とcheckboxを一つの枠に入れ、左上に`最大体力`、`最大精神力`、`移動力`、`行動値`、`行動回数`、`結べる縁`の項目名を少し大きく表示する。
- 項目名をformula tooltipのtriggerにする。自動算出値と修正入力は、accessible nameを保ちながら可視labelを省略する。
- checkboxの可視labelは`一時修正を適用`とし、そのlabelをtooltip triggerにする。移動力・行動値ではcheckboxを項目名の右に置き、desktop・tabletでも計算式は項目枠の横幅全体を使う。tooltipでは、移動力なら`チェックを入れると一時能力値で移動力を表示します`、行動値なら`チェックを入れると一時能力値で行動値を表示します`を説明する。計算式は、たとえば行動値なら`敏捷 + 感覚 × 2 + 修正`のように簡潔に表示する。最大体力・最大精神力は、算出方法が分かる全体の計算式をtooltipで省略せず表示する。
- mobileでも各項目の`自動算出値 + 修正入力 = 最終値`を横方向に保つ。幅不足は余白、入力幅、文字サイズ、grid列の調整で解消し、演算子と値を1列の縦積みにしない。
- プロフィールの自動算出値、流儀・生き様／能力値の自動算出値・数値表示、副能力値の数値表示を、キャラクターシートに閉じた共有styleで揃える。右揃え、入力欄に対する見た目の幅、read-only値のborder/background/typographyを共通化し、各section CSSでの重複を減らす。

### 判定

- source: human
- classification: valid
- local validation: `SecondarySection`だけが`CharacterSheetSectionFrame`を使わず、独自のmuted backgroundとborderを持つ。既存の`ProfileSection`と`BuildSection`には数値表示の幅・padding・font-sizeがそれぞれ重複定義され、副能力値のread-only値はプロフィールの自動算出値と揃っていない。共通frameとキャラクターシート専用の共有styleを導入する判断は、G8の表示構成を整える範囲で妥当である。
- local validation: mobileの縦積みは、現在のissue、requirements、design notesの既存契約だが、今回の人間レビューで明示的に変更された。対応時に3文書の副能力値表示契約を横並び維持へ揃える。
- local validation: 追加したbrowser E2Eは、page上でのtooltip起動、修正入力、checkbox反映というIsland結線のsmoke testだけを扱う。詳細な行構造・callback・tooltip単体操作はComponent testにあるため、キャラクターシートE2Eの責務を超えていない。E2Eは保持し、レビュー後の表示文言と最終値triggerへselectorを更新する。
- local validation: 副能力値の独自見出しは小さく、共通frameの見出し階層から外れているため、`副能力値`だけでは主要sectionとして把握しにくい。frameの標準見出しへ統一して解消する。

### 対応方針

- `CharacterSheetFormPresenter`で副能力値を共通frameへ入れ、`SecondarySection`はframe contentだけを描画するComponentへ縮小する。
- 副能力値の行を、左上の項目名、無labelの自動算出値、修正入力、演算子、最終値、checkboxを含む一つの枠として再構成する。項目名を式tooltip、項目名の右に置く`一時修正を適用`を説明tooltipのtriggerとし、式とcopyをdictionaryで更新する。
- mobileを含む全viewportで横並びを維持できる列定義へ直し、desktop・tabletではcheckbox用の列を設けず計算式が項目幅全体を使えるようにする。
- `data-character-sheet-layout`のスコープ内に、入力とread-only数値表示の共有classまたは共有selectorを定義する。Profile、Build、Secondaryの既存数値表示を移行し、section間の見た目を合わせる。
- `docs/requirements/character-sheet.md`と`docs/design/character-sheet/notes.md`は、レビュー承認後の実装と同じtaskで更新する。VRTは修正後に`character-sheet` targetへ限定して再確認し、baseline更新は別途人間判断として残す。

### 対応完了チェックリスト

- [x] 副能力値を`CharacterSheetSectionFrame`でラップし、標準sectionの見出し・背景・borderへ統一する。
- [x] 計算式全体とcheckboxを項目枠へまとめ、左上の項目名を式tooltipのtriggerにする。自動算出値と修正入力のaccessible nameは維持する。
- [x] checkboxの可視labelを`一時修正を適用`に戻し、項目名の右に置くlabelのtooltipで一時能力値を用いる説明を表示する。
- [ ] mobileを含む全viewportで、各項目の計算式を横並びで表示し、横overflowを起こさない。
- [x] Profile、Build、Secondaryの数値表示をキャラクターシート専用の共有styleへ揃える。
- [x] Component / hook / browser E2E testを、変更後の構造・文言・操作へ更新する。
- [ ] `character-sheet` targetのVRT比較を実施し、baseline更新の要否を記録する。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## レビュー指摘 2

### 指摘事項

- `FormulaTooltip`がsectionおよびviewportの上下左右端を越えず、全てのtrigger位置で全文を読めるようにする。特に画面左端に近い項目では、現在の右端基準配置によりtooltipが左側へはみ出し、section上端に近い項目では上側が切れる。

### 判定

- source: human
- classification: valid
- local validation: tooltip contentは`right: 0`でtriggerの右端に固定され、max-widthだけをviewport幅で制限している。左端に近い短いtriggerではcontentの左端をviewport内へ戻す配置処理がなく、tooltipが画面外へ出る。`FormulaTooltip`はProfile、Build、Secondaryで共有されるため、局所CSSではなくComponentの配置責務として扱う。
- local validation: tooltip contentは常にtriggerの上側へ開くため、section frameの`overflow: clip`またはviewport上端に近い副能力値、成長点、能力値ポイントのtriggerでは上端が切れる。副能力値frameにもoverflow許可が必要であり、上側に余白がない場合は共通Componentが下側へ反転する必要がある。

### 対応方針

- open時にtriggerとtooltipのbounding rectを測定し、viewport内に収まる左右alignmentと上下placementを選ぶ。既存のhover、tap、Esc、外側tap、focus操作を維持し、tooltipを読めない位置へ出さない。
- desktop / tablet / mobileの上下左右端に近いtriggerでは、`FormulaTooltip` Component testでplacement選択を確認する。実際の画面内配置は、tooltipを開いたstateを含むtarget限定VRTで確認する。副能力値だけでなくProfileまたはBuildの既存triggerも対象に含め、共有Componentの回帰を防ぐ。

### 対応完了チェックリスト

- [x] `FormulaTooltip`をsection・viewport境界に応じて配置し、上下左右にはみ出さないようにする。
- [ ] 既存のhover、tap、Esc、component外tap、keyboard focusの操作契約を維持する。
- [ ] tooltipを開いたstateのtarget限定VRTで、上下左右端に近い表示位置を確認する。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## レビュー指摘 3

### 指摘事項

- ドメイン上の「副能力値」を`secondary`単独で命名しない。`SecondarySection`、`secondarySection`、form値の`secondary`などは意味が曖昧なため、`secondaryAttributes`を用いる。

### 判定

- source: human
- classification: valid
- local validation: UIの表示文言は`副能力値`であり変更不要だが、実装では副能力値を表すComponent、Presenter props、form値、schema、logic、dictionary keyが`secondary`で統一されている。`secondary`は配置上の第2領域や一般的な二次要素にも読め、ゲームの副能力値を表すドメイン名として不十分である。
- local validation: `secondaryColumn`およびlayout regionの`secondary`は、primary / secondaryの画面配置を表す既存のlayout用語であり、副能力値の訳ではないためrename対象に含めない。

### 対応方針

- 副能力値を表すComponent、props、form値、schema、logic、dictionary key、test名・selectorを`secondaryAttributes`へrenameする。UI表示の`副能力値`と、primary / secondary layoutの既存名称は維持する。

### 対応完了チェックリスト

- [x] 副能力値を表す実装上の`secondary`命名を`secondaryAttributes`へ統一し、layout用語と区別する。
- [x] Component / hook / logic / schema / browser E2Eをrename後の契約へ更新する。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## レビュー指摘 4

### 指摘事項

- `副能力値`、`最大体力`、`最大精神力`、`移動力`、`行動値`、`行動回数`、`結べる縁`を、キャラクターシート固有UIの文言ではなくゲーム用語として扱う。`characterSheet.secondary`および`characterSheet.sections`から取り除き、`gameDomain.terms`を唯一の参照先にする。

### 判定

- source: human
- classification: valid
- local validation: `dictionary.ts`の冒頭コメントは、固定文言を用語の所有者に合わせて分類する方針を明記している。既に`縁`、能力値名などは`gameDomain.terms`にある一方、今回の副能力値と各最終値名は`characterSheet.secondary.labels`および`characterSheet.sections`に重複して置かれている。これらはキャラクターシート外でも成立するゲーム概念であり、ゲーム用語として集約するのが方針に一致する。
- local validation: 各修正値、checkboxの説明文、計算式tooltipの文面は、入力・操作・表示に関するキャラクターシート固有UI文言として`characterSheet`側に残す。

### 対応方針

- `gameDomain.terms`へ副能力値と6つの値の名称を移し、`SecondaryAttributesSection`を含む参照側はそこから取得する。レビュー指摘1で最終値名を`移動力`、`行動値`、`結べる縁`へ整理する変更にも同じ用語を使う。
- 移管後に`characterSheet`配下へ同じゲーム用語を残さず、UI固有文言とゲーム用語の境界をtestとdictionaryの構造で明確にする。

### 対応完了チェックリスト

- [x] 副能力値、最大体力、最大精神力、移動力、行動値、行動回数、結べる縁を`gameDomain.terms`へ移す。
- [x] 副能力値のComponent・Presenter・testから、移管後のゲーム用語を参照する。
- [x] `characterSheet`側には入力・操作・tooltipなどのUI固有文言だけを残す。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。
