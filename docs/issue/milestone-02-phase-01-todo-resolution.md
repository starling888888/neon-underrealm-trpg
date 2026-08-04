# milestone-02-phase-01-todo-resolution

## 目的

milestone-02 Phase 1で実施する技術的なTODOを回収し、実施しないTODO、後続Phaseへ移すTODO、継続保留するTODOを現在のユーザー判断へ整合する。

## 背景

`docs/TODO.md`の未対応項目について、ユーザーが実施先と非対応方針を個別に決定した。Phase 1では、次の既存TODOを実装し、追跡文書を更新する。

- Astro Component contract testの基盤を導入する。
- 既存Node testをVitestへ全面移行する。
- 全スキルの`summary`列と保持を削除する。
- `-local`確認ページをPagefind indexから除外する。
- キャラクターシートの派生logicからマスタID解決を分離する。

参照先:

- `docs/requirements.md`
- `docs/out-of-scope.md`
- `docs/issue/milestone-02/plan.md`
- `docs/TODO.md`
- `docs/TODO-done.md`
- `docs/conversion/skills.md`

## Gate関係

- 親issue: `docs/issue/milestone-02-phase-01-todo-resolution.md`
- Gate plan: `docs/issue/milestone-02-phase-01-todo-resolution/plan.md`
- 実行方式: ユーザー指示により子issueは作成しない。各TODOをGateの範囲とし、Gate単位でcommitする。各Gateの実装前には、この親issue、Gate plan、関連SSoTを再確認する。

## 対象範囲

- Astro Componentを固定propsで検証できるcontract test基盤を整備し、既存のComponent test運用と役割を分離する。
- `tests/node/`と`tests/contract/`のNode testをVitestへ全面移行し、package script・CIでNode test runnerを使わない構成へ更新する。
- スキル変換仕様、型、生成JSON、データ検証、`SkillCard` props、関連testと要件・design記述から、将来表示しない`summary`の保持を削除する。Google Spreadsheetの`summary`列は、人間が手動削除して完了を共有した後に切り替える。Google Driveへは書き込まない。
- `-local`確認ページをPagefind indexから除外し、公開対象の検索結果だけを検索Visual Testの対象にする。
- キャラクターシートの派生logicがマスタIDを直接解決しないよう、`master-data/`またはPresenter adapterで解決済みのview modelを渡す境界へ整理する。
- ユーザー決定に従って`docs/TODO.md`、`docs/TODO-done.md`、`docs/issue/milestone-02/plan.md`を更新する。
  - Phase 3へ移す: 候補行の選択可能性、覚悟から縁へ戻す効果の表現、横スクロール表のレイアウト対策。
  - Phase 1で回収する: 本issueの5項目。
  - 継続保留: GMセクション後のゲーム設計レビュー、JSON schema version互換、永続スキル参照のID変更検出、Footerクレジット導線。
  - `TODO-done.md`へ移す: 既存design notesの全件正規化（対応しない）、サイトメニュー順序のdesign反映（完了済み）、GitHub Actions全件VRT（対応しない）。

## 初期スコープ外

- GMセクション、FAQ、公開ルール本文、エネミー情報を実装しない。
- Phase 3へ移すUI・文言・responsive tableの実装をしない。
- JSON schema versionの互換、永続保存、スキルID変更検出を実装しない。
- Footerのクレジット導線を追加しない。
- GitHub Actionsで全件VRTを実行するworkflowを追加しない。
- 新しいnpm packageを追加しない。Vitestは既存依存を利用する。
- UI、CSS、layout、pageのdesignまたはVRT baselineを変更しない。

## 完了条件

- [ ] Astro Component contract testの対象・責務・実行scriptが定義され、代表Componentで固定propsの契約を検証できる。
- [x] `tests/node/`と`tests/contract/`の全testがVitestのrunnerとassertion APIで実行され、Node test runnerまたは`node:assert/strict`を使うtestが残っていない。
- [ ] Google Spreadsheetの`summary`列を人間が手動削除し、完了を共有している。
- [ ] スキルの`summary`列・変換仕様・型・生成JSON・`SkillCard` props・関連testおよび正本記述を、Spreadsheet削除確認後に互換期間を設けず切り替える。リリースノートなど別用途の`summary`は変更しない。
- [ ] `-local`確認ページがPagefind indexに含まれず、公開検索と検索Visual Testが安定して通る。
- [ ] キャラクターシートの派生logicがマスタID解決に依存せず、未知IDの扱いをpersistence / import境界で明示できる。
- [ ] `docs/TODO.md`、`docs/TODO-done.md`、milestone-02計画が今回のユーザー判断と矛盾しない。
- [ ] 各Gateが、その対象TODO、変更内容、完了条件、検証方法に従って単独commitできる。
- [ ] `npm run check`が通る。
- [ ] `npm run test`が通る。
- [ ] `npm run build`が通る。

## チェックポイント

- [ ] Astro Component contract testとVisual Testの責務が混在していない。
- [ ] Vitest移行後もscript conversion test、React Component / hook test、build contract test、E2Eの責務が維持されている。
- [ ] スキルsummary削除がリリースノート、SEO、キャラクターシート内の別用途summaryを変更していない。
- [ ] GitHub Pagesのsubpath公開とPagefindの公開検索結果に影響しない。
- [ ] キャラクターシートの表示・保存済みJSONの復元契約を意図せず変更していない。
- [ ] 不要な依存関係を追加していない。
- [ ] 初期スコープ外の機能を実装していない。
- [ ] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `package.json`
- `vitest.config.ts`またはtest設定
- `tests/node/`配下のtestと必要なtest fixture
- `tests/contract/`配下のtestと必要なtest fixture
- `tests/components/`またはAstro Component contract testの追加先
- `scripts/convert-skills/`
- `src/lib/types/skill.ts`
- `src/lib/schemas/conversion/skill.ts`
- `docs/conversion/skills.md`
- `src/components/data/SkillCard.astro`
- `data/generated/`配下のスキルJSON
- `src/pages/-local/`またはPagefind除外設定
- `tests/vrt/`または検索関連test
- `src/character-sheet/logic/`
- `src/character-sheet/master-data/`
- `src/character-sheet/form/`
- `src/character-sheet/schemas/`
- `docs/requirements/data-display.md`
- `docs/design/`配下のスキルsummaryに関する記述
- `docs/TODO.md`
- `docs/TODO-done.md`
- `docs/issue/milestone-02/plan.md`
- `docs/issue/milestone-02-phase-01-todo-resolution/plan.md`

## レビュー観点

- TODO単位のGateとGate単位のcommitが、ユーザー決定を取り違えずに実行できる構成か。
- 子issueを作らない実行方式でも、親issueとGate planだけで各Gateの範囲を確認できるか。
- `summary`削除の対象をスキルデータに限定し、別用途のsummaryを保護できているか。
- Google Spreadsheetの列削除を人間の手動作業に限定する範囲が明確か。
- Node testのVitest全面移行で既存CIと各テスト層の責務を維持できるか。
- マスタID解決の分離がUI・保存JSONの挙動を変更しないか。
- TODOの移動・保留・Phase 3への紐付けがユーザー判断を正しく反映しているか。

## 備考

- `docs/agent-failure-log.md`の監査と恒久対応計画は、milestone-02 Phase 1の別作業として扱う。今回のユーザー判断対象には含めない。
- UIを変更しないため、design-image-generationとVRT baseline更新は前提条件としない。

## TODO別実施条件

Gate IDと状態は`docs/issue/milestone-02-phase-01-todo-resolution/plan.md`だけで管理する。この節は、各Gateが扱うTODOの変更内容・完了条件・検証方法を定義する。

### 対応予定なし・対象Phase明記TODO

- [x] G1のTODOのplan / handling planを、2026-08-04のユーザー判断へ更新する。
- 変更: 次のTODOを1つのGateで現在のユーザー判断へ更新する。
  - ゲーム設計レビューはGMセクションを作成してからトリアージする。
  - 候補行design、覚悟から縁へ戻す効果の文言、responsive table対策はPhase 3へ紐付ける。
  - JSON schema version互換、永続スキルID変更検出、Footerクレジット導線は当面計画化しない。
- 完了条件: Phase 3へ移す3件、継続保留4件の実装を開始せず、TODOとmilestone計画から判断が追跡できる。
- 検証: TODOのplan / handling planとmilestone-02 Phase 2・Phase 3が矛盾しない。

### Astro Component contract test

- [x] G2のAstro Component contract test基盤と対象9 Componentのtestを追加する。
- 変更: `SkillCard`、6種のitem card、`NpcCard`、`Callout`を対象に、Astro Componentの固定props契約を検証するtest基盤を追加する。各Componentは1 test fileに分け、既存の`test:component`で実行する。
- 完了条件: Visual Testと別のscriptで、対象9 Componentの文言、値、fallback、想定タグまたは属性を確認できる。
- 検証: 対象test、`npm run check`、`npm run test`。

### Vitest全面移行

- [x] G3の`tests/node/`と`tests/contract/`をVitestへ移行する。
- 変更: `tests/node/`と`tests/contract/`をVitest形式・scriptへ移行し、Node test runnerと`node:assert/strict`をpackage scriptおよびtestから除去する。既存Component testの非同期form値確認は待機条件を明示する。
- 完了条件: 全logic / schema / build contract testがVitestで実行され、各test層の責務が維持されている。
- 検証: `npm run test`、関連するbuild contract。

### スキルsummary列の削除

- 開始条件: 人間がGoogle Spreadsheetの`summary`列を手動削除し、完了を共有している。確認前はconverter・生成JSONを変更せず停止する。
- 変更: 開始条件の確認後、スキル用`summary`の変換仕様、型、生成JSON、props、test、正本記述を互換期間なしで削除する。
- 完了条件: スキルのsummary保持がなく、リリースノート、SEO、キャラクターシートなど別用途のsummaryを変更していない。
- 検証: 変換test、`npm run check`、`npm run build`。

### Pagefindから`-local`を除外

- 変更: `-local`確認ページをPagefind indexから除外し、検索Visual Testの対象を公開検索結果へ固定する。
- 完了条件: `-local`がindexに含まれず、公開検索とVisual Testが安定して通る。
- 検証: Pagefind index、対象検索test、`npm run build`。

### 派生logicからのマスタID解決分離

- 変更: 解決済みview modelをlogicへ渡す境界へ整理し、未知ID検出・復元時の扱いをpersistence / import境界に残す。
- 完了条件: 派生logicがマスタIDを直接解決せず、UI・保存済みJSONの挙動を意図せず変更していない。
- 検証: logic / schema test、`npm run check`、`npm run test`。

### TODO-doneへの退避

- 変更: 次のTODOを`docs/TODO-done.md`へ移す。
  - 既存design notesの全件正規化: 費用対効果が低いため対応しない。
  - GitHub Actionsで全件VRT: 費用対効果が低いため対応しない。
  - サイトメニュー順序変更の既存design反映: 最新canonical screenshotを取得する現行方針により完了済み。
- 完了条件: 3件がactive TODOから除かれ、非対応理由または完了根拠が`handling result`に記録されている。
- 検証: `docs/TODO.md`と`docs/TODO-done.md`に重複・矛盾がない。
