const express = require("express");
const router = express.Router();
const path = require("path");
const nodemailer = require("nodemailer");
const { readFile, writeFile } = require("../models/fileOperations");

const EmployeesFile = path.join(__dirname, "../../data/employees.json");
const AuthFile = path.join(__dirname, "../../data/auth.json");

// SMTP-Konfiguration
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "jowansulaiman@gmail.com",
      pass: "lvno auit qplz knye",
    },
  });
// E-Mail-Code senden
router.post("/send-code", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "E-Mail erforderlich." });
  }

  try {
    const data = await readFile(EmployeesFile); // Datei lesen
    const employees = data.employees; // Zugriff auf das "employees"-Array
    if (!Array.isArray(employees)) {
      throw new Error("Ungültige Struktur in employees.json: Erwartet ein Array unter dem Schlüssel 'employees'.");
    }

    if (!employees.includes(email)) {
      return res.status(403).json({ message: "E-Mail nicht autorisiert." });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-stelliger Code

    const authData = await readFile(AuthFile);
    authData[email] = { code, timestamp: Date.now() };
    await writeFile(AuthFile, authData);

    // Code per E-Mail senden
    await transporter.sendMail({
      from: "infos@gmail.com",
      to: email,
      subject: "Ihr Anmeldecode",
      text: `Ihr Code lautet: ${code}`,
    });

    res.status(200).json({ message: "Code gesendet." });
  } catch (error) {
    console.error("Fehler beim Senden des Codes:", error);
    res.status(500).json({ message: "Interner Serverfehler." });
  }
});

// Code-Verifizierung
// In /api/auth/verify-code
router.post("/verify-code", async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: "E-Mail und Code erforderlich." });
  }

  try {
    const authData = await readFile(AuthFile);
    const userData = authData[email];

    if (!userData || userData.code !== code) {
      return res.status(403).json({ message: "Ungültiger Code." });
    }

    // Ablaufprüfung (z. B. 10 Minuten)
    const expirationTime = 10 * 60 * 1000; // 10 Minuten
    if (Date.now() - userData.timestamp > expirationTime) {
      return res.status(403).json({ message: "Code abgelaufen." });
    }

    // Anmeldung erfolgreich
    req.session.user = { email }; // Benutzer in der Sitzung speichern
    res.status(200).json({ message: "Erfolgreich angemeldet." });
  } catch (error) {
    console.error("Fehler bei der Code-Verifizierung:", error);
    res.status(500).json({ message: "Interner Serverfehler." });
  }
});


// In /api/auth
router.get("/check-session", (req, res) => {
  if (req.session.user) {
    return res.status(200).json({ message: "Angemeldet", user: req.session.user });
  } else {
    return res.status(401).json({ message: "Nicht authentifiziert" });
  }
});


module.exports = router;
