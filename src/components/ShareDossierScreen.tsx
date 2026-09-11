import React, { useState } from 'react';
import { ThemeMode, AuditDocket } from '../types';

interface ShareDossierScreenProps {
  theme: ThemeMode;
  docket: AuditDocket;
  customImage?: string;
  onBackToAnalysis: () => void;
  onGoToGrievance: () => void;
}

export const ShareDossierScreen: React.FC<ShareDossierScreenProps> = ({
  theme,
  docket,
  customImage,
  onBackToAnalysis,
  onGoToGrievance,
}) => {
  const isDark = theme === 'dark';
  const [aspect, setAspect] = useState<'square' | 'story'>('square');
  const [piiEnabled, setPiiEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  const handleDownload = () => {
    showToast('Generating high-resolution PNG evidence card...');
    // Simulate real file download trigger
    setTimeout(() => {
      const link = document.createElement('a');
      link.download = `snitch_evidence_${docket.domain}_${Date.now()}.png`;
      // Use the verified evidence screenshot as image payload
      link.href =
        customImage ||
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBFdbJ2is6CQRSHLb2AtARDPdnHoSqej4PQ4xtYnWEACnT9LXRHR-zbp3n_6tNiu0msjv8i-EulPhPyxoeVt2ibvT3f9PPWO5eACLKjF8oVAsLHXqcxP_faqoqkauSwigkeTUFD8xG5wL5cwqKb4SwS3DqCPfMD9_x-ro43wjeEUhy13FwBXMnXsYWgQBPhASnWZ0dmJXXcYI4r2qyIYvXuOjs9ppgsB6ap5C9zikc0jijsCAvRs09D0Q';
      link.target = '_blank';
      link.click();
      showToast('Evidence report saved to device!');
    }, 600);
  };

  const sharePlatform = (platform: 'x' | 'whatsapp' | 'linkedin') => {
    const text = encodeURIComponent(
      `🚨 Verified deceptive dark patterns on ${docket.domain}! Audited 3 CCPA 2023 statutory violations (False Urgency, Basket Sneaking, Confirm Shaming) via @SnitchWatchdog. Report filed under Section 18 Consumer Protection Act. #DarkPatterns #CCPA #ConsumerRights`
    );
    const url = encodeURIComponent(window.location.href);

    if (platform === 'x') {
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    } else if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${text}%20${url}`, '_blank');
    } else {
      if (navigator.share) {
        navigator.share({
          title: `Snitch CCPA Audit: ${docket.domain}`,
          text: decodeURIComponent(text),
          url: window.location.href,
        }).catch(() => {});
      } else {
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
          '_blank'
        );
      }
    }
    showToast(`Opening ${platform.toUpperCase()} share dispatch...`);
  };

  return (
    <div className="flex flex-col w-full pb-20 space-y-4">
      {/* Back button */}
      <button
        type="button"
        onClick={onBackToAnalysis}
        className={`self-start inline-flex items-center gap-1 font-label-md text-label-md py-1 px-2 rounded transition-colors ${
          isDark
            ? 'text-[#A8A6A0] hover:text-[#F1EFE9] hover:bg-[#1B1B21]'
            : 'text-[#5a413a] hover:text-[#1b1b20] hover:bg-[#f0edf4]'
        }`}
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        <span>Back to Audit Findings</span>
      </button>

      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full animate-ping ${
              isDark ? 'bg-[#FF7043]' : 'bg-[#ae2b00]'
            }`}
          />
          <span
            className={`font-citation-badge text-citation-badge uppercase tracking-wider font-semibold ${
              isDark ? 'text-[#FF7043]' : 'text-[#ae2b00]'
            }`}
          >
            Public Evidence Dossier
          </span>
        </div>
        <h1
          className={`font-headline-lg text-headline-lg font-bold tracking-tight ${
            isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
          }`}
        >
          Shareable Violation Report
        </h1>
        <p
          className={`font-body-md text-body-md ${
            isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
          }`}
        >
          Call out dark patterns publicly. Spread consumer awareness on X, WhatsApp,
          and LinkedIn.
        </p>
      </div>

      {/* Aspect Ratio Segmented Control */}
      <div
        className={`flex items-center p-[3px] rounded-lg self-center w-full max-w-[340px] border ${
          isDark
            ? 'bg-[#1B1B21] border-[#33333C]'
            : 'bg-[#eae7ee] border-[#e2bfb6]'
        }`}
      >
        <button
          type="button"
          onClick={() => {
            setAspect('square');
            showToast('Export switched to 1:1 Square Feed Format');
          }}
          className={`flex-1 py-1.5 px-3 rounded font-label-md text-label-md transition-all flex items-center justify-center gap-1.5 font-semibold ${
            aspect === 'square'
              ? isDark
                ? 'bg-[#23232B] text-[#F1EFE9] border border-[#33333C] shadow-sm'
                : 'bg-white text-[#1b1b20] shadow-sm'
              : isDark
              ? 'text-[#A8A6A0] hover:text-[#F1EFE9]'
              : 'text-[#5a413a] hover:text-[#1b1b20]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">crop_square</span>
          <span>Square (1:1)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setAspect('story');
            showToast('Export switched to 9:16 Story Format');
          }}
          className={`flex-1 py-1.5 px-3 rounded font-label-md text-label-md transition-all flex items-center justify-center gap-1.5 font-semibold ${
            aspect === 'story'
              ? isDark
                ? 'bg-[#23232B] text-[#F1EFE9] border border-[#33333C] shadow-sm'
                : 'bg-white text-[#1b1b20] shadow-sm'
              : isDark
              ? 'text-[#A8A6A0] hover:text-[#F1EFE9]'
              : 'text-[#5a413a] hover:text-[#1b1b20]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">crop_portrait</span>
          <span>Story (9:16)</span>
        </button>
      </div>

      {/* Card Preview Canvas */}
      <div className="flex justify-center w-full">
        <div className="w-full max-w-[358px] transition-all duration-300">
          <div
            id="social-card"
            className={`w-full rounded-[10px] p-3.5 flex flex-col justify-between shadow-2xl transition-all duration-300 overflow-hidden relative border ${
              aspect === 'story' ? 'aspect-[9/16]' : 'aspect-square'
            } ${
              isDark
                ? 'bg-[#121216] border-[#33333C]'
                : 'bg-white border-[#e2bfb6]'
            }`}
          >
            {/* Top Bar inside Card */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isDark
                      ? 'bg-[#FF7043] shadow-[0_0_8px_rgba(255,112,67,0.7)]'
                      : 'bg-[#ae2b00]'
                  }`}
                />
                <span
                  className={`font-headline-md text-headline-md tracking-tight uppercase font-bold ${
                    isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
                  }`}
                >
                  SNITCHED
                </span>
              </div>
              <div
                className={`px-1.5 py-[2px] rounded font-citation-badge text-citation-badge tracking-wider font-bold border ${
                  isDark
                    ? 'bg-[#38100c] text-[#FF7043] border-[#FF7043]/40'
                    : 'bg-[#ffdad6] text-[#ae2b00] border-[#d1431a]/30'
                }`}
              >
                VERIFIED VIOLATION
              </div>
            </div>

            {/* Target Platform Banner */}
            <div
              className={`flex items-center justify-between px-2.5 py-1 rounded border my-1 ${
                isDark
                  ? 'bg-[#23232B] border-[#33333C]/70 text-[#F1EFE9]'
                  : 'bg-[#f0edf4] border-[#e2bfb6] text-[#1b1b20]'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={`material-symbols-outlined text-[15px] ${
                    isDark ? 'text-[#FF7043]' : 'text-[#ae2b00]'
                  }`}
                >
                  storefront
                </span>
                <span className="font-citation-code text-citation-code font-bold uppercase">
                  APP: {docket.id === 'zepto-cart' ? 'ZEPTO (Quick Commerce)' : docket.domain}
                </span>
              </div>
              <span
                className={`font-citation-badge text-citation-badge ${
                  isDark ? 'text-[#787672]' : 'text-[#8e7069]'
                }`}
              >
                24 OCT 2024
              </span>
            </div>

            {/* Evidence Screenshot with Visual Pins */}
            <div
              className={`relative w-full flex-1 my-1 rounded-lg overflow-hidden border flex items-center justify-center min-h-[130px] ${
                isDark
                  ? 'bg-[#23232B] border-[#33333C]'
                  : 'bg-[#eae7ee] border-[#e2bfb6]'
              }`}
            >
              <img
                alt="Shopping cart dark pattern evidence"
                className={`w-full h-full object-cover object-center ${
                  piiEnabled ? 'filter blur-[1px]' : ''
                }`}
                src={
                  customImage ||
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuBFdbJ2is6CQRSHLb2AtARDPdnHoSqej4PQ4xtYnWEACnT9LXRHR-zbp3n_6tNiu0msjv8i-EulPhPyxoeVt2ibvT3f9PPWO5eACLKjF8oVAsLHXqcxP_faqoqkauSwigkeTUFD8xG5wL5cwqKb4SwS3DqCPfMD9_x-ro43wjeEUhy13FwBXMnXsYWgQBPhASnWZ0dmJXXcYI4r2qyIYvXuOjs9ppgsB6ap5C9zikc0jijsCAvRs09D0Q'
                }
              />

              {/* Shading overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

              {/* Pin 1: Urgency Timer */}
              <div className="absolute top-3 right-4 flex items-center gap-1 select-none">
                <div
                  className={`w-6 h-6 rounded-full font-bold text-[10px] flex items-center justify-center shadow-lg ring-1 ring-white ${
                    isDark
                      ? 'bg-[#FF7043] text-white'
                      : 'bg-[#ae2b00] text-white'
                  }`}
                >
                  1
                </div>
                <div
                  className={`px-1.5 py-0.5 rounded font-citation-badge text-[9px] backdrop-blur-sm shadow-sm border ${
                    isDark
                      ? 'bg-[#121216]/95 text-[#F1EFE9] border-[#33333C]'
                      : 'bg-black/90 text-white border-white/20'
                  }`}
                >
                  Timer Lock
                </div>
              </div>

              {/* Pin 2: Auto-Bag Fee */}
              <div className="absolute top-1/2 left-4 flex items-center gap-1 select-none">
                <div
                  className={`w-6 h-6 rounded-full font-bold text-[10px] flex items-center justify-center shadow-lg ring-1 ring-white ${
                    isDark
                      ? 'bg-[#FF7043] text-white'
                      : 'bg-[#ae2b00] text-white'
                  }`}
                >
                  2
                </div>
                <div
                  className={`px-1.5 py-0.5 rounded font-citation-badge text-[9px] backdrop-blur-sm shadow-sm border ${
                    isDark
                      ? 'bg-[#121216]/95 text-[#F1EFE9] border-[#33333C]'
                      : 'bg-black/90 text-white border-white/20'
                  }`}
                >
                  Auto-Bag Fee
                </div>
              </div>

              {/* Pin 3: Shame Opt-Out */}
              <div className="absolute bottom-3 right-6 flex items-center gap-1 select-none">
                <div
                  className={`w-6 h-6 rounded-full font-bold text-[10px] flex items-center justify-center shadow-lg ring-1 ring-white ${
                    isDark
                      ? 'bg-[#FF7043] text-white'
                      : 'bg-[#ae2b00] text-white'
                  }`}
                >
                  3
                </div>
                <div
                  className={`px-1.5 py-0.5 rounded font-citation-badge text-[9px] backdrop-blur-sm shadow-sm border ${
                    isDark
                      ? 'bg-[#121216]/95 text-[#F1EFE9] border-[#33333C]'
                      : 'bg-black/90 text-white border-white/20'
                  }`}
                >
                  Shame Opt-Out
                </div>
              </div>

              {/* Redaction Overlay (Toggled) */}
              {piiEnabled && (
                <div
                  className={`absolute bottom-2 left-2 px-2 py-1 backdrop-blur-md rounded flex items-center gap-1 shadow-md border ${
                    isDark
                      ? 'bg-[#1B1B21]/95 border-[#33333C] text-[#F1EFE9]'
                      : 'bg-white/95 border-[#e2bfb6] text-[#1b1b20]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[13px] text-[#2DD4BF]">
                    verified_user
                  </span>
                  <span className="font-citation-badge text-citation-badge text-[9px] font-semibold">
                    PII REDACTED (CCPA Compliant)
                  </span>
                </div>
              )}
            </div>

            {/* Violations Breakdown List */}
            <div className="flex flex-col gap-1 my-1">
              <div
                className={`flex items-center justify-between px-2 py-1 rounded border ${
                  isDark
                    ? 'bg-[#23232B] border-[#33333C]/50 text-[#F1EFE9]'
                    : 'bg-[#f5f2fa] border-[#e2bfb6]/60 text-[#1b1b20]'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className={`w-4 h-4 rounded-full font-bold text-[10px] flex items-center justify-center text-white ${
                      isDark ? 'bg-[#FF7043]' : 'bg-[#ae2b00]'
                    }`}
                  >
                    1
                  </span>
                  <span className="font-citation-code text-citation-code font-bold truncate">
                    FALSE URGENCY
                  </span>
                </div>
                <span
                  className={`font-citation-badge text-citation-badge uppercase ${
                    isDark ? 'text-[#787672]' : 'text-[#8e7069]'
                  }`}
                >
                  CCPA 1.1
                </span>
              </div>

              <div
                className={`flex items-center justify-between px-2 py-1 rounded border ${
                  isDark
                    ? 'bg-[#23232B] border-[#33333C]/50 text-[#F1EFE9]'
                    : 'bg-[#f5f2fa] border-[#e2bfb6]/60 text-[#1b1b20]'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className={`w-4 h-4 rounded-full font-bold text-[10px] flex items-center justify-center text-white ${
                      isDark ? 'bg-[#FF7043]' : 'bg-[#ae2b00]'
                    }`}
                  >
                    2
                  </span>
                  <span className="font-citation-code text-citation-code font-bold truncate">
                    BASKET SNEAKING
                  </span>
                </div>
                <span
                  className={`font-citation-badge text-citation-badge uppercase ${
                    isDark ? 'text-[#787672]' : 'text-[#8e7069]'
                  }`}
                >
                  CCPA 1.2
                </span>
              </div>

              <div
                className={`flex items-center justify-between px-2 py-1 rounded border ${
                  isDark
                    ? 'bg-[#23232B] border-[#33333C]/50 text-[#F1EFE9]'
                    : 'bg-[#f5f2fa] border-[#e2bfb6]/60 text-[#1b1b20]'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className={`w-4 h-4 rounded-full font-bold text-[10px] flex items-center justify-center text-white ${
                      isDark ? 'bg-[#FF7043]' : 'bg-[#ae2b00]'
                    }`}
                  >
                    3
                  </span>
                  <span className="font-citation-code text-citation-code font-bold truncate">
                    CONFIRM SHAMING
                  </span>
                </div>
                <span
                  className={`font-citation-badge text-citation-badge uppercase ${
                    isDark ? 'text-[#787672]' : 'text-[#8e7069]'
                  }`}
                >
                  CCPA 1.3
                </span>
              </div>
            </div>

            {/* Card Footer Strip */}
            <div
              className={`pt-1 flex items-center justify-between border-t font-citation-badge text-citation-badge text-[9px] uppercase tracking-wider ${
                isDark
                  ? 'border-[#33333C]/60 text-[#787672]'
                  : 'border-[#e2bfb6] text-[#8e7069]'
              }`}
            >
              <div className="flex items-center gap-1">
                <span
                  className={`font-bold ${
                    isDark ? 'text-[#FF7043]' : 'text-[#ae2b00]'
                  }`}
                >
                  SNITCHED
                </span>
                <span>· 3 PATTERNS</span>
              </div>
              <span>CCPA GUIDELINES 2023</span>
              <span
                className={`font-bold ${
                  isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
                }`}
              >
                SNITCH.APP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy & Redaction Controls Card */}
      <div
        className={`rounded-xl p-3.5 border shadow-sm flex flex-col gap-2.5 ${
          isDark
            ? 'bg-[#1B1B21] border-[#33333C]'
            : 'bg-white border-[#e2bfb6]/70'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${
                isDark
                  ? 'bg-[#23232B] border-[#33333C] text-[#2DD4BF]'
                  : 'bg-[#9cefdf] border-[#006b5e]/30 text-[#006b5e]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                shield_person
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span
                className={`font-headline-sm text-headline-sm truncate font-bold ${
                  isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
                }`}
              >
                Blur Personal Details
              </span>
              <span
                className={`font-body-sm text-body-sm truncate ${
                  isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
                }`}
              >
                Delivery address, phone number & card digits
              </span>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            aria-label="Toggle PII redaction"
            onClick={() => {
              setPiiEnabled(!piiEnabled);
              showToast(
                !piiEnabled ? 'PII auto-redaction enabled' : 'Raw unredacted view active'
              );
            }}
            className={`w-12 h-7 rounded-full p-0.5 transition-colors relative focus:outline-none shrink-0 shadow-inner ${
              piiEnabled
                ? isDark
                  ? 'bg-[#FF7043]'
                  : 'bg-[#ae2b00]'
                : isDark
                ? 'bg-[#33333C]'
                : 'bg-[#e4e1e8]'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full shadow-md transition-transform flex items-center justify-center ${
                piiEnabled
                  ? 'translate-x-5 bg-[#15151A] text-[#FF7043]'
                  : 'translate-x-0 bg-white text-gray-500'
              }`}
            >
              <span className="material-symbols-outlined text-[13px] font-bold">
                {piiEnabled ? 'check' : 'close'}
              </span>
            </div>
          </button>
        </div>

        <div
          className={`flex items-center justify-between p-2 rounded border ${
            isDark
              ? 'bg-[#23232B] border-[#33333C]/60 text-[#A8A6A0]'
              : 'bg-[#f5f2fa] border-[#e2bfb6] text-[#5a413a]'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">
              file_download_off
            </span>
            <span className="font-label-md text-label-md">
              Include CCPA Citation Watermark
            </span>
          </div>
          <span
            className={`font-citation-badge text-citation-badge uppercase font-bold ${
              isDark ? 'text-[#2DD4BF]' : 'text-[#006b5e]'
            }`}
          >
            Always On
          </span>
        </div>
      </div>

      {/* Action CTAs */}
      <div className="flex flex-col gap-2">
        {/* Primary CTA: Download PNG */}
        <button
          type="button"
          onClick={handleDownload}
          className={`w-full h-12 rounded-xl font-headline-sm text-headline-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.99] font-bold ${
            isDark
              ? 'bg-[#FF7043] hover:bg-[#ff845e] text-white shadow-[#FF7043]/20'
              : 'bg-[#ae2b00] hover:bg-[#d1431a] text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">download</span>
          <span>Download Image (PNG)</span>
        </button>

        {/* Social Share Grid */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => sharePlatform('x')}
            className={`h-11 rounded-lg border font-label-md text-label-md flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.99] font-semibold ${
              isDark
                ? 'bg-[#1B1B21] border-[#33333C] text-[#F1EFE9] hover:bg-[#23232B]'
                : 'bg-white border-[#e2bfb6] text-[#1b1b20] hover:bg-[#f5f2fa]'
            }`}
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>Post to X</span>
          </button>

          <button
            type="button"
            onClick={() => sharePlatform('whatsapp')}
            className={`h-11 rounded-lg border font-label-md text-label-md flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.99] font-semibold ${
              isDark
                ? 'bg-[#1B1B21] border-[#33333C] text-[#F1EFE9] hover:bg-[#23232B]'
                : 'bg-white border-[#e2bfb6] text-[#1b1b20] hover:bg-[#f5f2fa]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] text-[#2DD4BF]">
              chat
            </span>
            <span>Send WhatsApp</span>
          </button>
        </div>

        {/* Share to LinkedIn & More Channels */}
        <button
          type="button"
          onClick={() => sharePlatform('linkedin')}
          className={`w-full h-11 rounded-lg border font-label-md text-label-md flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.99] font-semibold ${
            isDark
              ? 'bg-[#1B1B21] border-[#33333C] text-[#F1EFE9] hover:bg-[#23232B]'
              : 'bg-white border-[#e2bfb6] text-[#1b1b20] hover:bg-[#f5f2fa]'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[18px] ${
              isDark ? 'text-[#FF7043]' : 'text-[#ae2b00]'
            }`}
          >
            share
          </span>
          <span>Share to LinkedIn & More Channels</span>
        </button>
      </div>

      {/* Consumer Court Formal Escalation Footer Link */}
      <div className="flex flex-col items-center justify-center pt-2 gap-1 text-center">
        <button
          type="button"
          onClick={onGoToGrievance}
          className={`inline-flex items-center gap-1.5 font-headline-sm text-headline-sm hover:underline font-bold ${
            isDark ? 'text-[#FF7043]' : 'text-[#ae2b00]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">description</span>
          <span>Export formal PDF report for Consumer Court</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
        <span
          className={`font-citation-badge text-citation-badge uppercase tracking-wider ${
            isDark ? 'text-[#787672]' : 'text-[#8e7069]'
          }`}
        >
          Formatted as admissible Section 2(47) CCPA evidence bundle
        </span>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div
          className={`fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 z-50 text-sm font-medium transition-all ${
            isDark
              ? 'bg-[#23232B] text-[#F1EFE9] border border-[#33333C]'
              : 'bg-[#1b1b20] text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[18px] text-[#2DD4BF]">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
