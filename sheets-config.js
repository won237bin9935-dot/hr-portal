// ============================================
// 華美光學人資系統 — Google Sheets 設定檔
// ============================================
// ★ 只需要修改這個檔案，其他不用動 ★

const HRCONFIG = {
  // ★ 把你的 Google Sheets ID 貼在這裡
  // 網址列 /d/ 和 /edit 之間的那段文字
  SHEETS_ID: '1b4xq2XxSCbuIF6SZU-x0Jz4Du_n-YRAJCSQrkm2ze3U',

  // 各分頁名稱（跟 Sheets 裡的分頁名稱要一致）
  SHEETS: {
    EVENTS:   '活動列表',
    QUIZ:     '測驗列表',
    DOCS:     '文件宣導',
    NOTICE:   '最新公告',
    SETTINGS: '系統設定',
  },

  // 預設色票（名稱要跟 Sheets 下拉選單一致）
  COLOR_THEMES: {
    '海洋藍': { primary: '#1a7fbf', dark: '#0d5f8f', light: '#e8f4fc' },
    '森林綠': { primary: '#27ae60', dark: '#1e8449', light: '#eaf7ee' },
    '活力橘': { primary: '#f0a500', dark: '#c47f00', light: '#fff7e0' },
    '珊瑚紅': { primary: '#f56a6a', dark: '#d94f4f', light: '#fff0f0' },
    '優雅紫': { primary: '#9b59b6', dark: '#7d3c98', light: '#f5eeff' },
    '深灰黑': { primary: '#2e3141', dark: '#1a1e2e', light: '#f0f1f5' },
    '鮮紅':   { primary: '#e74c3c', dark: '#c0392b', light: '#fdecea' },
    '青綠':   { primary: '#16a085', dark: '#0e6655', light: '#e0f5f1' },
    '深橘':   { primary: '#d35400', dark: '#a04000', light: '#fdeee5' },
    '天藍':   { primary: '#2980b9', dark: '#1a5f8a', light: '#e8f3fb' },
    '深紫':   { primary: '#8e44ad', dark: '#6c3483', light: '#f3e8fb' },
    '翠綠':   { primary: '#2ecc71', dark: '#27ae60', light: '#eafaf1' },
  },
};

// ============================================
// Sheets 資料讀取核心函式（不需要修改）
// ============================================

async function fetchSheet(sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${HRCONFIG.SHEETS_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
  try {
    const res = await fetch(url);
    const text = await res.text();
    const json = JSON.parse(text.substring(47).slice(0, -2));
    const cols = json.table.cols.map(c => c.label);
    const rows = json.table.rows.map(row => {
      const obj = {};
      row.c.forEach((cell, i) => {
        obj[cols[i]] = cell ? (cell.v !== null ? cell.v : '') : '';
      });
      return obj;
    });
    return rows;
  } catch (e) {
    console.error('Sheets 讀取失敗：', e);
    return [];
  }
}

// 取得系統設定
async function getSettings() {
  const rows = await fetchSheet(HRCONFIG.SHEETS.SETTINGS);
  const settings = {};
  rows.forEach(row => {
    if (row['設定項目'] && row['設定值']) {
      settings[row['設定項目']] = row['設定值'];
    }
  });
  return settings;
}

// 套用活動主色
function applyEventColor(themeName, customHex) {
  let color;
  if (customHex && /^#[0-9A-Fa-f]{6}$/.test(customHex.trim())) {
    const hex = customHex.trim();
    color = {
      primary: hex,
      dark: shadeHex(hex, -25),
      light: shadeHex(hex, 90),
    };
  } else if (themeName && HRCONFIG.COLOR_THEMES[themeName]) {
    color = HRCONFIG.COLOR_THEMES[themeName];
  } else {
    color = HRCONFIG.COLOR_THEMES['海洋藍'];
  }
  document.documentElement.style.setProperty('--event-primary', color.primary);
  document.documentElement.style.setProperty('--event-dark', color.dark);
  document.documentElement.style.setProperty('--event-light', color.light);
}

function shadeHex(hex, pct) {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + Math.round(255 * pct / 100)));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + Math.round(255 * pct / 100)));
  const b = Math.min(255, Math.max(0, (num & 0xff) + Math.round(255 * pct / 100)));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// 狀態標籤樣式
function statusBadge(status) {
  const map = {
    '報名中':   { cls: 'open',   label: '● 報名中' },
    '即將開始': { cls: 'soon',   label: '● 即將開始' },
    '已截止':   { cls: 'closed', label: '已截止' },
    '已結束':   { cls: 'ended',  label: '已結束' },
    '開放中':   { cls: 'open',   label: '● 開放中' },
  };
  return map[status] || { cls: 'closed', label: status };
}
