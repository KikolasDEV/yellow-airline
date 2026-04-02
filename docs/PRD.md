# PRD - Yellow Airline

## Resumen Ejecutivo
Yellow Airline es una plataforma web para buscar vuelos, registrar usuarios, autenticar sesiones, crear reservas y consultar itinerarios personales. El producto actual ya cubre el flujo principal de descubrimiento y reserva, y se apoya en una propuesta diferenciadora de acceso VIP. Este PRD documenta el estado funcional del MVP, define los requisitos del producto y propone una direccion clara para su evolucion.

## Problema y Oportunidad
Los usuarios necesitan una experiencia simple y confiable para encontrar vuelos, registrarse, reservar plazas y revisar sus viajes futuros. En el estado actual, el producto resuelve el flujo base, pero aun tiene oportunidades de mejora en validaciones, claridad del beneficio VIP, consistencia funcional y preparacion para un uso mas cercano a produccion.

La oportunidad consiste en convertir el MVP actual en una experiencia de reservas mas robusta, clara y escalable, manteniendo una interfaz ligera y una operacion sencilla para el negocio.

## Objetivos del Producto
- Permitir que un usuario encuentre vuelos relevantes por origen y destino.
- Permitir el registro e inicio de sesion de forma simple.
- Permitir la creacion de reservas autenticadas con desglose de pasajeros.
- Evitar reservas duplicadas para el mismo usuario y vuelo.
- Respetar la capacidad disponible de cada vuelo.
- Consolidar la propuesta VIP como diferenciador del producto.

## Metas de Negocio
- Incrementar la conversion desde busqueda hasta reserva.
- Mejorar la retencion de usuarios registrados.
- Preparar el producto para una futura monetizacion o segmentacion VIP.
- Reducir errores operativos en reservas y autenticacion.

## Usuarios Objetivo
- Viajero ocasional que quiere buscar vuelos rapidamente.
- Usuario registrado que necesita reservar y consultar sus viajes.
- Usuario VIP interesado en beneficios o acceso exclusivo.
- Operador interno futuro que podria administrar vuelos y disponibilidad.

## Alcance Actual del MVP
El producto hoy soporta:
- Busqueda de vuelos por origen y destino.
- Listado de vuelos ordenado por fecha de salida.
- Registro de usuario con nombre, email, pasaporte y contrasena.
- Inicio de sesion con token JWT.
- Reserva autenticada de vuelos.
- Desglose de pasajeros por adultos, ninos e infantes.
- Prevencion de reservas duplicadas por usuario y vuelo.
- Validacion de capacidad de vuelo antes de confirmar una reserva.
- Consulta de reservas propias del usuario.
- Pantalla de acceso y registro orientada a membresia VIP.

## Casos de Uso Principales
### 1. Buscar vuelos
Como usuario, quiero filtrar vuelos por origen y destino para encontrar opciones relevantes.

### 2. Registrarme
Como usuario nuevo, quiero crear una cuenta para poder reservar vuelos.

### 3. Iniciar sesion
Como usuario registrado, quiero autenticarme para acceder a mis reservas y realizar nuevas compras.

### 4. Reservar un vuelo
Como usuario autenticado, quiero reservar un vuelo indicando la cantidad de pasajeros para confirmar mi viaje.

### 5. Consultar mis reservas
Como usuario autenticado, quiero ver mis reservas confirmadas para revisar mi itinerario.

### 6. Acceder al area VIP
Como usuario interesado en beneficios premium, quiero acceder a la zona VIP para unirme o interactuar con la propuesta diferencial de la marca.

## Requisitos Funcionales
### RF-01 Busqueda de vuelos
- El sistema debe permitir buscar vuelos por origen.
- El sistema debe permitir buscar vuelos por destino.
- El sistema debe devolver resultados ordenados por fecha de salida ascendente.

### RF-02 Registro de usuario
- El sistema debe permitir registrar usuarios con nombre, email, pasaporte y contrasena.
- El sistema debe impedir el registro de emails duplicados.
- El sistema debe almacenar la contrasena de forma segura mediante hash.

### RF-03 Inicio de sesion
- El sistema debe autenticar usuarios por email y contrasena.
- El sistema debe devolver un token JWT valido al iniciar sesion.
- El sistema debe informar credenciales incorrectas con un mensaje claro.

### RF-04 Reserva de vuelos
- El sistema debe permitir crear reservas solo a usuarios autenticados.
- El sistema debe permitir indicar adultos, ninos e infantes en cada reserva.
- El sistema debe impedir que un usuario reserve el mismo vuelo dos veces.
- El sistema debe impedir reservas cuando no haya asientos suficientes.
- El sistema debe confirmar la reserva devolviendo la informacion creada.

### RF-05 Consulta de reservas
- El sistema debe permitir al usuario autenticado consultar sus reservas.
- Cada reserva debe incluir la informacion del vuelo asociado.

### RF-06 Segmentacion VIP
- El sistema debe identificar si un usuario es VIP.
- El frontend debe exponer una experiencia vinculada a la propuesta VIP.

## Reglas de Negocio
- Un usuario no puede tener dos reservas para el mismo vuelo.
- Los adultos y ninos ocupan asiento.
- Los infantes no consumen asiento en la validacion actual.
- Una reserva requiere autenticacion previa.
- El email del usuario debe ser unico.
- Actualmente todos los usuarios nuevos quedan marcados como VIP.

## Requisitos No Funcionales
- La API debe responder en formato JSON.
- El sistema debe usar autenticacion basada en JWT.
- La informacion persistente debe almacenarse en PostgreSQL mediante Prisma.
- La interfaz debe ser usable en desktop y mobile.
- Los errores de red, validacion y autenticacion deben mostrarse con mensajes claros.
- Las contrasenas no deben almacenarse en texto plano.

## Experiencia de Usuario
- La busqueda de vuelos debe sentirse inmediata y simple.
- El flujo de login y registro debe requerir la menor friccion posible.
- El usuario debe entender facilmente si una reserva fue exitosa o rechazada.
- La seccion de reservas debe servir como panel personal de viajes confirmados.
- La propuesta VIP debe sentirse intencional y no solo decorativa.

## Dependencias Tecnicas
- Frontend: React 19, Vite, TypeScript, Tailwind, react-router-dom, react-hook-form, i18next.
- Backend: Express 5, Prisma, PostgreSQL, bcrypt, JWT.
- Persistencia: base de datos relacional con modelos de User, Flight y Booking.

## Riesgos Actuales
- La suite automatizada actual cubre pricing y un smoke flow de la home, pero aun no cubre login, reserva autenticada ni consultas de reservas end to end.
- La propuesta VIP aun no expresa beneficios funcionales claros dentro del producto.
- Hay mezcla de copy en espanol e ingles, lo que afecta consistencia de marca.
- El secreto JWT tiene un fallback en codigo y debe depender solo del entorno en una version mas madura.
- El producto todavia no expone funciones administrativas completas para operar vuelos en produccion.

## Metricas de Exito
- Tasa de conversion de busqueda a reserva.
- Tasa de conversion de registro a primera reserva.
- Porcentaje de reservas rechazadas por capacidad o duplicidad.
- Cantidad de usuarios autenticados activos.
- Cantidad de usuarios que visitan y completan el flujo VIP.
- Tasa de retorno a la pantalla de reservas.

## Roadmap Recomendado
### Fase 1: Robustez del MVP
- Fortalecer validaciones de entrada en frontend y backend.
- Eliminar configuraciones inseguras por defecto.
- Estandarizar mensajes de error y estados de carga.

### Fase 2: Mejora de la experiencia de reserva
- Agregar mas filtros de vuelos, como fecha o rango de precio.
- Mostrar informacion de disponibilidad de forma mas explicita.
- Mejorar confirmaciones y detalle de reserva.

### Fase 3: Producto VIP real
- Definir beneficios concretos para usuarios VIP.
- Diferenciar claramente usuarios estandar y VIP.
- Introducir restricciones o beneficios exclusivos visibles en la UI.

### Fase 4: Operacion y escalabilidad
- Incorporar herramientas administrativas para gestion de vuelos.
- Agregar analitica y trazabilidad de conversion.
- Introducir testing automatizado y monitoreo basico.

## Fuera de Alcance por Ahora
- Pagos en linea.
- Seleccion de asientos.
- Check-in digital.
- Notificaciones transaccionales por email o SMS.
- Panel administrativo completo.

## Criterios de Exito del Siguiente Ciclo
- Un usuario nuevo puede registrarse, iniciar sesion, buscar un vuelo y reservarlo sin asistencia.
- El sistema bloquea correctamente duplicados y sobreventa.
- El usuario puede consultar sus reservas sin errores.
- La propuesta VIP queda definida con al menos un beneficio funcional real.
