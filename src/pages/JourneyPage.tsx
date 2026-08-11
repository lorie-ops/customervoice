import { useMemo, useState } from 'react';
import { ArrowRight, CalendarSearch, CircleCheck, Compass, Flame, Snowflake } from 'lucide-react';
import { journeyTouchpointsByStage } from '../lib/fixtures';
import { useDashboardData } from '../state/DataContext';
import { calculateCrmRates, calculateHotjarAverage } from '../lib/calculations';
import { formatPercent } from '../lib/format';
import { SOURCES } from '../constants/sources';
import { DEFAULT_TOUCHPOINT_ICON, TOUCHPOINT_ICONS } from '../constants/touchpointIcons';
import type { JourneyStage } from '../types';
import './JourneyPage.css';

const STAGES: Array<{ id: JourneyStage; label: string; icon: typeof Compass; tagline: string }> = [
  { id: 'before', label: 'Before Stay', icon: CalendarSearch, tagline: 'Discovery, search, booking' },
  { id: 'during', label: 'During Stay', icon: Compass, tagline: 'On-site experience' },
  { id: 'after', label: 'After Stay', icon: CircleCheck, tagline: 'Follow-up, feedback, loyalty' },
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
  const { hotjarRows, crmRows } = useDashboardData();

  const rowsWithoutStage = useMemo(
    () =>
      hotjarRows.filter((row) => !row.journeyStage).length + crmRows.filter((row) => !row.journeyStage).length,
    [hotjarRows, crmRows],
  );

  const stageHotjar = hotjarRows.filter((row) => row.journeyStage === stage);
  const stageCrm = crmRows.filter((row) => row.journeyStage === stage);
  const stageWebAverage = calculateHotjarAverage(stageHotjar.map((row) => row.score));
  const stageCrmRates = calculateCrmRates(stageCrm);

  const touchpoints = journeyTouchpointsByStage[stage] ?? [];
  const activeStageIndex = STAGES.findIndex((s) => s.id === stage);

  return (
    <div className="journey-page">
      <div className={`journey-hero journey-hero--${stage}`}>
        <div className="journey-hero__inner">
          <div>
            <p className="journey-hero__eyebrow">Center Parcs Europe · 6 markets · Multi-source scope</p>
            <h1>Customer Voice Journey</h1>
            <p className="journey-hero__subtitle">
              Follow the guest from search to follow-up, and see which sources cover each step.
            </p>
          </div>
          <button type="button" className="journey-page__cta" onClick={onEnterDashboard}>
            Enter Dashboard <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="journey-stepper">
          <div className="journey-stepper__track">
            <div
              className="journey-stepper__progress"
              style={{ width: `${(activeStageIndex / (STAGES.length - 1)) * 100}%` }}
            />
          </div>
          {STAGES.map((s, index) => {
            const Icon = s.icon;
            const isActive = s.id === stage;
            const isPast = index < activeStageIndex;
            return (
              <button
                key={s.id}
                type="button"
                className={`journey-stepper__step${isActive ? ' journey-stepper__step--active' : ''}${isPast ? ' journey-stepper__step--past' : ''}`}
                onClick={() => setStage(s.id)}
                aria-current={isActive}
              >
                <span className="journey-stepper__node">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <span className="journey-stepper__label">{s.label}</span>
                <span className="journey-stepper__tagline">{s.tagline}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="journey-page__body">
        <div className="journey-page__sources">
          {SOURCES.map((source) => (
            <span key={source.id} className={`source-badge source-badge--${source.status}`} title={source.note}>
              {source.hotCold === 'hot' ? <Flame size={12} aria-hidden="true" /> : <Snowflake size={12} aria-hidden="true" />}
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

          <ol className="journey-timeline">
            {touchpoints.map((touchpoint, index) => {
              const Icon = TOUCHPOINT_ICONS[touchpoint.touchpoint] ?? DEFAULT_TOUCHPOINT_ICON;
              return (
                <li className="journey-timeline__item" key={touchpoint.touchpoint}>
                  <span className={`journey-timeline__node journey-timeline__node--${stage}`}>
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <div className="journey-timeline__card">
                    <p className="journey-timeline__step">Step {index + 1}</p>
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
                </li>
              );
            })}
          </ol>
        </section>

        <div className="journey-page__legend">
          <span className="legend-chip">
            <Flame size={13} aria-hidden="true" /> Hot = collected in real time (e.g. Hotjar in-situ)
          </span>
          <span className="legend-chip">
            <Snowflake size={13} aria-hidden="true" /> Cold = collected retrospectively (MyCP, CRM, Medallia)
          </span>
        </div>
      </div>
    </div>
  );
}
