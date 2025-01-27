document.addEventListener("DOMContentLoaded", () => {

  const modal = document.getElementById("modal");
  const openModalButton = document.getElementById("addTenantBtn");
  const closeModalButton = document.getElementById("closeModal");
  const cancelBtn = document.getElementById("cancelBtn");
  const form = document.getElementById("addTenantForm");
  const mieterTypSelect = document.getElementById("mieterTyp");
    // Event-Listener für Dropdown-Änderung
  mieterTypSelect.addEventListener("change", () => {
      toggleMieterDetails();
    });
  const autofillFields = ["mieteBetrag", "gesamtbetrag", "auszugsdatum"];
  autofillFields.forEach((fieldId) => {
      const field = document.getElementById(fieldId);
      if (field && field.value !== "") {
        console.log(`Autofill erkannt für ${fieldId}: ${field.value}`);
      }
    });
  // Event-Listener für Modalfenster
  if (openModalButton) openModalButton.addEventListener("click", () => modal.classList.add("active"));
  if (closeModalButton) closeModalButton.addEventListener("click", () => modal.classList.remove("active"));
  if (cancelBtn) cancelBtn.addEventListener("click", () => modal.classList.remove("active"));
  if (form) form.addEventListener("submit", handleFormSubmit);
});

// Umschalten der Mieter-Typ-Details
function toggleMieterDetails() {
  const mieterTyp = document.getElementById("mieterTyp").value;
  const monatlichDetails = document.getElementById("monatlichDetails");
  const pauschalDetails = document.getElementById("pauschalDetails");
  const mieteBetragInput = document.getElementById("mieteBetrag");
  const auszugsdatumInput = document.getElementById("auszugsdatum");
  const gesamtbetragInput = document.getElementById("gesamtbetrag");

  if (mieterTyp === "monatlich") {
    monatlichDetails.style.display = "block";
    pauschalDetails.style.display = "none";

    // Dynamische Validierung anpassen
    mieteBetragInput.required = true;
    if (mieteBetragInput.value === "") {
      mieteBetragInput.focus(); // Nur fokussieren, nicht zurücksetzen
    }
    auszugsdatumInput.required = false;
    gesamtbetragInput.required = false;

  } else if (mieterTyp === "pauschal") {
    monatlichDetails.style.display = "none";
    pauschalDetails.style.display = "block";

    // Dynamische Validierung anpassen
    mieteBetragInput.required = false;
    auszugsdatumInput.required = true;
    gesamtbetragInput.required = true;
  }

  // Keine Feldwerte löschen oder zurücksetzen!
}



// Verarbeiten des Formulars und Senden an das Backend
async function handleFormSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);

  // Validierung der Eingaben
  const mieterTyp = formData.get("mieterTyp");
  if (!validateForm(mieterTyp, formData)) return;

  // Objekt für den neuen Mieter erstellen
  const tenant = {
    anrede: formData.get("anrede"),
    vorname: formData.get("vorname"),
    nachname: formData.get("nachname"),
    geburtsdatum: formData.get("geburtsdatum"),
    adresse: {
      straße: formData.get("straße"),
      stadt: formData.get("stadt"),
      plz: formData.get("plz"),
      land: formData.get("land"),
    },
    mieterTyp,
    mieteBetrag: mieterTyp === "monatlich" ? parseFloat(formData.get("mieteBetrag")) : null,
    auszugsdatum: mieterTyp === "pauschal" ? formData.get("auszugsdatum") : null, // Neu hinzugefügt
    gesamtbetrag: mieterTyp === "pauschal" ? parseFloat(formData.get("gesamtbetrag")) : null,
    einzugsdatum: formData.get("einzugsdatum"),
  };

  try {
    // Ladeindikator anzeigen
    const submitButton = document.getElementById("submitBtn");
    submitButton.textContent = "Speichern...";
    submitButton.disabled = true;

    // Daten an das Backend senden
    const response = await fetch("/api/mieter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tenant),
    });

    if (response.ok) {
      alert("Mieter erfolgreich hinzugefügt!");
      event.target.reset(); // Formular zurücksetzen
      document.getElementById("modal").classList.remove("active");
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || "Fehler beim Hinzufügen des Mieters");
    }
  } catch (error) {
    alert(error.message);
  } finally {
    // Ladeindikator zurücksetzen
    const submitButton = document.getElementById("submitBtn");
    submitButton.textContent = "Hinzufügen";
    submitButton.disabled = false;
  }
}


// Validierungsfunktion
function validateForm(mieterTyp, formData) {
  let isValid = true;

  // Typ-spezifische Felder prüfen
  if (mieterTyp === "monatlich" && !formData.get("mieteBetrag")) {
    alert("Bitte geben Sie den monatlichen Mietbetrag an.");
    isValid = false;
  } else if (mieterTyp === "pauschal") {
    if (!formData.get("gesamtbetrag")) {
      alert("Bitte geben Sie den Gesamtbetrag für pauschale Mieter an.");
      isValid = false;
    }
    if (!formData.get("auszugsdatum")) {
      alert("Bitte geben Sie das Auszugsdatum für pauschale Mieter an.");
      isValid = false;
    }
  }

  return isValid;
}

