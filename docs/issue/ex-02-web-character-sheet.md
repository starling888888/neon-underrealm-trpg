# ex-02-web-character-sheet

## 目的

Webキャラクターシートを一括実装せず、既存サイトのルール・データ・本文と整合する要件正本、3 viewport のデザインドラフト、実装アーキテクチャ、レビュー可能な実装ゲートを順に確定する。

各実装ゲートは、可能な限り「途中だが動く」縦方向の機能単位とする。複数機能に必要な実行基盤、layout、dialog、集約表示、統合確認は横断Gateとして許容し、専用Gate planと子issueで独立して管理する。

## 背景

`docs/plan.md` の `ex-02-web-character-sheet` は、ルールを通読する前のPLでもキャラクターを作り始められるWebキャラクターシートを初期スコープに含めている。

作業入力には以下がある。

- `.tmp/character-sheet-architecture.md`: React Island、責務分離、テスト、レビューの方針
- `.tmp/character-sheet-design-draft.jpg`: デスクトップの配置ラフ

これらは作業入力であり、実装の正本は次の段階でGit管理下に整理する。既存のルール本文・データ表示要件と矛盾する場合は、対話により採用方針を決め、正本側を更新してから後続へ進む。

関連参照:

- `docs/requirements.md`
- `docs/requirements/character-sheet.md`
- `docs/architectures/character-sheet.md`
- `docs/requirements/overview.md`
- `docs/requirements/architecture.md`
- `docs/requirements/non-functional.md`
- `docs/requirements/data-display.md`
- `docs/requirements/data-id-policy.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md` の「キャラクターシートの永続スキル参照でID変更を検出してエラーにする」
- `src/pages/character-making.mdx`、`src/pages/rules/battle.mdx`、`src/pages/advancement.mdx`、および`src/pages/data/`配下のゲーム仕様ページ
- `data/generated/ryugi-list.json`、`data/generated/ryugi-skills.json`、`data/generated/ikizama.json`、`data/generated/ikizama-skills.json`、`data/generated/common-skills.json`、`data/generated/items.json`
- `.agents/skills/design-image-generation/SKILL.md`

## 対象範囲

このissueは、`ex-02`全体を追跡する親task contractである。第1～4段階で実装開始条件と実装ゲートを確定し、第5段階では承認済みのゲートを順に実装・レビューして、`docs/plan.md`の`ex-02`完了条件を満たす。以下の順序を守る。

1. 機能要件の正本化
   - 既存サイトコンテンツ、既存要件、生成済みJSONの構造を照合する。
   - `docs/requirements/character-sheet.md`を新設し、入力、表示、算出、検証、保存・復元、出力、アクセシビリティ、レスポンシブ、明示的な初期スコープ外を正本化する。
   - `docs/requirements.md`の索引へ追加し、矛盾する既存要件・スコープ文書はユーザー承認後に同じ作業で整合させる。
   - `docs/requirements/character-sheet.md`に定義するすべての機能を初期scopeとして採用する。自動算出、マスタ選択、JSON入出力、端末内保存、画像、CCFOLIA出力を除外しない。
   - 要件正本化では、採用済み機能と明示的な初期スコープ外を区別して記録する。実装ゲートへのroutingは、designとアーキテクチャの決定後に行う。
   - 共通スキルボーナスは表示用データを維持する。専用の構造化データ、文字列解析、自動算出は追加しない。
   - 不明点または競合を推測で決めず、論点・選択肢・影響を示してユーザーと対話し、回答を要件正本へ反映する。
2. デザインドラフト
   - 要件正本を入力に、`desktop`、`tablet`、`mobile`の3 viewportについて、情報配置、操作導線、可変行、エラー・警告、保存・復元、空状態、狭幅時の優先順位を含むドラフトを作る。
   - 作成前と必要な節目でユーザーに確認し、未決定のレイアウト・表現を独断で固定しない。
   - 対話用draftの作成手段、作業artifactの保存場所、Git管理対象、承認点、desktop/tablet/mobileの具体的viewport値をユーザーと決める。draft画像の作成は、ユーザーが明示的に指示した場合に限り、`design-image-generation`で`.tmp/design/character-sheet/`のHTML prototypeとlocal captureを使う。draftはGit管理・`docs/design/`・VRT baselineの正本にしない。
   - 対話で承認されたdesign intentを、`design-image-generation`の手順で`docs/design/character-sheet/notes.md`へ記録する。VRT target、viewport、状態、比較観点を記録する。実装後のcanonical visual baselineはPlaywright VRT snapshotだけとする。
3. アーキテクチャと依存ライブラリの決定
   - 承認済み機能要件とデザインを入力に、Astroとの接続、React Islandの範囲、状態・副作用・純粋ロジック・表示の分離、保存方式、データ参照、テスト責務、依存ライブラリを決める。JSON入出力形式、CCFOLIA出力形式、実行時schemaの具体形と、追加test toolingの選定は対応する実装Gateの着手直前に決める。
   - `docs/architectures/character-sheet.md`を新設する案を第一候補とし、サイト全体の`docs/requirements/architecture.md`とは重複させず、キャラクターシート固有の決定と根拠を記録する。
   - 依存ライブラリは必要性、代替案、静的公開・容量・保守性への影響を比較してから決める。新規追加は承認済み要件・アーキテクチャに根拠を記録する。
4. 実装ゲートの列挙
   - 機能または画面セクションごとに、schema、状態、logic、UI、テストを必要範囲で含む実装ゲートを、`docs/issue/ex-02-web-character-sheet/plan.md`で列挙する。複数機能に必要な横断Gateは、必要性と範囲を明記して許容する。
   - schema、JSON形式、共通基盤を全機能分まとめて先行実装せず、各ゲートで必要になった範囲だけを追加する。
   - Gate planには、子issue作成の起点となるGateの列挙、順序、依存、最小範囲だけを記録する。Gate実装のSSoTは、着手時に作成・承認する子issueとする。
   - `docs/plan.md`へ子タスクまたは子チェックボックスを追加しない。
   - ゲート一覧をユーザーが承認するまで、実装を開始しない。
5. ゲートごとの実装とレビュー
   - 承認済みの実装ゲートを一度に複数進めず、1ゲートのみ実装する。
   - コード変更の直前に、対象Gate専用の子issueを作成してユーザー承認を受ける。
   - 実装中の画面配置・状態表現は、`.tmp/design/character-sheet/`にある最新の対話用画面draftを参照して遵守する。ただし、ユーザーの最新指示がdraftまたはdesign notesと異なる場合は、ユーザー指示を優先する。
   - 実装、対応テスト、必要な限定VRT、ローカル確認結果、手動確認手順、既知の未実装事項を提示して停止し、ユーザーレビューを受ける。
   - ユーザーの明示指示後に、そのゲートの範囲だけをコミットする。
   - すべての実装ゲートのレビュー・確認が完了するまで、この親issueを完了扱いにしない。

## Gate plan

実装ゲートの一覧、順序、Gate brief、完了後の引継ぎは`docs/issue/ex-02-web-character-sheet/plan.md`だけで管理する。現時点で採用する実装スコープは、`docs/requirements/character-sheet.md`に定義する全機能である。

## 初期スコープ外

- このissueの承認前に、キャラクターシートのAstroページ、React Island、schema、JSON形式、保存処理、UI、依存ライブラリを実装しない。
- サーバー側データベース、認証、アカウント、クラウド保存、複数端末同期、共有URL、共同編集、PDF出力、印刷レイアウト、ダイスローラー、戦闘シミュレーター、汎用的なルール文章解析エンジンを実装しない。
- 全機能分の巨大な先行基盤・schema・状態管理を作らない。
- ユーザー承認なしにcanonical VRT baselineを更新しない。
- `docs/plan.md`の完了チェックを更新しない。
- `docs/plan.md`へ実装ゲートの子タスクまたは子チェックボックスを追加しない。

## 完了条件

- [x] `docs/requirements/character-sheet.md`が既存コンテンツ・データ・初回実装仕様を参照して正本化され、`docs/requirements.md`から参照できる。
- [x] 要件・`src/pages/`配下のゲーム仕様・生成JSON・初期スコープ文書の競合と不明点が、ユーザーとの対話によって解消または明示的に初期スコープ外へ分類されている。
- [x] `docs/requirements/character-sheet.md`に定義する全機能を、初期scopeとして採用する。
- [ ] desktop、tablet、mobileのdesign draftと`docs/design/character-sheet/notes.md`がユーザー確認済みである。
- [ ] `docs/architectures/character-sheet.md`の配置可否、アーキテクチャ、データ境界、依存ライブラリ、scoped CSS方針がユーザー承認済みである。
- [ ] 実装ゲートが縦方向・1コミット相当・単独で確認可能な単位に列挙され、順序とレビュー手順がユーザー承認済みである。
- [ ] 各実装ゲートで必要なdesign targetとVRT baselineの扱いが記録されている。
- [ ] 対話用design draftをHTML prototypeとlocal captureで作成でき、承認後に`design-image-generation`でdesign intentとVRT参照情報を記録する手順が定義されている。draftはGit管理・`docs/design/`・canonical VRT baselineの正本にしない。
- [ ] 関連TODOごとに、承認済み実装ゲートで回収するか、将来TODOとして維持するか、不採用にするかを理由とともに記録している。
- [ ] 実装を開始した各ゲートで、`npm run check`、`npm run build`、対象テスト、必要な限定VRTの確認結果を記録している。
- [ ] 承認済みの実装ゲートをすべて実装・ユーザーレビューし、初めて本作に触れるPLが作成を始められる導線、モバイルでの入力・閲覧、遊ぶために必要な情報の確認、対象VRTの比較を完了している。

## チェックポイント

- [x] `docs/requirements/character-sheet.md`を追加する際、既存の要件索引と重複させずに参照関係を更新している。
- [x] 端末内の最新1件復元は初期scopeに含める。初期スコープ外の「永続保存」は、ユーザー端末に依存しない管理DB・クラウド等へキャラクターデータを保存することとして定義し、`docs/out-of-scope.md`へ反映済みである。
- [x] 実装ゲートは専用Gate planとGateごとの子issueで管理し、`docs/plan.md`へ子タスクまたは子チェックボックスを追加しない。
- [x] `src/pages/`配下のゲーム仕様と生成JSONを正本として、初回仕様の縁の項目、リアクションで選べる能力値、能力値配分、武器の所持・装備状態を整合させている。
- [x] フルスクラッチにおけるプライマリ流儀・生き様の初期1レベル無料と、消費経験点の算出式を整合させている。
- [x] `docs/requirements/overview.md`と`docs/out-of-scope.md`で、キャラクター作成ウィザードは初期スコープ外とし、`ex-02-web-character-sheet`の直接編集式キャラクターシートは初期scopeであることを明確化している。
- [x] React Islandを`ex-02`の承認済み範囲として採用し、関連TODOの検討事項を解消している。
- [ ] GitHub Pagesのサブパス公開、静的ホスティング、不要な依存ライブラリを追加しない方針に適合している。
- [ ] 各タスクで変更対象のUIに限定したVRTを実施し、全件VRTを通常実行しない方針を維持している。
- [ ] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `docs/issue/ex-02-web-character-sheet.md`
- `docs/issue/ex-02-web-character-sheet/plan.md`
- `docs/requirements/character-sheet.md`
- `docs/requirements.md`
- `docs/requirements/overview.md`（既存スコープ記述の整合が必要な場合）
- `docs/out-of-scope.md`（保存方針など既存スコープ記述の整合が必要な場合）
- `docs/design/character-sheet/notes.md`
- `docs/design/character-sheet/`
- `docs/architectures/character-sheet.md`
- `docs/TODO.md`（既存TODOの扱いを変更する場合のみ）

## レビュー観点

- 5段階の順序（要件正本化、対話的design、アーキテクチャ決定、タスク分割、タスクごとの実装・レビュー）が妥当か。
- `docs/architectures/character-sheet.md`を新設して、サイト全体アーキテクチャ要件とキャラクターシート固有の決定を分ける方針が妥当か。
- 対話用design draftの作成手段、保存場所、Git管理範囲、desktop/tablet/mobileの具体的viewport値が妥当か。`design-image-generation`は、ユーザー明示指示時の`.tmp/` HTML draft / local capture、承認済みintentのnotes化、VRT参照記録を担い、実装・Visual Review・canonical VRT更新を混同しない。

## レビュー指摘 1

### 指摘事項

- `normalizeBuildInput` が副能力値を含む共通の整数入力正規化に使われている一方、名称とコメントが G7 のビルド専用に見える。
- `FormulaTooltip` は fixed 配置だが、開いた後に scroll しても閉じず、trigger と位置が離れうる。
- 副能力値の logic test が、生き様レベルの係数境界とプライマリ流儀レベル 2 以上を確認していない。
- `calculateSecondaryAttributes` が利用しない G7 の派生値まで含む `BuildDerivedValues` に型上依存している。
- `useCharacterSheetFormPresenterProps` が profile、build、副能力値、縁とそれぞれの派生値・操作を一つの hook に保持しており、後続 section を追加すると adapter の責務境界が不明瞭になる。

### 判定

- source: unknown（`.tmp/chatgpt-review.md` の ChatGPT review draft）
- classification: valid
- local validation:
  - `src/character-sheet/schemas/character-sheet-form.ts` の `normalizeBuildInput` は `useCharacterSheetFormPresenterProps` でビルド入力と副能力値入力の両方に使用されている。
  - `src/character-sheet/components/FormulaTooltip.tsx` は open 中に `resize` だけを監視し、scroll 時の位置更新・dismiss を行わない。
  - `tests/node/character-sheet/secondary-attributes.test.ts` は選択済みビルドのレベル 1 を中心に確認している。係数境界は `docs/requirements/character-sheet.md` と `calculateBuild` で 1–3、4–9、10 以上として定義されている。
  - `calculateSecondaryAttributes` が実際に参照するのは、能力値、プライマリ流儀レベル、体力・精神力の参照値だけである。
  - `useCharacterSheetFormPresenterProps` は profile、build、副能力値、縁の watch、派生値算出、section 操作、縁の行同期を同居させている。各 section は独立した state lifecycle と test setup を持つため、後続 Gate の追加前に section 別 hook へ分ける合理性がある。
  - review draft が指摘する visual review の手順逸脱は `docs/agent-failure-log.md` に既に記録済みであり、新規 failure entry は追加しない。

### 対応方針

- Gate を追加・再開せず、この親 issue の Gate 外レビュー修正として扱う。作業 branch は現在の `ex-02-web-character-sheet` を継続使用する。
- 共通の整数入力正規化を用途に即した名称へ改め、ビルド・副能力値・既存の利用箇所を同じ契約へ接続する。数値の fallback、整数化、ゲーム制約を課さない既存の挙動は変更しない。
- `FormulaTooltip` は open 中の scroll で閉じる。scroll に追従して再配置する機能は追加しない。Component test で dismiss を確認する。
- 副能力値 logic は必要最小限の入力型へ狭める。係数境界（生き様レベル 1、4、10）とプライマリ流儀レベル 2 の table-driven Node test を追加する。
- `useCharacterSheetFormPresenterProps` は section props hook の合成だけを担うようにし、profile、build、副能力値、縁はそれぞれ専用 hook へ移す。各 hook は対応 section の watch、派生値、更新 callback、縁の行同期を所有する。RHF と Presenter の props 契約、画面挙動、ゲーム算出式は変更しない。
- 分割前後で既存の hook test を維持し、section hook の責務を局所テストで確認する。`useMemo`、`useCallback`、`React.memo` による参照安定化は、既存 TODO の条件が満たされるまで追加しない。
- UI の見た目・レイアウト、VRT baseline、ゲーム算出式、依存パッケージは変更しない。

### 対応完了チェックリスト

- [x] 共通の整数入力正規化を用途に即した名称へ変更し、既存の入力挙動を保つ
- [x] open 中の `FormulaTooltip` が scroll で閉じる
- [x] `FormulaTooltip` の scroll dismiss を Component test で確認する
- [x] `calculateSecondaryAttributes` の入力型を必要最小限へ狭める
- [x] 副能力値の係数境界とプライマリ流儀レベルを Node test で確認する
- [x] `useCharacterSheetFormPresenterProps` を section props hook の合成へ分割する
- [x] 分割した section hook の派生値と更新 callback を hook test で確認する
- [x] 既存ルートが壊れていない
- [x] GitHub Pages のサブパス公開に影響しない
- [x] 不要な依存関係を追加していない
- [x] 初期スコープ外の機能を実装していない
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## レビュー指摘 2

### 指摘事項

- desktopの等分2列で左右の表示領域の高さが大きく異なるため、`判定` sectionを右列ではなく左列へ移したい。
- `画像を選択`と各種の`〜を追加` buttonは、font sizeと高さ・paddingが統一されていない。特にサイバネの`その他の部位を追加`は、ほかの操作より大きく見える。

### 判定

- source: human
- classification: valid
- local validation:
  - `CharacterSheetFormPresenter`はdesktopで`判定`をright secondary columnの先頭へ置いている。Gate planのG10もこの旧配置を記録している。
  - `画像を選択`は`ProfileSection.module.css`の個別styleで`--text-xs`と小さいpaddingを指定する一方、サイバネ・武器・お守りの追加buttonは各sectionのstyleで`2rem`の最小高、`--text-sm`、大きいpaddingを指定している。追加buttonのstyleは複数ファイルに分散している。
  - 最新のユーザー指示により、旧G10配置と個別button styleの差異をこの親issueのGate外レビュー修正として扱う。

### 対応方針

- desktopでは`判定` sectionを左列の`縁`の後へ移し、tablet / mobileのDOM順と表示内容は維持する。実装時に親issueのGate planとdesign notesの旧配置も同じ判断へ整合させる。
- `画像を選択`と各`〜を追加` buttonの共通する見た目を、キャラクターシート内の共有styleへ集約する。個別sectionは共有classを利用し、表示文言に応じた幅以外のfont size、高さ、padding、border、hover / disabled stateを重複定義しない。
- このレビュー指摘の取り込みだけでは実装を開始しない。実装はユーザーの明示承認後に行う。

### 対応完了チェックリスト

- [x] desktopの`判定` sectionを左列へ移し、tablet / mobileの表示順・操作を維持する
- [x] `画像を選択`と各`〜を追加` buttonの共通styleを作成し、既存buttonへ適用する
- [x] 個別sectionに重複した共通button styleが残っていない
- [x] 対象Component testを更新する
- [ ] 変更targetのVRT比較と原寸locator screenshot確認を行う
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## レビュー指摘 3

### 指摘事項

- character-sheet VRTはscenario数とfull-page screenshotが多く、長時間かつ不安定である。locatorを宣言していても、full-page screenshotが比較対象となるscenarioが残っており、section単位の表示契約を確認できない。
- full-page screenshotはdesktop / tablet / mobileのdefaultと、tooltipの代表1件だけに絞る。個別tooltipのscreenshotは残さない。
- dialog stateはdialogだけを、各sectionのdefault・入力・errorなどのvariationはそのsection領域だけをscreenshot対象にする。
- 静的ページ用のscenario作成helperとcharacter-sheet固有のscenario作成・section locator screenshotを分離し、character-sheet専用helperへ閉じ込める。

### 判定

- source: human
- classification: valid
- local validation:
  - `tests/visual/helpers/vrt.ts`の`registerVrtScenarios`は`fullPage`未指定時に`true`を使い、静的ページとcharacter-sheetの両方で共有されている。`tests/visual/vrt/scenario-play.spec.ts`を含む静的ページはこのhelperだけを利用する。
  - `tests/visual/vrt/character-sheet.spec.ts`には58件のnamed scenarioがあり、`locatorOnly: true`は40件だけである。残るscenarioと末尾のdefault scenarioはfull-page screenshotを比較対象とする。primary skill、判定、縁、tooltipの代表stateにも、section locatorを宣言しながらfull-page比較を行うものがある。
  - `visual:capture`だけは宣言したlocatorのscreenshotを出力するが、通常の`visual:test`はfull-page canonical baselineだけを比較する。現在のgeneric helperでは、section / dialog screenshotをcanonical VRTとして比較できない。
  - `docs/design/character-sheet/notes.md`にはcharacter-sheetのfull-page canonical snapshotが51件あると記録されている。これはdesign intentの正本ではなく実装結果のVRT baselineだが、sectionごとの局所表示契約を比較するには粒度が不適切である。
  - projectのVisual Review方針は、局所表示契約にはowner locatorの原寸screenshotを使い、full-page screenshotを局所確認の根拠にしない。指摘された分離・縮小方針はこの方針と整合する。
  - この指摘は既存のVRT設計の改善であり、未検証事項を確認済みと報告した記録は見つからないため、agent failure logへの追加は不要とする。

### 対応方針

- static pageのscenario specと既存targetは変更せず、generic helperもmainと同じfull-page / viewport用の引数と処理へ戻す。character-sheetだけは専用のscenario作成helperへ移し、full-page、section locator、dialog locatorを別のbaselineとして比較できるようにする。
- character-sheetのfull-page baselineは、defaultのdesktop / tablet / mobileと、tooltipの代表1 stateだけに制限する。個別tooltip scenarioは削除し、tooltipの局所文言・挙動は既存Component testの責務に戻す。
- 全dialog scenarioはdialog locatorだけを比較する。背景sectionとの同時capture、full-page captureは行わない。
- section scenarioは、defaultと入力・選択・errorなど表示差分があるstateごとに、そのowner section locatorだけを比較する。ほかのsectionは、表示差分の原因となる入力を保持していてもscreenshot対象へ含めない。
- owner sectionは`CharacterSheetSectionFrame`全体を対象にして見出しを含める。`縁`、`combat`、`武器・防具`は各variationでもこのframeを比較し、`スキル`と`生き様専用アイテム`は全体frameのdefaultをdesktop / tablet / mobileで1枚ずつ比較する。非戦闘技能は既存の局所section captureを維持する。
- `サイバネ`のdefault・入力・error variationは、内側の一覧だけでなくカテゴリsectionをowner locatorにして、`サイバネ`見出しを含める。`お守り`と同じ粒度にする。
- current issueの受入条件と最終VRT diffから必要なstateを見直し、同じ局所表示契約を重複するscenarioは統合または削除する。canonical snapshotの更新は、削減後の対象一覧をユーザーが承認した場合だけ行う。
- tooltip代表は`合計信用`とし、defaultと同じdesktop / tablet / mobileの3 viewportでfull-page比較する。
- ユーザーは2026-07-29に実装開始と既存character-sheet canonical baseline全削除・再生成を明示承認した。

### 対応完了チェックリスト

- [x] character-sheet専用のVRT scenario helperを作成し、静的ページ用helperから完全に分離する
- [x] full-page baselineをdefaultの3 viewportとtooltip代表1 stateへ縮小する
- [x] dialog stateをdialog locatorだけのbaselineへ置き換える
- [x] sectionごとのdefault・入力・error variationをowner section locatorだけのbaselineへ置き換える
- [x] 個別tooltip screenshotと重複scenarioを削除する
- [x] canonical snapshotの削除・更新対象一覧をユーザー承認する
- [x] 変更targetのVRT比較と原寸locator screenshot確認を行う
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## レビュー指摘 4

### 指摘事項

- スキルの子sectionは、上部の角丸に沿う外枠線が見えない。専用アイテムの子sectionには同じ位置の枠線がある。
- スキルのerror状態と生き様専用アイテムのwarning状態では、見出し部分だけ外枠の強調線が細く見える。

### 判定

- source: human
- classification: valid
- local validation:
  - 共有`SkillSection`の`.section`は角丸と外枠を持つ一方で`overflow: visible`である。見出しbuttonの背景は角丸にclipされないため、専用アイテム子sectionが合成する共通frameの`overflow: clip`と異なり、上部角の外枠が見えない。
  - `SkillSection`のerror状態と`SpecialItemCategorySection`のwarning状態は、通常のborderに加えた`inset` box-shadowで強調線を描く。見出しの背景がinset shadowを覆うため、見出し位置だけ通常border幅に見える。
  - この不備は、親issueのG12〜G16が導入したスキル子sectionと、G22が導入した生き様専用アイテムのwarning categoryの表示契約に属する。`docs/design/character-sheet/notes.md`はsection frameのsurface、border、radiusと、error / warningの明確な区別を求めており、修正は現在の親issueで扱える。
  - 未確認作業を完了と報告した手順逸脱ではなく、通常の表示不備であるため、agent failure logへの追加は不要とする。

### 対応方針

- `SkillSection`の見出し背景を、専用アイテム子sectionと同じく外枠の角丸内へclipし、通常・開閉状態・tooltipの既存操作を保ったまま上部角の線を表示する。
- error / warningの強調は、見出し背景に覆われない単線の太い外周borderとして描く。レイアウトの寸法、通常状態のborder、errorとwarningの色分け、入力・行単位のerror表現は変えない。
- スキル子sectionの通常・error状態と、専用アイテム子sectionのwarning状態をdesktop / tablet / mobileで対象限定VRTと原寸actual screenshotにより確認する。2026-07-29のユーザー承認に従い、`@character-sheet`の全canonical baseline更新時に対象snapshotも更新する。

### 対応完了チェックリスト

- [ ] スキル子sectionの上部角に通常の外枠線が表示される
- [ ] スキルのerror状態で見出しを含む外周の強調線が均一に表示される
- [ ] 専用アイテムのwarning状態で見出しを含む外周の強調線が均一に表示される
- [ ] 対象stateのVRT比較と原寸actual screenshot確認を行う
- [ ] `npm run check` が通る
- [ ] `npm run build` が通る

## レビュー指摘 5

### 指摘事項

- キャラクターシート内の削除buttonを、`×`ではなくゴミ箱iconへ統一する。通常使用不可の生き様専用アイテムカテゴリも同じbuttonとし、位置は変えず、iconだけをwarning colorにする。2026-07-29のユーザー画面確認により、iconの周囲にborder・円形fill・囲みを表示しない。
- クリアbuttonを消しゴムiconへ変え、icon-only化で狭くなる分は、縁では`関係`列、その他の行では名称列へ配分する。
- 画像クリアもゴミ箱iconにする。画像を選択／画像を差し替えbuttonの右に常に置き、画像未選択時はdisabledにする。選択／差し替えbuttonは固定幅として、画像の有無でbutton位置を動かさない。
- 削除・クリアicon buttonは、当面desktopの削除buttonと同じ縦横サイズをdesktop / tablet / mobileで使う。mobileだけを小さくするかは、この変更のユーザー画面確認後に判断する。

### 判定

- source: human
- classification: valid
- local validation:
  - `CharacterSheetFormPresenter.module.css`は、削除をfillの共通`.character-sheet-remove-button`、クリアを文字列用の横長`.character-sheet-clear-button`として分けている。前者は`×`、後者は`クリア`を各Componentが直接描画し、mobileでは削除の一部とclearをさらに小さくするruleがある。
  - 削除共通buttonは、その他流儀、縁の上限外行、攻撃、スキル、武器、お守り、ドラッグ、サイバネに使われる。固定枠のサイバネ、ナノマシン、防具、通常の縁行はclear操作を使う。いずれも既存のaccessible nameとcallbackを維持したままicon-only表示へ置き換えられる。
  - `SpecialItemCategorySection`はカテゴリ見出し右端に独自の`×`buttonを置き、warning categoryではiconをwarning colorにしている。これは現在の位置を維持したまま、通常の削除buttonと同じゴミ箱icon・fill表現へ統一できる。
  - `ProfileSection`の画像clearは画像ありのときだけテキストbuttonを描画し、選択／差し替えbuttonは可変幅である。clearを常時のdisabledゴミ箱buttonにし、兄弟buttonの選択／差し替えを固定inline-sizeにすれば、画像の有無による操作位置のずれを防げる。
  - `BondsSection`は末尾のclear / delete列を`3rem`で確保し、`関係`列を可変trackにしている。ほかのスキル・アイテム・流儀行は名称と操作列を別trackにしているため、icon-only化で不要になる幅を関係または名称へ再配分できる。
  - これはG3、G7、G9〜G22で追加した既存操作の表現統一であり、保存、削除確認、focus復帰、入力制約、操作位置の意味を変更しない。通常のUI改善であって手順逸脱ではないため、agent failure logへの追加は不要とする。

### 対応方針

- `lucide-react`のゴミ箱・消しゴムiconを使用し、両操作ともborder・背景・円形fillのないicon-only buttonとする。`ClearButton` / `DeleteButton`は色をpropsで受け、通常色とwarning色を意味論的に選べるようにする。可視テキストを外しても、既存の日本語accessible name、hover色、enabled / disabled意味を維持する。
- 全削除buttonから`×`とmobile compact例外を取り除き、desktop削除buttonの現在の縦横サイズを全viewportの共通基準にする。専用アイテムカテゴリの削除buttonもこの共通classへ接続し、warning categoryではwarning colorを使う。見出し右端を見出し背景と同一の面にして、button自体は透明のままにする。
- すべてのclear操作を同サイズの消しゴムiconへ置き換える。縁の末尾操作列だけを縮めて`関係`列へ、その他の行では縮めた操作列の分を名称列へ配分し、既存の順序・操作位置・横overflowなしを維持する。
- 画像操作は選択／差し替えとclearを同一行の固定位置に置く。clearは画像なしでdisabled、画像ありでenabledとし、選択／差し替えbuttonのfixed inline-sizeを両状態で保つ。画像選択中の操作不可状態と完了後のfocus復帰は既存契約を維持する。
- 既存のComponent / browser操作testをicon-onlyのDOMとdisabled状態へ更新し、代表する削除・clear・画像未選択／選択済み・通常使用不可カテゴリをdesktop / tablet / mobileで対象限定VRTと原寸actual screenshotにより確認する。2026-07-29のユーザー承認に従い、`profile-image-selected`を含む`@character-sheet`の全canonical baselineを更新する。

### 対応完了チェックリスト

- [ ] 全削除buttonが囲みのないゴミ箱iconとなり、desktop / tablet / mobileで同じ縦横サイズを保つ
- [ ] 通常使用不可の専用アイテムカテゴリが、位置を変えずwarning colorのゴミ箱iconを使う
- [ ] 全clear操作が消しゴムiconとなり、縁の関係列およびその他の名称列へ空き幅を再配分する
- [ ] 画像clearが選択／差し替えbuttonの右に固定表示され、未選択時はdisabledである
- [ ] 画像を選択／画像を差し替えbuttonの幅と操作位置が画像の有無で変わらない
- [ ] 対象Component / browser操作testを更新する
- [ ] 対象stateのVRT比較と原寸actual screenshot確認を行う
- [ ] `npm run check` が通る
- [ ] `npm run build` が通る

## レビュー指摘 6

### 指摘事項

- キャラクターシートの入力欄、読み取り専用表示欄、ラベルのfont sizeとfont指定を棚卸しし、階層を保てる範囲で統一する。

### 判定

- source: human
- classification: valid
- local validation:
  - font familyは`--font-sans`を全体で継承しており、Componentごとのfont family指定はない。
  - 直接入力は主に`--text-xs`、重要な算出値は`--text-sm`、一覧本文は`0.75rem`、フィールドlabelは`0.5625rem`だが、同じ値が複数Componentに直接記述されている。
  - mobileの密集表は`0.625rem`と`0.6875rem`を使い分けており、viewportの情報密度を保つため単一サイズには統合しない。
  - 2026-07-29のユーザー画面確認により、PC名〜性別、流儀・生き様の選択とLv、体力増加〜精神力増加ではfield labelが小さすぎる。入力・算出値の標準文字は変更しない。信用〜共通スキルレベル合計／共通スキル上限と画像D&D案内は密集表示のため既存サイズを維持する。
  - 同日、ユーザーは`体力増加`〜`精神力係数`、`共通スキルボーナス`、副能力値の`最大体力`〜`結べる縁`、覚悟効果の`気絶からの回復`〜`受動判定`を`--text-xs`、muted color、bold（750）へ統一するよう指示した。縁の`対象`・`関係`・`覚悟`は既存表示を維持する。
  - 同日、ユーザーは共通スキルボーナスを除く読み取り専用の数値枠と、文字・数値・selectの直接入力を`--text-xs`と共通の最小高へ統一するよう指示した。checkbox、textarea、一覧の操作buttonは対象外とする。
  - 同日、ユーザーは数値inputに付いた個別のbold指定をすべて外し、通常weightへ統一するよう指示した。読み取り専用の数値枠とラベルのweightは変更しない。
  - 同日、ユーザーはスキル、武器・防具、各専用アイテムの一覧rowと列headerの最小高を、並べ替えcontrolsを収める高さへ統一するよう指示した。

### 対応方針

- `CharacterSheetFormPresenter`に、label、直接入力、重要な算出値、一覧本文、mobile一覧の文字tokenを定義する。
- 通常のfield labelは`--text-xs`へ上げる。信用・経験点の密集grid、能力値grid、補助labelはlocal overrideで既存の小さい文字を維持する。直接入力・算出値、縁の列header・補助文は既存サイズを維持する。`体力増加`〜`精神力係数`、`共通スキルボーナス`、副能力値の`最大体力`〜`結べる縁`、覚悟効果の`気絶からの回復`〜`受動判定`は`--text-xs`、muted color、bold（750）へ揃える。
- 共通の読み取り専用数値枠は`--text-xs`と`1.625rem`の最小高を持つ。直接編集する文字・数値・selectも同じfont sizeと最小高を使う。項目表内の数値inputもこの指定を優先する。
- 全ての数値inputはフォーム共通で`font-weight: normal`を明示する。項目表の親要素にあるbold指定を継承しない。
- `CharacterSheetFormList`の一覧rowとreorder controls、各一覧の列header、各rowの主lineは`2.25rem`の共通最小高を使う。reorder controlsを持たない防具を含め、内容はrow内で中央配置する。
- CSS監査では、local overrideを持たない`--character-sheet-font-supporting`を削除し、table数値input（Lv、数量、修正）の共通styleを`CharacterSheetFormList`へ集約する。grid列幅、section固有の余白、dialog固有の情報密度は共通化しない。
- 基本情報、ビルド、副能力値、縁、判定、スキル、アイテム一覧の共有指定をtokenへ接続する。font family、section見出し、dialog固有の密集レイアウト、色、余白、操作順は変更しない。
- desktop / tablet / mobileで既存の文字サイズ階層と横overflowなしを確認する。canonical baseline更新は別途ユーザー指示時に限る。

### 対応完了チェックリスト

- [ ] field labelと直接入力の文字指定が共通tokenを使う
- [ ] 重要な算出値と一覧本文の文字指定が共通tokenを使う
- [ ] mobile一覧の縮小文字を専用tokenで維持する
- [ ] desktop / tablet / mobileで文字階層と横overflowを確認する
- [ ] `npm run check` が通る
- [ ] `npm run build` が通る

## レビュー指摘 7

### 指摘事項

- `判定`内の`攻撃`、`リアクション`、`非戦闘技能`を、見出しレベル`h3`の`CharacterSheetSectionFrame`へ統一する。
- `縁`内の`覚悟の効果`、`武器・防具`内の`武器`と`防具`も、見出しレベル`h3`の`CharacterSheetSectionFrame`へ統一する。
- `非戦闘技能`だけは初期状態で折りたたみ、ほかの対象subsectionは初期状態で展開する。文字サイズの差異とtooltipの見た目は今回の確認対象から除く。

### 判定

- source: human
- classification: valid
- local validation:
  - `CharacterSheetSectionFrame`は、section外枠、heading、初期展開状態の開閉を共通で持ち、親sectionではすでに`h2`の見出しに利用している。
  - `ChecksSection`の`攻撃`、`リアクション`、`非戦闘技能`、`BondsSection`の`覚悟の効果`、`WeaponsAndArmorSection`の`武器`と`防具`は、現在それぞれ個別のsection / heading実装であり、frameの外枠と開閉操作を持たない。
  - 最新のユーザー指示により、非戦闘技能も初期展開とし、折りたたみ時は内容をすべて隠す。`CharacterSheetSectionFrame`の既存仕様だけで実現できる。

### 対応方針

- `CharacterSheetSectionFrame`は変更せず、既存の初期展開・開閉仕様を使う。
- 対象の6 subsectionを`expandable`かつ`headingAs="h3"`の共通Frameへ移す。非戦闘技能を含め、すべて初期展開とし、折りたたまれたcontentは完全に隠す。
- tooltipの内容・fontの微差は今回の対象外とし、非戦闘技能の子section見出しへtooltip用のaccessoryは追加しない。ゲームデータ、入力・算出、操作callback、親sectionの開閉状態は変更しない。

### 対応完了チェックリスト

- [x] 対象6 subsectionが`h3`の`CharacterSheetSectionFrame`を使う
- [x] 非戦闘技能は初期展開し、折りたたみ時は内容をすべて隠す
- [x] 攻撃、リアクション、覚悟の効果、武器、防具は初期展開する
- [x] 入力・算出、操作callbackを維持し、tooltip用accessoryを追加しない
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## 備考

このissueは`ex-02`全体を追跡する親task contractである。実装開始には、専用Gate planのユーザー明示承認に加え、着手直前に対象Gate専用の子issueを作成・承認することを必要とする。親issueは全実装ゲートの完了まで維持する。

実装ゲートは専用Gate planを入口とし、Gateごとの子issue・子branch・PRで進める。子issueをdoneへ移す前に、後続Gateに必要な確定事項だけをGate planへ戻す。

端末内保存は、作業継続用の最新1件をユーザーの端末内に保存・復元する機能として初期scopeに含める。ユーザー端末に依存しない管理DB・クラウド等へ保存する永続情報は、初期スコープ外とする。

キャラクターシートのゲーム仕様は、`src/pages/`配下のゲーム仕様と`data/generated/`配下の生成JSONを正本として扱う。

`.tmp/character-sheet-architecture.md`の「issue-first workflowは使用しない」という記述は、リポジトリ最上位の`AGENTS.md`と矛盾するため採用しない。
