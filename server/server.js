const express = require("express");
const path = require("path");
const cron = require("node-cron"); // Für die Planung wiederkehrender Aufgaben
const { checkPaymentDueDates } = require("./models/tenantModel"); // Funktion zur Zahlungsprüfung importieren


const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// Importiere Routen
const tenantRoutes = require("./routes/tenants");
const paymentsRoutes = require("./routes/payments");
const mieterRoutes = require("./routes/mieter");
const berichteRoutes = require("./routes/bericht");
const contractsRoutes = require("./routes/contract");
const authRoutes = require("./routes/auth");
const session = require("express-session");

app.use(session({
  secret: "lvno auit qplz knye", // Ändere dies zu einem sicheren Schlüssel
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Setze auf `true`, wenn du HTTPS verwendest
}));

// Routenregistrierung
app.use("/api/mieter", mieterRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/mieter", tenantRoutes);
app.use("/api/berichte", berichteRoutes);
app.use("/api/contracts", contractsRoutes);
app.use("/api/auth", authRoutes);


// Cron-Job: Jeden Monat am 1. Tag um Mitternacht ausführen
cron.schedule("0 0 * * *", async () => {
  console.log("Cron-Job gestartet: Fällige Zahlungen prüfen...");
  try {
    await checkPaymentDueDates(); // Prüfen und aktualisieren
    console.log("Fällige Zahlungen erfolgreich aktualisiert.");
  } catch (error) {
    console.error("Fehler beim Cron-Job:", error.message);
  }
});

// Server starten
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});


