// ==========================================
// 📅 Common: Script to export calendar table to Excel (.xlsx)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const excelBtn = document.getElementById("btn-export-calendar-excel");
  
  if (excelBtn) {
    excelBtn.addEventListener("click", () => {
      // 1. Get the calendar table element by ID
      const table = document.getElementById("calendar-table");
      if (!table) {
        alert("Gagal menemukan data kalender. (Error: Calendar table data not found.)");
        return;
      }

      // 2. Pre-process to reflect user input values into the Excel cells
      // (Required because standard HTML table export ignores dynamic input/textarea values)
      const inputs = table.querySelectorAll("input, textarea");
      inputs.forEach(input => {
        input.setAttribute("value", input.value);
      });

      // 3. Convert HTML table structure into an Excel worksheet using SheetJS
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.table_to_sheet(table);
      
      // Append worksheet to workbook with the sheet name "Kalender"
      XLSX.utils.book_append_sheet(workbook, worksheet, "Kalender");

      // 4. Generate filename based on the page title
      // e.g., "Tahap_2-2_Kalender_Bisnis_Keluarga.xlsx"
      const pageTitle = document.title.replace(/\s+/g, '_').replace(/:/g, '');
      const filename = `${pageTitle || "Kalender_Bisnis"}.xlsx`;

      // 5. Execute file download as Excel (.xlsx)
      XLSX.writeFile(workbook, filename);
    });
  }
});