function maybeClearLayers() {
  if (map.hasLayer(nwTrees)) {
    map.removeLayer(nwTrees);
  }

  if (map.hasLayer(knownTrees)) {
    map.removeLayer(knownTrees);
  }

  // remove locationMarker layer if present
  if (map.hasLayer(locationMarker)) {
    map.removeLayer(locationMarker);
  }

  if (map.hasLayer(clusters)) {
    map.removeLayer(clusters);
  }
}

function onEachFeature(feature, layer) {
  // does this feature have a property named Genus? (Cultivar, Species, Scientific_Name, Common_Name)

  if (feature.properties) {
    popupMsg = `Genus: ${feature.properties.GENUS
    }<br>Cultivar: ${feature.properties.CULTIVAR
    }<br>Species: ${feature.properties.SPECIES
    }<br>Full name: ${feature.properties.FULL_NAME
    }<br>Address: ${feature.properties.ADDRESS}`;
    layer.bindPopup(popupMsg);
  }
}

let nwTrees = null;
let knownTrees = null;
const unknownTrees = null;
const closestTrees = null;
let clusters = null;
let locationMarker = null;
let myLocation = null;

const greenIcon = L.icon({
  // https://stackoverflow.com/a/35847937
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
});

function locateUser() {
  map.locate({ setView: true, maxZoom: 17 });
}

// Event listener for when location is found
map.on('locationfound', locationFound);
// ...and not found
map.on('locationerror', locationNotFound);

function locationFound(e) {
  myLocation = e.latlng;
  closestTree();
  locationMarker = L.marker(e.latlng, { icon: greenIcon });
  map.addLayer(locationMarker);
}

function locationNotFound(e) {
  alert(e.message);
}

function populateMenuWithAllTreeCommonNames() {
  // TODO: Filter out empty answers, NULL
  Array.from(allTreeFullNames).sort().forEach((entry) => {
    $('#common_name_list').append(
      `<option value="${entry}">${entry}</option>`,
    );
  });
}

// Only initialize dropdown lists if all data was successfully fetched.
$('.map-tile-select').change(() => {
  // Remove current tile layer.
  map.removeLayer(tileLayers[selectedMapTileLayerIndex]);

  // Add selectred tile layer.
  selectedMapTileLayerIndex = $('.map-tile-select option:selected').attr('value');
  map.addLayer(tileLayers[selectedMapTileLayerIndex]);
});

let allTreeData = [];
let allTreeFullNames = new Set();

$(document).ready(() => {
  $.getJSON('Tree_Inventory.geojson', (data) => {
    allTreeData = data.features;
    // TODO: Decide how to handle the different properties:  FULL_NAME vs SPECIES vs GENUS vs undefined
    allTreeData.forEach((k, v) => { allTreeFullNames.add(k.properties.FULL_NAME); });
  }).then(() => {
    populateMenuWithAllTreeCommonNames();
  }).then(() => {
    showAll();
  });

  $('#common_name_list').change(function () {
    if ($(this).val()) {
      selectTreesMatchingCommonName($(this).val());
    } else {
      showAll();
    }
  });
});

$('input[value=all]').click(() => {
  showAll();
});

// Event listeners
$('input[id=show-unknown-trees]').click(() => {
  showUnknownTrees();
});

$('#about-btn').click(() => {
  $('#aboutModal').modal('show');
  $('.navbar-collapse.in').collapse('hide');
  return false;
});
