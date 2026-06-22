// js/step2-2.js

document.addEventListener('DOMContentLoaded', () => {
  // === 1. Load and Save Participant Name ===
  const nameInput = document.getElementById('name');
  if (nameInput) {
    const savedName = localStorage.getItem('step2-2-name');
    if (savedName) nameInput.value = savedName;
    nameInput.addEventListener('input', () => {
      localStorage.setItem('step2-2-name', nameInput.value);
    });
  }

  // === Helper Function: Format to Indonesian Rupiah ===
  function formatRupiah(value) {
    return 'Rp ' + Math.floor(value).toLocaleString('id-ID');
  }

  // === 2. Core Logic for Calendar Table Matrix ===
  function setupCalendarEngine({ containerId, buttonId, storageKey, isExpense = false }) {
    const container = document.getElementById(containerId);
    const btnAdd = document.getElementById(buttonId);

    if (!container || !btnAdd) return;

    // A. Recalculate Totals (Rows & Columns) and Save Matrix
    function calculateCalendar() {
      const rows = container.querySelectorAll('.calendar-dynamic-row');
      const matrixData = [];
      const monthlyTotals = new Array(12).fill(0);
      let grandRowAvgTotal = 0;

      rows.forEach(row => {
        const name = row.querySelector('.item-name').value;
        const monthInputs = row.querySelectorAll('.month-input');
        const monthsData = [];
        let rowSum = 0;

        monthInputs.forEach((input, mIdx) => {
          const val = parseFloat(input.value) || 0;
          monthsData.push(val);
          rowSum += val;
          monthlyTotals[mIdx] += val;
        });

        const rowAvg = rowSum / 12;
        grandRowAvgTotal += rowAvg;
        
        row.querySelector('.row-avg-display').innerText = formatRupiah(rowAvg);
        matrixData.push({ name, months: monthsData });
      });

      localStorage.setItem(storageKey, JSON.stringify(matrixData));

      const targetPrefix = isExpense ? 'exp' : 'inc';
      const totalDisplayLabel = document.getElementById(`avg-total-${isExpense ? 'expense' : 'income'}`);
      if (totalDisplayLabel) totalDisplayLabel.innerText = formatRupiah(grandRowAvgTotal);

      const mCells = document.querySelectorAll(`.m-total-${targetPrefix}`);
      mCells.forEach((cell, idx) => {
        cell.innerText = formatRupiah(monthlyTotals[idx]);
      });

      calculateNetProfitSummary();
    }

    function calculateNetProfitSummary() {
      const avgInc = parseFloat(document.getElementById('avg-total-income')?.innerText.replace(/[^\d]/g, '')) || 0;
      const avgExp = parseFloat(document.getElementById('avg-total-expense')?.innerText.replace(/[^\d]/g, '')) || 0;
      const netAvgLabel = document.getElementById('avg-total-net');
      if (netAvgLabel) netAvgLabel.innerText = formatRupiah(avgInc - avgExp);

      for (let m = 0; m < 12; m++) {
        const incCell = document.querySelector(`.m-total-inc[data-month="${m}"]`);
        const expCell = document.querySelector(`.m-total-exp[data-month="${m}"]`);
        const netCell = document.querySelector(`.m-net[data-month="${m}"]`);

        if (incCell && expCell && netCell) {
          const incVal = parseFloat(incCell.innerText.replace(/[^\d]/g, '')) || 0;
          const expVal = parseFloat(expCell.innerText.replace(/[^\d]/g, '')) || 0;
          const netVal = incVal - expVal;

          netCell.innerText = formatRupiah(netVal);
          netCell.style.color = netVal < 0 ? '#ef4444' : '#10b981';
        }
      }
    }

    // B. Inject Table Row Layout
    function createRow(name = '', monthsArray = [], isFirst = false) {
      const tr = document.createElement('tr');
      tr.className = 'calendar-dynamic-row';

// 12か月分の入力セルを生成 (1月だけ特別なコピーボタン付きにするため分けてループ)
const janVal = monthsArray[0] !== undefined ? monthsArray[0] : '';
      
      // ★ border:none に変更し、枠線を完全に無くしました
      let monthCellsHtml = `
        <td>
          <div style="display: flex; align-items: center; gap: 4px; min-width: 105px;">
            <input type="number" class="month-input jan-input" placeholder="0" min="0" value="${janVal}" style="width:65px; padding:6px; font-size:0.85rem; border-radius:4px; border:1px solid #cbd5e1;">
            <button type="button" class="btn-copy-all" title="Salin ke semua bulan (全月にコピー)" style="background:#FFFFFF; color:#64748B; border:none; padding:6px; border-radius:50%; cursor:pointer; font-size:0.95rem; display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; transition: all 0.2s ease;">
              <i class="fa-regular fa-copy"></i>
            </button>
          </div>
        </td>
      `;

      // 2月〜12月のセル
      for (let i = 1; i < 12; i++) {
        const val = monthsArray[i] !== undefined ? monthsArray[i] : '';
        monthCellsHtml += `<td><input type="number" class="month-input" placeholder="0" min="0" value="${val}" style="width:65px; padding:6px; font-size:0.85rem; border-radius:4px; border:1px solid #cbd5e1;"></td>`;
      }

      // ★ゴミ箱マークを名前入力欄の右隣（同じマスの中）に引っ越しました
      tr.innerHTML = `
        <td>
          <div style="display: flex; align-items: center; gap: 8px; min-width: 240px;">
            <input type="text" class="item-name" placeholder="${isExpense ? 'Nama item' : 'Nama item'}" value="${name}" style="flex: 1; padding:8px; border-radius:6px; border:1px solid #cbd5e1;">
            ${isFirst ? `
              <div class="spacer-width" style="width: 34px;"></div>
            ` : `
              <button type="button" class="btn-table-action" style="width:34px; min-width:34px;">
                <i class="fa-solid fa-trash"></i>
              </button>
            `}
          </div>
        </td>
        <td class="readonly-total row-avg-display" style="font-weight: bold; color: #475569;">Rp 0</td>
        ${monthCellsHtml}
      `;

      container.appendChild(tr);

      // コピペボタンの動作イベント追加
      tr.querySelector('.btn-copy-all').addEventListener('click', () => {
        const janValue = tr.querySelector('.jan-input').value;
        const allInputs = tr.querySelectorAll('.month-input');
        allInputs.forEach(input => {
          input.value = janValue; // 1月の値をすべての月に上書き
        });
        calculateCalendar(); // 合計値を再計算
      });

      // 通常の入力監視イベント
      tr.querySelector('.item-name').addEventListener('input', calculateCalendar);
      tr.querySelectorAll('.month-input').forEach(input => {
        input.addEventListener('input', calculateCalendar);
      });

      if (!isFirst) {
        tr.querySelector('.btn-table-action').addEventListener('click', () => {
          tr.remove();
          calculateCalendar();
        });
      }
    }

    // C. Cache Initialization Matrix
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0) {
        parsed.forEach((rowData, index) => {
          createRow(rowData.name, rowData.months, index === 0);
        });
      } else {
        createRow('', [], true);
      }
    } else {
      createRow('', [], true);
    }
    calculateCalendar();

    // D. Add Button Event
    btnAdd.addEventListener('click', () => {
      createRow('', [], false);
      calculateCalendar();
    });
  }

  // === 3. Run Calendar Engine for Income and Expense Sections ===
  setupCalendarEngine({
    containerId: 'income-rows-container',
    buttonId: 'btn-add-income-row',
    storageKey: 'step2-2-income-matrix',
    isExpense: false
  });

  setupCalendarEngine({
    containerId: 'expense-rows-container',
    buttonId: 'btn-add-expense-row',
    storageKey: 'step2-2-expense-matrix',
    isExpense: true
  });
});