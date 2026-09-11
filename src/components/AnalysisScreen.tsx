import React, { useState, useEffect } from 'react';
import { ThemeMode, AuditDocket } from '../types';

interface AnalysisScreenProps {
  theme: ThemeMode;
  docket: AuditDocket;
  customImage?: string;
  isScanning: boolean;
  onCancelScan: () => void;
  onCompleteScan: () => void;
  onGoToGrievance: () => void;
  onGoToShareDossier: () => void;
}

export const AnalysisScreen: React.FC<AnalysisScreenProps> = ({
  theme,
  docket,
  customImage,
  isScanning,
  onCancelScan,
  onCompleteScan,
  onGoToGrievance,
  onGoToShareDossier,
}) => {
  const isDark = theme === 'dark';
  const [timerSeconds, setTimerSeconds] = useState(299);
  const [beamPos, setBeamPos] = useState(0);
  const [beamDir, setBeamDir] = useState(1);
  const [selectedPinId, setSelectedPinId] = useState<number | null>(null);
  const [reportedIds, setReportedIds] = useState<number[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Animate laser scanning beam during scanning state
  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => {
      setBeamPos((prev) => {
        if (prev >= 95) {
          setBeamDir(-1);
          return 95;
        } else if (prev <= 5) {
          setBeamDir(1);
          return 5;
        }
        return prev + beamDir * 2.5;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [isScanning, beamDir]);

  // Countdown timer in scanned mockup
  useEffect(() => {
    const timer = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 299));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-finish scan after 3 seconds if active
  useEffect(() => {
    if (isScanning) {
      const finishTimeout = setTimeout(() => {
        onCompleteScan();
      }, 3200);
      return () => clearTimeout(finishTimeout);
    }
  }, [isScanning, onCompleteScan]);

  const formatTimer = (secs: number) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const handlePinClick = (pinId: number) => {
    setSelectedPinId(pinId);
    const element = document.getElementById(`finding-${pinId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleReportFinding = (id: number) => {
    if (!reportedIds.includes(id)) {
      setReportedIds([...reportedIds, id]);
      showToast('Finding reported to CCPA review board');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  /* ----------------------------------------------------
     STATE 1: SCANNING IN PROGRESS
     ---------------------------------------------------- */
  if (isScanning) {
    return (
      <div className="flex flex-col w-full pb-10">
        {/* Status Chip */}
        <div className="flex flex-col gap-2 mb-3">
          <div
            className={`inline-flex items-center self-start gap-1.5 px-3 py-1 rounded-full shadow-sm ${
              isDark
                ? 'bg-[#FF7043]/15 border border-[#FF7043]/30 text-[#FF7043]'
                : 'bg-[#ffdad6] text-[#ae2b00] border border-[#d1431a]/30'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full animate-ping ${
                isDark ? 'bg-[#FF7043]' : 'bg-[#ae2b00]'
              }`}
            />
            <span className="font-citation-badge text-citation-badge uppercase tracking-wider font-semibold">
              ANALYSIS IN PROGRESS • CCPA AUDIT
            </span>
          </div>

          <h2
            className={`font-display-lg-mobile text-display-lg-mobile tracking-tight ${
              isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
            }`}
          >
            Reading the screen… matching against 13 patterns
          </h2>

          <p
            className={`font-body-sm text-body-sm leading-relaxed ${
              isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
            }`}
          >
            Inspecting active DOM layers, pre-checked add-ons, and artificial scarcity
            timers against CCPA guidelines.
          </p>
        </div>

        {/* Audit Feed Box with Moving Laser */}
        <div
          className={`relative w-full rounded-xl p-2.5 shadow-xl overflow-hidden mb-3 border ${
            isDark
              ? 'bg-[#1B1B21] border-[#33333C]'
              : 'bg-[#eae7ee] border-[#e2bfb6]'
          }`}
        >
          <div
            className={`absolute top-2 left-2 font-citation-code text-[11px] select-none tracking-widest uppercase ${
              isDark ? 'text-[#787672]' : 'text-[#5d5c57]'
            }`}
          >
            [+] CORNER_TL // AUDIT_FEED
          </div>
          <div
            className={`absolute top-2 right-2 font-citation-code text-[11px] select-none tracking-widest uppercase ${
              isDark ? 'text-[#787672]' : 'text-[#5d5c57]'
            }`}
          >
            [+] CORNER_TR
          </div>

          {/* Simulated Cart Capture / Live Mockup */}
          <div
            className={`relative w-full rounded-lg overflow-hidden shadow-inner p-3 mt-4 border ${
              isDark
                ? 'bg-[#121216] border-[#33333C]'
                : 'bg-white border-[#e2bfb6]'
            }`}
          >
            {/* Store header */}
            <div
              className={`flex items-center justify-between pb-1 mb-2 px-2 py-1 rounded border ${
                isDark
                  ? 'bg-[#1B1B21] border-[#33333C]/60 text-[#F1EFE9]'
                  : 'bg-[#f5f2fa] border-[#e2bfb6]/60 text-[#1b1b20]'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={`material-symbols-outlined text-[16px] ${
                    isDark ? 'text-[#FF7043]' : 'text-[#ae2b00]'
                  }`}
                >
                  bolt
                </span>
                <span className="font-headline-sm text-[13px] font-bold">
                  {docket.name.includes('Zepto') || docket.id === 'zepto-cart'
                    ? 'Zepto Delivery • 10 Mins'
                    : docket.name}
                </span>
              </div>
              <span
                className={`font-citation-code text-[11px] font-semibold px-1.5 py-0.5 rounded border ${
                  isDark
                    ? 'bg-[#26A69A]/15 border-[#26A69A]/30 text-[#26A69A]'
                    : 'bg-[#9cefdf] text-[#006b5e]'
                }`}
              >
                LIVE ORDER
              </span>
            </div>

            {/* False Urgency Clock Box */}
            <div
              className={`relative overflow-hidden rounded-lg p-2 mb-2 flex items-center justify-between border ${
                isDark
                  ? 'bg-[#FF7043]/10 border-[#FF7043]/30 text-[#FF7043]'
                  : 'bg-[#ffdad6] border-[#d1431a]/30 text-[#ae2b00]'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0 pr-1">
                <span className="material-symbols-outlined text-[18px]">
                  alarm_on
                </span>
                <span className="font-label-md text-label-md font-bold truncate">
                  ⚡ High Demand: Only 2 checkout slots left! Reserve within
                </span>
              </div>
              <span
                className={`font-citation-code text-citation-code px-2 py-0.5 rounded font-bold border shrink-0 ${
                  isDark
                    ? 'bg-[#1B1B21] border-[#FF7043]/40 text-[#FF7043]'
                    : 'bg-white border-[#d1431a] text-[#ae2b00]'
                }`}
              >
                {formatTimer(timerSeconds)}
              </span>
            </div>

            {/* Cart Items */}
            <div className="flex flex-col gap-1 mb-2">
              <div
                className={`flex justify-between items-center px-2 py-1.5 rounded border ${
                  isDark
                    ? 'bg-[#1B1B21] border-[#33333C]/60 text-[#F1EFE9]'
                    : 'bg-[#f5f2fa] border-[#e2bfb6]/60 text-[#1b1b20]'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`material-symbols-outlined text-[16px] ${
                      isDark ? 'text-[#787672]' : 'text-[#5d5c57]'
                    }`}
                  >
                    shopping_bag
                  </span>
                  <span className="font-body-sm text-body-sm font-medium">
                    Aashirvaad Atta (5kg)
                  </span>
                </div>
                <span className="font-citation-code text-citation-code font-bold">
                  ₹245
                </span>
              </div>

              <div
                className={`flex justify-between items-center px-2 py-1.5 rounded border ${
                  isDark
                    ? 'bg-[#1B1B21] border-[#33333C]/60 text-[#F1EFE9]'
                    : 'bg-[#f5f2fa] border-[#e2bfb6]/60 text-[#1b1b20]'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`material-symbols-outlined text-[16px] ${
                      isDark ? 'text-[#787672]' : 'text-[#5d5c57]'
                    }`}
                  >
                    egg
                  </span>
                  <span className="font-body-sm text-body-sm font-medium">
                    Amul Taaza Milk (500ml)
                  </span>
                </div>
                <span className="font-citation-code text-citation-code font-bold">
                  ₹54
                </span>
              </div>

              {/* Drip fees */}
              <div
                className={`flex justify-between items-center px-2 py-1 ${
                  isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
                }`}
              >
                <span className="font-body-sm text-body-sm">
                  Handling fee (Surge prep)
                </span>
                <span className="font-citation-code text-citation-code">₹9</span>
              </div>

              <div
                className={`flex justify-between items-center px-2 py-1 ${
                  isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
                }`}
              >
                <span className="font-body-sm text-body-sm">
                  Surge fee (Peak demand slot)
                </span>
                <span className="font-citation-code text-citation-code">₹25</span>
              </div>
            </div>

            {/* Pre-ticked Addon */}
            <div
              className={`flex items-center justify-between p-2 rounded-lg border ${
                isDark
                  ? 'bg-[#1B1B21] border-[#33333C]/60'
                  : 'bg-[#f0edf4] border-[#e2bfb6]'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center font-bold ${
                    isDark
                      ? 'bg-[#FF7043] text-[#15151A]'
                      : 'bg-[#ae2b00] text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[13px] leading-none">
                    check
                  </span>
                </div>
                <span
                  className={`font-body-sm text-body-sm font-medium ${
                    isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
                  }`}
                >
                  Add ₹19 for Tip & Green Packaging
                </span>
              </div>
              <span
                className={`font-citation-badge text-citation-badge px-1.5 py-0.5 rounded border ${
                  isDark
                    ? 'bg-[#FF7043]/15 text-[#FF7043] border-[#FF7043]/30'
                    : 'bg-[#ffdad6] text-[#ae2b00] border-[#d1431a]/30'
                }`}
              >
                PRE-TICKED
              </span>
            </div>

            {/* Scanning Beam Bar */}
            <div
              className={`absolute inset-x-0 h-[2px] opacity-95 pointer-events-none transition-all duration-75 shadow-lg ${
                isDark
                  ? 'bg-gradient-to-r from-transparent via-[#FF7043] to-transparent shadow-[#FF7043]'
                  : 'bg-gradient-to-r from-transparent via-[#ae2b00] to-transparent shadow-[#ae2b00]'
              }`}
              style={{ top: `${beamPos}%` }}
            />
          </div>

          {/* Bottom Telemetry */}
          <div className="flex items-center justify-between mt-2 px-1">
            <div
              className={`font-citation-code text-[11px] select-none tracking-widest uppercase ${
                isDark ? 'text-[#787672]' : 'text-[#5d5c57]'
              }`}
            >
              [+] CORNER_BL
            </div>
            <div className="flex items-center gap-1">
              <span
                className={`w-1.5 h-1.5 rounded-full animate-ping ${
                  isDark ? 'bg-[#26A69A]' : 'bg-[#006b5e]'
                }`}
              />
              <span
                className={`font-citation-code text-[11px] font-semibold uppercase ${
                  isDark ? 'text-[#26A69A]' : 'text-[#006b5e]'
                }`}
              >
                OCR Engine Calibrated
              </span>
            </div>
            <div
              className={`font-citation-code text-[11px] select-none tracking-widest uppercase ${
                isDark ? 'text-[#787672]' : 'text-[#5d5c57]'
              }`}
            >
              [+] CORNER_BR
            </div>
          </div>
        </div>

        {/* Steps Progress List */}
        <div className="flex flex-col gap-1.5 mb-3">
          {/* Step 1 */}
          <div
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg border ${
              isDark
                ? 'bg-[#1B1B21] border-[#33333C]'
                : 'bg-[#f5f2fa] border-[#e2bfb6]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center border ${
                  isDark
                    ? 'bg-[#26A69A]/15 border-[#26A69A]/30 text-[#26A69A]'
                    : 'bg-[#9cefdf] text-[#006b5e] border-[#006b5e]/30'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  check_circle
                </span>
              </div>
              <div className="flex flex-col">
                <span
                  className={`font-headline-sm text-headline-sm ${
                    isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
                  }`}
                >
                  Step 1: Hierarchy & Optical Analysis
                </span>
                <span
                  className={`font-body-sm text-body-sm ${
                    isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
                  }`}
                >
                  Parsed 4 price nodes & 2 interactive checks
                </span>
              </div>
            </div>
            <span
              className={`font-citation-badge text-citation-badge px-2 py-0.5 rounded font-bold border ${
                isDark
                  ? 'bg-[#26A69A]/15 border-[#26A69A]/30 text-[#26A69A]'
                  : 'bg-[#9cefdf] text-[#006b5e] border-[#006b5e]/30'
              }`}
            >
              COMPLETED
            </span>
          </div>

          {/* Step 2 */}
          <div
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg border shadow-sm ${
              isDark
                ? 'bg-[#1B1B21] border-[#FF7043]/40'
                : 'bg-[#f0edf4] border-[#ae2b00]/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center border animate-pulse ${
                  isDark
                    ? 'bg-[#FF7043]/15 border-[#FF7043]/30 text-[#FF7043]'
                    : 'bg-[#ffdad6] border-[#d1431a]/30 text-[#ae2b00]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  search_insights
                </span>
              </div>
              <div className="flex flex-col">
                <span
                  className={`font-headline-sm text-headline-sm ${
                    isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
                  }`}
                >
                  Step 2: CCPA 2023 Dark Patterns Match
                </span>
                <span
                  className={`font-body-sm text-body-sm font-medium ${
                    isDark ? 'text-[#FF7043]' : 'text-[#ae2b00]'
                  }`}
                >
                  Flagging False Urgency & Basket Sneaking…
                </span>
              </div>
            </div>
            <span
              className={`font-citation-badge text-citation-badge px-2 py-0.5 rounded font-bold animate-pulse ${
                isDark
                  ? 'bg-[#FF7043] text-[#15151A]'
                  : 'bg-[#ae2b00] text-white'
              }`}
            >
              IN PROGRESS
            </span>
          </div>

          {/* Step 3 */}
          <div
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg border opacity-60 ${
              isDark
                ? 'bg-[#1B1B21] border-[#33333C]'
                : 'bg-[#f5f2fa] border-[#e2bfb6]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center border ${
                  isDark
                    ? 'bg-[#23232B] border-[#33333C] text-[#787672]'
                    : 'bg-[#e4e1e8] border-[#e2bfb6] text-[#5d5c57]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  radio_button_unchecked
                </span>
              </div>
              <div className="flex flex-col">
                <span
                  className={`font-headline-sm text-headline-sm ${
                    isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
                  }`}
                >
                  Step 3: Annexure 1 Clause Correlation
                </span>
                <span
                  className={`font-body-sm text-body-sm ${
                    isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
                  }`}
                >
                  Statutory precedent & penalty schedule mapping
                </span>
              </div>
            </div>
            <span
              className={`font-citation-badge text-citation-badge px-2 py-0.5 rounded font-bold ${
                isDark
                  ? 'bg-[#23232B] border border-[#33333C] text-[#787672]'
                  : 'bg-[#e4e1e8] text-[#5d5c57]'
              }`}
            >
              QUEUED
            </span>
          </div>
        </div>

        {/* Guideline Matrix Progress Banner */}
        <div
          className={`flex items-center justify-between p-3 rounded-lg border mb-4 ${
            isDark
              ? 'bg-[#1B1B21] border-[#33333C]'
              : 'bg-[#e4e1e8] border-[#e2bfb6]'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span
              className={`material-symbols-outlined text-[20px] ${
                isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
              }`}
            >
              fact_check
            </span>
            <span
              className={`font-label-md text-label-md ${
                isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
              }`}
            >
              Guideline Matrix Progress
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`font-citation-code text-citation-code font-bold ${
                isDark ? 'text-[#FF7043]' : 'text-[#ae2b00]'
              }`}
            >
              13 / 13 Guidelines Queried
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                isDark ? 'bg-[#FF7043] shadow-[0_0_6px_#FF7043]' : 'bg-[#ae2b00]'
              }`}
            />
          </div>
        </div>

        {/* Action: Cancel or Instant Skip */}
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={onCompleteScan}
            className={`w-full h-11 rounded-lg border font-headline-sm text-headline-sm flex items-center justify-center gap-1.5 transition-colors shadow-sm font-semibold active:scale-[0.99] ${
              isDark
                ? 'bg-[#FF7043] hover:bg-[#ff845e] text-[#15151A] border-[#FF7043]'
                : 'bg-[#ae2b00] hover:bg-[#d1431a] text-white border-[#ae2b00]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              fast_forward
            </span>
            <span>Skip to Findings</span>
          </button>

          <button
            type="button"
            onClick={onCancelScan}
            className={`w-full h-10 rounded-lg border font-label-md text-label-md flex items-center justify-center gap-1.5 transition-colors ${
              isDark
                ? 'bg-[#1B1B21] hover:bg-[#23232B] border-[#33333C] text-[#A8A6A0]'
                : 'bg-white hover:bg-[#f5f2fa] border-[#e2bfb6] text-[#5a413a]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
            <span>Cancel inspection</span>
          </button>

          <span
            className={`font-citation-badge text-citation-badge uppercase tracking-wider ${
              isDark ? 'text-[#787672]' : 'text-[#8e7069]'
            }`}
          >
            Audit session token #CCPA-2023-DEL-8942
          </span>
        </div>
      </div>
    );
  }

  /* ----------------------------------------------------
     STATE 2: COMPLETED AUDIT FINDINGS
     ---------------------------------------------------- */
  return (
    <div className="flex flex-col w-full pb-20">
      {/* Status & Confidence Ticker */}
      <div className="flex items-center justify-between py-1 mb-2">
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-block w-2 h-2 rounded-full animate-ping ${
              isDark ? 'bg-[#FF7043]' : 'bg-[#ae2b00]'
            }`}
          />
          <span
            className={`font-citation-badge text-citation-badge uppercase tracking-wider ${
              isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
            }`}
          >
            FORENSIC AUDIT RECORD #8492
          </span>
        </div>
        <span
          className={`font-citation-code text-citation-code font-semibold ${
            isDark ? 'text-[#FF7043]' : 'text-[#ae2b00]'
          }`}
        >
          100% COMPLETE
        </span>
      </div>

      {/* Summary Metric Banner */}
      <div
        className={`w-full rounded-xl p-3.5 border shadow-lg mb-3 ${
          isDark
            ? 'bg-[#1B1B21] border-[#33333C]'
            : 'bg-white border-[#e2bfb6]/70'
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span
                className={`material-symbols-outlined text-[18px] ${
                  isDark ? 'text-[#FF7043]' : 'text-[#ae2b00]'
                }`}
              >
                verified_user
              </span>
              <span
                className={`font-headline-sm text-headline-sm truncate font-bold ${
                  isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
                }`}
              >
                Audit Findings
              </span>
            </div>
            <span
              className={`font-body-sm text-body-sm mt-0.5 ${
                isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
              }`}
            >
              Target domain:{' '}
              <strong
                className={`font-semibold ${
                  isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
                }`}
              >
                {docket.domain}
              </strong>
            </span>
          </div>

          <div className="flex flex-col items-end shrink-0">
            <div
              className={`px-2.5 py-[3px] rounded-lg shadow-sm flex items-center gap-1 font-bold ${
                isDark
                  ? 'bg-[#FF7043] text-[#15151A]'
                  : 'bg-[#ae2b00] text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">warning</span>
              <span className="font-citation-badge text-citation-badge tracking-wider">
                SCORE {docket.score}
              </span>
            </div>
            <span
              className={`font-citation-badge text-citation-badge uppercase mt-0.5 font-bold ${
                isDark ? 'text-[#FF7043]' : 'text-[#ae2b00]'
              }`}
            >
              High Risk
            </span>
          </div>
        </div>

        {/* 3 Metric columns */}
        <div
          className={`grid grid-cols-3 gap-1 pt-1 mt-1 rounded-lg p-1 border ${
            isDark
              ? 'bg-[#23232B] border-[#33333C]'
              : 'bg-[#f0edf4] border-[#e2bfb6]'
          }`}
        >
          <div className="flex flex-col items-center text-center p-1">
            <span
              className={`font-headline-sm text-headline-sm font-bold ${
                isDark ? 'text-[#FF7043]' : 'text-[#ae2b00]'
              }`}
            >
              {docket.infractionCount}
            </span>
            <span
              className={`font-citation-badge text-citation-badge uppercase ${
                isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
              }`}
            >
              Infractions
            </span>
          </div>

          <div
            className={`flex flex-col items-center text-center p-1 rounded border ${
              isDark
                ? 'bg-[#1B1B21] border-[#33333C]/60 text-[#F1EFE9]'
                : 'bg-white border-[#e2bfb6] text-[#1b1b20]'
            }`}
          >
            <span className="font-headline-sm text-headline-sm font-bold truncate max-w-full px-1">
              {docket.id === 'zepto-cart' ? 'Zepto' : docket.domain.split('.')[0]}
            </span>
            <span
              className={`font-citation-badge text-citation-badge uppercase ${
                isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
              }`}
            >
              Identified App
            </span>
          </div>

          <div className="flex flex-col items-center text-center p-1">
            <span
              className={`font-headline-sm text-headline-sm font-bold ${
                isDark ? 'text-[#45dfa4]' : 'text-[#006b5e]'
              }`}
            >
              High
            </span>
            <span
              className={`font-citation-badge text-citation-badge uppercase ${
                isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
              }`}
            >
              Confidence
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Evidence Capture Preview with Visual Pins */}
      <div
        className={`relative w-full rounded-xl p-3.5 border shadow-lg mb-4 overflow-hidden ${
          isDark
            ? 'bg-[#1B1B21] border-[#33333C]'
            : 'bg-white border-[#e2bfb6]/70'
        }`}
      >
        <div
          className={`flex items-center justify-between pb-2 mb-2 border-b ${
            isDark ? 'border-[#33333C]' : 'border-[#e2bfb6]'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span
              className={`material-symbols-outlined text-[18px] ${
                isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
              }`}
            >
              screenshot_monitor
            </span>
            <span
              className={`font-label-md text-label-md font-bold ${
                isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
              }`}
            >
              Inspected Capture Preview
            </span>
          </div>
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded border ${
              isDark
                ? 'bg-[#23232B] border-[#33333C]'
                : 'bg-[#f0edf4] border-[#e2bfb6]'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[14px] ${
                isDark ? 'text-[#FF7043]' : 'text-[#ae2b00]'
              }`}
            >
              pin_drop
            </span>
            <span
              className={`font-citation-badge text-citation-badge ${
                isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
              }`}
            >
              {docket.pins.length} PINS LOGGED
            </span>
          </div>
        </div>

        {/* Mock Screen or Uploaded Image Container with Interactive Pins */}
        <div
          className={`relative w-full rounded-lg p-2.5 overflow-hidden select-none border ${
            isDark
              ? 'bg-[#15151A] border-[#33333C]'
              : 'bg-[#fbf8ff] border-[#e2bfb6]'
          }`}
        >
          {customImage ? (
            <div className="relative w-full min-h-[340px] max-h-[440px] rounded overflow-hidden flex items-center justify-center bg-black">
              <img
                src={customImage}
                alt="Audit screenshot"
                className="w-full h-full object-contain"
              />
              {/* Overlay pins */}
              {docket.pins.map((pin) => (
                <button
                  key={pin.id}
                  type="button"
                  onClick={() => handlePinClick(pin.id)}
                  style={{ top: pin.topPct, left: pin.leftPct }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-xl transition-transform active:scale-95 ${
                    selectedPinId === pin.id ? 'scale-125' : ''
                  } ${
                    isDark
                      ? 'bg-[#FF7043] text-[#15151A]'
                      : 'bg-[#ae2b00] text-white'
                  }`}
                >
                  {pin.id}
                </button>
              ))}
            </div>
          ) : (
            <>
              {/* Ambient Mock App Header */}
              <div
                className={`flex items-center justify-between mb-2 p-1.5 rounded border ${
                  isDark
                    ? 'bg-[#23232B] border-[#33333C]'
                    : 'bg-[#f0edf4] border-[#e2bfb6]'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-6 h-6 rounded border flex items-center justify-center font-bold text-[11px] ${
                      isDark
                        ? 'bg-[#FF7043]/20 border-[#FF7043]/40 text-[#FF7043]'
                        : 'bg-[#ffdad6] border-[#ae2b00]/40 text-[#ae2b00]'
                    }`}
                  >
                    Z
                  </div>
                  <span
                    className={`font-label-md text-label-md font-semibold ${
                      isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
                    }`}
                  >
                    Instant Delivery · 10 Mins
                  </span>
                </div>
                <span
                  className={`font-citation-badge text-citation-badge font-bold ${
                    isDark ? 'text-[#45dfa4]' : 'text-[#006b5e]'
                  }`}
                >
                  EXPRESS CART
                </span>
              </div>

              {/* Pin [1] Target: Ticking Countdown */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => handlePinClick(1)}
                className={`relative mb-2 rounded-lg p-2 border shadow-xs transition-transform active:scale-[0.99] cursor-pointer ${
                  selectedPinId === 1
                    ? 'ring-2 ring-[#FF7043]'
                    : ''
                } ${
                  isDark
                    ? 'bg-[#23232B] border-[#FF7043]/50 text-[#F1EFE9]'
                    : 'bg-[#ffdad6]/50 border-[#ae2b00]/40 text-[#1b1b20]'
                }`}
              >
                <div
                  className={`absolute -top-2 -left-2 z-10 w-6 h-6 rounded-full font-bold text-[11px] flex items-center justify-center shadow-md ring-2 ring-white ${
                    isDark
                      ? 'bg-[#FF7043] text-[#15151A]'
                      : 'bg-[#ae2b00] text-white'
                  }`}
                >
                  1
                </div>
                <div className="flex items-center justify-between pl-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`material-symbols-outlined text-[18px] ${
                        isDark ? 'text-[#FF7043]' : 'text-[#ae2b00]'
                      }`}
                    >
                      timer
                    </span>
                    <span
                      className={`font-label-md text-label-md font-bold ${
                        isDark ? 'text-[#FF7043]' : 'text-[#ae2b00]'
                      }`}
                    >
                      ⚡ High Demand: Only 2 slots left
                    </span>
                  </div>
                  <span
                    className={`font-citation-code text-citation-code px-2 py-[2px] rounded font-semibold tracking-wider ${
                      isDark
                        ? 'bg-[#FF7043] text-[#15151A]'
                        : 'bg-[#ae2b00] text-white'
                    }`}
                  >
                    {formatTimer(timerSeconds)}
                  </span>
                </div>
              </div>

              {/* Cart Items */}
              <div
                className={`rounded-lg p-2 mb-2 border flex flex-col gap-1 ${
                  isDark
                    ? 'bg-[#1B1B21] border-[#33333C]'
                    : 'bg-white border-[#e2bfb6]'
                }`}
              >
                <div
                  className={`flex justify-between items-center text-body-sm font-body-sm ${
                    isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
                  }`}
                >
                  <span>Organic Hass Avocados (2 pcs)</span>
                  <span className="font-citation-code text-[#A8A6A0]">₹189.00</span>
                </div>
                <div
                  className={`flex justify-between items-center text-body-sm font-body-sm ${
                    isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
                  }`}
                >
                  <span>Almond Milk Cold Pressed (1L)</span>
                  <span className="font-citation-code text-[#A8A6A0]">₹240.00</span>
                </div>

                {/* Pin [2] Target: Sneaky Pre-Selected Addon */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handlePinClick(2)}
                  className={`relative mt-1 pt-1.5 p-1.5 rounded border transition-transform active:scale-[0.99] cursor-pointer ${
                    selectedPinId === 2 ? 'ring-2 ring-[#FF7043]' : ''
                  } ${
                    isDark
                      ? 'bg-[#23232B] border-[#FF7043]/40'
                      : 'bg-[#ffdad6]/40 border-[#ae2b00]/30'
                  }`}
                >
                  <div
                    className={`absolute -top-2 -left-2 z-10 w-6 h-6 rounded-full font-bold text-[11px] flex items-center justify-center shadow-md ring-2 ring-white ${
                      isDark
                        ? 'bg-[#FF7043] text-[#15151A]'
                        : 'bg-[#ae2b00] text-white'
                    }`}
                  >
                    2
                  </div>
                  <div className="flex items-center justify-between pl-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`material-symbols-outlined text-[18px] ${
                          isDark ? 'text-[#FF7043]' : 'text-[#ae2b00]'
                        }`}
                      >
                        check_box
                      </span>
                      <span
                        className={`font-body-sm text-body-sm font-semibold ${
                          isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
                        }`}
                      >
                        Handling fee & Instant Green Tip
                      </span>
                    </div>
                    <span
                      className={`font-citation-code text-citation-code font-bold ${
                        isDark ? 'text-[#FF7043]' : 'text-[#ae2b00]'
                      }`}
                    >
                      +₹28.00
                    </span>
                  </div>
                  <p
                    className={`text-[10px] pl-7 italic ${
                      isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
                    }`}
                  >
                    Auto-applied without prior consent
                  </p>
                </div>
              </div>

              {/* Action Mockup */}
              <div
                className={`rounded-lg p-2 flex flex-col gap-1.5 border ${
                  isDark
                    ? 'bg-[#1B1B21] border-[#33333C]'
                    : 'bg-white border-[#e2bfb6]'
                }`}
              >
                <button
                  type="button"
                  className={`w-full py-2 rounded font-label-md text-label-md font-bold flex items-center justify-center gap-1.5 shadow-sm ${
                    isDark
                      ? 'bg-[#45dfa4] text-[#002114]'
                      : 'bg-[#006b5e] text-white'
                  }`}
                >
                  <span>Proceed to Pay ₹457.00</span>
                  <span className="material-symbols-outlined text-[16px]">
                    arrow_forward
                  </span>
                </button>

                {/* Pin [3] Target: Confirm Shaming Cancel text */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handlePinClick(3)}
                  className={`relative mt-0.5 transition-transform active:scale-[0.99] cursor-pointer ${
                    selectedPinId === 3 ? 'ring-2 ring-[#FF7043]' : ''
                  }`}
                >
                  <div
                    className={`absolute -top-2 -left-2 z-10 w-6 h-6 rounded-full font-bold text-[11px] flex items-center justify-center shadow-md ring-2 ring-white ${
                      isDark
                        ? 'bg-[#FF7043] text-[#15151A]'
                        : 'bg-[#ae2b00] text-white'
                    }`}
                  >
                    3
                  </div>
                  <div
                    className={`text-center py-1.5 px-2 rounded border pl-4 ${
                      isDark
                        ? 'bg-[#23232B] border-[#FF7043]/40 text-[#F1EFE9]'
                        : 'bg-[#ffdad6]/40 border-[#ae2b00]/30 text-[#1b1b20]'
                    }`}
                  >
                    <span className="font-body-sm text-body-sm underline italic">
                      "No thanks, I hate saving money & trees"
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Ambient footer */}
          <div
            className={`mt-2 flex items-center justify-between px-1 ${
              isDark ? 'text-[#787672]' : 'text-[#8e7069]'
            }`}
          >
            <span className="font-citation-badge text-citation-badge uppercase">
              Target Screen: Checkout Final V3.2
            </span>
            <span
              className={`font-citation-badge text-citation-badge uppercase font-semibold ${
                isDark ? 'text-[#FF7043]' : 'text-[#ae2b00]'
              }`}
            >
              Tap any pin to inspect violation
            </span>
          </div>
        </div>
      </div>

      {/* Pattern Breakdown Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span
            className={`material-symbols-outlined text-[20px] ${
              isDark ? 'text-[#FF7043]' : 'text-[#ae2b00]'
            }`}
          >
            policy
          </span>
          <h2
            className={`font-headline-md text-headline-md font-bold ${
              isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
            }`}
          >
            Pattern Breakdown
          </h2>
        </div>
        <span
          className={`font-citation-badge text-citation-badge uppercase font-semibold ${
            isDark ? 'text-[#787672]' : 'text-[#8e7069]'
          }`}
        >
          CCPA 2023 GUIDELINES
        </span>
      </div>

      {/* Findings List (3 Cards) */}
      <div className="flex flex-col gap-3 mb-4">
        {docket.pins.map((pin) => (
          <article
            key={pin.id}
            id={`finding-${pin.id}`}
            className={`relative rounded-xl p-3.5 border shadow-lg transition-all ${
              selectedPinId === pin.id
                ? isDark
                  ? 'border-[#FF7043] ring-1 ring-[#FF7043]'
                  : 'border-[#ae2b00] ring-1 ring-[#ae2b00]'
                : isDark
                ? 'bg-[#1B1B21] border-[#33333C]'
                : 'bg-white border-[#e2bfb6]/70'
            }`}
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-6 h-6 rounded-full font-bold text-[11px] flex items-center justify-center shrink-0 ring-2 ring-white shadow-sm ${
                    isDark
                      ? 'bg-[#FF7043] text-[#15151A]'
                      : 'bg-[#ae2b00] text-white'
                  }`}
                >
                  {pin.id}
                </div>
                <span
                  className={`font-headline-sm text-headline-sm tracking-tight uppercase font-bold ${
                    isDark ? 'text-[#FF7043]' : 'text-[#ae2b00]'
                  }`}
                >
                  {pin.patternName}
                </span>
              </div>

              <span
                className={`font-citation-badge text-citation-badge px-2 py-[2px] rounded-full uppercase shrink-0 font-bold ${
                  pin.confidence === 'High Confidence'
                    ? isDark
                      ? 'bg-[#FF7043] text-[#15151A]'
                      : 'bg-[#ae2b00] text-white'
                    : isDark
                    ? 'bg-[#FF7043]/20 border border-[#FF7043]/40 text-[#FF7043]'
                    : 'bg-[#ffdad6] text-[#ae2b00] border border-[#d1431a]/30'
                }`}
              >
                {pin.confidence}
              </span>
            </div>

            {/* Clause citation */}
            <div className="flex items-center gap-2 mb-2 pl-0.5">
              <span
                className={`font-citation-code text-citation-code px-1.5 py-[2px] rounded border ${
                  isDark
                    ? 'bg-[#23232B] border-[#33333C] text-[#F1EFE9]'
                    : 'bg-[#f0edf4] border-[#e2bfb6] text-[#1b1b20]'
                }`}
              >
                {pin.clause}
              </span>
            </div>

            {/* Verbatim quote box */}
            <div
              className={`rounded-lg p-2.5 mb-2 border ${
                isDark
                  ? 'bg-[#23232B] border-[#33333C]'
                  : 'bg-[#f5f2fa] border-[#e2bfb6]'
              }`}
            >
              <div className="flex items-start gap-1.5">
                <span
                  className={`material-symbols-outlined text-[18px] shrink-0 mt-[1px] ${
                    isDark ? 'text-[#FF7043]' : 'text-[#ae2b00]'
                  }`}
                >
                  format_quote
                </span>
                <p
                  className={`font-body-md text-body-md italic leading-relaxed ${
                    isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
                  }`}
                >
                  {pin.quote}
                </p>
              </div>
            </div>

            {/* Statutory description */}
            <p
              className={`font-body-md text-body-md leading-normal mb-2 ${
                isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
              }`}
            >
              {pin.description}
            </p>

            {/* Precedent / statute link */}
            <div
              className={`pt-2 flex items-center justify-between border-t ${
                isDark
                  ? 'border-[#33333C] text-[#A8A6A0]'
                  : 'border-[#e2bfb6] text-[#5a413a]'
              }`}
            >
              <span
                className={`font-citation-badge text-citation-badge uppercase ${
                  isDark ? 'text-[#787672]' : 'text-[#8e7069]'
                }`}
              >
                {pin.id === 1
                  ? 'Legal Precedent: FTC v. Urgency AI'
                  : pin.id === 2
                  ? 'Auto-reversal Eligible: Yes'
                  : 'Psychological Coercion Tag'}
              </span>
              <button
                type="button"
                onClick={() =>
                  showToast(
                    `Statute: Section 18 of Consumer Protection Act 2019 (${pin.clause})`
                  )
                }
                className={`font-citation-code text-citation-code font-semibold hover:underline flex items-center gap-0.5 ${
                  isDark ? 'text-[#FF7043]' : 'text-[#ae2b00]'
                }`}
              >
                <span>View Statute</span>
                <span className="material-symbols-outlined text-[14px]">
                  arrow_outward
                </span>
              </button>
            </div>

            {/* Report misclassification */}
            <div className="mt-1.5 flex items-center justify-end">
              <button
                type="button"
                onClick={() => handleReportFinding(pin.id)}
                disabled={reportedIds.includes(pin.id)}
                className={`text-[11px] underline inline-flex items-center gap-1 transition-colors ${
                  reportedIds.includes(pin.id)
                    ? 'text-[#2DD4BF]'
                    : isDark
                    ? 'text-[#787672] hover:text-[#FF7043]'
                    : 'text-[#8e7069] hover:text-[#ae2b00]'
                }`}
              >
                <span className="material-symbols-outlined text-[13px]">
                  {reportedIds.includes(pin.id) ? 'check' : 'flag'}
                </span>
                <span>
                  {reportedIds.includes(pin.id)
                    ? 'Reported to review queue'
                    : 'Report this finding as wrong'}
                </span>
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Consumer Rights Notice Strip */}
      <div
        className={`p-3.5 rounded-xl border flex items-start gap-2.5 mb-4 ${
          isDark
            ? 'bg-[#1B1B21] border-[#33333C]'
            : 'bg-[#f5f2fa] border-[#e2bfb6]'
        }`}
      >
        <span
          className={`material-symbols-outlined text-[24px] shrink-0 ${
            isDark ? 'text-[#45dfa4]' : 'text-[#006b5e]'
          }`}
        >
          gavel
        </span>
        <div className="flex flex-col">
          <span
            className={`font-label-md text-label-md font-bold ${
              isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
            }`}
          >
            Legal Admissibility Ready
          </span>
          <p
            className={`font-body-sm text-body-sm mt-0.5 leading-relaxed ${
              isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
            }`}
          >
            This forensic snapshot is timestamped with cryptographic hash verification
            and complies with formal submission standards for the National Consumer
            Helpline (NCH).
          </p>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div
        className={`sticky bottom-16 left-0 right-0 z-40 pt-2.5 pb-2 border-t shadow-2xl backdrop-blur-md ${
          isDark
            ? 'bg-[#15151A]/95 border-[#33333C]'
            : 'bg-[#fbf8ff]/95 border-[#e2bfb6]'
        }`}
      >
        <div className="flex flex-col gap-2 w-full">
          {/* Primary Action: Grievance Draft */}
          <button
            type="button"
            onClick={onGoToGrievance}
            className={`w-full h-12 rounded-xl font-headline-sm text-headline-sm flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-[0.98] font-bold ${
              isDark
                ? 'bg-[#FF7043] hover:bg-[#ff845e] text-[#15151A]'
                : 'bg-[#ae2b00] hover:bg-[#d1431a] text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              description
            </span>
            <span>Draft Grievance Complaint</span>
            <span className="material-symbols-outlined text-[18px]">
              chevron_right
            </span>
          </button>

          {/* Secondary Action: Share Audit Card */}
          <button
            type="button"
            onClick={onGoToShareDossier}
            className={`w-full h-11 rounded-xl font-label-md text-label-md flex items-center justify-center gap-1.5 border transition-all active:scale-[0.98] font-semibold ${
              isDark
                ? 'bg-[#1B1B21] hover:bg-[#23232B] border-[#33333C] text-[#F1EFE9]'
                : 'bg-white hover:bg-[#f0edf4] border-[#e2bfb6] text-[#1b1b20]'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
              }`}
            >
              share
            </span>
            <span>Shareable Violation Report</span>
          </button>
        </div>
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
            info
          </span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
