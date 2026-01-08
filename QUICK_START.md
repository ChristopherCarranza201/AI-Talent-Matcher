# 🚀 Inicio Rápido - Probar la Integración Frontend ↔ FastAPI

## ⚡ Pasos Rápidos

### 1️⃣ Configurar Variables de Entorno

**Backend** (`backend/.env`):
```env
SUPABASE_URL=tu_url_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
SUPABASE_JWT_SECRET=tu_jwt_secret
```

**Frontend** (`frontend/.env` - OPCIONAL):
```env
VITE_API_URL=http://localhost:8000
```
*Nota: Si no creas este archivo, usará el valor por defecto*

### 2️⃣ Iniciar Backend (Terminal 1)

```bash
cd backend
pip install -r ../requirements.txt
uvicorn app.main:app --reload --port 8000
```

✅ Deberías ver: `Uvicorn running on http://127.0.0.1:8000`

### 3️⃣ Iniciar Frontend (Terminal 2)

```bash
cd frontend
npm install
npm run dev
```

✅ Deberías ver: `Local: http://localhost:8080/`

### 4️⃣ Abrir en Navegador

🌐 Ve a: **http://localhost:8080**

## 🧪 Pruebas Rápidas

### Prueba 1: Registro de Recruiter
1. Ve a `/register`
2. Selecciona tab "Recruiter"
3. Completa: Name, Company Name, Email, Password
4. Haz clic en "Create Account"
5. ✅ Debe redirigir a `/recruiter`

### Prueba 2: Login
1. Ve a `/login`
2. Ingresa email y password del usuario creado
3. Haz clic en "Sign In"
4. ✅ Debe redirigir según el rol del usuario

### Prueba 3: Protección de Rutas
1. **Sin login**, intenta acceder a `/recruiter`
2. ✅ Debe redirigir a `/login`

### Prueba 4: Token JWT
1. Abre **DevTools** (F12) > **Application** > **Local Storage**
2. Busca la clave `auth_token`
3. ✅ Debe existir con un token JWT

### Prueba 5: Peticiones API
1. Abre **DevTools** > **Network**
2. Haz login
3. Busca la petición `/auth/login`
4. ✅ Debe responder con `access_token`

## 🐛 Problemas Comunes

### Error de CORS
✅ **Ya está solucionado** - Se agregó CORS middleware al backend

### Error 401 Unauthorized
- Verifica que el token esté en localStorage
- Verifica las credenciales de Supabase en el backend

### Error de Conexión
- Verifica que el backend esté corriendo en `http://localhost:8000`
- Verifica que el frontend esté usando la URL correcta

## 📊 Verificar Logs

**Backend** (Terminal 1):
```
INFO: "POST /auth/login HTTP/1.1" 200 OK
INFO: "GET /me HTTP/1.1" 200 OK
```

**Frontend** (Terminal 2):
```
No errors should appear in the console
```

## ✨ ¡Listo!

Si todas las pruebas pasan, la integración está funcionando correctamente.

Para más detalles, revisa `TESTING.md`

