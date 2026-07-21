# 29-2-ryugi-index-page

## 目的

変換済み流儀データを正として、`/data/ryugi` の一覧ページ、サイトメニューの流儀詳細導線、キャラクターメイキング／成長ページの流儀データ表示を整備する。

流儀名、共通スキルボーナス、基礎能力値、体力増加値、精神力増加値をページ本文へ重複して固定記述せず、`data/generated/ryugi-list.json` とその取得層を参照する。

## 背景

- `docs/plan.md` の `29-2-ryugi-index-page` は、流儀一覧、共通スキルボーナス、詳細ページ導線を定義している。
- `docs/TODO.md` には、生成JSONと取得層を用いたサイトメニューの流儀・生き様リスト表示、および流儀一覧における共通スキルボーナス表示が残っている。
- 最新のユーザー指示により、このissueではサイトメニューの**流儀**一覧も表示する。生き様一覧は `31-2-ikizama-index-page` または別途承認されたタスクまで扱わない。
- `src/pages/character-making.mdx` と `src/pages/advancement.mdx` には、流儀ごとの共通スキルボーナス表と、ケンカヤの基礎能力値・副能力増加値の例が固定記述されている。
- `.raw/contents/ryugi-index.md` は、このタスクのページ本文・表示方針に関する優先資料とする。他の計画、要件、TODO、既存実装と矛盾する場合は、最新ユーザー指示に反しない範囲でcontentsを優先する。
- contentsにある「サイトメニューは別途扱う」という既存コメントは、最新のユーザー指示により、このissueでは流儀一覧表示を扱う方針へ置き換える。

関連資料:

- `.raw/contents/ryugi-index.md`
- `docs/plan.md` の `29-2-ryugi-index-page`
- `docs/TODO.md` の流儀・生き様サイドメニュー、および流儀一覧の共通スキルボーナス
- `docs/conversion/ryugi-index.md`
- `docs/requirements/pages.md`
- `docs/requirements/layout-navigation.md`
- `docs/out-of-scope.md`

## 対象範囲

- `docs/design/ryugi-index/` を新設し、流儀一覧ページと流儀詳細項目が展開されたサイトメニューのdesktop / mobile designを作成する。
- `/data/ryugi/index.astro` を作成し、`.raw/contents/ryugi-index.md` のH1、導入、`流儀データの見方`、`流儀一覧`を表示する。
- contentsの指示に従い、`流儀データの見方`ではケンカヤの`RyugiDataSection`を表示する。流儀一覧は`getRyugiList()`の入力順で表示し、各流儀の`name`、`shortDescription`、共通スキルボーナス、`/data/ryugi/[ryugiId]`への導線を対応付ける。
- 共通スキルボーナスは、プライマリ流儀を選んだキャラクターメイキング時と、共通スキル取得による成長時に確認するデータとして説明する。`level2`、`level5`、`level9`の順序と、各値に含まれる改行を維持する。
- `src/lib/site/menu.ts` を、生成済み流儀リストから`/data/ryugi/[ryugiId]`の子項目を作る構成へ更新する。既存の`流儀`一覧リンクは保持し、PCサイドバーとmobile drawerの両方で詳細ページの現在地・祖先展開が正しく機能するようにする。
- `src/pages/character-making.mdx` の流儀データ固定記述を、取得層またはそれを使う共通表示Componentへ置き換える。対象は共通スキルボーナス表、ケンカヤの基礎能力値例、ケンカヤの体力増加値・精神力増加値例である。例としてケンカヤを選ぶ説明文は残してよいが、流儀由来の数値は生成データを参照する。
- `src/pages/advancement.mdx` の流儀別共通スキルボーナス表を、生成済み流儀データを使う共通表示へ置き換える。
- 既存のデータ取得層と表示Componentを再利用し、必要な最小限の流儀一覧／ボーナス表示ComponentとNode / Visual Testを追加または更新する。
- `.raw/contents/ryugi-index.md` はユーザー編集済み作業入力として保持する。実装と矛盾する箇所が見つかった場合は、contentsを優先し、実装前にユーザーへ確認する。

## 初期スコープ外

- 生き様一覧、サイトメニューの生き様詳細リスト、`31-2-ikizama-index-page`の実装
- 流儀・生き様・スキル・アイテムのExcel変換、schema、生成JSON、ID規則の変更
- 共通スキルボーナスを効果種別などの構造化データへ分解すること
- 検索、絞り込み、ソート、ページネーション、比較・計算UI、キャラクター作成ウィザード
- 流儀詳細ページ、`RyugiDataSection`、`SkillCard`、`CardContainer`、Header、Footer、SiteMenu全体の再設計
- 未追跡または新規の`.webp`を追加・コミットすること。contentsのhero表示指示に使うGit管理済みassetが必要な場合は、別途ユーザー指示を受ける。
- `docs/TODO.md` の流儀・生き様を一括で扱うサイドメニューTODOを、流儀だけの対応で完了扱いにすること

## 完了条件

- [ ] `docs/design/ryugi-index/notes.md`、desktop design、mobile designを作成し、一覧ページと流儀詳細項目を展開したサイトメニューを比較対象として記録している
- [ ] `/data/ryugi` が静的に生成され、contentsのH1、導入、`流儀データの見方`、`流儀一覧`を表示する
- [ ] `流儀データの見方`でケンカヤの`RyugiDataSection`を表示し、流儀一覧では生成データを入力順で表示する
- [ ] 各流儀に、名称、shortDescription、2 / 5 / 9LVの共通スキルボーナス、個別詳細ページへの導線を表示する
- [ ] 共通スキルボーナスの説明が、キャラクターメイキングと成長の文脈、およびプライマリ流儀だけに適用される条件を示す
- [ ] サイトメニューが生成済み流儀データから詳細子項目を表示し、一覧・詳細ページでcurrent / ancestor / initial expanded状態が維持される
- [ ] キャラクターメイキングと成長の流儀データ固定記述を生成データ参照へ置き換え、流儀由来の値を手書きで重複管理しない
- [ ] 関連TODOについて、流儀一覧の共通スキルボーナス対応結果と、生き様サイドメニューが未対応である理由をissueへ記録している
- [ ] `npm run check` が通る
- [ ] `npm run build` が通る

## チェックポイント

- [ ] `getRyugiList()`の入力順、`sourceOrder`、共通スキルボーナスの改行を表示側で変えない
- [ ] `/data/ryugi/[ryugiId]`、メニューの詳細リンク、既存のページ内リンクがGitHub Pagesのサブパス配下で壊れない
- [ ] `/data/ryugi`と詳細ページにおいて、PC / tablet / mobileで長い説明・複数行のボーナス・メニュー階層が横overflowや切り詰めなく読める
- [ ] PCサイドバーとmobile drawerの両方で、流儀詳細ページを開いたときに`データ`と`流儀`の祖先階層が展開される
- [ ] キャラクターメイキングと成長の例は、流儀データ値を生成データから読む一方、計算例としての説明文を失わない
- [ ] 不要な依存関係を追加していない
- [ ] 初期スコープ外の機能を実装していない
- [ ] `docs/design/site-layout/`、`docs/design/ryugi-detail/`、新設する`docs/design/ryugi-index/`との関係を記録し、詳細ページ用designを一覧ページの正本として流用していない
- [ ] ユーザーの未コミット画像ファイルを破壊・stage・commitしていない

## 想定変更ファイル

- `docs/design/ryugi-index/notes.md`
- `docs/design/ryugi-index/design-desktop.png`
- `docs/design/ryugi-index/design-mobile.png`
- `src/pages/data/ryugi/index.astro`
- `src/lib/site/menu.ts`
- `src/pages/character-making.mdx`
- `src/pages/advancement.mdx`
- `src/components/data/` 配下の流儀一覧または共通スキルボーナス表示Component
- `tests/node/site-menu-current.test.ts`
- `tests/visual/` 配下の流儀一覧・サイトメニュー・関連ページ確認

## レビュー観点

- contentsのH1、導入、`流儀データの見方`、流儀一覧の意図を、一覧ページのdesignと実装へ過不足なく反映できるか
- ケンカヤのデータ例を表示する範囲と、流儀一覧で各流儀に表示する情報密度が、流儀詳細ページとの重複を増やしすぎないか
- サイトメニューの流儀詳細子項目が、PC / mobileの既存メニュー階層、現在地表示、読みやすさを損なわないか
- キャラクターメイキングと成長の流儀データを生成データへ集約しても、例示とルール説明が読みづらくならないか
- 生き様サイドメニューを今回の対象外として残すことが妥当か
- hero表示に使うGit管理済みassetがない場合、画像追加を明示承認するか、contentsのhero指示を別途調整するか

## 備考

- issue作成時点では `docs/design/ryugi-index/` が存在しない。UI実装前に `design-image-generation` initial draft modeを実行し、design画像を人間レビューする。
- `.raw/contents/ryugi-index.md` はGit管理外のローカル作業入力である。Drive同期はこのissueの範囲に含めない。
- current working treeにはユーザーの未追跡`.webp`ファイルが存在する。今回のissue作成では変更していない。明示指示がない限り、`.webp`をstage / commitしない。
