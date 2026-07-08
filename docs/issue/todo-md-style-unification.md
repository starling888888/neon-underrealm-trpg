# todo-md-style-unification

## 目的

既存Markdownドキュメントの記法・構成styleを、Google Markdown Style Guideを基準に統一し、今後のドキュメント保守時に差分が読みやすい状態へ近づける。

## 背景

`docs/TODO.md` に、既存Markdownドキュメントのstyle統一がfollow-upとして記録されている。

- `docs/TODO.md` の「既存MarkdownドキュメントのstyleをGoogle Markdown Style Guideに沿って統一する」
- Google Markdown Style Guide: <https://developers.google.com/style/markdown>
- Google developer documentation style guide: <https://developers.google.com/style>

このTODOは `docs/plan.md` に関連planがないため、ユーザーの明示指示によりplan作成なしで独立タスクとして扱う。

通常の開発タスクは専用branchで行うが、このタスクはPRを作成しない運用判断により、ユーザーの明示許可のもと `main` branch上で作業し、必要に応じて `main` に直接commitする。

## 対象範囲

原則として、既存のMarkdownドキュメントのみを対象にする。

- `AGENTS.md`
- `README.md`
- `docs/*.md`
- `docs/requirements/*.md`
- `docs/design/**/*.md`
- `data/generated/README.md`
- `tests/visual/README.md`

主な統一観点:

- 見出し階層と見出し前後の空行
- 箇条書き、番号付きリスト、ネストの揃え方
- インラインコード、ファイルパス、コマンド表記
- 表の記法と読みやすさ
- fenced code blockのinfo string
- リンク表記
- 余分な空白、連続空行、末尾空白
- 同一ドキュメント内の表記ゆれ

## 初期スコープ外

- `docs/plan.md` への新規plan追加
- `docs/plan.md` のチェックボックス更新
- Markdown以外の `.mdx`、Astro、TypeScript、CSS、JSON、画像の変更
- 文書内容の要件変更、仕様変更、スコープ変更
- 日本語本文の全面リライト
- Google Style Guideにない独自lintツールの新規導入
- npm packageの追加
- UI、CSS、layout、page、Componentの変更
- design画像の作成・更新
- GitHub PR作成

## 完了条件

- [x] 対象Markdownファイルのstyle統一差分が、内容変更ではなく表記・構造整理に留まっている
- [x] Google Markdown Style Guideを基準に、適用した主な統一観点が作業報告に記録されている
- [x] `docs/TODO.md` の該当TODOについて、対応結果または未対応理由が記録されている
- [x] Markdownのみ変更した場合、`npm run check` / `npm run build` を省略した理由が作業報告に記録されている
- [x] Markdown以外を変更した場合、必要に応じて `npm run check` と `npm run build` が通る

## チェックポイント

- [x] 既存ルートが壊れていない
- [x] GitHub Pagesのサブパス公開に影響しない
- [x] 不要な依存関係を追加していない
- [x] 初期スコープ外の機能を実装していない
- [x] 関連する `docs/TODO.md` 項目と矛盾していない
- [x] 関連する `docs/design/` と矛盾していない
- [x] ユーザーの未コミット変更を破壊していない

## 想定変更ファイル

- `AGENTS.md`
- `README.md`
- `docs/*.md`
- `docs/requirements/*.md`
- `docs/design/**/*.md`
- `data/generated/README.md`
- `tests/visual/README.md`

実作業時に、差分量が大きすぎるファイルや本文内容の判断が必要なファイルが見つかった場合は、このissue内で無理に変更せず、作業報告で未対応理由を記録する。

## レビュー観点

- `main` branch上で直接作業・commitする例外運用で問題ないか
- plan作成なしの独立TODO回収として扱って問題ないか
- 対象ファイル範囲が広すぎないか
- style統一が本文内容の変更に踏み込んでいないか
- Google Markdown Style Guideの適用範囲が、この日本語ドキュメント群に対して過剰になっていないか
- `docs/TODO.md` の該当TODOを、このissueで完了扱いにしてよいか

## 備考

このissueは、ユーザーの明示指示により `main` branch上で作成している。

実装開始は、ユーザーの「TODO完了までやっていい。では開始。」により承認済みである。

Git commitは、ユーザーのmain直接commit許可に従って実行する。push / PR作成は行わない。

## 実施内容

- Google Markdown Style Guideを基準に、既存Markdownドキュメントのunordered list markerを `-` へ統一した。
- 既存のfenced code blockは、確認時点で必要なinfo stringがすでに付いていたため追加変更しなかった。
- 本文内容、要件、planチェック状態、Markdown以外のファイルは変更していない。
- `docs/TODO.md` の該当TODOを `docs/TODO-done.md` へ退避した。
