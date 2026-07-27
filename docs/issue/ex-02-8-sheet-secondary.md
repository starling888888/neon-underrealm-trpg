# ex-02-8-sheet-secondary

## 最優先のデザイン入力

- 実装時は、`/character-sheet/`の既存実装にある同種の入力UI（`ProfileSection`のlabel、数値入力、read-only値、section内の余白と色）を、対象`.tmp/design/character-sheet/`配下のdraft画像より優先して維持・再利用する。既存の基本情報、画像、信用、ビルドの配置・操作・見た目を変更しない。
- 既存実装と競合しない範囲では、`.tmp/design/character-sheet/desktop.png`、`tablet.png`、`mobile.png`を、副能力値をビルド直後に置くこと、tabletの3行圧縮、mobileの縦積みと高密度表示を決めるデザイン入力とする。
- ユーザーの最新指示により、副能力値の各項目は`自動算出値 + ユーザー入力欄 = 最終値`の順にする。算出式はラベルのtooltipで表示し、移動力と行動値の一時修正適用checkboxは最終値の右側に置く。体力と精神力の最終値は`最大体力`、`最大精神力`とする。この指示は、draft画像および算出式を通常表示する既存design notesを上書きする。
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
- form値とschemaへ、体力追加値、精神力追加値、移動力修正、行動値修正、行動回数修正、縁最大数修正、移動力・行動値の一時修正適用booleanを追加する。数値入力は整数で、各手動修正は負数を許可し、空欄は`0`として扱う。
- 純粋logicへ、G7のプライマリ流儀、生き様、常時能力値・一時能力値とユーザー入力から副能力値を導出する責務を追加する。プライマリ流儀または生き様が未選択で基礎式を確定できない値は`-`と表示し、手動修正値は保持する。
- `基本体力 + 体力追加値 = 最大体力`、`基本精神力 + 精神力追加値 = 最大精神力`、`基本移動力 + 移動力修正 = 最終移動力`、`基本行動値 + 行動値修正 = 最終行動値`、`基本行動回数 + 行動回数修正 = 行動回数`、`基本縁最大数 + 縁最大数修正 = 縁最大数`を、各項目内の左から右の順に表示する。体力・精神力の最終値ラベルは必ず`最大体力`、`最大精神力`にする。
- 基本体力、基本精神力、基本移動力、基本行動値、各最終値のラベルへ既存`FormulaTooltip`を付け、固定式だけを表示する。tooltipはhover、tap、Esc、component外tapの既存操作契約を保ち、数値を代入した計算過程は表示しない。手動修正ラベルに計算式tooltipを追加しない。
- 移動力・行動値では、最終値の右側に一時修正適用checkboxを置く。未チェック時は常時能力値、チェック時は一時能力値を基礎式へ用いる。checkboxの変更で、同じ行の基本値と最終値を再計算する。
- 最大体力は、G8で利用可能な`基本体力 + 体力追加値`を表示し、スミの選択中ナノマシン由来の`activationMentalCost`最大値はG20が選択状態を接続するまで`0`とする。G20が既存の副能力値logicへこの加算値を渡して最終的な要件式を完成させられる、局所的で明示的な拡張点を残す。
- 行動回数の基本値は`2`、縁最大数の基本値は`4`とする。共通スキルボーナスを自動加算しない。
- tabletは、体力系と精神力系、移動力系と行動値系、行動回数と縁最大数の3行へ圧縮する。mobileは各項目を縦積みにし、desktop、tablet、mobileのいずれでも全行が横overflowなく操作・閲覧できるようにする。
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
- [x] 移動力と行動値の一時修正適用checkboxが各最終値の右側にあり、常時・一時能力値の選択を正しく反映する。
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
