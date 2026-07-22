# 33-2-items-index-page

## 目的

`/data/items` を、アイテムの基本ルールと6種別への導線を示す静的なトップページとして実装する。

## 背景

- `docs/plan.md` の `33-2-items-index-page` は、アイテムトップページの作成を計画している。
- `.raw/contents/items.md` のfrontmatterはページmetadataとして使う。ユーザー更新済みH1以下のMarkdown本文とHTMLコメントは、ページ本文と可視の表示構成の正本である。H1より前の作業履歴コメントは実装指示に含めない。
- 現在の`src/pages/data/items/index.mdx`はサイトメニュー現在地ハイライト確認用のダミーであり、本実装へ置き換える。
- `docs/TODO.md` のダミーMDXページを本実装時に削除または置換するTODOは、このissueで`/data/items`分を回収する。`/data/items/weapons`分は後続の34-2で扱う。
- `docs/design/items/` は未作成である。UI実装前に、`.agents/skills/design-image-generation/SKILL.md` のinitial draft modeで、desktop・mobileのdesign画像を作成して人間レビューを受ける必要がある。実装後のVisual Reviewはactualとdesignを比較する工程であり、design正本の更新には別途ユーザーの明示承認とdesign fix modeが必要である。

関連資料:

- `docs/requirements/pages.md`
- `docs/requirements/assets-seo.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- `.raw/contents/items.md`
- `.agents/skills/design-image-generation/SKILL.md`

## 対象範囲

- `src/pages/data/items/index.mdx`を、`.raw/contents/items.md`のfrontmatter、およびH1以下のMarkdown本文とHTMLコメントに従うページへ置き換える。H1より前の作業履歴コメントは実装指示として採用しない。
- H1直後に、ユーザー提供済みの`public/images/data/items_hero.webp`を表示する。内容は変更せず、公開assetとしてGit管理へ含める。`public/images/data/items/`配下の後続個別ページ用画像は含めない。
- hero画像は装飾画像として扱い、空`alt`を設定する。
- 必要信用、生き様専用アイテム、同一アイテムの効果が原則重複しないこと、および戦闘ルールへの参照を本文どおりに配置する。
- 「アイテムの種類」で、武器、防具、お守り、サイバネ、ナノマシン、ドラッグをこの順の表として表示する。
- 表内で、各種別を`/data/items/`配下の一覧ページへ、お守り・サイバネ・ナノマシン・ドラッグに対応する生き様名を`/data/ikizama/`配下の詳細ページへリンクする。
- `docs/design/items/notes.md`、`docs/design/items/design-desktop.png`、`docs/design/items/design-mobile.png`を、承認済みのdesign-image-generation workflowで用意する。
- `tests/visual/config.ts`へ`/data/items`のrouteを追加し、`tests/visual/items-index.spec.ts`でdesktop・mobileのVisual Review captureを定義する。
- 実装完了後にVisual Reviewを行い、actual screenshotと`docs/design/items/`を比較する。design正本化が必要な場合は、Visual Reviewで候補として記録して停止し、ユーザーの明示承認後にdesign fix modeで扱う。
- `docs/plan.md`と`docs/requirements/pages.md`を、contentsの正本に追従させる。

## 初期スコープ外

- 武器、防具、お守り、サイバネ、ナノマシン、ドラッグの個別一覧ページ、データ変換、Item系Card Component、カード凡例を作成・変更しない。
- 検索、絞り込み、ソート、ページネーション、比較・計算、アイテム選択支援、入力フォーム、保存機能を追加しない。
- 新しいnpm package、CMS、DB、認証、SSR、API、PWA、クライアント状態管理を追加しない。
- Header、Footer、SiteMenu、PageToc、MobilePageTocの設計・実装を変更しない。
- `public/images/data/items_hero.webp`の内容を再生成、加工、置換しない。`public/images/data/items/`配下の後続個別ページ用画像を変更・追加しない。
- `.raw/contents/items.md`をGoogle Driveへ同期しない。

## 完了条件

- [ ] `docs/design/items/`のinitial draftとdesktop・mobile design画像を作成し、人間レビューを受けている。
- [ ] `src/pages/data/items/index.mdx`がcontentsのfrontmatter、およびH1以下のMarkdown本文とHTMLコメントの指示に従っている。H1より前の作業履歴コメントを実装指示として採用していない。
- [ ] H1直後に`public/images/data/items_hero.webp`を表示し、内容を変更せずGit管理へ含めている。
- [ ] hero画像を装飾画像として扱い、空`alt`を設定している。
- [ ] 信用、生き様専用アイテム、同一アイテムの効果の原則非重複、戦闘ルールへの参照をcontentsどおりに表示している。
- [ ] 「アイテムの種類」表が、武器、防具、お守り、サイバネ、ナノマシン、ドラッグの順で表示されている。
- [ ] 各アイテム種別と、ブライ、ケジメ、スミ、ヤクの生き様リンクがcontents指定のrouteへ遷移する。
- [ ] ダミーの`/data/items`ページを本実装へ置き換え、関連TODOの`/data/items`分を解消している。
- [ ] `tests/visual/config.ts`と`tests/visual/items-index.spec.ts`で、desktop・mobileのcaptureを再現可能にしている。
- [ ] desktop・mobileの完成画面をVisual Reviewでdesignと比較している。
- [ ] design正本化が必要な場合は、Visual Reviewへ候補を記録し、ユーザーの明示承認後にdesign fix modeで更新している。
- [ ] `npm run check`と`npm run build`が通る。

## チェックポイント

- [ ] contentsのH1以下の表形式、項目順、本文リンクを、下位のplan、requirements、既存ダミー実装より優先している。H1より前の作業履歴コメントは実装指示として採用していない。
- [ ] `InternalLink`など既存のbase path対応の仕組みを用い、GitHub Pagesのサブパス公開で内部リンクと画像参照が壊れない。
- [ ] 未実装の各種別ページへのリンクを、将来routeとして残し、このissueで新設していない。
- [ ] `docs/TODO.md`のダミーMDXページTODOは`/data/items`分だけを解消し、`/data/items/weapons`分を後続taskへ残している。
- [ ] 不要な依存関係を追加していない。
- [ ] 初期スコープ外の機能を実装していない。
- [ ] 既存の未追跡アイテム画像を破壊していない。

## 想定変更ファイル

- `src/pages/data/items/index.mdx`
- `public/images/data/items_hero.webp`
- `docs/design/items/notes.md`
- `docs/design/items/design-desktop.png`
- `docs/design/items/design-mobile.png`
- `tests/visual/config.ts`
- `tests/visual/items-index.spec.ts`
- `docs/plan.md`
- `docs/requirements/pages.md`
- `docs/issue/33-2-items-index-page.md`

## レビュー観点

- `.raw/contents/items.md`のH1以下に定義された本文、表形式、項目順、アイテム種別・生き様リンクを過不足なく反映できているか。
- hero画像が装飾画像として空`alt`を設定し、本文の理解に必要な情報を画像だけへ置いていないか。
- H1直後のhero画像と、本文・表が既存のsite layoutと整合し、desktop・mobileで読みやすいか。
- `docs/design/items/`のinitial draftがcontentsの可視構成を優先し、カード一覧や検索などの範囲外UIを追加していないか。
- `/data/items`のダミー置換だけに留まり、個別アイテムページや共通ナビゲーションへ変更を広げていないか。
- Visual Review後にdesign正本化が必要か。必要な場合、design fix modeを明示承認するか。
- `docs/TODO.md`のダミーMDX TODOを`/data/items`分だけ完了にしてよいか。

## 備考

- `.raw/contents/items.md`はGit管理外のローカル作業入力である。Google Driveへの書込みは、ユーザーが`raw-to-drive-sync`を明示するまで行わない。
- `public/images/data/items_hero.webp`と`public/images/data/items/`は、作業開始時から未追跡のユーザー変更である。実装時は前者だけを内容を変えずに公開assetとして含め、後者は後続個別ページtaskまで変更しない。
- `npm run check`、`npm run build`、design生成、Visual Reviewは実装後の未検証項目である。
