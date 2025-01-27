
const express = require("express");
const router = express.Router();

const path = require("path");
const { readFile, writeFile } = require("../models/fileOperations");

const ContractsFile = path.join(__dirname, "../../data/contracts.json");

// Route: Alle Mietverträge abrufen
router.get("/", async (req, res) => {
  try {
    const contracts = await readFile(ContractsFile);
    res.json(contracts);
  } catch (error) {
    console.error("Fehler beim Abrufen der Mietverträge:", error);
    res.status(500).send("Interner Serverfehler.");
  }
});

// Route: Mietvertrag erstellen
router.post("/create", async (req, res) => {
  try {
    const { tenantId, anzahl, nebenkosten, heizung } = req.body;
    const contracts = await readFile(ContractsFile);

    // Füge den neuen Vertrag hinzu
    const newContract = {
      id: `contract_${Date.now()}`,
      tenantId,
      anzahl,
      nebenkosten,
      heizung,
      erstelltAm: new Date().toISOString(),
    };

    contracts.push(newContract);
    await writeFile(ContractsFile, contracts);

    res.status(201).json({ message: "Mietvertrag erfolgreich erstellt.", contract: newContract });
  } catch (error) {
    console.error("Fehler beim Erstellen des Mietvertrags:", error);
    res.status(500).send("Interner Serverfehler.");
  }
});

module.exports = router;


router.post("/vertrag", async (req, res) => {
    const { tenantId, roomCount, additionalCosts, heatingCosts } = req.body;
  
    if (!tenantId || isNaN(roomCount) || isNaN(additionalCosts) || isNaN(heatingCosts)) {
      return res.status(400).json({ message: "Ungültige Eingabedaten." });
    }
  
    // Mietvertrag generieren und speichern (z. B. in einer Datei oder Datenbank)
    // Hier: Nur als Dummy-Beispiel
    const contract = {
      tenantId,
      roomCount,
      additionalCosts,
      heatingCosts,
      createdAt: new Date(),
    };
  
    console.log("Mietvertrag erstellt:", contract);
  
    res.status(201).json({ message: "Mietvertrag erfolgreich erstellt.", contract });
  });
  
  

module.exports = router;
  