import React, { useState } from 'react';
import { AppScreen, ChecklistRecord } from './types';
import { HomeScreen } from './screens/HomeScreen';
import { NewChecklistScreen } from './screens/NewChecklistScreen';
import { ReportCompletedScreen } from './screens/ReportCompletedScreen';
import { AdminUnitScreen } from './screens/AdminUnitScreen';
import { SavedChecklistsScreen } from './screens/SavedChecklistsScreen';

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('HOME');
  const [lastCompletedRecord, setLastCompletedRecord] = useState<ChecklistRecord | null>(null);

  const handleStartNewChecklist = () => {
    setCurrentScreen('NEW_CHECKLIST');
  };

  const handleFinishChecklist = (record: ChecklistRecord) => {
    setLastCompletedRecord(record);
    setCurrentScreen('REPORT_COMPLETED');
  };

  const handleNavigateHome = () => {
    setCurrentScreen('HOME');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-[#0A2240] selection:text-white">
      {currentScreen === 'HOME' && (
        <HomeScreen
          onNavigate={(screen) => setCurrentScreen(screen)}
          onStartNewChecklist={handleStartNewChecklist}
        />
      )}

      {currentScreen === 'NEW_CHECKLIST' && (
        <NewChecklistScreen
          onNavigateBack={handleNavigateHome}
          onFinishChecklist={handleFinishChecklist}
        />
      )}

      {currentScreen === 'REPORT_COMPLETED' && (
        <ReportCompletedScreen
          record={lastCompletedRecord}
          onNavigateHome={handleNavigateHome}
        />
      )}

      {currentScreen === 'ADMIN_UNITS' && (
        <AdminUnitScreen onNavigateBack={handleNavigateHome} />
      )}

      {currentScreen === 'SAVED_CHECKLISTS' && (
        <SavedChecklistsScreen onNavigateBack={handleNavigateHome} />
      )}
    </div>
  );
};

export default App;
