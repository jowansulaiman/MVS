const fs = require("fs").promises;
const path = require("path");
const generateUniqueId = require("../utils/idGenerator");

const MieterFile = path.join(__dirname, "../../data/mieter.json");
const MonthlyFile = path.join(__dirname, "../../data/monthlyTenants.json");
const FixedTermFile = path.join(__dirname, "../../data/fixedTermTenants.json");
const PaymentsFile = path.join(__dirname, "../../data/payments.json");

const { readFile, writeFile } = require("../models/fileOperations");

async function getPayments() {
  return await readFile(PaymentsFile);
}

// Alle Mieter abrufen
async function getAllTenants() {
  return await readFile(MieterFile);
}
function isPaymentDue(month, day) {
  const currentDate = new Date();
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
  const currentDay = currentDate.getDate();

  // Zahlung ist fällig, wenn der Monat erreicht ist und der aktuelle Tag das Fälligkeitsdatum überschreitet
  return currentMonth > month || (currentMonth === month && currentDay >= day);
}

// Neuen Mieter hinzufügen
async function addTenant(data) {
  try {
    validateTenantData(data);
    console.log("Daten validiert:", data);

    const tenants = await readFile(MieterFile);
    console.log("Aktuelle Mieter geladen:", tenants);

    const newTenantId = generateUniqueId();
    console.log("Generierte Mieter-ID:", newTenantId);

    const newTenant = {
      mieter_id: newTenantId,
      anrede: data.anrede,
      vorname: data.vorname,
      nachname: data.nachname,
      geburtsdatum: data.geburtsdatum,
      adresse: data.adresse,
      mieterTyp: data.mieterTyp,
      einzugsdatum: data.einzugsdatum,
      auszugsdatum: data.mieterTyp === "pauschal" ? data.auszugsdatum : null
    };

    tenants.push(newTenant);
    await writeFile(MieterFile, tenants);
    console.log("Neuer Mieter gespeichert:", newTenant);

    if (data.mieterTyp === "monatlich") {
      console.log("Monatlicher Mieter wird verarbeitet...");
      await addMonthlyTenant(newTenantId, data.mieteBetrag);

      const payments = await readFile(PaymentsFile);
      const einzugsdatum = new Date(data.einzugsdatum);
      const startMonth = `${einzugsdatum.getFullYear()}-${String(einzugsdatum.getMonth() + 1).padStart(2, "0")}`;
      const startDay = einzugsdatum.getDate();

      payments[newTenantId] = {
        monatlich: [{ monat: startMonth, tag: startDay, status: "offen" }],
      };

      await writeFile(PaymentsFile, payments);
      console.log("Zahlungsdaten für monatlichen Mieter gespeichert.");
    }

    if (data.mieterTyp === "pauschal") {
      console.log("Pauschalmieter wird verarbeitet...");
      await addFixedTermTenant(newTenantId, data.auszugsdatum, data.gesamtbetrag);

      const payments = await readFile(PaymentsFile);
      const totalAmount = parseFloat(data.gesamtbetrag);
     

      payments[newTenantId] = {
        pauschal: [
          {
            zeitraum: `${data.einzugsdatum} bis ${data.auszugsdatum}`,
            bezahlt: totalAmount,
            status: "offen",
          },
        ],
      };

      await writeFile(PaymentsFile, payments);
      console.log("Zahlungsdaten für Pauschalmieter gespeichert.");
    }

    return newTenant;
  } catch (error) {
    console.error("Fehler in addTenant:", error);
    throw new Error("Fehler beim Hinzufügen des Mieters.");
  }
}




// Validierungsfunktion
function validateTenantData(data) {
  const requiredFields = ["anrede", "vorname", "nachname", "mieterTyp", "einzugsdatum"];
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`Das Feld ${field} ist erforderlich.`);
    }
  }

  if (data.mieterTyp === "monatlich" && !data.mieteBetrag) {
    throw new Error("Das Feld 'mieteBetrag' ist für monatliche Mieter erforderlich.");
  }

  if (data.mieterTyp === "pauschal" && (!data.gesamtbetrag)) {
    throw new Error("Die Felder 'bezahlt' und 'gesamtbetrag' sind für pauschale Mieter erforderlich.");
  }
}


// Monatliche Mieterdaten speichern
async function addMonthlyTenant(tenantId, mieteBetrag) {
  const monthlyTenants = await readFile(MonthlyFile);
  monthlyTenants[tenantId] = {
    mieteBetrag: parseFloat(mieteBetrag),
  };
  await writeFile(MonthlyFile, monthlyTenants);
}


async function getMonthlyTenants() {
  const mieter = await readFile(MieterFile);
  const monthlyTenants = await readFile(MonthlyFile);
  const payments = await readFile(PaymentsFile);

  // Filter nur für monatliche Mieter
  return mieter
    .filter((tenant) => tenant.mieterTyp === "monatlich")
    .map((tenant) => {
      const tenantId = tenant.mieter_id;
      return {
        id: tenantId,
        name: `${tenant.vorname} ${tenant.nachname}`,
        einzugsdatum: tenant.einzugsdatum,
        adresse: `${tenant.adresse.straße}, ${tenant.adresse.plz} ${tenant.adresse.stadt}`,
        mieteBetrag: monthlyTenants[tenantId]?.mieteBetrag || "Unbekannt",
        zahlungsstatus:
          payments[tenantId]?.monatlich.find(
            (m) => m.monat === getCurrentMonth()
          )?.status || "Unbekannt",
      };
    });
}

async function getFixedTermTenants() {
  try {
    const mieter = await readFile(MieterFile);
    const payments = await readFile(PaymentsFile);

    console.log("payments.json:", payments);

    return mieter
      .filter((tenant) => tenant.mieterTyp === "pauschal")
      .map((tenant) => {
        const tenantId = tenant.mieter_id;
        const zahlungsstatus = Array.isArray(payments[tenantId]?.pauschal)
          ? payments[tenantId].pauschal.map((p) => ({
              zeitraum: p.zeitraum,
              bezahlt: p.bezahlt,
              status: p.status || "Unbekannt",
            }))
          : [{ zeitraum: "Keine Daten", bezahlt: "0€", status: "Unbekannt" }];

        console.log(`Zahlungsstatus für ${tenantId}:`, zahlungsstatus);

        return {
          id: tenantId,
          name: `${tenant.vorname} ${tenant.nachname}`,
          ablaufdatum: tenant.ablaufdatum || "Unbekannt",
          adresse: `${tenant.adresse.straße}, ${tenant.adresse.plz} ${tenant.adresse.stadt}`,
          zahlungsstatus,
        };
      });
  } catch (error) {
    console.error("Fehler in getFixedTermTenants:", error);
    throw error;
  }
}




// Hilfsfunktion für den aktuellen Monat
function getCurrentMonth() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

async function checkPaymentDueDates() {
  const payments = await readFile(PaymentsFile);
  const tenants = await readFile(MieterFile);

  for (const tenant of tenants) {
    const tenantId = tenant.mieter_id;
    const einzugsdatum = new Date(tenant.einzugsdatum);
    const startMonth = `${einzugsdatum.getFullYear()}-${String(einzugsdatum.getMonth() + 1).padStart(2, "0")}`;
    const startDay = einzugsdatum.getDate();

    // Berechne alle Monate seit dem Einzugsdatum
    const monthsSinceStart = getMonthsSinceDate(einzugsdatum);

    if (!payments[tenantId]) {
      payments[tenantId] = { monatlich: [] };
    }

    const existingMonths = payments[tenantId].monatlich.map((m) => m.monat);

    for (const month of monthsSinceStart) {
      if (!existingMonths.includes(month)) {
        payments[tenantId].monatlich.push({ monat: month, tag: startDay, status: "offen" });
      }
    }

    // Überprüfen der Fälligkeit
    for (const payment of payments[tenantId].monatlich) {
      if (isPaymentDue(payment.monat, payment.tag) && payment.status === "offen") {
        console.log(`Zahlung für Mieter ${tenantId} im Monat ${payment.monat} ist fällig.`);
      }
    }
  }

  console.log("Zahlungsdaten aktualisiert:", payments);
  await writeFile(PaymentsFile, payments);
}


async function updateMonthlyPayment(tenantId, status) {
  const payments = await readFile(PaymentsFile);

  // Initialisierung, falls keine Einträge für den Mieter vorhanden sind
  if (!payments[tenantId]) {
    payments[tenantId] = { monatlich: [] };
  }

  // Aktuellen Monat ermitteln (im Format YYYY-MM)
  const currentDate = new Date();
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;

  // Prüfen, ob der aktuelle Monat bereits eingetragen ist
  const existingMonth = payments[tenantId].monatlich.find((m) => m.monat === currentMonth);
  if (existingMonth) {
    existingMonth.status = status; // Status aktualisieren
  } else {
    payments[tenantId].monatlich.push({ monat: currentMonth, status: "offen" });
  }

  // Speichern der aktualisierten Daten
  console.log("Aktualisierte Zahlungsdaten für monatlich:", payments[tenantId].monatlich);
  await writeFile(PaymentsFile, payments);
}

function getMonthsSinceDate(startDate) {
  const months = [];
  const start = new Date(startDate);
  const end = new Date();

  let current = new Date(start.getFullYear(), start.getMonth(), 1);
  while (current <= end) {
    months.push(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`);
    current.setMonth(current.getMonth() + 1);
  }

  return months;
}


async function updateFixedTermPayment(tenantId, zeitraum, bezahlt, offen) {
  const payments = await readFile(PaymentsFile);

  // Initialisierung, falls keine Einträge für den Mieter vorhanden sind
  if (!payments[tenantId]) {
    payments[tenantId] = { pauschal: [] };
  }

  // Prüfen, ob der Zeitraum bereits existiert
  const existingTerm = payments[tenantId].pauschal.find((p) => p.zeitraum === zeitraum);
  if (existingTerm) {
    existingTerm.bezahlt = bezahlt;
    existingTerm.offen = offen;
  } else {
    payments[tenantId].pauschal.push({ zeitraum, bezahlt, offen });
  }

  // Speichern der aktualisierten Daten
  await writeFile(PaymentsFile, payments);
}


// Pauschale Mieterdaten speichern
async function addFixedTermTenant(tenantId, auszugsdatum, gesamtbetrag) {
  const fixedTermTenants = await readFile(FixedTermFile);

  fixedTermTenants[tenantId] = {
    auszugsdatum: new Date(auszugsdatum).toISOString(),
    gesamtbetrag: parseFloat(gesamtbetrag),
  };

  await writeFile(FixedTermFile, fixedTermTenants);
}

// Mieter löschen
async function deleteTenant(id) {
  const tenants = await readFile(MieterFile);
  const updatedTenants = tenants.filter((tenant) => tenant.mieter_id !== id);
  await writeFile(MieterFile, updatedTenants);

  // Entferne aus spezifischen Dateien
  await deleteFromSpecificFile(id, MonthlyFile);
  await deleteFromSpecificFile(id, FixedTermFile);
}

// Daten aus spezifischen Dateien löschen
async function deleteFromSpecificFile(tenantId, filePath) {
  const data = await readFile(filePath);
  if (data[tenantId]) {
    delete data[tenantId];
    await writeFile(filePath, data);
  }
}


module.exports = {
  getAllTenants,
  addTenant,
  deleteTenant,
  getPayments,
  updateMonthlyPayment,
  updateFixedTermPayment,
  getMonthlyTenants, 
  getFixedTermTenants,

};

