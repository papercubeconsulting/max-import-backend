FROM node:14.21.3

RUN apt-get update && \
    apt-get install -y libx11-xcb1 libxcomposite1 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR '/app'
COPY ./package*.json ./
RUN npm install
COPY . .

# Run Sequelize migrations
#RUN npx sequelize-cli db:migrate

ENV PORT 8080
EXPOSE 8080
CMD ["npm", "run", "start"]