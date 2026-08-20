# Instrucciones para crear frontend Venelux en Expo

## 1) Objetivo

Crear una app mobile con Expo que consuma estos endpoints del backend Venelux:

- GET /api/venelux/materials
- GET /api/venelux/materials/all
- GET /api/venelux/units
- GET /api/venelux/obras
- POST /api/venelux/solicitudes/header
- POST /api/venelux/solicitudes/detail
- POST /api/venelux/solicitudes/movement
- POST /api/venelux/solicitudes/transaction

Nota de seguridad:

- En el backend la proteccion con JWT puede estar activa o comentada en el controlador.
- Si esta activa, debes enviar Authorization: Bearer <token>.

## 2) Crear proyecto Expo

Desde una carpeta fuera del backend, ejecuta:

npx create-expo-app venelux-mobile --template

Elige: Blank (TypeScript).

Luego:

cd venelux-mobile
npm install axios @tanstack/react-query @react-navigation/native @react-navigation/native-stack react-native-safe-area-context react-native-screens
npx expo install expo-secure-store

Si usas navegacion por tabs:

npm install @react-navigation/bottom-tabs

## 3) Variables de entorno

Crea un archivo .env en la raiz del proyecto Expo:

EXPO_PUBLIC_API_URL=http://TU_IP_LOCAL:3000/api

Para Android emulador puedes usar:

- http://10.0.2.2:3000/api

Para iOS simulador normalmente funciona:

- http://localhost:3000/api

## 4) Estructura recomendada

Crea esta estructura:

src/
api/
client.ts
venelux.api.ts
auth/
token.storage.ts
modules/
venelux/
screens/
MaterialsScreen.tsx
ObrasScreen.tsx
CreateSolicitudScreen.tsx
components/
MaterialRow.tsx
SolicitudDetailItem.tsx
hooks/
useMaterials.ts
useUnits.ts
useObras.ts
useCreateSolicitud.ts
types/
venelux.types.ts
navigation/
AppNavigator.tsx
theme/
colors.ts
utils/
numbers.ts

## 5) Cliente HTTP base

En src/api/client.ts:

- Crear instancia Axios con baseURL desde EXPO_PUBLIC_API_URL.
- Timeout de 15000 ms.
- Interceptor request para agregar Bearer token si existe.
- Interceptor response para manejar 401.

Flujo sugerido:

1. Leer token desde SecureStore.
2. Si existe, agregar Authorization.
3. Si 401, limpiar token y redirigir a login.

## 6) Tipos del frontend

En src/modules/venelux/types/venelux.types.ts define:

Material:

- codigo, material, coduni, nroparte, codbarra, unidad
- linea, sublinea, categoria, precio
- marca, noparte, imagen1, imagen2, imagen3

Unit:

- coduni, desuni

Obra:

- codigoobra, descripcionobra

CreateHeaderDto:

- solicitudnumero, empresa, codigoobra, descripcionobra
- numerocontrol, solicitanteuser, solicitantecodigo
- fechasolicitud, fechautilizacion, observacion
- actividad, direccionentrega, registradopor, owneruser

CreateDetailDto:

- solicitudnumero, itemnumero, codigomaterial, descripcionmaterial
- coduni, unidadmedida, linea, sublinea, categoria
- cantidadsolicitada, precioventa, observacion, materialnuevo

CreateMovementDto:

- solicitudnumero, itemnumero, codart, coduni, codalma, desalma
- stock, prioridad, almacen, cantidad, traslado, tras_num, costo, fechacosto

CreateSolicitudDto:

- header: CreateHeaderDto
- details: CreateDetailDto[]
- movements?: CreateMovementDto[]

## 7) Servicio de API Venelux

En src/api/venelux.api.ts crea funciones:

- getMaterials(page = 1, limit = 50)
- getAllMaterials()
- getUnits()
- getObras()
- createHeader(payload)
- createDetail(payload)
- createMovement(payload)
- createSolicitudTransaction(payload)

Importante:

- getMaterials devuelve data, total, page, lastPage.
- createSolicitudTransaction debe enviar header + details y opcional movements.

## 8) React Query (estado de servidor)

En App.tsx:

- Crear QueryClient.
- Envolver con QueryClientProvider.

Hooks sugeridos:

- useMaterials(page, limit)
- useUnits()
- useObras()
- useCreateSolicitud() con mutation

Beneficios:

- cache automatico
- refetch controlado
- estados loading/error simples

## 9) Pantallas minimas para MVP

1. MaterialsScreen

- Barra de busqueda local por codigo y descripcion.
- Paginacion (botones Anterior/Siguiente usando page y lastPage).
- Boton Agregar para armar detalles de solicitud.

2. ObrasScreen

- Lista de obras del usuario.
- Seleccion de obra para autocompletar header.

3. CreateSolicitudScreen

- Formulario Header.
- Lista dinamica de Details.
- Lista opcional de Movements (si aplica por item).
- Boton Guardar Solicitud (POST /solicitudes/transaction).

## 10) Reglas de negocio que debes mantener en frontend

- Todos los details deben compartir el mismo solicitudnumero del header.
- Si hay movements, todos deben compartir el mismo solicitudnumero del header.
- Cada movement debe corresponder a un itemnumero existente en details.

Validar estas reglas en UI antes de enviar para evitar 400 del backend.

## 11) Ejemplo de payload transaccional

{
"header": {
"solicitudnumero": "3001",
"empresa": "VENELUX",
"codigoobra": "850",
"descripcionobra": "ALMACEN CONSUMIBLES",
"numerocontrol": "0",
"solicitanteuser": "DANIEL SALGADO",
"solicitantecodigo": "RAC016",
"fechasolicitud": "2026-08-20T10:00:00.000Z",
"fechautilizacion": "2026-08-22",
"observacion": "SERVICIOS GENERALES",
"actividad": "MANTENIMIENTO",
"direccionentrega": "ALMACEN DE CONSUMIBLES",
"registradopor": "dsalgado",
"owneruser": "59"
},
"details": [
{
"solicitudnumero": "3001",
"itemnumero": "1",
"codigomaterial": "MM1704042",
"descripcionmaterial": "CONDULET TIPO T 3/4",
"coduni": "UND",
"unidadmedida": "UNIDAD",
"linea": "M17 - ELECTRICIDAD",
"sublinea": "04 - CAJETINES",
"categoria": "M - MATERIALES",
"cantidadsolicitada": 5,
"precioventa": 0,
"observacion": "",
"materialnuevo": "0"
}
],
"movements": [
{
"solicitudnumero": "3001",
"itemnumero": "1",
"codart": "MM1704042",
"coduni": "UND",
"codalma": "900",
"desalma": "ALMACEN PRINCIPAL",
"stock": 120,
"prioridad": 2,
"almacen": "900",
"cantidad": 5,
"traslado": "1",
"tras_num": "",
"costo": 0,
"fechacosto": ""
}
]
}

## 12) UX recomendada para que sea rapida de usar

- Encabezado fijo con obra seleccionada y solicitante.
- Detalles en tarjetas compactas con acciones Editar/Eliminar.
- Busqueda de materiales con debounce 300 ms.
- Validaciones inline en cada campo obligatorio.
- Confirmacion antes de enviar.
- Toast de exito con solicitudnumero.

## 13) Pruebas minimas

1. Cargar materiales paginados.
2. Cargar todas las obras.
3. Crear header individual.
4. Crear detail individual.
5. Crear movement individual.
6. Crear solicitud transaccional completa.
7. Verificar errores de validacion con datos inconsistentes.

## 14) Build y ejecucion

Desarrollo:

npm run start

Android:

npm run android

iOS:

npm run ios

Produccion (EAS opcional):

npx eas build --platform android
npx eas build --platform ios

## 15) Integracion final con backend

Checklist:
cion antes de enviar.
- Toast de exito con solicitudnumero.

## 13) Pruebas minimas

1. Cargar materiales paginados.
2. Cargar todas las obras.
3. Crear header individual.
4. Crear detail individual.
5. Crear movement individual.
6. Crear solicitud transaccional completa.
7. Verificar errores de validacion con datos inconsistentes.

## 14) Build y ejecucion

Desarrollo:

npm run start

Android:

npm run android

iOS:

npm run ios

Produccion (EAS opcional):

npx eas build --platform android
npx eas build --platform ios

## 15) Integracion final con backend

Checklist:

- Backend corriendo en puerto 3000.
- CORS habilitado (ya esta en tu backend).
- URL correcta en EXPO_PUBLIC_API_URL.
- JWT activo/inactivo segun entorno.
- DTOs del frontend alineados con backend.

Con esto ya puedes construir el frontend Expo completo para Venelux manteniendo las logicas actuales de solicitud, detalle y movimientos.
