document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("monthlyTenantsModal");
    const showMonthlyTenantsBtn = document.getElementById("showMonthlyTenantsBtn");
    const closeModal = document.getElementById("closeMonthlyModal");
    const tenantList = document.getElementById("tenantList");
  
    // Öffnen des Modal-Fensters
    showMonthlyTenantsBtn.addEventListener("click", async () => {
      try {
        console.log("Daten von der API werden angefordert...");
        const response = await fetch("/api/mieter/monatlich");
        if (!response.ok) {
          throw new Error("Fehler beim Abrufen der monatlichen Mieter.");
        }
  
        const tenants = await response.json();
        console.log("API-Daten empfangen:", tenants);
  
        // Liste der Mieter erstellen
        tenantList.innerHTML = "";
        tenants.forEach((tenant) => {
          const listItem = document.createElement("li");
          listItem.className = "tenant-item";
  
          listItem.innerHTML = `
            <div class="tenant-main">
              <div class="tenant-info">
                <div class="avatar">👤</div>
                <div>
                  <div class="name">${tenant.name}</div>
                  <div class="badge">Mieter</div>
                </div>
              </div>
              <button class="action-btn toggle-details" data-id="${tenant.id}">Details anzeigen</button>
            </div>
            <div class="tenant-details hidden">
              <p><strong>Einzugsdatum:</strong> ${tenant.einzugsdatum}</p>
              <p><strong>Adresse:</strong> ${tenant.adresse}</p>
              <p><strong>Miete (€):</strong> ${tenant.mieteBetrag}</p>
              <p><strong>Zahlungsstatus:</strong> ${tenant.zahlungsstatus}</p>
            </div>
          `;
  
          tenantList.appendChild(listItem);
        });
  
        // Modal anzeigen
        modal.classList.add("active");
  
        // Event-Listener für "Details anzeigen"
        document.querySelectorAll(".toggle-details").forEach((btn) => {
          btn.addEventListener("click", (e) => {
            const parent = e.target.closest(".tenant-item");
            const details = parent.querySelector(".tenant-details");
            console.log("Details für diesen Mieter:", details);
  
            if (details.classList.contains("hidden")) {
              details.classList.remove("hidden");
              e.target.textContent = "Details ausblenden";
            } else {
              details.classList.add("hidden");
              e.target.textContent = "Details anzeigen";
            }
          });
        });
      } catch (error) {
        console.error("Fehler beim Abrufen der Mieter:", error);
        alert("Fehler beim Laden der Daten.");
      }
    });
  
    // Schließen des Modal-Fensters
    closeModal.addEventListener("click", () => {
      modal.classList.remove("active");
    });
  });
  