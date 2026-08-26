import { ListPlus } from "lucide-react";
import { memo, useState } from "react";

import type { Omamori } from "../../../lib/types/item";
import {
  formatDisplayText,
  formatDisplayValue,
} from "../../../lib/utils/display-value";
import {
  characterSheetDictionary,
  getNamePickerTooltip,
} from "../../dictionary";
import CharacterSheetButton from "../_common/CharacterSheetButton";
import DeleteButton from "../_common/DeleteButton";
import FormulaTooltip from "../_common/FormulaTooltip";
import styles from "./OmamoriSection.module.css";

const itemTerms = characterSheetDictionary.gameDomain.terms.items;

type OmamoriRow = {
  omamori: Omamori | null;
  omamoriId: string | null;
  rowId: string;
};

export type OmamoriSectionProps = {
  onAdd: () => void;
  onMove: (rowId: string, direction: "up" | "down") => void;
  onPickerRequest: (rowId: string, trigger: HTMLButtonElement) => void;
  onRemove: (rowId: string) => void;
  onSelect: (rowId: string, omamoriId: string) => void;
  rows: readonly OmamoriRow[];
};

function OmamoriRow({
  canMoveDown,
  canMoveUp,
  onMove,
  onPickerRequest,
  onRemove,
  row,
  rowNumber,
}: {
  canMoveDown: boolean;
  canMoveUp: boolean;
  onMove: OmamoriSectionProps["onMove"];
  onPickerRequest: OmamoriSectionProps["onPickerRequest"];
  onRemove: OmamoriSectionProps["onRemove"];
  row: OmamoriRow;
  rowNumber: number;
}) {
  const copy = characterSheetDictionary.characterSheet.omamori;
  const [expanded, setExpanded] = useState(false);
  const name = row.omamori?.name ?? copy.unselected;
  const rowLabel = `${itemTerms.omamori}${rowNumber}：${name}`;
  const detailsId = `omamori-details-${row.rowId}`;

  return (
    <fieldset className={styles.row} data-omamori-row={row.rowId}>
      <legend className={styles.visuallyHidden}>{rowLabel}</legend>
      <div className={styles.line}>
        <div className={styles.reorderControls}>
          {canMoveUp ? (
            <button
              aria-label={`${rowLabel}${copy.moveUp}`}
              className={styles.reorderButton}
              onClick={() => onMove(row.rowId, "up")}
              type="button"
            >
              ▲
            </button>
          ) : null}
          {canMoveDown ? (
            <button
              aria-label={`${rowLabel}${copy.moveDown}`}
              className={styles.reorderButton}
              onClick={() => onMove(row.rowId, "down")}
              type="button"
            >
              ▼
            </button>
          ) : null}
        </div>
        <button
          aria-label={rowLabel}
          className={styles.itemPicker}
          onClick={(event) => onPickerRequest(row.rowId, event.currentTarget)}
          type="button"
        >
          <ListPlus
            aria-hidden="true"
            className={styles.chooseIcon}
            size={15}
          />
          <span>{name}</span>
        </button>
        <span className={styles.cell}>
          {formatDisplayValue(row.omamori?.credit ?? null)}
        </span>
        <p className={styles.effect}>
          {formatDisplayText(row.omamori?.effect)}
        </p>
        {/* biome-ignore lint/a11y/useSemanticElements: Native button inherits disabled from the read-only fieldset, but this display-only disclosure must remain interactive. */}
        <span
          aria-controls={detailsId}
          aria-expanded={expanded}
          aria-label={`${rowLabel}${expanded ? copy.closeDetails : copy.openDetails}`}
          className={styles.detailsToggle}
          onClick={() => setExpanded((value) => !value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            setExpanded((value) => !value);
          }}
          role="button"
          tabIndex={0}
        >
          <span aria-hidden="true">{expanded ? "▾" : "▸"}</span>
        </span>
        <div className={styles.removeCell}>
          <DeleteButton
            ariaLabel={`${rowLabel}${copy.remove}`}
            onClick={() => onRemove(row.rowId)}
          />
        </div>
      </div>
      {expanded ? (
        <p className={styles.mobileEffect} id={detailsId}>
          <strong>{itemTerms.common.effect}：</strong>
          {formatDisplayText(row.omamori?.effect)}
        </p>
      ) : null}
    </fieldset>
  );
}

function OmamoriSection(props: OmamoriSectionProps) {
  const copy = characterSheetDictionary.characterSheet.omamori;

  return (
    <div className={styles.section} data-omamori-section>
      <div className={`${styles.headerRow} ${styles.line}`}>
        <span aria-hidden="true" />
        <span>
          <FormulaTooltip
            ariaLabel={itemTerms.common.name}
            formula={getNamePickerTooltip(itemTerms.omamori)}
          >
            <span>{itemTerms.common.name}</span>
          </FormulaTooltip>
        </span>
        <span>{itemTerms.common.credit}</span>
        <span className={styles.desktopEffectHeader}>
          {itemTerms.common.effect}
        </span>
        <span className={styles.mobileEffectHeader}>
          {itemTerms.common.effect}
        </span>
        <span aria-hidden="true" />
      </div>
      {props.rows.map((row, index) => (
        <OmamoriRow
          canMoveDown={index < props.rows.length - 1}
          canMoveUp={index > 0}
          key={row.rowId}
          onMove={props.onMove}
          onPickerRequest={props.onPickerRequest}
          onRemove={props.onRemove}
          row={row}
          rowNumber={index + 1}
        />
      ))}
      <CharacterSheetButton className={styles.addButton} onClick={props.onAdd}>
        {copy.add}
      </CharacterSheetButton>
    </div>
  );
}

export default memo(OmamoriSection);
