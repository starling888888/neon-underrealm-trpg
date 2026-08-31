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
              「基本情報」でPC名などを入力します。キャラクター画像も設定できます。
            </li>
            <li>
              「流儀・生き様 /
              能力値」で、ルールに従ってプライマリ流儀、生き様、能力値を決定します。
              <strong>消費経験点</strong>
              は自動算出されます。
            </li>
            <li>
              「<strong>スキル</strong>
              」を選択します。その時選択しているプライマリ流儀、生き様とレベルに応じた、選択可能なスキルだけが候補に表示されます。
            </li>
            <li>
              「<strong>武器・防具</strong>」「
              <strong>生き様専用アイテム</strong>
              」を候補から選びます。「生き様専用アイテム」は、生き様に対応するもののみがデフォルトで表示されますが、他の生き様の専用アイテムも追加できます。アイテムやスキルの効果で他の生き様の専用アイテムが使用できる場合は追加してください。
              <strong>消費信用</strong>
              は自動算出されます。
            </li>
            <li>
              「判定」で、主に使う攻撃の技能・使用能力値、リアクションの使用能力値、攻撃・リアクションの判定修正を入力します。非戦闘技能はチェックボックスにチェックを入れると
              <strong>得意技能</strong>
              となります。シナリオ中に必要となる判定数は自動算出されます。
            </li>
            <li>
              エラーがある場合、デスクトップでは画面上部の「確認」ボタン、スマホ・タブレットでは画面右下のメニューボタンが赤くなります。操作するとエラーの詳細を確認できます。また、エラーがあるセクションは赤く強調されます。内容を確認し、該当する入力を修正してください。
            </li>
          </ol>
          <p className={styles.notice}>
            <strong>注意：</strong>
            エラーがなくキャラクターが作成できたとしても、ルールや効果に矛盾しないとは限りません。ルール本文とスキル・アイテムの効果本文に従ってキャラクターを作成してください。
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
            」を押すと、そのセクションの入力行が増えます。キャラクターシート上で増やした入力欄の数だけ実際に使用できるとは限りません。使用できる数はルールに従ってください。
          </p>
          <p>
            スキル、武器・防具、専用アイテムは、行の右側の
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
            のように色と枠で囲まれた値は、流儀や生き様に応じて自動で決まる値や、入力した修正値をもとに自動計算された値です。
          </p>
          <p>
            スキル、アイテム、共通ボーナスの効果は自動では反映されません。対応する入力欄へ修正値を入力してください。
          </p>
          <p className={styles.example}>
            <em>例：</em>
            ケンカヤの共通スキルボーナス「攻撃の判定数+1、攻撃力+3」は、「判定」の攻撃の修正と、武器の攻撃力にそれぞれ修正値を入力します。
          </p>
        </section>

        <section className={styles.section}>
          <h3>キャラクターの保存、編集、削除</h3>
          <p>
            Googleでログインすると、キャラクターを保存したり、自分が保存したキャラクターを編集したりできます。
          </p>
          <p>
            他人が登録したキャラクターも閲覧することができますが、更新や削除ができるのは自分が登録したキャラクターのみです。
          </p>
          <p>
            ログインしなくても1キャラクターだけブラウザに下書きを持つことができます。
          </p>

          <section className={styles.section}>
            <h4>下書き機能</h4>
            <p>
              「<strong>下書き</strong>
              」はログイン不要で使えます。まだ保存していないキャラクターはブラウザに自動保存されます。
            </p>
            <p>
              ログインの有無によらず、1キャラクターだけ下書きを作れます。複数タブやブラウザで開くと
              <strong>下書きが壊れる</strong>
              ので複数のキャラクターを編集する際は必ず保存してください。
            </p>
            <p>
              「保存」すると下書きは破棄され、以降は保存されたキャラクターの編集に切り替わります。
            </p>
          </section>

          <section className={styles.section}>
            <h4>下書き破棄</h4>
            <p>
              「<strong>下書き破棄</strong>
              」は、ブラウザに保存されている下書きの入力内容と画像を初期状態に戻します。
            </p>
            <p>
              読み込んだキャラクターは下書き状態ではないため、下書き破棄は使えません。
            </p>
          </section>

          <section className={styles.section}>
            <h4>キャラクター一覧</h4>
            <p>
              「<strong>キャラクター一覧</strong>
              」では、登録されたキャラクターとサンプルキャラクターを表示できます。
            </p>
            <p>
              登録キャラクターでは、「
              <strong>自分で登録したキャラクターのみ</strong>
              」に絞り込むこともできます。
            </p>
            <p>
              他の人が「<strong>全員に公開する</strong>
              」をOFFにして保存したキャラクターは表示されません。自分が登録したキャラクターは、公開設定にかかわらずログイン中であれば一覧から確認できます。
            </p>
            <p>
              キャラクター一覧からPC名を選択すると、そのキャラクターへ表示を切り替えます。
            </p>
            <p>
              表示しているキャラクターに未保存の変更がある状態で別のキャラクターへ切り替えた場合、その変更内容は破棄されます。必要な変更は、切り替える前に「
              <strong>保存</strong>」してください。
            </p>
          </section>

          <section className={styles.section}>
            <h4>保存</h4>
            <p>
              「<strong>保存</strong>
              」は、現在のキャラクターを保存します。
            </p>
            <p>
              ブラウザの下書きを保存する場合は、新しいキャラクターとして登録されます。
            </p>
            <p>
              自分の保存済みキャラクターを表示している場合は、現在の内容でそのキャラクターを上書きします。
            </p>
            <p>
              読み込んだキャラクターの変更内容は自動保存されません。ページの再読み込みや別のキャラクターへの切り替えを行う前に、変更を残したい場合は「
              <strong>保存</strong>」してください。
            </p>
            <p>
              保存には<strong>PC名が必須</strong>
              です。保存時のダイアログでPC名を確認・変更できます。
            </p>
            <p>
              「<strong>全員に公開する</strong>
              」をONにすると、ログインしていない人を含め、誰でもそのキャラクターを閲覧できます。OFFにすると、自分がログインしている場合だけ一覧やキャラクターシートから閲覧できます。
            </p>
            <p>
              新しいキャラクターを保存する場合、「全員に公開する」はデフォルトでONです。すでに保存済みのキャラクターを上書きする場合は、現在の公開設定が引き継がれます。
            </p>
          </section>

          <section className={styles.section}>
            <h4>複製</h4>
            <p>
              「<strong>複製</strong>
              」は、現在表示しているキャラクターを元に、自分の新しいキャラクターとして保存します。
            </p>
            <p>
              自分のキャラクターだけでなく、公開されている他の人のキャラクターやサンプルキャラクターも複製できます。
            </p>
            <p>
              複製が完了すると、新しく作成されたキャラクターへ表示が切り替わります。以後は自分の保存済みキャラクターとして編集できます。
            </p>
            <p>
              複製では、PC名を新しく入力する必要があります。PL名は任意です。
            </p>
            <p>
              複製したキャラクターには
              <strong>元のキャラクター画像は保存されません</strong>
              。必要な場合は複製後に画像を設定し、あらためて「保存」を行ってください。
            </p>
            <p>
              複製では「<strong>全員に公開する</strong>
              」はデフォルトでOFFです。必要に応じてONにしてください。
            </p>
          </section>

          <section className={styles.section}>
            <h4>削除</h4>
            <p>
              「<strong>削除</strong>
              」は、現在表示している保存済みキャラクターを削除します。
            </p>
            <p>
              削除後、ブラウザに下書きがある場合は、その内容が表示されます。下書きがない場合は初期状態で表示されます。
            </p>
            <p>削除したデータを元に戻すことはできません。</p>
          </section>
        </section>

        <section className={styles.section}>
          <h3>CCFOLIAコピー</h3>
          <p>
            CCFOLIAでコマを作成する場合は、入力を終えてから「
            <strong>CCFOLIAコピー</strong>
            」を使用します。
          </p>
          <p>コピー後、CCFOLIAの盤面で貼り付けるとコマを作成できます。</p>
          <p>
            作成されるコマには、最大体力、精神力にくわえ、気合や縁、バッドステータスの強度など、ゲーム中に管理する値が最初から登録されます。
          </p>
          <p>
            他の人が登録したキャラクターやサンプルキャラクターを表示している場合でも利用できます。
          </p>
        </section>
      </CharacterSheetDialogContent>
    </CharacterSheetDialog>
  );
}
