// ============================================
// 華美光學人資系統 — 共用側邊欄
// 選單從試算表「選單設定」分頁動態讀取
// ============================================

(function() {
  // ── 內部變數（IIFE 包住，不污染全域）
  const _SIDEBAR_SHEET_ID = (typeof HRCONFIG !== 'undefined' && HRCONFIG.SHEETS_ID)
    ? HRCONFIG.SHEETS_ID
    : '1b4xq2XxSCbuIF6SZU-x0Jz4Du_n-YRAJCSQrkm2ze3U';
  const _LOGO_URL = 'https://lh3.googleusercontent.com/d/1VFVjgXLuw7v6yEPLi_BnF2zRXEhah8UQ';
  const _currentPage = location.pathname.split('/').pop() || 'home.html';

  // ── 從試算表讀取選單設定
  async function loadSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    try {
      const url = `https://docs.google.com/spreadsheets/d/${_SIDEBAR_SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent('選單設定')}&headers=1`;
      const res = await fetch(url);
      const text = await res.text();
      const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\)/);
      if (!match) throw new Error('無法讀取');
      const json = JSON.parse(match[1]);
      const rows = json.table.rows
        .filter(r => r.c && r.c[0]?.v && r.c[4]?.v === '是')
        .map(r => ({
          category: r.c[0]?.v || '',
          name    : r.c[1]?.v || '',
          icon    : r.c[2]?.v || '',
          href    : r.c[3]?.v || '#',
        }));
      renderSidebar(sidebar, rows);
    } catch(e) {
      renderSidebar(sidebar, getDefaultMenu());
    }
  }

  // ── 產生側邊欄 HTML
  function renderSidebar(sidebar, rows) {
    const groups = {};
    rows.forEach(r => {
      if (!groups[r.category]) groups[r.category] = [];
      groups[r.category].push(r);
    });
    let navHTML = '';
    Object.keys(groups).forEach(category => {
      navHTML += `<div class="nav-section-label">${category}</div>`;
      groups[category].forEach(item => {
        const active = (_currentPage === item.href ||
          (item.href !== '#' && _currentPage === item.href.split('?')[0])) ? 'active' : '';
        navHTML += `
          <a class="nav-item ${active}" href="${item.href}">
            <span class="icon">${item.icon}</span> ${item.name}
          </a>`;
      });
    });
    sidebar.innerHTML = `
      <div class="sidebar-header">
        <img src="${_LOGO_URL}" alt="華美光學">
        <button onclick="toggleSidebar()" id="sidebar-close">✕</button>
      </div>
      <nav>${navHTML}</nav>
      <div class="sidebar-admin-wrap">
        <button class="sidebar-admin-btn" onclick="enterAdmin()">⚙ 後台管理</button>
      </div>
      <div class="sidebar-footer">華美光學 人力營運處</div>
    `;
  }

  // ── 預設選單（讀取失敗時備用）
  function getDefaultMenu() {
    return [
      { category: '主選單',     name: '首頁總覽',     icon: '🏠', href: 'home.html' },
      { category: '學習與測驗', name: '測驗專區',     icon: '📝', href: 'quiz.html' },
      { category: '資料與公告', name: '文件宣導',     icon: '📁', href: 'docs.html' },
      { category: '資料與公告', name: '活動報名',     icon: '🎉', href: 'events-list.html' },
      { category: '資料與公告', name: '最新公告',     icon: '📢', href: 'notice.html' },
      { category: '各項統計分析', name: '統計分析入口', icon: '📊', href: 'links.html' },
    ];
  }

  // 頁面載入時執行
  window.addEventListener('DOMContentLoaded', loadSidebar);
})();

// ── 共用 toggleSidebar 函式（全域，各頁面需要呼叫）
function toggleSidebar() {
  const s = document.getElementById('sidebar');
  const o = document.getElementById('sidebar-overlay');
  const c = document.getElementById('sidebar-close');
  const open = s.classList.toggle('open');
  if (o) o.style.display = open ? 'block' : 'none';
  if (c) c.style.display = open ? 'block' : 'none';
}

// ── 後台管理入口（全域，sidebar 按鈕呼叫）
(function() {
  const _ADMIN_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxfo--2xa9vk6tlIzCjNyu3Y76AQIzYj-tM3XcvFQO72QwkWEqYIW_jSl2JRtE2tgql/exec';
  const _ADMIN_PWD = '@@69314511@@';
  let _adminFailCount = 0;

  window.enterAdmin = function() {
    let modal = document.getElementById('admin-pwd-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'admin-pwd-modal';
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:center;justify-content:center;';
      modal.innerHTML = `
        <div style="background:#fff;border-radius:16px;padding:40px;width:90%;max-width:360px;text-align:center;box-shadow:0 8px 40px rgba(0,0,0,.18);position:relative;">
          <button onclick="closeAdminModal()" style="position:absolute;top:14px;right:18px;background:none;border:none;font-size:20px;cursor:pointer;color:#999;">✕</button>
          <div style="font-size:44px;margin-bottom:14px;">⚙️</div>
          <h2 style="font-size:17px;font-weight:800;margin-bottom:6px;color:#3d4449;">後台管理</h2>
          <p style="font-size:13px;color:#999;margin-bottom:20px;">請輸入後台管理密碼</p>
          <input type="password" id="admin-pwd-input" placeholder="請輸入密碼"
            style="width:100%;padding:12px 16px;border:1.5px solid #e8e8e8;border-radius:8px;font-size:15px;margin-bottom:10px;outline:none;font-family:inherit;"
            onkeydown="if(event.key==='Enter')confirmAdminPwd()" />
          <p id="admin-pwd-error" style="color:#f56a6a;font-size:13px;margin-bottom:10px;display:none;"></p>
          <button onclick="confirmAdminPwd()"
            style="width:100%;background:#f56a6a;color:#fff;border:none;border-radius:8px;padding:12px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;">
            確認
          </button>
        </div>`;
      document.body.appendChild(modal);
      modal.addEventListener('click', function(e) {
        if (e.target === modal) closeAdminModal();
      });
    }
    modal.style.display = 'flex';
    setTimeout(() => document.getElementById('admin-pwd-input').focus(), 100);
  };

  window.closeAdminModal = function() {
    const modal = document.getElementById('admin-pwd-modal');
    if (modal) modal.style.display = 'none';
    const input = document.getElementById('admin-pwd-input');
    if (input) input.value = '';
    const err = document.getElementById('admin-pwd-error');
    if (err) err.style.display = 'none';
  };

  window.confirmAdminPwd = function() {
    const input = document.getElementById('admin-pwd-input');
    const err = document.getElementById('admin-pwd-error');
    const pwd = input.value.trim();
    if (pwd === _ADMIN_PWD) {
      _adminFailCount = 0;
      sessionStorage.setItem('admin_auth', 'true');
      closeAdminModal();
      window.location.href = 'admin.html';
    } else {
      _adminFailCount++;
      input.value = '';
      input.focus();
      err.textContent = `密碼錯誤，請重試（第 ${_adminFailCount} 次）`;
      err.style.display = 'block';
      if (_adminFailCount >= 3) {
        _sendAdminLoginAlert();
        err.textContent = '密碼錯誤次數過多，已通知管理員';
        _adminFailCount = 0;
      }
    }
  };

  function _sendAdminLoginAlert() {
    try {
      fetch(_ADMIN_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
          action   : 'adminLoginAlert',
          userAgent: navigator.userAgent,
          time     : new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
        }),
      });
    } catch(e) {
      console.error('通知信發送失敗', e);
    }
  }
})();

// ── 滑鼠彗星尾巴效果
(function() {
  const TRAIL_LENGTH = 20;
  const trail = [];
  let animFrame;
  document.addEventListener('mousemove', function(e) {
    trail.push({ x: e.clientX, y: e.clientY });
    if (trail.length > TRAIL_LENGTH) trail.shift();
    cancelAnimationFrame(animFrame);
    animFrame = requestAnimationFrame(drawTrail);
  });
  function drawTrail() {
    document.querySelectorAll('.comet-dot').forEach(el => el.remove());
    trail.forEach((pos, i) => {
      const ratio = i / TRAIL_LENGTH;
      const size = ratio * 8 + 1;
      const opacity = ratio * 0.6 + 0.1;
      const p = document.createElement('div');
      p.className = 'comet-dot';
      p.style.cssText = `position:fixed;width:${size}px;height:${size}px;border-radius:50%;background:rgba(80,80,80,${opacity});left:${pos.x - size/2}px;top:${pos.y - size/2}px;pointer-events:none;z-index:9999;`;
      document.body.appendChild(p);
    });
    setTimeout(() => {
      document.querySelectorAll('.comet-dot').forEach(el => {
        el.style.transition = 'opacity 300ms ease';
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 300);
      });
    }, 100);
  }
})();

// ══════════════════════════════════════════════
// HR 小幫手聊天機器人
// ══════════════════════════════════════════════

// ══════════════════════════════════════════════
// HR 小幫手聊天機器人（全域函數）
// ══════════════════════════════════════════════
var HR_OWL_IMG  = 'https://lh3.googleusercontent.com/d/1rXDTTYj3XdSFJa5rRu0eWsr-BApzrHmC';
var HR_CHAT_URL = 'https://script.google.com/macros/s/AKfycbxfo--2xa9vk6tlIzCjNyu3Y76AQIzYj-tM3XcvFQO72QwkWEqYIW_jSl2JRtE2tgql/exec';
var hrChatOpen     = false;
var hrChatDragging = false;
var hrChatHistory  = [];

function hrInitChat() {
  if (location.pathname.includes('admin.html')) return;
  if (document.getElementById('hr-owl-btn')) return;

  // 貓頭鷹按鈕
  var btn = document.createElement('button');
  btn.id = 'hr-owl-btn';
  btn.title = 'HR 小幫手';
  btn.innerHTML = '<img src="' + HR_OWL_IMG + '" alt="HR小幫手"><div class="owl-badge"></div>';
  btn.onclick = function() { if (!hrChatDragging) { hrToggleChat(); } };
  document.body.appendChild(btn);

  // 對話視窗
  var win = document.createElement('div');
  win.id = 'hr-chat-window';
  win.innerHTML =
    '<div class="chat-header">' +
      '<img src="' + HR_OWL_IMG + '" alt="HR小幫手">' +
      '<div class="chat-header-info">' +
        '<div class="chat-header-title">HR 小幫手</div>' +
        '<div class="chat-header-sub">人資制度問答小助理</div>' +
      '</div>' +
      '<div class="chat-header-actions">' +
        '<button class="chat-header-btn" id="chat-expand-btn" onclick="hrToggleExpand()" title="展開">⤢</button>' +
        '<button class="chat-header-btn" onclick="hrCloseChat()" title="關閉">✕</button>' +
      '</div>' +
    '</div>' +
    '<div class="chat-messages" id="chat-messages"></div>' +
    '<div class="chat-hint">💡 小提醒：我每次只能針對當下的問題回答，無法記住之前的對話喔！如您的問題跟前面有關聯，記得把完整情況一起說給我聽，這樣我才能盡量給您最完整的答覆 😊</div>' +
    '<div class="chat-input-area">' +
      '<textarea class="chat-input" id="chat-input" placeholder="輸入問題…" rows="1"></textarea>' +
      '<button class="chat-send-btn" onclick="hrSendMessage()">➤</button>' +
    '</div>';
  document.body.appendChild(win);

  // 綁定輸入框 Enter 鍵
  setTimeout(function() {
    var textarea = document.getElementById('chat-input');
    if (textarea) {
      textarea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          hrSendMessage();
        }
      });
      textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 80) + 'px';
      });
    }
  }, 100);

  // 機器人圖示拖曳
  hrInitDrag(btn);

  // 聊天視窗標題列也可以拖曳
  setTimeout(function() {
    var chatHeader = document.querySelector('#hr-chat-window .chat-header');
    if (chatHeader) {
      chatHeader.style.cursor = 'grab';
      chatHeader.addEventListener('pointerdown', function(e) {
        var win = document.getElementById('hr-chat-window');
        if (!win) return;
        hrDragActive = true;
        hrSetFixedPos(win);
        var rect     = win.getBoundingClientRect();
        hrDragStartX = e.clientX;
        hrDragStartY = e.clientY;
        hrDragStartL = rect.left;
        hrDragStartT = rect.top;
        win.classList.add('is-dragging');
        if (e.target.setPointerCapture) e.target.setPointerCapture(e.pointerId);
        e.preventDefault();
      });
    }
  }, 100);
}

function hrToggleChat() {
  hrChatOpen ? hrCloseChat() : hrOpenChat();
}

function hrOpenChat() {
  hrChatOpen = true;
  var win = document.getElementById('hr-chat-window');
  if (win) win.classList.add('open');
  document.getElementById('hr-owl-btn').classList.remove('has-msg');
  if (hrChatHistory.length === 0) hrAddBotMsg('你好！我是 HR 小幫手 🦉\n有任何人資制度相關問題，都可以問我喔！');
  setTimeout(function() {
    var input = document.getElementById('chat-input');
    if (input) input.focus();
  }, 200);
  // 展開後把定位從 right 改成 left，再執行邊界修正
  setTimeout(function() {
    var win = document.getElementById('hr-chat-window');
    if (win) {
      var rect = win.getBoundingClientRect();
      win.style.right  = 'auto';
      win.style.bottom = 'auto';
      win.style.left   = rect.left + 'px';
      win.style.top    = rect.top  + 'px';
      win.style.position = 'fixed';
    }
    if (window.clampHrChatWidget) window.clampHrChatWidget();
  }, 50);
}


// ── 展開/收合對話視窗
var hrChatExpanded = false;
function hrToggleExpand() {
  var win = document.getElementById('hr-chat-window');
  var btn = document.getElementById('chat-expand-btn');
  if (!win) return;
  hrChatExpanded = !hrChatExpanded;
  var isMobile = window.innerWidth <= 560;
  if (hrChatExpanded) {
    win.style.height = isMobile ? (window.innerHeight - 90) + 'px' : '80vh';
    win.style.width = isMobile ? '' : '480px';
    win.style.maxHeight = 'none';
    win.style.overflow = 'hidden';
    if (btn) { btn.textContent = '⤡'; btn.title = '收合'; }
  } else {
    win.style.height = '';
    win.style.width = '';
    win.style.maxHeight = '';
    win.style.overflow = '';
    if (btn) { btn.textContent = '⤢'; btn.title = '展開'; }
  }
}

function hrCloseChat() {
  hrChatOpen = false;
  var win = document.getElementById('hr-chat-window');
  if (win) win.classList.remove('open');
}

function hrAddBotMsg(text) {
  var msgs = document.getElementById('chat-messages');
  if (!msgs) return;
  var div = document.createElement('div');
  div.className = 'chat-msg bot';
  div.innerHTML =
    '<div class="chat-msg-avatar"><img src="' + HR_OWL_IMG + '" alt="HR"></div>' +
    '<div class="chat-bubble">' + text.replace(/\n/g, '<br>') + '</div>';
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function hrAddUserMsg(text) {
  var msgs = document.getElementById('chat-messages');
  if (!msgs) return;
  var div = document.createElement('div');
  div.className = 'chat-msg user';
  div.innerHTML =
    '<div class="chat-msg-avatar">我</div>' +
    '<div class="chat-bubble">' + text.replace(/\n/g, '<br>') + '</div>';
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function hrAddTyping() {
  var msgs = document.getElementById('chat-messages');
  if (!msgs) return;
  var div = document.createElement('div');
  div.className = 'chat-msg bot';
  div.id = 'chat-typing';
  div.innerHTML =
    '<div class="chat-msg-avatar"><img src="' + HR_OWL_IMG + '" alt="HR"></div>' +
    '<div class="chat-typing"><span></span><span></span><span></span></div>';
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function hrRemoveTyping() {
  var t = document.getElementById('chat-typing');
  if (t) t.remove();
}

async function hrSendMessage() {
  var input = document.getElementById('chat-input');
  var sendBtn = document.querySelector('.chat-send-btn');
  if (!input) return;
  var text = input.value.trim();
  if (!text) return;

  input.value = '';
  input.style.height = 'auto';
  if (sendBtn) sendBtn.disabled = true;
  hrAddUserMsg(text);
  hrChatHistory.push({ role: 'user', parts: [{ text: text }] });
  hrAddTyping();

  try {
    var res = await fetch(HR_CHAT_URL, {
      method  : 'POST',
      redirect: 'follow',
      headers : { 'Content-Type': 'text/plain' },
      body    : JSON.stringify({
        action  : 'hrChat',
        question: text,
        history : hrChatHistory.slice(-6),
      }),
    });
    var result = await res.json();
    hrRemoveTyping();

    if (result.success && result.reply) {
      hrChatHistory.push({ role: 'model', parts: [{ text: result.reply }] });
      hrAddBotMsg(result.reply);
    } else {
      hrAddBotMsg('抱歉，目前無法回答。\n錯誤：' + (result.error || '未知錯誤'));
    }
  } catch(e) {
    hrRemoveTyping();
    hrAddBotMsg('連線發生錯誤，請稍後再試。');
  }

  if (sendBtn) sendBtn.disabled = false;
  if (!hrChatOpen) {
    var owlBtn = document.getElementById('hr-owl-btn');
    if (owlBtn) owlBtn.classList.add('has-msg');
  }
}


// ── 聊天視窗拖曳與邊界控制
var HR_CHAT_MARGIN = 12;
var hrDragActive   = false;
var hrDragStartX   = 0;
var hrDragStartY   = 0;
var hrDragStartL   = 0;
var hrDragStartT   = 0;

function hrIsInteractiveEl(el) {
  return !!el.closest('input, textarea, button, a, select, .chat-send-btn, .quick-reply');
}

function hrGetWin() {
  return document.getElementById('hr-chat-window');
}

function hrGetBtn() {
  return document.getElementById('hr-owl-btn');
}

function hrSetFixedPos(el) {
  var rect = el.getBoundingClientRect();
  el.style.position = 'fixed';
  el.style.left     = rect.left + 'px';
  el.style.top      = rect.top  + 'px';
  el.style.right    = 'auto';
  el.style.bottom   = 'auto';
}

function clampEl(el) {
  if (!el) return;
  var vw   = window.innerWidth;
  var vh   = window.innerHeight;
  var rect = el.getBoundingClientRect();
  var left = rect.left;
  var top  = rect.top;
  var maxL = Math.max(HR_CHAT_MARGIN, vw - rect.width  - HR_CHAT_MARGIN);
  var maxT = Math.max(HR_CHAT_MARGIN, vh - rect.height - HR_CHAT_MARGIN);
  left = Math.min(Math.max(left, HR_CHAT_MARGIN), maxL);
  top  = Math.min(Math.max(top,  HR_CHAT_MARGIN), maxT);
  el.style.position = 'fixed';
  el.style.left     = left + 'px';
  el.style.top      = top  + 'px';
  el.style.right    = 'auto';
  el.style.bottom   = 'auto';
}

window.clampHrChatWidget = function() {
  var win = hrGetWin();
  var btn = hrGetBtn();
  if (win && hrChatOpen) clampEl(win);
  if (btn) clampEl(btn);
};

function hrOnPointerDown(e) {
  if (e.button !== undefined && e.button !== 0) return;
  if (hrIsInteractiveEl(e.target)) return;

  var target = e.currentTarget;
  hrDragActive = true;
  hrSetFixedPos(target);

  var rect     = target.getBoundingClientRect();
  hrDragStartX = e.clientX;
  hrDragStartY = e.clientY;
  hrDragStartL = rect.left;
  hrDragStartT = rect.top;

  target.classList.add('is-dragging');
  if (e.target.setPointerCapture) e.target.setPointerCapture(e.pointerId);
  e.preventDefault();
}

function hrOnPointerMove(e) {
  if (!hrDragActive) return;
  // 找目前拖曳的元素
  var win = hrGetWin();
  var btn = hrGetBtn();
  var el  = (win && win.classList.contains('is-dragging')) ? win : btn;
  if (!el) return;

  var dx = e.clientX - hrDragStartX;
  var dy = e.clientY - hrDragStartY;
  el.style.left   = (hrDragStartL + dx) + 'px';
  el.style.top    = (hrDragStartT + dy) + 'px';
  el.style.right  = 'auto';
  el.style.bottom = 'auto';
}

function hrOnPointerUp(e) {
  if (!hrDragActive) return;
  hrDragActive = false;
  var win = hrGetWin();
  var btn = hrGetBtn();
  if (win) win.classList.remove('is-dragging');
  if (btn) btn.classList.remove('is-dragging');
  window.clampHrChatWidget();
}

document.addEventListener('pointermove', hrOnPointerMove);
document.addEventListener('pointerup',   hrOnPointerUp);
window.addEventListener('resize', function() { window.clampHrChatWidget(); });
window.addEventListener('orientationchange', function() {
  setTimeout(function() { window.clampHrChatWidget(); }, 300);
});

function hrInitDrag(btn) {
  var startX, startY, startLeft, startBottom;
  btn.addEventListener('mousedown', function(e) {
    hrChatDragging = false;
    startX = e.clientX; startY = e.clientY;
    var rect = btn.getBoundingClientRect();
    startLeft   = rect.left;
    startBottom = window.innerHeight - rect.bottom;
    btn.style.cursor = 'grabbing';

    function onMove(e) {
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) hrChatDragging = true;
      var newLeft   = Math.max(0, Math.min(window.innerWidth - 64,  startLeft   + dx));
      var newBottom = Math.max(0, Math.min(window.innerHeight - 64, startBottom - dy));
      btn.style.left   = newLeft + 'px';
      btn.style.right  = 'auto';
      btn.style.bottom = newBottom + 'px';
      var chatWin = document.getElementById('hr-chat-window');
      if (chatWin) {
        chatWin.style.right  = 'auto';
        chatWin.style.left   = Math.max(0, Math.min(window.innerWidth - 360, newLeft - 360 + 64)) + 'px';
        chatWin.style.bottom = (newBottom + 72) + 'px';
      }
    }
    function onUp() {
      btn.style.cursor = 'grab';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      setTimeout(function() { hrChatDragging = false; }, 100);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  btn.addEventListener('touchstart', function(e) {
    hrChatDragging = false;
    var t = e.touches[0];
    startX = t.clientX; startY = t.clientY;
    var rect = btn.getBoundingClientRect();
    startLeft   = rect.left;
    startBottom = window.innerHeight - rect.bottom;
  }, { passive: true });

  btn.addEventListener('touchmove', function(e) {
    var t = e.touches[0];
    var dx = t.clientX - startX;
    var dy = t.clientY - startY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) hrChatDragging = true;
    var newLeft   = Math.max(0, Math.min(window.innerWidth - 64,  startLeft   + dx));
    var newBottom = Math.max(0, Math.min(window.innerHeight - 64, startBottom - dy));
    btn.style.left   = newLeft + 'px';
    btn.style.right  = 'auto';
    btn.style.bottom = newBottom + 'px';
    e.preventDefault();
  }, { passive: false });
}

window.addEventListener('DOMContentLoaded', hrInitChat);
