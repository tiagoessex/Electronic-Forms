//  #########################
//  #                       #
//  #   UTILITY FUNCTIONS   #
//  #                       #
//  #########################

/**
 * Detects whether the code is running on a mobile device or not.
 * @returns True if device is mobile, False otherwise.
 */
export function isMobile() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent);
    return isTablet;
}



/**
 * Gets a subtring of a string, up to n_get chars.
 * The remainer chars will be replaced with ext.
 * Used to prevent extensive select options texts, titles, ...
 * @param {string} str Original string.
 * @param {number} n_gt Max number of chars.
 * @param {number} n_get Max number of extracted chars.
 * @param {string} ext String to replace the remainer chars.
 * @returns A substring of str.
 */
export function subStr(str, n_gt, n_get, ext = '...') {
    return str.length > n_gt ? str.substring(0,n_get) + ext : str;
}


/**
 * Easy ID creator from a name.
 * Examples: getIdFromName('Entity Information') -> entity_information
 * @param {string} name String with spaces and uppercase letters
 * @returns A string made by replacing all spaces by _ and uppercases by lowercases 
 */
 export function getIdFromName(name) {
    return name.replace(/ /g,"_").toLowerCase();
}

/**
 * Gets the key, given an object and the key corresponding value.
 * @param {object} object Object to search in.
 * @param {any} value Value corresponding to the key.
 * @returns 
 */
export function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

/**
 * Renames a key in a object.
 * @param {object} object Object.
 * @param {string} old_key Old key name.
 * @param {string} new_key New key name
 */
export function renameKey(object, old_key, new_key) {    
    if (old_key !== new_key) {
        Object.defineProperty(object, new_key,
            Object.getOwnPropertyDescriptor(object, old_key));
        delete object[old_key];
    }
}


/**
 * Swaps the elements at positions indexA and indexB.
 * @param {array} arr Array.
 * @param {number} indexA Index of element A.
 * @param {number} indexB Index of element B.
 */
export function swapArrayElements(arr, indexA, indexB) {
    var temp = arr[indexA];
    arr[indexA] = arr[indexB];
    arr[indexB] = temp;
};






/**
 * Removes an item from an array.
 * @param {array} arr Array.
 * @param {any} value Item to be removed.
 * @returns Array with item removed.
 */
export function arrayRemove(arr, value) {     
    return arr.filter(function(ele){ 
        return ele != value; 
    });
}



/**
 * Copies all styles from targt to sourc.
 * @param {HTMLElement} targt Target element.
 * @param {HTMLElement} sourc Source element.
 */
export function copyAttrs(targt, sourc) {
    [...sourc.attributes].forEach(attr => {
        targt.setAttribute(attr.nodeName, attr.nodeValue)
    })
}


/**
 * Gets all the numbers in a string.
 * @param {string} str Target string.
 * @returns Array of all the numbers in the string.
 */
export function getAllNumbers(str) {
    if (!str || typeof str == undefined || typeof str === 'object') return [];    
    const r = /\d+/;
    return str.match(r);
}


/**
 * Returns all elements in arr1 but not in arr2, filter by key.
 * @param {array of objects} arr1 
 * @param {array of objects} arr2 
 * @param {string} key 
 * @returns Array of all elements in arr1 not in arr2.
 */
 export const exclude = (arr1, arr2, key) => arr1.filter(o1 => arr2.map(o2 => o2[key]).indexOf(o1[key]) === -1);
