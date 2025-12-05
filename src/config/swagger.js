import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Final Backend Melere API',
      version: '1.0.0',
      description: 'Documentación de API Users para Coderhouse',
    },
  },
  apis: ['src/swagger/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;