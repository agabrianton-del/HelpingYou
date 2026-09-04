# 💙 HelpingYou

<div align="center">

# HelpingYou
### *Helping without discrimination. Guiding without prejudice.*

Una plataforma diseñada para ofrecer orientación, apoyo y acompañamiento de forma totalmente anónima, segura y accesible para cualquier persona que necesite ayuda.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-Apache%202.0-green)
![Status](https://img.shields.io/badge/status-Development-orange)
![Platform](https://img.shields.io/badge/platform-Cross--Platform-blueviolet)
![Privacy](https://img.shields.io/badge/privacy-Anonymous-success)
![Security](https://img.shields.io/badge/security-End--to--End-important)

</div>

---

# 📖 Índice

- Introducción
- Visión del proyecto
- Misión
- Objetivos
- Problema que resuelve
- Público objetivo
- Filosofía
- Principios
- Características principales
- Arquitectura general
- Tecnologías
- Estado del proyecto
- Licencia

---

# Introducción

HelpingYou nace con un propósito muy claro:

**que cualquier persona pueda encontrar ayuda sin sentirse juzgada.**

Muchas personas necesitan orientación, alguien con quien hablar o simplemente información fiable, pero no buscan ayuda por miedo, vergüenza o falta de recursos.

HelpingYou pretende eliminar esas barreras mediante una plataforma donde la privacidad, la seguridad y el anonimato sean prioritarios.

---

# 🌍 Visión

Construir la mayor plataforma internacional de ayuda anónima.

No queremos ser únicamente una aplicación de mensajería.

Queremos convertirnos en un ecosistema donde millones de personas puedan:

- pedir ayuda
- ofrecer ayuda
- encontrar recursos
- aprender
- sentirse acompañadas
- acceder a profesionales cuando lo necesiten

sin importar su país, idioma, edad, cultura o situación económica.

---

# 🎯 Misión

Nuestra misión consiste en conectar personas con personas.

HelpingYou quiere demostrar que la tecnología también puede utilizarse para mejorar la vida de los demás.

La plataforma se basa en cuatro pilares fundamentales:

- Privacidad
- Seguridad
- Anonimato
- Empatía

---

# Objetivos

HelpingYou busca:

- reducir la soledad
- facilitar el acceso a ayuda
- conectar voluntarios
- conectar profesionales
- reducir el miedo a pedir ayuda
- fomentar comunidades positivas
- ofrecer información fiable
- combatir la desinformación
- crear una red internacional de apoyo

---

# Problema que resuelve

Actualmente existen muchos problemas:

- miedo a ser juzgado
- miedo al rechazo
- falta de recursos
- listas de espera
- barreras económicas
- barreras culturales
- barreras lingüísticas
- falta de anonimato

HelpingYou intenta reducir todas esas barreras.

---

# Público objetivo

HelpingYou está pensado para cualquier persona.

Ejemplos:

- estudiantes
- adolescentes
- adultos
- personas mayores
- familias
- inmigrantes
- desempleados
- personas que necesitan orientación
- voluntarios
- psicólogos
- asociaciones
- ONG
- fundaciones
- comunidades

---

# Filosofía

HelpingYou se basa en una idea muy sencilla:

> Nadie debería sentirse solo cuando necesita ayuda.

La plataforma no discrimina por:

- nacionalidad
- idioma
- religión
- género
- orientación sexual
- situación económica
- discapacidad
- edad

Todo el mundo merece ser escuchado.

---

# Principios

## Privacidad

La privacidad siempre será una prioridad.

## Seguridad

Los datos estarán protegidos utilizando tecnologías modernas.

## Transparencia

El proyecto será abierto respecto a su funcionamiento y evolución.

## Accesibilidad

HelpingYou pretende ser sencillo de utilizar para cualquier usuario.

## Escalabilidad

La arquitectura está diseñada para crecer sin perder rendimiento.

---

# Características principales

Entre las funciones previstas se encuentran:

- Chat privado.
- Chats grupales.
- Videollamadas.
- Llamadas de voz.
- Streaming.
- Creación de comunidades.
- Sistema de voluntariado.
- Perfiles anónimos.
- Recursos de ayuda.
- Motor de búsqueda.
- Sistema de moderación.
- Reportes.
- Bloqueo de usuarios.
- Traducción automática.
- Notificaciones.
- Panel administrativo.
- Estadísticas.
- Sistema de reputación.
- Roles y permisos.
- API pública.
- Arquitectura modular.

---

# Arquitectura general

HelpingYou estará dividido en distintos módulos independientes para facilitar su mantenimiento.

Entre ellos:

- Frontend
- Backend
- Base de datos
- API
- Sistema de autenticación
- Sistema de mensajería
- Streaming
- Videollamadas
- Notificaciones
- Administración
- Analíticas

Esta separación permitirá que el proyecto pueda evolucionar durante muchos años.

---

# Tecnologías previstas

Backend:

- Node.js
- Express

Frontend:

- Flutter

Base de datos:

- PostgreSQL
- Redis

Servicios:

- WebSockets
- WebRTC
- Docker
- GitHub Actions

Seguridad:

- JWT
- HTTPS
- Cifrado End-to-End
- Rate Limiting

---

# Estado del proyecto

Actualmente HelpingYou se encuentra en fase de desarrollo.

Durante esta etapa se están definiendo:

- arquitectura
- documentación
- funcionalidades
- diseño
- experiencia de usuario
- infraestructura
- seguridad

El objetivo es construir una base sólida antes del lanzamiento de la primera versión pública.

---

# Licencia

Este proyecto se distribuye bajo la licencia **Apache License 2.0**.

Esto permite utilizar, modificar y distribuir el software respetando los términos de dicha licencia.

Consulta el archivo `LICENSE` para obtener más información.

---

**HelpingYou**

*"Helping without discrimination. Guiding without prejudice."*
Entrega 2 — Arquitectura General del Sistema

💙 HelpingYou

Arquitectura, Diseño Técnico y Funcionamiento de la Plataforma

---

Introducción

HelpingYou no se plantea como una aplicación convencional de ayuda entre usuarios. Su arquitectura ha sido diseñada desde el principio para ofrecer una plataforma altamente escalable, segura, modular y preparada para crecer durante muchos años sin necesidad de rehacer completamente el sistema.

La filosofía del proyecto consiste en separar claramente cada responsabilidad del software, permitiendo que cada servicio evolucione de forma independiente.

Esta arquitectura facilitará:

- mantenimiento sencillo;
- incorporación de nuevas funciones;
- mayor estabilidad;
- alta disponibilidad;
- escalabilidad horizontal;
- facilidad para auditorías de seguridad;
- adaptación a futuras tecnologías.

---

Filosofía Arquitectónica

HelpingYou seguirá una arquitectura basada en servicios desacoplados.

Cada módulo será responsable únicamente de una función específica.

Ejemplos:

- autenticación;
- mensajería;
- videollamadas;
- streaming;
- pagos;
- inteligencia artificial;
- notificaciones;
- analíticas;
- moderación.

Esta separación evita que un fallo en un componente afecte al resto del sistema.

---

Arquitectura por Capas

La plataforma estará dividida en varias capas perfectamente diferenciadas.

Capa Cliente

Es la aplicación utilizada por el usuario.

Disponible para:

- Android
- iOS
- Web

Responsabilidades:

- interfaz gráfica;
- navegación;
- reproducción multimedia;
- consumo de API;
- almacenamiento temporal;
- caché local.

---

Capa API

Será el punto de entrada para todas las peticiones.

Responsabilidades:

- autenticación;
- validación;
- autorización;
- limitación de peticiones;
- registro de actividad;
- control de errores.

---

Capa de Servicios

Aquí reside toda la lógica del negocio.

Cada servicio será independiente.

Ejemplos:

- Servicio de Usuarios
- Servicio de Chat
- Servicio de Streaming
- Servicio de Videollamadas
- Servicio IA
- Servicio Moderación
- Servicio Pagos
- Servicio Notificaciones

---

Base de Datos

Se utilizarán diferentes bases de datos según la necesidad.

No toda la información debe almacenarse en el mismo motor.

Ejemplo:

Usuarios:

- PostgreSQL

Chats:

- MongoDB

Cache:

- Redis

Archivos:

- almacenamiento en la nube compatible con S3.

---

Flujo General del Sistema

1. El usuario inicia sesión.
2. Se valida la identidad.
3. Se genera un token seguro.
4. El cliente consume la API.
5. La API consulta el servicio correspondiente.
6. El servicio accede a la base de datos.
7. Se devuelve la respuesta.
8. La interfaz actualiza la información en tiempo real.

Todo este proceso debe realizarse en pocos milisegundos para ofrecer una experiencia fluida.

---

Arquitectura Modular

HelpingYou crecerá mediante módulos.

Cada módulo podrá actualizarse sin detener toda la plataforma.

Ejemplos:

Módulo Chat

↓

Nueva versión

↓

Se despliega únicamente dicho módulo.

Los demás continúan funcionando normalmente.

Esto reduce enormemente el tiempo de inactividad.

---

Sistema de Mensajería

El chat será uno de los componentes principales.

Características:

- tiempo real;
- mensajes instantáneos;
- edición;
- eliminación;
- respuestas;
- reacciones;
- archivos;
- imágenes;
- vídeos;
- documentos;
- audio;
- ubicación.

Preparado para millones de mensajes diarios.

---

Videollamadas

HelpingYou integrará un sistema propio de videollamadas.

Funciones previstas:

- llamadas individuales;
- llamadas grupales;
- compartir pantalla;
- cancelación de ruido;
- subtítulos automáticos;
- traducción en tiempo real;
- cifrado de extremo a extremo.

---

Streaming Integrado

La plataforma incorporará retransmisiones en directo.

Permitirá:

- eventos;
- conferencias;
- talleres;
- charlas;
- sesiones educativas;
- directos solidarios;
- entrevistas.

Los espectadores podrán interactuar mediante un chat moderado y recibir notificaciones cuando comience una emisión.

---

Inteligencia Artificial

La IA actuará como apoyo, nunca como sustituto del contacto humano.

Podrá ayudar en:

- orientación inicial;
- clasificación de consultas;
- recomendaciones de recursos;
- traducción automática;
- resúmenes de conversaciones;
- detección de lenguaje ofensivo;
- asistencia contextual.

Siempre respetando la privacidad del usuario.

---

Sistema de Notificaciones

HelpingYou contará con un sistema inteligente de notificaciones.

Tipos:

- push;
- correo electrónico;
- notificaciones internas;
- recordatorios;
- avisos de seguridad;
- alertas importantes.

Cada usuario podrá personalizar qué desea recibir.

---

Seguridad

La seguridad será uno de los pilares fundamentales del proyecto.

Se implementarán medidas como:

- cifrado de datos en tránsito;
- cifrado de datos almacenados;
- autenticación multifactor;
- protección frente a ataques automatizados;
- limitación de intentos de acceso;
- auditorías de seguridad;
- registros de eventos;
- copias de seguridad automáticas.

---

Escalabilidad

HelpingYou estará preparada para crecer desde unos pocos usuarios hasta millones.

La infraestructura permitirá:

- añadir nuevos servidores;
- balancear carga automáticamente;
- distribuir servicios;
- escalar bases de datos;
- replicar información;
- reducir tiempos de respuesta.

---

Monitorización

Todos los servicios estarán monitorizados continuamente.

Se supervisarán aspectos como:

- uso de CPU;
- memoria;
- latencia;
- errores;
- disponibilidad;
- tráfico;
- rendimiento.

Esto permitirá detectar incidencias antes de que afecten a los usuarios.

---

Objetivo Técnico

El objetivo de esta arquitectura es construir una plataforma moderna, robusta y preparada para evolucionar durante años sin comprometer el rendimiento, la seguridad ni la experiencia de usuario. Cada decisión técnica estará orientada a garantizar un servicio estable, escalable y fiable, capaz de convertirse en una referencia dentro del ámbito de la ayuda, el acompañamiento y la colaboración digital.
Entrega 3 — Diseño Completo de la Base de Datos

💙 HelpingYou

Arquitectura de Datos, Modelado, Seguridad y Escalabilidad

---

Introducción

La base de datos constituye el núcleo de HelpingYou. En ella se almacenará toda la información necesaria para el funcionamiento de la plataforma: usuarios, perfiles, conversaciones, videollamadas, retransmisiones, recursos, notificaciones, sistemas de moderación, registros de actividad, configuraciones y métricas.

El diseño se ha planteado siguiendo principios de escalabilidad, seguridad, integridad y rendimiento. No se utilizará un único motor de base de datos para todos los datos; cada tipo de información se almacenará en la tecnología más adecuada a su naturaleza.

Los objetivos principales son:

- Garantizar la integridad de los datos.
- Proteger la privacidad de los usuarios.
- Facilitar consultas rápidas incluso con millones de registros.
- Reducir el riesgo de pérdida de información.
- Permitir el crecimiento horizontal de la plataforma.

---

Filosofía de almacenamiento

HelpingYou utilizará un enfoque de persistencia poliglota, donde diferentes motores de almacenamiento convivirán para aprovechar las ventajas de cada uno.

Distribución propuesta:

- PostgreSQL para datos relacionales.
- MongoDB para conversaciones y documentos flexibles.
- Redis para caché, sesiones y datos temporales.
- Almacenamiento compatible con S3 para imágenes, vídeos y archivos.
- Motor de búsqueda para búsquedas rápidas de usuarios, recursos y contenidos.

Esta separación mejora el rendimiento y simplifica el mantenimiento.

---

Modelo principal de entidades

Las entidades principales del sistema incluyen:

- Usuarios.
- Perfiles.
- Roles.
- Permisos.
- Conversaciones.
- Mensajes.
- Archivos adjuntos.
- Videollamadas.
- Streaming.
- Notificaciones.
- Recursos compartidos.
- Reportes.
- Moderación.
- Auditoría.
- Configuración.
- Estadísticas.

Cada entidad estará relacionada mediante claves primarias y foráneas cuando corresponda.

---

Tabla de usuarios

La tabla de usuarios será el eje central del sistema.

Información almacenada:

- Identificador único.
- Nombre visible.
- Correo electrónico (si existe).
- Método de autenticación.
- Estado de la cuenta.
- Fecha de creación.
- Último acceso.
- Idioma preferido.
- Zona horaria.
- Configuración de privacidad.
- Estado de verificación.
- Preferencias generales.

Las contraseñas nunca se almacenarán en texto plano y se conservarán únicamente mediante algoritmos de hash seguros.

---

Tabla de perfiles

Cada usuario dispondrá de un perfil independiente.

Datos posibles:

- Fotografía.
- Biografía.
- Idiomas.
- Intereses.
- Disponibilidad.
- País.
- Ciudad (opcional).
- Redes sociales (opcionales).
- Insignias.
- Nivel de experiencia.
- Estadísticas públicas.

Separar el perfil del usuario facilita futuras ampliaciones sin modificar la estructura principal.

---

Sistema de roles y permisos

HelpingYou implementará un modelo de control de acceso basado en roles.

Ejemplos:

- Usuario.
- Voluntario.
- Moderador.
- Administrador.
- Superadministrador.
- Equipo de soporte.

Cada rol dispondrá de permisos independientes y fácilmente ampliables.

---

Conversaciones

Las conversaciones almacenarán únicamente la información necesaria para identificar a los participantes.

Campos principales:

- Identificador.
- Tipo de conversación.
- Participantes.
- Fecha de creación.
- Última actividad.
- Estado.
- Configuración.

Los mensajes se almacenarán de forma separada para optimizar las consultas.

---

Mensajes

Cada mensaje incluirá:

- Identificador.
- Conversación.
- Remitente.
- Tipo de contenido.
- Texto.
- Archivos asociados.
- Fecha.
- Estado de entrega.
- Estado de lectura.
- Fecha de edición.
- Fecha de eliminación.

Este diseño permite mantener el historial y mejorar el rendimiento.

---

Archivos multimedia

Las imágenes, vídeos y documentos no se almacenarán directamente en la base de datos.

Únicamente se guardarán:

- Identificador.
- Ruta del archivo.
- Tipo.
- Tamaño.
- Hash.
- Propietario.
- Fecha de subida.
- Permisos.

Los archivos físicos residirán en un sistema de almacenamiento escalable.

---

Videollamadas

Cada sesión registrará:

- ID.
- Participantes.
- Hora de inicio.
- Hora de finalización.
- Duración.
- Calidad de conexión.
- Estado.
- Incidencias técnicas.

No se almacenará el contenido de las llamadas salvo consentimiento expreso y cuando exista una función específica que lo requiera.

---

Streaming

Cada retransmisión incluirá:

- Título.
- Descripción.
- Organizador.
- Fecha.
- Estado.
- Número de espectadores.
- Estadísticas.
- Chat asociado.
- Duración.

Las métricas permitirán conocer el impacto de cada evento.

---

Sistema de notificaciones

Cada notificación registrará:

- Usuario destinatario.
- Tipo.
- Contenido.
- Prioridad.
- Fecha de creación.
- Fecha de lectura.
- Estado.

Se evitará el envío de notificaciones duplicadas mediante identificadores únicos.

---

Sistema de moderación

HelpingYou dispondrá de herramientas específicas para mantener un entorno seguro.

Se almacenarán:

- Reportes.
- Motivo.
- Evidencias.
- Usuario reportado.
- Moderador asignado.
- Resolución.
- Fecha.
- Historial de acciones.

Todo quedará registrado para garantizar la trazabilidad.

---

Auditoría

Las acciones importantes generarán registros de auditoría.

Ejemplos:

- Inicio de sesión.
- Cambios de contraseña.
- Modificación de permisos.
- Eliminación de contenido.
- Creación de recursos.
- Acciones administrativas.

Estos registros facilitarán la detección de incidencias y el cumplimiento normativo.

---

Índices y optimización

Para mantener un rendimiento elevado se crearán índices sobre los campos más consultados, como:

- ID de usuario.
- Correo electrónico.
- Nombre visible.
- Fecha de creación.
- Estado de la cuenta.
- Conversación.
- Fecha de mensajes.
- Última actividad.

Además, se emplearán técnicas de paginación y consultas optimizadas para reducir la carga del sistema.

---

Integridad de los datos

Se aplicarán restricciones para evitar inconsistencias:

- Claves primarias.
- Claves foráneas.
- Restricciones de unicidad.
- Validaciones de formato.
- Valores por defecto.
- Eliminación controlada de registros.

La eliminación física solo se realizará cuando sea estrictamente necesario; en la mayoría de los casos se optará por eliminaciones lógicas que permitan la recuperación de información.

---

Seguridad de la información

La protección de los datos será prioritaria.

Se implementarán medidas como:

- Cifrado de datos sensibles.
- Copias de seguridad automáticas.
- Replicación entre servidores.
- Control de accesos.
- Registro de actividad.
- Protección frente a modificaciones no autorizadas.
- Rotación de credenciales.
- Restauración ante desastres.

---

Escalabilidad

El diseño permitirá:

- Particionar grandes tablas.
- Replicar bases de datos.
- Balancear consultas.
- Separar lectura y escritura.
- Añadir nuevos nodos sin interrumpir el servicio.
- Crecer de forma progresiva según aumente el número de usuarios.

---

Cumplimiento normativo

HelpingYou se diseñará para facilitar el cumplimiento de normativas de protección de datos, incluyendo mecanismos para:

- Gestión del consentimiento.
- Exportación de datos del usuario.
- Eliminación de la cuenta cuando corresponda.
- Registro de tratamientos.
- Conservación limitada de la información.
- Protección de datos personales.

---

Conclusión

El diseño de la base de datos de HelpingYou está concebido para soportar un crecimiento continuo sin perder rendimiento, seguridad ni flexibilidad. La combinación de distintos motores de almacenamiento, una estructura modular y una estrategia de optimización permitirá gestionar grandes volúmenes de información con eficiencia, garantizando al mismo tiempo la privacidad de los usuarios y la fiabilidad del servicio. Esta arquitectura de datos constituye una base sólida para todas las funcionalidades presentes y futuras de la plataforma.
