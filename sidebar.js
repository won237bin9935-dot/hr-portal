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
(function() {
  const OWL_IMG    = 'https://lh3.googleusercontent.com/d/1F7IH0yKHIT8zUJUbcCWfXyT8MFwuFExw';
  const CHAT_URL   = 'https://script.google.com/macros/s/AKfycbxfo--2xa9vk6tlIzCjNyu3Y76AQIzYj-tM3XcvFQO72QwkWEqYIW_jSl2JRtE2tgql/exec';

  // 不在後台頁面顯示
  if (location.pathname.includes('admin.html')) return;

  let isOpen       = false;
  let isDragging   = false;
  let isHidden     = false;
  let chatHistory  = [];

  // ── 建立 UI
  function initChat() {
    // 貓頭鷹按鈕
    const btn = document.createElement('button');
    btn.id = 'hr-owl-btn';
    btn.title = 'HR 小幫手';
    btn.innerHTML = `<img src="${OWL_IMG}" alt="HR小幫手"><div class="owl-badge"></div>`;
    document.body.appendChild(btn);

    // 對話視窗
    const win = document.createElement('div');
    win.id = 'hr-chat-window';
    win.innerHTML = `
      <div class="chat-header">
        <img src="${OWL_IMG}" alt="HR小幫手">
        <div class="chat-header-info">
          <div class="chat-header-title">HR 小幫手</div>
          <div class="chat-header-sub">人資制度問答小助理</div>
        </div>
        <div class="chat-header-actions">
          <button class="chat-header-btn" id="chat-hide-btn" title="隱藏">－</button>
          <button class="chat-header-btn" id="chat-close-btn" title="關閉">✕</button>
        </div>
      </div>
      <div class="chat-messages" id="chat-messages"></div>
      <div class="chat-input-area">
        <textarea class="chat-input" id="chat-input" placeholder="輸入問題…" rows="1"></textarea>
        <button class="chat-send-btn" id="chat-send-btn">➤</button>
      </div>
      <div class="chat-close-hint">
        <button onclick="showOwlBtn()">已隱藏？點此重新開啟 HR 小幫手</button>
      </div>`;
    document.body.appendChild(win);

    // 綁定事件
    btn.addEventListener('click', toggleChat);
    document.getElementById('chat-close-btn').addEventListener('click', closeChat);
    document.getElementById('chat-hide-btn').addEventListener('click', hideOwl);
    document.getElementById('chat-send-btn').addEventListener('click', sendMessage);
    document.getElementById('chat-input').addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
    document.getElementById('chat-input').addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 80) + 'px';
    });

    // 拖曳功能
    initDrag(btn);

    // 載入知識庫
    // 知識庫由 Apps Script 處理

    // 檢查是否被隱藏
    if (localStorage.getItem('hr_owl_hidden') === 'true') {
      btn.style.display = 'none';
      isHidden = true;
    }
  }

  // ── 拖曳
  function initDrag(btn) {
    let startX, startY, startLeft, startBottom;
    btn.addEventListener('mousedown', e => {
      isDragging = false;
      startX = e.clientX; startY = e.clientY;
      const rect = btn.getBoundingClientRect();
      startLeft   = rect.left;
      startBottom = window.innerHeight - rect.bottom;
      btn.style.cursor = 'grabbing';

      function onMove(e) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) isDragging = true;
        const newLeft   = Math.max(0, Math.min(window.innerWidth - 64,  startLeft   + dx));
        const newBottom = Math.max(0, Math.min(window.innerHeight - 64, startBottom - dy));
        btn.style.left   = newLeft + 'px';
        btn.style.right  = 'auto';
        btn.style.bottom = newBottom + 'px';
        // 視窗跟著移動
        const chatWin = document.getElementById('hr-chat-window');
        chatWin.style.right  = 'auto';
        chatWin.style.left   = Math.max(0, Math.min(window.innerWidth - 360, newLeft - 360 + 64)) + 'px';
        chatWin.style.bottom = (newBottom + 72) + 'px';
      }
      function onUp() {
        btn.style.cursor = 'grab';
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    // 手機拖曳
    btn.addEventListener('touchstart', e => {
      isDragging = false;
      const t = e.touches[0];
      startX = t.clientX; startY = t.clientY;
      const rect = btn.getBoundingClientRect();
      startLeft   = rect.left;
      startBottom = window.innerHeight - rect.bottom;
    }, { passive: true });
    btn.addEventListener('touchmove', e => {
      const t = e.touches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) isDragging = true;
      const newLeft   = Math.max(0, Math.min(window.innerWidth - 64,  startLeft   + dx));
      const newBottom = Math.max(0, Math.min(window.innerHeight - 64, startBottom - dy));
      btn.style.left   = newLeft + 'px';
      btn.style.right  = 'auto';
      btn.style.bottom = newBottom + 'px';
      e.preventDefault();
    }, { passive: false });
  }

  // ── 開關對話視窗
  function toggleChat() {
    if (isDragging) return;
    isOpen ? closeChat() : openChat();
  }

  function openChat() {
    isOpen = true;
    document.getElementById('hr-chat-window').classList.add('open');
    document.getElementById('hr-owl-btn').classList.remove('has-msg');
    if (chatHistory.length === 0) addBotMsg('你好！我是 HR 小幫手 🦉\n有任何人資制度相關問題，都可以問我喔！');
    setTimeout(() => document.getElementById('chat-input').focus(), 200);
  }

  function closeChat() {
    isOpen = false;
    document.getElementById('hr-chat-window').classList.remove('open');
  }

  function hideOwl() {
    closeChat();
    document.getElementById('hr-owl-btn').style.display = 'none';
    isHidden = true;
    localStorage.setItem('hr_owl_hidden', 'true');
  }

  window.showOwlBtn = function() {
    document.getElementById('hr-owl-btn').style.display = 'block';
    isHidden = false;
    localStorage.removeItem('hr_owl_hidden');
  };

  // 知識庫由 Apps Script 處理，前端不需載入

  // ── 新增訊息
  function addBotMsg(text) {
    const msgs = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = 'chat-msg bot';
    div.innerHTML = `
      <div class="chat-msg-avatar"><img src="${OWL_IMG}" alt="HR"></div>
      <div class="chat-bubble">${text.replace(/\n/g, '<br>')}</div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function addUserMsg(text) {
    const msgs = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = 'chat-msg user';
    div.innerHTML = `
      <div class="chat-msg-avatar">我</div>
      <div class="chat-bubble">${text.replace(/\n/g, '<br>')}</div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function addTyping() {
    const msgs = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = 'chat-msg bot';
    div.id = 'chat-typing';
    div.innerHTML = `
      <div class="chat-msg-avatar"><img src="${OWL_IMG}" alt="HR"></div>
      <div class="chat-typing"><span></span><span></span><span></span></div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function removeTyping() {
    const t = document.getElementById('chat-typing');
    if (t) t.remove();
  }

  // ── 送出訊息
  async function sendMessage() {
    const input = document.getElementById('chat-input');
    const btn   = document.getElementById('chat-send-btn');
    const text  = input.value.trim();
    if (!text) return;

    input.value = '';
    input.style.height = 'auto';
    btn.disabled = true;
    addUserMsg(text);
    chatHistory.push({ role: 'user', parts: [{ text }] });
    addTyping();

    try {
      const res = await fetch(CHAT_URL, {
        method  : 'POST',
        redirect: 'follow',
        headers : { 'Content-Type': 'text/plain' },
        body    : JSON.stringify({
          action : 'hrChat',
          question: text,
          history : chatHistory.slice(-6), // 最近3輪對話
        }),
      });
      const result = await res.json();
      removeTyping();

      if (result.success && result.reply) {
        chatHistory.push({ role: 'model', parts: [{ text: result.reply }] });
        addBotMsg(result.reply);
      } else {
        addBotMsg('抱歉，目前無法回答，請稍後再試或洽詢人力營運處。');
      }
    } catch(e) {
      removeTyping();
      addBotMsg('連線發生錯誤，請稍後再試。');
    }

    btn.disabled = false;
    if (!isOpen) document.getElementById('hr-owl-btn').classList.add('has-msg');
  }

  // 頁面載入後初始化
  window.addEventListener('DOMContentLoaded', initChat);
})();
