import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';

import Draggable from 'react-draggable';
import { Resizable } from 'react-resizable';

import PopUp from '.././PopUp'

var Cesium = require('cesium/Cesium');
import * as OSMFunctions from './OSMFunctions'
import * as OSMWater from './OSMWater'
    
export const detectPlanesInArea = () => {
    const username = process.env.REACT_APP_OPENSKY_USERNAME;
    const password = process.env.REACT_APP_OPENSKY_PASSWORD;
    if (!username || !password) {
      console.warn('OpenSky credentials missing; skipping plane detection.');
      return;
    }
    // Función para codificar las credenciales en Base64
    function encodeCredentials(username, password) {
      const credentials = `${username}:${password}`;
      const encodedCredentials = btoa(credentials); // Codifica en Base64
      return `Basic ${encodedCredentials}`; // Agrega el prefijo "Basic" necesario para la autenticación básica
    }
     
  // Define la zona geográfica de interés
  const area = {
    minLatitude: 40.4463, // Latitud mínima del Aeropuerto de Barajas
    maxLatitude: 40.4851, // Latitud máxima del Aeropuerto de Barajas
    minLongitude: -3.5877, // Longitud mínima del Aeropuerto de Barajas
    maxLongitude: -3.5417, // Longitud máxima del Aeropuerto de Barajas
  };
  

    
    // Realiza la solicitud a la API de OpenSky
    const fetchPlanes = async () => {
      try {
        const url = `https://opensky-network.org/api/states/all?lamin=${area.minLatitude}&lomin=${area.minLongitude}&lamax=${area.maxLatitude}&lomax=${area.maxLongitude}`;
        // Codifica las credenciales en Base64
        const authHeader = `${encodeCredentials(username, password)}`;
        // Configura las cabeceras de solicitud con la autorización Basic Auth
        const headers = {
          Authorization: authHeader,
        };
    
        const response = await axios.get(url, { headers });
    
        if (response.data) {
          // Muestra la información de los aviones en la consola
          console.log('Aviones en la zona geográfica:');
          console.info(response.data.states);
        }
      } catch (error) {
        if (error = 429){console.log('Too many request')}
        else {console.error('Error fetching data:', error);}
      }
    };

    // Realiza la solicitud cada 10 segundos (ajusta el intervalo según tus necesidades)
    setInterval(fetchPlanes, 5000);
  };

// CESIUM SETUP //
export const setupCesiumViewer = async (component) => {
    const cesiumToken = process.env.REACT_APP_CESIUM_ION_TOKEN;
    if (!cesiumToken) {
      console.warn('Missing REACT_APP_CESIUM_ION_TOKEN; Cesium assets may fail to load.');
    } else {
      Cesium.Ion.defaultAccessToken = cesiumToken;
    }
    try{
      const viewer = new Cesium.Viewer("cesiumContainer", {
      shouldAnimate: false,
      animation: false,
      vrButton: false,
      timeline: false,
      navigationHelpButton: false,
      showLogo: false,
      baseLayerPicker: false,
      requestRenderMode: true,
      maximumRenderTimeChange : Infinity,
      
    });
    
    // Añadir el mapa base de OpenStreetMap directamente
    viewer.imageryLayers.removeAll();
    const osmProvider = new Cesium.OpenStreetMapImageryProvider({
      url: 'https://tile.openstreetmap.org/'
    });
    viewer.imageryLayers.addImageryProvider(osmProvider);
    
    //Cesium ION Logo Removal
    viewer._cesiumWidget._creditContainer.parentNode.removeChild(
    viewer._cesiumWidget._creditContainer);

    // Enable rendering the sky
    viewer.scene.skyAtmosphere.show = true;
    
    const scene = viewer.scene;

    //setupOsmBuildingsOLD(scene, component);
    // Asegurar que el globo esté visible
    scene.globe.show = true;
    
    // Cargar terreno en segundo plano sin bloquear
    /*setupTerrainOLD(scene).then(() => {
      console.log("Terrain loaded successfully");
      // Habilitar depth test para que los edificios se rendericen correctamente sobre el terreno
      scene.globe.depthTestAgainstTerrain = true;
    }).catch(error => {
      console.error("Error loading terrain:", error);
    });*/
    
    OSMFunctions.setupBuildings(viewer);
    OSMWater.setupWater(viewer);
    setupCamera(viewer);
    setupClickHandler(viewer);
    
    //setupPins(viewer);
    //setupGoogleTileset(scene, component);

    mostrarCoordenadasEnConsola(viewer);

    viewer.camera.moveEnd.addEventListener(function() {
      //getTeselas(viewer)
      //updateOsmBuildings(viewer,tileLevel,tileX, tileY)
      //console.log(viewer)
    });


    scene.debugShowFramesPerSecond = true;
    return viewer;
    } catch (error) {
      console.error(error);
    }
};

export const setupGoogleTileset = (scene, component) => {
  // Configuración de las opciones de inicialización
  const options = {
    show: true,  // Determina si el tileset se mostrará de inmediato.
    preloadWhenHidden: true,  // Precarga los tiles incluso cuando el tileset no se muestra.
    maximumScreenSpaceError: 16,  // Controla la calidad de los tiles cargados.
    maximumCacheOverflowBytes: 536870912,  // Controla la memoria utilizada por la caché.
    skipLevelOfDetail: false,  // Controla si se deben aplicar niveles de detalle.
    clippingPlanes: new Cesium.ClippingPlaneCollection(),  // Configura planos de recorte, si es necesario.
    vectorClassificationOnly: false,  // Determina si solo se utilizan tiles vectoriales para la clasificación.
    foveatedScreenSpaceError: true,  // Prioriza la carga de tiles en el centro de la pantalla.
    foveatedConeSize: 0.1,  // Tamaño del cono foveado (ajústalo según tus necesidades).
    dynamicScreenSpaceError: false,  // Reduce el error de espacio de pantalla para tiles alejados.
    // Otras opciones de tu elección.
  };
  
  const googleMapsKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  if (!googleMapsKey) {
    console.warn('Missing REACT_APP_GOOGLE_MAPS_API_KEY; skipping Google photorealistic tileset.');
    return;
  }

  Cesium.GoogleMaps.defaultApiKey = googleMapsKey;
  Cesium.createGooglePhotorealistic3DTileset().then((tileset) => {
    scene.primitives.add(tileset);
    component.setState ({googleTileset: tileset})
    console.log("Google Tileset OK");
  }).catch((error) => {
    console.error(`Error ${error}`);
  })
}

export const createMapProviderOLD= () => {
  const imageryProvider = new Cesium.OpenStreetMapImageryProvider({
    url: "https://tile.openstreetmap.org/",
  });
  

  return new Cesium.ImageryLayer(imageryProvider);
};
let tileX, tileY, tileLevel;
export const createMapProvider = () => {
  const imageryProvider = new Cesium.OpenStreetMapImageryProvider({
    url:"https://tile.openstreetmap.org/",
  });
    // Personalizar el método requestImage para incluir los créditos
  imageryProvider.requestImage = function (x, y, level, request) {
    const url = "https://tile.openstreetmap.org/" + level + '/' + x + '/' + y + '.png';

    // Obtener los créditos para el azulejo actual
    const credits = this.getTileCredits(x, y, level);

    // Registra la URL y la fecha actual
    //console.log('Solicitud GET a:', url, 'en', new Date());
    //console.log("Tesela X: ", x, " - Tesela Y: ", y, " - Level: ", level)
    tileX = x;
    tileY = y;
    tileLevel = level;
    // Muestra los créditos en la consola
    if (credits && credits.length > 0) {
      console.log('Créditos:', credits.join(', '));
    }
    // Realiza la solicitud de la imagen
    return Cesium.ImageryProvider.loadImage(this, url, request);
  };

  return imageryProvider;
};

function interceptRequest(x, y, level, url, headers) {
  console.log("Solicitud lanzada para tesela (x, y, level):", x, y, level);
  console.log("URL de la solicitud:", url);
  return {
    url: url,
    headers: headers,
  };
}

function getVisibleTileset(viewer) {
  // Escucha el evento de cambio de la cámara
  viewer.camera.moveEnd.addEventListener(function () {
    // Obtén la posición de la cámara
    const cameraPosition = viewer.camera.positionWC;

    // Busca el Tileset visible
    const tilesets = viewer.scene.primitives;
    let visibleTileset = null;

    for (let i = 0; i < tilesets.length; i++) {
      const tileset = tilesets.get(i);

      // Transforma la posición de la cámara al sistema de coordenadas local del tileset
      const cameraPositionLocal = new Cesium.Cartesian3();
      Cesium.Matrix4.multiplyByPoint(tileset.root.transform, cameraPosition, cameraPositionLocal);

      // Verifica si la cámara está dentro del bounding volume del tileset
      const cameraInsideTileset = Cesium.BoundingSphere.contains(tileset.boundingVolume, cameraPositionLocal);

      if (cameraInsideTileset) {
        visibleTileset = tileset;
        break;
      }
    }

    if (visibleTileset) {
      console.log("Tileset visible:", visibleTileset);
      // Puedes hacer lo que necesites con el tileset visible
    }
  });
}

function getTeselas(viewer) {
  const globe = viewer.scene.globe;
  const tilesToRender = globe._surface._tilesToRender;
  
  // Muestra información sobre las nuevas teselas
  console.log("Nuevas teselas:");
  for (const tile of tilesToRender) {
    console.log(tile)
    const level = tile._level;
    const x = tile._x;
    const y = tile._y;
    console.log(`Nivel: ${level}, x: ${x}, y: ${y}`);

    function tilesToLatLngEPSG4978(zoom, x, y) {
      const n = Math.pow(2, zoom);
      const lon = (x / n - 0.5) * 360; // Longitud en grados
      const latRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n))); // Latitud en radianes
      const lat = (latRad * 180) / Math.PI; // Latitud en grados
      return { lat, lon };
    }

    const latLng = tilesToLatLngEPSG4978(level, x, y)
    console.log('Latitud:', latLng.lat);
    console.log('Longitud:', latLng.lng);
    //updateOsmBuildings(viewer, level, x, y);
  }
}

export const setupCamera = (viewer) => {
  // Catedral de Burgos: 42.3404° N, 3.7038° W
  // Posición más cercana (300m) para vista detallada inicial
  const burgosPosition = Cesium.Cartesian3.fromDegrees(-3.7038, 42.3404, 300);
  const cameraOrientation = {
    heading: Cesium.Math.toRadians(0),
    pitch: Cesium.Math.toRadians(-50),
    roll: Cesium.Math.toRadians(0),
  };

  viewer.camera.setView({
    destination: burgosPosition,
    orientation: cameraOrientation,
  });
};

export const setupClickHandler = (viewer) => {
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction((click) => {
    handleBuildingClick(viewer, click);
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
};

export const setupTerrainOLD = (scene) => {
  return new Promise((resolve, reject) => {
    const mapTerrain = Cesium.Terrain.fromWorldTerrain({
                                        requestWaterMask: true,
                                        requestVertexNormals: true,
                                      });
    scene.setTerrain(mapTerrain);

    mapTerrain.readyEvent.addEventListener(() => {
      console.info("Terrain ready");
      resolve(); // Resuelve la promesa cuando el terreno está listo
    });
  });
};

export const setupTerrain = async (scene) => {
  try {
    const mapTerrain = await Cesium.createWorldTerrainAsync({
      requestWaterMask: true,
      requestVertexNormals: true,
    });

    scene.terrainProvider = mapTerrain;
    
    // Habilitar el terreno en el globo
    scene.globe.depthTestAgainstTerrain = true;

    // Utilizo la propiedad readyPromise para obtener una promesa cuando el terreno esté listo
    await mapTerrain.readyPromise;
      console.info("Terrain ready");
    } catch (error) {
      console.error("Error loading terrain:", error);
    }
};

function getAltitude(scene, longitud, latitud) {
  // Crear una instancia de un objeto Cesium.Cartographic para representar la ubicación
  const ubicacionCartografica = Cesium.Cartographic.fromDegrees(longitud, latitud);

  // Obtener la altura del terreno en esa ubicación
  return Cesium.sampleTerrainMostDetailed(scene.terrainProvider, [ubicacionCartografica])
    .then(result => {
      const alturaEnMetros = result[0].height;
      return alturaEnMetros;
    })
    .catch(error => {
      console.error("Error al obtener la altura del terreno:", error);
    });
}
function getAltitudeNEW(scene, lon, lat) {
  return new Promise((resolve, reject) => {
    //Conver coordinates to carteian position
    const position = Cesium.Cartographic.fromDegrees(lon, lat);
    //Obtain rhe height of the terrain at the position
    const promise = Cesium.sampleTerrainMostDetailed(scene.terrainProvider, [position]);

    promise
      .then((updatedPositions) => {
        // La altitud está en la propiedad height de la posición cartográfica
        const altitude = updatedPositions[0].height;
        resolve(altitude);
      })
      .catch((error) => {
        reject(error);
      });
  });
}  

export const handleBuildingClick = (viewer, click, osmBuildingsTileset) => {
    const pickedFeature = viewer.scene.pick(click.position);
  
    if (Cesium.defined(pickedFeature) && pickedFeature instanceof Cesium.Cesium3DTileFeature) {
      const buildingId = pickedFeature.getProperty('elementId');
      //console.info('Información del edificio seleccionado:');
      //console.info(buildingId);
      changeBuildingColor(osmBuildingsTileset, buildingId);
    }
  };
  
export const colorAllBuildings = (osmBuildingsTileset) => {
    if (osmBuildingsTileset) {
      // Desactiva el resaltado en todos los edificios
      osmBuildingsTileset.style = new Cesium.Cesium3DTileStyle({
        color: `color('green')`, // Usar comillas para el valor de color
      });
    }
  };
  
export const changeBuildingColor = (osmBuildingsTileset, selectedId, setState) => {
    if (osmBuildingsTileset) {
      const newStyle = new Cesium.Cesium3DTileStyle();
      if (selectedId !== null) {
        newStyle.color = {
          conditions: [
            ["${elementId} === " + selectedId, "color('red')"], // Resalta el edificio seleccionado en amarillo
            [true, "color('white')"], // Color por defecto para otros edificios
          ],
        };
      }
  
      // Aplica el nuevo estilo
      osmBuildingsTileset.style = newStyle;
  
      // Actualiza el estado con el nuevo ID seleccionado
      setState({ selectedId });
    }
  };
  
export const setupPins = (viewer) => {
  const imageUrl = 'https://raw.githubusercontent.com/HOLOBUR/DTS/main/bus.gltf';
  const position = Cesium.Cartesian3.fromDegrees(-3.702385842045286, 42.33880943054733, 916.2741425194369);
  const heading = Cesium.Math.toRadians(0);
  const pitch = Cesium.Math.toRadians(-90);
  const roll = Cesium.Math.toRadians(0);
  const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
  const orientation = Cesium.Transforms.headingPitchRollQuaternion(
    position,
    hpr
  );
  // Hacer una solicitud HEAD para comprobar la disponibilidad del archivo
  fetch(imageUrl, { method: 'HEAD' })
    .then(response => {
      if (response.ok) {
        // El archivo está disponible y se puede cargar
        const bus = viewer.entities.add({
          name: imageUrl,
          position: position,
          orientation: orientation,
          model: {
            uri: imageUrl,
            show: true,
            scale: 1,
            color: Cesium.Color.BLUE,
            shadows: false,
          },
        });

        viewer.zoomTo(bus);
        //viewer.trackedEntity = bus;
      } else {
        // El archivo no está disponible
        console.error('El archivo no está disponible.');
      }
    })
    .catch(error => {
      // Se produjo un error al hacer la solicitud
      console.error('Error al comprobar la disponibilidad del archivo:', error);
    });
}
// CESIUM USEFUL FUNCTIONS //
export const mostrarCoordenadasEnConsola = (viewer) => {
  // Crea un manejador de eventos ScreenSpaceEventHandler
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

  // Agrega un manejador de eventos para el clic en el visor de Cesium
  handler.setInputAction(function (event) {
    // Obtiene las coordenadas del clic en la ventana
    const ray = viewer.camera.getPickRay(event.position);
    const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
    if (cartesian) {
      // Convierte las coordenadas a grados
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      const longitude = Cesium.Math.toDegrees(cartographic.longitude);
      const latitude = Cesium.Math.toDegrees(cartographic.latitude);
      const height = cartographic.height;

      // Muestra las coordenadas en la consola
      console.log("Cartesian: ", cartesian)
      console.log("Coordenadas en 3D:");
      console.log("Longitud: " + longitude);
      console.log("Latitud: " + latitude);
      console.log("Altura: " + height);

      const scene = viewer.scene;
      //console.log(getAltitude(scene, longitude, latitude));
    }
    
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}
 // Nueva función para agregar un modelo 3D personalizado
export const addCustomModel = (viewer, url, pos, angles, name, description, videoUrl) => {
    //const viewer = this.viewer; // Asegúrate de que tienes acceso al visor de Cesium
    const position = Cesium.Cartesian3.fromDegrees(pos.longitude, pos.latitude, pos.height);
    const hpr = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(angles.heading),Cesium.Math.toRadians(angles.pitch),Cesium.Math.toRadians(angles.roll));
    const orientation = Cesium.Transforms.headingPitchRollQuaternion(
        position,
        hpr
      );
    // Crea una entidad con el modelo 3D
    const entity = viewer.entities.add({
      name: name,
      description: description,
      position: position,
      orientation: orientation,
      model: {
        uri: url,
        scale: 0.1, // Escala del modelo
      },
      properties: {
        videoUrl: videoUrl
      }
    });

    // Ajusta la vista de la cámara para centrarse en la entidad
    viewer.zoomTo(entity);

    // Puedes hacer más configuraciones en la entidad si es necesario

    return entity;
}
//EXAMPLE//
/*
    const modelUrl = 'https://raw.githubusercontent.com/HOLOBUR/DTS/main/bus.gltf';
    const modelPosition = {
      longitude: -3.7024244219704907, // Longitud en grados
      latitude: 42.33889423973219,  // Latitud en grados
      height: 915.5788655551374,          // Altura en metros
    };
    const modelOrientation = {
      heading: 0,
      pitch: -90,
      roll: 0
    };  
    BaseMapFunctions.addCustomModel(viewer, modelUrl, modelPosition, modelOrientation);
*/
export const getBuildingStyle = (selectedId) => {
    const defaultStyle = "color('white')";
    if (selectedId !== null) {
      return `color(${selectedId === this.state.selectedId ? 'yellow' : 'red'})`;
    }
    return defaultStyle;
  };

export const showWebcam = (viewer) => {

  const modelUrl = 'https://raw.githubusercontent.com/HOLOBUR/DTS/main/bus.gltf';
  const modelOrientation = {
      heading: 0,
      pitch: -90,
      roll: 0
  };
  const webcamToken = process.env.REACT_APP_WEBCAM_API_TOKEN;
  if (!webcamToken) {
    console.warn('Missing REACT_APP_WEBCAM_API_TOKEN; webcam entities will not be loaded.');
    return;
  }
  let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: 'https://dts-server.onrender.com/webcam',
      headers: { 
        'X-Fields': 'name,url,location', 
        'Authorization': `Bearer ${webcamToken}`
      }
  };
  let responseData;
  let videoEntity;
  axios.request(config)
    .then((response) => {
        if (response.status == 200){
          responseData = response.data
          for (const element of responseData){
            const modelPosition = {
              longitude: element.location.Longitude, // Longitud en grados
              latitude: element.location.Latitude,  // Latitud en grados
              height: element.location.Height         // Altura en metros
            };
            console.log(element.url)
            videoEntity = addCustomModel(viewer, modelUrl, modelPosition, modelOrientation, element.name + ' Webcam', "webcam", element.url);
          }
        }
    })
    .catch((error) => {
        if (error.response && error.response.status == 429){console.log('Too many request')}
        else {console.error('Error fetching data:', error);}
    });  

    // Define una función para abrir un nuevo popup
  function openPopup(content) {
    const popupContainer = document.createElement('div');
    popupContainer.classList.add('popup-container');
    document.body.appendChild(popupContainer);

    const onClose = () => {
      root.unmount();
    };

    const root = createRoot(popupContainer);
    root.render(<PopUp onClose={onClose} content={content}/>);
  }

  viewer.screenSpaceEventHandler.setInputAction(function onVideoEntityClick(movement) {
    const pickedObject = viewer.scene.pick(movement.position);
    if (Cesium.defined(pickedObject) && pickedObject.id.description == "webcam") {
      console.log("Clic en la entidad");
      console.log(pickedObject.id.properties.url)
      const content = <iframe width="640" height="480" src={pickedObject.id.properties.videoUrl} />
      openPopup(content);
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

}

// Define el componente WebcamPopup fuera de la función showWebcam
const WebcamPopup = ({ onClose }) => {
  const [width, setWidth] = React.useState(640); // Ancho inicial
  const [height, setHeight] = React.useState(480); // Alto inicial

  const handleResize = (e, { size }) => {
    setWidth(size.width);
    setHeight(size.height);
  };

  const popupStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: '9999',
    backgroundColor: 'white',
    padding: '10px',
    border: '2px solid #000',
  };

  return (
    <Draggable handle=".handle">
      <Resizable
        width={width}
        height={height}
        onResize={handleResize}
      >
        <div style={popupStyle} className="webcam-popup handle">
          <h2>Nombre de la Webcam</h2>
          {/*
          <iframe width={width} height={height} src="http://90.94.181.205:8080/axis-cgi/mjpg/video.cgi"></iframe>
          */}
          <button onClick={onClose}>Cerrar</button>
        </div>
      </Resizable>
    </Draggable>
  );
};

/*
export const showWebcamNEW = (viewer) => {

  const modelUrl = 'https://raw.githubusercontent.com/HOLOBUR/DTS/main/bus.gltf';
  const modelOrientation = {
    heading: 0,
    pitch: -90,
    roll: 0
  };
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: 'https://dts-server.onrender.com/webcam',
    headers: { 
      'X-Fields': 'name,url,location', 
      'Authorization': `Bearer ${process.env.REACT_APP_WEBCAM_API_TOKEN || ''}`
    }
  };
  let responseData;
  let videoEntity;
  axios.request(config)
    .then((response) => {
      if (response.status == 200) {
        responseData = response.data;
        for (const element of responseData) {
          const modelPosition = {
            longitude: element.location.Longitude,
            latitude: element.location.Latitude,
            height: element.location.Height
          };
          console.log(element.url);
          videoEntity = addCustomModel(viewer, modelUrl, modelPosition, modelOrientation, element.name + ' Webcam','webcam');
          console.log(videoEntity)
        }
      }
    })
    .catch((error) => {
      if (error.response && error.response.status == 429) {
        console.log('Too many requests');
      } else {
        console.error('Error fetching data:', error);
      }
    });  

  const popupContainer = document.createElement('div');
  popupContainer.classList.add('popup-container');
  document.body.appendChild(popupContainer);

  viewer.screenSpaceEventHandler.setInputAction(function onVideoEntityClick(movement) {
    const pickedObject = viewer.scene.pick(movement.position);
    console.log("Clic")
    if (Cesium.defined(pickedObject) && pickedObject.id === videoEntity) {
      
      // Configurar la descripción del menú lateral con el nombre y el ID de la entidad
      const entityName = videoEntity.name;
      const entityId = videoEntity.id;

      const videoUrl = 'http://90.94.181.205:8080/axis-cgi/mjpg/video.cgi';
      
      const entityDescription = `
        <p>Nombre: ${entityName}</p>
        <p>ID: ${entityId}</p>
        <iframe width="640" height="480" src="${videoUrl}"></iframe>
      `;

      // Configurar el contenido de la ventana emergente
      popupContainer.innerHTML = entityDescription;
      popupContainer.style.display = 'block';

      console.log(pickedObject.id.name);
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  // Cerrar la ventana emergente al hacer clic en cualquier parte de la pantalla
  viewer.screenSpaceEventHandler.setInputAction(function onScreenClick() {
    popupContainer.style.display = 'none';
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
};
*/