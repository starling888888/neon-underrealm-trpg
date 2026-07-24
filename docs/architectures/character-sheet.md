# Webキャラクターシートのアーキテクチャ

## 目的と範囲

`/character-sheet/`を、既存のAstro静的サイトへ限定的なReact Islandとして追加する。キャラクター入力、派生値算出、検証、端末内の最新1件保存・復元、画像、JSON入出力、CCFOLIAコピーを、サーバー処理なしで扱う。

本書はコンポーネント境界、状態境界、データ参照、ブラウザ永続化、依存ライブラリを正本化する。実装ゲート、作業順、完了条件、JSON入出力形式、CCFOLIA出力文字列形式、実行時schemaの具体形は扱わない。

## 参照正本と制約

- 機能要件: `docs/requirements/character-sheet.md`
- 画面design: `docs/design/character-sheet/notes.md`
- 実装の契約とゲート管理: `docs/issue/ex-02-web-character-sheet.md`
- ゲーム仕様と選択肢: `src/pages/`配下のゲーム仕様と`data/generated/`配下の生成JSON
- 初期対象viewportはdesktop、tablet、mobileである。
- 画面はフルスクラッチのReact Componentで実装する。UIライブラリ、デザインシステム、Component固定型のフォームライブラリは導入しない。React Componentに適用するscoped CSSの方式と追加依存の要否は、既存CSSとの共存を確認してから決める。

## 推奨構成

### AstroとReact Island

`src/pages/character-sheet.astro`は、既存のAstro layout、メタ情報、静的な周辺コンテンツ、React Islandの配置だけを担う。キャラクターシート本体は`client:load`のReact Islandとし、サイト全体をSPA化しない。

React Islandの責務は、入力、画面内の開閉、確認・通知dialog、ブラウザAPI、端末内保存に限定する。サイト共通のHeader、Footer、ナビゲーションはAstro側の既存実装を維持する。

### Feature境界

キャラクターシート固有の実装は、`src/character-sheet/`配下へ閉じ込める。

```text
src/
├── pages/
│   └── character-sheet.astro
└── character-sheet/
    ├── CharacterSheetContainer.tsx
    ├── CharacterSheetForm.tsx
    ├── components/
    ├── form/
    ├── logic/
    ├── master-data/
    ├── schemas/
    ├── persistence/
    └── browser/
```

- `CharacterSheetContainer.tsx`: マスタデータ、純粋logic、ブラウザ副作用を結線する統合点とする。
- `CharacterSheetForm.tsx`: React Hook Form（RHF）の`useForm`と`FormProvider`を持つフォーム根とする。保存済み下書きの復元、各入力セクションの登録、可変行の追加・削除を結線する。
- `components/`: JSXと表示を担う。入力に関わるComponentはRHFのform contextを利用してよい。マスタ検索、派生値計算、検証、永続化、ブラウザAPIへの直接アクセスは置かない。
- `form/`: 編集値の型、初期値、RHFの可変配列操作、保存・復元hookを置く。RHF以外の編集state storeは置かない。
- `logic/`: React、RHF、DOM、Storage、IndexedDBに依存しない派生値算出と検証を置く。
- `master-data/`: 読み取り専用のゲームデータから、IDによる選択肢と表示用情報を引く境界とする。既存`src/lib/data/`のaccessorを再利用するか、専用adapterを設けるかは実装Gateで決める。
- `schemas/`: 現在の入力値を検証するschemaと、IndexedDB record・JSON入力を検証するschemaを置く。具体的な形、JSON形式、CCFOLIA出力形式は各実装Gateで定める。
- `persistence/`: serializableな下書きのlocalStorage adapterと画像BlobのIndexedDB永続化を置く。
- `browser/`: Clipboard、ファイルdownload、画像decode・WebP変換などのブラウザAPIを置く。

入力欄単位の機械的なComponent分割、汎用パス文字列による状態更新、全機能分の先行抽象化は行わない。

### 状態と派生値の境界

RHFを、このIsland内でユーザーが直接編集する値の唯一の保持先とする。可変行は`useFieldArray`で扱い、流儀の変更、スキル行の追加、能力値修正、縁のクリア、アイテム選択の変更をRHFの操作として行う。RHFの値を別のstate storeへ複製しない。

| 種別                                          | 置き場所                      | 永続化先     |
| --------------------------------------------- | ----------------------------- | ------------ |
| ユーザーが直接編集するキャラクター値          | RHF                           | localStorage |
| 可変行の順序、選択マスタID、明示的な空欄・`0` | RHF                           | localStorage |
| WebP画像の参照情報                            | RHF                           | localStorage |
| WebP画像のバイナリ                            | IndexedDBの画像用record       | IndexedDB    |
| マスタデータ                                  | `master-data/`                | 保存しない   |
| 派生値、ViewModel、エラー・警告結果           | `logic/`とContainer           | 保存しない   |
| dialog、メニュー、折りたたみの開閉状態        | Component内のReact `useState` | 保存しない   |

画像バイナリはlocalStorageのJSONへ混ぜない。画像用recordへ分離し、RHFには対応する参照だけを保持する。両保存先の書込み順、旧Blobの削除、全消去時の削除、画像record不整合時の復旧は実装Gateで定める。JSON入出力で画像をどう表すかも、該当Gateで定める。

### 自動保存と復元

フォームのserializableな最新1件だけをlocalStorageへ保存する。RHFの`subscribe`で値を監視し、短時間の連続入力をまとめて保存する。保存用にフォーム全体を`useWatch`して入力ごとに再描画させない。同期処理のためだけの追加ライブラリは導入しない。

AstroのSSRとhydrationにおける表示差分を避けるため、初回復元はマウント後に行う。localStorageから読み出した値は、現在の入力値を対象にした構造・型検証を通った場合だけRHFの`reset`で一括反映する。現在のマスタIDに対応しない選択値または可変行は復元対象から除外する。除外後に必須構造を満たせず完全な互換性を保てない場合は、復元せずエラーを表示する。復元完了まで自動保存を開始せず、初期値で既存下書きを上書きしない。ページ離脱時には、保留中の保存があれば直近値を保存する。

復元状態は少なくとも未開始、復元中、利用可能、復元失敗を区別する。保存データが読み込めない場合、現在の編集stateへ部分反映しない。localStorageの利用不可、容量超過、書込み失敗は編集を止めず、警告として通知する。画像recordの読み込み失敗または画像変換の失敗では、既存の画像を上書き・削除せず、失敗をダイアログで通知する。

## データ境界

マスタデータは読み取り専用であり、storeへ複製・永続化しない。キャラクター入力は名称ではなくマスタIDを保持し、表示、候補絞り込み、派生値、検証は、入力stateと読み取り専用マスタデータを明示的に渡して解決する。

派生値算出と検証は純粋関数に分離する。副作用を持つ処理は、Containerから`persistence/`または`browser/`を経由して実行する。これにより、JSON形式、CCFOLIA出力、schemaの詳細が後続Gateで増えても、画面Componentや算出logicへ混入させない。

### スタイル境界

React Componentのスタイルは、Component外へ漏れないscoped CSSを使う。具体方式は、既存Astro scoped CSSとの共存、React TSXでの適用範囲、追加依存の要否を比較してから確定する。追加ライブラリが不要な方式を優先するが、方式の決定と導入は実装Gateに先立つ判断とする。

## 依存ライブラリ

### 選定基準

候補は次の順に評価する。

1. 長期利用実績があり、互換性と保守継続性を確認できること
2. npmのダウンロード数と採用実績が十分であること
3. 初期bundleと依存関係が軽量であること

既知の脆弱性、現在のAstro・React・TypeScriptとの非互換、静的ホスティングを壊す前提を持つ候補は、上記比較の前に除外する。ダウンロード数は選定時点のnpm表示値を参考情報として記録し、固定の品質指標にはしない。

### 採用する依存

| 用途                        | 推奨                                   | 理由                                                                  | 採否 |
| --------------------------- | -------------------------------------- | --------------------------------------------------------------------- | ---- |
| AstroでReact Islandを動かす | `@astrojs/react`、`react`、`react-dom` | Islandを限定し、Astroサイト全体をSPA化しない                          | 採用 |
| 編集フォーム                | `react-hook-form`                      | 可変行を含む巨大formの編集値を一箇所に保持し、素のReact inputを扱える | 採用 |
| 画像BlobのIndexedDB保存     | `idb-keyval`                           | WebP Blob 1件のkey-value保存に必要な範囲へ絞れる                      | 採用 |
| 実行時検証                  | 既存の`zod`                            | 既に依存に含まれる。具体的なschemaは各Gateで追加する                  | 採用 |

`localStorage`はブラウザ標準APIを使い、画像を除くserializableな最新1件の下書きを保存する。`idb-keyval`はBlobを含むstructured-clone可能な値を保存できるため、WebP画像recordの保存要件に適する。RHFの編集値同期は`subscribe`、`reset`、小さな自前hookで完結させる。

### 比較した候補

| 領域      | 候補                               | 長期実績・採用実績                          | 軽量性                           | この機能での評価                                                            |
| --------- | ---------------------------------- | ------------------------------------------- | -------------------------------- | --------------------------------------------------------------------------- |
| form      | `react-hook-form`                  | npm週次ダウンロード約4,762万、依存0         | 小さい                           | 採用推奨。素のReact inputと可変配列を扱い、編集値の唯一の保持先にできる     |
| form      | ライブラリなし＋React `useReducer` | React標準                                   | 追加bundleなし                   | 不採用推奨。巨大form、可変配列、検証、保存同期を独自に結線する範囲が大きい  |
| form      | `@tanstack/react-form`             | npm週次ダウンロード約192万                  | 追加依存あり                     | 不採用推奨。RHFより採用実績が少なく、初期要件に必要な優位性がない           |
| 保存      | localStorage＋自前RHF同期hook      | ブラウザ標準                                | 追加bundleなし                   | 採用推奨。画像を除く最新1件の同期保存は`subscribe`と`reset`で完結する       |
| 保存      | 保存同期ライブラリ                 | 候補ごとに異なる                            | 追加依存                         | 不採用推奨。保存対象の除外、復元順、失敗通知をこの要件どおりに制御しにくい  |
| IndexedDB | `idb-keyval`                       | 小さなkey-value用途として長期利用されている | get/set中心ではbrotli約295 bytes | 採用推奨。画像Blob 1件には十分                                              |
| IndexedDB | `idb`                              | IndexedDB API全体を扱える                   | brotli約1.19 kB                  | 将来候補。複数画像、索引、複雑なtransactionが必要になった場合だけ再比較する |

ダウンロード数の参照日は2026-07-24とする。サイズは各プロジェクトの公式READMEまたはnpm表示の公表値であり、実装時には実際のproduction buildで確認する。

### 導入しないライブラリ

- UIキット、デザインシステム、Headless UI、CSS framework
- ルールエンジン、数式解析、自由文効果解析
- JSON入出力、CCFOLIA出力、画像変換、Clipboard、downloadのためだけのライブラリ
- RHFと並行して編集値を保持するstate managementライブラリ
- RHFからlocalStorageへの同期を抽象化する追加ライブラリ

UIは全てフルスクラッチとし、画像変換、Clipboard、downloadはbrowser標準APIを`browser/`のadapterへ閉じ込める。

## ユーザー判断が必要な項目

| 項目               | 決定                                                                    | 判断の内容                                                                                       |
| ------------------ | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 基盤依存           | `@astrojs/react`、`react`、`react-dom`、`react-hook-form`、`idb-keyval` | React IslandとRHFを導入する。`localStorage`はブラウザ標準APIを使う。                             |
| 編集値の保持先     | RHFを唯一の編集stateとする                                              | Zustandなどの別storeへ編集値を複製しない。UIの一時状態だけはComponent内のReact stateで扱う。     |
| 下書きの端末内保存 | 画像以外はlocalStorageへ最新1件を自動保存する                           | RHFの`subscribe`、`reset`、デバウンスを使う自前hookで同期する。保存同期ライブラリは導入しない。  |
| 画像の端末内保存   | 編集stateとは別のIndexedDB画像recordへWebP Blobを保存する               | JSON化する下書きとBlobを混在させない。変換・画像recordの失敗では既存画像を上書き・削除しない。   |
| 永続化の詳細       | 保存先間の整合性とキー名前空間は実装Gateで定める                        | localStorageとIndexedDBの書込み順、削除、key / DB / store名は現時点で固定しない。                |
| 実行時schema       | `zod`は既存依存を使う                                                   | 現在の入力値用とIndexedDB record・JSON入力用の2系統を作る。具体的なschemaは各実装Gateで定める。  |
| WebP圧縮品質       | 未決定                                                                  | 5 MiB入力・長辺約500px・WebP変換は要件で確定済み。品質値は要件へ確定値を反映する前に判断が必要。 |
| scoped CSS         | 方針と依存ライブラリを比較して決定する                                  | 既存Astro CSSとの共存とReact Componentへの限定適用を確認する。                                   |
| 型定義依存         | devDependenciesへ先行して明記しない                                     | React関連以外を含む必要な型定義を、実装時の実際の依存と型検査から判断する。                      |

JSON入出力形式、CCFOLIA出力テキスト形式、実行時schemaの詳細は、いずれもユーザー判断を含む各実装Gateで定める。本書では固定しない。
