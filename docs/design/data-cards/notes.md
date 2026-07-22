# data-cards

## Mode

- design fix; reviewed implementation images are canonicalized later

## Target

- page / component: `SkillCard`、`WeaponCard`、`ArmorCard`、`OmamoriCard`、`CyberneticCard`、`NanomachineCard`、`DrugCard`を並べるローカルCardカタログ
- route: `/-local/data-cards/`
- viewport:
  - desktop: `1440x1200`、full-page
  - mobile: `390x900`、full-page
- states:
  - desktop: `CardContainer`による3列
  - mobile: `CardContainer`による2列

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
- `data/generated/common-skills.json`
- `data/generated/items.json`

## Design direction

- visual direction: 白いsurface、低彩度border、濃い本文色を使う高密度なルール参照Cardとする。shadow、gradient、強いneon glow、種別ごとの色分けは使わない。
- layout direction: `CardContainer`の直接の子として7種のCardを置き、同じgrid行では高さを揃える。短文時は`5 / 7`を基準とし、長文は切り詰めず下へ伸長する。
- typography direction: 名称と名称下の青緑accent lineを先頭に置く。`最大LV`と`信用`は主要値として青緑で強調し、タイミング・コスト・技能などの補助値はグレーで表示する。detail gridのlabelは値より小さくする。
- color / accent usage: 青緑accentは名称下線、`最大LV`、`信用`に限定する。Card種別や本文に色分けを加えない。

## Card layout inventory

| Card              | Header / meta                            | Detail values                        | Prose body |
| ----------------- | ---------------------------------------- | ------------------------------------ | ---------- |
| `SkillCard`       | 名称、最大LV、タイミング、コスト、技能   | 取得制限、使用制限、対象、射程       | 効果       |
| `WeaponCard`      | 名称、信用、`{種別}武器`、`技能：{判定}` | 攻撃力、ガード値、射程、装弾数       | 効果       |
| `ArmorCard`       | 名称、信用                               | 防御力、ダメージ軽減、全幅の装備制限 | 効果       |
| `OmamoriCard`     | 名称、信用、本文幅の薄グレー分割線       | なし                                 | 効果       |
| `CyberneticCard`  | 名称、信用                               | 部位、埋め込み点数                   | 効果       |
| `NanomachineCard` | 名称、信用                               | 発動精神力、埋め込み点数             | 効果       |
| `DrugCard`        | 名称、信用、`使用タイミング：{値}`       | 1セット数量、BT強度                  | 効果       |

## Existing design constraints

- `global-styles`の白寄り背景、system font、低彩度border、濃い本文色、青緑accentを維持する。
- `CardContainer`はCardを配置するだけとし、個別Cardの項目順、Props、fallbackを担わない。
- 所属、区分、IDはCardに可視表示しない。anchor IDは実装上の属性だけに使う。
- 通常データと凡例用静的Propsを同じCardで表示する。凡例専用Componentは作らない。
- 数値的な表示Propsは`string | number`を受け入れ、`①2`などの文字列は変換せずに表示する。
- `effect`と`ArmorCard.restriction`は`null`、空文字列、`undefined`で空文字列とし、その他の未設定表示値は`-`とする。`SkillCard.summary`は非表示を維持する。

## Catalog sample data

| Card              | Sample           | Selection reason                                     |
| ----------------- | ---------------- | ---------------------------------------------------- |
| `SkillCard`       | 基本の一撃       | `usageRestriction`の`-` fallbackを確認する。         |
| `WeaponCard`      | ビャッコ         | 信用の`-` fallbackと、4つのdetail値を確認する。      |
| `ArmorCard`       | アームドスーツ   | 防御力、ダメージ軽減、装備制限、効果を確認する。     |
| `OmamoriCard`     | 健康のお守り     | 信用と複数条件を含む効果を確認する。                 |
| `CyberneticCard`  | ペインシャッター | 信用、部位、埋め込み点数と長い効果を確認する。       |
| `NanomachineCard` | ドクロ           | 信用、発動精神力、埋め込み点数を確認する。           |
| `DrugCard`        | アドレナリン     | 信用、タイミング、セット数、BT強度と効果を確認する。 |

## Out of scope

- 公開するアイテム一覧・種別別ページ、MDX本文、Cardの詳細遷移
- 検索、フィルタ、ソート、ページネーション、比較・計算、選択支援
- Excel、生成JSON、schema、データ取得層の変更
- Header、Footer、SiteMenu、PageToc、`public/images/data/items/`の個別画像
- Cardごとの影、グラデーション、発光、新しいUI library、クライアント側状態管理

## Comparison points for implementation

- 7種のCardが一つのカタログで比較でき、Card固有の項目差が読み分けられる。
- 名称、主要値、補助値、detail値、効果本文の視線順が共通する。
- desktop 3列、mobile 2列で横overflowせず、同じgrid行のCard高が揃う。
- 短文Cardは過度に縦長にならず、長文だけが自然に伸長する。
- `null`由来の`-`と空の効果領域を区別して確認できる。

## Generation source

- previous design targets: `skill-card`と`item-card`のnotesを統合した。
- canonical design images: 未作成。既存画像は削除し、レビュー済みの`/-local/data-cards/`を後続作業でcanonicalizeする。
- expected canonicalization command: `npm run visual:canonicalize -- data-cards --route /-local/data-cards/`
- viewport: desktop `1440x1200`、mobile `390x900`

## Open questions

- 正本画像のcanonicalizeは、現行実装の人間レビュー後に実施する。
