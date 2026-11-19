# Traslado seguro a Vercel

## Alcance y estado

`web/` es la aplicación unificada Next.js. `client/` y `server/` se conservan para referencia y
recuperación. Este documento prepara el cambio; **no significa que producción ya haya migrado**.
Los proyectos, credenciales, recursos y pagos reales deben comprobarse en los paneles.

Destino: Next.js en Vercel + PostgreSQL de Neon (u otro proveedor del Marketplace) + Stripe.
No existe un nuevo servicio nativo «Vercel Postgres»: PostgreSQL es una integración gestionada.
No se necesita servidor Express persistente, Redis ni un proceso worker para este alcance.

El producto soporta compras de **solo ida**. Ida y vuelta requiere dos compras. El mapa se genera
según capacidad; las dos primeras filas tienen un suplemento explícito de 18 €/asiento, sin afirmar
que sean salidas de emergencia de un avión real. Los destinos sugeridos usan inventario real y
preferencias locales; no se anuncian descuentos ficticios.

## 1. Antes de tocar producción

- Trabajar mediante una rama/PR y exigir el job `web` de CI.
- Guardar SHA/deployment ID productivos, ajustes de Vercel/Railway, dominios y rutas Stripe.
- Mantener el proyecto Vercel actual y Railway activos.
- Confirmar dónde está PostgreSQL y si Stripe utiliza modo test o live actualmente.
- Comprobar que hay vuelos futuros. Los antiguos fixtures de mayo/junio de 2026 ya caducaron;
  no cambiar sus fechas si tienen reservas históricas. Crear el catálogo futuro mediante una
  operación administrativa aprobada (consola PostgreSQL o herramienta de administración), no con
  un seed productivo ni una actualización masiva del historial.
- Separar proyectos/bases de staging y producción; no restaurar datos personales productivos
  en un entorno público de pruebas.
- Guardar backups cifrados fuera del repositorio, con retención definida. Ensayar restauración.
- No añadir estos secretos a commits, capturas, logs o conversaciones.

### Dependencias

Next.js y jsPDF se actualizaron a versiones corregidas; las dependencias de runtime deben pasar
`npm audit --omit=dev --audit-level=high`. Existe un aviso de `deepmerge-ts` en el árbol **de
herramientas** de Prisma 6 (`prisma -> @prisma/config`). Afecta a grafos recursivos suministrados al
mezclador; no se procesa input de usuarios en la configuración de Prisma. Mantener configuración
de builds confiable. La actualización mayor a Prisma 7 debe hacerse en una PR independiente,
con sus cambios de configuración/adaptador y tests; no usar `npm audit fix --force` ni un override
mayor no verificado. Volver a auditar en la fecha real del lanzamiento.

## 2. Crear staging en Vercel

1. Crear proyecto separado, sin dominio productivo.
2. Root Directory `web`, Framework `Next.js`, Node.js `22.x`.
3. Install `npm ci`, Build `npm run build`, Output Directory **sin override**.
4. No añadir rewrites globales hacia Railway ni un fallback SPA a `index.html`.
5. Elegir una URL estable de staging; debe coincidir con `APP_URL`.
6. Crear PostgreSQL independiente con Neon desde Vercel Marketplace.
7. Elegir región de funciones cercana a PostgreSQL según disponibilidad/plan.
8. Configurar variables en el scope que despliega realmente este proyecto. Su despliegue principal
   suele ser `Production`, aunque el entorno de negocio sea staging.

Preview debe usar recursos aislados y operaciones desactivadas. No conectar producción a Preview.
Un Preview con hostname diferente de APP_URL no podrá hacer mutaciones; esto es intencional.
Usar una rama/dominio de staging estable para probar el flujo completo.

### Variables de web/

| Variable | Staging | Producción |
| --- | --- | --- |
| `APP_ENV` | `staging` | `production` |
| `APP_URL` | Origen HTTPS estable de staging | Origen HTTPS final |
| `DATABASE_URL` | Conexión pooled de staging | Conexión pooled productiva |
| `DIRECT_URL` | Conexión directa a la misma base | Conexión directa a la misma base |
| `JWT_SECRET` | Aleatorio, mínimo 32 caracteres | Otro secreto aleatorio |
| `STRIPE_SECRET_KEY` | `sk_test_...` de sandbox aislado | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Signing secret del endpoint test | Signing secret del endpoint live |
| `CRON_SECRET` | Aleatorio, mínimo 32 caracteres | Otro secreto aleatorio |
| `WRITES_ENABLED` | `false` inicialmente | `false` inicialmente |
| `PAYMENTS_ENABLED` | `false` inicialmente | `false` inicialmente |
| `SETTLEMENTS_ENABLED` | `false` inicialmente | `false` inicialmente |

La aplicación sigue siendo de portfolio; si el despliegue final debe ser una demo **sin cobros reales**,
usar `APP_ENV=staging`, un sandbox y claves test también en el dominio público. No simular producción
con claves live ni cambiar las comprobaciones de entorno para aceptar una combinación incorrecta.

Usar TLS en conexiones remotas. Confirmar en el panel que las conexiones directa y pooled pertenecen
al mismo recurso/branch; el script solo puede validar su forma, no demostrar su identidad.
`NEXT_PUBLIC_APP_URL` solo queda como compatibilidad; usar `APP_URL` nuevo, no público.

Guardar variables locales en `web/.env.local` (ignoradas por Git). Los scripts las cargan.
No hacen falta las variables VITE ni una clave Stripe pública para este Checkout alojado.

## 3. Inicializar y comprobar staging

Desde `web/`, con las variables de staging ya disponibles:

El endpoint Stripe y su signing secret pueden crearse con la URL estable antes de inicializar la
base (sección 4, pasos 1–4). Completar también CRON_SECRET antes de ejecutar el comprobador.

```powershell
npm ci
npm run check:staging-env
$env:MIGRATION_APPROVED = 'true'
npm run db:migrate:deploy
```

No ejecutar `migrate dev`, `db push` ni `migrate reset` contra staging compartido/producción.
Las migraciones nunca se ejecutan automáticamente en el build.

Solo para una base demo aislada:

```powershell
$env:ALLOW_DEMO_SEED = 'true'
# Opcional: DEMO_USER_PASSWORD con al menos 10 caracteres.
npm run db:seed
```

El seed no borra datos; no debe usarse para trasladar producción. Usa fechas futuras.
Crear una cuenta desde la interfaz es preferible a mantener usuarios de prueba públicos.

## 4. Stripe y primera compra

1. Crear un sandbox separado del legacy. Otra API key de la misma cuenta/modo no aísla eventos.
2. Crear endpoint `https://<staging>/api/payments/webhook`.
3. Suscribir `checkout.session.completed`, `checkout.session.expired` y
   `checkout.session.async_payment_succeeded` (se aceptan tarjetas; no activar métodos diferidos
   sin ampliar las pruebas y la política de capacidad).
4. Guardar su signing secret y volver a desplegar.
5. Si Deployment Protection bloquea el webhook, configurar una excepción o bypass de automatización
   de Vercel compatible con el plan. No desactivar la comprobación de firma Stripe.
6. Activar `SETTLEMENTS_ENABLED=true`, después `WRITES_ENABLED=true` y `PAYMENTS_ENABLED=true`.
7. Redeploy y comprobar `/api/health`: debe responder 200.
8. Registrar usuario, iniciar sesión, buscar vuelo futuro, seleccionar pasajeros y asientos.
9. Completar un pago con tarjeta test oficial de Stripe. Comprobar entrega 2xx del webhook,
   exactamente una reserva PAID, importe/asientos correctos y PDF.
10. Probar cancelación explícita, doble clic, expiración y reenvío de un webhook.

Las sesiones nuevas llevan `app=yellow-airline-web`, `environment` y `orderId`.
Next ignora sesiones legacy sin estas etiquetas y el webhook legacy actualizado ignora sesiones Next.
No activar dos versiones de Next con el mismo APP_ENV y bases diferentes en el mismo sandbox.

Visitar `/success` no demuestra pago: la página consulta una compra propiedad del usuario.
Una cookie legacy en localStorage no se convierte en sesión nueva. Se requiere iniciar sesión otra vez;
los hashes bcrypt y las contraseñas se conservan.

## 5. Ensayo del traslado de PostgreSQL

Usar herramientas PostgreSQL compatibles con la versión de origen (pg_dump no debe ser anterior
al servidor). No exportar con redirecciones binarias de PowerShell: usar `--file`.

El operador debe proporcionar las variables `SOURCE_DATABASE_URL` y `TARGET_DIRECT_URL` de forma
segura. El destino debe ser una **base vacía de ensayo**, nunca una base que tenga datos a conservar.

```powershell
pg_dump --dbname="$env:SOURCE_DATABASE_URL" --format=custom --no-owner --no-privileges --file="yellow-airline-backup.dump"
pg_restore --dbname="$env:TARGET_DIRECT_URL" --no-owner --no-privileges --exit-on-error "yellow-airline-backup.dump"
```

No usar `--clean`, no seedear ni ejecutar migraciones iniciales antes de restaurar un dump completo.
El dump incluye `_prisma_migrations`, IDs, hashes, relaciones y secuencias.
Si el destino tiene tablas, abortar y preparar otra base vacía en lugar de sobreescribir.

Con `DATABASE_URL`/`DIRECT_URL` configuradas al origen, ejecutar `npm run db:verify` y guardar el
resumen fuera de Git. Repetir contra destino y comparar conteos, estados, importes y migraciones.
El comando es de lectura y funciona antes de la nueva migración.

También devuelve huellas SHA-256 de los datos históricos, conteo de emails duplicados y valores
de secuencias. Comparar las huellas con ambos servidores en la misma zona horaria de sesión.

Verificar también:
- Localizadores y stripeSessionId preservados, sin huérfanos.
- Secuencias de User/Flight/Booking mayores o iguales a los máximos IDs.
- Ausencia de duplicados de email ignorando mayúsculas (resolver manualmente sin perder cuentas).
- Usuarios existentes pueden iniciar sesión.
- Horas/moneda y sumas coinciden.

Después de restaurar, aplicar la migración nueva con el procedimiento aprobado y repetir verificaciones.
Para reservas antiguas sin asientos persistidos se muestra «Asignación pendiente»; no inventar asientos.
No reescribir precios antiguos: `finalPrice` es unitario; `totalAmount` nuevo está expresado en céntimos.

## 6. Trasladar primero la base productiva, si está en Railway

Hacer este paso con el sistema legacy conocido, **antes** de activar las compras Next.

1. Confirmar ensayo y backup restaurable; anunciar mantenimiento.
2. Railway: `LEGACY_WRITES_ENABLED=false` y redeploy. Esto bloquea registro, checkout y CRUD,
   no las lecturas ni los webhooks.
3. Dejar terminar las compras abiertas o expirarlas desde Stripe. Conciliar pagos recientes,
   pendientes y entregas fallidas con las reservas. No basta esperar un tiempo fijo.
4. Cuando no queden compras sin resolver, `LEGACY_WEBHOOK_ENABLED=false` y redeploy.
   Desactivar también cualquier otro escritor. El webhook devuelve 503 para conservar reintentos.
5. Hacer dump final, restaurar en base productiva nueva vacía y verificar datos/secuencias.
6. Cambiar `DATABASE_URL` de Railway a esa base. Confirmar también credenciales/SSL y conectividad.
7. Reanudar webhook legacy, verificar que los reintentos no duplican datos y conciliar de nuevo.
8. Reanudar escrituras legacy si se necesita un periodo de observación antes del cambio de aplicación.

`FLIGHT_ADMIN_TOKEN` restringe CRUD de vuelos legacy: sin token configurado queda bloqueado.
Si hace falta administración, usar token aleatorio >=32 caracteres solo desde herramientas de operador.
Nunca enviarlo desde el frontend.

## 7. Cambio final a Next.js

No activar Next si hay pagos legacy pendientes, tests fallidos o problemas de conciliación.

1. Conservar SHA, deployment ID y configuración de recuperación.
2. Repetir pausa de escrituras legacy y drenaje/conciliación de checkouts si se reabrieron.
3. Pausar webhook legacy y verificar ausencia de escritores.
4. Configurar las variables productivas de Next contra la **base productiva definitiva**, no staging.
5. Validar configuración y aplicar migraciones desde `web/`:

```powershell
npm run check:env
$env:MIGRATION_APPROVED = 'true'
$env:MIGRATION_BACKUP_CONFIRMED = 'true'
npm run db:migrate:deploy
npm run db:verify
```

6. Mantener flags de Next en false mientras se configura el proyecto y el endpoint live.
7. Para conservar `yellow-airline.vercel.app`, preferir el proyecto Vercel original:
   - Root `client` -> `web`.
   - Framework Vite -> Next.js.
   - Quitar override `dist`, rewrites Railway y fallback SPA.
   - Install `npm ci`, Build `npm run build`, Node 22.
   - Revisar variables **Production**, región y dominios.
   - Desactivar auto-publicación durante esta preparación o usar un despliegue candidato sin
     asignación automática del dominio, según las opciones de la cuenta.
8. Crear/validar webhook live de Next; configurar su signing secret. No redirigir el endpoint legacy
   sin considerar su signing secret y sus sesiones pendientes: los contratos de metadata difieren.
9. Publicar el candidato aprobado y activar settlements, luego escrituras/pagos; redeploy.
10. Mantener `LEGACY_WRITES_ENABLED=false` y `LEGACY_WEBHOOK_ENABLED=false` en Railway.
11. Comprobar health, login antiguo, compra controlada, webhook, reserva, total, asientos y PDF.
    En modo live habrá un cargo real: realizarlo solo con aprobación y gestionar su devolución.
12. Revisar reintentos fallidos de ambos endpoints Stripe; no descartar eventos sin conciliarlos.

No hacer un reparto de tráfico gradual entre sistemas con escritores independientes.
Pestañas antiguas o llamadas directas a Railway deben encontrar sus escrituras bloqueadas.

## 8. Operación, conciliación y alertas

El cron protegido `/api/cron/reconcile` está programado para las 04:00 UTC diariamente en producción
Vercel; la precisión depende del plan.
Necesita `CRON_SECRET`; Vercel añade `Authorization: Bearer ...`. Es una red de seguridad, no reemplaza
los webhooks. Comprueba hasta diez compras expiradas conocidas por ejecución.

Configurar alertas de:
- webhook no 2xx o backlog Stripe;
- pedidos REVIEW o CREATING antiguos;
- health 503, errores de API y saturación de conexiones;
- fallos del cron y más compras pendientes de las que puede procesar.

Durante lanzamiento y ante alertas:

```powershell
$env:RECONCILIATION_APPROVED = 'true'
npm run payments:reconcile
```

El script escribe estados de compra tras consultar Stripe. Procesa hasta 100 compras y devuelve
salida no cero si requiere atención o hay posible backlog. Identifica sesiones ocultas por timeouts
mediante metadata. No expone datos personales. Si la sesión es desconocida, **no libera plazas**.
Si imprime un cursor, repetir con `RECONCILIATION_CURSOR` igual a ese valor para continuar el lote.
Quitar el cursor en la siguiente revisión completa.
Investigar en Stripe y en los logs por orderId/sessionId; si procede, resolver mediante una operación
de soporte revisada y auditada. REVIEW nunca debe resolverse borrando la compra o repitiendo el cobro.
Puede requerir devolución manual y una corrección explícita, no una automatización ciega.

Mantenimiento normal: desactivar PAYMENTS_ENABLED/WRITES_ENABLED y mantener SETTLEMENTS_ENABLED=true.
Snapshot final: también SETTLEMENTS_ENABLED=false, pausar scripts/cron y todos los escritores legacy.
Restablecer después y atender los reintentos. No responder 2xx a un evento propio que no se haya procesado.

## 9. Rollback

### Antes de aceptar compras Next
Restaurar despliegue/configuración de Vite, mantener la base definitiva y reactivar el escritor legacy
tras verificar Stripe. No devolver el tráfico a una copia antigua de la base.

### Después de aceptar compras Next
1. Desactivar nuevas compras/registro; conservar la base definitiva y el historial.
2. Mantener el webhook Next procesando sus compras en un deployment/URL recuperable. Si el dominio
   cambia, actualizar y validar la entrega antes de retirar la URL anterior.
3. Conciliar todas las compras Next, incluidos CREATING/OPEN/REVIEW; no abrir el checkout legacy
   hasta cerrar las retenciones. Legacy no comprende esos bloqueos de capacidad.
4. Un rollback a una versión anterior de Next validada suele ser más seguro que volver a Express.
5. Si se vuelve a legacy, garantizar representación correcta de suplementos/asientos/precios nuevos:
   la interfaz antigua no muestra todos los campos. No reabrirla sin revisar esa compatibilidad.

Un rollback de Vercel no revierte esquemas, variables, Root Directory, dominios ni webhooks.
No ejecutar una migración destructiva inversa ni restaurar el dump previo sobre compras nuevas.

## 10. Retirada

Tras el periodo de observación aprobado (por ejemplo, 1–2 semanas), sin compras/reintentos pendientes:
- apagar Railway y revocar su acceso a PostgreSQL;
- retirar endpoint Stripe legacy después de revisar su historial de entregas;
- eliminar variables VITE y secretos antiguos;
- conservar backups conforme a la retención;
- archivar/eliminar client/server en una PR separada y retirar sus jobs/releases;
- mantener el proyecto Vercel de staging separado.

La limpieza estructural se hace al final, no durante el cambio productivo.
