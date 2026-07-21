(function() {
  const LS_PREFIX = 'tradeJournal:';

  // ── JSONBin.io storage ────────────────────────────────────────────────────
  // All data lives in one JSONBin bin. Read/write via fetch from any browser.
  // BIN_ID and API_KEY are entered once by the user and saved in localStorage.
  // Get a free key + bin at https://jsonbin.io

  const JSONBIN_KEY_LS  = 'tj:jsonbin_key';
  const JSONBIN_BIN_LS  = 'tj:jsonbin_bin';

  function jsonbinConfig() {
    return {
      key: '$2a$10$Gjdo2ch8GCzdk8JlngS9weJ9c.l17.zGbwoLZJ3X6Ro/O/Vj1nCoC',
      bin: '6a5fd787da38895dfe7ca4f7',
    };
  }

  function isConfigured() {
    return true;
  }

  let _db = null; // in-memory cache

  async function loadDb() {
    if (_db) return _db;
    if (!isConfigured()) { _db = {}; return _db; }
    const { key, bin } = jsonbinConfig();
    const res = await fetch(`https://api.jsonbin.io/v3/b/${bin}/latest`, {
      headers: { 'X-Master-Key': key },
    });
    const json = await res.json();
    _db = json.record || {};
    return _db;
  }

  async function saveDb() {
    if (!isConfigured()) return;
    const { key, bin } = jsonbinConfig();
    await fetch(`https://api.jsonbin.io/v3/b/${bin}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Master-Key': key },
      body: JSON.stringify(_db),
    });
  }

  const storage = {
    async get(key) {
      try {
        const db = await loadDb();
        const val = db[key];
        return val !== undefined ? { key, value: val } : null;
      } catch (e) { return null; }
    },
    async set(key, value) {
      try {
        const db = await loadDb();
        db[key] = value;
        await saveDb();
        return { key, value };
      } catch (e) { return null; }
    },
    async delete(key) {
      try {
        const db = await loadDb();
        delete db[key];
        await saveDb();
        return { key, deleted: true };
      } catch (e) { return null; }
    },
    async list(prefix) {
      try {
        const db = await loadDb();
        const keys = Object.keys(db).filter(k => !prefix || k.startsWith(prefix));
        return { keys };
      } catch (e) { return { keys: [] }; }
    }
  };

  const ACCOUNTS_KEY = 'accounts';
  const MAX_FREE_ACCOUNTS = 2;
  const CURRENT_ACCOUNT_KEY = 'currentAccount';
  const tradesKeyFor = (id) => 'trades:' + id;
  const balanceKeyFor = (id) => 'startingBalance:' + id;
  const strategiesKeyFor = (id) => 'strategies:' + id;
  const STORAGE_KEY = () => tradesKeyFor(currentAccountId);
  const BALANCE_KEY = () => balanceKeyFor(currentAccountId);
  const STRATEGY_KEY = () => strategiesKeyFor(currentAccountId);
  const TIMEFRAME_OPTIONS = ['15s', '30s', '1m', '2m', '3m', '5m', '15m', '30m', '1H', '2H', '4H', '1D'];
  const MAX_SHOTS = 5;
  const GRADE_STYLES_DARK = {
    'B':    { border: '#ff2020', color: '#ffd6d6', bg: '#330a0a' },
    'B+':   { border: '#ff7a1a', color: '#ffe3c2', bg: '#331b06' },
    'A-':   { border: '#ffd60a', color: '#fff6c2', bg: '#332c05' },
    'A':    { border: '#b9e01a', color: '#eaffb8', bg: '#22300a' },
    'A+':   { border: '#4ade80', color: '#d2ffe4', bg: '#0d3320' },
    'A+++': { border: '#00ff6a', color: '#d2ffe0', bg: '#053318' },
  };
  const GRADE_STYLES_LIGHT = {
    'B':    { border: '#d61414', color: '#7a0f0f', bg: '#ffe0e0' },
    'B+':   { border: '#c85f0f', color: '#7a3d05', bg: '#ffe8d1' },
    'A-':   { border: '#a68a05', color: '#665705', bg: '#fff3c2' },
    'A':    { border: '#6f8a0f', color: '#4a5c08', bg: '#f1fbc9' },
    'A+':   { border: '#1f9d5c', color: '#0d5c34', bg: '#d7fbe4' },
    'A+++': { border: '#00a852', color: '#046030', bg: '#cffbe0' },
  };
  const INSTRUMENT_STYLES_DARK = {
    'ES': { border: '#C4162E', color: '#ffd3da', bg: '#2e0d13' },
    'NQ': { border: '#0091BA', color: '#c9eef8', bg: '#082830' },
    'GC': { border: '#E0A526', color: '#fff1c2', bg: '#332705' },
    'YM': { border: '#6366F1', color: '#e0e0ff', bg: '#191a33' },
  };
  const INSTRUMENT_STYLES_LIGHT = {
    'ES': { border: '#a3122a', color: '#7a0f1c', bg: '#fbdde2' },
    'NQ': { border: '#00728f', color: '#054a5e', bg: '#d7f0f7' },
    'GC': { border: '#a67815', color: '#664a05', bg: '#fff3d1' },
    'YM': { border: '#4338ca', color: '#312e81', bg: '#e0e7ff' },
  };
  const SESSION_STYLES_DARK = {
    'New York': { border: '#22c55e', color: '#d2ffe4', bg: '#0d2b1a' },
    'London':   { border: '#06b6d4', color: '#cdf6ff', bg: '#08262c' },
    'Asia':     { border: '#8b5cf6', color: '#e6dcff', bg: '#1f1633' },
  };
  const SESSION_STYLES_LIGHT = {
    'New York': { border: '#188a45', color: '#0d5c34', bg: '#d9f7e3' },
    'London':   { border: '#0891a8', color: '#0a5766', bg: '#d3f4fa' },
    'Asia':     { border: '#6d3ed6', color: '#4a2a8f', bg: '#eae0fd' },
  };
  const DIRECTION_STYLES_DARK = {
    'long':  { border: '#2fbf71', color: '#d2ffe4', bg: '#0d2b1a' },
    'short': { border: '#e5484d', color: '#ffd8d9', bg: '#330a0d' },
  };
  const DIRECTION_STYLES_LIGHT = {
    'long':  { border: '#1f9d5c', color: '#0d5c34', bg: '#d9f7e3' },
    'short': { border: '#c22026', color: '#7a1015', bg: '#fbdde0' },
  };
  const DIRECTION_LABELS = { 'long': 'Long', 'short': 'Short' };
  function GRADE_STYLES_FOR() { return getTheme() === 'light' ? GRADE_STYLES_LIGHT : GRADE_STYLES_DARK; }
  function INSTRUMENT_STYLES_FOR() { return getTheme() === 'light' ? INSTRUMENT_STYLES_LIGHT : INSTRUMENT_STYLES_DARK; }
  function SESSION_STYLES_FOR() { return getTheme() === 'light' ? SESSION_STYLES_LIGHT : SESSION_STYLES_DARK; }
  function DIRECTION_STYLES_FOR() { return getTheme() === 'light' ? DIRECTION_STYLES_LIGHT : DIRECTION_STYLES_DARK; }
  const GRADE_STYLES = new Proxy({}, { get: (_, k) => GRADE_STYLES_FOR()[k] });
  const INSTRUMENT_STYLES = new Proxy({}, { get: (_, k) => INSTRUMENT_STYLES_FOR()[k] });
  const SESSION_STYLES = new Proxy({}, { get: (_, k) => SESSION_STYLES_FOR()[k] });
  const DIRECTION_STYLES = new Proxy({}, { get: (_, k) => DIRECTION_STYLES_FOR()[k] });
  const confluenceColorCache = {};
  function confluenceColor(name) {
    const theme = getTheme();
    const cacheKey = theme + ':' + name;
    if (confluenceColorCache[cacheKey]) return confluenceColorCache[cacheKey];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
      hash |= 0;
    }
    const hue = Math.abs(hash) % 360;
    const style = theme === 'light'
      ? {
          border: `hsl(${hue}, 70%, 38%)`,
          color: `hsl(${hue}, 75%, 26%)`,
          bg: `hsl(${hue}, 65%, 90%)`
        }
      : {
          border: `hsl(${hue}, 70%, 52%)`,
          color: `hsl(${hue}, 90%, 88%)`,
          bg: `hsl(${hue}, 55%, 14%)`
        };
    confluenceColorCache[cacheKey] = style;
    return style;
  }
  function mindsetColor() {
    return getTheme() === 'light'
      ? { border: 'var(--red)', color: '#8a1f30', bg: 'var(--red-dim)' }
      : { border: 'var(--red)', color: '#ffe1e2', bg: 'var(--red-dim)' };
  }
  let accounts = [];
  let currentAccountId = null;
  let trades = [];
  let startingBalance = 0;
  let selectedResult = null;
  let selectedInstrument = null;
  let selectedSession = null;
  let selectedGrade = null;
  let selectedDirection = null;
  let strategies = [];
  let shotSlots = [];
  let selectedTagFilter = 'all';
  let searchQuery = '';
  let filterDateFrom = null;
  let filterDateTo = null;
  let editingTradeId = null;
  let perfPeriod = 'month';
  let netPnlGran = 'month';
  let customStart = null;
  let customEnd = null;
  let hourMode = 'entry';

  const DOW_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const todayDate = new Date();
  let calMonth = todayDate.getMonth();
  let calYear = todayDate.getFullYear();

  const $ = (id) => document.getElementById(id);

  function todayStr() {
    const d = new Date();
    return d.toISOString().slice(0,10);
  }
  $('f-date').value = todayStr();
  $('today-label').textContent = new Date().toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

  // ---------- Tabs ----------
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.removeAttribute('data-active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.removeAttribute('data-active'));
      btn.setAttribute('data-active', 'true');
      $('tab-' + btn.dataset.tab).setAttribute('data-active', 'true');
    });
  });
  document.querySelector('.tab-btn[data-tab="journal"]').setAttribute('data-active', 'true');
  $('tab-journal').setAttribute('data-active', 'true');

  // ---------- Calendar nav setup ----------
  MONTH_NAMES.forEach((m, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = m;
    $('cal-month-select').appendChild(opt);
  });
  for (let y = todayDate.getFullYear() - 6; y <= todayDate.getFullYear() + 1; y++) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    $('cal-year-select').appendChild(opt);
  }
  $('cal-month-select').value = calMonth;
  $('cal-year-select').value = calYear;

  $('cal-month-select').addEventListener('change', () => {
    calMonth = parseInt($('cal-month-select').value, 10);
    renderCalendar();
  });
  $('cal-year-select').addEventListener('change', () => {
    calYear = parseInt($('cal-year-select').value, 10);
    renderCalendar();
  });
  $('cal-prev').addEventListener('click', () => {
    calMonth--;
    if (calMonth < 0) { calMonth = 11; calYear--; }
    $('cal-month-select').value = calMonth;
    $('cal-year-select').value = calYear;
    renderCalendar();
  });
  $('cal-next').addEventListener('click', () => {
    calMonth++;
    if (calMonth > 11) { calMonth = 0; calYear++; }
    $('cal-month-select').value = calMonth;
    $('cal-year-select').value = calYear;
    renderCalendar();
  });

  $('period-toggle').addEventListener('click', (e) => {
    const btn = e.target.closest('.period-btn');
    if (!btn) return;
    perfPeriod = btn.dataset.period;
    $('custom-range-row').style.display = perfPeriod === 'custom' ? 'flex' : 'none';
    renderSnapshot();
  });

  $('custom-range-apply').addEventListener('click', () => {
    const s = $('custom-range-start').value;
    const e = $('custom-range-end').value;
    if (!s || !e) { setStatus('Pick both a start and end date', true); return; }
    if (s > e) { setStatus('Start date must be before end date', true); return; }
    customStart = s;
    customEnd = e;
    renderSnapshot();
  });

  $('netpnl-toggle').addEventListener('click', (e) => {
    const btn = e.target.closest('.period-btn');
    if (!btn) return;
    netPnlGran = btn.dataset.gran;
    renderNetPnlChart();
  });

  $('hour-toggle').addEventListener('click', (e) => {
    const btn = e.target.closest('.period-btn');
    if (!btn) return;
    hourMode = btn.dataset.hourmode;
    renderHourPerformance();
  });

  function fmtMoney(n) {
    const sign = n < 0 ? '-' : '+';
    return sign + '$' + Math.abs(n).toFixed(2);
  }

  // Rounds a "HH:MM" time string to the nearest 10-minute mark (24h format),
  // so times entered via typing/paste stay on the same grid as the picker.
  function roundTo10Min(hhmm) {
    if (!hhmm) return null;
    const [h, m] = hhmm.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return null;
    let totalMin = h * 60 + m;
    totalMin = Math.round(totalMin / 10) * 10;
    totalMin = ((totalMin % 1440) + 1440) % 1440; // wrap midnight rounding up from 23:5x
    const rh = Math.floor(totalMin / 60);
    const rm = totalMin % 60;
    return String(rh).padStart(2, '0') + ':' + String(rm).padStart(2, '0');
  }

  function fmtHour12(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return String(h12) + ':' + String(m).padStart(2, '0') + ' ' + period;
  }

  function setStatus(msg, isError) {
    const el = $('form-status');
    el.textContent = msg;
    el.className = 'status-msg' + (isError ? ' error' : '');
    if (msg) setTimeout(() => { if (el.textContent === msg) el.textContent = ''; }, 3000);
  }

  // ---------- Accounts ----------
  async function loadAccounts() {
    try {
      const res = await storage.get(ACCOUNTS_KEY, false);
      accounts = res && res.value ? JSON.parse(res.value) : [];
    } catch (e) {
      accounts = [];
    }

    if (accounts.length === 0) {
      const defaultId = genUid();
      accounts = [{ id: defaultId, name: 'Account 1' }];
      currentAccountId = defaultId;
      try {
        const legacyTrades = await storage.get('trades', false);
        if (legacyTrades && legacyTrades.value) {
          await storage.set(tradesKeyFor(defaultId), legacyTrades.value, false);
        }
        const legacyBalance = await storage.get('startingBalance', false);
        if (legacyBalance && legacyBalance.value) {
          await storage.set(balanceKeyFor(defaultId), legacyBalance.value, false);
        }
        const legacyStrategies = await storage.get('strategies', false);
        if (legacyStrategies && legacyStrategies.value) {
          await storage.set(strategiesKeyFor(defaultId), legacyStrategies.value, false);
        }
      } catch (e) { }
      try {
        await storage.set(ACCOUNTS_KEY, JSON.stringify(accounts), false);
        await storage.set(CURRENT_ACCOUNT_KEY, currentAccountId, false);
      } catch (e) {}
    } else {
      try {
        const cur = await storage.get(CURRENT_ACCOUNT_KEY, false);
        currentAccountId = cur && cur.value ? cur.value : accounts[0].id;
      } catch (e) {
        currentAccountId = accounts[0].id;
      }
      if (!accounts.some(a => a.id === currentAccountId)) currentAccountId = accounts[0].id;
    }

    renderAccountSelect();
  }

  function renderAccountSelect() {
    const sel = $('account-select');
    sel.innerHTML = accounts.map(a => `<option value="${a.id}">${escapeHtml(a.name)}</option>`).join('');
    sel.value = currentAccountId;
    $('account-del-btn').disabled = accounts.length <= 1;
  }

  async function switchAccount(id) {
    currentAccountId = id;
    disarmDelete();
    closeAddAccountForm();
    closeRenameAccountForm();
    try {
      await storage.set(CURRENT_ACCOUNT_KEY, currentAccountId, false);
    } catch (e) {}
    renderAccountSelect();
    $('f-balance').value = '';
    selectedTagFilter = 'all';
    await loadBalance();
    await loadStrategies();
    await loadTrades();
  }

  $('account-select').addEventListener('change', () => {
    switchAccount($('account-select').value);
  });

  let deleteArmed = false;
  let deleteArmTimeout = null;

  function disarmDelete() {
    deleteArmed = false;
    clearTimeout(deleteArmTimeout);
    const btn = $('account-del-btn');
    btn.textContent = '✕';
    btn.classList.remove('account-btn-danger');
  }

  function closeAddAccountForm() {
    $('account-add-row').dataset.open = 'false';
    $('account-add-input').value = '';
  }

  function openAddAccountForm() {
    disarmDelete();
    closeRenameAccountForm();
    $('account-add-row').dataset.open = 'true';
    $('account-add-input').value = 'Account ' + (accounts.length + 1);
    $('account-add-input').focus();
    $('account-add-input').select();
  }

  function closeRenameAccountForm() {
    $('account-rename-row').dataset.open = 'false';
    $('account-rename-input').value = '';
  }

  function openRenameAccountForm() {
    disarmDelete();
    closeAddAccountForm();
    const acc = accounts.find(a => a.id === currentAccountId);
    $('account-rename-row').dataset.open = 'true';
    $('account-rename-input').value = acc ? acc.name : '';
    $('account-rename-input').focus();
    $('account-rename-input').select();
  }

  async function saveRenameFromForm() {
    const acc = accounts.find(a => a.id === currentAccountId);
    if (!acc) { closeRenameAccountForm(); return; }
    const raw = $('account-rename-input').value;
    const cleanName = raw && raw.trim() ? raw.trim() : acc.name;
    acc.name = cleanName;
    try {
      await storage.set(ACCOUNTS_KEY, JSON.stringify(accounts), false);
    } catch (e) {}
    closeRenameAccountForm();
    renderAccountSelect();
  }

  async function createAccountFromForm() {
    if (accounts.length >= MAX_FREE_ACCOUNTS) {
      closeAddAccountForm();
      openUpgradeModal();
      return;
    }
    const raw = $('account-add-input').value;
    const cleanName = raw && raw.trim() ? raw.trim() : ('Account ' + (accounts.length + 1));
    const id = genUid();
    accounts.push({ id, name: cleanName });
    try {
      await storage.set(ACCOUNTS_KEY, JSON.stringify(accounts), false);
    } catch (e) {}
    closeAddAccountForm();
    await switchAccount(id);
  }

  function openUpgradeModal() {
    $('upgrade-modal').classList.add('open');
  }

  function closeUpgradeModal() {
    $('upgrade-modal').classList.remove('open');
  }

  $('upgrade-modal-close').addEventListener('click', closeUpgradeModal);
  $('upgrade-modal').addEventListener('click', (e) => {
    if (e.target.id === 'upgrade-modal') closeUpgradeModal();
  });

  $('upgrade-modal-close').addEventListener('mouseenter', () => {
    const icon = $('upgrade-modal-icon');
    icon.textContent = '🔓';
    icon.classList.remove('unlocking');
    void icon.offsetWidth; 
    icon.classList.add('unlocking');
  });
  $('upgrade-modal-close').addEventListener('mouseleave', () => {
    const icon = $('upgrade-modal-icon');
    icon.textContent = '🔒';
    icon.classList.remove('unlocking');
  });

  function getTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }
  function applyThemeIcon(theme) {
    $('theme-toggle-icon').textContent = theme === 'light' ? '☀' : '☾';
    $('theme-toggle').setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
  }
  applyThemeIcon(getTheme());
  $('theme-toggle').addEventListener('click', () => {
    const next = getTheme() === 'light' ? 'dark' : 'light';
    if (next === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    try { localStorage.setItem('tradeJournal:theme', next); } catch (e) {}
    applyThemeIcon(next);
  });

  $('account-add-btn').addEventListener('click', () => {
    if (accounts.length >= MAX_FREE_ACCOUNTS) {
      openUpgradeModal();
      return;
    }
    if ($('account-add-row').dataset.open === 'true') {
      closeAddAccountForm();
    } else {
      openAddAccountForm();
    }
  });

  $('account-add-cancel').addEventListener('click', closeAddAccountForm);
  $('account-add-confirm').addEventListener('click', () => {
    if (accounts.length >= MAX_FREE_ACCOUNTS) {
      closeAddAccountForm();
      openUpgradeModal();
      return;
    }
    createAccountFromForm();
  });
  $('account-add-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (accounts.length >= MAX_FREE_ACCOUNTS) {
        closeAddAccountForm();
        openUpgradeModal();
        return;
      }
      createAccountFromForm();
    }
    else if (e.key === 'Escape') { e.preventDefault(); closeAddAccountForm(); }
  });

  $('account-rename-btn').addEventListener('click', () => {
    if ($('account-rename-row').dataset.open === 'true') {
      closeRenameAccountForm();
    } else {
      openRenameAccountForm();
    }
  });

  $('account-rename-cancel').addEventListener('click', closeRenameAccountForm);
  $('account-rename-confirm').addEventListener('click', saveRenameFromForm);
  $('account-rename-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); saveRenameFromForm(); }
    else if (e.key === 'Escape') { e.preventDefault(); closeRenameAccountForm(); }
  });

  $('account-del-btn').addEventListener('click', async () => {
    if (accounts.length <= 1) return;
    closeAddAccountForm();
    closeRenameAccountForm();
    if (!deleteArmed) {
      deleteArmed = true;
      const btn = $('account-del-btn');
      btn.textContent = 'Confirm ✕';
      btn.classList.add('account-btn-danger');
      clearTimeout(deleteArmTimeout);
      deleteArmTimeout = setTimeout(disarmDelete, 4000);
      return;
    }
    disarmDelete();
    try {
      await storage.delete(tradesKeyFor(currentAccountId), false);
      await storage.delete(balanceKeyFor(currentAccountId), false);
      await storage.delete(strategiesKeyFor(currentAccountId), false);
    } catch (e) {}
    accounts = accounts.filter(a => a.id !== currentAccountId);
    try {
      await storage.set(ACCOUNTS_KEY, JSON.stringify(accounts), false);
    } catch (e) {}
    await switchAccount(accounts[0].id);
  });

  // ---------- Storage ----------
  async function loadTrades() {
    try {
      const res = await storage.get(STORAGE_KEY(), false);
      trades = res && res.value ? JSON.parse(res.value) : [];
    } catch (e) {
      trades = [];
    }
    render();
  }

  async function saveTrades() {
    try {
      const result = await storage.set(STORAGE_KEY(), JSON.stringify(trades), false);
      if (!result) setStatus('Save failed — try again', true);
    } catch (e) {
      setStatus('Save error: ' + e.message, true);
    }
  }

  // ---------- Starting balance ----------
  async function loadBalance() {
    try {
      const res = await storage.get(BALANCE_KEY(), false);
      startingBalance = res && res.value ? parseFloat(res.value) : 0;
    } catch (e) {
      startingBalance = 0;
    }
    if (startingBalance) $('f-balance').value = startingBalance;
    render();
  }

  async function saveBalance() {
    const val = parseFloat($('f-balance').value);
    startingBalance = isNaN(val) ? 0 : val;
    try {
      const result = await storage.set(BALANCE_KEY(), JSON.stringify(startingBalance), false);
      if (!result) { setStatus('Balance save failed', true); return; }
      setStatus('Balance saved ✓', false);
      render();
    } catch (e) {
      setStatus('Balance save error: ' + e.message, true);
    }
  }

  $('balance-save').addEventListener('click', saveBalance);

  // ---------- Strategies / Setups ----------
  function genUid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  let selectedConfluences = [];
  let questionAnswers = {};
  const MINDSET_OPTIONS = ['FOMO', 'Revenge Trade', 'Oversized', 'Hesitation', 'Overtrading', 'Chasing Price', 'Moved Stop', 'Broke Plan', 'Disciplined'];
  let selectedMindsetTags = [];

  function renderMindsetPicker() {
    const list = $('mindset-pick-list');
    function chipStyle(c, active) {
      if (!active) return '';
      const cs = mindsetColor();
      return `background:${cs.bg};color:${cs.color};border-color:${cs.border};`;
    }
    list.innerHTML = MINDSET_OPTIONS.map(c => `
      <button type="button" class="confluence-pick-chip" data-active="${selectedMindsetTags.includes(c)}" data-mindset="${escapeHtml(c)}" style="${chipStyle(c, selectedMindsetTags.includes(c))}">${escapeHtml(c)}</button>
    `).join('');
    list.querySelectorAll('.confluence-pick-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const c = btn.dataset.mindset;
        if (selectedMindsetTags.includes(c)) {
          selectedMindsetTags = selectedMindsetTags.filter(x => x !== c);
        } else {
          selectedMindsetTags.push(c);
        }
        const isActive = selectedMindsetTags.includes(c);
        btn.setAttribute('data-active', isActive);
        btn.setAttribute('style', chipStyle(c, isActive));
      });
    });
  }

  async function loadStrategies() {
    try {
      const res = await storage.get(STRATEGY_KEY(), false);
      const raw = res && res.value ? JSON.parse(res.value) : [];
      let migrated = false;
      strategies = raw.map(s => {
        if (typeof s === 'string') {
          migrated = true;
          return { id: genUid(), name: s, description: '', confluences: [], questions: [] };
        }
        return {
          id: s.id || genUid(),
          name: s.name || '',
          description: s.description || '',
          confluences: Array.isArray(s.confluences) ? s.confluences : [],
          questions: Array.isArray(s.questions)
            ? s.questions.map(q => typeof q === 'string' ? { id: genUid(), text: q } : { id: q.id || genUid(), text: q.text || '' })
            : []
        };
      });
      if (migrated) await saveStrategies();
    } catch (e) {
      strategies = [];
    }
    renderStrategyList();
    updateStrategySelect();
  }

  async function saveStrategies() {
    try {
      const result = await storage.set(STRATEGY_KEY(), JSON.stringify(strategies), false);
      if (!result) setStatus('Strategy save failed', true);
    } catch (e) {
      setStatus('Strategy save error: ' + e.message, true);
    }
  }

  function updateStrategySelect() {
    const sel = $('f-tag');
    const prevVal = sel.value;
    sel.innerHTML = '<option value="">Select a setup / strategy...</option>' +
      strategies.map(s => `<option value="${escapeHtml(s.name)}">${escapeHtml(s.name)}</option>`).join('');
    sel.value = strategies.some(s => s.name === prevVal) ? prevVal : '';
    renderConfluencePicker();
    renderQuestionChecklist();
  }

  function renderConfluencePicker() {
    const field = $('confluence-field');
    const list = $('confluence-pick-list');
    const strat = strategies.find(s => s.name === $('f-tag').value);
    if (!strat || strat.confluences.length === 0) {
      field.style.display = 'none';
      list.innerHTML = '';
      selectedConfluences = [];
      return;
    }
    field.style.display = '';
    selectedConfluences = selectedConfluences.filter(c => strat.confluences.includes(c));
    function chipStyle(c, active) {
      if (!active) return '';
      const cs = confluenceColor(c);
      return `background:${cs.bg};color:${cs.color};border-color:${cs.border};`;
    }
    list.innerHTML = strat.confluences.map(c => `
      <button type="button" class="confluence-pick-chip" data-active="${selectedConfluences.includes(c)}" data-confluence="${escapeHtml(c)}" style="${chipStyle(c, selectedConfluences.includes(c))}">${escapeHtml(c)}</button>
    `).join('');
    list.querySelectorAll('.confluence-pick-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const c = btn.dataset.confluence;
        if (selectedConfluences.includes(c)) {
          selectedConfluences = selectedConfluences.filter(x => x !== c);
        } else {
          selectedConfluences.push(c);
        }
        const isActive = selectedConfluences.includes(c);
        btn.setAttribute('data-active', isActive);
        btn.setAttribute('style', chipStyle(c, isActive));
      });
    });
  }

  function renderQuestionChecklist() {
    const field = $('question-field');
    const list = $('question-list');
    const strat = strategies.find(s => s.name === $('f-tag').value);
    if (!strat || !strat.questions || strat.questions.length === 0) {
      field.style.display = 'none';
      list.innerHTML = '';
      questionAnswers = {};
      return;
    }
    field.style.display = '';
    const validIds = strat.questions.map(q => q.id);
    Object.keys(questionAnswers).forEach(id => { if (!validIds.includes(id)) delete questionAnswers[id]; });

    list.innerHTML = strat.questions.map(q => `
      <div class="question-row" data-question-id="${q.id}">
        <span class="question-text">${escapeHtml(q.text)}</span>
        <div class="result-toggle question-yn">
          <button type="button" class="result-btn question-yes-btn" data-qid="${q.id}" data-answer="yes" data-active="${questionAnswers[q.id] === 'yes'}">Yes</button>
          <button type="button" class="result-btn question-no-btn" data-qid="${q.id}" data-answer="no" data-active="${questionAnswers[q.id] === 'no'}">No</button>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('.question-yes-btn, .question-no-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const qid = btn.dataset.qid;
        questionAnswers[qid] = btn.dataset.answer;
        list.querySelectorAll(`[data-qid="${qid}"]`).forEach(b => b.removeAttribute('data-active'));
        btn.setAttribute('data-active', 'true');
      });
    });
  }

  $('f-tag').addEventListener('change', () => {
    selectedConfluences = [];
    questionAnswers = {};
    renderConfluencePicker();
    renderQuestionChecklist();
  });

  // ---------- Strategy tab: CRUD ----------
  $('strat-submit').addEventListener('click', async () => {
    const nameInput = $('f-strat-name');
    const descInput = $('f-strat-desc');
    const name = nameInput.value.trim();
    if (!name) {
      const el = $('strat-status');
      el.textContent = 'Enter a strategy name';
      el.className = 'status-msg error';
      setTimeout(() => { if (el.textContent === 'Enter a strategy name') el.textContent = ''; }, 3000);
      return;
    }
    if (strategies.some(s => s.name.toLowerCase() === name.toLowerCase())) {
      const el = $('strat-status');
      el.textContent = 'That strategy already exists';
      el.className = 'status-msg error';
      setTimeout(() => { if (el.textContent === 'That strategy already exists') el.textContent = ''; }, 3000);
      return;
    }
    strategies.push({ id: genUid(), name, description: descInput.value.trim(), confluences: [], questions: [] });
    await saveStrategies();
    nameInput.value = '';
    descInput.value = '';
    renderStrategyList();
    updateStrategySelect();
    const el = $('strat-status');
    el.textContent = 'Strategy added ✓';
    el.className = 'status-msg';
    setTimeout(() => { if (el.textContent === 'Strategy added ✓') el.textContent = ''; }, 3000);
  });
  $('f-strat-name').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); $('strat-submit').click(); }
  });

  function renderStrategyList() {
    const holder = $('strategy-list');
    if (strategies.length === 0) {
      holder.innerHTML = '<div class="empty-state">No strategies added yet — add one above.</div>';
      return;
    }
    holder.innerHTML = strategies.map(s => `
      <div class="strategy-card" data-id="${s.id}">
        <div class="strategy-card-head">
          <span class="strategy-card-name">${escapeHtml(s.name)}</span>
          <button type="button" class="trade-del" data-del-strategy="${s.id}" title="Delete strategy">✕</button>
        </div>
        <textarea class="strategy-desc-edit" data-desc-id="${s.id}" placeholder="Describe the setup, entry/exit rules, timeframes, risk model...">${escapeHtml(s.description || '')}</textarea>
        <p class="strategy-subtitle">Confluences</p>
        <div class="strategy-add-row">
          <input type="text" class="confluence-input" data-add-id="${s.id}" placeholder="e.g. Above VWAP, liquidity sweep, HTF trend..." />
          <button type="button" class="balance-save-btn confluence-add-btn" data-add-id="${s.id}">Add</button>
        </div>
        <div class="strategy-chip-list" data-conf-list="${s.id}">
          ${s.confluences.length === 0
            ? '<div class="empty-state" style="padding:6px 0;">No confluences added yet.</div>'
            : s.confluences.map(c => { const cs = confluenceColor(c); return `<span class="strategy-chip" style="background:${cs.bg};color:${cs.color};border-color:${cs.border};">${escapeHtml(c)}<button type="button" class="strategy-chip-remove" data-strat-id="${s.id}" data-confluence="${escapeHtml(c)}" title="Remove">✕</button></span>`; }).join('')}
        </div>
        <p class="strategy-subtitle" style="margin-top:14px;">Questions — Yes/No, required before logging a trade with this strategy</p>
        <div class="strategy-add-row">
          <input type="text" class="question-input" data-add-id="${s.id}" placeholder="e.g. Did price sweep liquidity first?" />
          <button type="button" class="balance-save-btn question-add-btn" data-add-id="${s.id}">Add</button>
        </div>
        <div data-q-list="${s.id}">
          ${s.questions.length === 0
            ? '<div class="empty-state" style="padding:6px 0;">No questions added yet.</div>'
            : s.questions.map(q => `<div class="strategy-question-row"><input type="text" class="strategy-question-text" data-strat-id="${s.id}" data-question-id="${q.id}" value="${escapeHtml(q.text).replace(/"/g, '&quot;')}" maxlength="200" readonly /><button type="button" class="strategy-icon-btn strategy-question-edit-btn" data-strat-id="${s.id}" data-question-id="${q.id}" title="Edit">✎</button><button type="button" class="strategy-chip-remove" data-strat-id="${s.id}" data-question-id="${q.id}" title="Remove">✕</button></div>`).join('')}
        </div>
      </div>
    `).join('');

    holder.querySelectorAll('[data-del-strategy]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this strategy and its confluences? Trades already logged with it keep their history.')) return;
        strategies = strategies.filter(s => s.id !== btn.dataset.delStrategy);
        await saveStrategies();
        renderStrategyList();
        updateStrategySelect();
      });
    });

    holder.querySelectorAll('.strategy-desc-edit').forEach(ta => {
      ta.addEventListener('change', async () => {
        const strat = strategies.find(s => s.id === ta.dataset.descId);
        if (!strat) return;
        strat.description = ta.value.trim();
        await saveStrategies();
      });
    });

    holder.querySelectorAll('.confluence-add-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const input = holder.querySelector(`.confluence-input[data-add-id="${btn.dataset.addId}"]`);
        const val = input.value.trim();
        if (!val) return;
        const strat = strategies.find(s => s.id === btn.dataset.addId);
        if (!strat) return;
        if (strat.confluences.some(c => c.toLowerCase() === val.toLowerCase())) { input.value = ''; return; }
        strat.confluences.push(val);
        await saveStrategies();
        renderStrategyList();
        updateStrategySelect();
      });
    });
    holder.querySelectorAll('.confluence-input').forEach(input => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          holder.querySelector(`.confluence-add-btn[data-add-id="${input.dataset.addId}"]`).click();
        }
      });
    });

    holder.querySelectorAll('.strategy-chip-remove').forEach(btn => {
      btn.addEventListener('click', async () => {
        const strat = strategies.find(s => s.id === btn.dataset.stratId);
        if (!strat) return;
        if (btn.dataset.questionId) {
          strat.questions = strat.questions.filter(q => q.id !== btn.dataset.questionId);
        } else {
          strat.confluences = strat.confluences.filter(c => c !== btn.dataset.confluence);
        }
        await saveStrategies();
        renderStrategyList();
        updateStrategySelect();
      });
    });

    holder.querySelectorAll('.strategy-question-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = holder.querySelector(`input.strategy-question-text[data-question-id="${btn.dataset.questionId}"]`);
        if (!input) return;
        input.removeAttribute('readonly');
        input.focus();
        input.select();
      });
    });

    holder.querySelectorAll('input.strategy-question-text').forEach(input => {
      const commitEdit = async () => {
        const strat = strategies.find(s => s.id === input.dataset.stratId);
        if (!strat) return;
        const q = strat.questions.find(q => q.id === input.dataset.questionId);
        if (!q) return;
        const val = input.value.trim();
        if (!val) { input.value = q.text; return; } 
        if (val === q.text) return;
        if (strat.questions.some(other => other.id !== q.id && other.text.toLowerCase() === val.toLowerCase())) {
          input.value = q.text;
          return;
        }
        q.text = val;
        await saveStrategies();
        renderQuestionChecklist();
      };
      input.addEventListener('blur', async () => {
        await commitEdit();
        input.setAttribute('readonly', '');
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
        else if (e.key === 'Escape') {
          const strat = strategies.find(s => s.id === input.dataset.stratId);
          const q = strat && strat.questions.find(q => q.id === input.dataset.questionId);
          if (q) input.value = q.text;
          input.blur();
        }
      });
    });

    holder.querySelectorAll('.question-add-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const input = holder.querySelector(`.question-input[data-add-id="${btn.dataset.addId}"]`);
        const val = input.value.trim();
        if (!val) return;
        const strat = strategies.find(s => s.id === btn.dataset.addId);
        if (!strat) return;
        if (strat.questions.some(q => q.text.toLowerCase() === val.toLowerCase())) { input.value = ''; return; }
        strat.questions.push({ id: genUid(), text: val });
        await saveStrategies();
        renderStrategyList();
        updateStrategySelect();
      });
    });
    holder.querySelectorAll('.question-input').forEach(input => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          holder.querySelector(`.question-add-btn[data-add-id="${input.dataset.addId}"]`).click();
        }
      });
    });
  }

  // ---------- Timeframe screenshot slots ----------
  function renderShotSlots() {
    const holder = $('shot-grid');
    holder.innerHTML = shotSlots.map(slot => {
      const usedElsewhere = shotSlots.filter(s => s.uid !== slot.uid).map(s => s.tf).filter(Boolean);
      return `
      <div class="shot-field" data-uid="${slot.uid}">
        <button type="button" class="shot-remove-btn" data-uid="${slot.uid}" title="Remove">✕</button>
        <select class="shot-tf-select" data-uid="${slot.uid}">
          <option value="">Timeframe…</option>
          ${TIMEFRAME_OPTIONS.map(tf => `<option value="${tf}" ${slot.tf === tf ? 'selected' : ''} ${usedElsewhere.includes(tf) ? 'disabled' : ''}>${tf}${usedElsewhere.includes(tf) ? ' (used)' : ''}</option>`).join('')}
        </select>
        <label class="file-btn" data-uid="${slot.uid}">${slot.dataUrl ? 'Change image' : 'Choose image'}</label>
        <input type="file" class="shot-file-input" data-uid="${slot.uid}" accept="image/*" style="display:none;" />
        ${slot.dataUrl ? `<img class="file-preview" src="${slot.dataUrl}" />` : ''}
      </div>
    `;
    }).join('');

    const addBtn = $('add-shot-btn');
    addBtn.disabled = shotSlots.length >= MAX_SHOTS;
    addBtn.textContent = shotSlots.length >= MAX_SHOTS ? 'Max 5 screenshots' : '+ Add Screenshot';

    holder.querySelectorAll('.file-btn[data-uid]').forEach(label => {
      label.addEventListener('click', () => {
        holder.querySelector(`.shot-file-input[data-uid="${label.dataset.uid}"]`).click();
      });
    });
  }

  $('add-shot-btn').addEventListener('click', () => {
    if (shotSlots.length >= MAX_SHOTS) return;
    shotSlots.push({ uid: genUid(), tf: '', dataUrl: null });
    renderShotSlots();
  });

  $('shot-grid').addEventListener('change', (e) => {
    const uid = e.target.dataset.uid;
    if (!uid) return;
    const slot = shotSlots.find(s => s.uid === uid);
    if (!slot) return;

    if (e.target.classList.contains('shot-tf-select')) {
      const newTf = e.target.value;
      const duplicate = newTf && shotSlots.some(s => s.uid !== uid && s.tf === newTf);
      if (duplicate) {
        setStatus('That timeframe is already used on another screenshot', true);
        renderShotSlots();
        return;
      }
      slot.tf = newTf;
      renderShotSlots();
      return;
    }
    if (e.target.classList.contains('shot-file-input')) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const maxW = 900;
          const scale = Math.min(1, maxW / img.width);
          const canvas = document.createElement('canvas');
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          slot.dataUrl = canvas.toDataURL('image/jpeg', 0.72);
          renderShotSlots();
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  $('shot-grid').addEventListener('click', (e) => {
    if (e.target.classList.contains('shot-remove-btn')) {
      shotSlots = shotSlots.filter(s => s.uid !== e.target.dataset.uid);
      renderShotSlots();
    }
  });

  renderShotSlots();
  renderMindsetPicker();

  // ---------- Instrument toggle ----------
  document.querySelectorAll('.instrument-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedInstrument = btn.dataset.instrument;
      document.querySelectorAll('.instrument-btn').forEach(b => {
        b.removeAttribute('data-active');
        b.style.background = '';
        b.style.color = '';
        b.style.borderColor = '';
      });
      const s = INSTRUMENT_STYLES[selectedInstrument];
      btn.setAttribute('data-active', 'true');
      btn.style.background = s.bg;
      btn.style.color = s.color;
      btn.style.borderColor = s.border;
    });
  });

  // ---------- Direction toggle ----------
  document.querySelectorAll('.direction-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedDirection = btn.dataset.direction;
      document.querySelectorAll('.direction-btn').forEach(b => {
        b.removeAttribute('data-active');
        b.style.background = '';
        b.style.color = '';
        b.style.borderColor = '';
      });
      const s = DIRECTION_STYLES[selectedDirection];
      btn.setAttribute('data-active', 'true');
      btn.style.background = s.bg;
      btn.style.color = s.color;
      btn.style.borderColor = s.border;
    });
  });

  // ---------- Session toggle (optional, click again to deselect) ----------
  document.querySelectorAll('.session-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const isDeselect = selectedSession === btn.dataset.session;
      document.querySelectorAll('.session-btn').forEach(b => {
        b.removeAttribute('data-active');
        b.style.background = '';
        b.style.color = '';
        b.style.borderColor = '';
      });
      if (isDeselect) {
        selectedSession = null;
      } else {
        selectedSession = btn.dataset.session;
        const s = SESSION_STYLES[selectedSession];
        btn.setAttribute('data-active', 'true');
        btn.style.background = s.bg;
        btn.style.color = s.color;
        btn.style.borderColor = s.border;
      }
    });
  });

  // ---------- Result toggle ----------
  document.querySelectorAll('.result-btn:not(.instrument-btn):not(.session-btn)').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedResult = btn.dataset.result;
      document.querySelectorAll('.result-btn').forEach(b => b.removeAttribute('data-active'));
      btn.setAttribute('data-active', 'true');
      const pnlInput = $('f-pnl');
      const pnlLabel = $('pnl-label');
      if (selectedResult === 'be') {
        pnlInput.value = '0';
        pnlInput.disabled = true;
        pnlLabel.textContent = 'P&L Amount ($) — locked at 0';
      } else {
        pnlInput.disabled = false;
        pnlInput.value = '';
        pnlLabel.textContent = selectedResult === 'win' ? 'Amount Won ($)' : selectedResult === 'loss' ? 'Amount Lost ($)' : 'P&L Amount ($)';
      }
    });
  });

  // ---------- Grade toggle ----------
  document.querySelectorAll('.grade-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const isDeselect = selectedGrade === btn.dataset.grade;
      document.querySelectorAll('.grade-btn').forEach(b => {
        b.removeAttribute('data-active');
        b.style.background = '';
        b.style.color = '';
        b.style.borderColor = '';
      });
      if (isDeselect) {
        selectedGrade = null;
      } else {
        selectedGrade = btn.dataset.grade;
        const s = GRADE_STYLES[selectedGrade];
        btn.setAttribute('data-active', 'true');
        btn.style.background = s.bg;
        btn.style.color = s.color;
        btn.style.borderColor = s.border;
      }
    });
  });

  // ---------- Submit ----------
  $('f-submit').addEventListener('click', async () => {
    const date = $('f-date').value || todayStr();
    const notes = $('f-notes').value.trim();
    const pnlRaw = parseFloat($('f-pnl').value);
    const tag = $('f-tag').value;
    const riskRaw = parseFloat($('f-risk').value);
    const entryTimeRaw = $('f-entry-time').value;
    const exitTimeRaw = $('f-exit-time').value;

    if (!selectedInstrument) { setStatus('Pick an instrument', true); return; }
    if (!selectedDirection) { setStatus('Pick Long or Short', true); return; }
    if (!selectedSession) { setStatus('Pick a session', true); return; }
    if (!entryTimeRaw) { setStatus('Enter an entry time', true); return; }
    if (!exitTimeRaw) { setStatus('Enter an exit time', true); return; }
    if (!selectedResult) { setStatus('Pick Win, Loss, or Break Even', true); return; }
    if (selectedResult !== 'be' && (isNaN(pnlRaw) || pnlRaw < 0)) { setStatus('Enter a valid amount', true); return; }
    if (isNaN(riskRaw) || riskRaw <= 0) { setStatus('Enter a valid risk amount', true); return; }
    if (!tag) { setStatus('Pick a setup / strategy', true); return; }
    
    const stratForTag = tag ? strategies.find(s => s.name === tag) : null;
    if (stratForTag && stratForTag.questions && stratForTag.questions.length) {
      const unanswered = stratForTag.questions.some(q => !questionAnswers[q.id]);
      if (unanswered) { setStatus('Answer every Yes/No question for this strategy', true); return; }
    }
    if (!selectedGrade) { setStatus('Pick a grade', true); return; }
    if (!notes) { setStatus('Add a note for this trade', true); return; }
    
    const incompleteShot = shotSlots.some(s => (s.tf && !s.dataUrl) || (!s.tf && s.dataUrl));
    if (incompleteShot) { setStatus('Each screenshot needs both a timeframe and an image', true); return; }

    // Calculate P&L
    let pnl = 0;
    if (selectedResult === 'win') pnl = Math.abs(pnlRaw);
    if (selectedResult === 'loss') pnl = -Math.abs(pnlRaw);

    // RR is derived automatically from the planned risk amount and actual P&L
    const rr = pnl / riskRaw;

    const entryTime = roundTo10Min(entryTimeRaw);
    const exitTime = roundTo10Min(exitTimeRaw);

    const screenshots = shotSlots.filter(s => s.tf && s.dataUrl).map(s => ({ tf: s.tf, src: s.dataUrl }));
    const questionsAnswered = stratForTag && stratForTag.questions && stratForTag.questions.length
      ? stratForTag.questions.map(q => ({ text: q.text, answer: questionAnswers[q.id] }))
      : null;

    const trade = {
      id: editingTradeId || (Date.now().toString(36) + Math.random().toString(36).slice(2, 7)),
      date, 
      instrument: selectedInstrument, 
      direction: selectedDirection,
      session: selectedSession, 
      result: selectedResult, 
      pnl: pnl,
      notes, 
      grade: selectedGrade,
      tag: tag || null,
      confluences: tag && selectedConfluences.length ? selectedConfluences.slice() : null,
      mindsetTags: selectedMindsetTags.length ? selectedMindsetTags.slice() : null,
      questionsAnswered,
      riskAmount: riskRaw,
      rr,
      entryTime,
      exitTime,
      screenshots: screenshots.length ? screenshots : null
    };

    const wasEditing = !!editingTradeId;
    if (wasEditing) {
      const idx = trades.findIndex(x => x.id === editingTradeId);
      if (idx !== -1) trades[idx] = trade; else trades.push(trade);
    } else {
      trades.push(trade);
    }
    await saveTrades();
    render();

    resetForm();
    setStatus(wasEditing ? 'Trade updated ✓' : 'Trade added ✓', false);
  });

  function resetForm() {
    editingTradeId = null;
    $('f-notes').value = '';
    $('f-pnl').value = '';
    $('f-tag').value = '';
    $('f-risk').value = '';
    $('f-entry-time').value = '';
    $('f-exit-time').value = '';
    selectedConfluences = [];
    renderConfluencePicker();
    questionAnswers = {};
    renderQuestionChecklist();
    selectedMindsetTags = [];
    renderMindsetPicker();
    $('f-pnl').disabled = false;
    $('pnl-label').textContent = 'P&L Amount ($)';
    shotSlots = [];
    renderShotSlots();
    selectedResult = null;
    selectedInstrument = null;
    selectedSession = null;
    selectedGrade = null;
    selectedDirection = null;
    document.querySelectorAll('.result-btn').forEach(b => b.removeAttribute('data-active'));
    document.querySelectorAll('.instrument-btn').forEach(b => {
      b.removeAttribute('data-active'); b.style.background = ''; b.style.color = ''; b.style.borderColor = '';
    });
    document.querySelectorAll('.direction-btn').forEach(b => {
      b.removeAttribute('data-active'); b.style.background = ''; b.style.color = ''; b.style.borderColor = '';
    });
    document.querySelectorAll('.session-btn').forEach(b => {
      b.removeAttribute('data-active'); b.style.background = ''; b.style.color = ''; b.style.borderColor = '';
    });
    document.querySelectorAll('.grade-btn').forEach(b => {
      b.removeAttribute('data-active'); b.style.background = ''; b.style.color = ''; b.style.borderColor = '';
    });
    $('f-submit').textContent = 'Add Trade';
    $('cancel-edit-btn').style.display = 'none';
    $('f-date').value = todayStr();
  }

  $('cancel-edit-btn').addEventListener('click', () => {
    resetForm();
    setStatus('Edit cancelled', false);
  });



  // ---------- Delete / clear ----------
  async function deleteTrade(id) {
    if (id === editingTradeId) resetForm();
    trades = trades.filter(t => t.id !== id);
    await saveTrades();
    render();
  }

  function editTrade(id) {
    const t = trades.find(x => x.id === id);
    if (!t) return;

    resetForm();
    editingTradeId = id;

    document.querySelector('.tab-btn[data-tab="journal"]').click();

    $('f-date').value = t.date;
    const instBtn = document.querySelector(`.instrument-btn[data-instrument="${t.instrument}"]`);
    if (instBtn) instBtn.click();
    const dirBtn = document.querySelector(`.direction-btn[data-direction="${t.direction}"]`);
    if (dirBtn) dirBtn.click();
    const sessBtn = document.querySelector(`.session-btn[data-session="${t.session}"]`);
    if (sessBtn) sessBtn.click();
    const resultBtn = document.querySelector(`.result-btn[data-result="${t.result}"]`);
    if (resultBtn) resultBtn.click();
    if (t.result !== 'be') $('f-pnl').value = Math.abs(t.pnl);
    $('f-risk').value = t.riskAmount || '';
    $('f-entry-time').value = t.entryTime || '';
    $('f-exit-time').value = t.exitTime || '';

    if (t.tag) {
      $('f-tag').value = t.tag;
      $('f-tag').dispatchEvent(new Event('change'));
      selectedConfluences = t.confluences ? t.confluences.slice() : [];
      renderConfluencePicker();
      const strat = strategies.find(s => s.name === t.tag);
      questionAnswers = {};
      if (strat && strat.questions && t.questionsAnswered) {
        strat.questions.forEach(q => {
          const ans = t.questionsAnswered.find(qa => qa.text === q.text);
          if (ans) questionAnswers[q.id] = ans.answer;
        });
      }
      renderQuestionChecklist();
    }

    const gradeBtn = document.querySelector(`.grade-btn[data-grade="${t.grade}"]`);
    if (gradeBtn) gradeBtn.click();

    selectedMindsetTags = t.mindsetTags ? t.mindsetTags.slice() : [];
    renderMindsetPicker();

    shotSlots = (t.screenshots || []).map(s => ({ uid: genUid(), tf: s.tf, dataUrl: s.src }));
    renderShotSlots();

    $('f-notes').value = t.notes || '';

    $('f-submit').textContent = 'Update Trade';
    $('cancel-edit-btn').style.display = '';
    setStatus('Editing trade — make your changes and click Update Trade', false);
    $('trade-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  $('clear-all').addEventListener('click', async () => {
    if (!confirm('Delete all logged trades? This cannot be undone.')) return;
    trades = [];
    await saveTrades();
    render();
  });

  $('tag-filter').addEventListener('change', () => {
    selectedTagFilter = $('tag-filter').value;
    renderList();
  });

  let searchDebounceTimer = null;
  $('trade-search').addEventListener('input', () => {
    const box = $('trade-search').closest('.search-box');
    box.classList.toggle('has-value', $('trade-search').value.length > 0);
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      searchQuery = $('trade-search').value;
      renderList();
    }, 150);
  });

  $('search-clear').addEventListener('click', () => {
    $('trade-search').value = '';
    $('trade-search').closest('.search-box').classList.remove('has-value');
    searchQuery = '';
    renderList();
  });

  $('filter-date-from').addEventListener('change', () => {
    filterDateFrom = $('filter-date-from').value || null;
    renderList();
  });

  $('filter-date-to').addEventListener('change', () => {
    filterDateTo = $('filter-date-to').value || null;
    renderList();
  });

  $('clear-filters').addEventListener('click', () => {
    selectedTagFilter = 'all';
    searchQuery = '';
    filterDateFrom = null;
    filterDateTo = null;
    $('tag-filter').value = 'all';
    $('trade-search').value = '';
    $('trade-search').closest('.search-box').classList.remove('has-value');
    $('filter-date-from').value = '';
    $('filter-date-to').value = '';
    renderList();
  });

  // ---------- Lightbox ----------
  $('lightbox').addEventListener('click', () => $('lightbox').classList.remove('open'));
  function openLightbox(src) {
    $('lightbox-img').src = src;
    $('lightbox').classList.add('open');
  }

  // ---------- Day detail modal ----------
  function openDayModal(dateKey) {
    const dayTrades = trades.filter(t => t.date === dateKey).sort((a, b) => (a.id > b.id ? 1 : -1));
    if (dayTrades.length === 0) return;

    const label = new Date(dateKey + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    $('day-modal-title').textContent = label;

    const dayTotal = dayTrades.reduce((s, t) => s + t.pnl, 0);
    const wins = dayTrades.filter(t => t.result === 'win').length;
    const losses = dayTrades.filter(t => t.result === 'loss').length;
    const bes = dayTrades.filter(t => t.result === 'be').length;
    $('day-modal-summary').textContent = `${dayTrades.length} trade${dayTrades.length > 1 ? 's' : ''} · ${fmtMoney(dayTotal)} · ${wins}W / ${losses}L${bes ? ' / ' + bes + ' BE' : ''}`;

    $('day-modal-trades').innerHTML = dayTrades.map(t => {
      const pnlCls = t.pnl > 0 ? 'pos' : t.pnl < 0 ? 'neg' : 'neutral';
      const resultLabel = t.result === 'win' ? 'Win' : t.result === 'loss' ? 'Loss' : 'Break Even';
      const confluencesHtml = (t.confluences && t.confluences.length)
        ? t.confluences.map(c => { const cs = confluenceColor(c); return `<span class="tag-badge" style="border-color:${cs.border};color:${cs.color};background:${cs.bg};">${escapeHtml(c)}</span>`; }).join('')
        : null;
      return `
        <div class="day-trade-card" data-result="${t.result}">
          <div class="day-trade-head">
            <span class="day-trade-pnl ${pnlCls}">${fmtMoney(t.pnl)}</span>
          </div>
          <div class="day-trade-details">
            <div class="dtd-row"><span class="dtd-label">Session</span><span class="dtd-value">${sessionBadge(t.session)}</span></div>
            <div class="dtd-row"><span class="dtd-label">Instrument</span><span class="dtd-value">${instrumentBadge(t.instrument)}</span></div>
            <div class="dtd-row"><span class="dtd-label">Direction</span><span class="dtd-value">${directionBadge(t.direction)}</span></div>
            <div class="dtd-row"><span class="dtd-label">Outcome</span><span class="dtd-value"><span class="day-trade-result" data-result="${t.result}">${resultLabel}</span></span></div>
            <div class="dtd-row"><span class="dtd-label">Risk to Reward</span><span class="dtd-value">${rBadge(t.rr)}</span></div>
            <div class="dtd-row"><span class="dtd-label">Grade</span><span class="dtd-value">${gradeBadge(t.grade)}</span></div>
            ${t.tag ? `<div class="dtd-row"><span class="dtd-label">Strategy</span><span class="dtd-value">${tagBadge(t.tag)}</span></div>` : ''}
            ${confluencesHtml ? `<div class="dtd-row"><span class="dtd-label">Confluences</span><span class="dtd-value">${confluencesHtml}</span></div>` : ''}
          </div>
          ${t.notes ? `<div class="trade-notes">${escapeHtml(t.notes)}</div>` : ''}
          ${renderQuestionAnswers(t)}
          ${renderShots(t)}
        </div>
      `;
    }).join('');

    $('day-modal-trades').querySelectorAll('[data-shot]').forEach(el => {
      el.addEventListener('click', () => openLightbox(el.src));
    });

    $('day-modal').classList.add('open');
  }

  $('day-modal-close').addEventListener('click', () => $('day-modal').classList.remove('open'));
  $('day-modal').addEventListener('click', (e) => {
    if (e.target.id === 'day-modal') $('day-modal').classList.remove('open');
  });

  // ---------- Render ----------
  function render() {
    updateTagOptions();
    renderSnapshot();
    renderRadarOverview();
    renderStats();
    renderCurve();
    renderNetPnlChart();
    renderInstrumentStats();
    renderDirectionStats();
    renderSessionStats();
    renderTagStats();
    renderList();
    renderCalendar();
    renderDayPerformance();
    renderHourPerformance();
    renderRDistribution();
    renderDurationBreakdown();
    renderPlanAdherence();
    renderGradeAccuracy();
    renderMindsetStats();
  }

  function updateTagOptions() {
    const tags = [...new Set(trades.map(t => t.tag).filter(Boolean))].sort();
    const filterSel = $('tag-filter');
    const prevVal = filterSel.value || selectedTagFilter;
    filterSel.innerHTML = '<option value="all">All Setups</option>' +
      tags.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('');
    if (tags.includes(prevVal) || prevVal === 'all') {
      filterSel.value = prevVal;
      selectedTagFilter = prevVal;
    } else {
      filterSel.value = 'all';
      selectedTagFilter = 'all';
    }
  }

  function statSizeClass(value) {
    const len = String(value).length;
    if (len > 10) return 'size-sm';
    if (len > 7) return 'size-md';
    return '';
  }

  function radarInfoIcon(cx, cy, tipLines, warn) {
    // Small "i" info glyph; hovering reveals a tooltip box positioned just outside the pentagon.
    const boxW = 150, boxH = 16 + tipLines.length * 12;
    const boxX = cx - boxW / 2;
    const boxY = cy - boxH / 2;
    const textSvg = tipLines.map((line, i) => `<text class="radar-tip-text" x="${cx}" y="${boxY + 14 + i * 12}" text-anchor="middle">${escapeHtml(line)}</text>`).join('');
    return `
      <g class="radar-tip-group">
        <rect class="radar-tip-box${warn ? ' warn' : ''}" x="${boxX.toFixed(1)}" y="${boxY.toFixed(1)}" width="${boxW}" height="${boxH}" rx="6"></rect>
        ${textSvg}
      </g>
    `;
  }

  function renderRadarOverview() {
    const holder = $('radar-holder');
    const subtitleEl = $('radar-account-subtitle');
    const acc = accounts.find(a => a.id === currentAccountId);
    subtitleEl.textContent = (acc ? acc.name : 'Account') + ' · Current Snapshot';

    if (!trades.length) {
      holder.innerHTML = '<div class="empty-state">Log trades to see your performance overview</div>';
      return;
    }

    const wins = trades.filter(t => t.result === 'win');
    const losses = trades.filter(t => t.result === 'loss');
    const decided = wins.length + losses.length;

    // Win Rate
    const winRatePct = decided ? (wins.length / decided) * 100 : 0;

    // Profit Factor (raw, and scaled 0-100 for the chart — a PF of 2.5+ fills the axis)
    const grossWins = trades.reduce((s, t) => s + (t.pnl > 0 ? t.pnl : 0), 0);
    const grossLosses = Math.abs(trades.reduce((s, t) => s + (t.pnl < 0 ? t.pnl : 0), 0));
    const profitFactorRaw = grossLosses === 0 ? (grossWins > 0 ? grossWins : 0) : grossWins / grossLosses;
    const profitFactorPct = Math.max(0, Math.min(profitFactorRaw / 2.5 * 100, 100));

    // Consistency: how much of total gross profit came from the single best day. Lower raw ratio is better,
    // so the chart plots (100 - ratio) — meaning further out on this axis always means "more consistent".
    const dailyPnl = new Map();
    trades.forEach(t => dailyPnl.set(t.date, (dailyPnl.get(t.date) || 0) + t.pnl));
    let bestDayDate = null, bestDayPnl = -Infinity;
    dailyPnl.forEach((v, d) => { if (v > bestDayPnl) { bestDayPnl = v; bestDayDate = d; } });
    const consistencyRatioRaw = grossWins > 0 && bestDayPnl > 0 ? Math.min((bestDayPnl / grossWins) * 100, 100) : 0;
    const consistencyPct = Math.max(0, 100 - consistencyRatioRaw);

    // Risk to Reward: avg R multiple scaled 0-100 (an avg R of 3 fills the axis)
    const rrTrades = trades.filter(t => typeof t.rr === 'number' && !isNaN(t.rr));
    const avgRR = rrTrades.length ? rrTrades.reduce((s, t) => s + t.rr, 0) / rrTrades.length : null;
    const rrPct = avgRR === null ? 0 : Math.max(0, Math.min(avgRR / 3 * 100, 100));

    // Avg Win vs Avg Loss: share of the win+loss total that the average win represents
    const avgWin = wins.length ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0;
    const avgLoss = losses.length ? Math.abs(losses.reduce((s, t) => s + t.pnl, 0) / losses.length) : 0;
    const avgWinLossSum = avgWin + avgLoss;
    const avgWinLossPct = avgWinLossSum > 0 ? (avgWin / avgWinLossSum) * 100 : 0;

    const axes = [
      { label: 'Win Rate', value: winRatePct, display: winRatePct.toFixed(0) + '%', tip: ['Win Rate measures the percentage', 'of winning trades out of total trades.'] },
      { label: 'Profit Factor', value: profitFactorPct, display: profitFactorPct.toFixed(0) + '%', tip: ['Profit Factor measures the efficiency', 'of your profits compared to your losses.'] },
      { label: 'Avg Win/Loss', value: avgWinLossPct, display: avgWinLossPct.toFixed(0) + '%', tip: ['Average Win/Loss compares the average', 'amount you win vs. the average you lose.'] },
      { label: 'Risk to Reward', value: rrPct, display: rrPct.toFixed(0) + '%', tip: ['Risk to Reward reflects how well you', 'manage risk relative to potential reward.'], warn: rrPct < 50 },
      { label: 'Consistency', value: consistencyPct, display: consistencyPct.toFixed(0) + '%', tip: ['Consistency shows how well you balance', 'your best day vs. your total profits.', 'Lower raw share from one day is better.'] }
    ];

    const size = 760, cx = size / 2, cy = 340, R = 210;
    const n = axes.length;
    const angleFor = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / n;

    const gridLevels = [20, 40, 60, 80, 100];
    const gridSvg = gridLevels.map(level => {
      const pts = axes.map((_, i) => {
        const a = angleFor(i);
        const r = (level / 100) * R;
        return (cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1);
      }).join(' ');
      return `<polygon points="${pts}" fill="none" stroke="var(--border)" stroke-width="1" opacity="${level === 100 ? 0.9 : 0.5}" />`;
    }).join('');

    const spokesSvg = axes.map((_, i) => {
      const a = angleFor(i);
      const x2 = cx + R * Math.cos(a), y2 = cy + R * Math.sin(a);
      return `<line x1="${cx}" y1="${cy}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="var(--border)" stroke-width="1" opacity="0.5" />`;
    }).join('');

    const dataPts = axes.map((ax, i) => {
      const a = angleFor(i);
      const r = (Math.max(0, Math.min(ax.value, 100)) / 100) * R;
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    });
    const dataPolygon = dataPts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');

    const dotsSvg = dataPts.map(p => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="4.5" fill="var(--green)" stroke="var(--surface)" stroke-width="1.5" />`).join('');

    // Ring scale labels (20/40/60/80/100) along the vertical (top) axis
    const scaleLabelsSvg = gridLevels.map(level => {
      const r = (level / 100) * R;
      return `<text x="${(cx + 4).toFixed(1)}" y="${(cy - r + 3).toFixed(1)}" font-family="monospace" font-size="10.5" fill="var(--muted)">${level}</text>`;
    }).join('');

    // Axis labels + value + info tooltip, positioned outside the pentagon in the direction of each spoke
    const labelR = R + 68;
    const axisLabelsSvg = axes.map((ax, i) => {
      const a = angleFor(i);
      const lx = cx + labelR * Math.cos(a);
      const ly = cy + labelR * Math.sin(a);
      const anchor = Math.cos(a) > 0.3 ? 'start' : Math.cos(a) < -0.3 ? 'end' : 'middle';
      const valueColor = ax.warn ? 'var(--amber)' : 'var(--green)';
      const tipCx = lx;
      const tipCy = ly + (Math.sin(a) > 0.3 ? 40 : Math.sin(a) < -0.3 ? -34 : 38);
      return `
        <text class="radar-axis-label" x="${lx.toFixed(1)}" y="${(ly - 12).toFixed(1)}" text-anchor="${anchor}">${escapeHtml(ax.label)}</text>
        <text class="radar-axis-value" x="${lx.toFixed(1)}" y="${(ly + 6).toFixed(1)}" text-anchor="${anchor}" fill="${valueColor}">${ax.display}</text>
      `;
    }).join('');

    holder.innerHTML = `
      <svg viewBox="0 0 ${size} 680" style="width:100%; height:auto;">
        ${gridSvg}
        ${spokesSvg}
        ${scaleLabelsSvg}
        <polygon points="${dataPolygon}" fill="rgba(53,212,136,0.22)" stroke="var(--green)" stroke-width="2.5" />
        ${dotsSvg}
        ${axisLabelsSvg}
      </svg>
    `;

  }

  function renderStats() {
    const wins = trades.filter(t => t.result === 'win');
    const losses = trades.filter(t => t.result === 'loss');
    const bes = trades.filter(t => t.result === 'be');
    
    // Core structural metrics conversions
    const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
    const currentBalance = startingBalance + totalPnl;
    
    const decided = wins.length + losses.length;
    const winRate = decided ? ((wins.length / decided) * 100).toFixed(1) : '—';

    const avgWin = wins.length ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : null;
    const avgLoss = losses.length ? Math.abs(losses.reduce((s, t) => s + t.pnl, 0) / losses.length) : null;

    const rrTrades = trades.filter(t => typeof t.rr === 'number' && !isNaN(t.rr));
    const avgRR = rrTrades.length ? rrTrades.reduce((s, t) => s + t.rr, 0) / rrTrades.length : null;
    const expectancy = decided ? ((wins.length / decided) * (avgWin || 0)) - ((losses.length / decided) * (avgLoss || 0)) : null;

    // 1. Calculate Profit Factor (Wins / Abs Losses)
    const grossWins = trades.reduce((s, t) => s + (t.pnl > 0 ? t.pnl : 0), 0);
    const grossLosses = Math.abs(trades.reduce((s, t) => s + (t.pnl < 0 ? t.pnl : 0), 0));
    let profitFactor = '—';
    if (decided > 0) {
      profitFactor = grossLosses === 0 ? grossWins.toFixed(2) : (grossWins / grossLosses).toFixed(2);
    }

    // Chronological Sort for Streak/Drawdown analysis engines
    const chronoTrades = [...trades].sort((a, b) => a.date.localeCompare(b.date));

    // 2. Calculate Maximum Drawdown (MDD)
    let maxDrawdown = 0;
    let peak = startingBalance;
    let runningBalance = startingBalance;
    
    chronoTrades.forEach(t => {
      runningBalance += t.pnl;
      if (runningBalance > peak) {
        peak = runningBalance;
      }
      const currentDrawdown = peak - runningBalance;
      if (currentDrawdown > maxDrawdown) {
        maxDrawdown = currentDrawdown;
      }
    });

    // 3. Calculate Trade Streaks (Consecutive Wins AND Consecutive Losses)
    let curWinTradeStreak = 0, curLossTradeStreak = 0;
    let maxWinTradeStreak = 0, maxLossTradeStreak = 0;
    chronoTrades.forEach(t => {
      if (t.result === 'win') {
        curWinTradeStreak++;
        curLossTradeStreak = 0;
        if (curWinTradeStreak > maxWinTradeStreak) maxWinTradeStreak = curWinTradeStreak;
      } else if (t.result === 'loss') {
        curLossTradeStreak++;
        curWinTradeStreak = 0;
        if (curLossTradeStreak > maxLossTradeStreak) maxLossTradeStreak = curLossTradeStreak;
      } // Break-evens don't reset or extend either streak
    });
    const currentTradeStreak = curWinTradeStreak > 0 ? curWinTradeStreak : (curLossTradeStreak > 0 ? -curLossTradeStreak : 0);

    // 4. Calculate Day Streaks (Consecutive Winning AND Losing Days based on daily P&L)
    const dailyPnlMap = new Map();
    chronoTrades.forEach(t => {
      dailyPnlMap.set(t.date, (dailyPnlMap.get(t.date) || 0) + t.pnl);
    });
    const sortedDates = [...dailyPnlMap.keys()].sort();
    
    let curWinDayStreak = 0, curLossDayStreak = 0;
    let maxWinDayStreak = 0, maxLossDayStreak = 0;
    sortedDates.forEach(date => {
      const dayPnl = dailyPnlMap.get(date);
      if (dayPnl > 0) {
        curWinDayStreak++;
        curLossDayStreak = 0;
        if (curWinDayStreak > maxWinDayStreak) maxWinDayStreak = curWinDayStreak;
      } else if (dayPnl < 0) {
        curLossDayStreak++;
        curWinDayStreak = 0;
        if (curLossDayStreak > maxLossDayStreak) maxLossDayStreak = curLossDayStreak;
      } // Flat days don't reset or extend either streak
    });
    const currentDayStreak = curWinDayStreak > 0 ? curWinDayStreak : (curLossDayStreak > 0 ? -curLossDayStreak : 0);

    // Establish styling class properties for UI presentation
    const pfCls = profitFactor === '—' ? 'neutral' : parseFloat(profitFactor) >= 1 ? 'pos' : 'neg';
    const pfNum = profitFactor === '—' ? null : parseFloat(profitFactor);
    const winRatePctNum = decided ? (wins.length / decided) * 100 : null;
    const winRateLabel = winRatePctNum === null ? '—' : winRatePctNum.toFixed(1);

    const ringSvg = buildWinRateRing(wins.length, losses.length, winRateLabel);
    const gaugeSvg = buildProfitFactorGauge(pfNum);

    // 5. Best / worst single trade, and average hold time
    const bestTrade = trades.length ? trades.reduce((a, b) => (b.pnl > a.pnl ? b : a)) : null;
    const worstTrade = trades.length ? trades.reduce((a, b) => (b.pnl < a.pnl ? b : a)) : null;
    const durations = trades.map(t => tradeDurationMinutes(t)).filter(d => d !== null);
    const avgHoldMin = durations.length ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length) : null;

    const metricCards = [
      { icon: '🛡️', label: 'Max Drawdown', value: '$' + maxDrawdown.toFixed(2), cls: maxDrawdown > 0 ? 'neg' : 'neutral' },
      { icon: '🎯', label: 'Expectancy', value: expectancy === null ? '—' : fmtMoney(expectancy), cls: expectancy > 0 ? 'pos' : expectancy < 0 ? 'neg' : 'neutral' },
      { icon: '⚖️', label: 'Risk : Reward', value: avgRR === null ? '—' : fmtRR(avgRR), cls: 'neutral' },
      { icon: '🚀', label: 'Best Trade', value: bestTrade ? fmtMoney(bestTrade.pnl) : '—', cls: bestTrade && bestTrade.pnl > 0 ? 'pos' : 'neutral' },
      { icon: '💥', label: 'Worst Trade', value: worstTrade ? fmtMoney(worstTrade.pnl) : '—', cls: worstTrade && worstTrade.pnl < 0 ? 'neg' : 'neutral' },
      { icon: '⏱️', label: 'Avg Hold Time', value: avgHoldMin === null ? '—' : fmtDuration(avgHoldMin), cls: 'neutral' }
    ];

    const streakCards = [
      { icon: currentTradeStreak >= 0 ? '🔥' : '🥶', label: 'Current Trade Streak', value: currentTradeStreak === 0 ? '—' : (currentTradeStreak > 0 ? currentTradeStreak + 'W' : Math.abs(currentTradeStreak) + 'L'), cls: currentTradeStreak > 0 ? 'pos' : currentTradeStreak < 0 ? 'neg' : '' },
      { icon: '🏆', label: 'Best Win Streak', value: maxWinTradeStreak, cls: maxWinTradeStreak > 0 ? 'pos' : '' },
      { icon: '⚠️', label: 'Worst Loss Streak', value: maxLossTradeStreak, cls: maxLossTradeStreak > 0 ? 'neg' : '' },
      { icon: currentDayStreak >= 0 ? '🔥' : '🥶', label: 'Current Day Streak', value: currentDayStreak === 0 ? '—' : (currentDayStreak > 0 ? currentDayStreak + 'W' : Math.abs(currentDayStreak) + 'L'), cls: currentDayStreak > 0 ? 'pos' : currentDayStreak < 0 ? 'neg' : '' },
      { icon: '🏆', label: 'Best Day Streak', value: maxWinDayStreak, cls: maxWinDayStreak > 0 ? 'pos' : '' },
      { icon: '⚠️', label: 'Worst Day Streak', value: maxLossDayStreak, cls: maxLossDayStreak > 0 ? 'neg' : '' }
    ];

    $('stat-strip').innerHTML = `
      <div class="feature-viz-grid">
        <div class="feature-card">
          <div class="feature-card-title">Win Rate</div>
          <div class="ring-value-wrap">
            ${ringSvg}
            <div class="ring-side-stats">
              <div class="ring-side-item"><div class="ring-side-label">Total Trades</div><div class="ring-side-value">${trades.length}</div></div>
              <div class="ring-side-item"><div class="ring-side-label">Winning</div><div class="ring-side-value pos">${wins.length}</div></div>
              <div class="ring-side-item"><div class="ring-side-label">Losing</div><div class="ring-side-value neg">${losses.length}</div></div>
            </div>
          </div>
        </div>
        <div class="feature-card">
          <div class="feature-card-title">Profit Factor</div>
          <div class="gauge-wrap">${gaugeSvg}</div>
        </div>
      </div>

      <div class="metric-grid">
        ${metricCards.map(m => `
          <div class="metric-card">
            <div class="metric-icon">${m.icon}</div>
            <div class="metric-label">${m.label}</div>
            <div class="metric-value ${m.cls} ${statSizeClass(m.value)}">${m.value}</div>
          </div>
        `).join('')}
      </div>

      <div class="streak-row">
        ${streakCards.map(s => `
          <div class="streak-card">
            <div class="streak-icon">${s.icon}</div>
            <div class="streak-label">${s.label}</div>
            <div class="streak-value ${s.cls}">${s.value}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function buildWinRateRing(winsCount, lossCount, winRateLabel) {
    const total = winsCount + lossCount;
    const size = 130, stroke = 16, r = (size - stroke) / 2, cx = size / 2, cy = size / 2;
    const circumference = 2 * Math.PI * r;
    const frac = total ? winsCount / total : 0;
    const dash = frac * circumference;
    const gap = circumference - dash;
    const label = winRateLabel === '—' ? '—' : winRateLabel + '%';
    return `
      <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" style="flex-shrink:0;">
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--surface)" stroke-width="${stroke}" />
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--green)" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${dash.toFixed(2)} ${gap.toFixed(2)}" transform="rotate(-90 ${cx} ${cy})" />
        <text x="${cx}" y="${cy - 2}" text-anchor="middle" fill="var(--text)" font-family="monospace" font-size="24" font-weight="700">${label}</text>
        <text x="${cx}" y="${cy + 16}" text-anchor="middle" fill="var(--muted)" font-family="monospace" font-size="9" letter-spacing="1">WIN RATE</text>
      </svg>
    `;
  }

  function buildProfitFactorGauge(pfNum) {
    const w = 180, r = 80, cx = 90, cy = 90;
    const arcLen = Math.PI * r;
    const cap = 3;
    const val = pfNum === null ? 0 : Math.min(Math.max(pfNum, 0), cap);
    const frac = val / cap;
    const dash = frac * arcLen;
    const gap = arcLen - dash;
    const color = pfNum === null ? 'var(--muted)' : pfNum >= 2 ? 'var(--green)' : pfNum >= 1 ? 'var(--amber)' : 'var(--red)';
    const label = pfNum === null ? '—' : pfNum.toFixed(2);
    return `
      <svg viewBox="0 0 ${w} 104" width="${w}" height="104">
        <path d="M10,${cy} A${r},${r} 0 1 1 170,${cy}" fill="none" stroke="var(--surface)" stroke-width="14" stroke-linecap="round" />
        <path d="M10,${cy} A${r},${r} 0 1 1 170,${cy}" fill="none" stroke="${color}" stroke-width="14" stroke-linecap="round" stroke-dasharray="${dash.toFixed(2)} ${gap.toFixed(2)}" />
        <text x="${cx}" y="${cy - 8}" text-anchor="middle" fill="var(--text)" font-family="monospace" font-size="24" font-weight="700">${label}</text>
        <text x="${cx}" y="${cy + 10}" text-anchor="middle" fill="var(--muted)" font-family="monospace" font-size="9" letter-spacing="1">PROFIT FACTOR</text>
      </svg>
    `;
  }

  // ---------- Performance snapshot helpers ----------
  function dateKey(d) { return d.toISOString().slice(0, 10); }

  function periodBounds(period, offset) {
    const now = new Date();
    let start, end;
    if (period === 'custom') {
      if (!customStart || !customEnd) return [null, null];
      const [sy, sm, sd] = customStart.split('-').map(Number);
      const [ey, em, ed] = customEnd.split('-').map(Number);
      const s = new Date(Date.UTC(sy, sm - 1, sd));
      const e = new Date(Date.UTC(ey, em - 1, ed));
      const spanDays = Math.round((e - s) / 86400000) + 1;
      if (offset === 0) {
        start = s;
        end = e;
      } else {
        // Preceding range of equal length, for the "vs prior period" comparison.
        end = new Date(Date.UTC(sy, sm - 1, sd - 1));
        start = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() - spanDays + 1));
      }
    } else if (period === 'day') {
      start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + offset));
      end = start;
    } else if (period === 'week') {
      const dow = now.getUTCDay();
      const mondayOffset = (dow === 0 ? -6 : 1 - dow);
      const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + mondayOffset + offset * 7));
      start = monday;
      end = new Date(Date.UTC(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate() + 6));
    } else if (period === 'year') {
      start = new Date(Date.UTC(now.getUTCFullYear() + offset, 0, 1));
      end = new Date(Date.UTC(now.getUTCFullYear() + offset, 11, 31));
    } else {
      start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1));
      end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset + 1, 0));
    }
    return [dateKey(start), dateKey(end)];
  }

  function tradesInRange(startKey, endKey) {
    return trades.filter(t => t.date >= startKey && t.date <= endKey);
  }

  function computeMetrics(list) {
    const wins = list.filter(t => t.result === 'win');
    const losses = list.filter(t => t.result === 'loss');
    const bes = list.filter(t => t.result === 'be');
    const decided = wins.length + losses.length;
    const winRate = decided ? (wins.length / decided) * 100 : null;
    const netPnl = list.reduce((s, t) => s + t.pnl, 0);
    const avgWin = wins.length ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : null;
    const avgLoss = losses.length ? Math.abs(losses.reduce((s, t) => s + t.pnl, 0) / losses.length) : null;
    return { wins, losses, bes, winRate, netPnl, avgWin, avgLoss, count: list.length };
  }

  function computeDelta(curVal, prevVal, mode) {
    if (curVal === null || prevVal === null) return null;
    if (mode === 'points') return curVal - prevVal;
    if (prevVal === 0) {
      if (curVal === 0) return 0;
      return curVal > 0 ? 100 : -100;
    }
    return ((curVal - prevVal) / Math.abs(prevVal)) * 100;
  }

  function deltaHtml(diff, periodWord) {
    if (diff === null) return `<div class="snapshot-card-delta muted-text">No prior data</div>`;
    const arrow = diff > 0.05 ? '↗' : diff < -0.05 ? '↘' : '→';
    const cls = diff > 0.05 ? 'pos' : diff < -0.05 ? 'neg' : 'neutral';
    return `<div class="snapshot-card-delta"><span class="${cls}">${arrow} ${Math.abs(diff).toFixed(1)}%</span> <span class="muted-text">vs ${periodWord}</span></div>`;
  }

  function renderSnapshot() {
    document.querySelectorAll('#period-toggle .period-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.period === perfPeriod);
    });

    if (perfPeriod === 'custom' && (!customStart || !customEnd)) {
      $('snapshot-grid').innerHTML = '<div class="empty-state">Pick a start and end date, then click Apply</div>';
      renderDonut({ wins: [], losses: [], bes: [] });
      renderRRBar({ avgWin: 0, avgLoss: 0 });
      return;
    }

    const [curS, curE] = periodBounds(perfPeriod, 0);
    const [prevS, prevE] = periodBounds(perfPeriod, -1);
    const cur = computeMetrics(tradesInRange(curS, curE));
    const prev = computeMetrics(tradesInRange(prevS, prevE));
    const periodWord = { day: 'yesterday', week: 'last week', month: 'last month', year: 'last year', custom: 'prior period' }[perfPeriod];

    const winRateDelta = computeDelta(cur.winRate, prev.winRate, 'points');
    const tradesDelta = computeDelta(cur.count, prev.count, 'relative');
    const winsDelta = computeDelta(cur.wins.length, prev.wins.length, 'relative');

    const pastWord = { day: 'day', week: 'week', month: 'month', year: 'year', custom: 'period' }[perfPeriod];

    const curBalance = balanceAsOf(curE);
    const prevBalance = balanceAsOf(prevE);
    const portfolioDelta = computeDelta(curBalance, prevBalance, 'relative');

    const curPF = profitFactorFor(tradesInRange(curS, curE));
    const prevPF = profitFactorFor(tradesInRange(prevS, prevE));
    const pfDelta = computeDelta(curPF, prevPF, 'relative');

    $('snapshot-grid').innerHTML =
      kpiCard('Portfolio Value', '$' + curBalance.toFixed(2), portfolioDelta, `Compared to <strong>$${prevBalance.toFixed(2)}</strong> past ${pastWord}`) +
      kpiCard('Total Trades', String(cur.count), tradesDelta, `Compared to <strong>${prev.count}</strong> trades past ${pastWord}`) +
      kpiCard('Total Trades (Winning)', String(cur.wins.length), winsDelta, `Compared to <strong>${prev.wins.length}</strong> trades past ${pastWord}`);

    renderDonut(cur);
    renderRRBar(cur);
  }

  function balanceAsOf(dateKeyInclusive) {
    const sum = trades.filter(t => t.date <= dateKeyInclusive).reduce((s, t) => s + t.pnl, 0);
    return startingBalance + sum;
  }

  function profitFactorFor(list) {
    if (!list.length) return null;
    const grossWin = list.reduce((s, t) => s + (t.pnl > 0 ? t.pnl : 0), 0);
    const grossLoss = Math.abs(list.reduce((s, t) => s + (t.pnl < 0 ? t.pnl : 0), 0));
    if (grossLoss === 0) return grossWin;
    return grossWin / grossLoss;
  }

  function kpiCard(title, value, delta, subHtml) {
    const arrow = delta === null ? '→' : delta > 0.05 ? '↗' : delta < -0.05 ? '↘' : '→';
    const cls = delta === null ? 'neutral' : delta > 0.05 ? 'pos' : delta < -0.05 ? 'neg' : 'neutral';
    const deltaStr = delta === null
      ? `<span class="kpi-delta neutral">—</span>`
      : `<span class="kpi-delta ${cls}">${arrow} ${Math.abs(delta).toFixed(1)}%</span>`;
    return `
      <div class="kpi-card">
        <div class="kpi-card-head">
          <span class="kpi-card-title">${title}</span>
          <div class="kpi-card-icons"><span title="Info">ⓘ</span><span title="Settings">⚙</span><span title="Remove">🗑</span></div>
        </div>
        <div class="kpi-card-value-row">
          <span class="kpi-card-value">${value}</span>
          ${deltaStr}
        </div>
        <div class="kpi-card-sub">${subHtml}</div>
      </div>
    `;
  }

  function renderDonut(m) {
    const holder = $('donut-holder');
    const total = m.wins.length + m.losses.length + m.bes.length;
    if (!total) {
      holder.innerHTML = '<div class="empty-state">No trades in this period</div>';
      return;
    }

    const segments = [
      { key: 'win', label: 'Wins', count: m.wins.length, color: 'var(--green)' },
      { key: 'loss', label: 'Losses', count: m.losses.length, color: 'var(--red)' },
      { key: 'be', label: 'Break-Even', count: m.bes.length, color: 'var(--amber)' }
    ].filter(s => s.count > 0);

    const size = 150, stroke = 20, r = (size - stroke) / 2, cx = size / 2, cy = size / 2;
    const circumference = 2 * Math.PI * r;
    let offset = 0;
    const arcs = segments.map(s => {
      const frac = s.count / total;
      const dash = frac * circumference;
      const gap = circumference - dash;
      const el = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${s.color}" stroke-width="${stroke}" stroke-dasharray="${dash.toFixed(2)} ${gap.toFixed(2)}" stroke-dashoffset="${(-offset).toFixed(2)}" transform="rotate(-90 ${cx} ${cy})" />`;
      offset += dash;
      return el;
    }).join('');

    const winRateLabel = m.winRate === null ? '—' : m.winRate.toFixed(0) + '%';

    const legend = segments.map(s => `
      <div class="donut-legend-item">
        <span class="donut-legend-dot" style="background:${s.color};"></span>
        <span>${s.label}</span>
        <span class="donut-legend-count">${s.count} · ${((s.count / total) * 100).toFixed(0)}%</span>
      </div>
    `).join('');

    holder.innerHTML = `
      <div class="donut-wrap">
        <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" style="flex-shrink:0;">
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--surface-2)" stroke-width="${stroke}" />
          ${arcs}
          <text x="${cx}" y="${cy - 3}" text-anchor="middle" fill="var(--text)" font-family="monospace" font-size="24" font-weight="700">${winRateLabel}</text>
          <text x="${cx}" y="${cy + 15}" text-anchor="middle" fill="var(--muted)" font-family="monospace" font-size="9" letter-spacing="1">WIN RATE</text>
        </svg>
        <div class="donut-legend">${legend}</div>
      </div>
    `;
  }

  function renderRRBar(m) {
    const holder = $('rr-bar-holder');
    const avgWin = m.avgWin || 0;
    const avgLoss = m.avgLoss || 0;

    if (!avgWin && !avgLoss) {
      holder.innerHTML = '<div class="empty-state">No decided trades in this period</div>';
      return;
    }

    const sum = avgWin + avgLoss || 1;
    const winPct = (avgWin / sum) * 100;
    const lossPct = 100 - winPct;
    const rr = avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : '—';

    holder.innerHTML = `
      <div class="rr-bar-wrap">
        <div class="rr-bar-track">
          <div class="rr-bar-seg win" style="width:${winPct.toFixed(1)}%;">${winPct > 20 ? fmtMoney(avgWin) : ''}</div>
          <div class="rr-bar-seg loss" style="width:${lossPct.toFixed(1)}%;">${lossPct > 20 ? '-$' + avgLoss.toFixed(2) : ''}</div>
        </div>
        <div class="rr-bar-labels">
          <span class="pos">Avg Win ${fmtMoney(avgWin)}</span>
          <span class="neg">Avg Loss -$${avgLoss.toFixed(2)}</span>
        </div>
        <div class="rr-ratio">Risk : Reward — <strong>${rr === '—' ? '—' : '1 : ' + rr}</strong></div>
      </div>
    `;
  }

  function renderNetPnlChart() {
    const holder = $('netpnl-bar-holder');

    document.querySelectorAll('#netpnl-toggle .period-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.gran === netPnlGran);
    });

    if (!trades.length) {
      holder.innerHTML = '<div class="empty-state">Log trades to see period P&amp;L</div>';
      return;
    }

    const buckets = new Map();
    trades.forEach(t => {
      const d = new Date(t.date + 'T00:00:00Z');
      let key, label, rangeLabel;
      if (netPnlGran === 'week') {
        const day = d.getUTCDay();
        const diff = (day === 0 ? -6 : 1 - day);
        const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + diff));
        const sunday = new Date(Date.UTC(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate() + 6));
        key = dateKey(monday);
        label = monday.toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });
        rangeLabel = label + ' – ' + sunday.toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });
      } else {
        key = d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0');
        label = d.toLocaleDateString(undefined, { month: 'short', year: '2-digit', timeZone: 'UTC' });
        rangeLabel = d.toLocaleDateString(undefined, { month: 'long', year: 'numeric', timeZone: 'UTC' });
      }
      if (!buckets.has(key)) buckets.set(key, { label, rangeLabel, pnl: 0, wins: 0, losses: 0, bes: 0, count: 0 });
      const b = buckets.get(key);
      b.pnl += t.pnl;
      b.count++;
      if (t.result === 'win') b.wins++;
      else if (t.result === 'loss') b.losses++;
      else if (t.result === 'be') b.bes++;
    });

    const sortedKeys = [...buckets.keys()].sort();
    const recentKeys = sortedKeys.slice(-12);
    const data = recentKeys.map(k => buckets.get(k));

    const w = 840, h = 200;
    const padLeft = 10, padRight = 10, padTop = 16, padBottom = 26;
    const plotW = w - padLeft - padRight;
    const plotH = h - padTop - padBottom;
    const maxAbs = Math.max(...data.map(d => Math.abs(d.pnl)), 1);
    const zeroY = padTop + plotH / 2;
    const step = plotW / data.length;
    const barW = Math.min(44, step * 0.6);

    const bars = data.map((d, i) => {
      const x = padLeft + i * step + (step - barW) / 2;
      const barH = Math.max((Math.abs(d.pnl) / maxAbs) * (plotH / 2 - 6), d.pnl === 0 ? 2 : 1);
      const y = d.pnl >= 0 ? zeroY - barH : zeroY;
      const color = d.pnl > 0 ? 'var(--green)' : d.pnl < 0 ? 'var(--red)' : 'var(--muted)';
      return `<rect class="netpnl-bar" data-idx="${i}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${barH.toFixed(1)}" rx="3" fill="${color}" />
        <text x="${(x + barW / 2).toFixed(1)}" y="${h - 8}" text-anchor="middle" fill="var(--muted)" font-size="9" font-family="monospace">${d.label}</text>`;
    }).join('');

    holder.innerHTML = `
      <svg viewBox="0 0 ${w} ${h}" style="width:100%; height:${h}px;" id="netpnl-svg">
        <line x1="${padLeft}" y1="${zeroY.toFixed(1)}" x2="${w - padRight}" y2="${zeroY.toFixed(1)}" stroke="#262d3a" stroke-width="1" stroke-dasharray="4 3" />
        ${bars}
      </svg>
      <div class="netpnl-tooltip" id="netpnl-tooltip"></div>
    `;

    const svgEl = $('netpnl-svg');
    const tooltip = $('netpnl-tooltip');

    holder.querySelectorAll('.netpnl-bar').forEach(bar => {
      bar.addEventListener('mouseenter', () => {
        const idx = parseInt(bar.dataset.idx, 10);
        const d = data[idx];
        const decided = d.wins + d.losses;
        const winRate = decided ? ((d.wins / decided) * 100).toFixed(1) + '%' : '—';
        const pnlCls = d.pnl > 0 ? 'pos' : d.pnl < 0 ? 'neg' : 'neutral';

        tooltip.innerHTML = `
          <div class="npt-title">${d.rangeLabel}</div>
          <div class="npt-pnl ${pnlCls}">${fmtMoney(d.pnl)}</div>
          <div class="npt-row"><span>Trades</span><span>${d.count}</span></div>
          <div class="npt-row"><span>Win Rate</span><span>${winRate}</span></div>
          <div class="npt-row"><span class="pos">Wins</span><span class="pos">${d.wins}</span></div>
          <div class="npt-row"><span class="neg">Losses</span><span class="neg">${d.losses}</span></div>
          ${d.bes ? `<div class="npt-row"><span class="neutral">Break-Even</span><span class="neutral">${d.bes}</span></div>` : ''}
        `;

        bar.setAttribute('stroke', '#ffffff');
        bar.setAttribute('stroke-width', '1.5');

        const barRect = bar.getBoundingClientRect();
        const holderRect = holder.getBoundingClientRect();
        tooltip.style.left = (barRect.left - holderRect.left + barRect.width / 2) + 'px';
        tooltip.style.top = (barRect.top - holderRect.top) + 'px';
        tooltip.style.display = 'block';
      });
      bar.addEventListener('mouseleave', () => {
        bar.removeAttribute('stroke');
        bar.removeAttribute('stroke-width');
        tooltip.style.display = 'none';
      });
    });
  }

  function starPoints(cx, cy, outerR, innerR) {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (Math.PI / 5) * i - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(' ');
  }

  function renderCurve() {
    const holder = $('curve-svg-holder');
    const pnlEl = $('equity-pnl-value');
    const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
    if (pnlEl) {
      pnlEl.textContent = trades.length ? fmtMoney(totalPnl) : '$0.00';
      pnlEl.className = 'curve-pnl-value ' + (totalPnl > 0 ? 'pos' : totalPnl < 0 ? 'neg' : 'neutral');
    }
    if (trades.length === 0) {
      holder.innerHTML = '<div class="empty-state">Log your first trade to see the curve</div>';
      return;
    }
    const sorted = [...trades].sort((a,b) => a.date.localeCompare(b.date) || 0);

    // Aggregate trades into one point per day so each dot represents a full day's trading.
    const dayPnl = new Map();
    sorted.forEach(t => dayPnl.set(t.date, (dayPnl.get(t.date) || 0) + t.pnl));
    const dates = [...dayPnl.keys()];
    let cum = startingBalance;
    const points = dates.map(d => { cum += dayPnl.get(d); return cum; });

    const w = 840, h = 170;
    const padLeft = 10, padRight = 64, padTop = 10, padBottom = 26;
    const plotW = w - padLeft - padRight;
    const plotH = h - padTop - padBottom;

    const min = Math.min(startingBalance, ...points);
    const max = Math.max(startingBalance, ...points);
    const range = (max - min) || 1;
    const stepX = points.length > 1 ? plotW / (points.length - 1) : 0;
    const toX = (i) => padLeft + i * stepX;
    const toY = (v) => padTop + plotH - ((v - min) / range) * plotH;
    const baselineY = toY(startingBalance);

    const coords = points.map((v, i) => [toX(i), toY(v)]);
    const pathD = coords.map((c, i) => (i === 0 ? 'M' : 'L') + c[0].toFixed(1) + ',' + c[1].toFixed(1)).join(' ');
    const lineColor = points[points.length - 1] >= startingBalance ? '#2fbf71' : '#e5484d';

    // Right-side balance labels (high / mid / low of the visible range)
    const balanceVals = max === min ? [max] : [max, (max + min) / 2, min];
    const fmtAxisMoney = (v) => '$' + Math.round(v).toLocaleString();
    const yLabelsSvg = balanceVals.map(v => {
      const y = toY(v);
      return `
        <line x1="${padLeft}" y1="${y.toFixed(1)}" x2="${w - padRight}" y2="${y.toFixed(1)}" stroke="#1b212c" stroke-width="1" />
        <text x="${w - padRight + 8}" y="${(y + 3.5).toFixed(1)}" fill="#7d8697" font-size="10" font-family="monospace">${fmtAxisMoney(v)}</text>
      `;
    }).join('');

    // Bottom date labels, evenly spaced across the trading days logged
    const maxLabels = Math.min(5, points.length);
    const tickIndices = [];
    if (points.length === 1) {
      tickIndices.push(0);
    } else {
      for (let i = 0; i < maxLabels; i++) {
        const idx = Math.round(i * (points.length - 1) / (maxLabels - 1));
        if (!tickIndices.includes(idx)) tickIndices.push(idx);
      }
    }
    const fmtAxisDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const xLabelsSvg = tickIndices.map(idx => {
      const x = toX(idx);
      const anchor = idx === 0 ? 'start' : idx === points.length - 1 ? 'end' : 'middle';
      return `<text x="${x.toFixed(1)}" y="${h - 6}" fill="#7d8697" font-size="10" font-family="monospace" text-anchor="${anchor}">${fmtAxisDate(dates[idx])}</text>`;
    }).join('');

    // A dot for every trading day — hoverable (tooltip) and clickable (opens that day's trades)
    const dotsSvg = coords.map((c, i) => {
      const dayChange = dayPnl.get(dates[i]);
      const dotColor = dayChange > 0 ? '#2fbf71' : dayChange < 0 ? '#e5484d' : '#7d8697';
      return `<circle class="equity-dot" cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="4" fill="${dotColor}" stroke="var(--surface)" stroke-width="1.5" data-date="${dates[i]}" data-balance="${points[i].toFixed(2)}" data-change="${dayChange.toFixed(2)}" />`;
    }).join('');

    // Best trading day — highlight the day with the highest single-day P&L with a gold star
    let bestIdx = -1, bestVal = -Infinity;
    dates.forEach((d, i) => {
      const v = dayPnl.get(d);
      if (v > bestVal) { bestVal = v; bestIdx = i; }
    });
    const starSvg = (bestIdx >= 0 && bestVal > 0) ? (() => {
      const [sx, sy] = coords[bestIdx];
      const starCy = Math.max(sy - 20, padTop + 9);
      const pts = starPoints(sx, starCy, 9, 4);
      return `
        <g class="best-day-star">
          <polygon points="${pts}" fill="#ffd700" stroke="#8a6d1f" stroke-width="0.75">
            <title>Best Day — ${fmtAxisDate(dates[bestIdx])}: ${fmtMoney(bestVal)}</title>
          </polygon>
        </g>
      `;
    })() : '';

    holder.innerHTML = `
      <svg viewBox="0 0 ${w} ${h}" style="width:100%; height:${h}px;" id="equity-svg">
        ${yLabelsSvg}
        <line x1="${padLeft}" y1="${baselineY.toFixed(1)}" x2="${w-padRight}" y2="${baselineY.toFixed(1)}" stroke="#262d3a" stroke-width="1" stroke-dasharray="4 3" />
        <path d="${pathD}" fill="none" stroke="${lineColor}" stroke-width="2" />
        ${dotsSvg}
        ${starSvg}
        ${xLabelsSvg}
      </svg>
      <div class="equity-tooltip" id="equity-tooltip"></div>
    `;

    const svgEl = $('equity-svg');
    const tooltip = $('equity-tooltip');

    holder.querySelectorAll('.equity-dot').forEach(dot => {
      dot.addEventListener('mouseenter', () => {
        dot.setAttribute('r', '6');
        const date = dot.dataset.date;
        const balance = parseFloat(dot.dataset.balance);
        const change = parseFloat(dot.dataset.change);
        const changeCls = change > 0 ? 'pos' : change < 0 ? 'neg' : 'neutral';
        const changeStr = fmtMoney(change);
        tooltip.innerHTML = `
          <div class="eqt-date">${fmtAxisDate(date)}</div>
          <span class="eqt-balance">${fmtAxisMoney(balance)}</span><span class="eqt-change ${changeCls}">${changeStr}</span>
        `;
        const svgRect = svgEl.getBoundingClientRect();
        const holderRect = holder.getBoundingClientRect();
        const scaleX = svgRect.width / w;
        const scaleY = svgRect.height / h;
        const cx = parseFloat(dot.getAttribute('cx'));
        const cy = parseFloat(dot.getAttribute('cy'));
        tooltip.style.left = (svgRect.left - holderRect.left + cx * scaleX) + 'px';
        tooltip.style.top = (svgRect.top - holderRect.top + cy * scaleY - 10) + 'px';
        tooltip.style.display = 'block';
      });
      dot.addEventListener('mouseleave', () => {
        dot.setAttribute('r', '4');
        tooltip.style.display = 'none';
      });
      dot.addEventListener('click', () => {
        openDayModal(dot.dataset.date);
      });
    });
  }

  function renderInstrumentStats() {
    const holder = $('instrument-grid');
    const instruments = ['ES', 'NQ', 'GC', 'YM'];
    const cards = instruments.map(inst => {
      const t = trades.filter(x => x.instrument === inst);
      if (t.length === 0) {
        return `
          <div class="instrument-card">
            <div class="instrument-card-head">
              <span class="instrument-card-name" style="color:${INSTRUMENT_STYLES[inst].border};">${inst}</span>
            </div>
            <div class="empty-state" style="padding:10px 0;">No trades yet</div>
          </div>
        `;
      }
      const wins = t.filter(x => x.result === 'win');
      const losses = t.filter(x => x.result === 'loss');
      const bes = t.filter(x => x.result === 'be');
      const total = t.reduce((s, x) => s + x.pnl, 0);
      const decided = wins.length + losses.length;
      const winRate = decided ? ((wins.length / decided) * 100).toFixed(1) + '%' : '—';
      const avgPerTrade = total / t.length;
      const pnlCls = total > 0 ? 'pos' : total < 0 ? 'neg' : 'neutral';

      return `
        <div class="instrument-card">
          <div class="instrument-card-head">
            <span class="instrument-card-name" style="color:${INSTRUMENT_STYLES[inst].border};">${inst}</span>
            <span class="instrument-card-pnl ${pnlCls}">${fmtMoney(total)}</span>
          </div>
          <div class="instrument-card-rows">
            <div><div class="instrument-stat-label">Record</div><div class="instrument-stat-value">${wins.length}W ${losses.length}L${bes.length ? ' ' + bes.length + 'BE' : ''}</div></div>
            <div><div class="instrument-stat-label">Win Rate</div><div class="instrument-stat-value">${winRate}</div></div>
            <div><div class="instrument-stat-label">Trades</div><div class="instrument-stat-value">${t.length}</div></div>
            <div><div class="instrument-stat-label">Avg / Trade</div><div class="instrument-stat-value">${fmtMoney(avgPerTrade)}</div></div>
          </div>
        </div>
      `;
    });
    holder.innerHTML = cards.join('');
  }

  function renderDirectionStats() {
    const holder = $('direction-grid');
    const directions = ['long', 'short'];
    const totals = directions.map(dir => {
      const t = trades.filter(x => x.direction === dir);
      return { dir, total: t.reduce((s, x) => s + x.pnl, 0), count: t.length };
    });
    const withTrades = totals.filter(x => x.count > 0);
    const bestDir = withTrades.length ? withTrades.reduce((a, b) => (b.total > a.total ? b : a)).dir : null;

    const cards = directions.map(dir => {
      const t = trades.filter(x => x.direction === dir);
      const label = DIRECTION_LABELS[dir];
      if (t.length === 0) {
        return `
          <div class="instrument-card">
            <div class="instrument-card-head">
              <span class="instrument-card-name" style="color:${DIRECTION_STYLES[dir].border};">${label}</span>
            </div>
            <div class="empty-state" style="padding:10px 0;">No trades yet</div>
          </div>
        `;
      }
      const wins = t.filter(x => x.result === 'win');
      const losses = t.filter(x => x.result === 'loss');
      const bes = t.filter(x => x.result === 'be');
      const total = t.reduce((s, x) => s + x.pnl, 0);
      const decided = wins.length + losses.length;
      const winRate = decided ? ((wins.length / decided) * 100).toFixed(1) + '%' : '—';
      const avgPerTrade = total / t.length;
      const rrTrades = t.filter(x => typeof x.rr === 'number' && !isNaN(x.rr));
      const avgRR = rrTrades.length ? rrTrades.reduce((s, x) => s + x.rr, 0) / rrTrades.length : null;
      const pnlCls = total > 0 ? 'pos' : total < 0 ? 'neg' : 'neutral';
      const isBest = dir === bestDir && total > 0;

      return `
        <div class="instrument-card"${isBest ? ' style="border-color: var(--green);"' : ''}>
          <div class="instrument-card-head">
            <span class="instrument-card-name" style="color:${DIRECTION_STYLES[dir].border};">${label}${isBest ? ' 🏆' : ''}</span>
            <span class="instrument-card-pnl ${pnlCls}">${fmtMoney(total)}</span>
          </div>
          <div class="instrument-card-rows">
            <div><div class="instrument-stat-label">Record</div><div class="instrument-stat-value">${wins.length}W ${losses.length}L${bes.length ? ' ' + bes.length + 'BE' : ''}</div></div>
            <div><div class="instrument-stat-label">Win Rate</div><div class="instrument-stat-value">${winRate}</div></div>
            <div><div class="instrument-stat-label">Trades</div><div class="instrument-stat-value">${t.length}</div></div>
            <div><div class="instrument-stat-label">Avg / Trade</div><div class="instrument-stat-value">${fmtMoney(avgPerTrade)}</div></div>
            <div><div class="instrument-stat-label">Avg R</div><div class="instrument-stat-value">${avgRR === null ? '—' : fmtRR(avgRR)}</div></div>
          </div>
        </div>
      `;
    });
    holder.innerHTML = cards.join('');
  }

  function renderSessionStats() {
    const holder = $('session-grid');
    const sessions = ['New York', 'London', 'Asia'];
    const totals = sessions.map(sess => {
      const t = trades.filter(x => x.session === sess);
      return { sess, total: t.reduce((s, x) => s + x.pnl, 0), count: t.length };
    });
    const withTrades = totals.filter(x => x.count > 0);
    const bestSess = withTrades.length ? withTrades.reduce((a, b) => (b.total > a.total ? b : a)).sess : null;

    const cards = sessions.map(sess => {
      const t = trades.filter(x => x.session === sess);
      if (t.length === 0) {
        return `
          <div class="instrument-card">
            <div class="instrument-card-head">
              <span class="instrument-card-name" style="color:${SESSION_STYLES[sess].border};">${escapeHtml(sess)}</span>
            </div>
            <div class="empty-state" style="padding:10px 0;">No trades yet</div>
          </div>
        `;
      }
      const wins = t.filter(x => x.result === 'win');
      const losses = t.filter(x => x.result === 'loss');
      const bes = t.filter(x => x.result === 'be');
      const total = t.reduce((s, x) => s + x.pnl, 0);
      const decided = wins.length + losses.length;
      const winRate = decided ? ((wins.length / decided) * 100).toFixed(1) + '%' : '—';
      const avgPerTrade = total / t.length;
      const pnlCls = total > 0 ? 'pos' : total < 0 ? 'neg' : 'neutral';
      const isBest = sess === bestSess && total > 0;

      return `
        <div class="instrument-card"${isBest ? ' style="border-color: var(--green);"' : ''}>
          <div class="instrument-card-head">
            <span class="instrument-card-name" style="color:${SESSION_STYLES[sess].border};">${escapeHtml(sess)}${isBest ? ' 🏆' : ''}</span>
            <span class="instrument-card-pnl ${pnlCls}">${fmtMoney(total)}</span>
          </div>
          <div class="instrument-card-rows">
            <div><div class="instrument-stat-label">Record</div><div class="instrument-stat-value">${wins.length}W ${losses.length}L${bes.length ? ' ' + bes.length + 'BE' : ''}</div></div>
            <div><div class="instrument-stat-label">Win Rate</div><div class="instrument-stat-value">${winRate}</div></div>
            <div><div class="instrument-stat-label">Trades</div><div class="instrument-stat-value">${t.length}</div></div>
            <div><div class="instrument-stat-label">Avg / Trade</div><div class="instrument-stat-value">${fmtMoney(avgPerTrade)}</div></div>
          </div>
        </div>
      `;
    });
    holder.innerHTML = cards.join('');
  }

  function tradeMatchesSearch(t, q) {
    if (!q) return true;
    const haystack = [
      t.instrument,
      t.direction,
      t.tag,
      t.notes,
      t.grade,
      t.session,
      t.result,
      ...(t.confluences || []),
      ...(t.mindsetTags || []),
      ...((t.questionsAnswered || []).flatMap(qa => [qa.text, qa.answer]))
    ].filter(Boolean).join(' ').toLowerCase();
    return haystack.includes(q);
  }

  function renderList() {
    const list = $('trade-list');
    const countEl = $('filter-count');
    if (trades.length === 0) {
      list.innerHTML = '<div class="empty-state">No trades logged yet. Add one above.</div>';
      if (countEl) countEl.innerHTML = '';
      return;
    }
    const q = searchQuery.trim().toLowerCase();
    let filtered = selectedTagFilter === 'all' ? trades : trades.filter(t => t.tag === selectedTagFilter);
    if (filterDateFrom) filtered = filtered.filter(t => t.date >= filterDateFrom);
    if (filterDateTo) filtered = filtered.filter(t => t.date <= filterDateTo);
    if (q) filtered = filtered.filter(t => tradeMatchesSearch(t, q));

    const anyFilterActive = selectedTagFilter !== 'all' || !!filterDateFrom || !!filterDateTo || !!q;
    if (countEl) {
      countEl.innerHTML = anyFilterActive
        ? `<span class="fc-highlight">${filtered.length}</span> of ${trades.length} trades match`
        : '';
    }

    if (filtered.length === 0) {
      list.innerHTML = `<div class="empty-state">No trades match ${anyFilterActive ? 'these filters' : 'this setup tag'}.</div>`;
      return;
    }
    const sorted = [...filtered].sort((a,b) => b.date.localeCompare(a.date) || (b.id > a.id ? 1 : -1));

    list.innerHTML = sorted.map(t => {
      const pnlCls = t.pnl > 0 ? 'pos' : t.pnl < 0 ? 'neg' : 'neutral';
      const dateShort = new Date(t.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const durMin = tradeDurationMinutes(t);
      return `
        <div class="trade-row" data-result="${t.result}" data-open="false" data-id="${t.id}">
          <div class="trade-summary" data-toggle="${t.id}">
            <div class="trade-date">${dateShort}</div>
            <div class="trade-instrument">${instrumentBadge(t.instrument)}${directionBadge(t.direction)}${gradeBadge(t.grade)}${tagBadge(t.tag)}${sessionBadge(t.session)}${rBadge(t.rr)}</div>
            <div class="trade-pnl ${pnlCls}">${fmtMoney(t.pnl)}</div>
            <button class="trade-edit" data-edit="${t.id}" title="Edit">✎</button>
            <button class="trade-del" data-del="${t.id}" title="Delete">✕</button>
          </div>
          <div class="trade-detail">
            ${renderConfluenceBadges(t)}
            ${renderMindsetBadges(t)}
            ${renderQuestionAnswers(t)}
            ${t.entryTime && t.exitTime ? `<div class="trade-time-range">⏱ Entry ${t.entryTime} → Exit ${t.exitTime}${durMin !== null ? ' · ' + fmtDuration(durMin) + ' hold' : ''}</div>` : ''}
            ${t.notes ? `<div class="trade-notes">${escapeHtml(t.notes)}</div>` : ''}
            ${renderShots(t)}
          </div>
        </div>
      `;
    }).join('');

    list.querySelectorAll('[data-toggle]').forEach(el => {
      el.addEventListener('click', () => {
        const row = el.closest('.trade-row');
        row.dataset.open = row.dataset.open === 'true' ? 'false' : 'true';
      });
    });
    list.querySelectorAll('[data-del]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTrade(el.dataset.del);
      });
    });
    list.querySelectorAll('[data-edit]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        editTrade(el.dataset.edit);
      });
    });
    list.querySelectorAll('[data-shot]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        openLightbox(el.src);
      });
    });
  }

  function renderConfluenceBadges(t) {
    if (!t.confluences || t.confluences.length === 0) return '';
    return `<div class="trade-confluences">${t.confluences.map(c => { const cs = confluenceColor(c); return `<span class="tag-badge" style="border-color:${cs.border};color:${cs.color};background:${cs.bg};">${escapeHtml(c)}</span>`; }).join('')}</div>`;
  }

  function renderMindsetBadges(t) {
    if (!t.mindsetTags || t.mindsetTags.length === 0) return '';
    return `<div class="trade-confluences">${t.mindsetTags.map(c => { const cs = mindsetColor(); return `<span class="tag-badge" style="border-color:${cs.border};color:${cs.color};background:${cs.bg};">${escapeHtml(c)}</span>`; }).join('')}</div>`;
  }

  // Minutes between entry and exit, handling an exit that wraps past midnight. Null if either time is missing.
  function tradeDurationMinutes(t) {
    if (!t.entryTime || !t.exitTime) return null;
    const [eh, em] = t.entryTime.split(':').map(Number);
    const [xh, xm] = t.exitTime.split(':').map(Number);
    let diff = (xh * 60 + xm) - (eh * 60 + em);
    if (diff < 0) diff += 1440;
    return diff;
  }

  function fmtDuration(minutes) {
    if (minutes < 60) return minutes + 'm';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h + 'h' + (m ? ' ' + m + 'm' : '');
  }

  function durationBucket(minutes) {
    if (minutes < 15) return '< 15m';
    if (minutes < 30) return '15m – 30m';
    if (minutes < 60) return '30m – 1h';
    if (minutes < 120) return '1h – 2h';
    return '2h+';
  }

  function renderQuestionAnswers(t) {
    if (!t.questionsAnswered || t.questionsAnswered.length === 0) return '';
    return `<div class="trade-questions">${t.questionsAnswered.map(q => `<div class="trade-question-item"><span>${escapeHtml(q.text)}</span><span class="trade-question-answer ${q.answer === 'yes' ? 'yes' : 'no'}">${q.answer === 'yes' ? 'Yes' : 'No'}</span></div>`).join('')}</div>`;
  }

  function renderShots(t) {
    let items = [];
    if (Array.isArray(t.screenshots)) {
      t.screenshots.forEach(s => { if (s && s.src) items.push({ label: s.tf, src: s.src }); });
    } else if (t.screenshots && typeof t.screenshots === 'object') {
      Object.keys(t.screenshots).forEach(tf => {
        if (t.screenshots[tf]) items.push({ label: tf, src: t.screenshots[tf] });
      });
    } else if (t.screenshot) {
      items.push({ label: 'Screenshot', src: t.screenshot });
    }
    if (items.length === 0) return '';
    return `<div class="trade-shots">${items.map((it, i) => `
      <div class="trade-shot-item">
        <span class="shot-tf-label">${escapeHtml(it.label)}</span>
        <img class="trade-screenshot" src="${it.src}" data-shot="${t.id}-${it.label}-${i}" />
      </div>
    `).join('')}</div>`;
  }

  function gradeBadge(grade) {
    if (!grade) return '';
    const s = GRADE_STYLES[grade] || GRADE_STYLES['B'];
    return `<span class="grade-badge" style="border-color:${s.border};color:${s.color};background:${s.bg};">${escapeHtml(grade)}</span>`;
  }

  function fmtRR(rr) {
    const rounded = Math.round(rr * 100) / 100;
    return (Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(2).replace(/0$/, '').replace(/\.$/, '')) + 'RR';
  }

  function rBadge(rr) {
    if (typeof rr !== 'number' || isNaN(rr)) return '';
    const cls = rr > 0 ? 'pos' : rr < 0 ? 'neg' : '';
    return `<span class="r-badge ${cls}">${fmtRR(rr)}</span>`;
  }

  function sessionBadge(session) {
    if (!session) return '';
    const s = SESSION_STYLES[session];
    if (!s) return `<span class="tag-badge">${escapeHtml(session)}</span>`;
    return `<span class="tag-badge" style="border-color:${s.border};color:${s.color};background:${s.bg};">${escapeHtml(session)}</span>`;
  }

  function directionBadge(direction) {
    if (!direction) return '';
    const s = DIRECTION_STYLES[direction];
    if (!s) return '';
    return `<span class="grade-badge" style="border-color:${s.border};color:${s.color};background:${s.bg};">${escapeHtml(DIRECTION_LABELS[direction] || direction)}</span>`;
  }

  function instrumentBadge(instrument) {
    if (!instrument) return '';
    const s = INSTRUMENT_STYLES[instrument];
    if (!s) return escapeHtml(instrument);
    return `<span class="grade-badge" style="border-color:${s.border};color:${s.color};background:${s.bg};">${escapeHtml(instrument)}</span>`;
  }

  function tagBadge(tag) {
    if (!tag) return '';
    return `<span class="tag-badge">${escapeHtml(tag)}</span>`;
  }

  function renderCalendar() {
    $('cal-month-label').textContent = MONTH_NAMES[calMonth] + ' ' + calYear;

    $('cal-dow-row').innerHTML = DOW_NAMES.map(d => `<div class="cal-dow">${d}</div>`).join('') + `<div class="cal-dow">Weekly</div>`;

    const firstOfMonth = new Date(calYear, calMonth, 1);
    const startDow = firstOfMonth.getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(calYear, calMonth, 0).getDate();
    const totalCells = Math.ceil((startDow + daysInMonth) / 7) * 7;

    const cells = [];
    for (let i = 0; i < totalCells; i++) {
      const dayOffset = i - startDow + 1;
      let cellDate, otherMonth;
      if (dayOffset < 1) {
        cellDate = new Date(calYear, calMonth - 1, daysInPrevMonth + dayOffset);
        otherMonth = true;
      } else if (dayOffset > daysInMonth) {
        cellDate = new Date(calYear, calMonth + 1, dayOffset - daysInMonth);
        otherMonth = true;
      } else {
        cellDate = new Date(calYear, calMonth, dayOffset);
        otherMonth = false;
      }
      cells.push({ date: cellDate, otherMonth });
    }

    const dateKey = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

    let html = '';
    for (let w = 0; w < cells.length / 7; w++) {
      const weekCells = cells.slice(w * 7, w * 7 + 7);
      let weekPnl = 0, weekCount = 0;
      weekCells.forEach(c => {
        const key = dateKey(c.date);
        const dayTrades = trades.filter(t => t.date === key);
        const dayPnl = dayTrades.reduce((s, t) => s + t.pnl, 0);
        weekPnl += dayPnl;
        weekCount += dayTrades.length;

        let cls = 'cal-cell';
        if (c.otherMonth) cls += ' other-month';
        if (dayTrades.length) {
          cls += ' has-trades';
          if (dayPnl > 0) cls += ' has-win';
          else if (dayPnl < 0) cls += ' has-loss';
          else cls += ' has-be';
        }
        const pnlCls = dayPnl > 0 ? 'pos' : dayPnl < 0 ? 'neg' : 'neutral';
        html += `
          <div class="${cls}" data-date="${key}">
            <div class="cal-date-num">${String(c.date.getDate()).padStart(2, '0')}</div>
            ${dayTrades.length ? `<div class="cal-cell-pnl ${pnlCls}">${fmtMoney(dayPnl)}</div><div class="cal-cell-count">${dayTrades.length} trade${dayTrades.length > 1 ? 's' : ''}</div>` : ''}
          </div>
        `;
      });
      const weekPnlCls = weekCount === 0 ? 'neutral' : weekPnl > 0 ? 'pos' : weekPnl < 0 ? 'neg' : 'neutral';
      html += `
        <div class="cal-week-cell">
          <div class="cal-week-label">Weekly</div>
          <div class="cal-week-pnl ${weekPnlCls}">${weekCount ? fmtMoney(weekPnl) : '$0.00'}</div>
          <div class="cal-cell-count">${weekCount} trade${weekCount !== 1 ? 's' : ''}</div>
        </div>
      `;
    }
    $('cal-grid').innerHTML = html;

    $('cal-grid').querySelectorAll('.cal-cell.has-trades').forEach(cell => {
      cell.addEventListener('click', () => openDayModal(cell.dataset.date));
    });
  }

  function renderDayPerformance() {
    const totals = DOW_NAMES.map(() => ({ pnl: 0, wins: 0, losses: 0, bes: 0, count: 0 }));
    trades.forEach(t => {
      const d = new Date(t.date + 'T00:00:00').getDay();
      totals[d].pnl += t.pnl;
      totals[d].count++;
      if (t.result === 'win') totals[d].wins++;
      else if (t.result === 'loss') totals[d].losses++;
      else totals[d].bes++;
    });

    const withTrades = totals.map((t, i) => ({ ...t, day: DOW_NAMES[i], idx: i })).filter(t => t.count > 0);

    if (withTrades.length === 0) {
      $('dow-highlights').innerHTML = '<div class="empty-state" style="grid-column:1/-1;">Log trades to see your best and worst days</div>';
      $('dow-grid').innerHTML = '';
      return;
    }

    const best = withTrades.reduce((a, b) => (b.pnl > a.pnl ? b : a));
    const worst = withTrades.reduce((a, b) => (b.pnl < a.pnl ? b : a));

    $('dow-highlights').innerHTML = `
      <div class="dow-highlight best">
        <div class="dow-highlight-label">Most Profitable Day</div>
        <div class="dow-highlight-day">${best.day}</div>
        <div class="dow-highlight-detail">${fmtMoney(best.pnl)} · ${best.wins}W / ${best.losses}L${best.bes ? ' / ' + best.bes + ' BE' : ''}</div>
      </div>
      <div class="dow-highlight worst">
        <div class="dow-highlight-label">Worst Day</div>
        <div class="dow-highlight-day">${worst.day}</div>
        <div class="dow-highlight-detail">${fmtMoney(worst.pnl)} · ${worst.wins}W / ${worst.losses}L${worst.bes ? ' / ' + worst.bes + ' BE' : ''}</div>
      </div>
    `;

    $('dow-grid').innerHTML = totals.map((t, i) => {
      const isBest = t.count > 0 && i === best.idx;
      const isWorst = t.count > 0 && i === worst.idx && worst.idx !== best.idx;
      let cls = 'dow-chip';
      if (isBest) cls += ' is-best';
      if (isWorst) cls += ' is-worst';
      const pnlCls = t.pnl > 0 ? 'pos' : t.pnl < 0 ? 'neg' : 'neutral';
      return `
        <div class="${cls}">
          <div class="dow-chip-label">${DOW_NAMES[i]}</div>
          <div class="dow-chip-pnl ${pnlCls}">${t.count ? fmtMoney(t.pnl) : '—'}</div>
          <div class="dow-chip-wl">${t.count ? t.wins + 'W ' + t.losses + 'L' : 'no trades'}</div>
        </div>
      `;
    }).join('');
  }

  function renderHourPerformance() {
    document.querySelectorAll('#hour-toggle .period-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.hourmode === hourMode);
    });

    const timeField = hourMode === 'entry' ? 'entryTime' : 'exitTime';
    const withTime = trades.filter(t => t[timeField]);

    const totals = Array.from({ length: 24 }, () => ({ pnl: 0, wins: 0, losses: 0, bes: 0, count: 0 }));
    withTime.forEach(t => {
      const hour = parseInt(t[timeField].split(':')[0], 10);
      totals[hour].pnl += t.pnl;
      totals[hour].count++;
      if (t.result === 'win') totals[hour].wins++;
      else if (t.result === 'loss') totals[hour].losses++;
      else totals[hour].bes++;
    });

    const withTrades = totals.map((t, i) => ({ ...t, hour: i, idx: i })).filter(t => t.count > 0);

    if (withTrades.length === 0) {
      $('hour-highlights').innerHTML = `<div class="empty-state" style="grid-column:1/-1;">Log trades with an ${hourMode} time to see your best and worst hours</div>`;
      $('hour-grid').innerHTML = '';
      return;
    }

    const best = withTrades.reduce((a, b) => (b.pnl > a.pnl ? b : a));
    const worst = withTrades.reduce((a, b) => (b.pnl < a.pnl ? b : a));
    const hourLabel = (h) => String(h).padStart(2, '0') + ':00';

    $('hour-highlights').innerHTML = `
      <div class="dow-highlight best">
        <div class="dow-highlight-label">Most Profitable ${hourMode === 'entry' ? 'Entry' : 'Exit'} Hour</div>
        <div class="dow-highlight-day">${hourLabel(best.hour)}</div>
        <div class="dow-highlight-detail">${fmtMoney(best.pnl)} · ${best.wins}W / ${best.losses}L${best.bes ? ' / ' + best.bes + ' BE' : ''}</div>
      </div>
      <div class="dow-highlight worst">
        <div class="dow-highlight-label">Worst ${hourMode === 'entry' ? 'Entry' : 'Exit'} Hour</div>
        <div class="dow-highlight-day">${hourLabel(worst.hour)}</div>
        <div class="dow-highlight-detail">${fmtMoney(worst.pnl)} · ${worst.wins}W / ${worst.losses}L${worst.bes ? ' / ' + worst.bes + ' BE' : ''}</div>
      </div>
    `;

    $('hour-grid').innerHTML = totals.map((t, i) => {
      const isBest = t.count > 0 && i === best.idx;
      const isWorst = t.count > 0 && i === worst.idx && worst.idx !== best.idx;
      let cls = 'dow-chip';
      if (isBest) cls += ' is-best';
      if (isWorst) cls += ' is-worst';
      const pnlCls = t.pnl > 0 ? 'pos' : t.pnl < 0 ? 'neg' : 'neutral';
      return `
        <div class="${cls}">
          <div class="dow-chip-label">${hourLabel(i)}</div>
          <div class="dow-chip-pnl ${pnlCls}">${t.count ? fmtMoney(t.pnl) : '—'}</div>
          <div class="dow-chip-wl">${t.count ? t.wins + 'W ' + t.losses + 'L' : 'no trades'}</div>
        </div>
      `;
    }).join('');
  }

  function renderRDistribution() {
    const holder = $('r-dist-holder');
    const rrTrades = trades.filter(t => typeof t.rr === 'number' && !isNaN(t.rr));

    if (rrTrades.length === 0) {
      holder.innerHTML = '<div class="empty-state">Log trades to see your R-multiple distribution</div>';
      return;
    }

    const buckets = [
      { label: '< -2R', test: (r) => r < -2 },
      { label: '-2R to -1R', test: (r) => r >= -2 && r < -1 },
      { label: '-1R to 0R', test: (r) => r >= -1 && r < 0 },
      { label: '0R to 1R', test: (r) => r >= 0 && r < 1 },
      { label: '1R to 2R', test: (r) => r >= 1 && r < 2 },
      { label: '2R to 3R', test: (r) => r >= 2 && r < 3 },
      { label: '> 3R', test: (r) => r >= 3 }
    ].map(b => ({ ...b, count: 0 }));

    rrTrades.forEach(t => {
      const bucket = buckets.find(b => b.test(t.rr));
      if (bucket) bucket.count++;
    });

    const maxCount = Math.max(...buckets.map(b => b.count), 1);

    holder.innerHTML = buckets.map(b => {
      const pct = (b.count / maxCount) * 100;
      const cls = b.label.startsWith('-') || b.label.startsWith('<') ? 'neg' : b.label.startsWith('0') ? 'neutral' : 'pos';
      return `
        <div class="r-dist-row">
          <div class="r-dist-label">${b.label}</div>
          <div class="r-dist-track"><div class="r-dist-fill ${cls}" style="width:${b.count ? Math.max(pct, 4) : 0}%;"></div></div>
          <div class="r-dist-count">${b.count}</div>
        </div>
      `;
    }).join('');
  }

  function renderTagStats() {
    const holder = $('tag-grid');
    const tags = [...new Set(trades.map(t => t.tag).filter(Boolean))].sort();

    if (tags.length === 0) {
      holder.innerHTML = '<div class="empty-state">No setups logged yet</div>';
      return;
    }

    const totals = tags.map(tag => {
      const t = trades.filter(x => x.tag === tag);
      return { tag, total: t.reduce((s, x) => s + x.pnl, 0), count: t.length };
    });
    const withTrades = totals.filter(x => x.count > 0);
    const bestTag = withTrades.length ? withTrades.reduce((a, b) => (b.total > a.total ? b : a)).tag : null;

    const cards = tags.map(tag => {
      const t = trades.filter(x => x.tag === tag);
      const wins = t.filter(x => x.result === 'win');
      const losses = t.filter(x => x.result === 'loss');
      const bes = t.filter(x => x.result === 'be');
      const total = t.reduce((s, x) => s + x.pnl, 0);
      const decided = wins.length + losses.length;
      const winRate = decided ? ((wins.length / decided) * 100).toFixed(1) + '%' : '—';
      const avgPerTrade = total / t.length;
      const rrTrades = t.filter(x => typeof x.rr === 'number' && !isNaN(x.rr));
      const avgRR = rrTrades.length ? rrTrades.reduce((s, x) => s + x.rr, 0) / rrTrades.length : null;
      const pnlCls = total > 0 ? 'pos' : total < 0 ? 'neg' : 'neutral';
      const isBest = tag === bestTag && total > 0;
      const tagColor = confluenceColor(tag);

      return `
        <div class="instrument-card"${isBest ? ' style="border-color: var(--green);"' : ''}>
          <div class="instrument-card-head">
            <span class="instrument-card-name" style="color:${tagColor.border};">${escapeHtml(tag)}${isBest ? ' 🏆' : ''}</span>
            <span class="instrument-card-pnl ${pnlCls}">${fmtMoney(total)}</span>
          </div>
          <div class="instrument-card-rows">
            <div><div class="instrument-stat-label">Record</div><div class="instrument-stat-value">${wins.length}W ${losses.length}L${bes.length ? ' ' + bes.length + 'BE' : ''}</div></div>
            <div><div class="instrument-stat-label">Win Rate</div><div class="instrument-stat-value">${winRate}</div></div>
            <div><div class="instrument-stat-label">Trades</div><div class="instrument-stat-value">${t.length}</div></div>
            <div><div class="instrument-stat-label">Avg / Trade</div><div class="instrument-stat-value">${fmtMoney(avgPerTrade)}</div></div>
            <div><div class="instrument-stat-label">Avg R</div><div class="instrument-stat-value">${avgRR === null ? '—' : fmtRR(avgRR)}</div></div>
          </div>
        </div>
      `;
    });
    holder.innerHTML = cards.join('');
  }

  function renderDurationBreakdown() {
    const holder = $('duration-grid');
    const withDuration = trades.map(t => ({ t, dur: tradeDurationMinutes(t) })).filter(x => x.dur !== null);

    if (withDuration.length === 0) {
      holder.innerHTML = '<div class="empty-state">Log trades with entry and exit times to see hold-time performance</div>';
      return;
    }

    const bucketOrder = ['< 15m', '15m – 30m', '30m – 1h', '1h – 2h', '2h+'];
    const buckets = bucketOrder.map(label => ({ label, trades: [] }));
    withDuration.forEach(({ t, dur }) => {
      const label = durationBucket(dur);
      buckets.find(b => b.label === label).trades.push(t);
    });

    const nonEmpty = buckets.filter(b => b.trades.length > 0);
    const bestBucket = nonEmpty.length ? nonEmpty.reduce((a, b) => {
      const aTotal = a.trades.reduce((s, x) => s + x.pnl, 0);
      const bTotal = b.trades.reduce((s, x) => s + x.pnl, 0);
      return bTotal > aTotal ? b : a;
    }) : null;

    const cards = buckets.map(b => {
      const t = b.trades;
      if (t.length === 0) {
        return `
          <div class="instrument-card">
            <div class="instrument-card-head">
              <span class="instrument-card-name">${b.label}</span>
              <span class="instrument-card-pnl neutral">—</span>
            </div>
            <div class="instrument-card-rows"><div><div class="instrument-stat-label">Trades</div><div class="instrument-stat-value">0</div></div></div>
          </div>
        `;
      }
      const wins = t.filter(x => x.result === 'win');
      const losses = t.filter(x => x.result === 'loss');
      const bes = t.filter(x => x.result === 'be');
      const total = t.reduce((s, x) => s + x.pnl, 0);
      const decided = wins.length + losses.length;
      const winRate = decided ? ((wins.length / decided) * 100).toFixed(1) + '%' : '—';
      const avgPerTrade = total / t.length;
      const pnlCls = total > 0 ? 'pos' : total < 0 ? 'neg' : 'neutral';
      const isBest = bestBucket && b.label === bestBucket.label && total > 0;

      return `
        <div class="instrument-card"${isBest ? ' style="border-color: var(--green);"' : ''}>
          <div class="instrument-card-head">
            <span class="instrument-card-name">${b.label}${isBest ? ' 🏆' : ''}</span>
            <span class="instrument-card-pnl ${pnlCls}">${fmtMoney(total)}</span>
          </div>
          <div class="instrument-card-rows">
            <div><div class="instrument-stat-label">Record</div><div class="instrument-stat-value">${wins.length}W ${losses.length}L${bes.length ? ' ' + bes.length + 'BE' : ''}</div></div>
            <div><div class="instrument-stat-label">Win Rate</div><div class="instrument-stat-value">${winRate}</div></div>
            <div><div class="instrument-stat-label">Trades</div><div class="instrument-stat-value">${t.length}</div></div>
            <div><div class="instrument-stat-label">Avg / Trade</div><div class="instrument-stat-value">${fmtMoney(avgPerTrade)}</div></div>
          </div>
        </div>
      `;
    });
    holder.innerHTML = cards.join('');
  }

  function renderPlanAdherence() {
    const highlightsEl = $('adherence-highlights');
    const gridEl = $('adherence-grid');
    const withChecklist = trades.filter(t => t.questionsAnswered && t.questionsAnswered.length > 0);

    if (withChecklist.length === 0) {
      highlightsEl.innerHTML = '<div class="empty-state" style="grid-column:1/-1;">Log trades against a strategy with Yes/No checklist questions to see plan adherence</div>';
      gridEl.innerHTML = '';
      return;
    }

    const followedPlan = withChecklist.filter(t => t.questionsAnswered.every(qa => qa.answer === 'yes'));
    const deviated = withChecklist.filter(t => t.questionsAnswered.some(qa => qa.answer !== 'yes'));

    const groupStats = (group) => {
      const wins = group.filter(x => x.result === 'win');
      const losses = group.filter(x => x.result === 'loss');
      const bes = group.filter(x => x.result === 'be');
      const total = group.reduce((s, x) => s + x.pnl, 0);
      const decided = wins.length + losses.length;
      const winRate = decided ? ((wins.length / decided) * 100).toFixed(1) + '%' : '—';
      const avgPerTrade = group.length ? total / group.length : 0;
      return { count: group.length, wins: wins.length, losses: losses.length, bes: bes.length, total, winRate, avgPerTrade };
    };

    const fStats = groupStats(followedPlan);
    const dStats = groupStats(deviated);
    const adherenceRate = ((followedPlan.length / withChecklist.length) * 100).toFixed(1) + '%';

    highlightsEl.innerHTML = `
      <div class="dow-highlight best">
        <div class="dow-highlight-label">Followed Plan (${adherenceRate} of logged trades)</div>
        <div class="dow-highlight-day">${fStats.winRate} win rate</div>
        <div class="dow-highlight-detail">${fmtMoney(fStats.total)} · ${fStats.wins}W / ${fStats.losses}L${fStats.bes ? ' / ' + fStats.bes + ' BE' : ''} · ${fmtMoney(fStats.avgPerTrade)}/trade</div>
      </div>
      <div class="dow-highlight worst">
        <div class="dow-highlight-label">Deviated From Plan</div>
        <div class="dow-highlight-day">${dStats.winRate} win rate</div>
        <div class="dow-highlight-detail">${fmtMoney(dStats.total)} · ${dStats.wins}W / ${dStats.losses}L${dStats.bes ? ' / ' + dStats.bes + ' BE' : ''} · ${fmtMoney(dStats.avgPerTrade)}/trade</div>
      </div>
    `;

    const tagsWithChecklist = [...new Set(withChecklist.map(t => t.tag).filter(Boolean))].sort();
    if (tagsWithChecklist.length === 0) {
      gridEl.innerHTML = '';
      return;
    }

    const cards = tagsWithChecklist.map(tag => {
      const t = withChecklist.filter(x => x.tag === tag);
      const followed = t.filter(x => x.questionsAnswered.every(qa => qa.answer === 'yes'));
      const dev = t.filter(x => x.questionsAnswered.some(qa => qa.answer !== 'yes'));
      const fs = groupStats(followed);
      const ds = groupStats(dev);
      const rate = ((followed.length / t.length) * 100).toFixed(1) + '%';
      const tagColor = confluenceColor(tag);

      return `
        <div class="instrument-card">
          <div class="instrument-card-head">
            <span class="instrument-card-name" style="color:${tagColor.border};">${escapeHtml(tag)}</span>
            <span class="instrument-card-pnl neutral">${rate} adherence</span>
          </div>
          <div class="instrument-card-rows">
            <div><div class="instrument-stat-label">Checklist Trades</div><div class="instrument-stat-value">${t.length}</div></div>
            <div><div class="instrument-stat-label">Followed</div><div class="instrument-stat-value">${followed.length} (${fs.winRate} WR)</div></div>
            <div><div class="instrument-stat-label">Deviated</div><div class="instrument-stat-value">${dev.length ? dev.length + ' (' + ds.winRate + ' WR)' : '—'}</div></div>
            <div><div class="instrument-stat-label">Avg P&amp;L Followed</div><div class="instrument-stat-value">${fmtMoney(fs.avgPerTrade)}</div></div>
          </div>
        </div>
      `;
    });
    gridEl.innerHTML = cards.join('');
  }

  function renderGradeAccuracy() {
    const holder = $('grade-grid');
    const gradeOrder = ['B', 'B+', 'A-', 'A', 'A+', 'A+++'];
    const gradesUsed = gradeOrder.filter(g => trades.some(t => t.grade === g));

    if (gradesUsed.length === 0) {
      holder.innerHTML = '<div class="empty-state">Log trades to see how your grading matches results</div>';
      return;
    }

    const totals = gradesUsed.map(g => {
      const t = trades.filter(x => x.grade === g);
      return { g, avg: t.reduce((s, x) => s + x.pnl, 0) / t.length };
    });
    // "Accurate" grading means avg P&L rises as grade rises. Flag the grade whose average P&L breaks that order.
    const bestAvg = Math.max(...totals.map(x => x.avg));

    const cards = gradesUsed.map(g => {
      const t = trades.filter(x => x.grade === g);
      const wins = t.filter(x => x.result === 'win');
      const losses = t.filter(x => x.result === 'loss');
      const bes = t.filter(x => x.result === 'be');
      const total = t.reduce((s, x) => s + x.pnl, 0);
      const decided = wins.length + losses.length;
      const winRate = decided ? ((wins.length / decided) * 100).toFixed(1) + '%' : '—';
      const avgPerTrade = total / t.length;
      const pnlCls = avgPerTrade > 0 ? 'pos' : avgPerTrade < 0 ? 'neg' : 'neutral';
      const gs = GRADE_STYLES[g] || { border: 'var(--muted)' };
      const isBest = avgPerTrade === bestAvg && avgPerTrade > 0;

      return `
        <div class="instrument-card"${isBest ? ' style="border-color: var(--green);"' : ''}>
          <div class="instrument-card-head">
            <span class="instrument-card-name" style="color:${gs.border};">Grade ${g}${isBest ? ' 🏆' : ''}</span>
            <span class="instrument-card-pnl ${pnlCls}">${fmtMoney(avgPerTrade)}/trade</span>
          </div>
          <div class="instrument-card-rows">
            <div><div class="instrument-stat-label">Record</div><div class="instrument-stat-value">${wins.length}W ${losses.length}L${bes.length ? ' ' + bes.length + 'BE' : ''}</div></div>
            <div><div class="instrument-stat-label">Win Rate</div><div class="instrument-stat-value">${winRate}</div></div>
            <div><div class="instrument-stat-label">Trades</div><div class="instrument-stat-value">${t.length}</div></div>
            <div><div class="instrument-stat-label">Total P&L</div><div class="instrument-stat-value">${fmtMoney(total)}</div></div>
          </div>
        </div>
      `;
    });
    holder.innerHTML = cards.join('');
  }

  function renderMindsetStats() {
    const holder = $('mindset-grid');
    const tagsUsed = [...new Set(trades.flatMap(t => t.mindsetTags || []))].sort();

    if (tagsUsed.length === 0) {
      holder.innerHTML = '<div class="empty-state">Tag trades with a mindset label (FOMO, Revenge Trade, Disciplined, etc.) to see how they affect results</div>';
      return;
    }

    const cards = tagsUsed.map(tag => {
      const t = trades.filter(x => (x.mindsetTags || []).includes(tag));
      const wins = t.filter(x => x.result === 'win');
      const losses = t.filter(x => x.result === 'loss');
      const bes = t.filter(x => x.result === 'be');
      const total = t.reduce((s, x) => s + x.pnl, 0);
      const decided = wins.length + losses.length;
      const winRate = decided ? ((wins.length / decided) * 100).toFixed(1) + '%' : '—';
      const avgPerTrade = total / t.length;
      const pnlCls = total > 0 ? 'pos' : total < 0 ? 'neg' : 'neutral';
      const tagColor = mindsetColor();

      return `
        <div class="instrument-card">
          <div class="instrument-card-head">
            <span class="instrument-card-name" style="color:${tagColor.border};">${escapeHtml(tag)}</span>
            <span class="instrument-card-pnl ${pnlCls}">${fmtMoney(total)}</span>
          </div>
          <div class="instrument-card-rows">
            <div><div class="instrument-stat-label">Record</div><div class="instrument-stat-value">${wins.length}W ${losses.length}L${bes.length ? ' ' + bes.length + 'BE' : ''}</div></div>
            <div><div class="instrument-stat-label">Win Rate</div><div class="instrument-stat-value">${winRate}</div></div>
            <div><div class="instrument-stat-label">Trades</div><div class="instrument-stat-value">${t.length}</div></div>
            <div><div class="instrument-stat-label">Avg / Trade</div><div class="instrument-stat-value">${fmtMoney(avgPerTrade)}</div></div>
          </div>
        </div>
      `;
    });
    holder.innerHTML = cards.join('');
  }

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  (async function init() {
    await loadAccounts();
    await loadBalance();
    await loadStrategies();
    await loadTrades();
  })();
})();
