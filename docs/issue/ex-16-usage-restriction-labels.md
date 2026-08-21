# ex-16-usage-restriction-labels

## 目的

スキルの使用制限を、データページで定義した日本語の略号 `巡`、`幕`、`話` で生成JSONへ統一出力する。

## 背景

ユーザーの未コミット変更で、`src/pages/data/index.mdx` の使用制限表記は `N/R`、`N/Sn`、`N/Sc` から `N/巡`、`N/幕`、`N/話` へ更新されている。一方、共通・流儀・生き様スキルの生成JSONは旧略号を保持し、共通変換器も使用制限を入力値のまま出力する。

- 要件正本: `docs/requirements.md`
  - Excel変換仕様とJSON出力仕様は `docs/conversion/*` を正本とする。
- 変換仕様正本: `docs/conversion/skills.md`
- 関連する未コミット変更: `src/pages/data/index.mdx`
  - このissueでは変更・整形・commitしない。使用制限の公開表記だけを変換要件の根拠として参照する。
- `docs/TODO.md` と `docs/issue/milestone-02/plan.md` に、使用制限表記またはスキルJSONの再生成に直接対応する未対応項目はない。

## 対象範囲

- `scripts/convert-skills/lib.ts` に、使用制限の区切り後の略号を次の対応で正規化する処理を追加する。
  - `R` → `巡`
  - `Sn` → `幕`
  - `Sc` → `話`
- 既存の使用制限の構文を維持する。
  - 先頭の回数または `lv` は変更しない。
  - 複数制限を結ぶ `&` と、`特殊`、空欄は変更しない。
  - `R`、`Sn`、`Sc` 以外の使用制限本文は変更しない。
- `docs/conversion/skills.md` に、入力で受け入れる旧略号と生成JSONへ出力する正規化後の表記を記録する。
- 最小fixtureの変換テストで、単独・複数の使用制限が共通変換器から正規化されることを確認する。
- ローカルの `.raw/data/common-skills.xlsx`、`.raw/data/ryugi-skills.xlsx`、`.raw/data/ikizama-skills.xlsx` を入力として、以下の生成JSONを変換コマンドで再生成する。
  - `data/generated/common-skills.json`
  - `data/generated/ryugi-skills.json`
  - `data/generated/ikizama-skills.json`

## 初期スコープ外

- `src/pages/data/index.mdx` のユーザー未コミット変更を変更、整形、stage、commitしない。
- Excel本体、Google Drive、入力シートの表記を編集しない。
- スキルカード、データページのUI、キャラクターシート、使用回数のゲームルールを変更しない。
- 使用制限以外のスキルデータを意味的に変更しない。
- Web上でのExcel変換・データ編集、CI/CDでの変換実行、新規依存packageの追加は行わない。

## 完了条件

- [ ] 共通スキル変換器が、入力の `R`、`Sn`、`Sc` を出力時にそれぞれ `巡`、`幕`、`話` へ正規化する。
- [ ] `lv`、`&`、`特殊`、空欄、および対象外の使用制限本文が意図せず変更されない。
- [ ] `docs/conversion/skills.md` が、入力の旧略号と生成JSONの正規化後表記を定義している。
- [ ] 共通変換器を使う最小fixture testが、単独・複数の使用制限の正規化を確認している。
- [ ] `data/generated/common-skills.json`、`data/generated/ryugi-skills.json`、`data/generated/ikizama-skills.json` がローカルExcel入力から変換コマンドで再生成され、各 `usageRestriction` に区切り後の旧略号 `/R`、`/Sn`、`/Sc` が残らない。
- [ ] 関連TODOがないこと、または変更しない理由が記録されている。
- [ ] `npm run test -- tests/node/common-skills.test.ts tests/node/ryugi-skills.test.ts tests/node/ikizama-skills.test.ts` が通る。
- [ ] `npm run check` が通る。
- [ ] `npm run build` が通る。

## チェックポイント

- [ ] 既存ルートが壊れていない。
- [ ] GitHub Pagesのサブパス公開に影響しない。
- [ ] 不要な依存関係を追加していない。
- [ ] 初期スコープ外の機能を実装していない。
- [ ] `docs/TODO.md`、`docs/conversion/skills.md`、ユーザーの未コミット変更と矛盾していない。
- [ ] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `docs/issue/ex-16-usage-restriction-labels.md`
- `docs/conversion/skills.md`
- `scripts/convert-skills/lib.ts`
- `tests/node/common-skills.test.ts`
- `data/generated/common-skills.json`
- `data/generated/ryugi-skills.json`
- `data/generated/ikizama-skills.json`

## レビュー観点

- `R`、`Sn`、`Sc` の置換が使用制限の区切り後だけに限定され、自由記述の効果本文や他のスキルフィールドへ波及しないか。
- 3つの生成JSONを手編集せず、同じ共通変換器とローカルExcel入力から再生成する契約になっているか。
- ユーザーの未コミットのデータページ変更をこのissueの対象外として保護できているか。
- 変換仕様が、入力互換性と公開JSONの表記を明確に区別できているか。

## 備考

- 通常issueであり、Gate planは作成しない。
- UI、CSS、layout、page、Componentを変更しないため、design target、`design-image-generation`、VRTは不要である。
- 実装時に使用制限の正常化対象を旧略号以外へ広げる必要が判明した場合は、実装を止めてユーザー判断を求める。
- Git commit / pushはこの準備では実行しない。
