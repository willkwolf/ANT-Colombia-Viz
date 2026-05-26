# La Frontera de Papel — Conflicto Nasa-Misak, Silvia Cauca

Longform scrollytelling de periodismo de datos sobre la superposición de títulos territoriales entre los resguardos indígenas de Pitayó (Nasa) y Guambía (Misak) en Silvia, Cauca, causada por resoluciones de la Agencia Nacional de Tierras (ANT).

**Sitio en vivo:** https://willkwolf.github.io/ANT-Colombia-Viz/

---

## Estructura del proyecto

```
ANT-Colombia-Viz/
├── .github/
│   └── workflows/
│       └── deploy.yml           # CI/CD: Pipeline de pruebas y despliegue a GitHub Pages
├── index.html                   # Página principal (HTML semántico y accesible)
├── css/
│   └── style.css                # Estilos adaptativos completos (responsive y responsive móvil)
├── js/
│   └── main.js                  # Lógica del mapa (Leaflet.js + IntersectionObserver)
├── data/
│   ├── resguardo-pitayo.geojson    # ⚠️ MOCK — Resguardo Pitayó (Nasa)
│   ├── resguardo-guambia.geojson   # ⚠️ MOCK — Resguardo Guambía (Misak)
│   └── traslape-interseccion.geojson # ⚠️ MOCK — Zona en disputa Alto Méndez
├── tests/
│   ├── data-validation.spec.ts  # Pruebas unitarias de integridad cartográfica (GeoJSON)
│   └── scrollytelling.spec.ts   # Pruebas E2E de interfaz de usuario y mapa Leaflet
├── package.json                 # Gestión de scripts y dependencias
├── playwright.config.ts         # Configuración del entorno de pruebas Playwright
├── tsconfig.json                # Configuración de TypeScript
└── README.md
```

---

## 🧪 Pruebas Automatizadas (QA)

Para garantizar la confiabilidad y calidad de la investigación periodística y sus fuentes de datos, hemos implementado una suite completa de pruebas automatizadas escritas en **TypeScript** usando **Playwright**.

### Pruebas de Integridad de Datos (`tests/data-validation.spec.ts`)
*   **Proyección y Formato:** Valida que todos los archivos geográficos sean `FeatureCollection` válidos en formato **GeoJSON WGS84 / EPSG:4326**.
*   **Coordenadas Geográficas:** Verifica matemáticamente que las coordenadas caigan dentro de los límites geográficos reales de la región del Cauca/Colombia (Longitud `[-77.0, -75.5]`, Latitud `[2.0, 3.5]`).
*   **Atributos y Metadatos:** Comprueba la consistencia de los datos requeridos (nombre del resguardo, comunidad, hectáreas, organización asignada - CRIC/AICO).

### Pruebas E2E de Interactividad (`tests/scrollytelling.spec.ts`)
*   **Inicialización:** Comprueba que la librería Leaflet se inicialice correctamente en el DOM.
*   **Transiciones del Scrollytelling:** Simula el scroll del usuario en pantalla y valida que los steps del texto y los badges dinámicos del HUD (Nasa, Misak, Traslape) ganen y pierdan visibilidad de forma correcta según cada etapa.
*   **Consolidación de Datos:** Simula la descarga y valida que el botón "Descargar GeoJSON Unificado" combine y genere correctamente un archivo de datos estructurado.

### Ejecución de Pruebas en Local

1.  **Instala las dependencias y navegadores necesarios:**
    ```bash
    npm install
    npx playwright install chromium
    ```
2.  **Ejecuta la suite de pruebas:**
    ```bash
    npm run test
    ```

---

## 🚀 Integración Continua (CI/CD) con GitHub Actions

El proyecto cuenta con un flujo automatizado de pruebas y despliegue a producción configurado en `.github/workflows/deploy.yml`:

1.  **Activación automática:** Cada vez que haces un `git push` a la rama `main`, se activa el pipeline en GitHub.
2.  **Garantía de calidad (CI):** Ejecuta la suite completa de pruebas en contenedores Linux sin cabeza de forma paralela. Si alguna validación de datos o interacción de interfaz falla, el despliegue se detiene automáticamente para evitar publicar errores.
3.  **Despliegue automático (CD):** Si todas las pruebas pasan, compila y despliega el sitio web estático directamente a **GitHub Pages** de forma segura utilizando los tokens oficiales de GitHub.

El estado del despliegue y los reportes de pruebas pueden monitorearse directamente desde la pestaña **Actions** en tu repositorio de GitHub.

---

## ⚠️ Reemplazo de datos (OBLIGATORIO antes de publicar)

Los archivos GeoJSON en `/data/` son **datos simulados (mock)**. Para publicar con datos reales:

### 1. Obtén los polígonos oficiales
- **IGAC / Datos Abiertos Colombia:** https://datos.gov.co → busca "resguardo indígena Cauca"
- **ANT:** https://ant.gov.co → Resoluciones de constitución y ampliación de resguardo
- **Geoportal IGAC:** https://geoportal.igac.gov.co

### 2. Verifica el sistema de referencia
El código espera **GeoJSON en WGS84 / EPSG:4326**.  
Si tus capas están en Magna-Sirgas (Colombia), transfórmalas en QGIS:
> Capa → Exportar → Guardar como → CRS: EPSG:4326 → Formato: GeoJSON

### 3. Calcula la intersección
En QGIS: **Vector → Herramientas de geoprocesamiento → Intersección**  
Capa de entrada: Pitayó | Capa de superposición: Guambía  
Exporta el resultado como `traslape-interseccion.geojson`

### 4. Reemplaza los archivos
Sustituye los tres archivos en `/data/` manteniendo los mismos nombres. Las pruebas automatizadas validarán su consistencia al hacer push.

---

## Stack tecnológico

| Componente | Tecnología |
+|---|---|
+| Mapa | [Leaflet.js 1.9.4](https://leafletjs.com/) (SRI corregido) |
+| Capa base | CARTO Dark (CDN) |
+| Fuentes | Google Fonts (Playfair Display, IBM Plex Mono, Source Serif 4) |
+| Scroll detection | `IntersectionObserver` (sin scroll listeners) |
+| Pruebas | Playwright / TypeScript |
+| Automatización | GitHub Actions |
+| Despliegue | GitHub Pages (estático) |

---

## Rendimiento y calidad

- ✅ Sin scroll listeners (usa `IntersectionObserver`) → sin jank
- ✅ Capas GeoJSON cargadas asincrónicamente (lazy)
- ✅ HTML/CSS/JS base < 250KB (sin contar tiles del mapa)
- ✅ Responsive: layout split en desktop, mapa de fondo fijo en móvil
- ✅ Accesible: roles ARIA, etiquetas semánticas, `aria-live` en el mapa

---

## Licencia

MIT License — Código abierto. Datos propios de las fuentes oficiales citadas.

**Descargo de responsabilidad:** La visualización mapea directamente coordenadas de portales oficiales del Estado colombiano (IGAC / Datos Abiertos / ANT). No constituye juicio de delimitación fronteriza. La determinación de límites reales es competencia exclusiva de las autoridades estatales en diálogo con las comunidades.
