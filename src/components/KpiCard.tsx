import './KpiCard.css';

export type KpiTone = 'neutral' | 'blue' | 'purple' | 'green' | 'red' | 'orange';

type KpiCardProps = {
  label: string;
  value: string | number | null;
  unit?: string;
  tone?: KpiTone;
  footnote?: string;
  /** Shown instead of the value when value is null (CLAUDE.md empty-state rule). */
  emptyMessage?: string;
};

/**
 * Reusable KPI card (docs/BACKLOG.md Phase 1). Renders an explicit empty
 * state instead of a zero when `value` is null, per CLAUDE.md.
 */
export function KpiCard({ label, value, unit, tone = 'neutral', footnote, emptyMessage = 'Non applicable' }: KpiCardProps) {
  const isEmpty = value === null || value === undefined || value === '';
  return (
    <div className={`kpi-card kpi-card--${tone}`}>
      <p className="kpi-card__label">{label}</p>
      {isEmpty ? (
        <p className="kpi-card__empty">{emptyMessage}</p>
      ) : (
        <p className="kpi-card__value">
          {value}
          {unit ? <span className="kpi-card__unit">{unit}</span> : null}
        </p>
      )}
      {footnote ? <p className="kpi-card__footnote">{footnote}</p> : null}
    </div>
  );
}
