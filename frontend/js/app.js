/**
 * Sahayak — Core App JavaScript
 * Handles: auth, API calls, theme, sidebar, toasts, language switcher
 */

const API = 'http://localhost:8000';

// ── State ──────────────────────────────────────────────────────────────────────
const state = {
  token: localStorage.getItem('sahayak_token') || null,
  user: JSON.parse(localStorage.getItem('sahayak_user') || 'null'),
  theme: localStorage.getItem('sahayak_theme') || 'dark',
  language: localStorage.getItem('sahayak_lang') || 'en',
};

// ── i18n Labels ────────────────────────────────────────────────────────────────
const LABELS = {
  en: {
    dashboard: 'Dashboard', chat: 'Chat', workers: 'Workers',
    analytics: 'Analytics', sessions: 'Sessions', disputes: 'Disputes',
    fraud: 'Fraud Alerts', settings: 'Settings',
    search_placeholder: 'Search workers, jobs, skills...',
    available: 'Available', busy: 'Busy', today: 'Available Today',
    verified: 'Verified', pending: 'Pending', rejected: 'Rejected',
    find_worker: 'Find Worker', salary_check: 'Salary Check',
    register: 'Register', emergency: 'Emergency',
    logout: 'Logout', login: 'Login',
  },
  hi: {
    dashboard: 'डैशबोर्ड', chat: 'चैट', workers: 'कर्मचारी',
    analytics: 'विश्लेषण', sessions: 'सत्र', disputes: 'विवाद',
    fraud: 'धोखाधड़ी', settings: 'सेटिंग्स',
    search_placeholder: 'कर्मचारी, काम, कौशल खोजें...',
    available: 'उपलब्ध', busy: 'व्यस्त', today: 'आज उपलब्ध',
    verified: 'सत्यापित', pending: 'लंबित', rejected: 'अस्वीकृत',
    find_worker: 'कर्मचारी खोजें', salary_check: 'वेतन जांचें',
    register: 'पंजीकरण', emergency: 'आपातकाल',
    logout: 'लॉग आउट', login: 'लॉग इन',
  },
  mr: {
    dashboard: 'डॅशबोर्ड', chat: 'संवाद', workers: 'कामगार',
    analytics: 'विश्लेषण', settings: 'सेटिंग्ज',
    search_placeholder: 'कामगार, नोकरी शोधा...',
    available: 'उपलब्ध', busy: 'व्यस्त',
    find_worker: 'कामगार शोधा', logout: 'बाहेर पडा',
  },
  bn: {
    dashboard: 'ড্যাশবোর্ড', chat: 'চ্যাট', workers: 'কর্মীরা',
    settings: 'সেটিংস', available: 'উপলব্ধ', busy: 'ব্যস্ত',
    find_worker: 'কর্মী খুঁজুন', logout: 'লগআউট',
  },
  ta: {
    dashboard: 'டாஷ்போர்டு', chat: 'அரட்டை', workers: 'தொழிலாளர்கள்',
    settings: 'அமைப்புகள்', available: 'கிடைக்கும்',
    find_worker: 'தொழிலாளர் கண்டறி', logout: 'வெளியேறு',
  },
  te: {
    dashboard: 'డాష్‌బోర్డు', chat: 'చాట్', workers: 'కార్మికులు',
    settings: 'సెట్టింగ్‌లు', available: 'అందుబాటులో',
    find_worker: 'కార్మికుడిని కనుగొను', logout: 'లాగ్ అవుట్',
  },
  gu: {
    dashboard: 'ડૅશબોર્ડ', chat: 'ચેટ', workers: 'કામદારો',
    settings: 'સેટિંગ્સ', available: 'ઉપલબ્ધ',
    find_worker: 'કામદાર શોધો', logout: 'લૉગ આઉટ',
  },
};

function t(key) {
  const lang = state.language;
  return (LABELS[lang] && LABELS[lang][key]) || LABELS.en[key] || key;
}

// ── API Helper ─────────────────────────────────────────────────────────────────
async function apiCall(method, path, body = null, formData = false) {
  const headers = {};
  if (state.token) headers['Authorization'] = `Bearer ${state.token}`;
  if (!formData) headers['Content-Type'] = 'application/json';

  const options = { method, headers };
  if (body) options.body = formData ? body : JSON.stringify(body);

  try {
    const res = await fetch(`${API}${path}`, options);
    if (res.status === 401) {
      // Auto-logout on token expiry
      logout(false);
      return null;
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (e) {
    console.error(`API ${method} ${path}:`, e.message);
    throw e;
  }
}

const api = {
  get:    (path) => apiCall('GET', path),
  post:   (path, body) => apiCall('POST', path, body),
  patch:  (path, body) => apiCall('PATCH', path, body),
  upload: (path, fd) => apiCall('POST', path, fd, true),
};

// ── Auth ───────────────────────────────────────────────────────────────────────
async function login(username, password) {
  const fd = new URLSearchParams();
  fd.append('username', username);
  fd.append('password', password);

  const res = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: fd,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Login failed');
  }

  const data = await res.json();
  state.token = data.access_token;
  state.user = data.user;
  localStorage.setItem('sahayak_token', data.access_token);
  localStorage.setItem('sahayak_user', JSON.stringify(data.user));
  return data;
}

function logout(redirect = true) {
  state.token = null;
  state.user = null;
  localStorage.removeItem('sahayak_token');
  localStorage.removeItem('sahayak_user');
  if (redirect) window.location.href = '/login.html';
}

function requireAuth() {
  if (!state.token) {
    window.location.href = '/login.html';
    return false;
  }
  return true;
}

// ── Theme ──────────────────────────────────────────────────────────────────────
function applyTheme(theme) {
  state.theme = theme;
  localStorage.setItem('sahayak_theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
}

// ── Toast Notifications ────────────────────────────────────────────────────────
function showToast(message, type = 'info', duration = 4000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || '•'}</span><span>${message}</span>`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideInRight 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ── Sidebar ────────────────────────────────────────────────────────────────────
function buildSidebar(activePage) {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const navItems = [
    { icon: '📊', label: t('dashboard'), href: '/', page: 'dashboard' },
    { icon: '💬', label: t('chat'), href: '/chat.html', page: 'chat' },
    { icon: '👷', label: t('workers'), href: '/workers.html', page: 'workers' },
    { icon: '💼', label: 'Jobs', href: '/jobs.html', page: 'jobs' },
    { icon: '📈', label: t('analytics'), href: '/analytics.html', page: 'analytics' },
    { icon: '📋', label: t('sessions'), href: '/sessions.html', page: 'sessions' },
    { icon: '⚖️', label: t('disputes'), href: '/disputes.html', page: 'disputes', badge: 3 },
    { icon: '🚨', label: t('fraud'), href: '/fraud.html', page: 'fraud', badge: 2 },
    { icon: '⚙️', label: t('settings'), href: '/settings.html', page: 'settings' },
  ];

  const user = state.user || { username: 'Admin', role: 'admin' };
  const initial = (user.username || 'A')[0].toUpperCase();

  sidebar.innerHTML = `
    <div class="sidebar-logo">
      <div class="logo-icon">🤖</div>
      <div>
        <div class="logo-text">Sahayak</div>
        <div style="font-size:11px;color:var(--text-muted)">BlueCollar AI</div>
      </div>
      <div class="logo-version">v2</div>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-section-label">Main</div>
      ${navItems.slice(0, 4).map(item => `
        <a class="nav-item ${activePage === item.page ? 'active' : ''}" href="${item.href}" id="nav-${item.page}">
          <span class="nav-icon">${item.icon}</span>
          <span>${item.label}</span>
          ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
        </a>
      `).join('')}
      <div class="nav-section-label">Management</div>
      ${navItems.slice(4, 8).map(item => `
        <a class="nav-item ${activePage === item.page ? 'active' : ''}" href="${item.href}" id="nav-${item.page}">
          <span class="nav-icon">${item.icon}</span>
          <span>${item.label}</span>
          ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
        </a>
      `).join('')}
      <div class="nav-section-label">System</div>
      <a class="nav-item ${activePage === 'settings' ? 'active' : ''}" href="/settings.html" id="nav-settings">
        <span class="nav-icon">⚙️</span><span>${t('settings')}</span>
      </a>
    </nav>
    <div class="sidebar-footer">
      <div class="sidebar-user" onclick="showLogoutMenu(this)">
        <div class="user-avatar">${initial}</div>
        <div class="user-info">
          <div class="user-name">${user.username || 'Admin'}</div>
          <div class="user-role">${user.role || 'admin'}</div>
        </div>
        <span style="color:var(--text-muted);font-size:14px">⋮</span>
      </div>
    </div>
  `;
}

function showLogoutMenu(el) {
  const existing = document.getElementById('logout-dropdown');
  if (existing) { existing.remove(); return; }

  const dropdown = document.createElement('div');
  dropdown.id = 'logout-dropdown';
  dropdown.className = 'dropdown-menu';
  dropdown.style.bottom = '70px';
  dropdown.style.left = '12px';
  dropdown.style.right = '12px';
  dropdown.innerHTML = `
    <div class="dropdown-item" onclick="toggleTheme()">🌙 Toggle Theme</div>
    <div class="dropdown-item" onclick="logout()">🚪 ${t('logout')}</div>
  `;

  el.closest('.sidebar-footer').appendChild(dropdown);

  setTimeout(() => {
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && e.target !== el) dropdown.remove();
    }, { once: true });
  }, 10);
}

function toggleTheme() {
  applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  showToast(`Switched to ${state.theme} theme`, 'info', 2000);
}

// ── Topbar ─────────────────────────────────────────────────────────────────────
function buildTopbar(title, subtitle) {
  const topbar = document.getElementById('topbar');
  if (!topbar) return;

  topbar.innerHTML = `
    <button class="btn-icon" id="menu-toggle" onclick="toggleMobileSidebar()" title="Menu">☰</button>
    <div class="topbar-title">${title}</div>
    <div class="topbar-actions">
      <div class="flex items-center gap-8">
        <div class="online-dot" title="System online"></div>
        <span class="text-sm text-muted" id="connection-status">Online</span>
      </div>
      <div class="lang-switcher" onclick="showLangPicker(this)" title="Change language">
        🌐 ${getLanguageName(state.language)}
      </div>
      <button class="btn-icon" onclick="toggleTheme()" title="Toggle theme">
        ${state.theme === 'dark' ? '☀️' : '🌙'}
      </button>
      <button class="btn-icon" onclick="window.location.href='/chat.html'" title="Open Chat">
        💬
        <span class="notification-dot"></span>
      </button>
    </div>
  `;
}

function toggleMobileSidebar() {
  document.getElementById('sidebar')?.classList.toggle('mobile-open');
}

function getLanguageName(code) {
  const names = {
    en: 'English', hi: 'हिन्दी', mr: 'मराठी', bn: 'বাংলা',
    ta: 'தமிழ்', te: 'తెలుగు', gu: 'ગુજ', kn: 'ಕನ್ನಡ', pa: 'ਪੰਜਾਬੀ',
  };
  return names[code] || 'English';
}

function showLangPicker(el) {
  const existing = document.getElementById('lang-dropdown');
  if (existing) { existing.remove(); return; }

  const langs = [
    { code: 'en', name: 'English 🇬🇧' },
    { code: 'hi', name: 'हिन्दी 🇮🇳' },
    { code: 'mr', name: 'मराठी' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'gu', name: 'ગુજરાતી' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ' },
  ];

  const dropdown = document.createElement('div');
  dropdown.id = 'lang-dropdown';
  dropdown.className = 'dropdown-menu';
  dropdown.style.right = '0';
  dropdown.innerHTML = langs.map(l => `
    <div class="dropdown-item ${l.code === state.language ? 'font-bold' : ''}" 
         onclick="setLanguage('${l.code}')">
      ${l.code === state.language ? '✓ ' : ''}${l.name}
    </div>
  `).join('');

  el.style.position = 'relative';
  el.appendChild(dropdown);

  setTimeout(() => {
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) dropdown.remove();
    }, { once: true });
  }, 10);
}

function setLanguage(code) {
  state.language = code;
  localStorage.setItem('sahayak_lang', code);
  showToast(`Language set to ${getLanguageName(code)}`, 'success', 2000);
  // Rebuild UI elements that show translated text
  const sidebar = document.getElementById('sidebar');
  if (sidebar) buildSidebar(window.ACTIVE_PAGE || 'dashboard');
  document.getElementById('lang-dropdown')?.remove();
}

// ── Number Formatting ──────────────────────────────────────────────────────────
function formatNumber(n) {
  if (n >= 10000000) return (n / 10000000).toFixed(1) + 'Cr';
  if (n >= 100000)   return (n / 100000).toFixed(1) + 'L';
  if (n >= 1000)     return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

function formatINR(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

function formatTime(isoStr) {
  if (!isoStr) return '-';
  return new Date(isoStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(isoStr) {
  if (!isoStr) return '-';
  return new Date(isoStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function timeAgo(isoStr) {
  const diff = Date.now() - new Date(isoStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Availability Badge ─────────────────────────────────────────────────────────
function availBadge(avail) {
  if (!avail) return '<span class="badge badge-default">Unknown</span>';
  const a = avail.toLowerCase();
  if (a.includes('today'))   return `<span class="badge badge-warning">🟡 Today</span>`;
  if (a.includes('available')) return `<span class="badge badge-success">🟢 Available</span>`;
  if (a.includes('busy'))    return `<span class="badge badge-danger">🔴 Busy</span>`;
  return `<span class="badge badge-default">${avail}</span>`;
}

// ── Stars ──────────────────────────────────────────────────────────────────────
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

// ── Connectivity Monitor ───────────────────────────────────────────────────────
window.addEventListener('online',  () => {
  document.getElementById('connection-status').textContent = 'Online';
  showToast('Back online! Syncing...', 'success', 2000);
});

window.addEventListener('offline', () => {
  document.getElementById('connection-status').textContent = 'Offline';
  showToast('You are offline. Messages will be queued.', 'warning', 5000);
});

// ── Init ───────────────────────────────────────────────────────────────────────
(function init() {
  applyTheme(state.theme);

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/static/sw.js').catch(() => {});
  }
})();
