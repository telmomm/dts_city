var Cesium = require('cesium/Cesium');

const loadedWaterFeatures = new Set();

// Función para obtener datos de agua desde Overpass API
async function fetchWaterData(viewer) {
  const camera = viewer.camera;
  const ellipsoid = viewer.scene.globe.ellipsoid;
  
  // Obtener la posición de la cámara
  const cameraCartographic = ellipsoid.cartesianToCartographic(camera.position);
  const lat = Cesium.Math.toDegrees(cameraCartographic.latitude);
  const lon = Cesium.Math.toDegrees(cameraCartographic.longitude);
  
  // Crear un bounding box alrededor de la cámara (aproximadamente 0.1 grados = ~10km)
  const south = lat - 0.1;
  const west = lon - 0.1;
  const north = lat + 0.1;
  const east = lon + 0.1;
  
  console.log(`Querying bbox: (${south}, ${west}, ${north}, ${east})`);
  
  // Query de Overpass para áreas de agua (polígonos cerrados)
  const query = `[out:json][timeout:25];
(
  way["natural"="water"]["water"="river"](${south},${west},${north},${east});
  relation["natural"="water"]["water"="river"](${south},${west},${north},${east});
);
out geom;`;
  
  const url = 'https://overpass-api.de/api/interpreter';
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: 'data=' + encodeURIComponent(query),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Fetched ${data.elements?.length || 0} water elements from Overpass`);
    return data.elements || [];
  } catch (error) {
    console.error('Error fetching water data from Overpass:', error);
    return [];
  }
}

// Función para renderizar cuerpos de agua
function renderWaterFeatures(viewer, elements) {
  elements.forEach(element => {
    const featureId = `water-${element.type}-${element.id}`;
    
    // Evitar duplicados
    if (loadedWaterFeatures.has(featureId)) {
      return;
    }
    
    let coordinates = [];
    
    // Extraer coordenadas según el tipo de elemento
    if (element.type === 'way' && element.geometry) {
      coordinates = element.geometry.map(node => [node.lon, node.lat]);
      
      // Verificar que es un anillo cerrado (primer y último punto deben coincidir)
      if (coordinates.length > 0) {
        const first = coordinates[0];
        const last = coordinates[coordinates.length - 1];
        
        // Si no está cerrado, cerrarlo manualmente
        if (first[0] !== last[0] || first[1] !== last[1]) {
          coordinates.push(first);
        }
      }
    } else if (element.type === 'relation' && element.members) {
      // Para relaciones (multipolygons), procesar los outer members
      const outerWays = element.members.filter(m => m.type === 'way' && (m.role === 'outer' || m.role === ''));
      
      outerWays.forEach(member => {
        if (member.geometry) {
          const memberCoords = member.geometry.map(node => [node.lon, node.lat]);
          coordinates = coordinates.concat(memberCoords);
        }
      });
      
      // Si el último punto no coincide con el primero, cerrar el polígono
      if (coordinates.length > 0) {
        const first = coordinates[0];
        const last = coordinates[coordinates.length - 1];
        
        if (first[0] !== last[0] || first[1] !== last[1]) {
          coordinates.push(first);
        }
      }
    }
    
    // Si no tenemos suficientes coordenadas, saltar
    if (coordinates.length < 3) {
      return;
    }
    
    // Crear polígono de agua (sin verificar si está cerrado, dejar que Cesium lo cierre automáticamente)
    const positions = coordinates.map(coord => 
      Cesium.Cartesian3.fromDegrees(coord[0], coord[1], 2)
    );
    
    const polygonHierarchy = new Cesium.PolygonHierarchy(positions);
    
    try {
      const entity = viewer.entities.add({
        name: featureId,
        polygon: {
          hierarchy: polygonHierarchy,
          material: Cesium.Color.CYAN.withAlpha(0.7),
          height: 2,
          outline: true,
          outlineColor: Cesium.Color.BLUE.withAlpha(0.8),
          outlineWidth: 2
        }
      });
      
      loadedWaterFeatures.add(featureId);
      console.log(`Rendered ${featureId} with ${coordinates.length} points`);
    } catch (error) {
      console.error(`Error rendering ${featureId}:`, error);
    }
  });
  
  console.log(`Total water features rendered: ${loadedWaterFeatures.size}`);
}

// Función principal para configurar agua
export const setupWater = async (viewer) => {
  console.log('Setting up water layer from Overpass API...');
  
  // Cargar datos iniciales
  const waterElements = await fetchWaterData(viewer);
  renderWaterFeatures(viewer, waterElements);
  
  // Actualizar cuando la cámara se mueva
  let moveTimeout;
  viewer.camera.moveEnd.addEventListener(async function() {
    clearTimeout(moveTimeout);
    moveTimeout = setTimeout(async () => {
      const elements = await fetchWaterData(viewer);
      renderWaterFeatures(viewer, elements);
    }, 2000); // 2 segundos de debounce
  });
};

