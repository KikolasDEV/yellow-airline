# PRD - Yellow Airline

## Resumen Ejecutivo

Yellow Airline es una plataforma web de reservas de vuelos con propuesta visual premium, experiencia VIP, pagos con Stripe y panel de reservas personales. El producto actual ya supera el MVP inicial: no solo permite buscar e iniciar sesión, sino también personalizar una reserva, pagar, persistir la compra tras webhook y generar un boarding pass.

Este PRD refleja el estado actual del producto y plantea una base clara para la siguiente etapa de evolución.

## Problema y Oportunidad

Los usuarios necesitan una experiencia clara, moderna y confiable para:

- descubrir vuelos relevantes
- registrarse e iniciar sesión sin fricción
- reservar con confianza
- entender el precio y la disponibilidad
- consultar sus viajes posteriores a la compra

La oportunidad del producto es combinar una experiencia de compra de vuelos sencilla con una identidad más premium y una propuesta VIP diferenciadora.

## Objetivos del Producto

- Permitir que el usuario encuentre vuelos por origen y destino de forma rápida.
- Permitir autenticación y acceso privado a sus reservas.
- Permitir reservas autenticadas con configuración de pasajeros y asientos.
- Cobrar mediante Stripe Checkout en modo test con arquitectura correcta basada en webhook.
- Mostrar reservas confirmadas y permitir generar boarding pass en PDF.
- Mantener una experiencia responsive, bilingüe y visualmente cuidada.

## Metas de Negocio

- Incrementar la conversión desde búsqueda hasta pago.
- Mejorar la retención de usuarios registrados.
- Reforzar el valor percibido de la experiencia VIP.
- Reducir errores operativos en precios, capacidad y duplicados.
- Preparar el producto para una evolución más madura sin rehacer la base técnica.

## Usuarios Objetivo

- Viajero ocasional que quiere encontrar un vuelo rápidamente.
- Usuario autenticado que quiere reservar y revisar sus viajes.
- Usuario atraído por una experiencia premium/VIP.
- Operador o administrador futuro que podría gestionar inventario y disponibilidad.

## Estado Actual del Producto

Hoy el sistema soporta:

- búsqueda de vuelos por origen y destino
- listado de vuelos con precio dinámico
- inventario y disponibilidad real calculados en backend
- registro e inicio de sesión con JWT
- zona VIP y formulario de alta
- selección de pasajeros antes del pago
- selección visual de asientos
- cálculo de total estimado en frontend y validación real en backend
- creación de Stripe Checkout Session
- creación de la reserva tras `checkout.session.completed`
- pantalla de éxito y cancelación de pago
- consulta de reservas propias
- descarga de boarding pass en PDF con QR
- soporte de tema claro/oscuro
- soporte de español e inglés
- tests unitarios y E2E integrados en CI

## Casos de Uso Principales

### 1. Buscar vuelos

Como usuario, quiero buscar vuelos por origen y destino para descubrir opciones relevantes.

### 2. Registrarme

Como usuario nuevo, quiero crear una cuenta para poder acceder a funciones privadas y reservar.

### 3. Iniciar sesión

Como usuario registrado, quiero autenticarme y recuperar acceso a mis reservas.

### 4. Reservar un vuelo

Como usuario autenticado, quiero elegir pasajeros, seleccionar asientos y pasar al pago para confirmar mi viaje.

### 5. Pagar un vuelo

Como usuario autenticado, quiero completar el pago en Stripe con confianza y volver al producto con feedback claro.

### 6. Consultar mis reservas

Como usuario autenticado, quiero revisar mis reservas confirmadas y su información.

### 7. Descargar un boarding pass

Como usuario con una reserva pagada, quiero descargar un boarding pass en PDF con QR.

### 8. Interactuar con la propuesta VIP

Como usuario interesado en beneficios premium, quiero ver una experiencia VIP clara y coherente con la marca.

## Requisitos Funcionales

### RF-01 Búsqueda de vuelos

- El sistema debe permitir buscar por origen.
- El sistema debe permitir buscar por destino.
- El sistema debe devolver vuelos ordenados por fecha de salida ascendente.
- El backend debe devolver precio base, precio final y disponibilidad.

### RF-02 Registro de usuario

- El sistema debe permitir registro con nombre, email, pasaporte y contraseña.
- El sistema debe impedir emails duplicados.
- El sistema debe almacenar la contraseña mediante hash.

### RF-03 Inicio de sesión

- El sistema debe autenticar por email y contraseña.
- El sistema debe devolver un JWT válido.
- El frontend debe persistir el token para uso posterior.

### RF-04 Reserva autenticada

- Solo un usuario autenticado puede iniciar una reserva.
- El sistema debe permitir elegir adultos, niños e infantes.
- El sistema debe permitir seleccionar asientos en frontend.
- El sistema debe impedir reservas duplicadas por usuario y vuelo.
- El sistema debe impedir reservas cuando no haya capacidad suficiente.

### RF-05 Pago con Stripe

- El backend debe crear una Checkout Session válida.
- El usuario debe ser redirigido a Stripe.
- La reserva real debe crearse tras webhook exitoso.

### RF-06 Consulta de reservas

- El usuario autenticado debe poder consultar sus reservas.
- Cada reserva debe incluir datos del vuelo asociado.
- Las reservas pagadas deben poder generar boarding pass.

### RF-07 Boarding pass

- El sistema debe permitir descargar un PDF para reservas `PAID`.
- El PDF debe incluir QR, referencia de reserva y datos relevantes del vuelo.

### RF-08 Internacionalización

- La interfaz debe soportar español e inglés de forma consistente.
- Los textos visibles, estados y labels deben adaptarse al idioma activo.

### RF-09 Experiencia visual

- La interfaz debe ser responsive.
- La jerarquía visual debe priorizar búsqueda, oferta e inventario.
- La experiencia debe sentirse premium y coherente entre páginas.

## Reglas de Negocio

- Un usuario no puede reservar el mismo vuelo dos veces.
- Los adultos y niños consumen asiento.
- Los infantes no consumen asiento en la lógica actual.
- Solo las reservas `PAID` cuentan para ocupación y disponibilidad reales.
- El precio final depende de precio base, ocupación y urgencia temporal.
- La reserva definitiva no se crea desde el frontend, sino tras confirmación de Stripe por webhook.
- El email del usuario debe ser único.
- El QR del boarding pass no debe incluir datos personales sensibles.

## Requisitos No Funcionales

- La API debe responder en JSON.
- El backend debe usar JWT para autenticación.
- Los datos persistentes deben almacenarse en PostgreSQL mediante Prisma.
- La UI debe ser usable en desktop y mobile.
- El producto debe soportar light/dark mode.
- El producto debe soportar español e inglés.
- El código debe poder validarse con lint, build y tests automatizados.
- El flujo de release debe estar automatizado por componente.

## Experiencia de Usuario

- La home debe mostrar primero lo más importante: búsqueda, propuesta de valor y vuelos.
- El flujo de login debe ser simple y rápido.
- El flujo de reserva debe sentirse guiado y claro.
- El estado de éxito o cancelación tras el pago debe orientar al usuario.
- La zona VIP debe sentirse intencional, no decorativa.
- El panel de reservas debe permitir consultar y actuar, no solo listar información.

## Dependencias Técnicas

### Frontend

- React 19
- Vite
- TypeScript
- Tailwind CSS
- Framer Motion
- react-hook-form
- Zod
- i18next
- Vitest
- Playwright

### Backend

- Express 5
- Prisma
- PostgreSQL
- bcrypt
- JWT
- Stripe
- Vitest

## Testing y Calidad

Estado actual:

- frontend unit tests con Vitest
- backend unit tests con Vitest
- frontend E2E con Playwright
- CI en PRs a `main`
- workflow de seguridad en PRs

Flujos E2E ya cubiertos:

- home
- login
- booking autenticado
- my-bookings

## Riesgos Actuales

- La seguridad JWT puede endurecerse eliminando fallbacks inseguros por defecto.
- La propuesta VIP aún puede evolucionar hacia beneficios funcionales más tangibles.
- El backend no expone todavía una capa administrativa madura para operar inventario.
- El cliente frontend sigue usando `fetch` directo en varios puntos y aún puede centralizar mejor su acceso API.
- La cobertura automatizada es buena para la base actual, pero todavía ampliable.

## Métricas de Éxito

- Conversión de búsqueda a inicio de reserva.
- Conversión de inicio de reserva a pago completado.
- Conversión de registro a primera reserva.
- Porcentaje de rechazos por duplicidad o capacidad.
- Uso de `My Bookings` tras compra.
- Interacción con la experiencia VIP.

## Roadmap Recomendado

### Fase 1: Robustez y seguridad

- eliminar fallbacks inseguros de configuración
- ampliar tests backend
- endurecer validaciones y errores

### Fase 2: Producto VIP real

- definir beneficios concretos visibles y medibles
- diferenciar más la experiencia VIP frente al usuario estándar

### Fase 3: Operación y escalado

- incorporar funciones administrativas
- añadir analítica y observabilidad
- mejorar tooling operativo

### Fase 4: Madurez de plataforma

- centralizar acceso API frontend
- ampliar cobertura de tests de integración
- evolucionar experiencia post-compra y fidelización

## Fuera de Alcance por Ahora

- panel administrativo completo
- check-in digital completo
- notificaciones transaccionales por email o SMS
- operaciones multi-aeropuerto complejas
- gestión avanzada de tarifas por clases o equipaje

## Criterios de Éxito del Siguiente Ciclo

- Un usuario nuevo puede registrarse, iniciar sesión, buscar, reservar, pagar y revisar su reserva sin asistencia.
- El sistema mantiene bloqueados duplicados y sobreventa.
- Las releases de `client` y `server` se generan sin conflictos.
- El producto mejora seguridad y claridad funcional sin perder agilidad de desarrollo.
