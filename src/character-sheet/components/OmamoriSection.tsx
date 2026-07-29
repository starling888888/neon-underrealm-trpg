import { ListPlus } from "lucide-react";
import { useState } from "react";

import type { Omamori } from "../../lib/types/item";
import { characterSheetDictionary, getNamePickerTooltip } from "../dictionary";
import { formatDisplayValue } from "../format-display-value";
import FormulaTooltip from "./FormulaTooltip";
import styles from "./OmamoriSection.module.css";

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
  const rowLabel = `${copy.name}${rowNumber}：${name}`;
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
        <p className={styles.effect}>{row.omamori?.effect ?? ""}</p>
        <button
          aria-controls={detailsId}
          aria-expanded={expanded}
          aria-label={`${rowLabel}${expanded ? copy.closeDetails : copy.openDetails}`}
          className={styles.detailsToggle}
          onClick={() => setExpanded((value) => !value)}
          type="button"
        >
          <span aria-hidden="true">{expanded ? "▾" : "▸"}</span>
        </button>
        <div className={styles.removeCell}>
          <button
            aria-label={`${rowLabel}${copy.remove}`}
            className="character-sheet-remove-button character-sheet-remove-button--mobile-compact"
            onClick={() => onRemove(row.rowId)}
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      </div>
      {expanded ? (
        <p className={styles.mobileEffect} id={detailsId}>
          {row.omamori?.effect ?? ""}
        </p>
      ) : null}
    </fieldset>
  );
}

export default function OmamoriSection(props: OmamoriSectionProps) {
  const copy = characterSheetDictionary.characterSheet.omamori;

  return (
    <div className={styles.section} data-omamori-section>
      <div className={`${styles.headerRow} ${styles.line}`}>
        <span aria-hidden="true" />
        <span>
          <FormulaTooltip
            ariaLabel={copy.headers.name}
            formula={getNamePickerTooltip(copy.name)}
          >
            <span>{copy.headers.name}</span>
          </FormulaTooltip>
        </span>
        <span>{copy.headers.credit}</span>
        <span className={styles.desktopEffectHeader}>
          {copy.headers.effect}
        </span>
        <span className={styles.mobileEffectHeader}>{copy.headers.effect}</span>
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
      <button
        className={`${styles.addButton} character-sheet-add-button`}
        onClick={props.onAdd}
        type="button"
      >
        {copy.add}
      </button>
    </div>
  );
}
