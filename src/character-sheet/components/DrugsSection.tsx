import { ListPlus } from "lucide-react";
import { useState } from "react";

import type { Drug } from "../../lib/types/item";
import { characterSheetDictionary, getNamePickerTooltip } from "../dictionary";
import { formatDisplayValue } from "../format-display-value";
import DeleteButton from "./DeleteButton";
import styles from "./DrugsSection.module.css";
import FormulaTooltip from "./FormulaTooltip";

type DrugRow = {
  drug: Drug | null;
  drugId: string | null;
  hasDuplicateSelection: boolean;
  quantity: number;
  rowId: string;
};

export type DrugsSectionProps = {
  onAdd: () => void;
  onMove: (rowId: string, direction: "up" | "down") => void;
  onPickerRequest: (rowId: string, trigger: HTMLButtonElement) => void;
  onQuantityChange: (rowId: string, value: string) => number;
  onRemove: (rowId: string) => void;
  onSelect: (rowId: string, drugId: string) => void;
  rows: readonly DrugRow[];
};

function DrugRow({
  canMoveDown,
  canMoveUp,
  onMove,
  onPickerRequest,
  onQuantityChange,
  onRemove,
  row,
  rowNumber,
}: {
  canMoveDown: boolean;
  canMoveUp: boolean;
  onMove: DrugsSectionProps["onMove"];
  onPickerRequest: DrugsSectionProps["onPickerRequest"];
  onQuantityChange: DrugsSectionProps["onQuantityChange"];
  onRemove: DrugsSectionProps["onRemove"];
  row: DrugRow;
  rowNumber: number;
}) {
  const copy = characterSheetDictionary.characterSheet.drugs;
  const [expanded, setExpanded] = useState(false);
  const name = row.drug?.name ?? copy.unselected;
  const rowLabel = `${copy.name}${rowNumber}：${name}`;
  const detailsId = `drugs-details-${row.rowId}`;

  return (
    <fieldset
      aria-invalid={row.hasDuplicateSelection || undefined}
      className={styles.row}
      data-drugs-row={row.rowId}
      data-invalid={row.hasDuplicateSelection || undefined}
    >
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
          aria-invalid={row.hasDuplicateSelection || undefined}
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
          {formatDisplayValue(row.drug?.credit ?? null)}
        </span>
        <span className={`${styles.cell} ${styles.timing}`}>
          {row.drug?.timing ?? "−"}
        </span>
        <span className={`${styles.cell} ${styles.setQuantity}`}>
          {formatDisplayValue(row.drug?.setQuantity ?? null)}
        </span>
        <span className={styles.cell}>
          {formatDisplayValue(row.drug?.badTripIntensity ?? null)}
        </span>
        <input
          aria-label={`${rowLabel}${copy.headers.quantity}`}
          className={styles.quantityInput}
          defaultValue={row.quantity}
          min="0"
          onBlur={(event) => {
            event.currentTarget.value = String(
              onQuantityChange(row.rowId, event.currentTarget.value),
            );
          }}
          onChange={(event) => {
            const value = event.currentTarget.value;
            if (!event.currentTarget.validity.badInput && value !== "") {
              onQuantityChange(row.rowId, value);
            }
          }}
          step="1"
          type="number"
        />
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
          <DeleteButton
            ariaLabel={`${rowLabel}${copy.remove}`}
            onClick={() => onRemove(row.rowId)}
          />
        </div>
      </div>
      {expanded ? (
        <div className={styles.details} id={detailsId}>
          <div className={styles.mobileDetailsMetadata}>
            <span>
              <strong>{copy.mobileDetails.timing}：</strong>
              {row.drug?.timing ?? "−"}
            </span>
            <span>
              <strong>{copy.mobileDetails.setQuantity}：</strong>
              {formatDisplayValue(row.drug?.setQuantity ?? null)}
            </span>
          </div>
          <p>
            <strong>効果：</strong>
            {row.drug?.effect ?? ""}
          </p>
        </div>
      ) : null}
    </fieldset>
  );
}

export default function DrugsSection(props: DrugsSectionProps) {
  const copy = characterSheetDictionary.characterSheet.drugs;

  return (
    <div className={styles.section} data-drugs-section>
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
        <span className={styles.timingHeader}>{copy.headers.timing}</span>
        <span className={styles.setQuantityHeader}>
          {copy.headers.setQuantity}
        </span>
        <span>{copy.headers.badTripIntensity}</span>
        <span>{copy.headers.quantity}</span>
        <span>{copy.headers.effect}</span>
        <span aria-hidden="true" />
      </div>
      {props.rows.map((row, index) => (
        <DrugRow
          canMoveDown={index < props.rows.length - 1}
          canMoveUp={index > 0}
          key={row.rowId}
          onMove={props.onMove}
          onPickerRequest={props.onPickerRequest}
          onQuantityChange={props.onQuantityChange}
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
