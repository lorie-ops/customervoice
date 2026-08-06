import type { ReactNode } from 'react';
import './InfoNote.css';

type InfoNoteProps = {
  tone?: 'info' | 'warning';
  children: ReactNode;
};

/**
 * Small inline note used for things like "To verify" data states or
 * forward-looking notes (e.g. a future data source under evaluation).
 * Kept as an explicit, styled state rather than plain text so the Design
 * lead can review it as a real UI state (see docs/OWNERSHIP_MATRIX.md).
 */
export function InfoNote({ tone = 'info', children }: InfoNoteProps) {
  return <p className={`info-note info-note--${tone}`}>{children}</p>;
}
