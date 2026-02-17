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

## Refactoring completado ✅

### `HandleManifest`

**Problema original:** La clase hacía DOS cosas:
1. Leer archivos del filesystem (infraestructura)
2. Encontrar representative runs (lógica de negocio)

**Solución aplicada:**

1. ✅ Creada interfaz `ManifestRepository` en dominio
2. ✅ Creada clase `ManifestReader` en infraestructura
3. ✅ Modificado constructor de `HandleManifest` para recibir `ManifestRepository`
4. ✅ Tests de `HandleManifest` actualizados con `FakeManifest` parametrizable
5. ✅ Tipos duplicados eliminados (ahora se importan desde `domain/manifest.ts`)
6. ✅ `upload-gist.ts` actualizado para pasar `ManifestReader`
7. ✅ Cambiado `process.exit(1)` por `throw new Error()` (mejor diseño)

### `tests/application/handle-manifest.test.ts`

```typescript
// Fake parametrizable - se le pasan datos por constructor
class FakeManifest implements ManifestRepository {
    constructor(private sources: ManifestSource[]) {}
    readAllManifests(): ManifestSource[] {
        return this.sources
    }
}

// Tests:
✅ should find multiples manifest (3 manifests, solo 2 con representative runs → length 2)
✅ should find summary values
✅ should throw error when we dont have representatives
```

---

---

### 6. Lección: Los tests unitarios no lo cubren todo

**Qué pasó:** Todos los tests pasaron (7/7), pero la app se rompió en CI.

**Por qué:** Los tests unitarios verifican que `HandleManifest` funciona con un Fake, pero nadie verificaba que `upload-gist.ts` le pasara un `ManifestRepository` real. Al cambiar el constructor para requerir un parámetro, `upload-gist.ts` seguía llamando `new HandleManifest()` sin argumento.

**La lección:** Los tests unitarios testean piezas **aisladas**. No garantizan que las piezas estén **conectadas** correctamente.

| Nivel | Qué testea | Qué detecta | Qué NO detecta |
|-------|-----------|-------------|-----------------|
| **Unitario** | Una clase aislada con Fakes | Lógica interna rota | Que las piezas no conecten |
| **Integración** | Varias clases juntas reales | Que las piezas no conecten | Problemas de entorno |
| **E2E** | El flujo completo | Todo | Son lentos y frágiles |

**Solución aplicada:** Agregamos `tsc --noEmit` como paso previo a los tests:

```json
"typecheck": "tsc --noEmit",
"test": "npm run typecheck && jest",
```

Ahora `npm test` tiene dos capas de protección:
1. **TypeScript (`tsc --noEmit`)** - ¿las piezas conectan? (tipos, parámetros, interfaces)
2. **Jest** - ¿la lógica funciona? (comportamiento, edge cases)

**¿Por qué jest no detectó el error?** Porque `ts-jest` transpila TypeScript a JavaScript sin verificar tipos. Solo convierte el código para que Node pueda ejecutarlo, pero ignora errores de tipos. `tsc --noEmit` sí verifica tipos sin generar archivos.

> **Regla:** Tests unitarios dan confianza en la lógica. `tsc --noEmit` da confianza en que las piezas conectan. Usá ambos.

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

## Conceptos clave recordar

> **Nota:** Comandos, arquitectura y archivos clave están documentados en `CLAUDE.md` en la raíz del proyecto.

1. **Fake > Mock** - Tests menos frágiles
2. **Interfaz en Dominio** - Aplicación no conoce Infraestructura
3. **Inyección en Constructor** - Facilita testing
4. **Un test debe verificar UNA cosa**
5. **Refactoring puro** = tests no cambian
6. **Cambio de API** = tests sí cambian
7. **Tests unitarios ≠ confianza total** - Verifican lógica aislada, no que todo esté conectado
8. **`expect(() => fn()).toThrow()`** para errores síncronos, **`await expect(fn()).rejects.toThrow()`** para async
9. **`process.exit()` no va en lógica de negocio** - Usar `throw new Error()`, que quien llama decida qué hacer
10. **Fake parametrizable** - Pasar datos por constructor para reutilizar en distintos escenarios de test

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


