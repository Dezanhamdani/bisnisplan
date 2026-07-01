document.addEventListener("DOMContentLoaded", () => {

    // ===========================
    // ELEMENT
    // ===========================

    const remittanceInput = document.getElementById("remittance");
    const currentSavingInput = document.getElementById("current-saving");
    const remainingMonthsInput = document.getElementById("remaining-months");

    const summaryIncome = document.getElementById("summary-income");
    const summaryLiving = document.getElementById("summary-living");
    const summaryRemittance = document.getElementById("summary-remittance");
    const summaryDesire = document.getElementById("summary-desire");
    const summaryMonthlyFree = document.getElementById("summary-monthly-free");
    const summaryMonths = document.getElementById("summary-months");
    const summaryCurrentSaving = document.getElementById("summary-current-saving");

    const totalModalBisnisLabel = document.getElementById("total-modal-bisnis");
    const dynamicGroups = document.querySelectorAll(".dynamic-finance-group");

    const totals = {
        income: 0,
        living: 0,
        desire: 0
    };

    // ===========================
    // CHART
    // ===========================

    const ctx = document.getElementById("financeChart").getContext("2d");

    const financeChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Silakan masukkan data"],
            datasets: [{
                data: [1],
                backgroundColor: ["#e2e8f0"]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        boxWidth: 12
                    }
                }
            }
        }
    });

    // ===========================
    // HELPER
    // ===========================

    function formatRupiah(value) {
        return "Rp " + Math.floor(value).toLocaleString("id-ID");
    }

    function parseNumber(value) {
        return Number(String(value).replace(/\./g, "")) || 0;
    }

    function formatInput(value) {
        return value
            .replace(/\D/g, "")
            .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    function attachCurrencyFormatter(input) {
        if (!input) return;

        input.addEventListener("input", function () {
            this.value = formatInput(this.value);
            calculateEverything();
        });
    }

    // ===========================
    // CALCULATE
    // ===========================

    function calculateEverything() {

        // ---------------------------
        // Hitung Total Tiap Kelompok
        // ---------------------------

        dynamicGroups.forEach(group => {
            const groupName = group.dataset.group;
            let total = 0;

            group.querySelectorAll(".item-amount").forEach(input => {
                total += parseNumber(input.value);
            });

            totals[groupName] = total;

            const label = group.querySelector(".total-label-display");
            if (label) {
                label.innerText = formatRupiah(total);
            }
        });

        // ---------------------------
        // Ambil Nilai Input
        // ---------------------------

        const income = totals.income;
        const living = totals.living;
        const desire = totals.desire;

        const remittance = parseNumber(remittanceInput.value);
        const currentSaving = parseNumber(currentSavingInput.value);
        const remainingMonths = parseFloat(remainingMonthsInput.value) || 0;

        // ---------------------------
        // Rumus
        // ---------------------------

        // Biaya Keinginan TIDAK dihitung per bulan
        const monthlyFreeMoney = income - living - remittance;

        const totalBusinessCapital =
            (monthlyFreeMoney * remainingMonths) + currentSaving - desire;

        // ---------------------------
        // Update Ringkasan
        // ---------------------------

        summaryIncome.innerText = formatRupiah(income);
        summaryLiving.innerText = formatRupiah(living);
        summaryRemittance.innerText = formatRupiah(remittance);
        summaryDesire.innerText = formatRupiah(desire);
        summaryMonthlyFree.innerText = formatRupiah(monthlyFreeMoney);
        summaryMonths.innerText = remainingMonths + " Bulan";
        summaryCurrentSaving.innerText = formatRupiah(currentSaving);

        // ---------------------------
        // Warna
        // ---------------------------

        summaryMonthlyFree.style.color = monthlyFreeMoney >= 0 ? "#1e293b" : "#ef4444";

        totalModalBisnisLabel.innerText = formatRupiah(totalBusinessCapital);
        totalModalBisnisLabel.style.color = totalBusinessCapital >= 0 ? "#10b981" : "#ef4444";

        // ---------------------------
        // Update Chart
        // ---------------------------

        if (income === 0 && living === 0 && remittance === 0 && desire === 0) {

            financeChart.data.labels = ["Silakan masukkan angka"];
            financeChart.data.datasets[0].data = [1];
            financeChart.data.datasets[0].backgroundColor = ["#e2e8f0"];

        } else {

            financeChart.data.labels = [
                "Biaya Hidup di Jepang",
                "Kiriman Uang Keluarga",
                "Biaya Keinginan (Sekali)",
                "Sisa Uang Bebas / Bulan"
            ];

            financeChart.data.datasets[0].data = [
                living,
                remittance,
                desire,
                Math.max(monthlyFreeMoney, 0)
            ];

            financeChart.data.datasets[0].backgroundColor = [
                "#ef4444",
                "#8b5cf6",
                "#ec4899",
                "#10b981"
            ];
        }

        financeChart.update();
    }

    // ==========================================
    // Setup Event Listener Dynamic Row
    // ==========================================

    dynamicGroups.forEach(group => {

        const listContainer = group.querySelector(".list-container");
        const addBtn = group.querySelector(".btn-add");

        // Spacer agar baris pertama sejajar
        const firstRow = listContainer.querySelector(".dynamic-row");

        if (firstRow && !firstRow.querySelector(".spacer-width")) {
            const spacer = document.createElement("div");
            spacer.className = "spacer-width";
            firstRow.appendChild(spacer);
        }

        // ------------------------------------
        // Tambah Item
        // ------------------------------------

        addBtn.addEventListener("click", () => {

            const newRow = document.createElement("div");
            newRow.className = "input-group dynamic-row";

            newRow.innerHTML = `
                <div class="row-inputs">
                    <input
                        type="text"
                        class="item-name"
                        placeholder="Nama item">
                    <span class="rp-text">Rp</span>
                    <input
                        type="text"
                        class="item-amount currency-input"
                        placeholder="Contoh: 5.000.000">
                </div>
                <button type="button" class="btn-table-action">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;

            listContainer.appendChild(newRow);

            // Event nama item
            newRow
                .querySelector(".item-name")
                .addEventListener("input", calculateEverything);

            // Format rupiah otomatis
            attachCurrencyFormatter(newRow.querySelector(".item-amount"));

            // Tombol hapus
            newRow
                .querySelector(".btn-table-action")
                .addEventListener("click", () => {
                    newRow.remove();
                    calculateEverything();
                });
        });

        // ------------------------------------
        // Row Pertama
        // ------------------------------------

        const firstAmount = listContainer.querySelector(".item-amount");
        const firstName = listContainer.querySelector(".item-name");

        if (firstName) {
            firstName.addEventListener("input", calculateEverything);
        }

        if (firstAmount) {
            attachCurrencyFormatter(firstAmount);
        }
    });

    // ==========================================
    // Bind Event Input Tetap
    // ==========================================

    // Format otomatis input mata uang
    attachCurrencyFormatter(currentSavingInput);
    attachCurrencyFormatter(remittanceInput);

    // Input jumlah bulan
    remainingMonthsInput.addEventListener("input", calculateEverything);

    // Pasang formatter ke seluruh input currency
    document.querySelectorAll(".currency-input").forEach(input => {
        attachCurrencyFormatter(input);
    });

    // Hitung pertama kali saat halaman dibuka
    calculateEverything();

});