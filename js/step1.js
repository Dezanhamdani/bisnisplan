// js/step1.js

document.addEventListener('DOMContentLoaded', () => {
  // === 1. Get Elements for Fixed Inputs & Labels ===
  const remittanceInput = document.getElementById('remittance');
  const currentSavingInput = document.getElementById('current-saving');
  const remainingMonthsInput = document.getElementById('remaining-months');
  const totalModalBisnisLabel = document.getElementById('total-modal-bisnis');

  // Elements for real-time numeric output inside the summary box
  const summaryIncome = document.getElementById('summary-income');
  const summaryLiving = document.getElementById('summary-living');
  const summaryRemittance = document.getElementById('summary-remittance');
  const summaryDesire = document.getElementById('summary-desire');
  const summaryMonthlyFree = document.getElementById('summary-monthly-free');
  const summaryMonths = document.getElementById('summary-months');
  const summaryCurrentSaving = document.getElementById('summary-current-saving');

  // === 2. Get All Dynamic Groups ===
  const dynamicGroups = document.querySelectorAll('.dynamic-finance-group');
  const totals = { income: 0, living: 0, desire: 0 };

  // === 3. Setup Chart.js Instance (Default: Gray Placeholder) ===
  const ctx = document.getElementById('financeChart').getContext('2d');
  let financeChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Silakan masukkan angka (数字を入力してください)'], // Initial message
      datasets: [{
        data: [1], // Dummy data to render a full circle
        backgroundColor: ['#e2e8f0'], // Clean light gray
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 12, font: { size: 11 } }
        }
      }
    }
  });

  // === 4. Common Function to Format Currency ===
  function formatRupiah(value) {
    return 'Rp ' + Math.floor(value).toLocaleString('id-ID');
  }

  // === 5. Main Function to Calculate ===
  function calculateEverything() {
    dynamicGroups.forEach(group => {
      const groupName = group.getAttribute('data-group');
      let groupTotal = 0;

      const amounts = group.querySelectorAll('.item-amount');
      amounts.forEach(input => {
        groupTotal += parseFloat(input.value) || 0;
      });

      totals[groupName] = groupTotal;
      const displayLabel = group.querySelector('.total-label-display');
      if (displayLabel) displayLabel.innerText = formatRupiah(groupTotal);
    });

    const remittance = parseFloat(remittanceInput.value) || 0;
    const currentSaving = parseFloat(currentSavingInput.value) || 0;
    const remainingMonths = parseFloat(remainingMonthsInput.value) || 0;

    // A. Calculate monthly free money
    const monthlyFreeMoney = totals.income - totals.living - totals.desire - remittance;

    // B. Calculate total business capital based on remaining months
    const totalBusinessCapital = (monthlyFreeMoney * remainingMonths) + currentSaving;

    // === Update text values in the summary box in real-time ===
    if (summaryIncome) summaryIncome.innerText = formatRupiah(totals.income);
    if (summaryLiving) summaryLiving.innerText = formatRupiah(totals.living);
    if (summaryRemittance) summaryRemittance.innerText = formatRupiah(remittance);
    if (summaryDesire) summaryDesire.innerText = formatRupiah(totals.desire);
    if (summaryMonthlyFree) {
      summaryMonthlyFree.innerText = formatRupiah(monthlyFreeMoney);
      summaryMonthlyFree.style.color = monthlyFreeMoney < 0 ? '#ef4444' : '#1e293b';
    }
    if (summaryMonths) summaryMonths.innerText = remainingMonths + ' Bulan';
    if (summaryCurrentSaving) summaryCurrentSaving.innerText = formatRupiah(currentSaving);

    // Update the final total amount display
    if (totalModalBisnisLabel) {
      totalModalBisnisLabel.innerText = formatRupiah(totalBusinessCapital);
      totalModalBisnisLabel.style.color = totalBusinessCapital < 0 ? '#ef4444' : '#10b981';
    }

    // === Update chart data based on user input status ===
    const chartFreeMoney = monthlyFreeMoney > 0 ? monthlyFreeMoney : 0;
    
    if (totals.living === 0 && remittance === 0 && totals.desire === 0 && chartFreeMoney === 0) {
      // Revert to gray placeholder chart if all inputs are zero
      financeChart.data.labels = ['Silakan masukkan angka'];
      financeChart.data.datasets[0].data = [1];
      financeChart.data.datasets[0].backgroundColor = ['#e2e8f0'];
    } else {
      // Switch to colorful dynamic chart when values are entered
      financeChart.data.labels = [
        '3. Biaya Hidup di Jepang', 
        '4. Kiriman Uang Keluarga', 
        '5. Biaya Keinginan', 
        'Sisa Uang Bebas / Bulan'
      ];
      financeChart.data.datasets[0].data = [totals.living, remittance, totals.desire, chartFreeMoney];
      financeChart.data.datasets[0].backgroundColor = ['#ef4444', '#8b5cf6', '#ec4899', '#10b981'];
    }
    
    financeChart.update(); // Redraw the chart with updated data
  }

  // === 6. Setup Event Listeners for Dynamic Rows ===
  dynamicGroups.forEach(group => {
    const listContainer = group.querySelector('.list-container');
    const addBtn = group.querySelector('.btn-add');

    // ★修正ポイント：HTML側の新しい階層に対応し、1行目の右側に完全固定の透明余白スペースを挿入
    if (listContainer) {
      const firstRow = listContainer.querySelector('.dynamic-row');
      if (firstRow && !firstRow.querySelector('.spacer-width') && !firstRow.querySelector('.btn-table-action')) {
        const spacer = document.createElement('div');
        spacer.className = 'spacer-width';
        firstRow.appendChild(spacer); // ゴミ箱と同値の38pxスペースを結合
      }
    }

    if (addBtn && listContainer) {
      addBtn.addEventListener('click', () => {
        const newRow = document.createElement('div');
        newRow.className = 'input-group dynamic-row';
        
        newRow.innerHTML = `
          <div class="row-inputs">
            <input type="text" class="item-name" placeholder="Nama item">
            <span class="rp-text">Rp</span>
            <input type="number" class="item-amount" placeholder="0" min="0">
          </div>
          <button type="button" class="btn-table-action">
            <i class="fa-solid fa-trash"></i>
          </button>
        `;

        listContainer.appendChild(newRow);
        
        newRow.querySelector('.item-name').addEventListener('input', calculateEverything);
        newRow.querySelector('.item-amount').addEventListener('input', calculateEverything);
        
        newRow.querySelector('.btn-table-action').addEventListener('click', () => {
          newRow.remove();
          calculateEverything();
        });
      });
    }

    const firstItemName = listContainer ? listContainer.querySelector('.item-name') : null;
    const firstItemAmount = listContainer ? listContainer.querySelector('.item-amount') : null;
    
    if (firstItemName) firstItemName.addEventListener('input', calculateEverything);
    if (firstItemAmount) firstItemAmount.addEventListener('input', calculateEverything);
  });

  // === 7. Bind Events to Fixed Inputs ===
  [remittanceInput, currentSavingInput, remainingMonthsInput].forEach(input => {
    if (input) input.addEventListener('input', calculateEverything);
  });

  // Run initial calculation on page load
  calculateEverything();
});
