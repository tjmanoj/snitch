import type { ThemeMode } from '../types';

/** Class-name tokens so every screen paints from the same palette in both themes. */
export function tokens(theme: ThemeMode) {
  const d = theme === 'dark';
  return {
    isDark: d,
    page: d ? 'bg-[#15151A] text-[#F1EFE9]' : 'bg-[#fbf8ff] text-[#1b1b20]',
    card: d ? 'bg-[#1B1B21] border-[#33333C]' : 'bg-white border-[#e2bfb6]/60',
    cardAlt: d ? 'bg-[#23232B] border-[#33333C]' : 'bg-[#f5f2fa] border-[#e2bfb6]/60',
    border: d ? 'border-[#33333C]' : 'border-[#e2bfb6]/60',
    text: d ? 'text-[#F1EFE9]' : 'text-[#1b1b20]',
    muted: d ? 'text-[#A8A6A0]' : 'text-[#5a413a]',
    dim: d ? 'text-[#787672]' : 'text-[#8e7069]',
    hoverText: d ? 'hover:text-[#F1EFE9]' : 'hover:text-[#1b1b20]',
    hoverAccent: d ? 'hover:text-[#FF7043]' : 'hover:text-[#ae2b00]',
    accent: d ? 'text-[#FF7043]' : 'text-[#ae2b00]',
    accentBg: d ? 'bg-[#FF7043] text-[#15151A] hover:bg-[#ff845e]' : 'bg-[#ae2b00] text-white hover:bg-[#d1431a]',
    accentSoft: d ? 'bg-[#FF7043]/15 text-[#FF7043] border-[#FF7043]/30' : 'bg-[#ffdad6] text-[#ae2b00] border-[#d1431a]/30',
    teal: d ? 'text-[#2DD4BF]' : 'text-[#006b5e]',
    tealSoft: d ? 'bg-[#2DD4BF]/15 text-[#2DD4BF] border-[#2DD4BF]/30' : 'bg-[#9cefdf] text-[#006b5e] border-[#006b5e]/20',
    amberSoft: d ? 'bg-[#F0B35A]/15 text-[#F0B35A] border-[#F0B35A]/30' : 'bg-[#fdebc8] text-[#8a5a00] border-[#b8720a]/30',
    neutralSoft: d ? 'bg-[#33333C]/60 text-[#A8A6A0] border-[#33333C]' : 'bg-[#efeae6] text-[#5a413a] border-[#d9d6ce]',
    secondaryBtn: d
      ? 'bg-[#23232B] hover:bg-[#2c2c36] text-[#F1EFE9] border-[#33333C]'
      : 'bg-white hover:bg-[#f0edf4] text-[#1b1b20] border-[#d9d6ce]',
    input: d
      ? 'bg-[#101014] border-[#33333C] text-[#F1EFE9] placeholder:text-[#5f5f68] focus:border-[#FF7043]'
      : 'bg-white border-[#d9d6ce] text-[#1b1b20] placeholder:text-[#9a8f8b] focus:border-[#ae2b00]',
    focus: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7043] focus-visible:ring-offset-2 ' + (d ? 'focus-visible:ring-offset-[#15151A]' : 'focus-visible:ring-offset-[#fbf8ff]'),
  };
}

export type Tokens = ReturnType<typeof tokens>;

export function confidenceClasses(t: Tokens, c: 'high' | 'medium' | 'low') {
  if (c === 'high') return t.accentSoft;
  if (c === 'medium') return t.amberSoft;
  return t.neutralSoft;
}

export function confidenceLabel(c: 'high' | 'medium' | 'low') {
  return c === 'high' ? 'High confidence' : c === 'medium' ? 'Medium confidence' : 'Low confidence';
}
