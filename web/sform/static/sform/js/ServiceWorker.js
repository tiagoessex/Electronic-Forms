
importScripts('/static/sform/js/offline/utils.js');
importScripts('/static/sform/js/offline/offlinedb.js');


const broadcast = new BroadcastChannel('sync-channel');
//let online = true;

// ----------------------------
// OFFLINE DATABASE OPERATIONS
// ----------------------------

const offline = offlineDatabase();
offline.init();                 // set offline database and stores


broadcast.addEventListener("message", async function(event) {
  // sync the databases
  //console.error(event.data);
  if (event.data && event.data === 'sync') {
    try {
      broadcast.postMessage('sync_started');
      //await delay(3000);
      console.log("*********************** MANUAL SYNC STARTED ***********************");
      console.log("*********************** MANUAL SYNC: SYNCHING OPERATIONS ... ***********************");
      await offline.fullOperationsSynchronization();
      console.log("*********************** MANUAL SYNC: SYNCHING OPERATIONS ... COMPLETED ***********************");
      console.log("*********************** MANUAL SYNC: SYNCHING FORMS ... ***********************");
      await offline.fullFormsSynchronization();
      console.log("*********************** MANUAL SYNC: SYNCHING FORMS ... COMPLETED***********************");;
      console.log("*********************** MANUAL SYNC DONE ***********************");
      broadcast.postMessage('sync_finished');
    } catch {
      broadcast.postMessage('sync_finished');
    }
   
  } 
  // get and set the CSRF token for the POST calls
  else if (event.data && event.data.msg && event.data.msg === 'token') { 
    offline.setToken(event.data.value);
    console.log("*** CSRF TOKEN SET ***");
  }
  /*
  else if (event.data.msg === 'action' && event.data.value === 'sync') { 
    offline.setToken(event.data.value);
    console.log("*** CSRF TOKEN SET ***");
  }
  */

});


// ----------------------------------
// SERVICE WORKER
// ---------------------------------



var staticCacheName = "djangopwa-v" + new Date().getTime();

// no .map files
var filesToCache = [
    'sform/',
    '/static/sform/js/app.js',
    'https://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css',
    'https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700',
    'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/css/flag-icon.min.css',
    '/static/admin-lte/plugins/fontawesome-free/css/all.min.css',
    '/static/admin-lte/dist/css/adminlte.min.css',
    '/static/admin-lte/plugins/icheck-bootstrap/icheck-bootstrap.min.css',
    '/static/css/adminlte.css',
    '/static/plugins/sheets/sheets-of-paper-a4.css',
    '/static/sform/css/sform.css',
    '/static/sform/css/elements.css',
    '/static/css/spinners.css',
    '/static/admin-lte/plugins/select2-bootstrap4-theme/select2-bootstrap4.min.css',
    '/static/plugins/leaflet-1.7.1/leaflet.css',
    '/static/css/fileupload.css',
    '/static/plugins/jstree-3.3.11-0/themes/default/style.min.css',
    '/static/admin-lte/plugins/jquery/jquery.min.js',
    '/static/admin-lte/plugins/jquery-ui/jquery-ui.min.js',
    '/static/admin-lte/dist/js/demo.js',
    '/static/admin-lte/plugins/bootstrap/js/bootstrap.bundle.min.js',
    '/static/plugins/uuid/uuidv4.min.js',
    '/static/admin-lte/dist/js/adminlte.min.js',
    '/static/plugins/signals/signals.min.js',
    '/static/plugins/fileSaver-2.0.4/FileSaver.min.js',
    '/static/plugins/leaflet-1.7.1/leaflet.js',
    '/static/plugins/leaflet-image-0.0.4/leaflet-image.js',
    '/static/plugins/jszip-3.2.0/jszip.min.js',
    '/static/plugins/quaggaJS-0.12.1/quagga.min.js',
    '/static/plugins/html2canvas-1.2.1/html2canvas.min.js',
    '/static/plugins/pdf-lib-1.16.0/pdf-lib.min.js',    
    '/static/plugins/jstree-3.3.11-0/jstree.min.js',
    '/static/plugins/PapaParse-5.0.2/papaparse.min.js',
    

    '/static/admin-lte/plugins/fontawesome-free/webfonts/fa-brands-400.ttf',
    '/static/admin-lte/plugins/fontawesome-free/webfonts/fa-brands-400.woff',
    '/static/admin-lte/plugins/fontawesome-free/webfonts/fa-brands-400.woff2',

    '/static/images/icons/android-chrome-192x192.png',
    '/static/images/icons/android-chrome-384x384.png',
    '/static/images/icons/apple-touch-icon.png',
    '/static/images/icons/favicon-32x32.png',
    '/static/images/icons/favicon-16x16.png',

    '/static/images/status/green.png',
    '/static/images/status/orange.png',
    '/static/images/status/red.png',
    
    /*
    '/static/admin-lte/dist/css/adminlte.min.css.map',
    '/static/admin-lte/plugins/bootstrap/js/bootstrap.bundle.min.js.map',
    '/static/admin-lte/dist/js/adminlte.min.js.map',
    '/static/plugins/leaflet-1.7.1/leaflet.js.map',
    '/static/plugins/fileSaver-2.0.4/FileSaver.min.js.map',
    '/static/plugins/pdf-lib-1.16.0/pdf-lib.min.js.map',
    */

    '/static/admin-lte/dist/img/avatar5.png',
    '/static/images/logos/logo_project.png',
    'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/pt.svg',
    'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/gb.svg',
    'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/hr.svg',

    '/static/designer/images/_gps_.png',
    '/static/designer/images/_photo_.png',
    '/static/designer/images/_signature_.png',
    '/static/designer/images/_drawing_.png',
    '/static/designer/images/_image_.png',
    '/static/designer/images/_barcode_.png',
    '/static/designer/images/_missing_.png',

    '/media/files/foodex_attributes_EN.csv',
    '/media/files/foodex_terms_EN.csv'

    //'/static/sform/js/app.js',

    //'offline/',    
];





// Cache on install
self.addEventListener("install", event => {
  this.skipWaiting();
  event.waitUntil(
      caches.open(staticCacheName)          
          .then(cache => {
              console.log("INSTALL SERVICE WORKER");
              return cache.addAll(filesToCache);
          })
  )
});

// Clear cache on activate
self.addEventListener('activate', event => {
  event.waitUntil(
      caches.keys().then(cacheNames => {
        console.log("ACTIVATE SERVICE WORKER");        
        return Promise.all(
              cacheNames
                  .filter(cacheName => (cacheName.startsWith("djangopwa-")))
                  .filter(cacheName => (cacheName !== staticCacheName))
                  .map(cacheName => caches.delete(cacheName))
          );
      })
  );
});


// Serve from Cache
self.addEventListener('fetch', event => {
  // Prevent the default, and handle the request ourselves.
  event.respondWith(async function() {

    // Try to get the response from a cache.
    const cachedResponse = await caches.match(event.request);
    if (cachedResponse) {
      return cachedResponse;
    }
    const cloned = event.request.clone();

    // --- ONLINE ---
    try {

      //const cloned = event.request.clone();

      // DON'T WAIT FOR FETCH ERROR TO KNOW WHAT TO DO
      // ATT: this check doesn't work all the time
      if (!navigator.onLine) {
        throw new Error();
      }

      // LIST OF FORMS
      // if network and user fetching list of IN USE forms
      // then synchronize remote with local
      if (event.request.url.includes(URL_LIST_IN_USE_FORMS)){
        console.log("+++ ONLINE > ", URL_LIST_IN_USE_FORMS);
        console.log("+++ LIST OF FORMS"); 

        const response = await fetch(event.request);
        const forms = await response.clone().json();
        await offline.syncForms(forms);
        
        return response;
      } 
      
      // LIST ALL NON COMPLETED OPERATIONS (OPEN/CLOSED)
      // fully sync operations - if all is already synced, then the time complexity
      // should be minimum: O(n) over indexed local storage
      else if (event.request.url.includes(URL_LIST_NON_COMPLETED_OPERATIONS)){
        console.log("+++ ONLINE > ", URL_LIST_NON_COMPLETED_OPERATIONS);
        console.log("+++ SYNCING LOCAL NON COMPLETED OPERATIONS WITH REMOTE");
        // no passing a list of remote operations, because after the sync (cases 5)
        // this list may have changed, so fetch it only after sync
        const result = await offline.fullOperationsSynchronization();
        //if (!result) throw new Error("Go to offline!")
        // now that remote has being updated, we can fetch the correct list of
        // remote operations        
        const response = await fetch(event.request);
        const operations = await response.clone().json();
        return response;
      }
      
      // LIST ALL OPERATIONS (OPEN)
      // if network and user fetching (resume screen) then
      // sync the remote with local
      // fully sync operations - if all is already synced, then the time complexity
      // should be minimum: O(n) over indexed local storage
      else if (event.request.url.includes(URL_LIST_OPERATIONS)){
        console.log("+++ ONLINE > ", URL_LIST_OPERATIONS);
        console.log("+++ SYNCING LOCAL OPEN OPERATIONS");
        // no passing a list of remote operations, because after the sync (cases 5)
        // this list may have changed, so fetch it only after sync
        const result = await offline.fullOperationsSynchronization();
        //if (!result) throw new Error("Go to offline!")
        // now that remote has being updated, we can fetch the correct list of
        // remote operations
        const response = await fetch(event.request);
        const operations = await response.clone().json();        
        return response;        
      }
 
      // UPDATE OPERATION
      // after remote update, update local by total replacing it
      // fetch any remote asset still not in local
      // OPERATION_ID < 0 => ALL OPERATION AND ASSETS ONLY EXISTS LOCALLY
      else if (event.request.url.includes(URL_UPDATE_OPERATION)){
        console.log("+++ ONLINE > ", URL_UPDATE_OPERATION);
        console.log("+++ UPDATE LOCAL OPERATION");

        //{operation_id, data}
        const op = await event.request.clone().json();
        //console.warn(op);
        if (op.operation_id > 0) {
          const response = await fetch(event.request);
          const operation = await response.clone().json();
          // operation.operation_description: ['id', 'name', 'description', 'form','form_name','date_creation','date_updated','author','author_name','updated_by','updated_by_name','status_name']
          // operation.operation_data: ['id', 'operation', 'data']       

          // replace the entire local record
          await offline.saveOperationLocally(
            operation.operation_description.id,           // operation_id
            operation.operation_description.name,
            operation.operation_description.description, 
            operation.operation_description.form_id,         // form_id
            operation.operation_description.form_name, 
            operation.operation_description.date_creation, 
            operation.operation_description.status_name, 
            operation.operation_data.data,
            0, // isPendingDeletion
            operation.operation_description.date_updated, 
            operation.operation_description.updated_by
          );

          // since it's online fetch all remote assets and save them locally ... those that don't exist yet
          // or are out of date
          //await offline.fetchRemoteOperationAssetsAndSave(operation.operation_description.id);
          await offline.synchronizeOperation(operation.operation_description);

          return response;
        } else {
          // operation_id < 0

          // save locally first
          await offline.saveLocalOperationData(
            op.operation_id, 
            _mysqlTimeStamp2JS(new Date().toISOString()),
            op.data
          ); 

          // now sync full local operation with remote => new id (ID < 0 -> ID > 0)
          // if any fetch of this func is throwed => it will go offline --- this will happen if
          // online but offline in relation to localhost, so it should only happen during dev
          //{'id', 'name', 'description', 'form','form_name','date_creation','date_updated','author','author_name','updated_by','updated_by_name','status_name'}
          const saved_operation = await offline.synchronizeFullLocalOperation(null, op.operation_id);
          //console.warn(saved_operation);
          if (!saved_operation) throw new Error("Go to offline!");

          // fake response
          const fakeResponse = new Response(JSON.stringify({
            'id': saved_operation.id,           // operation_id
            'name':saved_operation.name,
            'description':saved_operation.description, 
            'form':saved_operation.form,     // form_id
            'form_name':saved_operation.name,
            'date_creation':saved_operation.date_creation,
            'date_updated':saved_operation.date_updated,
            'author':saved_operation.author,
            'author_name':saved_operation.author_name,
            'updated_by':saved_operation.updated_by,
            'updated_by_name':saved_operation.updated_by_name,
            'status_name':saved_operation.status_name
          }));
          // ***************************************************************************************
          // *** IN CONSUMING THE RESPONSE MAKE SURE TO UPDATE THE OPERATION ID WITH THE NEW ONE ***
          // ***************************************************************************************
          return fakeResponse;
        }
      }

      // NEW OPERATION
      // save local
      else if (event.request.url.includes(URL_NEW_OPERATION)){
        console.log("+++ ONLINE > ", URL_NEW_OPERATION);
        console.log("+++ ADD NEW OPERATION"); 
        const response = await fetch(event.request);
        const operation = await response.clone().json();
        // operation: {'id', 'name', 'description', 'form','form_name','date_creation','date_updated','author','author_name','updated_by','updated_by_name','status_name'}

        await offline.saveOperationLocally(
          operation.id,             // operation_id
          operation.name, 
          operation.description, 
          operation.form_id,           // form_id
          operation.form_name, 
          operation.date_creation, 
          operation.status_name, 
          null,                     // operation_data
          0,                        // isPendingDeletion
          operation.date_updated, 
          operation.updated_by
        );

        return response;
      }
      
      // DELETE OPERATION
      // remove local
      if (event.request.url.includes(URL_DELETE_OPERATION)){
        console.log("+++ ONLINE > ", URL_DELETE_OPERATION);
        console.log("+++ DELETE OPERATION"); 
        const response = await fetch(event.request);
        const operation = await response.clone().json();
        await offline.deleteLocalOperation(operation.id);
        return response;
      }

      // GET OPERATION ASSET
      // if operation_id still < 0 => get local
      // this may happen when offline: new operation but then
      // when asset upload already online
      else if (event.request.url.includes(PATH_OPERATION_ASSET)){
        console.log("+++ ONLINE > ", PATH_OPERATION_ASSET);
        console.log("+++ GET OPERATION ASSET");         
        const id = event.request.url.substring(event.request.url.indexOf('/operation_assets/') + 18, event.request.url.lastIndexOf('/'));
        if (parseInt(id) < 0) {
          throw new Error();
        }
      }
      
      // UPLOAD OPERATION ASSET
      // upload to local
      else if (event.request.url.includes(URL_OPERATION_UPLOAD_ASSET)){
        console.log("+++ ONLINE > ", URL_OPERATION_UPLOAD_ASSET);
        console.log("+++ UPLOAD OPERATION ASSET"); 


        //const op = await event.request.clone().json();
        /*
        const data = {};        
        const _data = await event.request.clone().formData();        
        for (const [key, value] of _data.entries()) {
          data[key] = value;
        }*/
        let data = {};
        try {
          // signature / draw
          data = await event.request.clone().json();
        } catch (e) {
          const _data = await event.request.clone().formData();        
          for (const [key, value] of _data.entries()) {
            data[key] = value;
          }
        }

        //data: {asset-file: FILE..., id, name, type} - id: operation ID
        
        // operation id > 0
        if (data.id > 0) {
          const response = await fetch(event.request);
          const op_asset = await response.clone().json();
          // op_asset: {'id', 'name', 'asset', 'type','type_name', 'is_annex', 'date','operation'}
          await offline.saveLocalOperationAsset(
            op_asset.id,              // id
            parseInt(op_asset.operation),       // operation_id
            op_asset.name,            // name
            op_asset.asset,           // fullpath - ex: /operation_assets/123/file.png
            op_asset.date,            // date
            op_asset.type,            // type
            op_asset.type_name,       // type_name
            op_asset.is_annex,        // is_annex
          );
          return response;

        } else {
          // operation_id < 0
          // upload assets => save operation => save this asset locally and then the save (update) 
          // op will sync the operation
          throw new Error();
        }

      }

      // LIST OPERATION ANNEXES
      else if (event.request.url.includes(URL_LIST_OPERATION_ANNEXES)){
        console.log("+++ ONLINE > ", URL_LIST_OPERATION_ANNEXES);
        console.log("+++ LIST OPERATION ANNEXES");

        const index = event.request.url.indexOf('list_operation_annexes/') + 23;
        const operation_id = parseInt(event.request.url.substring(index, event.request.url.length-1));

        // if operation still fully local
        // then sync with remote
        if (operation_id < 0) {
          const operation = await offline.synchronizeFullLocalOperation(null, operation_id);
          //if (!operation) throw new Error();     // only throws if locahost online (dev)
          await offline.synchronizeOperation(null, operation.id); 
          //throw new Error("Go to offline!");
          const annexes = await offline.getLocalOperationAnnexes(parseInt(operation.id));
          const fakeResponse = new Response(JSON.stringify(annexes));
          return fakeResponse;
        }

        // sync operation
        await offline.synchronizeOperation(null, operation_id); 

        // fetch the results        
        const response = await fetch(event.request);
        const annexes = await response.clone().json();
        await offline.saveLocalOperationAnnexes(operation_id, annexes);
        return response;
      }

      // GET OPERATION DATA
      else if (event.request.url.includes(URL_GET_OPERATION_DATA)){
        console.log("+++ ONLINE > ", URL_GET_OPERATION_DATA);
        console.log("+++ GET OPERATION DATA");

        const index = event.request.url.indexOf('get_operation_data/') + 19;
        const operation_id = parseInt(event.request.url.substring(index, event.request.url.length-1));

        // operation still fully local
        if (operation_id < 0) {
          const operation = await offline.synchronizeFullLocalOperation(null, operation_id);
          //if (!operation) throw new Error();     // only throws if locahost online (dev)
          await offline.synchronizeOperation(null, operation.id); 
          //throw new Error("Go to offline!");

          const operation_data = await offline.getLocalOperation(operation.id);
          // send operation data and the new operation id
          // ***************************************************************************************
          // *** IN CONSUMING THE RESPONSE MAKE SURE TO UPDATE THE OPERATION ID WITH THE NEW ONE ***
          // ***************************************************************************************
          const fakeResponse = new Response(JSON.stringify({data: operation_data.operation_data, operation_id: operation_data.id}));
          return fakeResponse;           
        }

        /*
        await offline.updateLocalOperationData(operation_id, operation_data);
        await offline.fetchRemoteOperationAssetsAndSave(operation_id);
        */

        const response = await fetch(event.request);
        const operation_data = await response.clone().json();
        await offline.updateLocalOperationData(operation_id, operation_data);

        return response;
      }

      // DELETE ASSETS
      // ONLY CALLED WHEN REMOVING ANNEXES
      else if (event.request.url.includes(URL_REMOVE_OPERATION_ASSET)){
        console.log("+++ ONLINE > ", URL_REMOVE_OPERATION_ASSET);
        console.log("+++ DELETE ASSET");

        const op = await cloned.json();
        // op: {id:[ids]}

        // has negative numbers => operation is not sync
        if (getNegativeNumbers(op.id).length > 0) {
          const operation_id = offline.getLocalOperationFromAsset(op.id[0]);
          await offline.synchronizeOperation(null, operation_id); 
        }

        //const response = await fetch(event.request);
        const response = await fetch(event.request.clone());
        const assets = await response.clone().json();

        // deletes a group of assets
        if (assets.hasOwnProperty('id')) {
          await offline.deleteLocalOperationAssetsBulk(assets.id);
        } else {
          console.error("URL_REMOVE_OPERATION_ASSET: USING NAME AND NOT ID!");
        }

        return response;
      }


      // no match in the cache, then use the network normally.
      const resp = await fetch(event.request); 
      return resp;

    } catch (e) {
      console.error(e, event.request.url);
      // --- OFFLINE ---

      //online = false;

      
      // LIST OF FORMS
      if (event.request.url.includes(URL_LIST_IN_USE_FORMS)){
        console.log("--- OFFLINE > ", URL_LIST_IN_USE_FORMS);
        const forms = await offline.getListOfAllValidLocalForms();
        const fakeResponse = new Response(JSON.stringify(forms));
        return fakeResponse;//.clone();  // clone????      
      } 
      
      // GET A FORM ASSET
      else if (event.request.url.includes(PATH_FORM_ASSET)){
        console.log("--- OFFLINE > ", event.request.url);
        // cloned.url = http://127.0.0.1:8000/media/form_assets/3034/grdi2.jpg
        const url = event.request.url.substring(event.request.url.indexOf('/media/'));
        //const [blob,name] = await offline.getLocalFormAsset(url);
        const file = await offline.getLocalFormAsset(url);
        const fakeResponse = new Response(body=file);
        return fakeResponse;         
      }
      
      // LIST OF NON-COMPLETED (OPEN/CLOSED) OPERATIONS
      else if (event.request.url.includes(URL_LIST_NON_COMPLETED_OPERATIONS)){
        console.log("--- OFFLINE > ", event.request.url);
        const operations = await offline.getLocalOperationsList(true)
        const fakeResponse = new Response(JSON.stringify(operations));
        return fakeResponse;         
      }
      
      // LIST OF OPEN OPERATIONS
      else if (event.request.url.includes(URL_LIST_OPERATIONS)){
        console.log("--- OFFLINE > ", event.request.url);
        const operations = await offline.getLocalOperationsList()
        const fakeResponse = new Response(JSON.stringify(operations));
        return fakeResponse;         
      } 

      // GET OPERATION DATA + FORM DATA [FOR VALIDATIONS through OpFormData.js]
      else if (event.request.url.includes(URL_GET_OPERATION_FORM_DATA)){
        console.log("--- OFFLINE > ", event.request.url);
        const operation_id = event.request.url.substring(event.request.url.indexOf('_data/') + 6,event.request.url.lastIndexOf('/'))
        const operations = await offline.getFormAndOperationData(parseInt(operation_id))
        const fakeResponse = new Response(JSON.stringify(operations));
        return fakeResponse;        
      }
 
      // GET FULL TABLE
      else if (event.request.url.includes(URL_GET_TABLE)){
        console.log("--- OFFLINE > ", URL_GET_TABLE);
        // get table asset fullpath
        const url = PATH_FORM_ASSET + event.request.url.substring(event.request.url.indexOf('/get_table/') + 11);
        // get asset file
        const file = await offline.getLocalFormAsset(url);
        // parse file to array of rows
        const rows = await _file_2_json(file);
        const fakeResponse = new Response(JSON.stringify(rows));
        return fakeResponse;    
      }
      
      // GET FORM
      else if (event.request.url.includes(URL_GET_FORM)){
        console.log("--- OFFLINE > ", URL_GET_FORM);
        //http://127.0.0.1:8000/designer/api/get_form/3035/ 
        const index = event.request.url.indexOf('get_form/') + 9;
        const form_id = event.request.url.substring(index, event.request.url.length-1);        
        const form = await offline.getLocalForm(parseInt(form_id));
        const fakeResponse = new Response(JSON.stringify(form));
        return fakeResponse;  
      }
      // GET OPERATION DATA
      else if (event.request.url.includes(URL_GET_OPERATION_DATA)){
        console.log("--- OFFLINE > ", URL_GET_OPERATION_DATA);
        // http://127.0.0.1:8000/operations/api/get_operation_data/161/ 
        const index = event.request.url.indexOf('get_operation_data/') + 19;
        const operation_id = parseInt(event.request.url.substring(index, event.request.url.length-1));
        const operation = await offline.getLocalOperation(operation_id);
        const fakeResponse = new Response(JSON.stringify({data: operation.operation_data}));
        return fakeResponse;          
      }
      // OPERATION ASSETS
      else if (event.request.url.includes(PATH_OPERATION_ASSET)){
        console.log("--- OFFLINE > ", event.request.url);
        // cloned.url = http://127.0.0.1:8000/media/form_assets/3034/grdi2.jpg
        const url = event.request.url.substring(event.request.url.indexOf('/media/'));
        //const [blob,name] = await offline.getLocalFormAsset(url);
        const file = await offline.getLocalOperationAsset(url);
        const fakeResponse = new Response(body=file);
        return fakeResponse;         
      }
      // UPDATE OPERATION      
      else if (event.request.url.includes(URL_UPDATE_OPERATION)){
        console.log("--- OFFLINE > ", URL_UPDATE_OPERATION);

        const op = await cloned.json();
        // op: ['operation_id', 'data']
        // change (operation_data, date_updated)
        await offline.saveLocalOperationData(
          op.operation_id, 
          _mysqlTimeStamp2JS(new Date().toISOString()),
          op.data
        );
        // *** ATTENTION: THE RESPONSE IS NOT COMPLETED ***
        const fakeResponse = new Response(JSON.stringify({
          'id': op.operation_id,
          'data': op.data
          /*
          'operation_description': {'id': op.operation_id},
          'operation_data': {'data': op.data},
          */
        }));
        return fakeResponse;
      }
      
      // NEW OPERATION
      // new operation while offline => no user, form_name, ...
      // id = random negative int
      // --- TODO: VIEWS.PY - CHANGE NEW_OPERATION ... TO FILL THE DATA GAP
      else if (event.request.url.includes(URL_NEW_OPERATION)){
        console.log("--- OFFLINE > ", URL_NEW_OPERATION);
        const op = await cloned.json();
        // op: {form_id: 3035, name: 'xxxxxxxxxxxxxxxx', description: '11111111111111111'}

        const id = randInt(Number.MIN_SAFE_INTEGER, -1);
        const date = _mysqlTimeStamp2JS(new Date().toISOString());
        await offline.saveOperationLocally(
          id,                     // operation_id
          op.name,                // name
          op.description,         // description
          op.form_id,             // form_id
          null,                   // form_name
          date,                   // date_creation
          OPERATION_STATE.OPEN,   // status_name
          null,                   // operation_data
          0,                      // isPendingDeletion
          date,                   // date_updated
          null                    // updated_by
        );

        // operation: ['id', 'name', 'description', 'form','form_name','date_creation','date_updated','author','author_name','updated_by','updated_by_name','status_name']

        const fakeResponse = new Response(JSON.stringify({
          'id': id,           // operation_id
          'name':op.name,
          'description':op.description, 
          'form':op.form,     // form_id
          'form_name':null,
          'date_creation':date,
          'date_updated':date,
          'author':null,
          'author_name':null,
          'updated_by':null,
          'updated_by_name':null,
          'status_name':OPERATION_STATE.OPEN
        }));
        return fakeResponse;        

      }
      
      // DELETE OPERATION
      else if (event.request.url.includes(URL_DELETE_OPERATION)){
        console.log("--- OFFLINE > ", URL_DELETE_OPERATION);        
        const op = await cloned.json();
        // {operation_id: x}

        if (op.operation_id > 0) {
          // exists remote => mark operation as deletion pending
          // once online, when synced => delete operation after remote.
          await offline.flagLocalOperation2Deletion(op.operation_id);
        } else {        
          // if id < 0 => all local => delete immediately
          await offline.deleteLocalOperation(op.operation_id);
        }
        const fakeResponse = new Response(JSON.stringify({'id': op.operation_id}));
        return fakeResponse;
      }
      
      // UPLOAD OPERATION ASSET
      // offline => save only locally with id = random negative int
      else if (event.request.url.includes(URL_OPERATION_UPLOAD_ASSET)){
        console.log("--- OFFLINE > ", URL_OPERATION_UPLOAD_ASSET);

        // get the formdata data
        /*
        const data = {};
        const _data = await cloned.formData();
        for (const [key, value] of _data.entries()) {
          data[key] = value;
        }
        */
        let data = {};
        try {
          // signature / draw
          data = await cloned.clone().json();
        } catch (e) {
          const _data = await cloned.clone().formData();        
          for (const [key, value] of _data.entries()) {
            data[key] = value;
          }
        }       
      
        // ['id', 'name', 'asset', 'type','type_name', 'is_annex', 'date','operation']
        const random_id = randInt(Number.MIN_SAFE_INTEGER, -1);
        const date = _mysqlTimeStamp2JS(new Date().toISOString());
        let fullpath = PATH_OPERATION_ASSET + data.id + '/' + data.name;
        // IF A FILE ALREADY EXISTS IN THE SAME DIR => DO THE SAME AS DJANGO: APPEND A RANDOM STRING
        // TO THE FILE
        const exists = await offline.existLocalOperationAssetWithFullpath(fullpath);
        if (exists) {
          data.name = append2File(data.name, "_" + randomAlphanumericString(8,3));
          fullpath = PATH_OPERATION_ASSET + data.id + '/' + data.name;
        }
        await offline.saveLocalOperationAsset(
          random_id,    // id
          parseInt(data.id),      // operation_id
          data.name,    // name
          fullpath,     // fullpath - ex: /operation_assets/123/file.png
          date,         // date
          null,         // type
          data.type,    // type_name
          data.is_annex==='undefined'?null:(data.is_annex==="true" || data.is_annex),   // is_annex
          data['asset-file']    // file
        );

        //['id', 'name', 'asset', 'type','type_name', 'is_annex', 'date','operation']
          const fakeResponse = new Response(JSON.stringify({
            'id': random_id,
            'name':data.name,
            'asset':fullpath, 
            'type':null,
            'type_name':data.type,
            'is_annex':data.is_annex==='undefined'?null:(data.is_annex==="true" || data.is_annex),
            'date':date,
            'operation':data.id,
          }));
          return fakeResponse;
      }
      // LIST OPERATION ANNEXES
      else if (event.request.url.includes(URL_LIST_OPERATION_ANNEXES)){
        console.log("--- OFFLINE > ", URL_LIST_OPERATION_ANNEXES);

        const index = event.request.url.indexOf('list_operation_annexes/') + 23;
        const operation_id = event.request.url.substring(index, event.request.url.length-1);
        const annexes = await offline.getLocalOperationAnnexes(parseInt(operation_id));
        const fakeResponse = new Response(JSON.stringify(annexes));
        return fakeResponse;  
      }

      // DELETE ASSET
      else if (event.request.url.includes(URL_REMOVE_OPERATION_ASSET)){
        console.log("--- OFFLINE > ", URL_REMOVE_OPERATION_ASSET);

        const op = await event.request.clone().json();
        // op: {id:[ids]}

        await offline.deleteLocalOperationAssetsBulk(op.id);

        const fakeResponse = new Response(JSON.stringify({id: op.id}));
        return fakeResponse;  
      }

      // GET TABLE COLUMN - 
      else if (event.request.url.includes(URL_GET_TABLE_COLUMN)){
        console.log("--- OFFLINE > ", URL_GET_TABLE_COLUMN);

        // http://127.0.0.1:8000/designer/api/get_table_column/3159/_xxx.csv/Concelho
        const parts = event.request.url.split('/');
        const form_id = parts[parts.length-3];
        const table = parts[parts.length-2];
        const column = parts[parts.length-1];
        
        // get table asset fullpath
        const url = PATH_FORM_ASSET + form_id + '/' + table;
        // get asset file
        const file = await offline.getLocalFormAsset(url);        
        const rows = await _file_2_json(file);
        const values = rows.map(value => value[column]);
        const fakeResponse = new Response(JSON.stringify(values));
        return fakeResponse;
      }

      return caches.match('/offline/');
    }


  }());
});


