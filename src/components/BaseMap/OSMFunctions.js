
import React, { Component } from 'react';
import * as CommonMapFunctions from './CommonMapFunctions'
import axios from 'axios';
import { update } from 'react-spring';
var Cesium = require('cesium/Cesium');

// Cache para evitar cargar los mismos tiles múltiples veces
const loadedTiles = new Set();
const buildingEntities = new Map();
const maxCachedTiles = 100; // Límite de tiles en caché

// Función para convertir materiales/colores a colores Cesium
function getMaterialColor(colorOrMaterial) {
  if (!colorOrMaterial) return Cesium.Color.LIGHTGRAY;
  
  const value = colorOrMaterial.toLowerCase();
  
  // Mapeo de materiales comunes a colores
  const materialMap = {
    'brick': '#8B4513',
    'stone': '#696969',
    'concrete': '#A9A9A9',
    'plaster': '#F5F5DC',
    'wood': '#8B7355',
    'metal': '#C0C0C0',
    'glass': '#87CEEB',
    'sandstone': '#C2B280',
    'limestone': '#E0DCC3',
    'granite': '#808080',
    'marble': '#F0F0F0',
    'timber': '#8B7355',
    'cladding': '#D3D3D3',
    'bronze': '#CD7F32',
    'copper': '#B87333',
    'gold': '#FFD700',
    'silver': '#C0C0C0',
  };
  
  // Si es un material conocido, usar su color
  if (materialMap[value]) {
    return Cesium.Color.fromCssColorString(materialMap[value]);
  }
  
  // Si parece un color CSS, intentar parsearlo
  try {
    return Cesium.Color.fromCssColorString(colorOrMaterial);
  } catch (e) {
    return Cesium.Color.LIGHTGRAY;
  }
}

// Función para obtener colores de tejados
function getRoofColor(roofColorOrMaterial, roofMaterial) {
  // Prioridad: roofColor directo > roofMaterial específico > mapeo general
  
  // Si hay roofColor y no es vacío, usarlo
  if (roofColorOrMaterial && roofColorOrMaterial.toLowerCase().trim()) {
    const value = roofColorOrMaterial.toLowerCase().trim();
    
    // Mapeo de valores CSS directo
    try {
      return Cesium.Color.fromCssColorString(roofColorOrMaterial);
    } catch (e) {
      // No es un color CSS, continuar con el mapeo
    }
  }
  
  // Revisar roofMaterial específicamente
  if (roofMaterial) {
    const materialValue = roofMaterial.toLowerCase().trim();
    
    if (materialValue === 'metal_sheet' || materialValue === 'metal') {
      return Cesium.Color.fromCssColorString('#808080'); // Gris metálico
    }
    if (materialValue === 'roof_tiles' || materialValue === 'tiles' || materialValue === 'teja') {
      return Cesium.Color.fromCssColorString('#B8492D'); // Rojo rojizo
    }
  }
  
  // Mapeo general para roofColor u otros valores
  if (roofColorOrMaterial) {
    const value = roofColorOrMaterial.toLowerCase();
    
    const roofMap = {
      'red': '#A52A2A',
      'tile': '#A0522D',
      'tiles': '#B8492D',
      'teja': '#B8492D',
      'slate': '#2F4F4F',
      'metal': '#808080',
      'metal_sheet': '#808080',
      'chapa': '#808080',
      'copper': '#B87333',
      'green': '#2F4F2F',
      'blue': '#4682B4',
      'azul': '#4682B4',
      'brown': '#654321',
      'grey': '#808080',
      'gray': '#808080',
      'black': '#2F2F2F',
      'tar': '#2F2F2F',
      'gravel': '#696969',
      'concrete': '#A9A9A9',
    };
    
    if (roofMap[value]) {
      return Cesium.Color.fromCssColorString(roofMap[value]);
    }
  }
  
  // Color por defecto
  return Cesium.Color.DARKRED;
}

// Función para crear la descripción HTML del edificio
function createBuildingDescription(properties, height, minHeight, roofHeight) {
  const buildingThickness = height - minHeight;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 300px;">
      <h3 style="margin: 0 0 10px 0; color: #333;">${properties.name || 'Edificio'}</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 5px; font-weight: bold;">ID:</td>
          <td style="padding: 5px;">${properties.id || 'N/A'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 5px; font-weight: bold;">Altura base:</td>
          <td style="padding: 5px;">${minHeight}m</td>
        </tr>
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 5px; font-weight: bold;">Altura total:</td>
          <td style="padding: 5px;">${height}m</td>
        </tr>
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 5px; font-weight: bold;">Grosor edificio:</td>
          <td style="padding: 5px;">${buildingThickness}m</td>
        </tr>
        ${roofHeight > 0 ? `
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 5px; font-weight: bold;">Altura tejado:</td>
          <td style="padding: 5px;">${roofHeight}m</td>
        </tr>
        ` : ''}
        ${properties.levels ? `
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 5px; font-weight: bold;">Plantas:</td>
          <td style="padding: 5px;">${properties.levels}</td>
        </tr>
        ` : ''}
        ${properties.type ? `
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 5px; font-weight: bold;">Tipo:</td>
          <td style="padding: 5px;">${properties.type}</td>
        </tr>
        ` : ''}
        ${properties.material ? `
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 5px; font-weight: bold;">Material:</td>
          <td style="padding: 5px;">${properties.material}</td>
        </tr>
        ` : ''}
        ${properties.color ? `
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 5px; font-weight: bold;">Color:</td>
          <td style="padding: 5px;">${properties.color}</td>
        </tr>
        ` : ''}
        ${properties.roofShape ? `
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 5px; font-weight: bold;">Forma tejado:</td>
          <td style="padding: 5px;">${properties.roofShape}</td>
        </tr>
        ` : ''}
        ${properties.roofMaterial ? `
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 5px; font-weight: bold;">Material tejado:</td>
          <td style="padding: 5px;">${properties.roofMaterial}</td>
        </tr>
        ` : ''}
      </table>
    </div>
  `;
}

// Función para aplicar efectos visuales al tejado basándose en roofShape
function applyRoofEffect(roofShape) {
  // Aquí se pueden agregar propiedades visuales diferentes según el tipo de tejado
  // Por ahora devolvemos un objeto con propiedades por defecto
  const effects = {
    opacity: 1.0,
    pattern: null,
  };
  
  if (roofShape === 'pyramid') {
    // Tejado en punta: visualmente se ve bien con opacidad completa
    effects.opacity = 1.0;
  } else if (roofShape === 'cone') {
    // Tejado cónico: también opacidad completa
    effects.opacity = 1.0;
  } else if (roofShape === 'dome') {
    // Tejado abovedado (si lo hay en el futuro)
    effects.opacity = 0.95;
  }
  
  return effects;
}

// Función para limpiar tiles antiguos si hay demasiados
function cleanupOldTiles(viewer) {
  if (loadedTiles.size > maxCachedTiles) {
    const tilesToRemove = Math.floor(maxCachedTiles * 0.3); // Remover 30% de los más antiguos
    let count = 0;
    for (const tileKey of loadedTiles) {
      if (count >= tilesToRemove) break;
      
      // Remover entidades asociadas con este tile
      const entities = buildingEntities.get(tileKey);
      if (entities) {
        entities.forEach(entity => viewer.entities.remove(entity));
        buildingEntities.delete(tileKey);
      }
      
      loadedTiles.delete(tileKey);
      count++;
    }
    console.log(`Cleaned up ${count} old tiles`);
  }
}

// Función para convertir coordenadas geográficas a tiles
function latLonToTile(lat, lon, zoom) {
  const x = Math.floor((lon + 180) / 360 * Math.pow(2, zoom));
  const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
  return { x, y, zoom };
}

// Función para cargar un tile específico de OSM Buildings
async function loadOSMBuildingTile(viewer, z, x, y) {
  const tileKey = `${z}/${x}/${y}`;
  
  // Si ya cargamos este tile, no lo volvemos a cargar
  if (loadedTiles.has(tileKey)) {
    return;
  }
  
  // Limpiar tiles antiguos si hay demasiados
  cleanupOldTiles(viewer);
  
  const url = `https://a.data.osmbuildings.org/0.2/59fcc2e8/tile/${z}/${x}/${y}.json`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Tile ${tileKey} not available`);
      return;
    }
    
    const data = await response.json();
    loadedTiles.add(tileKey);
    
    // Agregar los edificios de este tile
    addBuildingsToScene(viewer, data, tileKey);
    console.log(`Loaded OSM Buildings tile: ${tileKey}`);
  } catch (error) {
    console.error(`Error loading tile ${tileKey}:`, error);
  }
}

// Función para cargar tiles basándose en la vista actual
export function loadVisibleOSMBuildings(viewer) {
  const camera = viewer.camera;
  const ellipsoid = viewer.scene.globe.ellipsoid;
  
  // Obtener la posición de la cámara en coordenadas cartográficas
  const cameraCartographic = ellipsoid.cartesianToCartographic(camera.position);
  const lat = Cesium.Math.toDegrees(cameraCartographic.latitude);
  const lon = Cesium.Math.toDegrees(cameraCartographic.longitude);
  const height = cameraCartographic.height;
  
  // Determinar el nivel de zoom basándose en la altura de la cámara
  let zoom = 15;
  if (height > 50000) zoom = 12;
  else if (height > 20000) zoom = 13;
  else if (height > 10000) zoom = 14;
  else if (height > 5000) zoom = 15;
  else zoom = 16;
  
  // Obtener el tile central
  const centerTile = latLonToTile(lat, lon, zoom);
  
  // Cargar el tile central y los adyacentes (3x3 grid)
  const tileRange = 1;
  for (let dx = -tileRange; dx <= tileRange; dx++) {
    for (let dy = -tileRange; dy <= tileRange; dy++) {
      loadOSMBuildingTile(viewer, zoom, centerTile.x + dx, centerTile.y + dy);
    }
  }
}

export const setupBuildings = (viewer) => {
    // Cargar edificios inicialmente
    loadVisibleOSMBuildings(viewer);
    
    // Actualizar edificios cuando la cámara se mueva
    let moveTimeout;
    viewer.camera.moveEnd.addEventListener(function() {
      // Usar un timeout para evitar demasiadas peticiones durante el movimiento
      clearTimeout(moveTimeout);
      moveTimeout = setTimeout(() => {
        loadVisibleOSMBuildings(viewer);
      }, 500);
    });
    
    console.log("OSM Buildings system initialized");
};

function addBuildingsToScene(viewer, data, tileKey) {
    if (!data || !data.features) {
      return;
    }
    
    const tileEntities = []; // Array para guardar las entidades de este tile
    
    data.features.forEach(feature => {
      try {
        // Verificar que tenemos geometría válida
        if (!feature.geometry || !feature.geometry.coordinates) {
          return;
        }

        const geomType = feature.geometry.type;
        let coordinateSets = [];

        // Manejar diferentes tipos de geometría
        if (geomType === 'Polygon') {
          coordinateSets = [feature.geometry.coordinates];
        } else if (geomType === 'MultiPolygon') {
          coordinateSets = feature.geometry.coordinates;
        } else {
          return; // Tipo de geometría no soportado
        }

        // Procesar cada polígono
        coordinateSets.forEach(polygonCoords => {
          // El primer array es el anillo exterior
          const coordinates = polygonCoords[0];
          
          // Verifica si las coordenadas tienen al menos 3 puntos
          if (!coordinates || coordinates.length < 3) {
            return;
          }

          // Obtener propiedades del edificio
          // Usar los valores tal como vienen de OSM Buildings sin heurísticas
          const height = feature.properties.height || 10;
          const minHeight = feature.properties.minHeight || 0;
          const color = feature.properties.color || feature.properties.material;
          const roofShape = feature.properties.roofShape;
          const roofColor = feature.properties.roofColor;
          const roofMaterial = feature.properties.roofMaterial;
          const roofHeight = feature.properties.roofHeight || 0;
          
          // Convertir materiales/colores a colores Cesium (completamente opacos)
          const cesiumColor = getMaterialColor(color);
          const cesiumRoofColor = getRoofColor(roofColor, roofMaterial);

          // Crear las posiciones para el polígono a nivel del suelo
          const positions = coordinates.map(coord => 
            Cesium.Cartesian3.fromDegrees(coord[0], coord[1], 0)
          );

          const polygonHierarchy = new Cesium.PolygonHierarchy(positions);
          const name = feature.id || feature.properties.id || 'building';

          // Calcular alturas correctamente:
          // Si hay tejado, la parte cilíndrica del edificio termina en (height - roofHeight)
          // El tejado ocupa desde (height - roofHeight) hasta height
          const cylinderHeight = roofHeight > 0 ? height - roofHeight : height;
          const buildingThickness = height - minHeight;

          // Crear el edificio base (parte cilíndrica/vertical)
          const buildingEntity = viewer.entities.add({
            name: name,
            description: createBuildingDescription(feature.properties, height, minHeight, roofHeight),
            properties: {
              osmId: feature.id,
              height: height,
              minHeight: minHeight,
              roofHeight: roofHeight,
              roofShape: roofShape,
              roofMaterial: roofMaterial,
              color: color,
              roofColor: roofColor,
              buildingName: feature.properties.name || 'Sin nombre',
              levels: feature.properties.levels,
              buildingType: feature.properties.type,
              ...feature.properties
            },
            polygon: {
              hierarchy: polygonHierarchy,
              extrudedHeight: cylinderHeight,
              height: minHeight,
              outline: false,
              material: cesiumColor,
              perPositionHeight: false,
            },
          });
          tileEntities.push(buildingEntity);

          // Agregar techo si es necesario
          if ((roofShape === 'pyramid' || roofShape === 'cone') && roofHeight > 0) {
            // Calcular el centro del polígono para el vértice de la pirámide/cono
            let centerLon = 0, centerLat = 0;
            coordinates.forEach(coord => {
              centerLon += coord[0];
              centerLat += coord[1];
            });
            centerLon /= coordinates.length;
            centerLat /= coordinates.length;

            // La base del techo está en (height - roofHeight) = donde termina el cilindro
            // El pico del techo está en height = donde termina todo el edificio
            const roofBase = height - roofHeight;
            const roofTop = height;
            
            // Aplicar efectos visuales según el tipo de tejado
            const roofEffect = applyRoofEffect(roofShape);

            // Crear triángulos para cada lado de la pirámide/cono
            for (let i = 0; i < coordinates.length - 1; i++) {
              const p1 = coordinates[i];
              const p2 = coordinates[i + 1];
              
              const roofPositions = [
                p1[0], p1[1], roofBase,
                p2[0], p2[1], roofBase,
                centerLon, centerLat, roofTop
              ];

              const roofEntity = viewer.entities.add({
                name: `${name}_roof_${i}`,
                polygon: {
                  hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(roofPositions),
                  material: cesiumRoofColor,
                  perPositionHeight: true,
                  outline: false,
                },
              });
              tileEntities.push(roofEntity);
            }
          }
        });
      } catch (error) {
        console.error('Error procesando edificio:', error, feature);
      }
    });
  
  // Guardar las entidades de este tile en el Map para poder limpiarlas después
  buildingEntities.set(tileKey, tileEntities);
};

const getOSMDataOLD = async (buildingID) => {
    const baseUrl = `https://overpass-api.de/api/interpreter`;
    const query = `[out:json];way(${buildingID});out tags;`;
    const requestData = {
      data: query
    };
    var requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'text-plain'},
        body: query,
        redirect: 'follow'
      };
    try{
        const response = await fetch(baseUrl, requestOptions)
        if (!response.ok) {
            throw new Error('Error al obtener datos de los edificios');
        }
        const data = await response.json();
        console.log(data.elements[0].tags)
        return data;
    } catch (error){
        console.log(error)
    }
}; 
const getOSMData = async (buildingIDs) => {
    const baseUrl = `https://overpass-api.de/api/interpreter`;

    let query = `[out:json];way(id:`;
    for (const i of buildingIDs){
        if(!isNaN(i.id)){
            query += `${i.id},`
        }
    }
    query = query.slice(0, -1); //Delete last comma
    query += `);out tags;`;
    const requestData = {
      data: query
    };
    var requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'text-plain'},
        body: query,
        redirect: 'follow'
      };
    try{
        const response = await fetch(baseUrl, requestOptions)
        if (!response.ok) {
            throw new Error('Error al obtener datos de los edificios');
        }
        const data = await response.json();
        //console.log(data.elements[0].tags)
        return data;
    } catch (error){
        console.log(error)
    }
};

const getWater = async () => {
    const baseUrl = `https://overpass-api.de/api/interpreter`;
    const query = `[out:json];way(3600000000,3609999999);out tags;`;
    const requestData = {
      data: query
    };
    var requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'text-plain'},
        body: query,
        redirect: 'follow'
      };
    try{
        const response = await fetch(baseUrl, requestOptions)
        if (!response.ok) {
            throw new Error('Error al obtener datos de agua');
        }
        const data = await response.json();
        console.log(data.elements[0].tags)
        return data;
    } catch (error){
        console.log(error)
    }
}

const getAltitudeLento = (viewer, lon, lat) => {
 
  const cartographic = Cesium.Cartographic.fromDegrees(lon, lat); 
  Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, [cartographic]).then(
    (updatePositions) => {
      const altitude = updatePositions[0].height;
      console.log(updatePositions[0].height);
    }
  );
};

const getAltitudeOLD = (viewer, lon, lat) => {
  const scene = viewer.scene;
  // Obtiene las coordenadas del clic en la ventana
  const cartesian3 = Cesium.Cartesian3.fromDegrees(lon, lat);
  const windowCoordinates = new Cesium.Cartesian2();
  const success = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, cartesian3, windowCoordinates);

  if (success) {
    const x = windowCoordinates.x;
    const y = windowCoordinates.y;

    const cartesian = scene.globe.pick(ray, scene);

    if (cartesian) {
      // Convierte las coordenadas a grados
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      const longitude = Cesium.Math.toDegrees(cartographic.longitude);
      const latitude = Cesium.Math.toDegrees(cartographic.latitude);
      const height = cartographic.height;

      // Muestra las coordenadas en la consola
      console.log("Coordenadas en 3D:");
      console.log("Longitud: " + longitude);
      console.log("Latitud: " + latitude);
      console.log("Altura: " + height);
    } else {
      console.log("Las coordenadas no intersectan con el globo terrestre.");
    }
  } else {
    console.log("Las coordenadas están fuera de la vista del visor.");
  }
};

const getAltitudeFallo = (viewer, lon, lat) => {
  const scene = viewer.scene;
  // Obtener las coordenadas cartesianas en la superficie de la Tierra
  const surfaceCartesian = Cesium.Cartesian3.fromDegrees(lon, lat);
  // Obtener las coordenadas cartesianas del centro de la Tierra
  const centerCartesian = new Cesium.Cartesian3(0, 0, 0);
  // Crear un rayo desde el punto en la superficie hasta el centro de la Tierra
  //const ray = new Cesium.Ray(surfaceCartesian, Cesium.Cartesian3.subtract(surfaceCartesian, centerCartesian, new Cesium.Cartesian3()));
  const ray = new Cesium.Ray(surfaceCartesian, Cesium.Cartesian3.subtract(centerCartesian, surfaceCartesian, new Cesium.Cartesian3()));
  console.log(ray)
  const intersection = scene.globe.pick(ray, scene);

  if (intersection) {
    // Convierte las coordenadas a grados
    const cartographic = Cesium.Cartographic.fromCartesian(intersection);
    const longitude = Cesium.Math.toDegrees(cartographic.longitude);
    const latitude = Cesium.Math.toDegrees(cartographic.latitude);
    const height = cartographic.height;

    // Muestra las coordenadas en la consola
    console.log("Coordenadas en 3D:");
    console.log("Longitud: " + longitude);
    console.log("Latitud: " + latitude);
    console.log("Altura: " + height);
  } else {
    console.log("Las coordenadas no intersectan con el globo terrestre.");
  }
}

const getAltitude = (viewer, lon, lat) => {
  const scene = viewer.scene;
  const ellipsoid = viewer.scene.globe.ellipsoid;
  const cartographic = Cesium.Cartographic.fromDegrees(lon, lat);
  const height = viewer.scene.globe.getHeight(cartographic);

  if (Cesium.defined(height)) {
    //console.log(height);
  } else {
    console.log(`No se pudo obtener la altura en (${lon}, ${lat})`);
  }
  
}

