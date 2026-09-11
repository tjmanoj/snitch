import React from 'react';
import { ThemeMode } from '../types';

interface HelplineModalProps {
  isOpen: boolean;
  theme: ThemeMode;
  onClose: () => void;
}

export const HelplineModal: React.FC<HelplineModalProps> = ({
  isOpen,
  theme,
  onClose,
}) => {
  if (!isOpen) return null;
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-2xl p-5 border shadow-2xl relative ${
          isDark
            ? 'bg-[#1B1B21] border-[#33333C] text-[#F1EFE9]'
            : 'bg-white border-[#e2bfb6] text-[#1b1b20]'
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className={`absolute top-2.5 right-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors ${
            isDark
              ? 'text-[#A8A6A0] hover:text-white hover:bg-[#23232B]'
              : 'text-[#5a413a] hover:text-[#1b1b20] hover:bg-[#f0edf4]'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="flex items-center gap-2.5 mb-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              isDark
                ? 'bg-[#FF7043]/20 text-[#FF7043] border border-[#FF7043]/30'
                : 'bg-[#ffdad6] text-[#ae2b00]'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
              support_agent
            </span>
          </div>
          <div>
            <h3 className="font-headline-md text-headline-md font-bold">
              National Consumer Helpline
            </h3>
            <span
              className={`font-citation-badge text-citation-badge uppercase ${
                isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
              }`}
            >
              Ministry of Consumer Affairs, Govt of India
            </span>
          </div>
        </div>

        <p
          className={`font-body-md text-body-md mb-4 leading-relaxed ${
            isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
          }`}
        >
          If you have been defrauded, subjected to coercive subscription billing, or
          unauthorized auto-debits, file an immediate complaint through official
          statutory channels:
        </p>

        <div className="flex flex-col gap-2.5 mb-5">
          <a
            href="tel:1915"
            className={`flex items-center justify-between p-3.5 rounded-xl border transition-transform active:scale-[0.99] font-bold ${
              isDark
                ? 'bg-[#FF7043] text-[#15151A] border-[#FF7043]'
                : 'bg-[#ae2b00] text-white border-[#ae2b00]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[22px]">call</span>
              <div className="flex flex-col items-start">
                <span className="font-headline-sm leading-tight">Dial 1915 (Toll-Free)</span>
                <span className="text-[11px] opacity-80 font-normal">
                  Operates 8:00 AM – 8:00 PM (All days except National Holidays)
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[18px]">
              arrow_forward
            </span>
          </a>

          <a
            href="https://api.whatsapp.com/send?phone=918800001915&text=Consumer%20Grievance%20Help"
            target="_blank"
            rel="noreferrer"
            className={`flex items-center justify-between p-3 rounded-xl border transition-transform active:scale-[0.99] font-semibold ${
              isDark
                ? 'bg-[#23232B] border-[#33333C] text-[#F1EFE9] hover:bg-[#2c2c36]'
                : 'bg-[#f5f2fa] border-[#e2bfb6] text-[#1b1b20] hover:bg-[#eae7ee]'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#2DD4BF]">
                chat
              </span>
              <span>WhatsApp Consumer Helpline (+91 8800001915)</span>
            </div>
            <span className="material-symbols-outlined text-[16px]">
              open_in_new
            </span>
          </a>

          <a
            href="https://consumerhelpline.gov.in"
            target="_blank"
            rel="noreferrer"
            className={`flex items-center justify-between p-3 rounded-xl border transition-transform active:scale-[0.99] font-semibold ${
              isDark
                ? 'bg-[#23232B] border-[#33333C] text-[#F1EFE9] hover:bg-[#2c2c36]'
                : 'bg-[#f5f2fa] border-[#e2bfb6] text-[#1b1b20] hover:bg-[#eae7ee]'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">public</span>
              <span>INGRAM Web Portal (consumerhelpline.gov.in)</span>
            </div>
            <span className="material-symbols-outlined text-[16px]">
              open_in_new
            </span>
          </a>
        </div>

        <button
          type="button"
          onClick={onClose}
          className={`w-full min-h-[44px] py-2.5 rounded-lg border font-label-md font-semibold transition-colors ${
            isDark
              ? 'bg-[#15151A] border-[#33333C] text-[#A8A6A0] hover:text-white'
              : 'bg-white border-[#e2bfb6] text-[#5a413a] hover:text-[#1b1b20]'
          }`}
        >
          Close
        </button>
      </div>
    </div>
  );
};
