document.addEventListener("DOMContentLoaded", () => {
  const reportList = document.getElementById("reportList");
  const reportTypeSelect = document.getElementById("reportType");
  const loadReportButton = document.getElementById("loadReportBtn");
  const downloadPdfButton = document.getElementById("downloadPdfBtn");
  const monthSelector = document.getElementById("monthSelector");
  const statusFilter = document.getElementById("statusFilter"); // Status-Dropdown

  // Monate für die Auswahl generieren
  generateMonthOptions();

  // Bericht laden
  loadReportButton.addEventListener("click", async () => {
    const reportType = reportTypeSelect.value;
    const selectedMonth = monthSelector.value;
    const selectedStatus = statusFilter ? statusFilter.value : ""; // Status auslesen

    if (!selectedMonth) {
      alert("Bitte wählen Sie einen Monat aus.");
      return;
    }

    await loadReports(reportType, selectedMonth, selectedStatus);
  });

  // PDF herunterladen
  downloadPdfButton.addEventListener("click", () => {
    const element = document.querySelector(".report-list");
    if (!element || element.innerHTML.trim() === "") {
      alert("Es gibt keine Berichte zum Herunterladen.");
      return;
    }

    const opt = {
      margin: 1,
      filename: "Zahlungsbericht.pdf",
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };
    html2pdf().from(element).set(opt).save();
  });

  // Funktion: Berichte laden
  async function loadReports(reportType, month, status) {
    try {
      console.log("Lade Berichte für Typ:", reportType, "Monat:", month, "Status:", status);

      const requestUrl = `/api/berichte?typ=${reportType}&monat=${month}&status=${status}`;
      console.log("API-Anfrage:", requestUrl);

      const response = await fetch(requestUrl);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Fehler beim Backend:", errorText);
        throw new Error("Fehler beim Abrufen der Berichte.");
      }

      const reports = await response.json();
      console.log("Berichte erfolgreich geladen:", reports);

      // Anzeige der Berichte
      displayReportAsTable(reports);
    } catch (error) {
      console.error("Fehler beim Laden der Berichte:", error);
      reportList.innerHTML = "<p>Fehler beim Laden der Berichte.</p>";
    }
  }

  function displayReportAsTable(reports) {
    let totalAmountOffen = 0;
    let totalAmountBezahlt = 0;

    const tableHeader = `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Mietart</th>
            <th>Zeitraum</th>
            <th>Betrag offen (EUR)</th>
            <th>Betrag bezahlt (EUR)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
    `;

    const tableRows = reports
      .map((report) => {
        totalAmountOffen += report.betragOffen || 0;
        totalAmountBezahlt += report.betragBezahlt || 0;

        return `
          <tr>
            <td>${report.mieterId}</td>
            <td>${report.name}</td>
            <td>${report.mietart}</td>
            <td>${report.zeitraum}</td>
            <td>${report.betragOffen.toFixed(2)}€</td>
            <td>${report.betragBezahlt.toFixed(2)}€</td>
            <td>${report.status}</td>
          </tr>
        `;
      })
      .join("");

    const tableFooter = `
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4" style="text-align: right;"><strong>Gesamt:</strong></td>
            <td><strong>${totalAmountOffen.toFixed(2)}€</strong></td>
            <td><strong>${totalAmountBezahlt.toFixed(2)}€</strong></td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    `;

    reportList.innerHTML = tableHeader + tableRows + tableFooter;
  }

  // Funktion: Monate für die Auswahl generieren
  function generateMonthOptions() {
    const currentDate = new Date();
    const monthSelector = document.getElementById("monthSelector");

    if (!monthSelector) {
      console.error("Element mit der ID 'monthSelector' nicht gefunden.");
      return;
    }

    for (let i = 0; i < 24; i++) {
      const month = new Date(currentDate.getFullYear() - 1, currentDate.getMonth() + i, 1);
      const option = document.createElement("option");
      option.value = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
      option.textContent = month.toLocaleString("de-DE", { month: "long", year: "numeric" });
      monthSelector.appendChild(option);
    }
  }
});
