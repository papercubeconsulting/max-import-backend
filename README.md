# Express Boilerplate

## Estructura de carpetas

### api

---

Carpetas de funcionalidades del api, ahí se debe guardar el código principal del proyecto.
Se recomienda dividir las funcionalidades en distintas componentes que se encarguen de un conjunto de tareas especificas, similar al principio de .

Por ejemplo: usuarios | blog | sales | marketing

Referencias que pueden ser de ayuda

https://stackoverflow.com/questions/18270898/django-best-practice-for-splitting-up-project-into-apps

https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/projectstructre/breakintcomponents.md

Adicionalmente se sugiere tener una carpeta middleware que común a todas las aplicaciones. En esta carpeta se tendrían los middlewares para authentication, authorization, errors, etc.

#### Sub carpetas para cada aplicación

La estructura recomendada para cada subcarpeta es

- models - esquemas para db
- controllers
- services - core de las funcionalidades, en caso los servicios de una entidad sean muchos se recomienda separarlos en archivos independientes
- validators - esquemas de validación para endpoints
- tests - pruebas automatizadas

Este esquema sigue la estructura sugerida por https://www.coreycleary.me/project-structure-for-an-express-rest-api-when-there-is-no-standard-way/

### bin

---

https://stackoverflow.com/questions/23169941/what-does-bin-www-do-in-express-4-x

### config

---

Se configuran las constantes según los entornos de desarrollo. Adicionalmente, en el archivo custom-environment-variables se definen aquellas constantes que provienen de variables de entorno.
Las variables de entorno son administradas en los archivos .env según el entorno de ejecución.

IMPORTANTE: Los archivos .env nunca deben ser incluidos en el repositorio, estos deben ser pedidos al dueño del repositorio y editados según corresponda.

https://medium.com/the-node-js-collection/making-your-node-js-work-everywhere-with-environment-variables-2da8cdf6e786

### routes

Se configura el router con los endpoints que expondrá el API. Estas rutas deben seguir los lineamientos para un API Restful

https://www.vinaysahni.com/best-practices-for-a-pragmatic-restful-api

### startup

Rutinas de inicialización

- config - Lectura de variables de entorno
- db - Conexión a la base de datos
- logging - Configuración de loggers usando winston https://itnext.io/setup-logger-for-node-express-app-9ef4e8f73dac
- prod - paquetes para el entorno de producción
- routes - Configuración del router principal de la aplicación y middlewares globales
- validation - Configuración de paquetes adicionales para validación

## TODO

- Incluir logica de autenticacion y autorizacion
- Incluir ejemplo de test funcionales
- Incluir ejemplo de documentacion con OpenAI/Swagger
