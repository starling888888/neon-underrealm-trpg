import { useRef, useState } from "react";

import CharacterSheetFormPresenter from "./components/CharacterSheetFormPresenter";
import CharacterSheetLoadingOverlay from "./components/CharacterSheetLoadingOverlay";
import CharacterImageErrorDialog from "./components/dialogs/CharacterImageErrorDialog";
import IkizamaSkillPickerDialog from "./components/dialogs/IkizamaSkillPickerDialog";
import PrimaryRyugiChangeConfirmDialog from "./components/dialogs/PrimaryRyugiChangeConfirmDialog";
import PrimarySkillPickerDialog from "./components/dialogs/PrimarySkillPickerDialog";
import { characterSheetDictionary } from "./dictionary";
import useCharacterSheetFormPresenterProps from "./form/useCharacterSheetFormPresenterProps";
import useCharacterSheetRootState from "./useCharacterSheetRootState";

/**
 * React Island root and orchestration boundary for the character sheet.
 *
 * It owns form state and cross-cutting UI state. Form layout belongs to the
 * presenter; dialogs that need root-level coordination are added as direct
 * siblings of that presenter in later Gates.
 */
export default function CharacterSheetContainer() {
  const rootState = useCharacterSheetRootState();
  const [primarySkillPickerRowId, setPrimarySkillPickerRowId] = useState<
    string | null
  >(null);
  const [ikizamaSkillPickerRowId, setIkizamaSkillPickerRowId] = useState<
    string | null
  >(null);
  const [isPrimaryRyugiChangeConfirmOpen, setIsPrimaryRyugiChangeConfirmOpen] =
    useState(false);
  const [isIkizamaChangeConfirmOpen, setIsIkizamaChangeConfirmOpen] =
    useState(false);
  const primarySkillPickerTriggerRef = useRef<HTMLButtonElement>(null);
  const ikizamaSkillPickerTriggerRef = useRef<HTMLButtonElement>(null);
  const primaryRyugiChangeTriggerRef = useRef<HTMLSelectElement>(null);
  const ikizamaChangeTriggerRef = useRef<HTMLSelectElement>(null);
  const pendingPrimaryRyugiChangeRef = useRef<(() => void) | null>(null);
  const pendingIkizamaChangeRef = useRef<(() => void) | null>(null);
  const presenterProps = useCharacterSheetFormPresenterProps(
    rootState.form,
    {
      characterImage: rootState.characterImage,
      isRootOperationInProgress: rootState.isRootOperationInProgress,
      onCharacterImageCleared: rootState.onCharacterImageCleared,
      onCharacterImageSelected: rootState.onCharacterImageSelected,
      onCharacterImageOperationStarted:
        rootState.onCharacterImageOperationStarted,
    },
    {
      onIkizamaChangeRequested: (ikizamaId, trigger, applyChange) => {
        const currentIkizamaId = rootState.form.getValues("build.ikizamaId");
        const hasSelectedSkill = rootState.form
          .getValues("ikizamaSkills.rows")
          .some((row) => row.skillId !== null);

        if (ikizamaId === currentIkizamaId || !hasSelectedSkill) {
          applyChange();
          return;
        }

        ikizamaChangeTriggerRef.current = trigger;
        pendingIkizamaChangeRef.current = applyChange;
        setIsIkizamaChangeConfirmOpen(true);
      },
      onPrimaryRyugiChangeRequested: (primaryRyugiId, trigger, applyChange) => {
        const currentPrimaryRyugiId = rootState.form.getValues(
          "build.primaryRyugiId",
        );
        const hasSelectedSkill = rootState.form
          .getValues("primarySkills.rows")
          .some((row) => row.skillId !== null);

        if (primaryRyugiId === currentPrimaryRyugiId || !hasSelectedSkill) {
          applyChange();
          return;
        }

        primaryRyugiChangeTriggerRef.current = trigger;
        pendingPrimaryRyugiChangeRef.current = applyChange;
        setIsPrimaryRyugiChangeConfirmOpen(true);
      },
      onPrimarySkillPickerRequested: (rowId, trigger) => {
        primarySkillPickerTriggerRef.current = trigger;
        setPrimarySkillPickerRowId(rowId);
      },
      onIkizamaSkillPickerRequested: (rowId, trigger) => {
        ikizamaSkillPickerTriggerRef.current = trigger;
        setIkizamaSkillPickerRowId(rowId);
      },
    },
  );

  function closePrimarySkillPicker(): void {
    setPrimarySkillPickerRowId(null);
  }

  function closeIkizamaSkillPicker(): void {
    setIkizamaSkillPickerRowId(null);
  }

  function confirmPrimaryRyugiChange(): void {
    presenterProps.primarySkillPicker.clearSelection();
    pendingPrimaryRyugiChangeRef.current?.();
    pendingPrimaryRyugiChangeRef.current = null;
    setIsPrimaryRyugiChangeConfirmOpen(false);
  }

  function closePrimaryRyugiChangeConfirm(): void {
    pendingPrimaryRyugiChangeRef.current = null;
    setIsPrimaryRyugiChangeConfirmOpen(false);
  }

  function confirmIkizamaChange(): void {
    presenterProps.ikizamaSkillPicker.clearSelection();
    pendingIkizamaChangeRef.current?.();
    pendingIkizamaChangeRef.current = null;
    setIsIkizamaChangeConfirmOpen(false);
  }

  function closeIkizamaChangeConfirm(): void {
    pendingIkizamaChangeRef.current = null;
    setIsIkizamaChangeConfirmOpen(false);
  }
  return (
    <>
      <div
        aria-busy={rootState.isRootOperationInProgress}
        inert={rootState.isRootOperationInProgress || undefined}
      >
        <CharacterSheetFormPresenter {...presenterProps} />
        <CharacterImageErrorDialog
          closeButtonRef={rootState.imageErrorCloseButtonRef}
          errorCode={rootState.imageError?.code ?? null}
          onRequestClose={() => rootState.setImageError(null)}
          returnFocusRef={rootState.imageReturnFocusRef}
        />
        <PrimarySkillPickerDialog
          groups={presenterProps.primarySkillPicker.candidateGroups}
          isOpen={primarySkillPickerRowId !== null}
          onRequestClose={closePrimarySkillPicker}
          onSelect={(skillId) => {
            if (primarySkillPickerRowId !== null) {
              presenterProps.primarySkillPicker.onSelect(
                primarySkillPickerRowId,
                skillId,
              );
            }
            closePrimarySkillPicker();
          }}
          returnFocusRef={primarySkillPickerTriggerRef}
          selectedSkillIds={presenterProps.primarySkillsSection.rows.flatMap(
            (row) => (row.skillId === null ? [] : [row.skillId]),
          )}
        />
        <IkizamaSkillPickerDialog
          groups={presenterProps.ikizamaSkillPicker.candidateGroups}
          isOpen={ikizamaSkillPickerRowId !== null}
          onRequestClose={closeIkizamaSkillPicker}
          onSelect={(skillId) => {
            if (ikizamaSkillPickerRowId !== null) {
              presenterProps.ikizamaSkillPicker.onSelect(
                ikizamaSkillPickerRowId,
                skillId,
              );
            }
            closeIkizamaSkillPicker();
          }}
          returnFocusRef={ikizamaSkillPickerTriggerRef}
        />
        <PrimaryRyugiChangeConfirmDialog
          confirmation={
            characterSheetDictionary.characterSheet.skills
              .primaryRyugiChangeConfirmation
          }
          dialogLabel={
            characterSheetDictionary.characterSheet.skills
              .primaryRyugiChangeConfirmationLabel
          }
          isOpen={isPrimaryRyugiChangeConfirmOpen}
          onConfirm={confirmPrimaryRyugiChange}
          onRequestClose={closePrimaryRyugiChangeConfirm}
          returnFocusRef={primaryRyugiChangeTriggerRef}
        />
        <PrimaryRyugiChangeConfirmDialog
          confirmation={
            characterSheetDictionary.characterSheet.skills
              .ikizamaChangeConfirmation
          }
          dialogLabel={
            characterSheetDictionary.characterSheet.skills
              .ikizamaChangeConfirmationLabel
          }
          isOpen={isIkizamaChangeConfirmOpen}
          onConfirm={confirmIkizamaChange}
          onRequestClose={closeIkizamaChangeConfirm}
          returnFocusRef={ikizamaChangeTriggerRef}
        />
      </div>
      <CharacterSheetLoadingOverlay
        isOpen={rootState.isRootOperationInProgress}
        label={rootState.rootOperation?.label ?? ""}
      />
    </>
  );
}
