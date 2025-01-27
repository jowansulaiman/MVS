document.addEventListener("DOMContentLoaded", () => {
    const filterAll = document.getElementById("filterAll");
    const filterTenants = document.getElementById("filterTenants");
    const filterFixedTerm = document.getElementById("filterFixedTerm");
    const filterTerminated = document.getElementById("filterTerminated");
    const resultContainer = document.getElementById("resultContainer");
  
    const allCount = document.getElementById("allCount");
    const tenantsCount = document.getElementById("tenantsCount");
    const fixedTermCount = document.getElementById("fixedTermCount");
    const terminatedCount = document.getElementById("terminatedCount");
  
    // Event-Listener für alle Filter
    filterAll.addEventListener("click", () => fetchFilteredData("all"));
    filterTenants.addEventListener("click", () => fetchFilteredData("mieter"));
    filterFixedTerm.addEventListener("click", () => fetchFilteredData("pauschal"));
    filterTerminated.addEventListener("click", () => fetchFilteredData("gekündigt"));
  
    // Daten abrufen und aktualisieren
    async function fetchFilteredData(filter) {
      try {
        const response = await fetch(`/api/mieter?filter=${filter}`);
        if (!response.ok) throw new Error("Fehler beim Abrufen der Daten");
  
        const data = await response.json();
        updateDashboard(data);
      } catch (error) {
        console.error("Fehler:", error.message);
        resultContainer.innerHTML = `
          <div class="no-data">
            <div class="icon">🏠🔍</div>
            <h2>Fehler beim Laden der Daten</h2>
          </div>
        `;
      }
    }
  
    // Dashboard aktualisieren
    function updateDashboard(data) {
      if (!data.length) {
        resultContainer.innerHTML = `
          <div class="no-data">
            <div class="icon">🏠🔍</div>
            <h2>Keine Mietverhältnisse gefunden</h2>
          </div>
        `;
        return;
      }
    
      const listItems = data.map(
        (item) => `
        <div class="result-item">
          <p><strong>${item.vorname} ${item.nachname}</strong></p>
          <p>${item.mieterTyp === "pauschal" ? "Pauschal" : "Monatlich"}</p>
          <p>Status: ${item.status || "Aktiv"}</p>
        </div>
        `
      );
    
      resultContainer.innerHTML = `<div class="result-list">${listItems.join("")}</div>`;
    
      // Debugging
      console.log("Dashboard aktualisiert:", data);
    
      // Zähler aktualisieren
      allCount.textContent = data.length;
      tenantsCount.textContent = data.filter((t) => t.mieterTyp === "monatlich").length;
      fixedTermCount.textContent = data.filter((t) => t.mieterTyp === "pauschal").length;
      terminatedCount.textContent = data.filter((t) => t.status === "ausgezogen").length;
    }
    
  });
  