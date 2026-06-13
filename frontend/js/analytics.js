/**
 * Sahayak — Analytics Page JavaScript
 * Charts using Chart.js (CDN), KPIs, intent distribution
 */

let charts = {};

async function loadAnalytics() {
  try {
    const data = await api.get('/api/analytics/dashboard');
    renderKPIs(data.kpis);
    renderHourlyChart(data.hourly_messages);
    renderIntentChart(data.intent_distribution);
    renderLanguageChart(data.language_distribution);
    renderWorkerStats(data.worker_stats);
  } catch (e) {
    showToast('Analytics load failed: ' + e.message, 'error');
  }
}

function renderKPIs(kpis) {
  const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  el('kpi-conversations', formatNumber(kpis.total_conversations));
  el('kpi-messages', formatNumber(kpis.total_messages));
  el('kpi-today-conv', formatNumber(kpis.today_conversations));
  el('kpi-today-msg', formatNumber(kpis.today_messages));
  el('kpi-response-time', kpis.avg_response_time_ms + 'ms');
  el('kpi-satisfaction', kpis.satisfaction_rate + '%');
  el('kpi-workers-total', formatNumber(kpis.total_workers));
  el('kpi-workers-available', formatNumber(kpis.available_workers));
  el('kpi-gmv-today', formatINR(kpis.gmv_today_inr));
  el('kpi-gmv-month', formatINR(kpis.gmv_month_inr));
}

function renderHourlyChart(hourlyData) {
  const ctx = document.getElementById('hourly-chart');
  if (!ctx || !window.Chart) return;

  if (charts.hourly) charts.hourly.destroy();

  charts.hourly = new Chart(ctx, {
    type: 'line',
    data: {
      labels: hourlyData.map(d => d.hour),
      datasets: [{
        label: 'Messages',
        data: hourlyData.map(d => d.messages),
        borderColor: '#FF6B35',
        backgroundColor: 'rgba(255,107,53,0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#FF6B35',
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1A2235',
          titleColor: '#F1F5F9',
          bodyColor: '#94A3B8',
          borderColor: '#FF6B35',
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          ticks: { color: '#64748B', maxTicksLimit: 8 },
          grid: { color: 'rgba(255,255,255,0.04)' },
        },
        y: {
          ticks: { color: '#64748B' },
          grid: { color: 'rgba(255,255,255,0.04)' },
          beginAtZero: true,
        },
      },
    },
  });
}

function renderIntentChart(intents) {
  const ctx = document.getElementById('intent-chart');
  if (!ctx || !window.Chart) return;

  if (charts.intent) charts.intent.destroy();

  const colors = [
    '#FF6B35', '#2563EB', '#059669', '#D97706',
    '#DC2626', '#7C3AED', '#0891B2', '#64748B',
  ];

  charts.intent = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: intents.map(i => i.intent.replace('_', ' ')),
      datasets: [{
        data: intents.map(i => i.count),
        backgroundColor: colors.slice(0, intents.length),
        borderWidth: 0,
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#94A3B8',
            font: { size: 12 },
            padding: 12,
            usePointStyle: true,
          },
        },
        tooltip: {
          backgroundColor: '#1A2235',
          titleColor: '#F1F5F9',
          bodyColor: '#94A3B8',
          borderColor: 'rgba(255,107,53,0.3)',
          borderWidth: 1,
        },
      },
    },
  });
}

function renderLanguageChart(languages) {
  const ctx = document.getElementById('language-chart');
  if (!ctx || !window.Chart) return;

  if (charts.language) charts.language.destroy();

  const langNames = {
    en: 'English', hi: 'Hindi', bn: 'Bengali', ta: 'Tamil',
    te: 'Telugu', mr: 'Marathi', gu: 'Gujarati', kn: 'Kannada', pa: 'Punjabi',
  };

  charts.language = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: languages.map(l => langNames[l.language] || l.language),
      datasets: [{
        label: 'Conversations',
        data: languages.map(l => l.count),
        backgroundColor: [
          'rgba(255,107,53,0.8)', 'rgba(37,99,235,0.8)', 'rgba(5,150,105,0.8)',
          'rgba(217,119,6,0.8)', 'rgba(124,58,237,0.8)', 'rgba(8,145,178,0.8)',
          'rgba(220,38,38,0.8)', 'rgba(100,116,139,0.8)',
        ],
        borderRadius: 6,
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1A2235',
          titleColor: '#F1F5F9',
          bodyColor: '#94A3B8',
        },
      },
      scales: {
        x: { ticks: { color: '#64748B' }, grid: { display: false } },
        y: { ticks: { color: '#64748B' }, grid: { color: 'rgba(255,255,255,0.04)' }, beginAtZero: true },
      },
    },
  });
}

function renderWorkerStats(stats) {
  if (!stats) return;
  const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  el('ws-total', stats.total || 500);
  el('ws-available', stats.available || 0);
  el('ws-avg-rating', stats.avg_rating || 0);
  el('ws-designations', stats.designations || 0);
  el('ws-cities', stats.cities || 0);
  el('ws-avg-rate', '₹' + (stats.avg_hourly_rate || 0));
}

// Auto-refresh
function startAutoRefresh(intervalMs = 30000) {
  return setInterval(loadAnalytics, intervalMs);
}
