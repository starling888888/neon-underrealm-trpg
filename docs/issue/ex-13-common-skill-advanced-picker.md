# ex-13-common-skill-advanced-picker

## 目的

共通スキルの`advanced`を、共通スキルレベル上限が6以上のキャラクターだけが候補ダイアログで選べるようにする。

## 背景

`5c5846f4b287b2f70e019cf814f51ca2e3eebc13`以降のデータ更新で、共通スキルの`advanced`が追加された。ルールブック側の`src/pages/data/common-skills.mdx`は、共通スキルを合計5レベル以上取得したキャラクターだけが取得できることをすでに明記している。

キャラクターシートでは、流儀と生き様の`advanced`にならい、候補の表示と取得済みスキルの構造化検証を扱う。今回の簡略化された判定は、現在取得している共通スキル合計ではなく、`格`から算出した共通スキルレベル上限が6以上かどうかとする。

- `docs/requirements/character-sheet.md`のスキル、`advanced`条件、共通スキル上限の要件を参照する。
- `docs/design/character-sheet/notes.md`の共通スキル領域、候補ダイアログ、エラー表示、VRT方針を参照する。
- `docs/TODO.md`にある候補行を選択可能に見せるdesign検討は、候補の視覚デザインを変更する別taskであり、このissueでは扱わない。

## 対象範囲

- 共通スキル候補の取得処理を、共通スキルレベル上限が6未満なら`basic`だけ、6以上なら`basic`と`advanced`を返すようにする。
- `docs/requirements/character-sheet.md`へ、共通スキル`advanced`は上限6以上で候補に含め、条件低下後は保持して行・区分エラーにすることを記録する。実際の共通スキル取得合計5レベルは、このタスクでは検証しない簡略化条件であることも明記する。
- 共通スキルの構造化検証へ`advanced`条件を追加する。取得済み`advanced`の後に共通スキルレベル上限が6未満になった場合、選択値を保持して該当行と共通スキル区分をエラー状態にする。
- 共通スキル候補と検証を利用するフォームpresenter、エラー一覧、section表示へ必要な値を接続する。エラー一覧は、対象スキル名と共通スキルレベル上限6以上が必要であること、および現在の上限を示す。
- 共通スキルの候補・検証・フォーム連携・エラー一覧の自動テストを追加または更新する。
- 既存の`common-skill-picker` VRTで上限6未満の`advanced`非表示を確認し、上限6以上で`advanced`を表示する候補dialog stateを追加する。対象route・dialog state・desktop/tablet/mobileのactual screenshotを開いて確認する。canonical VRT baselineの追加または更新は、実装後に別途ユーザー承認を得てから行う。

## 初期スコープ外

- 実際の共通スキル取得合計が5以上かを厳密に検証しない。
- 前提スキル、個別取得制限、排他、能力値・格・アイテム条件など、自由文の条件を自動解析しない。
- 共通スキル候補ダイアログのレイアウト、文言、操作導線を変更しない。
- 共通スキルデータ、ルールブック本文、他の流儀・生き様の`advanced`条件を変更しない。
- `docs/out-of-scope.md`で除外されるDB、認証、SSR、汎用ルールエンジンを追加しない。

## 完了条件

- [x] 共通スキルレベル上限が6未満のとき、候補ダイアログに`advanced`を表示しない。
- [x] 共通スキルレベル上限が6以上のとき、候補ダイアログに`basic`と`advanced`を表示する。
- [x] 取得済み`advanced`の後に上限が6未満になったとき、選択値を保持し、該当行と共通スキル区分をエラー状態にする。
- [x] 取得済み`advanced`が条件を満たさなくなったとき、対象スキル名、共通スキルレベル上限6以上の要件、現在の上限をエラー一覧へ表示する。
- [x] `advanced`の解禁判定は、実際の共通スキル取得合計5レベルではなく、共通スキルレベル上限6以上に限定する。
- [x] 共通スキルの重複、最大Lv、合計レベル上限の既存検証を維持する。
- [x] 関連TODOを扱わない理由が記録されている。
- [x] 参照するdesign targetとVRT baselineの扱いが記録されている。
- [x] `docs/requirements/character-sheet.md`へ、今回の共通スキル`advanced`条件と簡略化の境界が記録されている。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## チェックポイント

- [x] `/character-sheet/`の既存ルートとスキル選択操作が壊れていない。
- [x] GitHub Pagesのサブパス公開に影響しない。
- [x] 不要な依存関係を追加していない。
- [x] 初期スコープ外の機能を実装していない。
- [x] 関連する`docs/TODO.md`の候補行design検討と矛盾していない。
- [x] `docs/design/character-sheet/notes.md`の候補ダイアログとエラー表示の意図に矛盾していない。
- [x] `/character-sheet/`の`common-skill-picker`について、上限6未満の`advanced`非表示と上限6以上の表示をdesktop/tablet/mobileごとのactual screenshotで確認する。PR直前に対象VRTだけを実行し、baseline追加または更新は別途ユーザー承認を得る。
- [x] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `src/character-sheet/master-data/common-skills.ts`
- `src/character-sheet/logic/common-skills.ts`
- `src/character-sheet/form/useCommonSkillsSectionProps.ts`
- `src/character-sheet/form/useCharacterSheetErrorSummary.ts`
- `src/character-sheet/components/sections/CommonSkillsSection.tsx`
- `src/character-sheet/logic/error-summary.ts`
- `docs/requirements/character-sheet.md`
- `tests/node/character-sheet/common-skills.test.ts`
- `tests/node/character-sheet/error-summary.test.ts`
- `tests/hooks/character-sheet/useCharacterSheetFormPresenterProps.test.tsx`
- `tests/vrt/character-sheet.spec.ts`

## レビュー観点

- `advanced`の候補表示と保持後のエラー判定が、流儀・生き様の既存実装と同じ方針になっているか。
- 解禁判定を、今回指定された共通スキルレベル上限6以上へ限定し、取得済み共通スキル合計5レベルの厳密判定を混ぜていないか。
- 既存の候補ダイアログのレイアウト・導線を変えず、`docs/design/character-sheet/notes.md`にあるエラー表現と、エラー一覧の条件文を保てているか。
- 既存の低上限VRTと上限6以上の候補dialog stateを、desktop/tablet/mobileで実画面確認できるか。baseline追加または更新が必要なら、実行前に別途承認を得る段取りになっているか。
- `docs/TODO.md`の候補行を選択可能に見せるdesign検討を、この機能修正へ混ぜていないか。

## 備考

- ブランチは`ex-13-common-skill-advanced-picker`。
- 実装前に、このissue内容のユーザー承認が必要である。

## ビジュアルレビュー 1

### VRT対象

- design target: `docs/design/character-sheet/notes.md`
- VRT test / tags: `tests/vrt/character-sheet.spec.ts`、`@vrt @character-sheet @dialog @common-skill-picker`、`@common-skill-advanced-picker`
- route / states / viewports:
  - `/character-sheet/`、共通スキル上限6未満の候補dialog、desktop / tablet / mobile
  - `/character-sheet/`、共通スキル上限6以上でadvanced候補へscrollした候補dialog、desktop / tablet / mobile

### レビュー結果

| 対象                  | 判定 | 差分                                 | 対応     |
| --------------------- | ---- | ------------------------------------ | -------- |
| 上限6未満の候補dialog | OK   | local canonical baselineと一致       | 比較済み |
| 上限6以上の候補dialog | OK   | local canonical baselineを更新し一致 | 比較済み |

### 実画面確認

- `/character-sheet/` / 上限6未満の候補dialog / desktop, tablet, mobile:
  - locator screenshot: `dialog[aria-label="共通スキルを選択"]`、original pixel resolution
  - checked acceptance criteria: basic候補だけの表示、候補表の列、文言、dialog境界、折返し、clipping、overflow、操作control
  - result: OK
- `/character-sheet/` / 上限6以上のadvanced候補dialog / desktop, tablet, mobile:
  - locator screenshot: `dialog[aria-label="共通スキルを選択"]`、original pixel resolution
  - checked acceptance criteria: `裏社会の繋がり`を含むadvanced候補の表示、候補表の列、文言、dialog境界、折返し、clipping、overflow、操作control
  - result: OK。local canonical baselineを更新し、再比較で一致

### 自己修正した項目

- [x] advanced候補が原寸locator screenshotに入るよう、上限6以上のVRT stateで最初のadvanced候補までdialog内容をscrollする準備処理を追加した。

### 人間判断が必要な差分

- なし。ユーザー承認後にlocal canonical baselineを更新した。

### 対応完了チェックリスト

- [x] 変更targetだけをVRT比較した
- [x] 変更targetだけの一時snapshotを取得した
- [x] current issueの受入条件と最終diffから対象stateを列挙した
- [x] 宣言したすべてのroute / state / viewportで、局所表示契約ごとの原寸locator screenshotを開いて確認した
- [x] full-page screenshotを局所表示契約の確認根拠に使っていない
- [x] VRT差分を修正した、または修正不要と判断した
- [x] baseline更新が必要な差分を人間判断として記録した
- [x] `npm run check` が通る（該当する場合）
- [x] `npm run build` が通る（`npm run visual:build`で確認済み）

## レビュー指摘 1

### 指摘事項

- `canonical-snapshots/visual/character-sheet/dialogs/common-skill-advanced-picker-{desktop,tablet,mobile}.png`をGit管理へ追加している。canonical VRT baselineはlocal-only artifactとしてGitで無視する必要がある。
- 上限6未満の候補dialog VRTは先頭だけを撮影するため、advanced候補が末尾へ混入しても検出できない。hook testにも、上限低下後に候補一覧からadvancedが消える確認がない。`getCommonSkillCandidates`の既定値`6`は、引数を渡し忘れた場合に解禁状態へ倒れる。

### 判定

- source: local-pr-review, `.tmp/chatgpt-review.md`
- classification: valid
- local validation:
  - `.agents/rules/data-management.md`と`docs/design/character-sheet/notes.md`はcanonical VRT baselineをlocal-only comparison inputとしてGitで無視することを定める。PRに3 PNGを含めた状態は規約と矛盾する。
  - `.tmp/chatgpt-review.md`も同じ3 PNGのGit管理を修正必須と指摘しており、ローカルSSoTとの照合で有効と確認した。
  - 現在の低上限VRTはdialog先頭だけを撮影し、advanced候補を明示的に不在確認しない。hook testは上限低下後の既存選択のエラーを確認するが、候補配列のadvanced不在を確認しない。候補取得関数の既定値は`6`である。

### 対応方針

- Git管理済みの3 PNGをPR差分から除外し、local-only baselineは残して比較に使う。Visual Review記録をGit追加ではなくlocal canonical baseline更新へ修正する。
- `levelLimit`を必須引数にし、低上限時にadvanced候補が候補一覧に含まれないことをhook testで確認する。VRT準備では代表advanced候補がないことを明示的にassertする。

### 対応完了チェックリスト

- [x] 3枚のcanonical VRT baselineをGit管理から除外する
- [x] Visual Review記録をlocal-only baselineの方針へ修正する
- [x] 低上限時のadvanced候補不在をhook testで確認する
- [x] 低上限VRTで代表advanced候補の不在をassertする
- [x] `getCommonSkillCandidates`のlevelLimitを必須引数にする
- [x] `npm test` が通る
- [x] `npm run check` が通る
- [x] `npm run visual:build` が通る
- [x] 変更targetだけのVRT比較が通る

## ビジュアルレビュー 2

### VRT対象

- route: `/character-sheet/`
- state: 共通スキル候補dialog（上限6未満）、advanced候補を含む共通スキル候補dialog（上限6以上）
- viewport: desktop, tablet, mobile

### 結果

| 対象                  | 判定 | 根拠                                                        |
| --------------------- | ---- | ----------------------------------------------------------- |
| 上限6未満の候補dialog | OK   | 代表advanced候補`裏社会の繋がり`の不在assertとlocal比較一致 |
| 上限6以上の候補dialog | OK   | `裏社会の繋がり`の表示とlocal比較一致                       |

### 実画面確認

- 各state・viewportのactual screenshotを開き、dialog境界、表の列、文言、折返し、clipping、overflow、操作controlを確認した。
- 上限6未満ではadvanced候補が表示されず、上限6以上では`裏社会の繋がり`が表示されることを確認した。
- `npm run visual:capture -- --grep 'common-skill-(?:advanced-)?picker'`、`npm run visual:test -- --grep 'common-skill-(?:advanced-)?picker'`が各6件通過した。
