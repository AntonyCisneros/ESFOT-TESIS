# 🎬 Animaciones Integradas - ESFOT Tesis App

## Resumen Ejecutivo

Se han integrado **React Native Reanimated** y **Uniwind** para crear una experiencia visual moderna y fluida en la aplicación. Implementadas **4 animaciones** (2 obligatorias + 2 adicionales) con más de **6 hooks reutilizables**.

---

## 📦 Librerías Instaladas

### 1. **React Native Reanimated** v4 (Stable)

- **URL**: https://docs.swmansion.com/react-native-reanimated/
- **Propósito**: Animaciones de alto rendimiento en UI thread nativo
- **FPS**: Soporta hasta 120fps en dispositivos modernos
- **Instalación**: ✅ `npm install react-native-reanimated react-native-gesture-handler`

### 2. **Uniwind**

- **URL**: https://uniwind.dev/
- **Propósito**: Tailwind CSS para React Native (2-5x más rápido que NativeWind)
- **Ventajas**: Classes familiares de Tailwind, compila a estilos nativos reales
- **Instalación**: ✅ `npm install uniwind`

**Configuración Completada:**

- ✅ `metro.config.js` - Configurado con soporte Uniwind
- ✅ `tailwind.config.js` - Colores personalizados para la app
- ✅ `babel.config.js` - Plugin de Reanimated agregado
- ✅ `app.json` - Plugin de Reanimated registrado

---

## 🎭 Animaciones Implementadas

### **OBLIGATORIAS**

#### 1️⃣ Animación de Entrada en Tarjetas de Proyectos ✅

**Archivo**: `src/widgets/proyecto-card/ProyectoCard.tsx`
**Hook**: `useCardEnterAnimation(delay)`

```typescript
// Implementación
const enterAnimation = useCardEnterAnimation(delay);
<Animated.View style={[styles.tarjeta, enterAnimation]}>
  {/* Contenido tarjeta */}
</Animated.View>
```

**Efecto Visual:**

- Fade + Slide Down con springify
- Delay escalonado por índice (100ms entre tarjetas)
- Transición suave tipo "entrada en cascada"
- Se aplica en `ListaProyectos.tsx` con `delay={index * 100}`

**Experiencia:** Las tarjetas entran de arriba hacia abajo con desvanecimiento gradual, creando un efecto "waterfall" elegante.

---

#### 2️⃣ Campos del Formulario con Transición de Borde ✅

**Archivo**: `src/shared/ui/AnimatedTextInput.tsx`
**Hook**: `useFormFieldBorderAnimation()`

```typescript
// Implementación
const { animatedBorderStyle, handleFocus, handleBlur } =
  useFormFieldBorderAnimation();

<Animated.View style={[styles.inputWrapper, animatedBorderStyle]}>
  <TextInput
    onFocus={handleFocus}
    onBlur={handleBlur}
  />
</Animated.View>
```

**Efecto Visual:**

- Borde cambia de gris (#E0E0E0) a azul (#2E6DA4) al enfocarse
- Grosor aumenta de 1px a 2px suavemente
- Usa `interpolateColor` para transición cromática
- Usa `withSpring` para movimiento elástico

**Experiencia:** Al tocar un campo, el borde se anima hacia el color primario con un efecto de "pulse" suave y profesional.

---

### **ADICIONALES**

#### 3️⃣ Botón Pulsante en Guardar Proyecto ✅

**Archivo**: `src/features/registro-proyecto/ui/RegistroProyectoForm.tsx`
**Hook**: `usePulseAnimation(enabled)`

```typescript
// Implementación
const pulseAnimation = usePulseAnimation(!cargando);
<Animated.View style={[styles.botonGuardarContenedor, !cargando && pulseAnimation]}>
  <TouchableOpacity
    style={styles.botonGuardar}
    onPress={handleGuardar}
  >
    Registrar Proyecto
  </TouchableOpacity>
</Animated.View>
```

**Efecto Visual:**

- Scale 1.0 → 1.05 → 1.0 en loop
- Duración: 300ms subida, 300ms bajada, 1s pausa entre ciclos
- Se desactiva al cargar (para no distraer)
- Atrae la atención del usuario al botón principal

**Experiencia:** El botón "respira" suavemente, invitando al usuario a presionarlo sin ser invasivo.

---

#### 4️⃣ Flip Card en Detalle del Proyecto ✅

**Archivo**: `src/shared/ui/FlipCard.tsx`
**Hook**: `useFlipCardAnimation()`

```typescript
// Implementación
<FlipCard
  title="Resumen del Proyecto"
  frontContent={<View>{/*Equipo*/}</View>}
  backContent={<View>{/*Fechas*/}</View>}
/>
```

**Efecto Visual:**

- Rotación 3D de 180 grados (rotateY)
- Perspectiva 1000px para efecto 3D realista
- Transición suave de 300ms
- Cambio de contenido a mitad del giro
- Front: fondo azul (#EBF5FB), Back: fondo verde (#E8F5E9)

**Experiencia:** Tocar la tarjeta hace que gire como una tarjeta real, revelando información adicional (Equipo ↔ Fechas).

---

## 🧩 Hooks Reutilizables

**Archivo**: `src/shared/hooks/useAnimations.ts`

### Disponibles para usar:

| Hook                          | Propósito               | Parámetros                |
| ----------------------------- | ----------------------- | ------------------------- |
| `useCardEnterAnimation`       | Entrada en cascada      | `delay: number`           |
| `useFormFieldBorderAnimation` | Transición borde        | Ninguno                   |
| `useParallaxAnimation`        | Efecto parallax scroll  | `scrollOffset, intensity` |
| `useFlipCardAnimation`        | Giro 3D                 | Ninguno                   |
| `usePulseAnimation`           | Efecto pulsante         | `enabled: boolean`        |
| `useTypewriterAnimation`      | Efecto máquina escribir | `text, duration`          |

**Ejemplo de uso en componentes nuevos:**

```typescript
import { useCardEnterAnimation, usePulseAnimation } from "@shared/hooks/useAnimations";

export function MiComponente() {
  const enterAnim = useCardEnterAnimation(0);
  return <Animated.View style={enterAnim}>{...}</Animated.View>;
}
```

---

## 📱 Componentes Animados Creados

### 1. **AnimatedTextInput**

Input de formulario con borde animado al focus

```tsx
<AnimatedTextInput
  label="Título del Proyecto"
  placeholder="..."
  value={value}
  onChangeText={onChange}
/>
```

### 2. **FlipCard**

Tarjeta que gira para mostrar contenido frontal y dorsal

```tsx
<FlipCard
  title="Información"
  frontContent={<Text>Frente</Text>}
  backContent={<Text>Dorso</Text>}
/>
```

### 3. **AnimatedButton**

Botón con escala y variantes (primary, secondary, danger)

```tsx
<AnimatedButton
  variant="primary"
  size="lg"
  loading={cargando}
  onPress={handlePress}
>
  Presionar
</AnimatedButton>
```

### 4. **ProyectoCard (Mejorada)**

Tarjeta de proyecto con entrada animada y pulse

```tsx
<ProyectoCard
  proyecto={proyecto}
  delay={index * 100}
  onPress={() => navigate(proyecto.id)}
/>
```

---

## 🎨 Configuración de Tailwind (Uniwind)

**Archivo**: `tailwind.config.js`

```javascript
theme: {
  extend: {
    colors: {
      primary: "#2E6DA4",
      secondary: "#27AE60",
      accent: "#E74C3C",
    },
  },
}
```

**Cómo usar en componentes:**

```tsx
<View className="flex p-4 rounded-lg bg-blue-50 border border-primary">
  <Text className="text-lg font-bold text-primary">Título</Text>
</View>
```

---

## 🔧 Configuración del Proyecto

### `babel.config.js`

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: ["react-native-reanimated/plugin"],
  };
};
```

### `metro.config.js`

```javascript
const { withUniwind } = require("uniwind/metro");
module.exports = withUniwind(config);
```

### `app.json` (plugins section)

```json
"plugins": [
  "expo-router",
  "react-native-reanimated/plugin",
  ["expo-splash-screen", {...}]
]
```

---

## 📊 Performance Esperado

| Animación        | FPS | Duración   | CPU      |
| ---------------- | --- | ---------- | -------- |
| Entrada tarjetas | 60  | 600ms      | Bajo     |
| Borde campo      | 60  | Spring     | Muy Bajo |
| Pulse botón      | 60  | 600ms loop | Muy Bajo |
| Flip card        | 60  | 300ms      | Bajo     |

**Total**: Todas las animaciones corren en el UI thread nativo = ZERO lag.

---

## 🚀 Próximos Pasos Opcionales

1. **Implementar parallax scroll** en lista de proyectos

   ```typescript
   const parallaxStyle = useParallaxAnimation(scrollOffset);
   ```

2. **Agregar animación de carga** al obtener datos

   ```typescript
   const typewriter = useTypewriterAnimation("Cargando...", 2000);
   ```

3. **Usar AnimatedButton** en más lugares
   - Eliminar proyecto
   - Actualizar proyecto
   - Crear nuevo proyecto

4. **Animaciones de gesture** con react-native-gesture-handler
   ```typescript
   import { Gesture, GestureDetector } from "react-native-gesture-handler";
   ```

---

## ✅ Checklist de Implementación

- [x] Instalar `react-native-reanimated`
- [x] Instalar `uniwind` + `tailwind`
- [x] Configurar `babel.config.js`
- [x] Configurar `metro.config.js`
- [x] Configurar `app.json`
- [x] Crear hooks de animación reutilizables
- [x] Implementar entrada tarjetas
- [x] Implementar borde animado en campos
- [x] Implementar pulse en botón
- [x] Implementar flip card
- [x] Crear componentes AnimatedTextInput, FlipCard, AnimatedButton
- [x] Documentación completa

---

## 🎯 Resumen de Cambios

**Archivos Creados:**

1. `src/shared/hooks/useAnimations.ts` - 6 hooks reutilizables
2. `src/shared/ui/AnimatedTextInput.tsx` - Input con borde animado
3. `src/shared/ui/FlipCard.tsx` - Tarjeta giratoria 3D
4. `src/shared/ui/AnimatedButton.tsx` - Botón escalable
5. `babel.config.js` - Config Reanimated
6. `tailwind.config.js` - Config Uniwind
7. `metro.config.js` - Metro config Uniwind

**Archivos Modificados:**

1. `src/widgets/proyecto-card/ProyectoCard.tsx` - Entrada animada + delay
2. `src/features/lista-proyectos/ui/ListaProyectos.tsx` - Paso de delay
3. `src/features/registro-proyecto/ui/RegistroProyectoForm.tsx` - AnimatedTextInput + pulse button
4. `app/proyecto/[id].tsx` - FlipCard integrado
5. `app.json` - Plugin Reanimated agregado

---

**Versiones instaladas:**

- react-native-reanimated: v4.0.0+
- react-native-gesture-handler: v2.x
- uniwind: latest
- expo: 54.0.33 (compatible)

---

## 🎓 Referencias

- [Reanimated Docs](https://docs.swmansion.com/react-native-reanimated/)
- [Uniwind Docs](https://docs.uniwind.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Expo Router](https://expo.github.io/router/)
