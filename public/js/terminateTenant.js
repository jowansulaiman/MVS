document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("terminateTenantModal");
    const showTerminateTenantModalBtn = document.getElementById("showTerminateTenantModalBtn");
    const closeModal = document.getElementById("closeTerminateModal");
    const tenantList = document.getElementById("terminateTenantList");
  
    // Öffnen des Modal-Fensters
    showTerminateTenantModalBtn.addEventListener("click", async () => {
      try {
        const response = await fetch("/api/mieter");
        if (!response.ok) {
          throw new Error("Fehler beim Abrufen der Mieter.");
        }
  
        const tenants = await response.json();
  
        tenantList.innerHTML = "";

    tenants.forEach((tenant) => {
  const listItem = document.createElement("li");
  listItem.className = "tenant-item";

  listItem.innerHTML = `
  <div class="tenant-main">
    <div class="tenant-info">
      <div class="avatar">${tenant.vorname.charAt(0)}</div>
      <div>
        <div class="name">${tenant.vorname} ${tenant.nachname}</div>
       
        <div class="badge">${tenant.mieterTyp === "pauschal" ? "Pauschal" : "Monatlich"}</div>
      </div>
    </div>
    <button class="terminate-btn" data-id="${tenant.mieter_id}">Kündigen</button>
  </div>              
  <div class="tenant-details">
              <p><strong>ID:</strong>  ${tenant.mieter_id}</p>
              <p><strong>Einzugsdatum:</strong> ${tenant.einzugsdatum}</p>
              
              <p><strong>Zahlungsstatus:</strong> ${tenant.status === "ausgezogen" ? "ausgezogen" : "Weiterhin Mieter"}</p>
              
  </div>
  `;

  tenantList.appendChild(listItem);
});

  
        modal.classList.add("active");
  
        // Event-Listener für "Kündigen"-Button
        document.querySelectorAll(".terminate-btn").forEach((btn) => {
          btn.addEventListener("click", async (e) => {
            const tenantId = e.target.getAttribute("data-id");
            await terminateTenant(tenantId);
            modal.classList.remove("active");
          });
        });
      } catch (error) {
        console.error("Fehler im Frontend:", error);
        alert("Fehler beim Laden der Daten.");
      }
    });
  
    // Schließen des Modal-Fensters
    closeModal.addEventListener("click", () => {
      modal.classList.remove("active");
    });
  });
  
  // Funktion zur Kündigung eines Mieters
  async function terminateTenant(tenantId) {
    try {
      const response = await fetch(`/api/mieter/${tenantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ausgezogen" }),
      });
  
      if (!response.ok) {
        throw new Error("Fehler beim Kündigen des Mieters.");
      }
  
      alert("Mieter erfolgreich gekündigt.");
      location.reload(); // Seite neu laden
    } catch (error) {
      console.error("Fehler beim Kündigen:", error);
      alert("Ein Fehler ist aufgetreten.");
    }
  }
  