async function showTenants(type) {
    try {
      const response = await fetch(`/api/mieter?type=${type}`);
      const tenants = await response.json();
      console.log(`${type} Mieter:`, tenants);
      // Darstellung der Daten (z. B. als Tabelle)
    } catch (error) {
      console.error("Fehler beim Abrufen der Mieter:", error);
    }
  }
  