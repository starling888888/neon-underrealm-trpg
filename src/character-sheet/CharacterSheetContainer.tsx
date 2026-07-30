import { useEffect, useRef, useState } from "react";

import CharacterSheetActionPane from "./components/CharacterSheetActionPane";
import CharacterSheetFormPresenter from "./components/CharacterSheetFormPresenter";
import CharacterSheetLoadingOverlay from "./components/CharacterSheetLoadingOverlay";
import type { CyberneticsPickerTarget } from "./components/CyberneticsSection";
import ArmorPickerDialog from "./components/dialogs/ArmorPickerDialog";
import CharacterImageErrorDialog from "./components/dialogs/CharacterImageErrorDialog";
import CharacterSheetErrorDialog from "./components/dialogs/CharacterSheetErrorDialog";
import CharacterSheetJsonImportConfirmDialog from "./components/dialogs/CharacterSheetJsonImportConfirmDialog";
import CharacterSheetJsonImportErrorDialog from "./components/dialogs/CharacterSheetJsonImportErrorDialog";
import CharacterSheetResetConfirmDialog from "./components/dialogs/CharacterSheetResetConfirmDialog";
import CharacterSheetRestoreErrorDialog from "./components/dialogs/CharacterSheetRestoreErrorDialog";
import CyberneticsPickerDialog from "./components/dialogs/CyberneticsPickerDialog";
import DrugsPickerDialog from "./components/dialogs/DrugsPickerDialog";
import IkizamaSkillPickerDialog from "./components/dialogs/IkizamaSkillPickerDialog";
import NanomachinesPickerDialog from "./components/dialogs/NanomachinesPickerDialog";
import OmamoriPickerDialog from "./components/dialogs/OmamoriPickerDialog";
import OtherRyugiSkillPickerDialog from "./components/dialogs/OtherRyugiSkillPickerDialog";
import PrimarySkillPickerDialog from "./components/dialogs/PrimarySkillPickerDialog";
import SkillSelectionChangeConfirmDialog from "./components/dialogs/SkillSelectionChangeConfirmDialog";
import SpecialItemCategoryRemoveConfirmDialog from "./components/dialogs/SpecialItemCategoryRemoveConfirmDialog";
import WeaponPickerDialog from "./components/dialogs/WeaponPickerDialog";
import type { NanomachinesPickerTarget } from "./components/NanomachinesSection";
import SkillPickerDialog from "./components/skills/SkillPickerDialog";
import { characterSheetDictionary } from "./dictionary";
import useCharacterSheetFormPresenterProps from "./form/useCharacterSheetFormPresenterProps";
import type { SpecialItemCategoryId } from "./form-values";
import { getCyberneticCandidateGroups } from "./master-data/cybernetics";
import { getDrugs } from "./master-data/drugs";
import { getNanomachines } from "./master-data/nanomachines";
import { getOmamori } from "./master-data/omamori";
import {
  getArmors,
  getWeaponCandidateGroups,
} from "./master-data/weapons-and-armor";
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
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isErrorSummaryOpen, setIsErrorSummaryOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [shouldRestoreResetFocus, setShouldRestoreResetFocus] = useState(false);
  const [primarySkillPickerRowId, setPrimarySkillPickerRowId] = useState<
    string | null
  >(null);
  const [ikizamaSkillPickerRowId, setIkizamaSkillPickerRowId] = useState<
    string | null
  >(null);
  const [commonSkillPickerRowId, setCommonSkillPickerRowId] = useState<
    string | null
  >(null);
  const [otherRyugiSkillPickerRowId, setOtherRyugiSkillPickerRowId] = useState<
    string | null
  >(null);
  const [weaponPickerRowId, setWeaponPickerRowId] = useState<string | null>(
    null,
  );
  const [isArmorPickerOpen, setIsArmorPickerOpen] = useState(false);
  const [omamoriPickerRowId, setOmamoriPickerRowId] = useState<string | null>(
    null,
  );
  const [drugsPickerRowId, setDrugsPickerRowId] = useState<string | null>(null);
  const [cyberneticsPickerTarget, setCyberneticsPickerTarget] =
    useState<CyberneticsPickerTarget | null>(null);
  const [nanomachinesPickerTarget, setNanomachinesPickerTarget] =
    useState<NanomachinesPickerTarget | null>(null);
  const [isPrimaryRyugiChangeConfirmOpen, setIsPrimaryRyugiChangeConfirmOpen] =
    useState(false);
  const [isIkizamaChangeConfirmOpen, setIsIkizamaChangeConfirmOpen] =
    useState(false);
  const [isOtherRyugiChangeConfirmOpen, setIsOtherRyugiChangeConfirmOpen] =
    useState(false);
  const [isOtherRyugiRemoveConfirmOpen, setIsOtherRyugiRemoveConfirmOpen] =
    useState(false);
  const [specialItemCategoryToRemove, setSpecialItemCategoryToRemove] =
    useState<SpecialItemCategoryId | null>(null);
  const primarySkillPickerTriggerRef = useRef<HTMLButtonElement>(null);
  const ikizamaSkillPickerTriggerRef = useRef<HTMLButtonElement>(null);
  const commonSkillPickerTriggerRef = useRef<HTMLButtonElement>(null);
  const otherRyugiSkillPickerTriggerRef = useRef<HTMLButtonElement>(null);
  const weaponPickerTriggerRef = useRef<HTMLButtonElement>(null);
  const armorPickerTriggerRef = useRef<HTMLButtonElement>(null);
  const omamoriPickerTriggerRef = useRef<HTMLButtonElement>(null);
  const drugsPickerTriggerRef = useRef<HTMLButtonElement>(null);
  const cyberneticsPickerTriggerRef = useRef<HTMLButtonElement>(null);
  const nanomachinesPickerTriggerRef = useRef<HTMLButtonElement>(null);
  const primaryRyugiChangeTriggerRef = useRef<HTMLSelectElement>(null);
  const ikizamaChangeTriggerRef = useRef<HTMLSelectElement>(null);
  const otherRyugiChangeTriggerRef = useRef<HTMLSelectElement>(null);
  const otherRyugiRemoveTriggerRef = useRef<HTMLButtonElement>(null);
  const otherRyugiAddButtonRef = useRef<HTMLButtonElement>(null);
  const specialItemCategoryRemoveTriggerRef = useRef<HTMLButtonElement>(null);
  const actionMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const errorSummaryCloseButtonRef = useRef<HTMLButtonElement>(null);
  const errorSummaryTriggerRef = useRef<HTMLButtonElement>(null);
  const resetTriggerRef = useRef<HTMLButtonElement>(null);
  const pendingPrimaryRyugiChangeRef = useRef<(() => void) | null>(null);
  const pendingIkizamaChangeRef = useRef<(() => void) | null>(null);
  const pendingOtherRyugiChangeRef = useRef<(() => void) | null>(null);
  const pendingOtherRyugiRemoveRef = useRef<(() => void) | null>(null);
  const pendingSpecialItemCategoryRemoveRef = useRef<(() => void) | null>(null);
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
      formRestoreReturnFocusRef: rootState.formRestoreReturnFocusRef,
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
      onCommonSkillPickerRequested: (rowId, trigger) => {
        commonSkillPickerTriggerRef.current = trigger;
        setCommonSkillPickerRowId(rowId);
      },
      onOtherRyugiChangeRequested: (rowId, ryugiId, trigger, applyChange) => {
        const currentRyugiId = rootState.form
          .getValues("build.otherRyugi")
          .find((row) => row.rowId === rowId)?.ryugiId;
        if (ryugiId === currentRyugiId) {
          applyChange();
          return;
        }

        const hasSelectedSkill = rootState.form
          .getValues("otherRyugiSkills.rows")
          .some((row) => row.ryugiRowId === rowId && row.skillId !== null);
        const clearAndApply = () => {
          presenterProps.otherRyugiSkills.clearSelection(rowId);
          applyChange();
        };

        if (!hasSelectedSkill) {
          clearAndApply();
          return;
        }

        otherRyugiChangeTriggerRef.current = trigger;
        pendingOtherRyugiChangeRef.current = clearAndApply;
        setIsOtherRyugiChangeConfirmOpen(true);
      },
      otherRyugiAddButtonRef,
      onOtherRyugiRemoveRequested: (rowId, trigger, applyChange) => {
        const hasSelectedSkill = rootState.form
          .getValues("otherRyugiSkills.rows")
          .some((row) => row.ryugiRowId === rowId && row.skillId !== null);
        const removeAndApply = () => {
          presenterProps.otherRyugiSkills.removeRows(rowId);
          applyChange();
        };

        if (!hasSelectedSkill) {
          removeAndApply();
          return;
        }

        otherRyugiRemoveTriggerRef.current = trigger;
        pendingOtherRyugiRemoveRef.current = removeAndApply;
        setIsOtherRyugiRemoveConfirmOpen(true);
      },
      onOtherRyugiSkillPickerRequested: (rowId, trigger) => {
        otherRyugiSkillPickerTriggerRef.current = trigger;
        setOtherRyugiSkillPickerRowId(rowId);
      },
      onArmorPickerRequested: (trigger) => {
        armorPickerTriggerRef.current = trigger;
        setIsArmorPickerOpen(true);
      },
      onOmamoriPickerRequested: (rowId, trigger) => {
        omamoriPickerTriggerRef.current = trigger;
        setOmamoriPickerRowId(rowId);
      },
      onDrugsPickerRequested: (rowId, trigger) => {
        drugsPickerTriggerRef.current = trigger;
        setDrugsPickerRowId(rowId);
      },
      onCyberneticsPickerRequested: (target, trigger) => {
        cyberneticsPickerTriggerRef.current = trigger;
        setCyberneticsPickerTarget(target);
      },
      onNanomachinesPickerRequested: (target, trigger) => {
        nanomachinesPickerTriggerRef.current = trigger;
        setNanomachinesPickerTarget(target);
      },
      onWeaponPickerRequested: (rowId, trigger) => {
        weaponPickerTriggerRef.current = trigger;
        setWeaponPickerRowId(rowId);
      },
      onSpecialItemCategoryRemoveRequested: (
        category,
        trigger,
        applyRemoval,
      ) => {
        specialItemCategoryRemoveTriggerRef.current = trigger;
        pendingSpecialItemCategoryRemoveRef.current = applyRemoval;
        setSpecialItemCategoryToRemove(category);
      },
      onSpecialItemCategoryRemoved: (category) => {
        requestAnimationFrame(() => {
          document
            .querySelector<HTMLButtonElement>(
              `[data-special-item-category-add="${category}"]`,
            )
            ?.focus();
        });
      },
    },
  );

  useEffect(() => {
    if (!shouldRestoreResetFocus || rootState.isRootOperationInProgress) return;

    setShouldRestoreResetFocus(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resetTriggerRef.current?.focus());
    });
  }, [rootState.isRootOperationInProgress, shouldRestoreResetFocus]);

  function closeResetConfirm(): void {
    setIsResetConfirmOpen(false);
    setShouldRestoreResetFocus(true);
  }

  useEffect(() => {
    if (!isActionMenuOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent): void {
      if (
        event.key !== "Escape" ||
        document.querySelector("dialog[open]") !== null
      ) {
        return;
      }

      event.preventDefault();
      setIsActionMenuOpen(false);
      requestAnimationFrame(() => actionMenuTriggerRef.current?.focus());
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isActionMenuOpen]);

  function closePrimarySkillPicker(): void {
    setPrimarySkillPickerRowId(null);
  }

  function closeIkizamaSkillPicker(): void {
    setIkizamaSkillPickerRowId(null);
  }

  function closeCommonSkillPicker(): void {
    setCommonSkillPickerRowId(null);
  }

  function closeOtherRyugiSkillPicker(): void {
    setOtherRyugiSkillPickerRowId(null);
  }
  function closeWeaponPicker(): void {
    setWeaponPickerRowId(null);
  }
  function closeArmorPicker(): void {
    setIsArmorPickerOpen(false);
  }
  function closeOmamoriPicker(): void {
    setOmamoriPickerRowId(null);
  }
  function closeDrugsPicker(): void {
    setDrugsPickerRowId(null);
  }
  function closeCyberneticsPicker(): void {
    setCyberneticsPickerTarget(null);
  }
  function closeNanomachinesPicker(): void {
    setNanomachinesPickerTarget(null);
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

  function confirmOtherRyugiChange(): void {
    pendingOtherRyugiChangeRef.current?.();
    pendingOtherRyugiChangeRef.current = null;
    setIsOtherRyugiChangeConfirmOpen(false);
  }

  function closeOtherRyugiChangeConfirm(): void {
    pendingOtherRyugiChangeRef.current = null;
    setIsOtherRyugiChangeConfirmOpen(false);
  }

  function confirmOtherRyugiRemove(): void {
    pendingOtherRyugiRemoveRef.current?.();
    pendingOtherRyugiRemoveRef.current = null;
    otherRyugiRemoveTriggerRef.current = otherRyugiAddButtonRef.current;
    setIsOtherRyugiRemoveConfirmOpen(false);
  }

  function closeOtherRyugiRemoveConfirm(): void {
    pendingOtherRyugiRemoveRef.current = null;
    setIsOtherRyugiRemoveConfirmOpen(false);
  }

  function confirmSpecialItemCategoryRemove(): void {
    pendingSpecialItemCategoryRemoveRef.current?.();
    pendingSpecialItemCategoryRemoveRef.current = null;
    setSpecialItemCategoryToRemove(null);
  }

  function closeSpecialItemCategoryRemoveConfirm(): void {
    pendingSpecialItemCategoryRemoveRef.current = null;
    setSpecialItemCategoryToRemove(null);
  }
  return (
    <>
      <div
        aria-busy={rootState.isRootOperationInProgress}
        inert={rootState.isRootOperationInProgress || undefined}
      >
        <CharacterSheetActionPane
          errorReviewButtonRef={errorSummaryTriggerRef}
          errorSummary={presenterProps.errorSummary}
          isExportDisabled={rootState.isCharacterImageRestoring}
          isImportDisabled={
            rootState.isCharacterImageRestoring ||
            rootState.isRootOperationInProgress
          }
          isResetDisabled={
            rootState.isCharacterImageRestoring ||
            rootState.isRootOperationInProgress
          }
          isMenuOpen={isActionMenuOpen}
          menuTriggerRef={actionMenuTriggerRef}
          onExport={rootState.onJsonExport}
          onImport={rootState.onJsonImportRequested}
          onMenuToggle={() => setIsActionMenuOpen((isOpen) => !isOpen)}
          onReset={(trigger) => {
            resetTriggerRef.current = isActionMenuOpen
              ? actionMenuTriggerRef.current
              : trigger;
            setIsActionMenuOpen(false);
            setIsResetConfirmOpen(true);
          }}
          onReviewErrors={() => setIsErrorSummaryOpen(true)}
        />
        <input
          accept="application/json,.json"
          hidden
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = "";
            if (file !== undefined) {
              void rootState.onJsonImportFileSelected(file);
            }
          }}
          ref={rootState.jsonImportInputRef}
          type="file"
        />
        <CharacterSheetFormPresenter {...presenterProps} />
        <CharacterImageErrorDialog
          closeButtonRef={rootState.imageErrorCloseButtonRef}
          errorCode={rootState.imageError?.code ?? null}
          onRequestClose={() => rootState.setImageError(null)}
          returnFocusRef={
            rootState.isImageErrorFromJsonImport
              ? rootState.jsonImportReturnFocusRef
              : rootState.isImageErrorFromReset
                ? resetTriggerRef
                : rootState.imageReturnFocusRef
          }
        />
        <CharacterSheetRestoreErrorDialog
          confirmButtonRef={rootState.formRestoreConfirmButtonRef}
          isOpen={rootState.isFormRestoreErrorOpen}
          onRequestClose={() => rootState.setIsFormRestoreErrorOpen(false)}
          returnFocusRef={rootState.formRestoreReturnFocusRef}
        />
        <CharacterSheetJsonImportConfirmDialog
          isOpen={rootState.pendingJsonImport != null}
          onConfirm={() => void rootState.onJsonImportConfirmed()}
          onRequestClose={() => rootState.setPendingJsonImport(null)}
          returnFocusRef={rootState.jsonImportReturnFocusRef}
        />
        <CharacterSheetResetConfirmDialog
          isOpen={isResetConfirmOpen}
          onConfirm={() => {
            closeResetConfirm();
            void rootState.onResetConfirmed();
          }}
          onRequestClose={closeResetConfirm}
          returnFocusRef={resetTriggerRef}
        />
        <CharacterSheetJsonImportErrorDialog
          confirmButtonRef={rootState.jsonImportErrorConfirmButtonRef}
          dialogLabel={
            characterSheetDictionary.characterSheet.jsonImport.errorLabel
          }
          isOpen={rootState.isJsonImportErrorOpen}
          message={characterSheetDictionary.characterSheet.jsonImport.error}
          onRequestClose={() => rootState.setIsJsonImportErrorOpen(false)}
          returnFocusRef={rootState.jsonImportReturnFocusRef}
        />
        <CharacterSheetJsonImportErrorDialog
          confirmButtonRef={rootState.jsonImportErrorConfirmButtonRef}
          dialogLabel={
            characterSheetDictionary.characterSheet.jsonImport.imageErrorLabel
          }
          isOpen={rootState.isJsonImportImageErrorOpen}
          message={
            characterSheetDictionary.characterSheet.jsonImport.imageError
          }
          onRequestClose={() => rootState.setIsJsonImportImageErrorOpen(false)}
          returnFocusRef={rootState.jsonImportReturnFocusRef}
        />
        <CharacterSheetErrorDialog
          closeButtonRef={errorSummaryCloseButtonRef}
          errorSummary={presenterProps.errorSummary}
          isOpen={isErrorSummaryOpen}
          onRequestClose={() => setIsErrorSummaryOpen(false)}
          returnFocusRef={errorSummaryTriggerRef}
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
        <SkillPickerDialog
          groups={[
            {
              id: "common-skills",
              skills: presenterProps.commonSkillPicker.candidates,
            },
          ]}
          isOpen={commonSkillPickerRowId !== null}
          onRequestClose={closeCommonSkillPicker}
          onSelect={(skillId) => {
            if (commonSkillPickerRowId !== null) {
              presenterProps.commonSkillPicker.onSelect(
                commonSkillPickerRowId,
                skillId,
              );
            }
            closeCommonSkillPicker();
          }}
          returnFocusRef={commonSkillPickerTriggerRef}
          selectedSkillIds={presenterProps.commonSkillsSection.rows.flatMap(
            (row) => (row.skillId === null ? [] : [row.skillId]),
          )}
          selectionGuide={
            characterSheetDictionary.characterSheet.skills.selectionGuide
          }
          title={characterSheetDictionary.characterSheet.skills.chooseCommon}
        />
        <OtherRyugiSkillPickerDialog
          groups={
            otherRyugiSkillPickerRowId === null
              ? { advanced: [], basic: [] }
              : presenterProps.otherRyugiSkillPicker.getCandidateGroups(
                  rootState.form
                    .getValues("otherRyugiSkills.rows")
                    .find((row) => row.rowId === otherRyugiSkillPickerRowId)
                    ?.ryugiRowId ?? "",
                )
          }
          isOpen={otherRyugiSkillPickerRowId !== null}
          onRequestClose={closeOtherRyugiSkillPicker}
          onSelect={(skillId) => {
            if (otherRyugiSkillPickerRowId !== null) {
              presenterProps.otherRyugiSkillPicker.onSelect(
                otherRyugiSkillPickerRowId,
                skillId,
              );
            }
            closeOtherRyugiSkillPicker();
          }}
          returnFocusRef={otherRyugiSkillPickerTriggerRef}
          selectedSkillIds={
            otherRyugiSkillPickerRowId === null
              ? []
              : presenterProps.otherRyugiSkillPicker.getSelectedSkillIds(
                  rootState.form
                    .getValues("otherRyugiSkills.rows")
                    .find((row) => row.rowId === otherRyugiSkillPickerRowId)
                    ?.ryugiRowId ?? "",
                )
          }
        />
        <WeaponPickerDialog
          groups={getWeaponCandidateGroups(
            rootState.form.getValues("build.ikizamaId"),
          )}
          isOpen={weaponPickerRowId !== null}
          onRequestClose={closeWeaponPicker}
          onSelect={(weaponId) => {
            if (weaponPickerRowId !== null) {
              presenterProps.weaponsAndArmorSection.onWeaponSelect(
                weaponPickerRowId,
                weaponId,
              );
            }
            closeWeaponPicker();
          }}
          returnFocusRef={weaponPickerTriggerRef}
        />
        <ArmorPickerDialog
          armors={getArmors()}
          isOpen={isArmorPickerOpen}
          onRequestClose={closeArmorPicker}
          onSelect={(armorId) => {
            presenterProps.weaponsAndArmorSection.onArmorSelect(armorId);
            closeArmorPicker();
          }}
          returnFocusRef={armorPickerTriggerRef}
        />
        <OmamoriPickerDialog
          candidates={getOmamori()}
          isOpen={omamoriPickerRowId !== null}
          onRequestClose={closeOmamoriPicker}
          onSelect={(omamoriId) => {
            if (omamoriPickerRowId !== null) {
              presenterProps.omamoriSection.onSelect(
                omamoriPickerRowId,
                omamoriId,
              );
            }
            closeOmamoriPicker();
          }}
          returnFocusRef={omamoriPickerTriggerRef}
        />
        <DrugsPickerDialog
          candidates={getDrugs()}
          isOpen={drugsPickerRowId !== null}
          onRequestClose={closeDrugsPicker}
          onSelect={(drugId) => {
            if (drugsPickerRowId !== null) {
              presenterProps.drugsSection.onSelect(drugsPickerRowId, drugId);
            }
            closeDrugsPicker();
          }}
          returnFocusRef={drugsPickerTriggerRef}
          selectedDrugIds={rootState.form
            .getValues("drugs.rows")
            .flatMap((row) =>
              row.rowId === drugsPickerRowId || row.drugId === null
                ? []
                : [row.drugId],
            )}
        />
        <CyberneticsPickerDialog
          groups={getCyberneticCandidateGroups(
            cyberneticsPickerTarget === null
              ? "other"
              : cyberneticsPickerTarget.kind === "fixed"
                ? cyberneticsPickerTarget.part
                : "other",
          )}
          isOpen={cyberneticsPickerTarget !== null}
          onRequestClose={closeCyberneticsPicker}
          onSelect={(cyberneticId) => {
            if (cyberneticsPickerTarget !== null) {
              presenterProps.cyberneticsSection.onSelect(
                cyberneticsPickerTarget,
                cyberneticId,
              );
            }
            closeCyberneticsPicker();
          }}
          returnFocusRef={cyberneticsPickerTriggerRef}
        />
        <NanomachinesPickerDialog
          candidates={getNanomachines()}
          isOpen={nanomachinesPickerTarget !== null}
          onRequestClose={closeNanomachinesPicker}
          onSelect={(nanomachineId) => {
            if (nanomachinesPickerTarget !== null) {
              presenterProps.nanomachinesSection.onSelect(
                nanomachinesPickerTarget,
                nanomachineId,
              );
            }
            closeNanomachinesPicker();
          }}
          returnFocusRef={nanomachinesPickerTriggerRef}
        />
        <SkillSelectionChangeConfirmDialog
          confirmation={
            characterSheetDictionary.characterSheet.skills
              .skillSelectionChangeConfirmation
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
        <SkillSelectionChangeConfirmDialog
          confirmation={
            characterSheetDictionary.characterSheet.skills
              .skillSelectionChangeConfirmation
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
        <SkillSelectionChangeConfirmDialog
          confirmation={
            characterSheetDictionary.characterSheet.skills
              .skillSelectionChangeConfirmation
          }
          dialogLabel={
            characterSheetDictionary.characterSheet.skills
              .otherRyugiChangeConfirmationLabel
          }
          isOpen={isOtherRyugiChangeConfirmOpen}
          onConfirm={confirmOtherRyugiChange}
          onRequestClose={closeOtherRyugiChangeConfirm}
          returnFocusRef={otherRyugiChangeTriggerRef}
        />
        <SkillSelectionChangeConfirmDialog
          confirmLabel={characterSheetDictionary.general.delete}
          confirmation={
            characterSheetDictionary.characterSheet.skills
              .otherRyugiRemoveConfirmation
          }
          dialogLabel={
            characterSheetDictionary.characterSheet.skills
              .otherRyugiRemoveConfirmationLabel
          }
          isOpen={isOtherRyugiRemoveConfirmOpen}
          onConfirm={confirmOtherRyugiRemove}
          onRequestClose={closeOtherRyugiRemoveConfirm}
          returnFocusRef={otherRyugiRemoveTriggerRef}
        />
        <SpecialItemCategoryRemoveConfirmDialog
          category={specialItemCategoryToRemove}
          isOpen={specialItemCategoryToRemove !== null}
          onConfirm={confirmSpecialItemCategoryRemove}
          onRequestClose={closeSpecialItemCategoryRemoveConfirm}
          returnFocusRef={specialItemCategoryRemoveTriggerRef}
        />
      </div>
      <CharacterSheetLoadingOverlay
        isOpen={
          rootState.isRootOperationInProgress || rootState.isFormRestoring
        }
        label={
          rootState.rootOperation?.label ??
          characterSheetDictionary.characterSheet.persistence.restoring
        }
      />
    </>
  );
}
