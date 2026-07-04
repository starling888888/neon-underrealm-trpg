# デザイン正本

このディレクトリは、Visual Reviewで参照するデザイン正本を置く場所です。

デザイン正本はissue単位ではなく、画面、レイアウト、Component単位で管理します。

UI、CSS、layout、page、Componentを実装するタスクでは、実装開始前に対象のdesign画像を生成し、このディレクトリ配下の該当design targetに配置します。

UI実装のissueファイルには、参照するdesign targetと主要なdesign画像を記載します。design画像が未生成の場合は、実装より先にdesign生成を行います。

例:

```txt
docs/design/
  site-layout/
    desktop.png
    mobile.png
    notes.md
  home/
    desktop.png
    mobile.png
    notes.md
  components/
    header.png
    footer.png
    skill-card.png
```

同じデザイン正本は、複数のissueから参照して構いません。

Visual Reviewで取得した実装スクリーンショットやレポートは、Playwrightの `test-results/` や `playwright-report/` に出力し、Git管理しません。
