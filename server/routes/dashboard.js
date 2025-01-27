const express = require("express");
const router = express.Router();
const { readFile } = require("../utils/fileOperations");
const path = require("path");

const MieterFile = path.join(__dirname, "../../data/mieter.json");

// Route: Alle Mietverhältnisse abrufen
router.get("/all", async (req, res) => {
    try {
      const tenants = await readFile(MieterFile);
      console.log("Alle Mieter:", tenants); // Debugging
      res.json(tenants);
    } catch (error) {
      console.error("Fehler beim Abrufen aller Mieter:", error);
      res.status(500).send("Interner Serverfehler");
    }
  });
  

// Route: Vermietete Mietverhältnisse abrufen

router.get("/vermietet", async (req, res) => {
    try {
      const tenants = await readFile(MieterFile);
      const rented = tenants.filter((tenant) => tenant.status === "vermietet");
      res.json(rented);
    } catch (error) {
      console.error("Fehler beim Abrufen der vermieteten Mieter:", error);
      res.status(500).send("Interner Serverfehler");
    }
  });
// Route: Gekündigte Mietverhältnisse abrufen
router.get("/gekündigt", async (req, res) => {
  try {
    const tenants = await readFile(MieterFile);
    const terminated = tenants.filter((tenant) => tenant.status === "ausgezogen");
    res.json(terminated);
  } catch (error) {
    console.error("Fehler beim Abrufen der gekündigten Mieter:", error);
    res.status(500).send("Interner Serverfehler");
  }
});

// Route: Leerstehende Mietverhältnisse abrufen
router.get("/leerstehend", async (req, res) => {
  try {
    const tenants = await readFile(MieterFile);
    const empty = tenants.filter((tenant) => tenant.status === "leerstehend");
    res.json(empty);
  } catch (error) {
    console.error("Fehler beim Abrufen der leerstehenden Mieter:", error);
    res.status(500).send("Interner Serverfehler");
  }
});

// Route: Reservierte Mietverhältnisse abrufen
router.get("/reserviert", async (req, res) => {
  try {
    const tenants = await readFile(MieterFile);
    const reserved = tenants.filter((tenant) => tenant.status === "reserviert");
    res.json(reserved);
  } catch (error) {
    console.error("Fehler beim Abrufen der reservierten Mieter:", error);
    res.status(500).send("Interner Serverfehler");
  }
});

module.exports = router;
