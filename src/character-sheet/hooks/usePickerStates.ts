import { type RefObject, useCallback, useMemo, useRef, useState } from "react";

import type { CyberneticsPickerTarget } from "../components/sections/CyberneticsSection";
import type { NanomachinesPickerTarget } from "../components/sections/NanomachinesSection";

type RowPickerState = {
  close: () => void;
  request: (rowId: string, trigger: HTMLButtonElement) => void;
  rowId: string | null;
  triggerRef: RefObject<HTMLButtonElement | null>;
};

type BooleanPickerState = {
  close: () => void;
  isOpen: boolean;
  request: (trigger: HTMLButtonElement) => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
};

type TargetPickerState<T> = {
  close: () => void;
  request: (target: T, trigger: HTMLButtonElement) => void;
  target: T | null;
  triggerRef: RefObject<HTMLButtonElement | null>;
};

export type PickerStates = {
  armor: BooleanPickerState;
  commonSkill: RowPickerState;
  cybernetics: TargetPickerState<CyberneticsPickerTarget>;
  drugs: RowPickerState;
  ikizamaSkill: RowPickerState;
  nanomachines: TargetPickerState<NanomachinesPickerTarget>;
  omamori: RowPickerState;
  otherRyugiSkill: RowPickerState;
  primarySkill: RowPickerState;
  requests: {
    onArmorPickerRequested: BooleanPickerState["request"];
    onCommonSkillPickerRequested: RowPickerState["request"];
    onCyberneticsPickerRequested: TargetPickerState<CyberneticsPickerTarget>["request"];
    onDrugsPickerRequested: RowPickerState["request"];
    onIkizamaSkillPickerRequested: RowPickerState["request"];
    onNanomachinesPickerRequested: TargetPickerState<NanomachinesPickerTarget>["request"];
    onOmamoriPickerRequested: RowPickerState["request"];
    onOtherRyugiSkillPickerRequested: RowPickerState["request"];
    onPrimarySkillPickerRequested: RowPickerState["request"];
    onWeaponPickerRequested: RowPickerState["request"];
  };
  weapon: RowPickerState;
};

export function usePrimarySkillPickerState(): RowPickerState {
  return useRowPickerState();
}

export function useIkizamaSkillPickerState(): RowPickerState {
  return useRowPickerState();
}

export function useCommonSkillPickerState(): RowPickerState {
  return useRowPickerState();
}

export function useOtherRyugiSkillPickerState(): RowPickerState {
  return useRowPickerState();
}

export function useWeaponPickerState(): RowPickerState {
  return useRowPickerState();
}

export function useArmorPickerState(): BooleanPickerState {
  return useBooleanPickerState();
}

export function useOmamoriPickerState(): RowPickerState {
  return useRowPickerState();
}

export function useDrugsPickerState(): RowPickerState {
  return useRowPickerState();
}

export function useCyberneticsPickerState(): TargetPickerState<CyberneticsPickerTarget> {
  return useTargetPickerState<CyberneticsPickerTarget>();
}

export function useNanomachinesPickerState(): TargetPickerState<NanomachinesPickerTarget> {
  return useTargetPickerState<NanomachinesPickerTarget>();
}

/** Owns the open target and focus return point for every candidate picker. */
export default function usePickerStates(): PickerStates {
  const primarySkill = usePrimarySkillPickerState();
  const ikizamaSkill = useIkizamaSkillPickerState();
  const commonSkill = useCommonSkillPickerState();
  const otherRyugiSkill = useOtherRyugiSkillPickerState();
  const weapon = useWeaponPickerState();
  const armor = useArmorPickerState();
  const omamori = useOmamoriPickerState();
  const drugs = useDrugsPickerState();
  const cybernetics = useCyberneticsPickerState();
  const nanomachines = useNanomachinesPickerState();
  const requests = useMemo(
    () => ({
      onArmorPickerRequested: armor.request,
      onCommonSkillPickerRequested: commonSkill.request,
      onCyberneticsPickerRequested: cybernetics.request,
      onDrugsPickerRequested: drugs.request,
      onIkizamaSkillPickerRequested: ikizamaSkill.request,
      onNanomachinesPickerRequested: nanomachines.request,
      onOmamoriPickerRequested: omamori.request,
      onOtherRyugiSkillPickerRequested: otherRyugiSkill.request,
      onPrimarySkillPickerRequested: primarySkill.request,
      onWeaponPickerRequested: weapon.request,
    }),
    [
      armor.request,
      commonSkill.request,
      cybernetics.request,
      drugs.request,
      ikizamaSkill.request,
      nanomachines.request,
      omamori.request,
      otherRyugiSkill.request,
      primarySkill.request,
      weapon.request,
    ],
  );

  return useMemo(
    () => ({
      armor,
      commonSkill,
      cybernetics,
      drugs,
      ikizamaSkill,
      nanomachines,
      omamori,
      otherRyugiSkill,
      primarySkill,
      requests,
      weapon,
    }),
    [
      armor,
      commonSkill,
      cybernetics,
      drugs,
      ikizamaSkill,
      nanomachines,
      omamori,
      otherRyugiSkill,
      primarySkill,
      requests,
      weapon,
    ],
  );
}

function useRowPickerState(): RowPickerState {
  const [rowId, setRowId] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const request = useCallback(
    (nextRowId: string, trigger: HTMLButtonElement) => {
      triggerRef.current = trigger;
      setRowId(nextRowId);
    },
    [],
  );
  const close = useCallback(() => {
    setRowId(null);
  }, []);

  return useMemo(
    () => ({ close, request, rowId, triggerRef }),
    [close, request, rowId],
  );
}

function useBooleanPickerState(): BooleanPickerState {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const request = useCallback((trigger: HTMLButtonElement) => {
    triggerRef.current = trigger;
    setIsOpen(true);
  }, []);
  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return useMemo(
    () => ({ close, isOpen, request, triggerRef }),
    [close, isOpen, request],
  );
}

function useTargetPickerState<T>(): TargetPickerState<T> {
  const [target, setTarget] = useState<T | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const request = useCallback((nextTarget: T, trigger: HTMLButtonElement) => {
    triggerRef.current = trigger;
    setTarget(nextTarget);
  }, []);
  const close = useCallback(() => {
    setTarget(null);
  }, []);

  return useMemo(
    () => ({ close, request, target, triggerRef }),
    [close, request, target],
  );
}
