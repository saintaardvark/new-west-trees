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

function showSpeciesMenu() {
  $("#common_name_menu").show();
  $("#genus_menu").hide();
}

function showGenusMenu() {
  $("#common_name_menu").hide();
  $("#genus_menu").show();
}

// https://www.samanthaming.com/pictorials/how-to-capitalize-a-string/
// Thank you, Samantha Ming!
function capitalize(str) {
  const lower = str.toLowerCase();
  return str.charAt(0).toUpperCase() + lower.slice(1);
}

function onEachFeature(feature, layer) {
  // does this feature have a property named Genus? (Cultivar, Species, Scientific_Name, Common_Name)

  if (feature.properties) {
    genus = feature.properties.GENUS;
    species = feature.properties.SPECIES;
    if ((genus !== null) && (species !== null)) {
      species = species.toLowerCase();
      genus = capitalize(genus);
      wikipediaLink = `<a href="https://en.wikipedia.org/wiki/${genus}_${species}" target="_blank">Wikipedia</a>`;
    } else {
      wikipediaLink = "";
    }
    popupMsg = `Genus: ${feature.properties.GENUS
    }<br>Cultivar: ${feature.properties.CULTIVAR
    }<br>Species: ${feature.properties.SPECIES
    }<br>Full name: ${feature.properties.FULL_NAME
    }<br>Address: ${feature.properties.ADDRESS
    }<br>${wikipediaLink}`;
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
      `<option value="${entry}" id="common_name">${entry}</option>`,
    );
  });
  // allTreeNames has a blank entry; we duplicate that manually here.
  // TODO: The whole genus/species thing needs refactoring
  $('#genus_list').append(
    `<option value="" id="genus"></option>`
  );
  Array.from(allTreeGenus).sort().forEach((entry) => {
    $('#genus_list').append(
      `<option value="${entry}" id="genus">${entry}</option>`,
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
let allTreeGenus = new Set();

function buildData() {
  // TODO: Decide how to handle the different properties:  FULL_NAME vs SPECIES vs GENUS vs undefined
  allTreeData.forEach((k, v) => {
    allTreeFullNames.add(k.properties.FULL_NAME);
    allTreeGenus.add(k.properties.GENUS);
  });
}

$(document).ready(() => {
  $.getJSON('Tree_Inventory.geojson', (data) => {
    allTreeData = data.features;
    buildData();
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
  $('#genus_list').change(function () {
    if ($(this).val()) {
      selectTreesMatchingGenus($(this).val());
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
