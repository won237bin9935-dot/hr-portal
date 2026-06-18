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
    '深黑灰':   { primary: '#2e3141', dark: '#1a1e2e', light: '#f0f1f5' },
    '深藍':     { primary: '#1a3a6e', dark: '#0f2347', light: '#e8eef8' },
    '藍綠':     { primary: '#2980b9', dark: '#1a5f8a', light: '#e8f3fb' },
    '湖水綠':   { primary: '#16acd0', dark: '#0e7d99', light: '#e0f7fc' },
    '海洋藍':   { primary: '#a4dcff', dark: '#5aabdd', light: '#eaf6ff' },
    '淺灰':     { primary: '#c9d3d3', dark: '#8a9a9a', light: '#f4f6f6' },
    '草綠':     { primary: '#26c067', dark: '#1a8a49', light: '#e8faf0' },
    '翠綠':     { primary: '#11734b', dark: '#0a4f34', light: '#e0f5ec' },
    '橄欖綠':   { primary: '#7f8c1d', dark: '#5a6414', light: '#f4f6e0' },
    '鮮紅':     { primary: '#ff0000', dark: '#cc0000', light: '#ffe0e0' },
    '亮橘':     { primary: '#ff7512', dark: '#cc5c0e', light: '#fff0e0' },
    '珊瑚紅':   { primary: '#f56a6a', dark: '#d94f4f', light: '#fff0f0' },
    '玫瑰粉':   { primary: '#fa58a9', dark: '#d43d8c', light: '#fde8f4' },
    '淡粉':     { primary: '#ffd6dc', dark: '#e8a0aa', light: '#fff5f7' },
    '薰衣草紫': { primary: '#e6cff2', dark: '#a87acc', light: '#f8f0fd' },
    '灰綠':     { primary: '#d8ddac', dark: '#a0a870', light: '#f5f6e8' },
    '奶茶':     { primary: '#e8d8c8', dark: '#b8987a', light: '#faf5f0' },
    '亮黃':     { primary: '#fcf200', dark: '#c8c000', light: '#fffde0' },
  },
};

// ============================================
// Sheets 資料讀取核心函式（不需要修改）
// ============================================

async function fetchSheet(sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${HRCONFIG.SHEETS_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}&headers=1`;
  try {
    const res = await fetch(url);
    const text = await res.text();
    // gviz 回應格式：/*O_o*/\ngoogle.visualization.Query.setResponse({...});
    const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\)/);
    if (!match) throw new Error('無法解析 gviz 回應');
    const json = JSON.parse(match[1]);
    const table = json.table;
    // 取欄位名稱（第一列）
    const cols = table.cols.map(c => c.label || c.id);
    // 過濾掉空白列
    const rows = (table.rows || [])
      .filter(row => row.c && row.c.some(cell => cell && cell.v !== null && cell.v !== ''))
      .map(row => {
        const obj = {};
        row.c.forEach((cell, i) => {
          if (cols[i]) {
            obj[cols[i]] = cell ? (cell.v !== null && cell.v !== undefined ? String(cell.v) : '') : '';
          }
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


// 修正 Google Sheets 日期格式 Date(yyyy,m,d) → yyyy-MM-dd
function formatSheetDate(val) {
  if (!val) return '';
  const match = String(val).match(/Date\((\d+),(\d+),(\d+)\)/);
  if (match) {
    const y = match[1];
    const m = String(parseInt(match[2])+1).padStart(2,'0');
    const d = String(match[3]).padStart(2,'0');
    return y+'-'+m+'-'+d;
  }
  return String(val);
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

// 修正 Google Sheets 日期格式 Date(yyyy,m,d) → yyyy-MM-dd
function formatSheetDate(val) {
  if (!val) return '';
  const s = String(val);
  const match = s.match(/Date\((\d+),(\d+),(\d+)\)/);
  if (match) {
    const y = match[1];
    const m = String(parseInt(match[2])+1).padStart(2,'0');
    const d = String(match[3]).padStart(2,'0');
    return y+'-'+m+'-'+d;
  }
  return s;
}
