FROM node:14.21.3

WORKDIR '/app'
COPY ./package*.json ./
RUN npm install
COPY . .

# Run Sequelize migrations
#RUN npx sequelize-cli db:migrate

ENV PORT 8080
EXPOSE 8080
CMD ["npm", "run", "start"]
