# 📌 **Mieter- und Zahlungsmanagementsystem**  
Ein webbasiertes System zur Verwaltung von Mietern, Zahlungen und Mietverträgen mit Authentifizierung über E-Mail-Codes.

---

## 🚀 **Installation & Setup**  

### **1️⃣ Voraussetzungen**  
Stelle sicher, dass folgende Programme installiert sind:
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

---

## 🛠 **Schritt-für-Schritt Anleitung zur Einrichtung**  

### **2️⃣ Projekt klonen**  

```bash
git clone https://github.com/jowansulaiman/MVS.git
cd MVS
```

### **3️⃣Docker Container starten**  

Erstelle eine .env Datei im Hauptverzeichnis und füge folgende Konfiguration ein:
```bash
docker-compose up --build -d

```

# **✅ Erklärung:**  

    * --build stellt sicher, dass das Image neu gebaut wird.
    * -d startet die Container im Hintergrund.
Falls du die Logs sehen möchtest, lasse das -d weg:
```bash
docker-compose up --build

```

### **4️⃣ Überprüfen, ob der Server läuft**  

Öffne deinen Browser und rufe folgende URL auf:

```bash
http://localhost:3000
```
Der Server sollte laufen, und du solltest die Login-Seite sehen.



