# ex-12-design-notes-canonicalization

## 目的

`docs/design/**/notes.md` を、各design targetの現行デザイン正本として読める記述へ整理する。
履歴、ユーザー判断、日付ごとの変更経緯ではなく、画面・レイアウト・Componentが現在どのように実装されるべきかを明示する。

## 背景

`docs/design/README.md` はdesign notesを、画面、レイアウト、Componentごとのdesign intentとVRT参照情報を置く正本と定義している。一方で現行notesには、ユーザーの過去の判断、ユーザー承認、日付付き変更履歴、過去issueやreviewの経緯を主語にした記載が散在する。

最新のユーザー指示により、これらの記載を現行の表示・導線・状態・VRT参照条件へ置き換える。`docs/issue/milestone-02/plan.md` には `ex-12` の既存項目がないため、このissueは最新のユーザー指示を起点とする文書整理taskであり、milestone計画の更新は含めない。

関連する正本:

- `docs/design/README.md`
- `docs/requirements.md`
- `docs/out-of-scope.md`
- `docs/TODO.md`
- `.agents/skills/design-image-generation/SKILL.md`
- `tests/vrt/**` と、notesに対応する既存route・Component（読み取り専用の照合先）
- `canonical-snapshots/visual/**`（変更禁止の読み取り専用照合先）

## 対象範囲

- `docs/design/**/notes.md` を確認し、現行デザインの仕様として読めない記載を整理する。
- ユーザーの発言・承認・判断、日付付き変更履歴、過去issue・PR・review・Gate・capture実行の経緯を主語にした記載を削除または現行仕様へ置き換える。
- 現行の画面構成、表示内容、配置、導線、状態、breakpoint、制約、対象外、参照SSoT、比較観点、VRT参照情報、baseline更新条件など、design正本として必要な事実を維持する。
- 現行SSoTまたは最新のユーザー指示で解決済みと確認できない未決事項は、履歴として削除・仕様として確定せず、`Open questions` または同等の現行の判断保留として維持する。
- 文書内の見出し・参照を、履歴ではなく現行仕様を表す構成へ整える。

## 初期スコープ外

- current issueの進捗・確認記録を除き、`docs/design/**/notes.md` 以外のGit管理文書、要件、計画、TODOを変更しない。
- Astro、MDX、TypeScript、CSS、VRT test、画像asset、canonical baselineを変更しない。
- `npm run visual:update` を実行せず、VRT baselineを更新しない。
- 新しいdesign draft、画面仕様、機能、依存関係を追加しない。
- 初期スコープ外の項目は `docs/out-of-scope.md` に従う。

## 完了条件

- [ ] すべての `docs/design/**/notes.md` を確認し、現行デザイン仕様に必要な内容だけを残している。
- [ ] ユーザーの発言・承認・判断、日付付き変更履歴、過去作業の経緯を記録する文章を、現行仕様の文章へ置き換えるか削除している。
- [ ] 残した各記載は、現在どのように実装・表示されるべきか、現行の制約・対象外・参照SSoT・比較観点、現行VRT参照条件、または未解決の判断事項を示している。
- [ ] 現行の画面構成、導線、状態、breakpoint、制約、対象外、参照SSoT、比較観点を意図せず削除・改変していない。
- [ ] 各targetで既存のVRT参照情報を、route、state、viewport、test、tag、snapshot、comparison points、VRT statusの観点で`tests/vrt/**`および必要な既存実装と照合している。VRT未整備のtargetは、その状態と後続実装で必要になる条件を維持している。
- [ ] VRT test coverageとlocal canonical baselineの存在・未配置・確認不能を区別している。baselineがない、または確認できないtargetでは、baselineを生成せず、その現行statusをnotesへ維持している。
- [ ] 未決事項は、現行SSoTまたは最新のユーザー指示で解決済みと確認できる場合だけ削除・仕様化し、判断不能なものは現行の判断保留として残している。
- [ ] 関連TODOをこのissueで扱わない理由を記録している。
- [ ] `npm run check:md` が通る。

## チェックポイント

- [ ] 既存ルート、GitHub Pagesのサブパス公開、依存関係に影響していない。
- [ ] 初期スコープ外の機能、design、VRT baseline更新を追加していない。
- [ ] `docs/TODO.md` の未対応項目と矛盾していない。
- [ ] `docs/design/README.md` が定めるdesign正本とVRT参照情報の役割と矛盾していない。
- [ ] 現行notesの意味を、既存実装だけに合わせて無断で変更していない。
- [ ] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `docs/design/**/notes.md`
- `docs/issue/ex-12-design-notes-canonicalization.md`

## レビュー観点

- 各noteが過去の意思決定ログではなく、現行のdesign intentとVRT参照情報として読めるか。
- 履歴表現を削除したあとも、実装・Visual Reviewに必要な表示、導線、状態、viewport、baseline更新条件が明確か。
- 未解決事項を、履歴と誤認して削除・仕様化していないか。
- 各targetのVRT参照情報が、現行のroute、state、viewport、test、tag、snapshot、comparison points、VRT statusと整合するか。
- `docs/design/README.md`、要件、TODOを変更せずに整理する範囲が適切か。
- milestone計画に未記載の `ex-12` を、最新のユーザー指示に基づく独立した文書整理taskとして扱ってよいか。

## 備考

- 関連TODOは、キャラクターシートの候補行、表レイアウト、Footerクレジット導線などの将来の設計・機能改善を扱う。これらの機能・design変更は本issueに含めず、現行仕様の制約（たとえばFooterにクレジット導線を追加しない）だけをnotesに維持する。
- 作業後にMarkdown formatterを実行する。Markdownのみの変更であるため、`npm run check` と `npm run build` は実行しない。
