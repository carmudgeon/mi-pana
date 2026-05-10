# Lista imprimible de cromos faltantes

**Fecha:** 2026-05-10
**Estado:** Aprobado en brainstorming, pendiente de plan de implementación

## Problema

Cuando un usuario tiene muchos cromos faltantes y va a un kiosco, librería o intercambio físico, no es práctico llevar el teléfono y desplazarse por la cuadrícula país por país. Necesita una hoja de papel (o PDF) que muestre toda su lista de faltantes de un vistazo, organizada de forma compacta y clara.

Hoy, en `FullGridScreen` con el filtro "Faltan", la información existe pero no hay forma de imprimirla en un formato denso y útil para uso fuera de la app.

## Objetivo

Permitir al usuario imprimir su lista de faltantes desde `FullGridScreen` cuando el filtro está en "Faltan", generando una matriz fluida de bloques `[CÓDIGO PAÍS] números…` que aprovecha el ancho de una página tamaño Carta.

## No-objetivos

- No se imprimen los filtros "Todos", "Tengo" ni "Repetidos" (el botón solo aparece con filtro "Faltan").
- No hay vista previa interna en la app: se usa el diálogo nativo del navegador.
- No se exporta a PDF programáticamente; el usuario puede elegir "Guardar como PDF" desde el diálogo de impresión.
- No se incluyen QR, mosaicos de color ni iconografía en la versión imprimible.
- No se modifica el layout actual de `FullGridScreen` en pantalla.

## Diseño

### Trigger y UI en pantalla

- En `src/screens/FullGridScreen.jsx`, agregar un botón **"Imprimir"** que se renderiza únicamente cuando `filter === 'miss'`.
- Ubicación: a la derecha del contador `counts.miss` (debajo del título "Todos los cromos"), en la misma fila que la línea actual `counts.miss > 0 ? missingCount : albumComplete`. Estilo consistente con el botón "← Álbum" existente: `var(--font-mono)`, borde fino (`1px solid var(--line)`), mayúsculas, `letter-spacing: 0.14em`, fondo blanco.
- Acción al hacer clic: `window.print()`. Sin estado adicional, sin modal.
- El botón lleva la clase `no-print` para que no aparezca en la impresión.
- Nuevas claves de i18n en `src/i18n.js`:
  - `print`: `"Imprimir"` / `"Print"`
  - `missingPrintTitle`: `"Mi Pana 26 · Faltantes"` / `"Mi Pana 26 · Missing"`

### Componente `PrintableMissingList`

Nuevo componente en `src/components/PrintableMissingList.jsx` que recibe la colección y renderiza la matriz imprimible. Está montado dentro de `FullGridScreen` pero oculto en pantalla (`display: none`); solo es visible al imprimir.

**Props:** `{ collection, lang }`.

**Cálculo interno:**

- Para cada equipo en `TEAMS`, calcular los números de cromo faltantes (cantidad === 0).
- Filtrar equipos sin faltantes.
- Ordenar por `team.group` ascendente, luego por `team.code` ascendente — paridad con el orden de `FullGridScreen` cuando `filter === 'miss'`.
- Calcular total de faltantes (`missingCount`) y total de cromos (`allCount`) para el encabezado.

**Estructura DOM:**

```jsx
<div className="printable-missing">
  <header className="printable-missing__header">
    <span>{t(lang, 'missingPrintTitle')}</span>
    <span>{ownedCount} / {allCount}</span>
    <span>{formattedDate}</span>
  </header>
  <div className="printable-missing__matrix">
    {countriesWithMissing.map(({ team, missingNums }) => (
      <div key={team.code} className="printable-missing__country">
        <span className="printable-missing__code">{team.code}</span>
        {missingNums.map(num => (
          <span key={num} className="printable-missing__num">{num}</span>
        ))}
      </div>
    ))}
  </div>
</div>
```

### Layout de la matriz

**Contenedor `.printable-missing__matrix`:**

- `display: flex; flex-wrap: wrap;`
- `column-gap: 12px; row-gap: 8px;`
- Los bloques de país fluyen horizontalmente; cuando un bloque no cabe en la fila actual, salta a la siguiente.

**Bloque de país `.printable-missing__country`:**

- `display: inline-flex; align-items: center;`
- `white-space: nowrap;` — el bloque jamás se parte a mitad (un país siempre aparece junto a sus números).
- `gap: 4px;` entre la celda de código y los números.

**Celda de código `.printable-missing__code`:**

- 3 letras del país (`ARG`, `BRA`, etc.).
- Tipografía monoespaciada (`var(--font-mono)`), peso 800, tamaño ~10pt.
- Fondo claro o borde fino para destacar como inicio del bloque (ej. `border: 1px solid #000; padding: 1px 4px;`).

**Celda de número `.printable-missing__num`:**

- Número con padding a 2 dígitos (`02`, `04`).
- Tipografía monoespaciada, peso 600, tamaño ~10pt.
- `padding: 1px 2px;` mínimo para densidad.
- Sin borde ni fondo — el espacio entre celdas es suficiente para distinguirlas.

**Encabezado `.printable-missing__header`:**

- Una línea horizontal con `display: flex; justify-content: space-between;`.
- Tres elementos: título de la app, contador `tengo / total`, fecha de impresión (formato `DD/MM/YYYY`).
- Línea separadora fina (`border-bottom: 1px solid #000;`) bajo el encabezado.

### Estilos de impresión

Bloque `@media print` en `src/components/PrintableMissingList.css` (más la utilidad `.no-print` global en `src/global.css`):

```css
@media print {
  @page { size: letter; margin: 12mm; }

  body * { visibility: hidden; }
  .printable-missing, .printable-missing * { visibility: visible; }

  .printable-missing {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    color: #000;
    background: #fff;
  }

  .no-print { display: none !important; }
}

.printable-missing { display: none; }

@media print {
  .printable-missing { display: block; }
}
```

Notas:

- `visibility: hidden` (en lugar de `display: none`) en el contenedor padre evita que el flujo de la página colapse y permite que `.printable-missing` se posicione correctamente.
- El forzado a `color: #000; background: #fff;` previene que tonos pastel se pierdan al imprimir.
- `@page` fija el tamaño de papel a Carta con márgenes razonables; el navegador puede anular esto si el usuario elige otro tamaño en el diálogo, pero el default queda fijado.

## Casos borde

- **Sin faltantes (álbum completo):** el botón "Imprimir" no se renderiza porque el filtro "Faltan" muestra contador 0 y, en la práctica, el usuario no llega a la vista filtrada vacía con intención de imprimir. Aun así, el componente `PrintableMissingList` debe manejar el caso `countriesWithMissing.length === 0` mostrando un texto breve ("Álbum completo — sin faltantes") en vez de una matriz vacía.
- **Un país con muchos faltantes (todos los 20):** el bloque del país puede ocupar más que el ancho de página. `white-space: nowrap` haría que se desborde. Mitigación: aplicar `flex-wrap: wrap` también dentro del bloque de país, eliminando `nowrap` y dejando que los números se envuelvan, pero manteniendo el código pegado al primer número (ej. agrupando `[code + primeros números]` en un sub-flex). Decisión: aceptar que un país muy lleno pueda envolverse internamente; mantener `nowrap` solo en el código + primer número para que el código nunca quede solo al final de una línea.
- **i18n:** todas las cadenas pasan por `t(lang, key)`; no hay strings hardcodeadas.
- **Internacionalización de fecha:** usar `Intl.DateTimeFormat` con el `lang` del usuario para formato natural (`10/05/2026` en es, `5/10/2026` en en).

## Archivos afectados

- `src/screens/FullGridScreen.jsx` — agregar botón "Imprimir" condicional y montar `<PrintableMissingList>` oculto.
- `src/components/PrintableMissingList.jsx` — nuevo componente.
- `src/components/PrintableMissingList.css` — estilos propios del componente, incluyendo el bloque `@media print`. Sigue el patrón existente del repo (`Sticker.css`, `TabBar.css`, etc.).
- `src/global.css` — agregar la regla genérica `.no-print { display: none !important; }` dentro de un bloque `@media print` global (utilidad reutilizable).
- `src/i18n.js` — nuevas claves `print`, `missingPrintTitle`.

## Pruebas

- Pruebas unitarias del cálculo de faltantes por país (función pura extraíble): dado un `collection`, devuelve la lista ordenada de `{ team, missingNums }` esperada.
- Verificación manual en el navegador: abrir `FullGridScreen`, filtrar "Faltan", clic en "Imprimir", confirmar en la vista previa de impresión que:
  - Solo aparece la matriz (sin TabBar, sin header de la app, sin botones).
  - Los bloques de país fluyen y envuelven correctamente.
  - El orden coincide con el de la pantalla.
  - El total y la fecha aparecen en el encabezado.
