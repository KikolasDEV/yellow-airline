# Versionado y Releases

## Objetivo

Automatizar el versionado del proyecto sin tener que editar versiones y changelogs manualmente cada vez.

El repositorio usa `release-please` y sigue una estrategia separada para:

- `client`
- `server`

## Estado actual

Versiones actuales registradas:

- `client`: `1.3.0`
- `server`: `1.3.0`

Archivos de estado:

- `.release-please-manifest-client.json`
- `.release-please-manifest-server.json`

## Cómo funciona ahora

## Flujo normal

1. Trabajas en una rama de feature.
2. Abres PR contra `main`.
3. La CI valida calidad.
4. Haces merge a `main`.
5. Se ejecuta `Release Please`.
6. `Release Please` crea o actualiza PRs de release si detecta cambios liberables.
7. Al mergear la PR de release, quedan actualizados:
   - `package.json`
   - `CHANGELOG.md`
   - manifest correspondiente
   - tag de release

## Qué se ejecuta en `main`

Workflow: `.github/workflows/release-please.yml`

Se dispara en:

- `push` a `main`
- `workflow_dispatch` manual

## Qué jobs existen

### `release-please-client`

Usa:

- `release-please-client-config.json`
- `.release-please-manifest-client.json`

### `release-please-server`

Usa:

- `release-please-server-config.json`
- `.release-please-manifest-server.json`

## Por qué se separó por componente

Antes, el proyecto compartía un único config/manifest para `client` y `server`.

Eso provocó conflictos cuando había PRs de release separadas, porque ambas podían tocar el mismo archivo de estado.

La solución actual fue separar completamente:

- configuración
- manifiestos
- jobs del workflow

### Ventaja

Ahora cada release toca solo su propio ámbito.

Ejemplo:

- release de `client` -> no debería pelearse con el manifest de `server`
- release de `server` -> no debería pelearse con el manifest de `client`

## Conventional Commits

`release-please` calcula el tipo de bump según el tipo de commit.

### Reglas principales

- `fix:` -> patch
- `feat:` -> minor
- `feat!:` o `fix!:` -> major
- `BREAKING CHANGE:` en el body -> major

### Tipos recomendados en este repo

- `feat:` nueva funcionalidad
- `fix:` corrección de bug
- `docs:` cambios de documentación
- `chore:` mantenimiento
- `refactor:` refactor sin cambio funcional
- `test:` cambios de testing
- `ci:` cambios en workflows o automatización

### Ejemplos

```text
feat: add multilingual booking flow
fix: restore e2e compatibility
docs: update testing guide
ci: split release-please by component
```

## Cuándo se crea una PR de release

No siempre se crea una PR de release nueva al ejecutar el workflow.

Solo se crea si `release-please` detecta commits liberables para ese componente.

Eso significa:

- puede aparecer PR para `client` y no para `server`
- puede aparecer PR para `server` y no para `client`
- pueden aparecer las dos
- puede no aparecer ninguna

## Cómo ejecutar Release Please manualmente

Como el workflow soporta `workflow_dispatch`, puedes lanzarlo manualmente desde GitHub:

1. ir a `Actions`
2. abrir `Release Please`
3. pulsar `Run workflow`
4. seleccionar `main`
5. ejecutar

Esto es útil cuando:

- quieres regenerar PRs de release
- acabas de limpiar ramas viejas de release
- quieres forzar una reevaluación sin esperar otro merge

## Notas de release con IA

Después de crear una release, el workflow puede reescribir las notas con Gemini si existe el secreto:

- `GEMINI_API_KEY`

Si ese secreto no existe, `release-please` sigue funcionando igualmente, pero deja notas normales por defecto.

## Problemas que ya ocurrieron y qué significan

### Conflictos entre PRs de release

Significaban que el estado compartido de release estaba mal aislado.

Eso ya se corrigió separando client y server.

### Errores por ramas stale de `release-please`

A veces GitHub o `release-please` mantienen referencias internas a PRs/ramas antiguas cerradas.

La solución práctica fue:

- borrar ramas remotas stale de `release-please`
- relanzar el workflow manualmente

## Archivos importantes

- `.github/workflows/release-please.yml`
- `release-please-client-config.json`
- `release-please-server-config.json`
- `.release-please-manifest-client.json`
- `.release-please-manifest-server.json`
- `client/CHANGELOG.md`
- `server/CHANGELOG.md`
- `client/package.json`
- `server/package.json`

## Recomendación operativa

El flujo correcto de trabajo debería ser:

1. desarrollar en rama feature
2. abrir PR a `main`
3. pasar CI
4. mergear a `main`
5. dejar que `release-please` abra PRs de release
6. revisar esas PRs
7. mergearlas

No conviene editar versiones manualmente salvo en casos muy excepcionales.

## Resumen

El versionado actual del proyecto ya está preparado para trabajar con frontend y backend como componentes liberables por separado.

Eso hace el sistema más robusto y reduce el riesgo de conflictos en futuras releases.
