# La Frontera de Papel — Conflicto Nasa-Misak, Silvia Cauca

Longform scrollytelling de periodismo de datos sobre la superposición de títulos territoriales entre los resguardos indígenas de Pitayó (Nasa) y Guambía (Misak) en Silvia, Cauca, causada por resoluciones de la Agencia Nacional de Tierras (ANT).

**Sitio en vivo:** https://willkwolf.github.io/ANT-Cauca/

---

## Estructura del proyecto

```
ANT-Cauca/
├── index.html                   # Página principal
├── css/
│   └── style.css                # Estilos completos (responsive)
├── js/
│   └── main.js                  # Motor de scrollytelling + Leaflet
├── data/
│   ├── resguardo-pitayo.geojson    # ⚠️ MOCK — Reemplazar con datos IGAC
│   ├── resguardo-guambia.geojson   # ⚠️ MOCK — Reemplazar con datos IGAC
│   └── traslape-interseccion.geojson # ⚠️ MOCK — Calcular con QGIS
└── README.md
```

---

## Despliegue en GitHub Pages

1. En tu repositorio de GitHub, ve a **Settings → Pages**
2. Fuente: `Deploy from a branch` → rama `main` → carpeta `/ (root)`
3. Guarda. El sitio estará disponible en `https://willkwolf.github.io/ANT-Cauca/` en ~2 minutos.

---

## ⚠️ Reemplazo de datos (OBLIGATORIO antes de publicar)

Los archivos GeoJSON en `/data/` son **datos simulados (mock)**. Para publicar con datos reales:

### 1. Obtén los polígonos oficiales
- **IGAC / Datos Abiertos Colombia:** https://datos.gov.co → busca "resguardos indígenas Cauca"
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
Sustituye los tres archivos en `/data/` manteniendo los mismos nombres.  
El código los cargará automáticamente sin cambios adicionales.

---

## Stack tecnológico

| Componente | Tecnología |
|---|---|
| Mapa | [Leaflet.js 1.9.4](https://leafletjs.com/) |
| Capa base | CARTO Dark (CDN) |
| Fuentes | Google Fonts (Playfair Display, IBM Plex Mono, Source Serif 4) |
| Scroll detection | `IntersectionObserver` (sin scroll listeners) |
| Datos | GeoJSON plano (sin backend) |
| Despliegue | GitHub Pages (estático) |

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
