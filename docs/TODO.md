# TODO

このファイルは、現在のissueでは対応しないが、将来対応すべきレビュー指摘・改善候補を一時的に追跡するための一覧である。

このファイルは未対応TODOを中心に管理するactive TODOである。完了済みTODOを退避する場合は、削除せず `docs/TODO-done.md` へ移す。

TODOの退避は、対応内容がmerge済み、またはユーザーが完了扱いを承認した場合に限る。current issueで対応すべき修正をTODOへ逃がしてはならない。

PR merge後のTODO更新は `.agents/skills/post-merge-plan-update/SKILL.md` に従う。

`docs/TODO.md` は、`review-to-issue` workflowで以下のような項目を受ける。

- 現在のissue範囲を超える指摘
- 後続タスクで対応すべき改善
- 対象milestoneの `docs/issue/milestone-<NN>/plan.md` タスクに紐づく補足対応
- 対象milestoneの `docs/issue/milestone-<NN>/plan.md` に新しい計画項目を追加したうえで追跡すべき作業

TODO項目は、可能な限り対象milestoneの `docs/issue/milestone-<NN>/plan.md` の未完了計画項目へ紐づける。クローズ済みmilestoneの完了taskには紐づけず、後続milestoneで計画化する。

---

## 未対応

- [ ] ゲーム設計レビューの未解決高優先度・GM項目をトリアージする
  - source: PR #187の文書レビュー
  - classification: follow-up
  - plan: `docs/issue/milestone-02/plan.md`のPhase 2（GMセクション）。
  - handling plan: GMセクションを作成してから、`docs/game-design/2026-08-02_game-review.md`の未解決項目を、対応しない判断、FAQ候補、公開ルールの個別issue、GM-01/GM-02を含むPhase 2へ分類する。Phase 1ではトリアージ、FAQ、ルール実装を行わない。

- [ ] キャラクターシートの候補行を選択可能に見せるデザインを検討する
  - source: `.tmp/review/ex-02-31-sheet-integration/contents-review-1.md` とユーザー判断
  - classification: visual usability follow-up
  - plan: `docs/issue/milestone-02/plan.md`のPhase 3。キャラクターシートのdesign改訂を対象とする独立taskを計画してから実装する。
  - handling plan: skill・item候補dialogで、候補名または行全体が選択可能であること、選択済み・非選択・選択不可の状態を視覚だけで区別できる表現を検討する。既存designと操作導線への影響を確認し、方針を承認してから実装する。

- [ ] 覚悟から縁へ戻す効果の表現を整理する
  - source: `ex-02-web-character-sheet` の要件レビューに対するユーザー回答
  - classification: rule wording follow-up
  - plan: `docs/issue/milestone-02/plan.md`のPhase 3。ルール文言整理の独立taskを計画してから実装する。
  - handling plan: `src/pages/rules/battle.mdx`の「入れ替えができなくなる」と、スキル効果の「覚悟を縁に戻す」を、覚悟を解除する効果は許可する意図が明確になる表現へ整理する。生成JSONのスキル本文を変更する場合は、対応する生成元から更新する。

- [ ] JSONのスキーマバージョン差異との互換性を担保する
  - source: `ex-02-web-character-sheet` の要件レビューに対するユーザー回答
  - classification: future data compatibility follow-up
  - plan: なし。複数のJSON形式を継続して扱う必要が明確になるまで計画化しない。
  - handling plan: 2026-08-04のユーザー判断により当面保留する。現在はスキーマバージョンを保存・比較せず、正常に処理できないJSONを一律エラーにする。将来、バージョン番号、受け入れ可能な旧形式、移行処理、エラー表示、テストfixtureを定義して互換性を担保する。

- [ ] 表全体が初期表示で収まらない場合のレイアウト対策を検討する
  - source: `26-2-advancement-page` のcontents review 3 とユーザー指示
  - classification: visual usability follow-up
  - plan: `docs/issue/milestone-02/plan.md`のPhase 3。情報設計とresponsive表示を検討する独立taskを計画してから実装する。
  - handling plan: 成長ページの「生き様係数」表など、本文コンテナ内で横スクロールが必要になり初期表示で全列を確認できない表について、情報の分割、列・見出しの再構成、画面幅に応じた表示、スクロール誘導などを比較する。既存table layout・共通design・アクセシビリティへの影響を確認し、方針を決めてから実装する。

- [ ] キャラクターシートの永続スキル参照でID変更を検出してエラーにする
  - source: `28-0-common-skills-data` 実装中のユーザー指示
  - classification: future data compatibility follow-up
  - plan: なし。永続保存を追加する必要が明確になるまで計画化しない。
  - handling plan: 2026-08-04のユーザー判断により当面保留する。キャラクターシート機能がDBなどへスキルIDと取得レベルを保存する前に、名称、所属、区分、タイミングなどID入力値の変更で同一スキルのIDが変わったことを検出してエラーにする方式を設計する。比較に使う不変キーまたは移行マッピング、既存保存データとの照合時点、エラー表示、移行手順を決定し、ID変更を黙って保存データへ適用しない。

- [ ] Footerからクレジット導線を出すか将来検討する
  - source: `phase-2-prep-doc-agent-ops` Group 12
  - classification: low-priority follow-up
  - plan: なし。Footerからの常設導線が必要になるまで計画化しない。
  - handling plan: 2026-08-04のユーザー判断により当面保留する。初期実装ではFooterをコピーライト、GitHub、X、Discordに絞る。クレジット本文はトップページや将来の専用ページで扱い、Footer導線は必要性が明確になってから追加する。

## ex-17: ex-16 Cloud Persistence残課題回収

ex-16-character-sheet-cloud-persistence を一度production deploy可能な状態でcloseするため、明確なBlocker以外の残課題を本Issueへ移管する。

### Character persistence / authentication

- [ ] JSON import時のremote binding解除を失敗経路まで含めて保証する
  - JSON importではformの復元後、画像decode失敗またはIndexedDBへの画像write失敗が発生すると、旧remote character IDが残る経路がある。
  - import後のform内容と旧remote bindingが混在し、後続のDB保存で旧recordを意図せず上書きする可能性がある。
  - import開始時または復元状態確定時に、画像処理の成否に依存せずremote bindingを解除する設計へ整理する。
  - handling plan: ex-17では対応しない。JSON import機能を削除するtaskで、削除後の導線とremote bindingの整合性を確認する。

- [x] authentication state変更後のremote ownershipを初期ロード経路で再評価する
  - login / logout / user変更時には一旦`isOwner=false`へdemoteしている。
  - signed-in後のremote GETではrefresh keyを先に確定し、取得失敗を握り潰しているため、一時的なnetwork/API障害でも同session中に自動再試行されない。
  - owner characterがread-onlyのまま残らないよう、失敗時のretry条件、refresh key確定タイミング、ユーザー向けエラー通知を整理する。
  - handling plan: 初回のFirebase認証状態確定後、uidの変更（login、logout、user切替）ごとにページ全体を再読み込みする。ownership再取得専用のretry stateは追加しない。

- [x] キャラクターシートの想定外エラーを再読み込みダイアログで扱う
  - API通信不能・5xx、想定外の例外、Reactの未捕捉例外では、閉じられない共通ダイアログに再読み込み操作を表示する。
  - 入力検証、画像形式不正、401 / 403 / 404、ユーザー操作のキャンセルなど、原因と次の操作が明確な既知エラーは既存の個別通知またはdialogで扱い、再読み込み対象にしない。
  - reloadで未保存編集を失うため、想定外エラーへ分類する境界をtestで固定する。

- [x] Firebase public key取得障害とinvalid tokenを区別する
  - Firebase公開鍵取得、key import等のinfrastructure failureがtoken validation failureと同じ認証エラーへ収束し得る。
  - 不正tokenは401系、Firebase側またはnetwork側の一時障害は5xx系として扱えるよう、verifierのerror classificationを整理する。
  - handling plan: 不正tokenは401、期限切れtokenは419、Firebase公開鍵の取得不能・response不正・証明書import失敗は`authentication_unavailable`として503、その他の予期しないverifier例外は500とする。frontendは503 / 500を共通の再読み込みdialogへ渡す。
  - test: Firebase公開鍵endpointの503がAPIの503となることと、不正tokenが401となることを分離して固定する。

### Sample characters / production data

- [x] production環境へサンプルキャラクター10件を投入する運用を文書化する
  - 旧static JSON sampleは廃止済みで、現在はDBの`type=sample` characterを一覧から選択する。
  - 管理者所有のcharacterを作成し、D1上で`type=sample`へ変更する現在のcontractを前提に、production sampleの初期投入方法を確定する。
  - 必要ならseed script、管理用手順、更新方法を追加する。
  - 通常公開するsampleは`isPublic=true`とする。
  - sampleの表示順`createdAt ASC`が期待どおりになることを確認する。
  - handling plan: seed scriptや管理機能は追加しない。管理者アカウントで画面から10件を作成・DB保存し、表示したい順に`createdAt`を確定してから、承認済みのproduction D1操作で対象recordを`type='sample'`かつ`isPublic=true`へ更新する。
  - documentation: `docs/deployment.md`に、対象IDを記録すること、未ログイン一覧で10件の順序・公開状態・個別復元を確認することを含む更新手順として明記する。

### Character list UI

- [x] character一覧のpageをcache件数変更時にclampする
  - 現在のpageより後ろのdataが削除・filter変更・cache更新等で消えた場合、`pageCount`だけが縮み、存在しないpageを指せる可能性がある。
  - `page <= pageCount - 1`を保証する。
  - handling plan: cache件数の縮小で生じる表示バグとして修正する。表示用pageを`min(page, pageCount - 1)`で導出し、stateも同じ値へ同期して一覧scrollを先頭へ戻す。filter変更時に1ページ目へ戻す既存挙動は維持する。
  - test: 2ページ目を表示中にcacheを11件から10件へ縮小し、1ページ目へclampされて有効なrowが表示されることを固定する。

- [x] character一覧の流儀・生き様表示仕様をactive documentationへ統一する
  - 現行実装の`流儀／生き様`が正であり、headerと各rowの順序を変更しない。
  - desktopでは折り返さず表示し、mobileではPC名・PL名のみ表示する現在方針を維持する。
  - `生き様／流儀`を最新仕様とする記述だけを訂正し、実装またはtestを変更しない。

### API contract / payload

- [x] backend request body上限とshared schema上限を同一contractとして整理する
  - backendではHTTP request body全体に8MiB上限がある。
  - shared schemaではBase64画像単体に近いサイズまで許容できるため、schema上validでもJSON envelopeを含めるとbackendで413になる領域が存在する。
  - 正常な最大画像サイズ、Base64 overhead、snapshot metadataを考慮し、client/shared/backendで一貫した上限を決定する。
  - boundary testを追加する。
  - handling plan: HTTP request全体の上限は既存どおり8MiB、`imageBase64String`の上限は4MiBとする。500px・WebP quality 0.8へ変換後の通常画像に余裕を持たせ、snapshotとmetadataに約4MiBを確保する。
  - implementation: shared packageへ上限定数を置き、frontendは送信直前のUTF-8 byte長、shared schemaは画像文字列長、backendはbody全体を同じcontractで検査する。
  - test: 最大想定画像を含む正常payloadと1 byte超過を確認する。skip中のchunked oversized request integration testは、`createApp`へtest専用の小さいbody limitを注入し、productionの8MiB上限を変えずに16KiB超程度のstreamで413を安定して確認する。

### Production deployment / operations

- [x] production deploy後のFirebase/API smoke test手順を文書化する
  - production Firebase AuthenticationでGoogle loginできること。
  - Firebase ID Token付きAPI requestが成功すること。
  - 新規DB保存が成功すること。
  - character一覧へ反映されること。
  - individual GETとrestoreが成功すること。
  - owner characterの上書き保存が成功すること。
  - private/public visibilityが正しいこと。
  - DB削除が成功すること。
  - D1/R2のproduction bindingが意図したresourceを参照していること。
  - frontendからbackendへのCORSが正常であること。
  - 必要に応じて手動smoke / Public E2E / automated smokeの責務を整理する。
  - handling plan: 実Firebase loginとproduction APIを使うautomated smokeは追加しない。backend integration testと既存Public E2Eは自動で維持し、production deploy後は管理者アカウントによる手動smokeで確認する。
  - documentation: `docs/deployment.md`に、Google login、新規一時characterのDB保存、一覧反映、個別復元、owner上書き、private/public visibility、DB削除、browser NetworkでのCORS成功、Cloudflare DashboardでのD1/R2 production binding確認を順に記載する。一時データは必ず削除し、deploy日時・確認者・結果は実行時のissue checkpointへ残す。

### Public E2E

- [x] deploy世代のPagefind indexを検知してからPublic E2Eを実行する
  - 現行workflowはGitHub Pagesの到達だけを待つため、CDN上の古いPagefind indexを取得して検索E2Eが失敗することがある。
  - handling plan: build時に`frontend/dist/pagefind/deployment.json`へGit commit SHAを出力し、検索用JavaScriptの`pagefind.js` dynamic importにも同じSHAをquery parameterとして渡す。
  - test: Public E2E jobは`pagefind/deployment.json`が今回のSHAを返すまで有限回pollしてから既存suiteを実行する。timeout時は期待SHAと取得したmarkerだけをlogへ出す。

### Documentation consistency

- [x] ex-16で変更した仕様をactive documentation全体へ反映する
  - `docs/requirements/character-sheet.md`
  - `docs/requirements/architecture.md`
  - `docs/development-structure.md`
  - `docs/testing.md`
  - `docs/deployment.md`
  - `docs/out-of-scope.md`
  - その他ex-16の変更に依存する文書
  - 旧identity provider時代の記述をFirebase Authenticationへ更新する。
  - 旧OAuth設定名の説明をFirebase用設定へ更新する。
  - 旧deploy workflowの説明を現在の`frontend-deploy.yml` / `backend-deploy.yml`へ統一する。
  - character一覧の旧column / responsive仕様を最新仕様へ更新する。
  - static sample JSON前提の説明をDB sample前提へ更新する。
  - production / development Cloudflare bootstrap・migration・deploy手順を現実装へ合わせる。
  - document間でSSoTが競合していないことを確認する。
  - handling result: 列挙ファイルに限らず、Git管理されているリポジトリ全体の現行仕様・運用文書を検索対象にして、旧identity provider、旧設定名、旧deploy、旧sample、旧一覧仕様をFirebase Authenticationと現在の運用へ統一した。`docs/design/character-sheet/notes.md`だけはJSONインポートbutton削除と同じex-18で最終整理する。
  - boundary: `docs/issue/ex-16-character-sheet-cloud-persistence.md`、親Gate plan、G1〜G6 child issueは履歴文書として次のarchive taskでGitHub closed Issueへ記録してローカルから削除する。agent failure logなどの監査記録は改変せず、現行仕様の正本として参照しない。

### Issue / Gate archive

- [ ] ex-16とex-16-6の関連Issue / Gate documentを最終状態へarchiveする
  - `docs/issue/ex-16-character-sheet-cloud-persistence.md`
  - `docs/issue/ex-16-character-sheet-cloud-persistence/plan.md`
  - `docs/issue/ex-16-6-firebase-authentication.md`
  - G1〜G6 child issue document
  - GitHub Issue #212 / #214 / #216 / #218 / #220 およびG6
  - Gate状態を実際の完了状態へ更新する。
  - G6の`planned`等、現在実装と一致しない状態を解消する。
  - 最終HEAD / merge / deploy後の状態を反映する。
  - handling plan: ex-17をmainへmergeし、post-merge-plan-updateで実施する。ex-16-6はparent ex-16の認証Gateとして、同じcurrent local evidenceで監査・archiveする。productionの手動smokeはユーザーが実施するため、archiveの前提チェックには含めない。
  - archive: ex-16-6とparent ex-16の同名GitHub Issueを作成または照合し、最終契約・完了記録を残してcloseする。Gate planのG6は`done`とGitHub Issue番号だけへ縮約し、local child / parent issueは削除する。完了したGate planは`docs/issue/milestone-02/plans/`へ移し、Gate詳細は残さない。
  - obsoleteな途中レビュー・暫定方針がactive requirementとして読めない状態に整理する。
  - archive方針に従って完了済みissueを整理する。

## ex-18: キャラクターシートJSONインポート導線削除

JSONインポートbuttonを削除し、DB保存への移行を完了する。ex-17では扱わない。

- [ ] JSONインポートbuttonを削除する
  - JSON import機能とremote bindingの整合性は、この削除に合わせて確認する。

- [ ] JSONインポートbutton削除後にキャラクターシートのdesign note、ex-17 Group 1のVisual Review、target VRT、canonical VRT baselineを最新化する
  - `docs/design/character-sheet/notes.md`からJSONインポートの導線・削除予告を除き、削除後のAction Pane / control paneを正本化する。
  - 削除後のdesign intentをユーザーが承認してから、`design-image-generation`によりapproved designを反映したcanonical VRT baselineを更新する。actual screenshotをdesign正本やbaselineへ直接コピーしない。
  - ex-17 Group 1のfatal error dialogは、JSONインポートbutton削除後の画面を対象にdesktop、tablet、mobileのactual screenshotでVisual Reviewし、target限定VRTを実行する。design noteとbaselineを同じtaskで最終整理して、二重の比較・更新を避ける。
  - ex-17ではキャラクターシートのdesign note、Visual Review、target VRT、baselineを更新しない。

<!--
例:

- [ ] TODO title
  - source: `.tmp/pr-N-review.md`
  - classification: follow-up / out-of-scope
  - plan: 対象milestoneの `docs/issue/milestone-<NN>/plan.md` の該当項目
  - handling plan: 将来どのタスクでどう扱うか
-->
