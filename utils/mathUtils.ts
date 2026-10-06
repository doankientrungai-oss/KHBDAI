import katex from 'katex';

/**
 * Utility module for parsing, normalizing, and rendering mathematical expressions
 * across KaTeX (web display), Markdown processing, and Word/Docx export.
 */

// Superscript and Subscript Unicode mappings
const superscriptMap: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
  'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ', 'f': 'ᶠ', 'g': 'ᵍ', 'h': 'ʰ', 'i': 'ⁱ', 'j': 'ʲ',
  'k': 'ᵏ', 'l': 'ˡ', 'm': 'ᵐ', 'n': 'ⁿ', 'o': 'ᵒ', 'p': 'ᵖ', 'r': 'ʳ', 's': 'ˢ', 't': 'ᵗ', 'u': 'ᵘ',
  'v': 'ᵛ', 'w': 'ʷ', 'x': 'ˣ', 'y': 'ʸ', 'z': 'ᶻ'
};

const subscriptMap: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎',
  'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ', 'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ',
  'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ', 'v': 'ᵥ', 'x': 'ₓ'
};

export const toSuperscriptUnicode = (str: string): string => {
  return str.split('').map(char => superscriptMap[char] || char).join('');
};

export const toSubscriptUnicode = (str: string): string => {
  return str.split('').map(char => subscriptMap[char] || char).join('');
};

/**
 * Converts block math delimiters ($$...$$, \[...\], \(...\)) and \begin{aligned}...\end{aligned}
 * environments into clean inline ($ ... $) formulas while preserving internal LaTeX formatting.
 */
export const convertBlockMathToInlineMath = (content: string): string => {
  if (!content) return '';
  let result = content;

  // 1. Preserve \begin{aligned} ... \end{aligned} inside $ ... $
  result = result.replace(/\\begin\{align\*?\}([\s\S]*?)\\end\{align\*?\}/g, (_, inner) => {
    const cleaned = inner.replace(/\n/g, ' ').trim();
    return `$\\begin{aligned}${cleaned}\\end{aligned}$`;
  });

  result = result.replace(/\\begin\{aligned\}([\s\S]*?)\\end\{aligned\}/g, (_, inner) => {
    const cleaned = inner.replace(/\n/g, ' ').trim();
    return `$\\begin{aligned}${cleaned}\\end{aligned}$`;
  });

  // 2. Convert $$ ... $$ -> $ ... $
  result = result.replace(/\$\$([\s\S]+?)\$\$/g, (_, inner) => {
    const cleaned = inner.replace(/\n/g, ' ').trim();
    return `$${cleaned}$`;
  });

  // 3. Convert \[ ... \] -> $ ... $
  result = result.replace(/\\\[([\s\S]+?)\\\]/g, (_, inner) => {
    const cleaned = inner.replace(/\n/g, ' ').trim();
    return `$${cleaned}$`;
  });

  // 4. Convert \( ... \) -> $ ... $
  result = result.replace(/\\\(([\s\S]+?)\\\)/g, (_, inner) => {
    const cleaned = inner.replace(/\n/g, ' ').trim();
    return `$${cleaned}$`;
  });

  // 5. Replace any leftover $$ with $
  result = result.replace(/\$\$/g, '$');

  return result;
};

/**
 * Helper function to extract balanced curly braces from a string starting at startIndex.
 */
function getBalancedBraces(str: string, startIndex: number): { content: string; endIndex: number } | null {
  if (startIndex >= str.length || str[startIndex] !== '{') return null;
  let depth = 0;
  for (let i = startIndex; i < str.length; i++) {
    if (str[i] === '{') depth++;
    else if (str[i] === '}') {
      depth--;
      if (depth === 0) {
        return { content: str.slice(startIndex + 1, i), endIndex: i };
      }
    }
  }
  return null;
}

/**
 * Wraps orphan LaTeX commands (\frac, \dfrac, \sqrt, \widehat, \vec, \overline)
 * that have nested or complex curly braces in $ ... $ delimiters.
 */
function wrapOrphanLatexInString(text: string): string {
  let result = text;

  // Match commands like \frac, \dfrac, \sqrt, \widehat, \vec, \overline, \overrightarrow, \bar
  const commandRegex = /(\\(?:frac|dfrac|sqrt|widehat|vec|overline|overrightarrow|bar))\b/g;
  let match: RegExpExecArray | null;

  // Process from back to front to avoid index shifting issues
  const matches: { index: number; command: string }[] = [];
  while ((match = commandRegex.exec(result)) !== null) {
    matches.push({ index: match.index, command: match[1] });
  }

  for (let i = matches.length - 1; i >= 0; i--) {
    const { index, command } = matches[i];

    // Check if already preceded by $ or inside $...$
    const prefix = result.slice(0, index);
    const dollarCount = (prefix.match(/\$/g) || []).length;
    if (dollarCount % 2 !== 0) continue; // inside $...$

    let currPos = index + command.length;

    // Handle optional bracket for \sqrt[3]{x}
    if (command === '\\sqrt' && result[currPos] === '[') {
      const closeBracket = result.indexOf(']', currPos);
      if (closeBracket !== -1) currPos = closeBracket + 1;
    }

    // Skip whitespace
    while (currPos < result.length && /\s/.test(result[currPos])) currPos++;

    // First brace
    const brace1 = getBalancedBraces(result, currPos);
    if (!brace1) continue;

    let totalEndIndex = brace1.endIndex;

    // If fraction, check for second brace
    if (command === '\\frac' || command === '\\dfrac') {
      let nextPos = brace1.endIndex + 1;
      while (nextPos < result.length && /\s/.test(result[nextPos])) nextPos++;
      const brace2 = getBalancedBraces(result, nextPos);
      if (brace2) {
        totalEndIndex = brace2.endIndex;
      }
    }

    // Wrap the full LaTeX construct in $ ... $
    const fullConstruct = result.slice(index, totalEndIndex + 1);
    result = result.slice(0, index) + `$${fullConstruct}$` + result.slice(totalEndIndex + 1);
  }

  return result;
}

/**
 * Checks if a math formula contains complex LaTeX structures that MUST remain as LaTeX ($...$).
 * Complex structures include fractions, roots, stacked angle hats, vectors, matrices, integrals, sums, limits, systems.
 */
export const isComplexLatex = (formula: string): boolean => {
  if (!formula) return false;
  return /\\(?:frac|dfrac|cfrac|sqrt|widehat|widecheck|vec|overrightarrow|overline|underline|begin|int|iint|iiint|oint|sum|prod|lim|matrix|pmatrix|bmatrix|vmatrix|cases|aligned|gathered)\b/.test(formula);
};

/**
 * Converts a simple LaTeX math expression into clean direct Unicode without dollar signs ($).
 * Example:
 *  "\in" -> "∈"
 *  "M \in d" -> "M ∈ d"
 *  "N \notin d" -> "N ∉ d"
 *  "x \le 5" -> "x ≤ 5"
 *  "x^2 + y^2 = 25" -> "x² + y² = 25"
 *  "30^\circ" -> "30°"
 *  "x_1 + x_2 = 4" -> "x₁ + x₂ = 4"
 *  "x \in \mathbb{R}" -> "x ∈ ℝ"
 */
export const convertFormulaToUnicode = (rawFormula: string): string => {
  if (!rawFormula) return '';
  let str = rawFormula.trim();

  // If this formula contains complex LaTeX, do NOT strip its LaTeX syntax
  if (isComplexLatex(str)) {
    return `$${str}$`;
  }

  // 1. Sets and Number systems
  str = str.replace(/\\mathbb\{R\}|\\mathbf\{R\}|\\mathbb\s*R/g, 'ℝ')
           .replace(/\\mathbb\{N\}\^\*|\\mathbb\s*N\^\*/g, 'ℕ*')
           .replace(/\\mathbb\{N\}|\\mathbf\{N\}|\\mathbb\s*N/g, 'ℕ')
           .replace(/\\mathbb\{Z\}|\\mathbf\{Z\}|\\mathbb\s*Z/g, 'ℤ')
           .replace(/\\mathbb\{Q\}|\\mathbf\{Q\}|\\mathbb\s*Q/g, 'ℚ')
           .replace(/\\mathbb\{C\}|\\mathbf\{C\}|\\mathbb\s*C/g, 'ℂ');

  // 2. Greek letters
  str = str.replace(/\\alpha\b/g, 'α')
           .replace(/\\beta\b/g, 'β')
           .replace(/\\gamma\b/g, 'γ')
           .replace(/\\delta\b/g, 'δ')
           .replace(/\\epsilon\b|\\varepsilon\b/g, 'ε')
           .replace(/\\zeta\b/g, 'ζ')
           .replace(/\\eta\b/g, 'η')
           .replace(/\\theta\b|\\vartheta\b/g, 'θ')
           .replace(/\\iota\b/g, 'ι')
           .replace(/\\kappa\b/g, 'κ')
           .replace(/\\lambda\b/g, 'λ')
           .replace(/\\mu\b/g, 'μ')
           .replace(/\\nu\b/g, 'ν')
           .replace(/\\xi\b/g, 'ξ')
           .replace(/\\pi\b|\\varpi\b/g, 'π')
           .replace(/\\rho\b|\\varrho\b/g, 'ρ')
           .replace(/\\sigma\b/g, 'σ')
           .replace(/\\tau\b/g, 'τ')
           .replace(/\\upsilon\b/g, 'υ')
           .replace(/\\phi\b|\\varphi\b/g, 'φ')
           .replace(/\\chi\b/g, 'χ')
           .replace(/\\psi\b/g, 'ψ')
           .replace(/\\omega\b/g, 'ω')
           .replace(/\\Delta\b/g, 'Δ')
           .replace(/\\Gamma\b/g, 'Γ')
           .replace(/\\Theta\b/g, 'Θ')
           .replace(/\\Lambda\b/g, 'Λ')
           .replace(/\\Pi\b/g, 'Π')
           .replace(/\\Sigma\b/g, 'Σ')
           .replace(/\\Phi\b/g, 'Φ')
           .replace(/\\Psi\b/g, 'Ψ')
           .replace(/\\Omega\b/g, 'Ω');

  // 3. Mathematical relation and set symbols
  str = str.replace(/\\notin\b/g, '∉')
           .replace(/\\in\b/g, '∈')
           .replace(/\\subset\b/g, '⊂')
           .replace(/\\supset\b/g, '⊃')
           .replace(/\\subseteq\b/g, '⊆')
           .replace(/\\supseteq\b/g, '⊇')
           .replace(/\\cap\b/g, '∩')
           .replace(/\\cup\b/g, '∪')
           .replace(/\\setminus\b/g, '∖')
           .replace(/\\emptyset\b|\\varnothing\b/g, '∅')
           .replace(/\\forall\b/g, '∀')
           .replace(/\\exists\b/g, '∃');

  // 4. Comparison and operation symbols
  str = str.replace(/\\(?:leq|le)\b/g, '≤')
           .replace(/\\(?:geq|ge)\b/g, '≥')
           .replace(/\\(?:neq|ne)\b/g, '≠')
           .replace(/\\approx\b/g, '≈')
           .replace(/\\equiv\b/g, '≡')
           .replace(/\\pm\b/g, '±')
           .replace(/\\mp\b/g, '∓')
           .replace(/\\times\b/g, '×')
           .replace(/\\cdot\b/g, '·')
           .replace(/\\div\b/g, '÷')
           .replace(/\\infty\b/g, '∞')
           .replace(/\\parallel\b/g, '∥')
           .replace(/\\perp\b/g, '⊥')
           .replace(/\\angle\b/g, '∠')
           .replace(/\\Rightarrow\b|\\implies\b/g, '⇒')
           .replace(/\\Leftrightarrow\b|\\iff\b/g, '⇔')
           .replace(/\\rightarrow\b|\\to\b/g, '→')
           .replace(/\\leftarrow\b/g, '←');

  // 5. Degree symbol: 30^\circ, 30^o, ^\circ -> 30°, °
  str = str.replace(/(\d+)\s*\^\s*(?:\\circ|o)\b/g, '$1°')
           .replace(/\^\s*(?:\\circ|o)\b/g, '°')
           .replace(/\\circ\b/g, '°');

  // 6. Unit powers: m^2, cm^3, etc.
  str = str.replace(/\b(m|cm|mm|dm|km)\s*\^(2|3)\b/gi, (_, unit, p) => `${unit}${p === '2' ? '²' : '³'}`);

  // 7. Superscripts like x^2, a^{n}, 10^{-3}, x^{2x+1}
  str = str.replace(/([A-Za-z0-9\)])\^(?:\{([A-Za-z0-9+\--]+)\}|([A-Za-z0-9+\--]+))/g, (full, base, braced, single) => {
    const power = braced || single;
    const uni = toSuperscriptUnicode(power);
    return uni !== power ? `${base}${uni}` : full;
  });

  // 8. Subscripts like x_1, a_n, x_{12}, H_2O
  str = str.replace(/([A-Za-z0-9\)])_(?:\{([A-Za-z0-9+\--]+)\}|([A-Za-z0-9+\--]+))/g, (full, base, braced, single) => {
    const sub = braced || single;
    const uni = toSubscriptUnicode(sub);
    return uni !== sub ? `${base}${uni}` : full;
  });

  // 9. Remove LaTeX text wrappers inside simple formula like \text{cm} -> cm
  str = str.replace(/\\text\{([^}]+)\}/g, '$1')
           .replace(/\\mathrm\{([^}]+)\}/g, '$1')
           .replace(/\\mathbf\{([^}]+)\}/g, '$1')
           .replace(/\\mathit\{([^}]+)\}/g, '$1');

  // 10. Clean up any leftover LaTeX spacing commands
  str = str.replace(/\\[,;:!]/g, ' ')
           .replace(/\\quad\b|\\qquad\b/g, '  ')
           .replace(/\\left/g, '')
           .replace(/\\right/g, '');

  // 11. Normalize spaces inside the clean Unicode formula
  str = str.replace(/\s+/g, ' ').trim();

  // If there are still complex backslashes left that were not converted, keep as LaTeX
  if (/\\([A-Za-z]+)/.test(str)) {
    return `$${rawFormula.trim()}$`;
  }

  // Return clean standalone Unicode string (WITHOUT DOLLAR SIGNS)
  return str;
};

/**
 * Fixes unmatched or corrupted dollar signs ($) in a line to prevent Word equation conversion errors.
 */
export const fixUnmatchedDollarSigns = (line: string): string => {
  if (!line) return '';
  const dollarCount = (line.match(/\$/g) || []).length;
  if (dollarCount % 2 === 0) return line;

  // Odd number of dollar signs! Find and fix orphan $
  // Case A: Trailing dollar at end of line like "tam giác $ABC$" or "giá 50$"
  if (line.endsWith('$') && !line.slice(0, -1).includes('$')) {
    return line.slice(0, -1);
  }

  // Case B: Currency or text isolated dollar like "$100" without closing
  let fixed = line.replace(/(^|\s)\$(\d+[\w\s]*)(?!\$)/g, '$1$2');
  if ((fixed.match(/\$/g) || []).length % 2 !== 0) {
    // If still unmatched, close the last opened formula
    fixed = fixed + '$';
  }
  return fixed;
};

/**
 * Converts simple standalone math constructs (e.g. x^2, a_1, H_2O, 30^\circ, 20 m^2, \le) into clean direct Unicode.
 * Leaves complex LaTeX constructs (\frac, \sqrt, \widehat, etc.) for KaTeX rendering / Word export.
 */
export const convertSimpleMathToUnicode = (text: string): string => {
  if (!text) return '';
  let result = text;

  // 1. Degree symbol: 30^\circ, 30^o, $30^\circ$, $30^o$ -> 30°
  result = result.replace(/\$?(\d+)\s*(?:\^\s*(?:\\circ|o)|\u005c\u0063\u0069\u0072\u0063)\$?/g, '$1°');

  // 2. Unit powers: m^2, m^3, cm^2, cm^3, mm^2, mm^3, dm^2, dm^3, km^2, km^3 -> m², m³, etc.
  result = result.replace(/\$?(\b(?:m|cm|mm|dm|km)\s*)\^(2|3)\$?/gi, (_, unit, p) => `${unit.trim()}${p === '2' ? '²' : '³'}`);

  // 3. Process ALL $...$ math blocks: if simple -> convert to pure Unicode without $ delimiters!
  result = result.replace(/\$([^\$\n]+?)\$/g, (_, inner) => {
    return convertFormulaToUnicode(inner);
  });

  // 4. Raw unbraced superscripts outside $...$ like x^2, x^3, a^n, a^x, a^-x, 10^-3
  result = result.replace(/(^|[^A-Za-z0-9_])([A-Za-z0-9]+)\^(?:\{([A-Za-z0-9+\--]+)\}|([-+]?[A-Za-z0-9]+))(?=$|[^A-Za-z0-9_])/g, (fullMatch, prefix, base, braced, single) => {
    const power = braced || single;
    const uniPower = toSuperscriptUnicode(power);
    if (uniPower !== power) {
      return `${prefix}${base}${uniPower}`;
    }
    return `${prefix}$${base}^{${power}}$`;
  });

  // 5. Raw unbraced subscripts outside $...$ like x_1, a_n, H_2O, CO_2
  result = result.replace(/(^|[^A-Za-z0-9_])([A-Za-z0-9]+)_(?:\{([A-Za-z0-9+\--]+)\}|([-+]?[A-Za-z0-9]+))(?=$|[^A-Za-z0-9_])/g, (fullMatch, prefix, base, braced, single) => {
    const sub = braced || single;
    const uniSub = toSubscriptUnicode(sub);
    if (uniSub !== sub) {
      return `${prefix}${base}${uniSub}`;
    }
    return `${prefix}$${base}_${sub}$`;
  });

  // 6. Common comparison and math symbols in raw text outside $...$ -> Direct Unicode
  result = result.replace(/\\notin\b/g, '∉')
                 .replace(/\\in\b/g, '∈')
                 .replace(/\\(?:leq|le)\b/g, '≤')
                 .replace(/\\(?:geq|ge)\b/g, '≥')
                 .replace(/\\(?:neq|ne)\b/g, '≠')
                 .replace(/\\approx\b/g, '≈')
                 .replace(/\\equiv\b/g, '≡')
                 .replace(/\\pm\b/g, '±')
                 .replace(/\\times\b/g, '×')
                 .replace(/\\div\b/g, '÷')
                 .replace(/\\infty\b/g, '∞')
                 .replace(/\\subset\b/g, '⊂')
                 .replace(/\\subseteq\b/g, '⊆')
                 .replace(/\\cap\b/g, '∩')
                 .replace(/\\cup\b/g, '∪')
                 .replace(/\\parallel\b/g, '∥')
                 .replace(/\\perp\b/g, '⊥');

  return result;
};

/**
 * Converts orphan/raw LaTeX commands, angle symbols, or un-delimited math 
 * into standard inline ($ ... $) math expressions.
 * Preserves existing math formulas intact without deleting symbols or stripping delimiters.
 */
export const normalizeMathText = (content: string): string => {
  if (!content) return '';
  let result = convertBlockMathToInlineMath(content);

  // 1. First convert simple math & units to pure Unicode (and strip $ for simple formulas)
  result = convertSimpleMathToUnicode(result);

  // 2. Replace form feed ASCII characters (\x0c) or \f with \f
  result = result.replace(/\x0c/g, '\\f');

  // 3. Protect all remaining complex valid math blocks ($...$) FIRST before any transformations!
  const mathBlocks: string[] = [];
  const mathRegex = /(\$[^\$\n]+?\$)/g;

  result = result.replace(mathRegex, (m) => {
    mathBlocks.push(m);
    return `§§MATH_BLOCK_${mathBlocks.length - 1}§§`;
  });

  // 4. Normalize angle symbols outside math blocks
  // For geometric angles with hat: $\widehat{ABC}$, $\widehat{A}$
  result = result.replace(/\\angle\s*\{([A-Za-z0-9]+)\}/g, (_, g1) => `$\\widehat{${g1}}$`);
  result = result.replace(/\\angle\s*([A-Za-z0-9]{1,4})/g, (_, g1) => `$\\widehat{${g1}}$`);

  // 5. Normalize triangle symbols outside math blocks
  result = result.replace(/\\Delta\s*([A-Za-z0-9]{1,4})/g, (_, g1) => `Δ${g1}`);
  result = result.replace(/Δ\s*([A-Za-z0-9]{1,4})/g, (_, g1) => `Δ${g1}`);

  // 6. Wrap orphan LaTeX environments (e.g. \begin{cases} ... \end{cases}) outside math
  result = result.replace(/(\\begin\{(?:cases|matrix|bmatrix|vmatrix|aligned)\}[\s\S]+?\\end\{(?:cases|matrix|bmatrix|vmatrix|aligned)\})/g, (_, g1) => `$${g1}$`);

  // 7. Wrap orphan complex fractions, roots, hats, vectors
  result = wrapOrphanLatexInString(result);

  // 8. Restore protected math blocks
  result = result.replace(/§§MATH_BLOCK_(\d+)§§/g, (_, idx) => mathBlocks[parseInt(idx, 10)] || '');

  // 9. Fix any unmatched dollar signs in each line
  result = result.split('\n').map(fixUnmatchedDollarSigns).join('\n');

  return result;
};

/**
 * Strips Markdown bold/headers outside of math blocks safely without touching math sub/superscripts.
 * Uses §§MATH_PROTECTED_X§§ placeholders to strictly avoid placeholder corruption.
 */
export const cleanMarkdownOutsideMath = (text: string): string => {
  if (!text) return '';

  // First normalize and convert simple math to pure Unicode
  let cleaned = normalizeMathText(text)
    .replace(/<br\s*\/?>/gi, '')
    .replace(/&nbsp;/g, ' ');

  // Protect remaining math formulas ($...$)
  const mathPlaceholders: string[] = [];
  const mathRegex = /(\$[^\$\n]+?\$)/g;

  cleaned = cleaned.replace(mathRegex, (match) => {
    mathPlaceholders.push(match);
    return `§§MATH_PROTECTED_${mathPlaceholders.length - 1}§§`;
  });

  // Strip Markdown markers strictly OUTSIDE math
  cleaned = cleaned
    .replace(/\*\*/g, '')
    .replace(/__/g, '')
    .replace(/###\s*/g, '')
    .replace(/##\s*/g, '')
    .replace(/#\s*/g, '');

  // Restore protected math formulas untouched
  cleaned = cleaned.replace(/§§MATH_PROTECTED_(\d+)§§/g, (_, idx) => mathPlaceholders[parseInt(idx, 10)] || '');

  return cleaned.trim();
};

export interface MathToken {
  type: 'text' | 'inline-math' | 'block-math';
  content: string;
  rawFormula?: string;
  renderedHtml?: string;
}

/**
 * Parses a string into tokens of text and rendered KaTeX HTML or formula info.
 */
export const parseMathTokens = (content: string): MathToken[] => {
  const normalized = normalizeMathText(content);
  const regex = /(\$[^\$\n]+?\$)/g;

  const tokens: MathToken[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(normalized)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: 'text',
        content: normalized.slice(lastIndex, match.index)
      });
    }

    const mathExpr = match[0];
    let isBlock = false;
    let rawFormula = '';

    if (mathExpr.startsWith('$') && mathExpr.endsWith('$')) {
      isBlock = false;
      rawFormula = mathExpr.slice(1, -1).trim();
    }

    // Fix unbraced \widehat ABC inside formula
    if (rawFormula) {
      rawFormula = rawFormula.replace(/\\widehat\s+([A-Za-z0-9]{1,4})/g, '\\widehat{$1}');
    }

    if (rawFormula) {
      try {
        const renderedHtml = katex.renderToString(rawFormula, {
          displayMode: isBlock,
          throwOnError: false,
          output: 'html'
        });

        tokens.push({
          type: 'inline-math',
          content: mathExpr,
          rawFormula,
          renderedHtml
        });
      } catch (err) {
        tokens.push({
          type: 'text',
          content: rawFormula || mathExpr
        });
      }
    } else {
      tokens.push({
        type: 'text',
        content: mathExpr
      });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < normalized.length) {
    tokens.push({
      type: 'text',
      content: normalized.slice(lastIndex)
    });
  }

  return tokens;
};

/**
 * Prepares math formulas for Word (.docx) export and Clipboard copy.
 * - Simple formulas & symbols are 100% pure Unicode without $ delimiters.
 * - Complex formulas (fractions, roots, systems) keep strict, balanced LaTeX ($ ... $) for Word Equation (Alt+=) / MathType.
 * - Guarantees zero corrupted dollar signs ($) to prevent Word from mangling Vietnamese characters.
 */
export const formatMathForWord = (text: string): string => {
  if (!text) return '';
  const cleaned = cleanMarkdownOutsideMath(text);
  return convertBlockMathToInlineMath(cleaned);
};



