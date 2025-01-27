document.addEventListener("DOMContentLoaded", () => {
  const tenantList = document.getElementById("tenantList");
  const paymentModal = document.getElementById("paymentDetailsModal");
  const closeModalButton = document.getElementById("closePaymentDetailsModal");
  const paymentDetailsList = document.getElementById("paymentDetailsList");
  const tenantNameField = document.getElementById("paymentTenantName");

  // Schließen des Modals
  closeModalButton.addEventListener("click", () => {
    paymentModal.classList.remove("active");
  });

  // Mieter laden
  async function loadTenants() {
    try {
      const response = await fetch("/api/mieter");
      if (!response.ok) throw new Error("Fehler beim Abrufen der Mieter.");
      const tenants = await response.json();

      tenantList.innerHTML = ""; // Liste zurücksetzen
      tenants
        .filter((tenant) => tenant.status !== "ausgezogen")
        .forEach((tenant) => {
          const listItem = document.createElement("li");
          listItem.className = "tenant-item";

          listItem.innerHTML = `
            <span>${tenant.vorname} ${tenant.nachname}</span>
            <button class="details-btn" data-id="${tenant.mieter_id}">Details</button>
          `;

          listItem.querySelector(".details-btn").addEventListener("click", () => {
            openPaymentDetails(tenant);
          });

          tenantList.appendChild(listItem);
        });
    } catch (error) {
      console.error("Fehler beim Laden der Mieter:", error);
    }
  }

  // Zahlungsmodal öffnen
  async function openPaymentDetails(tenant) {
    try {
      const response = await fetch(`/api/payments/${tenant.mieter_id}`);
      if (!response.ok) throw new Error("Fehler beim Abrufen der Zahlungsdetails.");

      const data = await response.json();
      console.log("Zahlungsdetails geladen:", data);

      // Mieterinformationen
      tenantNameField.textContent = `${tenant.vorname} ${tenant.nachname}`;

      // Zahlungsdetails darstellen
      const paymentDetails = Array.isArray(data.zahlungen) ? data.zahlungen : [];
      paymentDetailsList.innerHTML = paymentDetails
        .map(
          (payment) => `
            <li>
              <span>${payment.zeitraum}: ${payment.status || "Unbekannt"}</span>
              <button class="mark-paid-btn" data-id="${tenant.mieter_id}" data-period="${payment.zeitraum}">
                Bezahlt markieren
              </button>
            </li>
          `
        )
        .join("");

      // Event-Listener für "Bezahlt"-Buttons
      document.querySelectorAll(".mark-paid-btn").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          const tenantId = e.target.getAttribute("data-id");
          const period = e.target.getAttribute("data-period");
          await updatePaymentStatus(tenantId, period);
        });
      });

      paymentModal.classList.add("active");
    } catch (error) {
      console.error("Fehler beim Öffnen der Zahlungsdetails:", error);
      paymentDetailsList.innerHTML = "<p>Fehler beim Laden der Zahlungsinformationen.</p>";
    }
  }

  // Zahlungsstatus aktualisieren
  async function updatePaymentStatus(tenantId, period) {
    try {
      console.log("Sende PATCH-Anfrage für Tenant ID:", tenantId, "Zeitraum:", period);

      const response = await fetch(`/api/payments/${tenantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period: period, status: "bezahlt" }),
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        console.error("Fehlerdetails:", errorDetails);
        throw new Error(errorDetails.message || "Fehler beim Aktualisieren des Zahlungsstatus.");
      }

      alert("Zahlungsstatus erfolgreich aktualisiert!");
      await openPaymentDetails({ mieter_id: tenantId }); // Details neu laden
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Zahlungsstatus:", error);
    }
  }

  // Initialisierung
  loadTenants();
});
