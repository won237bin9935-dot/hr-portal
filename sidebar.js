// ============================================
// 華美光學人資系統 — 共用側邊欄
// 只需修改這個檔案，所有頁面自動更新
// ============================================

(function() {
  const LOGO_URL = 'https://lh3.googleusercontent.com/d/1VFVjgXLuw7v6yEPLi_BnF2zRXEhah8UQ';

  // 取得目前頁面的檔名
  const currentPage = location.pathname.split('/').pop() || 'home.html';

  function isActive(href) {
    return currentPage === href ? 'active' : '';
  }

  const sidebarHTML = `
    <div class="sidebar-header">
      <img src="${LOGO_URL}" alt="華美光學">
      <button onclick="toggleSidebar()" id="sidebar-close">✕</button>
    </div>
    <nav>
      <div class="nav-section-label">主選單</div>
      <a class="nav-item ${isActive('home.html')}" href="home.html"><span class="icon">🏠</span> 首頁總覽</a>
      <div class="nav-section-label">學習與測驗</div>
      <a class="nav-item ${isActive('quiz.html')}" href="quiz.html"><span class="icon">📝</span> 測驗專區</a>
      <a class="nav-item" href="#"><span class="icon">🎓</span> 教育訓練</a>
      <div class="nav-section-label">資料與公告</div>
      <a class="nav-item ${isActive('docs.html') || isActive('doc-detail.html')}" href="docs.html"><span class="icon">📁</span> 文件宣導</a>
      <a class="nav-item ${isActive('events-list.html') || isActive('event-detail.html')}" href="events-list.html"><span class="icon">🎉</span> 活動報名</a>
      <a class="nav-item ${isActive('notice.html')}" href="notice.html"><span class="icon">📢</span> 最新公告</a>
      <div class="nav-section-label">各項統計分析</div>
      <a class="nav-item ${isActive('links.html')}" href="links.html"><span class="icon">📊</span> 統計分析入口</a>
    </nav>
    <div class="sidebar-admin-wrap">
      <button class="sidebar-admin-btn" onclick="enterAdmin()">⚙ 後台管理</button>
    </div>
    <div class="sidebar-footer">華美光學 人力營運處</div>
  `;

  // 注入側邊欄
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.innerHTML = sidebarHTML;
  }

})();

// 共用 toggleSidebar 函式
function toggleSidebar() {
  const s = document.getElementById('sidebar');
  const o = document.getElementById('sidebar-overlay');
  const c = document.getElementById('sidebar-close');
  const open = s.classList.toggle('open');
  if (o) o.style.display = open ? 'block' : 'none';
  if (c) c.style.display = open ? 'block' : 'none';
}

// ── 後台管理入口 ──
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxfo--2xa9vk6tlIzCjNyu3Y76AQIzYj-tM3XcvFQO72QwkWEqYIW_jSl2JRtE2tgql/exec';
let adminFailCount = 0;

function enterAdmin() {
  // 建立 Modal
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
    // 點遮罩關閉
    modal.addEventListener('click', function(e) {
      if (e.target === modal) closeAdminModal();
    });
  }
  modal.style.display = 'flex';
  setTimeout(() => document.getElementById('admin-pwd-input').focus(), 100);
}

function closeAdminModal() {
  const modal = document.getElementById('admin-pwd-modal');
  if (modal) modal.style.display = 'none';
  const input = document.getElementById('admin-pwd-input');
  if (input) input.value = '';
  const err = document.getElementById('admin-pwd-error');
  if (err) err.style.display = 'none';
}

function confirmAdminPwd() {
  const input = document.getElementById('admin-pwd-input');
  const err = document.getElementById('admin-pwd-error');
  const pwd = input.value.trim();

  if (pwd === '@@69314511@@') {
    adminFailCount = 0;
    sessionStorage.setItem('admin_auth', 'true');
    closeAdminModal();
    window.location.href = 'admin.html';
  } else {
    adminFailCount++;
    input.value = '';
    input.focus();
    err.textContent = `密碼錯誤，請重試（第 ${adminFailCount} 次）`;
    err.style.display = 'block';

    // 連續錯誤 3 次 → 寄通知信
    if (adminFailCount >= 3) {
      sendAdminLoginAlert();
      err.textContent = '密碼錯誤次數過多，已通知管理員';
      adminFailCount = 0;
    }
  }
}

function sendAdminLoginAlert() {
  try {
    const ua = navigator.userAgent;
    const payload = {
      action   : 'adminLoginAlert',
      userAgent: ua,
      time     : new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
    };
    fetch(APPS_SCRIPT_URL, {
      method : 'POST',
      body   : JSON.stringify(payload),
    });
  } catch(e) {
    console.error('通知信發送失敗', e);
  }
}

// ── 滑鼠彗星尾巴效果 ──
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
      p.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: rgba(80,80,80,${opacity});
        left: ${pos.x - size/2}px;
        top: ${pos.y - size/2}px;
        pointer-events: none;
        z-index: 9999;
      `;
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
