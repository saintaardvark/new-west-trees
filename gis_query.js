var cartoDBUserName = "saintaardvark";
var queryAllTrees = "SELECT * FROM trees_east";
var queryAllTreeCommonNames = "SELECT DISTINCT common_name FROM trees_east ORDER BY common_name";

var queryUnknownTrees = `SELECT * FROM trees_east WHERE
(common_name = '' OR common_name IS NULL) AND
(genus = '' OR genus IS NULL) AND
(species = '' OR species IS NULL) AND
(scientific_name = '' OR scientific_name IS NULL) AND
(cultivar = '' OR cultivar IS NULL)
`;

var queryKnownTrees =  `SELECT * FROM trees_east WHERE
(common_name != '' AND common_name IS NOT NULL) OR
(genus != '' AND genus IS NOT NULL) OR
(species != '' AND species IS NOT NULL) OR
(scientific_name != '' AND scientific_name IS NOT NULL) OR
(cultivar != '' OR cultivar IS NOT NULL)
`;

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
      onEachFeature: onEachFeature
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
