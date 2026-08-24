import { useId, useRef } from "react";

import { characterSheetDictionary } from "../../../dictionary";
import CharacterSheetDialog, {
  CharacterSheetDialogContent,
  CharacterSheetDialogHeader,
} from "../CharacterSheetDialog";
import styles from "./CharacterSheetHelpDialog.module.css";

type Props = {
  isOpen: boolean;
  onRequestClose: () => void;
  returnFocusRef: React.RefObject<HTMLElement | null>;
};

/** Presents character-sheet guidance without changing character data. */
export default function CharacterSheetHelpDialog({
  isOpen,
  onRequestClose,
  returnFocusRef,
}: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const headingId = useId();
  const { actions } = characterSheetDictionary.characterSheet;

  return (
    <CharacterSheetDialog
      ariaLabelledBy={headingId}
      className={styles.dialog}
      initialFocusRef={closeButtonRef}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      returnFocusRef={returnFocusRef}
    >
      <CharacterSheetDialogHeader
        closeButtonRef={closeButtonRef}
        headingId={headingId}
        onRequestClose={onRequestClose}
      >
        {actions.help}
      </CharacterSheetDialogHeader>
      <CharacterSheetDialogContent>
        <section className={styles.section}>
          <h3>キャラクターシートについて</h3>
          <p>
            本キャラクターシートページは、作成したキャラクターの情報を記録・管理するためのものです。流儀、生き様、能力値、スキル、アイテムの選び方や成長のルールは、先に「キャラクターメイキング」と「キャラクター成長」を確認してください。
          </p>
        </section>

        <section className={styles.section}>
          <h3>入力の進め方</h3>
          <ol>
            <li>
              「基本情報」でPC名などを入力します。キャラクター画像も設定可能です。
            </li>
            <li>
              「流儀・生き様 /
              能力値」で、ルールに従ってプライマリ流儀、生き様、能力値の決定を行います。
              <strong>消費経験点</strong>
              は自動算出されます。
            </li>
            <li>
              「<strong>スキル</strong>
              」を選択します。その時選択しているプライマリ流儀、生き様とレベルに応じた選択可能なスキルだけが候補に表示されます。
            </li>
            <li>
              「<strong>武器・防具</strong>」「
              <strong>生き様専用アイテム</strong>
              」を候補から選びます。「生き様専用アイテム」は生き様に対応するもののみがデフォルトで表示されますが、他の生き様の専用アイテムも追加できるようになっています。アイテムやスキルの効果で他の生き様の専用アイテムが使用できる場合は追加してください。
              <strong>消費信用</strong>
              は自動算出されます。
            </li>
            <li>
              「判定」で、主に使う攻撃の技能・使用能力値、リアクションの使用能力値と攻撃・リアクションの判定修正を入力します。非戦闘技能はチェックボックスにチェックを入れると
              <strong>得意技能</strong>
              となります。シナリオ中に必要となる判定数は自動算出されます。
            </li>
            <li>
              エラーがある場合、デスクトップは画面上部の「確認」ボタン、スマホ、タブレットでは画面右下のメニューボタンが赤くなります。操作するとエラーの詳細を確認できます。また、エラーがあるセクションは赤く強調されます。エラーがある場合は確認して該当する入力を修正してください。
            </li>
          </ol>
          <p className={styles.notice}>
            <strong>注意：</strong>
            エラーがなくキャラクターが作成できたとしても、ルールや効果に矛盾しないとは限りません。ルール本文とスキルやアイテムの効果本文に従ってキャラクターを作成してください。
          </p>
        </section>

        <section className={styles.section}>
          <h3>選択・詳細の見方</h3>
          <p>
            「<strong>〜を選択</strong>
            」を押すと候補の一覧が開きます。名称を選ぶと、その項目がキャラクターシートへ反映されます。
          </p>
          <p>
            「<strong>〜を追加</strong>
            」のボタンを押すとそのセクションの入力行が増えます。キャラクターシート上で増やした入力欄の数だけ使えるとは限りません。実際に使える数はルールに従ってください。
          </p>
          <p>
            スキル、武器・防具、専用アイテムは行の右側の
            <span aria-hidden="true" className={styles.detailsIcon}>
              ▸
            </span>
            アイコンを操作すると詳細な効果や制限などを確認できます。
          </p>
        </section>

        <section className={styles.section}>
          <h3>数値と修正</h3>
          <p>
            入力欄に直接記録する値と、選択内容から自動で表示される値があります。
            <span className={styles.calculatedValueExample}>算出値</span>
            のように色と枠で囲まれた値は、流儀や生き様に応じて自動で決まる値や、入力した修正値で自動で計算された値です。
          </p>
          <p>
            スキル、アイテム、共通ボーナスの効果は自動で反映されないので、対応する入力欄に入力してください。
          </p>
          <p className={styles.example}>
            <em>例：</em>
            ケンカヤの共通スキルボーナスの「攻撃の判定数+1、攻撃力+3」は、判定の攻撃の修正と、武器の攻撃力にそれぞれ修正値を入力します。
          </p>
        </section>

        <section className={styles.section}>
          <h3>保存・引き継ぎ</h3>
          <p>
            入力内容は、ブラウザ内に自動保存されます。別の端末へ移したい場合やバックアップを残したい場合は「
            <strong>エクスポート</strong>」を使ってください。
          </p>
          <p>
            「<strong>インポート</strong>
            」で保存されたファイルを読み込むと、現在の入力内容とブラウザに保存されたデータが置き換わります。必要なデータを先にエクスポートしてから読み込んでください。
          </p>
          <p>
            CCFOLIAでコマを作成する場合は、入力を終えてから「
            <strong>CCFOLIAコピー</strong>
            」を使います。コピー後、CCFOLIAの盤面で貼り付けるとコマを作成できます。作成されるコマには、最大体力、精神力にくわえ、気合や縁、バッドステータスの強度などゲーム中管理する値が最初から登録されます。
          </p>
        </section>

        <section className={styles.section}>
          <h3>初期化</h3>
          <p>
            「<strong>初期化</strong>
            」は、入力済みのデータと画像を初期状態に戻します。元に戻せないため、必要な場合は先にエクスポートしてください。
          </p>
        </section>
      </CharacterSheetDialogContent>
    </CharacterSheetDialog>
  );
}
