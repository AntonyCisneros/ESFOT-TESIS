# Sistema de Autenticación - Documentación

## Overview

Se ha implementado un sistema de autenticación completo integrado con Supabase Auth. Los usuarios deben autenticarse exitosamente antes de acceder a ver o registrar proyectos de tesis.

## Estructura de Archivos

### Capa Compartida (src/shared/)

**`api/authService.ts`**

- Servicio centralizado para operaciones de autenticación
- Métodos disponibles:
  - `signup(email, password)` - Registro de nuevos usuarios
  - `login(email, password)` - Inicio de sesión
  - `logout()` - Cerrar sesión
  - `getCurrentUser()` - Obtener usuario autenticado
  - `refreshSession()` - Refrescar sesión

**`context/AuthContext.tsx`**

- Contexto React que proporciona estado global de autenticación
- Provider que envuelve toda la aplicación
- Estado del contexto:
  - `state`: 'idle' | 'signIn' | 'signOut'
  - `isLoading`: boolean
  - `isSignedIn`: boolean
  - `user`: AuthUser | null
  - `signIn()`, `signUp()`, `signOut()`: métodos async

**`hooks/useAuth.ts`**

- Hook para acceder al contexto de autenticación
- Uso: `const { user, signIn, signOut } = useAuth();`
- Disponible en cualquier componente dentro del AuthProvider

**`hooks/useStorageState.ts`**

- Hook para persistencia de datos en AsyncStorage
- Mantiene la sesión del usuario entre reinicios de la app
- Similar a useState pero sincroniza con almacenamiento persistente

**`ui/Button.tsx`**

- Componente Button reutilizable
- Variantes: primary, secondary, danger
- Soporta loading y disabled states

### Capa de Features (src/features/autenticacion/)

**`ui/LoginForm.tsx`**

- Formulario de inicio de sesión
- Validación de email y contraseña
- Manejo de errores con Alert

**`ui/SignUpForm.tsx`**

- Formulario de registro
- Validación de contraseñas coincidentes
- Validación de longitud mínima (6 caracteres)
- Manejo de errores

**`ui/AuthScreen.tsx`**

- Pantalla principal de autenticación
- Alterna entre LoginForm y SignUpForm
- Permite navegar entre login y registro

### Routes

**`app/auth.tsx`**

- Ruta que renderiza AuthScreen
- Solo accesible cuando el usuario no está autenticado

## Modificaciones a Archivos Existentes

### `app/_layout.tsx`

- Envuelto con `AuthProvider` en el nivel más alto
- Componente `RootLayoutNav` que gestiona la navegación condicional
- Si autenticado: muestra las tabs
- Si no autenticado: muestra la pantalla de auth

### `src/pages/home/ui/HomeScreen.tsx`

- Agregado botón "Cerrar sesión" en el header
- Muestra email del usuario autenticado
- Confirmación antes de cerrar sesión con Alert

## Flujo de Autenticación

```
┌─ App inicia
│
├─ AuthProvider carga usuario persistido de AsyncStorage
│
├─ ¿Existe sesión anterior?
│  ├─ NO → RootLayoutNav muestra pantalla 'auth'
│  │       ├─ Usuario ingresa email y contraseña
│  │       ├─ LoginForm.handleLogin() → signIn()
│  │       ├─ AuthService.login() contacta Supabase
│  │       ├─ Si exitoso: setIsSignedIn(true) → NavPoint sesión
│  │       └─ Si falla: mostrar Alert con error
│  │
│  └─ SÍ → RootLayoutNav muestra pantalla '(tabs)'
│          ├─ HomeScreen (Listar proyectos) - protegido
│          ├─ RegistroScreen (Registrar proyecto) - protegido
│          └─ Usuario puede hacer logout
```

## Cómo Usar en Componentes

### Acceder al contexto de autenticación

```typescript
import { useAuth } from '@shared/hooks/useAuth';

export function MiComponente() {
  const { user, isSignedIn, signOut, signIn } = useAuth();

  if (isLoading) {
    return <LoadingComponent />;
  }

  return (
    <View>
      {isSignedIn ? (
        <Text>Bienvenido {user?.email}</Text>
      ) : (
        <Text>Por favor inicia sesión</Text>
      )}
    </View>
  );
}
```

### Realizar login programáticamente

```typescript
const handleCustomLogin = async () => {
  try {
    const { signIn } = useAuth();
    await signIn(email, password);
    // Usuario autenticado automáticamente
    // Las tabs se mostrarán en la siguiente renderización
  } catch (error) {
    console.error("Error:", error.message);
  }
};
```

## Variables de Entorno

Configuradas en `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://kjpzajsvofpbayhcqxea.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ArsZa5Gj1vNUHChHNq990Q_KztSbbV5
```

## Cambios de Comportamiento

1. **Pantalla de inicio**: Ya no muestra directamente los tabs, sino la pantalla de autenticación
2. **Acceso a funcionalidades**: Solo disponible después de autenticarse
3. **Persistencia de sesión**: Se mantiene entre reinicios de la app (en AsyncStorage)
4. **Cierre de sesión**: Botón disponible en el header de HomeScreen con confirmación

## Configuración Supabase

El proyecto ya está configurado en Supabase. Para verificar o personalizar:

1. Ve a [Supabase Console](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. **Authentication → Providers**
   - Email auth está habilitado por defecto
4. **Email → Email Templates** (opcional)
   - Personaliza los emails de confirmación si lo necesitas

## Arquitectura y Capas

El sistema respeta la arquitectura de capas:

```
shared/ (capa compartida)
├── api/authService.ts ✓ (puede importar desde supabase)
├── context/AuthContext.tsx ✓ (importa de shared/api)
└── hooks/ ✓ (importan de shared/)

features/autenticacion/ (features)
└── ui/ ✓ (importa de shared/hooks, shared/ui)

pages/, app/, widgets/ (pueden importar de shared)
```

**Regla respetada**: Las capas superiores (features, pages) pueden importar de capas inferiores (shared), pero no al revés.

## Próximos Pasos (Opcional)

- [ ] Recuperación de contraseña olvidada
- [ ] Verificación de email
- [ ] Autenticación social (Google, GitHub, etc.)
- [ ] Crear tabla de usuarios en BD
- [ ] Asociar proyectos al usuario autenticado
- [ ] Implementar roles y permisos
- [ ] Agregar foto de perfil de usuario

## Troubleshooting

**Problema**: "useAuth must be used within an AuthProvider"

- **Solución**: Asegúrate de que el componente está dentro del árbol de RootLayout

**Problema**: Sesión no persiste entre reinicios

- **Solución**: Verifica que AsyncStorage esté instalado (`npm list @react-native-async-storage/async-storage`)

**Problema**: Errores de autenticación de Supabase

- **Solución**: Verifica que .env tenga las credenciales correctas
- Comprueba que Supabase Auth esté habilitado en el proyecto
