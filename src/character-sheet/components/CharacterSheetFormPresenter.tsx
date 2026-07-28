import { characterSheetDictionary } from "../dictionary";
import BondsSection, { type BondsSectionProps } from "./BondsSection";
import BuildSection, { type BuildSectionProps } from "./BuildSection";
import styles from "./CharacterSheetFormPresenter.module.css";
import CharacterSheetSectionFrame from "./CharacterSheetSectionFrame";
import ChecksSection, { type ChecksSectionProps } from "./ChecksSection";
import IkizamaSkillsSection, {
  type IkizamaSkillsSectionProps,
} from "./IkizamaSkillsSection";
import PrimarySkillsSection, {
  type PrimarySkillsSectionProps,
} from "./PrimarySkillsSection";
import ProfileSection, { type ProfileSectionProps } from "./ProfileSection";
import SecondaryAttributesSection, {
  type SecondaryAttributesSectionProps,
} from "./SecondaryAttributesSection";

/**
 * Presentational form shell for the character sheet.
 *
 * Later Gates compose field and section presenters here. State creation,
 * master lookup, browser APIs, and dialog coordination stay in the container.
 */
export type CharacterSheetFormPresenterProps = {
  bondsSection: BondsSectionProps;
  buildSection: BuildSectionProps;
  checksSection: ChecksSectionProps;
  ikizamaSkillsSection: IkizamaSkillsSectionProps;
  primarySkillsSection: PrimarySkillsSectionProps;
  profileSection: ProfileSectionProps;
  secondaryAttributesSection: SecondaryAttributesSectionProps;
};

export default function CharacterSheetFormPresenter({
  bondsSection,
  buildSection,
  checksSection,
  ikizamaSkillsSection,
  primarySkillsSection,
  profileSection,
  secondaryAttributesSection,
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
            headingAs="h2"
            id="build"
            title={characterSheet.sections.build}
          >
            <BuildSection {...buildSection} />
          </CharacterSheetSectionFrame>
        </div>
        <div data-character-sheet-section-slot="secondary">
          <CharacterSheetSectionFrame
            headingAs="h2"
            id="secondary-attributes"
            title={gameDomain.terms.secondaryAttributes}
          >
            <SecondaryAttributesSection {...secondaryAttributesSection} />
          </CharacterSheetSectionFrame>
        </div>
        <CharacterSheetSectionFrame
          expandable
          headingAs="h2"
          id="bonds"
          title={gameDomain.terms.bonds}
        >
          <div data-character-sheet-section-slot="bonds">
            <BondsSection {...bondsSection} />
          </div>
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
          <div data-character-sheet-section-slot="checks">
            <ChecksSection {...checksSection} />
          </div>
        </CharacterSheetSectionFrame>
        <CharacterSheetSectionFrame
          expandable
          headingAs="h2"
          id="skills"
          title={gameDomain.terms.skills}
        >
          <div
            className={styles.skillsSections}
            data-character-sheet-section-slot="skills"
          >
            <PrimarySkillsSection {...primarySkillsSection} />
            <IkizamaSkillsSection {...ikizamaSkillsSection} />
          </div>
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
          id="special-items"
          title={gameDomain.terms.ikizamaSpecialItems}
        >
          <div data-character-sheet-section-slot="special-items" />
        </CharacterSheetSectionFrame>
      </div>
    </form>
  );
}
