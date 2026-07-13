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

- [ ] `docs/design/skill-card/notes.md`、`design-desktop.png`、`design-mobile.png` を initial draftとして作成し、ユーザーが実装用designを承認している
- [ ] `SkillCard.astro` が通常スキルと凡例用データを表示できる
- [ ] カードが名称、最大レベル、タイミング、コスト、技能、取得制限、使用制限、対象、射程を表示できる
- [ ] 所属、区分、IDをカード内に表示しない
- [ ] 概要と効果を改行のみで分けた本文欄として表示する
- [ ] 一見して意味が分かる情報にはラベルを付けない
- [ ] カードがdesignで定めた最低高さを持ち、本文量に応じて高さを可変にする
- [ ] 概要と効果の文字が通常のページ本文より十分に小さい
- [ ] 取得制限または使用制限が `null` または空欄の場合に `-` を表示する
- [ ] 個別アンカーIDを受け取る場合に、カード内で可視表示せずHTMLアンカーとして付与できる
- [ ] Component designにスマホ2列・デスクトップ3列または4列で読めるカード最低幅を記録している
- [ ] `npm run check` が通る
- [ ] `npm run build` が通る
- [ ] Visual Reviewでdesignとの整合を確認している

## チェックポイント

- [ ] 既存ルートが壊れていない
- [ ] GitHub Pagesのサブパス公開に影響しない
- [ ] 不要な依存関係を追加していない
- [ ] 初期スコープ外の機能を実装していない
- [ ] `28-2-common-skills-page` のTODOと矛盾していない
- [ ] `docs/design/skill-card/` の承認済みdesignと矛盾していない
- [ ] ユーザーの未コミット変更を破壊していない

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
