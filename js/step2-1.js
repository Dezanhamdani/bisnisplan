// js/step2-1.js

document.addEventListener('DOMContentLoaded', () => {
  // === 1. Static Text Fields Configuration ===
  const textFields = [
    'name', 'biz-name', 'biz-commodity', 'biz-address', 'biz-map-link',
    'biz-summary', 'biz-background', 'biz-visi', 'biz-misi',
    'biz-marketing', 'biz-info-source', 'biz-barriers', 'biz-risks', 
    'biz-success-key'
  ];

  // Load and save static fields
  textFields.forEach(fieldId => {
    const element = document.getElementById(fieldId);
    if (element) {
      const saved = localStorage.getItem(`step2-1-${fieldId}`);
      if (saved) element.value = saved;
      element.addEventListener('input', () => {
        localStorage.setItem(`step2-1-${fieldId}`, element.value);
      });
    }
  });

  // === Helper Function: Format to Indonesian Rupiah ===
  function formatRupiah(value) {
    return 'Rp ' + Math.floor(value).toLocaleString('id-ID');
  }

  // === 2. Shared Factory Function for Dynamic Sections (Step 9 & 10) ===
  function setupDynamicSection({ containerId, buttonId, totalDisplayId, storageKey, placeholderText }) {
    const container = document.getElementById(containerId);
    const btnAdd = document.getElementById(buttonId);
    const totalDisplay = document.getElementById(totalDisplayId);

    if (!container || !btnAdd || !totalDisplay) return;

    // A. Calculate Grand Total and Save Data Layer
    function calculateSectionTotal() {
      let total = 0;
      const rows = container.querySelectorAll('.dynamic-row');
      const saveData = [];

      rows.forEach(row => {
        const name = row.querySelector('.item-name').value;
        const amount = parseFloat(row.querySelector('.item-amount').value) || 0;
        total += amount;
        saveData.push({ name, amount });
      });

      totalDisplay.innerText = formatRupiah(total);
      localStorage.setItem(storageKey, JSON.stringify(saveData));
    }

    // B. Inject New Input Row Layout
    function createNewRow(name = '', amount = '', isFirst = false) {
      const newRow = document.createElement('div');
      newRow.className = 'input-group dynamic-row';
      
      // ★ステップ1と完全に同じ無料シンプルアイコン(fa-trash)を使い、幅も38pxでスペースを固定
      newRow.innerHTML = `
        <div class="row-inputs">
          <input type="text" class="item-name" placeholder="${placeholderText}" value="${name}">
          <span class="rp-text">Rp</span>
          <input type="number" class="item-amount" placeholder="0" min="0" value="${amount}">
        </div>
        ${isFirst ? `
          <div class="spacer-width" style="width: 38px;"></div>
        ` : `
          <button type="button" class="btn-table-action">
            <i class="fa-solid fa-trash"></i>
          </button>
        `}
      `;
      container.appendChild(newRow);

      newRow.querySelector('.item-name').addEventListener('input', calculateSectionTotal);
      newRow.querySelector('.item-amount').addEventListener('input', calculateSectionTotal);
      
      if (!isFirst) {
        newRow.querySelector('.btn-table-action').addEventListener('click', () => {
          newRow.remove();
          calculateSectionTotal();
        });
      }
    }

    // C. Data Init
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      const parsedList = JSON.parse(savedData);
      if (parsedList.length > 0) {
        parsedList.forEach((item, index) => {
          createNewRow(item.name, item.amount, index === 0);
        });
      } else {
        createNewRow('', '', true);
      }
    } else {
      createNewRow('', '', true);
    }
    calculateSectionTotal();

    // D. Bind Click Event to Add Action Button
    btnAdd.addEventListener('click', () => {
      createNewRow('', '', false);
      calculateSectionTotal();
    });
  }

  // === 3. Initialize Dynamic Engine for Step 9 & Step 10 ===
  setupDynamicSection({
    containerId: 'assets-container',
    buttonId: 'btn-add-asset',
    totalDisplayId: 'total-assets-display',
    storageKey: 'step2-1-assets',
    placeholderText: 'Nama item'
  });

  setupDynamicSection({
    containerId: 'sumber-dana-container',
    buttonId: 'btn-add-sumber-dana',
    totalDisplayId: 'total-sumber-dana-display',
    storageKey: 'step2-1-sumber-dana',
    placeholderText: 'Nama item'
  });
});