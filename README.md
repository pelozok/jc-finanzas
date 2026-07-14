# JC Finanzas — Jóvenes Central

Aplicación web para la gestión de las finanzas del ministerio de jóvenes **JC — Jóvenes Central** (Costa Rica).

**App en línea:** https://pelozok.github.io/jc-finanzas/

## Descripción

JC Finanzas permite llevar el control de ingresos y gastos del ministerio en colones (₡), con saldos calculados automáticamente y separados por método (efectivo y depositado). Está pensada como una PWA ligera que funciona igual en celular y computadora, con autenticación de Google y acceso restringido a un grupo autorizado de personas.

## Funcionalidades

- **Ingresos y gastos** con fecha, categoría, descripción y método: efectivo o depositado (cuenta bancaria / SINPE).
- **Traslados** entre efectivo y depositado (por ejemplo, depositar el efectivo al banco).
- **Sobres**: fondos apartados dentro del saldo total (campamento, caja chica, etc.). Cada movimiento puede asignarse a un sobre y el dinero puede moverse entre sobres. Los sobres no alteran el saldo total, solo lo reparten.
- **Saldos en tiempo real**: efectivo, depositado y total, calculados a partir de todos los movimientos (nunca se almacenan, así no pueden desincronizarse).
- **Historial** ordenado por fecha con filtro por mes, y edición o eliminación de cualquier movimiento.
- **Categorías y sobres administrables** desde la propia aplicación.
- **Exportación a Excel**: genera un `.xlsx` con los movimientos del mes filtrado (o todos) y una hoja de resumen con saldos y sobres.

## Tecnologías

| Tecnología | Uso |
|---|---|
| [React 18](https://react.dev/) | Interfaz de usuario |
| [Vite](https://vite.dev/) | Build y servidor de desarrollo |
| [Firebase Auth](https://firebase.google.com/docs/auth) | Inicio de sesión con Google |
| [Cloud Firestore](https://firebase.google.com/docs/firestore) | Base de datos en tiempo real |
| [Firebase App Check](https://firebase.google.com/docs/app-check) + reCAPTCHA v3 | Protección contra bots y clientes no autorizados |
| [lucide-react](https://lucide.dev/) | Iconografía |
| [SheetJS (xlsx)](https://sheetjs.com/) | Exportación a Excel |
| [GitHub Pages](https://pages.github.com/) + GitHub Actions | Hosting y despliegue continuo |
| [pnpm](https://pnpm.io/) | Gestión de dependencias |

## Arquitectura

Es una SPA sin backend propio: el cliente React se comunica directamente con Firestore, y toda la lógica de autorización y validación de datos vive en las reglas de seguridad ([`firestore.rules`](firestore.rules)), que se evalúan en los servidores de Google.

### Modelo de datos (Firestore)

- **Colección `movimientos`**: documentos con `tipo` (`ingreso` | `gasto` | `traslado` | `asignacion`), `monto` (número > 0), `fecha` (`YYYY-MM-DD`), `descripcion`, `creadoPor` y `creadoEn`. Los ingresos y gastos llevan además `categoria`, `metodo` (`efectivo` | `depositado`) y opcionalmente `sobre`; los traslados llevan `direccion`; las asignaciones entre sobres llevan `sobreOrigen` y `sobreDestino`.
- **Documentos `config/categorias` y `config/sobres`**: `{ lista: [...] }` con las opciones disponibles en la app.

Los saldos no se guardan en la base de datos: se calculan sumando todos los movimientos.

## Seguridad

El acceso está protegido por tres capas complementarias:

1. **Reglas de Firestore**: solo una lista de correos autorizados (definida en las reglas, no en el código de la app) puede leer o escribir. Las reglas también validan los datos: montos positivos, fechas con formato correcto, campos requeridos y ningún campo extra.
2. **Firebase App Check con reCAPTCHA v3**: solo la aplicación real, ejecutándose en los dominios registrados, puede comunicarse con Firestore.
3. **Dominios autorizados de Firebase Auth**: el inicio de sesión con Google solo funciona desde los dominios registrados del proyecto.

Cualquier persona puede iniciar sesión con Google, pero quien no esté en la lista de autorizados no puede ver ni modificar ningún dato.

La `apiKey` de Firebase presente en el código no es un secreto: solo identifica el proyecto al que se conecta la app (todas las apps web de Firebase la exponen). La protección real la aportan las tres capas anteriores.

## Despliegue

Cada push a la rama `main` dispara un workflow de GitHub Actions ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) que compila la aplicación con Vite y la publica en GitHub Pages.
