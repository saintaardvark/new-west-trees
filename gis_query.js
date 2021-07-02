var cartoDBUserName = "saintaardvark";
var queryAllTrees = "SELECT * FROM trees_east";
var queryAllTreeCommonNames = "SELECT DISTINCT common_name FROM trees_east ORDER BY common_name";

function showAll() {
  maybeClearLayers();
  // Get CARTO selection as GeoJSON & add to map
  $.getJSON("https://" + cartoDBUserName + ".carto.com/api/v2/sql?format=GeoJSON&q=" + queryAllTrees, function(data) {
    nwTrees = L.geoJson(data, {
      onEachFeature: onEachFeature,
    });
    clusters = L.markerClusterGroup({
      spiderfyOnMaxZoom: false,
      disableClusteringAtZoom: 18,
    });
    clusters.addLayer(nwTrees);
    map.addLayer(clusters);
  });
}

function closestTree() {
  maybeClearLayers();

  var sqlQueryClosestTrees;
  if ($('#common_name_list').val() == "") {
    sqlQueryClosestTrees = "SELECT * FROM trees_east ORDER BY the_geom <-> ST_SetSRID(ST_MakePoint(" + myLocation.lng + "," + myLocation.lat + "), 4326) LIMIT 5";
  } else {
    sqlQueryClosestTrees = "SELECT * FROM trees_east WHERE common_name = " + $('#common_name_list').val() + "ORDER BY the_geom <-> ST_SetSRID(ST_MakePoint(" + myLocation.lng + "," + myLocation.lat + "), 4326) LIMIT 5";
  }
  $.getJSON("https://" + cartoDBUserName + ".carto.com/api/v2/sql?format=GeoJSON&q=" + sqlQueryClosestTrees, function(data) {
    nwTrees = L.geoJson(data, {
      onEachFeature: onEachFeature,
    }).addTo(map);
  });
}

function selectTreesMatchingCommonName(common_name) {
  maybeClearLayers();
  $.getJSON("https://" + cartoDBUserName + ".carto.com/api/v2/sql?format=GeoJSON&q=" + queryAllTrees + " WHERE common_name = '" + common_name + "'", function(data) {
    nwTrees = L.geoJson(data, {
      onEachFeature: function (feature, layer) {
	if (feature.properties) {
	  popupMsg = "Genus: "  + feature.properties.genus
	    + "<br>Cultivar: " + feature.properties.cultivar
	    + "<br>Species: " + feature.properties.species
	    + "<br>Scientific Name: " + feature.properties.scientific_name
	    + "<br>Common Name: " + feature.properties.common_name;
	  layer.bindPopup(popupMsg);
	}
      }
    });
    clusters = L.markerClusterGroup({
      spiderfyOnMaxZoom: false,
      disableClusteringAtZoom: 18,
    });
    clusters.addLayer(nwTrees);
    map.addLayer(clusters);
    nwTrees.addTo(map);
  });
}
