# ex-09-data-corrections

## 目的

ユーザーが同期・調整した公開データとルール／サポート本文を取り込み、該当ページの表示を最新内容へ更新する。

## 背景

未コミットの生成JSONとMDXには、流儀・生き様スキル、アイテム、戦闘ルール、CCFOLIA専用ダイスボット案内、リリースノートの調整が含まれる。既存の変換・表示実装を変更せず、調整済みの公開入力を検証して反映する。

- 参照: `docs/requirements/data-display.md`
- 参照: `docs/requirements/release-notes.md`
- 参照: `docs/testing.md`
- 初期スコープ外は `docs/out-of-scope.md` に従う。
- `docs/TODO.md` の「覚悟から縁へ戻す効果」の表現整理は、今回の差分に含まれるカウンタールールと対象スキルの表示順調整とは別件のため扱わない。

## 対象範囲

- 調整済みの `data/generated/ikizama-skills.json`、`data/generated/items.json`、`data/generated/release-notes.json`、`data/generated/ryugi-skills.json` を公開データとして反映する。
- `src/pages/rules/battle.mdx` のカウンタールールを調整する。
- `src/pages/support.mdx` にCCFOLIA専用ダイスボットの判定コマンド説明と例を反映する。
- 影響ページを対象に、ユーザー承認済みのcanonical VRT baselineを更新し、実画面を確認する。対象とdesign参照は「VRT対象契約」に固定する。

## 初期スコープ外

- JSON schema、変換script、データ取得・表示Component、キャラクターシート機能を変更しない。
- 新しいnpm packageを追加しない。
- UIデザイン、レイアウト、機能を追加しない。
- `docs/TODO.md` の未解決項目を回収しない。
- DB、認証、SSR、CMSその他の初期スコープ外機能は実装しない。

## 完了条件

- [ ] 4件の生成JSONが既存schemaで読み込め、調整済みのスキル・アイテム・リリースノートを公開ページへ表示できる。
- [ ] 戦闘とサポートの本文調整がMDXとして正常にbuildされる。
- [ ] 対象ページのcanonical VRT baselineを更新し、「VRT対象契約」のroute・state・viewportごとのactual screenshotを表示契約と照合して確認する。
- [ ] `npm run format:md` と `npm run check` が通る。
- [ ] `npm run build` が通る。
- [ ] `npm run test` が通り、生成JSONのschema・取得層の契約を確認できる。

## チェックポイント

- [ ] 既存ルートと、ID変更のないスキル・アイテムの個別アンカーが壊れていない。
- [ ] GitHub Pagesのサブパス公開に影響しない。
- [ ] 不要な依存関係を追加していない。
- [ ] 初期スコープ外の機能を実装していない。
- [ ] 関連する `docs/TODO.md` 項目と矛盾していない。
- [ ] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `data/generated/ikizama-skills.json`
- `data/generated/items.json`
- `data/generated/release-notes.json`
- `data/generated/ryugi-skills.json`
- `src/pages/rules/battle.mdx`
- `src/pages/support.mdx`
- `canonical-snapshots/visual/` 配下の該当baseline（Git非管理）

## VRT対象契約

次の既存VRT targetだけを更新・captureする。静的ページは `default` のdesktop、tablet、mobileを対象とし、明記した追加stateも同じviewportで対象にする。流儀・生き様の個別詳細は既存specに従い、代表流儀`kenkaya`のみ全viewport、その他はdesktopのみとする。

| target              | route / scenario                                                                | state・viewport                             | design参照                               |
| ------------------- | ------------------------------------------------------------------------------- | ------------------------------------------- | ---------------------------------------- |
| `battle`            | `/rules/battle`                                                                 | default、全viewport                         | `docs/design/battle/notes.md`            |
| `support`           | `/support`                                                                      | default、全viewport                         | `docs/design/support/notes.md`           |
| `home`              | `/`                                                                             | defaultおよび`home-viewport`、全viewport    | `docs/design/home/notes.md`              |
| `release-notes`     | `/release-notes`                                                                | default、全viewport                         | `docs/design/release-notes/notes.md`     |
| `items-omamori`     | `/data/items/omamori`                                                           | default、全viewport                         | `docs/design/items-omamori/notes.md`     |
| `items-cybernetics` | `/data/items/cybernetics`                                                       | default、全viewport                         | `docs/design/items-cybernetics/notes.md` |
| `ikizama-detail`    | `/data/ikizama/burai`                                                           | `burai` default、desktop                    | `docs/design/ikizama-detail/notes.md`    |
| `ryugi-detail`      | `/data/ryugi/{kenkaya,emono,kabe,shabazou,teppoudama,yamiuchi,gotoshi,kashira}` | default。`kenkaya`は全viewport、他はdesktop | `docs/design/ryugi-detail/notes.md`      |

実行時は上表のtargetとscenario tagに限定した`npm run visual:update -- --grep ...`および`npm run visual:capture -- --grep ...`を使う。actual screenshotは`test-results/visual/`から各target・state・viewportを開いて確認する。

## 事前確認が必要なデータ変更

- `合気合一`はタイミングの`Pv`から`SP`への変更に伴い、IDが`skill-ryugi-kashira-advanced-pv-73627e11069b`から`skill-ryugi-kashira-advanced-sp-73627e11069b`へ変わる。この変更を反映するため、旧個別アンカーが無効になり、旧IDを保存したキャラクターシートは当該スキルを復元できない可能性をユーザーが許容した。
- `docs/TODO.md`の「キャラクターシートの永続スキル参照でID変更を検出してエラーにする」は将来対応として保留されている。本taskではその機能を実装しない。
- サポートページの例①は説明上`@1+1`を指定するが、コードブロックの入力は`10nu7`となっている。ユーザー確認により、ダイスボットの出力仕様として現在の入力表示を維持する。

## レビュー観点

- データ調整の範囲が既存schemaと表示実装に収まり、変換仕様や機能の変更へ広がっていないこと。
- CCFOLIAコマンド例とカウンタールールの文言が意図どおりであること。
- `合気合一`のID変更による旧アンカーと既存キャラクターシート保存データへの影響は、ユーザー承認済みであること。
- canonical VRT baseline更新の対象route・state・viewportが、データ表示と本文調整の影響範囲を過不足なく覆うこと。

## 備考

- task番号は既存milestone planに未掲載のため、ユーザー指定に基づき `ex-09` を採用する。
- canonical VRT baselineは `.gitignore` 対象であり、コミット対象はGit管理されるデータ・MDX・issueのみとする。
- ユーザーはデータ調整のみとしてPRレビューを不要と指定した。PR作成前のPR reviewは実施しない。
