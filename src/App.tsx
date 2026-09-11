import React, { useState, useEffect } from 'react';
import { ScreenTab, ThemeMode, AuditDocket } from './types';
import { TEST_DOCKETS } from './data/dockets';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ScanScreen } from './components/ScanScreen';
import { AnalysisScreen } from './components/AnalysisScreen';
import { ShareDossierScreen } from './components/ShareDossierScreen';
import { GrievanceScreen } from './components/GrievanceScreen';
import { PatternsScreen } from './components/PatternsScreen';
import { HelplineModal } from './components/HelplineModal';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<ScreenTab>('scan');
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('snitch_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  const [activeDocket, setActiveDocket] = useState<AuditDocket>(TEST_DOCKETS[0]);
  const [customImage, setCustomImage] = useState<string | undefined>(undefined);
  const [isScanning, setIsScanning] = useState(false);
  const [isHelplineOpen, setIsHelplineOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('snitch_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleStartAudit = (docket: AuditDocket, uploadedImg?: string) => {
    setActiveDocket(docket);
    setCustomImage(uploadedImg);
    setIsScanning(true);
    setCurrentTab('analysis');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuditPattern = (patternId: string) => {
    if (patternId.includes('urgency')) {
      handleStartAudit(TEST_DOCKETS[0]);
    } else if (patternId.includes('basket') || patternId.includes('drip') || patternId.includes('interference')) {
      handleStartAudit(TEST_DOCKETS[1]);
    } else {
      handleStartAudit(TEST_DOCKETS[2]);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        theme === 'dark'
          ? 'bg-[#15151A] text-[#F1EFE9]'
          : 'bg-[#fbf8ff] text-[#1b1b20]'
      }`}
    >
      {/* Top Application Bar */}
      <Header
        currentTab={currentTab}
        theme={theme}
        onToggleTheme={toggleTheme}
        onEmergencyClick={() => setIsHelplineOpen(true)}
      />

      {/* Main Responsive Centered Screen Container */}
      <main className="flex-1 w-full max-w-lg mx-auto px-4 pt-20 pb-20">
        {currentTab === 'scan' && (
          <ScanScreen theme={theme} onStartAudit={handleStartAudit} />
        )}

        {currentTab === 'analysis' && (
          <AnalysisScreen
            theme={theme}
            docket={activeDocket}
            customImage={customImage}
            isScanning={isScanning}
            onCancelScan={() => {
              setIsScanning(false);
              setCurrentTab('scan');
            }}
            onCompleteScan={() => {
              setIsScanning(false);
            }}
            onGoToGrievance={() => {
              setCurrentTab('grievance');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onGoToShareDossier={() => {
              setCurrentTab('share-dossier');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'share-dossier' && (
          <ShareDossierScreen
            theme={theme}
            docket={activeDocket}
            customImage={customImage}
            onBackToAnalysis={() => setCurrentTab('analysis')}
            onGoToGrievance={() => {
              setCurrentTab('grievance');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'grievance' && (
          <GrievanceScreen
            theme={theme}
            docket={activeDocket}
            onGoToAnalysis={() => setCurrentTab('analysis')}
          />
        )}

        {currentTab === '13-patterns' && (
          <PatternsScreen
            theme={theme}
            onAuditPattern={handleAuditPattern}
          />
        )}
      </main>

      {/* Persistent Mobile Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        theme={theme}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Emergency Helpline Modal */}
      <HelplineModal
        isOpen={isHelplineOpen}
        theme={theme}
        onClose={() => setIsHelplineOpen(false)}
      />
    </div>
  );
};

export default App;
