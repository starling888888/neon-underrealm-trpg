import type {
  CharacterSheetListResponse,
  CharacterSheetSummary,
} from "@neon-underrealm/shared";
import { type RefObject, useCallback, useMemo, useRef, useState } from "react";
import { characterSheetDictionary } from "../../dictionary";
import {
  getCharacterSheetIkizamaOptions,
  getCharacterSheetRyugiOptions,
} from "../../master-data/build";
import CharacterSheetButton from "../_common/CharacterSheetButton";
import styles from "./CharacterSheetCharacterListDialog.module.css";
import CharacterSheetDialog, {
  CharacterSheetDialogContent,
  CharacterSheetDialogHeader,
} from "./CharacterSheetDialog";

type CharacterSheetCharacterListDialogProps = {
  cache: CharacterSheetListResponse | null;
  isLoading: boolean;
  isOpen: boolean;
  onRequestClose: () => void;
  onSelect: (id: string) => void;
  returnFocusRef?: RefObject<HTMLElement | null>;
};

const pageSize = 10;
const ryugiNames = new Map(
  getCharacterSheetRyugiOptions().map(({ id, name }) => [id, name]),
);
const ikizamaNames = new Map(
  getCharacterSheetIkizamaOptions().map(({ id, name }) => [id, name]),
);

export default function CharacterSheetCharacterListDialog({
  cache,
  isLoading,
  isOpen,
  onRequestClose,
  onSelect,
  returnFocusRef,
}: CharacterSheetCharacterListDialogProps) {
  const { general, characterSheet } = characterSheetDictionary;
  const { characterList } = characterSheet;
  const initialFocusRef = useRef<HTMLInputElement>(null);
  const listRegionRef = useRef<HTMLDivElement>(null);
  const [kind, setKind] = useState<"user" | "sample">("user");
  const [ownersOnly, setOwnersOnly] = useState(false);
  const [page, setPage] = useState(0);
  const entries = useMemo(() => {
    const values = cache?.[kind] ?? [];
    return kind === "user" && ownersOnly
      ? values.filter(({ metadata }) => metadata.isOwner)
      : values;
  }, [cache, kind, ownersOnly]);
  const pageCount = Math.max(1, Math.ceil(entries.length / pageSize));
  const pageEntries = entries.slice(page * pageSize, (page + 1) * pageSize);
  const scrollListToTop = useCallback(() => {
    if (listRegionRef.current !== null) listRegionRef.current.scrollTop = 0;
  }, []);

  return (
    <CharacterSheetDialog
      ariaLabel={characterList.heading}
      className={styles.dialog}
      initialFocusRef={initialFocusRef}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      returnFocusRef={returnFocusRef}
    >
      <CharacterSheetDialogHeader
        headingId="character-sheet-list-heading"
        onRequestClose={onRequestClose}
      >
        {characterList.heading}
      </CharacterSheetDialogHeader>
      <CharacterSheetDialogContent className={styles.content}>
        <p className={styles.notice}>{characterList.notice}</p>
        <div className={styles.filters}>
          <div className={styles.userFilterGroup}>
            <label>
              <input
                checked={kind === "user"}
                name="character-list-kind"
                onChange={() => {
                  setKind("user");
                  setPage(0);
                  scrollListToTop();
                }}
                ref={initialFocusRef}
                type="radio"
              />
              {characterList.registered}
            </label>
            <label className={styles.ownerFilter}>
              <input
                checked={ownersOnly}
                disabled={kind === "sample"}
                onChange={(event) => {
                  setOwnersOnly(event.target.checked);
                  setPage(0);
                  scrollListToTop();
                }}
                type="checkbox"
              />
              {characterList.ownersOnly}
            </label>
          </div>
          <label>
            <input
              checked={kind === "sample"}
              name="character-list-kind"
              onChange={() => {
                setKind("sample");
                setPage(0);
                scrollListToTop();
              }}
              type="radio"
            />
            {characterList.sample}
          </label>
        </div>
        <div
          className={styles.listRegion}
          data-character-sheet-character-list-rows
          ref={listRegionRef}
        >
          {isLoading ? <p>{characterList.loading}</p> : null}
          {!isLoading ? (
            <CharacterListTable entries={pageEntries} onSelect={onSelect} />
          ) : null}
        </div>
        <nav
          aria-label={characterList.paginationLabel}
          className={styles.pagination}
        >
          <CharacterSheetButton
            disabled={page === 0}
            onClick={() => {
              setPage((value) => value - 1);
              scrollListToTop();
            }}
          >
            {general.previous}
          </CharacterSheetButton>
          <span>
            {page + 1} / {pageCount}
          </span>
          <CharacterSheetButton
            disabled={page + 1 === pageCount}
            onClick={() => {
              setPage((value) => value + 1);
              scrollListToTop();
            }}
          >
            {general.next}
          </CharacterSheetButton>
        </nav>
      </CharacterSheetDialogContent>
    </CharacterSheetDialog>
  );
}

function CharacterListTable({
  entries,
  onSelect,
}: {
  entries: CharacterSheetSummary[];
  onSelect: (id: string) => void;
}) {
  const { general, characterSheet } = characterSheetDictionary;
  const { characterList } = characterSheet;
  const table = characterList.table;

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <colgroup>
          <col className={styles.pcNameColumn} />
          <col className={styles.plNameColumn} />
          <col className={styles.ryugiAndIkizamaColumn} />
          <col className={styles.rankColumn} />
          <col className={styles.updatedAtColumn} />
        </colgroup>
        <thead>
          <tr>
            <th>{table.pcName}</th>
            <th>{table.plName}</th>
            <th>
              {table.ryugi}
              <br />／{table.ikizama}
            </th>
            <th>{table.rank}</th>
            <th>{table.updatedAt}</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(({ id, metadata }) => (
            <tr key={id}>
              <td>
                <button
                  onClick={() => onSelect(id)}
                  title={metadata.pcName}
                  type="button"
                >
                  {metadata.pcName}
                </button>
              </td>
              <td title={metadata.plName ?? undefined}>
                {metadata.plName || general.unavailableValue}
              </td>
              <td className={styles.ryugiAndIkizama}>
                <span>
                  {metadata.primaryRyugiId
                    ? (ryugiNames.get(metadata.primaryRyugiId) ??
                      general.unavailableValue)
                    : general.unavailableValue}
                  <br />／
                  {metadata.ikizamaId
                    ? (ikizamaNames.get(metadata.ikizamaId) ??
                      general.unavailableValue)
                    : general.unavailableValue}
                </span>
              </td>
              <td>{metadata.rank}</td>
              <td>
                {new Intl.DateTimeFormat("ja-JP", {
                  dateStyle: "medium",
                }).format(metadata.updatedAt)}
              </td>
            </tr>
          ))}
          {entries.length === 0 ? (
            <tr>
              <td colSpan={5}>{characterList.empty}</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
