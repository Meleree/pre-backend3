# Final Backend Meleree

Este proyecto es la entrega N°1 del curso Backend Coderhouse. Está basado en Node.js, Express y MongoDB, siguiendo arquitectura modular y buenas prácticas, e incluye funcionalidades de mocking para pruebas automáticas de usuarios y mascotas.

---

## 🚀 **¿Qué incluye?**

- **Router `/api/mocks`:** Mocking de usuarios y mascotas.
- **Endpoints GET y POST para pruebas en la base de datos.**
- **Modelos User y Pet con persistencia en MongoDB**
- **Endpoints para consultar usuarios y mascotas.**
- **Autenticación básica, gestión de productos, carritos y sesiones.**
- **Integración con websockets para eventos.**
- **Motor de plantillas handlebars.**

---

## 🔑 **Variables de entorno (.env)**

Asegúrate de crear un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```
PORT=8080
MONGO_URI=mongodb://localhost:27017/tu_base_de_datos
EMAIL_USER=juanaantoniaarevalo@gmail.com
EMAIL_PASS=wxjlbcufgaqccvaq
FRONTEND_URL=http://localhost:8080
JWT_SECRET=UNA_CLAVE_NUEVA_Y_SIMPLE_123
SESSION_SECRET=UNA_CLAVE_NUEVA_Y_SIMPLE_123
```

**Explicación:**
- `PORT`: Puerto en el que corre la app.
- `MONGO_URI`: URI de tu base local de MongoDB (ajusta el nombre de base si quieres).
- `EMAIL_USER` y `EMAIL_PASS`: Credenciales SMTP para funcionalidades de email.
- `FRONTEND_URL`: URL de tu frontend local/test.
- `JWT_SECRET` y `SESSION_SECRET`: Claves secretas simples para JWT y sesiones.

---

## 🛠️ **Instalación rápida**

1. Instala las dependencias:
   ```bash
   npm install
   ```
2. Configura tu `.env` como se muestra arriba.
3. Levanta el servidor:
   ```bash
   npm run dev
   ```
   o
   ```bash
   nodemon src/app.js
   ```

---

## 🧪 **Endpoints de Mocking**

### **Usuarios Mock (no persistente):**
```
GET /api/mocks/mockingusers?num=N
```
Devuelve N usuarios mock (por default, 50). Password encriptada, rol alterno, pets vacíos.

### **Mascotas Mock (no persistente):**
```
GET /api/mocks/mockingpets?num=N
```
Devuelve N mascotas falsas para pruebas.

### **Insertar usuarios y mascotas en DB:**
```
POST /api/mocks/generateData
Content-Type: application/json
Body:
{
   "users": 10,
   "pets": 10
}
```
Inserta la cantidad indicada y responde con los objetos creados.

---

## 📚 **Consultar Base de Datos**

- **Usuarios:**  
  ```
  GET /api/users
  ```
- **Mascotas:**  
  ```
  GET /api/pets
  ```

---

## ✅ **Chequeo de Entrega N°1**

- Router mocks y endpoints funcionales e integrados.
- Mocking modular de usuarios y mascotas.
- Password encriptada, roles, array vacío pets.
- Generación e inserción masiva con comprobación vía endpoints de consulta.

---

## 🗂️ **Estructura de carpetas**

- `src/routes`: Routers Express (mocks, users, pets y otros)
- `src/dao/models`: Modelos de Mongoose (User, Pet)
- `src/utils`: Utilidades de mocking
- `src/views`: Plantillas handlebars
- `src/middlewares`, `src/services`, etc: Lógica adicional

---

## 🤝 **¿Dudas o mejoras?**

¡Puedes escribirme a [melisa.gis@gmail.com](mailto:melisa.gis@gmail.com) si necesitas ayuda para levantar el proyecto o probar su funcionamiento!

---

**¡Gracias por revisar la entrega!**