import React, { useState } from 'react';
import { ThemeMode, AuditDocket } from '../types';

interface GrievanceScreenProps {
  theme: ThemeMode;
  docket: AuditDocket;
  onGoToAnalysis: () => void;
}

export const GrievanceScreen: React.FC<GrievanceScreenProps> = ({
  theme,
  docket,
  onGoToAnalysis,
}) => {
  const isDark = theme === 'dark';
  const [complainantName, setComplainantName] = useState('Ananya Sharma');
  const [complainantPhone, setComplainantPhone] = useState('98765 43210');
  const [complainantEmail, setComplainantEmail] = useState('consumer.alert@india.gov.in');
  const [orderId, setOrderId] = useState('ZP-9482049');
  const [claimedAmount, setClaimedAmount] = useState('28.00');
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  const legalPetitionText = `FORMAL GRIEVANCE PETITION UNDER SECTION 18 & SECTION 2(47)
OF THE CONSUMER PROTECTION ACT, 2019
READ WITH CCPA GUIDELINES FOR PREVENTION OF DARK PATTERNS, 2023

To:
The Central Consumer Protection Authority (CCPA) &
National Consumer Helpline (NCH / INGRAM Portal)
Department of Consumer Affairs, Government of India.

COMPLAINANT DETAILS:
Name: ${complainantName}
Mobile: +91 ${complainantPhone}
Email: ${complainantEmail}

OPPOSITE PARTY (RESPONDENT):
Entity: ${
    docket.id === 'zepto-cart'
      ? 'KiranaKart Technologies Private Limited (Zepto)'
      : docket.domain
  }
CIN / Registration: U74999MH2020PTC349033
Domain: https://${docket.domain}
Order / Transaction Ref: #${orderId}

SUBJECT: UNFAIR TRADE PRACTICE VIA PROHIBITED DARK PATTERNS IN E-COMMERCE CHECKOUT FLOW

RESPECTFULLY SHEWETH:
1. The Complainant attempted a routine transaction on the Respondent’s platform. During checkout, the Respondent deployed deceptive UI modalities strictly prohibited under the statutory CCPA Notification 2023:
   a) BASKET SNEAKING (Clause 4(1)(b)): The Respondent surreptitiously auto-added handling fees and green packaging charges (+₹${claimedAmount}) without affirmative consumer consent.
   b) FALSE URGENCY (Clause 4(1)(a)): Fabricated 04:59 countdown timer stating "Only 2 slots left" designed to coerce irrational impulse purchase.
   c) CONFIRM SHAMING (Clause 4(1)(c)): Using manipulative phrasing ("No thanks, I hate saving trees") when attempting to decline the unsolicited add-on.

RELIEF PRAYED FOR:
1. Immediate refund of unauthorized debited charges amounting to ₹${claimedAmount}.
2. Issuance of Cease and Desist directions under Section 18 of the Consumer Protection Act, 2019.
3. Imposition of statutory penalty under Section 21 of the Act for willful deceptive design.

VERIFICATION:
I, ${complainantName}, hereby verify that the forensic screenshot hash and transaction evidence submitted herewith are true and authentic.

Date: ${new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })}
Filed via: SNITCH Statutory Forensic Engine (Dossier #CCPA-8492)`;

  const handleCopyNotice = () => {
    navigator.clipboard.writeText(legalPetitionText);
    setCopied(true);
    showToast('Formal Legal Notice copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleOpenNCH = () => {
    window.open('https://consumerhelpline.gov.in', '_blank');
    showToast('Redirecting to official INGRAM / NCH Consumer Portal...');
  };

  const handleExportPDF = () => {
    showToast('Exporting Court-Admissible Section 2(47) Evidence Dossier PDF...');
    setTimeout(() => {
      const element = document.createElement('a');
      const file = new Blob([legalPetitionText], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `CCPA_Legal_Grievance_${docket.domain}_${Date.now()}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      showToast('Grievance Affidavit saved to downloads!');
    }, 600);
  };

  return (
    <div className="flex flex-col w-full pb-20 space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isDark ? 'bg-[#FF7043]' : 'bg-[#ae2b00]'
              }`}
            />
            <span
              className={`font-citation-badge text-citation-badge uppercase tracking-wider font-semibold ${
                isDark ? 'text-[#FF7043]' : 'text-[#ae2b00]'
              }`}
            >
              National Consumer Helpline 1915
            </span>
          </div>
          <span
            className={`font-citation-badge text-citation-badge uppercase px-2 py-0.5 rounded font-bold border ${
              isDark
                ? 'bg-[#2DD4BF]/15 border-[#2DD4BF]/30 text-[#2DD4BF]'
                : 'bg-[#9cefdf] text-[#006b5e]'
            }`}
          >
            Section 2(47) Redressal
          </span>
        </div>

        <h1
          className={`font-headline-lg text-headline-lg font-bold tracking-tight ${
            isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
          }`}
        >
          Statutory NCH Grievance
        </h1>
        <p
          className={`font-body-md text-body-md ${
            isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
          }`}
        >
          Generated petition bundle formatted for INGRAM (National Consumer Helpline)
          and the Department of Consumer Affairs.
        </p>
      </div>

      {/* Target Respondent Enterprise Card */}
      <div
        className={`rounded-xl p-3.5 border shadow-md flex flex-col gap-2 ${
          isDark
            ? 'bg-[#1B1B21] border-[#33333C]'
            : 'bg-white border-[#e2bfb6]/70'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${
                isDark
                  ? 'bg-[#23232B] border-[#33333C] text-[#FF7043]'
                  : 'bg-[#ffdad6] border-[#d1431a]/30 text-[#ae2b00]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                gavel
              </span>
            </div>
            <div className="flex flex-col">
              <span
                className={`font-headline-sm text-headline-sm font-bold ${
                  isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
                }`}
              >
                {docket.id === 'zepto-cart'
                  ? 'KiranaKart Technologies Private Limited'
                  : docket.domain}
              </span>
              <span
                className={`font-citation-code text-[11px] ${
                  isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
                }`}
              >
                CIN: U74999MH2020PTC349033 • Domain: {docket.domain}
              </span>
            </div>
          </div>
          <span
            className={`font-citation-badge text-citation-badge uppercase px-2 py-0.5 rounded font-bold shrink-0 ${
              isDark
                ? 'bg-[#FF7043]/15 text-[#FF7043]'
                : 'bg-[#ffdad6] text-[#ae2b00]'
            }`}
          >
            Respondent
          </span>
        </div>

        {/* 3 Pre-categorized Infraction Claims */}
        <div
          className={`p-2.5 rounded-lg border flex flex-col gap-1.5 ${
            isDark
              ? 'bg-[#23232B] border-[#33333C]'
              : 'bg-[#f5f2fa] border-[#e2bfb6]'
          }`}
        >
          <span
            className={`font-citation-badge text-citation-badge uppercase font-bold ${
              isDark ? 'text-[#787672]' : 'text-[#8e7069]'
            }`}
          >
            STATUTORY CLAIMS ATTACHED
          </span>

          <div className="flex items-center justify-between text-body-sm">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF7043]" />
              <span
                className={`truncate ${
                  isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
                }`}
              >
                Non-consensual Basket Sneaking
              </span>
            </div>
            <span className="font-citation-code text-citation-code font-bold text-[#FF7043] shrink-0">
              Clause 4(1)(b)
            </span>
          </div>

          <div className="flex items-center justify-between text-body-sm">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF7043]" />
              <span
                className={`truncate ${
                  isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
                }`}
              >
                Fabricated Scarcity Urgency Clock
              </span>
            </div>
            <span className="font-citation-code text-citation-code font-bold text-[#FF7043] shrink-0">
              Clause 4(1)(a)
            </span>
          </div>

          <div className="flex items-center justify-between text-body-sm">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF7043]" />
              <span
                className={`truncate ${
                  isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
                }`}
              >
                Emotional Confirm Shaming Opt-Out
              </span>
            </div>
            <span className="font-citation-code text-citation-code font-bold text-[#FF7043] shrink-0">
              Clause 4(1)(c)
            </span>
          </div>
        </div>
      </div>

      {/* Complainant Details Form */}
      <div
        className={`rounded-xl p-3.5 border shadow-md flex flex-col gap-3 ${
          isDark
            ? 'bg-[#1B1B21] border-[#33333C]'
            : 'bg-white border-[#e2bfb6]/70'
        }`}
      >
        <span
          className={`font-label-md text-label-md font-bold uppercase ${
            isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
          }`}
        >
          Complainant Particulars
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label
              className={`font-citation-badge text-citation-badge uppercase ${
                isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
              }`}
            >
              Complainant Legal Name
            </label>
            <input
              type="text"
              value={complainantName}
              onChange={(e) => setComplainantName(e.target.value)}
              className={`w-full h-10 px-3 rounded-lg border font-body-sm outline-none transition-colors ${
                isDark
                  ? 'bg-[#23232B] border-[#33333C] text-[#F1EFE9] focus:border-[#FF7043]'
                  : 'bg-[#f5f2fa] border-[#e2bfb6] text-[#1b1b20] focus:border-[#ae2b00]'
              }`}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              className={`font-citation-badge text-citation-badge uppercase ${
                isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
              }`}
            >
              Mobile (NCH OTP verification)
            </label>
            <input
              type="text"
              value={complainantPhone}
              onChange={(e) => setComplainantPhone(e.target.value)}
              className={`w-full h-10 px-3 rounded-lg border font-body-sm outline-none transition-colors ${
                isDark
                  ? 'bg-[#23232B] border-[#33333C] text-[#F1EFE9] focus:border-[#FF7043]'
                  : 'bg-[#f5f2fa] border-[#e2bfb6] text-[#1b1b20] focus:border-[#ae2b00]'
              }`}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              className={`font-citation-badge text-citation-badge uppercase ${
                isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
              }`}
            >
              Email Address
            </label>
            <input
              type="email"
              value={complainantEmail}
              onChange={(e) => setComplainantEmail(e.target.value)}
              className={`w-full h-10 px-3 rounded-lg border font-body-sm outline-none transition-colors ${
                isDark
                  ? 'bg-[#23232B] border-[#33333C] text-[#F1EFE9] focus:border-[#FF7043]'
                  : 'bg-[#f5f2fa] border-[#e2bfb6] text-[#1b1b20] focus:border-[#ae2b00]'
              }`}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              className={`font-citation-badge text-citation-badge uppercase ${
                isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
              }`}
            >
              Order / Payment Ref ID
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className={`w-full h-10 px-3 rounded-lg border font-body-sm outline-none transition-colors ${
                isDark
                  ? 'bg-[#23232B] border-[#33333C] text-[#F1EFE9] focus:border-[#FF7043]'
                  : 'bg-[#f5f2fa] border-[#e2bfb6] text-[#1b1b20] focus:border-[#ae2b00]'
              }`}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label
            className={`font-citation-badge text-citation-badge uppercase ${
              isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
            }`}
          >
            Claimed Unauthorized Overcharge (₹ INR)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={claimedAmount}
              onChange={(e) => setClaimedAmount(e.target.value)}
              className={`w-32 h-10 px-3 rounded-lg border font-citation-code font-bold outline-none ${
                isDark
                  ? 'bg-[#23232B] border-[#33333C] text-[#FF7043]'
                  : 'bg-[#f5f2fa] border-[#e2bfb6] text-[#ae2b00]'
              }`}
            />
            <span
              className={`font-body-sm text-body-sm ${
                isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
              }`}
            >
              Auto-calculated from basket sneaking charges
            </span>
          </div>
        </div>
      </div>

      {/* Petition Preview Drawer */}
      <div
        className={`rounded-xl p-3.5 border shadow-md flex flex-col gap-2 ${
          isDark
            ? 'bg-[#1B1B21] border-[#33333C]'
            : 'bg-white border-[#e2bfb6]/70'
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`font-label-md text-label-md font-bold uppercase ${
              isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
            }`}
          >
            Legal Notice Drafting
          </span>
          <button
            type="button"
            onClick={handleCopyNotice}
            className={`font-label-md text-label-md py-1 px-2.5 rounded flex items-center gap-1 transition-all ${
              copied
                ? 'bg-[#2DD4BF] text-[#00382f] font-bold'
                : isDark
                ? 'bg-[#FF7043] text-[#15151A] hover:bg-[#ff845e]'
                : 'bg-[#ae2b00] text-white hover:bg-[#d1431a]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {copied ? 'check' : 'content_copy'}
            </span>
            <span>{copied ? 'Copied Petition' : 'Copy Notice'}</span>
          </button>
        </div>

        <pre
          className={`p-3 rounded-lg font-citation-code text-[11px] leading-relaxed max-h-[160px] overflow-y-auto whitespace-pre-wrap select-all border ${
            isDark
              ? 'bg-[#121216] border-[#33333C] text-[#A8A6A0]'
              : 'bg-[#f5f2fa] border-[#e2bfb6] text-[#5a413a]'
          }`}
        >
          {legalPetitionText}
        </pre>
      </div>

      {/* Primary Actions */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleOpenNCH}
          className={`w-full h-12 rounded-xl font-headline-sm text-headline-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.99] font-bold ${
            isDark
              ? 'bg-[#FF7043] hover:bg-[#ff845e] text-white'
              : 'bg-[#ae2b00] hover:bg-[#d1431a] text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            open_in_new
          </span>
          <span>File on INGRAM Portal (NCH 1915)</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleExportPDF}
            className={`h-11 rounded-lg border font-label-md text-label-md flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.99] font-semibold ${
              isDark
                ? 'bg-[#1B1B21] border-[#33333C] text-[#F1EFE9] hover:bg-[#23232B]'
                : 'bg-white border-[#e2bfb6] text-[#1b1b20] hover:bg-[#f5f2fa]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              picture_as_pdf
            </span>
            <span>Export Affidavit</span>
          </button>

          <a
            href="tel:1915"
            className={`h-11 rounded-lg border font-label-md text-label-md flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.99] font-semibold ${
              isDark
                ? 'bg-[#1B1B21] border-[#33333C] text-[#2DD4BF] hover:bg-[#23232B]'
                : 'bg-white border-[#e2bfb6] text-[#006b5e] hover:bg-[#f5f2fa]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">call</span>
            <span>Dial 1915 Helpline</span>
          </a>
        </div>
      </div>

      {/* Statutory Authority Info */}
      <div
        className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
          isDark
            ? 'bg-[#1B1B21] border-[#33333C] text-[#A8A6A0]'
            : 'bg-[#f5f2fa] border-[#e2bfb6]/60 text-[#5a413a]'
        }`}
      >
        <span
          className={`material-symbols-outlined text-[20px] shrink-0 mt-0.5 ${
            isDark ? 'text-[#FF7043]' : 'text-[#ae2b00]'
          }`}
        >
          balance
        </span>
        <div className="flex flex-col gap-0.5">
          <span
            className={`font-label-md text-label-md font-bold ${
              isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
            }`}
          >
            Statutory Penalties Under Section 21
          </span>
          <p className="font-body-sm text-body-sm leading-relaxed">
            The Central Consumer Protection Authority may impose a fine of up to ₹10,00,000
            for false or misleading practice. For subsequent infractions, the penalty
            extends up to ₹50,00,000 along with cancellation of e-commerce registration.
          </p>
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
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
