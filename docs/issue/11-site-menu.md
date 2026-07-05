# 11-site-menu

## 目的

PC版で左サイドに常設表示するサイトメニューを実装する。

このタスクでは、既存 `BaseLayout.astro` の左レールプレースホルダーを、再利用可能な `SiteMenu.astro` に置き換え、サイト全体のページ構造を参照できるPC用ナビゲーションを用意する。

このタスクで達成することは以下である。

* サイトメニューのdesignを生成・確認する
* サイトメニュー項目を `src/lib/site/menu.ts` または同等の定義ファイルで管理する
* `SiteMenu.astro` を作成する
* PC版左サイドに `SiteMenu.astro` を常設表示する
* 最大3階層の親子関係と、階層リンクを折りたためることが分かるPC用表示を用意する
* GitHub Pagesのサブパス公開でリンクが壊れないようにする
* 支援技術向けに `nav` / `aria-label` など最低限のアクセシビリティを確保する

## 背景

`docs/plan.md` の Phase 2 では、`11-site-menu` として以下が未完了である。

* designを生成する
* `src/lib/site/menu.ts` 作成
* `SiteMenu.astro` 作成
* PC版で左サイドに常設表示

要件定義では、PCレイアウトは左にサイトメニュー、中央に本文、右にページ内目次を表示する方針である。`768px` 未満ではサイトメニューを常設表示せず、ヘッダーから開閉するUIへ切り替える方針だが、スマホ用開閉メニューは後続の `12-mobile-menu` で扱う。

既存 `BaseLayout.astro` では、左サイドに `構造プレースホルダー` が直接記述されている。このタスクでは、その左レールを実際のサイトメニューComponentへ置き換える。

## 実装前提

このタスクはUI実装タスクであるため、実装前に `design-image-generation` initial draft mode を実行し、サイトメニュー用のdesign draftを作成・確認する。

想定される成果物は以下。

* `docs/design/site-menu/notes.md`
* `docs/design/site-menu/design-desktop.png`

design draft が人間レビューされるまでは、`SiteMenu.astro` の実装に進まない。

remote snapshot上では `docs/design/site-menu/notes.md` を確認できなかったため、ローカル作業時に既存のdesign targetが存在するか確認する。存在しない場合は、このIssue内の最初の作業として `docs/design/site-menu/` を作成する。

## 対象範囲

* `docs/design/site-menu/notes.md` の作成
* `docs/design/site-menu/design-desktop.png` の作成
* `src/lib/site/menu.ts` の作成
* `src/components/layout/SiteMenu.astro` の作成
* `src/layouts/BaseLayout.astro` の左レールを `SiteMenu.astro` へ置き換える
* PC版左サイドメニューの常設表示
* メニュー項目の階層定義
* 最大3階層の階層表示
* 階層を持つ親リンクの折りたたみ affordance
* PC左サイドメニュー内での基本的な階層開閉表示
* 内部リンクのGitHub Pages subpath対応
* `nav` 要素または同等のランドマーク設定
* サイトメニュー用の `aria-label`
* メニュー項目の基本hover / focus表現
* 既存global styles / tokensの範囲内でのCSS実装
* 必要に応じた `siteMeta` / `links` / `paths` 既存utilの利用
* design参照との整合確認

## 初期スコープ外

* スマホ用開閉メニュー
* mobile drawer / overlay
* ヘッダーのメニューボタンに開閉挙動を持たせること
* メニュー項目選択後にdrawerを閉じる挙動
* Escキーでメニューを閉じる挙動
* 現在ページハイライト
* `aria-current="page"` の本実装
* 親カテゴリの自動展開
* 開閉状態の永続化
* ページ内目次
* ページ内目次の現在位置ハイライト
* パンくずリスト
* ページ末尾の前後ナビゲーション
* 検索UI
* 検索結果表示
* Pagefind導入
* 新規ページ骨組みの作成
* `/introduction`、`/world`、`/rules` など未作成ページの本文実装
* Excel変換処理
* JSON生成処理
* データカード表示
* 外部UIライブラリ追加
* 高度なアニメーション
* DB、認証、SSR、CMS、APIサーバーの追加
* キャラクターシート、ダイスローラー、戦闘シミュレーター等のツール導線

## 完了条件

* [ ] `docs/design/site-menu/notes.md` が作成されている
* [ ] `docs/design/site-menu/design-desktop.png` または同等のdesktop design画像が作成されている
* [ ] design targetが `site-menu` として記録されている
* [ ] design draftが人間レビュー可能な状態になっている
* [ ] designにスマホdrawer、ページ内目次、現在地ハイライトなど後続タスクの機能を描き込んでいない
* [ ] `src/lib/site/menu.ts` または同等のサイトメニュー定義ファイルが作成されている
* [ ] `src/components/layout/SiteMenu.astro` が作成されている
* [ ] `BaseLayout.astro` の左レールプレースホルダーが `SiteMenu.astro` に置き換えられている
* [ ] PC版で左サイドにサイトメニューが常設表示される
* [ ] 最大3階層の親子関係が視覚的に分かる
* [ ] 階層を持つ親リンクは、リンクでありつつ折りたたみ可能であることが分かる
* [ ] 折りたたみ affordance は、現在ページハイライトや選択状態と混同しない
* [ ] サイトメニューは `nav` 要素または同等のランドマークを持つ
* [ ] サイトメニューに適切な `aria-label` が設定されている
* [ ] 内部リンクがGitHub Pagesのサブパス公開で壊れない
* [ ] メニュー定義はComponent内に過剰にベタ書きされず、後続更新しやすい形になっている
* [ ] menu dataは後続の `12-mobile-menu` から再利用可能な構造になっている
* [ ] menu dataは後続の `15-current-menu-highlight` で現在地判定を追加しやすい構造になっている
* [ ] hover / focus 表現が色だけに依存しすぎていない
* [ ] スマホ用drawer開閉挙動を実装していない
* [ ] 現在ページハイライトを実装していない
* [ ] PageTocを実装していない
* [ ] パンくずリスト、前後ナビゲーションを実装していない
* [ ] 不要な依存関係を追加していない
* [ ] `npm run build` が通る
* [ ] 必要に応じて `npm run check` が通る

## チェックポイント

* [ ] 既存ルート `/` が壊れていない
* [ ] 既存 `Header.astro` / `Footer.astro` と視覚的に競合していない
* [ ] `BaseLayout.astro` の中央本文領域が狭くなりすぎていない
* [ ] GitHub Pagesのサブパス公開に影響しない
* [ ] `withBase()` または既存の内部リンク方針に従っている
* [ ] `src/lib/site/menu.ts` が後続ページ追加時に更新しやすい
* [ ] 最大3階層の表示に耐えるmenu data構造になっている
* [ ] 階層開閉の見た目が `docs/design/site-menu/` の方針と矛盾していない
* [ ] 未作成ページへのリンク表示方針がレビュー可能な形で明示されている
* [ ] `12-mobile-menu` で再利用できるmenu dataになっている
* [ ] `15-current-menu-highlight` で現在地判定を追加できる余地がある
* [ ] 関連する `docs/TODO.md` 項目と矛盾していない
* [ ] 関連する `docs/design/site-menu/` と矛盾していない
* [ ] 初期スコープ外の機能を実装していない
* [ ] ユーザーの未コミット変更を破壊していない

## 想定変更ファイル

* `docs/design/site-menu/notes.md`
* `docs/design/site-menu/design-desktop.png`
* `src/lib/site/menu.ts`
* `src/components/layout/SiteMenu.astro`
* `src/layouts/BaseLayout.astro`
* 必要に応じて `src/lib/utils/paths.ts`
* 必要に応じて `docs/issue/11-site-menu.md`

## design参照

* `docs/design/base-layout/`

  * 左レールプレースホルダー、白寄り本文面、暗めHeader / Footer、控えめな青緑accent方針を参照する
* `docs/design/header-footer/`

  * Header / Footer実装後の共通Layout方向性を参照する
* `docs/design/site-menu/`

  * このタスクの直接参照target
  * `notes.md` と `design-desktop.png` をinitial draftとして作成済み
  * 人間レビュー後に実装参照として扱う

## 実装メモ

### メニュー定義

`src/lib/site/menu.ts` は、後続タスクで再利用しやすいよう、表示ラベル、href、階層、必要に応じた補助説明を持つ配列として定義する。

親カテゴリにも対応する親ページのパスが存在する前提で、親カテゴリは単なるグループ見出しではなくリンクとして扱う。

階層構造は最大3階層を想定する。3階層目の表示は、左の縦線だけに依存せず、インデント、余白、必要に応じた disclosure indicator で親子関係が分かるようにする。

階層を持つ親リンクは、折りたたみ可能であることが分かる見た目にする。現在ページハイライトや選択状態と混同しないよう、chevron / caret / disclosure marker などの控えめな indicator を使う。

例：

```ts id="68g8yq"
export type SiteMenuItem = {
  label: string;
  href?: string;
  children?: SiteMenuItem[];
};
```

ただし、実装時に型を過剰に一般化しない。現時点で必要なのは、静的サイトの基本ページ構造を表示できる程度の定義である。

### 未作成ページへのリンク

`docs/requirements.md` には初期公開ページ構成が定義されているが、Phase 3以降で作成されるページが多い。

このタスクでは、未作成ページへのリンクをどう扱うかを実装前に確認する。

候補：

1. menu dataには全予定ページを定義し、未作成ページもリンクとして表示する
2. menu dataには全予定ページを定義するが、表示は既存ページに限定する
3. 未作成ページも表示するが、視覚的に未実装であることは示さない
4. 未作成ページ表示は後続ページ骨組み作成後に回し、このタスクではmenu構造だけを作る

初期推奨は、menu dataには予定ページ構造を定義しつつ、実際に表示する範囲は人間レビューで確認することである。

## レビュー観点

* `SiteMenu.astro` の責務がPC左サイド常設表示に限定されているか
* `12-mobile-menu` のdrawer実装まで踏み込んでいないか
* `15-current-menu-highlight` の現在地ハイライトまで踏み込んでいないか
* menu dataが後続タスクから再利用しやすいか
* 最大3階層の親子関係が読めるか
* 親カテゴリがリンクとして扱われているか
* 階層リンクの折りたたみ affordance が分かり、現在地表示と混同しないか
* 未作成ページへのリンク方針が妥当か
* 左サイドメニューが本文閲覧を妨げていないか
* `BaseLayout.astro` の構造が過度に複雑化していないか
* GitHub Pagesサブパス公開で内部リンクが壊れないか
* 不要な依存関係が追加されていないか
* design画像がこのIssueの範囲に収まり、後続タスクの機能を混ぜていないか

## 備考

このIssueはremote snapshot draftを元に、ローカルrepository modeで検証した。

ローカル検証結果:

* branch `11-site-menu` を作成済み
* issue file `docs/issue/11-site-menu.md` をローカルで確認済み
* `docs/plan.md` の `11-site-menu` 未完了タスクと一致
* `docs/TODO.md` に、このIssueへ直接取り込む関連TODOはなし
* `src/layouts/BaseLayout.astro` に左レールプレースホルダーが存在することを確認済み
* `src/components/layout/Header.astro` / `src/components/layout/Footer.astro` が存在することを確認済み
* `src/lib/site/links.ts` / `src/lib/site/siteMeta.ts` / `src/lib/utils/paths.ts` が存在することを確認済み
* `docs/design/base-layout/notes.md` / `docs/design/base-layout/design-desktop.png` が存在することを確認済み
* `docs/design/header-footer/notes.md` / desktop / mobile design画像が存在することを確認済み
* `docs/design/site-menu/notes.md` と `docs/design/site-menu/design-desktop.png` はinitial draftとして作成済み
* `npm run check` / `npm run build` は未実行

`docs/design/site-menu/` はinitial draftであり、実装開始前に人間レビューを受ける必要がある。
