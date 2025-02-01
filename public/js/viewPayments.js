document.addEventListener("DOMContentLoaded", () => {
  const paymentModal = document.getElementById("paymentModal");
  const paymentDueModal = document.getElementById("paymentDueModal");
  
  const openModalButton = document.getElementById("openUpdatePaymentModal");
  const openPaymentDueModal = document.getElementById("openPaymentDueModal");
  
  const closeModalButton = document.getElementById("closePaymentModal");
  const closePaymentDueModal = document.getElementById("closePaymentDueModal");
  
  const tenantList = document.getElementById("paymentTenantList");
  const unpaidList = document.getElementById("unpaidMonthsList");

  // Modal öffnen
  openModalButton?.addEventListener("click", async () => {
    paymentModal?.classList.add("active");
    await loadTenants();
  });

  openPaymentDueModal?.addEventListener("click", async () => {
    paymentDueModal?.classList.add("active");
    await loadUnpaidMonths();
  });

  // Modal schließen
  closeModalButton?.addEventListener("click", () => {
    paymentModal?.classList.remove("active");
  });

  closePaymentDueModal?.addEventListener("click", () => {
    paymentDueModal?.classList.remove("active");
  });

  //Mieter laden und anzeigen
  async function loadTenants() {
    try {
      const response = await fetch("/api/mieter");
      if (!response.ok) throw new Error(`Fehler beim Abrufen der Mieter. Status: ${response.status}`);
      const tenants = await response.json();
  
      const tenantList = document.getElementById("paymentTenantList");
      tenantList.innerHTML = ""; 
  
      if (tenants.length === 0) {
        tenantList.innerHTML = "<li>Keine Mieter verfügbar.</li>";
        return;
      }
  
      tenants.forEach((tenant) => {
        const listItem = document.createElement("li");
        listItem.className = "tenant-item";
  
        listItem.innerHTML = `
          <div class="tenant-main">
            <div class="tenant-info">
              <div class="avatar">👤</div>
              <div>
                <div class="name">${tenant.vorname} ${tenant.nachname}</div>
                <div class="badge">${tenant.mieterTyp}</div>
              </div>
            </div>
          </div>
          <div class="button-container">
            <button class="details-btn" data-id="${tenant.mieter_id}">Details anzeigen</button>
          </div>
          <div class="tenant-details hidden" id="details-${tenant.mieter_id}">
            <p><strong>Adresse:</strong> ${tenant.adresse.straße}, ${tenant.adresse.stadt}</p>
            <ul id="payment-details-${tenant.mieter_id}" class="payment-details-list">
              <li>Lade Zahlungsinformationen...</li>
            </ul>
          </div>
        `;
  
        // Details anzeigen/ausblenden
        listItem.querySelector(".details-btn")?.addEventListener("click", async () => {
          const detailsSection = document.getElementById(`details-${tenant.mieter_id}`);
          if (!detailsSection.classList.contains("hidden")) {
            detailsSection.classList.add("hidden");
            return;
          }
  
          detailsSection.classList.remove("hidden");
          await loadPaymentDetails(tenant.mieter_id);
        });
  
        tenantList.appendChild(listItem);
      });
    } catch (error) {
      console.error("Fehler beim Laden der Mieter:", error);
      const tenantList = document.getElementById("paymentTenantList");
      tenantList.innerHTML = "<li>Fehler beim Laden der Daten.</li>";
    }
  }
  
  //Unbezahlte Monate laden und anzeigen
//Zahlungsdetails laden
async function loadPaymentDetails(tenantId) {
  const paymentDetailsList = document.getElementById(`payment-details-${tenantId}`);

  try {
    const response = await fetch(`/api/payments/${tenantId}`);
    if (!response.ok) throw new Error(`Fehler beim Abrufen der Zahlungsdetails. Status: ${response.status}`);
    const paymentDetails = await response.json();

    const monthlyPayments = paymentDetails.monatlich || [];
    const fixedPayments = paymentDetails.pauschal || [];
    let paymentItems = [];

    if (monthlyPayments.length > 0) {
      paymentItems = monthlyPayments.map(
        (payment) => `
          <ul>
            <li>
              <span>Monat: ${payment.monat}-${payment.tag}<br>Status: ${payment.status || "Unbekannt"}</span>
            </li>
            <div class="button-container">
              <button class="mark-paid-btn" data-id="${tenantId}" data-period="${payment.monat}">Bezahlt</button>
            </div>
          </ul>
        `
      );
    } else if (fixedPayments.length > 0) {
      paymentItems = fixedPayments.map(
        (payment) => `
          <ul>
            <li>
              <span>Zeitraum: ${payment.zeitraum}<br>Status: ${payment.status || "Unbekannt"}</span>
            </li>
            <div class="button-container">
              <button class="mark-paid-btn" data-id="${tenantId}" data-period="${payment.zeitraum}">Bezahlt</button>
            </div>
          </ul>
        `
      );
    } else {
      paymentItems = ["<li>Keine Zahlungsinformationen verfügbar.</li>"];
    }

    paymentDetailsList.innerHTML = paymentItems.join("");

    // Event-Listener für "Bezahlt markieren"-Buttons
    paymentDetailsList.querySelectorAll(".mark-paid-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const tenantId = e.target.getAttribute("data-id");
        const period = e.target.getAttribute("data-period");
        await updatePaymentStatus(tenantId, period);
      });
    });
  } catch (error) {
    console.error("Fehler beim Laden der Zahlungsdetails:", error);
    paymentDetailsList.innerHTML = "<li>Fehler beim Laden der Zahlungsinformationen.</li>";
  }
}

  //Unbezahlte Monate laden und anzeigen
  async function loadUnpaidMonths() {
    try {
      const mieterResponse = await fetch("/api/mieter");
      const paymentsResponse = await fetch("/api/payments");

      if (!mieterResponse.ok || !paymentsResponse.ok) {
        throw new Error("Fehler beim Abrufen der Mieter- oder Zahlungsdaten.");
      }

      const tenants = await mieterResponse.json();
      const payments = await paymentsResponse.json();

      unpaidMonthsList.innerHTML = ""; // Liste zurücksetzen

      if (tenants.length === 0) {
        unpaidMonthsList.innerHTML = "<li>Keine Mieter verfügbar.</li>";
        return;
      }

      tenants.forEach((tenant) => {
        try {
          const paymentData = payments[tenant.mieter_id] || {}; // Zahlungsdaten für den Mieter abrufen
          const unpaidMonths = calculateUnpaidMonths(tenant, paymentData);
          betrag = 0;
          if (tenant.mieterTyp === "monatlich"){
            betrag = tenant.mieteBetrag
          } else{
            betrag = tenant.gesamtbetrag
          }
          if (unpaidMonths.length > 0) {
            const listItem = document.createElement("li");
            listItem.className = "unpaid-item";
      
            // Dynamische Anzeige der unbezahlten Monate mit einheitlichem Format
            listItem.innerHTML = `
            <div class="tenant-main">
              <div class="tenant-info">
                <div class="avatar">👤</div>
                <div>
                  <div class="name">${tenant.vorname} ${tenant.nachname}</div>
                  <div class="badge">${tenant.mieterTyp}</div>
                </div>
              </div>
            </div>
            <div class="tenant-details ">
              <p><strong>Einzugsdatum:</strong>  ${unpaidMonths.map((period) => `${period}`).join("")}</p>
              <p><strong>Miete (€):</strong> ${betrag}</p>
            </div>
            `;
      
            unpaidMonthsList.appendChild(listItem);
          }
        } catch (error) {
          console.error(`Fehler bei der Verarbeitung von Mieter ID ${tenant.mieter_id}:`, error);
        }
      });
      

      if (unpaidMonthsList.innerHTML === "") {
        unpaidMonthsList.innerHTML = "<li>Keine unbezahlten Monate gefunden.</li>";
      }
    } catch (error) {
      console.error("Fehler beim Laden der unbezahlten Monate:", error);
      unpaidMonthsList.innerHTML = "<li>Fehler beim Laden der Daten.</li>";
    }
  }

  //Unbezahlte Monate berechnen
  function calculateUnpaidMonths(tenant, paymentData) {
    const currentDate = new Date();
    const unpaidMonths = [];
    const m_status = tenant.status || "aktiv";
    // Falls der Mieter ausgezogen ist, keine unbezahlten Monate berechnen
    if (m_status === "ausgezogen" || m_status === "undefined") {
      return unpaidMonths;
    }
  
    if (tenant.mieterTyp === "monatlich") {
      const payments = paymentData?.monatlich || [];
      const einzugsdatum = new Date(tenant.einzugsdatum);
      const auszugsdatum = tenant.auszugsdatum ? new Date(tenant.auszugsdatum) : currentDate;
  
      // Iteriere über alle Monate zwischen Einzugs- und Auszugsdatum
      for (let date = new Date(einzugsdatum); date <= auszugsdatum; date.setMonth(date.getMonth() + 1)) {
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const payment = payments.find((p) => p.monat === month);
  
        if (!payment || payment.status !== "bezahlt") {
          unpaidMonths.push(formatMonth(date) + "-" + payment.tag);
        }
      }
    } else if (tenant.mieterTyp === "pauschal") {
      const payments = paymentData?.pauschal || [];
  
      payments.forEach((payment) => {
        if (payment.status !== "bezahlt") {
          unpaidMonths.push(payment.zeitraum);
        }
      });
    }
  
    return unpaidMonths;
  }
 //Zahlungsstatus aktualisieren
 async function updatePaymentStatus(tenantId, period) {
  try {
    const response = await fetch(`/api/payments/${tenantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ period, status: "bezahlt" }),
    });

    if (!response.ok) throw new Error(`Fehler beim Aktualisieren des Zahlungsstatus. Status: ${response.status}`);
    alert("Zahlungsstatus erfolgreich aktualisiert!");
    await loadPaymentDetails(tenantId); // Details neu laden
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Zahlungsstatus:", error);
    alert("Fehler beim Aktualisieren des Zahlungsstatus.");
  }
}


  //Zeitraum formatieren
 function formatPeriod(date) {
  const startDate = new Date(date.getFullYear(), date.getMonth(), 1); // Erster Tag des Monats
  const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0); // Letzter Tag des Monats
  return `${startDate.toLocaleDateString("de-DE")} bis ${endDate.toLocaleDateString("de-DE")}`;
}

function formatMonth(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Monat mit führender Null
  return `${year}-${month}`; // Rückgabe im Format "YYYY-MM"
}

  // Initialisierung
  loadTenants();
});












