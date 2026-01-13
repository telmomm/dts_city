# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-01-13

### Added
- Integration of OSM Buildings API with dynamic tile loading based on camera position
- Tile caching system with a maximum limit of 100 tiles
- 3D building rendering with correct geometry (support for Polygon and MultiPolygon)
- Material-based coloring system for walls and roofs
- Specific colors for different roof types (metal_sheet → gray, roof_tiles → red)
- Interactive building information on click with HTML table showing properties
- Support for pyramidal and conical roofs with correct height
- Correct calculation of absolute building heights (height as total height from ground)
- Support for stacked/layered buildings with multiple height levels

### Fixed
- Fixed "Can't find variable: process" error with webpack polyfill
- Incorrect height calculation for stacked building structures
- Roofs floating above buildings (adjustment of absolute heights)
- roofHeight logic as part of total height, not additive
- Missing support for MultiPolygon geometries in complex buildings
- Incomplete building rendering due to missing properties

### Changed
- Hidden sidebar menu to maximize map display area
- Removal of building outlines/edges for cleaner visualization
- All buildings are fully opaque without transparency
- Updated color styling according to construction materials

## [1.0.0] - 2026-01-13

### Added
- Initial project setup for 3D visualization of Burgos city using Cesium.js
- React 18.2.0 configuration with Webpack 5
- Base map with OpenStreetMap tiles
- UI components: Sidebar, Footer, PopUp
- Navigation system with cesium-navigation
- Project file structure and initial configuration
