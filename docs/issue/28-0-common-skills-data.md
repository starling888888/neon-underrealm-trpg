# 28-0-common-skills-data

## 目的

共通スキル一覧ページで利用する、Excel起点の生成JSON、`Skill` 検証スキーマ、変換スクリプト、データ取得層、テストを整備する。

## 背景

`docs/plan.md` の `28-0-common-skills-data` は、後続の `28-1-common-skills-components` と `28-2-common-skills-page` が共通スキルを表示するためのデータ基盤を先に用意するタスクである。

ローカル入力として `<repo-root>/.raw/data/common-skills.xlsx` を確認した。対象シートは `common-skills` であり、現在は `bonus` / `○-○` の共通スキル1件を含む。ヘッダーは、`区分`、`名称`、`最大レベル`、`タイミング`、`コスト`、`技能`、`取得制限`、`対象`、`射程`、`使用制限`、`概要`、`効果` の12列である。

関連する正本・方針は以下とする。

- `docs/requirements/architecture.md` の AC-06 から AC-16
- `docs/requirements/data-display.md` の FR-04-01
- `docs/requirements/data-id-policy.md` のスキルID・タイミング正規化案
- `docs/requirements/pages.md` の `/data/common-skills`
- `docs/game-design/skills.md` のスキル項目、所属、ID、タイミングのゲーム仕様
- `docs/out-of-scope.md`
- `docs/plan.md` の `28-0-common-skills-data`
- `docs/TODO.md` の `/data/common-skills` ページ作成の追跡項目

## 対象範囲

- `docs/conversion/common-skills.md` に、次を含む変換仕様を策定する。
  - 入力ファイルを `.raw/data/common-skills.xlsx`、対象シートを `common-skills` とする。
  - 現在確認済みの12ヘッダーだけを受け入れ、各列の必須・任意・空欄・改行の扱いを定義する。`ID` 列を含む追加列、ほかのヘッダー順・未知ヘッダーはエラーとする。
  - `区分` は `bonus`、`basic`、`advanced` のみを受け入れる。
  - `タイミング` は `docs/requirements/data-id-policy.md` の 10.3 に列挙された表記のみを受け入れ、ID用の正規化値を同表に従って決定する。
  - `最大レベル` は正の整数、`名称`、`対象`、`概要`、`効果` は空欄不可とする。`技能`、`コスト`、`取得制限`、`射程`、`使用制限` は空欄を許可し、生成JSONでは `null` とする。`Pv` など判定を伴わないスキルでは `技能` を空欄にする。
  - 改行を許可するフィールドとLF正規化の扱い、空行・未知ヘッダー・途中空行のエラーを定義する。
  - `sourceOrder` はExcelの2行目を1とする全スキル共通の正の連番かつ一意な値とする。生成JSONの各カテゴリ配列は、そのカテゴリのExcel入力順を保持し、後続UIはその配列順を独自に並び替えず表示する。
  - カテゴリ内のタイミンググループは、攻撃、`R`、`Pv`、`M`、`SU`、`INI`、`CU`、`Aa`、`Ra`、`D`、`SP` の順を推奨する。順序の逆転は変換エラーにせず、カテゴリ、Excel行番号、スキル名を含むWarningを標準エラー出力へ出す。
  - 出力先を `data/generated/common-skills.json` とし、`dataName`、内容が変わった時だけ更新する `updatedAt`、`bonus`、`basic`、`advanced` を固定キーに持つカテゴリ別の `data` オブジェクトを持つ形式を定義する。
  - スキルIDは常に変換時に自動採番する。共通スキルは `skill-common-{category}-{normalizedTiming}-{index}` とする。後続タスクでは、流儀スキルを `skill-ryugi-{ryugiId}-{category}-{normalizedTiming}-{index}`、生き様スキルを `skill-ikizama-{ikizamaId}-{category}-{normalizedTiming}-{index}` とする。初期スコープでは入力順の変更でIDと個別アンカーが変わることを許可する。この共通方針に合わせ、`docs/requirements/data-id-policy.md` と `docs/game-design/skills.md` を同一タスクで更新する。
  - `Skill` の出力フィールドを、`id`、`owner: "common"`、`category`、`name`、`maxLevel`、`timing`、`cost`、`proficiency`、`acquisitionRestriction`、`target`、`range`、`usageRestriction`、`summary`、`effect`、`sourceOrder` とする。`cost`、`proficiency`、`acquisitionRestriction`、`range`、`usageRestriction` は `string | null`、ほかは `string` または `number` とする。
- `src/lib/schemas/skill.ts` に、共通スキルで使う `Skill` と `CommonSkillsJson` のZodスキーマ、TypeScript型、parse / assert helperを追加する。
  - 生成JSONの必須項目、固定カテゴリキー、`owner: "common"`、承認済みのID形式、カテゴリ、タイミング、正の最大レベル、nullable項目、LF改行、ID重複、全カテゴリにわたる `sourceOrder` の連番・一意性、カテゴリ配列内の昇順を検証する。
  - 既存の `SkillCard.astro` が必要とする表示項目を、JSONから欠落させない。
- `scripts/convert-common-skills/main.ts` と責務分離した `scripts/convert-common-skills/lib.ts` を追加し、Excel入力を読み込み、行番号を含む入力エラーを返し、生成JSONを出力する。
- `src/lib/data/common-skills.ts` に、Git管理された生成JSONを読み込み、カテゴリ別スキル配列を返す共通スキル一覧用の取得関数を追加する。
- `data/generated/common-skills.json` を変換スクリプトで生成してGit管理する。手編集はしない。
- `docs/requirements/data-display.md` と `docs/game-design/skills.md` を、判定を伴わないスキルの `技能` を `null` とし、Card上で `-` と表示する方針へ更新する。`SkillCard.astro` の型・表示対応は `28-1-common-skills-components` で扱う。
- `docs/requirements/data-display.md` と `docs/requirements/pages.md` を、共通スキルをカテゴリ別・変換済み配列順で表示する方針へ更新する。ページ・Componentの実装は後続タスクで扱う。
- `tests/node/common-skills.test.ts` に、変換・スキーマ・取得層を検証するテストを追加する。
- `package.json` に、共通スキル変換を明示実行するための最小限のnpm scriptを追加する。既存の `read-excel-file` と `zod` を使用し、新規npm packageは追加しない。

## 初期スコープ外

- `/data/common-skills` のページ、MDX本文、導線、ページdesignを作成しない。これらは `28-2-common-skills-page` で扱う。
- `SkillList.astro`、`SkillCard.astro` の表示仕様・CSS・Component APIを変更しない。`proficiency: null` の型・`-` 表示対応を含め、これらは `28-1-common-skills-components` で扱う。
- 流儀・生き様・アイテム・NPCのExcel変換やデータ取得層を追加しない。
- `.raw/data/common-skills.xlsx`、Google Drive、`raw-google-drive.url` を変更しない。
- 検索、DB、認証、SSR、CMS、クライアント状態管理、不要な依存関係を追加しない。
- 初期スコープ外の項目は `docs/out-of-scope.md` に従う。

## 完了条件

- [x] `docs/conversion/common-skills.md` が、確認済みの12列入力契約、ID・表示順・出力JSON・検証・テスト方針を定義している。
- [x] 共通スキルIDを `skill-common-{category}-{normalizedTiming}-{index}` とし、関連SSoTを同一タスクで更新する範囲が承認されている。
- [ ] 共通スキルの生成JSONが `data/generated/common-skills.json` にあり、カテゴリ別の `data` オブジェクトでExcelなしのサイトbuildに必要なデータを提供できる。
- [ ] `Skill` と `CommonSkillsJson` のZodスキーマが、固定カテゴリキー、出力項目、`owner: "common"`、必須・nullable項目、ID重複、カテゴリ値、タイミング表記、最大レベル、改行正規化、カテゴリ別の表示順を検証する。
- [ ] 変換スクリプトが `.raw/data/common-skills.xlsx` の `common-skills` シートから生成JSONを作り、入力エラーには列または行番号を含める。
- [ ] データ取得層が生成JSONを読み込み、後続の共通スキル一覧ページが利用できるカテゴリ別スキル配列を返す。
- [ ] 変換・スキーマ・取得層のテストが、現在の1件のデータ、カテゴリ別 `data` オブジェクト、入力順による自動採番、必須項目欠落、重複ID、不正カテゴリ、不正タイミング、`技能` を含む空欄の`null`化、改行のLF正規化、`owner`、カテゴリ別の表示順、タイミング順逆転時のWarningを検証する。
- [ ] `npm run convert:common-skills`、`npm run test`、`npm run check`、`npm run build` が通る。
- [ ] 関連TODOを確認し、ページ作成のTODOは `28-2-common-skills-page` に残す理由が記録されている。

## チェックポイント

- [ ] 既存ルートが壊れていない。
- [ ] GitHub Pagesのサブパス公開に影響しない。
- [ ] CI/CDのbuildが `.raw/` やExcel本体に依存しない。
- [ ] 生成JSONの `proficiency` を `string | null` とする契約を、`docs/requirements/data-display.md` と `docs/game-design/skills.md` に記録している。`SkillCard.astro` の型・`-` 表示対応は `28-1-common-skills-components` で確認する。
- [ ] 新規npm packageを追加していない。
- [ ] 初期スコープ外のページ・Component・UIを実装していない。
- [ ] `docs/TODO.md` のページ作成項目と矛盾していない。
- [ ] UI、CSS、layout、page、Componentタスクではないため、design targetおよびdesign-image-generation前提条件は不要である。
- [ ] ユーザーの未コミット変更（`public/images/data/ryugi/`）を破壊していない。

## 想定変更ファイル

- `docs/conversion/common-skills.md`
- `docs/requirements/data-id-policy.md`
- `docs/requirements/data-display.md`
- `docs/requirements/pages.md`
- `docs/game-design/skills.md`
- `src/lib/schemas/skill.ts`
- `scripts/convert-common-skills/main.ts`
- `scripts/convert-common-skills/lib.ts`
- `src/lib/data/common-skills.ts`
- `data/generated/common-skills.json`
- `tests/node/common-skills.test.ts`
- `package.json`

## レビュー観点

- 共通スキルIDを `skill-common-{category}-{normalizedTiming}-{index}` とし、流儀・生き様を含むスキルID方針を同一の接頭辞・所属種別形式へ統一することが妥当か。
- Excelの入力順から常にIDを自動採番し、初期スコープでは入力順変更に伴う個別アンカー変更を許可する方針が妥当か。
- カテゴリ内でタイミンググループ順が逆転した場合に、変換を止めずWarningだけを出し、入力順をUI表示順として維持する方針が妥当か。
- 現在の1件だけに合わせて過剰な例外処理をせず、列仕様とバリデーションが今後の共通スキル追記に耐えられるか。
- 共通スキルのカテゴリを `bonus`、`basic`、`advanced` に限定すること、およびタイミングの許容値を既存のID方針に限定することが正しいか。
- `Skill` スキーマを今回のカード表示に必要な共通項目までに留め、流儀・生き様との関連データを後続タスクへ分離できているか。
- `/data/common-skills` のページ作成TODOを本issueへ取り込まず、`28-2-common-skills-page` に残すことが妥当か。

## 備考

このissueはデータ基盤だけを対象とする。後続ページの内容は、ユーザーが準備する `.raw/contents/common-skills.md` と `28-2-common-skills-page` の承認済みissueで扱う。

`docs/TODO.md` の `/data/common-skills` 項目はページ作成を追跡するものであり、Componentとページを対象外とする本issueでは未対応のまま残す。

共通スキルIDは `skill-common-{category}-{normalizedTiming}-{index}` とし、Excel上のID列を使わず常に変換時に自動採番する。初期スコープではIDと個別アンカーの変更を許可する。キャラクターシート機能がスキルIDと取得レベルをDBへ保存する段階でのID変更検出は、`docs/TODO.md` の後続TODOで扱う。

実装前にこのissueの内容をユーザーが明示承認する。Git commit / push はこのissue準備では実行しない。
