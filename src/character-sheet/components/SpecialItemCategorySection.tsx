import { X } from "lucide-react";
import type { ReactNode } from "react";

import styles from "./SpecialItemCategorySection.module.css";

type Props = {
  children: ReactNode;
  id: string;
  isUnavailable?: boolean;
  onRemove?: (trigger: HTMLButtonElement) => void;
  title: string;
  warning?: string;
};

/**
 * Non-expandable frame for one special-item category.
 *
 * G22 can add category-level actions without changing the item-row layout.
 */
export default function SpecialItemCategorySection({
  children,
  id,
  isUnavailable = false,
  onRemove,
  title,
  warning,
}: Props) {
  const headingId = `${id}-category-heading`;

  return (
    <section
      aria-labelledby={headingId}
      className={
        isUnavailable ? `${styles.frame} ${styles.unavailable}` : styles.frame
      }
      data-special-item-category={id}
      data-unavailable={isUnavailable || undefined}
    >
      <div className={styles.headingRow}>
        <h3 className={styles.heading} id={headingId}>
          {title}
          {warning ? <span className={styles.warning}>{warning}</span> : null}
        </h3>
        {onRemove ? (
          <button
            aria-label={`${title}カテゴリを削除`}
            className={styles.removeButton}
            onClick={(event) => onRemove(event.currentTarget)}
            type="button"
          >
            <X aria-hidden="true" size={15} />
          </button>
        ) : null}
      </div>
      <div className={styles.content}>{children}</div>
    </section>
  );
}
