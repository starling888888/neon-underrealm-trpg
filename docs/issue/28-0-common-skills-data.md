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
  - 現在確認済みの12ヘッダー、または先頭に `ID` を追加した13ヘッダーを受け入れ、各列の必須・任意・空欄・改行の扱いを定義する。ほかのヘッダー順・未知ヘッダーはエラーとする。
  - `区分` は `bonus`、`basic`、`advanced` のみを受け入れる。
  - `タイミング` は `docs/requirements/data-id-policy.md` の 10.3 に列挙された表記のみを受け入れ、ID用の正規化値を同表に従って決定する。
  - `最大レベル` は正の整数、`名称`、`技能`、`対象`、`概要`、`効果` は空欄不可とする。`コスト`、`取得制限`、`射程`、`使用制限` は空欄を許可し、生成JSONでは `null` とする。
  - 改行を許可するフィールドとLF正規化の扱い、空行・未知ヘッダー・途中空行のエラーを定義する。
  - 入力順を表示順として保持する。`sourceOrder` はExcelの2行目を1とする正の連番かつ一意な値とし、生成JSONの `data` 配列はこの昇順とする。
  - 出力先を `data/generated/common-skills.json` とし、`dataName`、内容が変わった時だけ更新する `updatedAt`、`data` 配列を持つ形式を定義する。
  - `ID` 列があり値が非空欄なら、ID形式・重複を検証してその値を優先する。`ID` 列がない場合または値が空欄の場合は、採用する共通スキルID規則で自動採番する。ID列の有無・空欄を同一シートで混在できること、生成済みIDを公開後にExcelのID列へ転記して正本化することを定義する。
  - スキルIDは `skill-` 接頭辞と所属種別を持たせる。共通スキルは `skill-common-{category}-{normalizedTiming}-{index}` とする。後続タスクでは、流儀スキルを `skill-ryugi-{ryugiId}-{category}-{normalizedTiming}-{index}`、生き様スキルを `skill-ikizama-{ikizamaId}-{category}-{normalizedTiming}-{index}` とする。この共通方針に合わせ、`docs/requirements/data-id-policy.md` と `docs/game-design/skills.md` を同一タスクで更新する。
  - `Skill` の出力フィールドを、`id`、`owner: "common"`、`category`、`name`、`maxLevel`、`timing`、`cost`、`proficiency`、`acquisitionRestriction`、`target`、`range`、`usageRestriction`、`summary`、`effect`、`sourceOrder` とする。`cost`、`acquisitionRestriction`、`range`、`usageRestriction` は `string | null`、ほかは `string` または `number` とする。
- `src/lib/schemas/skill.ts` に、共通スキルで使う `Skill` と `CommonSkillsJson` のZodスキーマ、TypeScript型、parse / assert helperを追加する。
  - 生成JSONの必須項目、`owner: "common"`、承認済みのID形式、カテゴリ、タイミング、正の最大レベル、nullable項目、LF改行、ID重複、`sourceOrder` の連番・一意性・昇順を検証する。
  - 既存の `SkillCard.astro` が必要とする表示項目を、JSONから欠落させない。
- `scripts/convert-common-skills/main.ts` と責務分離した `scripts/convert-common-skills/lib.ts` を追加し、Excel入力を読み込み、行番号を含む入力エラーを返し、生成JSONを出力する。
- `src/lib/data/common-skills.ts` に、Git管理された生成JSONを読み込む共通スキル一覧用の取得関数を追加する。
- `data/generated/common-skills.json` を変換スクリプトで生成してGit管理する。手編集はしない。
- `tests/node/common-skills.test.ts` に、変換・スキーマ・取得層を検証するテストを追加する。
- `package.json` に、共通スキル変換を明示実行するための最小限のnpm scriptを追加する。既存の `read-excel-file` と `zod` を使用し、新規npm packageは追加しない。

## 初期スコープ外

- `/data/common-skills` のページ、MDX本文、導線、ページdesignを作成しない。これらは `28-2-common-skills-page` で扱う。
- `SkillList.astro`、`SkillCard.astro` の表示仕様・CSS・Component APIを変更しない。これらは `28-1-common-skills-components` で扱う。
- 流儀・生き様・アイテム・NPCのExcel変換やデータ取得層を追加しない。
- `.raw/data/common-skills.xlsx`、Google Drive、`raw-google-drive.url` を変更しない。
- 検索、DB、認証、SSR、CMS、クライアント状態管理、不要な依存関係を追加しない。
- 初期スコープ外の項目は `docs/out-of-scope.md` に従う。

## 完了条件

- [ ] `docs/conversion/common-skills.md` が、確認済みの入力シート、12列／ID列付き13列の入力契約、ID・表示順・出力JSON・検証・テスト方針を定義している。
- [ ] 共通スキルIDを `skill-common-{category}-{normalizedTiming}-{index}` とし、関連SSoTを同一タスクで更新する範囲が承認されている。
- [ ] 共通スキルの生成JSONが `data/generated/common-skills.json` にあり、Excelなしでサイトのbuildに必要なデータを提供できる。
- [ ] `Skill` と `CommonSkillsJson` のZodスキーマが、出力項目、`owner: "common"`、必須・nullable項目、ID重複、カテゴリ値、タイミング表記、最大レベル、改行正規化、表示順を検証する。
- [ ] 変換スクリプトが `.raw/data/common-skills.xlsx` の `common-skills` シートから生成JSONを作り、入力エラーには列または行番号を含める。
- [ ] データ取得層が生成JSONを読み込み、後続の共通スキル一覧ページが利用できる配列を返す。
- [ ] 変換・スキーマ・取得層のテストが、現在の1件のデータ、12列／13列入力、ID列優先、ID列空欄の自動採番、必須項目欠落、重複ID、不正カテゴリ、不正タイミング、空欄の`null`化、改行のLF正規化、`owner`、表示順を検証する。
- [ ] `npm run convert:common-skills`、`npm run test`、`npm run check`、`npm run build` が通る。
- [ ] 関連TODOを確認し、ページ作成のTODOは `28-2-common-skills-page` に残す理由が記録されている。

## チェックポイント

- [ ] 既存ルートが壊れていない。
- [ ] GitHub Pagesのサブパス公開に影響しない。
- [ ] CI/CDのbuildが `.raw/` やExcel本体に依存しない。
- [ ] 既存の `SkillCard.astro` が要求する表示項目と生成JSONの項目が一致し、`null` の任意項目を `-` と表示できる。
- [ ] 新規npm packageを追加していない。
- [ ] 初期スコープ外のページ・Component・UIを実装していない。
- [ ] `docs/TODO.md` のページ作成項目と矛盾していない。
- [ ] UI、CSS、layout、page、Componentタスクではないため、design targetおよびdesign-image-generation前提条件は不要である。
- [ ] ユーザーの未コミット変更（`public/images/data/ryugi/`）を破壊していない。

## 想定変更ファイル

- `docs/conversion/common-skills.md`
- `docs/requirements/data-id-policy.md`
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
- 現在の12列に加え、先頭の任意 `ID` 列を受け入れ、非空欄IDを優先して公開済みアンカーを維持する入力契約が妥当か。
- 現在の1件だけに合わせて過剰な例外処理をせず、列仕様とバリデーションが今後の共通スキル追記に耐えられるか。
- 共通スキルのカテゴリを `bonus`、`basic`、`advanced` に限定すること、およびタイミングの許容値を既存のID方針に限定することが正しいか。
- `Skill` スキーマを今回のカード表示に必要な共通項目までに留め、流儀・生き様との関連データを後続タスクへ分離できているか。
- `/data/common-skills` のページ作成TODOを本issueへ取り込まず、`28-2-common-skills-page` に残すことが妥当か。

## 備考

このissueはデータ基盤だけを対象とする。後続ページの内容は、ユーザーが準備する `.raw/contents/common-skills.md` と `28-2-common-skills-page` の承認済みissueで扱う。

`docs/TODO.md` の `/data/common-skills` 項目はページ作成を追跡するものであり、Componentとページを対象外とする本issueでは未対応のまま残す。

共通スキルIDは `skill-common-{category}-{normalizedTiming}-{index}` とし、`docs/requirements/data-id-policy.md` と `docs/game-design/skills.md` を同一タスクで更新する方針をユーザーが承認済みである。

実装前にこのissueの内容をユーザーが明示承認する。Git commit / push はこのissue準備では実行しない。
