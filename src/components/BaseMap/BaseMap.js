import React, { Component } from 'react';
import * as BaseMapFunctions from './BaseMapFunctions'

var Cesium = require('cesium/Cesium');

import './BaseMap.css'
import SidebarMenu from '.././SidebarMenu';
import Footer from '.././Footer';


class BaseMap extends Component {
  constructor() {
    super();
    this.state = {
      osmBuildingsTileset: null,
      selectedId: null,
      googleTileset: null,
    };
    this.viewer = null;
  }
  
  componentDidMount() {
    this.viewer = BaseMapFunctions.setupCesiumViewer(this);
    
    //BaseMapFunctions.detectPlanesInArea();

    }
    render() {
      return (
        <div className="page-container">
        {/* Contenedor principal */}
        <div id="mapContainer" className="map-container">
          {/* <div id="sidebarContainer" className="sidebar-container">
            <SidebarMenu viewer={this.viewer}/>
          </div> */}

          <div id="cesiumContainer" className="cesium-container"></div>
        </div>
        <div className="footer">
          <Footer />
        </div>
      </div>

      );
    }
  }
  
  export default BaseMap;
  