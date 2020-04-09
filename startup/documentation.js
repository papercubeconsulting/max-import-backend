/* eslint-disable func-names */
const path = require('path');
const winston = require('winston');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// -- setup up swagger-jsdoc --
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Max Import ERP API',
    version: '1.0.0',
    description:
      'API desarrollada por el equipo de [PaperCube](http://papercube.pe) para la implementación del ERP de la empresa Max Import.',
    license: {
      name: 'MIT',
      url: 'https://choosealicense.com/licenses/mit/',
    },
    contact: {
      email: 'soluciones@papercube.pe',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local server',
    },
    {
      url: 'http://maximport-backend.q3d2pmiqsz.us-east-1.elasticbeanstalk.com',
      description: 'Development server',
    },
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
