import { useState } from 'react';
import { Header } from './components/Header';
import { TabNav } from './components/TabNav';
import { OverviewTab } from './tabs/OverviewTab';
import { CrmTab } from './tabs/CrmTab';
import { CsatTab } from './tabs/CsatTab';
import { BugsInfoTab } from './tabs/BugsInfoTab';
import { VerbatimsTab } from './tabs/VerbatimsTab';
import type { TabId } from './constants/ownership';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  return (
    <div className="cv-app">
      <Header />
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
