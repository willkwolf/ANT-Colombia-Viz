/**
 * ANT-CAUCA SCROLLYTELLING — MOTOR PRINCIPAL
 * ============================================
 * Arquitectura:
 *   - MapController: gestiona Leaflet, capas GeoJSON, transiciones
 *   - ScrollObserver: Intersection Observer para activar steps
 *   - DataLoader: fetch asíncrono y lazy de archivos GeoJSON
 *
 * Rendimiento:
 *   - IntersectionObserver (sin scroll listener para evitar jank)
 *   - requestAnimationFrame para transiciones de mapa
 *   - Capas GeoJSON con lazy loading (se cargan solo cuando el mapa inicia)
 */

'use strict';

/* =============================================
   CONFIGURACIÓN CENTRAL
   ============================================= */
const CONFIG = {
  map: {
    initialView: [-76.80, 2.45],   // Suroccidente colombiano
    initialZoom: 7,
    silviaCoords: [-76.383, 2.664], // Casco urbano Silvia, Cauca
    silviaZoom: 12,
    overlapZoom: 13,
    overlapCoords: [-76.390, 2.750],
    tileLayer: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    maxZoom: 19
  },
  geojson: {
    pitayo:    './data/resguardo-pitayo.geojson',
    guambia:   './data/resguardo-guambia.geojson',
    traslape:  './data/traslape-interseccion.geojson'
  },
  styles: {
    nasa: {
      color: '#e8a020',
      weight: 2.5,
      fillColor: '#e8a020',
      fillOpacity: 0.15,
      dashArray: null
    },
    misak: {
      color: '#4ea8c9',
      weight: 2.5,
      fillColor: '#4ea8c9',
      fillOpacity: 0.15,
      dashArray: null
    },
    traslape: {
      color: '#e03030',
      weight: 3,
      fillColor: '#e03030',
      fillOpacity: 0.3,
      dashArray: '6,4'
    }
  }
};

/* =============================================
   DATA LOADER — Carga asíncrona de GeoJSON
   ============================================= */
const DataLoader = {
  cache: {},

  /**
   * Carga un GeoJSON. Usa caché para no re-fetch.
   * @param {string} key - clave de CONFIG.geojson
   * @returns {Promise<Object>} - Feature Collection parseada
   */
  async load(key) {
    if (this.cache[key]) return this.cache[key];
    const url = CONFIG.geojson[key];
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} al cargar ${url}`);
      const data = await res.json();
      this.cache[key] = data;
      return data;
    } catch (err) {
      console.warn(`[DataLoader] No se pudo cargar ${url}:`, err.message);
      return null;
    }
  },

  /** Precarga todos los GeoJSON en paralelo */
  async preloadAll() {
    await Promise.all(
      Object.keys(CONFIG.geojson).map(k => this.load(k))
    );
  }
};

/* =============================================
   MAP CONTROLLER — Gestión de Leaflet y capas
   ============================================= */
const MapController = {
  map: null,
  layers: {},
  initialized: false,
  currentStage: -1,
  flyToRAF: null,

  /** Inicializa el mapa Leaflet */
  async init() {
    if (this.initialized) return;
    this.initialized = true;

    // Inicializar mapa
    this.map = L.map('map', {
      center: CONFIG.map.initialView,
      zoom: CONFIG.map.initialZoom,
      zoomControl: true,
      attributionControl: true,
      preferCanvas: true // mejor rendimiento para polígonos
    });

    // Capa base oscura (CARTO Dark)
    L.tileLayer(CONFIG.map.tileLayer, {
      attribution: CONFIG.map.attribution,
      maxZoom: CONFIG.map.maxZoom
    }).addTo(this.map);

    // Mover controles de zoom
    this.map.zoomControl.setPosition('bottomright');

    // Cargar capas GeoJSON de forma asíncrona
    await this._loadAllLayers();

    // HUD inicial
    this._updateHUD(0);
  },

  /** Carga y registra todas las capas GeoJSON */
  async _loadAllLayers() {
    const [pitayoData, guambiaData, traslapeData] = await Promise.all([
      DataLoader.load('pitayo'),
      DataLoader.load('guambia'),
      DataLoader.load('traslape')
    ]);

    if (pitayoData) {
      this.layers.pitayo = L.geoJSON(pitayoData, {
        style: CONFIG.styles.nasa,
        onEachFeature: (f, layer) => {
          layer.bindPopup(this._popupNasa(f.properties));
        }
      });
    }

    if (guambiaData) {
      this.layers.guambia = L.geoJSON(guambiaData, {
        style: CONFIG.styles.misak,
        onEachFeature: (f, layer) => {
          layer.bindPopup(this._popupMisak(f.properties));
        }
      });
    }

    if (traslapeData) {
      this.layers.traslape = L.geoJSON(traslapeData, {
        style: CONFIG.styles.traslape,
        onEachFeature: (f, layer) => {
          layer.bindPopup(this._popupTraslape(f.properties));
        }
      });
    }
  },

  /** Genera HTML del popup Nasa */
  _popupNasa(props) {
    return `
      <div style="min-width:200px">
        <div style="color:#e8a020;font-size:0.6rem;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:6px">
          RESGUARDO NASA
        </div>
        <strong style="font-size:0.85rem">${props.nombre || '—'}</strong>
        <div style="margin-top:8px;color:#9a9480">
          Municipio: ${props.municipio || '—'}<br>
          Área: ~${(props.area_ha || 0).toLocaleString()} ha<br>
          Org: ${props.organizacion || '—'}
        </div>
        ${props.nota ? `<div style="margin-top:8px;color:#e03030;font-size:0.65rem">${props.nota}</div>` : ''}
      </div>`;
  },

  /** Genera HTML del popup Misak */
  _popupMisak(props) {
    return `
      <div style="min-width:200px">
        <div style="color:#4ea8c9;font-size:0.6rem;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:6px">
          RESGUARDO MISAK
        </div>
        <strong style="font-size:0.85rem">${props.nombre || '—'}</strong>
        <div style="margin-top:8px;color:#9a9480">
          Municipio: ${props.municipio || '—'}<br>
          Área: ~${(props.area_ha || 0).toLocaleString()} ha<br>
          Org: ${props.organizacion || '—'}
        </div>
        ${props.nota ? `<div style="margin-top:8px;color:#e03030;font-size:0.65rem">${props.nota}</div>` : ''}
      </div>`;
  },

  /** Genera HTML del popup Traslape */
  _popupTraslape(props) {
    return `
      <div style="min-width:220px">
        <div style="color:#e03030;font-size:0.6rem;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:6px">
          ⚠ ZONA EN DISPUTA
        </div>
        <strong style="font-size:0.85rem">${props.nombre || '—'}</strong>
        <div style="margin-top:8px;color:#9a9480">
          Área aprox: ~${(props.area_ha_aprox || 0).toLocaleString()} ha<br>
          Estado: ${props.estado || '—'}
        </div>
        ${props.nota ? `<div style="margin-top:8px;color:#e03030;font-size:0.65rem">${props.nota}</div>` : ''}
      </div>`;
  },

  /**
   * Transiciona el mapa al estado de la etapa dada.
   * Usa requestAnimationFrame para encolar la animación sin bloquear el hilo.
   * @param {number} stage - índice de etapa (0, 1, 2, 3)
   */
  goToStage(stage) {
    if (this.currentStage === stage) return;
    this.currentStage = stage;

    // Cancelar raf previo si lo hay
    if (this.flyToRAF) cancelAnimationFrame(this.flyToRAF);

    this.flyToRAF = requestAnimationFrame(() => {
      this._applyStage(stage);
    });
  },

  /** Aplica el estado de mapa para cada etapa */
  _applyStage(stage) {
    const map = this.map;
    const { pitayo, guambia, traslape } = this.layers;

    switch (stage) {
      // Etapa 0 (Hero): Vista macro Suroccidente
      case 0:
        map.flyTo(CONFIG.map.initialView, CONFIG.map.initialZoom, {
          duration: 1.8, easeLinearity: 0.35
        });
        this._hideLayers([pitayo, guambia, traslape]);
        this._updateHUD(0);
        this._setStageLabel('Cauca, Suroccidente Colombiano');
        break;

      // Etapa 1: Zoom a Silvia
      case 1:
        map.flyTo(CONFIG.map.silviaCoords, CONFIG.map.silviaZoom, {
          duration: 2.2, easeLinearity: 0.3
        });
        this._hideLayers([pitayo, guambia, traslape]);
        this._updateHUD(1);
        this._setStageLabel('Municipio de Silvia — Cauca');
        break;

      // Etapa 2: Mostrar ambos resguardos
      case 2:
        map.flyTo(CONFIG.map.overlapCoords, CONFIG.map.overlapZoom - 1, {
          duration: 1.8, easeLinearity: 0.35
        });
        this._hideLayers([traslape]);
        this._showLayer(pitayo);
        this._showLayer(guambia);
        this._updateHUD(2);
        this._setStageLabel('Resguardos Pitayó y Guambía');
        break;

      // Etapa 3: Revelar traslape
      case 3:
        map.flyTo(CONFIG.map.overlapCoords, CONFIG.map.overlapZoom, {
          duration: 1.5, easeLinearity: 0.4
        });
        this._showLayer(pitayo);
        this._showLayer(guambia);
        this._showLayer(traslape);
        this._updateHUD(3);
        this._setStageLabel('Zona de Traslape — Alto Méndez / La Ensillada');
        // Animar pulso en el traslape
        if (traslape) this._pulseLayer(traslape);
        break;
    }
  },

  /** Muestra una capa si existe y no está en el mapa */
  _showLayer(layer) {
    if (!layer || this.map.hasLayer(layer)) return;
    layer.addTo(this.map);
  },

  /** Oculta una array de capas */
  _hideLayers(layers) {
    layers.forEach(l => {
      if (l && this.map.hasLayer(l)) this.map.removeLayer(l);
    });
  },

  /** Actualiza los badges HUD del mapa */
  _updateHUD(stage) {
    const nasa = document.getElementById('hud-nasa');
    const misak = document.getElementById('hud-misak');
    const trasl = document.getElementById('hud-traslape');
    if (!nasa || !misak || !trasl) return;

    nasa.classList.toggle('visible', stage >= 2);
    misak.classList.toggle('visible', stage >= 2);
    trasl.classList.toggle('visible', stage >= 3);
  },

  /** Actualiza la etiqueta inferior del mapa */
  _setStageLabel(text) {
    const el = document.getElementById('map-stage-label');
    if (el) el.textContent = text;
  },

  /**
   * Efecto de pulso en la capa de traslape:
   * Alterna opacidad para simular intermitencia.
   */
  _pulseLayer(layer) {
    let opacity = 0.3;
    let direction = -1;
    let frame = 0;

    const pulse = () => {
      frame++;
      if (frame % 3 !== 0) { // throttle: solo actualiza cada 3 frames
        requestAnimationFrame(pulse);
        return;
      }
      opacity += direction * 0.015;
      if (opacity <= 0.05) direction = 1;
      if (opacity >= 0.4) direction = -1;

      layer.setStyle({ fillOpacity: opacity });

      // Detener pulso si el stage ya cambió
      if (this.currentStage === 3) requestAnimationFrame(pulse);
    };

    requestAnimationFrame(pulse);
  }
};

/* =============================================
   SCROLL OBSERVER — Intersection Observer
   Detecta qué step está visible sin scroll listeners
   ============================================= */
const ScrollObserver = {
  observer: null,
  steps: [],

  init() {
    this.steps = Array.from(document.querySelectorAll('.step[data-stage]'));

    // Observer con threshold escalonado para mejor detección
    this.observer = new IntersectionObserver(
      (entries) => this._onIntersect(entries),
      {
        root: null,
        rootMargin: '-25% 0px -25% 0px', // Activa cuando el step ocupa el 50% central
        threshold: 0
      }
    );

    this.steps.forEach(step => this.observer.observe(step));
  },

  _onIntersect(entries) {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const stage = parseInt(entry.target.dataset.stage, 10);
      const step = entry.target;

      // Marcar step activo
      this.steps.forEach(s => s.classList.remove('is-active'));
      step.classList.add('is-active');

      // Transicionar el mapa
      MapController.goToStage(stage);
    });
  },

  destroy() {
    if (this.observer) this.observer.disconnect();
  }
};

/* =============================================
   DESCARGA — Genera y descarga el GeoJSON unificado
   ============================================= */
async function downloadUnifiedGeoJSON() {
  const btn = document.getElementById('btn-download-geojson');
  if (btn) {
    btn.textContent = 'Preparando…';
    btn.disabled = true;
  }

  try {
    await DataLoader.preloadAll();
    const allFeatures = [];

    Object.values(DataLoader.cache).forEach(collection => {
      if (collection && collection.features) {
        allFeatures.push(...collection.features);
      }
    });

    const unified = {
      type: 'FeatureCollection',
      name: 'ANT-Cauca — Resguardos y Traslape — Datos Unificados',
      generated: new Date().toISOString(),
      nota: 'Datos simulados (mock). Reemplazar con fuentes oficiales IGAC / Datos Abiertos Colombia.',
      features: allFeatures
    };

    const blob = new Blob([JSON.stringify(unified, null, 2)], {
      type: 'application/geo+json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ant-cauca-resguardos-unified.geojson';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

  } catch (err) {
    console.error('[Download] Error:', err);
    alert('No se pudo generar el archivo. Revisa la consola para detalles.');
  } finally {
    if (btn) {
      btn.textContent = 'Descargar GeoJSON Unificado';
      btn.disabled = false;
    }
  }
}

/* =============================================
   HERO MAP — Mini mapa de fondo en el hero
   ============================================= */
function initHeroMap() {
  const el = document.getElementById('hero-map-bg');
  if (!el) return;

  const heroMap = L.map('hero-map-bg', {
    center: CONFIG.map.initialView,
    zoom: CONFIG.map.initialZoom - 1,
    zoomControl: false,
    attributionControl: false,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    touchZoom: false,
    keyboard: false,
    interactive: false
  });

  L.tileLayer(CONFIG.map.tileLayer, { maxZoom: 12 }).addTo(heroMap);

  // Añadir marcador de Silvia
  L.circleMarker(CONFIG.map.silviaCoords.slice().reverse(), {
    radius: 5,
    color: '#e8a020',
    fillColor: '#e8a020',
    fillOpacity: 0.8,
    weight: 2
  }).addTo(heroMap);
}

/* =============================================
   INICIALIZACIÓN
   ============================================= */
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Hero map (decorativo, no bloquea)
  try { initHeroMap(); } catch (e) { /* silencioso */ }

  // 2. Mapa principal + capas
  await MapController.init();

  // 3. Scroll observer (sin listener nativo, sin jank)
  ScrollObserver.init();

  // 4. Botón de descarga GeoJSON
  const btnGeoJSON = document.getElementById('btn-download-geojson');
  if (btnGeoJSON) {
    btnGeoJSON.addEventListener('click', () => downloadUnifiedGeoJSON());
  }

  // 5. Activar stage inicial (el hero)
  MapController.goToStage(0);

  console.info('%c[ANT-Cauca] Aplicación iniciada ✓', 'color: #e8a020; font-family: monospace');
  console.info('%cPara reemplazar los datos mock, sustituye los archivos en /data/', 'color: #9a9480; font-family: monospace');
});

/* Cleanup al desmontar (evitar fugas de memoria) */
window.addEventListener('beforeunload', () => {
  ScrollObserver.destroy();
  if (MapController.flyToRAF) cancelAnimationFrame(MapController.flyToRAF);
});
