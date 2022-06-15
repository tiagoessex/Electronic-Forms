/**
 * 
 * IndexedDB Operations: LOCAL <-> REMOTE
 * 
 * STORES:
 *      forms               all currently "IN USE" forms
 *      formsassets         images and tables of the forms
 *      operations          currently "OPEN" and "CLOSED" operations of the user
 *      operationsassets    images, docs, ... of the operations
 * 
 * Notes:
 *      - boolean cannot be keys => make them integer: false = 0 | true = 1
 *      - forms.isDeprecated=1 => form no longer in use, but there are still at least one 
 *                                operation using it
 *      - uses the IndexedDB wrapper Dexie.js (https://dexie.org/)
 * 
 */



importScripts('/static/plugins/Dexie.js-3.2.0/dexie.min.js');

const DATABASE = 'SFORM_1';
const VERSION = 1;

const PATH_FORM_ASSET = '/media/form_assets/';
const PATH_OPERATION_ASSET = '/media/operation_assets/';

const URL_LIST_IN_USE_FORMS = '/operations/api/list_in_use_forms/';
const URL_GET_FORM = '/designer/api/get_form/';
const URL_FORMS_ASSETS = '/designer/api/list_form_assets/'; // + form_id/
const URL_GET_TABLE = '/designer/api/get_table/'; // + form_id/table_name/ 
const URL_GET_TABLE_COLUMN = '/designer/api/get_table_column/'; 

const URL_GET_OPERATION_DATA = '/operations/api/get_operation_data/'; // + operation_id/
const URL_LIST_OPERATIONS = '/operations/api/list_operations/';  // + OPEN/
const URL_LIST_NON_COMPLETED_OPERATIONS = '/operations/api/list_non_completed_operations/';
const URL_LIST_OPERATION_ASSETS = '/operations/api/list_operation_assets/';   // /operations/api/list_operation_assets/67/
const URL_UPDATE_OPERATION = '/operations/api/update_operation/';
const URL_NEW_OPERATION = '/operations/api/new_operation/';
const URL_DELETE_OPERATION = '/operations/api/delete_operation/';
const URL_OPERATION_UPLOAD_ASSET = '/operations/api/upload_operation_asset/';
const URL_LIST_OPERATION_ANNEXES = '/operations/api/list_operation_annexes/';   // /operations/api/list_operation_annexes/67/
const URL_REMOVE_OPERATION_ASSET = '/operations/api/remove_operation_asset/';
const URL_NEW_OPERATION_COMPLETE = '/operations/api/new_operation_complete/';
const URL_OPERATION_UPLOAD_ASSET_COMPLETE = '/operations/api/upload_operation_asset_complete/';
const URL_CLEAN_OPERATION_ASSETS = '/operations/api/clean_operation_assets/';
const URL_GET_OPERATION = '/operations/api/get_operation/';             // /operations/api/get_operation/73/
const URL_GET_OPERATION_FORM_DATA = '/operations/api/get_operation_form_data/';   // /operations/api/get_operation_form_data/13/



const OPERATION_STATE = {
    OPEN: 'OPEN',
    CLOSED: 'CLOSED',
    COMPLETED: 'COMPLETED',
}

const ACTION = {
	WRITE_LOCAL:'WRITE_LOCAL',
	WRITE_REMOTE:'WRITE_REMOTE',
	DELETE_LOCAL:'DELETE_LOCAL',
	DELETE_REMOTE:'DELETE_REMOTE',
	DO_NOTHING:'DO_NOTHING',
}



function offlineDatabase() {  
  
    var offline_db = null;
    var CSRFToken = null;

    // ------------------------------------------------------
    // ------------------ INITIALIZATION --------------------
    // ------------------------------------------------------

    /**
     * Sets the token to be used in POSTs requests.
     * @param {string} token Security token.
     */
    function setToken(token) {
        CSRFToken = token;
    }

    /**
     * Inits local storage.
     * Stores structures must contain all fields required to match an online response 
     * (check the repective serializers).
     */
    function setLocalDatabase() {
        offline_db = new Dexie(DATABASE);
        offline_db.version(VERSION).stores({
            // {id, name, description, form, isDeprecated=0 }
            // dates are irrelevant
            STORE_FORMS: 'id,isDeprecated', 
            // {id, form_id, name, asset, data}
            // dates are irrelevant
            // asset: asset full path relative to server
            STORE_FORMS_ASSETS:'id,form_id,asset',
            // {id, name, description, form, form_name, data_creation, status_name, operation_data, isPendingDeletion, date_updated, updated_by}
            // operation_data = {id, operation, data}
            STORE_OPERATIONS: 'id,form,status_name,isPendingDeletion,[status_name+isPendingDeletion]',
            // {id, operations, name, asset, date, type, type_name, is_annex, data}
            // asset: asset full path relative to server: /operation_assets/operation_id/filename
            STORE_OPERATIONS_ASSETS:'id,operation_id,asset',
        });

    }

    // ----------------------------------------------------
    // ------------------ FORMS ASSETS --------------------
    // ----------------------------------------------------

    /**
     * Returns the local form asset as a File.
     * @param {string} asset_fullpath 
     * @returns Asset file.
     */
     async function getLocalFormAsset(asset_fullpath) {
        const asset = await offline_db.STORE_FORMS_ASSETS.where('asset').equals(asset_fullpath).first();        
        return new File([asset.data], asset.asset);
    }

    /**
     * Stores locally a form asset as binary data.
     * @param {number} id Asset's ID.
     * @param {number} form_id Form's ID.
     * @param {string} name Asset filename.
     * @param {string} fullpath Full path to the asset (<=> asset in models).
     */
    async function saveLocalFormAsset(id, form_id, name, fullpath) {        

        const res = await fetch(fullpath);
        const blob = await res.blob();

        //await offline_db.transaction('rw', [offline_db.STORE_FORMS_ASSETS], async () => {
        await offline_db.STORE_FORMS_ASSETS.put({
            id: id,
            form_id: form_id,
            name: name,
            asset: fullpath,
            data: blob
        });
        //});
        
        console.log("FORM ASSET [", fullpath,"] SAVED");
    }



    /**
     * Fetches and saves all remote assets of a particular form.
     * @param {number} form_id Form ID.
     */
     async function synchronizeFormAssets(form_id) {

        const response_assets = await fetch(URL_FORMS_ASSETS + form_id);
        if (response_assets.ok) {
            const assets = await response_assets.json();
            // assets: {id, name, asset, type, type_name}

            await [...Array(assets.length)].reduce( (p, _, i) => 
            p.then(
                () => {
                    return saveLocalFormAsset(assets[i].id, form_id, assets[i].name, assets[i].asset);
                })
            , Promise.resolve());

        } else {
            console.error("[synchronizeFormAssets] Error while fetching URL_FORMS_ASSETS");
        }
    }


    // ---------------------------------------------
    // ------------------ FORMS --------------------
    // ---------------------------------------------

    /**
     * Gets a specific local form.
     * @param {number} form_id Form ID.
     * @returns Returns a local form.
     */
     async function getLocalForm(form_id) {
        const form = await offline_db.STORE_FORMS.get(form_id);
        return form;
    }

    /**
     * Checks if a form exists in local storage.
     * @param {number} id Form's ID.
     * @returns True if form exists in the local storage, False otherwise.
     */
     async function existsLocalForm(id) {
        const v = await offline_db.STORE_FORMS.get(id);
        return typeof v !== 'undefined';  
    }

    /**
     * Returns a list of all non deprecated local forms.
     * @returns Array of objects, rpesenting the list of forms.
     */
     async function getListOfAllValidLocalForms() {
        return await offline_db.STORE_FORMS.where('isDeprecated').equals(0).toArray();
    }

    /**
     * Delete in bulk all specified local forms and their assets.
     * @param {array of numbers} local_forms_id Array with the forms' ID to be deleted.
     */
    async function deleteLocalFormsAndAssets(local_forms_id) {
        const assets_to_delete = [];

        await offline_db.STORE_FORMS_ASSETS        
        .each(_asset => {
            if (local_forms_id.includes(_asset.form_id)) {            
                assets_to_delete.push(_asset.id);                
            }            
        });

        console.log("FORMS 2 DELETE > ", local_forms_id);
        console.log("FORMASSET 2 DELETE > ", assets_to_delete);
       
        await offline_db.transaction('rw', [offline_db.STORE_FORMS, offline_db.STORE_FORMS_ASSETS], async () => {
            await offline_db.STORE_FORMS.bulkDelete(local_forms_id);
            await offline_db.STORE_FORMS_ASSETS.bulkDelete(assets_to_delete);
        });
        
    }

    /**
     * Eliminates all obsolete forms and their assets, as long as these forms
     * are not being used in any OPEN | CLOSED operation.
     */
    async function eliminateObsoleteForms() {        
        const depreacted_forms = await offline_db.STORE_FORMS.where('isDeprecated').equals(1).toArray();

        const forms_2_delete = [];

        // CHECK WHICH FORMS ARE STILL BEING USED BY AN OPEN|CLOSED OPERATION.
        await [...Array(depreacted_forms.length)].reduce( (p, _, i) => 
        p.then(            
            () => {
                return offline_db.STORE_OPERATIONS.where('form').equals(depreacted_forms[i].id).toArray().then(result => {
                    if (result.length == 0 && result.status_name !== OPERATION_STATE.COMPLETED) {
                        forms_2_delete.push(depreacted_forms[i].id);
                    }
                });
            }
        )
        , Promise.resolve() );

        await deleteLocalFormsAndAssets(forms_2_delete);

    }

    /**
     * Deals with obsolete forms.
     * If obsolete mark as depreacted
     * @param {object} remote_forms Remote form {id, name, description, status_name}
     */
    async function flagObsoleteForms(remote_forms) {
        // IF IN LOCAL BUT NOT IN REMOTE => OBSOLETE
        // ONLY CHECK NON DEPREACTED LOCAL FORMS
        const local_forms = await offline_db.STORE_FORMS.where('isDeprecated').notEqual(1).toArray();
        
        const new_depreacted_forms = exclude(local_forms,remote_forms, 'id');

        // IF IT IS BEING USED BY AN OP => DEPREACTED = 1 ELSE DELETE IT AND ITS ASSETS
        await [...Array(new_depreacted_forms.length)].reduce( (p, _, i) => 
        p.then(            
            () => {
                console.log("FORM [" + new_depreacted_forms[i].id + "] FLAGGED AS DEPREACTED!");
                return offline_db.STORE_FORMS.where('id').equals(new_depreacted_forms[i].id).modify({isDeprecated: 1});
            }
        )
        , Promise.resolve() );
    }

    /**
     * Saves a form in local storage.
     * @param {number} id Form ID.
     * @param {string} name Form's name.
     * @param {string} description Form's description.
     * @param {object} form Form object.
     */
     async function saveLocalForm(id, name=null, description=null, form=null) {
        await offline_db.STORE_FORMS.add({
            id: id, 
            name:name?name:'', 
            description:description?description:'', 
            form:form?form:'', 
            isDeprecated: 0
        });
    }



    /**
     * Synchronize a specific remote form with local.
     * @param {object} remote_form Remote form {id, name, description, status_name}
     */
    async function synchronizeForm(remote_form) {
        const form_id = remote_form.id;

        const exists = await existsLocalForm(form_id);

        if (!exists) {
            // FETCH FORM DATA
            const response_form = await fetch(URL_GET_FORM + form_id);
            if (response_form.ok) {
                const form = await response_form.json();

                // {id, name, description, status, author, locked_by, updated_by, disabled_by
                //  date_created, date_updated, date_locked, date_disabled, form}
                // SAVE IN LOCAL STORE
                await saveLocalForm(form.id, form.name, form.description, form.form);

                // FETCH REMOTE ASSETS                
                await synchronizeFormAssets(form.id); 
                
                console.log("REMOTE FORM [" + form_id + "] AND ITS ASSETS SAVED LOCALLY");
            } else {
                console.error("[synchronizeForm] Error while fetching URL_GET_FORM");
            }
        } else {
            console.log("FORM [" + form_id + "] ALREADY IN LOCAL! NOT FETCHING IT!");            
        }
    }


    /**
     * Saves remote forms locally depending on the form existence.
     * If form not in local => save it locally.
     * @param {array of object} remote_forms Array of remote forms {id, name, description, status_name}.
     */
     async function synchronizeForms(remote_forms) {
        await [...Array(remote_forms.length)].reduce( (p, _, i) => 
        p.then(
            () => {
                return synchronizeForm(remote_forms[i]);
            })
        , Promise.resolve() );
    }

    
    /**
     * Synchronize local forms with a list of remote forms.
     * @param {array of objects} remote_forms 
     */
     async function syncForms(remote_forms) {
        // REMOTE NOT IN LOCAL => SAVE IT
        await synchronizeForms(remote_forms);

        // IDENTIFY OBSOLETE LOCAL FORMS
        await flagObsoleteForms(remote_forms);
        
        // ELIMINATE OBSOLETE LOCAL FORMS
        await eliminateObsoleteForms();
    }



    // ---------------------------------------------------------
    // ------------------ OPERATIONS ASSETS --------------------
    // ---------------------------------------------------------


    /**
     * Deletes all local assets of a specific local operation.
     * @param {number} operation_id Operation ID.
     */
    async function deleteLocalOperationAssets(operation_id) {
        await offline_db.STORE_OPERATIONS_ASSETS.where('operation_id').equals(operation_id).delete();
        console.log("LOCAL ASSETS OF OPERATION [", operation_id,"] REMOVED!");
    }

    /**
     * Deletes a group of local assets.
     * @param {array of numbers} array_of_id IDs of the assets.
     */
    async function deleteLocalOperationAssetsBulk(array_of_id) {
        await offline_db.STORE_OPERATIONS_ASSETS.bulkDelete(array_of_id);
        console.log("LOCAL OPERATION ASSETS [", array_of_id,"] REMOVED!");
    }    


    /**
     * Checks a specific operation asset exists locally and if so, compares its date with a given one.
     * Returns the action that should be executed.
     * @param {number} asset_id Local asset ID.
     * @param {string} asset_date Some asset creation date: YYYY-MM-DD HH-MM-SS
     * @returns ACTION
     */
     async function checkLocalAsset(asset_id, asset_date = null) {
	    const local_asset = await offline_db.STORE_OPERATIONS_ASSETS.get(asset_id); 

        if (typeof local_asset !== 'undefined' && asset_date) {
            if (local_asset.date < asset_date) return ACTION.WRITE_LOCAL;
            if (local_asset.date === asset_date) return ACTION.DO_NOTHING;
            if (local_asset.date > asset_date || asset_id < 0) return ACTION.WRITE_REMOTE;
                
        } else {
            return ACTION.WRITE_LOCAL;
        }
    }
     

    /**
     * Checks if a specific asset exists locally.
     * @param {number} id Assets ID
     * @returns True if asset doesn't exists locally else false.
     */
     async function existsLocalOperationAsset(id) {
        const v = await offline_db.STORE_OPERATIONS_ASSETS.get(id);
        return typeof v !== 'undefined'; 
    }



    /**
     * Stores an operation asset as binary data.
     * @param {number} id Asset's ID.
     * @param {number} operation_id Operation's ID.
     * @param {string} name Asset filename.
     * @param {string} fullpath Full path to the asset (<=> asset in models).
     * @param {string} date Date of creation.
     * @param {number} type Type ID.
     * @param {string} type_name Type name: IMAGE, PDF, CSV, ...
     * @param {boolean} is_annex True is asset is an annex, false otherwise.
     * @param {File} file If file, then use it as data, else use fullpath to fetch the data file.
     * @returns 
     */
    async function saveLocalOperationAsset(id, operation_id, name, fullpath, date, type, type_name, is_annex, file=null) {
        let blob = null;

        // only save if asset doesn't exists yet
        const exists = await existsLocalOperationAsset(id);
        if (exists) return;

        if (file) {
            _blob = await blobToData(file);
            const res = await fetch(_blob);
            blob = await res.blob();
        }
        // fetch the remote file data        
        else {
            const res = await fetch(fullpath);
            blob = await res.blob();
        }

        await offline_db.STORE_OPERATIONS_ASSETS.put({
            id: id,
            operation_id: operation_id,
            name: name,
            asset: fullpath,
            date: _mysqlTimeStamp2JS(date),
            type:type,
            type_name: type_name,
            is_annex: is_annex,
            data: blob
        });

        console.log("LOCAL OPERATION ASSET [" + id + " # " + fullpath +"] OF OPERATION [" + operation_id + "] SAVED!");
    }



    /**
     * Synchronize the local asset with the remote asset.
     * ### TODO ### CHECK FOR ID < 0 => SAVE REMOTE -> MODIFY LOCALLY
     * @param {number} operation_id Operation ID.
     * @param {object} asset_2_save Asset 2 save {id, operation, name, asset, type, type_name, date, is_annex, data}.
     * @param {ACTION} action
     * @param {object} action Remote asset, if any (case 3).
     */
    async function synchronizeOperationAsset(operation_id, asset_2_save, action, remote_asset=null) {
        // remote -> local
        if (action === ACTION.WRITE_LOCAL) {
            await saveLocalOperationAsset(
                asset_2_save.id, 
                parseInt(operation_id), 
                asset_2_save.name, 
                asset_2_save.asset, 
                asset_2_save.date,
                asset_2_save.type,
                asset_2_save.type_name,
                asset_2_save.is_annex,
            );
        }
        else if (action === ACTION.WRITE_REMOTE) {
            // asset_2_save is a local asset
            if (!remote_asset || asset_2_save.date > _mysqlTimeStamp2JS(remote_asset.date)) {
                await saveLocalOperationAsset2Remote(asset_2_save, operation_id);
            }
        }
    }


    /**
     * Delete in bulk a series of remote assets.
     * @param {array of numbers} assets_ids Array with the remote assets ID.
     * @param {boolean} save_operation If true then save remote operation => delete all unsed assets.
     * @param {boolean} keep_date If true when save remote operation, don't change the date_updated.
     * @returns True if successful, false otherwise.
     */
    async function deleteRemoteAssets(assets_ids, save_operation=true, keep_date=false, operation_id=null) {
        if (assets_ids.length == 0 && !operation_id) return true;
        let options = {
            method: 'POST',
            mode: 'same-origin',            
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'X-CSRFToken': CSRFToken,
            },
            body: JSON.stringify({
                id: assets_ids,
                save_operation: save_operation,
                keep_date: keep_date,
                operation_id: operation_id,
            })
        }        
        const delete_assets_ids = await (await (fetch(URL_REMOVE_OPERATION_ASSET, options)).catch(handleError)).json();
        if (delete_assets_ids.code && delete_assets_ids.code === 400) {
            console.error("[deleteRemoteAssets] Error while URL_REMOVE_OPERATION_ASSET");
            return false; 
        }
        console.log("REMOTE OPERATION ASSETS [" + delete_assets_ids.id + "] OF REMOTE OPERATION [" + operation_id + "] DELETED!");
        return true;

        /*
        const operation_response = await fetch(URL_REMOVE_OPERATION_ASSET, options);
        if (operation_response.ok) {
            const delete_assets_ids = await operation_response.json();
            console.log("REMOTE OPERATION ASSETS [" + delete_assets_ids.id + "] OF REMOTE OPERATION [" + operation_id + "] DELETED!");
            return true;
        } else {
            console.error("[deleteRemoteAssets] Error while URL_REMOVE_OPERATION_ASSET");
            return false;
        } 
        */  

    }

    async function cleanRemoteAssets(operation_id) {
        let options = {
            method: 'POST',
            mode: 'same-origin',            
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'X-CSRFToken': CSRFToken,
            },
            body: JSON.stringify({
                operation_id: operation_id,
            })
        }
        const response = await (await (fetch(URL_CLEAN_OPERATION_ASSETS, options)).catch(handleError)).json();
        if (response.code && response.code === 400) {
            console.error("[cleanRemoteAssets] Error while URL_CLEAN_OPERATION_ASSETS");
            return false;
        }
        console.log("REMOTE OPERATION ASSETS OF REMOTE OPERATION [" + operation_id + "] DELETED BY CHECKING DATA!");
        return true;

        /*
        const operation_response = await fetch(URL_CLEAN_OPERATION_ASSETS, options);
        if (operation_response.ok) {
            return true;
        } else {
            console.error("[cleanRemoteAssets] Error while URL_CLEAN_OPERATION_ASSETS");
            return false;
        } 
        */  
    }

    /**
     * Use the server's process to clear the remote unused assets to remove all 
     * unused local assets.
     * save_operation_data is used in case FullLocalSync. Since when the op is saved 
     * it cleans all unused assets and also modifies its data, it means that after the 
     * upload of the assets => next save => asseta will be deleted.
     * To prevent this, all it needs is to save the operation again, before saving the operation again.
     * @param {number} operation_id Operation ID.
     * @param {number} save_operation_data Save operation and its data?
     */
    async function cleanLocalWithRemote(operation_id, save_operation_data = false) {
        let operation = true;
        if (save_operation_data) {
            const local_operation = await offline_db.STORE_OPERATIONS.get(operation_id);
            //operation = await saveLocalOperation2Remote(local_operation);
            operation = await updateRemoteOperation(local_operation);
        }
        if (operation) {
            const remote_clean_response = await cleanRemoteAssets(operation_id);
            if (remote_clean_response) {
                const remote_assets_response = await fetch(URL_LIST_OPERATION_ASSETS + operation_id);            
                if (remote_assets_response.ok) {
                    const current_remote_assets = await remote_assets_response.json(); // {id, operation, name, asset, type, type_name, date, is_annex}
                    //  - DELETE (REMOTE - FETCH)
                    console.warn("current_remote_assets>", current_remote_assets);                
                    const _local_assets = await offline_db.STORE_OPERATIONS_ASSETS.where('operation_id').equals(operation_id).toArray();
                    console.warn("_local_assets>", _local_assets);
                    const current_local_assets_2_delete = exclude(_local_assets, current_remote_assets, 'id');
                    const current_local_assets_2_delete_id = current_local_assets_2_delete.map(value => value['id']);
                    console.warn("current_local_assets_2_delete >", current_local_assets_2_delete);
                    await offline_db.STORE_OPERATIONS_ASSETS.bulkDelete(current_local_assets_2_delete_id);
                } else {
                    console.error("[synchronizeOperationAssets] Error while URL_LIST_OPERATION_ASSETS");
                }
            }
        }
    }


    /**
     * Synchronize the local assets with the remote assets.
     * Also deletes all non used assets.
     * @param {number} operation_id Operation ID.
     * @param {array of objects} remote_assetS Asset {id, operation, name, asset, type, type_name, date, is_annex}.
     * @param {ACTION} action
     */
    async function synchronizeOperationAssets(operation_id, remote_assets, action) {
        const local_assets = await offline_db.STORE_OPERATIONS_ASSETS.where('operation_id').equals(operation_id).toArray();

        // select only assets that are still not present in destination        
        let assets_2_save = null;
        if (action === ACTION.WRITE_LOCAL) {
            assets_2_save = exclude(remote_assets, local_assets, 'id');
            await [...Array(assets_2_save.length)].reduce( (p, _, i) => 
            p.then(
                () => {
                    return synchronizeOperationAsset(operation_id, assets_2_save[i], action);
                })
            , Promise.resolve() );            
        } else if (action === ACTION.WRITE_REMOTE) {
            assets_2_save = exclude(local_assets, remote_assets, 'id');
            await [...Array(assets_2_save.length)].reduce( (p, _, i) => 
            p.then(
                () => {
                    const remote_asset = remote_assets.find(o => o.id === assets_2_save[i].id)
                    return synchronizeOperationAsset(operation_id, assets_2_save[i], action, remote_asset);
                })
            , Promise.resolve() );            
        }

        // CLEANUPS
        if (action === ACTION.WRITE_LOCAL) {
            const local_assets_2_delete = exclude(local_assets, remote_assets, 'id');
            const local_assets_2_delete_id = local_assets_2_delete.map(value => value['id']);
            //console.warn("local_assets_2_delete>", local_assets_2_delete);
            await offline_db.STORE_OPERATIONS_ASSETS.bulkDelete(local_assets_2_delete_id);
        } else if (action === ACTION.WRITE_REMOTE) {
            const remote_assets_2_delete = exclude(remote_assets, local_assets, 'id');
            const remote_assets_2_delete_id = remote_assets_2_delete.map(value => value['id'])
            //console.warn("remote_assets_2_delete >", remote_assets_2_delete);
            await deleteRemoteAssets(remote_assets_2_delete_id, false);
            await cleanLocalWithRemote(operation_id, true);
        }
    }
    
 
    /**
     * Gets the local operation asset as a File.
     * @param {string} fullpath 
     * @returns Asset file.
     */
     async function getLocalOperationAsset(fullpath) {
        const blob = await offline_db.STORE_OPERATIONS_ASSETS.where('asset').equals(fullpath).first();        
        return new File([blob.data], blob.asset);
    }

    /**
     * Returns the list of all annexes of a specific operation
     * @param {number} operation_id Operation ID.
     * @returns the list of all annexes of a specific operation.
     */
     async function getLocalOperationAnnexes(operation_id) {
        const assets = await offline_db.STORE_OPERATIONS_ASSETS.where('operation_id').equals(operation_id).toArray();        
        const annexes = [];
        await [...Array(assets.length)].reduce( (p, _, i) => 
        p.then(
            () => {
                if (assets[i].is_annex) {
                    annexes.push(assets[i]);
                }                
            })
        , Promise.resolve()); 
        return annexes;
    }
    
    /**
     * Fetch all the remote assets of a specific operation and saves them locally (if they don't exist or
     * their update date don't match).
     * @param {number} operation_id 
     */
    async function fetchRemoteOperationAssetsAndSave(operation_id) {

        const remote_assets_response = await fetch( URL_LIST_OPERATION_ASSETS + operation_id);
        if (remote_assets_response.ok) {
            const remote_assets = await remote_assets_response.json(); // {id, operation, name, asset, type, type_name, date, is_annex}
            
            await [...Array(remote_assets.length)].reduce( (p, _, i) => 
            p.then(
                () => {
                    const remote_asset = remote_assets[i];
                    return checkLocalAsset(remote_asset.id, _mysqlTimeStamp2JS(remote_asset.date)).then(check => {
                        if (check === ACTION.WRITE_LOCAL) {
                            return saveLocalOperationAsset(
                                remote_asset.id, 
                                parseInt(operation_id), 
                                remote_asset.name, 
                                remote_asset.asset, 
                                remote_asset.date,
                                remote_asset.type,
                                remote_asset.type_name,
                                remote_asset.is_annex,
                            );
                        }
                    });
                })
            , Promise.resolve() ); 
                
        } else {
            console.error("[fetchRemoteOperationAssetsAndSave] Error while fetching URL_LIST_OPERATION_ASSETS");
        }
    }
    
   /**
     * Saves a list of annexes (those still not present) locally.
     * @param {number} operation_id Operation ID.
     * @param {array of objects} annexes List of annexes.
     */
    async function saveLocalOperationAnnexes(operation_id, annexes) {
        await [...Array(annexes.length)].reduce( (p, _, i) => 
        p.then(
            () => {
                return saveLocalOperationAsset(
                    annexes[i].id, 
                    parseInt(operation_id), 
                    annexes[i].name, 
                    annexes[i].asset, 
                    annexes[i].date,
                    annexes[i].type,
                    annexes[i].type_name,
                    annexes[i].is_annex,
                );               
            })
        , Promise.resolve()); 
        console.log("ANNEXES OF OPERATION [" + operation_id + "] SAVED LOCALLY!");
    }

    /**
     * Saves a local asset to remote and updated its ID.
     * @param {object} local_asset {id, operation, name, asset, date, type, type_name, is_annex, data}
     * @returns Remote asset.
     */
    async function saveLocalOperationAsset2Remote(local_asset, operation_id) {        
        let formData = new FormData();
        formData.append("operation_id", operation_id);
        formData.append("name", local_asset.name);
        formData.append("type_name", local_asset.type_name);
        formData.append("date", local_asset.date);
        formData.append("is_annex", local_asset.is_annex);        
        formData.append("data", new File([local_asset.data], local_asset.name));
        //const filename = getFileFromUrl(local_asset.name);
        //formData.append("data", new File([local_asset.data], filename));

        let options = {
            method: 'POST',
            mode: 'same-origin',            
            headers: {
                'X-CSRFToken': CSRFToken,
            },
            body: formData,
        }

        const remote_asset = await (await (fetch(URL_OPERATION_UPLOAD_ASSET_COMPLETE, options)).catch(handleError)).json();
        if (remote_asset.code && remote_asset.code === 400) {
            console.error("[deleteRemoteOperation] Error while URL_OPERATION_UPLOAD_ASSET_COMPLETE");
            return null;
        }

        await offline_db.STORE_OPERATIONS_ASSETS.where('id').equals(local_asset.id).modify({
            id: remote_asset.id, 
            asset: remote_asset.asset,
        });
        console.log("LOCAL OPERATION ASSET [" + local_asset.id + " -> " + remote_asset.id + "] SAVED REMOTELY!");
        return remote_asset;        

        /*
        const remote_asset_response = await fetch(URL_OPERATION_UPLOAD_ASSET_COMPLETE, options);
        if (remote_asset_response.ok) {
            const remote_asset = await remote_asset_response.json();
            await offline_db.STORE_OPERATIONS_ASSETS.where('id').equals(local_asset.id).modify({
                id: remote_asset.id, 
                asset: remote_asset.asset,
            });
            console.log("LOCAL OPERATION ASSET [" + local_asset.id + " -> " + remote_asset.id + "] SAVED REMOTELY!");
            return remote_asset;
        } else {
            console.error("[deleteRemoteOperation] Error while URL_OPERATION_UPLOAD_ASSET_COMPLETE");
            return null;
        }
        */
    }

    /**
     * Checks the existence of an asset with the same fullpath in local store.
     * @param {string} fullpath Fullpath to check (/operation_assets/xxx/yyy.png).
     * @returns True if exists, false otherwise.
     */
    async function existLocalOperationAssetWithFullpath(fullpath) {
        const v = await offline_db.STORE_OPERATIONS_ASSETS.where('asset').equals(fullpath).first();
        return typeof v !== 'undefined';   
    }


    // --------------------------------------------------
    // ------------------ OPERATIONS --------------------
    // --------------------------------------------------

    /**
     * Returns the operation ID from the asset.
     * @param {number} asset_id Asset ID.
     * @returns The operation associated with the asset.
     */
     async function getLocalOperationFromAsset(asset_id) {
        const asset = await offline_db.STORE_OPERATIONS_ASSETS.where('id').equals(asset_id).first();
        if (typeof v !== 'undefined') {
            return asset.operation_id;
        }
        return null;
    }


    /**
     * Updates a remote operation with a local operation.
     * On return, updates the operation update date with the remote one.
     * @param {object} operation Local operation {id, name, description, form, form_name, data_creation, status_name, operation_data, isPendingDeletion, date_updated, updated_by}
     * @returns True if successful, false otherwise.
     */
    async function updateRemoteOperation(operation) {       
        let options = {
            method: 'POST',
            mode: 'same-origin',            
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'X-CSRFToken': CSRFToken,
            },
            body: JSON.stringify({
                operation_id: operation.id,
                data: operation.operation_data,
            })
        }
        const operation_updated = await (await (fetch(URL_UPDATE_OPERATION, options)).catch(handleError)).json();
        if (operation_updated.code && operation_updated.code === 400) {
            console.error("[updateRemoteOperation] Error while URL_UPDATE_OPERATION");
            return false;
        }

        await offline_db.STORE_OPERATIONS.where('id').equals(operation.id).modify({date_updated: _mysqlTimeStamp2JS(operation_updated.operation_description.date_updated)});
        console.log("REMOTE OPERATION [" + operation.id + "] UPDATED!");
        return true;        

        /*
        const operation_updated_response = await fetch(URL_UPDATE_OPERATION, options);
        if (operation_updated_response.ok) {
            // update local date with the remote date
            const operation_updated = await operation_updated_response.json();
            await offline_db.STORE_OPERATIONS.where('id').equals(operation.id).modify({date_updated: _mysqlTimeStamp2JS(operation_updated.operation_description.date_updated)});
            console.log("REMOTE OPERATION [" + operation.id + "] UPDATED!");
            return true;
        } else {
            console.error("[updateRemoteOperation] Error while URL_UPDATE_OPERATION");
            return false;
        }
        */
    }



    /**
     * Removes a local operation and all its local assets.
     * @param {number} operation_id Operation ID.
     */    
    async function deleteLocalOperation(operation_id) {
        await offline_db.STORE_OPERATIONS.delete(operation_id);
        console.log("LOCAL OPERATION [", operation_id,"] REMOVED!");
        await deleteLocalOperationAssets(operation_id);
    }

    /**
     * Deletes a specific remote operation and its assets.
     * @param {number} operation_id Operation ID.
     * @returns True if success else false.
     */
    async function deleteRemoteOperation(operation_id) {
        let options = {
            method: 'POST',
            mode: 'same-origin',            
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'X-CSRFToken': CSRFToken,
            },
            body: JSON.stringify({operation_id: operation_id})
        }

        const operation_deleted = await (await (fetch(URL_DELETE_OPERATION, options)).catch(handleError)).json();
        if (operation_deleted.code && operation_deleted.code === 400) {
            console.error("[deleteRemoteOperation] Error while URL_DELETE_OPERATION");
            return false;
        }

        console.log("REMOTE OPERATION [" + operation_id + "] DELETED!");
        return true;        

        /*
        const operation_deleted = await fetch(URL_DELETE_OPERATION, options);
        if (operation_deleted.ok) {
            console.log("REMOTE OPERATION [" + operation_id + "] DELETED!");
            return true;
        } else {
            console.error("[deleteRemoteOperation] Error while URL_DELETE_OPERATION");
            return false;
        } 
        */       
    }

    /**
     * Deletes a specific operation and its assets, both locally and remotelly.
     * (Django automatically deletes the associated remote assets)
     * @param {number} operation_id Operation ID.
     */
    async function deleteOperation(operation_id) {
        const delete_local = await deleteRemoteOperation(operation_id);
        if (delete_local) {
            await deleteLocalOperation(operation_id);
        }    
    }


    /**
     * Flags an operation to be deleted: isPendingDeletion = 1.
     * => this operation should be removed as soon as possible.
     * @param {number} operation_id Operation ID.
     */
    async function flagLocalOperation2Deletion(operation_id) {
        await offline_db.STORE_OPERATIONS.where('id').equals(operation_id).modify({isPendingDeletion: 1});            
        console.log("LOCAL OPERATION [", operation_id,"] REMOVAL PENDING!");        
    }


    /**
     * Deletes all pending deletion operations (locally and remotelly), including their assets.
     */
    async function deleteLocalPendingDeletionOperations() {
        const operations = await offline_db.STORE_OPERATIONS.where('isPendingDeletion').equals(1).toArray();               
        await [...Array(operations.length)].reduce( (p, _, i) => 
        p.then(
            () => {
                return deleteOperation(operations[i].id);
            })
        , Promise.resolve()); 
    }

    /**
     * Checks if an operation exists in local storage.
     * @param {number} operation_id Operation's ID.
     * @returns True if operation exists in the local storage, False otherwise.
     */
     async function existsLocalOperation(operation_id) {
        const v = await offline_db.STORE_OPERATIONS.get(operation_id);
        return typeof v !== 'undefined';  
    }

    /**
     * Checks a specific operation exists locally and if so, compares its date with a given one.
     * Returns the action that should be executed.
     * @param {number} operation_id Remote operation ID.
     * @param {string} operation_last_update_date Operation last updated date: YYYY-MM-DD HH-MM-SS
     * @returns ACTION
     */
    async function checkLocalOperation(operation_id, operation_last_update_date) {
	    const local_operation = await offline_db.STORE_OPERATIONS.get(operation_id);        
        if (typeof local_operation !== 'undefined') {
            console.log("*-*-*-*-**-", operation_id, local_operation.date_updated, operation_last_update_date);
            if (local_operation.date_updated < operation_last_update_date) return ACTION.WRITE_LOCAL;
            if (local_operation.date_updated === operation_last_update_date) return ACTION.DO_NOTHING;
            if (local_operation.date_updated > operation_last_update_date || operation_id < 0) return ACTION.WRITE_REMOTE;
                
        } else {
            return ACTION.WRITE_LOCAL;
        }
    }            


    /**
     * Saves/replaces an operation and its data in local storage.
     * Considering operation_data = null => new operation (no data yet)
     * @param {number|string} operation_id Operation ID.
     * @param {string} name Operation's name.
     * @param {string} description Operation's description.
     * @param {number} form Form's ID
     * @param {string} form_name Form's name
     * @param {string} date_creation Date (mysql format) of the operation creation.
     * @param {string} status_name Current status of the operation (OPEN|CLOSED|COMPLETED)
     * @param {object} operation_data Data of the operation {id, operation, data}.
     * @param {number} isPendingDeletion Flag indication whether or not this operation is to be deleted as soon as possible.
     * @param {string} date_updated Date (mysql format) of the last operation.
     * @param {number} updated_by Id of the last person to update the operations.
     */

     async function saveOperationLocally(operation_id, name, description, form, 
        form_name, date_creation, status_name, operation_data,
        isPendingDeletion=0, date_updated=null, updated_by=null) {
        
        await offline_db.STORE_OPERATIONS.put({
            id: operation_id,
            name: name,
            description: description,
            date_creation: _mysqlTimeStamp2JS(date_creation),
            form: form,
            form_name: form_name,
            date_updated: _mysqlTimeStamp2JS(date_updated),
            updated_by: updated_by,
            status_name: status_name,
            isPendingDeletion: isPendingDeletion,
            operation_data: operation_data,
        });

        console.log("OPERATION [", operation_id,"] SAVED LOCALLY!");
    }

    /**
     * Synchronizes a local operation with remote and vice versa, depending on their dates and existence.
     * CASES 1,2,3,4
     * @param {object} remote_operation Remote operation ['id', 'name', 'description', 'form','form_name','date_creation','date_updated','author','author_name','updated_by','updated_by_name','status_name']
     * @param {number} _operation_id Remote operation ID.
     */
    async function synchronizeOperation(remote_operation=null, _operation_id=null) {
        if (!remote_operation && _operation_id) {            
            remote_operation = await (await (fetch(URL_GET_OPERATION + _operation_id)).catch(handleError)).json();
            if (remote_operation.code && remote_operation.code === 400) {
                console.error("[synchronizeOperation] Error while URL_GET_OPERATION");
                throw new Error();
            }
        }
        const operation_id = remote_operation.id;
        const check = await checkLocalOperation(operation_id, _mysqlTimeStamp2JS(remote_operation.date_updated));
        // CASES 2,4 - not in local or remote date > local date => remote more recent
        if (check === ACTION.WRITE_LOCAL) {
            // FECTH REMOTE OPERATION DATA
            const data_response = await fetch(URL_GET_OPERATION_DATA + operation_id)
            if (data_response.ok) {
                const data = await data_response.json();   // {id, operation, data}

                // FETCH REMOTE ASSETS
                const remote_assets_response = await fetch( URL_LIST_OPERATION_ASSETS + operation_id);
                if (remote_assets_response.ok) {

                    // SAVE OPERATION + DATA TO LOCAL
                    await saveOperationLocally(
                        remote_operation.id,
                        remote_operation.name, 
                        remote_operation.description,
                        remote_operation.form,
                        remote_operation.form_name,
                        remote_operation.date_creation,
                        remote_operation.status_name,
                        data,
                        0,
                        remote_operation.date_updated,
                        remote_operation.updated_by
                    );

                    const remote_assets = await remote_assets_response.json();
                    // {id, operation, name, asset, type, type_name, date, is_annex}
                    if (remote_assets.length > 0) {
                        await synchronizeOperationAssets(operation_id, remote_assets, ACTION.WRITE_LOCAL);
                    }

                    console.log("REMOTE OPERATION [" + operation_id + "] AND ALL ITS ASSETS SYNCHRONIZED WITH LOCAL!");
                } else {
                    console.error("[synchronizeOperation] Error while fetching URL_LIST_OPERATION_ASSETS");
                }
            }
        }
        // CASE 3: remote date < local date => local more recent
        else if (check === ACTION.WRITE_REMOTE) {
            // FETCH REMOTE ASSETS
            const remote_assets_response = await fetch( URL_LIST_OPERATION_ASSETS + operation_id);
            if (remote_assets_response.ok) {
                const remote_assets = await remote_assets_response.json();
                const local_operation = await offline_db.STORE_OPERATIONS.get(operation_id);
                await updateRemoteOperation(local_operation);

                // {id, operation, name, asset, type, type_name, date, is_annex}
                if (remote_assets.length > 0) {
                    await synchronizeOperationAssets(operation_id, remote_assets, ACTION.WRITE_REMOTE);
                }                
            } else {
                    console.error("[synchronizeOperation] Error while fetching URL_LIST_OPERATION_ASSETS");
            }
            
        }
    }

    /**
     * Saves a local operation remotely.
     * @param {object} local_operation Local operation {id, name, description, form, form_name, data_creation, status_name, operation_data, isPendingDeletion, date_updated, updated_by}
     * @returns Remote operation if successful or null if error.
     */
    async function saveLocalOperation2Remote(local_operation) {

        let options = {
            method: 'POST',
            mode: 'same-origin',            
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'X-CSRFToken': CSRFToken,
            },
            body: JSON.stringify({
                form: local_operation.form,
                name: local_operation.name,
                description: local_operation.description,
                date_creation: local_operation.date_creation,
                date_updated: local_operation.date_updated,
                operation_data: local_operation.operation_data,
            })
        }
        const operation = await (await (fetch(URL_NEW_OPERATION_COMPLETE, options)).catch(handleError)).json();
        if (operation.code && operation.code === 400) {
            console.error("[saveLocalOperation2Remote] Error while URL_SAVE_OPERATION");
            return null;
        }
        console.log("LOCAL OPERATION [" + local_operation.id + " -> " + operation.id + "] SAVED REMOTELY!");
        return operation;         
        /*
        const operation_response = await fetch(URL_NEW_OPERATION_COMPLETE, options);
        if (operation_response.ok) {
            const operation = await operation_response.json()
            console.log("LOCAL OPERATION [" + local_operation.id + " -> " + operation.id + "] SAVED REMOTELY!");
            return operation;
        } else {
            console.error("[saveLocalOperation2Remote] Error while URL_SAVE_OPERATION");
            //throw new Error();
            return null;
        } 
        */ 
       
    }



    /**
     * Synchronizes a local operation with remote, considering that all this op was created while offline, 
     * which means a random negative int as ID and no reference in remote.
     * Case 5: offline => operation totally created locally => all assets are local => all have ids < 0.
     * Save them remotelly and update their local ids ... KEEP CREATION AND UPDATE DATE.
     * @param {object} local_operation Local operation {id, name, description, form, form_name, data_creation, status_name, operation_data, isPendingDeletion, date_updated, updated_by}
     * @param {number} operation_id Local operation ID.
     * @returns The remote operation if successful or null if error.
     */
     async function synchronizeFullLocalOperation(local_operation=null, operation_id=null) {
        if (operation_id && !local_operation) {
            local_operation = await offline_db.STORE_OPERATIONS.get(operation_id);
        }

        // SAVE LOCAL OP REMOTELY
        const operation = await saveLocalOperation2Remote(local_operation);
        
        if (operation) {
            const operation_id = parseInt(operation.id);

            // UPDATE LOCAL ID
            await offline_db.STORE_OPERATIONS.where('id').equals(local_operation.id).modify({id: operation_id});
            console.log("LOCAL OPERATION ID [" + local_operation.id + "] CHANGED TO [" + operation_id + "]!");

           
            // UPDATE LOCAL ASSETS OPERATION ID
            if (local_operation.id) {
                await offline_db.STORE_OPERATIONS_ASSETS.where('operation_id').equals(local_operation.id).modify({operation_id: operation_id});
            }

            // SAVE LOCAL ASSETS TO REMOTE
            const local_assets = await offline_db.STORE_OPERATIONS_ASSETS.where('operation_id').equals(operation_id).toArray();
            await [...Array(local_assets.length)].reduce( (p, _, i) => 
            p.then(
                () => {
                    return saveLocalOperationAsset2Remote(local_assets[i], operation_id);
                })
            , Promise.resolve() );
    
            // USE REMOTE TO CLEAN ALL UNUSED ASSETS
            await cleanLocalWithRemote(operation_id, true);


            return operation;
        }
        return null;
    }

    /**
     * Deletes all local operations with id > 0 that exists locally but not remotely,
     * perhaps these operations were deleted remotely outside the app.
     * It also removes all their assets.
     * 
     * @param {array of objects} remote_operations List of remote operations.
     */
    async function clearLocalOperations(remote_operations) {
        const local_operations = await offline_db.STORE_OPERATIONS.where('id').above(0).toArray();
        const to_delete = exclude(local_operations,remote_operations, 'id');

        await [...Array(to_delete.length)].reduce( (p, _, i) => 
        p.then(
            () => {
                return deleteLocalOperation(to_delete[i].id);  
            })
        , Promise.resolve() );
  
    }

 
    /**
     * Synchronizes all fully local operations.
     * CASE 5 - OPERATION CREATED WHILE OFFLINE => ALL LOCAL
     */
    async function syncFullLocalOperations() {        
        const full_local_operation = await offline_db.STORE_OPERATIONS.where('id').below(0).toArray();
        await [...Array(full_local_operation.length)].reduce( (p, _, i) => 
            p.then(
                () => {
                    return synchronizeFullLocalOperation(full_local_operation[i]);
                })
        , Promise.resolve() );        
    }

    /**
     * Synchronizes local operations with remote and vice versa, depending on their dates and existence.
     * @param {array of objects} remote_operations List of remote operations.
     * @returns True if successfull, false otherwise.
     */
    async function syncOperations(remote_operations = null) {

        // CASES 1,2,3,4 - COMPARE LOCAL WITH REMOTE
        if (!remote_operations) {
            const _remote_operations = await (await (fetch(URL_LIST_NON_COMPLETED_OPERATIONS)).catch(handleError)).json();
            if (_remote_operations.code && _remote_operations.code === 400) {
                console.error("[syncOperations] Error while fetching URL_LIST_NON_COMPLETED_OPERATIONS");
                return false;
            }

            // remove local orphan operations
            await clearLocalOperations(_remote_operations);

            await [...Array(_remote_operations.length)].reduce( (p, _, i) => 
            p.then(
                () => {
                    return synchronizeOperation(_remote_operations[i]);
                })
            , Promise.resolve() );
            return true;

        } else {

            // remove local orphan operations
            await clearLocalOperations(remote_operations);

            await [...Array(remote_operations.length)].reduce( (p, _, i) => 
            p.then(
                () => {
                    return synchronizeOperation(remote_operations[i]);
                })
            , Promise.resolve() );

            return true;

        }

    }


    /**
     * Returns all non pending deletion operations.
     * @param {boolean} show_closed If true returns OPEN+CLOSE ops else only OPEN ops.
     * @returns Array of objects, rpesenting the list of operations.
     */
     async function getLocalOperationsList(show_closed=false) {
        if (show_closed)
            return await offline_db.STORE_OPERATIONS.where('[status_name+isPendingDeletion]').notEqual(['COMPLETED',0]).toArray();
        else
            return await offline_db.STORE_OPERATIONS.where('[status_name+isPendingDeletion]').equals(['OPEN',0]).toArray();        
    }


    /**
     * Gets a specific local operation.
     * @param {number} operation_id Operation ID.
     * @returns Returns a local operation {id, name, description, form, form_name, data_creation, status_name, operation_data, isPendingDeletion, date_updated, updated_by}.
     */
    async function getLocalOperation(operation_id) {
        const operation = await offline_db.STORE_OPERATIONS.get(operation_id);
        return operation;
    }

    /**
     * Saves/updates local operation data.
     * @param {number} operation_id Operation ID.
     * @param {string} date Current date.
     * @param {object} data Operation Data.
     */
     async function saveLocalOperationData(operation_id, date, data) {
        await offline_db.STORE_OPERATIONS.where('id').equals(operation_id).modify({
            operation_data: data,
            date_updated: date
        });
    }

    /**
     * 
     * @param {number} operation_id 
     * @param {object} operation_data {'id', 'operation', 'data'}
     */
    async function updateLocalOperationData(operation_id, operation_data) {               
        await offline_db.STORE_OPERATIONS.where('id').equals(operation_id).modify({operation_data: operation_data});
        console.log("LOCAL OPERATION DATA [" + operation_id + "] UPDATED!");
    }




    // ----------------------------------------------
    // ------------------ ****** --------------------
    // ----------------------------------------------

    /**
     * Synchronizes local and remote operations and their assets.
     * Two-sides synchronization.
     * Cases:
     * N |   R     |    L     | ACTION      |    ASSETS STATUS
     * 1 |   OP        OP         -         |   possible overlap
     * 2 |   OP+       OP         R->L      |   possible overlap
     * 3 |   OP        OP+        L->R      |   possible overlap
     * 4 |   OP        -          R->L      |   no overlap (as long sync was garanteed by the other processes)
     * 5 |   -         OP         L->R->L   |   no overlap (as long sync was garanteed by the other processes)
     * 
     * @param {array of objects} remote_operations List of remote operations.
     */
    async function fullOperationsSynchronization(remote_operations = null) {
        // delete all local ops marked for deletion, and their assets 
        await deleteLocalPendingDeletionOperations();
        // cases 5
        await syncFullLocalOperations();
        // cases 1,2,3,4
        return await syncOperations(remote_operations);
    }



    /**
     * Fetches all IN USE forms and synchronizes local forms and their assets.
     * One side synchronization.
     */
     async function fullFormsSynchronization() {
        const response = await fetch(URL_LIST_IN_USE_FORMS);
        if (response.ok) {
            const remote_forms = await response.json();
            await syncForms(remote_forms);
        } else {
            console.error("[synchronizeForms] Error while fetching URL_LIST_IN_USE_FORMS");
        }
    }

    /**
     * Creates an object with all the data required by OpFormData.js to 
     * determine all the required validations.
     * @param {number} operation_id Operation ID.
     * @returns Object {form: form, data: operation_data}
     */
     async function getFormAndOperationData(operation_id) {
        const _data = {form: null, data: null}
        //const operation = await offline_db.STORE_OPERATIONS.where('id').equals(operation_id).first();
        const operation = await getLocalOperation(operation_id);
        if (operation && operation !== 'undefined') {
            //const form = await offline_db.STORE_FORMS.where('id').equals(operation.form).first();
            const form = await getLocalForm(operation.form);
            _data.form = form.form;
            _data.data = operation.operation_data;
        }
        return _data;
    }

    // ----------------------------------------------
    // ------------------ PUBLIC --------------------
    // ----------------------------------------------


    return {
        init: setLocalDatabase,                         // init database
        setToken: setToken,

        fullOperationsSynchronization: fullOperationsSynchronization,   // full sync and clean ups
        fullFormsSynchronization: fullFormsSynchronization,             // full sync and clean ups
        getFormAndOperationData: getFormAndOperationData,

        // FORMS
        getListOfAllValidLocalForms: getListOfAllValidLocalForms,
        getLocalForm: getLocalForm,
        syncForms:syncForms,

        // FORMS ASSETS
        getLocalFormAsset: getLocalFormAsset,
               

        // OPERATIONS
        deleteLocalOperation: deleteLocalOperation,
        flagLocalOperation2Deletion: flagLocalOperation2Deletion,
        getLocalOperationsList: getLocalOperationsList,
        getLocalOperation: getLocalOperation,
        saveLocalOperationData: saveLocalOperationData,
        saveOperationLocally: saveOperationLocally,
        fetchRemoteOperationAssetsAndSave: fetchRemoteOperationAssetsAndSave,
        updateLocalOperationData: updateLocalOperationData,
        syncOperations: syncOperations,
        deleteLocalPendingDeletionOperations:deleteLocalPendingDeletionOperations,
        synchronizeFullLocalOperation: synchronizeFullLocalOperation,
        synchronizeOperation: synchronizeOperation,
        
        // OPERATIONS ASSETS
        getLocalOperationAsset: getLocalOperationAsset,
        saveLocalOperationAsset: saveLocalOperationAsset,
        getLocalOperationAnnexes: getLocalOperationAnnexes,
        saveLocalOperationAnnexes: saveLocalOperationAnnexes,
        deleteLocalOperationAssets: deleteLocalOperationAssets,
        deleteLocalOperationAssetsBulk: deleteLocalOperationAssetsBulk,
        existLocalOperationAssetWithFullpath: existLocalOperationAssetWithFullpath,
        getLocalOperationFromAsset: getLocalOperationFromAsset,
    };

}; 


