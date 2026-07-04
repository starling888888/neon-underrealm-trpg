# デザイン正本

このディレクトリは、Visual Reviewで参照するデザイン正本を置く場所です。

デザイン正本はissue単位ではなく、画面、レイアウト、Component単位で管理します。

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
