# 34-0-items-data

## 目的

`.raw/data/items.xlsx` の6シートを、静的サイトと将来のクライアント側キャラクターシートで共有できる`data/generated/items.json`へ変換する。既存のSkill IDも名称hashベースへ移行し、全Skill JSONを再生成する。

## 背景

アイテムは1つのExcelで管理しつつ、アイテム種別ごとの変換契約と検証を独立させる。生成JSONはアイテム一覧ページだけでなく、将来のクライアント側キャラクターシートでも直接参照できる構造にする。

現在のSkill IDは入力順の連番を含むため、行の途中挿入や並び替えで個別アンカーが変わる。`docs/requirements/data-id-policy.md`と各変換仕様を、名称hashを含むID形式へ更新済みである。このissueでは実装、既存Skill JSONの再生成、関連するID例の整合まで行う。

関連する要件・仕様は以下を参照する。

- `docs/plan.md` の `34-0-items-data`
- `docs/requirements/architecture.md` のAC-08からAC-13、AC-15、AC-16
- `docs/requirements/data-id-policy.md`
- `docs/requirements/architecture.md`
- `docs/requirements/data-display.md`
- `docs/conversion/items.md`
- `docs/conversion/skills.md`
- `docs/conversion/common-skills.md`
- `docs/conversion/ryugi-skills.md`
- `docs/conversion/ikizama-skills.md`
- `docs/TODO.md` の「キャラクターシートの永続スキル参照でID変更を検出してエラーにする」

## 対象範囲

- `.raw/data/items.xlsx` の`weapons`、`armors`、`omamori`、`cybernetics`、`nanomachines`、`drugs`を読み、`data/generated/items.json`を生成する変換entrypointを追加する
- 各アイテム種別の変換関数で、入力ヘッダー、セル型、必須値、件数、列挙値をExcel行番号付き入力エラーとして検証する。生成JSONの型、必須・nullable項目、ID、出力階層、ドメイン制約を検証するZod Schemaを追加する
- 武器を`data.weapons[group][checkKey][index]`、サイバネを`data.cybernetics[part][index]`でアクセスできる形へ出力し、その他の種別は種別ごとの配列として出力する
- 武器の`range`を`null`非許容とし、入力の`-`を`null`へ変換せず入力エラーにする
- `check`、`checkKey`、`part`、`timing`、`implantPoints`、名称hash IDの変換契約を`docs/conversion/items.md`どおりに実装する
- Item IDには`nameHash`を採用し、生成規則と重複検証は`docs/requirements/data-id-policy.md`に従う
- 既存Skill変換を名称hash IDへ変更し、`common-skills.json`、`ryugi-skills.json`、`ikizama-skills.json`をローカルの`.raw/data/*.xlsx`から再生成する
- Skill Schema、変換テスト、生成済みJSON、IDを示す要件例、ゲーム仕様、TODOの説明を、名称hash ID方針と矛盾しないよう更新する
- 旧Skill IDを直接参照するVisual Testを、再生成した名称hash IDへ更新する
- 見出しアンカーIDを生成する`createHeadingId(depth, text)`を共有utilityとして定義し、MDX本文とVisual Testにある自動生成見出しへの直接hashリンクを、リンク先の見出しが分かる意味名付きconstから組み立てる
- アイテム変換、Schema、データ取得層、生成JSONのテストを追加する
- `src/lib/data/items.ts`に、生成済みJSONを静的importして全データを返す取得関数、武器の`group`／`checkKey`から配列を返す取得関数、サイバネの`part`から配列を返す取得関数を追加する。不明なキーは`undefined`を返し、Nodeのfilesystem APIまたはExcel入力へ依存しない
- 変換コマンドを追加し、CI/CDのbuildがExcel入力または変換実行に依存しないことを維持する
- `npm-run-all2`を使う`npm run convert:data`を追加し、流儀一覧→流儀スキル、生き様一覧→生き様スキルをそれぞれ直列にしつつ、独立したデータ変換を並列実行する
- 全データ種別の変換・生成JSON検証・ID生成用Zod Schemaを`src/lib/schemas/conversion/`へ集約し、ブラウザ安全な型・定数を`src/lib/types/`へ分離する

### アーキテクチャ制約

- `weapons`、`armors`、`omamori`、`cybernetics`、`nanomachines`、`drugs`は、それぞれ専用の変換関数を持つ
- 各専用変換関数は、自身のシート名、ヘッダー、行の型変換、種別固有の検証、出力形状を責務として持つ
- 共通の文字列正規化、数値検証、名称hash、JSON書込みなどだけを共有helperへ抽出する
- 1つの巨大な条件分岐で全シートを変換する実装、ページ側でのシート別データ整形、Excel入力へのID列追加は行わない
- 通常表示処理または将来のクライアント側機能から、`schemas/conversion/`を実行時importしない

## 初期スコープ外

- アイテム一覧ページ、Item系Card、凡例、検索、絞り込み、ソート、UI実装
- キャラクターシート、保存、DB、認証、SSR、CMS、APIサーバー
- ExcelまたはGoogle Driveの編集、CI/CDでのExcel変換
- 既存の文字列効果・制限を条件、数値、バッドステータスなどへ構造化すること
- ID変更をキャラクターシートの永続データへ移行または検出する機能
- 初期スコープ外の項目は `docs/out-of-scope.md` に従う

## 完了条件

- [x] `docs/conversion/items.md`、`docs/requirements/data-id-policy.md`、関連するSkill変換仕様が、実装・生成JSON・要件例と整合している
- [x] 6種別のアイテムを、種別ごとに独立した変換関数で`items.json`へ変換できる
- [x] `items.json`が武器の`group`・`checkKey`階層とサイバネの`part`階層を持ち、全Item IDが名称hashを含む
- [x] 入力ヘッダー、必須値、数値、`-`、武器射程、列挙値、名称／hash／ID重複、`sourceOrder`を検証できる
- [x] `docs/requirements/data-id-policy.md`に定めるItem IDと重複制約を`items.json`全体で検証できる
- [x] 既存SkillのID生成・Schema・テストが名称hash形式へ移行し、3つの生成済みSkill JSONを再生成している
- [x] 既存のID例、ゲーム仕様、関連TODO、Visual Testが名称hash ID方針と矛盾していない
- [x] MDX本文とVisual Testの自動生成見出しへのリンクが、共有`createHeadingId(depth, text)`から組み立てた意味名付きconstを使い、既存リンク先を変えていない
- [x] アイテム取得層が、静的importした全Itemデータ、武器の`group`／`checkKey`配列、サイバネの`part`配列を返し、不明キーでは`undefined`を返す
- [x] 生成JSONを手編集せず、ローカル変換コマンドで更新している
- [x] `npm-run-all2`を追加し、理由・代替案・初期スコープに必要な理由を記録している
- [x] `npm run check` が通る
- [x] `npm test` が通る
- [x] `npm run build` が通る
- [x] `npm run convert:data`が全生成JSONを更新でき、流儀・生き様の依存する変換順を守る

## チェックポイント

- [x] 既存のSkill変換コマンドと再生成済みJSONが名称hash ID・入力順とは独立した`sourceOrder`を持つ
- [x] アイテム変換は各シートの専用変換関数を経由し、共通helperへ種別固有分岐を集約していない
- [x] 既存ルートとGitHub Pagesのサブパス公開に影響しない
- [x] CI/CDのbuildが`.raw/`または変換コマンドに依存しない
- [x] 不要な依存関係を追加していない
- [x] 初期スコープ外の機能を実装していない
- [x] `docs/TODO.md` の永続Skill参照のfollow-upを、キャラクターシート実装へ拡大せず更新または維持理由を記録している
- [x] 最新のDriveとローカル`items.xlsx`が、ナノマシン`埋め込み点数`、武器信用欄の`-`なし、武器射程の空欄なしの入力契約に一致している
- [x] design targetは不要なデータ変換タスクであり、`design-image-generation`を実行していない
- [x] ユーザーの未コミット変更を破壊していない

## 想定変更ファイル

- `docs/conversion/items.md`
- `docs/conversion/skills.md`
- `docs/conversion/common-skills.md`
- `docs/conversion/ryugi-skills.md`
- `docs/conversion/ikizama-skills.md`
- `docs/requirements/data-id-policy.md`
- `docs/requirements/data-display.md`
- `docs/game-design/skills.md`
- `docs/TODO.md`
- `package.json`
- `scripts/convert-items/*`
- `scripts/convert-skills/lib.ts`
- `src/lib/schemas/conversion/item.ts`
- `src/lib/types/item.ts`
- `src/lib/schemas/conversion/*`
- `src/lib/types/{skill,ryugi,ikizama,npc,release-notes,ryugi-skills,ikizama-skills}.ts`
- `src/lib/data/{common-skills,ryugi-skills,ikizama-skills,ryugi-list,ryugi-detail,ikizama,ikizama-detail,npcs,release-notes}.ts`
- `src/lib/utils/heading-id.ts`
- `src/lib/data/items.ts`
- `scripts/postprocess-page-toc/lib.ts`
- `src/pages/advancement.mdx`
- `src/pages/data/index.mdx`
- `src/pages/rules/index.mdx`
- `src/pages/rules/battle.mdx`
- `src/pages/rules/scenario-play.mdx`
- `tests/node/items.test.ts`
- `tests/node/common-skills.test.ts`
- `tests/node/ryugi-skills.test.ts`
- `tests/node/ikizama-skills.test.ts`
- `tests/visual/common-skills.spec.ts`
- `tests/visual/search-modal.spec.ts`
- `tests/visual/advancement.spec.ts`
- `tests/visual/battle.spec.ts`
- `tests/visual/rules.spec.ts`
- `tests/visual/scenario-play.spec.ts`
- `data/generated/items.json`
- `data/generated/common-skills.json`
- `data/generated/ryugi-skills.json`
- `data/generated/ikizama-skills.json`
- `data/generated/README.md`
- `package-lock.json`

## レビュー観点

- アイテム変換が種別ごとの専用関数に分離され、後続のシート追加や種別固有仕様変更を局所化できるか
- 名称hash IDが行の途中挿入と並び替えで変わらず、分類キーの変更時だけ意図どおり変わるか。意図的な同名Itemと名称hash衝突を区別しているか
- 武器・サイバネのJSON構造が、将来のクライアント側キャラクターシートでもそのまま利用できるか
- `-`、武器射程、ナノマシン`埋め込み点数`の入力契約がDriveの最新`items`と一致しているか
- Skill IDの再生成とID例・TODOの更新が、アイテム変換の範囲を超えてキャラクターシート実装へ広がっていないか
- 自動生成見出しへのリンクが、元の見出しの深さと文字列から組み立てられ、リンク先の既存アンカーを変えていないか
- 一括変換が依存する一覧JSONの完了を待ってから対応するスキルJSONを変換し、独立した変換を不必要に直列化していないか

## 備考

- `.raw/data/items.xlsx`はGit管理しない。同期済みのDrive `items`とローカル入力で、ナノマシンの見出しが`埋め込み点数`であり、武器信用欄の`-`と武器射程の空欄がないことを確認済み。
- 2026-07-22時点で、`happou`、`kakutou`、`kanshou`をID用の長音表記として採用する。
- UI、CSS、layout、page、Componentを変更しないため、design targetおよびdesign画像は不要。
- `docs/TODO.md`の永続Skill参照の検出は、キャラクターシート実装時のfollow-upとして維持する。このissueでは永続データを導入しないため、実装範囲を広げない。
- `npm-run-all2`は、固定した変換依存グラフを`run-s`と`run-p`で宣言的に表すため追加する。代替案のカスタムNodeランナーは実装済みだったが、プロセス起動・待機・失敗伝播を保守する必要があり、この小さな固定グラフには不要である。追加したv8.0.4はNode v20以上で動作し、Node v24.18.0を固定した本プロジェクトで利用できるため、初期スコープのローカル一括変換に必要な最小依存として採用する。
- 2026-07-22のコミット前回帰確認では、Node v24.18.0で`npm run convert:data`、`npm test`（12件）、`npm run check`、`npm run build`、`npm run build:public`、`npm audit`（脆弱性0件）がすべて成功した。生成データ、静的チェック、通常／公開用ビルド、依存更新後のテストにデグレは確認されなかった。

## レビュー指摘 1

### 指摘事項

- `getWeapons()`と`getCybernetics()`が任意文字列を通常のObjectへ直接アクセスするため、`toString`や`__proto__`などの不明キーで配列以外を返す。
- `items.xlsx`の未知な追加シートを検出せずに変換する。
- 共通スキル変換仕様が、既存の流儀・生き様スキル変換を「後続タスクで追加」と記述している。

### 判定

- source: local-pr-review
- classification: valid
- local validation: `src/lib/data/items.ts`はObjectのown property確認または入力キー検証なしにブラケットアクセスしており、戻り値契約の`undefined`と矛盾する。追加シートを変換対象外とする判断はユーザーが明示した。`docs/conversion/common-skills.md`の後続タスク記述は、既存の流儀・生き様専用entrypointと変換仕様に一致しない。
- remote snapshot: PR #61、`7237af6eb1bf5d1068b574a7c1a468017e3251c5..5bd47dc3ca32f49647e65c56facc1564d8824256`。remote discussion、review、未解決threadは開始時点でなし。

### 対応方針

- 取得APIはown propertyだけを返すか、既存のSchemaで入力キーを検証し、prototype由来の値を返さない。回帰テストに`toString`、`constructor`、`__proto__`を加える。
- 追加シート検出は実装しない。変換対象は明示した6シートだけとし、既存の個別シート検証を維持する。
- 共通スキル仕様の対象外説明を、流儀・生き様の専用変換仕様とentrypointを参照する内容へ訂正する。

### 対応完了チェックリスト

- [x] 取得APIがprototype由来の不明キーで`undefined`を返し、回帰テストで検証する
- [x] Item Excelの追加シート検出は行わず、明示した6シートだけを変換対象とする（ユーザー判断）
- [x] 共通スキル変換仕様の流儀・生き様に関する記述を現行実装へ整合する
- [x] `npm run convert:data` が通る
- [x] `npm test` が通る
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## レビュー指摘 2

### 指摘事項

- prototypeキー対策で取得層がZod Schemaをruntime importし、`node:crypto`を使うhash utilityまでブラウザ向け依存グラフへ含める。

### 判定

- source: local-pr-review
- classification: valid
- local validation: `src/lib/data/items.ts`は`WeaponGroupSchema`、`WeaponCheckKeySchema`、`CyberneticPartKeySchema`をruntime importしていた。これらを定義していたSchemaは`src/lib/utils/hash.ts`をimportし、同utilityは`node:crypto`に依存する。取得層は将来のクライアント側キャラクターシートでも利用する前提のため、Node専用依存を持ち込まない必要がある。
- remote snapshot: PR #61、`5bd47dc3ca32f49647e65c56facc1564d8824256..8bf7862854b955c5bf705a9ea27abbb41c01540e`。remote discussion、review、未解決threadは開始時点でなし。

### 対応方針

- 全データ種別の変換・生成JSON検証・ID生成は`src/lib/schemas/conversion/`へ集約し、ブラウザ安全なJSON型・定数は`src/lib/types/`へ分離する。取得層はSchemaをruntime importせず、生成済みdataのown propertyだけを`Object.hasOwn()`で参照してprototype由来の値を返さない。将来のクライアント入力検証は、生成済みデータのID存在確認に特化した独立Schemaとする。

### 対応完了チェックリスト

- [x] 全データ種別の変換・生成JSON検証・ID生成を`schemas/conversion`へ、JSON型・表示用定数をブラウザ安全な`types`へ分離する
- [x] 取得APIがSchemaのruntime importなしでown propertyだけを返す
- [x] prototypeキーの回帰テストを維持する
- [x] `npm test` が通る
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## レビュー指摘 3

### 指摘事項

- `schemas/conversion`のZod Schemaと、`types`の手書き公開型がコンパイル時に同値であることを検証していない。

### 判定

- source: local-pr-review
- classification: valid
- local validation: `src/lib/types/`はブラウザ安全性のため変換Schemaをimportしない。一方で、Zodの出力型と公開型が同じプロパティ、nullable性、配列階層、literalを持つことを保証する型レベルの検査はない。今回の8データ種別は目視上整合するが、将来片側だけを変更しても`asserts value is ...`だけでは乖離を検出できない。
- remote snapshot: PR #61、`8bf7862854b955c5bf705a9ea27abbb41c01540e..c575c5530e68dacd1fb166bb7beb8b008145f28a`。GitHub API接続障害により、remote discussion、review、未解決threadの最新状態は未確認。

### 対応方針

- `schemas/conversion/`側またはNode専用型テストに、各root Schemaの`z.output`と公開JSON型が双方向に代入可能であることをコンパイル時に検証する契約を置く。`types/`から変換Schemaへの依存は追加しない。

### 対応完了チェックリスト

- [x] 8種のroot Schemaと対応する公開JSON型の同値性を型レベルで検証する
- [x] `types/`がZod、hash utility、Node builtinへ実行時依存しないことを維持する
- [x] `npm test` が通る
- [x] `npm run check` が通る
- [x] `npm run build` が通る
