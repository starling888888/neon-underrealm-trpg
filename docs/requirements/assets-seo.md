# 画像・SEO要件

画像埋め込み、OGP、SEOメタ情報を扱う。

## 12. 画像要件

### FR-07. 画像埋め込み

現時点では主にタイトルロゴを想定するが、将来的に各ページへ画像を埋め込める構成にする。

Markdown / MDX ページ内で画像を表示できること。

画像の想定用途は以下。

- タイトルロゴ
- キービジュアル
- ワールドガイド用イラスト
- NPCイラスト
- ルール説明用図解
- 戦闘例の図
- アイテムやスキルの補助画像

画像ファイルは静的アセットとして管理する。

初期配置案は以下とする。

```text
public/assets/images/
```

画像、CSS、JS、内部リンクは、GitHub Pages等のサブパス公開でも壊れないようにbase pathを考慮して参照すること。

Markdown標準の画像記法、または画像表示用Componentから画像を埋め込めること。

必要に応じて、以下のような画像Componentを利用できること。

```mdx
<ImageBlock src="world/osaka-night.jpg" alt="雨のオオサカ副都" caption="オオサカ副都の夜" />
```

画像には `alt` 属性を設定できること。

必要に応じてキャプションを表示できること。

装飾目的の画像の場合は空 `alt` を許容する。

画像には可能な範囲で lazy loading を適用する。

高度な画像最適化、レスポンシブ画像生成、CDN連携は初期必須要件ではない。

---

## 14. OGP / SEO要件

### FR-09. OGP / SEOメタ情報

各ページに `title` と `description` を設定できること。

`defaultSeo.title` は、トップページ `/` のブラウザタイトル、共通のサイト名、未指定時のtitle fallbackとして扱う。

SEO ComponentまたはLayoutへページ固有の `title` が渡された場合、ブラウザタブや `<title>` に表示する文字列は以下の形式にする。

```txt
<defaultSeo.title> | <page title>
```

例:

```txt
ネオン・アンダーレルムTRPG | 更新履歴
```

ページ固有の `title` が渡されなかった場合は、`defaultSeo.title` をそのまま使う。

トップページ `/` は `defaultSeo.title` をそのまま使うため、`src/pages/index.astro` からLayoutへ `title` を渡さない。

`og:site_name` は `defaultSeo.siteName` を使用する。`defaultSeo.siteName` は原則として `defaultSeo.title` と同じサイト名を使う。

SNS共有時に表示されるOGPメタ情報を設定できること。

最低限、以下を設定する。

- `og:title`
- `og:description`
- `og:type`
- `og:url`
- `og:image`

トップページには、サイト全体のOGP画像を設定する。

各ページごとに個別OGP情報を設定できる構成が望ましい。

初期実装では、個別OGP画像がないページは共通OGP画像を使用してよい。

GitHub Pages等のサブパス公開でも、OGP画像URLが壊れないこと。

個別OGP画像生成は初期必須要件ではない。

---
