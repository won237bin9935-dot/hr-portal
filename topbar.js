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
    <div class="topbar-brand">華美光學 人力資源系統</div>
    <div class="topbar-avatar">HR</div>
  `;
})();
