# Guía de Contribución - HelpingYou

¡Gracias por tu interés en contribuir a **HelpingYou**! Somos una comunidad comprometida con crear una plataforma de ayuda anónima, segura y accesible. Tu participación es valiosa para lograr nuestra misión.

## Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo Contribuir?](#cómo-contribuir)
- [Requisitos Previos](#requisitos-previos)
- [Configuración del Entorno Local](#configuración-del-entorno-local)
- [Flujo de Contribución](#flujo-de-contribución)
- [Estándares de Código](#estándares-de-código)
- [Tests](#tests)
- [Commits](#commits)
- [Pull Requests](#pull-requests)
- [Reportar Bugs](#reportar-bugs)
- [Sugerir Mejoras](#sugerir-mejoras)

## Código de Conducta

Nos comprometemos a mantener un ambiente inclusivo y respetuoso. Este proyecto adhiere al **Contributor Covenant v2.1**. Por favor, lee nuestro [Código de Conducta](CODE_OF_CONDUCT.md) antes de participar.

**Resumen:**
- Sé respetuoso con todos los miembros de la comunidad
- No tolera acoso, discriminación ni comportamiento ofensivo
- Respeta la privacidad y confidencialidad de los usuarios
- Colabora de manera constructiva
- Reporta comportamientos inapropiados a los maintainers

## ¿Cómo Contribuir?

Hay muchas formas de contribuir a HelpingYou:

- 🐛 **Reportar bugs** - Ayúdanos a identificar y solucionar problemas
- ✨ **Sugerir mejoras** - Propón nuevas funcionalidades
- 📚 **Documentación** - Mejora o expande la documentación
- 💻 **Código** - Implementa nuevas funciones o corrige bugs
- 🌍 **Traducción** - Ayuda a que HelpingYou sea más accesible

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** versión LTS 22 o superior ([Descargar](https://nodejs.org/))
- **npm** (incluido con Node.js)
- **Git** ([Descargar](https://git-scm.com/))
- Un editor de código (recomendamos [VS Code](https://code.visualstudio.com/))
- Una cuenta en [GitHub](https://github.com/)

Verifica tus versiones:

```bash
node --version  # Debe ser v22.0.0 o superior
npm --version
git --version
```

## Configuración del Entorno Local

### 1. Fork el Repositorio

Haz clic en el botón **Fork** en la esquina superior derecha del repositorio en GitHub.

### 2. Clona tu Fork

```bash
git clone https://github.com/TU_USUARIO/HelpingYou.git
cd HelpingYou
```

### 3. Añade el Upstream

```bash
git remote add upstream https://github.com/agabrianton-del/HelpingYou.git
git fetch upstream
```

### 4. Instala las Dependencias

```bash
npm install
```

### 5. Configura las Variables de Entorno

Copia el archivo `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus configuraciones locales (base de datos PostgreSQL, variables de desarrollo, etc.).

### 6. Verifica la Instalación

```bash
npm run dev  # Para desarrollo
# o
npm start
```

Asegúrate de que todo funciona correctamente.

## Flujo de Contribución

### 1. Crea una Nueva Rama

Siempre trabaja en una rama separada:

```bash
git checkout -b feature/nombre-descriptivo
# o para bugfixes
git checkout -b fix/nombre-del-bug
```

**Nomenclatura recomendada:**
- `feature/nueva-funcionalidad` - Para nuevas características
- `fix/descripcion-del-bug` - Para correcciones de bugs
- `docs/mejora-documentacion` - Para cambios en documentación
- `refactor/descripcion` - Para refactorización de código

### 2. Realiza tus Cambios

Haz cambios significativos y mantenlos enfocados. Si es un cambio grande, considera dividirlo en múltiples PRs.

### 3. Sincroniza con Upstream (Opcional pero Recomendado)

```bash
git fetch upstream
git rebase upstream/main
```

### 4. Envía tus Cambios

```bash
git add .
git commit -m "tipo: descripción breve"
git push origin feature/nombre-descriptivo
```

### 5. Abre un Pull Request

Ve a GitHub y crea un Pull Request desde tu rama hacia `main`. Completa el template con:
- Descripción clara de los cambios
- Referencia a issues relacionados
- Screenshots (si aplica)
- Checklist de verificación

## Estándares de Código

### Lenguaje y Framework

- **Frontend:** TypeScript, React (web), React Native (móvil)
- **Backend:** TypeScript, Node.js
- **Base de datos:** PostgreSQL

### ESLint y Prettier

Usamos **ESLint** con configuración de **eslint-config-prettier** para análisis estático y formateo de código consistente.

**Antes de hacer commit, ejecuta:**

```bash
npm run lint        # Verifica errores de linting
npm run lint:fix    # Corrige errores automáticamente
npm run format      # Formatea el código con Prettier
```

### Configuración ESLint

Nuestro proyecto incluye `eslint-config-prettier` que deshabilita todas las reglas de ESLint que podrían entrar en conflicto con Prettier. Esto garantiza un formateo consistente.

**Archivo `.eslintrc.json` típico:**
```json
{
  "extends": ["eslint-config-prettier"]
}
```

### Estilo de Código

- Usa **camelCase** para variables y funciones
- Usa **PascalCase** para componentes React y clases
- Usa **UPPER_SNAKE_CASE** para constantes
- Añade tipos TypeScript explícitos (no uses `any`)
- Escribe comentarios claros para lógica compleja
- Máximo 100 caracteres por línea (configurado en Prettier)
- Usa comillas simples por defecto (configurado en Prettier)
- Punto y coma obligatorio (configurado en Prettier)

**Ejemplo:**

```typescript
// ✅ Bien
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

const getUserProfile = async (userId: string): Promise<UserProfile> => {
  // Lógica aquí
};

// ❌ Mal
const getUserProfile = async (userId) => {
  // Sin tipos
};
```

## Tests

### Framework: Jest

Utilizamos **Jest** como framework de testing.

### Ejecutar Tests

```bash
npm test              # Ejecutar todos los tests
npm test -- --watch  # Modo watch
npm test -- --coverage  # Con cobertura de código
npm test -- --updateSnapshot  # Actualizar snapshots
```

### Escribir Tests

- Escribe tests unitarios con **Jest**
- La cobertura mínima esperada es del **80%**
- Los nombres de archivos de tests deben ser: `nombrearchivo.test.ts` o `nombrearchivo.spec.ts`
- Cada módulo debe tener tests asociados

**Ejemplo:**

```typescript
describe('getUserProfile', () => {
  it('debe retornar el perfil del usuario', async () => {
    const userId = 'user-123';
    const result = await getUserProfile(userId);

    expect(result).toBeDefined();
    expect(result.id).toBe(userId);
  });

  it('debe lanzar error si el usuario no existe', async () => {
    await expect(getUserProfile('inexistente')).rejects.toThrow();
  });

  it('debe retornar datos del usuario con privacidad protegida', async () => {
    const result = await getUserProfile('user-123');

    expect(result).not.toHaveProperty('senha');
    expect(result).not.toHaveProperty('token');
  });
});
```

### Mejores Prácticas de Testing

- Usa **describe** para agrupar tests relacionados
- Usa nombres descriptivos que expliquen qué se prueba
- Prueba casos exitosos y casos de error
- Mantén tests simples y enfocados
- Evita tests frágiles que dependan de detalles de implementación
- Usa mocks cuando sea necesario

### Checklist Antes del Commit

- [ ] Los tests pasan: `npm test`
- [ ] Cobertura adecuada: `npm test -- --coverage`
- [ ] El código está formateado: `npm run format`
- [ ] No hay errores de linting: `npm run lint`
- [ ] Los cambios están documentados
- [ ] No hay código comentado innecesario

## Commits

Usamos **Conventional Commits** para mantener un historial claro y facilitar la generación automática de changelogs:

```
tipo(alcance): descripción breve

Descripción más detallada si es necesario.

Fixes #123
```

### Tipos de Commits

- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bug
- `docs:` - Cambios en documentación
- `style:` - Cambios que no afectan el código (formato, espacios, etc.)
- `refactor:` - Cambios que no corrigen bugs ni añaden funciones
- `perf:` - Mejoras de rendimiento
- `test:` - Añadir o actualizar tests
- `chore:` - Cambios en dependencias, configuración, etc.

### Alcances Comunes

- `auth` - Autenticación
- `api` - APIs
- `ui` - Interfaz de usuario
- `db` - Base de datos
- `security` - Seguridad y privacidad
- `mobile` - Aplicación móvil
- `web` - Aplicación web

**Ejemplos:**

```bash
git commit -m "feat(auth): añadir autenticación de dos factores"
git commit -m "fix(security): corregir validación de entrada"
git commit -m "docs(contributing): actualizar guía de contribución"
git commit -m "test(user): añadir tests para validación de email"
git commit -m "perf(api): optimizar queries de base de datos"
git commit -m "chore(deps): actualizar dependencias"
```

## Pull Requests

### Antes de Abrir un PR

1. Asegúrate de que tu rama está actualizada con `upstream/main`
2. Todos los tests pasan: `npm test`
3. Cobertura de código adecuada: `npm test -- --coverage`
4. El código sigue los estándares: `npm run lint` sin errores
5. El código está formateado: `npm run format`
6. Has añadido/actualizado tests si es necesario
7. Has documentado cambios importantes

### Template de PR

```markdown
## Descripción
Describe brevemente qué cambios haces y por qué.

## Tipo de Cambio
- [ ] Bug fix (corrección sin cambios en API)
- [ ] Nueva funcionalidad (cambios sin romper compatibilidad)
- [ ] Cambio importante (rompería compatibilidad)
- [ ] Documentación

## Relacionado con Issues
Fixes #123

## Cambios Principales
- Cambio 1
- Cambio 2
- Cambio 3

## Screenshots (si aplica)
[Adjunta screenshots aquí]

## Notas de Privacidad/Seguridad
¿Hay consideraciones de seguridad o privacidad? Explica aquí.

## Checklist
- [ ] Mi código sigue los estándares: `npm run lint`
- [ ] He ejecutado `npm run format`
- [ ] He añadido tests para mis cambios
- [ ] Los tests pasan: `npm test`
- [ ] Cobertura es adecuada: `npm test -- --coverage`
- [ ] He actualizado la documentación
- [ ] No hay cambios no intencionados
- [ ] He considerado implicaciones de seguridad y privacidad
```

### Proceso de Review

- Un maintainer revisará tu PR dentro de 48-72 horas
- Puede que se soliciten cambios
- Sé receptivo al feedback y colabora en las mejoras
- Una vez aprobado, será mergeado
- Tu contribución será reconocida ✨

## Reportar Bugs

### Antes de Reportar

- Verifica que el bug no haya sido reportado ya
- Intenta reproducir el bug
- Ten detalles específicos: versión, SO, pasos exactos
- Verifica que no sea un problema de privacidad/seguridad (ver sección siguiente)

### Bugs de Seguridad o Privacidad

**⚠️ NO abras un issue público para vulnerabilidades de seguridad o privacidad.**

En su lugar, envía un email a [SECURITY_EMAIL] con:
- Descripción detallada
- Pasos para reproducir
- Impacto potencial
- Sugiere una solución si es posible

### Abre un Issue

Usa el template de bug report con:

```markdown
## Descripción
Descripción clara del bug.

## Pasos para Reproducir
1. Paso 1
2. Paso 2
3. Paso 3

## Comportamiento Esperado
Qué debería ocurrir.

## Comportamiento Actual
Qué ocurre realmente.

## Entorno
- OS: Windows / macOS / Linux
- Navegador: Chrome / Firefox / Safari (si aplica)
- Node.js: v22.x.x
- npm: x.x.x

## Screenshots
[Si aplica]

## Logs o Errores
```
Error aquí
```

## Datos de Reproducción
[Información anónima necesaria para reproducir]
```

## Sugerir Mejoras

Queremos escuchar tus ideas para mejorar HelpingYou y hacer la plataforma más accesible, segura y útil.

Abre un issue con:

```markdown
## Descripción de la Mejora
Describe claramente tu sugerencia.

## Problema que Resuelve
¿Qué problema soluciona? ¿Qué caso de uso aborda?

## Impacto en Privacidad y Seguridad
¿Cómo afecta esto a la privacidad y seguridad de los usuarios?

## Beneficios Potenciales
- Beneficio 1
- Beneficio 2

## Alternativas Consideradas
¿Hay otras soluciones?

## Contexto Adicional
Información extra relevante.
```

## Recursos Adicionales

- [Documentación del Proyecto](./docs)
- [Código de Conducta - Contributor Covenant v2.1](CODE_OF_CONDUCT.md)
- [Licencia Apache 2.0](LICENSE)
- [Issues Abiertos](https://github.com/agabrianton-del/HelpingYou/issues)
- [Discussiones](https://github.com/agabrianton-del/HelpingYou/discussions)
- [Documentación Jest](https://jestjs.io/es/docs/getting-started)
- [ESLint Config Prettier](https://github.com/prettier/eslint-config-prettier)

## Preguntas o Necesitas Ayuda?

- **Issues:** Para preguntas específicas sobre bugs o features
- **Discussions:** Para conversaciones más generales
- **Email:** [Contacto]

---

**¡Gracias por contribuir a HelpingYou! Tu esfuerzo nos acerca más a nuestra misión de proporcionar apoyo anónimo, seguro y accesible para todos.** 💙

Hecho con ❤️ por la comunidad HelpingYou

## Licencia

Este proyecto está bajo la licencia [Apache License 2.0](LICENSE).
