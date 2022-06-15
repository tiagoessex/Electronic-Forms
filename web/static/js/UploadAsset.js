
import { URL_FORM_UPLOAD_ASSET, URL_OPERATION_UPLOAD_ASSET } from '/static/js/urls.js';
import { fetchPOST } from '/static/js/Fetch.js';
import { APP } from './constants.js';
import { ASSETTYPE } from '/static/js/assettype.js';


/**
 * Uploads an Asset.
 * 
 * ATT: returns no promise.
 * 
 * @param {object} data Form data.
 * @param {number} id Form/Operation ID.
 * @param {string} filename Filename.
 * @param {ASSETTYPE} asset_type Type of asset.
 * @param {APP} origin App that's calling it.
 * @param {function} onReady Called when asset is removed.
 * @param {function} onError Called if their was an error.
 */
export function UploadAsset(data, id, filename, asset_type = ASSETTYPE.IMAGE, origin = APP.DESIGNER, onReady = null, onError = null) {
    let url = null;
    if (origin === APP.DESIGNER) {
        url = URL_FORM_UPLOAD_ASSET;
    } else {
        url = URL_OPERATION_UPLOAD_ASSET;
    } 

    data.append('id', id);
    data.append('name', filename);
    data.append('type',asset_type);
    
    fetchPOST(url,
        data,
        (result) => {
            if (onReady) onReady(result);
        },
        (error) => {
            if (onError) onError(error);
        },
        false,
        null
    );
}