import React, { Component } from 'react';
import { Cartesian3,
  Ion,
  IonImageryProvider,
  ArcGisMapServerImageryProvider,
  OpenStreetMapImageryProvider,
  Cesium3DTileset,
  Cesium3DTileProperties,
  Color
 } from 'cesium/Cesium';
 
class BaseMap extends Component {
    componentDidMount() {
      // Coloca todo el código relacionado con Cesium aquí
      var Cesium = require('cesium/Cesium');
      //require('./css/main.css');
      require('cesium/Widgets/widgets.css');
  
      const viewer = new Cesium.Viewer("cesiumContainer", {
        shouldAnimate: true,
      });
    
      const scene = viewer.scene;
      scene.debugShowFramesPerSecond = true;
    
      Cesium.Math.setRandomNumberSeed(315);
    
      const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
        Cesium.Cartesian3.fromDegrees(-75.59777, 40.03883)
      );
      const emitterInitialLocation = new Cesium.Cartesian3(0.0, 0.0, 100.0);
    }
  
    render() {
      return (
        
        <div id="cesiumContainer" style={{ width: '100%', height: '500px' }}>
          {/* Esto es donde se renderizará la vista de Cesium */}
        </div>
      
      );
    }
  }
  
  export default BaseMap;
  