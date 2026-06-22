// ==========================================
// 1. Title List (Dictionary)
// ==========================================
const STEP_TITLES = {
  0: "Tahap 0 : Pendahuluan",
  1: "Tahap 1 : Literasi Keuangan",
  2: "Tahap 2 : Riset Bisnis Keluarga",
  "2-1": "Tahap 2-1 : Profil Bisnis Keluarga", 
  "2-2": "Tahap 2-2 : Kalender Bisnis Keluarga",
  3: "Tahap 3 : Ide Bisnis",
  4: "Tahap 4 : Bisnis Plan",             
  "4-1": "Tahap 4-1 : Profil Bisnis", 
  "4-2": "Tahap 4-2 : Struktur Modal & Aset",
  "4-3": "Tahap 4-3 : Kalender Bisnis",
  5: "Tahap 5 : Hasil Riset Bisnis Superstar",
  6: "Tahap 6 : Struktur Bisnis",
  7: "Tahap 7 : Analisa SWOT",
  8: "Tahap 8 : Payoff Matriks Bisnis Plan",
  9: "Tahap 9 : Hasil Riset Bisnis Superstar Jepang",
  10: "Tahap 10 : Pengajuan Sertifikat"
};

// ==========================================
// 2. Automatically Get Step Key From URL
// ==========================================
function getStepKeyFromURL() {
  const filename = window.location.pathname.split('/').pop();
  
  if (filename === "" || filename === "index.html") {
    return "0";
  }
  
  const match = filename.match(/step([\d-]+)\.html/i);
  return match ? match[1] : "1";
}

// ==========================================
// 3. Shared Function to Load HTML Components
// ==========================================
function loadComponent(url, containerId, callback = null) {
  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.text();
    })
    .then(html => {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = html;
        if (callback) callback();
      }
    })
    .catch(err => console.error(`Error loading ${url}:`, err));
}

// ==========================================
// 4. Main Initialization on DOM Load
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  const stepKey = getStepKeyFromURL();

  // ① Load Common Header
  loadComponent('components/header.html', 'header-container', () => {
    const subtitleElement = document.getElementById("header-sub-title");
    if (subtitleElement && STEP_TITLES[stepKey]) {
      subtitleElement.innerText = STEP_TITLES[stepKey];
      document.title = STEP_TITLES[stepKey];
    }
    
    // 【ヘッダー読み込み完了後】に、CSV/PDF関連のイベントとナビ色変更を起動
    initHeaderEvents();
    highlightHeaderNav(stepKey);
  });

  // ② Load Common Footer
  loadComponent('components/footer.html', 'footer-container');

  // ③【ロードマップ画面（Tahap 0 の中身）】のボタンの色を変更
  highlightRoadmapNav();
});

// ==========================================
// 5. Highlight Navigation Links
// ==========================================
function highlightHeaderNav(stepKey) {
  const activeNavBtn = document.getElementById(`nav-step-${stepKey}`);
  if (activeNavBtn) {
    activeNavBtn.style.backgroundColor = "#0F172A";
    activeNavBtn.style.color = "#FFFFFF";
  }
}

function highlightRoadmapNav() {
  const filename = window.location.pathname.split('/').pop();
  const currentStep = (filename === "" || filename === "index.html") ? "index.html" : filename;

  const allLinks = document.querySelectorAll(".step-box, .step-sub-box");
  allLinks.forEach(link => {
    if (link.getAttribute("href") === currentStep) {
      link.classList.add("active-step");
    }
  });
}

// ==========================================
// 6. 🌟 Header Actions Linkage (CSV & PDF 統合)
// ==========================================
function initHeaderEvents() {
  const importBtn = document.getElementById("btn-import-csv");
  const fileInput = document.getElementById("input-import-csv");
  const exportCsvBtn = document.getElementById("btn-export-csv");
  const exportPdfBtn = document.getElementById("btn-export-pdf"); // 🌟 PDFボタン

  // 📥 CSVインポート
  if (importBtn && fileInput) {
    importBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) console.log("Selected CSV File Name:", file.name);
    });
  }

  // 📤 CSVエクスポート
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener("click", () => {
      exportPageToCSV();
    });
  }

  // 📕 PDFエクスポート
  if (exportPdfBtn) {
    exportPdfBtn.addEventListener("click", () => {
      exportPageToPDF();
    });
  }
}

// 📄 共通CSV生成ロジック
function exportPageToCSV() {
  const stepKey = getStepKeyFromURL();
  const title = STEP_TITLES[stepKey] || "Data";
  const inputs = document.querySelectorAll(".main-container input, .main-container textarea");
  
  if (inputs.length === 0) {
    alert("Tidak ada data yang bisa diexport di halaman ini.");
    return;
  }

  let csvContent = "\uFEFF"; 
  csvContent += "ID,Label,Nilai\n";

  inputs.forEach((input) => {
    if (input.type === "button" || input.type === "submit" || input.type === "file") return;

    let labelText = "";
    if (input.id) {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (label) labelText = label.innerText.trim();
    }
    if (!labelText) {
      labelText = input.placeholder || input.name || input.type;
    }

    const cleanLabel = labelText.replace(/"/g, '""').replace(/\n/g, ' ');
    const cleanValue = input.value.replace(/"/g, '""');
    const inputId = input.id || input.name || "input";

    csvContent += `"${inputId}","${cleanLabel}","${cleanValue}"\n`;
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const formattedTitle = title.replace(/\s+/g, '_').replace(/:/g, '');
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${formattedTitle}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 📕 共通PDF出力ロジック
function exportPageToPDF() {
  const dateElement = document.getElementById("current-print-date");
  
  // 印刷用の隠しエリア（HTML側）がある場合、2026年の現在日時を自動セット
  if (dateElement) {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    dateElement.innerText = `Tanggal Cetak: ${day}/${month}/${year} ${hours}:${minutes}`;
  }

  // プリントダイアログを呼び出す（印刷用CSSと連動してメニュー等が自動で消えます）
  window.print(); 
}