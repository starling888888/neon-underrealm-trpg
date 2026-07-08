# データ表示要件

データカード、スキルカード、アイテムカード、凡例、個別アンカーを扱う。

## 9. データ表示要件

### FR-04. データカード表示

スキル、アイテム、凡例などの構造化データはカードUIで表示できること。

カードに表示するデータはMarkdown / MDX本文に直書きせず、Excelから変換されたJSONを参照すること。

Markdown / MDX / Astroページでは、簡潔なComponent呼び出しでデータ表示を行えること。

例は以下。

```mdx
<SkillCard skill={legendSkillExample} variant="legend" />
<SkillList skills={commonSkills} />
<WeaponList items={weapons} />
<WeaponCard item={legendWeaponExample} variant="legend" />
```

上記のprops名や実装詳細は初期案であり、最終的なComponent APIは実装時に調整してよい。

ただし、以下の方針を守る。

* `SkillLegend` という独立Componentは作らない
* スキル凡例は `SkillCard` に凡例用データを渡して表示する
* `ItemLegend` という独立Componentは作らない
* アイテム凡例は、各Item系Cardに凡例用データを渡して表示する
* 汎用 `ItemCard` に全アイテム種別を無理に統合しない
* アイテム種別ごとに固有のCard / List Componentを用意する

### FR-04-01. スキルカード

スキルカードには最低限以下を表示できること。

* 名称
* 最大レベル
* タイミング
* コスト
* 技能
* 制限
* 効果
* カテゴリ
* 所属流儀または所属生き様

`SkillCard` は、通常のスキル表示だけでなく、凡例用データを渡してスキル凡例として表示できること。

`SkillList` は、受け取ったスキルデータ配列を `SkillCard` へ渡して一覧表示する。

`SkillList` は、`SkillCard` と表示仕様を重複実装しない。

### FR-04-02. アイテムカード

アイテムカードには、アイテム種別ごとに必要な項目を表示できること。

武器、防具、お守り、サイバネ、ナノマシン、ドラッグは、それぞれ項目が異なるため、同一カード部品で無理に統一しすぎない。

初期実装では、以下のようにアイテム種別ごとのComponentを用意する。

* `WeaponCard`
* `WeaponList`
* `ArmorCard`
* `ArmorList`
* `OmamoriCard`
* `OmamoriList`
* `CyberneticCard`
* `CyberneticList`
* `NanomachineCard`
* `NanomachineList`
* `DrugCard`
* `DrugList`

各Item系Cardは、通常のアイテム表示だけでなく、凡例用データを渡して凡例として表示できること。

各Item系Listは、受け取ったアイテムデータ配列を対応するItem系Cardへ渡して一覧表示する。

各Item系Listは、対応するItem系Cardと表示仕様を重複実装しない。

### FR-04-03. 凡例カード

スキル凡例、アイテム凡例はカードまたは折りたたみUIで表示できること。

ただし、凡例専用Componentを別途作成するのではなく、通常表示で使うCard Componentへ凡例用データを渡して表示する。

スキル凡例は `SkillCard` を利用する。

武器凡例は `WeaponCard` を利用する。

防具凡例は `ArmorCard` を利用する。

お守り凡例は `OmamoriCard` を利用する。

サイバネ凡例は `CyberneticCard` を利用する。

ナノマシン凡例は `NanomachineCard` を利用する。

ドラッグ凡例は `DrugCard` を利用する。

### FR-04-04. データカードの個別アンカー

スキルカード、アイテムカードには個別IDを付与する。

個別IDはHTML上のアンカーとして利用できること。

検索結果、本文内リンク、外部共有リンクから、特定のスキルカードまたはアイテムカードへ直接ジャンプできること。

例は以下。

```text
/data/ryugi/teppoudama#skill-r-teppoudama-basic-a-001
/data/items/cybernetics#item-cybernetics-arm-001
```

GitHub Pages等のサブパス配下でも、個別アンカーへの遷移が壊れないこと。

---
