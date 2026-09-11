import React from 'react';
import type { ScreenTab, ThemeMode } from '../types';
import { tokens } from '../lib/theme';

interface HeaderProps {
  currentTab: ScreenTab;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onHelplineClick: () => void;
}

export const tabLabel = (tab: ScreenTab) => {
  switch (tab) {
    case 'scan':
      return 'Scan';
    case 'analysis':
      return 'Analysis';
    case 'share-dossier':
      return 'Share card';
    case 'grievance':
      return 'Grievance';
    case '13-patterns':
      return '13 Patterns';
    default:
      return 'Watchdog';
  }
};

export const BrandMark: React.FC<{ theme: ThemeMode; size?: number }> = ({ theme, size = 32 }) => {
  const t = tokens(theme);
  return (
    <div
      className={`rounded-lg flex items-center justify-center shrink-0 ${t.isDark ? 'bg-[#23232B] border border-[#33333C]' : 'bg-[#f0edf4] border border-[#e2bfb6]'}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span className={`material-symbols-outlined ${t.accent}`} style={{ fontSize: Math.round(size * 0.62) }}>
        policy
      </span>
    </div>
  );
};

/** Top bar for phones and tablets. Hidden on desktop, where the Sidebar takes over. */
export const Header: React.FC<HeaderProps> = ({ currentTab, theme, onToggleTheme, onHelplineClick }) => {
  const t = tokens(theme);

  return (
    <header
      className={`lg:hidden fixed top-0 inset-x-0 z-50 pt-safe transition-colors duration-200 backdrop-blur-xl ${
        t.isDark ? 'bg-[#15151A]/95 border-b border-[#33333C] text-[#F1EFE9]' : 'bg-[#fbf8ff]/95 border-b border-[#e2bfb6]/40 text-[#1b1b20] shadow-[0_1px_8px_rgba(0,0,0,0.04)]'
      }`}
    >
      <div className="h-16 px-4 md:px-6 max-w-lg md:max-w-2xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <BrandMark theme={theme} />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-headline-lg text-headline-lg tracking-tight uppercase leading-none font-bold">SNITCH</span>
              <span className={`hidden sm:inline-block px-1.5 py-[2px] rounded font-citation-badge text-citation-badge uppercase tracking-wider font-bold border ${t.accentSoft}`}>
                CCPA · India · 2023
              </span>
            </div>
            <span className={`font-label-md text-label-md line-clamp-1 leading-tight ${t.muted}`}>{tabLabel(currentTab)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onHelplineClick}
            title="Consumer Helpline 1915"
            aria-label="Consumer Helpline 1915"
            className={`w-11 h-11 rounded-lg flex items-center justify-center transition-colors ${t.isDark ? 'text-[#A8A6A0] hover:text-[#FF7043] hover:bg-[#23232B]' : 'text-[#5a413a] hover:text-[#ae2b00] hover:bg-[#f0edf4]'} ${t.focus}`}
          >
            <span className="material-symbols-outlined text-[22px]" aria-hidden="true">support_agent</span>
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            title={`Switch to ${t.isDark ? 'light' : 'dark'} mode`}
            aria-label={`Switch to ${t.isDark ? 'light' : 'dark'} mode`}
            className={`w-11 h-11 rounded-full flex items-center justify-center font-bold transition-transform active:scale-95 shadow-sm ${t.accentBg} ${t.focus}`}
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">{t.isDark ? 'dark_mode' : 'light_mode'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
