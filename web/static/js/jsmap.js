//  ######################################
//  #                                    #
//  #   MAP/LOCATION RELATED FUNCTIONS   #
//  #                                    #
//  ######################################



/**
 * Center a leaflet map view around a marker.
 * @param {map} map Leaflet Map.
 * @param {marker} marker Leaflet Marker.
 */
export function centerLeafletMapOnMarker(map, marker) {
    var latLngs = [ marker.getLatLng() ];
    var markerBounds = L.latLngBounds(latLngs);
    map.fitBounds(markerBounds);
  }