import { useMemo, useState } from 'react';
import { ArrowRight, CalendarSearch, CircleCheck, Compass, Flame, Snowflake } from 'lucide-react';
import { journeyTouchpointsByStage } from '../lib/fixtures';
import { useDashboardData } from '../state/DataContext';
import {
  calculateAverageScore,
  calculateCrmRates,
  calculateHotjarAverage,
  calculateMyCpNps,
} from '../lib/calculations';
import { formatNps, formatPercent } from '../lib/format';
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
  const { hotjarRows, crmRows, mycpRows, medalliaRows } = useDashboardData();

  const rowsWithoutStage = useMemo(
    () =>
      hotjarRows.filter((row) => !row.journeyStage).length + crmRows.filter((row) => !row.journeyStage).length,
    [hotjarRows, crmRows],
  );

  const stageHotjar = hotjarRows.filter((row) => row.journeyStage === stage);
  const stageCrm = crmRows.filter((row) => row.journeyStage === stage);
  const stageMyCp = mycpRows.filter((row) => row.journeyStage === stage);
  const stageWebAverage = calculateHotjarAverage(stageHotjar.map((row) => row.score));
  const stageCrmRates = calculateCrmRates(stageCrm);
  const stageMyCpAverage = calculateAverageScore(stageMyCp.map((row) => row.score));
  const stageMyCpNps = calculateMyCpNps(stageMyCp.map((row) => row.score));
  // Medallia is an after-stay survey by definition (docs/DATA_MODEL_ADDENDUM.md
  // §3) - it has no journeyStage of its own, so its card only applies at 'after'.
  const medalliaAverage = calculateAverageScore(medalliaRows.map((row) => row.score));

  const activeStage = STAGES.find((s) => s.id === stage)!;
  const touchpoints = journeyTouchpointsByStage[stage] ?? [];
  const activeStageIndex = STAGES.findIndex((s) => s.id === stage);

  // Curated per-stage source pair (business feedback): only sources that
  // conceptually apply to a given stage get a card at all. Within an
  // applicable card, "Non applicable" is shown honestly when there is no
  // data yet - it is never hidden for that reason.
  const stageKpiCards: Array<{ key: string; label: string; value: string | null; unit?: string; footnote: string; tone: 'blue' | 'neutral' }> =
    stage === 'before'
      ? [
          {
            key: 'web',
            label: `Web (Hotjar) - ${activeStage.label}`,
            value: stageWebAverage !== null ? stageWebAverage.toFixed(1) : null,
            unit: ' / 5',
            footnote: `${stageHotjar.length} fixture rows for this stage`,
            tone: 'blue',
          },
          {
            key: 'crm',
            label: `CRM - ${activeStage.label}`,
            value: stageCrmRates.total > 0 ? String(stageCrmRates.total) : null,
            footnote: `${formatPercent(stageCrmRates.positiveRate)} positive · ${formatPercent(stageCrmRates.negativeRate)} negative`,
            tone: 'neutral',
          },
        ]
      : stage === 'during'
        ? [
            {
              key: 'mycp',
              label: `MyCP - ${activeStage.label}`,
              value: stageMyCpAverage !== null ? stageMyCpAverage.toFixed(1) : null,
              unit: ' / 10',
              footnote: stageMyCpAverage !== null ? `NPS ${formatNps(stageMyCpNps)} · ${stageMyCp.length} rows for this stage` : 'No MyCP rows tagged for this stage yet',
              tone: 'blue',
            },
            {
              key: 'mia-whatsapp',
              label: `MIA WhatsApp - ${activeStage.label}`,
              value: null,
              footnote: 'Not connected yet - planned source (see Data Sources panel).',
              tone: 'neutral',
            },
          ]
        : [
            {
              key: 'crm',
              label: `CRM - ${activeStage.label}`,
              value: stageCrmRates.total > 0 ? String(stageCrmRates.total) : null,
              footnote: `${formatPercent(stageCrmRates.positiveRate)} positive · ${formatPercent(stageCrmRates.negativeRate)} negative`,
              tone: 'neutral',
            },
            {
              key: 'medallia',
              label: `Medallia - ${activeStage.label}`,
              value: medalliaAverage !== null ? medalliaAverage.toFixed(1) : null,
              unit: ' / 10',
              footnote: medalliaAverage !== null ? `${medalliaRows.length} rows loaded` : 'Planned source - not connected yet (see Data Sources panel).',
              tone: 'blue',
            },
          ];

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
        <h2 className="journey-page__stage-title">{activeStage.label}</h2>
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
          {stageKpiCards.map((card) => (
            <div className={`kpi-card${card.tone === 'blue' ? ' kpi-card--blue' : ''}`} key={card.key}>
              <p className="kpi-card__label">{card.label}</p>
              {card.value !== null ? (
                <p className="kpi-card__value">
                  {card.value}
                  {card.unit ? <span className="kpi-card__unit">{card.unit}</span> : null}
                </p>
              ) : (
                <p className="kpi-card__empty">Non applicable</p>
              )}
              <p className="kpi-card__footnote">{card.footnote}</p>
            </div>
          ))}
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
            <Flame size={13} aria-hidden="true" /> Hot = collected in real time (Web/Hotjar, MyCP, MIA WhatsApp)
          </span>
          <span className="legend-chip">
            <Snowflake size={13} aria-hidden="true" /> Cold = collected retrospectively (CRM, Medallia, Brand Monitoring)
          </span>
        </div>
      </div>
    </div>
  );
}
