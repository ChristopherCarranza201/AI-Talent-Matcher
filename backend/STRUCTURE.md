# Estructura del Backend

## Estructura de Carpetas

```
backend/
├── .gitignore
└── app/
    ├── main.py                    # Punto de entrada principal de la aplicación FastAPI
    │
    ├── api/                       # Endpoints de la API
    │   ├── __init__.py           # Inicialización del módulo API
    │   ├── auth.py               # Endpoints de autenticación (signup por rol, login)
    │   ├── deps.py               # Dependencias de FastAPI (get_current_user, require_recruiter)
    │   ├── jobs.py               # Endpoints relacionados con trabajos
    │   ├── me.py                 # Endpoint para obtener información del usuario actual
    │   ├── applications.py       # Endpoints para gestionar aplicaciones a trabajos
    │   ├── candidate_profiles.py # Endpoints para gestionar perfiles de candidatos
    │   └── recruiter_profiles.py # Endpoints para gestionar perfiles de reclutadores
    │
    ├── core/                      # Configuración y utilidades centrales
    │   ├── config.py             # Configuración de la aplicación (Settings, variables de entorno)
    │   └── security.py           # Utilidades de seguridad
    │
    ├── db/                        # Conexión y utilidades de base de datos
    │   ├── __init__.py           # Inicialización del módulo DB
    │   └── supabase.py           # Cliente de Supabase y configuración de conexión
    │
    ├── schemas/                   # Esquemas Pydantic para validación de datos
    │   ├── __init__.py           # Inicialización del módulo Schemas
    │   ├── application.py        # Esquemas relacionados con aplicaciones
    │   ├── auth.py               # Esquemas de autenticación (Signup por rol, LoginRequest, AuthResponse)
    │   ├── job.py                # Esquemas relacionados con trabajos
    │   ├── profile_updates.py    # Esquemas para actualizar perfiles (candidatos y reclutadores)
    │   └── candidate_profiles.py # Esquemas para perfiles de candidatos (legacy)
    │
    └── services/                  # Lógica de negocio
        └── auth_service.py       # Servicios de autenticación (signup_user, login_user)
```

## Descripción de Componentes

### `/app/main.py`
- Punto de entrada principal de la aplicación FastAPI
- Configuración de la aplicación y registro de routers
- Routers incluidos: `auth`, `me`, `jobs`, `applications`, `candidate_profiles`, `recruiter_profiles`

### `/app/api/`
Contiene todos los endpoints de la API REST:

- **`auth.py`**: Endpoints de autenticación con registro específico por rol
  - `POST /auth/signup/candidate` - Registro de nuevos candidatos
  - `POST /auth/signup/recruiter` - Registro de nuevos reclutadores
  - `POST /auth/login` - Inicio de sesión (común para ambos roles)

- **`deps.py`**: Dependencias reutilizables de FastAPI
  - `get_current_user()` - Obtiene el usuario actual desde el token JWT
  - `require_recruiter()` - Valida que el usuario tenga rol de reclutador

- **`jobs.py`**: Endpoints relacionados con trabajos
  - `POST /jobs` - Crear un nuevo trabajo (requiere rol recruiter)
  - `GET /jobs` - Listar todos los trabajos disponibles

- **`me.py`**: Endpoint para obtener información del usuario autenticado
  - `GET /me` - Obtener información del perfil del usuario actual

- **`applications.py`**: Endpoints para gestionar aplicaciones a trabajos
  - `POST /applications` - Crear una nueva aplicación a un trabajo (candidatos)
  - `GET /applications/me` - Obtener todas las aplicaciones del candidato autenticado
  - `PATCH /applications/{application_id}/withdraw` - Retirar una aplicación

- **`candidate_profiles.py`**: Endpoints para gestionar perfiles de candidatos
  - `PATCH /candidate-profiles/me` - Actualizar perfil del candidato autenticado
  - La creación del perfil se realiza automáticamente durante el signup

- **`recruiter_profiles.py`**: Endpoints para gestionar perfiles de reclutadores
  - `PATCH /recruiter-profiles/me` - Actualizar perfil del reclutador autenticado
  - La creación del perfil se realiza automáticamente durante el signup

### `/app/core/`
Configuración y utilidades centrales:

- **`config.py`**: 
  - Carga variables de entorno
  - Clase `Settings` con configuración de Supabase
  - Variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`

- **`security.py`**: Utilidades de seguridad (actualmente vacío)

### `/app/db/`
Conexión con la base de datos:

- **`supabase.py`**: 
  - Cliente de Supabase configurado con patrón singleton
  - Función `get_supabase()` para inyección de dependencias con FastAPI
  - Variable `supabase` para compatibilidad hacia atrás
  - Usa las credenciales de `config.py`

### `/app/schemas/`
Esquemas Pydantic para validación y serialización:

- **`auth.py`**: 
  - `CandidateSignupRequest` - Datos de registro para candidatos
  - `RecruiterSignupRequest` - Datos de registro para reclutadores
  - `LoginRequest` - Datos de inicio de sesión (común)
  - `AuthResponse` - Respuesta de autenticación con token

- **`profile_updates.py`**: Esquemas para actualizar perfiles
  - `CandidateProfileUpdateRequest` - Campos actualizables del perfil de candidato (location, last_upload_file)
  - `RecruiterProfileUpdateRequest` - Campos actualizables del perfil de reclutador (company_name, company_size)

- **`application.py`**: Esquemas para aplicaciones a trabajos
  - `ApplicationCreate` - Datos para crear una aplicación
  - `ApplicationOut` - Respuesta con información de la aplicación

- **`job.py`**: Esquemas para trabajos

- **`candidate_profiles.py`**: Esquemas para perfiles de candidatos
  - `CandidateProfileCreate` - Datos para crear/actualizar perfil de candidato

### `/app/services/`
Lógica de negocio separada de los endpoints:

- **`auth_service.py`**: 
  - `signup_candidate()` - Lógica de registro de candidatos (crea usuario, perfil y candidate_profile)
  - `signup_recruiter()` - Lógica de registro de reclutadores (crea usuario, perfil y recruiter_profile)
  - `login_user()` - Lógica de inicio de sesión (común para ambos roles)

## Flujo de Autenticación

1. **Registro de Candidato (`/auth/signup/candidate`)**:
   - `auth.py` → `auth_service.signup_candidate()`
   - Crea usuario en Supabase Auth
   - Crea perfil en tabla `profiles` con rol "candidate"
   - Crea entrada en `candidate_profiles` vinculada al perfil

2. **Registro de Reclutador (`/auth/signup/recruiter`)**:
   - `auth.py` → `auth_service.signup_recruiter()`
   - Crea usuario en Supabase Auth
   - Crea perfil en tabla `profiles` con rol "recruiter"
   - Crea entrada en `recruiter_profiles` vinculada al perfil

3. **Login (`/auth/login`)**:
   - `auth.py` → `auth_service.login_user()`
   - Autentica con Supabase Auth (común para ambos roles)
   - Retorna token de acceso

4. **Protección de Endpoints**:
   - Usa `get_current_user()` como dependencia
   - Valida token JWT
   - Obtiene perfil del usuario desde la BD

## Arquitectura y Patrones

### Separación de Identidades
- **Auth Identity (`user_id`)**: UUID del usuario en Supabase Auth
- **Domain Entity (`candidate_profile_id`)**: ID del perfil de candidato en la tabla `candidate_profiles`
- Las aplicaciones siempre se vinculan al `candidate_profile_id`, no directamente al `user_id`
- Esto permite una mejor separación entre autenticación y dominio del negocio

### Inyección de Dependencias
- `get_supabase()`: Función de dependencia para obtener el cliente Supabase
- `get_current_user()`: Dependencia para obtener el usuario autenticado desde el token JWT
- `require_recruiter()`: Dependencia para validar que el usuario tenga rol de reclutador

### Flujo de Aplicaciones
1. **Crear Aplicación (`POST /applications`)**:
   - Resuelve el `candidate_profile_id` desde el `user_id` autenticado
   - Crea la aplicación vinculada al perfil de candidato
   - Previene el uso directo de `user_id` como clave foránea de dominio

2. **Obtener Mis Aplicaciones (`GET /applications/me`)**:
   - Resuelve el perfil del candidato autenticado
   - Retorna todas las aplicaciones asociadas a ese perfil

3. **Retirar Aplicación (`PATCH /applications/{id}/withdraw`)**:
   - Valida que la aplicación pertenezca al candidato autenticado
   - Actualiza el estado de la aplicación

### Gestión de Perfiles

1. **Actualizar Perfil de Candidato (`PATCH /candidate-profiles/me`)**:
   - Solo permite actualizar campos específicos (location, last_upload_file)
   - La creación del perfil se realiza únicamente durante el signup
   - Ownership garantizado por `user_id` y políticas RLS

2. **Actualizar Perfil de Reclutador (`PATCH /recruiter-profiles/me`)**:
   - Solo permite actualizar campos específicos (company_name, company_size)
   - La creación del perfil se realiza únicamente durante el signup
   - Ownership garantizado por `user_id` y políticas RLS

## Notas

- Los archivos `__pycache__/` son generados automáticamente por Python y están ignorados en `.gitignore`
- Los archivos `__init__.py` están presentes en los módulos `api`, `db`, y `schemas` para hacerlos paquetes Python
- La aplicación usa FastAPI como framework web
- Supabase se usa tanto para autenticación como para base de datos
- Los esquemas Pydantic proporcionan validación automática de datos
- El cliente Supabase usa un patrón singleton para evitar múltiples conexiones

