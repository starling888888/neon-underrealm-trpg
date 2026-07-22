# データ表示要件

データカード、スキルカード、アイテムカード、凡例、個別アンカーを扱う。

## 9. データ表示要件

### FR-04. データカード表示

スキル、アイテム、凡例などの構造化データはカードUIで表示できること。

カードに表示するデータはMarkdown / MDX本文に直書きせず、Excelから変換されたJSONを参照すること。

`/world`のNPC紹介用`NpcCard`は世界観本文の構成要素として扱うが、NPCデータはExcelから変換した生成JSONを参照する。画像パスはExcelと生成JSONへ保持せず、表示層が`id`を対応キーとして個別`.webp`または`no_image.webp`を解決する。

実在データではない説明用のスキル凡例・アイテム凡例は、既存のCard ComponentへMDX内の静的propsを渡して表示してよい。凡例のためにExcel、生成JSON、schema、取得層を追加・変更しない。

Markdown / MDX / Astroページでは、簡潔なComponent呼び出しでデータ表示を行えること。

例は以下。

```mdx
<SkillCard skill={legendSkillExample} variant="legend" />
<CardContainer>
  {commonSkills.map((skill) => <SkillCard {...skill} />)}
</CardContainer>
<WeaponCard item={legendWeaponExample} variant="legend" />
```

上記のprops名や実装詳細は初期案であり、最終的なComponent APIは実装時に調整してよい。

ただし、以下の方針を守る。

- `SkillLegend` という独立Componentは作らない
- スキル凡例は `SkillCard` に凡例用データを渡して表示する
- `ItemLegend` という独立Componentは作らない
- アイテム凡例は、各Item系Cardに凡例用データを渡して表示する
- 汎用 `ItemCard` に全アイテム種別を無理に統合しない
- アイテム種別ごとに固有のCard Componentを用意する

### FR-04-01. スキルカード

スキルカードには最低限以下を表示できること。

- 名称
- 最大レベル
- タイミング
- コスト
- 技能
- 取得制限と使用制限
- 対象
- 射程
- 効果本文。`summary`は全スキル分の内容が完成するまでカードに表示しない

`SkillCard` は、通常のスキル表示だけでなく、凡例用データを渡してスキル凡例として表示できること。

`SkillCard`を含むCard Componentの表示用Propsでは、数値として表示する値に`string | number`を受け付けてよい。これはMDXの凡例で`①2`のような表示用文字列を渡すためであり、生成JSONとschemaの数値型は変更しない。

`CardContainer` はslotで受け取ったカードを一覧配置する。データ配列を `SkillCard` へ渡す処理は、各ページまたはテンプレートが担当する。

`CardContainer` は、各Cardの表示仕様を重複実装しない。

共通スキル一覧では、`bonus`、`basic`、`advanced` のカテゴリを上から順に表示する。各カテゴリ内では、変換済みJSONの配列順をそのまま表示し、Componentやページ側で独自に並び替えない。

所属、区分、IDはカード内に表示しない。所属と区分は表示ページおよびそのページ内のセクションで識別し、IDはデータ識別および個別アンカーに用いる。

情報量を抑えるため、項目名を常に表示しない。名称、数値、記号など、一見して意味を識別できる情報にはラベルを付けず、意味が明確でない情報に限ってラベルを用いる。

カードは縦長で、Component designで定める最低高さを持つ。本文量に応じて高さを可変とし、長文でも過度に縦長にならないよう、効果本文は通常のページ本文より十分に小さい文字で表示する。`summary`はデータとして保持するが、全スキル分の内容が完成するまでカードに表示しない。

`CardContainer` によるカード一覧は、スマホ幅では2列、デスクトップ幅ではカードの最低幅を保った3列または4列で表示する。内部レイアウトの実装方式は固定しない。

技能、コスト、取得制限、使用制限、射程の値が `null` または空欄の場合は、カード上では `-` を表示する。

効果本文の値が `null` または空欄の場合は、カード上では空文字列を表示する。`summary`は全スキル分の内容が完成するまで表示しない。

### FR-04-02. アイテムカード

アイテムカードには、アイテム種別ごとに必要な項目を表示できること。

武器、防具、お守り、サイバネ、ナノマシン、ドラッグは、それぞれ項目が異なるため、同一カード部品で無理に統一しすぎない。

初期実装では、以下のようにアイテム種別ごとのComponentを用意する。

- `WeaponCard`
- `ArmorCard`
- `OmamoriCard`
- `CyberneticCard`
- `NanomachineCard`
- `DrugCard`

各Item系Cardは、通常のアイテム表示だけでなく、凡例用データを渡して凡例として表示できること。

各Item系Cardの表示用Propsでは、数値として表示する値に`string | number`を受け付けてよい。これはMDXの凡例で`①2`のような表示用文字列を渡すためであり、生成JSONとschemaの数値型は変更しない。

名称は必須とする。`effect`と`ArmorCard`の`restriction`は、`null`、空文字列、`undefined`なら空文字列を表示する。その他の表示値は、`null`、空文字列、`undefined`なら`-`を表示する。

各Item系Cardは、実在データの`id`を個別アンカーとして渡せること。

各アイテムページまたはテンプレートは、受け取ったアイテムデータ配列を対応するItem系Cardへ渡し、`CardContainer`のslot内へ配置する。`CardContainer` は、対応するItem系Cardと表示仕様を重複実装しない。

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
/data/ryugi/teppoudama#skill-ryugi-teppoudama-basic-a-{nameHash}
/data/items/cybernetics#item-cybernetics-arm-{nameHash}
```

GitHub Pages等のサブパス配下でも、個別アンカーへの遷移が壊れないこと。

---
