# Final Backend Melere — Coderhouse

Proyecto backend de adopción de mascotas, desarrollado para la entrega final del curso Coderhouse Backend.  
Incluye:
- Base de datos MongoDB
- API REST documentada con Swagger/OpenAPI
- Tests automáticos funcionales
- Despliegue y ejecución vía Docker y Docker Hub

---

## 🐶 Descripción

API RESTful para gestión de usuarios, adopciones y mascotas.  
Dockerizado y listo para correr en cualquier máquina sin dependencias extra.

---

## 🚀 Quick Start — Imagen Docker **100% lista para probar**

**No necesitas crear usuarios de Mongo, claves, ni configurar variables manualmente para pruebas. ¡Listo para usar!**

### Ejecuta el backend directamente con Docker Hub:

```bash
docker pull meleree/final-backend-melere:latest
docker run -p 8080:8080 meleree/final-backend-melere:latest
```

- Acceso: [http://localhost:8080](http://localhost:8080)
- Documentación Swagger: [http://localhost:8080/api-docs](http://localhost:8080/api-docs)

---

### 🐳 Variables y configuración

Para **uso en Docker** (con la imagen pública):
- **NO necesitas crear ningún usuario, clave ni variable de entorno adicional**.  
- La aplicación se conecta automáticamente a una base MongoDB local (o puedes enlazarla vía docker-compose).
- Por defecto, si no se pasa ninguna variable, usa `mongodb://mongodb:27017/Melere` (configuración interna del Docker Compose).

Para **desarrollo local o custom**:
- Crea un archivo `.env` en la raíz del proyecto usando como guía el archivo `.env.example`.
- Variables principales:
  - `MONGODB_URI`: URI de tu conexión MongoDB (ejemplo para docker-compose: `mongodb://mongodb:27017/Melere`)
  - `SESSION_SECRET` y `JWT_SECRET`: Para sesiones y autenticación (pon cualquier valor seguro si solo es para desarrollo).
  - `PORT`: Puerto a exponer (por defecto, 8080).

---

## 📋 Documentación Swagger

Disponible automáticamente mientras el backend está corriendo:

- [http://localhost:8080/api-docs](http://localhost:8080/api-docs)

Incluye esquemas, endpoints principales y ejemplos de uso.

---

## 🧪 Tests Funcionales

Automatizados con Jest y Supertest para todos los endpoints de adopción:

- Crear adopción (POST /api/adoption)
- Listar adopciones (GET /api/adoption)
- Obtener por ID (GET /api/adoption/:id)
- Actualizar (PUT /api/adoption/:id)
- Borrar (DELETE /api/adoption/:id)
- Casos 404 y errores

**Correr los tests en el contenedor**:

```bash
docker-compose run --rm app npm test
```

---

## ⚙️ Manual de uso y desarrollo local

1. Clona el repositorio:
    ```bash
    git clone https://github.com/meleree/final-backend-melere.git
    cd final-backend-melere
    ```
2. Instala dependencias:
    ```bash
    npm install
    ```
3. Crea un archivo `.env` según tu configuración (ver `.env.example`).
4. Levanta MongoDB y backend con Docker Compose:
    ```bash
    docker-compose up --build
    ```
5. Accede a la API en [http://localhost:8080](http://localhost:8080)

---

## 🐳 Composición Docker

- `Dockerfile` para backend Node.js + Express
- `docker-compose.yml` para backend y MongoDB listo para pruebas
- Imagen publicada:
  - Docker Hub: [https://hub.docker.com/r/meleree/final-backend-melere](https://hub.docker.com/r/meleree/final-backend-melere)
  - Tag: `latest`
  - Digest: `sha256:1cc39fb2e…`

- **Sin requisitos de usuarios, claves o variables externos para las pruebas básicas**

---

## 📝 Checklist de entrega Coderhouse

- [x] Dockerfile funcional y probado
- [x] Imagen pública en Docker Hub
- [x] README claro, link Docker Hub, sin datos sensibles
- [x] Tests funcionales (Jest/Supertest) en endpoints adopción
- [x] Documentación Swagger `/api-docs`
- [x] Dockerizable y ejecutable en cualquier máquina

---

## 💌 Autor

Meleree  
[https://github.com/meleree](https://github.com/meleree)

---

## 🆘 Contacto y dudas

Para cualquier inconveniente, error, o ayuda adicional, contactarme por GitHub Issues o por mail.

---

**¡Listo para probar y entregar!  
Ningún usuario, clave o secreto externo requerido para correr tu backend en modo pruebas.**