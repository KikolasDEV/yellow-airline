# PRD

## Resumen

Yellow Airline es una aplicación web de reservas de vuelos con una experiencia visual cuidada y un flujo completo desde búsqueda hasta reserva pagada. El proyecto está planteado como producto de portfolio, pero modela piezas reales de una aplicación comercial: autenticación, pricing dinámico, Stripe Checkout, webhook, reservas persistidas y panel personal.

## Objetivo del producto

Ofrecer una experiencia clara para:

- descubrir vuelos disponibles
- registrarse e iniciar sesión
- reservar con confianza
- completar el pago en Stripe
- consultar reservas posteriores a la compra

## Usuario objetivo

- Usuario que quiere encontrar y reservar un vuelo rápidamente.
- Usuario autenticado que necesita revisar sus viajes.
- Usuario atraído por una capa VIP de marca y experiencia.

## Alcance actual

El producto hoy permite:

- búsqueda por origen y destino
- calendario de fechas con resultados rápidos
- listado de vuelos con precio y disponibilidad
- registro e inicio de sesión
- acceso a experiencia VIP
- selección de pasajeros y asientos
- inicio de pago con Stripe Checkout
- creación de reserva tras webhook
- consulta de `My Bookings`
- descarga de boarding pass en PDF con QR
- soporte `es/en`
- tema claro y oscuro

## Requisitos funcionales

### RF-01 Búsqueda

- Buscar vuelos por origen y destino.
- Filtrar por fecha de salida.
- Mostrar precio final y disponibilidad.

### RF-02 Autenticación

- Registro con nombre, email, pasaporte y contraseña.
- Login con JWT.
- Persistencia de sesión en frontend.

### RF-03 Reserva

- Solo un usuario autenticado puede reservar.
- El usuario puede elegir adultos, niños e infantes.
- El usuario puede seleccionar asientos antes del pago.

### RF-04 Pago

- El backend crea una Checkout Session válida.
- El usuario es redirigido a Stripe.
- La reserva real se crea tras webhook exitoso.

### RF-05 Post-compra

- El usuario puede consultar sus reservas.
- Las reservas pagadas pueden generar boarding pass PDF.

## Requisitos no funcionales

- Frontend responsive.
- API en JSON.
- PostgreSQL como persistencia.
- Integración real con Stripe.
- Validación con lint, build y tests automatizados.
- Despliegue real en producción.

## Flujo principal

```text
Home -> Search -> Reserve -> Stripe Checkout -> Webhook -> My Bookings
```

## Estado actual

El proyecto ya está por encima de una demo visual básica. Tiene una base suficiente para enseñar:

- criterio de producto
- arquitectura separada frontend/backend
- integración de pagos
- despliegue real
- testing automatizado
