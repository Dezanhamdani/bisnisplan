window.onload = function() {
 lucide.createIcons();
// Export PDF 
document.getElementById("pdf-export").addEventListener("click", function () {

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const passion = document.getElementById("passion").value;
  const skill = document.getElementById("skill").value;
  const problem = document.getElementById("problem").value;
  const namaBisnis = document.getElementById("nama-bisnis").value;
  const ringkasan = document.getElementById("ringkasan-bisnis").value;

  doc.text("Passion: " + passion, 10, 10);
  doc.text("Skill: " + skill, 10, 20);
  doc.text("Problem: " + problem, 10, 30);
  doc.text("Nama Bisnis: " + namaBisnis, 10, 40);
  doc.text("Ringkasan: " + ringkasan, 10, 50);

  doc.save("tahap.pdf");

});

// Export CSV
  document.getElementById("csv-export").addEventListener("click", function () {

  const passion = document.getElementById("passion").value;
  const skill = document.getElementById("skill").value;
  const problem = document.getElementById("problem").value;
  const namaBisnis = document.getElementById("nama-bisnis").value;
  const ringkasanBisnis = document.getElementById("ringkasan-bisnis").value;

  const csv =
`passion,skill,problem,namaBisnis,ringkasanBisnis
${passion},${skill},${problem},${namaBisnis},${ringkasanBisnis}`;

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "tahap.csv";
  a.click();

  URL.revokeObjectURL(url);

});

// Import CSV
  const button = document.getElementById("csv-import");

  button.onclick = function() {
    document.getElementById("csv-file").click();
  };

  const fileInput = document.getElementById("csv-file");

  fileInput.onchange = function() {

    const file = fileInput.files[0];

    const reader = new FileReader();

    reader.onload = function() {

      const text = reader.result;

      const lines = text.split("\n");

      const data = lines[1].split(",");

    document.getElementById("passion").value = data[0];
    document.getElementById("skill").value = data[1];
    document.getElementById("problem").value = data[2];
    document.getElementById("nama-bisnis").value = data[3];
    document.getElementById("ringkasan-bisnis").value = data[4];
    };

    reader.readAsText(file);

  };

};