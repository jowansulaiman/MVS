const express = require("express");
const router = express.Router();
const path = require("path");
const { readFile } = require("../models/fileOperations");

const MieterFile = path.join(__dirname, "../../data/mieter.json");

// Alle Mieter abrufen
router.get("/", async (req, res) => {
  try {
    const tenants = await readFile(MieterFile);
    res.json(tenants);
  } catch (error) {
    console.error("Fehler beim Abrufen der Mieter:", error);
    res.status(500).send("Fehler beim Abrufen der Daten.");
  }
});

module.exports = router;
