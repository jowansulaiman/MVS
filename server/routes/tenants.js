const express = require("express");
const router = express.Router();
const tenantModel = require("../models/tenantModel");
const { readFile, writeFile } = require("../models/fileOperations");
const path = require("path");
const MieterFile = path.join(__dirname, "../../data/mieter.json");
const generateUniqueId = require("../utils/idGenerator");

const MonthlyFile = path.join(__dirname, "../../data/monthlyTenants.json");
const FixedTermFile = path.join(__dirname, "../../data/fixedTermTenants.json");
const PaymentsFile = path.join(__dirname, "../../data/payments.json");

// Abrufen aller Mieter
router.post("/", async (req, res) => {
  try {
    const newTenant = req.body; // Eingabedaten
    const tenants = await readFile(MieterFile); // Aktuelle Mieter laden
    const payments = await readFile(PaymentsFile); // Zahlungsdaten
    const monthlyTenants = await readFile(MonthlyFile); // Monatliche Mieterdaten
    const fixedTermTenants = await readFile(FixedTermFile); // Pauschale Mieterdaten

    // ID generieren und neuen Mieter erstellen
    const newTenantId = generateUniqueId();
    const tenant = {
      mieter_id: newTenantId,
      ...newTenant,
      status: "aktiv"
    };

    // Mieter zu `mieter.json` hinzufügen
    tenants.push(tenant);
    await writeFile(MieterFile, tenants);

    // Mieter-spezifische Logik
    if (newTenant.mieterTyp === "monatlich") {
      // Daten zu `monthlyTenants.json` hinzufügen
      monthlyTenants[newTenantId] = {
        mieteBetrag: parseFloat(newTenant.mieteBetrag),
      };
      await writeFile(MonthlyFile, monthlyTenants);

      // Zahlungsdaten initialisieren
      const einzugsdatum = new Date(newTenant.einzugsdatum);
      const startMonth = `${einzugsdatum.getFullYear()}-${String(
        einzugsdatum.getMonth() + 1
      ).padStart(2, "0")}`;
      const startDay = einzugsdatum.getDate();

      payments[newTenantId] = {
        monatlich: [{ monat: startMonth, tag: startDay, status: "offen" }],
      };
      await writeFile(PaymentsFile, payments);
    } else if (newTenant.mieterTyp === "pauschal") {
      // Daten zu `fixedTermTenants.json` hinzufügen
      fixedTermTenants[newTenantId] = {
        auszugsdatum: newTenant.auszugsdatum,
        gesamtbetrag: parseFloat(newTenant.gesamtbetrag),
      };
      await writeFile(FixedTermFile, fixedTermTenants);

      // Zahlungsdaten initialisieren
      payments[newTenantId] = {
        pauschal: [
          {
            zeitraum: `${newTenant.einzugsdatum} bis ${newTenant.auszugsdatum}`,
            bezahlt: 0, // Anfangswert für bezahlt
            status: "offen",
          },
        ],
      };
      await writeFile(PaymentsFile, payments);
    }

    res.status(201).json({ message: "Mieter erfolgreich hinzugefügt.", tenant });
  } catch (error) {
    console.error("Fehler beim Hinzufügen eines Mieters:", error);
    res.status(500).json({ message: "Interner Serverfehler." });
  }
});

router.get("/", async (req, res) => {
  try {
    const { filter } = req.query; // Filter aus der Query abrufen
    const tenants = await readFile(MieterFile); // JSON-Datei laden

    let filteredTenants;

    // Filter anwenden
    switch (filter) {
      case "mieter": // Monatliche Mieter
        filteredTenants = tenants.filter((tenant) => tenant.mieterTyp === "monatlich");
        break;
      case "pauschal": // Pauschale Mieter
        filteredTenants = tenants.filter((tenant) => tenant.mieterTyp === "pauschal");
        break;
      case "gekündigt": // Gekündigte Mieter
        filteredTenants = tenants.filter((tenant) => tenant.status === "ausgezogen");
        break;
      case "all":
      default: // Alle Mieter
        filteredTenants = tenants;
        break;
    }

    console.log("Gefilterte Mieter:", filteredTenants); // Debugging
    res.status(200).json(filteredTenants);
  } catch (error) {
    console.error("Fehler beim Abrufen der Mieter:", error);
    res.status(500).json({ message: "Interner Serverfehler." });
  }
});


router.get("/monatlich", async (req, res) => {
  try {
    const tenants = await  tenantModel.getMonthlyTenants();
    res.json(tenants);
  } catch (error) {
    console.error("Fehler beim Abrufen der monatlichen Mieter:", error);
    res.status(500).send("Interner Serverfehler");
  }
});


router.get("/pauschal", async (req, res) => {
  try {
    console.log("API-Aufruf: /api/mieter/pauschal gestartet");
    const tenants = await tenantModel.getFixedTermTenants();
    //console.log("Befristete Mieter abgerufen:", tenants);
    res.json(tenants);
  } catch (error) {
    console.error("Fehler beim Abrufen der befristeten Mieter:", error);
    res.status(500).send("Interner Serverfehler");
  }
});


// Hinzufügen eines Mieters
router.get("/", async (req, res) => {
  try {
    const tenants = await readFile(MieterFile);
    const activeTenants = tenants.filter((tenant) => tenant.status !== "ausgezogen");
    res.json(activeTenants);
  } catch (error) {
    console.error("Fehler beim Abrufen der Mieter:", error);
    res.status(500).send("Interner Serverfehler");
  }
});


router.patch("/:id", async (req, res) => {
  try {
    const tenantId = req.params.id;
    const tenants = await readFile(MieterFile);

    const tenantIndex = tenants.findIndex((t) => t.mieter_id === tenantId);
    if (tenantIndex === -1) {
      return res.status(404).json({ message: "Mieter nicht gefunden." });
    }

    tenants[tenantIndex].status = req.body.status || "ausgezogen";
    await writeFile(MieterFile, tenants);

    res.status(200).json({ message: "Mieter erfolgreich gekündigt." });
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Status:", error);
    res.status(500).json({ message: "Interner Serverfehler." });
  }
});


module.exports = router;
