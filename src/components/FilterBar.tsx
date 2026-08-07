import type { ReactNode } from 'react';
import './FilterBar.css';

/** Reusable filter row layout (docs/BACKLOG.md Phase 1). */
export function FilterBar({ children }: { children: ReactNode }) {
  return <div className="filter-bar">{children}</div>;
}

export function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="filter-field">
      <span className="filter-field__label">{label}</span>
      {children}
    </label>
  );
}
