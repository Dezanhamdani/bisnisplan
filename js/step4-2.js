// Tahap 4-2 : Fixed Assets Calculation & Storage Auto-Sync (Dasar Category Synced)
document.addEventListener("DOMContentLoaded", function() {
  const existingContainer = document.getElementById('existing-asset-container');
  const btnAddExisting = document.getElementById('btn-add-existing');
  const newAssetContainer = document.getElementById('new-asset-container');
  const btnAddNewAsset = document.getElementById('btn-add-new-asset');

  const startDateInput = document.getElementById('sim-start-date');
  const fundSourceInput = document.getElementById('fund-source-amount');
  const salaryInput = document.getElementById('expected-salary-amount');
  const nameInput = document.getElementById('name');

  if (!existingContainer || !newAssetContainer) return;

  // --- 1. LocalStorage への一括保存処理 ---
  function saveAllToStorage() {
    if (nameInput) localStorage.setItem('sim-user-name', nameInput.value);
    if (startDateInput) localStorage.setItem('sim-start-date', startDateInput.value);
    if (fundSourceInput) localStorage.setItem('fund-source-amount', fundSourceInput.value || "0");
    if (salaryInput) localStorage.setItem('sim-expected-salary', salaryInput.value || "0");

    const allAssetItems = [];

    // A. 2-1 既存アセット
    existingContainer.querySelectorAll('.existing-row').forEach(row => {
      const name = row.querySelector('.ex-name')?.value || "";
      const price = parseFloat(row.querySelector('.ex-price')?.value) || 0;
      const span = parseInt(row.querySelector('.ex-span')?.value) || 0;
      if (name || price > 0) {
        allAssetItems.push({ name, price, shopMonth: 1, span, isExisting: true });
      }
    });

    // B. 2-2 新規アセット
    newAssetContainer.querySelectorAll('.new-row').forEach(row => {
      const name = row.querySelector('.new-name')?.value || "";
      const price = parseFloat(row.querySelector('.new-price')?.value) || 0;
      const shopMonth = parseInt(row.querySelector('.new-month')?.value) || 1;
      const span = parseInt(row.querySelector('.inv-span')?.value) || 0;
      if (name || price > 0) {
        allAssetItems.push({ name, price, shopMonth, span, isExisting: false });
      }
    });

    localStorage.setItem('invest-items', JSON.stringify(allAssetItems));
  }

  // --- 2. 各行の単体積立金計算 ---
  function calculateTotals() {
    existingContainer.querySelectorAll('.existing-row').forEach(row => {
      const price = parseFloat(row.querySelector('.ex-price')?.value) || 0;
      const span = parseInt(row.querySelector('.ex-span')?.value) || 0;
      let reserve = (price > 0 && span > 0) ? Math.round(price / span) : 0;
      const resInput = row.querySelector('.ex-reserve-needed');
      if (resInput) resInput.value = "Rp " + reserve.toLocaleString('id-ID');
    });

    newAssetContainer.querySelectorAll('.new-row').forEach(row => {
      const price = parseFloat(row.querySelector('.new-price')?.value) || 0;
      const shopMonth = parseInt(row.querySelector('.new-month')?.value) || 1;
      let reserve = (price > 0 && shopMonth > 0) ? Math.round(price / shopMonth) : 0;
      const resInput = row.querySelector('.new-reserve-needed');
      if (resInput) resInput.value = "Rp " + reserve.toLocaleString('id-ID');
    });

    saveAllToStorage();
  }

  // --- 【共通化】アセット行コピー機能 ---
  function attachAssetCopyFeature(row, targetClassName) {
    const copyBtn = row.querySelector('.btn-copy-fast');
    if (!copyBtn) return;
    copyBtn.addEventListener('click', () => {
      const baseInput = row.querySelector(targetClassName);
      if (!baseInput) return;
      const val = baseInput.value;
      const container = row.closest('tbody');
      if (!container) return;
      container.querySelectorAll(targetClassName).forEach(inp => inp.value = val);
      calculateTotals();
    });
  }

  // --- 3. 行追加ヘルパー関数 ---
  function createExistingRowHtml(name = "", price = "", span = "") {
    const tr = document.createElement('tr');
    tr.className = 'existing-row';
    tr.innerHTML = `
      <td><input type="text" class="ex-name" placeholder="Nama Item Aset (Lama)" value="${name}"></td>
      <td style="position: relative;">
        <input type="number" class="ex-price" placeholder="0" value="${price}" style="padding-right: 22px; width: 100%; box-sizing: border-box;">
        <i class="fa-solid fa-copy btn-copy-fast" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); color:#94A3B8; cursor:pointer; font-size:0.75rem;" title="Copy ke semua aset"></i>
      </td>
      <td><input type="number" class="ex-span" placeholder="0" value="${span}"></td>
      <td><input type="text" class="ex-reserve-needed" placeholder="Rp 0" readonly></td>
      <td class="spacer-width">
        <button type="button" class="btn-table-action btn-delete-row"><i class="fa-solid fa-trash-can"></i></button>
      </td>
    `;
    existingContainer.appendChild(tr);
    attachAssetCopyFeature(tr, '.ex-price');
  }

  function createNewRowHtml(name = "", price = "", shopMonth = "1", span = "") {
    const tr = document.createElement('tr');
    tr.className = 'new-row';
    tr.innerHTML = `
      <td><input type="text" class="new-name" placeholder="Nama Komponen Aset Baru" value="${name}"></td>
      <td style="position: relative;">
        <input type="number" class="new-price" placeholder="0" value="${price}" style="padding-right: 22px; width: 100%; box-sizing: border-box;">
        <i class="fa-solid fa-copy btn-copy-fast" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); color:#94A3B8; cursor:pointer; font-size:0.75rem;" title="Copy ke semua aset"></i>
      </td>
      <td><input type="number" class="new-month" placeholder="1" min="1" value="${shopMonth}"></td>
      <td><input type="number" class="inv-span" placeholder="0" value="${span}"></td>
      <td><input type="text" class="new-reserve-needed" placeholder="Rp 0" readonly></td>
      <td class="spacer-width">
        <button type="button" class="btn-table-action btn-delete-row"><i class="fa-solid fa-trash-can"></i></button>
      </td>
    `;
    newAssetContainer.appendChild(tr);
    attachAssetCopyFeature(tr, '.new-price');
  }

  // --- 4. 初期ロード時のデータ復元展開 ---
  if (nameInput) nameInput.value = localStorage.getItem('sim-user-name') || "";
  if (startDateInput) startDateInput.value = localStorage.getItem('sim-start-date') || "2026-04-01";
  if (fundSourceInput) fundSourceInput.value = localStorage.getItem('fund-source-amount') || "";
  if (salaryInput) salaryInput.value = localStorage.getItem('sim-expected-salary') || "";

  const savedItems = JSON.parse(localStorage.getItem('invest-items') || "[]");
  if (savedItems.length > 0) {
    savedItems.forEach(item => {
      if (item.isExisting) createExistingRowHtml(item.name, item.price || "", item.span || "");
      else createNewRowHtml(item.name, item.price || "", item.shopMonth || "1", item.span || "");
    });
  } else {
    createExistingRowHtml();
    createNewRowHtml();
  }

  // --- 5. 監視設定 ---
  [nameInput, startDateInput, fundSourceInput, salaryInput].forEach(inp => {
    if (inp) inp.addEventListener('input', saveAllToStorage);
  });
  existingContainer.addEventListener('input', calculateTotals);
  newAssetContainer.addEventListener('input', calculateTotals);

  if (btnAddExisting) btnAddExisting.addEventListener('click', () => { createExistingRowHtml(); calculateTotals(); });
  if (btnAddNewAsset) btnAddNewAsset.addEventListener('click', () => { createNewRowHtml(); calculateTotals(); });

  document.body.addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('.btn-delete-row');
    if (deleteBtn) { const row = deleteBtn.closest('tr'); if (row) { row.remove(); calculateTotals(); } }
  });

  calculateTotals();
});