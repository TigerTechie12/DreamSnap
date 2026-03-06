import swaggerAutogen from 'swagger-autogen'

const swagger = swaggerAutogen({ openapi: '3.0.0' })

const doc = {
  info: {
    title: 'DreamSnap API',
    description: 'Auto-generated API documentation for DreamSnap.',
    version: '1.0.0',
  },
  servers: [
    {
      url: 'http://localhost:8080',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your Clerk JWT token',
      },
    },
  },
}

const outputFile = './src/swagger-output.json'
const endpointsFiles = ['./src/index.ts']

swagger(outputFile, endpointsFiles, doc)
