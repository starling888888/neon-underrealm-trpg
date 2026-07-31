import { memo, useMemo } from "react";
import { characterSheetDictionary } from "../dictionary";
import BondsSection, { type BondsSectionProps } from "./BondsSection";
import BuildSection, { type BuildSectionProps } from "./BuildSection";
import styles from "./CharacterSheetFormPresenter.module.css";
import CharacterSheetSectionFrame from "./CharacterSheetSectionFrame";
import ChecksSection, { type ChecksSectionProps } from "./ChecksSection";
import CommonSkillsSection, {
  type CommonSkillsSectionProps,
} from "./CommonSkillsSection";
import CyberneticsSection, {
  type CyberneticsSectionProps,
} from "./CyberneticsSection";
import DrugsSection, { type DrugsSectionProps } from "./DrugsSection";
import IkizamaSkillsSection, {
  type IkizamaSkillsSectionProps,
} from "./IkizamaSkillsSection";
import NanomachinesSection, {
  type NanomachinesSectionProps,
} from "./NanomachinesSection";
import OmamoriSection, { type OmamoriSectionProps } from "./OmamoriSection";
import OtherRyugiSkillsSection, {
  type OtherRyugiSkillsSectionProps,
} from "./OtherRyugiSkillsSection";
import PrimarySkillsSection, {
  type PrimarySkillsSectionProps,
} from "./PrimarySkillsSection";
import ProfileSection, { type ProfileSectionProps } from "./ProfileSection";
import SecondaryAttributesSection, {
  type SecondaryAttributesSectionProps,
} from "./SecondaryAttributesSection";
import SpecialItemsSection, {
  type SpecialItemsSectionProps,
} from "./SpecialItemsSection";
import WeaponsAndArmorSection, {
  type WeaponsAndArmorSectionProps,
} from "./WeaponsAndArmorSection";

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
  commonSkillsSection: CommonSkillsSectionProps;
  cyberneticsSection: CyberneticsSectionProps;
  drugsSection: DrugsSectionProps;
  ikizamaSkillsSection: IkizamaSkillsSectionProps;
  nanomachinesSection: NanomachinesSectionProps;
  otherRyugiSkillsSection: OtherRyugiSkillsSectionProps;
  omamoriSection: OmamoriSectionProps;
  primarySkillsSection: PrimarySkillsSectionProps;
  profileSection: ProfileSectionProps;
  secondaryAttributesSection: SecondaryAttributesSectionProps;
  specialItemsSection: SpecialItemsSectionProps;
  weaponsAndArmorSection: WeaponsAndArmorSectionProps;
};

function CharacterSheetFormPresenter({
  bondsSection,
  buildSection,
  checksSection,
  commonSkillsSection,
  cyberneticsSection,
  drugsSection,
  ikizamaSkillsSection,
  nanomachinesSection,
  otherRyugiSkillsSection,
  omamoriSection,
  primarySkillsSection,
  profileSection,
  secondaryAttributesSection,
  specialItemsSection,
  weaponsAndArmorSection,
}: CharacterSheetFormPresenterProps) {
  const { characterSheet, gameDomain } = characterSheetDictionary;
  const specialItemCategories = useMemo(
    () => ({
      cybernetics: <CyberneticsSection {...cyberneticsSection} />,
      drugs: <DrugsSection {...drugsSection} />,
      nanomachines: <NanomachinesSection {...nanomachinesSection} />,
      omamori: <OmamoriSection {...omamoriSection} />,
    }),
    [cyberneticsSection, drugsSection, nanomachinesSection, omamoriSection],
  );

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
          title={gameDomain.terms.bonds.name}
        >
          <div data-character-sheet-section-slot="bonds">
            <BondsSection {...bondsSection} />
          </div>
        </CharacterSheetSectionFrame>
        <CharacterSheetSectionFrame
          expandable
          headingAs="h2"
          id="checks"
          title={gameDomain.terms.checks.name}
        >
          <div data-character-sheet-section-slot="checks">
            <ChecksSection {...checksSection} />
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
          id="skills"
          title={gameDomain.terms.skills}
        >
          <div
            className={styles.skillsSections}
            data-character-sheet-section-slot="skills"
          >
            <PrimarySkillsSection {...primarySkillsSection} />
            <IkizamaSkillsSection {...ikizamaSkillsSection} />
            <CommonSkillsSection {...commonSkillsSection} />
            <OtherRyugiSkillsSection {...otherRyugiSkillsSection} />
          </div>
        </CharacterSheetSectionFrame>
        <CharacterSheetSectionFrame
          expandable
          headingAs="h2"
          id="weapons-and-armor"
          title={characterSheet.sections.weaponsAndArmor}
        >
          <div data-character-sheet-section-slot="weapons-and-armor">
            <WeaponsAndArmorSection {...weaponsAndArmorSection} />
          </div>
        </CharacterSheetSectionFrame>
        <CharacterSheetSectionFrame
          expandable
          headingAs="h2"
          id="special-items"
          title={gameDomain.terms.ikizamaSpecialItems}
        >
          <div
            className={styles.specialItemSections}
            data-character-sheet-section-slot="special-items"
          >
            <SpecialItemsSection
              {...specialItemsSection}
              categories={specialItemCategories}
            />
          </div>
        </CharacterSheetSectionFrame>
      </div>
    </form>
  );
}

export default memo(CharacterSheetFormPresenter);
