/* eslint-disable func-names */
const path = require('path');
const winston = require('winston');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJudWV2b0Bjb3JyZW8uY29tIiwicm9sZSI6InN1cGVydXNlciIsImlhdCI6MTU5MjQ2NDk4MH0.sdht1-6bMBlSTXz4cSDq_K3lYvTOPvqgeCciQyL-Rg4';

// -- setup up swagger-jsdoc --
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Max Import ERP API',
    version: '1.0.0',
    description: `API desarrollada por el equipo de [PaperCube](http://papercube.pe) para la implementación del ERP de la empresa Max Import.\n${token}`,
    license: {
      name: 'MIT',
      url: 'https://choosealicense.com/licenses/mit/',
    },
    contact: {
      email: 'soluciones@papercube.pe',
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Local server',
    },
    {
      url: 'http://maximport-backend.q3d2pmiqsz.us-east-1.elasticbeanstalk.com',
      description: 'Development server',
    },
  ],
  tags: [
    { name: 'sales.proforma' },
    { name: 'management.banks' },
    { name: 'management.clients' },
    { name: 'management.deliveryAgency' },
    { name: 'management.geography' },
  ],
};

const options = {
  swaggerDefinition,
  apis: [path.join(__dirname, '../api/**/*.yml')],
};
const swaggerSpec = swaggerJSDoc(options);

module.exports = app => {
  app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  app.use(
    '/apiDocs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
    }),
  );

  winston.info('4/6 Documentation setted up');
};
