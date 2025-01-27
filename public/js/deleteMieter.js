document.addEventListener("DOMContentLoaded", () => {
    const deleteModal = document.getElementById("deleteModal");
    const openDeleteModalBtn = document.getElementById("openDeleteModalBtn");
    const closeDeleteModalBtn = document.getElementById("closeDeleteModal");
    const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
    const deleteForm = document.getElementById("deleteTenantForm");
    const mieterSelect = document.getElementById("mieterSelect");
  
    // Öffne das Modal
    openDeleteModalBtn.addEventListener("click", async () => {
      deleteModal.classList.add("active");
      await populateMieterSelect();
    });
  
    // Schließe das Modal (Schließen-Button und Abbrechen-Button)
    closeDeleteModalBtn.addEventListener("click", () => {
      deleteModal.classList.remove("active");
    });
  
    cancelDeleteBtn.addEventListener("click", () => {
      deleteModal.classList.remove("active");
    });
  
    // Event-Listener für das Löschen
    deleteForm.addEventListener("submit", handleDeleteSubmit);
  });
  
  /**
   * Holt die Mieter aus der JSON-Datei und füllt das Dropdown-Menü.
   */
  async function populateMieterSelect() {
    try {
      const response = await fetch("/api/mieter");
      if (!response.ok) throw new Error("Fehler beim Abrufen der Mieter-Daten.");
  
      const mieter = await response.json();
      const mieterSelect = document.getElementById("mieterSelect");
      mieterSelect.innerHTML = `<option value="" disabled selected>Wählen Sie einen Mieter...</option>`;
  
      mieter.forEach((tenant, index) => {
        const option = document.createElement("option");
        option.value = index; // Der Index dient als ID
        option.textContent = `${tenant.anrede} ${tenant.vorname} ${tenant.nachname}`;
        mieterSelect.appendChild(option);
      });
    } catch (error) {
      console.error("Fehler beim Laden der Mieter:", error.message);
    }
  }
  
  /**
   * Behandelt das Löschen eines Mieters.
   * @param {Event} event - Das Submit-Event.
   */
  async function handleDeleteSubmit(event) {
    event.preventDefault();
  
    const mieterIndex = document.getElementById("mieterSelect").value;
  
    if (mieterIndex === "") {
      alert("Bitte wählen Sie einen Mieter aus.");
      return;
    }
  
    try {
      const response = await fetch(`/api/mieter/${mieterIndex}`, {
        method: "DELETE",
      });
  
      if (!response.ok) throw new Error("Fehler beim Löschen des Mieters.");
  
      alert("Mieter wurde erfolgreich gelöscht!");
      document.getElementById("deleteTenantForm").reset();
      document.getElementById("deleteModal").classList.remove("active");
    } catch (error) {
      console.error("Fehler beim Löschen des Mieters:", error.message);
      alert("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    }
  }
  