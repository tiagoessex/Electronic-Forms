
importScripts('/static/plugins/PapaParse-5.0.2/papaparse.min.js');  // to parse csv files


/**
 * Parses a File representing a csv file and return an array of objects representing the 
 * rows of the file.
 * Header = true => [{colmn1: value, column2: value, ...}, ...]
 * @param {File} file 
 * @returns Array of objects.
 */
 async function _file_2_json(file) {
	return new Promise(resolve => {
      Papa.parse(file, {
			header: true,
			complete: function(results) {
				resolve(results.data);
			}
		})
	});	
}



/**
 * YYYY-MM-DDTHH:mm:ss.sssZ -> YYYY-MM-DD hh-mm-ss
 * @param {string} mysql_timestamp Mysql DateTime format (YYYY-MM-DDTHH:mm:ss.sssZ)
 * @param {string} connector String between date and time.
 * @returns YYYY-MM-DD hh-mm-ss or null if input string is invalid.
 */
 function _mysqlTimeStamp2JS(mysql_timestamp, connector = ' ') {
	if (mysql_timestamp && mysql_timestamp != '' && typeof(mysql_timestamp) == 'string')
    	return mysql_timestamp.substr(0,10) + connector + mysql_timestamp.substr(11,8);
	else
		return null;
}


/**
 * Returns a random integer number in an interval.
 * @param {number} min Minimum integer number.
 * @param {number} max Maximum integer number.
 * @returns A random integer.
 */
function randInt(min=null, max=null) {
	if (min==null && max==null)
	  return 0;    
	
	if (max == null) {
		max = min;
		min = 0;
	}
	return min + Math.floor(Math.random() * (max - min + 1));
};


/**
 * For fetch.
 * @param {Response} response 
 * @returns 
 */
function handleErrors(response) {
    if (!response.ok) {
        console.error(response);
        throw Error(response.status + ' - ' + response.statusText);
    }
    return response.json();
}



// Converts resBlob to base64
function blobToData (blob) {
	return new Promise((resolve) => {
	  const reader = new FileReader()
	  reader.onloadend = () => resolve(reader.result)
	  reader.readAsDataURL(blob)
	})
  }


/**
 * Returns all elements in arr1 but not in arr2, filter by key.
 * @param {array of objects} arr1 
 * @param {array of objects} arr2 
 * @param {string} key 
 * @returns Array of all elements in arr1 not in arr2.
 */
 const exclude = (arr1, arr2, key) => arr1.filter(o1 => arr2.map(o2 => o2[key]).indexOf(o1[key]) === -1);

 /* 
 Example:
 const a = [
	{
        id: 1,
        value: 'Blah Blah'
    },{
        id: 2,
        value: 'Foos'
    },]
const b = [
	{
        id: 1,
        value: 'Blah Blah'
    },
    {
        id: 3,
        value: 'Foos'
    },
]
const key = 'id';
const exclude = (arr1, arr2) => arr1.filter(o1 => arr2.map(o2 => o2[key]).indexOf(o1[key]) === -1);
console.log(exclude(a,b))	=>  [{id: 2 ,value: "Foos"}] 
*/


/**
 * Generates a random generated alphanumeric string.
 * @param {number} length Number of characters.
 * @param {number} random_extra_chars Random number of extra chars.
 * @returns A random generated alphanumeric string.
 */
 const randomAlphanumericString = (length = 8, random_extra_chars = 0) => {
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let str = '';
    if (random_extra_chars > 0) {
      length += Math.floor(Math.random() * random_extra_chars);
    }
    for (let i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return str;
};


/**
 * Given an url, it returns only the filename.
 * @param {string} url Full url.
 * @param {boolean} with_url If true, then url = url("path"), else url = path.
 * @returns The filename or null if error.
 */

function getFileFromUrl(url, with_url = false) {
    if (!url || typeof url === 'undefined') return null;
    if (with_url) {
        const path = url.substring(url.lastIndexOf("(\"") + 2, url.lastIndexOf("\""));
        return path.replace(/^.*[\\\/]/, '');
    } else {
        return url.replace(/^.*[\\\/]/, '');
    }
}

/**
 * Append a string to a filename.
 * Example: 
 *      append2File('qwe.js','_123')    => qwe_123.js
 * @param {string} filename Filename.
 * @param {string} extra String to append.
 * @returns Filename with extra appended (before the extension).
 */
function append2File(filename, extra) {
    const file = filename.substring(0, filename.lastIndexOf('.'));
    const extension = filename.substring(filename.lastIndexOf('.'));
    return file + extra + extension;
}

/**
 * Error handler for fetch.
 * Ex: 
 *      const operation = await (await (fetch(URL_NEW_OPERATION_COMPLETE, options)).catch(handleError)).json();
 *      if (operation.code && operation.code === 400) return null;
 */
const handleError = function (err) {
	console.warn(err);
	return new Response(JSON.stringify({
		code: 400,
		message: 'Stupid network Error!'
	}));
};


/**
 * Get all the negative numbers in an array.
 * @param {array of numbers} array
 * @returns Array of all the negative numbers in array.
 */
function getNegativeNumbers(array) {
    return array.filter(function(value) {
      return value < 0;
    });
}


/**
 * Promised delay.
 * Example:
 *      await delay(3000);
 * @param {number} ms Time in milliseconds.
 * @returns Promise.
 */
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));


