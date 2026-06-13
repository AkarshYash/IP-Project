/**
 * Sahayak — Chat Page JavaScript
 * WebSocket with REST fallback, voice mode, message rendering
 */

let ws = null;
let sessionId = localStorage.getItem('sahayak_session') || generateSessionId();
let isVoiceMode = false;
let recognition = null;
let synthesis = window.speechSynthesis;
let messageCount = 0;
let totalResponseTime = 0;
let offlineQueue = JSON.parse(localStorage.getItem('sahayak_offline_queue') || '[]');

function generateSessionId() {
  const id = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
  localStorage.setItem('sahayak_session', id);
  return id;
}

// ── WebSocket Setup ─────────────────────────────────────────────────────────────
function connectWebSocket() {
  const wsUrl = `ws://localhost:8000/api/chatbot/ws/${sessionId}`;
  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log('WebSocket connected');
    updateConnectionStatus(true);
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    handleWsMessage(data);
  };

  ws.onclose = () => {
    console.log('WebSocket disconnected — falling back to REST');
    updateConnectionStatus(false);
    ws = null;
    // Auto-reconnect after 3s
    setTimeout(connectWebSocket, 3000);
  };

  ws.onerror = () => {
    ws = null;
    updateConnectionStatus(false);
  };
}

function handleWsMessage(data) {
  hideTyping();

  if (data.type === 'connected') {
    // Welcome message already shown in HTML
    return;
  }

  if (data.type === 'typing') {
    if (data.status) showTyping();
    else hideTyping();
    return;
  }

  if (data.type === 'message' || data.response) {
    addMessage('assistant', data.response, {
      intent: data.intent,
      confidence: data.confidence,
      response_time_ms: data.response_time_ms,
    });

    // Voice: speak the response
    if (isVoiceMode && synthesis) {
      speak(data.response.replace(/[*#`]/g, '').replace(/\n/g, '. '));
    }
  }

  if (data.type === 'error') {
    addMessage('assistant', '⚠️ Something went wrong. Please try again.', {});
  }
}

function updateConnectionStatus(connected) {
  const dot = document.getElementById('ws-status');
  const label = document.getElementById('ws-label');
  if (dot) dot.style.background = connected ? 'var(--emerald-light)' : 'var(--ruby-light)';
  if (label) label.textContent = connected ? 'Live' : 'REST mode';
}

// ── Send Message ───────────────────────────────────────────────────────────────
async function sendMessage(messageText) {
  if (!messageText || !messageText.trim()) return;

  // Add user bubble
  addMessage('user', messageText);
  clearInput();
  showTyping();

  // If offline, queue
  if (!navigator.onLine) {
    offlineQueue.push({ message: messageText, timestamp: Date.now() });
    localStorage.setItem('sahayak_offline_queue', JSON.stringify(offlineQueue));
    hideTyping();
    addMessage('assistant', '📵 You\'re offline. Message queued — will send when connected.', {});
    return;
  }

  try {
    if (ws && ws.readyState === WebSocket.OPEN) {
      // WebSocket path
      ws.send(JSON.stringify({
        message: messageText,
        language: state.language,
      }));
    } else {
      // REST fallback
      const data = await api.post('/api/chatbot/message', {
        message: messageText,
        session_id: sessionId,
        language: state.language !== 'en' ? state.language : null,
      });

      hideTyping();

      if (data) {
        addMessage('assistant', data.response, {
          intent: data.intent,
          confidence: data.confidence,
          response_time_ms: data.response_time_ms,
          message_id: data.message_id,
        });

        if (isVoiceMode && synthesis) {
          speak(data.response.replace(/[*#`]/g, ''));
        }

        // Update stats
        if (data.response_time_ms) {
          totalResponseTime += data.response_time_ms;
          messageCount++;
          updateSessionStats(data);
        }
      }
    }
  } catch (e) {
    hideTyping();
    addMessage('assistant', '⚠️ Connection error. Please check your internet and try again.', {});
    showToast('Connection error: ' + e.message, 'error');
  }
}

// ── Message Rendering ──────────────────────────────────────────────────────────
function addMessage(role, content, meta = {}) {
  const area = document.getElementById('messages-area');
  if (!area) return;

  const isUser = role === 'user';
  const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const msgId = 'msg_' + Date.now();

  // Parse markdown-like formatting
  const formatted = formatMarkdown(content);

  const msgEl = document.createElement('div');
  msgEl.className = `message ${role}`;
  msgEl.id = msgId;

  msgEl.innerHTML = `
    <div class="message-avatar">${isUser ? '👤' : '🤖'}</div>
    <div class="message-content">
      <div class="bubble">${formatted}</div>
      <div class="message-meta">
        <span class="message-time">${time}</span>
        ${meta.intent && meta.intent !== 'general' ? `<span class="message-intent">${meta.intent?.replace('_', ' ')}</span>` : ''}
        ${!isUser && meta.message_id ? `
          <div class="feedback-btns" id="fb-${meta.message_id}">
            <button class="feedback-btn" onclick="submitFeedback(${meta.message_id}, 1, this)" title="👍">👍</button>
            <button class="feedback-btn" onclick="submitFeedback(${meta.message_id}, -1, this)" title="👎">👎</button>
          </div>
        ` : ''}
        ${meta.response_time_ms ? `<span class="text-muted text-xs">${meta.response_time_ms}ms</span>` : ''}
      </div>
    </div>
  `;

  area.appendChild(msgEl);
  area.scrollTop = area.scrollHeight;

  // Show quick replies for certain intents
  if (!isUser && meta.intent) {
    showQuickReplies(meta.intent);
  }
}

function formatMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^(.+)$/gm, (m) => m)
    .replace(/^/, '<p>').replace(/$/, '</p>');
}

// ── Typing Indicator ───────────────────────────────────────────────────────────
function showTyping() {
  const area = document.getElementById('messages-area');
  if (!area || document.getElementById('typing')) return;

  const typing = document.createElement('div');
  typing.className = 'message assistant typing-indicator';
  typing.id = 'typing';
  typing.innerHTML = `
    <div class="message-avatar">🤖</div>
    <div class="typing-dots">
      <span></span><span></span><span></span>
    </div>
  `;
  area.appendChild(typing);
  area.scrollTop = area.scrollHeight;
}

function hideTyping() {
  document.getElementById('typing')?.remove();
}

// ── Quick Replies ──────────────────────────────────────────────────────────────
const QUICK_REPLIES = {
  greeting: ['Find an electrician', 'Check salary rates', 'Register as worker', 'Emergency help'],
  find_worker: ['Show more workers', 'Filter by rating', 'Check salary', 'Book now'],
  check_salary: ['Find workers in this range', 'Compare cities', 'Register worker'],
  register_worker: ['Upload documents', 'Set hourly rate', 'Choose payment method'],
  dispute: ['File new dispute', 'Check dispute status', 'Contact support'],
  general: ['Find workers', 'Check salary', 'Get help', 'Emergency'],
};

function showQuickReplies(intent) {
  const container = document.getElementById('quick-replies');
  if (!container) return;

  const replies = QUICK_REPLIES[intent] || QUICK_REPLIES.general;
  container.innerHTML = replies.map(r =>
    `<button class="quick-reply" onclick="handleQuickReply('${r}')">${r}</button>`
  ).join('');
}

function handleQuickReply(text) {
  document.getElementById('chat-input').value = text;
  sendMessage(text);
  document.getElementById('quick-replies').innerHTML = '';
}

// ── Input Handling ─────────────────────────────────────────────────────────────
function clearInput() {
  const input = document.getElementById('chat-input');
  if (input) { input.value = ''; input.style.height = 'auto'; }
}

function handleKeyDown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    if (input?.value.trim()) sendMessage(input.value.trim());
  }
}

function handleSendClick() {
  const input = document.getElementById('chat-input');
  if (input?.value.trim()) sendMessage(input.value.trim());
}

// Auto-resize textarea
function autoResizeTextarea(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

// ── Voice ─────────────────────────────────────────────────────────────────────
function toggleVoiceMode() {
  isVoiceMode = !isVoiceMode;
  const btn = document.getElementById('voice-mode-btn');
  const normalChat = document.getElementById('normal-chat');
  const voiceOverlay = document.getElementById('voice-overlay');

  if (btn) btn.classList.toggle('active', isVoiceMode);
  if (normalChat) normalChat.style.display = isVoiceMode ? 'none' : 'flex';
  if (voiceOverlay) voiceOverlay.classList.toggle('active', isVoiceMode);

  if (isVoiceMode) {
    showToast('Voice mode on — tap the mic to speak', 'info', 3000);
  } else {
    if (recognition) recognition.stop();
    showToast('Voice mode off', 'info', 2000);
  }
}

function toggleListening() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast('Speech recognition not supported in this browser', 'error');
    return;
  }

  if (recognition && recognition.listening) {
    recognition.stop();
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = getLangCode(state.language);
  recognition.continuous = false;
  recognition.interimResults = true;

  const transcript = document.getElementById('voice-transcript');
  const statusEl = document.getElementById('voice-status');
  const pulseEl = document.getElementById('voice-pulse');

  recognition.onstart = () => {
    if (statusEl) statusEl.textContent = '🎙️ Listening...';
    if (pulseEl) pulseEl.classList.add('listening');
    recognition.listening = true;
  };

  recognition.onresult = (e) => {
    const text = Array.from(e.results).map(r => r[0].transcript).join('');
    if (transcript) transcript.textContent = text;
  };

  recognition.onend = () => {
    if (statusEl) statusEl.textContent = '🎤 Tap to speak';
    if (pulseEl) pulseEl.classList.remove('listening');
    recognition.listening = false;

    const text = transcript?.textContent;
    if (text && text.length > 2) {
      sendMessage(text);
      if (transcript) transcript.textContent = '';
    }
  };

  recognition.onerror = (e) => {
    showToast('Voice error: ' + e.error, 'error');
    recognition.listening = false;
    if (pulseEl) pulseEl.classList.remove('listening');
  };

  recognition.start();
}

function speak(text) {
  if (!synthesis) return;
  synthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.slice(0, 300));
  utterance.lang = getLangCode(state.language);
  utterance.rate = 0.9;
  synthesis.speak(utterance);
}

function getLangCode(code) {
  const codes = {
    en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN', bn: 'bn-IN',
    ta: 'ta-IN', te: 'te-IN', gu: 'gu-IN', kn: 'kn-IN', pa: 'pa-IN',
  };
  return codes[code] || 'en-IN';
}

// ── Feedback ───────────────────────────────────────────────────────────────────
async function submitFeedback(messageId, value, btn) {
  try {
    await api.post('/api/chatbot/feedback', { message_id: messageId, feedback: value });
    const container = document.getElementById(`fb-${messageId}`);
    if (container) {
      container.querySelectorAll('.feedback-btn').forEach(b => b.classList.remove('liked', 'disliked'));
      btn.classList.add(value > 0 ? 'liked' : 'disliked');
    }
  } catch (e) {
    showToast('Feedback failed', 'error');
  }
}

// ── Session Stats ──────────────────────────────────────────────────────────────
function updateSessionStats(data) {
  const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  el('stat-messages', messageCount);
  el('stat-lang', getLanguageName(data.language || state.language));
  el('stat-intent', data.intent?.replace('_', ' ') || '-');
  el('stat-response-time', Math.round(totalResponseTime / messageCount) + 'ms');
}

// ── Offline Queue ──────────────────────────────────────────────────────────────
window.addEventListener('online', async () => {
  if (offlineQueue.length > 0) {
    showToast(`Sending ${offlineQueue.length} queued message(s)...`, 'info');
    for (const item of offlineQueue) {
      await sendMessage(item.message);
    }
    offlineQueue = [];
    localStorage.removeItem('sahayak_offline_queue');
  }
});

// ── Init ───────────────────────────────────────────────────────────────────────
function initChat() {
  connectWebSocket();

  const input = document.getElementById('chat-input');
  if (input) {
    input.addEventListener('keydown', handleKeyDown);
    input.addEventListener('input', () => autoResizeTextarea(input));
  }

  // Add welcome message
  setTimeout(() => {
    if (document.getElementById('messages-area').children.length === 0) {
      addMessage('assistant', '🙏 **Namaste! I\'m Sahayak** — your AI assistant for finding skilled blue-collar workers across India.\n\n' +
        'I can help you:\n• 🔍 Find skilled workers\n• 💰 Check salary rates\n• 📋 Register workers\n• 🆘 Emergency requests\n\n' +
        '*Try: "Find an electrician in Mumbai" or speak in Hindi!*', { intent: 'greeting' });
    }
  }, 500);
}
