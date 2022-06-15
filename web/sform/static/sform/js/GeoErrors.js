import { Translator } from '/static/js/Translator.js';


/**
 * Get the error message from navigator.geolocation.getCurrentPosition
 * @param {object} error Error object.
 * @returns String with the error description.
 */
export function GeoErrors(error) {
    switch(error.code) {
      case error.PERMISSION_DENIED:
        return Translator.translate("User denied the request for Geolocation.");
      case error.POSITION_UNAVAILABLE:
        return Translator.translate("Location information is unavailable.");
      case error.TIMEOUT:
        return Translator.translate("The request to get user location timed out.");
      default:
        return Translator.translate("An unknown error occurred.");
    }
  }