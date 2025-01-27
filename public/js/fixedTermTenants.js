document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("fixedTermTenantsModal");
  const showFixedTermTenantsBtn = document.getElementById("showFixedTermTenantsBtn");
  const closeModal = document.getElementById("closeFixedTermModal");
  const tenantList = document.getElementById("fixedTenantList");

  // Öffnet das Modal-Fenster
  showFixedTermTenantsBtn.addEventListener("click", async () => {
    try {
      const response = await fetch("/api/mieter/pauschal");

      if (!response.ok) {
        throw new Error("Fehler beim Abrufen der befristeten Mieter.");
      }

      const tenants = await response.json();

      tenantList.innerHTML = "";
      tenants.forEach((tenant) => {
        const listItem = document.createElement("li");
        listItem.className = "tenant-item";

        // Zahlungsstatus korrekt formatieren
        const zahlungsDetails = tenant.zahlungsstatus
          .map(
            (status) =>
              ` <p>${status.zeitraum}</p> 
                <p>Gesamtbetrag: ${tenant.gesamtbetrag}€</p> 
                <p>Status: ${status.status}</p>`
          )
          .join("");

        listItem.innerHTML = `
          <div class="tenant-main">
            <div class="tenant-info">
              <div class="avatar">👤</div>
              <div>
                <div class="name">${tenant.name}</div>
                <div class="badge">Befristet</div>
              </div>
            </div>
            <button class="action-btn toggle-details" data-id="${tenant.id}">Details anzeigen</button>
          </div>
          <div class="tenant-details hidden">
            <p><strong>Ablaufdatum:</strong> ${tenant.ablaufdatum}</p>
            <p><strong>Adresse:</strong> ${tenant.adresse}</p>
            <p><strong>Zahlungsstatus:</strong></p>
            <ul>${zahlungsDetails}</ul>
          </div>
        `;

        tenantList.appendChild(listItem);
      });

      modal.classList.add("active");

      document.querySelectorAll(".toggle-details").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const parent = e.target.closest(".tenant-item");
          const details = parent.querySelector(".tenant-details");
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
      console.error("Fehler im Frontend:", error);
      alert("Fehler beim Laden der Daten.");
    }
  });

  // Schließt das Modal-Fenster
  closeModal.addEventListener("click", () => {
    modal.classList.remove("active");
  });
});
