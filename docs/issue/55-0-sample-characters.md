# 55-0-sample-characters

## 目的

キャラクターメイキングページから、10件のサンプルキャラクターJSONをダウンロードしてキャラクターシートへインポートできるようにする。

## 背景

`docs/plan.md` の `55-initial-release` に対する、ユーザー指定の `55-0` 作業である。`public/sample-charcter/` に未コミットで置かれたJSONを、キャラクターメイキングのサンプルキャラクターとして公開する。

対象ページの既存design targetは `docs/design/character-making/notes.md` である。ユーザー指定の順序なしリストとリンク構成を表示契約とし、既存の本文カラム、prose、PageToc、GitHub Pagesのsubpath対応を維持する。VRT baselineはユーザーの明示指示なしに更新しない。

## 対象範囲

- `public/sample-charcter/sample-character_01_kenkaya_sumi.json` から `sample-character_10_kashira_kejime.json` を、番号順に静的JSONダウンロードとして公開する。
- `src/pages/character-making.mdx` の「サンプルキャラクター」節を、次の内容へ置き換える。
  - 「以下のファイルをダウンロードして、キャラクターシートにインポートして利用してください。」と表示する。
- 「キャラクターシート」を `target="_blank"` と `rel="noopener noreferrer"` を持つ `/character-sheet` へのリンクにする。
- 番号 `01` から `10` の順の順序なしリストにする。
- 各キャラクター名だけを対応JSONのダウンロードリンクにする。リンク直後に、リンクではないテキストとして `プライマリ流儀名×生き様名` を記載する。
- JSONとキャラクターシートURLは `withBase` を通し、JSONリンクにはdownload属性を付ける。
- 表示する流儀名・生き様名は各JSONの `build.primaryRyugiId` と `build.ikizamaId` から解決する。
- サンプルキャラクターのPC名・設定文を、`public/sample-charcter/*.json` の `profile.pcName` と `profile.setting` から `contents-review` のbeginner / expert reviewerにレビューさせる。成果物は `.tmp/review/55-0-sample-characters/` に残す。

## 初期スコープ外

- ユーザーがcontents reviewの指摘対応を明示承認するまで、サンプルJSONの内容、キャラクター名、設定文、流儀、生き様を変更しない。
- キャラクターシートのimport仕様を変更しない。
- キャラクター作成ウィザード、キャラクターシート機能、JSON変換処理、サーバーAPI、DB、認証を追加しない。
- Header、Footer、SiteMenu、PageToc、既存キャラクターメイキングdesignを再設計しない。
- VRT baselineをユーザーの明示指示なしに更新しない。

## 完了条件

- [ ] 「サンプルキャラクター」節に指定文と新しい順序なしリストが表示される。
- [ ] 10件のPC名が、`01` から `10` のJSONへ順番どおりのダウンロードリンクとして表示される。
- [ ] 各PC名の直後に、リンクではない `プライマリ流儀×生き様` が表示される。
- [ ] 「キャラクターシート」リンクが新しいタブで開き、GitHub Pagesのsubpathでも正しいURLになる。
- [ ] JSONダウンロードリンクがGitHub Pagesのsubpathでも正しいURLになる。
- [ ] 10件すべてが現行のcharacter-sheet JSON import境界で受理され、PC名・プライマリ流儀・生き様が復元されることを、自動testまたはローカル確認で記録している。
- [ ] contents reviewerがPC名と設定文をレビューし、対応方針または人間確認事項をissueと `.tmp/review/55-0-sample-characters/` に記録している。
- [ ] `npm run check` が通る。
- [ ] `npm run build` が通る。
- [ ] 対象route・default state・desktop/tablet/mobileのactual screenshotを開いて表示契約を確認し、対象限定VRT結果を記録している。

## チェックポイント

- [ ] `public/sample-charcter/` の10件を変更せずに公開対象へ含めている。
- [ ] 10番が `sample-character_10_kashira_kejime.json` として、JSON本体の `ikizamaId: "kejime"` に一致している。
- [ ] 既存ルートとキャラクターシートのimport導線が壊れていない。
- [ ] GitHub Pagesのサブパス公開に影響しない。
- [ ] 不要な依存関係を追加していない。
- [ ] 初期スコープ外の機能を実装していない。
- [ ] `docs/TODO.md` の「JSONのスキーマバージョン差異との互換性を担保する」と矛盾していない。現行形式の10件を受理する確認だけを扱い、旧形式との互換性はこのissueで実装しない。
- [ ] `docs/design/character-making/notes.md` の既存layoutと矛盾していない。
- [ ] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `public/sample-charcter/sample-character_01_kenkaya_sumi.json` から `public/sample-charcter/sample-character_10_kashira_kejime.json`
- `src/pages/character-making.mdx`
- 必要な場合のみ、キャラクターメイキングの表示確認を固定する既存test

## レビュー観点

- 10件のリンク先、表示順、PC名、プライマリ流儀、生き様が、各JSONの `profile.pcName` と `build` のIDに一致するか。
- 「キャラクターシート」だけが新規タブで開き、PC名リンクはJSONをダウンロードできるか。
- リストが既存のキャラクターメイキング本文として自然に読め、desktop/tablet/mobileで横overflowを起こさないか。
- PC名と設定文についてのcontents reviewerの指摘を、このissueで扱うべきか。扱う場合は、各スキル効果・リソース処理との整合を確認してからJSONを修正するか。

## 備考

- `55-0` は `docs/plan.md` に独立したチェックボックスを持たないユーザー指定の作業番号であり、親タスク `55-initial-release` に紐付ける。`docs/plan.md` はこのissue作成では変更しない。
- Gate作成またはGate分割の明示指示はないため、Gate planおよびGate子issueを作成しない。
- 10番は `sample-character_10_kashira_kejime.json` であり、JSON本体の `build.ikizamaId: "kejime"` と一致する。
- `docs/TODO.md` の「JSONのスキーマバージョン差異との互換性を担保する」は将来の旧形式互換性を扱う。このissueでは現行形式の10件を検証するだけであり、スキーマバージョン、移行、旧形式受理は追加しない。
- contents reviewでは、他サンプルへの比較依存、用語の補足不足、サンプル10の「攻撃回数の多き」という誤字、サンプル04の「縁」の意味、サンプル08のリアクションとスキルの係り受けが指摘された。ユーザーはサンプル04・05・10を修正し、用語説明、サンプル04の「縁」、サンプル08は変更しないと決定した。

## レビュー指摘 1

### 指摘事項

- contents reviewerは、用語説明、サンプル04・05の他サンプルとの比較、サンプル10の誤字、サンプル04の「縁」、サンプル08の説明を指摘した。

### 判定

- source: local-agent
- classification:
  - stale: サンプル04は「パーティの要として他のキャラクターを支え」へ、サンプル05は固有のサンプル名を使わない「ダメージ特化のキャラクター」へ、サンプル10は「攻撃回数の多いキャラクター」へ更新済みである。
  - user-declined: 用語説明、サンプル04の「縁」、サンプル08の説明は、ユーザー指示により変更しない。
- local validation: `public/sample-charcter/*.json` の `profile.setting` を確認し、サンプル04・05・10の上記更新を確認した。

### 対応方針

- ユーザー指定の3項目は変更しない。
- サンプル05は、他サンプルを前提にしない説明へ更新済みである。

### 対応完了チェックリスト

- [x] サンプル05の比較表現を、他サンプルを前提にしない説明へ更新している。
- [ ] 修正する場合は、現行JSON import受理確認を含む `npm run check` が通る。
- [ ] 修正する場合は、`npm run build` が通る。
