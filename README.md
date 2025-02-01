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


### **3️⃣ Konfigurationsdateien anpassen**  

Erstelle eine .env Datei im Hauptverzeichnis und füge folgende Konfiguration ein:
```bash
# Server-Konfiguration
PORT=3000

# Datenbank / JSON-Dateipfade
DATA_DIR=/app/data

# SMTP Konfiguration für E-Mail-Versand
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=dein.email@gmail.com
SMTP_PASS=dein-app-passwort

# Session Secret für Authentifizierung
SESSION_SECRET=geheimer_schlüssel
```

