
import React, { Component } from 'react';
import * as CommonMapFunctions from './CommonMapFunctions'
import axios from 'axios';
import { update } from 'react-spring';
var Cesium = require('cesium/Cesium');

export const setupBuildings = (viewer) => {
    // Configura la URL del GeoJSON que contiene datos de edificios
    const baseUrl = "https://b.data.osmbuildings.org/0.2/anonymous/tile"
    // Crea una función para cargar los datos GeoJSON
    const loadGeoJSON = (geoJSONURL) => {
      return new Promise((resolve, reject) => {
        fetch(geoJSONURL)
          .then(response => response.json())
          .then(data => resolve(data))
          .catch(error => reject(error));
      });
    };
    const x = 16046;
    const y = 12122;
   // const leftTiles = 8
    //const downTiles = 2;
    const leftTiles = 0;
    const downTiles = 0;

    // Definir un array para almacenar las promesas de carga de los datos GeoJSON
    const promises = [];
    const OSMPromises = [];
    // Definir un array para almacenar los datos GeoJSON
    const geoJSONDataArray = [];
  
    // Cargar los datos GeoJSON de las teselas circundantes
    for (let i = x - leftTiles; i <= x + leftTiles; i++) {
      for (let j = y - downTiles; j <= y + downTiles; j++) {
        const geoJSONURL = `${baseUrl}/15/${i}/${j}.json`;
        const promise = loadGeoJSON(geoJSONURL)
          .then(data => {
            geoJSONDataArray.push(data);
          })
          .catch(error => console.error(`Error al cargar datos GeoJSON: ${error}`));
  
        // Asegúrate de que las promesas se agreguen correctamente al array
        promises.push(promise);
      }
    }
  
    // Esperar a que se completen todas las promesas y luego agregar los edificios a la escena
    
    viewer.scene.globe.tileLoadProgressEvent.addEventListener(function (tileLoadProgress) {
      if (tileLoadProgress === 1.0) {
        console.log("Globe Load Complete")
        Promise.all(promises)
      .then(() => {
        geoJSONDataArray.forEach(data => 
          addBuildingsToScene(viewer, data));
        console.log("OSM Building Load Complete");
      })
      .catch(error => console.error(`Error al cargar datos GeoJSON: ${error}`));
      }
    });

    
  
    
};

function addBuildingsToScene(viewer, data) {

    const buildings = {}; // Objeto para almacenar las entidades por edificio
    //const OSMData = getOSMData(data.features);
    //console.log(data)
    //console.log(data.features)
    //console.log("OSMData: ", OSMData);
  data.features.forEach(feature => {
    const coordinates = feature.geometry.coordinates[0]; // Se asume que las coordenadas están en la primera parte del array

    // Verifica si las coordenadas tienen al menos 3 puntos
    if (coordinates.length < 3) {
      console.error('Coordenadas inválidas:', coordinates);
      return;
    }

    const height = feature.properties.height;
    const buildingID = feature.properties.building || "NoBuilding"; // Use "NoBuilding" si no se proporciona
    const buildingName = feature.properties.name || "Sin nombre"; // Propiedad para el nombre del edificio
    //feature.OSMData = getOSMData(feature.id);
    //console.log(feature)
  const baseHeight = feature.properties.height; // Altura desde la base al vértice del tejado
  const color = feature.properties.color || feature.properties.material || "white";
  const roofShape = feature.properties.roofShape || "noRoof";
  const roofColor = feature.properties.roofColor || "";
  var cesiumColor = Cesium.Color.fromCssColorString(color);
  var cesiumRoofColor = Cesium.Color.fromCssColorString(roofColor);

  // Calcular la altura adicional del tejado (la altura desde la base a la cima)
  const roofHeight = feature.properties.roofHeight || 0; // Altura adicional del tejado
  
  const minHeight = feature.properties.minHeight || feature.properties.height // Altura mínima del edificio
  const totalHeight = baseHeight; // Altura total del edificio incluyendo el tejado
  // Crear las posiciones para las paredes del edificio
  //const altitude = getAltitude(viewer, coord[0], coord[1])
  const positions = coordinates.map(coord => Cesium.Cartesian3.fromDegrees(coord[0], coord[1], 0));
  
// Crear las posiciones de los vértices del tejado
  const roofPositions = coordinates.map(coord => [coord[0], coord[1], minHeight]);

    const polygonHierarchy = new Cesium.PolygonHierarchy(positions);
    let name = "";
    if(buildingID === "NoBuilding"){
      name = feature.id;
    } else {
      //name = buildingID
      name = feature.id;
    }
    if (roofShape == "noRoof"){
      polygonHierarchy
      const buildingEntity = viewer.entities.add({
          name: name,
          polygon: {
            hierarchy: polygonHierarchy,
            extrudedHeight: height,
            outline: false,
            perPositionHeight: true,
            material: cesiumColor,
          },
      });
    } else {
      if (roofShape == "pyramid"){

        function calcularPuntoCentralOLD(coordenadas) {
          if (coordenadas.length === 0) {
              return null;
          }
      
          // Inicializar variables para el cálculo del promedio de latitud y longitud
          var promedioLatitud = 0;
          var promedioLongitud = 0;
      
          // Sumar todas las coordenadas de latitud y longitud
          for (var i = 0; i < coordenadas.length; i += 3) {
              promedioLatitud += coordenadas[i];
              promedioLongitud += coordenadas[i + 1];
          }
      
          // Calcular el promedio dividiendo por el número de coordenadas
          var numVertices = coordenadas.length / 3;
          promedioLatitud /= numVertices;
          promedioLongitud /= numVertices;
      
          // La altura del punto central se asume como 0
          var altura = 0;
      
          return [promedioLatitud, promedioLongitud, altura];
         }
        function calcularPuntoCentral(coordenadas, altura) {
          if (coordenadas.length === 0) {
              return null;
          }
      
          // Inicializar variables para el cálculo del promedio de latitud y longitud
          var promedioLatitud = 0;
          var promedioLongitud = 0;
      
          // Sumar todas las coordenadas de latitud y longitud
          for (var i = 0; i < coordenadas.length; i++) {
              promedioLatitud += coordenadas[i][0];
              promedioLongitud += coordenadas[i][1];
          }
      
          // Calcular el promedio dividiendo por el número de coordenadas
          var numVertices = coordenadas.length;
          promedioLatitud /= numVertices;
          promedioLongitud /= numVertices;
      
          // La altura del punto central se asume como 0
          var altura = altura;
      
          return [promedioLatitud, promedioLongitud, altura];
        }
        //console.log("Roof Positions: ", roofPositions)
        var puntoCentral = calcularPuntoCentral(roofPositions, totalHeight);

        //console.log("Punto Central: ", puntoCentral)
        /*
        for (let i = 0; i < pyramidBase.length/3; i++){
          // Dividir el array en partes
          var parte1 = pyramidBase.slice(i*3, i*3+3);
          var parte2 = pyramidBase.slice(i*3+3, i*3+6);
          var parte3 = [puntoCentral[0], puntoCentral[1], pyramidHeight];
          
          if (i == pyramidBase.length/3-1){
            var parte1 = pyramidBase.slice(0, 3);
            var parte2 = pyramidBase.slice(i*3, i*3+3);
          }
          
          var array = parte1.concat(parte2, parte3);
          console.log(array)
          const test = viewer.entities.add({
            name:i,
            polygon: {
              hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(array),
              extrudedHeight: 0,
              perPositionHeight: true,
            }
          });
          viewer.zoomTo(test)
        }
        */
        
        for (let i = 0; i < roofPositions.length; i++){
          // Dividir el array en partes
          if (i == roofPositions.length-1){
            var parte1 = [roofPositions[0][0], roofPositions[0][1], roofPositions[0][2]]
            var parte2 = [roofPositions[i][0], roofPositions[i][1], roofPositions[i][2]]
          } else {
            var parte1 = [roofPositions[i][0], roofPositions[i][1], roofPositions[i][2]]
            var parte2 = [roofPositions[i+1][0], roofPositions[i+1][1], roofPositions[i+1][2]]
            var parte3 = [puntoCentral[0], puntoCentral[1], puntoCentral[2]]; 
          }
          
          var array = parte1.concat(parte2, parte3);
          //console.log("Array: ", array)
          const test = viewer.entities.add({
            name: name,
            polygon: {
              hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(array),
              extrudedHeight: 0,
              perPositionHeight: true,
              material: cesiumRoofColor,
            }
          });
          viewer.zoomTo(test)
        }

        /*
        viewer.entities.add({
          polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(pyramidBase)
          }
        })
        */
      }
    }
  });
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

