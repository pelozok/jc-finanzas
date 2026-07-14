# 💰 JC Finanzas — Jóvenes Central

App web para llevar las finanzas del ministerio de jóvenes **JC — Jóvenes Central** (Costa Rica).

**App en línea:** https://pelozok.github.io/jc-finanzas/

## Qué hace

- Registra **ingresos** y **gastos** en colones (₡) con fecha, categoría, descripción y método: 💵 **Efectivo** o 🏦 **Depositado** (cuenta bancaria / SINPE).
- Registra **traslados** entre efectivo y depositado (ej: depositar el efectivo al banco).
- **Sobres**: divide el saldo total en fondos apartados (campamento, caja chica, etc.). Cada ingreso o gasto puede asignarse a un sobre, y con el botón "Mover" se pasa plata de un sobre a otro (o desde "Sin asignar"). Los sobres no cambian el saldo total: solo lo reparten.
- Muestra siempre arriba el **saldo en efectivo, el depositado y el total**, calculados automáticamente a partir de todos los movimientos.
- **Historial** ordenado por fecha con filtro por mes.
- Los movimientos se pueden **editar y borrar** (lapicito ✏️ y basurero 🗑️).
- Las **categorías** y los **sobres** se administran desde la propia app (iconos de ajustes en cada sección).

## Cómo usarla

1. Entrá a https://pelozok.github.io/jc-finanzas/ desde el celular o la compu.
2. Tocá **"Entrar con Google"** e iniciá sesión con un correo autorizado.
3. Usá los botones **+ Ingreso**, **− Gasto** o **⇄ Traslado** para registrar movimientos.
4. Para editar o borrar, usá los iconos a la derecha de cada movimiento del historial.

> 💡 En el celular podés "instalarla": abrí la página en el navegador → menú → **"Agregar a pantalla de inicio"**.

## 🔐 Autorizar o quitar correos

La lista de personas con acceso vive en las **reglas de seguridad de Firestore** (no en el código de la app). Para cambiarla:

1. Entrá a https://console.firebase.google.com con la cuenta dueña del proyecto y abrí el proyecto **jc-finanzas**.
2. Menú izquierdo: **Firestore Database** → pestaña **"Reglas"**.
3. Buscá la lista de correos dentro de la función `esAutorizado()`:
   ```
   && request.auth.token.email in [
        'kevindp2008@gmail.com'
      ];
   ```
4. Agregá o quitá correos. Cada correo va entre comillas simples y separado por comas:
   ```
   && request.auth.token.email in [
        'kevindp2008@gmail.com',
        'otrapersona@gmail.com'
      ];
   ```
5. Presioná **"Publicar"**. El cambio aplica en menos de un minuto.
6. Actualizá también el archivo [`firestore.rules`](firestore.rules) de este repositorio para que quede como respaldo (opcional pero recomendado).

Quien no esté en la lista puede iniciar sesión con Google, pero **no puede ver ni tocar ningún dato**: la app le muestra "🔒 Acceso restringido".

## 🛡️ Seguridad: cómo está protegida

1. **Reglas de Firestore** ([`firestore.rules`](firestore.rules)): se evalúan en los servidores de Google. Solo los correos de la lista (y con el correo verificado) pueden leer o escribir. Además validan los datos: montos numéricos positivos, fechas con formato correcto, campos requeridos y ningún campo extra.
2. **Firebase App Check + reCAPTCHA v3**: solo la app real, corriendo en los dominios registrados, puede hablar con Firestore. Bots y scripts quedan bloqueados.
3. **Dominios autorizados de Firebase Auth**: el login con Google solo funciona desde `pelozok.github.io` y `localhost`.

### ¿Y no es peligroso que la `apiKey` de Firebase esté pública en el código?

No. La `apiKey` de Firebase **no es una llave secreta**: solo identifica a cuál proyecto de Google conectarse (es como la dirección de un edificio, no la llave de la puerta). Cualquier app web de Firebase la expone necesariamente. La protección real la dan las tres capas de arriba. Lo que **sí** sería grave exponer: la *clave secreta* de reCAPTCHA (vive solo en la consola de Firebase) o una *service account* de Google (este proyecto no usa ninguna).

## 🚀 Publicación (deploy)

Cada `git push` a la rama `main` dispara el workflow de GitHub Actions ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) que compila la app y la publica en GitHub Pages. Podés ver el progreso en la pestaña **Actions** del repositorio.

## 💻 Desarrollo local

```bash
pnpm install
pnpm run dev    # abre http://localhost:5173/jc-finanzas/
```

Con App Check en modo *enforcement*, al correr en `localhost` la consola del navegador (F12) imprime un **token de depuración**. Hay que registrarlo en: Firebase console → **App Check** → **Apps** → menú ⋮ de la app → **Administrar tokens de depuración** → **Agregar token**.

## Estructura de los datos (Firestore)

- Colección `movimientos`: documentos con `tipo` (`ingreso` | `gasto` | `traslado` | `asignacion`), `monto` (número > 0), `fecha` (`YYYY-MM-DD`), `descripcion`, `creadoPor`, `creadoEn`; los ingresos/gastos llevan `categoria`, `metodo` (`efectivo` | `depositado`) y opcionalmente `sobre`; los traslados llevan `direccion` (`efectivo-a-depositado` | `depositado-a-efectivo`); las asignaciones entre sobres llevan `sobreOrigen` y `sobreDestino` (cadena vacía = "Sin asignar").
- Documentos `config/categorias` y `config/sobres`: `{ lista: [...] }` con las opciones disponibles.

> ⚠️ Si se cambia la estructura de los datos, hay que actualizar también las reglas ([`firestore.rules`](firestore.rules)) y volver a publicarlas en la consola de Firebase.

Los saldos **no se guardan**: se calculan sumando todos los movimientos, así nunca quedan desincronizados.
