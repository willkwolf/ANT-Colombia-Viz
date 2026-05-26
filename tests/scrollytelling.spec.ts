import { test, expect } from '@playwright/test';
import * as fs from 'fs';

test.describe('E2E Scrollytelling & Interactividad del Mapa', () => {

  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log(`[BROWSER CONSOLE]: ${msg.type()}: ${msg.text()}`));
    page.on('pageerror', err => console.error(`[BROWSER EXCEPTION]: ${err.message}\n${err.stack}`));
  });

  test('La página principal debe cargar correctamente con el mapa Leaflet', async ({ page }) => {
    // 1. Navegar a la página de inicio
    await page.goto('/');

    // 2. Verificar títulos principales
    await expect(page.locator('.hero-title')).toContainText('La Frontera');
    await expect(page.locator('.hero-title em')).toContainText('Papel');

    // 3. Verificar que el contenedor del mapa existe y tiene inicializado Leaflet
    const mapContainer = page.locator('#map');
    await expect(mapContainer).toBeVisible();
    await expect(mapContainer).toHaveClass(/leaflet-container/);
  });

  test('El scroll debe activar dinámicamente los steps y los badges del HUD', async ({ page }) => {
    await page.goto('/');
    
    // Configurar viewport de desktop estándar para asegurar activaciones por IntersectionObserver
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Esperar a que el mapa se inicialice y cargue
    await page.waitForTimeout(1000);

    // --- ETAPA 1 (Contexto regional) ---
    // Hacemos scroll al primer paso (Etapa 1)
    const step1 = page.locator('.step[data-stage="1"]');
    await step1.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500); // Dar tiempo para la transición
    
    // Verificar que el paso 1 esté activo
    await expect(step1).toHaveClass(/is-active/);
    
    // En la Etapa 1, los badges no deben ser visibles aún
    await expect(page.locator('#hud-nasa')).not.toHaveClass(/visible/);
    await expect(page.locator('#hud-misak')).not.toHaveClass(/visible/);
    await expect(page.locator('#hud-traslape')).not.toHaveClass(/visible/);
    await expect(page.locator('#map-stage-label')).toHaveText('Municipio de Silvia — Cauca');

    // --- ETAPA 2 (Silvia y las dos naciones) ---
    const step2 = page.locator('.step[data-stage="2"]');
    await step2.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Verificar que el paso 2 esté activo
    await expect(step2).toHaveClass(/is-active/);
    
    // En la Etapa 2, los resguardos Nasa y Misak deben aparecer en el HUD, pero no el traslape
    await expect(page.locator('#hud-nasa')).toHaveClass(/visible/);
    await expect(page.locator('#hud-misak')).toHaveClass(/visible/);
    await expect(page.locator('#hud-traslape')).not.toHaveClass(/visible/);
    await expect(page.locator('#map-stage-label')).toHaveText('Resguardos Pitayó y Guambía');

    // --- ETAPA 3 (Frontera de papel / traslape) ---
    const step3 = page.locator('.step[data-stage="3"]');
    await step3.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Verificar que el paso 3 esté activo
    await expect(step3).toHaveClass(/is-active/);
    
    // En la Etapa 3, todos los badges (incluido el traslape) deben ser visibles
    await expect(page.locator('#hud-nasa')).toHaveClass(/visible/);
    await expect(page.locator('#hud-misak')).toHaveClass(/visible/);
    await expect(page.locator('#hud-traslape')).toHaveClass(/visible/);
    await expect(page.locator('#map-stage-label')).toHaveText('Zona de Traslape — Alto Méndez / La Ensillada');
  });

  test('El botón de descarga debe consolidar y descargar el GeoJSON unificado correctamente', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Configurar la interceptación del evento de descarga
    const downloadPromise = page.waitForEvent('download');
    
    // Hacer clic en el botón de descarga en la sección Open Data Hub
    await page.click('#btn-download-geojson');
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('ant-cauca-resguardos-unified.geojson');

    // Guardar el archivo en una ruta temporal del test
    const downloadPath = await download.path();
    expect(downloadPath).not.toBeNull();

    // Validar el contenido del archivo descargado
    if (downloadPath) {
      const fileContent = fs.readFileSync(downloadPath, 'utf8');
      const geojson = JSON.parse(fileContent);

      expect(geojson.type).toBe('FeatureCollection');
      expect(geojson.name).toBe('ANT-Cauca — Resguardos y Traslape — Datos Unificados');
      expect(Array.isArray(geojson.features)).toBe(true);
      
      // Debe contener al menos las 3 capas: Pitayó, Guambía y Traslape
      expect(geojson.features.length).toBeGreaterThanOrEqual(3);

      // Verificar que tenga las propiedades características de los resguardos consolidados
      const comunidades = geojson.features.map((f: any) => f.properties.comunidad || (f.properties.comunidades ? 'Traslape' : ''));
      expect(comunidades).toContain('Nasa');
      expect(comunidades).toContain('Misak');
      expect(comunidades).toContain('Traslape');
    }
  });

});
