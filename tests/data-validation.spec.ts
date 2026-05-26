import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Ruta base de los datos en el proyecto
const DATA_DIR = path.resolve(__dirname, '../data');

// Función auxiliar para leer y parsear un GeoJSON
function readGeoJSON(filename: string) {
  const filePath = path.join(DATA_DIR, filename);
  expect(fs.existsSync(filePath)).toBe(true);
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const json = JSON.parse(rawData);
  return json;
}

test.describe('Validación de Datos Cartográficos (GeoJSON)', () => {

  test('El resguardo de Guambía (Misak) debe tener la estructura y atributos correctos', () => {
    const geojson = readGeoJSON('resguardo-guambia.geojson');
    
    // Validar estructura de GeoJSON
    expect(geojson.type).toBe('FeatureCollection');
    expect(Array.isArray(geojson.features)).toBe(true);
    expect(geojson.features.length).toBeGreaterThan(0);

    const feature = geojson.features[0];
    expect(feature.type).toBe('Feature');
    expect(feature.geometry.type).toBe('Polygon');
    expect(Array.isArray(feature.geometry.coordinates)).toBe(true);

    // Validar propiedades específicas del resguardo
    const props = feature.properties;
    expect(props).toBeDefined();
    expect(props.nombre).toBe('Resguardo Indígena de Guambía');
    expect(props.comunidad).toBe('Misak');
    expect(props.municipio).toBe('Silvia');
    expect(props.departamento).toBe('Cauca');
    expect(props.organizacion).toBe('AICO');
    expect(props.area_ha).toBe(9800);

    // Validar que las coordenadas sean WGS84 (Longitud, Latitud) en el Cauca/Colombia
    const coords = feature.geometry.coordinates[0];
    for (const coord of coords) {
      const [lng, lat] = coord;
      // Silvia, Cauca se ubica aprox en Longitud [-77, -76], Latitud [2, 3]
      expect(lng).toBeGreaterThan(-77.0);
      expect(lng).toBeLessThan(-75.5);
      expect(lat).toBeGreaterThan(2.0);
      expect(lat).toBeLessThan(3.5);
    }
  });

  test('El resguardo de Pitayó (Nasa) debe tener la estructura y atributos correctos', () => {
    const geojson = readGeoJSON('resguardo-pitayo.geojson');
    
    // Validar estructura de GeoJSON
    expect(geojson.type).toBe('FeatureCollection');
    expect(Array.isArray(geojson.features)).toBe(true);
    expect(geojson.features.length).toBeGreaterThan(0);

    const feature = geojson.features[0];
    expect(feature.type).toBe('Feature');
    expect(feature.geometry.type).toBe('Polygon');
    expect(Array.isArray(feature.geometry.coordinates)).toBe(true);

    // Validar propiedades específicas del resguardo
    const props = feature.properties;
    expect(props).toBeDefined();
    expect(props.nombre).toBe('Resguardo Indígena de Pitayó');
    expect(props.comunidad).toBe('Nasa');
    expect(props.municipio).toBe('Silvia');
    expect(props.departamento).toBe('Cauca');
    expect(props.organizacion).toBe('CRIC');
    expect(props.area_ha).toBe(12500);

    // Validar que las coordenadas sean WGS84 y en la región esperada
    const coords = feature.geometry.coordinates[0];
    for (const coord of coords) {
      const [lng, lat] = coord;
      expect(lng).toBeGreaterThan(-77.0);
      expect(lng).toBeLessThan(-75.5);
      expect(lat).toBeGreaterThan(2.0);
      expect(lat).toBeLessThan(3.5);
    }
  });

  test('El polígono de traslape debe tener la estructura y atributos correctos', () => {
    const geojson = readGeoJSON('traslape-interseccion.geojson');
    
    // Validar estructura de GeoJSON
    expect(geojson.type).toBe('FeatureCollection');
    expect(Array.isArray(geojson.features)).toBe(true);
    expect(geojson.features.length).toBeGreaterThan(0);

    const feature = geojson.features[0];
    expect(feature.type).toBe('Feature');
    expect(feature.geometry.type).toBe('Polygon');
    expect(Array.isArray(feature.geometry.coordinates)).toBe(true);

    // Validar propiedades del traslape
    const props = feature.properties;
    expect(props).toBeDefined();
    expect(props.disputa).toBe(true);
    expect(props.area_ha_aprox).toBe(1200);
    expect(props.estado).toBe('En disputa — Resoluciones ANT superpuestas');
    expect(Array.isArray(props.comunidades)).toBe(true);
    expect(props.comunidades).toContain('Nasa (Pitayó)');
    expect(props.comunidades).toContain('Misak (Guambía)');

    // Validar coordenadas en la región esperada
    const coords = feature.geometry.coordinates[0];
    for (const coord of coords) {
      const [lng, lat] = coord;
      expect(lng).toBeGreaterThan(-77.0);
      expect(lng).toBeLessThan(-75.5);
      expect(lat).toBeGreaterThan(2.0);
      expect(lat).toBeLessThan(3.5);
    }
  });

});
