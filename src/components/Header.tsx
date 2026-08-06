import './Header.css';

/**
 * Global header: brand mark, title, and a placeholder subtitle slot.
 *
 * The subtitle will show Hotjar volume, CRM volume, total signals, and the
 * last update date (docs/PROJECT_SPEC.md). Phase 0 does not wire real
 * fixture data yet, so it shows a neutral placeholder rather than an
 * invented number.
 */
export function Header() {
  return (
    <header className="cv-header">
      <div className="cv-header__brand">
        <span className="cv-header__mark" aria-hidden="true">
          CV
        </span>
        <div>
          <h1 className="cv-header__title">Customer Voice Dashboard</h1>
          <p className="cv-header__subtitle">
            Web volume, MyCP volume, CRM volume and last update - available once fixtures are wired
            in (Phase 1).
          </p>
        </div>
      </div>
    </header>
  );
}
