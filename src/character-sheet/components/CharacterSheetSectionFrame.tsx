import { type ReactNode, useState } from "react";
import styles from "./CharacterSheetSectionFrame.module.css";

type SectionFrameHeading = "span" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

type CharacterSheetSectionFrameProps = {
  children: ReactNode;
  headingAs?: SectionFrameHeading;
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
  headingAs,
  id,
  title,
}: CharacterSheetSectionFrameProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const Heading = headingAs ?? "span";
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
