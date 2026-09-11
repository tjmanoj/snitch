import React from 'react';
import { ScreenTab, ThemeMode } from '../types';

interface HeaderProps {
  currentTab: ScreenTab;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onEmergencyClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  theme,
  onToggleTheme,
  onEmergencyClick,
}) => {
  const getSubLabel = () => {
    switch (currentTab) {
      case 'scan':
        return 'Scan';
      case 'analysis':
        return 'Analysis';
      case 'share-dossier':
        return 'Evidence Dossier';
      case 'grievance':
        return 'Grievance';
      case '13-patterns':
        return '13 Patterns';
      default:
        return 'Watchdog';
    }
  };

  const isDark = theme === 'dark';

  return (
    <header
      className={`fixed top-0 w-full z-50 pt-safe transition-colors duration-200 ${
        isDark
          ? 'bg-[#15151A]/95 border-b border-[#33333C] text-[#F1EFE9]'
          : 'bg-[#fbf8ff]/95 border-b border-[#e2bfb6]/40 text-[#1b1b20] shadow-[0_1px_8px_rgba(0,0,0,0.04)]'
      } backdrop-blur-xl`}
    >
      <div className="h-16 px-4 max-w-lg mx-auto flex items-center justify-between">
        {/* Left Brand Identity */}
        <div className="flex items-center gap-2.5">
          <img
            alt="Snitch Watchdog Logo"
            className="h-8 w-auto object-contain rounded brightness-110"
            src="https://lh3.googleusercontent.com/aida/AEtjO1XvSnJ9hGa-Oz7U_eyWVW8xtHFmm2sCcGi_67JtDPo3FZbPXoKwtRiizgHas0hKaIJmH0VNx2PAIHnGd8VNeAW1LWYZaUbSQ-Xi3Npg3gASMB9cSe1eip_cO7TznG6UA5f1FhyzxWsEcy5GG4SWST_Ltyckj3VyriS_7Qz1cjr85decfKAmxAs2nkuAsgxptN2TSPLd0zm2GsJWeWCYBv_JMP8-sz1PoC8aOHPoL2iJjw77GUWy8CZAviDd"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-headline-lg text-headline-lg tracking-tight uppercase leading-none font-bold">
                SNITCH
              </span>
              <span
                className={`px-1.5 py-[2px] rounded font-citation-badge text-citation-badge uppercase tracking-wider font-bold ${
                  isDark
                    ? 'bg-[#FF7043]/15 text-[#FF7043] border border-[#FF7043]/30'
                    : 'bg-[#ffdad6] text-[#ae2b00] border border-[#d1431a]/30'
                }`}
              >
                CCPA 2023 WATCHDOG
              </span>
            </div>
            <span
              className={`font-label-md text-label-md line-clamp-1 leading-tight ${
                isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
              }`}
            >
              {getSubLabel()}
            </span>
          </div>
        </div>

        {/* Right Actions: Emergency 1915 + Theme Toggle */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onEmergencyClick}
            title="Emergency Consumer Helpline 1915"
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
              isDark
                ? 'text-[#A8A6A0] hover:text-[#FF7043] hover:bg-[#23232B]'
                : 'text-[#5a413a] hover:text-[#ae2b00] hover:bg-[#f0edf4]'
            }`}
            aria-label="National Consumer Helpline"
          >
            <span className="material-symbols-outlined text-[22px]">emergency</span>
          </button>

          <button
            onClick={onToggleTheme}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-transform active:scale-95 shadow-sm ${
              isDark
                ? 'bg-[#FF7043] text-[#15151A] hover:opacity-95'
                : 'bg-[#ae2b00] text-white hover:opacity-95'
            }`}
            aria-label="Toggle Theme"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isDark ? 'dark_mode' : 'light_mode'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
