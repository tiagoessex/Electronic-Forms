//  ###########################################
//  #                                         #
//  #   FILES/DIRECTORIES RELATED FUNCTIONS   #
//  #                                         #
//  ###########################################

/**
 * Loads a json file from disk.
 * Example:
 *             loadJSONFile(function(response) {
                    data = JSON.parse(response);                
                }, 'data.json');
 * @param {function} callback Called when ready.
 * @param {string} file Json file.
 */
export function loadJSONFile(callback, file) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', file, true); 
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);  
}



/**
 * Save data into a file.
 * @param {string} data Data to be saved.
 * @param {string} filename Filename.
 * @param {string} type File type.
 */
 export function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}


/**
 * Check if a given string is a relative url.
 * Only check: starts with /.
 * @param {string} what Url to test.
 * @returns True if it's an url, false otherwise.
 */
function isRelativeUrl(what) {
	if (!what || typeof what !== 'string') return false; 
	return what.indexOf('/') == 0
}

/**
 * Search for all relative urls:
 * Examples:
 *      /media/folder1/file1.png
 * @param {object} obj Object.
 * @param {array} arr Array where the detected urls will be stored.
 */
export function searchForRelativeUrls(obj, arr)
{
    for (var k in obj)
    {
        if (typeof obj[k] == "object" && obj[k] !== null)
            searchForRelativeUrls(obj[k], arr);
        else {
            if (isRelativeUrl(obj[k])) arr.push(obj[k])
		}
    }
}


/**
 * Loads and process a csv file/string to turn it into a json object.
 * ATT: REQUIRES papaparse (https://www.papaparse.com/)
 * 
 * @param {string} file File to load or csv data.
 * @param {boolean} load If true loads file else process the csv data.
 * @returns Array of objects [{colmn1: value, column2: value, ...}, ...].
 */
export async function loadCSVFile2Json(file, load = false) {
	return new Promise((resolve, reject) => {
      Papa.parse(file, {
			header: true,
			download: load,
			complete: function(results) {
				resolve(results.data);
			},
            error : function(err) {
                return reject(err);
            }
		})
	});	
}