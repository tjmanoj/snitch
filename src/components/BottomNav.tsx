import React from 'react';
import { ScreenTab, ThemeMode } from '../types';

interface BottomNavProps {
  currentTab: ScreenTab;
  theme: ThemeMode;
  onSelectTab: (tab: ScreenTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  theme,
  onSelectTab,
}) => {
  const isDark = theme === 'dark';

  const tabs: { id: ScreenTab; label: string; icon: string }[] = [
    { id: 'scan', label: 'Scan', icon: 'search_check' },
    { id: 'analysis', label: 'Analysis', icon: 'filter_center_focus' },
    { id: 'grievance', label: 'Grievance', icon: 'gavel' },
    { id: '13-patterns', label: '13 Patterns', icon: 'menu_book' },
  ];

  return (
    <nav
      className={`fixed bottom-0 w-full z-50 pb-safe transition-colors duration-200 ${
        isDark
          ? 'bg-[#15151A]/95 border-t border-[#33333C] text-[#A8A6A0]'
          : 'bg-[#fbf8ff]/95 border-t border-[#e2bfb6]/40 text-[#5a413a] shadow-[0_-1px_8px_rgba(0,0,0,0.04)]'
      } backdrop-blur-xl`}
    >
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          // Treat 'share-dossier' as part of analysis or distinct highlight
          const isActive =
            currentTab === tab.id ||
            (tab.id === 'analysis' && currentTab === 'share-dossier');

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-[2px] w-full min-h-[44px] transition-all ${
                isActive
                  ? isDark
                    ? 'text-[#FF7043] font-semibold scale-105'
                    : 'text-[#ae2b00] font-semibold scale-105'
                  : isDark
                  ? 'text-[#A8A6A0] hover:text-[#F1EFE9]'
                  : 'text-[#5a413a] hover:text-[#1b1b20]'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[22px] ${
                  isActive ? 'font-bold' : ''
                }`}
              >
                {tab.icon}
              </span>
              <span className="font-citation-badge text-citation-badge uppercase tracking-wider text-[10px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
