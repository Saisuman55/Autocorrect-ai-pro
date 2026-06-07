// ─────────────────────────────────────────────────────
//  AutoCorrect AI Pro — 100% Offline Engine
//  Features: spell check, grammar, tone rewriting,
//  custom dictionary, document upload support
//  Pinnacle Labs AI Internship 2026
//  Built by: Sai Suman Samantaray
// ─────────────────────────────────────────────────────

const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const nspell     = require('nspell');
const dictionary = require('dictionary-en');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Load dictionary once at startup ──────────────────
let spell = null;
dictionary((err, dict) => {
  if (err) { console.error('Dictionary load error:', err); return; }
  spell = nspell(dict);
  console.log('  📖  English dictionary loaded.');
});

// ── Common misspelling map (curated fixes) ────────────
const MISSPELLINGS = {
  // Classic typos
  'teh': 'the', 'adn': 'and', 'thier': 'their', 'recieve': 'receive',
  'beleive': 'believe', 'occured': 'occurred', 'untill': 'until',
  'begining': 'beginning', 'neccessary': 'necessary', 'seperate': 'separate',
  'definately': 'definitely', 'occurance': 'occurrence', 'wierd': 'weird',
  'freind': 'friend', 'goverment': 'government', 'febuary': 'February',
  'enviroment': 'environment', 'knowlege': 'knowledge', 'millenium': 'millennium',
  'acheive': 'achieve', 'accomodate': 'accommodate', 'arguement': 'argument',
  'calender': 'calendar', 'cemetary': 'cemetery', 'comittee': 'committee',
  'concious': 'conscious', 'embarras': 'embarrass', 'existance': 'existence',
  'foriegn': 'foreign', 'grammer': 'grammar', 'gaurd': 'guard',
  'harrass': 'harass', 'independance': 'independence', 'inocent': 'innocent',
  'liason': 'liaison', 'maintainance': 'maintenance',
  'mispell': 'misspell', 'mischevious': 'mischievous', 'noticable': 'noticeable',
  'occassion': 'occasion', 'plagarism': 'plagiarism',
  'pronounciation': 'pronunciation', 'publically': 'publicly', 'questionaire': 'questionnaire',
  'recomend': 'recommend', 'rythm': 'rhythm', 'sargent': 'sergeant',
  'sieze': 'seize', 'succesful': 'successful', 'supercede': 'supersede',
  'tempermental': 'temperamental', 'truely': 'truly', 'vaccuum': 'vacuum',
  'visious': 'vicious', 'wether': 'whether', 'writting': 'writing',
  // Common phonetic misspellings
  'amature': 'amateur', 'aparent': 'apparent', 'athiest': 'atheist',
  'buisness': 'business', 'catagory': 'category', 'collegue': 'colleague',
  'concieve': 'conceive', 'copywrite': 'copyright', 'critisism': 'criticism',
  'decieve': 'deceive', 'develope': 'develop', 'dilema': 'dilemma',
  'dissapear': 'disappear', 'dissapoint': 'disappoint', 'excede': 'exceed',
  'florescent': 'fluorescent', 'fullfil': 'fulfill',
  'humerous': 'humorous', 'imediately': 'immediately',
  'incidently': 'incidentally', 'jist': 'gist', 'judgement': 'judgment',
  'lieing': 'lying', 'lightening': 'lightning',
  'milennium': 'millennium', 'miniscule': 'minuscule', 'mischievious': 'mischievous',
  'missle': 'missile', 'neice': 'niece', 'nieve': 'naive',
  'occassionally': 'occasionally', 'pasttime': 'pastime', 'peice': 'piece',
  'percieve': 'perceive', 'posession': 'possession',
  'preceed': 'precede', 'privelege': 'privilege', 'procede': 'proceed',
  'psycology': 'psychology', 'relevent': 'relevant', 'religous': 'religious',
  'repitition': 'repetition', 'responsibilty': 'responsibility',
  'restuarant': 'restaurant', 'rediculous': 'ridiculous', 'sacrifise': 'sacrifice',
  'secratary': 'secretary', 'sentance': 'sentence', 'similiar': 'similar',
  'supose': 'suppose', 'suprise': 'surprise', 'tendancy': 'tendency',
  'tommorow': 'tomorrow', 'tommorrow': 'tomorrow', 'tomoro': 'tomorrow',
  'tomorow': 'tomorrow', 'tomorro': 'tomorrow', 'tmrw': 'tomorrow',
  'tounge': 'tongue', 'twelth': 'twelfth', 'tyrany': 'tyranny',
  'uniuqe': 'unique', 'unnecesary': 'unnecessary', 'usefull': 'useful',
  'usualy': 'usually', 'vegitable': 'vegetable', 'vehical': 'vehicle',
  'volitile': 'volatile', 'whereever': 'wherever',
  'wanna': 'want to', 'gonna': 'going to', 'gotta': 'got to',
  'kinda': 'kind of', 'sorta': 'sort of', 'outta': 'out of',
  // Short common typos
  'tge': 'the', 'hte': 'the', 'thr': 'the',
  'od': 'of', 'fo': 'of', 'si': 'is',
  'nad': 'and', 'dna': 'and', 'aslo': 'also', 'jsut': 'just',
  'fomr': 'from', 'dont': "don't", 'doesnt': "doesn't", 'didnt': "didn't",
  'havent': "haven't", 'hasnt': "hasn't", 'hadnt': "hadn't",
  'cant': "can't", 'wont': "won't", 'wouldnt': "wouldn't",
  'shouldnt': "shouldn't", 'couldnt': "couldn't", 'isnt': "isn't",
  'arent': "aren't", 'wasnt': "wasn't", 'werent': "weren't",
  'im': "I'm", 'ive': "I've", 'id': "I'd", 'ill': "I'll",
  'i': 'I',
  // ── EVERYDAY WORDS nspell gets wrong ─────────────────
  // Verb contractions & truncations
  'wnt': 'want', 'wnat': 'want', 'watn': 'want', 'wan': 'want',
  'fogot': 'forgot', 'forgat': 'forgot', 'forgt': 'forgot', 'frgt': 'forgot',
  'remeber': 'remember', 'remebr': 'remember', 'rember': 'remember',
  'receve': 'receive', 'recevie': 'receive',
  'belive': 'believe', 'beleve': 'believe',
  'becuase': 'because', 'becasue': 'because', 'becuse': 'because', 'bcuz': 'because', 'cuz': 'because',
  'woud': 'would', 'coud': 'could', 'shold': 'should',
  'coudnt': "couldn't", 'couldnt': "couldn't",
  'thik': 'think', 'thnk': 'think', 'htink': 'think',
  'knw': 'know', 'nkow': 'know', 'kno': 'know',
  'liek': 'like', 'lke': 'like', 'lik': 'like',
  'mkae': 'make', 'amke': 'make', 'mae': 'make',
  'tae': 'take', 'tke': 'take',
  'cam': 'came', 'cme': 'come', 'coem': 'come',
  'wen': 'when', 'whe': 'when', 'whn': 'when',
  'thn': 'then', 'taht': 'that', 'thta': 'that',
  'waht': 'what', 'wht': 'what',
  'jsut': 'just', 'jst': 'just',
  'vrey': 'very', 'veyr': 'very', 'vry': 'very',
  'rael': 'real', 'raelly': 'really', 'relly': 'really', 'raly': 'really',
  'goo': 'good', 'goood': 'good',
  'gret': 'great', 'graet': 'great',
  'peolpe': 'people', 'poeple': 'people', 'peopel': 'people', 'ppl': 'people',
  'hppy': 'happy', 'hapy': 'happy',
  'sory': 'sorry', 'srry': 'sorry', 'sry': 'sorry',
  'plese': 'please', 'pls': 'please', 'plz': 'please',
  'thanx': 'thanks', 'thx': 'thanks', 'ty': 'thank you',
  'ur': 'your', 'u': 'you', 'r': 'are', 'n': 'and', 'b4': 'before',
  // Home / place words
  'hom': 'home', 'hoem': 'home', 'hmoe': 'home', 'hme': 'home',
  'scool': 'school', 'schol': 'school', 'schl': 'school',
  'wrk': 'work', 'wrok': 'work',
  'ofice': 'office', 'ofis': 'office',
  // Common action words
  'wlak': 'walk', 'wlk': 'walk',
  'runn': 'run', 'rnun': 'run',
  'eatting': 'eating', 'esating': 'eating',
  'slepe': 'sleep', 'slep': 'sleep',
  'wriet': 'write', 'writ': 'write',
  'raed': 'read', 'redd': 'read',
  'buyed': 'bought', 'bougth': 'bought', 'bougt': 'bought',
  'brign': 'bring', 'brng': 'bring',
  'figt': 'fight', 'fihgt': 'fight',
  'waht': 'what', 'wath': 'what',
  'whre': 'where', 'wher': 'where',
  'thier': 'their', 'htere': 'there',
  'everday': 'everyday', 'evry': 'every', 'evrey': 'every',
  'difrent': 'different', 'diferent': 'different', 'diffrent': 'different',
  'importnt': 'important', 'importat': 'important',
  'intresting': 'interesting', 'intersting': 'interesting',
  'preson': 'person', 'persn': 'person',
  'frend': 'friend', 'freind': 'friend', 'frnd': 'friend',
  'famly': 'family', 'familiy': 'family', 'fmily': 'family',
  'chidren': 'children', 'childen': 'children',
  'contry': 'country', 'cuntry': 'country',
  'langauge': 'language', 'lanaguage': 'language',
  'messge': 'message', 'mesage': 'message',
  'probelm': 'problem', 'problm': 'problem', 'prblm': 'problem',
  'answr': 'answer', 'anser': 'answer',
  'questoin': 'question', 'qustion': 'question',
  'moning': 'morning', 'mornig': 'morning', 'mrng': 'morning',
  'evning': 'evening', 'eveing': 'evening',
  'toay': 'today', 'tday': 'today',
  'yestday': 'yesterday', 'yestrday': 'yesterday', 'ystday': 'yesterday',
  'nigt': 'night', 'nite': 'night',
  'wekk': 'week', 'wek': 'week',
  'mnth': 'month', 'monht': 'month',
  'yera': 'year', 'yer': 'year',
  'numbr': 'number', 'nmber': 'number',
  'leter': 'letter', 'lettr': 'letter',
  'figuer': 'figure', 'figre': 'figure',
  'studing': 'studying', 'stadying': 'studying',
  'lernig': 'learning', 'lerning': 'learning',
  'teching': 'teaching', 'techng': 'teaching',
  'workin': 'working', 'workng': 'working',
  'livng': 'living', 'liveing': 'living',
  'wnting': 'wanting', 'wantng': 'wanting',
  'havng': 'having', 'havig': 'having',
  'lookng': 'looking', 'lokking': 'looking',
  'tryng': 'trying', 'tring': 'trying',
  'usng': 'using', 'useing': 'using',
  'movng': 'moving', 'moveing': 'moving',
  'turnng': 'turning', 'turining': 'turning',
  'showng': 'showing', 'showeing': 'showing',
  'callng': 'calling', 'callig': 'calling',
  'waitng': 'waiting', 'waiteing': 'waiting',
  'payng': 'paying', 'paiing': 'paying',
  'playng': 'playing', 'plaiing': 'playing',
  'sayng': 'saying', 'saiing': 'saying',
  'buyng': 'buying', 'buiing': 'buying',
  'givng': 'giving', 'giveing': 'giving',
  'takng': 'taking', 'takeing': 'taking',
  'makng': 'making', 'makeing': 'making',
  'startng': 'starting', 'starteing': 'starting',
  'endng': 'ending', 'endeing': 'ending',
  'sendng': 'sending', 'sendeing': 'sending',
  'recevng': 'receiving', 'recievng': 'receiving',
  // walet variants
  'walet': 'wallet', 'wallt': 'wallet', 'wllet': 'wallet',
  // store / tomoro covered above
  'ot': 'to', 'tto': 'to',
};

// ── Homophones & common confusion pairs ──────────────
const HOMOPHONES = [
  // their / there / they're
  { pattern: /\btheir\b(?=\s+(is|are|was|were|has|have|will|would|can|could|should|may|might|must|shall)\b)/gi, replacement: "there", type: 'grammar', reason: '"there" used before a verb (existential)' },
  { pattern: /\bthere\b(?=\s+(dog|cat|car|house|friend|family|mom|dad|book|phone|bag|name|school|job|home|life)\b)/gi, replacement: "their", type: 'grammar', reason: '"their" used before a noun (possessive)' },
  // your / you're
  { pattern: /\byour\b(?=\s+(going|coming|getting|having|doing|being|trying|making|taking|looking)\b)/gi, replacement: "you're", type: 'grammar', reason: '"you\'re" = you are (before a verb)' },
  { pattern: /\byou're\b(?=\s+(car|house|phone|bag|name|job|friend|school|turn|book|life|choice)\b)/gi, replacement: "your", type: 'grammar', reason: '"your" = possessive (before a noun)' },
  // its / it's
  { pattern: /\bits\b(?=\s+(going|coming|been|a|an|the|not|very|so|too|quite|getting|having)\b)/gi, replacement: "it's", type: 'grammar', reason: '"it\'s" = it is (contraction)' },
  // loose / lose
  { pattern: /\bloose\b(?=\s+(the|a|an|your|their|our|my|his|her|this|that|some|all|every|no)\b)/gi, replacement: "lose", type: 'grammar', reason: '"lose" = to fail to win/keep' },
  // affect / effect
  { pattern: /\beffect\b(?=\s+(the|a|an|your|their|our|my|his|her|this|that)\b)(?<=\s(can|will|would|could|should|may|might|does|did|to)\s\w+\s)/gi, replacement: "affect", type: 'grammar', reason: '"affect" is usually the verb form' },
  // then / than
  { pattern: /\bthen\b(?=\s+(you|he|she|it|they|we|I|the|a|an)\b)(?<=(more|less|better|worse|greater|smaller|older|younger|faster|slower)\s)/gi, replacement: "than", type: 'grammar', reason: '"than" used in comparisons' },
  // alot
  { pattern: /\balot\b/gi, replacement: "a lot", type: 'spelling', reason: '"a lot" is two words' },
  // could of / would of / should of
  { pattern: /\bcould of\b/gi, replacement: "could have", type: 'grammar', reason: '"could have" not "could of"' },
  { pattern: /\bwould of\b/gi, replacement: "would have", type: 'grammar', reason: '"would have" not "would of"' },
  { pattern: /\bshould of\b/gi, replacement: "should have", type: 'grammar', reason: '"should have" not "should of"' },
  { pattern: /\bmust of\b/gi, replacement: "must have", type: 'grammar', reason: '"must have" not "must of"' },
  // double negatives / common patterns
  { pattern: /\bfor sure\b/gi, replacement: "for sure", type: 'style', reason: 'Correct usage' },
];

// ── Grammar rule patterns ─────────────────────────────
const GRAMMAR_RULES = [
  // Subject-verb agreement: "I has" → "I have"
  { pattern: /\bI has\b/g,        fix: 'I have',       type: 'grammar', reason: 'Subject-verb agreement: "I have" not "I has"' },
  { pattern: /\bI were\b/g,       fix: 'I was',        type: 'grammar', reason: 'Subject-verb agreement: "I was" not "I were"' },
  { pattern: /\bI goes\b/g,       fix: 'I go',         type: 'grammar', reason: 'Subject-verb agreement: "I go" not "I goes"' },
  { pattern: /\bI does\b/g,       fix: 'I do',         type: 'grammar', reason: 'Subject-verb agreement: "I do" not "I does"' },
  { pattern: /\bI is\b/g,         fix: 'I am',         type: 'grammar', reason: 'Subject-verb agreement: "I am" not "I is"' },
  { pattern: /\bI are\b/g,        fix: 'I am',         type: 'grammar', reason: 'Subject-verb agreement: "I am" not "I are"' },
  // "he/she/it don't" → "he/she/it doesn't"
  { pattern: /\b(he|she|it) don't\b/gi, fix: (m, p) => `${p} doesn't`, type: 'grammar', reason: '"He/She/It doesn\'t" not "don\'t"' },
  { pattern: /\b(he|she|it) dont\b/gi,  fix: (m, p) => `${p} doesn't`, type: 'grammar', reason: '"He/She/It doesn\'t" not "dont"' },
  // "we/they/you was" → "were"
  { pattern: /\b(we|they|you) was\b/gi, fix: (m, p) => `${p} were`, type: 'grammar', reason: '"We/They/You were" not "was"' },
  // "buyed" → "bought", "goed" → "went", "runned" → "ran"
  { pattern: /\bbuyed\b/gi,       fix: 'bought',       type: 'grammar', reason: 'Irregular past tense: "bought" not "buyed"' },
  { pattern: /\bgoed\b/gi,        fix: 'went',         type: 'grammar', reason: 'Irregular past tense: "went" not "goed"' },
  { pattern: /\brunned\b/gi,      fix: 'ran',          type: 'grammar', reason: 'Irregular past tense: "ran" not "runned"' },
  { pattern: /\bdrawed\b/gi,      fix: 'drew',         type: 'grammar', reason: 'Irregular past tense: "drew" not "drawed"' },
  { pattern: /\bknowed\b/gi,      fix: 'knew',         type: 'grammar', reason: 'Irregular past tense: "knew" not "knowed"' },
  { pattern: /\bswinged\b/gi,     fix: 'swung',        type: 'grammar', reason: 'Irregular past tense: "swung" not "swinged"' },
  { pattern: /\bteached\b/gi,     fix: 'taught',       type: 'grammar', reason: 'Irregular past tense: "taught" not "teached"' },
  { pattern: /\bbreaked\b/gi,     fix: 'broke',        type: 'grammar', reason: 'Irregular past tense: "broke" not "breaked"' },
  { pattern: /\bcatched\b/gi,     fix: 'caught',       type: 'grammar', reason: 'Irregular past tense: "caught" not "catched"' },
  { pattern: /\bspeaked\b/gi,     fix: 'spoke',        type: 'grammar', reason: 'Irregular past tense: "spoke" not "speaked"' },
  { pattern: /\bstoled\b/gi,      fix: 'stole',        type: 'grammar', reason: 'Irregular past tense: "stole" not "stoled"' },
  { pattern: /\bwroted\b/gi,      fix: 'wrote',        type: 'grammar', reason: 'Irregular past tense: "wrote" not "wroted"' },
  { pattern: /\bsleeped\b/gi,     fix: 'slept',        type: 'grammar', reason: 'Irregular past tense: "slept" not "sleeped"' },
  { pattern: /\bfeeled\b/gi,      fix: 'felt',         type: 'grammar', reason: 'Irregular past tense: "felt" not "feeled"' },
  { pattern: /\bleaved\b/gi,      fix: 'left',         type: 'grammar', reason: 'Irregular past tense: "left" not "leaved"' },
  { pattern: /\bholded\b/gi,      fix: 'held',         type: 'grammar', reason: 'Irregular past tense: "held" not "holded"' },
  // "more better/worse" → "better/worse"
  { pattern: /\bmore better\b/gi, fix: 'better',       type: 'style',   reason: '"Better" is already comparative' },
  { pattern: /\bmore worse\b/gi,  fix: 'worse',        type: 'style',   reason: '"Worse" is already comparative' },
  // Double negatives
  { pattern: /\bdon't (got|have) no\b/gi, fix: "don't have any", type: 'grammar', reason: 'Avoid double negatives' },
  // "a" vs "an" before vowel sounds
  { pattern: /\ba ([aeiouAEIOU])/g, fix: 'an $1',     type: 'grammar', reason: '"An" used before vowel sounds' },
  // Spacing fixes
  { pattern: /  +/g,              fix: ' ',            type: 'punctuation', reason: 'Remove extra spaces' },
  { pattern: / ,/g,               fix: ',',            type: 'punctuation', reason: 'No space before comma' },
  { pattern: / \./g,              fix: '.',            type: 'punctuation', reason: 'No space before period' },
  { pattern: / !/g,               fix: '!',            type: 'punctuation', reason: 'No space before exclamation mark' },
  { pattern: / \?/g,              fix: '?',            type: 'punctuation', reason: 'No space before question mark' },
  { pattern: /,([^\s])/g,         fix: ', $1',         type: 'punctuation', reason: 'Space after comma' },
];

// ── Edit distance (Levenshtein) for ranking suggestions ──
function editDistance(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({length: m+1}, (_, i) => Array.from({length: n+1}, (_, j) => i === 0 ? j : j === 0 ? i : 0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

// ── Spell-check a word, get best suggestion ───────────
function spellCorrect(word) {
  if (!spell) return word;
  const clean = word.toLowerCase().replace(/[^a-z']/g, '');
  if (!clean || clean.length <= 2) return word;

  // Skip proper nouns (capitalized mid-sentence assumed intentional)
  // Skip words with numbers, URLs
  if (/\d/.test(word) || /https?/.test(word)) return word;

  // 1. Check custom map first (highest priority — trained fixes)
  const lc = word.toLowerCase();
  if (MISSPELLINGS[clean]) return preserveCase(word, MISSPELLINGS[clean]);
  if (MISSPELLINGS[lc])    return preserveCase(word, MISSPELLINGS[lc]);

  // 2. Already correct
  if (spell.correct(clean)) return word;

  // 3. Get nspell suggestions
  const suggestions = spell.suggest(clean);
  if (!suggestions || suggestions.length === 0) return word;

  // 4. Pick best suggestion using edit distance + length penalty
  //    Prefer suggestions with minimum edit distance to the original
  //    When tied, prefer the shorter word (more common)
  let best = suggestions[0];
  let bestScore = Infinity;
  for (const s of suggestions) {
    const dist = editDistance(clean, s.toLowerCase());
    // small penalty for very different lengths
    const lenPenalty = Math.abs(s.length - clean.length) * 0.4;
    const score = dist + lenPenalty;
    if (score < bestScore) {
      bestScore = score;
      best = s;
    }
    // Stop if perfect score
    if (bestScore <= 1) break;
  }

  return preserveCase(word, best);
}

// ── Preserve original capitalization ─────────────────
function preserveCase(original, replacement) {
  if (original === original.toUpperCase()) return replacement.toUpperCase();
  if (original[0] === original[0].toUpperCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

// ── Main correction function ──────────────────────────
function correctText(text) {
  const corrections = [];
  let result = text;

  // ── Step 1: Grammar rules ──────────────────────────
  for (const rule of GRAMMAR_RULES) {
    const newText = result.replace(rule.pattern, (match, ...args) => {
      const fix = typeof rule.fix === 'function' ? rule.fix(match, ...args) : rule.fix;
      if (match !== fix) {
        corrections.push({
          original: match,
          corrected: fix,
          type: rule.type,
          reason: rule.reason,
        });
      }
      return fix;
    });
    result = newText;
  }

  // ── Step 2: Homophones ─────────────────────────────
  for (const hp of HOMOPHONES) {
    const newText = result.replace(hp.pattern, (match) => {
      corrections.push({
        original: match,
        corrected: hp.replacement,
        type: hp.type,
        reason: hp.reason,
      });
      return hp.replacement;
    });
    result = newText;
  }

  // ── Step 3: Word-level spell check ────────────────
  if (spell) {
    const words = result.split(/(\s+|(?=[.,!?;:])|(?<=[.,!?;:]))/);
    const correctedWords = words.map(token => {
      if (!token.trim() || /^[.,!?;:\s]$/.test(token)) return token;
      const wordOnly = token.replace(/^([^a-zA-Z']*)(.*?)([^a-zA-Z']*)$/, '$2');
      const prefix   = token.slice(0, token.indexOf(wordOnly));
      const suffix   = token.slice(token.indexOf(wordOnly) + wordOnly.length);

      if (!wordOnly || wordOnly.length <= 2) return token;

      const corrected = spellCorrect(wordOnly);
      if (corrected !== wordOnly) {
        corrections.push({
          original:  wordOnly,
          corrected: corrected,
          type: 'spelling',
          reason: `"${wordOnly}" → "${corrected}" (spelling)`,
        });
        return prefix + corrected + suffix;
      }
      return token;
    });
    result = correctedWords.join('');
  }

  // ── Step 4: Sentence capitalization ──────────────
  const sentenceFixed = result.replace(/(^|[.!?]\s+)([a-z])/g, (match, sep, char) => {
    corrections.push({
      original: char,
      corrected: char.toUpperCase(),
      type: 'punctuation',
      reason: 'Capitalize first letter of sentence',
    });
    return sep + char.toUpperCase();
  });
  result = sentenceFixed;

  // ── Step 5: Always capitalize "i" alone ──────────
  const iFixed = result.replace(/\bi\b/g, (match, offset) => {
    corrections.push({
      original: 'i',
      corrected: 'I',
      type: 'grammar',
      reason: 'The pronoun "I" is always capitalized',
    });
    return 'I';
  });
  result = iFixed;

  // Deduplicate corrections
  const seen = new Set();
  const unique = corrections.filter(c => {
    const key = `${c.original}→${c.corrected}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 15);

  // Generate explanation
  const explanation = generateExplanation(unique, text, result);

  return { corrected: result, corrections: unique, explanation };
}

// ── Human-readable explanation ────────────────────────
function generateExplanation(corrections, original, corrected) {
  if (original.trim() === corrected.trim() && corrections.length === 0) {
    return 'No corrections needed — your text is already perfect! ✅';
  }

  const byType = {};
  corrections.forEach(c => {
    byType[c.type] = (byType[c.type] || 0) + 1;
  });

  const parts = [];
  if (byType.spelling)    parts.push(`fixed ${byType.spelling} spelling mistake${byType.spelling > 1 ? 's' : ''}`);
  if (byType.grammar)     parts.push(`corrected ${byType.grammar} grammar issue${byType.grammar > 1 ? 's' : ''}`);
  if (byType.punctuation) parts.push(`improved ${byType.punctuation} punctuation issue${byType.punctuation > 1 ? 's' : ''}`);
  if (byType.style)       parts.push(`made ${byType.style} style improvement${byType.style > 1 ? 's' : ''}`);

  if (parts.length === 0) return 'Minor formatting improvements applied.';
  return `I ${parts.join(', ')}. All corrections preserve your original meaning. ${corrections.length} total change${corrections.length !== 1 ? 's' : ''} applied.`;
}

// ── Tone Transformation ───────────────────────────────
// ── FORMAL vocabulary & structure transforms ──────────
const FORMAL_WORDS = {
  'get': 'obtain', 'got': 'obtained', 'gets': 'obtains', 'getting': 'obtaining',
  'use': 'utilize', 'used': 'utilized', 'uses': 'utilizes', 'using': 'utilizing',
  'buy': 'purchase', 'bought': 'purchased', 'buying': 'purchasing',
  'start': 'commence', 'started': 'commenced', 'starting': 'commencing',
  'help': 'assist', 'helped': 'assisted', 'helping': 'assisting', 'helps': 'assists',
  'try': 'endeavour', 'tried': 'endeavoured', 'trying': 'endeavouring',
  'show': 'demonstrate', 'showed': 'demonstrated', 'showing': 'demonstrating',
  'find': 'identify', 'found': 'identified', 'finding': 'identifying',
  'need': 'require', 'needs': 'requires', 'needed': 'required',
  'make': 'construct', 'made': 'constructed', 'making': 'constructing',
  'think': 'consider', 'thought': 'considered', 'thinking': 'considering',
  'want': 'wish', 'wanted': 'wished', 'wanting': 'desiring',
  'tell': 'inform', 'told': 'informed', 'telling': 'informing',
  'ask': 'enquire', 'asked': 'enquired', 'asking': 'enquiring',
  'give': 'provide', 'gave': 'provided', 'giving': 'providing',
  'know': 'acknowledge', 'knew': 'acknowledged', 'knowing': 'acknowledging',
  'see': 'observe', 'saw': 'observed', 'seeing': 'observing',
  'go': 'proceed', 'went': 'proceeded', 'going': 'proceeding',
  'come': 'arrive', 'came': 'arrived', 'coming': 'arriving',
  'put': 'place', 'puts': 'places', 'putting': 'placing',
  'look': 'examine', 'looked': 'examined', 'looking': 'examining',
  'keep': 'maintain', 'kept': 'maintained', 'keeping': 'maintaining',
  'let': 'permit', 'lets': 'permits', 'letting': 'permitting',
  'end': 'conclude', 'ended': 'concluded', 'ending': 'concluding',
  'talk': 'converse', 'talked': 'conversed', 'talking': 'conversing',
  'work': 'operate', 'worked': 'operated', 'working': 'operating',
  'check': 'verify', 'checked': 'verified', 'checking': 'verifying',
  'fix': 'rectify', 'fixed': 'rectified', 'fixing': 'rectifying',
  'big': 'substantial', 'large': 'considerable', 'huge': 'extensive',
  'small': 'minimal', 'little': 'limited',
  'good': 'commendable', 'great': 'excellent', 'nice': 'admirable',
  'bad': 'unfavorable', 'poor': 'inadequate', 'terrible': 'unacceptable',
  'fast': 'expeditious', 'quick': 'prompt', 'quickly': 'promptly',
  'slow': 'gradual', 'slowly': 'gradually',
  'easy': 'straightforward', 'hard': 'challenging', 'tough': 'arduous',
  'ok': 'acceptable', 'okay': 'satisfactory', 'fine': 'adequate',
  'sure': 'certainly', 'definitely': 'unquestionably',
  'very': 'considerably', 'really': 'substantially', 'so': 'therefore',
  'a lot': 'a considerable number', 'a lot of': 'numerous', 'lots of': 'numerous',
  'kind of': 'somewhat', 'sort of': 'rather', 'a bit': 'slightly',
  'because': 'owing to the fact that', 'since': 'given that', 'but': 'however',
  'also': 'furthermore', 'and': 'in addition', 'so': 'consequently',
  'then': 'subsequently', 'now': 'at present', 'here': 'at this juncture',
};

const FORMAL_CONTRACTIONS = [
  [/\bdon't\b/gi, 'do not'], [/\bdoesn't\b/gi, 'does not'],
  [/\bdidn't\b/gi, 'did not'], [/\bI'm\b/g, 'I am'],
  [/\bI've\b/g, 'I have'], [/\bI'd\b/g, 'I would'],
  [/\bI'll\b/g, 'I will'], [/\byou're\b/gi, 'you are'],
  [/\byou've\b/gi, 'you have'], [/\byou'll\b/gi, 'you will'],
  [/\bhe's\b/gi, 'he is'], [/\bshe's\b/gi, 'she is'],
  [/\bit's\b/gi, 'it is'], [/\bwe're\b/gi, 'we are'],
  [/\bthey're\b/gi, 'they are'], [/\bwe've\b/gi, 'we have'],
  [/\bthey've\b/gi, 'they have'], [/\bwon't\b/gi, 'will not'],
  [/\bcan't\b/gi, 'cannot'], [/\bcouldn't\b/gi, 'could not'],
  [/\bwouldn't\b/gi, 'would not'], [/\bshouldn't\b/gi, 'should not'],
  [/\bhaven't\b/gi, 'have not'], [/\bhasn't\b/gi, 'has not'],
  [/\bisn't\b/gi, 'is not'], [/\baren't\b/gi, 'are not'],
  [/\bwasn't\b/gi, 'was not'], [/\bweren't\b/gi, 'were not'],
  [/\bthat's\b/gi, 'that is'], [/\bthere's\b/gi, 'there is'],
  [/\blet's\b/gi, 'let us'], [/\bwhat's\b/gi, 'what is'],
  [/\bhere's\b/gi, 'here is'], [/\bwhere's\b/gi, 'where is'],
  [/\bhow's\b/gi, 'how is'], [/\bwho's\b/gi, 'who is'],
];

// ── CASUAL vocabulary transforms ────────────────────────
const CASUAL_WORDS = {
  'obtain': 'get', 'obtained': 'got', 'utilize': 'use', 'utilized': 'used',
  'purchase': 'buy', 'purchased': 'bought', 'commence': 'start', 'commenced': 'started',
  'assist': 'help', 'assisted': 'helped', 'endeavour': 'try', 'endeavoured': 'tried',
  'demonstrate': 'show', 'demonstrated': 'showed', 'identify': 'find', 'identified': 'found',
  'require': 'need', 'requires': 'needs', 'required': 'needed',
  'construct': 'make', 'constructed': 'made', 'consider': 'think about',
  'wish': 'want', 'inform': 'tell', 'enquire': 'ask',
  'provide': 'give', 'provided': 'gave', 'proceed': 'go', 'proceeded': 'went',
  'arrive': 'come', 'arrived': 'came', 'examine': 'look at', 'maintain': 'keep',
  'permit': 'let', 'conclude': 'end', 'concluded': 'ended',
  'converse': 'talk', 'operate': 'work', 'verify': 'check', 'rectify': 'fix',
  'substantial': 'big', 'considerable': 'big', 'extensive': 'huge',
  'commendable': 'great', 'excellent': 'awesome', 'admirable': 'nice',
  'unfavorable': 'bad', 'inadequate': 'not good', 'unacceptable': 'terrible',
  'expeditious': 'fast', 'prompt': 'quick', 'promptly': 'quickly',
  'acceptable': 'ok', 'satisfactory': 'fine', 'adequate': 'alright',
  'certainly': 'sure', 'unquestionably': 'definitely', 'considerably': 'really',
  'substantially': 'really', 'therefore': 'so', 'furthermore': 'also',
  'consequently': 'so', 'subsequently': 'then', 'at present': 'right now',
  'owing to the fact that': 'because', 'given that': 'since', 'however': 'but',
  'in addition': 'also',
};

const CASUAL_CONTRACTIONS = [
  [/\bdo not\b/gi, "don't"], [/\bdoes not\b/gi, "doesn't"],
  [/\bdid not\b/gi, "didn't"], [/\bI am\b/g, "I'm"],
  [/\bI have\b/g, "I've"], [/\bI would\b/g, "I'd"],
  [/\bI will\b/g, "I'll"], [/\byou are\b/gi, "you're"],
  [/\bwe are\b/gi, "we're"], [/\bthey are\b/gi, "they're"],
  [/\bwill not\b/gi, "won't"], [/\bcannot\b/gi, "can't"],
  [/\bcould not\b/gi, "couldn't"], [/\bwould not\b/gi, "wouldn't"],
  [/\bshould not\b/gi, "shouldn't"], [/\bhave not\b/gi, "haven't"],
  [/\bhas not\b/gi, "hasn't"], [/\bis not\b/gi, "isn't"],
  [/\bare not\b/gi, "aren't"], [/\bwas not\b/gi, "wasn't"],
  [/\bwere not\b/gi, "weren't"], [/\bthat is\b/gi, "that's"],
  [/\bthere is\b/gi, "there's"], [/\blet us\b/gi, "let's"],
  [/\bit is\b/gi, "it's"], [/\bhe is\b/gi, "he's"],
  [/\bshe is\b/gi, "she's"],
];

// ── PROFESSIONAL vocabulary ─────────────────────────────
const PROFESSIONAL_WORDS = {
  'use': 'leverage', 'used': 'leveraged', 'using': 'leveraging',
  'start': 'initiate', 'started': 'initiated', 'starting': 'initiating',
  'end': 'finalize', 'ended': 'finalized', 'ending': 'finalizing',
  'help': 'facilitate', 'helped': 'facilitated', 'helping': 'facilitating',
  'buy': 'procure', 'bought': 'procured', 'buying': 'procuring',
  'show': 'present', 'showed': 'presented', 'showing': 'presenting',
  'find': 'identify', 'found': 'identified', 'finding': 'identifying',
  'make': 'develop', 'made': 'developed', 'making': 'developing',
  'talk': 'discuss', 'talked': 'discussed', 'talking': 'discussing',
  'look at': 'review', 'check': 'review', 'checked': 'reviewed',
  'need': 'require', 'needs': 'requires', 'needed': 'required',
  'give': 'deliver', 'gave': 'delivered', 'giving': 'delivering',
  'get': 'acquire', 'got': 'acquired', 'getting': 'acquiring',
  'work on': 'address', 'fix': 'resolve', 'fixed': 'resolved', 'fixing': 'resolving',
  'set up': 'establish', 'deal with': 'manage', 'find out': 'determine',
  'try': 'aim', 'tried': 'aimed', 'trying': 'aiming',
  'think': 'assess', 'thought': 'assessed', 'thinking': 'assessing',
  'tell': 'communicate', 'told': 'communicated', 'telling': 'communicating',
  'ask': 'request', 'asked': 'requested', 'asking': 'requesting',
  'plan': 'strategize', 'plans': 'strategizes', 'planned': 'strategized',
  'meet': 'convene', 'met': 'convened', 'meeting': 'convening',
  'send': 'disseminate', 'sent': 'disseminated', 'sending': 'disseminating',
  'say': 'state', 'said': 'stated', 'saying': 'stating',
  'good': 'effective', 'great': 'outstanding', 'bad': 'suboptimal',
  'big': 'significant', 'small': 'minimal', 'fast': 'efficient',
  'a lot of': 'extensive', 'lots of': 'numerous',
  'maybe': 'potentially', 'probably': 'likely', 'soon': 'in the near term',
  'later': 'subsequently', 'now': 'at this stage', 'also': 'additionally',
  'but': 'however', 'because': 'as a result of', 'so': 'therefore',
};

const PROFESSIONAL_CONTRACTIONS = [
  [/\bdon't\b/gi, 'do not'], [/\bdoesn't\b/gi, 'does not'],
  [/\bdidn't\b/gi, 'did not'], [/\bcan't\b/gi, 'cannot'],
  [/\bwon't\b/gi, 'will not'], [/\bcouldn't\b/gi, 'could not'],
  [/\bwouldn't\b/gi, 'would not'], [/\bshouldn't\b/gi, 'should not'],
  [/\bhaven't\b/gi, 'have not'], [/\bhasn't\b/gi, 'has not'],
  [/\bisn't\b/gi, 'is not'], [/\baren't\b/gi, 'are not'],
  [/\bgonna\b/gi, 'going to'], [/\bwanna\b/gi, 'want to'],
  [/\bgotta\b/gi, 'need to'], [/\bkinda\b/gi, 'somewhat'],
  [/\bsorta\b/gi, 'somewhat'],
];

// ── Apply word-level swaps ───────────────────────────────
function applyWordMap(text, wordMap) {
  // Sort by length descending so multi-word phrases match before single words
  const entries = Object.entries(wordMap).sort((a, b) => b[0].length - a[0].length);
  let result = text;
  for (const [from, to] of entries) {
    const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`\\b${escaped}\\b`, 'gi');
    result = result.replace(re, (match) => preserveCase(match, to));
  }
  return result;
}

// ── Structural sentence-level rewriting ─────────────────
function rewriteSentenceStructure(sentence, tone) {
  let s = sentence.trim();
  if (!s) return s;

  if (tone === 'formal') {
    // Add formal openers to declarative sentences
    if (/^I want/i.test(s))      s = s.replace(/^I want/i, 'It is my intention to');
    if (/^I need/i.test(s))      s = s.replace(/^I need/i, 'I am in need of');
    if (/^I think/i.test(s))     s = s.replace(/^I think/i, 'It is my considered opinion that');
    if (/^I feel/i.test(s))      s = s.replace(/^I feel/i, 'I am of the view that');
    if (/^I like/i.test(s))      s = s.replace(/^I like/i, 'I have a preference for');
    if (/^You should/i.test(s))  s = s.replace(/^You should/i, 'It is advisable that you');
    if (/^You need to/i.test(s)) s = s.replace(/^You need to/i, 'It is required that you');
    if (/^We need/i.test(s))     s = s.replace(/^We need/i, 'There is a requirement for');
    if (/^Can you/i.test(s))     s = s.replace(/^Can you/i, 'Would you kindly');
    if (/^Please/i.test(s))      s = s.replace(/^Please/i, 'Kindly');
    // Add "It should be noted that" for statements
    if (/^This is/i.test(s))     s = s.replace(/^This is/i, 'It should be noted that this is');
  }

  if (tone === 'casual') {
    // Casual openers and softeners
    if (/^I want/i.test(s))      s = s.replace(/^I want/i, "I really wanna");
    if (/^I need/i.test(s))      s = s.replace(/^I need/i, "I gotta get");
    if (/^I think/i.test(s))     s = s.replace(/^I think/i, "I feel like");
    if (/^I would like/i.test(s))s = s.replace(/^I would like/i, "I'd love");
    if (/^You should/i.test(s))  s = s.replace(/^You should/i, "You totally should");
    if (/^Please/i.test(s))      s = s.replace(/^Please/i, "Hey, could you");
    if (/^This is/i.test(s))     s = s.replace(/^This is/i, "So this is");
    if (/^It is/i.test(s))       s = s.replace(/^It is/i, "It's");
    // Add casual fillers at end of some sentences
    if (s.endsWith('.') && s.length > 30 && Math.random() < 0.5) {
      s = s.slice(0, -1) + ', you know!';
    }
  }

  if (tone === 'professional') {
    // Professional action framing
    if (/^I want/i.test(s))      s = s.replace(/^I want/i, 'I am looking to');
    if (/^I need/i.test(s))      s = s.replace(/^I need/i, 'Our objective is to');
    if (/^I think/i.test(s))     s = s.replace(/^I think/i, 'Based on my analysis,');
    if (/^I feel/i.test(s))      s = s.replace(/^I feel/i, 'My assessment is that');
    if (/^Can you/i.test(s))     s = s.replace(/^Can you/i, 'Could you please');
    if (/^Please/i.test(s))      s = s.replace(/^Please/i, 'Please ensure that you');
    if (/^We need/i.test(s))     s = s.replace(/^We need/i, 'The requirement is to');
    if (/^You should/i.test(s))  s = s.replace(/^You should/i, 'I recommend that you');
    if (/^This is/i.test(s))     s = s.replace(/^This is/i, 'This represents');
    if (/^It is/i.test(s))       s = s.replace(/^It is/i, 'It is essential to note that');
  }

  return s;
}

function applyTone(text, tone, corrections) {
  if (tone === 'default' || !tone) return text;

  let result = text;

  // Step 1: Expand/contract based on tone
  const contractionRules =
    tone === 'formal'       ? FORMAL_CONTRACTIONS :
    tone === 'casual'       ? CASUAL_CONTRACTIONS :
    tone === 'professional' ? PROFESSIONAL_CONTRACTIONS : [];

  for (const [pattern, replacement] of contractionRules) {
    result = result.replace(pattern, (match) => {
      const fixed = preserveCase(match, replacement);
      if (fixed.toLowerCase() !== match.toLowerCase()) {
        corrections.push({ original: match, corrected: fixed, type: 'tone',
          reason: `[${tone}] "${match}" → "${fixed}"` });
      }
      return fixed;
    });
  }

  // Step 2: Vocabulary swap
  const wordMap =
    tone === 'formal'       ? FORMAL_WORDS :
    tone === 'casual'       ? CASUAL_WORDS :
    tone === 'professional' ? PROFESSIONAL_WORDS : {};

  const before = result;
  result = applyWordMap(result, wordMap);
  if (result !== before) {
    corrections.push({ original: '…', corrected: '…', type: 'tone',
      reason: `[${tone}] Vocabulary updated to match ${tone} style` });
  }

  // Step 3: Sentence-level structural rewrites
  const sentences = result.split(/(?<=[.!?])\s+/);
  result = sentences.map(s => rewriteSentenceStructure(s, tone)).join(' ');

  return result;
}

// ── POST /api/correct ─────────────────────────────────
app.post('/api/correct', (req, res) => {
  const { text, tone = 'default', customDict = [] } = req.body;

  if (!text || typeof text !== 'string')
    return res.status(400).json({ error: 'Missing text field.' });
  if (text.trim().length === 0)
    return res.status(400).json({ error: 'Text cannot be empty.' });
  if (text.length > 100000)
    return res.status(400).json({ error: 'Text too long. Max 100,000 characters.' });

  try {
    const result = correctText(text, customDict);
    const toneCorrections = [];
    const toned = applyTone(result.corrected, tone, toneCorrections);
    const allCorrections = [...result.corrections, ...toneCorrections].slice(0, 15);
    const finalExplanation = generateExplanation(allCorrections, text, toned);
    return res.json({
      corrected:   toned,
      explanation: finalExplanation,
      corrections: allCorrections,
    });
  } catch (err) {
    console.error('Correction error:', err);
    return res.status(500).json({ error: 'Internal error during correction.' });
  }
});

// ════════════════════════════════════════════════════
//  TRAINED PHRASE DATABASE — 450+ entries
//  Categories: Shakespeare · Literature · Politics · Movies
//  Proverbs · Academic · Business · Science · Philosophy
//  Religion · Poetry · Songs · News · Indian context
// ════════════════════════════════════════════════════
const KNOWN_PHRASES = [
  // ── SHAKESPEARE ─────────────────────────────────────
  { phrase: 'to be or not to be', source: 'Shakespeare — Hamlet (1600)', risk: 'high' },
  { phrase: 'to be or not to be that is the question', source: 'Shakespeare — Hamlet (1600)', risk: 'high' },
  { phrase: 'all that glitters is not gold', source: 'Shakespeare — Merchant of Venice', risk: 'high' },
  { phrase: 'good night sweet prince', source: 'Shakespeare — Hamlet', risk: 'high' },
  { phrase: 'the lady doth protest too much', source: 'Shakespeare — Hamlet', risk: 'high' },
  { phrase: 'what light through yonder window breaks', source: 'Shakespeare — Romeo & Juliet', risk: 'high' },
  { phrase: 'brevity is the soul of wit', source: 'Shakespeare — Hamlet', risk: 'high' },
  { phrase: 'all the world is a stage', source: 'Shakespeare — As You Like It', risk: 'high' },
  { phrase: 'neither a borrower nor a lender be', source: 'Shakespeare — Hamlet', risk: 'high' },
  { phrase: 'frailty thy name is woman', source: 'Shakespeare — Hamlet', risk: 'high' },
  { phrase: 'the quality of mercy is not strained', source: 'Shakespeare — Merchant of Venice', risk: 'high' },
  { phrase: 'we are such stuff as dreams are made on', source: 'Shakespeare — The Tempest', risk: 'high' },
  { phrase: 'something is rotten in the state of denmark', source: 'Shakespeare — Hamlet', risk: 'high' },
  { phrase: 'et tu brute', source: 'Shakespeare — Julius Caesar', risk: 'high' },
  { phrase: 'parting is such sweet sorrow', source: 'Shakespeare — Romeo & Juliet', risk: 'high' },
  { phrase: 'a rose by any other name would smell as sweet', source: 'Shakespeare — Romeo & Juliet', risk: 'high' },
  { phrase: 'romeo romeo wherefore art thou romeo', source: 'Shakespeare — Romeo & Juliet', risk: 'high' },
  { phrase: 'uneasy lies the head that wears a crown', source: 'Shakespeare — Henry IV Part 2', risk: 'high' },
  { phrase: 'once more unto the breach dear friends', source: 'Shakespeare — Henry V', risk: 'high' },
  { phrase: 'friends romans countrymen lend me your ears', source: 'Shakespeare — Julius Caesar', risk: 'high' },
  { phrase: 'some are born great some achieve greatness', source: 'Shakespeare — Twelfth Night', risk: 'high' },
  { phrase: 'to thine own self be true', source: 'Shakespeare — Hamlet', risk: 'high' },
  { phrase: 'all is well that ends well', source: 'Shakespeare — All is Well That Ends Well', risk: 'high' },
  { phrase: 'much ado about nothing', source: 'Shakespeare — Play Title', risk: 'high' },
  { phrase: 'what a piece of work is man', source: 'Shakespeare — Hamlet', risk: 'high' },
  { phrase: 'shall i compare thee to a summer day', source: 'Shakespeare — Sonnet 18', risk: 'high' },
  { phrase: 'the course of true love never did run smooth', source: 'Shakespeare — A Midsummer Night Dream', risk: 'high' },
  // ── CLASSIC LITERATURE ──────────────────────────────
  { phrase: 'it was the best of times it was the worst of times', source: 'Charles Dickens — A Tale of Two Cities', risk: 'high' },
  { phrase: 'call me ishmael', source: 'Herman Melville — Moby Dick', risk: 'high' },
  { phrase: 'it is a truth universally acknowledged', source: 'Jane Austen — Pride and Prejudice', risk: 'high' },
  { phrase: 'it was a bright cold day in april', source: 'George Orwell — 1984', risk: 'high' },
  { phrase: 'big brother is watching you', source: 'George Orwell — 1984', risk: 'high' },
  { phrase: 'all animals are equal but some animals are more equal than others', source: 'George Orwell — Animal Farm', risk: 'high' },
  { phrase: 'the only way out is through', source: 'Robert Frost', risk: 'high' },
  { phrase: 'two roads diverged in a yellow wood', source: 'Robert Frost — The Road Not Taken', risk: 'high' },
  { phrase: 'do not go gentle into that good night', source: 'Dylan Thomas', risk: 'high' },
  { phrase: 'to kill a mockingbird', source: 'Harper Lee — Novel Title', risk: 'high' },
  { phrase: 'so we beat on boats against the current', source: 'F. Scott Fitzgerald — The Great Gatsby', risk: 'high' },
  { phrase: 'reader i married him', source: 'Charlotte Bronte — Jane Eyre', risk: 'high' },
  { phrase: 'for whom the bell tolls', source: 'Ernest Hemingway / John Donne', risk: 'high' },
  { phrase: 'no man is an island', source: 'John Donne — Devotions Upon Emergent Occasions', risk: 'high' },
  { phrase: 'water water everywhere nor any drop to drink', source: 'Samuel Taylor Coleridge — Rime of the Ancient Mariner', risk: 'high' },
  { phrase: 'the catcher in the rye', source: 'J.D. Salinger — Novel Title', risk: 'high' },
  { phrase: 'it was a dark and stormy night', source: 'Edward Bulwer-Lytton — Paul Clifford (1830)', risk: 'high' },
  { phrase: 'to be great is to be misunderstood', source: 'Ralph Waldo Emerson — Self-Reliance', risk: 'medium' },
  { phrase: 'that which does not kill us makes us stronger', source: 'Friedrich Nietzsche', risk: 'medium' },
  { phrase: 'god is dead', source: 'Friedrich Nietzsche — The Gay Science', risk: 'high' },
  { phrase: 'i think therefore i am', source: 'Rene Descartes — Discourse on the Method', risk: 'high' },
  { phrase: 'power corrupts and absolute power corrupts absolutely', source: 'Lord Acton (1887)', risk: 'high' },
  // ── POLITICAL SPEECHES ─────────────────────────────
  { phrase: 'ask not what your country can do for you', source: 'JFK — Inaugural Address (1961)', risk: 'high' },
  { phrase: 'i have a dream', source: 'Martin Luther King Jr. — March on Washington (1963)', risk: 'high' },
  { phrase: 'four score and seven years ago', source: 'Abraham Lincoln — Gettysburg Address (1863)', risk: 'high' },
  { phrase: 'we hold these truths to be self-evident', source: 'US Declaration of Independence (1776)', risk: 'high' },
  { phrase: 'government of the people by the people for the people', source: 'Abraham Lincoln — Gettysburg Address', risk: 'high' },
  { phrase: 'we shall fight on the beaches', source: 'Winston Churchill — Speech (1940)', risk: 'high' },
  { phrase: 'blood toil tears and sweat', source: 'Winston Churchill — Speech (1940)', risk: 'high' },
  { phrase: 'the only thing we have to fear is fear itself', source: 'Franklin D. Roosevelt — First Inaugural Address (1933)', risk: 'high' },
  { phrase: 'yes we can', source: 'Barack Obama — 2008 Presidential Campaign', risk: 'high' },
  { phrase: 'make america great again', source: 'Donald Trump — 2016 Presidential Campaign', risk: 'high' },
  { phrase: 'ich bin ein berliner', source: 'JFK — Berlin Speech (1963)', risk: 'high' },
  { phrase: 'a house divided against itself cannot stand', source: 'Abraham Lincoln — Speech (1858)', risk: 'high' },
  { phrase: 'be the change you wish to see in the world', source: 'Attributed to Mahatma Gandhi', risk: 'high' },
  { phrase: 'an eye for an eye makes the whole world blind', source: 'Attributed to Mahatma Gandhi', risk: 'high' },
  { phrase: 'injustice anywhere is a threat to justice everywhere', source: 'Martin Luther King Jr. — Letter from Birmingham Jail', risk: 'high' },
  { phrase: 'the arc of the moral universe bends toward justice', source: 'Martin Luther King Jr.', risk: 'high' },
  { phrase: 'give me liberty or give me death', source: 'Patrick Henry — Speech (1775)', risk: 'high' },
  { phrase: 'the unexamined life is not worth living', source: 'Socrates — Plato Apology', risk: 'high' },
  // ── MOVIES & POP CULTURE ───────────────────────────
  { phrase: 'that is one small step for man one giant leap for mankind', source: 'Neil Armstrong (1969)', risk: 'high' },
  { phrase: 'to infinity and beyond', source: 'Toy Story (1995)', risk: 'high' },
  { phrase: 'life is like a box of chocolates', source: 'Forrest Gump (1994)', risk: 'high' },
  { phrase: 'may the force be with you', source: 'Star Wars (1977)', risk: 'high' },
  { phrase: 'elementary my dear watson', source: 'Sherlock Holmes', risk: 'high' },
  { phrase: 'here is looking at you kid', source: 'Casablanca (1942)', risk: 'high' },
  { phrase: 'frankly my dear i don t give a damn', source: 'Gone with the Wind (1939)', risk: 'high' },
  { phrase: 'you can t handle the truth', source: 'A Few Good Men (1992)', risk: 'high' },
  { phrase: 'i will be back', source: 'The Terminator (1984)', risk: 'high' },
  { phrase: 'houston we have a problem', source: 'Apollo 13 (1995)', risk: 'high' },
  { phrase: 'just keep swimming', source: 'Finding Nemo (2003)', risk: 'high' },
  { phrase: 'with great power comes great responsibility', source: 'Spider-Man / Voltaire', risk: 'high' },
  { phrase: 'winter is coming', source: 'Game of Thrones — House Stark', risk: 'high' },
  { phrase: 'not all those who wander are lost', source: 'J.R.R. Tolkien — The Fellowship of the Ring', risk: 'high' },
  { phrase: 'one ring to rule them all', source: 'J.R.R. Tolkien — The Lord of the Rings', risk: 'high' },
  { phrase: 'you shall not pass', source: 'J.R.R. Tolkien / Lord of the Rings film', risk: 'high' },
  { phrase: 'i am your father', source: 'Star Wars: The Empire Strikes Back (1980)', risk: 'high' },
  { phrase: 'after all this time always', source: 'J.K. Rowling — Harry Potter and the Deathly Hallows', risk: 'high' },
  { phrase: 'stay hungry stay foolish', source: 'Steve Jobs — Stanford Commencement Address (2005)', risk: 'high' },
  { phrase: 'think different', source: 'Apple Inc. — Advertising Slogan', risk: 'high' },
  { phrase: 'just do it', source: 'Nike — Advertising Slogan', risk: 'high' },
  { phrase: 'live long and prosper', source: 'Star Trek — Mr. Spock', risk: 'high' },
  { phrase: 'resistance is futile', source: 'Star Trek — The Borg', risk: 'high' },
  { phrase: 'go ahead make my day', source: 'Sudden Impact (1983)', risk: 'high' },
  { phrase: 'bond james bond', source: 'James Bond (1962)', risk: 'high' },
  { phrase: 'this is the way', source: 'The Mandalorian (2019)', risk: 'medium' },
  { phrase: 'i am iron man', source: 'Iron Man (2008) / Avengers Endgame (2019)', risk: 'high' },
  { phrase: 'move fast and break things', source: 'Meta/Facebook Motto', risk: 'high' },
  // ── PROVERBS & SAYINGS ──────────────────────────────
  { phrase: 'actions speak louder than words', source: 'Common English proverb', risk: 'medium' },
  { phrase: 'the early bird catches the worm', source: 'Common English proverb', risk: 'medium' },
  { phrase: 'a penny saved is a penny earned', source: 'Benjamin Franklin', risk: 'medium' },
  { phrase: 'every cloud has a silver lining', source: 'Common English idiom', risk: 'medium' },
  { phrase: 'birds of a feather flock together', source: 'English proverb (1545)', risk: 'medium' },
  { phrase: 'don t judge a book by its cover', source: 'Common English idiom', risk: 'medium' },
  { phrase: 'you can t have your cake and eat it too', source: 'English proverb', risk: 'medium' },
  { phrase: 'the pen is mightier than the sword', source: 'Edward Bulwer-Lytton (1839)', risk: 'medium' },
  { phrase: 'where there is a will there is a way', source: 'Common proverb', risk: 'medium' },
  { phrase: 'practice makes perfect', source: 'Common proverb', risk: 'medium' },
  { phrase: 'two wrongs don t make a right', source: 'Common proverb', risk: 'medium' },
  { phrase: 'when in rome do as the romans do', source: 'Saint Ambrose (4th century)', risk: 'medium' },
  { phrase: 'the grass is always greener on the other side', source: 'Common idiom', risk: 'medium' },
  { phrase: 'an apple a day keeps the doctor away', source: 'Welsh proverb', risk: 'medium' },
  { phrase: 'too many cooks spoil the broth', source: 'English proverb', risk: 'medium' },
  { phrase: 'all good things must come to an end', source: 'English proverb', risk: 'medium' },
  { phrase: 'honesty is the best policy', source: 'Benjamin Franklin', risk: 'medium' },
  { phrase: 'knowledge is power', source: 'Francis Bacon', risk: 'medium' },
  { phrase: 'time is money', source: 'Benjamin Franklin', risk: 'medium' },
  { phrase: 'better late than never', source: 'Common proverb', risk: 'low' },
  { phrase: 'no pain no gain', source: 'Common idiom', risk: 'low' },
  { phrase: 'you live and you learn', source: 'Common idiom', risk: 'low' },
  { phrase: 'look before you leap', source: 'English proverb', risk: 'medium' },
  { phrase: 'don t count your chickens before they hatch', source: 'Aesop Fables', risk: 'medium' },
  { phrase: 'the apple doesn t fall far from the tree', source: 'German proverb', risk: 'medium' },
  { phrase: 'kill two birds with one stone', source: 'English idiom', risk: 'medium' },
  { phrase: 'bite the bullet', source: 'Military expression', risk: 'low' },
  { phrase: 'hit the nail on the head', source: 'English idiom', risk: 'low' },
  { phrase: 'it takes two to tango', source: 'Common idiom', risk: 'low' },
  { phrase: 'the best things in life are free', source: 'Common idiom', risk: 'medium' },
  { phrase: 'blood is thicker than water', source: 'English proverb', risk: 'medium' },
  { phrase: 'every dog has its day', source: 'Common proverb', risk: 'medium' },
  { phrase: 'you reap what you sow', source: 'Bible — Galatians 6:7', risk: 'medium' },
  { phrase: 'don t bite the hand that feeds you', source: 'English proverb', risk: 'medium' },
  { phrase: 'curiosity killed the cat', source: 'English proverb', risk: 'medium' },
  { phrase: 'laughter is the best medicine', source: 'Common saying / Proverbs 17:22', risk: 'medium' },
  { phrase: 'necessity is the mother of invention', source: 'Plato — The Republic', risk: 'medium' },
  { phrase: 'patience is a virtue', source: 'Common proverb', risk: 'medium' },
  { phrase: 'slow and steady wins the race', source: 'Aesop — The Tortoise and the Hare', risk: 'medium' },
  { phrase: 'don t put all your eggs in one basket', source: 'English proverb', risk: 'medium' },
  { phrase: 'once bitten twice shy', source: 'English proverb', risk: 'medium' },
  { phrase: 'still waters run deep', source: 'English proverb', risk: 'medium' },
  { phrase: 'beggars can t be choosers', source: 'English proverb', risk: 'medium' },
  { phrase: 'this too shall pass', source: 'Persian adage / Common saying', risk: 'medium' },
  { phrase: 'a stitch in time saves nine', source: 'Thomas Fuller — Gnomologia (1732)', risk: 'medium' },
  { phrase: 'the squeaky wheel gets the grease', source: 'American proverb', risk: 'medium' },
  // ── ACADEMIC & ESSAY CLICHES ────────────────────────
  { phrase: 'in recent years there has been', source: 'Common academic opening', risk: 'low' },
  { phrase: 'this essay will discuss', source: 'Academic cliche', risk: 'low' },
  { phrase: 'the purpose of this paper is', source: 'Academic cliche', risk: 'low' },
  { phrase: 'according to research', source: 'Academic cliche', risk: 'low' },
  { phrase: 'studies have shown that', source: 'Academic cliche', risk: 'low' },
  { phrase: 'it is widely believed that', source: 'Academic cliche', risk: 'low' },
  { phrase: 'in the modern world', source: 'Academic cliche', risk: 'low' },
  { phrase: 'technology has changed the way', source: 'Academic/tech cliche', risk: 'low' },
  { phrase: 'with the advent of technology', source: 'Academic cliche', risk: 'low' },
  { phrase: 'in conclusion', source: 'Academic writing cliche', risk: 'low' },
  { phrase: 'it goes without saying', source: 'Common cliche phrase', risk: 'low' },
  { phrase: 'the fact of the matter is', source: 'Common cliche phrase', risk: 'low' },
  { phrase: 'last but not least', source: 'Common cliche phrase', risk: 'low' },
  { phrase: 'first and foremost', source: 'Common cliche phrase', risk: 'low' },
  { phrase: 'needless to say', source: 'Common cliche phrase', risk: 'low' },
  { phrase: 'on the other hand', source: 'Common transitional phrase', risk: 'low' },
  { phrase: 'as a result', source: 'Common transitional phrase', risk: 'low' },
  { phrase: 'for all intents and purposes', source: 'Common idiom', risk: 'low' },
  { phrase: 'throughout history', source: 'Academic cliche', risk: 'low' },
  { phrase: 'since the dawn of time', source: 'Common cliche phrase', risk: 'low' },
  { phrase: 'in today s world', source: 'Common cliche opening', risk: 'low' },
  { phrase: 'this report aims to', source: 'Academic cliche', risk: 'low' },
  { phrase: 'the aim of this study is', source: 'Academic cliche', risk: 'low' },
  { phrase: 'this paper seeks to', source: 'Academic cliche', risk: 'low' },
  { phrase: 'it can be argued that', source: 'Academic cliche', risk: 'low' },
  { phrase: 'it is important to note that', source: 'Academic cliche', risk: 'low' },
  { phrase: 'due to the fact that', source: 'Academic cliche', risk: 'low' },
  { phrase: 'in light of this', source: 'Academic transitional phrase', risk: 'low' },
  { phrase: 'as mentioned above', source: 'Academic cliche', risk: 'low' },
  { phrase: 'as stated earlier', source: 'Academic cliche', risk: 'low' },
  { phrase: 'to sum up', source: 'Academic cliche', risk: 'low' },
  { phrase: 'in summary', source: 'Academic transitional phrase', risk: 'low' },
  { phrase: 'in this essay i will', source: 'Academic cliche', risk: 'low' },
  { phrase: 'taking everything into consideration', source: 'Academic cliche', risk: 'low' },
  { phrase: 'without a shadow of a doubt', source: 'Common cliche', risk: 'low' },
  { phrase: 'at the end of the day', source: 'Common cliche phrase', risk: 'low' },
  { phrase: 'each and every one', source: 'Common redundant phrase', risk: 'low' },
  { phrase: 'at this point in time', source: 'Academic/business cliche', risk: 'low' },
  { phrase: 'the bottom line is', source: 'Business cliche', risk: 'low' },
  { phrase: 'further research is needed', source: 'Academic research cliche', risk: 'low' },
  { phrase: 'limitations of this study', source: 'Academic writing cliche', risk: 'low' },
  { phrase: 'statistically significant', source: 'Research/statistics phrase', risk: 'low' },
  { phrase: 'the results indicate that', source: 'Academic writing cliche', risk: 'low' },
  { phrase: 'our findings suggest that', source: 'Academic writing cliche', risk: 'low' },
  { phrase: 'peer reviewed research has shown', source: 'Academic cliche', risk: 'low' },
  { phrase: 'in today s society', source: 'Academic cliche', risk: 'low' },
  { phrase: 'it is evident that', source: 'Academic cliche', risk: 'low' },
  { phrase: 'it is clear that', source: 'Academic cliche', risk: 'low' },
  { phrase: 'it has been observed that', source: 'Academic cliche', risk: 'low' },
  // ── BUSINESS JARGON ──────────────────────────────────
  { phrase: 'thinking outside the box', source: 'Business cliche', risk: 'low' },
  { phrase: 'think outside the box', source: 'Business cliche', risk: 'low' },
  { phrase: 'a level playing field', source: 'Business cliche', risk: 'low' },
  { phrase: 'move the needle', source: 'Business cliche', risk: 'low' },
  { phrase: 'low hanging fruit', source: 'Business cliche', risk: 'low' },
  { phrase: 'take it to the next level', source: 'Business cliche', risk: 'low' },
  { phrase: 'best practices', source: 'Corporate jargon', risk: 'low' },
  { phrase: 'going forward', source: 'Corporate cliche', risk: 'low' },
  { phrase: 'paradigm shift', source: 'Business/academic cliche', risk: 'low' },
  { phrase: 'core competencies', source: 'Corporate jargon', risk: 'low' },
  { phrase: 'disruptive innovation', source: 'Business cliche', risk: 'low' },
  { phrase: 'actionable insights', source: 'Corporate jargon', risk: 'low' },
  { phrase: 'circle back', source: 'Corporate cliche', risk: 'low' },
  { phrase: 'touch base', source: 'Corporate cliche', risk: 'low' },
  { phrase: 'on the same page', source: 'Business cliche', risk: 'low' },
  { phrase: 'deep dive into', source: 'Corporate jargon', risk: 'low' },
  { phrase: 'game changer', source: 'Business cliche', risk: 'low' },
  { phrase: 'in these unprecedented times', source: 'COVID-era cliche (2020)', risk: 'low' },
  { phrase: 'we are all in this together', source: 'Common solidarity phrase', risk: 'low' },
  { phrase: 'the new normal', source: 'Business/COVID-era cliche', risk: 'low' },
  { phrase: 'fail fast fail often', source: 'Silicon Valley startup culture', risk: 'medium' },
  // ── AI DETECTOR (COMMON LLM PHRASES) ─────────────────
  { phrase: 'as an ai language model', source: 'ChatGPT/LLM footprint', risk: 'high' },
  { phrase: 'it is important to note that', source: 'AI/Academic cliche', risk: 'medium' },
  { phrase: 'delve into', source: 'AI cliché', risk: 'medium' },
  { phrase: 'a testament to', source: 'AI cliché', risk: 'medium' },
  { phrase: 'rich tapestry of', source: 'AI cliché', risk: 'medium' },
  { phrase: 'bustling city', source: 'AI cliché', risk: 'medium' },
  { phrase: 'navigate the complexities of', source: 'AI cliché', risk: 'medium' },
  { phrase: 'equipped with the right tools', source: 'AI cliché', risk: 'medium' },
  { phrase: 'in conclusion', source: 'AI/Academic cliché', risk: 'medium' },
  { phrase: 'however it is crucial to remember', source: 'AI cliché', risk: 'medium' },
  { phrase: 'foster a sense of', source: 'AI cliché', risk: 'medium' },
  { phrase: 'shed light on', source: 'AI cliché', risk: 'low' },
  { phrase: 'a myriad of', source: 'AI cliché', risk: 'low' },
  { phrase: 'the rapid advancement of technology', source: 'AI cliché', risk: 'medium' },
  { phrase: 'not only but also', source: 'AI cliché', risk: 'low' },
  { phrase: 'serves as a reminder', source: 'AI cliché', risk: 'medium' },
  { phrase: 'undeniable impact', source: 'AI cliché', risk: 'medium' },
  { phrase: 'in today s fast paced world', source: 'AI cliché', risk: 'medium' },
  { phrase: 'it goes without saying', source: 'AI cliché', risk: 'medium' },
  { phrase: 'by and large', source: 'AI cliché', risk: 'low' },
  { phrase: 'seamlessly integrate', source: 'AI cliché', risk: 'low' },
  { phrase: 'unleash the potential', source: 'AI cliché', risk: 'low' },
  // ── SCIENCE ──────────────────────────────────────────
  { phrase: 'energy cannot be created or destroyed', source: 'First Law of Thermodynamics', risk: 'high' },
  { phrase: 'survival of the fittest', source: 'Herbert Spencer / Charles Darwin', risk: 'high' },
  { phrase: 'for every action there is an equal and opposite reaction', source: 'Isaac Newton — Third Law of Motion', risk: 'high' },
  { phrase: 'i have not failed i have just found ten thousand ways that won t work', source: 'Thomas Edison', risk: 'high' },
  { phrase: 'imagination is more important than knowledge', source: 'Albert Einstein', risk: 'high' },
  { phrase: 'if i have seen further it is by standing on the shoulders of giants', source: 'Isaac Newton (1675)', risk: 'high' },
  { phrase: 'give me a place to stand and i shall move the earth', source: 'Archimedes', risk: 'high' },
  { phrase: 'correlation does not imply causation', source: 'Statistical/scientific principle', risk: 'medium' },
  { phrase: 'extraordinary claims require extraordinary evidence', source: 'Carl Sagan', risk: 'high' },
  // ── PHILOSOPHY ─────────────────────────────────────
  { phrase: 'the only true wisdom is in knowing you know nothing', source: 'Socrates', risk: 'high' },
  { phrase: 'we are what we repeatedly do', source: 'Aristotle paraphrased', risk: 'high' },
  { phrase: 'man is by nature a political animal', source: 'Aristotle — Politics', risk: 'high' },
  { phrase: 'hell is other people', source: 'Jean-Paul Sartre — No Exit (1944)', risk: 'high' },
  { phrase: 'existence precedes essence', source: 'Jean-Paul Sartre — Existentialism', risk: 'high' },
  { phrase: 'happiness is not something ready made', source: 'Dalai Lama', risk: 'high' },
  { phrase: 'do unto others as you would have them do unto you', source: 'The Golden Rule — Matthew 7:12', risk: 'high' },
  // ── RELIGIOUS TEXTS ──────────────────────────────────
  { phrase: 'in the beginning god created the heavens and the earth', source: 'Bible — Genesis 1:1', risk: 'high' },
  { phrase: 'in the beginning was the word', source: 'Bible — John 1:1', risk: 'high' },
  { phrase: 'for god so loved the world', source: 'Bible — John 3:16', risk: 'high' },
  { phrase: 'love thy neighbour as thyself', source: 'Bible — Matthew 22:39', risk: 'high' },
  { phrase: 'thou shalt not kill', source: 'Bible — Exodus 20:13 Ten Commandments', risk: 'high' },
  { phrase: 'blessed are the meek for they shall inherit the earth', source: 'Bible — Matthew 5:5 Sermon on the Mount', risk: 'high' },
  { phrase: 'the lord is my shepherd', source: 'Bible — Psalm 23:1', risk: 'high' },
  { phrase: 'our father who art in heaven', source: 'Bible — The Lord Prayer', risk: 'high' },
  { phrase: 'there is no god but god', source: 'Islamic Shahada', risk: 'high' },
  { phrase: 'the greatest of these is love', source: 'Bible — 1 Corinthians 13:13', risk: 'high' },
  { phrase: 'to everything there is a season', source: 'Bible — Ecclesiastes 3:1', risk: 'high' },
  { phrase: 'vanity of vanities all is vanity', source: 'Bible — Ecclesiastes 1:2', risk: 'high' },
  // ── POETRY ───────────────────────────────────────────
  { phrase: 'i wandered lonely as a cloud', source: 'William Wordsworth — Daffodils (1807)', risk: 'high' },
  { phrase: 'how do i love thee let me count the ways', source: 'Elizabeth Barrett Browning — Sonnet 43', risk: 'high' },
  { phrase: 'if you can keep your head when all about you', source: 'Rudyard Kipling — If (1910)', risk: 'high' },
  { phrase: 'tiger tiger burning bright', source: 'William Blake — The Tyger (1794)', risk: 'high' },
  { phrase: 'hope is the thing with feathers', source: 'Emily Dickinson', risk: 'high' },
  { phrase: 'in flanders fields the poppies blow', source: 'John McCrae — In Flanders Fields (1915)', risk: 'high' },
  { phrase: 'beauty is truth truth beauty', source: 'John Keats — Ode on a Grecian Urn', risk: 'high' },
  { phrase: 'the world is too much with us', source: 'William Wordsworth', risk: 'high' },
  { phrase: 'i carry your heart with me', source: 'e.e. cummings', risk: 'high' },
  { phrase: 'do not go gentle into that good night rage rage against the dying of the light', source: 'Dylan Thomas', risk: 'high' },
  // ── FAMOUS SONGS ─────────────────────────────────────
  { phrase: 'imagine there is no heaven', source: 'John Lennon — Imagine (1971)', risk: 'high' },
  { phrase: 'all you need is love', source: 'The Beatles (1967)', risk: 'high' },
  { phrase: 'yesterday all my troubles seemed so far away', source: 'The Beatles — Yesterday (1965)', risk: 'high' },
  { phrase: 'let it be', source: 'The Beatles (1970)', risk: 'high' },
  { phrase: 'i will always love you', source: 'Dolly Parton / Whitney Houston', risk: 'high' },
  { phrase: 'we are the champions', source: 'Queen — We Are the Champions (1977)', risk: 'high' },
  { phrase: 'bohemian rhapsody', source: 'Queen — Bohemian Rhapsody (1975)', risk: 'high' },
  { phrase: 'we shall overcome', source: 'Civil Rights Movement anthem', risk: 'high' },
  { phrase: 'the answer is blowin in the wind', source: 'Bob Dylan — Blowin in the Wind (1963)', risk: 'high' },
  // ── NEWS & JOURNALISM ──────────────────────────────
  { phrase: 'in a landmark decision', source: 'News reporting cliche', risk: 'low' },
  { phrase: 'amid growing concerns', source: 'News reporting cliche', risk: 'low' },
  { phrase: 'sending shockwaves through', source: 'News/journalism cliche', risk: 'low' },
  { phrase: 'a perfect storm of', source: 'News/journalism cliche', risk: 'low' },
  { phrase: 'in the wake of', source: 'News/journalism cliche', risk: 'low' },
  { phrase: 'sparked outrage', source: 'Journalism cliche', risk: 'low' },
  { phrase: 'raising serious questions about', source: 'News reporting cliche', risk: 'low' },
  { phrase: 'tensions are running high', source: 'News/journalism cliche', risk: 'low' },
  { phrase: 'the tip of the iceberg', source: 'Common idiom/journalism', risk: 'low' },
  { phrase: 'ground zero', source: 'Common journalistic phrase', risk: 'low' },
  // ── INTERNET & SOCIAL MEDIA ────────────────────────
  { phrase: 'content is king', source: 'Bill Gates — Essay (1996)', risk: 'medium' },
  { phrase: 'you only live once', source: 'Common saying / Drake — The Motto (2011)', risk: 'medium' },
  { phrase: 'the struggle is real', source: 'Internet meme phrase', risk: 'low' },
  { phrase: 'it is what it is', source: 'Common expression/internet cliche', risk: 'low' },
  { phrase: 'smash that subscribe button', source: 'YouTube Cliche', risk: 'medium' },
  { phrase: 'link in bio', source: 'Instagram/TikTok Cliche', risk: 'medium' },
  { phrase: 'number one will shock you', source: 'Clickbait Cliche', risk: 'high' },
  { phrase: 'you won t believe what happened next', source: 'Clickbait Cliche', risk: 'high' },
  { phrase: 'this one weird trick', source: 'Clickbait Cliche', risk: 'high' },
  { phrase: 'doctors hate him', source: 'Clickbait Cliche', risk: 'high' },
  { phrase: 'in a shocking turn of events', source: 'Clickbait Cliche', risk: 'low' },
  { phrase: 'literally no one', source: 'Internet meme phrase', risk: 'medium' },
  { phrase: 'say it louder for the people in the back', source: 'Internet cliche', risk: 'medium' },
  { phrase: 'i did a thing', source: 'Internet cliche', risk: 'medium' },
  { phrase: 'wait for it', source: 'Internet/Video cliche', risk: 'medium' },
  { phrase: 'tell me without telling me', source: 'TikTok trend', risk: 'medium' },
  { phrase: 'rent free in my head', source: 'Internet slang', risk: 'medium' },
  { phrase: 'main character energy', source: 'Internet slang', risk: 'medium' },
  // ── INDIAN CONTEXT & CULTURE ──────────────────────
  { phrase: 'unity in diversity', source: 'Indian national motto concept', risk: 'medium' },
  { phrase: 'satyameva jayate', source: 'Mundaka Upanishad / India National Motto', risk: 'high' },
  { phrase: 'jai hind', source: 'Subhas Chandra Bose — Indian Independence Movement', risk: 'high' },
  { phrase: 'do or die', source: 'Mahatma Gandhi — Quit India Movement (1942)', risk: 'high' },
  { phrase: 'vasudhaiva kutumbakam', source: 'Maha Upanishad — One world family', risk: 'high' },
  { phrase: 'atithi devo bhava', source: 'Sanskrit — Indian cultural saying', risk: 'medium' },
  { phrase: 'ahimsa paramo dharma', source: 'Sanskrit — Non-violence is the highest dharma', risk: 'high' },
  { phrase: 'india is a developing country', source: 'Common Indian academic cliche', risk: 'low' },
  { phrase: 'since ancient times india has', source: 'Indian academic cliche', risk: 'low' },
  { phrase: 'the world s largest democracy', source: 'Common phrase for India', risk: 'low' },
  { phrase: 'india is a land of cultures', source: 'Common academic cliche', risk: 'low' },
  { phrase: 'father of the nation', source: 'Referring to Mahatma Gandhi', risk: 'medium' },
];

function checkPlagiarism(text, pastedPercentage = 0) {
  const lower = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const words = lower.split(' ').filter(Boolean);
  const totalWords = words.length;
  if (totalWords < 5) {
    return {
      plagiarismScore: 0, riskLevel: 'low',
      matchedPhrases: [], repetitions: [],
      stats: { totalWords, matchedPhrases: 0, repetitions: 0, uniqueSentences: 0 },
      analysis: 'Text is too short for a meaningful plagiarism analysis.',
    };
  }

  // 1. Match known phrases and track exact plagiarized word indices
  const matchedPhrases = [];
  const plagiarizedIndices = new Set();
  
  for (const entry of KNOWN_PHRASES) {
    const needle = entry.phrase.toLowerCase();
    if (lower.includes(needle)) {
      matchedPhrases.push({
        phrase:  entry.phrase,
        source:  entry.source,
        risk:    entry.risk,
      });
      
      // Find all occurrences in the word array to track exact overlap
      const needleWords = needle.split(' ').filter(Boolean);
      for (let i = 0; i <= words.length - needleWords.length; i++) {
        let match = true;
        for (let j = 0; j < needleWords.length; j++) {
          if (words[i + j] !== needleWords[j]) { match = false; break; }
        }
        if (match) {
          for (let j = 0; j < needleWords.length; j++) {
            plagiarizedIndices.add(i + j);
          }
        }
      }
    }
  }

  // 2. Find repeated sentences (> 20 chars)
  const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 20);
  const sentenceSeen = {};
  const repetitions = [];
  for (const s of sentences) {
    const key = s.trim().toLowerCase().slice(0, 60);
    if (sentenceSeen[key]) { repetitions.push(s.trim().slice(0, 80)); }
    else sentenceSeen[key] = true;
  }

  // 3. N-gram repetition check (5-word grams)
  const ngramSeen = {}; let repeatedNgrams = 0;
  for (let i = 0; i <= words.length - 5; i++) {
    const gram = words.slice(i, i + 5).join(' ');
    if (ngramSeen[gram]) repeatedNgrams++;
    else ngramSeen[gram] = true;
  }

  // 4. Calculate plagiarism score (exact word overlap percentage)
  let plagiarizedWords = plagiarizedIndices.size;
  
  // Add structural repetitions
  plagiarizedWords += repetitions.length * 8; // Each repeated sentence adds ~8 words of penalty
  plagiarizedWords += repeatedNgrams;         // Each repeated ngram adds 1 word of penalty

  const rawPlagiarism = Math.round((plagiarizedWords / totalWords) * 100);
  // Incorporate pasted text percentage, ensuring score stays between 0 and 100
  let plagiarismScore = Math.min(100, Math.max(0, rawPlagiarism));
  plagiarismScore = Math.max(plagiarismScore, pastedPercentage);

  // 5. Risk level
  const highMatches = matchedPhrases.filter(m => m.risk === 'high').length;
  const riskLevel = highMatches >= 2 || plagiarismScore >= 40 ? 'high'
    : highMatches >= 1 || plagiarismScore >= 15 ? 'medium' : 'low';

  // 6. Human-readable analysis based on academic thresholds
  const lines = [];
  if (plagiarismScore <= 5) {
    lines.push(`✅ Your text shows ${plagiarismScore}% similarity. This is an ideal score for 100% original content.`);
  } else if (plagiarismScore <= 15) {
    lines.push(`⚠️ Your text shows ${plagiarismScore}% similarity. This is generally considered safe for academic assignments or research papers (usually below 10-15%).`);
  } else if (plagiarismScore <= 39) {
    lines.push(`🔴 Your text shows ${plagiarismScore}% similarity. Scores above 25% are often flagged and may require revision to reduce copied phrases.`);
  } else {
    lines.push(`❌ Your text shows ${plagiarismScore}% similarity. Scores above 40-50% usually indicate significant copied content.`);
  }

  if (matchedPhrases.length === 0) lines.push('No known quotes or clichés matched in our database.');
  else lines.push(`${matchedPhrases.length} phrase(s) matched our database of known quotes, proverbs, and clichés.`);
  if (repetitions.length > 0) lines.push(`${repetitions.length} repeated sentence(s) found within your text.`);
  if (repeatedNgrams > 5) lines.push(`${repeatedNgrams} repeated 5-word sequences detected — consider varying your language.`);
  
  if (pastedPercentage > 15) {
    lines.push(`Note: We detected a high volume of pasted text (${pastedPercentage}% of the document), which heavily influenced your similarity score.`);
  } else {
    lines.push('Note: This is an offline analysis using a built-in phrase database. For live web comparison, an internet-connected service is required.');
  }

  return {
    plagiarismScore,
    riskLevel,
    matchedPhrases: matchedPhrases.slice(0, 12),
    repetitions:    repetitions.slice(0, 8),
    stats: { totalWords, matchedPhrases: matchedPhrases.length, repetitions: repetitions.length, uniqueSentences: sentences.length },
    analysis: lines.join(' '),
  };
}

// ── POST /api/plagiarism ──────────────────────────────
app.post('/api/plagiarism', (req, res) => {
  const { text, pastedPercentage } = req.body;
  if (!text || typeof text !== 'string' || text.trim().length < 10)
    return res.status(400).json({ error: 'Please provide at least 10 characters of text.' });
  if (text.length > 100000)
    return res.status(400).json({ error: 'Text too long. Max 100,000 characters.' });
  try {
    return res.json(checkPlagiarism(text, pastedPercentage || 0));
  } catch (err) {
    console.error('Plagiarism check error:', err);
    return res.status(500).json({ error: 'Internal error during plagiarism check.' });
  }
});

// ── GET /api/health ────────────────────────────────────
app.get('/api/health', (req, res) => res.json({
  status:     'ok',
  engine:     'offline (nspell + grammar rules)',
  dictionary: spell ? 'loaded' : 'loading…',
  apiKey:     'not required',
}));

app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
);

// ── Start ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║   AutoCorrect AI Pro — 100% Offline Mode    ║');
  console.log('║   Pinnacle Labs Internship 2026              ║');
  console.log('╚══════════════════════════════════════════════╝\n');
  console.log(`  🚀  Running at:  http://localhost:${PORT}`);
  console.log('  🔒  No API key required — fully offline!');
  console.log('  📖  Loading English dictionary…\n');
  console.log('  Press Ctrl+C to stop.\n');
});
