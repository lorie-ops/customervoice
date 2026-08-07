import { Info } from 'lucide-react';
import type { TabId } from '../constants/ownership';
import { TAB_OWNERSHIP } from '../constants/ownership';
import './TabHeader.css';

type TabHeaderProps = {
  tabId: TabId;
};

/**
 * Per-tab title + owner subtitle, so a CRM, Product, Marketing, or Design
 * lead can tell whose tab this is without reading the other tabs first.
 * See docs/OWNERSHIP_MATRIX.md.
 */
export function TabHeader({ tabId }: TabHeaderProps) {
  const tab = TAB_OWNERSHIP[tabId];
  const Icon = tab.icon;
  return (
    <div className="tab-header">
      <h1 className="tab-header__title">
        <Icon size={22} aria-hidden="true" />
        {tab.label}
      </h1>
      <p className="tab-header__owner" title={tab.ownerTooltip}>
        <Info size={14} aria-hidden="true" />
        {tab.ownerSubtitle}
      </p>
    </div>
  );
}
