
var Cesium = require('cesium/Cesium');

const cameraDefaultPosition = Cesium.Cartesian3.fromDegrees(
    -3.749502435033885,
    42.232644709479196,
    11176.753177854962
);

const cameraDefaultOrientation = {
  heading: Cesium.Math.toRadians(13.82378909751138),
  pitch: Cesium.Math.toRadians(-40.562911838151024),
  roll: Cesium.Math.toRadians(0.005412098115048774),
};

export const gv = {
    cameraDefaultPosition,
    cameraDefaultOrientation
};