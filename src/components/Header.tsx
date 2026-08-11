import { TreePine } from 'lucide-react';
import './Header.css';
import { useDashboardData } from '../state/DataContext';
import { formatDate, formatNumber } from '../lib/format';

type HeaderProps = {
  onBackToJourney: () => void;
};

/**
 * Global header: brand mark, title, and a subtitle with Hotjar volume,
 * MyCP volume, CRM volume, total signals, and the most recent data date
 * (docs/PROJECT_SPEC.md). Reflects live uploaded data when present
 * (docs/BACKLOG.md Phase 6), otherwise the local fixtures / validated
 * static MyCP baseline.
 */
export function Header({ onBackToJourney }: HeaderProps) {
  const { hotjarRows, crmRows, mycpBaseline } = useDashboardData();
  const hotjarVolume = hotjarRows.length;
  const crmVolume = crmRows.length;
  const mycpVolume = mycpBaseline.global.responses;
  const totalSignals = hotjarVolume + crmVolume + mycpVolume;
  const lastUpdateIso = [...hotjarRows, ...crmRows].map((row) => row.date).sort().at(-1);

  return (
    <header className="cv-header">
      <div className="cv-header__brand">
        <button
          type="button"
          className="cv-header__mark"
          onClick={onBackToJourney}
          title="Back to Customer Voice Journey"
          aria-label="Back to Customer Voice Journey"
        >
          <TreePine size={18} aria-hidden="true" />
        </button>
        <div>
          <h1 className="cv-header__title">Customer Voice Dashboard</h1>
          <p className="cv-header__subtitle">
            Web: {formatNumber(hotjarVolume)} · MyCP: {formatNumber(mycpVolume)} · CRM:{' '}
            {formatNumber(crmVolume)} · Total signals: {formatNumber(totalSignals)}
            {lastUpdateIso ? ` · Last data date: ${formatDate(lastUpdateIso)}` : ''}
          </p>
        </div>
      </div>
    </header>
  );
}
