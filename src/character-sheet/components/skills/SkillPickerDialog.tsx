import { useId, useRef } from "react";

import type { Skill } from "../../../lib/types/skill";
import { characterSheetDictionary } from "../../dictionary";
import { formatDisplayValue } from "../../format-display-value";
import CharacterSheetDialog, {
  CharacterSheetDialogContent,
  CharacterSheetDialogHeader,
} from "../dialogs/CharacterSheetDialog";
import styles from "./SkillPickerDialog.module.css";

export type SkillCandidateGroup = {
  heading?: string;
  id: string;
  skills: readonly Skill[];
};

export type SkillPickerDialogProps = {
  groups: readonly SkillCandidateGroup[];
  isOpen: boolean;
  onRequestClose: () => void;
  onSelect: (skillId: string) => void;
  returnFocusRef: React.RefObject<HTMLElement | null>;
  selectedSkillIds: readonly string[];
  selectionGuide: string;
  title: string;
};

function formatCompactValue(
  value: string | null | undefined,
  separator: string,
) {
  if (value === null || value === undefined || value === "") return "-";

  return value
    .split(separator)
    .map((part, index) => (
      <span key={part}>{index === 0 ? part : `${separator}${part}`}</span>
    ));
}

function CandidateRow({
  onSelect,
  isSelected,
  skill,
}: {
  onSelect: (skillId: string) => void;
  isSelected: boolean;
  skill: Skill;
}) {
  const copy = characterSheetDictionary.gameDomain.terms.skill;

  return (
    <div className={styles.candidate} data-disabled={isSelected || undefined}>
      <div className={styles.firstLine}>
        <button
          disabled={isSelected}
          onClick={() => onSelect(skill.id)}
          type="button"
        >
          {skill.name}
        </button>
        <span>{skill.maxLevel}</span>
        <span>{formatDisplayValue(skill.cost ?? null)}</span>
        <span>{formatCompactValue(skill.usageRestriction, "&")}</span>
      </div>
      <div className={styles.details}>
        <span>
          <strong>{copy.proficiency}：</strong>
          {formatDisplayValue(skill.proficiency ?? null)}
        </span>
        <span>
          <strong>{copy.acquisitionRestriction}：</strong>
          {formatDisplayValue(skill.acquisitionRestriction ?? null)}
        </span>
      </div>
      <p className={styles.effect}>
        <strong>{copy.effect}：</strong>
        {skill.effect}
      </p>
    </div>
  );
}

function CandidateTableHeader() {
  const copy = characterSheetDictionary.gameDomain.terms.skill;

  return (
    <div aria-hidden="true" className={styles.headerRow}>
      <span>{copy.name}</span>
      <span>{copy.maximumLevel}</span>
      <span>{copy.cost}</span>
      <span>{copy.usageRestriction}</span>
    </div>
  );
}

function CandidateGroup({
  heading,
  onSelect,
  selectedSkillIds,
  skills,
}: {
  heading?: string;
  onSelect: (skillId: string) => void;
  selectedSkillIds: ReadonlySet<string>;
  skills: readonly Skill[];
}) {
  if (skills.length === 0) return null;

  return (
    <section className={styles.group}>
      {heading === undefined ? null : <h3>{heading}</h3>}
      <CandidateTableHeader />
      {skills.map((skill) => (
        <CandidateRow
          isSelected={selectedSkillIds.has(skill.id)}
          key={skill.id}
          onSelect={onSelect}
          skill={skill}
        />
      ))}
    </section>
  );
}

/** Controlled candidate picker shared by character-sheet skill categories. */
export default function SkillPickerDialog({
  groups,
  isOpen,
  onRequestClose,
  onSelect,
  returnFocusRef,
  selectionGuide,
  selectedSkillIds,
  title,
}: SkillPickerDialogProps) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const selectedSkillIdSet = new Set(selectedSkillIds);

  return (
    <CharacterSheetDialog
      ariaLabelledBy={titleId}
      className={styles.dialog}
      initialFocusRef={closeButtonRef}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      returnFocusRef={returnFocusRef}
    >
      <CharacterSheetDialogHeader
        closeButtonRef={closeButtonRef}
        headingId={titleId}
        onRequestClose={onRequestClose}
      >
        {title}
      </CharacterSheetDialogHeader>
      <CharacterSheetDialogContent>
        <div className={styles.content}>
          <p className={styles.selectionGuide}>
            <strong>{selectionGuide}</strong>
          </p>
          {groups.map((group) => (
            <CandidateGroup
              heading={group.heading}
              key={group.id}
              onSelect={onSelect}
              selectedSkillIds={selectedSkillIdSet}
              skills={group.skills}
            />
          ))}
        </div>
      </CharacterSheetDialogContent>
    </CharacterSheetDialog>
  );
}
