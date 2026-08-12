import { useState } from 'react';
import { Header } from './components/Header';
import { TabNav } from './components/TabNav';
import { DataLoaderPanel } from './components/DataLoaderPanel';
import { OverviewTab } from './tabs/OverviewTab';
import { BrandMonitoringTab } from './tabs/BrandMonitoringTab';
import { WebTab } from './tabs/WebTab';
import { CrmTab } from './tabs/CrmTab';
import { MyCpTab } from './tabs/MyCpTab';
import { AfterStayTab } from './tabs/AfterStayTab';
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
            {activeTab === 'brand-monitoring' && <BrandMonitoringTab />}
            {activeTab === 'web' && <WebTab />}
            {activeTab === 'crm' && <CrmTab />}
            {activeTab === 'mycp' && <MyCpTab />}
            {activeTab === 'after-stay' && <AfterStayTab />}
            {activeTab === 'bugs-info' && <BugsInfoTab />}
            {activeTab === 'verbatims' && <VerbatimsTab />}
          </main>
        </div>
      )}
    </DataProvider>
  );
}

export default App;
