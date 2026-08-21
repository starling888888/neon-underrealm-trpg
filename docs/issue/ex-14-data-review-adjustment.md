# ex-14-data-review-adjustment

## 目的

ユーザーが調整するゲームデータを外部のChatGPTレビューへ渡せる状態にし、ユーザーの明示指示に従って必要なnpmコマンドだけを実行する。

## 背景

データ内容の評価と修正判断はユーザーおよび外部ChatGPTが担当する。このtaskでは、agentがデータ内容を自律的に評価、修正、レビューしない。

- `docs/requirements.md`と`docs/out-of-scope.md`に矛盾しない。
- `docs/TODO.md`およびmilestone planに、このtaskと直接対応する項目はない。

## 対象範囲

- ユーザーが直接変更するデータ、およびその変更に対してユーザーが明示指定するnpmコマンドの実行と結果報告。
- ユーザーが外部ChatGPTから受け取った評価・修正指示に基づく、明示指定されたコマンドの実行。
- ユーザーが明示的に指示した場合だけ、対象差分のcommit・push・PR作成を行う。

## 初期スコープ外

- agentによるデータ内容の自律レビュー、修正提案、修正。
- issue reviewer、document reviewer、technical reviewerなどのreview agent実行。
- ユーザー指示のないnpmコマンド、変換、format、test、buildの実行。
- 新しい依存関係、アプリケーション機能、UI、データ変換仕様の追加。
- `docs/out-of-scope.md`に定めるDB、認証、SSR、CMS、汎用ルールエンジンの追加。

## 完了条件

- [x] ユーザーが指定したデータ調整とコマンド実行を完了している。
- [x] 実行したコマンドと結果をユーザーへ報告している。
- [x] agentによる自律レビューまたは未指示の変更を行っていない。
- [x] ユーザーがcommit・push・PRを明示指示した場合だけ、その対象差分を処理している。

## チェックポイント

- [x] ユーザーの未コミット変更を破壊していない。
- [x] 不要な依存関係を追加していない。
- [x] 初期スコープ外の機能を実装していない。
- [x] 関連TODOがないことを確認している。

## 想定変更ファイル

- ユーザーが指定するデータファイル
- ユーザーが明示的に指定する生成物または関連ドキュメント

## レビュー観点

- データ内容の評価はユーザーおよび外部ChatGPTに限定されているか。
- agentの作業が、ユーザーの明示指示に基づくコマンド実行と結果報告だけに留まっているか。

## 備考

- branchは`ex-14-data-review-adjustment`。
- issue reviewはユーザー指示により実行しない。
- issue内容の承認後も、agentは各npmコマンドをユーザーの個別指示を受けてから実行する。
- 実行済み: `npm run sync:google-sheets`（10 spreadsheets）、`npm run convert:data`、`npm run format`、`npm run build`。
