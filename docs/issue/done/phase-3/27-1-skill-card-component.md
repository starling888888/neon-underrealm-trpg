# 27-1-skill-card-component

## 目的

スキルの情報を読みやすく表示する `SkillCard` Componentを作成する。

## 背景

`docs/plan.md` の `27-1-skill-card-component` を実施する。`docs/requirements/data-display.md` の FR-04-01 を、このissueで定義するカード表示方針へ更新した。

所属と区分は一覧ページとそのページ内のセクションで分かるため、個別カードでは繰り返し表示しない。IDはデータ識別と個別アンカーに利用するが、カード上には表示しない。

関連する TODO は、`/data/common-skills` を `28-2-common-skills-page` で作成する追跡項目である。このissueでは一覧ページや `SkillList` を実装しない。

`docs/design/skill-card/` は存在しない。実装前に `.agents/skills/design-image-generation/SKILL.md` の initial draft mode でComponent designを作成する。

## 対象範囲

- `src/components/data/SkillCard.astro` を追加する
- スキルの名称、最大レベル、タイミング、コスト、技能、取得制限、使用制限、対象、射程を表示する
- 概要と効果を、ラベルなしの1つの本文欄で改行して表示する
- 所属、区分、IDをカード内に表示しない
- 事前に決定された個別アンカーIDを受け取り、可視表示せずにHTMLアンカーとして利用できる構造にする。スキルIDからアンカーIDを生成しない
- 一見して意味が分かる情報にはラベルを付けず、判別が必要な情報だけにラベルを付ける
- 縦長のカードにComponent designで定める最低高さを設け、本文量に応じて高さを可変にする
- 概要と効果の文字を通常のページ本文より十分に小さくし、長文による過度な縦長化を抑える
- 取得制限または使用制限が `null` または空欄の場合は、`-` を表示する
- `SkillCard` を凡例用データでも利用できるようにする
- スマホ2列・デスクトップ3列または4列の一覧gridは、後続の `28-1-common-skills-components` における `SkillList` の責務とする。今回のComponent designでは、その列数で読めるカード最低幅を定める
- 実装後にVisual Reviewを行い、承認済みのdesignとの差分だけを修正する

## 初期スコープ外

- `SkillList`、共通スキル一覧ページ、流儀・生き様ページを実装しない
- Excel変換、生成JSON、スキル検証schema、データ取得層を実装しない
- IDの採番規則やゲーム上のスキル定義を変更しない
- 検索、絞り込み、ソート、クライアント側の状態管理を追加しない
- 新しいUIライブラリを追加しない
- `docs/out-of-scope.md` の初期スコープ外機能を実装しない

## 完了条件

- [x] `docs/design/skill-card/notes.md`、`design-desktop.png`、`design-mobile.png` を initial draftとして作成し、ユーザーが実装用designを承認している
- [x] `SkillCard.astro` が通常スキルと凡例用データを表示できる
- [x] カードが名称、最大レベル、タイミング、コスト、技能、取得制限、使用制限、対象、射程を表示できる
- [x] 所属、区分、IDをカード内に表示しない
- [x] 概要と効果を改行のみで分けた本文欄として表示する
- [x] 一見して意味が分かる情報にはラベルを付けない
- [x] カードがdesignで定めた最低高さを持ち、本文量に応じて高さを可変にする
- [x] 概要と効果の文字が通常のページ本文より十分に小さい
- [x] 取得制限または使用制限が `null` または空欄の場合に `-` を表示する
- [x] 個別アンカーIDを受け取る場合に、カード内で可視表示せずHTMLアンカーとして付与できる
- [x] Component designにスマホ2列・デスクトップ3列または4列で読めるカード最低幅を記録している
- [x] `npm run check` が通る
- [x] `npm run build` が通る
- [x] Visual Reviewでdesignとの整合を確認している

## チェックポイント

- [x] 既存ルートが壊れていない
- [x] GitHub Pagesのサブパス公開に影響しない
- [x] 不要な依存関係を追加していない
- [x] 初期スコープ外の機能を実装していない
- [x] `28-2-common-skills-page` のTODOと矛盾していない
- [x] `docs/design/skill-card/` の承認済みdesignと矛盾していない
- [x] ユーザーの未コミット変更を破壊していない

## 想定変更ファイル

- `docs/requirements/data-display.md`
- `docs/plan.md`
- `docs/design/skill-card/notes.md`
- `docs/design/skill-card/design-desktop.png`
- `docs/design/skill-card/design-mobile.png`
- `src/components/data/SkillCard.astro`
- 必要最小限のローカル表示確認用ファイル

## レビュー観点

- カード内で所属・区分・IDを表示しない判断が、ページとセクションによる識別に適しているか
- 概要と効果をラベルなしで改行分割する本文欄が読み分けられるか
- ラベルを付けない項目と付ける項目の基準が、情報量と判読性の両方を満たすか
- スマホ2列、デスクトップ3列または4列で読めるカード最低幅、最低高さ、本文文字サイズをComponent designで具体化できるか
- 対象と射程を表示することで、スキル使用時の判断に必要な情報が揃うか
- アンカーIDを呼び出し側から受け取る構造が、将来のデータID・変換仕様と衝突しないか
- `SkillList` と一覧ページを後続タスクへ残す範囲が適切か

## 備考

- このissue作成時点で `public/images/data/` はユーザーの未コミット変更として存在する。対象に含めず、コミット時にも流儀heroを含めない。
- `docs/design/skill-card/` のinitial draftは実装前の検討成果物であり、ユーザー承認前に実装を開始しない。

## ビジュアルレビュー 1

### デザイン参照

- `docs/design/skill-card/design-desktop.png`
- `docs/design/skill-card/design-mobile.png`
- `docs/design/skill-card/notes.md`

### 成果物

- `test-results/visual/skill-card-desktop.png`
- `test-results/visual/skill-card-mobile.png`

### レビュー結果

| 観点             | 結果 | 確認内容                                                                                                  |
| ---------------- | ---- | --------------------------------------------------------------------------------------------------------- |
| レイアウト       | OK   | desktop 3列、mobile 2列で表示し、同一grid行のカード高が最長カードに揃うことをVisual testでも確認した。    |
| カード情報       | OK   | 最大LV、タイミング・コスト・技能、2×2の制限・対象・射程、ラベルなし本文を確認した。                       |
| 本文の読み分け   | OK   | 概要を淡色、効果を太字にし、区切り線なしで改行のみの本文欄にした。                                        |
| 可読性・overflow | OK   | 長文サンプルを含め、desktop / mobileとも横overflowがないことをVisual testで確認した。                     |
| 実ページ枠       | OK   | build済みpreviewで既存のHeader、SiteMenu、PageTocとカテゴリ見出しを含む`/-local/skill-cards/`を確認した。 |

### 自己修正

- `.prose h3` の左罫線と余白がカード名へ継承していたため、`.skill-card-name` で罫線とpaddingをリセットした。カード名はdesignどおり短いアクセント下線だけを表示する。

### design正本化

- actual screenshotをdesign正本へコピーしていない。コンポーネントの整合を確認済みであり、追加の正本化は不要と判断した。

## レビュー指摘 1

### 指摘事項

- 対象の取りうる値へ`自身`を追加し、表記は`自分`ではなく`自身`に統一する。
- 対象が`自身`のスキルでは、コストと射程が`null`になりうるため、`SkillCard`の入力では任意にする。
- Component API上の技能は`skill`ではなく`proficiency`として扱う。

### 判定

- source: human
- classification: valid
- local validation: `docs/game-design/skills.md`の対象値には`自身`がなく、`SkillCard.astro`の`cost`と`range`は必須`string`である。ローカルモックには対象`自分`が3件あり、Component propsは技能を`skill`として受け取っている。いずれも現行issueの表示契約と表示確認用モックに含まれるため、本issueで対応する。

### 対応方針

- `docs/game-design/skills.md`の対象値に`自身`を追加し、`SkillCard`に渡す対象表記を`自身`へ統一する。
- `cost`と`range`を`string | null`の任意propsに変更し、`null`または空欄は既存の制限項目と同様に`-`で表示する。
- `skill` propを`proficiency`へ改名し、モックとVisual testを追従させる。画面上の表示ラベルやレイアウトは変えない。

### 対応完了チェックリスト

- [x] 対象の取りうる値に`自身`を追加し、モック表記を統一する
- [x] コストと射程の`null` / 空欄を`-`として表示できる
- [x] Component APIの技能propを`proficiency`へ改名する
- [x] `npm run check` が通る
- [x] `npm run build` が通る
- [x] 対象`自身`と空欄コスト・射程を含むVisual captureが通る
