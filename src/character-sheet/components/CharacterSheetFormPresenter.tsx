import styles from "./CharacterSheetFormPresenter.module.css";
import CharacterSheetSectionFrame from "./CharacterSheetSectionFrame";

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
        <CharacterSheetSectionFrame headingAs="h2" id="bonds" title="縁">
          <div data-character-sheet-section-slot="bonds" />
        </CharacterSheetSectionFrame>
      </div>
      <div
        className={styles.secondaryColumn}
        data-character-sheet-layout-region="secondary"
      >
        <CharacterSheetSectionFrame headingAs="h2" id="checks" title="判定">
          <div data-character-sheet-section-slot="checks" />
        </CharacterSheetSectionFrame>
        <CharacterSheetSectionFrame
          headingAs="h2"
          id="weapons-and-armor"
          title="武器・防具"
        >
          <div data-character-sheet-section-slot="weapons-and-armor" />
        </CharacterSheetSectionFrame>
        <CharacterSheetSectionFrame headingAs="h2" id="skills" title="スキル">
          <div data-character-sheet-section-slot="skills" />
        </CharacterSheetSectionFrame>
        <CharacterSheetSectionFrame
          headingAs="h2"
          id="special-items"
          title="専用アイテム"
        >
          <div data-character-sheet-section-slot="special-items" />
        </CharacterSheetSectionFrame>
      </div>
    </form>
  );
}
