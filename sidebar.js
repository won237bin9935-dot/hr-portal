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
      <div class="nav-section-label">系統整合</div>
      <a class="nav-item ${isActive('links.html')}" href="links.html"><span class="icon">🔗</span> 相關系統連結</a>
    </nav>
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
