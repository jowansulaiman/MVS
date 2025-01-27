const express = require("express");
const router = express.Router();
const path = require("path");
const { readFile } = require("../models/fileOperations");

const MieterFile = path.join(__dirname, "../../data/mieter.json");
const MonthlyFile = path.join(__dirname, "../../data/monthlyTenants.json");
const FixedTermFile = path.join(__dirname, "../../data/fixedTermTenants.json");
const PaymentsFile = path.join(__dirname, "../../data/payments.json");

router.get("/", async (req, res) => {
  try {
    const { typ, monat, status } = req.query;

    if (!typ || !monat) {
      return res.status(400).send("Typ und Monat müssen angegeben werden.");
    }

    // Daten laden
    const mieter = await readFile(MieterFile);
    const monthlyTenants = await readFile(MonthlyFile);
    const fixedTermTenants = await readFile(FixedTermFile);
    const payments = await readFile(PaymentsFile);

    let reportData = [];

    if (typ === "monatlich") {
      console.log(`Bericht für monatliche Mieter wird erstellt: Monat=${monat}, Status=${status || "Alle"}`);
      reportData = mieter
        .filter((tenant) => tenant.mieterTyp === "monatlich")
        .map((tenant) => {
          const tenantPayments = payments[tenant.mieter_id]?.monatlich || [];
          const paymentForMonth = tenantPayments.find((p) => p.monat === monat) || {};

          const mieteBetrag = monthlyTenants[tenant.mieter_id]?.mieteBetrag || tenant.mieteBetrag || 0;

          const betragOffen = paymentForMonth.status === "offen" ? mieteBetrag : 0;
          const betragBezahlt = paymentForMonth.status === "bezahlt" ? mieteBetrag : 0;

          const zahlungsstatus = paymentForMonth.status || "Unbekannt";

          const isValidDate =
            new Date(monat) >= new Date(tenant.einzugsdatum) &&
            (!tenant.auszugsdatum || new Date(monat) <= new Date(tenant.auszugsdatum));

          if (isValidDate) {
            return {
              mieterId: tenant.mieter_id,
              name: `${tenant.vorname} ${tenant.nachname}`,
              mietart: "Monatlich",
              zeitraum: monat,
              betragOffen,
              betragBezahlt,
              status: zahlungsstatus,
            };
          }
          return null;
        })
        .filter((report) => report && (!status || report.status.toLowerCase() === status.toLowerCase()));
    }

    if (typ === "pauschal") {
      console.log(`Bericht für pauschale Mieter wird erstellt: Monat=${monat}, Status=${status || "Alle"}`);
      reportData = mieter
        .filter((tenant) => tenant.mieterTyp === "pauschal")
        .flatMap((tenant) => {
          const tenantPayments = payments[tenant.mieter_id]?.pauschal || [];
          const fixedData = fixedTermTenants[tenant.mieter_id] || {};
          const gesamtbetrag = fixedData.gesamtbetrag || tenant.gesamtbetrag || 0;

          return tenantPayments
            .filter((payment) => payment.zeitraum.includes(monat))
            .map((payment) => {
              const zahlungsstatus = payment.status || "Unbekannt";
              const betragOffen = zahlungsstatus === "offen" ? gesamtbetrag - (payment.bezahlt || 0) : 0;
              const betragBezahlt = payment.bezahlt || 0;

              return {
                mieterId: tenant.mieter_id,
                name: `${tenant.vorname} ${tenant.nachname}`,
                mietart: "Pauschal",
                zeitraum: payment.zeitraum,
                betragOffen,
                betragBezahlt,
                status: zahlungsstatus,
              };
            });
        })
        .filter((report) => !status || report.status.toLowerCase() === status.toLowerCase());
    }

    console.log(`Bericht erfolgreich erstellt: ${JSON.stringify(reportData, null, 2)}`);
    res.status(200).json(reportData);
  } catch (error) {
    console.error("Fehler beim Abrufen der Berichte:", error);
    res.status(500).send("Interner Serverfehler.");
  }
});

module.exports = router;
