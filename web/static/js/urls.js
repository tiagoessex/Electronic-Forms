/**
 * We cannot use django template tags in dedicated js files
 * 
 * Many of these URLs are also defined in sform/js/offline/offlinedb.js
 * 
 */


// === APPS ===
export const URL_DESIGNER = '/designer/';
export const URL_PREVIEW = '/preview/';
export const URL_FORMS_MANAGER = '/formsmanager/';
export const URL_SFORM = '/sform/';
export const URL_OPERATIONS = '/operations/';
export const URL_EDITVIEW = '/opeditview/';

// === ASSETS ===
export const URL_ASSETS = '/media/';
//export const URL_FORMS_ASSETS_DIR = 'form_assets/';
export const URL_FORMS_ASSETS = URL_ASSETS + 'form_assets/';
export const URL_OPERATIONS_ASSETS = URL_ASSETS + 'operation_assets/';
// === TABLES ===
export const URL_FOODEX_ATTRIBUTES = URL_ASSETS + 'files/foodex_attributes_EN.csv';
export const URL_FOODEX_TERMS = URL_ASSETS + 'files/foodex_terms_EN.csv';

// === IMAGES ===
export const URL_IMAGES = '/static/images/';
export const URL_IMAGES_FORMSMANAGER = '/static/formsmanager/images/';
export const URL_IMAGES_DESIGNER = '/static/designer/images/';
export const URL_IMAGES_OPERATIONS = '/static/operations/images/';

// globals
export const QUESTION_MARK_IMAGE = URL_IMAGES + 'questionmark.png'; // image in AreYouSure dialog/modal
export const ERROR_IMAGE = URL_IMAGES + 'error.png'; // image in Error dialog/modal
export const WARNING_IMAGE = URL_IMAGES + 'warning.png'; // image in Warning dialog/modal
export const OK_IMAGE = URL_IMAGES + 'ok.png';
export const STATUS_GREEN = URL_IMAGES + 'status/green.png';
export const STATUS_ORANGE = URL_IMAGES + 'status/orange.png';
export const STATUS_RED = URL_IMAGES + 'status/red.png';




// formsmanager
export const OPEN_ASSETS_LIST_IMAGE = URL_IMAGES_FORMSMANAGER + 'open.png';
export const CLOSE_ASSETS_LIST_IMAGE = URL_IMAGES_FORMSMANAGER + 'close.png';

// designer
export const PAGE_LIST_ICON = URL_IMAGES_DESIGNER + 'pagicon.jpg'; // image to appear in the page management modal
export const GPS_INPUT = URL_IMAGES_DESIGNER + '_gps_.png';
export const PHOTO_INPUT = URL_IMAGES_DESIGNER + '_photo_.png';
export const SIGNATURE_INPUT = URL_IMAGES_DESIGNER + '_signature_.png';
export const DRAWING_INPUT = URL_IMAGES_DESIGNER + '_drawing_.png';
export const USER_IMAGE_INPUT = URL_IMAGES_DESIGNER + '_image_.png';
export const BARCODE_INPUT = URL_IMAGES_DESIGNER + '_barcode_.png';
export const TREE_ICON_DB = URL_IMAGES_DESIGNER + 'iconDB.png';
export const TREE_ICON_TABLE = URL_IMAGES_DESIGNER + 'tableDB.png';
export const IMAGE_MISSING = URL_IMAGES_DESIGNER + '_missing_.png';
export const DRAG_AND_DROP = URL_IMAGES_DESIGNER + 'dropfiles.png';

// operations
export const OPEN_OPS_ASSETS_LIST_IMAGE = URL_IMAGES_OPERATIONS + 'open.png';
export const CLOSE_OPS_ASSETS_LIST_IMAGE = URL_IMAGES_OPERATIONS + 'close.png';


// === APIS ===

// API - DESIGNER
export const URL_LIST_DATABASES = URL_DESIGNER + "api/list_databases/";  // /designer/api/list_databases/
export const URL_DATABASES_TABLES = URL_DESIGNER + "api/db_tables/";
export const URL_TABLE_COLUMNS = URL_DESIGNER + "api/db_table_columns/";
export const URL_NEW_FORM = URL_DESIGNER + "api/new_form/";
export const URL_SAVE_FORM = URL_DESIGNER + "api/save/";
export const URL_EDITABLES_FORMS = URL_DESIGNER + 'api/editable_forms/';
export const URL_GET_FORM = URL_DESIGNER + 'api/get_form/';  // get form
export const URL_GET_EDITABLE_FORM = URL_DESIGNER + 'api/get_editable_form/';  // get form
export const URL_CHANGE = URL_DESIGNER + 'api/change/';
export const URL_CHECKNAME = URL_DESIGNER + 'api/check_name/'; 
export const URL_FORM_UPLOAD_ASSET = URL_DESIGNER + 'api/upload_form_asset/';
export const URL_LIST_FORM_ASSETS = URL_DESIGNER + 'api/list_form_assets/';
export const URL_FORM_CONTENT = URL_DESIGNER + 'api/form_content/';
export const URL_REMOVE_TEMP = URL_DESIGNER + 'api/delete_temp/'; 
export const URL_REMOVE_FORM_ASSET = URL_DESIGNER + 'api/remove_form_asset/'; 
export const URL_DOWNLOAD = URL_DESIGNER + 'api/download/'; 
export const URL_GET_TABLE = URL_DESIGNER + 'api/get_table/'; 
export const URL_LIST_TABLE_COLUMNS = URL_DESIGNER + 'api/list_table_columns/'; 
export const URL_GET_TABLE_COLUMN = URL_DESIGNER + 'api/get_table_column/'; 
export const URL_LIST_DBS = URL_DESIGNER + 'api/list_dbs/'; 
export const URL_LIST_DB_TABLES = URL_DESIGNER + 'api/list_db_tables/';
export const URL_LIST_DB_TABLE_COLUMNS = URL_DESIGNER + 'api/list_db_table_cols/';
export const URL_GET_DB_TABLE_COLUMN = URL_DESIGNER + 'api/get_db_table_col/';
export const URL_GET_DB_TABLE_COLUMN_UNIQUE = URL_DESIGNER + 'api/get_db_table_col_unique/';
export const URL_LIST_QUERIES = URL_DESIGNER + 'api/list_queries/';

// API - FORMS MANAGEMENT
export const URL_FORM_USE = URL_FORMS_MANAGER + 'api/use/'; 
export const URL_FORM_DISABLE = URL_FORMS_MANAGER + 'api/disable/';
export const URL_FORM_DELETE = URL_FORMS_MANAGER + 'api/delete/';
export const URL_FORM_REMOVE_TEMPS = URL_FORMS_MANAGER + 'api/delete_temps/'; 
export const URL_FORM_CLONE = URL_FORMS_MANAGER + 'api/clone/'; 
export const URL_FORM_FORMS = URL_FORMS_MANAGER + 'api/forms/'; 


// API - OPERATIONS
export const URL_EXEC_QUERY = URL_OPERATIONS + 'api/exec_query/';
export const URL_LIST_IN_USE_FORMS = URL_OPERATIONS + 'api/list_in_use_forms/';  ///operations/api/list_in_use_forms/
export const URL_NEW_OPERATION = URL_OPERATIONS + 'api/new_operation/';
export const URL_DELETE_OPERATION = URL_OPERATIONS + 'api/delete_operation/';
export const URL_UPDATE_OPERATION = URL_OPERATIONS + 'api/update_operation/';
export const URL_GET_OPERATION = URL_OPERATIONS + 'api/get_operation/';             // /operations/api/get_operation/73/
export const URL_LIST_OPERATIONS = URL_OPERATIONS + 'api/list_operations/';       // /operations/api/list_operations/OPEN/
export const URL_LIST_ALL_OPERATIONS = URL_OPERATIONS + 'api/list_all_operations/';       // /operations/api/list_all_operations/
export const URL_LIST_NON_COMPLETED_OPERATIONS = URL_OPERATIONS + 'api/list_non_completed_operations/';       // /operations/api/list_non_closed_operations/
export const URL_LIST_ALL_NON_COMPLETED_OPERATIONS = URL_OPERATIONS + 'api/list_all_non_completed_operations/';       // /operations/api/list_all_non_closed_operations/
export const URL_GET_OPERATION_DATA = URL_OPERATIONS + 'api/get_operation_data/'; // /operations/api/get_operation_data/1008/
export const URL_SET_OPERATION_STATUS = URL_OPERATIONS + 'api/set_operation_status/';
export const URL_GET_OPERATION_FORM_DATA = URL_OPERATIONS + 'api/get_operation_form_data/';   // /operations/api/get_operation_form_data/13/
export const URL_OPERATION_UPLOAD_ASSET = URL_OPERATIONS + 'api/upload_operation_asset/';
export const URL_REMOVE_OPERATION_ASSET = URL_OPERATIONS + 'api/remove_operation_asset/';
export const URL_VALIDATE_OPERATION_INPUTS = URL_OPERATIONS + 'api/validate_operation_inputs/';   // /operations/api/validate_operation_inputs/70/
export const URL_LIST_OPERATION_ASSETS = URL_OPERATIONS + 'api/list_operation_assets/';   // /operations/api/list_operation_assets/67/
export const URL_DOWNLOAD_OPERATION_ASSET = URL_OPERATIONS + 'api/download_asset/'; 
export const URL_LIST_OPERATION_ANNEXES = URL_OPERATIONS + 'api/list_operation_annexes/';   // /operations/api/list_operation_annexes/67/
export const URL_NEW_OPERATION_COMPLETE = URL_OPERATIONS + 'api/new_operation_complete/';
export const URL_OPERATION_UPLOAD_ASSET_COMPLETE = URL_OPERATIONS + 'api/upload_operation_asset_complete/';
export const URL_CLEAN_OPERATION_ASSETS = URL_OPERATIONS + 'api/clean_operation_assets/';
export const URL_IS_OPERATION_SIGNED = URL_OPERATIONS + 'api/is_operation_signed/';



/**
 * Given a url, it returns only the filename.
 * @param {string} url Full url.
 * @param {boolean} with_url If true, then url = url("path"), else url = path.
 * @returns The filename or null if error.
 */

export function getFileFromUrl(url, with_url = false) {
    if (!url || typeof url === 'undefined') return null;
    if (with_url) {
        const path = url.substring(url.lastIndexOf("(\"") + 2, url.lastIndexOf("\""));
        return path.replace(/^.*[\\\/]/, '');
    } else {
        return url.replace(/^.*[\\\/]/, '');
    }
}

/**
 * 
 * @param {number} id 
 * @param {string} filename 
 * @param {boolean} with_url 
 * @param {string} base_url 
 * @returns An url.
 */

export function file2Url(id, filename, with_url = false, base_url = URL_ASSETS) {
    if (with_url)
        return 'url(' + base_url + id + '/' + filename + ')';
    else
        return base_url + id + '/' + filename;
}

