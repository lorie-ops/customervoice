import { Bug, ChartColumn, ChartPie, Mail, MessageSquareText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * Business-role ownership per tab.
 *
 * Source of truth: docs/OWNERSHIP_MATRIX.md.
 * Used to label each tab so a CRM, Product, Marketing, or Design lead
 * immediately understands whose tab they are looking at, without having
 * the other tabs explained first.
 */

export type OwnerRole = 'CRM' | 'Product' | 'Marketing' | 'Design';

export type TabId = 'overview' | 'crm' | 'csat' | 'bugs-info' | 'verbatims';

export type TabOwnership = {
  id: TabId;
  label: string;
  icon: LucideIcon;
  /** Short subtitle shown under the tab title, e.g. in a card header. */
  ownerSubtitle: string;
  /** Longer explanation shown in a tooltip / info affordance. */
  ownerTooltip: string;
};

export const TAB_OWNERSHIP: Record<TabId, TabOwnership> = {
  overview: {
    id: 'overview',
    label: 'Overview',
    icon: ChartColumn,
    ownerSubtitle: 'Owner: Marketing project lead',
    ownerTooltip:
      'Primary owner: Marketing project lead (cross-tab reporting view for leadership). Contributors: CRM, Product.',
  },
  crm: {
    id: 'crm',
    label: 'CRM',
    icon: Mail,
    ownerSubtitle: 'Owner: CRM project lead',
    ownerTooltip:
      'Primary owner: CRM project lead (daily/weekly operational pulse and Action Plan). Contributors: Marketing (campaigns).',
  },
  csat: {
    id: 'csat',
    label: 'CSAT',
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

export const TAB_ORDER: TabId[] = ['overview', 'crm', 'csat', 'bugs-info', 'verbatims'];

/**
 * The Design lead has no dedicated tab, but validates visual consistency
 * (colors, chart readability, empty states, header/nav) across all five.
 * See docs/OWNERSHIP_MATRIX.md.
 */
export const DESIGN_LEAD_NOTE =
  'Design lead: no dedicated tab - validates visual consistency (color coding, chart readability, empty states) across all five tabs.';
