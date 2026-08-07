import { useMemo, useState } from 'react';
import { Flame, Snowflake, ArrowRight } from 'lucide-react';
import { crmRows, hotjarRows, journeyTouchpointsByStage } from '../lib/fixtures';
import { calculateCrmRates, calculateHotjarAverage } from '../lib/calculations';
import { formatPercent } from '../lib/format';
import { SOURCES } from '../constants/sources';
import type { JourneyStage } from '../types';
import './JourneyPage.css';

const STAGES: Array<{ id: JourneyStage; label: string }> = [
  { id: 'before', label: 'Before Stay' },
  { id: 'during', label: 'During Stay' },
  { id: 'after', label: 'After Stay' },
];

type JourneyPageProps = {
  onEnterDashboard: () => void;
};

/**
 * Customer Voice Journey - entry page shown before the 5-tab dashboard.
 * Groups real Hotjar + CRM fixture data by the transversal `journeyStage`
 * field (docs/DATA_MODEL_ADDENDUM.md §1). Touchpoints below are an
 * illustrative structural taxonomy (journey_touchpoints_fixture.json),
 * not validated - source availability badges are real, computed from
 * constants/sources.ts, never from the touchpoint fixture.
 */
export function JourneyPage({ onEnterDashboard }: JourneyPageProps) {
  const [stage, setStage] = useState<JourneyStage>('during');

  const rowsWithoutStage = useMemo(
    () =>
      hotjarRows.filter((row) => !row.journeyStage).length + crmRows.filter((row) => !row.journeyStage).length,
    [],
  );

  const stageHotjar = hotjarRows.filter((row) => row.journeyStage === stage);
  const stageCrm = crmRows.filter((row) => row.journeyStage === stage);
  const stageWebAverage = calculateHotjarAverage(stageHotjar.map((row) => row.score));
  const stageCrmRates = calculateCrmRates(stageCrm);

  const touchpoints = journeyTouchpointsByStage[stage] ?? [];

  return (
    <div className="journey-page">
      <header className="journey-page__header">
        <div>
          <h1>Customer Voice Journey</h1>
          <p className="filter-note">Center Parcs Europe · 6 markets · Multi-source scope</p>
        </div>
        <button type="button" className="journey-page__cta" onClick={onEnterDashboard}>
          Enter Dashboard <ArrowRight size={16} aria-hidden="true" />
        </button>
      </header>

      <div className="journey-page__sources">
        {SOURCES.map((source) => (
          <span key={source.id} className={`source-badge source-badge--${source.status}`} title={source.note}>
            {source.label} · {source.status === 'available' ? 'Available' : 'Planned'}
          </span>
        ))}
      </div>
      {rowsWithoutStage > 0 && (
        <p className="filter-note">
          {rowsWithoutStage} fixture row(s) have no journeyStage set and are shown as "Unknown" rather than
          guessed (docs/DATA_MODEL_ADDENDUM.md §1).
        </p>
      )}

      <div className="journey-page__stages" role="tablist" aria-label="Journey stage">
        {STAGES.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={stage === s.id}
            className={`journey-stage-button journey-stage-button--${s.id}${stage === s.id ? ' journey-stage-button--active' : ''}`}
            onClick={() => setStage(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="kpi-grid">
        <div className="kpi-card kpi-card--blue">
          <p className="kpi-card__label">Web (Hotjar) - {stage}</p>
          <p className="kpi-card__value">
            {stageWebAverage !== null ? stageWebAverage.toFixed(1) : 'Non applicable'}
            {stageWebAverage !== null ? <span className="kpi-card__unit"> / 5</span> : null}
          </p>
          <p className="kpi-card__footnote">{stageHotjar.length} fixture rows for this stage</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-card__label">CRM - {stage}</p>
          <p className="kpi-card__value">{stageCrmRates.total}</p>
          <p className="kpi-card__footnote">
            {formatPercent(stageCrmRates.positiveRate)} positive · {formatPercent(stageCrmRates.negativeRate)} negative
          </p>
        </div>
      </div>

      <section className="journey-page__touchpoints">
        <h2>Touchpoints - illustrative structure</h2>
        <p className="filter-note">
          This taxonomy is not in the validated data model yet - Marketing/Product should confirm
          it before it is treated as final.
        </p>
        <div className="touchpoint-grid">
          {touchpoints.map((touchpoint) => (
            <div className="touchpoint-card" key={touchpoint.touchpoint}>
              <p className="touchpoint-card__title">{touchpoint.touchpoint}</p>
              <p className="filter-note">Objective: {touchpoint.objective}</p>
              <div className="touchpoint-card__sources">
                {touchpoint.sources.map((sourceId) => {
                  const source = SOURCES.find((s) => s.id === sourceId);
                  if (!source) return null;
                  return (
                    <span key={sourceId} className={`source-badge source-badge--${source.status}`}>
                      {source.hotCold === 'hot' ? (
                        <Flame size={12} aria-hidden="true" />
                      ) : (
                        <Snowflake size={12} aria-hidden="true" />
                      )}
                      {source.label}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="journey-page__legend">
        <div className="journey-page__legend-item">
          <p>
            <Flame size={14} aria-hidden="true" /> <strong>Hot measurement</strong>
          </p>
          <p className="filter-note">Collected in real time or immediately after the experience (e.g. Hotjar in-situ).</p>
        </div>
        <div className="journey-page__legend-item">
          <p>
            <Snowflake size={14} aria-hidden="true" /> <strong>Cold measurement</strong>
          </p>
          <p className="filter-note">Collected retrospectively (e.g. MyCP post-stay survey, CRM contact, Medallia).</p>
        </div>
      </div>
    </div>
  );
}
