import { useState } from 'react';
import { Header } from './components/Header';
import { TabNav } from './components/TabNav';
import { OverviewTab } from './tabs/OverviewTab';
import { CrmTab } from './tabs/CrmTab';
import { CsatTab } from './tabs/CsatTab';
import { BugsInfoTab } from './tabs/BugsInfoTab';
import { VerbatimsTab } from './tabs/VerbatimsTab';
import { JourneyPage } from './pages/JourneyPage';
import type { TabId } from './constants/ownership';
import './App.css';

type View = 'journey' | 'dashboard';

function App() {
  const [view, setView] = useState<View>('journey');
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  if (view === 'journey') {
    return <JourneyPage onEnterDashboard={() => setView('dashboard')} />;
  }

  return (
    <div className="cv-app">
      <Header onBackToJourney={() => setView('journey')} />
      <TabNav activeTab={activeTab} onSelect={setActiveTab} />
      <main className="cv-app__content">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'crm' && <CrmTab />}
        {activeTab === 'csat' && <CsatTab />}
        {activeTab === 'bugs-info' && <BugsInfoTab />}
        {activeTab === 'verbatims' && <VerbatimsTab />}
      </main>
    </div>
  );
}

export default App;
