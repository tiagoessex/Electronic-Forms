//  ################################
//  #                              #
//  #   COLORS RELATED FUNCTIONS   #
//  #                              #
//  ################################


/**
 * Random RGB color.
 * @returns A random RBG color: rgb(R,G,B).
 */
export function randomColor() {
    return 'rgb(' + random(0,255) + ', ' + random(0,255) + ', ' + random(0,255) +  ')';
}

/**
 * Convertes rgb(r,g,b) to hexadecimal #rgb.
 * @param {object} rgb RGB value.
 * @returns Returns the color hex value corresponding to the given rgb value.
 */
 export function RGBtoHEX(rgb) {//rgb2hex(rgb) {
    if (/^#[0-9A-F]{6}$/i.test(rgb)) return rgb;

    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    function hex(x) {
        return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

/**
 * Get the hex representation of the rgba color string. Alpha will be discarted.
 * @param {string} rgb RGBA color string.
 * @returns Returns the hex representation of the rgba color string.
 */
export function RGBAtoHEX(rgb) {//rgba2hex(rgb){
    rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
    return (rgb && rgb.length === 4) ? "#" +
     ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
     ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
     ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
}

/**
 * Given an hex color and an alpha, get an rgba string representing the hex and the alpha.
 * @param {string} hex Color in hex format
 * @param {float} alpha Color alpha.
 * @returns Returns a rgba string representing the hex and the alpha.
 */
export function HEXtoRGBA(hex,alpha=1.0) {
    hex = hex.replace(/#/g, '');
    if (hex.length === 3) {
        hex = hex.split('').map(function (hex) {
            return hex + hex;
        }).join('');
    }
    var result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})[\da-z]{0,0}$/i.exec(hex);
    if (result) {
        var red = parseInt(result[1], 16);
        var green = parseInt(result[2], 16);
        var blue = parseInt(result[3], 16);

        //return [red, green, blue];
        return "rgba(" + red + "," + green + "," + blue + "," + alpha + ")";
    } else {
        return null;
    }
}

/**
 * Split and RGBA string into an ordered array.
 * @param {string} RGBA A string representing an RGBA color.
 * @returns An ordered array with the R, G, B and Alpha colors.
 */
export function getColors(RGBA) {    
    const c = RGBA.substring(RGBA.indexOf('(') + 1, RGBA.lastIndexOf(')')).split(/,\s*/);
    return [c[0], c[1], c[2], c[3]];
}
