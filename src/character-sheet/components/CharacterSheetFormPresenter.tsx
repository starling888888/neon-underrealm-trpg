import styles from "./CharacterSheetFormPresenter.module.css";

/**
 * Presentational form shell for the character sheet.
 *
 * Later Gates compose field and section presenters here. State creation,
 * master lookup, browser APIs, and dialog coordination stay in the container.
 */
export default function CharacterSheetFormPresenter() {
  return (
    <form className={styles.form} data-character-sheet-layout>
      <div
        className={styles.primaryColumn}
        data-character-sheet-layout-region="primary"
      >
        <div data-character-sheet-section-slot="profile" />
        <div data-character-sheet-section-slot="build" />
        <div data-character-sheet-section-slot="secondary" />
        <div data-character-sheet-section-slot="bonds" />
      </div>
      <div
        className={styles.secondaryColumn}
        data-character-sheet-layout-region="secondary"
      >
        <div data-character-sheet-section-slot="checks" />
        <div data-character-sheet-section-slot="weapons-and-armor" />
        <div data-character-sheet-section-slot="skills" />
        <div data-character-sheet-section-slot="special-items" />
      </div>
    </form>
  );
}
