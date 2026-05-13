FROM node:22-slim

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Fix for outdated Debian Buster repos
RUN sed -i 's|deb.debian.org|archive.debian.org|g' /etc/apt/sources.list && \
    sed -i '/security.debian.org/d' /etc/apt/sources.list && \
    apt-get update && apt-get install curl gnupg -y && \
    curl --location --silent https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list && \
    apt-get update && apt-get install google-chrome-stable -y --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY ./package*.json ./
RUN npm install
COPY . .

# Uncomment if you want to run migrations during build
# RUN npx sequelize-cli db:migrate

ENV PORT 8080
EXPOSE 8080
CMD ["npm", "run", "start"]