# La Frontera de Papel — Conflicto Nasa-Misak, Silvia Cauca

Longform scrollytelling de periodismo de datos sobre la superposición de títulos territoriales entre los resguardos indígenas de Pitayó (Nasa) y Guambía (Misak) en Silvia, Cauca, causada por resoluciones de la Agencia Nacional de Tierras (ANT).

> [!CAUTION]
> **Enlace de publicación desactivado:** La visualización web se mantiene bajo entorno local de pruebas. No se publicará de manera abierta en entornos de producción debido a la inexistencia de datos geográficos oficiales confiables y la opacidad administrativa de las entidades gubernamentales del Estado colombiano.

---

## 🏛️ La Opacidad del Estado: Barreras para la Investigación Digital

La "Frontera de Papel" no es solo un conflicto territorial entre dos comunidades indígenas hermanas; es un reflejo de la **opacidad estructural del Estado colombiano** respecto a su información cartográfica y de tierras. 

Durante esta investigación digital, el acceso a datos oficiales abiertos evidenció barreras técnicas sistemáticas que impiden el control ciudadano y el periodismo de datos independiente:

1. **Datos Fragmentados y Desactualizados:** Portales como *datos.gov.co* o el Geoportal del Instituto Geográfico Agustín Codazzi (IGAC) alojan capas de resguardos que no coinciden con las resoluciones textuales vigentes de la Agencia Nacional de Tierras (ANT). Los polígonos oficiales presentan desfases históricos sin depurar.
2. **Vacíos de Información Georreferenciada:** Las resoluciones de ampliación emitidas por la ANT describen los límites de los resguardos en lenguaje natural ("desde el filo del cerro hasta la quebrada") sin asociar coordenadas geodésicas (WGS84) precisas. Al no digitalizar técnicamente sus propios actos administrativos, el Estado produce vacíos legales y cartográficos que propician el traslape en el terreno.
3. **Plataformas Inaccesibles (Barreras de Entrada):** La cartografía oficial de la Agencia Nacional de Tierras y del IGAC está dispersa en visores propietarios lentos (ArcGIS WebMaps) y APIs REST inestables que carecen de documentación clara o descargas masivas sencillas en estándares abiertos (GeoJSON/WFS).
4. **La "Burocracia del Dato":** Obtener los planos definitivos y las carteras de coordenadas requiere derechos de petición formales con tiempos de respuesta prolongados, limitando la inmediatez de la investigación periodística sobre conflictos territoriales activos.

Este proyecto utiliza capas geográficas **simuladas (mock)** en su carpeta `/data/` para representar fielmente la superposición descrita en testimonios y documentos legales físicos. La imposibilidad de sustituirlos por capas oficiales definitivas y unificadas es la mayor prueba de que el catastro indígena en Colombia sigue siendo una frontera invisible.

---

## Estructura del proyecto

```
ANT-Colombia-Viz/
├── .github/
│   └── workflows/
│       └── deploy.yml           # CI: Pipeline de pruebas automatizadas (sin despliegue)
├── index.html                   # Página principal (HTML semántico y accesible)
├── css/
│   └── style.css                # Estilos adaptativos completos
├── js/
│   └── main.js                  # Lógica del mapa (Leaflet.js + IntersectionObserver)
├── data/
│   ├── resguardo-pitayo.geojson    # ⚠️ MOCK — Resguardo Pitayó (Nasa)
│   ├── resguardo-guambia.geojson   # ⚠️ MOCK — Resguardo Guambía (Misak)
│   └── traslape-interseccion.geojson # ⚠️ MOCK — Zona en disputa Alto Méndez
├── tests/
│   ├── data-validation.spec.ts  # Validación de formato y coherencia geográfica (GeoJSON)
│   └── scrollytelling.spec.ts   # Pruebas E2E de interfaz de usuario
├── package.json                 # Gestión de scripts y dependencias
├── playwright.config.ts         # Configuración de Playwright
└── tsconfig.json                # Configuración de TypeScript
```

---

## 🧪 Pruebas Automatizadas (QA Local)

Hemos diseñado una suite de pruebas para verificar que el código base y la maqueta de datos sean robustos ante futuros ingresos de información:

* **Pruebas de Datos (`tests/data-validation.spec.ts`):** Verifican que la estructura cumpla el estándar GeoJSON WGS84 / EPSG:4326 y que las coordenadas simuladas caigan dentro de la zona de Silvia, Cauca.
* **Pruebas de Interfaz (`tests/scrollytelling.spec.ts`):** Prueban que el scroll active correctamente las transiciones del mapa, HUD, y que la descarga del archivo geográfico consolidado funcione.

### Ejecución de Pruebas

1. **Instala dependencias y navegadores:**
   ```bash
   npm install
   npx playwright install chromium
   ```
2. **Ejecuta las pruebas:**
   ```bash
   npm run test
   ```

---

## Stack tecnológico

| Componente | Tecnología |
|---|---|
| Mapa | [Leaflet.js 1.9.4](https://leafletjs.com/) |
| Capa base | CARTO Dark (CDN) |
| Lógica | Vanilla HTML / CSS / JS |
| Pruebas | Playwright / TypeScript |
| Calidad | GitHub Actions CI (QA) |

---

## Licencia

MIT License. Código libre para replicar visualizaciones de periodismo de datos independientes.
