import { Inbox } from 'lucide-react';
import './EmptyState.css';

type EmptyStateProps = {
  message?: string;
  description?: string;
};

/**
 * Reusable empty state (docs/BACKLOG.md Phase 1). Used whenever a filter
 * returns no rows, or a source has no data yet - never silently rendered
 * as zero or an empty table (CLAUDE.md).
 */
export function EmptyState({ message = 'Non applicable', description }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <Inbox size={20} aria-hidden="true" />
      <p className="empty-state__message">{message}</p>
      {description ? <p className="empty-state__description">{description}</p> : null}
    </div>
  );
}
