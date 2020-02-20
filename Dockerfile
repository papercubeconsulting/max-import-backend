FROM node:9.4.0-alpine

WORKDIR /usr/app/server/
COPY server/package*.json ./
RUN npm install -qy
COPY server/ ./

ENV PORT 8080

EXPOSE 8080
CMD ["npm", "run", "start"]