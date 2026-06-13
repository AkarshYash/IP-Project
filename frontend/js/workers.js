/**
 * Sahayak — Workers Page JavaScript
 * Semantic search, filtering, resume download, verification
 */

let allWorkers = [];
let currentPage = 1;
const PAGE_SIZE = 12;
let totalWorkers = 0;
let activeFilters = {};

// ── Load Workers ────────────────────────────────────────────────────────────────
async function loadWorkers(page = 1) {
  currentPage = page;
  const grid = document.getElementById('workers-grid');
  if (!grid) return;

  grid.innerHTML = '<div class="spinner"></div>';

  try {
    const params = new URLSearchParams({
      page,
      limit: PAGE_SIZE,
      ...activeFilters,
    });

    const data = await api.get(`/api/workers/?${params}`);
    allWorkers = data.workers || [];
    totalWorkers = data.total || 0;

    renderWorkers(allWorkers);
    updateWorkerStats(data);
    renderPagination(totalWorkers, page);
  } catch (e) {
    grid.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-muted)">
      ❌ Failed to load workers: ${e.message}<br>
      <button class="btn btn-secondary mt-16" onclick="loadWorkers()">Retry</button>
    </div>`;
  }
}

async function searchWorkers(query) {
  if (!query || query.length < 2) { loadWorkers(); return; }

  const grid = document.getElementById('workers-grid');
  grid.innerHTML = '<div class="spinner"></div>';

  try {
    const params = new URLSearchParams({ q: query, top_k: PAGE_SIZE, ...activeFilters });
    const data = await api.get(`/api/workers/search?${params}`);
    allWorkers = data.results || [];
    renderWorkers(allWorkers, true);
    document.getElementById('worker-count').textContent = `${data.count} results for "${query}"`;
  } catch (e) {
    showToast('Search failed: ' + e.message, 'error');
  }
}

// ── Render ─────────────────────────────────────────────────────────────────────
function renderWorkers(workers, isSearch = false) {
  const grid = document.getElementById('workers-grid');
  if (!grid) return;

  if (!workers.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-muted)">
      🔍 No workers found. Try different search terms or filters.
    </div>`;
    return;
  }

  grid.innerHTML = workers.map(w => renderWorkerCard(w)).join('');

  if (!isSearch) {
    document.getElementById('worker-count').textContent =
      `Showing ${workers.length} of ${totalWorkers} workers`;
  }
}

function renderWorkerCard(w) {
  const initial = (w.full_name || 'W')[0].toUpperCase();
  const avail = w.availability || '';
  const availClass = avail.toLowerCase().includes('today') ? 'today'
    : avail.toLowerCase().includes('busy') ? 'busy' : 'available';

  const stars = Math.round(parseFloat(w.rating || 0));
  const starsHtml = '★'.repeat(stars) + '☆'.repeat(5 - stars);

  const matchScore = w.match_score ? `
    <div class="worker-tag">🎯 ${Math.round(w.match_score * 100)}% match</div>
  ` : '';

  return `
    <div class="worker-card" onclick="openWorkerModal('${w.worker_id}')">
      <div class="worker-header">
        <div class="worker-avatar">
          ${initial}
          <div class="worker-availability ${availClass}"></div>
        </div>
        <div>
          <div class="worker-name">${escHtml(w.full_name || 'Unknown')}</div>
          <div class="worker-designation">${escHtml(w.designation || '')}</div>
          <div class="worker-rating">
            <span class="stars">${starsHtml}</span>
            <span style="color:var(--text-secondary)">${w.rating || 0} (${w.reviews_count || 0})</span>
          </div>
        </div>
      </div>
      <div class="worker-meta">
        <div class="worker-tag">📍 ${escHtml(w.city || '')}, ${escHtml(w.state || '')}</div>
        <div class="worker-tag">⏱️ ${w.experience_years || 0} yrs</div>
        <div class="worker-tag">🌐 ${escHtml((w.languages_known || 'Hindi').split(',')[0].trim())}</div>
        ${availBadge(w.availability)}
        ${matchScore}
      </div>
      <div class="worker-rate">
        ₹${w.hourly_rate_inr || 0}<span>/hr</span>
      </div>
      <div class="flex gap-8 mt-16">
        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();openWorkerModal('${w.worker_id}')">
          👁️ View
        </button>
        <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();chatAboutWorker('${w.worker_id}','${escHtml(w.full_name)}')">
          💬 Enquire
        </button>
        <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();downloadResume('${w.worker_id}')">
          📄 Resume
        </button>
      </div>
    </div>
  `;
}

// ── Worker Modal ───────────────────────────────────────────────────────────────
async function openWorkerModal(workerId) {
  const modal = document.getElementById('worker-modal');
  if (!modal) return;

  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal">
      <div class="spinner"></div>
    </div>
  `;

  try {
    const w = await api.get(`/api/workers/${workerId}`);
    renderWorkerModal(w);
  } catch (e) {
    modal.querySelector('.modal').innerHTML = `<p>Error: ${e.message}</p>`;
  }
}

function renderWorkerModal(w) {
  const modal = document.getElementById('worker-modal');
  const stars = '★'.repeat(Math.round(w.rating || 0)) + '☆'.repeat(5 - Math.round(w.rating || 0));

  modal.innerHTML = `
    <div class="modal" style="max-width:560px">
      <div class="modal-header">
        <div class="modal-title">👷 Worker Profile</div>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">
        <div style="width:64px;height:64px;border-radius:50%;background:var(--grad-hero);
             display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;color:white">
          ${(w.full_name || 'W')[0]}
        </div>
        <div>
          <div style="font-size:20px;font-weight:700;color:var(--text-primary)">${escHtml(w.full_name || '')}</div>
          <div style="color:var(--saffron);font-weight:600">${escHtml(w.designation || '')}</div>
          <div style="display:flex;align-items:center;gap:8px;margin-top:4px">
            <span class="stars" style="color:var(--amber-light)">${stars}</span>
            <span style="font-size:14px;color:var(--text-muted)">${w.rating} (${w.reviews_count} reviews)</span>
          </div>
        </div>
        <div style="margin-left:auto">${availBadge(w.availability)}</div>
      </div>

      <div class="grid-2" style="gap:12px;margin-bottom:16px">
        <div style="background:var(--bg-input);border-radius:var(--radius-md);padding:12px">
          <div class="text-xs text-muted">Hourly Rate</div>
          <div style="font-size:20px;font-weight:700;color:var(--emerald-light)">₹${w.hourly_rate_inr}/hr</div>
        </div>
        <div style="background:var(--bg-input);border-radius:var(--radius-md);padding:12px">
          <div class="text-xs text-muted">Experience</div>
          <div style="font-size:20px;font-weight:700;color:var(--text-primary)">${w.experience_years} years</div>
        </div>
      </div>

      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px">
        <div class="worker-tag">📍 ${escHtml(w.city)}, ${escHtml(w.state)}</div>
        <div class="worker-tag">🌐 ${escHtml(w.languages_known || '')}</div>
        <div class="worker-tag">💳 ${escHtml(w.payment_method || 'UPI')}</div>
        <span class="badge ${w.verification_status === 'verified' ? 'badge-success' : 'badge-warning'}">
          ${w.verification_status === 'verified' ? '✅ Verified' : '⏳ ' + w.verification_status}
        </span>
      </div>

      ${w.profile_summary ? `
        <div style="background:var(--bg-input);border-radius:var(--radius-md);padding:12px;margin-bottom:16px">
          <div class="text-xs text-muted" style="margin-bottom:6px">About</div>
          <p style="font-size:14px;color:var(--text-secondary)">${escHtml(w.profile_summary)}</p>
        </div>
      ` : ''}

      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="chatAboutWorker('${w.worker_id}','${escHtml(w.full_name)}');closeModal()">
          💬 Enquire via Chat
        </button>
        <button class="btn btn-secondary" onclick="downloadResume('${w.worker_id}')">
          📄 Download Resume
        </button>
        <button class="btn btn-ghost" onclick="closeModal()">Close</button>
      </div>
    </div>
  `;
}

function closeModal() {
  document.getElementById('worker-modal').style.display = 'none';
}

// ── Resume Download ─────────────────────────────────────────────────────────────
async function downloadResume(workerId) {
  showToast('Generating resume card...', 'info', 2000);

  try {
    const w = await api.get(`/api/workers/${workerId}`);

    // Create canvas-based resume
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 800, 500);
    grad.addColorStop(0, '#0B0F1A');
    grad.addColorStop(1, '#1A2235');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 500);

    // Accent stripe
    const accentGrad = ctx.createLinearGradient(0, 0, 200, 0);
    accentGrad.addColorStop(0, '#FF6B35');
    accentGrad.addColorStop(1, '#2563EB');
    ctx.fillStyle = accentGrad;
    ctx.fillRect(0, 0, 8, 500);

    // Logo text
    ctx.fillStyle = '#FF6B35';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('SAHAYAK', 30, 40);
    ctx.fillStyle = '#64748B';
    ctx.font = '12px Arial';
    ctx.fillText('BlueCollar AI Platform', 30, 60);

    // Avatar circle
    ctx.beginPath();
    ctx.arc(700, 80, 50, 0, 2 * Math.PI);
    ctx.fillStyle = '#FF6B35';
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText((w.full_name || 'W')[0], 700, 95);
    ctx.textAlign = 'left';

    // Worker ID badge
    ctx.fillStyle = '#1A2235';
    ctx.fillRect(580, 140, 180, 30);
    ctx.fillStyle = '#FF6B35';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(w.worker_id, 590, 160);

    // Name & Designation
    ctx.fillStyle = '#F1F5F9';
    ctx.font = 'bold 36px Arial';
    ctx.fillText(w.full_name || '', 30, 130);
    ctx.fillStyle = '#FF6B35';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(w.designation || '', 30, 165);

    // Stars
    ctx.fillStyle = '#F59E0B';
    ctx.font = '20px Arial';
    const stars = '★'.repeat(Math.round(w.rating || 0)) + '☆'.repeat(5 - Math.round(w.rating || 0));
    ctx.fillText(stars + '  ' + w.rating + '/5.0', 30, 200);

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, 220); ctx.lineTo(770, 220);
    ctx.stroke();

    // Details
    const details = [
      { label: '📍 Location', value: `${w.city}, ${w.state}` },
      { label: '💰 Rate', value: `₹${w.hourly_rate_inr}/hour` },
      { label: '⏱️ Experience', value: `${w.experience_years} years` },
      { label: '🌐 Languages', value: (w.languages_known || '').split(',').slice(0, 2).join(', ') },
      { label: '💳 Payment', value: w.payment_method || 'UPI' },
      { label: '✅ Status', value: w.availability || 'Available' },
    ];

    ctx.font = '13px Arial';
    details.forEach((d, i) => {
      const col = i % 2 === 0 ? 30 : 420;
      const row = 260 + Math.floor(i / 2) * 50;
      ctx.fillStyle = '#64748B';
      ctx.fillText(d.label, col, row);
      ctx.fillStyle = '#F1F5F9';
      ctx.font = 'bold 15px Arial';
      ctx.fillText(d.value, col, row + 20);
      ctx.font = '13px Arial';
    });

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(0, 460, 800, 40);
    ctx.fillStyle = '#94A3B8';
    ctx.font = '12px Arial';
    ctx.fillText('Generated by Sahayak AI | sahayak.ai | Verified Worker Platform', 30, 484);

    // Download
    const link = document.createElement('a');
    link.download = `${w.worker_id}_${(w.full_name || '').replace(/\s/g, '_')}_resume.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    showToast('Resume downloaded!', 'success');
  } catch (e) {
    showToast('Resume generation failed: ' + e.message, 'error');
  }
}

function chatAboutWorker(workerId, name) {
  const msg = `I want to hire ${name} (${workerId}). Can you help me proceed?`;
  sessionStorage.setItem('sahayak_prefill', msg);
  window.location.href = '/chat.html';
}

// ── Filters ────────────────────────────────────────────────────────────────────
async function loadFilterOptions() {
  try {
    const [desigData, cityData] = await Promise.all([
      api.get('/api/workers/designations'),
      api.get('/api/workers/cities'),
    ]);

    const desigSel = document.getElementById('filter-designation');
    const citySel = document.getElementById('filter-city');

    if (desigSel && desigData.designations) {
      desigSel.innerHTML = '<option value="">All Designations</option>' +
        desigData.designations.map(d => `<option value="${escHtml(d)}">${escHtml(d)}</option>`).join('');
    }

    if (citySel && cityData.cities) {
      citySel.innerHTML = '<option value="">All Cities</option>' +
        cityData.cities.map(c => `<option value="${escHtml(c)}">${escHtml(c)}</option>`).join('');
    }
  } catch (e) {
    console.warn('Filter options load failed:', e);
  }
}

function applyFilters() {
  const designation = document.getElementById('filter-designation')?.value;
  const city = document.getElementById('filter-city')?.value;
  const minRating = document.getElementById('filter-rating')?.value;
  const availability = document.getElementById('filter-availability')?.value;

  activeFilters = {};
  if (designation) activeFilters.designation = designation;
  if (city) activeFilters.city = city;
  if (minRating) activeFilters.min_rating = minRating;
  if (availability) activeFilters.availability = availability;

  loadWorkers(1);
}

function clearFilters() {
  activeFilters = {};
  ['filter-designation', 'filter-city', 'filter-rating', 'filter-availability'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  loadWorkers(1);
}

// ── Pagination ─────────────────────────────────────────────────────────────────
function renderPagination(total, current) {
  const container = document.getElementById('pagination');
  if (!container) return;

  const pages = Math.ceil(total / PAGE_SIZE);
  if (pages <= 1) { container.innerHTML = ''; return; }

  let html = '';
  if (current > 1) html += `<button class="page-btn" onclick="loadWorkers(${current - 1})">‹</button>`;

  const start = Math.max(1, current - 2);
  const end = Math.min(pages, current + 2);

  for (let i = start; i <= end; i++) {
    html += `<button class="page-btn ${i === current ? 'active' : ''}" onclick="loadWorkers(${i})">${i}</button>`;
  }

  if (current < pages) html += `<button class="page-btn" onclick="loadWorkers(${current + 1})">›</button>`;

  container.innerHTML = html;
}

// ── Stats ──────────────────────────────────────────────────────────────────────
async function updateWorkerStats(data) {
  try {
    const stats = await api.get('/api/workers/stats');
    const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    el('stat-total', formatNumber(stats.total || data.total || 0));
    el('stat-available', formatNumber(stats.available || 0));
    el('stat-avg-rating', stats.avg_rating || '4.2');
    el('stat-designations', stats.designations || 0);
    el('stat-cities', stats.cities || 0);
    el('stat-avg-rate', '₹' + (stats.avg_hourly_rate || 0));
  } catch (e) {}
}

// ── Utils ──────────────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Search Debounce ────────────────────────────────────────────────────────────
let searchTimeout;
function handleSearch(query) {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => searchWorkers(query), 400);
}
