/**
 * 📜 Text Engine Layer
 *
 * מנוע לפירוק והבנת טקסט תפילה
 * Parses prayer text and identifies spiritual words with metadata
 */

import type {
  SpiritualWord,
  SpiritualVerse,
  SpiritualText,
  WordType,
  DivineName,
  Sefirah
} from './types'
import { DIVINE_NAME_SEFIRAH } from './sefirot'

// ═══════════════════════════════════════════════════════════════════
// DIVINE NAME PATTERNS
// ═══════════════════════════════════════════════════════════════════

const DIVINE_NAME_PATTERNS: Record<DivineName, RegExp[]> = {
  'הוי-ה': [/יהוה/, /י-ה-ו-ה/, /ה'/],
  'אדנ-י': [/אדני/, /אדונ?י/, /אֲדֹנָי/],
  'אלהים': [/אלהים/, /אלוהים/, /אֱלֹהִים/, /אֱלֹהֵינוּ/, /אלהינו/, /אֱלֹהֶיךָ/, /אלהיך/],
  'שדי': [/שדי/, /שַׁדַּי/],
  'צבאות': [/צבאות/, /צְבָאוֹת/],
  'אהיה': [/אהיה/, /אֶהְיֶה/]
}

// Kavvanot (intentions) for Divine Names
const DIVINE_NAME_KAVVANOT: Record<DivineName, string> = {
  'הוי-ה': 'שם הוי"ה - היה הווה ויהיה - מקור כל המציאות, מחשבה על אינסוף ברוך הוא',
  'אדנ-י': 'שם אדנות - אדון הכל, מלך מלכי המלכים, שולט בכל העולמות',
  'אלהים': 'שם אלהים - כח הדין והגבורה, בורא ומנהיג הטבע',
  'שדי': 'שם שדי - שאמר לעולמו די, גבול ומידה לכל הבריאה',
  'צבאות': 'שם צבאות - אדון כל הצבאות העליונים והתחתונים',
  'אהיה': 'שם אהיה - אהיה אשר אהיה, הוויה מוחלטת מעבר לזמן'
}

// Words that have special spiritual significance
const KAVVANAH_WORDS: Record<string, { sefirah: Sefirah; meaning: string }> = {
  'אור': { sefirah: 'כתר', meaning: 'Light - Infinite Divine radiance' },
  'חכמה': { sefirah: 'חכמה', meaning: 'Wisdom - First flash of insight' },
  'בינה': { sefirah: 'בינה', meaning: 'Understanding - Deep contemplation' },
  'חסד': { sefirah: 'חסד', meaning: 'Lovingkindness - Expansive love' },
  'גבורה': { sefirah: 'גבורה', meaning: 'Strength - Holy restraint' },
  'תפארת': { sefirah: 'תפארת', meaning: 'Beauty - Harmonious balance' },
  'נצח': { sefirah: 'נצח', meaning: 'Eternity - Enduring victory' },
  'הוד': { sefirah: 'הוד', meaning: 'Splendor - Humble majesty' },
  'יסוד': { sefirah: 'יסוד', meaning: 'Foundation - Sacred connection' },
  'מלכות': { sefirah: 'מלכות', meaning: 'Sovereignty - Divine presence' },
  'שכינה': { sefirah: 'מלכות', meaning: 'Divine Presence' },
  'קדוש': { sefirah: 'כתר', meaning: 'Holy - Set apart' },
  'ברוך': { sefirah: 'חכמה', meaning: 'Blessed - Flow of blessing' },
  'שלום': { sefirah: 'יסוד', meaning: 'Peace - Complete wholeness' },
  'אמת': { sefirah: 'תפארת', meaning: 'Truth - Central pillar' },
  'רחמים': { sefirah: 'תפארת', meaning: 'Mercy - Compassionate balance' },
  'אהבה': { sefirah: 'חסד', meaning: 'Love - Outpouring affection' },
  'יראה': { sefirah: 'גבורה', meaning: 'Awe - Reverential fear' },
  'תשובה': { sefirah: 'בינה', meaning: 'Return - Coming back to source' },
  'תפילה': { sefirah: 'מלכות', meaning: 'Prayer - Ascending speech' },
  'נשמה': { sefirah: 'בינה', meaning: 'Soul - Divine breath' },
  'לב': { sefirah: 'תפארת', meaning: 'Heart - Inner center' },
  'כבוד': { sefirah: 'הוד', meaning: 'Glory - Manifest honor' },
  'גאולה': { sefirah: 'נצח', meaning: 'Redemption - Ultimate freedom' },
  'משיח': { sefirah: 'כתר', meaning: 'Messiah - Anointed one' },
  'ישועה': { sefirah: 'נצח', meaning: 'Salvation - Victorious deliverance' }
}

// ═══════════════════════════════════════════════════════════════════
// GEMATRIA CALCULATOR
// ═══════════════════════════════════════════════════════════════════

const GEMATRIA_VALUES: Record<string, number> = {
  'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
  'י': 10, 'כ': 20, 'ך': 20, 'ל': 30, 'מ': 40, 'ם': 40, 'נ': 50, 'ן': 50,
  'ס': 60, 'ע': 70, 'פ': 80, 'ף': 80, 'צ': 90, 'ץ': 90, 'ק': 100, 'ר': 200,
  'ש': 300, 'ת': 400
}

export function calculateGematria(word: string): number {
  let sum = 0
  for (const char of word) {
    sum += GEMATRIA_VALUES[char] || 0
  }
  return sum
}

// ═══════════════════════════════════════════════════════════════════
// TEXT PARSING ENGINE
// ═══════════════════════════════════════════════════════════════════

let wordIdCounter = 0

function generateWordId(): string {
  return `word_${++wordIdCounter}_${Date.now().toString(36)}`
}

/**
 * Identify if a word is a Divine Name
 */
function identifyDivineName(word: string): DivineName | undefined {
  const cleanWord = word.replace(/[^\u0590-\u05FF]/g, '') // Keep only Hebrew chars

  for (const [name, patterns] of Object.entries(DIVINE_NAME_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(cleanWord)) {
        return name as DivineName
      }
    }
  }
  return undefined
}

/**
 * Determine the word type
 */
function determineWordType(word: string, divineName?: DivineName): WordType {
  if (divineName) return 'שם'
  if (KAVVANAH_WORDS[word]) return 'כוונה'
  return 'רגיל'
}

/**
 * Calculate energy level based on word properties
 */
function calculateEnergyLevel(
  wordType: WordType,
  divineName?: DivineName,
  _kavvanah?: string
): number {
  switch (wordType) {
    case 'שם':
      // Divine names have highest energy
      if (divineName === 'הוי-ה') return 1.0
      if (divineName === 'אדנ-י') return 0.9
      if (divineName === 'אלהים') return 0.85
      return 0.8
    case 'כוונה':
      return 0.7
    case 'פסוק':
      return 0.5
    case 'תפילה':
      return 0.4
    default:
      return 0.1
  }
}

/**
 * Parse a single word into SpiritualWord
 */
export function parseWord(text: string): SpiritualWord {
  const cleanText = text.trim()
  const divineName = identifyDivineName(cleanText)
  const wordType = determineWordType(cleanText, divineName)

  const kavvanahInfo = KAVVANAH_WORDS[cleanText]
  const sefirah = divineName
    ? DIVINE_NAME_SEFIRAH[divineName]
    : kavvanahInfo?.sefirah

  // Get kavvanah - Divine Names have priority
  const kavvanah = divineName
    ? DIVINE_NAME_KAVVANOT[divineName]
    : kavvanahInfo?.meaning

  const energyLevel = calculateEnergyLevel(
    wordType,
    divineName,
    kavvanah
  )

  // Duration based on energy level - longer for Divine Names
  const duration = divineName ? 3000 : (1000 + energyLevel * 2000)

  return {
    id: generateWordId(),
    text: cleanText,
    type: wordType,
    divineName,
    sefirah,
    gematria: calculateGematria(cleanText),
    kavvanah,
    energyLevel,
    duration
  }
}

/**
 * Parse a verse (line) into SpiritualVerse
 */
export function parseVerse(
  text: string,
  source?: string,
  defaultSefirah?: Sefirah
): SpiritualVerse {
  const words = text
    .split(/\s+/)
    .filter(w => w.length > 0)
    .map(parseWord)

  // Determine verse theme from words
  const sefirahCounts = new Map<Sefirah, number>()
  for (const word of words) {
    if (word.sefirah) {
      sefirahCounts.set(word.sefirah, (sefirahCounts.get(word.sefirah) || 0) + 1)
    }
  }

  let theme: Sefirah | undefined = defaultSefirah
  let maxCount = 0
  for (const [sefirah, count] of sefirahCounts) {
    if (count > maxCount) {
      maxCount = count
      theme = sefirah
    }
  }

  return {
    id: `verse_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`,
    words,
    source,
    theme
  }
}

/**
 * Parse full prayer text into SpiritualText
 */
export function parseSpiritualText(
  title: string,
  text: string,
  defaultSefirah?: Sefirah
): SpiritualText {
  const lines = text.split(/\n/).filter(line => line.trim().length > 0)

  const verses = lines.map((line) => {
    // Check for source indicators like (תהילים כ"ג)
    const sourceMatch = line.match(/\(([^)]+)\)$/)
    const source = sourceMatch ? sourceMatch[1] : undefined
    const cleanLine = sourceMatch ? line.replace(sourceMatch[0], '').trim() : line

    return parseVerse(cleanLine, source, defaultSefirah)
  })

  return {
    id: `text_${Date.now().toString(36)}`,
    title,
    verses,
    defaultSefirah
  }
}

/**
 * Get all significant words (with effects) from a SpiritualText
 */
export function getSignificantWords(text: SpiritualText): SpiritualWord[] {
  const significant: SpiritualWord[] = []

  for (const verse of text.verses) {
    for (const word of verse.words) {
      if (word.type !== 'רגיל' || word.energyLevel > 0.3) {
        significant.push(word)
      }
    }
  }

  return significant
}

/**
 * Create an index for quick word lookup by ID
 */
export function createWordIndex(
  text: SpiritualText
): Map<string, SpiritualWord> {
  const index = new Map<string, SpiritualWord>()

  for (const verse of text.verses) {
    for (const word of verse.words) {
      index.set(word.id, word)
    }
  }

  return index
}
