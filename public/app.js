/* ═══════════════════════════════════════════════════
   AutoCorrect AI Pro — Full Feature Suite
   All 8 features: Tone, Live Mode, Accuracy, Export,
   Custom Dict, File Upload, Dark Mode, Shortcuts
   Pinnacle Labs 2026 · Sai Suman Samantaray
   ═══════════════════════════════════════════════════ */

// ── Samples ────────────────────────────────────────
const SAMPLES = [
  'i wnt to go too the store tomoro but i fogot my walet at hom',
  'Their going to there house over they\'re becaus they\'re frends',
  'She dont know how to write proply and make alot of mistaks in her assignmnt',
  'I has went to the market yesterday and buyed some vegetable for diner',
  'its a grate oppertunity to lern and grow in you\'re carrer path',
  'The weather was beatiful yestarday, we enjoyd alot in the park with frinds',
  'He runned very fast but stil culdnt cach the buss on time to reach scool',
  'their was a problam with the conection and the app stoped workng properly',
];
let sampleIdx = 0;

const TONE_DESCS = {
  default:      'Fix errors only, keep original tone',
  formal:       'Expand contractions, elevate vocabulary to formal register',
  casual:       'Lighten the tone, add contractions, keep it friendly',
  professional: 'Business-ready language, precise and polished',
};

// ── State ──────────────────────────────────────────
const state = {
  tone:        'default',
  liveMode:    false,
  liveTimer:   null,
  customDict:  JSON.parse(localStorage.getItem('acp_dict') || '[]'),
  darkMode:    localStorage.getItem('acp_theme') !== 'light',
  lastCorrected: '',
  lastOriginal:  '',
  speaking:    false,
  history:     [],
  stats:       { fixes: 0, docs: 0, words: 0 },
};

let pastedWordCount = 0;

// ── DOM ────────────────────────────────────────────
const $  = id => document.getElementById(id);
const inputText     = $('inputText');
const outputArea    = $('outputArea');
const correctBtn    = $('correctBtn');
const btnLabel      = $('btnLabel');
const clearAllBtn   = $('clearAllBtn');
const charCount     = $('charCount');
const copyBtn       = $('copyBtn');
const speakBtn      = $('speakBtn');
const exportTxtBtn  = $('exportTxt');
const exportDocxBtn = $('exportDocx');
const exportPdfBtn  = $('exportPdf');
const exportGroup   = $('exportGroup');
const loadingBanner = $('loadingBanner');
const errorBanner   = $('errorBanner');
const errorMsg      = $('errorMsg');
const dividerArrow  = $('dividerArrow');
const diffView      = $('diffView');
const corrList      = $('corrList');
const explBox       = $('explBox');
const rtCount       = $('rtCount');
const resultsSection = $('resultsSection');
const summaryBar    = $('summaryBar');
const accuracyRow   = $('accuracyRow');
const historyList   = $('historyList');
const statusPulse   = $('statusPulse');
const statusLabel   = $('statusLabel');
const liveModeCheck = $('liveModeCheck');
const livePulse     = $('livePulse');
const liveIndicator = $('liveIndicator');
const toneDesc      = $('toneDesc');
const uploadZone    = $('uploadZone');
const fileInput     = $('fileInput');
const fileLoaded    = $('fileLoaded');
const fileLoadedName = $('fileLoadedName');
const fileLoadedSize = $('fileLoadedSize');
const settingsPanel = $('settingsPanel');
const settingsOverlay = $('settingsOverlay');
const dictList      = $('dictList');
const dictWordInput = $('dictWordInput');

// ═══════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════
function init() {
  applyTheme();
  renderDictList();
  checkHealth();

  // Event listeners
  setupTabNav();
  setupToneSelector();
  setupLiveMode();
  setupFileUpload();
  setupSettings();
  setupExport();
  setupShortcuts();

  inputText.addEventListener('input', onInputChange);
  correctBtn.addEventListener('click', runCorrection);
  clearAllBtn.addEventListener('click', clearAll);
  copyBtn.addEventListener('click', copyOutput);
  speakBtn.addEventListener('click', toggleSpeak);
  $('closeErr').addEventListener('click', hideError);
  $('clearHistoryBtn').addEventListener('click', () => { state.history = []; renderHistory(); });
  $('pasteBtn').addEventListener('click', pasteText);

  // Track pasted words for simulated offline plagiarism detection
  inputText.addEventListener('paste', (e) => {
    const pasteData = (e.clipboardData || window.clipboardData).getData('text');
    if (pasteData) {
      pastedWordCount += pasteData.trim().split(/\s+/).length;
    }
  });


  $('sampleBtn').addEventListener('click', loadSample);
  $('fileRemoveBtn').addEventListener('click', removeFile);
  $('browseBtn').addEventListener('click', e => { e.stopPropagation(); fileInput.click(); });

  // Plagiarism Check
  $('plagBtn').addEventListener('click', runPlagiarismCheck);
  $('closePlag').addEventListener('click', () => {
    $('plagSection').classList.remove('open');
  });
  // Close modal on backdrop click
  $('plagSection').addEventListener('click', (e) => {
    if (e.target === $('plagSection')) $('plagSection').classList.remove('open');
  });

  // Result sub-tabs
  document.querySelectorAll('.rt').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.rt').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.rt-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      $('rtp-' + btn.dataset.rt).classList.add('active');
    });
  });
}

// ═══════════════════════════════════════════════════
//  API HEALTH
// ═══════════════════════════════════════════════════
async function checkHealth() {
  try {
    const res  = await fetch('/api/health');
    const data = await res.json();
    if (data.status === 'ok') {
      statusPulse.className = 'status-pulse on';
      statusLabel.textContent = data.dictionary === 'loaded' ? 'Offline Engine Ready' : 'Loading Dictionary…';
    } else {
      statusPulse.className = 'status-pulse err';
      statusLabel.textContent = 'Engine Error';
    }
  } catch {
    statusPulse.className = 'status-pulse err';
    statusLabel.textContent = 'Server Offline';
  }
}

// ═══════════════════════════════════════════════════
//  TAB NAVIGATION
// ═══════════════════════════════════════════════════
function setupTabNav() {
  const allNavBtns = document.querySelectorAll('.sb-link[data-tab], .tb-tab[data-tab]');
  allNavBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.sb-link[data-tab]').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tb-tab[data-tab]').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab').forEach(p => p.classList.remove('active'));
      document.querySelectorAll(`[data-tab="${tab}"]`).forEach(b => b.classList.add('active'));
      $('tab-' + tab).classList.add('active');
      if (tab === 'history') renderHistory();
    });
  });
}

// ═══════════════════════════════════════════════════
//  FEATURE 1 — TONE SELECTOR
// ═══════════════════════════════════════════════════
function setupToneSelector() {
  document.querySelectorAll('.tone-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.tone-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.tone = pill.dataset.tone;
      toneDesc.textContent = TONE_DESCS[state.tone];
    });
  });
}

// ═══════════════════════════════════════════════════
//  FEATURE 2 — LIVE TYPING MODE
// ═══════════════════════════════════════════════════
function setupLiveMode() {
  liveModeCheck.addEventListener('change', () => {
    state.liveMode = liveModeCheck.checked;
    // Visual toggle update
    const track = $('liveTrack');
    if (track) track.classList.toggle('on', state.liveMode);
    // Pulse dot in label
    if (livePulse) livePulse.style.display = state.liveMode ? 'block' : 'none';
    // Live indicator in output header
    liveIndicator.style.display = state.liveMode ? 'flex' : 'none';
  });
}

function onInputChange() {
  const n = inputText.value.length;
  charCount.textContent = `${n.toLocaleString()} / 100,000`;
  charCount.style.color = n > 90000 ? 'var(--red)' : n > 70000 ? 'var(--amber)' : 'var(--t3)';

  if (state.liveMode) {
    clearTimeout(state.liveTimer);
    state.liveTimer = setTimeout(() => {
      if (inputText.value.trim()) runCorrection(true);
    }, 1500);
  }
}

// ═══════════════════════════════════════════════════
//  FEATURE 5 — SETTINGS & CUSTOM DICTIONARY
// ═══════════════════════════════════════════════════
function setupSettings() {
  $('openSettings').addEventListener('click', () => {
    settingsPanel.classList.add('open');
    settingsOverlay.classList.add('open');
  });
  settingsOverlay.addEventListener('click', closeSettings);
  $('spClose').addEventListener('click', closeSettings);

  dictWordInput.addEventListener('keydown', e => { if (e.key === 'Enter') addDictWord(); });
  $('dictAddBtn').addEventListener('click', addDictWord);

  // Theme toggle inside settings
  $('themeToggleBtn').addEventListener('click', toggleTheme);
  $('themeBtn').addEventListener('click', toggleTheme);
}

function closeSettings() {
  settingsPanel.classList.remove('open');
  settingsOverlay.classList.remove('open');
}

function addDictWord() {
  const word = dictWordInput.value.trim().toLowerCase();
  if (!word || state.customDict.includes(word)) { dictWordInput.value = ''; return; }
  state.customDict.push(word);
  localStorage.setItem('acp_dict', JSON.stringify(state.customDict));
  renderDictList();
  dictWordInput.value = '';
}

function removeDictWord(word) {
  state.customDict = state.customDict.filter(w => w !== word);
  localStorage.setItem('acp_dict', JSON.stringify(state.customDict));
  renderDictList();
}

function renderDictList() {
  if (state.customDict.length === 0) {
    dictList.innerHTML = '<span style="font-size:12px;color:var(--t3)">No custom words yet.</span>';
    return;
  }
  dictList.innerHTML = state.customDict.map(w => `
    <span class="dict-tag">
      ${esc(w)}
      <button onclick="removeDictWord('${esc(w)}')" title="Remove">✕</button>
    </span>
  `).join('');
}

// ═══════════════════════════════════════════════════
//  FEATURE 6 — FILE UPLOAD (PDF, DOCX, TXT)
// ═══════════════════════════════════════════════════
function setupFileUpload() {
  // Drag and drop
  uploadZone.addEventListener('dragover',  e => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
  uploadZone.addEventListener('drop', e => {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });
  uploadZone.addEventListener('click', e => {
    if (e.target.id === 'browseBtn' || e.target.closest('.file-loaded') || e.target.closest('.file-remove')) return;
    fileInput.click();
  });
  fileInput.addEventListener('change', e => {
    if (e.target.files[0]) handleFile(e.target.files[0]);
  });
}

async function handleFile(file) {
  const ext  = file.name.split('.').pop().toLowerCase();
  const size = file.size;
  if (size > 10 * 1024 * 1024) { showError('File too large. Max 10 MB.'); return; }

  showFileLoaded(file.name, size);
  try {
    let text = '';
    if      (ext === 'txt')  text = await readTxt(file);
    else if (ext === 'docx') text = await readDocx(file);
    else if (ext === 'pdf')  text = await readPdf(file);
    else { showError('Unsupported file type. Use PDF, DOCX, or TXT.'); removeFile(); return; }

    inputText.value = text.slice(0, 100000);
    inputText.dispatchEvent(new Event('input'));
    state.stats.docs++;
    updateStats();
  } catch (err) {
    console.error(err);
    showError('Could not read file: ' + err.message);
    removeFile();
  }
}

function readTxt(file) {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload  = e => res(e.target.result);
    fr.onerror = rej;
    fr.readAsText(file);
  });
}

async function readDocx(file) {
  const buf = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buf });
  return result.value;
}

async function readPdf(file) {
  const buf = await file.arrayBuffer();
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const pdf   = await pdfjsLib.getDocument({ data: buf }).promise;
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page    = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map(s => s.str).join(' '));
  }
  return pages.join('\n');
}

function showFileLoaded(name, size) {
  $('uploadInner').style.display = 'none';
  fileLoaded.style.display = 'flex';
  fileLoadedName.textContent = name;
  fileLoadedSize.textContent = `(${(size / 1024).toFixed(1)} KB)`;
}

function removeFile() {
  $('uploadInner').style.display = 'flex';
  fileLoaded.style.display = 'none';
  fileInput.value = '';
}

// ═══════════════════════════════════════════════════
//  MAIN CORRECTION
// ═══════════════════════════════════════════════════
async function runCorrection(silent = false) {
  const text = inputText.value.trim();
  if (!text) { if (!silent) showError('Please enter some text to correct.'); return; }

  setLoading(true, silent);
  hideError();

  try {
    const body = {
      text,
      tone:       state.tone,
      customDict: state.customDict,
    };

    const res  = await fetch('/api/correct', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Server error.');

    state.lastOriginal  = text;
    state.lastCorrected = data.corrected;

    // Show corrected text
    outputArea.textContent = data.corrected;
    copyBtn.disabled    = false;
    speakBtn.disabled   = false;
    exportGroup.style.display = 'flex';

    // Results section
    resultsSection.style.display = 'flex';
    renderDiff(text, data.corrected);
    renderCorrections(data.corrections || []);
    renderExplanation(data.explanation || '');
    renderSummary(data.corrections || []);

    // Accuracy (Feature 3)
    showAccuracy(text, data.corrected, data.corrections || []);

    // Stats
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    state.stats.fixes += (data.corrections || []).length;
    state.stats.words += wordCount;
    updateStats();

    // History
    state.history.unshift({
      original:  text,
      corrected: data.corrected,
      tone:      state.tone,
      count:     (data.corrections || []).length,
      time:      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date:      new Date().toLocaleDateString(),
    });

    // Print meta
    $('printBody').textContent = data.corrected;
    $('printMeta').textContent = `Corrected on ${new Date().toLocaleString()} · Tone: ${state.tone} · ${(data.corrections||[]).length} correction(s)`;

  } catch (err) {
    if (!silent) showError(err.message);
  } finally {
    setLoading(false, silent);
  }
}

// ═══════════════════════════════════════════════════
//  FEATURE 3 — ACCURACY SCORE
// ═══════════════════════════════════════════════════
function showAccuracy(original, corrected, corrections) {
  const words      = original.split(/\s+/).filter(Boolean).length || 1;
  const errors     = corrections.length;
  const before     = Math.max(0, ((words - errors) / words) * 100);
  const after      = 100;

  accuracyRow.style.display = 'flex';

  animateCounter($('accErrors'), errors);
  animateCounter($('accWords'),  words);

  const beforeEl = $('accBefore');
  const afterEl  = $('accAfter');
  setTimeout(() => { beforeEl.textContent = before.toFixed(1) + '%'; }, 300);
  setTimeout(() => { afterEl.textContent  = after + '%'; }, 600);

  $('acc-before').style.borderColor = before < 70 ? 'rgba(248,113,113,.3)' : 'rgba(34,197,94,.2)';
  $('acc-after').style.borderColor  = 'rgba(34,197,94,.3)';
}

function animateCounter(el, target) {
  let current = 0;
  const step = Math.ceil(target / 30);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current;
    if (current >= target) clearInterval(timer);
  }, 30);
}

// ═══════════════════════════════════════════════════
//  DIFF RENDERER
// ═══════════════════════════════════════════════════
function renderDiff(original, corrected) {
  const aWords = original.split(/\s+/).filter(Boolean);
  const bWords = corrected.split(/\s+/).filter(Boolean);
  const ops    = wdiff(aWords, bWords);

  let html = '';
  ops.forEach(op => {
    if (op.type === 'equal')  html += `<span>${esc(op.value)}</span> `;
    if (op.type === 'remove') html += `<span class="d-removed">${esc(op.value)}</span> `;
    if (op.type === 'insert') html += `<span class="d-added">${esc(op.value)}</span> `;
  });
  diffView.innerHTML = html.trim() || '<span style="color:var(--t3)">No differences detected.</span>';
}

function wdiff(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);

  let i = a.length, j = b.length;
  const res = [];
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i-1] === b[j-1]) { res.unshift({ type:'equal',  value: a[i-1] }); i--; j--; }
    else if (j > 0 && (i === 0 || dp[i][j-1] <= dp[i-1][j])) { res.unshift({ type:'insert', value: b[j-1] }); j--; }
    else { res.unshift({ type:'remove', value: a[i-1] }); i--; }
  }
  return res;
}

// ═══════════════════════════════════════════════════
//  CORRECTIONS LIST
// ═══════════════════════════════════════════════════
function renderCorrections(corrections) {
  rtCount.textContent = corrections.length;
  if (corrections.length === 0) {
    corrList.innerHTML = '<div style="padding:18px;color:var(--t3);font-size:13px">No individual corrections to list.</div>';
    return;
  }
  corrList.innerHTML = corrections.map(c => `
    <div class="corr-item">
      <span class="corr-badge cb-${esc(c.type || 'spelling')}">${esc(c.type || 'spelling')}</span>
      <div class="corr-detail">
        <div class="corr-change">
          <span class="cx-orig">${esc(c.original)}</span>
          <span class="cx-arr">→</span>
          <span class="cx-fix">${esc(c.corrected)}</span>
        </div>
        ${c.reason ? `<div class="corr-reason">${esc(c.reason)}</div>` : ''}
      </div>
    </div>
  `).join('');
}

function renderExplanation(text) {
  explBox.textContent = text || 'No explanation available.';
}

function renderSummary(corrections) {
  const byType = {};
  corrections.forEach(c => { byType[c.type] = (byType[c.type] || 0) + 1; });
  const total = corrections.length;
  if (total === 0) { summaryBar.innerHTML = '<span class="sum-chip total">✓ No errors found — text looks great!</span>'; return; }

  let html = `<span class="sum-chip total">✦ ${total} correction${total !== 1 ? 's' : ''}</span>`;
  if (byType.spelling)     html += `<span class="sum-chip spell">✗ ${byType.spelling} spelling</span>`;
  if (byType.grammar)      html += `<span class="sum-chip grammar">⊘ ${byType.grammar} grammar</span>`;
  if (byType.punctuation)  html += `<span class="sum-chip punct">• ${byType.punctuation} punctuation</span>`;
  if (byType.style)        html += `<span class="sum-chip style">↗ ${byType.style} style</span>`;
  if (byType.tone)         html += `<span class="sum-chip total">🎭 ${byType.tone} tone</span>`;
  summaryBar.innerHTML = html;
}

// ═══════════════════════════════════════════════════
//  FEATURE 4 — EXPORT
// ═══════════════════════════════════════════════════
function setupExport() {
  exportTxtBtn.addEventListener('click', () => {
    if (!state.lastCorrected) return;
    const blob = new Blob([state.lastCorrected], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'corrected_text.txt'; a.click();
    URL.revokeObjectURL(url);
  });

  exportDocxBtn.addEventListener('click', () => {
    if (!state.lastCorrected) return;
    // Create minimal .docx XML
    const xmlContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:pPr><w:pStyle w:val="Title"/></w:pPr>
      <w:r><w:t>AutoCorrect AI Pro — Corrected Document</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:color w:val="888888"/><w:sz w:val="20"/></w:rPr>
      <w:t>Corrected on ${new Date().toLocaleString()} | Tone: ${state.tone} | Pinnacle Labs 2026</w:t></w:r></w:p>
    ${state.lastCorrected.split('\n').map(line =>
      `<w:p><w:r><w:t xml:space="preserve">${esc(line)}</w:t></w:r></w:p>`
    ).join('')}
  </w:body>
</w:document>`;
    const blob = new Blob([xmlContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'corrected_text.docx'; a.click();
    URL.revokeObjectURL(url);
  });

  exportPdfBtn.addEventListener('click', () => {
    if (!state.lastCorrected) return;
    window.print();
  });
}

// ═══════════════════════════════════════════════════
//  FEATURE 7 — DARK / LIGHT MODE
// ═══════════════════════════════════════════════════
function applyTheme() {
  if (state.darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  const label = $('themeLabel');
  if (label) label.textContent = state.darkMode ? 'Light Mode' : 'Dark Mode';
  const icon = document.querySelector('#themeBtn .material-symbols-outlined');
  if (icon) icon.textContent = state.darkMode ? 'light_mode' : 'dark_mode';
}

function toggleTheme() {
  state.darkMode = !state.darkMode;
  localStorage.setItem('acp_theme', state.darkMode ? 'dark' : 'light');
  applyTheme();
}

// ═══════════════════════════════════════════════════
//  FEATURE 8 — KEYBOARD SHORTCUTS
// ═══════════════════════════════════════════════════
function setupShortcuts() {
  document.addEventListener('keydown', e => {
    const ctrl = e.ctrlKey || e.metaKey;

    // Ctrl+Enter → correct
    if (ctrl && e.key === 'Enter') {
      e.preventDefault();
      runCorrection();
    }
    // Ctrl+D → clear editor
    if (ctrl && e.key === 'd') {
      e.preventDefault();
      clearAll();
    }
    // Ctrl+Shift+C → copy corrected
    if (ctrl && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      copyOutput();
    }
    // Escape → close settings
    if (e.key === 'Escape') closeSettings();
  });
}

// ═══════════════════════════════════════════════════
//  HISTORY
// ═══════════════════════════════════════════════════
function renderHistory() {
  if (state.history.length === 0) {
    historyList.innerHTML = `<div class="empty-state"><div class="es-icon">📭</div><p>No corrections yet.<br/>Go to Editor to get started.</p></div>`;
    return;
  }
  historyList.innerHTML = state.history.map((item, i) => `
    <div class="h-card">
      <div class="h-card-head">
        <span class="h-session">Session #${state.history.length - i}</span>
        <span>${item.date} · ${item.time} · ${item.tone} tone · ${item.count} fix${item.count !== 1 ? 'es' : ''}</span>
      </div>
      <div class="h-body">
        <div class="h-col"><div class="h-col-lbl">Original</div>${esc(item.original.slice(0, 300))}${item.original.length > 300 ? '…' : ''}</div>
        <div class="h-col"><div class="h-col-lbl">Corrected</div>${esc(item.corrected.slice(0, 300))}${item.corrected.length > 300 ? '…' : ''}</div>
      </div>
    </div>
  `).join('');
}

// ═══════════════════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════════════════
function setLoading(on, silent = false) {
  if (!silent) {
    loadingBanner.style.display = on ? 'flex' : 'none';
  }
  // Optional: keep the divider arrow spinning as a subtle indicator for live mode
  dividerArrow.classList.toggle('spin', on);
  
  if (!silent) {
    correctBtn.disabled = on;
    btnLabel.textContent = on ? 'Correcting…' : 'Correct Text';
  }
}

function showError(msg) { errorMsg.textContent = msg; errorBanner.style.display = 'flex'; }
function hideError()     { errorBanner.style.display = 'none'; }

function clearAll() {
  inputText.value = '';
  pastedWordCount = 0;
  charCount.textContent = '0 / 100,000';
  resetOutput();
  hideError();
  const ps = $('plagSection');
  if (ps) ps.classList.remove('open');
}

function resetOutput() {
  outputArea.innerHTML = `<div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:20px;opacity:.6">
    <div style="width:56px;height:56px;border-radius:50%;background:var(--secondary-container);display:flex;align-items:center;justify-content:center;margin-bottom:12px">
      <span class="material-symbols-outlined" style="font-size:28px;color:var(--on-secondary-container)">spellcheck</span>
    </div>
    <p style="font-size:15px;font-weight:600;color:var(--t1);margin-bottom:6px">Ready to polish?</p>
    <p style="font-size:13px;color:var(--t3)">Corrected text will appear here.<br>Press <kbd>Ctrl+Enter</kbd> to start.</p>
  </div>`;
  copyBtn.disabled    = true;
  speakBtn.disabled   = true;
  exportGroup.style.display  = 'none';
  resultsSection.style.display = 'none';
  accuracyRow.style.display    = 'none';
  state.lastCorrected = '';
}

async function pasteText() {
  try {
    const text = await navigator.clipboard.readText();
    inputText.value = text;
    inputText.dispatchEvent(new Event('input'));
  } catch { showError('Clipboard access denied. Please use Ctrl+V to paste.'); }
}

function loadSample() {
  inputText.value = SAMPLES[sampleIdx % SAMPLES.length];
  sampleIdx++;
  inputText.dispatchEvent(new Event('input'));
}

function copyOutput() {
  if (!state.lastCorrected) return;
  navigator.clipboard.writeText(state.lastCorrected).then(() => {
    copyBtn.textContent = '✓ Copied!';
    setTimeout(() => {
      copyBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Copy`;
    }, 2000);
  });
}

function toggleSpeak() {
  if (state.speaking) {
    speechSynthesis.cancel();
    state.speaking = false;
    speakBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 010 7.07"/></svg> Speak`;
    return;
  }
  if (!state.lastCorrected) return;
  const utt  = new SpeechSynthesisUtterance(state.lastCorrected);
  
  // Create a cute, sweet voice profile
  utt.pitch = 1.5; // Higher pitch for a sweeter tone
  utt.rate = 1.05; // Slightly lively rate
  
  // Select a pleasant female voice (Samantha on Mac is great for this)
  const voices = speechSynthesis.getVoices();
  const sweetVoice = voices.find(v => 
    v.name.includes('Samantha') || 
    v.name.includes('Google UK English Female') || 
    v.name.includes('Victoria') ||
    v.name.includes('Amie') ||
    (v.name.includes('Female') && v.lang.startsWith('en'))
  );
  if (sweetVoice) {
    utt.voice = sweetVoice;
  }

  utt.onend  = () => { state.speaking = false; speakBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 010 7.07"/></svg> Speak`; };
  speechSynthesis.speak(utt);
  state.speaking = true;
  speakBtn.textContent = '⏹ Stop';
}

function updateStats() {
  $('statFixes').textContent = state.stats.fixes;
  $('statDocs').textContent  = state.stats.docs;
  $('statWords').textContent = state.stats.words;
}

function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ═══════════════════════════════════════════════════
//  PLAGIARISM CHECK  — Feature 9
// ═══════════════════════════════════════════════════
async function runPlagiarismCheck() {
  // Switch to editor tab first so plagSection is visible
  document.querySelectorAll('.sb-link[data-tab], .tb-tab[data-tab]').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('[data-tab="editor"]').forEach(b => b.classList.add('active'));
  $('tab-editor').classList.add('active');

  const text = inputText.value.trim();
  if (!text) { showError('Please enter some text in the editor before running a plagiarism check.'); return; }
  if (text.length < 20) { showError('Text is too short for plagiarism analysis. Please add at least 20 characters.'); return; }

  const btn = $('plagBtn');
  const origLabel = `<span class="material-symbols-outlined" style="font-size:16px">fact_check</span> Plagiarism`;
  btn.classList.add('running');
  btn.innerHTML = `<span class="material-symbols-outlined" style="font-size:16px;animation:spin 1s linear infinite">sync</span> Checking…`;
  hideError();

  const currentWords = text.trim().split(/\s+/).length || 1;
  const pastedPercentage = Math.min(100, Math.round((pastedWordCount / currentWords) * 100));

  try {
    const res  = await fetch('/api/plagiarism', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, pastedPercentage }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Plagiarism check failed.');
    renderPlagiarismResults(data, text);
  } catch (err) {
    showError('Plagiarism check error: ' + err.message);
  } finally {
    btn.classList.remove('running');
    btn.innerHTML = origLabel;
  }
}


function renderPlagiarismResults(data, originalText) {
  const section = $('plagSection');
  section.classList.add('open'); // open the modal

  // ── Animated SVG ring ─────────────────────────
  const score = data.plagiarismScore || 0;
  const circumference = 314.16; // 2*PI*50
  const offset = circumference - (score / 100) * circumference;
  const arc = $('plagRingArc');
  arc.style.strokeDashoffset = circumference; // reset
  arc.className = '';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // For plagiarism, low is green, high is red
      arc.className = score <= 15 ? 'ring-green' : score <= 39 ? 'ring-amber' : 'ring-red';
      arc.style.strokeDashoffset = offset;
    });
  });

  // ── Animated score number ─────────────────────
  const scoreEl = $('plagScore');
  scoreEl.textContent = '0%';
  let cur = 0;
  const step = Math.max(1, Math.ceil(score / 40));
  const timer = setInterval(() => {
    cur = Math.min(cur + step, score);
    scoreEl.textContent = cur + '%';
    if (cur >= score) clearInterval(timer);
  }, 25);

  // ── Chips ─────────────────────────────────────
  animateCounter($('pcTotalWords'), data.stats.totalWords || 0);
  animateCounter($('pcMatched'),    data.stats.matchedPhrases || 0);
  animateCounter($('pcReps'),       data.stats.repetitions || 0);

  const riskEl = $('pcRisk');
  const riskColors = { low: 'var(--green)', medium: 'var(--amber)', high: 'var(--red)' };
  const riskLabels = { low: 'LOW ✓', medium: 'MEDIUM ⚠', high: 'HIGH ✖' };
  riskEl.textContent  = riskLabels[data.riskLevel] || 'LOW ✓';
  riskEl.style.color  = riskColors[data.riskLevel] || 'var(--green)';

  // ── Analysis text ─────────────────────────────
  $('plagAnalysis').textContent = data.analysis || '';

  // ── Matched phrases ───────────────────────────
  const matchList = $('plagMatchList');
  if (!data.matchedPhrases || data.matchedPhrases.length === 0) {
    matchList.innerHTML = `<div class="pm-empty">✅ No known phrases, quotes, or clichés matched in our trained database of 450+ entries!</div>`;
  } else {
    matchList.innerHTML = data.matchedPhrases.map(m => `
      <div class="pm-item">
        <span class="pm-risk ${esc(m.risk)}">${esc(m.risk)}</span>
        <div class="pm-detail">
          <div class="pm-phrase">&ldquo;${esc(m.phrase)}&rdquo;</div>
          <div class="pm-source">📚 ${esc(m.source)}</div>
        </div>
      </div>
    `).join('');
  }

  // ── Highlighted text ──────────────────────────
  const hlWrap = $('plagHighlightWrap');
  if (data.matchedPhrases && data.matchedPhrases.length > 0) {
    hlWrap.style.display = 'block';
    let highlighted = esc(originalText);
    data.matchedPhrases.forEach(m => {
      const escapedPhrase = esc(m.phrase).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedPhrase, 'gi');
      highlighted = highlighted.replace(regex, match =>
        `<mark class="ph-mark" title="${esc(m.source)}">${match}</mark>`
      );
    });
    $('plagHighlighted').innerHTML = highlighted;
  } else {
    hlWrap.style.display = 'none';
  }

  // ── Scroll into view ──────────────────────────
  // Modal is visible — no scroll needed
}

// ── Boot ───────────────────────────────────────────
init();
