# Image Node légère
FROM node:20-alpine

# Dossier de travail dans le conteneur
WORKDIR /app

# Installer les dépendances
COPY package*.json ./
RUN npm install --only=production

# Copier le reste du code (examples + SDK)
COPY . .

# Variables par défaut (overridables via docker run -e ...)
ENV PORT=4000

# Exposer le port de l'API
EXPOSE 4000

# Commande de démarrage : API PXP-102 mainnet status
CMD ["node", "examples/identity-pass-mainnet-status-api.example.mjs"]

