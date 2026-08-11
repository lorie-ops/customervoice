import { Bug, ChartColumn, ChartPie, Compass, Mail, MessageSquareText, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * Business-role ownership per tab.
 *
 * Source of truth: docs/OWNERSHIP_MATRIX.md.
 * Used to label each tab so a CRM, Product, Marketing, or Design lead
 * immediately understands whose tab they are looking at, without having
 * the other tabs explained first. Overview has no dedicated owner shown
 * (it is a cross-tab reporting view, not owned content) - ownerSubtitle/
 * ownerTooltip are optional for that reason.
 */

export type OwnerRole = 'CRM' | 'Product' | 'Marketing' | 'Design';

export type TabId = 'overview' | 'brand-monitoring' | 'web' | 'crm' | 'mycp' | 'bugs-info' | 'verbatims';

export type TabOwnership = {
  id: TabId;
  label: string;
  icon: LucideIcon;
  /** Short subtitle shown under the tab title, e.g. in a card header. Omitted for tabs with no single owner. */
  ownerSubtitle?: string;
  /** Longer explanation shown in a tooltip / info affordance. */
  ownerTooltip?: string;
};

export const TAB_OWNERSHIP: Record<TabId, TabOwnership> = {
  overview: {
    id: 'overview',
    label: 'Overview',
    icon: ChartColumn,
    // Intentionally no owner subtitle - this is a cross-tab reporting view, not a single team's tab.
  },
  'brand-monitoring': {
    id: 'brand-monitoring',
    label: 'Brand Monitoring',
    icon: TrendingUp,
    ownerSubtitle: 'Owner: Marketing brand lead',
    ownerTooltip:
      'Primary owner: Marketing brand lead (annual Brand Monitor reporting - awareness, consideration, brand image). Contributors: Marketing project lead.',
  },
  web: {
    id: 'web',
    label: 'Web',
    icon: Compass,
    ownerSubtitle: 'Owner: Marketing / Customer insight lead',
    ownerTooltip:
      'Primary owner: Marketing / Customer insight lead (in-situ website satisfaction, Hotjar). Contributors: Product (technical items in verbatims).',
  },
  crm: {
    id: 'crm',
    label: 'CRM',
    icon: Mail,
    ownerSubtitle: 'Owner: CRM project lead',
    ownerTooltip:
      'Primary owner: CRM project lead (daily/weekly operational pulse and Action Plan). Contributors: Marketing (campaigns).',
  },
  mycp: {
    id: 'mycp',
    label: 'MyCP',
    icon: ChartPie,
    ownerSubtitle: 'Owner: Marketing / Customer insight lead',
    ownerTooltip:
      'Primary owner: Marketing / Customer insight lead (monthly satisfaction reporting). Contributors: Product (technical items in verbatims).',
  },
  'bugs-info': {
    id: 'bugs-info',
    label: 'Bugs & Info',
    icon: Bug,
    ownerSubtitle: 'Owner: Product project lead',
    ownerTooltip:
      'Primary owner: Product project lead (weekly backlog prioritization). Contributors: Design (UX friction), CRM (customer reports).',
  },
  verbatims: {
    id: 'verbatims',
    label: 'Verbatims',
    icon: MessageSquareText,
    ownerSubtitle: 'Cross-team exploration tool - no single owner',
    ownerTooltip:
      'Used on demand by all roles for ad-hoc investigation. Not owned by a single business role.',
  },
};

export const TAB_ORDER: TabId[] = ['overview', 'brand-monitoring', 'web', 'crm', 'mycp', 'bugs-info', 'verbatims'];

/**
 * The Design lead has no dedicated tab, but validates visual consistency
 * (colors, chart readability, empty states, header/nav) across all tabs.
 * See docs/OWNERSHIP_MATRIX.md.
 */
export const DESIGN_LEAD_NOTE =
  'Design lead: no dedicated tab - validates visual consistency (color coding, chart readability, empty states) across all tabs.';
