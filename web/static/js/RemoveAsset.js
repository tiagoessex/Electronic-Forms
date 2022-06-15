
import { URL_REMOVE_FORM_ASSET, URL_REMOVE_OPERATION_ASSET } from '/static/js/urls.js';
import { fetchPOST } from '/static/js/Fetch.js';
import { APP } from './constants.js';


/**
 * Removes an Asset or list of Assets, identified by their IDs or names.
 * 
 * ATT: returns no promise.
 * 
 * @param {Array of numbers} asset_id Array of Assets IDs.
 * @param {Array of strings} asset_id Array of Assets name.
 * @param {APP} origin App that's calling it.
 * @param {function} onReady Called when asset is removed.
 * @param {function} onError Called if their was an error.
 * @param {object} extras Extra body parameters.
 */
export function RemoveAsset(asset_id = null, asset_name = null, origin = APP.DESIGNER, onReady = null, onError = null, extras=null) {
    let url = null;
    if (origin === APP.DESIGNER) {
        url = URL_REMOVE_FORM_ASSET;
    } else {
        url = URL_REMOVE_OPERATION_ASSET;
    }
    const data = {};
    if (asset_id) 
        data.id = asset_id;
    else if (asset_name) 
        data.name = asset_name;
    else
        throw ("ERROR: RemoveAsset - invalid parameters");
    if (extras)
        data.extras = extras;
    fetchPOST(url,
        data,
        (result) => {
            if (onReady) onReady(result);
        },
        (error) => {
            if (onError) onError(error);
        }
    );  
}
