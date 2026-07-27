# ex-02-7-sheet-build

## 最優先のデザイン入力

- 実装時は、`/character-sheet/`の既存実装にある同種の入力UI（`ProfileSection`のlabel、数値入力、read-only値、section内の余白と色）を、対象`.tmp/design/character-sheet/`配下のdraft画像より優先して維持・再利用する。既存の基本情報、画像、信用の配置・操作・見た目を変更しない。
- 既存実装と競合しない範囲では、`.tmp/design/character-sheet/desktop.png`、`tablet.png`、`mobile.png`、および`.tmp/character-sheet-design-draft.jpg`を、流儀・生き様と能力値を左カラムの重要な入力群として扱うこと、desktop/tabletでの横並び、mobileでの縦積みを決める最優先の画像入力とする。
- ユーザーの最新指示は前二項を上書きする。design notes、実装結果のscreenshot、reviewer出力で、既存類似UIまたはdraft画像にない配置・導線・状態表現を補完しない。不明点・競合がある場合はsource codeを変更せず停止して判断を求める。

## 目的

`/character-sheet/`へ、プライマリ流儀・生き様・その他流儀、能力値、経験点の直接編集UIと、このGateで算出可能な経験点・能力値の局所エラー状態を追加する。初期値をルールどおりプライマリ流儀・生き様各1レベル、取得経験点50点にそろえる。

## 背景

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md` の `G7`
- 要件: `docs/requirements/character-sheet.md` の「PC基本ビルドと能力値」「経験点と信用」「エラーと警告」
- ルール参照: `.raw/v1.0/01.ルールブック.md` の「フルスクラッチ」。プライマリ流儀と生き様は1レベル取得済みで、追加成長に使う経験点は50点である。
- design target: `docs/design/character-sheet/notes.md` の「ビルド、能力値、経験点」と、最優先のデザイン入力に示したdraft画像。
- ユーザー指示により、要件とdesign notesの初期値を、プライマリ流儀・生き様各1レベル、取得経験点50点へ更新した。
- 関連TODO: `docs/TODO.md` のReact memo化は後続Gateで必要性が生じた場合だけ扱う。G7では先行してmemo化しない。

## Gate関係

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`
- Gate: `G7: 流儀、生き様、能力値、経験点を扱う。`

このissueはG7だけを実装するための自己完結した契約である。G8以降の副能力値、縁、判定、スキル、アイテム、保存・復元、JSON入出力、全体エラー集約は扱わない。

## 対象範囲

- `build` slotに、プライマリ流儀・生き様の選択とレベル入力、初期0行のその他流儀の追加・削除入力を置く。プライマリ流儀・生き様の初期選択は未選択を許容し、両レベルは初期値・最低値1、その他流儀は0以上とする。
- 取得経験点（初期値50）、G7が扱う流儀レベルの費用、消費経験点、残経験点、格を表示する。プライマリ流儀・生き様の最初の1レベルは無料とし、追加レベルとその他流儀は1レベルごとに10点を消費する。共通スキルなど後続Gateの費用はこのGateでは加算しないが、G16が統合できる状態・責務にする。
- 選択した生成JSONから、プライマリ流儀の基礎能力値と、選択した生き様の`attributePoints`を参照して、筋力・敏捷・感覚・肉体・精神の基礎値、能力値ポイント、成長、常時修正、常時能力値、一時修正、一時能力値を表示・編集する。能力値ポイント、成長、常時修正、一時修正だけを編集可能にする。
- 能力値ポイントの「生き様由来の4値と0を各能力値へ1回ずつ」という一致、能力値成長の使用可能点、経験点超過、流儀の重複を、該当入力・該当領域で局所的にエラー状態として示す。入力値は拒否・自動補正・自動削除しない。
- プライマリ流儀または生き様が未選択の間も、格は両レベルの合計として初期値`2`を表示する。消費経験点と残経験点は、選択済みの流儀だけを集計して初期値`0`と`50`を表示する。プライマリ流儀が選択済みなら基礎能力値、体力増加値、精神力増加値、共通スキルボーナスを表示し、生き様が選択済みなら能力値ポイント候補、体力係数、精神力係数を表示する。成長可能点、常時能力値、一時能力値は両マスタが選択済みの場合だけ算出し、それ以外は`-`とする。生き様が未選択の能力値ポイント候補は`-`、5つの能力値ポイント入力はすべて`0`とし、未選択自体と能力値ポイントの一致はエラーにしない。生き様を選択しても能力値ポイントを自動配分・自動補正せず、入力を保持したまま生成JSONとの不一致を局所エラーで示す。選択後は通常の派生・検証へ切り替える。
- 未選択状態の表示契約は、両方未選択時に格`2`・消費経験点`0`・残経験点`50`とし、両マスタ由来の値は`-`とする。プライマリ流儀だけ選択した場合は同流儀由来の基礎能力値、体力・精神力増加値、共通スキルボーナスを追加表示する。生き様だけ選択した場合は同生き様由来の能力値ポイント候補、体力・精神力係数を追加表示する。いずれの片選択状態でも、成長可能点、常時能力値、一時能力値は`-`とする。
- エラーはG7の入力UIに必要な状態・関連付け・見た目だけを実装する。エラー文言の妥当性確認、エラー一覧・操作ペインへの集約、通知や確認ダイアログの文言は扱わない。全体集約はG25、その他流儀削除時の対応スキルを含む確認は対応スキルを実装する後続Gateで扱う。
- 既存の`CharacterSheetFormPresenter`、form値・schema・純粋logic・generated data accessorの責務を保ち、G7に必要なComponent、CSS Module、テストを追加する。Presenter以下へマスタ検索、派生値算出、検証、永続化を直接置かない。
- desktopとtabletは、流儀・生き様入力を左、能力値を右に横並びで置く既存draftの情報関係を、既存の左カラム内の一つの重要なビルド領域として扱う。mobileでは流儀・生き様・その他流儀の後に能力値を縦積みする。既存の数値入力の短い右揃え、read-only値、border・surface・spacingを使い、横overflowを生じさせない。

## 初期スコープ外

- 副能力値、縁、判定、スキル、武器・防具、専用アイテムの入力・算出・検証を実装しない。
- 共通スキル・後続Gateの費用を消費経験点へ加算しない。G16の全費用整合性確認を先取りしない。
- その他流儀を削除する際の対応スキル削除確認、確認ダイアログ、エラー・警告の集約表示を実装しない。
- エラー文言のレビュー、ルール文章の表現調整、ヘルプ文言の追加を行わない。
- localStorage、IndexedDB、JSON、CCFOLIA、サーバー、DB、追加ライブラリ、キャラクター作成ウィザード、文章ルールを解析する汎用ルールエンジンを追加しない。

## 完了条件

- [x] プライマリ流儀・生き様は各1レベルを初期値・最低値とし、取得経験点は50点を初期値として表示する。
- [x] その他流儀は初期0行で追加・削除でき、重複状態を局所エラーで示せる。
- [x] 選択中のgenerated dataを使い、5能力値の編集可能値とread-only派生値を表示する。
- [x] 生き様の`attributePoints`と能力値ポイントの不一致、成長可能点超過、経験点超過を、入力を保持したまま局所エラーで示せる。
- [x] エラー文言のレビュー・全体エラー集約を追加せず、対象入力のUIだけを扱っている。
- [x] desktop / tablet / mobileで既存の基本情報・画像・信用との配置を保ち、横overflowがない。
- [x] `tests/visual/vrt/character-sheet.spec.ts`の`@character-sheet`に限定してVisual Reviewを行い、canonical VRT baselineはユーザーの明示承認なしに更新しない。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## チェックポイント

- [x] 既存の`ProfileSection`と同種の入力UIを優先し、基本情報・画像・信用のDOM順、配置、既存操作を壊していない。
- [x] 既存のdesktop 2列、tablet/mobile 1列のlayout regionと、GitHub Pagesのサブパス公開を壊していない。
- [x] 数値の中間入力と不整合値を保持し、HTMLの`min`やschemaだけで入力を拒否していない。
- [x] G7の費用責務と、後続Gate/G16が加える費用責務を混同していない。
- [x] 既存generated JSONのaccessorを利用し、不要なデータ変換・依存関係を追加していない。
- [x] `docs/TODO.md` のmemo化保留と、`docs/out-of-scope.md` の直接編集式・非ウィザード方針に矛盾していない。
- [x] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `src/character-sheet/components/CharacterSheetFormPresenter.tsx`
- `src/character-sheet/components/BuildSection.tsx`（新規）と対応するCSS Module
- `src/character-sheet/form-values.ts`
- `src/character-sheet/form/useCharacterSheetFormPresenterProps.ts`
- `src/character-sheet/schemas/character-sheet-form.ts`
- `src/character-sheet/logic/` 配下のG7用純粋logic
- `src/character-sheet/dictionary.ts`
- `tests/components/character-sheet/`、`tests/hooks/character-sheet/`、`tests/node/character-sheet/`、`tests/visual/character-sheet.spec.ts`

## レビュー観点

- プライマリ流儀・生き様の最低1レベルと、50点のフルスクラッチ経験点が、要件・ルール・初期画面で矛盾なく表現されているか。
- 既存の基本情報入力UIを優先しながら、draft画像のビルドと能力値の重要度・レスポンシブな関係を保てているか。
- G7の局所エラーが、入力値を保持し、エラー文言確認やG25の全体集約へ範囲を広げていないか。
- G7の消費経験点責務を、後続スキル・アイテムGateとG16の整合性確認から切り離せているか。
- design notes作成は不要で、既存design targetとdraft画像を参照して実装を開始できるか。canonical VRT baselineの更新を前提にしていないか。

## 備考

- 直接編集形式では過去の「1回の成長」操作履歴を保持しないため、G7で自動検証できる能力値成長は現在値から判定できる成長可能点の合計までとする。履歴を必要とする規則を自動検証へ拡張する場合は、状態モデルと要件を別途レビューする。
- 初期状態はプライマリ流儀・生き様を未選択にし、draft画像の例示を任意のdefaultとして実装しない。未選択時の派生値と能力値ポイントは対象範囲に定めた表示を使う。
- このissue準備ではsource code、draft画像、canonical VRT baselineを変更しない。実装開始にはユーザーの明示承認が必要である。

## ビジュアルレビュー 1

### VRT対象

- design target: `character-sheet`
- VRT test / tags: `tests/visual/vrt/character-sheet.spec.ts` / `@vrt.*@character-sheet`
- route / states / viewports: `/character-sheet/` / default / desktop、ultrawide、tablet、mobile

### レビュー結果

| 対象              | 判定       | 差分                                                                                                                   | 対応                                                                                                     |
| ----------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `character-sheet` | 要人間判断 | 4 viewportともビルド領域の追加により既存canonical baselineと不一致（desktop 3%、ultrawide 1%、tablet 14%、mobile 16%） | 一時snapshotを目視し、既存基本情報・画像・信用の配置を維持していることを確認した。baselineは更新しない。 |

### 自己修正した項目

- [x] tabletの短い数値入力からブラウザ標準のspinnerを除き、既存の数値入力と同じ可読性にそろえた。

### 人間判断が必要な差分

- ビルド領域追加によるcanonical VRT baseline更新の要否。ユーザーの明示承認なしに更新していない。

### 対応完了チェックリスト

- [x] 変更targetだけをVRT比較した
- [x] 変更targetだけの一時snapshotを取得した
- [ ] VRT差分を修正した、または修正不要と判断した（baseline更新の人間判断待ち）
- [x] baseline更新が必要な差分を人間判断として記録した
- [x] `npm run check` が通る（該当する場合）
- [x] `npm run build` が通る（該当する場合）

## レビュー指摘 1

### 指摘事項

- 取得経験点、消費経験点、残経験点、格をビルド領域ではなく、信用に近接する基本情報側へ置く。
- 流儀・生き様と能力値の直下に必要な、プライマリ流儀の体力増加値・精神力増加値、生き様の現レベルに対応する体力係数・精神力係数、共通スキルボーナス表示がない。
- その他流儀の削除buttonがlink色のborderを持つ。dangerの操作として局所的に区別する。
- 成長点のラベルに、既存`FormulaTooltip`で`floor(格 / 15)`の算出式を表示する。
- desktopの最小幅では流儀・生き様選択領域が広く、能力値表の列が狭い。能力値ポイントだけを意図して「能力値」「ポイント」の2行にし、それ以外の列見出しと値は折り返さない。
- 能力値ポイント候補の先頭に生き様名を付けず、`能力値ポイント: X, X, X, X, X`だけを表示する。候補の割り振り規則はTooltipで示す。
- 成長点Tooltipの文面を、格の15倍ごとの獲得点と、2点以上を同じ能力値へ一度に割り振れない規則まで含める。格90以上の6点同時獲得は対象にしない。
- mobileの経験点領域は、取得・消費・残経験点を同じ行に保ち、格だけを次行へ折り返す。将来の共通スキル表示との再編はG14以降で扱う。
- 格のラベルにも算出式のTooltipを表示する。
- 能力値ポイントの割り振り不一致と成長点の不整合が同じエラー状態を共有しているため、片方の不整合がもう片方の入力をerrorにする。両者を分離する。

### 判定

- source: human
- classification: valid
- local validation: `docs/requirements/character-sheet.md`の「経験点と信用」は取得経験点の近傍をキャラクター情報側とし、同ファイルの共通スキルボーナス表示、および`docs/design/character-sheet/notes.md`のmobile・ビルド記述は、流儀増加値、生き様係数、共通スキルボーナスを要求している。現行`BuildSection`は経験点を同領域へ置き、これらの表示を持たない。削除buttonは`.addButton`とlink色borderを共有し、能力値表は選択領域42% / 能力値58%の比率で、列見出しに折り返し制御がない。`FormulaTooltip`は既存`ProfileSection`で使用できる。能力値ポイントの生き様名表示は既存要件と異なるが、ユーザーの最新指示を優先する。現行`BuildSection`は`hasAttributeError`を能力値ポイントと成長の両入力へ渡しており、両方の局所エラーを分離できていない。

### 対応方針

- 経験点の入力と派生値を、既存の基本情報内で信用に近接する専用領域へ移す。G7の流儀費用だけを集計する責務は保持する。
- 選択済みマスタから流儀増加値と現レベルの生き様係数を表示する。共通スキル入力はG14まで追加せず、G7では合計レベル0・未獲得として、選択中プライマリ流儀の既存表示用ボーナス文字列をそのまま参照表示する。G14で実際の合計・獲得色へ接続する。
- 削除buttonのborderをdanger色へ分離し、成長点は既存Tooltipを再利用する。
- 能力値ポイント候補は生き様名なしのラベルへ統一し、Tooltipで「生き様の4値と0を5能力値へ一度ずつ割り振る」ことを示す。成長点Tooltipには「格が15の倍数になるたびに格÷15点獲得します。（格が15で1点、格が30で2点）２点以上獲得した場合は1点ずつ別の能力に割り振る必要があります。」を表示する。
- desktopでは選択領域を能力値表より狭くし、能力値ポイントだけを狭い場合に2行へ分割する。十分な幅がある場合は1行のままにし、残りのヘッダーと値は最小desktop幅でも折り返さない。tablet/mobileの縦積みは保つ。mobileの経験点は取得・消費・残経験点を1行、格だけを次行に置く。
- 格には「プライマリ流儀レベル + 生き様レベル」のTooltipを付ける。
- 派生エラーを、能力値ポイントの割り振り・負数と、成長点の使用可能点超過・負数へ分ける。能力値領域全体はどちらかのerrorで示すが、各入力の`aria-invalid`と見た目は対応する不整合だけに限る。

### 対応完了チェックリスト

- [x] 経験点を基本情報側の信用近傍へ移動し、G7の局所エラー状態を保持する
- [x] 流儀増加値、生き様係数、共通スキルボーナスの参照表示を追加する
- [x] 削除button、能力値ポイント・成長点・格Tooltip、desktop能力値表とmobile経験点の密度を調整する
- [x] 能力値ポイントと成長の局所エラー状態を分離する
- [x] `@character-sheet` targetのVisual Reviewを実行する
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## ビジュアルレビュー 2

### VRT対象

- design target: `character-sheet`
- VRT test / tags: `tests/visual/vrt/character-sheet.spec.ts` / `@character-sheet`
- route / states / viewports: `/character-sheet/` / default / desktop、ultrawide、tablet、mobile

### レビュー結果

| 対象              | 判定       | 差分                                                                                                               | 対応                                                                                                                      |
| ----------------- | ---------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `character-sheet` | 要人間判断 | 4 viewportとも経験点の基本情報側への移動、参照表示、tablet以下の能力値領域の縦積みによりcanonical baselineと不一致 | actualを目視し、mobileの経験点が3項目 + 格の2行、tabletで能力値表に横overflowがないことを確認した。baselineは更新しない。 |

### 確認済み

- [x] desktop最小幅の1280pxで、能力値ポイント以外の列見出しが折り返さず、能力値領域に横overflowがない。
- [x] desktop、ultrawide、tablet、mobileの一時actualを取得し、既存の基本情報・信用入力と同種のUIを維持している。
- [x] canonical baselineとの差分を`npm run visual:test -- --grep character-sheet`で確認した。

### 人間判断が必要な差分

- G7の表示範囲変更によるcanonical VRT baseline更新の要否。ユーザーの明示承認なしに更新していない。

## ビジュアルレビュー 5

### VRT対象

- design target: `character-sheet`
- VRT test / tags: `tests/visual/vrt/character-sheet.spec.ts` / `@vrt.*@character-sheet`
- route / states / viewports: `/character-sheet/` / default / desktop、ultrawide、tablet、mobile

### レビュー結果

| 対象              | 判定       | 差分                                                                                                        | 対応                                                                                                |
| ----------------- | ---------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `character-sheet` | 要人間判断 | 4 viewportともG7の既存未更新baselineと不一致。未算出値を全角ダッシュから半角`-`へ統一したactualは取得済み。 | `-`の表示を含む画面テストが通り、各viewportで横overflowがないことを確認した。baselineは更新しない。 |

### 人間判断が必要な差分

- G7の表示範囲変更によるcanonical VRT baseline更新の要否。ユーザーの明示承認なしに更新していない。

## レビュー指摘 2

### 指摘事項

- 消費経験点と残経験点のread-only表示に計算式Tooltipは不要である。格のTooltipは残す。
- tabletでは流儀・生き様入力と能力値表を横並びにする承認済みdraftと異なり、現在は縦積みになっている。
- 共通スキルボーナスは、titleとLv 2 / Lv 5 / Lv 9の獲得内容をカード状に並べるdraftと異なり、現在は2列のテキスト行になっている。
- 共通スキルLvと上限は最終的に基本情報側へ置くため、G7のビルド領域には表示しない。
- 成長点Tooltipが`CharacterSheetSectionFrame`のclip領域に収まり、全文を読めない。

### 判定

- source: human
- classification: valid
- local validation: 現行`ProfileSection`は消費経験点・残経験点・格のすべてへ`FormulaTooltip`を付与している。`.tmp/design/character-sheet/tablet.png`はtablet（820px）で流儀・生き様入力を左、能力値を右に横並びとし、`BuildSection.module.css`の`width < 80rem`は現在これを縦積みにしている。draftの共通スキルボーナスはLv 2、Lv 5、Lv 9の獲得内容を個別cardとして示し、現在の`共通スキルLv / 上限`行はない。`CharacterSheetSectionFrame.module.css`の`overflow: clip`により、内側の絶対配置Tooltipがframe外へ出られない。`docs/issue/ex-02-web-character-sheet/plan.md`のG14は共通スキルを扱うGateであり、共通スキルLvと上限の基本情報側への最終配置をそこで接続できる。

### 対応方針

- 消費経験点と残経験点は通常のread-only表示へ戻し、格だけに「プライマリ流儀レベル + 生き様レベル」のTooltipを残す。
- tablet（820px）では、draftどおり流儀・生き様を左、能力値を右に置く。能力値表の列幅・入力幅をtablet用に圧縮し、ページとsectionの横overflowを生じさせない。mobileだけは縦積みを維持する。
- 共通スキルボーナスは選択中プライマリ流儀の文字列を解析せず、Lv 2、Lv 5、Lv 9のlabelと内容を個別cardとして表示する。G7では共通スキルLv・上限を表示しない。
- `FormulaTooltip`はsection frameのclipに影響されず、viewport内で全文を読める位置に表示する。既存の基本情報側Tooltipを壊さず、Tooltipの開閉・Escape・touch時のdismiss操作を保持する。
- 共通スキルLvと上限の基本情報側への最終配置・入力との接続はG14で扱う。G7で基本情報の表示項目を先取りしない。

### 対応完了チェックリスト

- [x] 消費経験点・残経験点のTooltipを外し、格のTooltipを維持する
- [x] tabletで流儀・生き様と能力値をdraftどおり横並びにし、横overflowをなくす
- [x] 共通スキルボーナスをLv別のcard表示に直し、共通スキルLv・上限をG7から外す
- [x] 成長点を含むFormulaTooltipをframe外でも全文表示できるようにする
- [x] `@character-sheet` targetのVisual Reviewを実行する
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## ビジュアルレビュー 3

### VRT対象

- design target: `character-sheet`
- VRT test / tags: `tests/visual/vrt/character-sheet.spec.ts` / `@character-sheet`
- route / states / viewports: `/character-sheet/` / default / desktop、ultrawide、tablet、mobile

### レビュー結果

| 対象              | 判定       | 差分                                                                                                                   | 対応                                                                                                 |
| ----------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `character-sheet` | 要人間判断 | 4 viewportともG7の入力・参照表示の追加でcanonical baselineと不一致。tabletは横並びへ戻り、共通スキル表示も変更された。 | 4 viewportのactualを取得し、tabletの横overflowなし、mobileの縦積みを確認した。baselineは更新しない。 |

### 確認済み

- [x] 820px tabletで流儀・生き様と能力値が横並びであり、`BuildSection`に横overflowがない。
- [x] 成長点Tooltipをhoverで開き、frame外へ表示されてもviewport内で確認できる。
- [x] 変更targetだけをcanonical VRT baselineと比較した。

### 人間判断が必要な差分

- G7の表示範囲変更によるcanonical VRT baseline更新の要否。ユーザーの明示承認なしに更新していない。

## レビュー指摘 3

### 指摘事項

- プライマリ流儀の体力増加・精神力増加と、生き様の体力係数・精神力係数は、全viewportで4項目を横並びにする。
- `characterSheet.build`へ置かれたゲーム用語を、所有者に応じて原則`gameDomain.terms`へ移す。キャラクターシート固有の操作・構造見出しだけを`characterSheet`側に残す。
- 未算出値の`-`表示が各componentへ散在している。表示記号を辞書で一元管理し、`null`・`undefined`を表示記号へ変換する処理を専用関数へ閉じ込める。
- プライマリ流儀または生き様の片方だけが未選択でも、両方を必要としない値まで一律に`-`にしない。プライマリ流儀だけで決まる値、生き様だけで決まる値、その他流儀を含めて独立に集計できる経験点、および両レベルから算出できる格を、それぞれ表示する。

### 判定

- source: human
- classification: valid
- local validation: `BuildSection.module.css`はmobileで参照値を2列に切り替えており、`docs/design/character-sheet/notes.md`の「流儀増加値、生き様係数、共通スキルボーナスは、読める範囲で横方向へ圧縮する」と一致しない。`characterSheetDictionary.characterSheet.build`には、流儀、生き様、能力値、格、体力・精神力の係数・増加値など、他Gateでも共有するゲーム用語が混在している。一方、追加・削除、未選択、section名などはキャラクターシートUI固有である。現在は`BuildSection`と`ProfileSection`に`value ?? "-"`が散在する。`calculateBuild`はプライマリ流儀と生き様の両方を選んだ場合だけ参照値・経験点・能力値を返すため、片方だけで確定できるプライマリ流儀の基礎値・増加値・共通スキルボーナス、生き様の能力値ポイント・係数、経験点の部分集計まで`-`になる。格は選択マスタを必要とせず、最低値1のプライマリ流儀・生き様レベルから初期値2として算出できる。ユーザーの最新指示により、`docs/requirements/character-sheet.md`の両方未選択時に一律`-`とする記述は、このGateの表示要件として調整する。

### 対応方針

- 参照値gridは、desktop、tablet、mobileとも4列を維持する。各metricを最小幅0の等幅列として圧縮し、横overflowを生じさせない。
- `gameDomain.terms`へ、流儀、生き様、その他流儀、レベル、格、能力値、経験点、能力値の各列、体力・精神力の係数・増加値、共通スキルボーナスなどのゲーム用語を移す。追加・削除、未選択、基本情報・流儀と生き様などの画面固有copyは`characterSheet`側に残す。既存の信用など同じ所有者の用語と構造をそろえる。
- 未算出表示の記号`-`を辞書へ登録し、数値・文字列・`null`・`undefined`を一貫して表示値へ変換する専用format関数を追加する。componentから個別の`?? "-"`を除き、format関数だけがfallbackを判断する。
- `calculateBuild`を、プライマリ流儀由来、生き様由来、両方由来の値に分けて返す。プライマリ流儀だけで決まる基礎能力値・体力／精神力増加・共通スキルボーナス、生き様だけで決まる能力値ポイント候補・体力／精神力係数、その他流儀を含めて独立に合算できる消費・残経験点は、片方が未選択でも表示する。格は選択状態にかかわらずプライマリ流儀レベルと生き様レベルの合計として表示し、初期値は2とする。マスタの両方を必要とする成長可能点、常時能力値、一時能力値だけを`-`にする。能力値ポイントの一致検証と成長検証も、それぞれに必要な選択値がある場合だけ実施し、入力値は保持する。

### 対応完了チェックリスト

- [x] 4つの流儀増加値・生き様係数を全viewportで横並びにする
- [x] ゲーム用語を`gameDomain.terms`へ整理し、画面固有copyを`characterSheet`側に残す
- [x] 未算出値の記号とfallbackを辞書・専用format関数へ一元化する
- [x] 片方だけ未選択のときも独立した派生値・経験点と格（初期値2）を表示し、両方のマスタに依存する値だけを未算出表示にする
- [x] `@character-sheet` targetのVisual Reviewを実行する
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## ビジュアルレビュー 4

### VRT対象

- design target: `character-sheet`
- VRT test / tags: `tests/visual/vrt/character-sheet.spec.ts` / `@vrt.*@character-sheet`
- route / states / viewports: `/character-sheet/` / default / desktop、ultrawide、tablet、mobile

### レビュー結果

| 対象              | 判定       | 差分                                                                                                                       | 対応                                                                                                |
| ----------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `character-sheet` | 要人間判断 | 4 viewportともG7の既存未更新baselineと不一致。今回のdefault値・参照値4列化による新しいcanonical baselineは更新していない。 | mobile actualで参照値4項目と共通スキルボーナス3項目が横並びであり、横overflowがないことを確認した。 |

### 人間判断が必要な差分

- G7の表示範囲変更によるcanonical VRT baseline更新の要否。ユーザーの明示承認なしに更新していない。
