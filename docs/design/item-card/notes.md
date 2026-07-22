# item-card

## Mode

- initial draft

## Target

- page / component: `SkillCard`と、`WeaponCard`、`ArmorCard`、`OmamoriCard`、`CyberneticCard`、`NanomachineCard`、`DrugCard`を一枚に並べるCardカタログ
- route: なし。実装routeを使わないstandalone prototype
- viewport:
  - desktop: `1440x1200`、full-page
  - mobile: `390x900`、full-page
- states:
  - desktop: 7種類のCardを4列、次行3列で表示するdefault catalog
  - mobile: 同じ7種類のCardを2列で表示するdefault catalog

## Referenced SSoT

- `AGENTS.md`
- `.agents/skills/design-image-generation/SKILL.md`
- `docs/issue/34-1-item-card-components.md`
- `docs/requirements/data-display.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- `docs/design/global-styles/notes.md`
- `docs/design/site-layout/notes.md`
- `docs/design/skill-card/notes.md`
- `data/generated/common-skills.json`
- `data/generated/items.json`

## Design direction

- visual direction: `SkillCard`に近い、白いsurface、低彩度border、余白、濃い本文色による高密度なルール参照Cardとする。shadow、gradient、強いneon glow、種別ごとの色分けは使わない。
- layout direction: standalone prototypeの見出し直下に、`SkillCard`と6種のItem Cardを一つのカタログとして並べる。desktopのcatalogは4列、mobileは2列とし、実装時の各Card横幅は`CardContainer`のgridを継承する。Cardは短文時に`aspect-ratio: 5 / 7`を基準とし、内容が基準高さを超える場合は切り詰めず下方向へ伸長する。
- typography direction: 名称をCard最上部に置き、名称下の短い青緑accent lineで区切る。短い値は名称直下のmeta行または小さなgridでまとめ、意味が曖昧な値だけに短いラベルを付ける。mobileのdetail labelは、`バッドトリップ`などが折り返さない小ささに調整する。効果・詳細文章は下部に小さめの文字で置き、罫線で過度に分断しない。
- color / accent usage: 青緑accentは名称下線と`最大LV`など主要な短い値の控えめな強調に限定する。値のgrid、効果本文、Card種別には低彩度borderと本文色を使う。

## Existing design constraints

- `global-styles`の白寄り背景、system font、低彩度border、濃い本文色、青緑accentを維持する。
- `skill-card`の名称、名称下線、最大LV、meta、詳細grid、効果本文という視線の流れを維持する。ただし現在の既定最低高さは採用せず、`5 / 7`の基準比率へ更新する。
- Cardの種類、所属、区分、IDを可視表示しない。anchor IDは実装上の属性だけに使う。
- `CardContainer`はCardを配置するだけとし、個別Cardの項目順、Props、fallbackを担わない。
- catalog上の`SkillCard`などのcomponent captionは、7種を比較するためにCard外へ置くprototype専用の注記であり、実装Card内には表示しない。
- 通常データと凡例用静的Propsを同じCardで表示する。凡例専用Componentは作らない。
- 数値的な表示Propsは`string | number`を受け入れる。`①2`などの文字列は数値へ変換せず、そのまま表示する。
- `effect`と`ArmorCard.restriction`は`null`、空文字列、`undefined`なら空文字列とする。その他の未設定表示値は`-`とする。`SkillCard.summary`は非表示を維持する。

## Catalog sample data

prototypeではダミー値を作らず、以下の生成JSONにある実データをそのまま使う。各種別で、表示対象項目がもっとも多く埋まる候補を優先した。

| Card              | JSON path / ID                                                                              | Sample           | Selection reason                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------- | ---------------- | -------------------------------------------------------------------------------- |
| `SkillCard`       | `common-skills.data.bonus[0]` / `skill-common-bonus-a-82c112996f93`                         | 基本の一撃       | 9表示項目中8項目が埋まる。`usageRestriction: null`は`-` fallbackも確認できる。   |
| `WeaponCard`      | `items.data.weapons.nanomachines.happou[]` / `item-weapon-nanomachines-happou-46e456057dc4` | ビャッコ         | credit以外の短い値と効果本文が埋まり、`credit: null`の`-` fallbackも確認できる。 |
| `ArmorCard`       | `items.data.armors[]` / `item-armor-eee631848e90`                                           | アームドスーツ   | credit、防御力、ダメージ軽減、制限、効果の全表示項目が埋まる。                   |
| `OmamoriCard`     | `items.data.omamori[]`                                                                      | 健康のお守り     | creditと、複数条件を含む効果本文を確認できる。                                   |
| `CyberneticCard`  | `items.data.cybernetics.any[]`                                                              | ペインシャッター | credit、部位、埋め込み点数と長い効果本文を確認できる。                           |
| `NanomachineCard` | `items.data.nanomachines[]`                                                                 | ドクロ           | credit、埋め込み点数、発動精神力と複数効果を確認できる。                         |
| `DrugCard`        | `items.data.drugs[]`                                                                        | アドレナリン     | credit、タイミング、セット数、バッドトリップ強度と効果本文を確認できる。         |

notes作成時点では、実データの選択とフィールド充足度だけを決め、生成JSONを更新しない。

## Item layout inventory

| Card              | Header / meta                            | Detail values                   | Prose body |
| ----------------- | ---------------------------------------- | ------------------------------- | ---------- |
| `SkillCard`       | 名称、最大LV、タイミング、コスト、技能   | 取得制限、使用制限、対象、射程  | 効果       |
| `WeaponCard`      | 名称、信用、`{種別}武器`、`技能：{判定}` | 攻撃力、ガード値、装弾数、射程  | 効果       |
| `ArmorCard`       | 名称、信用                               | 防御力、ダメージ軽減            | 制限、効果 |
| `OmamoriCard`     | 名称、信用、本文幅の薄グレー分割線       | なし                            | 効果       |
| `CyberneticCard`  | 名称、信用                               | 部位、埋め込み点数              | 効果       |
| `NanomachineCard` | 名称、信用                               | 発動精神力、埋め込み点数        | 効果       |
| `DrugCard`        | 名称、信用、`使用タイミング：{値}`       | 1セット数量、バッドトリップ強度 | 効果       |

## Out of scope

- Item一覧・種別別ページ、MDX本文、実装route、Cardの詳細遷移。
- 検索、フィルタ、ソート、ページネーション、比較・計算、選択支援。
- `SkillLegend`、`ItemLegend`などの凡例専用Component、および単一の汎用`ItemCard`。
- Excel、`.raw/`、変換スクリプト、生成JSON、schema、データ取得層の変更。
- Header、Footer、SiteMenu、PageToc、パンくず、検索UI、`public/images/data/items/`の個別画像。
- Cardごとの影、グラデーション、発光、派手な色分け、クライアント側状態管理、新規UI library。

## Comparison points for implementation

- 7種のCardが一つのカタログで比較でき、Cardごとの項目差が視覚的に読み分けられる。
- 名称、meta、詳細値、効果・詳細文章の順序と密度が`SkillCard`の既存方向性と整合する。
- desktopで4列、mobileで2列に収まり、ページ全体の横overflowを起こさない。実装の`CardContainer`では利用可能幅に応じて3列または4列になっても、Card自身の横幅指定を増やさない。
- 短文時のCardは`5 / 7`を基準にし、長文のCardだけが下に伸長する。本文を固定高、ellipsis、clampで切り詰めない。
- 生成JSONの実データで、数値、短い分類、長い効果、`null`由来の`-`、`null`由来の空の効果領域を確認できる。
- 許容差分: Card内の改行位置、カタログ最終行の空き、実データの更新に伴う効果本文の高さ。
- 要レビュー差分: すべてのCardを同じフィールド構成にする、Card種別の色分け、mobileを1列にする、効果を切り詰める、`5 / 7`より明らかに縦長の短文Cardへ戻す。

## Generation source

- prototype or generator source: standalone HTML/CSS prototype
- source branch / commit: `34-1-item-card-components` / `3511a95`
- route: なし。application routeを使わない。
- viewport: desktop `1440x1200`、mobile `390x900`、いずれもfull-page
- prototype path: `.tmp/design/item-card/prototype.html`
- capture path: `.tmp/design/item-card/capture.mjs`
- capture notes: `data/generated/common-skills.json`と`data/generated/items.json`から固定した実データをprototypeへ読み込み、desktopとmobileをfull-page captureした。`design-desktop.png`は4列 + 3列、`design-mobile.png`は2列のcatalogである。prototypeとcapture scriptは一時ファイルであり、design正本としてcommitしない。

## Open questions

- `ArmorCard.restriction`を、効果と同じ本文ブロックへ置くか、数値gridの直後に短い詳細行として置くか。いずれも`null`時は空文字列とする。
- desktop catalogを4列にする構成は、実装時の利用可能幅に応じた`CardContainer`の3列表示を置き換えない。prototypeでは7種類を一画面で比較しやすくするためだけに4列を使う。
- 既存`docs/design/skill-card/`のnotesと画像は、item-card initial draftの人間レビュー・承認後に、共通表現と`5 / 7`基準比率へ更新する。
