# Política de Seguridad - HelpingYou

## 1. Nuestro Compromiso con la Seguridad

En **HelpingYou**, la seguridad y la privacidad de nuestros usuarios son nuestras prioridades máximas. Nos comprometemos a:

- Mantener estándares de seguridad de clase mundial
- Responder rápidamente a reportes de vulnerabilidades
- Ser transparentes sobre incidentes de seguridad
- Proteger la confidencialidad y anonimato de los usuarios
- Implementar mejores prácticas de seguridad en el desarrollo

## 2. Versiones Soportadas

| Versión | Soporte | Estado | Fecha de Fin |
|---------|---------|--------|-------------|
| 2.x     | ✅ Activo | LTS | 2028-12-31 |
| 1.x     | ⚠️ Limitado | Mantenimiento | 2026-12-31 |
| 0.x     | ❌ No | EOL | 2024-12-31 |

**Política de Soporte:**
- **LTS (Long Term Support):** Recibe parches de seguridad y mantenimiento durante 3 años
- **Mantenimiento:** Solo recibe parches críticos de seguridad
- **EOL (End of Life):** Sin soporte, se recomienda actualizar

## 3. Cómo Reportar una Vulnerabilidad

### ⚠️ IMPORTANTE: NO reportes vulnerabilidades públicamente

Si descubres una vulnerabilidad de seguridad, **NO la reportes en:**
- Issues públicos de GitHub
- Discussiones públicas
- Redes sociales
- Comunidades públicas

### Reporte Responsable

Reporta vulnerabilidades de manera responsable enviando un email a:

```
📧 HYSecurity@protonmail.com
```

**O a través de GitHub Security Advisory:**
- Ve a: https://github.com/agabrianton-del/HelpingYou/security/advisories
- Haz clic en "Report a vulnerability"
- Completa el formulario con detalles

### Qué Incluir en tu Reporte

Por favor, incluye:

```
Asunto: [VULNERABILIDAD] Descripción breve

1. Tipo de Vulnerabilidad
   - Inyección SQL / XSS / CSRF / Autenticación / Autorización
   - Encriptación / Privacidad / Otra

2. Descripción Detallada
   - ¿Qué es el problema?
   - ¿Por qué es un problema de seguridad?
   - ¿Cuál es el impacto potencial?

3. Pasos para Reproducir
   1. Paso 1
   2. Paso 2
   3. Paso 3

4. Prueba de Concepto (POC)
   - Código o screenshots si es posible
   - NO incluyas datos reales de usuarios

5. Información del Entorno
   - Versión de HelpingYou: (ej: 2.1.0)
   - Navegador/Cliente: (si aplica)
   - SO: Windows / macOS / Linux
   - Cualquier otra información relevante

6. Impacto Estimado
   - ¿Quién podría verse afectado?
   - ¿Cuál es la severidad? (Crítica / Alta / Media / Baja)

7. Sugerencia de Fix (Opcional)
   - Si tienes una sugerencia de cómo arreglarlo

8. Información de Contacto
   - Nombre (puede ser seudónimo)
   - Email
   - Teléfono (opcional)
   - PGP Key (si deseas comunicación encriptada)
```

## 4. Proceso de Respuesta

### Timeline Esperado:

1. **Acknowledgment (24-48 horas):**
   - Recibirás confirmación de que hemos recibido tu reporte
   - Se te asignará un número de ticket de seguridad
   - Te actualizaremos cada 5 días hábiles

2. **Validación (1-2 semanas):**
   - Verificaremos que la vulnerabilidad sea legítima
   - Evaluaremos la severidad
   - Te contactaremos con preguntas si es necesario

3. **Desarrollo de Fix (1-4 semanas):**
   - Tiempo depende de la complejidad y severidad
   - Te mantendremos informado del progreso
   - Podemos pedirte feedback sobre el fix

4. **Pre-Release (48-72 horas):**
   - Antes de publicar, te notificaremos
   - Te proporcionaremos detalles de la corrección
   - Te preguntaremos si deseas ser reconocido

5. **Release Público:**
   - Lanzaremos un parche de seguridad
   - Publicaremos un Security Advisory
   - Notificaremos a la comunidad

### Severidad de Vulnerabilidades:

| Severidad | Descripción | Timeline |
|-----------|-------------|----------|
| 🔴 Crítica | Compromiso completo, ejecución remota, pérdida de datos | 24-48 horas |
| 🟠 Alta | Compromiso parcial, acceso no autorizado, bypass de seguridad | 1-2 semanas |
| 🟡 Media | Afecta funcionalidad, puede llevar a explotación | 2-4 semanas |
| 🟢 Baja | Impacto mínimo, necesita condiciones específicas | 1-2 meses |

## 5. Directrices de Divulgación Responsable

### Lo que SI debes hacer:

✅ Reportar vulnerabilidades de forma privada y segura
✅ Dar tiempo razonable para desarrollar y lanzar fixes
✅ Ser específico y detallado en tu reporte
✅ Responder a preguntas de seguimiento
✅ Permitirnos reconocerte públicamente (si lo deseas)
✅ Probar el fix antes de su lanzamiento (si te lo pedimos)
✅ Mantener la vulnerabilidad confidencial hasta que se lance el fix

### Lo que NO debes hacer:

❌ Reportar públicamente sin notificarnos antes
❌ Acceder a datos de usuarios reales
❌ Intentar escalar privilegios innecesariamente
❌ Interferir con sistemas o datos de otros usuarios
❌ Difundir la vulnerabilidad antes del embargo
❌ Usar la vulnerabilidad para acceso no autorizado
❌ Exigir compensación económica

## 6. Áreas de Enfoque en Seguridad

HelpingYou se enfoca especialmente en proteger:

### 🔐 Privacidad y Anonimato
- Datos anónimos de usuarios
- Logs de conexión
- Metadatos de comunicación
- Historiales de actividad

### 🔑 Autenticación y Autorización
- Validación de credenciales
- Tokens de sesión
- Control de acceso (RBAC)
- 2FA / MFA

### 🔒 Encriptación
- Encriptación en tránsito (HTTPS/TLS)
- Encriptación en reposo
- Gestión de claves
- Integridad de datos

### 💉 Inyección y XSS
- SQL Injection
- NoSQL Injection
- Command Injection
- Cross-Site Scripting (XSS)

### 🛡️ Otras Vulnerabilidades
- CSRF (Cross-Site Request Forgery)
- Rate Limiting y DDoS
- Session Hijacking
- Insecure Deserialization
- Dependency Vulnerabilities

## 7. Prácticas de Seguridad de HelpingYou

Implementamos:

- ✅ **Scanning de Seguridad:** Análisis automático de código con SonarQube
- ✅ **Dependencias:** Actualizaciones regulares con Dependabot
- ✅ **Code Review:** Revisión de seguridad para todos los cambios
- ✅ **Testing:** Cobertura mínima del 80% con tests de seguridad
- ✅ **SAST:** Análisis estático de seguridad de aplicaciones
- ✅ **DAST:** Pruebas dinámicas de seguridad
- ✅ **Auditorías:** Auditorías de seguridad regulares trimestrales
- ✅ **Compliance:** GDPR, CCPA, estándares de privacidad
- ✅ **Incident Response:** Plan de respuesta a incidentes
- ✅ **Backup & Recovery:** Copias de seguridad y recuperación ante desastres

## 8. Reconocimiento de Reporteros

Si reportas una vulnerabilidad válida y deseas ser reconocido, te incluiremos en:

### 🏆 Hall of Fame
Publicaremos tu nombre/pseudónimo en nuestro:
- [Security Hall of Fame](#hall-of-fame)
- Changelog de seguridad
- Sitio web de HelpingYou

### 📢 Opciones de Reconocimiento:

- **Nombre Real:** Tu nombre completo
- **Pseudónimo:** Nombre de usuario o alias
- **Anónimo:** Sin reconocimiento público
- **Enlace:** Tu sitio web, GitHub, Twitter, etc.

**Solo se te reconocerá si lo solicitas explícitamente.**

## 9. Hall of Fame

Agradecemos a los siguientes investigadores de seguridad por sus reportes responsables:

| Fecha | Reportero | Vulnerabilidad | Severidad |
|-------|-----------|-----------------|-----------|
| TBD | [Tú podrías estar aquí] | Por reportar | 🌟 |

## 10. Preguntas Frecuentes
### ¿Cuándo recibiré respuesta?
Responderemos en 24-48 horas. Si no recibes respuesta en 72 horas, intenta contactarnos de nuevo.

### ¿Cómo sé que mi reporte fue recibido?
Te enviaremos un ticket de confirmación con un número de seguimiento.

### ¿Puedo divulgar la vulnerabilidad después del fix?
Sí, una vez que hemos lanzado el parche, puedes publicar un blog post o reporte.

### ¿Hay recompensa económica?
Actualmente no ofrecemos bug bounties, pero sí reconocimiento público. Estamos considerando un programa formal en el futuro.

### ¿Qué pasa si ignoro estas directrices?
Si reportas públicamente sin notificarnos:
1. Perderás la oportunidad de reconocimiento
2. No podremos coordinar el fix
3. Los usuarios pueden quedar vulnerables innecesariamente
4. Puede afectar tu reputación en la comunidad de seguridad

### ¿Puedo contactar a alguien más?
Primero, por favor contacta a security@helpingyou.org. Si no recibes respuesta en 14 días, puedes contactar a:
- GitHub Security Advisory
- CERT/CC
- Autoridades locales de protección de datos

## 11. Información de Contacto

| Canal | Contacto | Respuesta |
|-------|----------|-----------|
| Email | security@helpingyou.org | 24-48h |
| GitHub Advisory | [Security tab](https://github.com/agabrianton-del/HelpingYou/security/advisories) | 24-48h |
| Encriptado (PGP) | Proporciona tu key PGP | 24-48h |

### PGP Fingerprint (Opcional):
```
Disponible bajo solicitud
```

## 12. Licencia

Esta política de seguridad está bajo licencia [Apache License 2.0](LICENSE).

---

**Última actualización:** 2026-07-17

**¡Gracias por ayudarnos a mantener HelpingYou seguro para todos!** 🛡️

Hecho con ❤️ por el equipo de HelpingYou
