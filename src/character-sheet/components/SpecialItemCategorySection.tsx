import type { ReactNode } from "react";

import styles from "./SpecialItemCategorySection.module.css";

type Props = {
  children: ReactNode;
  id: string;
  title: string;
};

/**
 * Non-expandable frame for one special-item category.
 *
 * G22 can add category-level actions without changing the item-row layout.
 */
export default function SpecialItemCategorySection({
  children,
  id,
  title,
}: Props) {
  const headingId = `${id}-category-heading`;

  return (
    <section aria-labelledby={headingId} className={styles.frame}>
      <h3 className={styles.heading} id={headingId}>
        {title}
      </h3>
      <div className={styles.content}>{children}</div>
    </section>
  );
}
