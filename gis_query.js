function showAll() {
  maybeClearLayers();
  // Get CARTO selection as GeoJSON & add to map
  $.getJSON("Tree_Inventory.geojson", function(data) {
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

// TODO: Needs refactoring now that I'm not using carto.
function closestTree() {
  if (map.hasLayer(closestTrees)) {
    map.removeLayer(closestTrees);
  };
  // if (map.hasLayer(cluster)) {
  //   map.removeLayer(cluster);
  // };
  var sqlQueryClosestTrees;
  if ($('#common_name_list').val() == "") {
    sqlQueryClosestTrees = "SELECT * FROM trees_east ORDER BY the_geom <-> ST_SetSRID(ST_MakePoint(" + myLocation.lng + "," + myLocation.lat + "), 4326) LIMIT 5";
  } else {
    sqlQueryClosestTrees = "SELECT * FROM trees_east WHERE common_name = " + $('#common_name_list').val() + "ORDER BY the_geom <-> ST_SetSRID(ST_MakePoint(" + myLocation.lng + "," + myLocation.lat + "), 4326) LIMIT 5";
  }
  $.getJSON("https://" + cartoDBUserName + ".carto.com/api/v2/sql?format=GeoJSON&q=" + sqlQueryClosestTrees, function(data) {
    closestTrees = L.geoJson(data, {
      pointToLayer: function(feature, latlng) {
	var smallIcon = new L.Icon({
	  iconSize: [25, 41],
	  iconAnchor: [12, 41],
	  popupAnchor: [1, -34],
	  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png",
	});
	return L.marker(latlng, {icon: smallIcon});
      },
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

function showUnknownTrees(common_name) {
  if (map.hasLayer(unknownTrees)) {
    map.removeLayer(unknownTrees);
  };
  $.getJSON("https://" + cartoDBUserName + ".carto.com/api/v2/sql?format=GeoJSON&q=" + queryUnknownTrees, function(data) {
    unknownTrees = L.geoJson(data, {
      pointToLayer: function(feature, latlng) {
	var smallIcon = new L.Icon({
	  iconSize: [25, 41],
	  iconAnchor: [12, 41],
	  popupAnchor: [1, -34],
	  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png",
	});
	return L.marker(latlng, {icon: smallIcon});
      },
      onEachFeature: onEachFeature,
    });
    clusters = L.markerClusterGroup({
      spiderfyOnMaxZoom: false,
      disableClusteringAtZoom: 18,
    });
    clusters.addLayer(unknownTrees);
    map.addLayer(clusters);
  });
}
