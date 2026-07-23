# ex-02-web-character-sheet

## 目的

Webキャラクターシートを一括実装せず、既存サイトのルール・データ・本文と整合する要件正本、3 viewport のデザインドラフト、実装アーキテクチャ、レビュー可能な実装ゲートを順に確定する。

各実装ゲートは「途中だが動く」縦方向の機能単位として実装し、1コミット相当の差分ごとにユーザーレビューを受ける。

## 背景

`docs/plan.md` の `ex-02-web-character-sheet` は、ルールを通読する前のPLでもキャラクターを作り始められるWebキャラクターシートを初期スコープに含めている。

作業入力には以下がある。

- `.tmp/character-sheet-architecture.md`: React Island、責務分離、テスト、レビューの方針
- `.tmp/character-sheet-design-draft.jpg`: デスクトップの配置ラフ

これらは作業入力であり、実装の正本は次の段階でGit管理下に整理する。既存のルール本文・データ表示要件と矛盾する場合は、対話により採用方針を決め、正本側を更新してから後続へ進む。

関連参照:

- `docs/requirements.md`
- `docs/requirements/character-sheet.md`
- `docs/requirements/overview.md`
- `docs/requirements/architecture.md`
- `docs/requirements/non-functional.md`
- `docs/requirements/data-display.md`
- `docs/requirements/data-id-policy.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md` の「流儀の共通スキルボーナスを構造化データへ変換する」、「React Islandの導入を検討する」、および「キャラクターシートの永続スキル参照でID変更を検出してエラーにする」
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
   - 共通スキルボーナスは表示文字列を解析しない。Gate 0で、既存の表示文字列を維持したまま専用の構造化データを追加する。
   - 不明点または競合を推測で決めず、論点・選択肢・影響を示してユーザーと対話し、回答を要件正本へ反映する。
2. デザインドラフト
   - 要件正本を入力に、`desktop`、`tablet`、`mobile`の3 viewportについて、情報配置、操作導線、可変行、エラー・警告、保存・復元、空状態、狭幅時の優先順位を含むドラフトを作る。
   - 作成前と必要な節目でユーザーに確認し、未決定のレイアウト・表現を独断で固定しない。
   - 対話用draftの作成手段、作業artifactの保存場所、Git管理対象、承認点、desktop/tablet/mobileの具体的viewport値をユーザーと決める。未決定のまま`design-image-generation`へ進めない。
   - 対話で承認されたdesign intentを、`design-image-generation`の手順で`docs/design/character-sheet/notes.md`へ記録する。VRT target、viewport、状態、比較観点を記録する。対話用draftの画像・prototype作成は、このskillの対象外として別途合意した手段で扱う。
3. アーキテクチャと依存ライブラリの決定
   - 承認済み機能要件とデザインを入力に、Astroとの接続、React Islandの範囲、状態・副作用・純粋ロジック・表示の分離、保存方式、JSON schema、テスト方針、データ参照を決める。
   - `docs/architectures/character-sheet.md`を新設する案を第一候補とし、サイト全体の`docs/requirements/architecture.md`とは重複させず、キャラクターシート固有の決定と根拠を記録する。
   - 依存ライブラリは必要性、代替案、静的公開・容量・保守性への影響を比較してから決める。新規追加は承認済み要件・アーキテクチャに根拠を記録する。
4. 実装ゲートの列挙
   - 機能または画面セクションごとに、schema、状態、logic、UI、テストを必要範囲で含む縦方向の実装ゲートを、このissue内で列挙する。
   - schema、JSON形式、共通基盤を全機能分まとめて先行実装せず、各ゲートで必要になった範囲だけを追加する。
   - この段階では各ゲートの実装スコープだけを記録し、完了条件、確認手順、依存関係、対象viewport、テスト範囲は記録しない。
   - `docs/plan.md`へ子タスクまたは子チェックボックスを追加しない。
   - ゲート一覧をユーザーが承認するまで、実装を開始しない。
5. ゲートごとの実装とレビュー
   - 承認済みの実装ゲートを一度に複数進めず、1ゲートのみ実装する。
   - コード変更の直前に、このissueの対象ゲートへ完了条件、確認手順、依存関係、対象viewport、テスト範囲を追記し、ユーザー承認を受ける。
   - 実装、対応テスト、必要な限定VRT、ローカル確認結果、手動確認手順、既知の未実装事項を提示して停止し、ユーザーレビューを受ける。
   - ユーザーの明示指示後に、そのゲートの範囲だけをコミットする。
   - すべての実装ゲートのレビュー・確認が完了するまで、この親issueを完了扱いにしない。

## 実装ゲート

実装ゲートの詳細な分割と順序は、要件正本化・design・アーキテクチャ決定後にこのissueへ追加する。現時点で採用する実装スコープは、`docs/requirements/character-sheet.md`に定義する全機能である。

各ゲートは必要最小限のschema、状態、logic、UI、テストだけを含める。全ゲート共通の巨大な先行基盤は作らない。各ゲートの完了条件、確認手順、依存関係、viewport、テスト範囲は、実装に着手する直前にこのissueへ追記する。実装ゲートはこのissueと現在のbranchで継続管理し、`docs/plan.md`へ子タスクを追加せず、ゲートごとの子issue・子branch・PR作成やマージを行わない。

### Gate 0: 共通スキルボーナスの構造化データ

- 既存の`ryugi-list.json`にある表示用の共通スキルボーナス文字列は変更しない。
- 文字列解析を行わず、キャラクターシートの算出に使う専用の構造化データを追加する。
- 詳細なデータ形状、変換元、生成処理、既存表示との互換性、完了条件は、Gate 0の実装着手直前に定義する。

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
- [ ] デスクトップ、タブレット、モバイルのdesign draftと`docs/design/character-sheet/notes.md`がユーザー確認済みである。
- [ ] `docs/architectures/character-sheet.md`の配置可否、アーキテクチャ、データ境界、依存ライブラリ、テスト方針がユーザー承認済みである。
- [ ] 実装ゲートが縦方向・1コミット相当・単独で確認可能な単位に列挙され、順序とレビュー手順がユーザー承認済みである。
- [ ] 各実装ゲートで必要なdesign targetとVRT baselineの扱いが記録されている。
- [ ] 対話用design draftの承認後、UI実装前に`design-image-generation`でdesign intentとVRT参照情報を記録する手順が定義されている。
- [ ] 関連TODOごとに、承認済み実装ゲートで回収するか、将来TODOとして維持するか、不採用にするかを理由とともに記録している。
- [ ] 実装を開始した各ゲートで、`npm run check`、`npm run build`、対象テスト、必要な限定VRTの確認結果を記録している。
- [ ] 承認済みの実装ゲートをすべて実装・ユーザーレビューし、初めて本作に触れるPLが作成を始められる導線、モバイルでの入力・閲覧、遊ぶために必要な情報の確認、対象VRTの比較を完了している。

## チェックポイント

- [x] `docs/requirements/character-sheet.md`を追加する際、既存の要件索引と重複させずに参照関係を更新している。
- [x] 端末内の最新1件復元は初期scopeに含める。初期スコープ外の「永続保存」は、ユーザー端末に依存しない管理DB・クラウド等へキャラクターデータを保存することとして定義し、`docs/out-of-scope.md`へ反映済みである。
- [x] 実装ゲートはこのissueをSSoTとして現在のbranch内で継続管理し、`docs/plan.md`へ子タスクを追加せず、ゲートごとの子issue・子branch・PR作成やマージを行わない。
- [x] `src/pages/`配下のゲーム仕様と生成JSONを正本として、初回仕様の縁の項目、リアクションで選べる能力値、能力値配分、武器の所持・装備状態を整合させている。
- [x] フルスクラッチにおけるプライマリ流儀・生き様の初期1レベル無料と、消費経験点の算出式を整合させている。
- [x] `docs/requirements/overview.md`と`docs/out-of-scope.md`で、キャラクター作成ウィザードは初期スコープ外とし、`ex-02-web-character-sheet`の直接編集式キャラクターシートは初期scopeであることを明確化している。
- [ ] React Islandの導入を、関連TODOの検討事項から`ex-02`の承認済み範囲へ移すか、別の実装方式を選ぶかを記録している。
- [ ] GitHub Pagesのサブパス公開、静的ホスティング、不要な依存ライブラリを追加しない方針に適合している。
- [ ] 各タスクで変更対象のUIに限定したVRTを実施し、全件VRTを通常実行しない方針を維持している。
- [ ] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `docs/issue/ex-02-web-character-sheet.md`
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
- 対話用design draftの作成手段、保存場所、Git管理範囲、desktop/tablet/mobileの具体的viewport値が妥当か。`design-image-generation`は承認済みintentのnotes化とVRT参照記録に限定する。

## 備考

このissueは`ex-02`全体を追跡する親task contractである。実装開始には、ここで定義した実装ゲート一覧のユーザー明示承認に加え、着手直前に当該ゲートの完了条件を追記した後のユーザー承認を必要とする。親issueは全実装ゲートの完了まで維持する。

実装ゲートはこのissueをSSoTとして現在のbranch内で継続管理する。ゲートごとの子issue・子branch・PR作成やマージは行わず、ゲートごとのユーザーレビューを挟みながら進める。

端末内保存は、作業継続用の最新1件をユーザーの端末内に保存・復元する機能として初期scopeに含める。ユーザー端末に依存しない管理DB・クラウド等へ保存する永続情報は、初期スコープ外とする。

キャラクターシートのゲーム仕様は、`src/pages/`配下のゲーム仕様と`data/generated/`配下の生成JSONを正本として扱う。

`.tmp/character-sheet-architecture.md`の「issue-first workflowは使用しない」という記述は、リポジトリ最上位の`AGENTS.md`と矛盾するため採用しない。
