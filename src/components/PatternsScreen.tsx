import React, { useState, useMemo } from 'react';
import { ThemeMode, DarkPattern } from '../types';
import { PROHIBITED_PATTERNS } from '../data/patterns';
import { TEST_DOCKETS } from '../data/dockets';

interface PatternsScreenProps {
  theme: ThemeMode;
  onAuditPattern: (patternId: string) => void;
}

export const PatternsScreen: React.FC<PatternsScreenProps> = ({
  theme,
  onAuditPattern,
}) => {
  const isDark = theme === 'dark';
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
    <div className="flex flex-col w-full pb-20 space-y-4">
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
              CCPA Gazetted Annexure 1
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
          Central Consumer Protection Authority Guidelines for Prevention and
          Regulation of Dark Patterns, 2023.
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
            className={`px-3 py-1.5 rounded-full font-citation-badge text-citation-badge tracking-wider uppercase font-semibold whitespace-nowrap transition-all ${
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

      {/* List of Patterns */}
      <div className="flex flex-col gap-3">
        {filteredPatterns.length === 0 ? (
          <div
            className={`p-6 text-center rounded-xl border ${
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
                className={`rounded-xl p-4 border shadow-md transition-all ${
                  isDark
                    ? 'bg-[#1B1B21] border-[#33333C] hover:border-[#444452]'
                    : 'bg-white border-[#e2bfb6]/70 hover:border-[#ae2b00]/50'
                }`}
              >
                {/* Top header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`font-citation-code text-citation-code px-1.5 py-0.5 rounded font-bold border ${
                        isDark
                          ? 'bg-[#23232B] border-[#33333C] text-[#FF7043]'
                          : 'bg-[#ffdad6] border-[#d1431a]/30 text-[#ae2b00]'
                      }`}
                    >
                      {pattern.number}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span
                        className={`font-headline-sm text-headline-sm font-bold tracking-tight uppercase truncate ${
                          isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
                        }`}
                      >
                        {pattern.name}
                      </span>
                      <span
                        className={`font-body-sm text-body-sm ${
                          isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
                        }`}
                      >
                        {pattern.title}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`font-citation-badge text-citation-badge px-2 py-0.5 rounded-full uppercase shrink-0 font-bold ${
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

                {/* Clause Citation */}
                <div className="mt-2 mb-2">
                  <span
                    className={`font-citation-code text-[11px] px-2 py-0.5 rounded border ${
                      isDark
                        ? 'bg-[#15151A] border-[#33333C] text-[#F1EFE9]'
                        : 'bg-[#f5f2fa] border-[#e2bfb6] text-[#1b1b20]'
                    }`}
                  >
                    {pattern.clause}
                  </span>
                </div>

                {/* Statutory Definition */}
                <p
                  className={`font-body-md text-body-md leading-relaxed ${
                    isDark ? 'text-[#A8A6A0]' : 'text-[#5a413a]'
                  }`}
                >
                  {pattern.description}
                </p>

                {/* Real-world example (always visible or expandable) */}
                <div
                  className={`mt-3 p-3 rounded-lg border ${
                    isDark
                      ? 'bg-[#15151A] border-[#33333C]/80'
                      : 'bg-[#f5f2fa] border-[#e2bfb6]'
                  }`}
                >
                  <div className="flex items-start gap-1.5">
                    <span
                      className={`material-symbols-outlined text-[16px] shrink-0 mt-0.5 ${
                        isDark ? 'text-[#FF7043]' : 'text-[#ae2b00]'
                      }`}
                    >
                      lightbulb
                    </span>
                    <div className="flex flex-col">
                      <span
                        className={`font-citation-badge text-citation-badge uppercase font-bold mb-0.5 ${
                          isDark ? 'text-[#FF7043]' : 'text-[#ae2b00]'
                        }`}
                      >
                        FIELD VIOLATION EXAMPLE
                      </span>
                      <p
                        className={`font-body-sm text-body-sm italic ${
                          isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
                        }`}
                      >
                        {pattern.realExample}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Action strip */}
                <div
                  className={`mt-3 pt-2.5 flex items-center justify-between border-t ${
                    isDark ? 'border-[#33333C]' : 'border-[#e2bfb6]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : pattern.id)}
                    className={`font-label-md text-label-md flex items-center gap-1 ${
                      isDark ? 'text-[#A8A6A0] hover:text-[#F1EFE9]' : 'text-[#5a413a] hover:text-[#1b1b20]'
                    }`}
                  >
                    <span>
                      {isExpanded ? 'Hide Precedent' : 'Legal Precedents'}
                    </span>
                    <span className="material-symbols-outlined text-[16px]">
                      {isExpanded ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onAuditPattern(pattern.id)}
                    className={`font-label-md text-label-md font-bold px-2.5 py-1 rounded flex items-center gap-1 transition-all ${
                      isDark
                        ? 'bg-[#FF7043] text-[#15151A] hover:bg-[#ff845e]'
                        : 'bg-[#ae2b00] text-white hover:bg-[#d1431a]'
                    }`}
                  >
                    <span>Inspect Example</span>
                    <span className="material-symbols-outlined text-[14px]">
                      arrow_forward
                    </span>
                  </button>
                </div>

                {/* Expanded Legal Precedents */}
                {isExpanded && (
                  <div
                    className={`mt-2 p-3 rounded border text-body-sm font-body-sm ${
                      isDark
                        ? 'bg-[#23232B] border-[#33333C] text-[#A8A6A0]'
                        : 'bg-white border-[#e2bfb6] text-[#5a413a]'
                    }`}
                  >
                    <span
                      className={`block font-bold mb-1 ${
                        isDark ? 'text-[#F1EFE9]' : 'text-[#1b1b20]'
                      }`}
                    >
                      Enforcement Mandate:
                    </span>
                    Section 18(2)(l) of Consumer Protection Act 2019 empowers the CCPA
                    to issue safety notices to consumers against unfair trade
                    practices. Violators are subject to Section 21 financial penalties
                    and public disclosure mandates.
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
};
