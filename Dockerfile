FROM node:22-slim

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Install Chromium for Puppeteer
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    chromium-sandbox \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY ./package*.json ./
RUN npm install
COPY . .

# Uncomment if you want to run migrations during build
# RUN npx sequelize-cli db:migrate

ENV PORT 8080
EXPOSE 8080
CMD ["npm", "run", "start"]