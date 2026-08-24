// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ArmorPickerDialog from "../../../src/character-sheet/components/dialogs/pickers/ArmorPickerDialog";
import CyberneticsPickerDialog from "../../../src/character-sheet/components/dialogs/pickers/CyberneticsPickerDialog";
import DrugsPickerDialog from "../../../src/character-sheet/components/dialogs/pickers/DrugsPickerDialog";
import NanomachinesPickerDialog from "../../../src/character-sheet/components/dialogs/pickers/NanomachinesPickerDialog";
import OmamoriPickerDialog from "../../../src/character-sheet/components/dialogs/pickers/OmamoriPickerDialog";
import WeaponPickerDialog from "../../../src/character-sheet/components/dialogs/pickers/WeaponPickerDialog";
import { getCyberneticCandidateGroups } from "../../../src/character-sheet/master-data/cybernetics";
import { getDrugs } from "../../../src/character-sheet/master-data/drugs";
import { getNanomachines } from "../../../src/character-sheet/master-data/nanomachines";
import { getOmamori } from "../../../src/character-sheet/master-data/omamori";
import {
  getArmors,
  getWeaponCandidateGroups,
} from "../../../src/character-sheet/master-data/weapons-and-armor";

beforeEach(() => {
  Object.defineProperties(HTMLDialogElement.prototype, {
    close: {
      configurable: true,
      value() {
        this.open = false;
      },
    },
    showModal: {
      configurable: true,
      value() {
        this.open = true;
      },
    },
  });
});

afterEach(cleanup);

const returnFocusRef = createRef<HTMLButtonElement>();

describe("item picker dialogs", () => {
  it("reports selection from armor, weapon, omamori, cybernetics, and nanomachine candidates", async () => {
    const user = userEvent.setup();
    const armor = getArmors()[0];
    const weaponGroups = getWeaponCandidateGroups(null);
    const weapon = weaponGroups[0]?.weapons[0];
    const omamori = getOmamori()[0];
    const cyberneticGroup = getCyberneticCandidateGroups("head")[0];
    const cybernetic = cyberneticGroup?.candidates[0];
    const nanomachine = getNanomachines()[0];
    if (
      armor === undefined ||
      weapon === undefined ||
      omamori === undefined ||
      cybernetic === undefined ||
      nanomachine === undefined
    ) {
      throw new Error("picker test用のmaster dataがありません。");
    }

    const cases = [
      {
        id: armor.id,
        node: (onSelect: (id: string) => void) => (
          <ArmorPickerDialog
            armors={[armor]}
            isOpen
            onRequestClose={vi.fn()}
            onSelect={onSelect}
            returnFocusRef={returnFocusRef}
          />
        ),
        name: armor.name,
      },
      {
        id: weapon.id,
        node: (onSelect: (id: string) => void) => (
          <WeaponPickerDialog
            groups={weaponGroups}
            isOpen
            onRequestClose={vi.fn()}
            onSelect={onSelect}
            returnFocusRef={returnFocusRef}
          />
        ),
        name: weapon.name,
      },
      {
        id: omamori.id,
        node: (onSelect: (id: string) => void) => (
          <OmamoriPickerDialog
            candidates={[omamori]}
            isOpen
            onRequestClose={vi.fn()}
            onSelect={onSelect}
            returnFocusRef={returnFocusRef}
          />
        ),
        name: omamori.name,
      },
      {
        id: cybernetic.id,
        node: (onSelect: (id: string) => void) => (
          <CyberneticsPickerDialog
            groups={[cyberneticGroup]}
            isOpen
            onRequestClose={vi.fn()}
            onSelect={onSelect}
            returnFocusRef={returnFocusRef}
          />
        ),
        name: cybernetic.name,
      },
      {
        id: nanomachine.id,
        node: (onSelect: (id: string) => void) => (
          <NanomachinesPickerDialog
            candidates={[nanomachine]}
            isOpen
            onRequestClose={vi.fn()}
            onSelect={onSelect}
            returnFocusRef={returnFocusRef}
          />
        ),
        name: nanomachine.name,
      },
    ];

    for (const picker of cases) {
      const onSelect = vi.fn();
      const view = render(picker.node(onSelect));
      await user.click(screen.getByRole("button", { name: picker.name }));
      expect(onSelect).toHaveBeenCalledWith(picker.id);
      view.unmount();
    }
  });

  it("marks drugs already selected in another row as unavailable while preserving selectable candidates", async () => {
    const user = userEvent.setup();
    const [selectedDrug, selectableDrug] = getDrugs();
    if (selectedDrug === undefined || selectableDrug === undefined) {
      throw new Error("drug picker test用のmaster dataがありません。");
    }
    const onSelect = vi.fn();

    render(
      <DrugsPickerDialog
        candidates={[selectedDrug, selectableDrug]}
        isOpen
        onRequestClose={vi.fn()}
        onSelect={onSelect}
        returnFocusRef={returnFocusRef}
        selectedDrugIds={[selectedDrug.id]}
      />,
    );

    expect(
      (
        screen.getByRole("button", {
          name: selectedDrug.name,
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    await user.click(screen.getByRole("button", { name: selectableDrug.name }));
    expect(onSelect).toHaveBeenCalledWith(selectableDrug.id);
  });
});
