import React from 'react';
import type { ScreenTab, ThemeMode } from '../types';
import { tokens } from '../lib/theme';

interface NavProps {
  currentTab: ScreenTab;
  theme: ThemeMode;
  onSelectTab: (tab: ScreenTab) => void;
  /** Badge count shown on the Analysis tab (number of findings in the current result). */
  findingsCount?: number;
}

export const NAV_TABS: { id: ScreenTab; label: string; icon: string }[] = [
  { id: 'scan', label: 'Scan', icon: 'search_check' },
  { id: 'analysis', label: 'Analysis', icon: 'filter_center_focus' },
  { id: 'grievance', label: 'Grievance', icon: 'gavel' },
  { id: '13-patterns', label: '13 Patterns', icon: 'menu_book' },
];

export const isTabActive = (tab: ScreenTab, current: ScreenTab) => current === tab || (tab === 'analysis' && current === 'share-dossier');

/** Bottom tab bar for phones and tablets. Hidden on desktop. */
export const BottomNav: React.FC<NavProps> = ({ currentTab, theme, onSelectTab, findingsCount }) => {
  const t = tokens(theme);

  return (
    <nav
      aria-label="Primary"
      className={`lg:hidden fixed bottom-0 inset-x-0 z-50 pb-safe transition-colors duration-200 backdrop-blur-xl ${
        t.isDark ? 'bg-[#15151A]/95 border-t border-[#33333C] text-[#A8A6A0]' : 'bg-[#fbf8ff]/95 border-t border-[#e2bfb6]/40 text-[#5a413a] shadow-[0_-1px_8px_rgba(0,0,0,0.04)]'
      }`}
    >
      <div className="flex justify-around items-center h-16 landscape:h-14 max-w-lg md:max-w-2xl mx-auto px-2">
        {NAV_TABS.map((tab) => {
          const active = isTabActive(tab.id, currentTab);
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              aria-current={active ? 'page' : undefined}
              className={`relative flex flex-col md:flex-row items-center justify-center gap-[2px] md:gap-2 w-full min-h-[44px] rounded-lg transition-colors ${
                active ? `${t.accent} font-semibold` : `${t.muted} ${t.hoverText}`
              } ${t.focus}`}
            >
              <span className={`material-symbols-outlined text-[22px] ${active ? 'font-bold' : ''}`} aria-hidden="true">{tab.icon}</span>
              <span className="font-citation-badge text-citation-badge uppercase tracking-wider text-[10px] md:text-[11px]">{tab.label}</span>
              {tab.id === 'analysis' && !!findingsCount && (
                <span className="absolute top-1 right-[calc(50%-22px)] md:static md:ml-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF7043] text-white text-[10px] font-bold font-citation-code flex items-center justify-center" aria-label={`${findingsCount} findings`}>
                  {findingsCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

interface SidebarProps extends NavProps {
  onToggleTheme: () => void;
  onHelplineClick: () => void;
  apiLabel: string;
}

/** Left sidebar for desktop (≥1024px). */
export const Sidebar: React.FC<SidebarProps> = ({ currentTab, theme, onSelectTab, findingsCount, onToggleTheme, onHelplineClick, apiLabel }) => {
  const t = tokens(theme);
  return (
    <aside
      className={`hidden lg:flex flex-col w-64 shrink-0 h-dvh sticky top-0 border-r px-4 py-6 gap-6 ${t.isDark ? 'bg-[#121216] border-[#33333C]' : 'bg-white border-[#e2bfb6]/60'}`}
      aria-label="Sidebar"
    >
      <div className="flex items-center gap-3 px-1">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${t.isDark ? 'bg-[#23232B] border border-[#33333C]' : 'bg-[#f0edf4] border border-[#e2bfb6]'}`} aria-hidden="true">
          <span className={`material-symbols-outlined text-[24px] ${t.accent}`}>policy</span>
        </div>
        <div className="flex flex-col">
          <span className={`font-headline-lg text-headline-lg uppercase leading-none font-bold tracking-tight ${t.text}`}>SNITCH</span>
          <span className={`font-citation-badge text-citation-badge uppercase tracking-wider ${t.dim}`}>Dark-pattern watchdog</span>
        </div>
      </div>

      <nav aria-label="Primary" className="flex flex-col gap-1">
        {NAV_TABS.map((tab) => {
          const active = isTabActive(tab.id, currentTab);
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 min-h-[44px] px-3 rounded-lg text-left transition-colors ${
                active ? (t.isDark ? 'bg-[#FF7043]/12 text-[#FF7043]' : 'bg-[#ffdad6] text-[#ae2b00]') : `${t.muted} ${t.isDark ? 'hover:bg-[#1B1B21]' : 'hover:bg-[#f5f2fa]'}`
              } ${t.focus}`}
            >
              <span className="material-symbols-outlined text-[22px]" aria-hidden="true">{tab.icon}</span>
              <span className="font-label-md text-label-md font-semibold">{tab.label}</span>
              {tab.id === 'analysis' && !!findingsCount && (
                <span className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full bg-[#FF7043] text-white text-[11px] font-bold font-citation-code flex items-center justify-center">{findingsCount}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-2">
        <button type="button" onClick={onHelplineClick} className={`flex items-center gap-3 min-h-[44px] px-3 rounded-lg border text-left ${t.secondaryBtn} ${t.focus}`}>
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">support_agent</span>
          <span className="font-label-md text-label-md font-semibold">Consumer Helpline 1915</span>
        </button>
        <button type="button" onClick={onToggleTheme} className={`flex items-center gap-3 min-h-[44px] px-3 rounded-lg border text-left ${t.secondaryBtn} ${t.focus}`}>
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">{t.isDark ? 'light_mode' : 'dark_mode'}</span>
          <span className="font-label-md text-label-md font-semibold">{t.isDark ? 'Light mode' : 'Dark mode'}</span>
        </button>
        <div className={`px-3 pt-2 font-citation-code text-[11px] leading-snug ${t.dim}`}>
          <div>{apiLabel}</div>
          <div className="mt-1">Not legal advice. You file; Snitch never submits for you.</div>
        </div>
      </div>
    </aside>
  );
};
