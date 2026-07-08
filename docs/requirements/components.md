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

`Callout` は特定ページ専用ではなく、後続ページでも再利用できる共通Componentとして扱う。

---
