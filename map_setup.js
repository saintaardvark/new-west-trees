// Tile layer options.
// More here: https://leaflet-extras.github.io/leaflet-providers/preview/
const tileLayer_Stamen_TonerLite = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  subdomains: 'abcd',
  minZoom: 0,
  maxZoom: 20,
  ext: 'png',
});

const tileLayer_Esri_WorldStreetMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
});

const tileLayer_Esri_DeLorme = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Specialty/DeLorme_World_Base_Map/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Copyright: &copy;2012 DeLorme',
  minZoom: 1,
  maxZoom: 11,
});

const tileLayer_Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
});

const tileLayers = [
  tileLayer_Stamen_TonerLite, // Minimal
  tileLayer_Esri_WorldStreetMap, // Standard
  tileLayer_Esri_DeLorme, // Topographic
  tileLayer_Esri_WorldImagery, // Satellite
];

// Select Standard by default.
let selectedMapTileLayerIndex = 1;

// initialize the map
const map = L.map('map').setView([49.217, -122.910], 15);

// Add defailt map tile layer to the map.
tileLayers[selectedMapTileLayerIndex].addTo(map);

// Build a tile layer selection control.
var tileLayerControl = L.control({ position: 'topright' });


// Build a tile layer selection control.
var tileLayerControl = L.control({ position: 'topright' });

tileLayerControl.onAdd = function (map) {
  const div = L.DomUtil.create('div', 'info legend');
  div.innerHTML = '<select class="map-tile-select">'
    + '<option value="0">Minimal</option>'
    + '<option value="1" selected>Standard</option>'
    + '<option value="2">Topographic</option>'
    + '<option value="3">Satellite</option>'
    + '</select>';
  div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;

  return div;
};
