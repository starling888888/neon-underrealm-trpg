# デザイン正本

このディレクトリは、画面、レイアウト、Componentごとのデザイン意図とVRT参照情報を置く場所です。

デザイン正本はissue単位ではなく、画面、レイアウト、Component単位で管理します。

UI、CSS、layout、page、Componentを実装するタスクでは、実装開始前に対象のdesign intentとVRT対象をこのディレクトリ配下の該当design targetへ記録する。

比較画像の正本はPlaywright標準の `toHaveScreenshot()` snapshotで管理する。`docs/design/<design-target>/` には `notes.md` だけを置き、route、状態、viewport、VRT test名、snapshot名、差分判断の根拠を記録する。

例:

```txt
docs/design/
  site-layout/
    notes.md
  home/
    notes.md
  header-footer/
    notes.md
```

同じデザイン正本は、複数のissueから参照して構いません。

通常のVRT実行はsnapshotを比較するだけで更新しない。baselineの初回作成・更新は、差分を確認したうえでユーザーが明示指示した場合だけ `--update-snapshots` を付けて実行する。Visual Reviewのactual artifactは `test-results/` や `playwright-report/` に出力し、Git管理しない。
