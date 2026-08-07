import { TAB_ORDER, TAB_OWNERSHIP, type TabId } from '../constants/ownership';
import './TabNav.css';

type TabNavProps = {
  activeTab: TabId;
  onSelect: (tab: TabId) => void;
};

/**
 * Five-tab navigation, in the fixed historical order:
 * Overview, CRM, CSAT, Bugs & Info, Verbatims.
 */
export function TabNav({ activeTab, onSelect }: TabNavProps) {
  return (
    <nav className="cv-tabnav" aria-label="Dashboard tabs">
      <ul className="cv-tabnav__list" role="tablist">
        {TAB_ORDER.map((tabId) => {
          const tab = TAB_OWNERSHIP[tabId];
          const isActive = tabId === activeTab;
          const Icon = tab.icon;
          return (
            <li key={tabId} role="presentation">
              <button
                type="button"
                role="tab"
                id={`tab-${tabId}`}
                aria-selected={isActive}
                aria-controls={`tabpanel-${tabId}`}
                className={`cv-tabnav__button${isActive ? ' cv-tabnav__button--active' : ''}`}
                onClick={() => onSelect(tabId)}
                title={tab.ownerTooltip}
              >
                <Icon size={15} aria-hidden="true" />
                {tab.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
