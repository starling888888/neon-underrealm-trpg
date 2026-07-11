# Component要件

コールアウトComponentなど、本文内Componentの要件を扱う。

## 15. コールアウト要件

### FR-10. コールアウトComponent

Markdown / MDX本文内で、注意書き、補足、例、警告、変更点などを表示するコールアウトComponentを使用できること。

想定するコールアウト種別は以下。

- `note`: 補足
- `tip`: 運用のコツ
- `warning`: 注意
- `danger`: 重大注意
- `example`: 例
- `version`: 変更点・V1.5注記

本文側では、簡潔な記法で利用できること。

例は以下。

```mdx
<Callout type="warning" title="注意">
この処理はコンボ中に一度だけ行えます。
</Callout>
```

コールアウトは色だけに依存せず、見出し・アイコン・ラベルなどでも種別が分かるようにする。

`title` は既定ではラベルとして出力し、ページ内目次へ混入させない。ページの見出し構造に含める必要がある場合だけ、`titleHeadingLevel` に `2` から `6` を明示指定して、titleを対応する見出し要素として出力できること。既存PageToc / MobilePageTocの対象はH2とH3だけであり、H4〜H6の指定は見出し構造・支援技術の見出しナビゲーションにだけ反映される。見出し化は既定にせず、指定しない既存CalloutのHTML構造を変えない。

`Callout` は特定ページ専用ではなく、後続ページでも再利用できる共通Componentとして扱う。

---

## 16. NPCカード要件

### FR-11. NPCカード

`/world` のNPC紹介は `NpcCard` Componentで表示できること。

`NpcCard` は最低限、共通のシンプルな人物アイコン、二つ名、名前、説明を表示する。二つ名がある場合は、二つ名を `<ruby>` / `<rt>` で表し、名前と異なる控えめな青緑寄りの文字色で名前の直前に続けて表示する。二つ名がない場合は、名前から表示する。

`21-2-world-page` では、各NPCをMDX内の静的propsで埋め込む。個別画像、Excel、JSONを使ったデータ管理への移行は `42-0-npc-data-normalization` で扱う。

---
