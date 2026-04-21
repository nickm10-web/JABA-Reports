// Rule-based caption analysis — structural/voice features only, no LLM.
//
// Gives the Genesco report something concrete to say about each campaign
// caption instead of just displaying the text. Features compared:
//   - length (characters, words, sentences)
//   - emoji count, hashtag count, @mention count
//   - primary language (English / Spanish / mixed) via script + stopword heuristic
//   - line breaks (posts that use whitespace vs. run-on copy)

export type CaptionStats = {
  charCount    : number;
  wordCount    : number;
  sentenceCount: number;
  emojiCount   : number;
  hashtagCount : number;
  mentionCount : number;
  lineBreaks   : number;
  language     : 'en' | 'es' | 'mixed' | 'other';
};

export type CaptionProfile = {
  // Averages across a set of captions (usually an athlete's organic baseline).
  n               : number;
  avg             : CaptionStats;
  dominantLanguage: CaptionStats['language'];
  languageMix     : Partial<Record<CaptionStats['language'], number>>;
};

const EMOJI_RE   = /\p{Extended_Pictographic}/gu;
const HASHTAG_RE = /(^|[^\w])#(\w[\w\-]*)/g;
const MENTION_RE = /(^|[^\w])@(\w[\w.]*)/g;

// Small stopword sets — enough to discriminate between EN and ES.
const EN_STOP = new Set(['the','and','with','for','this','that','you','your','our','have','from','are','was','were','just','when','what','they','their','about','more','all']);
const ES_STOP = new Set(['que','por','para','con','los','las','una','uno','del','como','más','mas','pero','este','esto','esta','cuando','siempre','todos','todas','muy','también','tambien','hacia']);

const hasSpanishDiacritics = (s: string) => /[áéíóúñ¿¡ÁÉÍÓÚÑ]/.test(s);

function detectLanguage(text: string): CaptionStats['language'] {
  if (!text.trim()) return 'other';
  const spanishSignal = hasSpanishDiacritics(text);
  const words = text.toLowerCase().match(/[a-záéíóúñ]+/gi) ?? [];
  let en = 0, es = 0;
  for (const w of words) {
    if (EN_STOP.has(w)) en++;
    if (ES_STOP.has(w)) es++;
  }
  if (spanishSignal && en === 0) return 'es';
  if (spanishSignal && en > 0)   return 'mixed';
  if (es > 0 && en > 0)          return 'mixed';
  if (es > en)                   return 'es';
  if (en > 0)                    return 'en';
  return 'other';
}

export function analyzeCaption(raw: string | undefined | null): CaptionStats {
  const text = raw ?? '';
  const stripped = text
    .replace(HASHTAG_RE, '$1')
    .replace(MENTION_RE, '$1')
    .replace(EMOJI_RE, ' ');
  const words     = stripped.split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);

  return {
    charCount    : text.length,
    wordCount    : words.length,
    sentenceCount: sentences.length,
    emojiCount   : (text.match(EMOJI_RE)   ?? []).length,
    hashtagCount : (text.match(HASHTAG_RE) ?? []).length,
    mentionCount : (text.match(MENTION_RE) ?? []).length,
    lineBreaks   : (text.match(/\n/g)      ?? []).length,
    language     : detectLanguage(text),
  };
}

export function buildProfile(captions: string[]): CaptionProfile {
  const stats = captions.filter((c) => c && c.trim().length > 0).map(analyzeCaption);
  const n = stats.length;
  if (n === 0) {
    return {
      n: 0,
      avg: { charCount:0, wordCount:0, sentenceCount:0, emojiCount:0, hashtagCount:0, mentionCount:0, lineBreaks:0, language:'other' },
      dominantLanguage: 'other',
      languageMix: {},
    };
  }
  const sum = (fn: (s: CaptionStats) => number) => stats.reduce((acc, s) => acc + fn(s), 0);
  const avg: CaptionStats = {
    charCount    : Math.round(sum((s) => s.charCount)    / n),
    wordCount    : Math.round(sum((s) => s.wordCount)    / n),
    sentenceCount: Math.round(sum((s) => s.sentenceCount) / n),
    emojiCount   : Math.round(sum((s) => s.emojiCount)   / n),
    hashtagCount : Math.round(sum((s) => s.hashtagCount) / n),
    mentionCount : Math.round(sum((s) => s.mentionCount) / n),
    lineBreaks   : Math.round(sum((s) => s.lineBreaks)   / n),
    language     : 'other', // unused at the avg level
  };
  const languageMix: Partial<Record<CaptionStats['language'], number>> = {};
  for (const s of stats) languageMix[s.language] = (languageMix[s.language] ?? 0) + 1;
  const dominantLanguage = (Object.entries(languageMix).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0]?.[0] ?? 'other') as CaptionStats['language'];
  return { n, avg, dominantLanguage, languageMix };
}

export type VoiceVerdict = 'matches' | 'borderline' | 'off-voice';

export type VoiceComparison = {
  verdict : VoiceVerdict;
  score   : number; // 0–1, 1 = perfect match
  flags   : string[]; // human-readable observations, e.g. "No emojis (typical: 2)"
  campaign: CaptionStats;
  baseline: CaptionProfile;
};

// Fractional difference that ignores very-small-denominator noise.
function pctDiff(actual: number, typical: number) {
  if (typical === 0 && actual === 0) return 0;
  if (typical === 0) return 1;
  return Math.abs(actual - typical) / typical;
}

export function compareToProfile(campaign: CaptionStats, baseline: CaptionProfile): VoiceComparison {
  const flags: string[] = [];

  // Each dimension contributes up to 1.0 "points of divergence". We sum and
  // normalise so the final score sits in [0,1].
  let divergence = 0;
  let dims = 0;

  const probe = (label: string, actual: number, typical: number, softFloor = 0) => {
    dims++;
    // If the baseline value is below softFloor we don't penalise for matching
    // it (e.g. "typical emoji count is 0.4 — 0 emojis isn't noteworthy").
    if (typical < softFloor && actual < softFloor) return;
    const d = Math.min(1, pctDiff(actual, typical));
    divergence += d;
    if (d > 0.5) {
      const verb = actual > typical ? 'more' : 'fewer';
      flags.push(`${label}: ${actual} (${verb} than typical ${typical})`);
    }
  };

  probe('Length (words)', campaign.wordCount,    baseline.avg.wordCount,    4);
  probe('Emojis',         campaign.emojiCount,   baseline.avg.emojiCount,   0.5);
  probe('Hashtags',       campaign.hashtagCount, baseline.avg.hashtagCount, 0.5);
  probe('Mentions',       campaign.mentionCount, baseline.avg.mentionCount, 0.5);
  probe('Line breaks',    campaign.lineBreaks,   baseline.avg.lineBreaks,   0.5);

  // Language mismatch is a hard flag.
  const dominantLang = baseline.dominantLanguage;
  if (dominantLang !== 'other' && campaign.language !== 'other' && campaign.language !== dominantLang) {
    flags.push(
      campaign.language === 'mixed'
        ? `Mixed-language caption vs. typical ${dominantLang.toUpperCase()}-only`
        : `${campaign.language.toUpperCase()} caption vs. typical ${dominantLang.toUpperCase()}`
    );
    divergence += 1;
    dims++;
  }

  const score   = dims > 0 ? 1 - (divergence / dims) : 1;
  const verdict: VoiceVerdict = score >= 0.7 ? 'matches' : score >= 0.45 ? 'borderline' : 'off-voice';

  return { verdict, score, flags, campaign, baseline };
}

// ─── Plain-English voice note ─────────────────────────────────────────────────

const LANG_LABEL: Record<CaptionStats['language'], string> = {
  en   : 'English',
  es   : 'Spanish',
  mixed: 'bilingual',
  other: 'caption',
};

function describeCampaignCaption(c: CaptionStats): string {
  const parts: string[] = [];
  if (c.wordCount > 0) parts.push(`${c.wordCount}-word`);
  if (c.language === 'mixed') parts.push('bilingual');
  else if (c.language === 'es' || c.language === 'en') parts.push(LANG_LABEL[c.language]);
  const hasTags   = c.hashtagCount > 0;
  const hasEmoji  = c.emojiCount > 0;
  if (hasTags && !hasEmoji) parts.push('promotional');
  else if (hasEmoji && c.wordCount < 15) parts.push('casual');
  return parts.join(' ') + ' caption';
}

function describeAthleteStyle(name: string, profile: CaptionProfile): string {
  if (profile.n === 0) return `${name} has no organic baseline in this window`;

  // Primary adjectives that attach directly to "captions".
  const adjectives: string[] = [];
  const wc = profile.avg.wordCount;
  if (wc <= 12)       adjectives.push('short');
  else if (wc >= 35)  adjectives.push('long-form');
  else                adjectives.push('medium-length');

  if (profile.avg.emojiCount >= 2)      adjectives.push('emoji-heavy');
  else if (profile.avg.emojiCount >= 1) adjectives.push('emoji-light');
  if (profile.avg.hashtagCount === 0)   adjectives.push('hashtag-free');

  // Trailing clause for behaviors that don't stack as adjectives.
  const trailing: string[] = [];
  if (profile.avg.mentionCount >= 1) trailing.push('often tagging others');

  const langLabel = profile.dominantLanguage === 'mixed' ? 'bilingual' : LANG_LABEL[profile.dominantLanguage];
  const lang = profile.dominantLanguage !== 'other' ? ` ${langLabel}` : '';

  const adjPhrase = adjectives.join(', ') + lang + ' captions';
  const trailPhrase = trailing.length ? `, ${trailing.join(' and ')}` : '';
  return `${name} typically posts ${adjPhrase}${trailPhrase}`;
}

export function voiceNote(name: string, campaign: CaptionStats, baseline: CaptionProfile, cmp: VoiceComparison): string {
  if (baseline.n < 3) {
    return `Caption analysis limited — only ${baseline.n} organic baseline post${baseline.n === 1 ? '' : 's'} to compare against.`;
  }

  if (cmp.verdict === 'matches') {
    return `Caption style is consistent with ${name}'s organic voice. That authenticity typically preserves engagement on sponsored placements.`;
  }

  const campaignDesc = describeCampaignCaption(campaign);
  const baseDesc     = describeAthleteStyle(name, baseline);

  if (cmp.verdict === 'borderline') {
    const topFlag = cmp.flags[0];
    const trailing = topFlag ? ` ${topFlag} is the biggest departure.` : '';
    return `Caption leans more promotional than ${name}'s organic posts. ${baseDesc}; this ${campaignDesc} is a partial match.${trailing}`;
  }

  // off-voice
  return `Caption reads as brand-scripted. ${baseDesc}. This ${campaignDesc} is atypical of their organic style, which likely suppressed authentic engagement.`;
}
