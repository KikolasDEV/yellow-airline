# Versionado y releases

## Estrategia

El repositorio usa versionado automatico con Release Please.

Paquetes versionados:

- `client`
- `server`

## Como funciona

1. Haces merge de cambios en `main`.
2. GitHub Action ejecuta `release-please`.
3. Se abre o actualiza una PR de release.
4. Esa PR propone nuevas versiones y changelog.
5. Al mergearla, quedan publicadas las nuevas versiones en el historial del repositorio.

## Flujo exacto cuando haces push

### Si haces push a una rama de feature

- Se ejecuta CI (`.github/workflows/ci.yml`).
- Release Please no versiona desde ramas feature.
- Aqui solo validas calidad antes del merge.

### Si haces merge/push a `main`

- Se dispara `.github/workflows/release-please.yml`.
- Release Please analiza los commits desde la ultima release cerrada.
- Genera o actualiza una PR de release.
- Esa PR contiene:
  - bump de version en `client/package.json` y/o `server/package.json`
  - actualizacion de changelog por paquete

### Cuando mergeas la PR de release

- Se consolidan las nuevas versiones en el repo.
- Queda el historial de cambios documentado automaticamente.

## Que tienes que hacer para que se actualice bien

1. Trabajar con ramas normales y abrir PR a `main`.
2. Escribir commits con Conventional Commits.
3. Hacer merge a `main`.
4. Esperar a que Release Please abra/actualice la PR de release.
5. Revisar y mergear esa PR.

Sin el paso 5, la version no se aplica.

## Como calcula el tipo de version

- `fix:` incrementa patch (`1.2.3 -> 1.2.4`)
- `feat:` incrementa minor (`1.2.3 -> 1.3.0`)
- cambio breaking incrementa major (`1.2.3 -> 2.0.0`)

Para marcar breaking change:

- usa `feat!:` o `fix!:` en el titulo del commit, o
- incluye `BREAKING CHANGE:` en el cuerpo del commit

## Reglas recomendadas para commits

Usa Conventional Commits para que el versionado automatico detecte bien el tipo de cambio:

- `feat:` nueva funcionalidad
- `fix:` correccion de bug
- `docs:` cambios de documentacion
- `chore:` mantenimiento
- `refactor:` refactor sin cambio funcional
- `test:` cambios en testing
- `ci:` cambios de pipelines

Ejemplos:

```text
feat: add automated CI pipeline
fix: prevent negative booking totals
test: add home page smoke e2e
docs: document testing strategy
```

## Archivos implicados

- `.github/workflows/release-please.yml`
- `release-please-config.json`
- `.release-please-manifest.json`

## Secretos requeridos

- `GEMINI_API_KEY`: usado para generar notas de release personalizadas con `gemini-2.5-flash`.
- Si no existe este secreto, Release Please seguira funcionando, pero no se reescribiran notas con IA.

## Nota operativa importante

Release Please necesita permisos para crear y actualizar PRs en el repositorio. En GitHub, revisa que Actions tenga permiso de `Read and write` para pull requests y contents si en algun momento deja de abrir la PR de release.

## Limitacion importante

Release Please genera buenas versiones cuando el historial de commits describe correctamente el cambio. Si los commits no siguen una convencion, la automatizacion pierde precision.
