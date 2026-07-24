import { type ElementType, type ReactNode, useState } from "react";
import styles from "./CharacterSheetSectionFrame.module.css";

type CharacterSheetSectionFrameProps = {
  children: ReactNode;
  heading?: ElementType;
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
  children,
  heading,
  id,
  title,
}: CharacterSheetSectionFrameProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const Heading = heading ?? "span";
  const headingId = `${id}-heading`;
  const contentId = `${id}-content`;

  return (
    <section className={styles.frame} aria-labelledby={headingId}>
      <Heading className={styles.heading}>
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
      </Heading>
      <section
        aria-labelledby={headingId}
        className={styles.content}
        hidden={!isExpanded}
        id={contentId}
      >
        {children}
      </section>
    </section>
  );
}
