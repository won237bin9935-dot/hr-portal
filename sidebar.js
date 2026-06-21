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
      <div id="sidebar-links-placeholder"></div>
    </nav>
    <div class="sidebar-footer">華美光學 人力營運處</div>
  `;

  // 注入側邊欄
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.innerHTML = sidebarHTML;
  }

  // 動態讀取系統連結
  loadSidebarLinks();
})();

async function loadSidebarLinks() {
  try {
    const sheetId = (typeof HRCONFIG !== 'undefined' && HRCONFIG.SHEETS_ID)
      ? HRCONFIG.SHEETS_ID
      : '1b4xq2XxSCbuIF6SZU-x0Jz4Du_n-YRAJCSQrkm2ze3U';

    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent('系統連結')}&headers=0`;
    const res = await fetch(url);
    const text = await res.text();
    const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\)/);
    if (!match) return;
    const json = JSON.parse(match[1]);

    // 第3列開始（rows[2]）是連結資料
    const rows = json.table.rows.slice(2);
    const placeholder = document.getElementById('sidebar-links-placeholder');
    if (!placeholder) return;

    const currentPage = location.pathname.split('/').pop() || 'home.html';
    const isLinksPage = currentPage === 'links.html';

    let html = '';
    rows.filter(r => r.c && r.c[0]?.v && r.c[3]?.v !== '已停用').forEach(r => {
      const name = r.c[0].v;
      const isActive = isLinksPage && location.search.includes(encodeURIComponent(name)) ? 'active' : '';
      html += `<a class="nav-item ${isActive}" href="links.html?name=${encodeURIComponent(name)}" style="padding-left:32px;font-size:13px;">
        <span class="icon">📊</span> ${name}
      </a>`;
    });
    placeholder.innerHTML = html;
  } catch(e) {
    // 讀取失敗不顯示
  }
}

// 共用 toggleSidebar 函式
function toggleSidebar() {
  const s = document.getElementById('sidebar');
  const o = document.getElementById('sidebar-overlay');
  const c = document.getElementById('sidebar-close');
  const open = s.classList.toggle('open');
  if (o) o.style.display = open ? 'block' : 'none';
  if (c) c.style.display = open ? 'block' : 'none';
}
