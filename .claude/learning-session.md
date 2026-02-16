# Sesión de Aprendizaje: TDD y Testing en Arquitectura Hexagonal

## Fecha: 28 Enero 2026

---

## Lo que aprendimos

### 1. Tipos de Test Doubles

| Tipo | Qué hace | Cuándo usarlo |
|------|----------|---------------|
| **Stub** | Devuelve valores fijos | Solo necesitas que algo "funcione" |
| **Fake** | Implementación simplificada con lógica | Quieres comportamiento real sin dependencias externas |
| **Mock** | Espía llamadas y verifica interacciones | Verificar que se llamó con parámetros correctos |

**Regla:** Prefiere **Fakes** sobre Mocks. Tests menos frágiles.

---

### 2. Patrón Repository

Interfaz que abstrae el acceso a datos:

```typescript
// Dominio - el contrato
interface ReportRepository {
    createReport(params): Promise<Report>;
}

// Infraestructura - la implementación
class CreateReportGits implements ReportRepository {
    // Usa GitHub API
}
```

---

### 3. Inyección de Dependencias

Pasar dependencias por constructor en vez de crearlas dentro:

```typescript
// MAL - dependencia hardcodeada
class MyClass {
    private dep = new RealDependency();
}

// BIEN - dependencia inyectada
class MyClass {
    constructor(private dep: DependencyInterface) {}
}
```

**Beneficio:** Puedes pasar un Fake en tests.

---

### 4. Principio SOLID - Dependency Inversion (DIP)

> "Depende de abstracciones (interfaces), no de implementaciones concretas"

```typescript
// MAL
constructor(private repo: CreateReportGits)  // Clase concreta

// BIEN
constructor(private repo: ReportRepository)  // Interfaz
```

---

### 5. Arquitectura Hexagonal

```
DOMINIO (interfaces/contratos)
├── report.ts
├── report-repository.ts
├── manifest.ts
└── manifest-repository.ts

APLICACIÓN (casos de uso)
├── create-report.ts
└── handle-manifest.ts

INFRAESTRUCTURA (implementaciones)
├── create-report-gits.ts
└── manifest-reader.ts
```

**Regla de dependencias:**
- Dominio no conoce a nadie
- Aplicación solo conoce Dominio
- Infraestructura conoce Dominio y Aplicación

---

## Tests completados

### `tests/application/create-report.test.ts`

```typescript
// Fake creado
class FakeReportRepository implements ReportRepository {
    public lastParams: any = null;
    async createReport(params): Promise<Report> {
        this.lastParams = params;
        return { ... };
    }
}

// Tests:
✅ should create a description
✅ should send report data like content, filename, type and performance
✅ should return a report with correct fields
✅ should throw error when repository fails
```

---

## Refactoring en progreso

### Estado actual de `HandleManifest`

**Problema original:** La clase hacía DOS cosas:
1. Leer archivos del filesystem (infraestructura)
2. Encontrar representative runs (lógica de negocio)

**Solución en progreso:**

1. ✅ Creada interfaz `ManifestRepository` en dominio
2. ✅ Creada clase `ManifestReader` en infraestructura
3. ✅ Modificado constructor de `HandleManifest` para recibir `ManifestRepository`
4. ⏳ **PENDIENTE:** Actualizar tests de `HandleManifest`
5. ⏳ **PENDIENTE:** Borrar métodos viejos de `HandleManifest`
6. ⏳ **PENDIENTE:** Actualizar `upload-gist.ts` para pasar el repositorio

---

## Lo que queda por hacer

### 1. Limpiar `handle-manifest.ts`

Borrar estos métodos (ya están en `ManifestReader`):
- `readAllManifests()`
- `getMainManifest()`
- `getMobileManifest()`
- `getDesktopManifest()`
- `import * as fs from "fs"`

### 2. Actualizar tests de `handle-manifest.test.ts`

```typescript
// Crear fake correcto
class FakeManifestRepository implements ManifestRepository {
    readAllManifests(): ManifestSource[] {
        return [{
            type: 'mobile',
            path: './.lighthouse-reports/mobile/manifest.json',
            runs: [{ url: '...', isRepresentativeRun: true, ... }]
        }];
    }
}

// Tests a mantener:
- should find representative runs

// Tests a mover a manifest-reader.test.ts (o borrar):
- should read all manifests
- should find main source
- should find mobile source
- should find desktop source
```

### 3. Actualizar `upload-gist.ts`

```typescript
import { ManifestReader } from "./core/reports/infrastructure/manifest-reader";

// Pasar el repositorio real
const manifestReader = new ManifestReader();
const handleManifest = new HandleManifest(manifestReader);
```

### 4. (Opcional) Crear tests para `ManifestReader`

Si quieres testear la infraestructura, mover los tests viejos a:
`tests/infrastructure/manifest-reader.test.ts`

---

## Feature pendiente: Múltiples URLs

Una vez completado el refactoring, implementar con TDD:

1. Agregar más URLs en `.lighthouserc.mobile.cjs`:
```javascript
url: [
    'https://www.cupraofficial.dk/page1',
    'https://www.cupraofficial.dk/page2',
]
```

2. Cambiar `.find()` por `.filter()` en `findAllRepresentativeRuns`:
```typescript
// ANTES - solo encuentra el primero
const representativeRun = manifest.runs.find(run => run.isRepresentativeRun);

// DESPUÉS - encuentra todos
const representativeRuns = manifest.runs.filter(run => run.isRepresentativeRun);
```

---

## Archivos clave

| Archivo | Propósito |
|---------|-----------|
| `src/core/reports/domain/report-repository.ts` | Interfaz para reports |
| `src/core/reports/domain/manifest-repository.ts` | Interfaz para manifests |
| `src/core/reports/domain/manifest.ts` | Tipos ManifestSource, ManifestRun |
| `src/core/reports/application/create-report.ts` | Caso de uso (testeado) |
| `src/core/reports/application/handle-manifest.ts` | Caso de uso (en refactor) |
| `src/core/reports/infrastructure/create-report-gits.ts` | Implementación GitHub |
| `src/core/reports/infrastructure/manifest-reader.ts` | Implementación filesystem |

---

## Comandos útiles

```bash
# Correr todos los tests
npm test

# Correr un test específico
npm test -- tests/application/create-report.test.ts

# Correr tests en modo watch
npm test -- --watch
```

---

## Conceptos clave recordar

1. **Fake > Mock** - Tests menos frágiles
2. **Interfaz en Dominio** - Aplicación no conoce Infraestructura
3. **Inyección en Constructor** - Facilita testing
4. **Un test debe verificar UNA cosa**
5. **Refactoring puro** = tests no cambian
6. **Cambio de API** = tests sí cambian

---

## Evaluación personal

### Puntos fuertes

1. **Haces preguntas** - No te quedas con dudas. Preguntas hasta entender. Esto es fundamental para aprender bien.

2. **Cuestionas decisiones de diseño** - Cuando sugerí `FileReader` en dominio, dijiste "no estoy seguro de eso". Tenías razón. Pensar críticamente sobre la arquitectura es muy valioso.

3. **Entiendes el "por qué"** - No te conformas con copiar código. Quieres entender por qué se hace de cierta manera.

4. **Reconoces cuando no entiendes** - Dijiste "no entiendo" varias veces. Esto es una fortaleza, no debilidad. Muchos fingen entender y después se pierden.

5. **Piensas en arquitectura** - Cuestionaste dónde van las interfaces, la inyección de dependencias, qué conoce qué. Eso muestra que piensas en el diseño global.

### Puntos a mejorar

1. **Distinguir qué estás testeando** - Al principio testeaste el Fake directamente en vez de usar el Fake para testear la clase real. Recuerda: el Fake es un "doble" para testear OTRA cosa.

2. **Estructura de datos anidadas** - Te costó ver que `ManifestSource` contiene `runs[]` adentro. Practica visualizar estructuras de datos complejas.

3. **Diferencia entre refactoring y cambio de API** - Te sorprendió que los tests cambiaran. Recuerda:
   - Refactoring interno = tests no cambian
   - Cambio de interfaz pública = tests sí cambian

4. **Tipos vs Interfaces de comportamiento** - Confundiste cuándo usar `implements`. Recuerda:
   - `implements` = para interfaces con MÉTODOS
   - Tipo de datos = solo para tipar variables/retornos

### Recomendaciones para seguir aprendiendo

1. **Practica el ciclo TDD completo**: Test rojo → Código mínimo → Test verde → Refactor

2. **Dibuja las estructuras de datos** antes de escribir el código

3. **Lee sobre SOLID** - Ya entiendes la D (Dependency Inversion), explora las otras

4. **Haz el refactoring de HandleManifest** sin ayuda, consultando estas notas
