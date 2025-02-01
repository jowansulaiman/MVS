# 📌 **Mieter- und Zahlungsmanagementsystem**  
Ein webbasiertes System zur Verwaltung von Mietern, Zahlungen und Mietverträgen mit Authentifizierung über E-Mail-Codes.

---
### **⚠ Bekannte Probleme & Einschränkungen**  
❗ Login-System
    - Der Login funktioniert technisch, ist aber noch nicht in das System integriert.
    - Nutzer müssen sich aktuell nicht anmelden, um auf die Seite zuzugreifen.
❌ Vertragsbereich funktioniert nicht
    - Der Vertragsbereich in der UI ist nicht funktionsfähig.
    - Versuche, einen Mietvertrag zu erstellen, schlagen fehl.

## 🚀 **Installation & Setup**  

### **1️⃣ Voraussetzungen**  
Stelle sicher, dass folgende Programme installiert sind:
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

---

## 🛠 **Anleitung zur Einrichtung**  

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

###### **✅ Erklärung:**  

    - --build stellt sicher, dass das Image neu gebaut wird.
    - -d startet die Container im Hintergrund.
Falls du die Logs sehen möchtest, lasse das -d weg:
```bash
docker-compose up --build
```
Container stoppen:

```bash
docker-compose down
```

### **4️⃣ Überprüfen, ob der Server läuft**  

Öffne deinen Browser und rufe folgende URL auf:

```bash
http://localhost:3000
```
Der Server sollte laufen, und du solltest die Seiten sehen.



