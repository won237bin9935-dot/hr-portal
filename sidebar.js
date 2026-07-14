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
// 重點：貓頭鷹 + 對話視窗包成同一個 #hr-chat-widget
// 拖曳任何一方都移動整組，並以整組外框做螢幕邊界修正
// ══════════════════════════════════════════════
var HR_OWL_IMG  = 'https://lh3.googleusercontent.com/d/1rXDTTYj3XdSFJa5rRu0eWsr-BApzrHmC';
var HR_CHAT_URL = 'https://script.google.com/macros/s/AKfycbxfo--2xa9vk6tlIzCjNyu3Y76AQIzYj-tM3XcvFQO72QwkWEqYIW_jSl2JRtE2tgql/exec';
var hrChatOpen     = false;
var hrChatDragging = false;
var hrChatHistory  = [];
var hrGreetingShown = false;
var hrChatSending = false;
var HR_CHAT_LOADING_TEXT = 'HR 小幫手查詢中，請稍候...';
var HR_CHAT_NETWORK_ERROR_TEXT = '目前系統連線異常，請稍後再試。\n若持續發生，請聯絡人資單位協助確認。';

function hrInitChat() {
  if (location.pathname.includes('admin.html')) return;
  if (document.getElementById('hr-chat-widget')) return;

  // 外層容器：貓頭鷹與聊天視窗固定為同一組
  var widget = document.createElement('div');
  widget.id = 'hr-chat-widget';

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
    '<div class="chat-hint">💡小提醒：我每次都會獨立回答問題，無法記住前後問答紀錄。請直接輸入想查詢的關鍵字，例如：病假、公傷、離職、加班餐費，這樣比較容易找到相關回覆喔~😊</div>' +
    '<div class="chat-input-area">' +
      '<textarea class="chat-input" id="chat-input" placeholder="輸入問題…" rows="1"></textarea>' +
      '<button class="chat-send-btn" onclick="hrSendMessage()">➤</button>' +
    '</div>';

  // 貓頭鷹按鈕
  var btn = document.createElement('button');
  btn.id = 'hr-owl-btn';
  btn.title = 'HR 小幫手';
  btn.innerHTML = '<img src="' + HR_OWL_IMG + '" alt="HR小幫手"><div class="owl-badge"></div>';
  btn.onclick = function() {
    if (!hrChatDragging) hrToggleChat();
  };

  // 注意順序：視窗在上、貓頭鷹在下，兩者由外層容器維持固定間距
  widget.appendChild(win);
  widget.appendChild(btn);
  document.body.appendChild(widget);

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

  // 統一拖曳：拖貓頭鷹或拖視窗，都是移動外層 widget
  hrBindChatDrag(widget, btn, win);

  // v5：展開/收合改用目標尺寸模型，不再依賴 width/height transition。

  // 初始化後先校正位置
  hrScheduleClamp();
}

function hrToggleChat() {
  hrChatOpen ? hrCloseChat() : hrOpenChat();
}

function hrOpenChat() {
  var owlAnchor = hrGetOwlAnchor();
  hrChatOpen = true;
  var widget = hrGetWidget();
  var win = hrGetWin();
  var btn = hrGetBtn();

  if (widget) widget.classList.add('chat-open');
  if (win) win.classList.add('open');
  if (btn) btn.classList.remove('has-msg');

  if (!hrGreetingShown) {
    hrAddBotMsg('你好！我是 HR 小幫手 🦉\n有任何人資制度相關問題，都可以問我喔！');
    hrGreetingShown = true;
  }

  // 開啟後以貓頭鷹原位置為錨點，讓視窗從貓頭鷹上方展開。
  hrScheduleClamp(owlAnchor);

  setTimeout(function() {
    var input = document.getElementById('chat-input');
    if (input) input.focus();
  }, 200);
}

// ── 展開/收合對話視窗
var hrChatExpanded = false;
function hrToggleExpand() {
  var owlAnchor = hrGetOwlAnchor();
  var win = hrGetWin();
  var btn = document.getElementById('chat-expand-btn');
  var widget = hrGetWidget();
  if (!win) return;

  hrChatExpanded = !hrChatExpanded;

  if (widget) {
    widget.classList.toggle('chat-expanded', hrChatExpanded);
  }

  if (btn) {
    btn.textContent = hrChatExpanded ? '⤡' : '⤢';
    btn.title = hrChatExpanded ? '收合' : '展開';
  }

  // 展開/收合後以貓頭鷹原位置為錨點，避免貓頭鷹因 widget 尺寸改變而跑位。
  hrApplyChatSize();
  hrScheduleClamp(owlAnchor);
}

function hrCloseChat() {
  var owlAnchor = hrGetOwlAnchor();
  hrChatOpen = false;
  var widget = hrGetWidget();
  var win = hrGetWin();

  if (win) win.classList.remove('open');
  if (widget) widget.classList.remove('chat-open');

  // 關閉後只剩貓頭鷹，維持貓頭鷹原本位置。
  hrScheduleClamp(owlAnchor);
}

function hrEscapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n/g, '<br>');
}

function hrAddBotMsg(text) {
  var msgs = document.getElementById('chat-messages');
  if (!msgs) return;
  var div = document.createElement('div');
  div.className = 'chat-msg bot';
  div.innerHTML =
    '<div class="chat-msg-avatar"><img src="' + HR_OWL_IMG + '" alt="HR"></div>' +
    '<div class="chat-bubble">' + hrEscapeHtml(text) + '</div>';
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
    '<div class="chat-bubble">' + hrEscapeHtml(text) + '</div>';
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function hrAddTyping() {
  var msgs = document.getElementById('chat-messages');
  if (!msgs) return;

  // 避免連續送出時重複產生多個查詢中提示。
  hrRemoveTyping();

  var div = document.createElement('div');
  div.className = 'chat-msg bot';
  div.id = 'chat-typing';
  div.innerHTML =
    '<div class="chat-msg-avatar"><img src="' + HR_OWL_IMG + '" alt="HR"></div>' +
    '<div class="chat-bubble">' + hrEscapeHtml(HR_CHAT_LOADING_TEXT) + '</div>';
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
    var owlBtn = hrGetBtn();
    if (owlBtn) owlBtn.classList.add('has-msg');
  }
}


// ── 聊天視窗拖曳與邊界控制
// v5：只移動 #hr-chat-widget；使用目標尺寸模型，避免展開/收合時讀取動畫中尺寸。
var HR_CHAT_MARGIN = 12;
var HR_CHAT_DRAG_THRESHOLD = 5;
var HR_CHAT_DESKTOP_WIDTH = 360;
var HR_CHAT_EXPANDED_WIDTH = 480;
var HR_CHAT_DESKTOP_HEIGHT = 520;
var HR_CHAT_MIN_HEIGHT = 300;

var hrDragActive = false;
var hrDragMoved  = false;
var hrDragTarget = null;
var hrDragStartX = 0;
var hrDragStartY = 0;
var hrDragStartL = 0;
var hrDragStartT = 0;

function hrGetWidget() {
  return document.getElementById('hr-chat-widget');
}

function hrGetWin() {
  return document.getElementById('hr-chat-window');
}

function hrGetBtn() {
  return document.getElementById('hr-owl-btn');
}

function hrGetOwlAnchor() {
  var btn = hrGetBtn();
  if (!btn) return null;
  var rect = btn.getBoundingClientRect();
  return {
    right: rect.right,
    bottom: rect.bottom
  };
}

function hrIsInteractiveEl(el) {
  if (!el || !el.closest) return false;

  return !!el.closest(
    'input, textarea, button, a, select, option, label,' +
    ' .chat-header-actions, .chat-input-area, .chat-send-btn,' +
    ' .chat-messages, .chat-msg, .chat-bubble,' +
    ' .quick-reply, .quick-button, .no-drag'
  );
}

function hrGetChatGap() {
  return window.innerWidth <= 560 ? 10 : 12;
}

function hrGetOwlSize() {
  return window.innerWidth <= 560 ? 56 : 64;
}

function hrSetFixedWidgetByCurrentRect() {
  var widget = hrGetWidget();
  if (!widget) return;

  var rect = widget.getBoundingClientRect();
  widget.style.position = 'fixed';
  widget.style.left     = rect.left + 'px';
  widget.style.top      = rect.top  + 'px';
  widget.style.right    = 'auto';
  widget.style.bottom   = 'auto';
}

function hrClampNumber(value, min, max) {
  if (max < min) return max;
  return Math.min(Math.max(value, min), max);
}

function hrComputeChatLayout() {
  var vw = window.innerWidth || document.documentElement.clientWidth || 360;
  var vh = window.innerHeight || document.documentElement.clientHeight || 640;
  var isMobile = vw <= 560;
  var margin = HR_CHAT_MARGIN;
  var gap = hrGetChatGap();
  var owlSize = hrGetOwlSize();

  var availableW = Math.max(220, vw - margin * 2);
  var availableHForWindow = Math.max(220, vh - margin * 2 - owlSize - gap);

  var winW;
  var winH;

  if (hrChatOpen && hrChatExpanded) {
    winW = isMobile ? availableW : Math.min(HR_CHAT_EXPANDED_WIDTH, availableW);

    var desiredH = isMobile ? (vh - 110) : Math.floor(vh * 0.80);
    winH = Math.min(Math.max(HR_CHAT_MIN_HEIGHT, desiredH), availableHForWindow);
    if (availableHForWindow < HR_CHAT_MIN_HEIGHT) winH = availableHForWindow;
  } else {
    winW = isMobile ? availableW : Math.min(HR_CHAT_DESKTOP_WIDTH, availableW);
    winH = Math.min(HR_CHAT_DESKTOP_HEIGHT, availableHForWindow);
    if (availableHForWindow >= HR_CHAT_MIN_HEIGHT) {
      winH = Math.max(HR_CHAT_MIN_HEIGHT, winH);
    }
  }

  winW = Math.floor(winW);
  winH = Math.floor(winH);

  var widgetW = hrChatOpen ? Math.max(winW, owlSize) : owlSize;
  var widgetH = hrChatOpen ? (winH + gap + owlSize) : owlSize;

  return {
    vw: vw,
    vh: vh,
    margin: margin,
    gap: gap,
    owlSize: owlSize,
    windowW: winW,
    windowH: winH,
    widgetW: Math.ceil(widgetW),
    widgetH: Math.ceil(widgetH)
  };
}

function hrApplyChatSize() {
  var widget = hrGetWidget();
  var win = hrGetWin();
  var btn = hrGetBtn();
  if (!widget || !win) return null;

  var layout = hrComputeChatLayout();

  widget.style.setProperty('--hr-owl-size', layout.owlSize + 'px');
  widget.style.setProperty('--hr-chat-gap', layout.gap + 'px');
  widget.style.setProperty('--hr-window-width', layout.windowW + 'px');
  widget.style.setProperty('--hr-window-height', layout.windowH + 'px');
  widget.style.setProperty('--hr-widget-width', layout.widgetW + 'px');
  widget.style.setProperty('--hr-widget-height', layout.widgetH + 'px');

  // 避免舊版 inline 樣式殘留造成 v5 目標尺寸模型失準。
  win.style.width = '';
  win.style.height = '';
  win.style.maxWidth = '';
  win.style.maxHeight = '';
  win.style.overflow = '';

  if (btn) {
    btn.style.width = '';
    btn.style.height = '';
  }

  return layout;
}

function hrClampWidget(owlAnchor) {
  var widget = hrGetWidget();
  if (!widget) return;

  var layout = hrApplyChatSize() || hrComputeChatLayout();
  var rect = widget.getBoundingClientRect();

  var left;
  var top;

  if (owlAnchor && typeof owlAnchor.right === 'number' && typeof owlAnchor.bottom === 'number') {
    left = owlAnchor.right - layout.widgetW;
    top  = owlAnchor.bottom - layout.widgetH;
  } else {
    left = rect.left;
    top  = rect.top;
  }

  var width = layout.widgetW;
  var height = layout.widgetH;

  var maxL = layout.vw - width  - layout.margin;
  var maxT = layout.vh - height - layout.margin;

  if (maxL < layout.margin) maxL = layout.margin;
  if (maxT < layout.margin) maxT = layout.margin;

  left = hrClampNumber(left, layout.margin, maxL);
  top  = hrClampNumber(top,  layout.margin, maxT);

  widget.style.position = 'fixed';
  widget.style.left     = left + 'px';
  widget.style.top      = top  + 'px';
  widget.style.right    = 'auto';
  widget.style.bottom   = 'auto';
}

window.clampHrChatWidget = hrClampWidget;

function hrScheduleClamp(owlAnchor) {
  // v5：先用貓頭鷹位置當錨點修正一次，再於下一個畫面更新週期做最終邊界校正。
  hrClampWidget(owlAnchor || null);

  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(function() {
      hrClampWidget();
    });
  } else {
    setTimeout(function() {
      hrClampWidget();
    }, 16);
  }
}

function hrBindChatDrag(widget, btn, win) {
  if (!widget) return;

  if (btn) {
    btn.addEventListener('pointerdown', function(e) {
      hrOnPointerDown(e, btn);
    });
  }

  if (win) {
    win.addEventListener('pointerdown', function(e) {
      if (hrIsInteractiveEl(e.target)) return;
      hrOnPointerDown(e, win);
    });

    var header = win.querySelector('.chat-header');
    if (header) header.style.cursor = 'grab';
  }
}

function hrOnPointerDown(e, sourceEl) {
  var widget = hrGetWidget();
  if (!widget) return;
  if (e.button !== undefined && e.button !== 0) return;

  hrDragActive = true;
  hrDragMoved  = false;
  hrDragTarget = widget;

  if (sourceEl && sourceEl.id === 'hr-owl-btn') {
    hrChatDragging = false;
  }

  hrApplyChatSize();
  hrSetFixedWidgetByCurrentRect();

  var rect = widget.getBoundingClientRect();
  hrDragStartX = e.clientX;
  hrDragStartY = e.clientY;
  hrDragStartL = rect.left;
  hrDragStartT = rect.top;

  widget.classList.add('is-dragging');

  if (sourceEl && sourceEl.setPointerCapture) {
    try { sourceEl.setPointerCapture(e.pointerId); } catch(err) {}
  }

  if (!sourceEl || sourceEl.id !== 'hr-owl-btn') e.preventDefault();
}

function hrOnPointerMove(e) {
  if (!hrDragActive || !hrDragTarget) return;

  var dx = e.clientX - hrDragStartX;
  var dy = e.clientY - hrDragStartY;

  if (!hrDragMoved && (Math.abs(dx) > HR_CHAT_DRAG_THRESHOLD || Math.abs(dy) > HR_CHAT_DRAG_THRESHOLD)) {
    hrDragMoved = true;
    hrChatDragging = true;
  }

  if (!hrDragMoved) return;

  hrDragTarget.style.left   = (hrDragStartL + dx) + 'px';
  hrDragTarget.style.top    = (hrDragStartT + dy) + 'px';
  hrDragTarget.style.right  = 'auto';
  hrDragTarget.style.bottom = 'auto';

  hrClampWidget();
  e.preventDefault();
}

function hrOnPointerUp() {
  if (!hrDragActive) return;

  var wasMoved = hrDragMoved;
  var widget = hrGetWidget();

  hrDragActive = false;
  hrDragMoved  = false;
  hrDragTarget = null;

  if (widget) widget.classList.remove('is-dragging');
  hrScheduleClamp();

  if (wasMoved) {
    hrChatDragging = true;
    setTimeout(function() { hrChatDragging = false; }, 150);
  } else {
    hrChatDragging = false;
  }
}

document.addEventListener('pointermove', hrOnPointerMove);
document.addEventListener('pointerup',   hrOnPointerUp);
document.addEventListener('pointercancel', hrOnPointerUp);

window.addEventListener('resize', function() {
  hrScheduleClamp(hrGetOwlAnchor());
});
window.addEventListener('orientationchange', function() {
  setTimeout(function() {
    hrScheduleClamp(hrGetOwlAnchor());
  }, 300);
});

window.addEventListener('DOMContentLoaded', hrInitChat);

// =====================================================
// HR Chat Widget v7 Override - category option buttons + loading/error messages
// 2026-07-13
// Purpose:
// - 支援 Apps Script v3.6 回傳 options。
// - 每個按鈕直接送 directTarget(targetType + targetId)，不靠後端記住上一題。
// - 純文字輸入 1 不解析，由後端回覆不支援編號。
// - 送出問題後顯示查詢中；收到回覆後移除；fetch 失敗時顯示友善錯誤訊息。
// =====================================================

function hrAddBotMsg(text, options) {
  var msgs = document.getElementById('chat-messages');
  if (!msgs) return;

  var div = document.createElement('div');
  div.className = 'chat-msg bot';

  var avatar = document.createElement('div');
  avatar.className = 'chat-msg-avatar';
  avatar.innerHTML = '<img src="' + HR_OWL_IMG + '" alt="HR">';

  var bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  bubble.innerHTML = hrEscapeHtml(text);

  if (Array.isArray(options) && options.length > 0) {
    var opts = document.createElement('div');
    opts.className = 'hr-chat-options';

    options.forEach(function(opt) {
      if (!opt || !opt.label || !opt.targetType || !opt.targetId) return;

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'hr-chat-option-btn';
      btn.textContent = opt.label;
      btn.setAttribute('data-target-type', opt.targetType);
      btn.setAttribute('data-target-id', opt.targetId);

      btn.addEventListener('click', function() {
        hrSendDirectTarget(opt.label, opt.targetType, opt.targetId);
      });

      opts.appendChild(btn);
    });

    if (opts.children.length > 0) {
      bubble.appendChild(opts);
    }
  }

  div.appendChild(avatar);
  div.appendChild(bubble);
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

async function hrSendDirectTarget(label, targetType, targetId) {
  var sendBtn = document.querySelector('.chat-send-btn');

  if (!targetType || !targetId) return;
  if (hrChatSending) return;

  hrChatSending = true;
  if (sendBtn) sendBtn.disabled = true;

  hrAddUserMsg(label || '查詢項目');
  hrChatHistory.push({ role: 'user', parts: [{ text: label || '查詢項目' }] });
  hrAddTyping();

  try {
    var res = await fetch(HR_CHAT_URL, {
      method  : 'POST',
      redirect: 'follow',
      headers : { 'Content-Type': 'text/plain' },
      body    : JSON.stringify({
        action      : 'hrChat',
        question    : label || '',
        directTarget: {
          targetType: targetType,
          targetId  : targetId,
          label     : label || ''
        },
        history     : hrChatHistory.slice(-6),
      }),
    });

    if (!res.ok) throw new Error('HTTP ' + res.status);

    var result = await res.json();
    hrRemoveTyping();

    if (result.success && result.reply) {
      hrChatHistory.push({ role: 'model', parts: [{ text: result.reply }] });
      hrAddBotMsg(result.reply, result.options || []);
    } else {
      hrAddBotMsg(HR_CHAT_NETWORK_ERROR_TEXT);
    }
  } catch(e) {
    hrRemoveTyping();
    hrAddBotMsg(HR_CHAT_NETWORK_ERROR_TEXT);
  } finally {
    hrChatSending = false;
    if (sendBtn) sendBtn.disabled = false;
  }
}

async function hrSendMessage() {
  var input = document.getElementById('chat-input');
  var sendBtn = document.querySelector('.chat-send-btn');
  if (!input) return;
  if (hrChatSending) return;

  var text = input.value.trim();
  if (!text) return;

  input.value = '';
  input.style.height = 'auto';
  hrChatSending = true;
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

    if (!res.ok) throw new Error('HTTP ' + res.status);

    var result = await res.json();
    hrRemoveTyping();

    if (result.success && result.reply) {
      hrChatHistory.push({ role: 'model', parts: [{ text: result.reply }] });
      hrAddBotMsg(result.reply, result.options || []);
    } else {
      hrAddBotMsg(HR_CHAT_NETWORK_ERROR_TEXT);
    }
  } catch(e) {
    hrRemoveTyping();
    hrAddBotMsg(HR_CHAT_NETWORK_ERROR_TEXT);
  } finally {
    hrChatSending = false;
    if (sendBtn) sendBtn.disabled = false;
  }

  if (!hrChatOpen) {
    var owlBtn = hrGetBtn();
    if (owlBtn) owlBtn.classList.add('has-msg');
  }
}
