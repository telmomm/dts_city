import React, { Component } from 'react';

import * as BaseMapFunctions from '.././BaseMap/BaseMapFunctions'

export const WebCamLayout = () => {
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
}