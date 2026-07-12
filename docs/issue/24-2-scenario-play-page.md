# 24-2-scenario-play-page

## 目的

PL向けのシナリオ進行ルールページ `/rules/scenario-play` を作成し、シーン進行、各シーンの役割、情報収集、小銭、休息、戦闘準備、シナリオ終了後の処理を、既存ルールサイト内で読める形にする。

## 背景

`docs/plan.md` の `24-2-scenario-play-page` は、シナリオ本文ではなく、PLがシーン制の進行ルールを理解するためのページを求めている。

contents入力は `.raw/contents/scenario-play.md` に作成済みであり、ユーザー指示によりv1.0参照資料の内部優先順はGMブック、PL向けルールブック、ルールブックとする。V1.5修正整理はこのページでは参照しない。小銭はシナリオ開始時に確定し、シナリオ中に増えない。経験点・信用の獲得は成長ページで扱うため、このページには掲載しない。

関連する参照先は以下。

- `docs/requirements.md`
- `docs/requirements/pages.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `.raw/contents/scenario-play.md`
- `docs/design/rules/`
- `docs/design/callout/`
- `docs/design/site-layout/`
- `docs/design/page-toc/`
- `docs/design/mobile-page-toc/`

## 対象範囲

- ユーザー提供の `public/images/scenario-play/hero.webp` を、H1直後のhero画像として利用する。altは「路地裏で交渉する銀髪の女性とスーツ姿の男性、古い建物から跳び降りるナノマシンで脚を変形させた男性を斜めに分けたイラスト。」とする。
- `/rules/scenario-play.mdx` を作成し、既存のMDX Layout、PageToc、MobilePageToc、SiteMenu、Calloutを利用する。
- `.raw/contents/scenario-play.md` のfrontmatter、本文、HTMLコメントをもとに、PL向けの本文を実装する。
- シナリオ開始前、オープニング、ミドル、情報収集、中間戦闘、休息、クライマックス、エンディング、GMシーンの役割を配置する。
- 情報収集の例を `example` Calloutで示す。仁義による判定変更、目標値+1、精神4から肉体7、得意技能、判定数4から14、情報収集成功を含める。
- 小銭を、シナリオ開始時の所持信用からアイテム・装備に使った信用を引いた値として説明する。非戦闘技能判定後の達成値上昇、消費による減少、シナリオ中に増えないことを明記する。
- クライマックス前の戦闘準備で、現在装備・所持アイテムに使った信用と未使用小銭の範囲で装備を組み換えるルールを説明する。
- キャラクターロストの確認と縁の清算を、シナリオ終了後の処理として配置する。戦闘での死亡と縁を覚悟にする処理の詳細は戦闘ルールへ寄せ、外道堕ちはワールドガイドの外道節へリンクする。
- 完成画面をdesktop / mobileでVisual Reviewする。ユーザー指示により、`design-image-generation` のinitial draftは作成しない。

## 初期スコープ外

- 公式・サンプルを含むシナリオ本文、個別ハンドアウト本文、キャンペーン本文を掲載しない。
- GM向けのシナリオ作成支援、エネミー運用指針、裁定ガイドを実装しない。
- 経験点・信用の獲得や覚悟の累積を掲載しない。成長ページの責務として残す。
- 攻撃、リアクション、コンボ、掛け合いなどの戦闘手順を再掲しない。`/rules/battle` へ導線を置く。
- 基本判定、得意技能の一般則、目標値、対抗判定を再掲しない。`/rules` へ導線を置く。
- ダイスローラー、判定・小銭・報酬の自動計算、戦闘支援、シナリオ管理機能を作らない。
- hero画像の生成、仮画像、画像生成promptを作らない。ユーザー提供画像以外で代用しない。
- `docs/design/scenario-play/` のinitial design draftを作成しない。
- 新規npm package、Excel / JSON変換、検索、CMS、DB、認証、SSR、APIを追加しない。
- 初期スコープ外の項目は `docs/out-of-scope.md` に従う。

## 完了条件

- [x] ユーザー提供hero画像 `public/images/scenario-play/hero.webp` をH1直後に表示し、指定alt、`loading="eager"`、captionなし、ページ側の追加overlayなしを守っている
- [x] `/rules/scenario-play.mdx` を作成し、既存のMDX Layoutと共通Componentを利用している
- [x] `.raw/contents/scenario-play.md` の本文・HTMLコメントと矛盾しない
- [x] シーン進行と、開始前、オープニング、ミドル、情報収集、中間戦闘、休息、クライマックス、エンディング、GMシーンの役割を掲載している
- [x] ミドルシーンが情報収集、中間戦闘、休息を必要回数組み合わせて進むことを掲載している
- [x] 情報収集が、そのシーンに登場している各PCにつき1シーン1回の判定で、PCが判定する順番を自由に選べ、達成値によって得られる情報が変わりうることを掲載している
- [x] 休息が戦闘後に少なくとも1回行われ、登場PCの体力・精神力を最大まで回復し、消耗品は回復しないことを掲載している
- [x] GMシーンでPLが得た情報とPCが知る情報を区別することを掲載している
- [x] 自身のPCが登場したシーンでは、同じシーンに登場したキャラクター1人と毎シーン必ず縁を結び、1シーンで結べる縁は1つであることを掲載している
- [x] シーン中の縁が最大4つであり、入れ替え、エンディングシーンと自PCだけのシーンの例外を掲載している
- [x] 情報収集の`example` Calloutに、仁義への技能変更と判定数4から14の例を掲載している
- [x] 小銭を、初期作成時の所持信用10からアイテム・装備に使った信用を引いてシナリオ開始時に確定することを掲載している
- [x] 小銭が非戦闘技能判定後にだけ使え、消費分だけ達成値を上げ、判定数・効果値は変えず、戦闘判定には使えないことを掲載している
- [x] 小銭がシナリオ中に増えず、使った分だけ減り、所持信用やアイテム状態から再計算しないことを掲載している
- [x] 戦闘準備の装備組み換えが、現在装備・所持アイテムに使った信用と未使用小銭の範囲に制限されている
- [x] 戦闘準備で、使用済みまたは効果適用済みのシナリオ回数制アイテムを変更できないことを掲載している
- [x] シナリオ終了後のキャラクターロスト確認で、死亡、すべての縁を覚悟にして足を洗うこと、死亡したPCの魂魄を得て外道堕ちを選ぶことの3条件を掲載し、死亡・覚悟の詳細を戦闘ルールへ寄せ、外道堕ちをワールドガイドの外道節へリンクしている
- [x] シナリオ終了後の縁の清算で、縁を1つ残し、次のシナリオで再び縁を結べることを掲載している
- [x] 経験点・信用の獲得と覚悟の累積を掲載していない
- [x] Visual Reviewの結果を、ユーザー確認なしにdesign正本へコピーしていない
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## チェックポイント

- [x] 提供hero画像の右下に焼き込まれたゲームロゴをページ側で重ねて表示せず、隠蔽もしていない
- [x] `/rules`、`/rules/battle`、`/advancement` への内部リンクがGitHub Pagesのサブパス公開で壊れない
- [x] PageTocとMobilePageTocへ不要なCallout titleを見出しとして含めていない
- [x] desktop / mobileで本文、hero、Calloutに横overflowや可読性の低下がない
- [x] 既存ルート、SiteMenu、PageToc、MobilePageToc、共通Calloutを壊していない
- [x] 不要な依存関係を追加していない
- [x] シナリオ本文、ハンドアウト本文、キャンペーン本文、GMガイドを混入させていない
- [x] 経験点・信用獲得をこのページへ戻していない
- [x] 関連する `docs/TODO.md` 項目と矛盾していない
- [x] `docs/design/rules/`、`docs/design/callout/`、`docs/design/site-layout/`、`docs/design/page-toc/`、`docs/design/mobile-page-toc/` の共通design制約と矛盾していない
- [x] ユーザーの未コミット変更を破壊していない

## 想定変更ファイル

- `public/images/scenario-play/hero.webp`
- `src/pages/rules/scenario-play.mdx`
- `tests/visual/` 配下のscenario-play用Visual Review test
- `docs/issue/24-2-scenario-play-page.md`

## レビュー観点

- PL向けのシナリオ進行ルールに範囲を限定できており、シナリオ本文、ハンドアウト本文、キャンペーン本文、GMガイドを混入させていないか。
- シーン進行と各シーンの役割、小銭、戦闘準備、シナリオ終了後の処理が、contents本文どおりに漏れなく配置されるか。
- 経験点・信用の獲得を成長ページの責務として外せているか。
- 提供hero画像を、既存layout、PageToc、Calloutの正本と整合する形で表示できるか。

## 備考

関連TODOに、このページで回収する項目はない。サイトメニュー順序を既存designへ一括反映するTODOは横断的なdesign更新であり、本issueでは扱わない。

`.raw/contents/scenario-play.md` はGit管理外の作業入力である。Google Driveへの同期は `raw-to-drive-sync` の明示指示があるまで行わない。

contents本文ではPC間の信用融通を扱わない。contents reviewの一時記録は `.tmp/review/24-2-scenario-play-page/` に保持するが、issueの正本要件にはしない。

ユーザー指示により、`design-image-generation`のinitial draftは不要とする。Visual Reviewのactual screenshotは実装結果であり、ユーザー確認なしにdesign正本へ転記しない。
