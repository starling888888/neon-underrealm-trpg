# ex-16-3-google-authentication

## 最優先のデザイン入力

- ユーザーの最新指示により、G3 の認証導線は design draft を作成せずに実装する。
- Google ログイン / ログアウトボタンは、desktop では右サイドバーの独立セクションに置き、`セクションにジャンプ`の直前に配置する。
- mobile / tablet では、コントロールペインを開いた内部に同じ認証セクションを配置する。
- この明示指示を、既存の `docs/design/character-sheet/notes.md` にない認証 UI の配置に関する design input とする。色、余白、既存ボタンの見た目、フォーカス表示、開閉操作は既存 character sheet の実装と design notes に従う。

## 目的

Web キャラクターシートで、Google Identity Services（GIS）の browser-only credential flow によるログイン、ログアウト、認証状態の再取得を提供する。

frontend の GIS callback で Google ID token（JWT の `credential`）を取得し、backend 用の OAuth callback URL、client secret、authorization-code exchange、refresh 実装を追加しない。取得した token はメモリ内だけに保持し、`/character-sheet/` への各アクセスで認証処理をあらためて開始して取得し直す。

## 背景

親 issue `docs/issue/ex-16-character-sheet-cloud-persistence.md` と Gate plan `docs/issue/ex-16-character-sheet-cloud-persistence/plan.md` の G3 は、G1 / G2 完了後に Google 認証と ID Token 検証の境界を整える Gate である。

Google の既存 Web OAuth client を入力として使う。最新のユーザー判断により、PKCE authorization code flow ではなく GIS の browser-only credential flow を使う。backend callback と redirect URI の登録は不要で、authorized JavaScript origin はユーザーが管理する。

GIS script の読込み、button / One Tap、credential callback は `@react-oauth/google` に委譲する。Google ID token の signature と standard claims の検証は、backend の `jose` に委譲する。Google OAuth / OIDC protocol、JWT parser、JWK verification を自前実装しない。これらの package は、公式資料、保守状況、security 上の懸念、既存 workspace との互換性を実装時点に確認して導入する。

関連する正本は以下である。

- `docs/requirements/character-sheet.md`
- `docs/requirements/architecture.md`
- `docs/out-of-scope.md`
- `docs/issue/ex-16-character-sheet-cloud-persistence.md`
- `docs/issue/ex-16-character-sheet-cloud-persistence/plan.md`
- `docs/design/character-sheet/notes.md`

`docs/TODO.md` の JSON schema version 互換性と永続スキル ID 変更検出は、クラウド保存 API を実装する G4 / G5 まで保留し、G3 では回収しない。

## Gate関係

- 親issue: `docs/issue/ex-16-character-sheet-cloud-persistence.md`
- Gate plan: `docs/issue/ex-16-character-sheet-cloud-persistence/plan.md`
- Gate: `G3: Google authentication`

この issue は G3 だけの実装契約であり、G4 の永続保存 API、G5 のクラウド保存 UI は扱わない。

## 対象範囲

- `@react-oauth/google` と、backend JWT 検証用の `jose` を必要最小限の dependency として追加する。導入理由は、GIS integration と standard JWT / JWK verification を自前実装しないためである。
- OAuth redirect / callback 処理は追加せず、静的 frontend 内の GIS credential callback で完結させる。backend callback URL、client secret、authorization-code exchange、refresh token 永続化を追加しない。
- Google ID token（JWT）と認証済みユーザー情報は React のメモリ state だけに保持し、localStorage、sessionStorage、IndexedDB、cookie へ保存しない。
- `/character-sheet/` の mount ごとに既存 Google session を使った認証処理を開始して JWT を取得し直す。対話が必要な場合はログインボタンから同じ flow を開始し、失敗またはキャンセル時はローカル編集を継続可能にする。
- desktop では右サイドバーの `セクションにジャンプ` の直前、mobile / tablet では開いたコントロールペイン内に、ログイン / ログアウトと認証状態を表示する。未認証、認証中、認証済み、失敗の各状態で keyboard 操作、focus、読み上げを成立させる。
- logout 時はアプリケーションのメモリ token を確実に破棄し、Google 側で可能な logout / auto-select 抑止を library または公式 API に委譲する。logout 後に local-first 編集内容を失わせない。
- backend に Google ID token の検証境界を追加する。認証必須 API の実装は G4 に残し、G3 では JWT signature、`iss`、`aud`、`exp` を検証して Google `sub` だけを内部 user ID にできる middleware / helper と unit test を整える。
- Google client ID は Git 管理しない設定として扱い、公開値であっても既存の frontend 環境設定方針に沿って注入する。設定不足時はログイン機能を無効化し、ビルドやローカル編集を壊さない。
- `docs/requirements/character-sheet.md` と `docs/out-of-scope.md` を、G3 が扱う Google 認証と token verifier の範囲だけ実装と整合するように更新する。G4 / G5 のクラウド保存仕様は追加しない。
- frontend / backend の unit test を追加し、Google 本番認証への E2E 依存は導入しない。

## 初期スコープ外

- G4 / G5 の character API、D1 / R2 保存、キャラクター選択 dialog、DB保存、DB削除、read-only UI
- 独自アカウント、password 認証、Google 以外の Identity Provider、email / display name / profile image の保存
- PKCE authorization code flow、backend OAuth callback、client secret、独自 token exchange、refresh token の保存または refresh 処理
- localStorage、sessionStorage、IndexedDB、cookie への Google ID token（JWT）の保存
- 新しい design draft、design notes、VRT baseline の作成または更新
- backend の deploy、Cloudflare resource の変更、Google Cloud Console の設定変更
- JSON schema version 互換性、永続スキル ID 変更検出

## 完了条件

- [ ] `@react-oauth/google` を使う GIS browser-only credential flow が frontend で動作し、GIS integration を自前実装していない。
- [ ] login は frontend の GIS credential callback で完結し、OAuth redirect、backend callback URL、client secret、authorization-code exchange、refresh token 保存を追加していない。
- [ ] Google ID token（JWT）はメモリ内だけに保持され、ページ再アクセス時に認証処理を開始して新しい token を取得する。
- [ ] login / logout と認証状態が、指定された desktop と mobile / tablet の位置に表示される。
- [ ] logout が token を破棄し、local-first の編集内容を維持する。
- [ ] backend の token verifier が JWT signature、`iss`、`aud`、`exp` を検証し、検証済み `sub` だけを内部 user ID として返す。
- [ ] frontend と backend の追加 unit test が、認証成功、対話開始、認証キャンセル / 失敗、logout、token 未永続化、JWT rejection を確認する。
- [ ] `docs/requirements/character-sheet.md` と `docs/out-of-scope.md` が、G3 の実装済み認証範囲と矛盾していない。
- [ ] 関連 TODO を G3 で回収しない理由が記録されている。
- [ ] `npm run check`、`npm --workspace=@neon-underrealm/frontend run build`、`npm --workspace=@neon-underrealm/backend run build` が通る。

## チェックポイント

- [ ] Google Cloud Console の Web OAuth client に、frontend origin をユーザーが登録できる形で必要設定を文書化している。backend callback URL と redirect URI は要求していない。
- [ ] client ID と token の保存先を確認し、JWT が browser persistence に残らない。
- [ ] 既存の `/character-sheet/`、localStorage / IndexedDB による local-first 保存、JSON import / export、CCFOLIA copy、Help、form restore を壊していない。
- [ ] GitHub Pages のサブパス公開で GIS script、client ID 設定、アセット参照が壊れない。
- [ ] frontend が backend 内部 module を直接 import していない。
- [ ] 不要な UI library、独自 OAuth protocol 実装、初期スコープ外機能を追加していない。
- [ ] G4 / G5 の API と UI を先取りしていない。
- [ ] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `frontend/package.json`
- `package-lock.json`
- `frontend/src/character-sheet/CharacterSheetContainer.tsx`
- `frontend/src/character-sheet/components/CharacterSheetActionPane.tsx`
- `frontend/src/character-sheet/components/CharacterSheetActionPane.module.css`
- `frontend/src/character-sheet/auth/`
- `frontend/src/character-sheet/**/*.{test,spec}.tsx`
- `backend/src/auth/`
- `backend/src/**/*.{test,spec}.ts`
- `frontend/.env.example` または既存の環境設定説明文書
- `docs/requirements/character-sheet.md`
- `docs/out-of-scope.md`

## レビュー観点

- GIS browser-only credential flow が、Google ID token を frontend callback で取得し、backend callback、authorization-code exchange、client secret を必要としないことが明確か。
- JWT がブラウザ永続領域へ残らず、ページ再アクセスごとに GIS 認証をやり直す実装になっているか。
- GitHub Pages のサブパス公開で GIS script、client ID 設定、frontend origin の登録条件を満たせるか。
- desktop と mobile / tablet の認証操作が、明示された位置と既存 control pane の responsive 導線に従うか。
- token verifier が未検証 header や client 入力の user ID を信頼せず、`sub` を公開 response に漏らさないか。
- G4 / G5 の保存 UI / API、未関連 TODO、design draft を混在させていないか。

## 備考

- design target: `docs/design/character-sheet/notes.md`。認証 UI の配置はユーザーの最新指示で定義済みのため、`design-image-generation` はこの Gate の前提条件にしない。
- Visual Review と VRT は UI を変更する本 Gate の PR review 直前に、`/character-sheet/` の desktop / tablet / mobile と認証状態を対象として別途実施する。canonical baseline は更新しない。
- `@react-oauth/google` と `jose` の最終 version は、実装開始前に browser-only credential flow、Google ID token verification、保守状況、security 上の懸念、workspace 互換性を確認して決定する。選定理由はこの issue に記録する。
