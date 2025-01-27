document.addEventListener("DOMContentLoaded", () => {
    const contractModal = document.getElementById("contractModal");
    const openContractButton = document.getElementById("openContractModal");
    const closeContractButton = document.getElementById("closeContractModal");
    const contractForm = document.getElementById("contractForm");
  
    // Modal öffnen
    openContractButton.addEventListener("click", () => {
      contractModal.classList.add("active");
      loadTenantOptions();
    });
  
    // Modal schließen
    closeContractButton.addEventListener("click", () => {
      contractModal.classList.remove("active");
    });
  
    // Formular absenden
    contractForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(contractForm);
      const contractData = Object.fromEntries(formData.entries());
  
      try {
        const response = await fetch("/api/contracts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contractData),
        });
  
        if (response.ok) {
          alert("Mietvertrag erfolgreich erstellt!");
          contractModal.classList.remove("active");
          contractForm.reset();
        } else {
          throw new Error("Fehler beim Erstellen des Mietvertrags.");
        }
      } catch (error) {
        console.error("Fehler:", error);
        alert("Ein Fehler ist aufgetreten.");
      }
    });
  
    // Mieter laden
    async function loadTenantOptions() {
      try {
        const response = await fetch("/api/mieter");
        if (!response.ok) throw new Error("Fehler beim Abrufen der Mieter.");
  
        const tenants = await response.json();
        const tenantSelect = document.getElementById("mieterId");
        tenantSelect.innerHTML = tenants
          .map(
            (tenant) =>
              `<option value="${tenant.mieter_id}">${tenant.vorname} ${tenant.nachname}</option>`
          )
          .join("");
      } catch (error) {
        console.error("Fehler beim Laden der Mieter:", error);
      }
    }
  });
  