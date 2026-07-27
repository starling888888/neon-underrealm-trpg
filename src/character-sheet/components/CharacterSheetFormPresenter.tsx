import { characterSheetDictionary } from "../dictionary";
import BuildSection, { type BuildSectionProps } from "./BuildSection";
import styles from "./CharacterSheetFormPresenter.module.css";
import CharacterSheetSectionFrame from "./CharacterSheetSectionFrame";
import ProfileSection, { type ProfileSectionProps } from "./ProfileSection";
import SecondarySection, {
  type SecondarySectionProps,
} from "./SecondarySection";

/**
 * Presentational form shell for the character sheet.
 *
 * Later Gates compose field and section presenters here. State creation,
 * master lookup, browser APIs, and dialog coordination stay in the container.
 */
export type CharacterSheetFormPresenterProps = {
  buildSection: BuildSectionProps;
  profileSection: ProfileSectionProps;
  secondarySection: SecondarySectionProps;
};

export default function CharacterSheetFormPresenter({
  buildSection,
  profileSection,
  secondarySection,
}: CharacterSheetFormPresenterProps) {
  const { characterSheet, gameDomain } = characterSheetDictionary;

  return (
    <form className={styles.form} data-character-sheet-layout>
      <div
        className={styles.primaryColumn}
        data-character-sheet-layout-region="primary"
      >
        <div data-character-sheet-section-slot="profile">
          <CharacterSheetSectionFrame
            headingAs="h2"
            id="profile"
            title={characterSheet.sections.basicInformation}
          >
            <ProfileSection {...profileSection} />
          </CharacterSheetSectionFrame>
        </div>
        <div data-character-sheet-section-slot="build">
          <CharacterSheetSectionFrame
            allowOverflow
            headingAs="h2"
            id="build"
            title={characterSheet.sections.build}
          >
            <BuildSection {...buildSection} />
          </CharacterSheetSectionFrame>
        </div>
        <div data-character-sheet-section-slot="secondary">
          <SecondarySection {...secondarySection} />
        </div>
        <CharacterSheetSectionFrame
          expandable
          headingAs="h2"
          id="bonds"
          title={gameDomain.terms.bonds}
        >
          <div data-character-sheet-section-slot="bonds" />
        </CharacterSheetSectionFrame>
      </div>
      <div
        className={styles.secondaryColumn}
        data-character-sheet-layout-region="secondary"
      >
        <CharacterSheetSectionFrame
          expandable
          headingAs="h2"
          id="checks"
          title={gameDomain.terms.checks}
        >
          <div data-character-sheet-section-slot="checks" />
        </CharacterSheetSectionFrame>
        <CharacterSheetSectionFrame
          expandable
          headingAs="h2"
          id="weapons-and-armor"
          title={characterSheet.sections.weaponsAndArmor}
        >
          <div data-character-sheet-section-slot="weapons-and-armor" />
        </CharacterSheetSectionFrame>
        <CharacterSheetSectionFrame
          expandable
          headingAs="h2"
          id="skills"
          title={gameDomain.terms.skills}
        >
          <div data-character-sheet-section-slot="skills" />
        </CharacterSheetSectionFrame>
        <CharacterSheetSectionFrame
          expandable
          headingAs="h2"
          id="special-items"
          title={gameDomain.terms.ikizamaSpecialItems}
        >
          <div data-character-sheet-section-slot="special-items" />
        </CharacterSheetSectionFrame>
      </div>
    </form>
  );
}
