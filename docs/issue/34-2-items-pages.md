# 34-2-items-pages

## 目的

6種別のアイテム一覧ページを、対応するcontents指示書を正本として実装する。今回の最初のGroupは、武器ページとする。

## 背景

- `docs/plan.md` の `34-2-items-pages` は、6種別のページを同一issue・branch・PRで扱う。
- `.raw/contents/items-weapons.md` は、武器ページの本文と表示構成の正本である。以前の雛形作成時の「実装やdesign正本化は行わない」指示は、今回のユーザーによる実装開始指示で置き換わる。
- `.raw/contents/items-armors.md` は、防具ページの本文と表示構成の正本である。雛形作成時の実装禁止指示は、今回のユーザーによる実装開始指示で置き換わる。
- `.raw/contents/items-omamori.md` は、お守りページの本文と表示構成の正本である。雛形作成時の実装禁止指示は、今回のユーザーによる実装開始指示で置き換わる。
- サイバネ・ナノマシン・ドラッグのcontents指示書は未確定のため、内容を推測して実装しない。
- 関連TODO: ダミーの `src/pages/data/items/weapons.mdx` を正式実装に置き換える。

## 対象範囲

- `.raw/contents/items-weapons.md` に従い、`/data/items/weapons` を実装する。
- ダミーの `src/pages/data/items/weapons.mdx` を正式ページへ置き換える。
- `WeaponCard` と `CardContainer` を使い、凡例とカテゴリ別の武器一覧を表示する。
- `weapons_hero.webp` をcontents指示どおり表示する。
- 防具contentsに従い、`/data/items/armors` でhero、`ArmorCard`凡例、右カラムの6項目説明、生成済み防具の一覧を表示する。
- お守りcontentsに従い、`/data/items/omamori` でhero、warning Callout、`OmamoriCard`凡例、生成済みお守りの一覧を表示する。
- お守りのwarningでは、ブライ詳細ページの神仏の加護カード `skill-ikizama-burai-basic-pv-570c394fe082` へリンクする。
- `LegendContainer` を用い、武器・防具・お守りの凡例をdesktopではカード1カラム＋説明2カラム、768px以下ではカードと説明の2カラムで共通表示する。
- 既存のSkillLegendも`LegendContainer`へ移し、ページ固有の凡例CSSを削除する。
- 残る3種別は、対応するcontents指示書が確定後に同じissue内で追加する。
- 6種別すべてについて、対応するCardの凡例と一覧を実装し、種別ごとのVisual Review・design canonicalizeを行う。

## 初期スコープ外

- 未確定のcontentsをもとにしたサイバネ・ナノマシン・ドラッグページの実装
- 検索、絞り込み、ソート、ページネーション、比較・計算、詳細ページ遷移
- `WeaponCard` の表示契約の変更、データ変換仕様の変更、新規依存関係の追加
- 新規design画像の作成。既存の共通layoutと `docs/design/items/` の方向性を維持する。

## 完了条件

- [x] `/data/items/weapons` がcontentsの本文・HTMLコメント指示に従う
- [x] 凡例、喧嘩・暗殺・発砲・格闘・干渉の武器一覧が `WeaponCard` で表示される
- [x] ダミーの武器ページが正式実装に置き換わる
- [x] 未確定の3種別ページを推測実装していない
- [x] `/data/items/armors` がcontentsの本文・HTMLコメント指示に従う
- [x] `ArmorCard` の凡例と16件の防具一覧が表示される
- [x] `/data/items/omamori` がcontentsの本文・HTMLコメント指示に従う
- [x] warning Callout、神仏の加護への導線、`OmamoriCard`の凡例と21件の一覧が表示される
- [x] 武器・防具・お守りの凡例が共通の3→2カラムレイアウトで表示される
- [x] 既存SkillLegendも`LegendContainer`を使用し、凡例専用CSSを持たない
- [ ] 6種別すべてについて、確定したcontentsに従うページ、対応Cardの凡例と一覧を実装している
- [ ] 6種別それぞれのVisual Reviewを行い、designをcanonicalizeしている
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## ビジュアルレビュー 5

### デザイン参照

- design target: 該当なし。既存`SkillLegend`の表示仕様を`LegendContainer`へ移管する。
- reference desktop: 既存のSkillLegend（変更前）
- reference mobile: 既存のSkillLegend（変更前）
- notes: データページのカードと説明の3→2カラム構成を維持し、ページ固有CSSを削除する。

### 成果物

- actual desktop: `test-results/visual/data-desktop.png`
- actual mobile: `test-results/visual/data-mobile.png`
- report: `npm run visual:capture -- --grep '@data-(desktop|mobile)'`

### レビュー結果

| 領域                  | 判定 | 差分                                                     | 対応     |
| --------------------- | ---- | -------------------------------------------------------- | -------- |
| レイアウト            | OK   | desktopはカード1カラム＋説明2カラムを維持する            | 修正不要 |
| レスポンシブ          | OK   | 390px幅ではカードと説明を2カラムで表示し、横overflowなし | 修正不要 |
| 共通Componentとの整合 | OK   | アイテム凡例と同じ`LegendContainer`へ統一する            | 修正不要 |
| 既存デザインとの整合  | OK   | カード・見出し・説明リストの表示を維持する               | 修正不要 |

### 自己修正した項目

- [x] SkillLegendのページ内wrapperと`prose.css`の専用CSSを削除した
- [x] `LegendContainer`へ見出しと説明リストの共通スタイルを移した

### 人間判断が必要な差分

- なし

### design-image-generation への引き継ぎ候補

- [ ] なし

### 対応完了チェックリスト

- [x] desktop screenshot を取得した
- [x] mobile screenshot を取得した
- [x] reference と actual を比較した
- [x] 明らかな visual mismatch を修正した、または修正不要と判断した
- [x] design正本の更新は不要と判断した
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## ビジュアルレビュー 4

### デザイン参照

- design target: `docs/design/items/`。各アイテム個別ページは対象外であり、初期designの新規作成はユーザー指示により行わない。
- reference desktop: 該当なし
- reference mobile: 該当なし
- notes: 既存の`SkillLegend`の3→2カラム構成を基準に、武器・防具・お守りの凡例を共通Componentへ統一する。

### 成果物

- actual desktop: `test-results/visual/items-weapons-desktop.png`、`test-results/visual/items-armors-desktop.png`、`test-results/visual/items-omamori-desktop.png`
- actual mobile: `test-results/visual/items-weapons-mobile.png`、`test-results/visual/items-armors-mobile.png`、`test-results/visual/items-omamori-mobile.png`
- report: `npm run visual:capture -- --grep '@items-(weapons|armors|omamori)'`

### レビュー結果

| 領域                  | 判定 | 差分                                                                  | 対応     |
| --------------------- | ---- | --------------------------------------------------------------------- | -------- |
| レイアウト            | OK   | desktopはカード1カラム＋説明2カラムの3カラム構成へ統一する            | 修正不要 |
| レスポンシブ          | OK   | 390px幅では全3ページともカードと説明を2カラムで表示し、横overflowなし | 修正不要 |
| 既存Componentとの整合 | OK   | Card本体と一覧Card gridの契約を変更しない                             | 修正不要 |
| 既存デザインとの整合  | OK   | 共通layout、hero、既存Card表現を維持する                              | 修正不要 |

### 自己修正した項目

- [x] `LegendContainer` を追加し、3ページに重複していた凡例レイアウトを共通化した
- [x] 武器・防具のmobile凡例を1カラムから2カラムへ変更した

### 人間判断が必要な差分

- アイテム個別ページの初期designは作成しない。実装後のdesign canonicalizeの要否は、6種別の実装完了時に判断する。

### design-image-generation への引き継ぎ候補

- [ ] 実装スクリーンショットをdesign正本化する必要がある場合は、design fix modeへ引き継ぐ

### 対応完了チェックリスト

- [x] desktop screenshot を取得した
- [x] mobile screenshot を取得した
- [x] reference と actual を比較した
- [x] 明らかな visual mismatch を修正した、または修正不要と判断した
- [x] design正本の更新が必要な場合は、人間判断項目として記録した
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## チェックポイント

- [x] 既存ルートとGitHub Pagesのサブパス公開に影響しない
- [x] 不要な依存関係を追加していない
- [x] `WeaponCard` の実データIDを個別アンカーとして維持する
- [x] 既存の共通layoutと `docs/design/items/` の方向性を壊していない
- [x] 未コミット変更を破壊していない
- [x] 実装前に、各contentsのリンク先、凡例表示、データキーが確定している

## 想定変更ファイル

- `src/pages/data/items/weapons.mdx`
- `tests/visual/items-weapons.spec.ts`
- `src/pages/data/items/armors.mdx`（防具実装開始後）
- `tests/visual/items-armors.spec.ts`（防具実装開始後）
- `src/pages/data/items/omamori.mdx`
- `tests/visual/items-omamori.spec.ts`
- `src/components/data/LegendContainer.astro`
- `src/pages/data/index.mdx`（既存SkillLegendの共通Component移行）
- `src/styles/prose.css`（既存SkillLegend専用CSSの削除）
- `tests/visual/data.spec.ts`（共通Componentのselectorへ更新）
- `tests/visual/config.ts`
- 必要に応じて、武器ページ専用の既存コード配下のファイル

## レビュー観点

- 武器contentsの本文・HTMLコメント指示がそのまま表示構成へ反映されているか
- 防具contentsの本文・HTMLコメント指示がそのまま表示構成へ反映されているか
- お守りcontentsの本文・HTMLコメント指示がそのまま表示構成へ反映されているか
- 武器・防具・お守りの凡例が共通レイアウトを使い、desktopと768px以下で指定のカラム構成になるか
- 3種別の未確定contentsをこの時点で実装対象に含めない判断でよいか
- 6種別の実装後に、種別ごとのVisual Review・design canonicalizeを行う計画でよいか

## 備考

- design参照: `docs/design/items/` はアイテムトップページの既存designであり、武器個別ページには適用しない。初期designの新規作成はユーザー指示により行わないが、`docs/plan.md` に従い各種別の実装後にVisual Review・design canonicalizeを行う。
- Previewサーバーは、実装開始後の作業中は起動を維持する。作業後には `npm run build` を実行する。
- 武器実装開始前に、contentsの `#ハッシュ` のリンク先、重複した説明番号、`normal.ansatu` と実データキー `ansatsu` の対応、武器種別の凡例表示を確定した。
- 防具contentsは、既存の`ArmorCard`契約（`信用`、`防御力`、`ダメージ軽減`、`装備制限`、`効果`）と整合することを確認した。`armors_hero.webp` も配置済みである。
- お守りcontentsは、既存の`OmamoriCard`契約（`信用`、`効果`）と整合することを確認した。`omamori_hero.webp` と21件の生成済みデータも配置済みである。warning内の神仏の加護リンク先は、`/data/ikizama/burai#skill-ikizama-burai-basic-pv-570c394fe082` とする。

## ビジュアルレビュー 1

### デザイン参照

- design target: `docs/design/items/`。武器個別ページは対象外であり、初期designの新規作成はユーザー指示により行わない。
- reference desktop: 該当なし
- reference mobile: 該当なし
- notes: 既存の共通layout、`WeaponCard`、`CardContainer`との整合性を確認する。

### 成果物

- actual desktop: `test-results/visual/items-weapons-desktop.png`
- actual mobile: `test-results/visual/items-weapons-mobile.png`
- report: `npm run visual:capture`

### レビュー結果

| 領域                  | 判定 | 差分                                            | 対応     |
| --------------------- | ---- | ----------------------------------------------- | -------- |
| レイアウト            | OK   | PCは凡例を2カラム、mobileは1カラムで表示する    | 修正不要 |
| レスポンシブ          | OK   | 390px幅で横overflowなし                         | 修正不要 |
| 既存Componentとの整合 | OK   | 既存の3列／2列Card gridと個別アンカーを維持する | 修正不要 |
| 既存デザインとの整合  | OK   | 共通layout、hero、既存Card表現を維持する        | 修正不要 |

### 自己修正した項目

- [x] MDX内の凡例用スタイルをMDX互換の記法へ修正した

### 人間判断が必要な差分

- 武器個別ページの初期designは作成しない。実装後のdesign canonicalizeの要否は、6種別の実装完了時に判断する。

### design-image-generation への引き継ぎ候補

- [ ] 実装スクリーンショットをdesign正本化する必要がある場合は、design fix modeへ引き継ぐ

### 対応完了チェックリスト

- [x] desktop screenshot を取得した
- [x] mobile screenshot を取得した
- [x] reference と actual を比較した
- [x] 明らかな visual mismatch を修正した、または修正不要と判断した
- [x] design正本の更新が必要な場合は、人間判断項目として記録した
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## ビジュアルレビュー 3

### デザイン参照

- design target: `docs/design/items/`。お守り個別ページは対象外であり、初期designの新規作成はユーザー指示により行わない。
- reference desktop: 該当なし
- reference mobile: 該当なし
- notes: 既存の共通layout、`OmamoriCard`、`CardContainer`、warning Calloutとの整合性を確認する。

### 成果物

- actual desktop: `test-results/visual/items-omamori-desktop.png`
- actual mobile: `test-results/visual/items-omamori-mobile.png`
- report: `npm run visual:capture -- --grep @items-omamori`

### レビュー結果

| 領域                  | 判定 | 差分                                                           | 対応     |
| --------------------- | ---- | -------------------------------------------------------------- | -------- |
| レイアウト            | OK   | hero、warning、凡例、一覧をcontentsの順序で表示する            | 修正不要 |
| レスポンシブ          | OK   | 390px幅でも凡例のカードと説明を2カラムで表示し、横overflowなし | 修正不要 |
| 既存Componentとの整合 | OK   | 既存の3列／2列Card gridとwarning Calloutを維持する             | 修正不要 |
| 既存デザインとの整合  | OK   | 共通layout、hero、既存Card表現を維持する                       | 修正不要 |

### 自己修正した項目

- [x] モバイルでも凡例のカードと説明を横並びに維持した

### 人間判断が必要な差分

- お守り個別ページの初期designは作成しない。実装後のdesign canonicalizeの要否は、6種別の実装完了時に判断する。

### design-image-generation への引き継ぎ候補

- [ ] 実装スクリーンショットをdesign正本化する必要がある場合は、design fix modeへ引き継ぐ

### 対応完了チェックリスト

- [x] desktop screenshot を取得した
- [x] mobile screenshot を取得した
- [x] reference と actual を比較した
- [x] 明らかな visual mismatch を修正した、または修正不要と判断した
- [x] design正本の更新が必要な場合は、人間判断項目として記録した
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## ビジュアルレビュー 2

### デザイン参照

- design target: `docs/design/items/`。防具個別ページは対象外であり、初期designの新規作成はユーザー指示により行わない。
- reference desktop: 該当なし
- reference mobile: 該当なし
- notes: 既存の共通layout、`ArmorCard`、`CardContainer`との整合性を確認する。

### 成果物

- actual desktop: `test-results/visual/items-armors-desktop.png`
- actual mobile: `test-results/visual/items-armors-mobile.png`
- report: `npm run visual:capture -- --grep @items-armors`

### レビュー結果

| 領域                  | 判定 | 差分                                            | 対応     |
| --------------------- | ---- | ----------------------------------------------- | -------- |
| レイアウト            | OK   | PCは凡例を2カラム、mobileは1カラムで表示する    | 修正不要 |
| レスポンシブ          | OK   | 390px幅で横overflowなし                         | 修正不要 |
| 既存Componentとの整合 | OK   | 既存の3列／2列Card gridと個別アンカーを維持する | 修正不要 |
| 既存デザインとの整合  | OK   | 共通layout、hero、既存Card表現を維持する        | 修正不要 |

### 自己修正した項目

- [ ]

### 人間判断が必要な差分

- 防具個別ページの初期designは作成しない。実装後のdesign canonicalizeの要否は、6種別の実装完了時に判断する。

### design-image-generation への引き継ぎ候補

- [ ] 実装スクリーンショットをdesign正本化する必要がある場合は、design fix modeへ引き継ぐ

### 対応完了チェックリスト

- [x] desktop screenshot を取得した
- [x] mobile screenshot を取得した
- [x] reference と actual を比較した
- [x] 明らかな visual mismatch を修正した、または修正不要と判断した
- [x] design正本の更新が必要な場合は、人間判断項目として記録した
- [x] `npm run check` が通る
- [x] `npm run build` が通る
