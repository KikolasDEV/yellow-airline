# Versionado y Releases

## Objetivo

Automatizar versionado y changelogs sin editar versiones manualmente en cada release.

## Estrategia actual

El repositorio usa `release-please` con separación por componente:

- `client`
- `server`

## Estado actual

- `client`: `1.3.0`
- `server`: `1.3.0`

## Workflow

1. Se desarrolla en una rama de feature.
2. Se abre PR contra `main`.
3. La CI valida calidad.
4. Se mergea a `main`.
5. `Release Please` evalúa cambios liberables.
6. Crea o actualiza PRs de release por componente.
7. Al mergear esas PRs, se actualizan versión, changelog y tag.

## Archivos clave

- `.github/workflows/release-please.yml`
- `release-please-client-config.json`
- `release-please-server-config.json`
- `.release-please-manifest-client.json`
- `.release-please-manifest-server.json`

## Conventional Commits

Tipos recomendados:

- `feat:` nueva funcionalidad
- `fix:` corrección de bug
- `docs:` documentación
- `refactor:` refactor interno
- `test:` testing
- `ci:` automatización
- `chore:` mantenimiento

Ejemplos:

```text
feat: add quick booking from search results
fix: improve production deploy scripts
docs: refresh project documentation
```

## Release notes con IA

Si existe `GEMINI_API_KEY`, el workflow puede reescribir notas de release en castellano con un formato más presentable.

## Recomendación operativa

- No editar versiones manualmente salvo excepción.
- Usar Conventional Commits.
- Dejar que Release Please genere las PRs de release.
