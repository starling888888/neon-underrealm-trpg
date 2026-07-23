# 34-2-items-pages

## 目的

6種別のアイテム一覧ページを、対応するcontents指示書を正本として実装する。今回の最初のGroupは、武器ページとする。

## 背景

- `docs/plan.md` の `34-2-items-pages` は、6種別のページを同一issue・branch・PRで扱う。
- `.raw/contents/items-weapons.md` は、武器ページの本文と表示構成の正本である。以前の雛形作成時の「実装やdesign正本化は行わない」指示は、今回のユーザーによる実装開始指示で置き換わる。
- `.raw/contents/items-armors.md` は、防具ページの本文と表示構成の正本である。雛形作成時の実装禁止指示は、今回のユーザーによる実装開始指示で置き換わる。
- `.raw/contents/items-omamori.md` は、お守りページの本文と表示構成の正本である。雛形作成時の実装禁止指示は、今回のユーザーによる実装開始指示で置き換わる。
- `.raw/contents/items-cybernetics.md`、`.raw/contents/items-nanomachines.md`、`.raw/contents/items-drugs.md` は、残る3種別の本文と表示構成の正本である。ユーザーの実装開始指示により、3ページを実装する。
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
- SkillLegendの説明リストは右カラムへ直接表示し、「カードの項目」見出し・ラベルと目次項目を置かない。
- サイバネcontentsに従い、`/data/items/cybernetics` でhero、warning、サイバネ破壊の説明、`CyberneticCard`凡例、部位別サイバネ一覧、サイバネ武器一覧を表示する。
- ナノマシンcontentsに従い、`/data/items/nanomachines` でhero、warning、身体強化の説明、`NanomachineCard`凡例、ナノマシン一覧、武器化ナノマシン一覧を表示する。
- ドラッグcontentsに従い、`/data/items/drugs` でhero、warning、`DrugCard`凡例、ドラッグ一覧を表示する。
- 3種別の凡例は既存の`LegendContainer`を用い、対応Cardへcontents指定の静的Propsを渡して右カラムの説明を表示する。
- サイバネ破壊の休息シーンへの内部リンク先は、実装時に現在の見出しIDを確認して決定する。
- 6種別すべてについて、対応するCardの凡例と一覧を実装し、種別ごとのVisual Reviewを行う。designの新規作成・canonicalizeはユーザー指示により行わない。

## 初期スコープ外

- 検索、絞り込み、ソート、ページネーション、比較・計算、詳細ページ遷移
- `WeaponCard` の表示契約の変更、データ変換仕様の変更、新規依存関係の追加
- 新規design画像の作成。既存の共通layoutと `docs/design/items/` の方向性を維持する。

## 完了条件

- [x] `/data/items/weapons` がcontentsの本文・HTMLコメント指示に従う
- [x] 凡例、喧嘩・暗殺・発砲・格闘・干渉の武器一覧が `WeaponCard` で表示される
- [x] ダミーの武器ページが正式実装に置き換わる
- [x] `/data/items/cybernetics` がcontentsの本文・HTMLコメント指示に従う
- [x] `CyberneticCard`の凡例、部位別サイバネ一覧、サイバネ武器一覧が表示される
- [x] `/data/items/nanomachines` がcontentsの本文・HTMLコメント指示に従う
- [x] `NanomachineCard`の凡例、ナノマシン一覧、武器化ナノマシン一覧が表示される
- [x] `/data/items/drugs` がcontentsの本文・HTMLコメント指示に従う
- [x] `DrugCard`の凡例とドラッグ一覧が表示される
- [x] `/data/items/armors` がcontentsの本文・HTMLコメント指示に従う
- [x] `ArmorCard` の凡例と16件の防具一覧が表示される
- [x] `/data/items/omamori` がcontentsの本文・HTMLコメント指示に従う
- [x] warning Callout、神仏の加護への導線、`OmamoriCard`の凡例と21件の一覧が表示される
- [x] 武器・防具・お守りの凡例が共通の3→2カラムレイアウトで表示される
- [x] 既存SkillLegendも`LegendContainer`を使用し、凡例専用CSSを持たない
- [x] SkillLegendに「カードの項目」見出し・ラベル・目次項目がない
- [x] 6種別すべてについて、確定したcontentsに従うページ、対応Cardの凡例と一覧を実装している
- [x] 6種別それぞれのVisual Reviewを行い、design正本の更新は不要と判断している
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## レビュー指摘 1

### 指摘事項

- ナノマシンの発動・持続、非戦闘時ペナルティの参照数値をページ内で明確にする。
- ドラッグのバッドトリップと使用タイミングを、戦闘ルールへ導線する。凡例に「データの見方」見出しを追加する。
- 武器ページから専用アイテムで得られる武器を案内し、お守り・サイバネの本文と表記を修正する。

### 判定

- source: local-agent（`.tmp/review/34-2-items-pages/contents-review-1.md`）およびhuman response（`contents-review-action-items-1.md`）
- classification: valid（指摘1〜7、10、11）
- classification: follow-up（指摘8、9。ユーザー指示により今回は対応しない）
- local validation: `.raw/contents/items-{weapons,omamori,cybernetics,nanomachines,drugs}.md`、現在のMDX実装、戦闘ルールの該当見出しを確認した。新規機能・依存関係・design作成は伴わない。

### 対応方針

- ユーザーの記入方針に従い、ナノマシンの導入文・warning、ドラッグの導入文・凡例、武器の導入文、お守りとサイバネの本文を更新する。
- ドラッグはバッドステータスと戦闘の流れへ、武器はサイバネ武器と武器化ナノマシンへリンクする。
- 表記修正は対応するcontentsと実装を同じtaskで揃える。

### 対応完了チェックリスト

- [x] ナノマシンの発動・持続・非戦闘ペナルティを明記する
- [x] ドラッグの導線と凡例見出しを追加する
- [x] 武器、お守り、サイバネの本文・表記を修正する
- [x] 対応するcontents Markdownを更新する
- [x] 関連するVisual Testを更新する
- [x] `npm run visual:capture -- --grep '@items-(weapons|omamori|cybernetics|nanomachines|drugs)'` が通る
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

| 領域                  | 判定 | 差分                                                                  | 対応     |
| --------------------- | ---- | --------------------------------------------------------------------- | -------- |
| レイアウト            | OK   | desktopはカード1カラム＋説明2カラムを維持し、説明リストを直接表示する | 修正不要 |
| レスポンシブ          | OK   | 390px幅ではカードと説明を2カラムで表示し、横overflowなし              | 修正不要 |
| 共通Componentとの整合 | OK   | アイテム凡例と同じ`LegendContainer`へ統一する                         | 修正不要 |
| 既存デザインとの整合  | OK   | カードと説明リストの表示を維持し、凡例の冗長な見出しを置かない        | 修正不要 |

### 自己修正した項目

- [x] SkillLegendのページ内wrapperと`prose.css`の専用CSSを削除した
- [x] `LegendContainer`へ説明リストの共通スタイルを移した
- [x] 「カードの項目」H3とラベルを削除し、Page TOCに含まれないことを確認した

### 人間判断が必要な差分

- なし

### design-image-generation への引き継ぎ候補

- [x] なし

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

- [x] 実装スクリーンショットをdesign fix modeで正本化した

### 対応完了チェックリスト

- [x] desktop screenshot を取得した
- [x] mobile screenshot を取得した
- [x] reference と actual を比較した
- [x] 明らかな visual mismatch を修正した、または修正不要と判断した
- [x] design正本の更新が必要な場合は、人間判断項目として記録した
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## ビジュアルレビュー 6

### デザイン参照

- design target: `docs/design/items/`。防具個別ページは対象外であり、初期designの新規作成はユーザー指示により行わない。
- reference desktop: 該当なし
- reference mobile: 該当なし
- notes: `.raw/contents/items-armors.md` の凡例右カラムの項目名表示を正本とする。

### 成果物

- actual desktop: `test-results/visual/items-armors-desktop.png`
- actual mobile: `test-results/visual/items-armors-mobile.png`
- report: `npm run visual:capture -- --grep @items-armors`

### レビュー結果

| 領域                  | 判定 | 差分                                                    | 対応     |
| --------------------- | ---- | ------------------------------------------------------- | -------- |
| レイアウト            | OK   | 凡例のカードと右カラムの既存レイアウトを維持する        | 修正不要 |
| 本文                  | OK   | 右カラムの全6項目を「項目名：説明」の太字表記で表示する | 修正不要 |
| レスポンシブ          | OK   | 390px幅で横overflowなし                                 | 修正不要 |
| 既存Componentとの整合 | OK   | `ArmorCard`と`LegendContainer`の契約を変更しない        | 修正不要 |

### 自己修正した項目

- [x] contents指示に合わせ、右カラムの項目名を太字で表示した

### 人間判断が必要な差分

- なし

### design-image-generation への引き継ぎ候補

- [x] なし

### 対応完了チェックリスト

- [x] desktop screenshot を取得した
- [x] mobile screenshot を取得した
- [x] reference と actual を比較した
- [x] 明らかな visual mismatch を修正した、または修正不要と判断した
- [x] design正本の更新は不要と判断した
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## ビジュアルレビュー 7

### デザイン参照

- design target: `docs/design/items/`。各アイテム個別ページは対象外であり、初期designの新規作成はユーザー指示により行わない。
- reference desktop: 該当なし
- reference mobile: 該当なし
- notes: 既存の共通layoutとCard表現を維持し、凡例は`LegendContainer`のdesktop 3カラム・mobile 2カラム構成を使う。

### 成果物

- actual desktop: `test-results/visual/items-cybernetics-desktop.png`、`test-results/visual/items-nanomachines-desktop.png`、`test-results/visual/items-drugs-desktop.png`
- actual mobile: `test-results/visual/items-cybernetics-mobile.png`、`test-results/visual/items-nanomachines-mobile.png`、`test-results/visual/items-drugs-mobile.png`
- report: `npm run visual:capture -- --grep '@items-(cybernetics|nanomachines|drugs)'`

### レビュー結果

| 領域                  | 判定 | 差分                                                                          | 対応     |
| --------------------- | ---- | ----------------------------------------------------------------------------- | -------- |
| レイアウト            | OK   | 3ページともdesktopではカード1カラム＋説明2カラムで表示する                    | 修正不要 |
| レスポンシブ          | OK   | 390px幅では凡例と一覧を2カラムで表示し、横overflowなし                        | 修正不要 |
| 本文・導線            | OK   | Callout、指定本文、サイバネ破壊の休息シーンへの導線をcontentsに従って表示する | 修正不要 |
| 既存Componentとの整合 | OK   | `LegendContainer`と各Cardの既存契約を変更せず、実データIDを個別アンカーに使う | 修正不要 |

### 自己修正した項目

- [x] 3ページの凡例を`LegendContainer`へ統一した
- [x] サイバネ破壊の導線を現在の見出しID `/rules/scenario-play#休息シーン` に合わせた

### 人間判断が必要な差分

- なし

### design-image-generation への引き継ぎ候補

- [x] なし

### 対応完了チェックリスト

- [x] desktop screenshot を取得した
- [x] mobile screenshot を取得した
- [x] reference と actual を比較した
- [x] 明らかな visual mismatch を修正した、または修正不要と判断した
- [x] design正本の更新は不要と判断した
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
- `src/pages/data/items/cybernetics.mdx`（サイバネ実装開始後）
- `tests/visual/items-cybernetics.spec.ts`（サイバネ実装開始後）
- `src/pages/data/items/nanomachines.mdx`（ナノマシン実装開始後）
- `tests/visual/items-nanomachines.spec.ts`（ナノマシン実装開始後）
- `src/pages/data/items/drugs.mdx`（ドラッグ実装開始後）
- `tests/visual/items-drugs.spec.ts`（ドラッグ実装開始後）
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
- サイバネcontentsのwarning、破壊説明、部位別一覧、サイバネ武器一覧がそのまま表示構成へ反映されているか
- ナノマシンcontentsのwarning、身体強化説明、武器化ナノマシン一覧がそのまま表示構成へ反映されているか
- ドラッグcontentsのwarning、凡例、一覧がそのまま表示構成へ反映されているか
- 武器・防具・お守りの凡例が共通レイアウトを使い、desktopと768px以下で指定のカラム構成になるか
- サイバネ破壊の休息シーンへの内部リンクが現在の見出しIDを参照するか
- 6種別の実装後に、種別ごとのVisual Reviewを行い、design正本の更新を不要と判断したことを確認する

## 備考

- design参照: `docs/design/items/` はアイテムトップページの既存designであり、武器個別ページには適用しない。初期designの新規作成はユーザー指示により行わないが、`docs/plan.md` に従い各種別の実装後にVisual Review・design canonicalizeを行う。
- Previewサーバーは、実装開始後の作業中は起動を維持する。作業後には `npm run build` を実行する。
- 武器実装開始前に、contentsの `#ハッシュ` のリンク先、重複した説明番号、`normal.ansatu` と実データキー `ansatsu` の対応、武器種別の凡例表示を確定した。
- 防具contentsは、既存の`ArmorCard`契約（`信用`、`防御力`、`ダメージ軽減`、`装備制限`、`効果`）と整合することを確認した。`armors_hero.webp` も配置済みである。
- お守りcontentsは、既存の`OmamoriCard`契約（`信用`、`効果`）と整合することを確認した。`omamori_hero.webp` と21件の生成済みデータも配置済みである。warning内の神仏の加護リンク先は、`/data/ikizama/burai#skill-ikizama-burai-basic-pv-570c394fe082` とする。
- サイバネ・ナノマシン・ドラッグのcontents指示に従い、3ページを実装した。初期designの新規作成はユーザー指示により行わず、Visual Reviewで既存共通layoutとの整合を確認した。

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

- [x] 実装スクリーンショットをdesign fix modeで正本化した

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

- [x] 実装スクリーンショットをdesign fix modeで正本化した

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

- [x] なし

### 人間判断が必要な差分

- 防具個別ページの初期designは作成しない。実装後のdesign canonicalizeの要否は、6種別の実装完了時に判断する。

### design-image-generation への引き継ぎ候補

- [x] 実装スクリーンショットをdesign fix modeで正本化した

### 対応完了チェックリスト

- [x] desktop screenshot を取得した
- [x] mobile screenshot を取得した
- [x] reference と actual を比較した
- [x] 明らかな visual mismatch を修正した、または修正不要と判断した
- [x] design正本の更新が必要な場合は、人間判断項目として記録した
- [x] `npm run check` が通る
- [x] `npm run build` が通る
