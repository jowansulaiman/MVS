const fs = require("fs").promises;

// Datei lesen
async function readFile(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Fehler beim Lesen der Datei: ${filePath}`, error);
    throw new Error("Dateifehler");
  }
}

// Datei schreiben
async function writeFile(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Fehler beim Schreiben der Datei: ${filePath}`, error);
    throw new Error("Dateifehler");
  }
}

module.exports = { readFile, writeFile };
