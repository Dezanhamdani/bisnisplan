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
      if (resInput) resInput.value = reserve > 0 ? "Rp " + reserve.toLocaleString('id-ID') : "Rp 0";
    });

    newAssetContainer.querySelectorAll('.new-row').forEach(row => {
      const price = parseFloat(row.querySelector('.new-price')?.value) || 0;
      const shopMonth = parseInt(row.querySelector('.new-month')?.value) || 1;
      let reserve = (price > 0 && shopMonth > 0) ? Math.round(price / shopMonth) : 0;
      const resInput = row.querySelector('.new-reserve-needed');
      if (resInput) resInput.value = reserve > 0 ? "Rp " + reserve.toLocaleString('id-ID') : "Rp 0";
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
      container.querySelectorAll(targetClassName).forEach(inp => {
        inp.value = val;
      });
      calculateTotals();
    });
  }

  // --- 3. 行追加関数：既存アセット（Aset Lama）---
  function createExistingRowHtml(name = "", price = "", span = "") {
    // 現在の行数を確認。0行（＝これから最初の1行目を作る）ならゴミ箱を隠すクラスをつける
    const isFirstRow = (existingContainer.children.length === 0);
    const tr = document.createElement('tr');
    tr.className = 'existing-row';
    
    tr.innerHTML = `
      <td>
        <input type="text" class="ex-name" placeholder="Nama Item Aset (Lama)" value="${name}" style="width:100%; padding:6px 8px; font-size:0.85rem; height:32px; border-radius:6px; border:1px solid #CBD5E1; background:#fff; box-sizing:border-box;">
      </td>
      <td style="position: relative;">
        <span style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94A3B8; font-size: 0.75rem;">Rp</span>
        <input type="number" class="ex-price" placeholder="Harga" value="${price}" style="width: 100%; padding: 6px 20px 6px 24px; font-size: 0.85rem; height:32px; border-radius: 6px; border: 1px solid #CBD5E1; background:#fff; box-sizing:border-box;">
        <i class="fa-solid fa-copy btn-copy-fast" style="position:absolute; right:14px; top:50%; transform:translateY(-50%); color:#94A3B8; cursor:pointer; font-size:0.7rem;" title="Copy ke semua"></i>
      </td>
      <td>
        <input type="number" class="ex-span" placeholder="Sisa" value="${span}" style="width: 100%; padding: 6px 4px; font-size: 0.85rem; height:32px; border-radius: 6px; border: 1px solid #CBD5E1; background:#fff; text-align: center; box-sizing:border-box;">
      </td>
      <td>
        <input type="text" class="ex-reserve-needed" placeholder="Rp 0" readonly style="width: 100%; padding: 6px 4px; font-size: 0.8rem; height:32px; border-radius: 6px; border: 1px solid #CBD5E1; background:#E2E8F0; color:#475569; text-align: center; font-weight: bold; box-sizing:border-box;">
      </td>
      <td style="text-align: center;">
        <button type="button" class="btn-table-action btn-delete-row" style="background:none; border:none; color:#EF4444; cursor:pointer; padding:0; width:24px; height:24px; display:${isFirstRow ? 'none' : 'inline-flex'}; align-items:center; justify-content:center;">
          <i class="fa-solid fa-trash-can" style="font-size:0.85rem;"></i>
        </button>
      </td>
    `;
    existingContainer.appendChild(tr);
    attachAssetCopyFeature(tr, '.ex-price');
    
    tr.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', calculateTotals);
    });
  }

  // --- 4. 行追加関数：新規アセット（Aset Baru）---
  function createNewRowHtml(name = "", price = "", shopMonth = "1", span = "") {
    // 現在の行数を確認。0行（＝これから最初の1行目を作る）ならゴミ箱を隠す
    const isFirstRow = (newAssetContainer.children.length === 0);
    const tr = document.createElement('tr');
    tr.className = 'new-row';

    tr.innerHTML = `
      <td>
        <input type="text" class="new-name" placeholder="Nama Komponen Aset Baru" value="${name}" style="width:100%; padding:6px 8px; font-size:0.85rem; height:32px; border-radius:6px; border:1px solid #CBD5E1; background:#fff; box-sizing:border-box;">
      </td>
      <td style="position: relative;">
        <span style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94A3B8; font-size: 0.75rem;">Rp</span>
        <input type="number" class="new-price" placeholder="Harga" value="${price}" style="width: 100%; padding: 6px 20px 6px 24px; font-size: 0.85rem; height:32px; border-radius: 6px; border: 1px solid #CBD5E1; background:#fff; box-sizing:border-box;">
        <i class="fa-solid fa-copy btn-copy-fast" style="position:absolute; right:14px; top:50%; transform:translateY(-50%); color:#94A3B8; cursor:pointer; font-size:0.7rem;" title="Copy ke semua"></i>
      </td>
      <td>
        <input type="number" class="new-month" placeholder="Beli" min="1" value="${shopMonth}" style="width: 100%; padding: 6px 2px; font-size: 0.85rem; height:32px; border-radius: 6px; border: 1px solid #CBD5E1; background:#fff; text-align: center; box-sizing:border-box;">
      </td>
      <td>
        <input type="number" class="inv-span" placeholder="Pakai" value="${span}" style="width: 100%; padding: 6px 2px; font-size: 0.85rem; height:32px; border-radius: 6px; border: 1px solid #CBD5E1; background:#fff; text-align: center; box-sizing:border-box;">
      </td>
      <td>
        <input type="text" class="new-reserve-needed" placeholder="Rp 0" readonly style="width: 100%; padding: 6px 4px; font-size: 0.8rem; height:32px; border-radius: 6px; border: 1px solid #CBD5E1; background:#E2E8F0; color:#475569; text-align: center; font-weight: bold; box-sizing:border-box;">
      </td>
      <td style="text-align: center;">
        <button type="button" class="btn-table-action btn-delete-row" style="background:none; border:none; color:#EF4444; cursor:pointer; padding:0; width:24px; height:24px; display:${isFirstRow ? 'none' : 'inline-flex'}; align-items:center; justify-content:center;">
          <i class="fa-solid fa-trash-can" style="font-size:0.85rem;"></i>
        </button>
      </td>
    `;
    newAssetContainer.appendChild(tr);
    attachAssetCopyFeature(tr, '.new-price');

    tr.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', calculateTotals);
    });
  }

  // --- 5. 初期ロード時のデータ復元展開 ---
  if (nameInput) nameInput.value = localStorage.getItem('sim-user-name') || "";
  if (startDateInput) startDateInput.value = localStorage.getItem('sim-start-date') || "2026-04";
  if (fundSourceInput) fundSourceInput.value = localStorage.getItem('fund-source-amount') || "";
  if (salaryInput) salaryInput.value = localStorage.getItem('sim-expected-salary') || "";

  const savedItems = JSON.parse(localStorage.getItem('invest-items') || "[]");
  if (savedItems.length > 0) {
    // 復元時、最初の要素（インデックス0番目）かそうでないかを判定して追加していく
    savedItems.forEach((item, index) => {
      if (item.isExisting) {
        createExistingRowHtml(item.name, item.price || "", item.span || "");
      } else {
        createNewRowHtml(item.name, item.price || "", item.shopMonth || "1", item.span || "");
      }
    });
  } else {
    // データがない場合の完全新規状態なら、1行ずつデフォルト作成（この最初の1行目は自動でゴミ箱が隠れます）
    createExistingRowHtml();
    createNewRowHtml();
  }

  // --- 6. イベント監視 ---
  [nameInput, startDateInput, fundSourceInput, salaryInput].forEach(inp => {
    if (inp) inp.addEventListener('input', saveAllToStorage);
  });

  existingContainer.addEventListener('input', calculateTotals);
  newAssetContainer.addEventListener('input', calculateTotals);

  // ボタンクリック時は常に「2行目以降」になるのでゴミ箱は自動的に表示されます
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
