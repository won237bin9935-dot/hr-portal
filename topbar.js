// ============================================
// 華美光學人資系統 — 共用頂部欄
// 只需修改這個檔案，所有頁面自動更新
// ============================================

(function() {
  const topbar = document.querySelector('.topbar');
  if (!topbar) return;

  topbar.innerHTML = `
    <div class="topbar-left">
      <button class="menu-toggle" onclick="toggleSidebar()">☰</button>
    </div>
    <div class="topbar-brand">
      <span class="topbar-brand-main">華美光學</span>
      <span class="topbar-brand-sub"> 人力資源系統</span>
    </div>
    <div class="topbar-particles" id="topbar-particles"></div>
    <div class="topbar-avatar">HR</div>
  `;

  // 產生粒子
  const container = document.getElementById('topbar-particles');
  for (let i = 0; i < 35; i++) {
    const p = document.createElement('div');
    p.className = 'topbar-particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (4 + Math.random() * 6) + 's';
    p.style.animationDelay = (Math.random() * 6) + 's';
    p.style.opacity = (.3 + Math.random() * .4).toString();
    container.appendChild(p);
  }
})();
