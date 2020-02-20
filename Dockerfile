FROM node:9.4.0-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install -qy
COPY . .

EXPOSE 8080
CMD ["npm", "run", "start"]


