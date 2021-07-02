// Tile layer options.
// More here: https://leaflet-extras.github.io/leaflet-providers/preview/
var tileLayer_Stamen_TonerLite = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  subdomains: 'abcd',
  minZoom: 0,
  maxZoom: 20,
  ext: 'png'
});

var tileLayer_Esri_WorldStreetMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
});

var tileLayer_Esri_DeLorme = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Specialty/DeLorme_World_Base_Map/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Copyright: &copy;2012 DeLorme',
  minZoom: 1,
  maxZoom: 11
});

var tileLayer_Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

var tileLayers = [
  tileLayer_Stamen_TonerLite, // Minimal
  tileLayer_Esri_WorldStreetMap, // Standard
  tileLayer_Esri_DeLorme, // Topographic
  tileLayer_Esri_WorldImagery // Satellite
];

// Select Standard by default.
var selectedMapTileLayerIndex = 1;

// initialize the map
var map = L.map('map').setView([49.217, -122.910], 15);

// Add defailt map tile layer to the map.
tileLayers[selectedMapTileLayerIndex].addTo(map);


// Build a tile layer selection control.
var tileLayerControl = L.control({position: 'topright'});

// FIXME: #1 is hard-coded
tileLayerControl.onAdd = function (map) {
  var div = L.DomUtil.create('div', 'info legend');
  div.innerHTML = '<select class="map-tile-select">' +
    '<option value="0">Minimal</option>' +
    '<option value="1" selected>Standard</option>' +
    '<option value="2">Topographic</option>' +
    '<option value="3">Satellite</option>' +
    '</select>';
  div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;

  return div;
};

// Build a tile layer selection control.
var tileLayerControl = L.control({position: 'topright'});

tileLayerControl.onAdd = function (map) {
  var div = L.DomUtil.create('div', 'info legend');
  div.innerHTML = '<select class="map-tile-select">' +
    '<option value="0">Minimal</option>' +
    '<option value="1" selected>Standard</option>' +
    '<option value="2">Topographic</option>' +
    '<option value="3">Satellite</option>' +
    '</select>';
  div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;

  return div;
};

// Add a tile layer selection control.
tileLayerControl.addTo(map);

function maybeClearLayers() {
  if (map.hasLayer(nwTrees)) {
    map.removeLayer(nwTrees);
  };

  if (map.hasLayer(knownTrees)) {
    map.removeLayer(knownTrees);
  };

  // remove locationMarker layer if present
  if (map.hasLayer(locationMarker)) {
    map.removeLayer(locationMarker);
  };

  if (map.hasLayer(clusters)) {
    map.removeLayer(clusters);
  };
}

function onEachFeature(feature, layer) {
  // does this feature have a property named Genus? (Cultivar, Species, Scientific_Name, Common_Name)

  if (feature.properties) {
    popupMsg = "Genus: " + feature.properties.genus
      + "<br>Cultivar: " + feature.properties.cultivar
      + "<br>Species: " + feature.properties.species
      + "<br>Scientific Name: " + feature.properties.scientific_name
      + "<br>Common Name: " + feature.properties.common_name;
    layer.bindPopup(popupMsg);
  }
}

var nwTrees = null;
var knownTrees = null;
var unknownTrees = null;
var clusters = null;
var locationMarker = null;
var myLocation = null;

var greenIcon = L.icon({
  // https://stackoverflow.com/a/35847937
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png'
})

function locateUser() {
  map.locate({setView: true, maxZoom: 17});
}

// Event listener for when location is found
map.on('locationfound', locationFound);
// ...and not found
map.on('locationerror', locationNotFound);

function locationFound(e) {
  myLocation = e.latlng;
  closestTree();
  locationMarker = L.marker(e.latlng, {icon: greenIcon});
  map.addLayer(locationMarker);
}

function locationNotFound(e) {
  alert(e.message);
}

function populateMenuWithAllTreeCommonNames() {
  // TODO: Filter out empty answers, NULL
  $.getJSON("https://" + cartoDBUserName + ".carto.com/api/v2/sql?q=" + queryAllTreeCommonNames, function(data) {
    // Debugging
    // console.log(data);
    $.each(data.rows, function(key, value) {
      // TODO: Capitalize rather than default UPPER CASE
      common_name = value.common_name;
      $('#common_name_list').append(`<option value="` + common_name + `">` + common_name + `</option>`);
    });
  });
}

// Only initialize dropdown lists if all data was successfully fetched.
$('.map-tile-select').change(function(){
  // Remove current tile layer.
  map.removeLayer(tileLayers[selectedMapTileLayerIndex]);

  // Add selectred tile layer.
  selectedMapTileLayerIndex = $(".map-tile-select option:selected").attr("value");
  map.addLayer(tileLayers[selectedMapTileLayerIndex]);
});
$( document ).ready(function() {
  populateMenuWithAllTreeCommonNames();
  $('#common_name_list').change(function () {
    if ($(this).val()) {
      selectTreesMatchingCommonName($(this).val());
    } else {
      showAll();
    }
  });
  showAll();
})

$('input[value=all]').click(function() {
  showAll();
});

// Event listeners
$('input[value=unknownOnly]').click(function() {
  showUnknownTrees();
});
