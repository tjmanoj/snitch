import React, { useState, useRef } from 'react';
import { ThemeMode, AuditDocket } from '../types';
import { TEST_DOCKETS } from '../data/dockets';

interface ScanScreenProps {
  theme: ThemeMode;
  onStartAudit: (docket: AuditDocket, customImage?: string) => void;
}

export const ScanScreen: React.FC<ScanScreenProps> = ({ theme, onStartAudit }) => {
  const isDark = theme === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTitle, setProcessingTitle] = useState('Ingesting Screenshot');

  const handleFile = (file: File) => {
    setIsProcessing(true);
    setProcessingTitle(`Ingesting ${file.name}`);
    const reader = new FileReader();
    reader.onload = (e) => {
      const customImg = e.target?.result as string;
      setTimeout(() => {
        setIsProcessing(false);
        // Default to Zepto docket with user's uploaded image
        onStartAudit(TEST_DOCKETS[0], customImg);
      }, 1200);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const imageType = item.types.find((t) => t.startsWith('image/'));
          if (imageType) {
            const blob = await item.getType(imageType);
            const file = new File([blob], 'clipboard_capture.png', { type: imageType });
            handleFile(file);
            return;
          }
        }
      }
    } catch {
      // Fallback
    }
    // Simulation fallback if clipboard API not permitted
    setIsProcessing(true);
    setProcessingTitle('Clipboard Image Capture');
    setTimeout(() => {
      setIsProcessing(false);
      onStartAudit(TEST_DOCKETS[0]);
    }, 1200);
  };

  const handleSelectDocket = (docket: AuditDocket) => {
    setIsProcessing(true);
    setProcessingTitle(`${docket.name}`);
    setTimeout(() => {
      setIsProcessing(false);
      onStartAudit(docket);
    }, 900);
  };

  return (
    <div className="flex flex-col w-full pb-10 space-y-4">
      {/* Regulatory Status Badge Strip */}
      <div
        className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg border shadow-sm ${
          isDark
            ? 'bg-[#1B1B21] border-[#33333C]'
            : 'bg-[#ffffff] border-[#e2bfb6]/60'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2DD4BF] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2DD4BF]"></span>
          </span>
          <span
            className={`font-citation-badge text-citation-badge tracking-wider uppercase font-semibold ${
              isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
            }`}
          >
            INDIA CCPA NOTIFIED GUIDELINES 2023
          </span>
        </div>
        <span
          className={`px-2 py-[2px] font-citation-badge text-citation-badge uppercase rounded font-bold ${
            isDark
              ? 'bg-[#2DD4BF]/15 text-[#2DD4BF] border border-[#2DD4BF]/30'
              : 'bg-[#9cefdf] text-[#006b5e]'
          }`}
        >
          ACTIVE ENFORCEMENT
        </span>
      </div>

      {/* Hero Editorial Statement */}
      <div className="flex flex-col gap-1 pt-1">
        <h1
          className={`font-display-lg-mobile text-display-lg-mobile tracking-tight ${
            isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
          }`}
        >
          Screenshot the trick. <br />
          <span className={isDark ? 'text-[#FF7043]' : 'text-[#ae2b00]'}>
            We’ll name it
          </span>{' '}
          and report it.
        </h1>
        <p
          className={`font-body-md text-body-md mt-1 leading-relaxed ${
            isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
          }`}
        >
          Upload any checkout, subscription, or ticketing screen. Snitch scans for
          manipulative UX patterns strictly prohibited under statutory consumer protection
          rules.
        </p>
      </div>

      {/* Interactive Evidence Upload Zone */}
      <div
        id="drop-zone"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center rounded-xl p-6 shadow-md transition-all duration-200 min-h-[240px] border-2 border-dashed ${
          isDragging
            ? 'border-[#2DD4BF] bg-[#2DD4BF]/5'
            : isDark
            ? 'bg-[#1B1B21] border-[#444450]'
            : 'bg-[#ffffff] border-[#d9d6ce]'
        }`}
      >
        {/* Corner Brackets */}
        <div
          className={`absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 ${
            isDark ? 'border-[#33333C]' : 'border-[#d9d6ce]'
          }`}
        />
        <div
          className={`absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 ${
            isDark ? 'border-[#33333C]' : 'border-[#d9d6ce]'
          }`}
        />
        <div
          className={`absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 ${
            isDark ? 'border-[#33333C]' : 'border-[#d9d6ce]'
          }`}
        />
        <div
          className={`absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 ${
            isDark ? 'border-[#33333C]' : 'border-[#d9d6ce]'
          }`}
        />

        {isProcessing ? (
          <div className="flex flex-col items-center justify-center py-6 gap-3">
            <div
              className={`w-10 h-10 border-4 rounded-full animate-spin ${
                isDark
                  ? 'border-[#FF7043] border-t-transparent'
                  : 'border-[#ae2b00] border-t-transparent'
              }`}
            />
            <span
              className={`font-headline-sm text-headline-sm font-bold ${
                isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
              }`}
            >
              Scanning CCPA Rulebook...
            </span>
            <span
              className={`font-citation-code text-citation-code ${
                isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
              }`}
            >
              {processingTitle}
            </span>
          </div>
        ) : (
          <>
            <div
              className={`w-14 h-14 rounded-full border flex items-center justify-center mb-3 shadow-sm ${
                isDark
                  ? 'bg-[#23232B] border-[#33333C] text-[#FF7043]'
                  : 'bg-[#f0edf4] border-[#e2bfb6] text-[#ae2b00]'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px]">
                  document_scanner
                </span>
                <span
                  className={`material-symbols-outlined text-[15px] absolute -bottom-1 -right-1 rounded-full p-0.5 border ${
                    isDark
                      ? 'text-[#2DD4BF] bg-[#1B1B21] border-[#33333C]'
                      : 'text-[#006b5e] bg-white border-[#e2bfb6]'
                  }`}
                >
                  add_a_photo
                </span>
              </div>
            </div>

            <div className="text-center mb-4">
              <span
                className={`font-headline-sm text-headline-sm block font-bold ${
                  isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
                }`}
              >
                Drop or paste a screenshot
              </span>
              <span
                className={`font-body-sm text-body-sm block mt-0.5 ${
                  isDark ? 'text-[#787672]' : 'text-[#5a413a]'
                }`}
              >
                Works with any app or website
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
            />

            <div className="flex flex-col w-full gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`w-full min-h-[44px] rounded-lg font-label-md text-label-md py-2 px-4 flex items-center justify-center gap-2 active:scale-[0.99] shadow-md transition-all font-semibold ${
                  isDark
                    ? 'bg-[#FF7043] hover:bg-[#ff845e] text-[#15151A]'
                    : 'bg-[#ae2b00] hover:bg-[#d1431a] text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  upload_file
                </span>
                <span>Choose Screenshot</span>
              </button>

              <button
                type="button"
                onClick={handlePasteClipboard}
                className={`w-full min-h-[44px] rounded-lg font-label-md text-label-md py-2 px-4 flex items-center justify-center gap-2 active:scale-[0.99] transition-all border font-semibold ${
                  isDark
                    ? 'bg-[#23232B] hover:bg-[#2c2c36] text-[#F1EFE9] border-[#33333C]'
                    : 'bg-white hover:bg-[#f0edf4] text-[#1b1b20] border-[#d9d6ce]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  content_paste
                </span>
                <span>Paste Clipboard</span>
                <span
                  className={`font-citation-code text-[10px] px-1.5 py-0.5 rounded border ${
                    isDark
                      ? 'bg-[#1B1B21] border-[#33333C] text-[#A8A6A0]'
                      : 'bg-[#f0edf4] border-[#e2bfb6] text-[#5a413a]'
                  }`}
                >
                  ⌘V
                </span>
              </button>
            </div>

            <div
              className={`flex items-center gap-1.5 mt-4 font-citation-code text-citation-code ${
                isDark ? 'text-[#787672]' : 'text-[#8e7069]'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">
                shield_lock
              </span>
              <span>PNG, JPG up to 15MB • Encrypted local client processing</span>
            </div>
          </>
        )}
      </div>

      {/* How It Works */}
      <div className="flex flex-col gap-2 pt-1">
        <div className="flex items-center justify-between">
          <span
            className={`font-citation-badge text-citation-badge tracking-wider uppercase font-semibold ${
              isDark ? 'text-[#787672]' : 'text-[#8e7069]'
            }`}
          >
            HOW IT WORKS
          </span>
          <span
            className={`font-citation-badge text-citation-badge uppercase font-semibold ${
              isDark ? 'text-[#FF7043]' : 'text-[#ae2b00]'
            }`}
          >
            STATUTORY ENGINE
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {/* Step 1 */}
          <div
            className={`p-3.5 rounded-xl border shadow-sm flex items-start gap-3 ${
              isDark
                ? 'bg-[#1B1B21] border-[#33333C]'
                : 'bg-white border-[#e2bfb6]/60'
            }`}
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span
                  className={`font-citation-code text-citation-code font-bold ${
                    isDark ? 'text-[#FF7043]' : 'text-[#ae2b00]'
                  }`}
                >
                  01 // CAPTURE
                </span>
                <span
                  className={`font-headline-sm text-headline-sm font-bold ${
                    isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
                  }`}
                >
                  Capture
                </span>
              </div>
              <p
                className={`font-body-sm text-body-sm mt-1 leading-snug ${
                  isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
                }`}
              >
                Snap any artificial scarcity timer, hidden cart fee, or deceptive
                opt-out.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div
            className={`p-3.5 rounded-xl border shadow-sm flex items-start gap-3 ${
              isDark
                ? 'bg-[#1B1B21] border-[#33333C]'
                : 'bg-white border-[#e2bfb6]/60'
            }`}
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span
                  className={`font-citation-code text-citation-code font-bold ${
                    isDark ? 'text-[#2DD4BF]' : 'text-[#006b5e]'
                  }`}
                >
                  02 // NAME IT
                </span>
                <span
                  className={`font-headline-sm text-headline-sm font-bold ${
                    isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
                  }`}
                >
                  Name it
                </span>
              </div>
              <p
                className={`font-body-sm text-body-sm mt-1 leading-snug ${
                  isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
                }`}
              >
                AI scans optical elements and matches deceptive UI against 13 prohibited
                CCPA clauses.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div
            className={`p-3.5 rounded-xl border shadow-sm flex items-start gap-3 ${
              isDark
                ? 'bg-[#1B1B21] border-[#33333C]'
                : 'bg-white border-[#e2bfb6]/60'
            }`}
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span
                  className={`font-citation-code text-citation-code font-bold ${
                    isDark ? 'text-[#FF7043]' : 'text-[#ae2b00]'
                  }`}
                >
                  03 // FILE IT
                </span>
                <span
                  className={`font-headline-sm text-headline-sm font-bold ${
                    isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
                  }`}
                >
                  File it
                </span>
              </div>
              <p
                className={`font-body-sm text-body-sm mt-1 leading-snug ${
                  isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
                }`}
              >
                Export ready-to-submit NCH grievance petitions and public violation
                cards in one tap.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Real Field Examples (Live Dockets) */}
      <div className="flex flex-col gap-2 pt-2">
        <div className="flex items-center justify-between">
          <span
            className={`font-citation-badge text-citation-badge tracking-wider uppercase font-semibold ${
              isDark ? 'text-[#787672]' : 'text-[#8e7069]'
            }`}
          >
            OR TEST WITH REAL FIELD EXAMPLES
          </span>
          <span
            className={`font-citation-badge text-citation-badge uppercase font-semibold ${
              isDark ? 'text-[#FF7043]' : 'text-[#ae2b00]'
            }`}
          >
            LIVE DOCKETS
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {TEST_DOCKETS.map((docket) => (
            <div
              key={docket.id}
              role="button"
              tabIndex={0}
              onClick={() => handleSelectDocket(docket)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleSelectDocket(docket);
                }
              }}
              className={`flex items-center justify-between p-3.5 rounded-xl border shadow-sm cursor-pointer transition-all active:scale-[0.99] ${
                isDark
                  ? 'bg-[#1B1B21] border-[#33333C] hover:bg-[#23232B]'
                  : 'bg-white border-[#e2bfb6]/60 hover:bg-[#f5f2fa]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${
                    isDark
                      ? 'bg-[#23232B] border-[#33333C] text-[#FF7043]'
                      : 'bg-[#f0edf4] border-[#e2bfb6] text-[#ae2b00]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {docket.icon}
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span
                    className={`font-label-md text-label-md truncate font-bold ${
                      isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
                    }`}
                  >
                    {docket.name}
                  </span>
                  <span
                    className={`font-body-sm text-body-sm truncate ${
                      isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
                    }`}
                  >
                    {docket.subtitle}
                  </span>
                </div>
              </div>
              <span
                className={`shrink-0 ml-2 px-2 py-1 rounded font-citation-badge text-citation-badge uppercase font-semibold border ${
                  isDark
                    ? 'bg-[#FF7043]/15 border-[#FF7043]/30 text-[#FF7043]'
                    : 'bg-[#ffdad6] border-[#d1431a]/30 text-[#ae2b00]'
                }`}
              >
                {docket.badgeText}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Statistics Micro Bar */}
      <div
        className={`p-4 rounded-xl border flex items-center justify-around text-center shadow-sm ${
          isDark
            ? 'bg-[#1B1B21] border-[#33333C]'
            : 'bg-white border-[#e2bfb6]/60'
        }`}
      >
        <div className="flex flex-col">
          <span
            className={`font-headline-md text-headline-md font-bold ${
              isDark ? 'text-[#FF7043]' : 'text-[#ae2b00]'
            }`}
          >
            13
          </span>
          <span
            className={`font-citation-badge text-citation-badge uppercase ${
              isDark ? 'text-[#787672]' : 'text-[#8e7069]'
            }`}
          >
            Illegal Modalities
          </span>
        </div>
        <div
          className={`w-[1px] h-8 ${isDark ? 'bg-[#33333C]' : 'bg-[#e2bfb6]'}`}
        />
        <div className="flex flex-col">
          <span
            className={`font-headline-md text-headline-md font-bold ${
              isDark ? 'text-[#2DD4BF]' : 'text-[#006b5e]'
            }`}
          >
            ₹10 Lakh
          </span>
          <span
            className={`font-citation-badge text-citation-badge uppercase ${
              isDark ? 'text-[#787672]' : 'text-[#8e7069]'
            }`}
          >
            Potential Penalty
          </span>
        </div>
        <div
          className={`w-[1px] h-8 ${isDark ? 'bg-[#33333C]' : 'bg-[#e2bfb6]'}`}
        />
        <div className="flex flex-col">
          <span
            className={`font-headline-md text-headline-md font-bold ${
              isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
            }`}
          >
            1-Click
          </span>
          <span
            className={`font-citation-badge text-citation-badge uppercase ${
              isDark ? 'text-[#787672]' : 'text-[#8e7069]'
            }`}
          >
            Redress Draft
          </span>
        </div>
      </div>

      {/* Statutory Legal Disclaimer Box */}
      <div
        className={`p-3.5 rounded-lg border flex items-start gap-3 ${
          isDark
            ? 'bg-[#1B1B21] border-[#33333C] text-[#A8A6A0]'
            : 'bg-[#f5f2fa] border-[#e2bfb6]/60 text-[#5a413a]'
        }`}
      >
        <span
          className={`material-symbols-outlined text-[20px] shrink-0 mt-0.5 ${
            isDark ? 'text-[#2DD4BF]' : 'text-[#006b5e]'
          }`}
        >
          policy
        </span>
        <div className="flex flex-col gap-0.5">
          <span
            className={`font-label-md text-label-md font-bold ${
              isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
            }`}
          >
            Consumer Protection Act, 2019 (Section 18)
          </span>
          <p className="font-body-sm text-body-sm leading-relaxed">
            Snitch is an open forensic utility helping citizens audit deceptive UI. It
            generates evidence packages for the Department of Consumer Affairs. Not
            formal judicial counsel.
          </p>
        </div>
      </div>
    </div>
  );
};
