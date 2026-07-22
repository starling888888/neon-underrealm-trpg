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

### アーキテクチャ制約

- `weapons`、`armors`、`omamori`、`cybernetics`、`nanomachines`、`drugs`は、それぞれ専用の変換関数を持つ
- 各専用変換関数は、自身のシート名、ヘッダー、行の型変換、種別固有の検証、出力形状を責務として持つ
- 共通の文字列正規化、数値検証、名称hash、JSON書込みなどだけを共有helperへ抽出する
- 1つの巨大な条件分岐で全シートを変換する実装、ページ側でのシート別データ整形、Excel入力へのID列追加は行わない

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
- [x] 新しいnpm packageを追加していない。追加が必要になった場合は、理由・代替案・初期スコープに必要な理由を記録する
- [x] `npm run check` が通る
- [x] `npm test` が通る
- [x] `npm run build` が通る

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
- `src/lib/schemas/item.ts`
- `src/lib/schemas/skill.ts`
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

## レビュー観点

- アイテム変換が種別ごとの専用関数に分離され、後続のシート追加や種別固有仕様変更を局所化できるか
- 名称hash IDが行の途中挿入と並び替えで変わらず、分類キーの変更時だけ意図どおり変わるか。意図的な同名Itemと名称hash衝突を区別しているか
- 武器・サイバネのJSON構造が、将来のクライアント側キャラクターシートでもそのまま利用できるか
- `-`、武器射程、ナノマシン`埋め込み点数`の入力契約がDriveの最新`items`と一致しているか
- Skill IDの再生成とID例・TODOの更新が、アイテム変換の範囲を超えてキャラクターシート実装へ広がっていないか
- 自動生成見出しへのリンクが、元の見出しの深さと文字列から組み立てられ、リンク先の既存アンカーを変えていないか

## 備考

- `.raw/data/items.xlsx`はGit管理しない。同期済みのDrive `items`とローカル入力で、ナノマシンの見出しが`埋め込み点数`であり、武器信用欄の`-`と武器射程の空欄がないことを確認済み。
- 2026-07-22時点で、`happou`、`kakutou`、`kanshou`をID用の長音表記として採用する。
- UI、CSS、layout、page、Componentを変更しないため、design targetおよびdesign画像は不要。
- `docs/TODO.md`の永続Skill参照の検出は、キャラクターシート実装時のfollow-upとして維持する。このissueでは永続データを導入しないため、実装範囲を広げない。
