import React, { useState, useMemo } from 'react';
import { ThemeMode } from '../types';
import { PROHIBITED_PATTERNS } from '../data/patterns';
import { tokens } from '../lib/theme';

interface PatternsScreenProps {
  theme: ThemeMode;
  /** Takes the user to the Scan tab to check a real screen for this pattern. */
  onAuditPattern: (patternId: string) => void;
}

export const PatternsScreen: React.FC<PatternsScreenProps> = ({
  theme,
  onAuditPattern,
}) => {
  const isDark = theme === 'dark';
  const t = tokens(theme);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredPatterns = useMemo(() => {
    return PROHIBITED_PATTERNS.filter((pattern) => {
      const matchesCategory =
        activeCategory === 'all' || pattern.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        pattern.name.toLowerCase().includes(q) ||
        pattern.title.toLowerCase().includes(q) ||
        pattern.clause.toLowerCase().includes(q) ||
        pattern.description.toLowerCase().includes(q) ||
        pattern.keywords.some((k) => k.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="flex flex-col w-full pb-6 space-y-4">
      {/* Header */}
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
              Annexure 1 · 2023 Guidelines
            </span>
          </div>
          <span
            className={`font-citation-badge text-citation-badge uppercase px-2 py-0.5 rounded font-bold border ${
              isDark
                ? 'bg-[#2DD4BF]/15 border-[#2DD4BF]/30 text-[#2DD4BF]'
                : 'bg-[#9cefdf] text-[#006b5e]'
            }`}
          >
            13 Prohibitions
          </span>
        </div>

        <h1
          className={`font-headline-lg text-headline-lg font-bold tracking-tight ${
            isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
          }`}
        >
          13 Prohibited Dark Patterns
        </h1>
        <p
          className={`font-body-md text-body-md ${
            isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
          }`}
        >
          Named in Annexure 1 of the Central Consumer Protection Authority’s Guidelines for
          Prevention and Regulation of Dark Patterns, 2023 (Guideline 4 prohibits them).
        </p>
      </div>

      {/* Search Input */}
      <div
        className={`relative flex items-center rounded-xl border px-3 h-11 transition-colors ${
          isDark
            ? 'bg-[#1B1B21] border-[#33333C] text-[#F1EFE9] focus-within:border-[#FF7043]'
            : 'bg-white border-[#e2bfb6] text-[#1b1b20] focus-within:border-[#ae2b00]'
        }`}
      >
        <span
          className={`material-symbols-outlined text-[20px] mr-2 ${
            isDark ? 'text-[#787672]' : 'text-[#8e7069]'
          }`}
        >
          search
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search clause, e.g. 'urgency', 'timer', 'drip', 'trap'..."
          className="w-full bg-transparent font-body-sm outline-none placeholder:text-opacity-50"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="p-1 text-xs opacity-60 hover:opacity-100"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'All (13)' },
          { id: 'psychological', label: 'Psychological (7)' },
          { id: 'checkout', label: 'Checkout & Fees (4)' },
          { id: 'subscription', label: 'Subscription Traps (2)' },
        ].map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-2 min-h-[44px] rounded-full font-citation-badge text-citation-badge tracking-wider uppercase font-semibold whitespace-nowrap transition-all inline-flex items-center justify-center ${
              activeCategory === cat.id
                ? isDark
                  ? 'bg-[#FF7043] text-[#15151A]'
                  : 'bg-[#ae2b00] text-white'
                : isDark
                ? 'bg-[#1B1B21] text-[#A8A6A0] border border-[#33333C] hover:text-[#F1EFE9]'
                : 'bg-white text-[#5a413a] border border-[#e2bfb6] hover:text-[#1b1b20]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of Patterns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 items-stretch">
        {filteredPatterns.length === 0 ? (
          <div
            className={`p-6 text-center rounded-xl border sm:col-span-full ${
              isDark
                ? 'bg-[#1B1B21] border-[#33333C] text-[#A8A6A0]'
                : 'bg-white border-[#e2bfb6] text-[#5a413a]'
            }`}
          >
            <span className="material-symbols-outlined text-[32px] mb-2 opacity-60">
              rule
            </span>
            <p className="font-headline-sm">No dark patterns match "{searchQuery}"</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className={`mt-2 font-label-md underline ${
                isDark ? 'text-[#FF7043]' : 'text-[#ae2b00]'
              }`}
            >
              Clear filters
            </button>
          </div>
        ) : (
          filteredPatterns.map((pattern) => {
            const isExpanded = expandedId === pattern.id;

            return (
              <article
                key={pattern.id}
                className={`rounded-xl p-4 md:p-5 border shadow-sm transition-all flex flex-col justify-between h-full ${
                  isDark
                    ? 'bg-[#1B1B21] border-[#33333C] hover:border-[#4E4E5A]'
                    : 'bg-white border-[#e2bfb6]/70 hover:border-[#ae2b00]/40'
                }`}
              >
                <div className="flex-1 flex flex-col">
                  {/* Metadata Row: Number badge + Annexure item chip on left, Category tag on right */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className={`font-citation-code text-xs px-2 py-0.5 rounded font-bold border shrink-0 ${
                          isDark
                            ? 'bg-[#23232B] border-[#33333C] text-[#FF7043]'
                            : 'bg-[#ffdad6] border-[#d1431a]/30 text-[#ae2b00]'
                        }`}
                      >
                        {pattern.number}
                      </span>
                      <span
                        className={`font-citation-badge text-[11px] px-2 py-0.5 rounded border uppercase tracking-wider font-semibold truncate ${
                          isDark
                            ? 'bg-[#15151A] border-[#33333C] text-[#A8A6A0]'
                            : 'bg-[#f5f2fa] border-[#e2bfb6] text-[#5a413a]'
                        }`}
                      >
                        Annexure 1 · Item {parseInt(pattern.number, 10)}
                      </span>
                    </div>

                    <span
                      className={`font-citation-badge text-[11px] px-2.5 py-0.5 rounded-full uppercase shrink-0 font-bold ${
                        pattern.tagType === 'danger'
                          ? isDark
                            ? 'bg-[#FF7043]/15 text-[#FF7043] border border-[#FF7043]/30'
                            : 'bg-[#ffdad6] text-[#ae2b00] border border-[#d1431a]/30'
                          : isDark
                          ? 'bg-[#2DD4BF]/15 text-[#2DD4BF] border border-[#2DD4BF]/30'
                          : 'bg-[#9cefdf] text-[#006b5e]'
                      }`}
                    >
                      {pattern.tag}
                    </span>
                  </div>

                  {/* Title & Subtitle: Full title without ugly truncation */}
                  <div className="mb-2">
                    <h2
                      className={`font-headline-sm text-[15px] sm:text-[16px] font-bold tracking-tight uppercase leading-snug break-words ${
                        isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
                      }`}
                    >
                      {pattern.name}
                    </h2>
                    <span
                      className={`font-body-sm text-[13px] block mt-0.5 leading-snug ${
                        isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
                      }`}
                    >
                      {pattern.title}
                    </span>
                  </div>

                  {/* Statutory Definition */}
                  <p
                    className={`font-body-sm text-body-sm leading-relaxed ${
                      isDark ? 'text-[#C5C3BC]' : 'text-[#483731]'
                    }`}
                  >
                    {pattern.description}
                  </p>

                  {/* Real-world example: Clean editorial callout instead of a heavy box-in-a-box */}
                  <div
                    className={`mt-3 pl-3 border-l-2 py-1 ${
                      isDark
                        ? 'border-[#FF7043]/60 bg-[#FF7043]/[0.03]'
                        : 'border-[#ae2b00]/60 bg-[#ae2b00]/[0.03]'
                    } rounded-r`}
                  >
                    <span
                      className={`font-citation-badge text-[10px] uppercase tracking-wider font-bold block mb-0.5 ${
                        isDark ? 'text-[#FF7043]' : 'text-[#ae2b00]'
                      }`}
                    >
                      Real-world violation
                    </span>
                    <p
                      className={`font-body-sm text-body-sm italic leading-snug ${
                        isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
                      }`}
                    >
                      {pattern.realExample}
                    </p>
                  </div>

                  {/* Expanded Enforcement Note: Stays inside content area above action buttons */}
                  {isExpanded && (
                    <div
                      className={`mt-3 p-3 rounded-lg border text-body-sm font-body-sm ${
                        isDark
                          ? 'bg-[#23232B] border-[#33333C] text-[#A8A6A0]'
                          : 'bg-[#f5f2fa] border-[#e2bfb6] text-[#5a413a]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`material-symbols-outlined text-[16px] ${
                            isDark ? 'text-[#FF7043]' : 'text-[#ae2b00]'
                          }`}
                        >
                          gavel
                        </span>
                        <span
                          className={`font-bold text-xs uppercase tracking-wide ${
                            isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
                          }`}
                        >
                          Statutory Enforcement
                        </span>
                      </div>
                      <p className="leading-relaxed">
                        Guideline 4 of the 2023 Guidelines prohibits every platform from engaging
                        in this practice. The Central Consumer Protection Authority acts under
                        Section 18 of the Consumer Protection Act, 2019 and can impose penalties
                        under Section 21. Since 2025 the CCPA has fined quick-commerce, edtech,
                        pharmacy and ticketing platforms for exactly these patterns.
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Action strip: Anchored to bottom with mt-auto, exact same height across all cards */}
                <div
                  className={`mt-4 pt-3 flex items-center justify-between gap-2 border-t ${
                    isDark ? 'border-[#33333C]' : 'border-[#e2bfb6]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : pattern.id)}
                    className={`min-h-[40px] px-3 py-1.5 rounded-lg border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                      isDark
                        ? isExpanded
                          ? 'bg-[#23232B] border-[#444452] text-[#F1EFE9]'
                          : 'bg-transparent border-[#33333C] text-[#A8A6A0] hover:text-[#F1EFE9] hover:bg-[#23232B]'
                        : isExpanded
                        ? 'bg-[#f0edf4] border-[#d9d6ce] text-[#1b1b20]'
                        : 'bg-transparent border-[#e2bfb6] text-[#5a413a] hover:text-[#1b1b20] hover:bg-[#f0edf4]'
                    } ${t.focus}`}
                    aria-expanded={isExpanded}
                  >
                    <span>{isExpanded ? 'Hide note' : 'Enforcement note'}</span>
                    <span className="material-symbols-outlined text-[16px]">
                      {isExpanded ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onAuditPattern(pattern.id)}
                    className={`min-h-[40px] px-3.5 py-1.5 rounded-lg font-label-md text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-sm ${t.accentBg} ${t.focus}`}
                  >
                    <span>Scan for this</span>
                    <span className="material-symbols-outlined text-[15px]">
                      arrow_forward
                    </span>
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
};
