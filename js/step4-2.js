// js/step4-2.js

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

    // A. 既存アセットの回収
    existingContainer.querySelectorAll('.existing-row').forEach(row => {
      const name = row.querySelector('.ex-name')?.value || "";
      const price = parseFloat(row.querySelector('.ex-price')?.value) || 0;
      const span = parseInt(row.querySelector('.ex-span')?.value) || 0;
      if (name || price > 0) {
        allAssetItems.push({ name, price, shopMonth: 1, span, isExisting: true });
      }
    });

    // B. 新規アセットの回収
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

  // --- コピー機能（一括反映） ---
  function attachAssetCopyFeature(row, targetClassName) {
    const copyBtn = row.querySelector('.btn-copy-fast');
    if (!copyBtn) return;
    copyBtn.addEventListener('click', () => {
      const baseInput = row.querySelector(targetClassName);
      if (!baseInput) return;
      const val = baseInput.value;
      const container = row.closest('#existing-asset-container, #new-asset-container');
      if (!container) return;
      container.querySelectorAll(targetClassName).forEach(inp => inp.value = val);
      calculateTotals();
    });
  }

  // --- 3. 行追加関数：既存アセット（Aset Lama）---
  // 💡 各入力フォームの上に項目名（ラベル）が表示される前の美しいデザインに最適化しました
  function createExistingRowHtml(name = "", price = "", span = "") {
    const div = document.createElement('div');
    div.className = 'existing-row';
    div.style.cssText = "display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; width: 100%; background: #F8FAFC; padding: 12px; margin-bottom: 12px; border-radius: 10px; border: 1px solid #CBD5E1; box-sizing: border-box;";
    
    div.innerHTML = `
      <div style="flex: 2; min-width: 150px; display: flex; flex-direction: column; gap: 4px;">
        <span style="font-size: 0.75rem; color: #64748B; font-weight: bold;"><i class="fa-solid fa-tag"></i> Nama Item Aset</span>
        <input type="text" class="ex-name" placeholder="Nama Item Aset (Lama)" value="${name}" style="width:100%; padding:6px 8px; font-size:0.85rem; height:32px; border-radius:6px; border:1px solid #CBD5E1; background:#fff; box-sizing:border-box;">
      </div>
      <div style="flex: 1; min-width: 120px; position: relative; display: flex; flex-direction: column; gap: 4px;">
        <span style="font-size: 0.75rem; color: #64748B; font-weight: bold;"><i class="fa-solid fa-money-bill-wave"></i> Harga</span>
        <div style="position: relative; width: 100%;">
          <span style="position: absolute; left: 6px; top: 50%; transform: translateY(-50%); color: #94A3B8; font-size: 0.75rem;">Rp</span>
          <input type="number" class="ex-price" placeholder="Harga" value="${price}" style="width: 100%; padding: 6px 20px 6px 24px; font-size: 0.85rem; height:32px; border-radius: 6px; border: 1px solid #CBD5E1; background:#fff; box-sizing:border-box;">
          <i class="fa-solid fa-copy btn-copy-fast" style="position:absolute; right:6px; top:50%; transform:translateY(-50%); color:#94A3B8; cursor:pointer; font-size:0.7rem;" title="Copy ke semua"></i>
        </div>
      </div>
      <div style="width: 85px; flex-shrink: 0; display: flex; flex-direction: column; gap: 4px;">
        <span style="font-size: 0.75rem; color: #64748B; font-weight: bold; text-align: center;"><i class="fa-solid fa-hourglass-half"></i> Sisa Bln</span>
        <input type="number" class="ex-span" placeholder="Sisa Bln" value="${span}" style="width: 100%; padding: 6px 4px; font-size: 0.85rem; height:32px; border-radius: 6px; border: 1px solid #CBD5E1; background:#fff; text-align: center; box-sizing:border-box;" title="Sisa Masa Pakai (Bulan)">
      </div>
      <div style="width: 110px; flex-shrink: 0; display: flex; flex-direction: column; gap: 4px;">
        <span style="font-size: 0.75rem; color: #64748B; font-weight: bold; text-align: center;"><i class="fa-solid fa-calculator"></i> Simpanan</span>
        <input type="text" class="ex-reserve-needed" placeholder="Rp 0" readonly style="width: 100%; padding: 6px 4px; font-size: 0.8rem; height:32px; border-radius: 6px; border: 1px solid #CBD5E1; background:#E2E8F0; color:#475569; text-align: center; font-weight: bold; box-sizing:border-box;" title="Simpanan per Bulan">
      </div>
      <div style="width: 24px; flex-shrink: 0; text-align: center; margin-bottom: 4px;">
        <button type="button" class="btn-table-action btn-delete-row" style="background:none; border:none; color:#EF4444; cursor:pointer; padding:0; width:24px; height:24px; display:inline-flex; align-items:center; justify-content:center;">
          <i class="fa-solid fa-trash-can" style="font-size:0.85rem;"></i>
        </button>
      </div>
    `;
    existingContainer.appendChild(div);
    attachAssetCopyFeature(div, '.ex-price');
  }

  // --- 4. 行追加関数：新規アセット（Aset Baru）---
  // 💡 各入力フォームの上に項目名（ラベル）が表示される前の美しいデザインに最適化しました
  function createNewRowHtml(name = "", price = "", shopMonth = "1", span = "") {
    const div = document.createElement('div');
    div.className = 'new-row';
    div.style.cssText = "display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; width: 100%; background: #F8FAFC; padding: 12px; margin-bottom: 12px; border-radius: 10px; border: 1px solid #CBD5E1; box-sizing: border-box;";

    div.innerHTML = `
      <div style="flex: 2; min-width: 150px; display: flex; flex-direction: column; gap: 4px;">
        <span style="font-size: 0.75rem; color: #64748B; font-weight: bold;"><i class="fa-solid fa-cart-plus"></i> Komponen Aset Baru</span>
        <input type="text" class="new-name" placeholder="Nama Komponen Aset Baru" value="${name}" style="width:100%; padding:6px 8px; font-size:0.85rem; height:32px; border-radius:6px; border:1px solid #CBD5E1; background:#fff; box-sizing:border-box;">
      </div>
      <div style="flex: 1; min-width: 120px; position: relative; display: flex; flex-direction: column; gap: 4px;">
        <span style="font-size: 0.75rem; color: #64748B; font-weight: bold;"><i class="fa-solid fa-money-bill-wave"></i> Harga</span>
        <div style="position: relative; width: 100%;">
          <span style="position: absolute; left: 6px; top: 50%; transform: translateY(-50%); color: #94A3B8; font-size: 0.75rem;">Rp</span>
          <input type="number" class="new-price" placeholder="Harga" value="${price}" style="width: 100%; padding: 6px 20px 6px 24px; font-size: 0.85rem; height:32px; border-radius: 6px; border: 1px solid #CBD5E1; background:#fff; box-sizing:border-box;">
          <i class="fa-solid fa-copy btn-copy-fast" style="position:absolute; right:6px; top:50%; transform:translateY(-50%); color:#94A3B8; cursor:pointer; font-size:0.7rem;" title="Copy ke semua"></i>
        </div>
      </div>
      <div style="width: 65px; flex-shrink: 0; display: flex; flex-direction: column; gap: 4px;">
        <span style="font-size: 0.75rem; color: #64748B; font-weight: bold; text-align: center;"><i class="fa-solid fa-calendar-check"></i> Beli Bln</span>
        <input type="number" class="new-month" placeholder="Beli" min="1" value="${shopMonth}" style="width: 100%; padding: 6px 2px; font-size: 0.85rem; height:32px; border-radius: 6px; border: 1px solid #CBD5E1; background:#fff; text-align: center; box-sizing:border-box;" title="Bulan Belanja Ke-berapa">
      </div>
      <div style="width: 65px; flex-shrink: 0; display: flex; flex-direction: column; gap: 4px;">
        <span style="font-size: 0.75rem; color: #64748B; font-weight: bold; text-align: center;"><i class="fa-solid fa-clock"></i> Masa Pakai</span>
        <input type="number" class="inv-span" placeholder="Pakai" value="${span}" style="width: 100%; padding: 6px 2px; font-size: 0.85rem; height:32px; border-radius: 6px; border: 1px solid #CBD5E1; background:#fff; text-align: center; box-sizing:border-box;" title="Masa Pakai Baru (Bulan)">
      </div>
      <div style="width: 110px; flex-shrink: 0; display: flex; flex-direction: column; gap: 4px;">
        <span style="font-size: 0.75rem; color: #64748B; font-weight: bold; text-align: center;"><i class="fa-solid fa-calculator"></i> Simpanan</span>
        <input type="text" class="new-reserve-needed" placeholder="Rp 0" readonly style="width: 100%; padding: 6px 4px; font-size: 0.8rem; height:32px; border-radius: 6px; border: 1px solid #CBD5E1; background:#E2E8F0; color:#475569; text-align: center; font-weight: bold; box-sizing:border-box;" title="Simpanan per Bulan">
      </div>
      <div style="width: 24px; flex-shrink: 0; text-align: center; margin-bottom: 4px;">
        <button type="button" class="btn-table-action btn-delete-row" style="background:none; border:none; color:#EF4444; cursor:pointer; padding:0; width:24px; height:24px; display:inline-flex; align-items:center; justify-content:center;">
          <i class="fa-solid fa-trash-can" style="font-size:0.85rem;"></i>
        </button>
      </div>
    `;
    newAssetContainer.appendChild(div);
    attachAssetCopyFeature(div, '.new-price');
  }

  // --- 5. 初期ロード時のデータ復元展開 ---
  if (nameInput) nameInput.value = localStorage.getItem('sim-user-name') || "";
  if (startDateInput) startDateInput.value = localStorage.getItem('sim-start-date') || "2026-04";
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

  // --- 6. イベント監視 ---
  [nameInput, startDateInput, fundSourceInput, salaryInput].forEach(inp => {
    if (inp) inp.addEventListener('input', saveAllToStorage);
  });
  existingContainer.addEventListener('input', calculateTotals);
  newAssetContainer.addEventListener('input', calculateTotals);

  if (btnAddExisting) btnAddExisting.addEventListener('click', () => { createExistingRowHtml(); calculateTotals(); });
  if (btnAddNewAsset) btnAddNewAsset.addEventListener('click', () => { createNewRowHtml(); calculateTotals(); });

  // 削除イベントの委譲
  document.body.addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('.btn-delete-row');
    if (deleteBtn) {
      const row = deleteBtn.closest('.existing-row, .new-row');
      if (row) {
        row.remove();
        calculateTotals();
      }
    }
  });

  calculateTotals();
});
