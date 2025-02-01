# Basis-Image
FROM node:16

# Arbeitsverzeichnis festlegen
WORKDIR /app

# Kopieren der Paketdatei
COPY package.json ./

# Installieren der Abhängigkeiten
RUN npm install
RUN npm install node-cron
RUN npm install nodemailer
RUN npm install express-session

# Kopieren des gesamten Projektverzeichnisses
COPY . .

# Exponieren des Ports
EXPOSE 3000

# Starten des Servers
CMD ["node", "server/server.js"]
