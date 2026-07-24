import styles from "./CharacterSheetFormPresenter.module.css";

/**
 * Presentational form shell for the character sheet.
 *
 * Later Gates compose field and section presenters here. State creation,
 * master lookup, browser APIs, and dialog coordination stay in the container.
 */
export default function CharacterSheetFormPresenter() {
  return <form className={styles.form}></form>;
}
