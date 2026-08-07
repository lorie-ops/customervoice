import { Route } from 'lucide-react';
import './Header.css';
import { crmRows, hotjarRows } from '../lib/fixtures';
import { MYCP_BASELINE_APRIL_2026 } from '../lib/mycpBaseline';
import { formatDate, formatNumber } from '../lib/format';

type HeaderProps = {
  onBackToJourney: () => void;
};

/**
 * Global header: brand mark, title, and a subtitle with Hotjar volume,
 * MyCP volume, CRM volume, total signals, and the most recent fixture
 * date (docs/PROJECT_SPEC.md). MyCP volume comes from the validated
 * static baseline, never from a fixture.
 */
export function Header({ onBackToJourney }: HeaderProps) {
  const hotjarVolume = hotjarRows.length;
  const crmVolume = crmRows.length;
  const mycpVolume = MYCP_BASELINE_APRIL_2026.global.responses;
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
          <Route size={18} aria-hidden="true" />
        </button>
        <div>
          <h1 className="cv-header__title">Customer Voice Dashboard</h1>
          <p className="cv-header__subtitle">
            Web: {formatNumber(hotjarVolume)} · MyCP: {formatNumber(mycpVolume)} · CRM:{' '}
            {formatNumber(crmVolume)} · Total signals: {formatNumber(totalSignals)}
            {lastUpdateIso ? ` · Last fixture date: ${formatDate(lastUpdateIso)}` : ''}
          </p>
        </div>
      </div>
    </header>
  );
}
