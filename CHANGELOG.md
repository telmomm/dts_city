# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2026-01-14

### Added
- Gabled (two-way) roof support with longitudinal ridge parallel to the longest building side
- Optimized tile loading: reduced from 9 tiles (3x3 grid) to 5 tiles (cross pattern) for 44% fewer HTTP requests
- Improved initial camera positioning: closer view at 300m altitude (previously 500m) centered on Burgos Cathedral
- Explicit definition of process.env variables in webpack config for browser compatibility

### Changed
- Simplified gabled roof algorithm: single ridge line running longitudinally with water flowing down on both sides
- Increased camera movement debounce timeout from 500ms to 1000ms to reduce tile requests during navigation
- Optimized roof color mapping: metal roofs now display in darker gray (#505050)
- Improved OpenStreetMap imagery provider initialization for better map base layer stability

### Fixed
- Gabled roof geometry: all building sides now properly converge at ridge points
- Building height calculation for irregular polygons with gabled roofs
- Map base layer disappearing issue when terrain was enabled
- Globe visibility ensuring proper rendering of base imagery layer

### Performance
- Reduced initial load time with optimized tile loading strategy
- Fewer simultaneous HTTP requests for building tiles
- Improved rendering efficiency with debounced camera movement handler

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
