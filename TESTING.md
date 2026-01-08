# Guía de Pruebas - Integración Frontend con FastAPI

## Prerequisitos

### 1. Backend FastAPI configurado

Asegúrate de tener configurado el backend con Supabase:

**Backend necesita estas variables de entorno** (crea `backend/.env`):
```env
SUPABASE_URL=tu_url_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
SUPABASE_JWT_SECRET=tu_jwt_secret
```

### 2. Frontend configurado

**Frontend necesita esta variable de entorno** (crea `frontend/.env`):
```env
VITE_API_URL=http://localhost:8000
```

Si no creas el `.env`, usará el valor por defecto `http://localhost:8000`.

## Pasos para Probar

### Paso 1: Iniciar el Backend FastAPI

Abre una terminal en la raíz del proyecto:

```bash
# Navegar a la carpeta backend
cd backend

# Instalar dependencias (si no lo has hecho)
pip install -r ../requirements.txt

# Iniciar el servidor FastAPI
uvicorn app.main:app --reload --port 8000
```

Deberías ver algo como:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Application startup complete.
```

### Paso 2: Iniciar el Frontend

Abre **otra terminal** (mantén la del backend corriendo):

```bash
# Navegar a la carpeta frontend
cd frontend

# Instalar dependencias (si no lo has hecho)
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

Deberías ver algo como:
```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:8080/
➜  Network: use --host to expose
```

### Paso 3: Probar la Aplicación

Abre tu navegador en: **http://localhost:8080**

## Pruebas a Realizar

### 1. Prueba de Registro (Recruiter)

1. Ve a `http://localhost:8080/register`
2. Selecciona el tab **"Recruiter"**
3. Completa el formulario:
   - Full Name: `John Recruiter`
   - Company Name: `Tech Corp` (requerido para recruiter)
   - Email: `recruiter@test.com`
   - Password: `password123`
   - Company Size (opcional): `50-200`
   - Phone (opcional): `+1234567890`
4. Haz clic en **"Create Account"**

**Resultado esperado:**
- Debe crear la cuenta exitosamente
- Debe redirigir automáticamente a `/recruiter`
- Debe mostrar el dashboard del recruiter

### 2. Prueba de Registro (Candidate)

1. Ve a `http://localhost:8080/register`
2. Selecciona el tab **"Candidate"**
3. Completa el formulario:
   - Full Name: `Jane Candidate`
   - Email: `candidate@test.com`
   - Password: `password123`
   - Location (opcional): `New York, USA`
   - Phone (opcional): `+1234567890`
4. Haz clic en **"Create Account"**

**Resultado esperado:**
- Debe crear la cuenta exitosamente
- Debe redirigir automáticamente a `/candidate`
- Debe mostrar el dashboard del candidate

### 3. Prueba de Login

1. Ve a `http://localhost:8080/login`
2. Ingresa las credenciales:
   - Email: `recruiter@test.com` (o `candidate@test.com`)
   - Password: `password123`
3. Haz clic en **"Sign In"**

**Resultado esperado:**
- Debe iniciar sesión exitosamente
- Debe redirigir según el rol del usuario:
  - Recruiter → `/recruiter`
  - Candidate → `/candidate`
- El token JWT debe guardarse en localStorage

### 4. Prueba de Protección de Rutas

1. **Sin estar autenticado:**
   - Intenta acceder directamente a `http://localhost:8080/recruiter`
   - **Resultado esperado:** Debe redirigir a `/login`

2. **Autenticado como Recruiter:**
   - Después de login, intenta acceder a `http://localhost:8080/candidate`
   - **Resultado esperado:** Debe redirigir a `/recruiter` (su dashboard)

3. **Autenticado como Candidate:**
   - Después de login, intenta acceder a `http://localhost:8080/recruiter`
   - **Resultado esperado:** Debe redirigir a `/candidate` (su dashboard)

### 5. Prueba de Token JWT

1. Abre las **DevTools del navegador** (F12)
2. Ve a la pestaña **Application** > **Local Storage** > `http://localhost:8080`
3. Busca la clave `auth_token`
4. **Resultado esperado:** Debe existir y contener un token JWT

### 6. Prueba de Logout

1. Desde cualquier página autenticada, busca un botón de logout (si existe)
2. O desde DevTools: `localStorage.removeItem('auth_token')`
3. Recarga la página
4. **Resultado esperado:** Debe redirigir a `/login`

### 7. Prueba de Peticiones API

Abre **DevTools** > **Network**:

1. Al hacer login, busca la petición a `/auth/login`
   - **Status:** `200 OK`
   - **Response:** Debe contener `access_token` y `token_type`

2. Al acceder al dashboard, busca la petición a `/me`
   - **Headers:** Debe incluir `Authorization: Bearer <token>`
   - **Status:** `200 OK`
   - **Response:** Debe contener el perfil del usuario con su rol

## Verificación en la Consola

### Verificar que el Frontend está conectado

1. Abre **DevTools** (F12)
2. Ve a la pestaña **Console**
3. Busca errores relacionados con:
   - `CORS` (Cross-Origin Resource Sharing)
   - `Network Error`
   - `401 Unauthorized`

Si ves errores de CORS, necesitas configurar CORS en FastAPI.

### Verificar el Backend

En la terminal del backend, deberías ver logs de las peticiones:
```
INFO:     127.0.0.1:xxxxx - "POST /auth/login HTTP/1.1" 200 OK
INFO:     127.0.0.1:xxxxx - "GET /me HTTP/1.1" 200 OK
```

## Solución de Problemas

### Error: "Network Error" o CORS

Si ves errores de CORS, agrega esto a `backend/app/main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AI Talent Matcher API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
# ... resto de routers
```

### Error: "401 Unauthorized"

- Verifica que el token JWT esté siendo enviado en los headers
- Verifica que el token no haya expirado
- Verifica que las credenciales de Supabase en el backend sean correctas

### Error: "Failed to create account"

- Verifica que Supabase esté configurado correctamente
- Verifica que las variables de entorno del backend sean correctas
- Revisa los logs del backend para ver el error específico

## Endpoints Disponibles para Probar

Puedes probar los endpoints directamente usando:
- **Postman**
- **curl**
- **Thunder Client** (VS Code extension)
- **Swagger UI** en `http://localhost:8000/docs` (si FastAPI tiene docs habilitados)

### Ejemplo con curl:

```bash
# Login
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "recruiter@test.com", "password": "password123"}'

# Obtener perfil (requiere token)
curl -X GET "http://localhost:8000/me" \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

## Próximos Pasos

Una vez que las pruebas básicas funcionen, puedes probar:
- Crear vacantes de trabajo (recruiter)
- Aplicar a trabajos (candidate)
- Ver aplicaciones
- Actualizar perfiles
- Etc.

