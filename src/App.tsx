import { useState } from 'react';
import { Header } from './components/Header';
import { TabNav } from './components/TabNav';
import { DataLoaderPanel } from './components/DataLoaderPanel';
import { OverviewTab } from './tabs/OverviewTab';
import { CrmTab } from './tabs/CrmTab';
import { CsatTab } from './tabs/CsatTab';
import { BugsInfoTab } from './tabs/BugsInfoTab';
import { VerbatimsTab } from './tabs/VerbatimsTab';
import { JourneyPage } from './pages/JourneyPage';
import { DataProvider } from './state/DataContext';
import type { TabId } from './constants/ownership';
import './App.css';

type View = 'journey' | 'dashboard';

function App() {
  const [view, setView] = useState<View>('journey');
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  return (
    <DataProvider>
      {view === 'journey' ? (
        <JourneyPage onEnterDashboard={() => setView('dashboard')} />
      ) : (
        <div className="cv-app">
          <Header onBackToJourney={() => setView('journey')} />
          <DataLoaderPanel />
          <TabNav activeTab={activeTab} onSelect={setActiveTab} />
          <main className="cv-app__content">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'crm' && <CrmTab />}
            {activeTab === 'csat' && <CsatTab />}
            {activeTab === 'bugs-info' && <BugsInfoTab />}
            {activeTab === 'verbatims' && <VerbatimsTab />}
          </main>
        </div>
      )}
    </DataProvider>
  );
}

export default App;
