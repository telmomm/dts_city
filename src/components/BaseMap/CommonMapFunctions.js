import React, { Component } from 'react';
var Cesium = require('cesium/Cesium');

export const  getXYZTileCoordinates = (viewer) => {
    // Obtén la posición de la cámara en el globo terráqueo
    const ellipsoid = viewer.scene.globe.ellipsoid;
    const cameraPosition = viewer.camera.positionWC;
  
    // Convierte la posición de la cámara a coordenadas geográficas
    const cartographicPosition = ellipsoid.cartesianToCartographic(cameraPosition);
  
    // Calcula el nivel de zoom actual en función de la altitud de la cámara y otros factores
    const cameraHeight = viewer.camera.positionCartographic.height;
    const zoom = computeZoomLevel(cameraHeight);
  
    // Calcula las coordenadas XYZ del tile actual
    const x = Math.floor(Cesium.Math.toDegrees(cartographicPosition.longitude) / 360 * (1 << zoom));
    const y = Math.floor((1 - Math.log(Math.tan(cartographicPosition.latitude) + 1.0 / Math.cos(cartographicPosition.latitude)) / Math.PI) / 2 * (1 << zoom));
    const z = zoom;
  
    return { x, y, z };
}

// Función para calcular el nivel de zoom en función de la altitud de la cámara
function computeZoomLevel(cameraHeight) {
    // Ajusta esta función según tus necesidades
    // Por ejemplo, puedes utilizar valores predefinidos para niveles de zoom
    // basados en rangos de altitud específicos o en la altitud actual de la cámara.
    // Aquí se proporciona una función de ejemplo que utiliza un valor fijo para el nivel de zoom.
    const fixedZoomLevel = 15; // Ajusta el nivel de zoom según tus necesidades
    return fixedZoomLevel;
  }