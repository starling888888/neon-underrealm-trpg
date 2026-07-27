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
- プライマリ流儀または生き様が未選択の間は、格、消費経験点、残経験点、成長可能点、能力値の基礎値・常時能力値・一時能力値を`—`で表示する。生き様の能力値ポイントは`0, 0, 0, 0`、5つの能力値ポイント入力はすべて`0`とし、未選択自体と能力値ポイントの一致はエラーにしない。生き様を選択しても能力値ポイントを自動配分・自動補正せず、入力を保持したまま生成JSONとの不一致を局所エラーで示す。選択後は通常の派生・検証へ切り替える。
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

- [ ] プライマリ流儀・生き様は各1レベルを初期値・最低値とし、取得経験点は50点を初期値として表示する。
- [ ] その他流儀は初期0行で追加・削除でき、重複状態を局所エラーで示せる。
- [ ] 選択中のgenerated dataを使い、5能力値の編集可能値とread-only派生値を表示する。
- [ ] 生き様の`attributePoints`と能力値ポイントの不一致、成長可能点超過、経験点超過を、入力を保持したまま局所エラーで示せる。
- [ ] エラー文言のレビュー・全体エラー集約を追加せず、対象入力のUIだけを扱っている。
- [ ] desktop / tablet / mobileで既存の基本情報・画像・信用との配置を保ち、横overflowがない。
- [ ] `tests/visual/vrt/character-sheet.spec.ts`の`@character-sheet`に限定してVisual Reviewを行い、canonical VRT baselineはユーザーの明示承認なしに更新しない。
- [ ] `npm run check` が通る。
- [ ] `npm run build` が通る。

## チェックポイント

- [ ] 既存の`ProfileSection`と同種の入力UIを優先し、基本情報・画像・信用のDOM順、配置、既存操作を壊していない。
- [ ] 既存のdesktop 2列、tablet/mobile 1列のlayout regionと、GitHub Pagesのサブパス公開を壊していない。
- [ ] 数値の中間入力と不整合値を保持し、HTMLの`min`やschemaだけで入力を拒否していない。
- [ ] G7の費用責務と、後続Gate/G16が加える費用責務を混同していない。
- [ ] 既存generated JSONのaccessorを利用し、不要なデータ変換・依存関係を追加していない。
- [ ] `docs/TODO.md` のmemo化保留と、`docs/out-of-scope.md` の直接編集式・非ウィザード方針に矛盾していない。
- [ ] ユーザーの未コミット変更を破壊していない。

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
