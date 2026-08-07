import { type ReactNode, useState } from "react";
import styles from "./CharacterSheetSectionFrame.module.css";

export type CharacterSheetSectionHeading =
  | "span"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6";

type CharacterSheetSectionFrameProps = {
  allowOverflow?: boolean;
  children: ReactNode;
  expandable?: boolean;
  headingAs?: CharacterSheetSectionHeading;
  id: string;
  title: string;
};

/**
 * Keeps a section's display state local and outside the character form state.
 *
 * Children remain mounted while collapsed so later Gate presenters retain their
 * form values and local display state.
 */
export default function CharacterSheetSectionFrame({
  allowOverflow = false,
  children,
  expandable = false,
  headingAs,
  id,
  title,
}: CharacterSheetSectionFrameProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const Heading = headingAs ?? "span";
  const headingId = `${id}-heading`;
  const contentId = `${id}-content`;

  return (
    <section
      aria-labelledby={headingId}
      className={`${styles.frame} ${allowOverflow ? styles.allowOverflow : ""}`}
      id={id}
    >
      <Heading className={styles.heading}>
        {expandable ? (
          <button
            aria-controls={contentId}
            aria-expanded={isExpanded}
            className={styles.toggle}
            id={headingId}
            onClick={() => setIsExpanded((expanded) => !expanded)}
            type="button"
          >
            <span>{title}</span>
            <span aria-hidden="true" className={styles.chevron} />
          </button>
        ) : (
          <span className={styles.staticTitle} id={headingId}>
            {title}
          </span>
        )}
      </Heading>
      <div
        className={styles.content}
        hidden={expandable ? !isExpanded : undefined}
        id={expandable ? contentId : undefined}
      >
        {children}
      </div>
    </section>
  );
}
