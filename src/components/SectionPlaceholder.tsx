import type { ReactNode } from 'react';
import './SectionPlaceholder.css';

type SectionPlaceholderProps = {
  /** Historical section title, kept in the original vertical order. */
  title: string;
  /** One line describing what real content will land here in a later phase. */
  description: string;
  /** Optional small tag, e.g. a phase number or a data-source note. */
  tag?: string;
  children?: ReactNode;
};

/**
 * Phase 0 placeholder for a dashboard section.
 *
 * Renders the section in its correct historical position with a short
 * description of what it will contain, so the layout and hierarchy can be
 * reviewed before any calculation or chart logic is implemented.
 */
export function SectionPlaceholder({ title, description, tag, children }: SectionPlaceholderProps) {
  return (
    <section className="section-placeholder" aria-label={title}>
      <div className="section-placeholder__header">
        <h2>{title}</h2>
        {tag ? <span className="section-placeholder__tag">{tag}</span> : null}
      </div>
      <p className="section-placeholder__description">{description}</p>
      {children}
    </section>
  );
}
