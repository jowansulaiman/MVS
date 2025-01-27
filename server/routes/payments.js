const express = require("express");
const router = express.Router();
const path = require("path");
const { readFile, writeFile } = require("../models/fileOperations");

const PaymentsFile = path.join(__dirname, "../../data/payments.json");
const MonthlyFile = path.join(__dirname, "../../data/monthlyTenants.json");
const FixedTermFile = path.join(__dirname, "../../data/fixedTermTenants.json");

// Route: Alle Zahlungen abrufen
router.get("/", async (req, res) => {
  try {
    const payments = await readFile(PaymentsFile);
    res.json(payments);
  } catch (error) {
    console.error("Fehler beim Abrufen der Zahlungsdaten:", error);
    res.status(500).send("Fehler beim Abrufen der Zahlungsdaten.");
  }
});

// Route: Zahlungsdetails für einen Mieter abrufen
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const payments = await readFile(PaymentsFile);

    if (!payments[id]) {
      return res.status(404).json({ message: "Zahlungsinformationen nicht gefunden." });
    }

    const paymentDetails = payments[id];
    const formattedPayments = {
      monatlich: paymentDetails.monatlich || [],
      pauschal: paymentDetails.pauschal || [],
    };

    res.status(200).json(formattedPayments);
  } catch (error) {
    console.error("Fehler beim Abrufen der Zahlungsdetails:", error);
    res.status(500).send("Interner Serverfehler.");
  }
});

// Route: Zahlungsstatus aktualisieren
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params; // Mieter-ID
    const { period, status, bezahlt } = req.body; // Zeitraum und Status aus der Anfrage
    const payments = await readFile(PaymentsFile);

    if (!payments[id]) {
      return res.status(404).json({ message: "Mieter nicht gefunden." });
    }

    let paymentPeriod = null;

    // Monatliche Zahlungen prüfen
    if (payments[id].monatlich) {
      paymentPeriod = payments[id].monatlich.find((entry) => entry.monat === period);
    }
    // Pauschale Zahlungen prüfen
    if (!paymentPeriod && payments[id].pauschal) {
      paymentPeriod = payments[id].pauschal.find((entry) => entry.zeitraum === period);
    }

    if (!paymentPeriod) {
      return res.status(404).json({ message: "Zahlungszeitraum nicht gefunden." });
    }

    // Zahlungsstatus und Beträge aktualisieren
    paymentPeriod.status = status || "bezahlt";
    if (bezahlt !== undefined) {
      paymentPeriod.bezahlt = (paymentPeriod.bezahlt || 0) + bezahlt;
    }

    await writeFile(PaymentsFile, payments);

    res.status(200).json({
      message: "Zahlungsstatus erfolgreich aktualisiert.",
      updatedPayment: paymentPeriod,
    });
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Zahlungsstatus:", error);
    res.status(500).json({ message: "Interner Serverfehler." });
  }
});

router.post("/", async (req, res) => {
  try {
    console.log("Empfangene Daten:", req.body); // Loggen Sie die empfangenen Daten
    const newTenant = req.body;

    // Validieren Sie die Daten
    if (!newTenant.vorname || !newTenant.nachname) {
      return res.status(400).json({ message: "Fehlende erforderliche Felder." });
    }

    // Logik zum Hinzufügen des Mieters hier...
  } catch (error) {
    console.error("Fehler beim Hinzufügen eines Mieters:", error);
    res.status(500).json({ message: "Interner Serverfehler." });
  }
});


router.get("/due", async (req, res) => {
  try {
    const mieter = await readFile(MieterFile);
    const payments = await readFile(PaymentsFile);
    const monthlyTenants = await readFile(MonthlyFile);

    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}`;
    const currentDay = currentDate.getDate();

    const duePayments = mieter
      .filter((tenant) => tenant.mieterTyp === "monatlich")
      .map((tenant) => {
        const tenantPayments = payments[tenant.mieter_id]?.monatlich || [];
        const nextPayment = tenantPayments.find(
          (p) => p.monat === currentMonth && p.tag <= currentDay && p.status === "offen"
        );

        return nextPayment
          ? {
              mieterId: tenant.mieter_id,
              name: `${tenant.vorname} ${tenant.nachname}`,
              monat: nextPayment.monat,
              tag: nextPayment.tag,
              status: nextPayment.status || "offen",
              betrag: monthlyTenants[tenant.mieter_id]?.mieteBetrag || "Unbekannt",
            }
          : null;
      })
      .filter((payment) => payment !== null);

    res.status(200).json(duePayments);
  } catch (error) {
    console.error("Fehler beim Abrufen der Zahlungsfälligkeiten:", error);
    res.status(500).send("Interner Serverfehler.");
  }
});

// Route: Zahlungsstatus für spezifischen Eintrag aktualisieren (POST)
router.post("/update", async (req, res) => {
  try {
    const { tenantId, identifier, amount } = req.body;
    const payments = await readFile(PaymentsFile);
    const monthlyData = await readFile(MonthlyFile);
    const fixedTermData = await readFile(FixedTermFile);

    if (payments[tenantId]?.monatlich) {
      const monthEntry = payments[tenantId].monatlich.find((m) => m.monat === identifier);
      if (monthEntry) {
        monthEntry.status = "bezahlt";
        monthEntry.bezahlt = (monthEntry.bezahlt || 0) + amount;
        monthEntry.offen = Math.max(0, monthEntry.offen - amount);
        monthlyData[tenantId].zahlungsstatus = "bezahlt";
      }
    } else if (payments[tenantId]?.pauschal) {
      const periodEntry = payments[tenantId].pauschal.find((p) => p.zeitraum === identifier);
      if (periodEntry) {
        periodEntry.status = "bezahlt";
        fixedTermData[tenantId].bezahlt = (fixedTermData[tenantId].bezahlt || 0) + amount;
      }
    }

    await writeFile(PaymentsFile, payments);
    await writeFile(MonthlyFile, monthlyData);
    await writeFile(FixedTermFile, fixedTermData);

    res.status(200).json({ message: "Zahlungsstatus erfolgreich aktualisiert." });
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Zahlungsstatus:", error);
    res.status(500).send("Interner Serverfehler.");
  }
});

module.exports = router;
