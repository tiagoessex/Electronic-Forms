
import { Translator } from '/static/js/Translator.js';
import { Context } from './Context.js';
import { STATUS } from '/static/js/status.js';
import { ErrorModal } from '/static/js/modals/ErrorModal.js';
import { AreYouSureModal } from '/static/js/modals/AreYouSureModal.js';
import { 
    OPEN_OPS_ASSETS_LIST_IMAGE,
    CLOSE_OPS_ASSETS_LIST_IMAGE,
    URL_SET_OPERATION_STATUS,
    URL_DELETE_OPERATION,
    URL_EDITVIEW,
    URL_OPERATIONS_ASSETS
} from '/static/js/urls.js';
import { StatusBadge } from './StatusBadge.js';
import { ButtonsOperations } from './ButtonsOperations.js';
import { DisplayDataFiles } from './DisplayDataFiles.js';
import { fetchPOST } from '/static/js/Fetch.js';

// validations
import { ValidationModal } from '/static/sform/js/modals/ValidationModal.js';
import { OpFormData } from '/static/sform/js/OpFormData.js';
import { Validate } from '/static/sform/js/validations/Validate.js';

import { download } from '/static/js/jsfiles.js';
import { today } from '/static/js/jstime.js';

import { AnnexModal } from '/static/sform/js/modals/AnnexModal.js';
import { ELEMENTS_TYPE } from '/static/designer/js/elements/constants.js';

// --------------
// GLOBALS
// --------------

const context = new Context();
Translator.setLanguage($('#selected-lang-form').val());


// --------------
// MODALS
// --------------

// ERROR MODAL
const error_modal = new ErrorModal().attachTo($('#modals-container').get(0));

// AYS MODAL
const ays_modal = new AreYouSureModal().attachTo($('#modals-container').get(0));

// VALIDATION MODAL
const validation_modal = new ValidationModal(
    Translator.translate('Inputs Validation'),
    Translator.translate('Verify the result of the validations and correct the errors!'),
    context
).attachTo($('#modals-container').get(0));

/**
 * Annex manager modal.
 */
 const annex_modal = new AnnexModal(
    Translator.translate('Operation Annexes'),
    Translator.translate('Add/Remove/Download documents!'),
    context
 ).attachTo($('#modals-container').get(0));

// --------------
// LISTENERS
// --------------

context.signals.onError.add((msg, origin=null) => {
    $('#manager-spinner').hide();
    $("body").css("cursor","auto");
    error_modal.show(msg);
    console.error((origin?origin:'') + msg);
});
  
context.signals.onAYS.add((text, ok_callback, cancel_callback) => {
    ays_modal.show(text, ok_callback, cancel_callback);
});

context.signals.onAnnexModal.add((operation_id) => {
    annex_modal.show(operation_id);
});

context.signals.onAnnexRemoved.add((file, operation_id, asset_id) => {
    // if the assets table is open, close it
    const id = "operation-" + operation_id;
    $('#table-forms tbody #' + id + ' td.details-control').trigger('click',true);
});
context.signals.onAnnexUploaded.add((file, operation_id, asset_id) => {
    // if the assets table is open, close it
    const id = "operation-" + operation_id;
    $('#table-forms tbody #' + id + ' td.details-control').trigger('click',true);    
});


// SET ALL SELECTED OPERATIONS TO CLOSE STATE (IFF NOT COMPLETED)
// IF ERROR ON ONE, PRESENTS ERROR AND CONTINUE WITH IT
context.signals.onClose.add((operations_id, buttons = null) => {
    $("body").css("cursor","progress");
    operations_id.forEach(operation => {
        fetchPOST(URL_SET_OPERATION_STATUS,
            {
                operation_id: operation,
                status: STATUS.CLOSED,
            },
            (result) => {                
                $("body").css("cursor","auto");
                updateRow(operation, result, buttons);
            },
            (error) => {
                $("body").css("cursor","auto");
                context.signals.onError.dispatch(error,"[Operations::onClose]");
            }
        );
    }) 
});

// SET ALL SELECTED OPERATIONS TO OPEN STATE (IFF NOT COMPLETED)
// IF ERROR ON ONE, PRESENTS ERROR AND CONTINUE WITH IT
context.signals.onOpen.add((operations_id, buttons = null) => {
    $("body").css("cursor","progress");
    operations_id.forEach(operation => {        
        fetchPOST(URL_SET_OPERATION_STATUS,
            {
                operation_id: operation,
                status: STATUS.OPEN,
            },
            (result) => {                
                $("body").css("cursor","auto");
                updateRow(operation, result, buttons);
            },
            (error) => {
                $("body").css("cursor","auto");
                context.signals.onError.dispatch(error,"[Operations::onOpen]");
            }
        );
    }) 
});

// NOT IMPLEMENTED
context.signals.onDatabase.add((operations_id, buttons = null) => {
    context.signals.onError.dispatch(Translator.translate("Not implemented! Use the Rest API to process the data."),"[Operations::onDatabase]");
});

// FETCHES THE DATA (JSON) OF ALL SELECTED OPERATIONS
// AND CREATE A JSON FILE WITH IT
context.signals.onJson.add((operations_id, buttons = null) => {
    $("body").css("cursor","progress");
    const data = {};
    var promises = [];
    operations_id.forEach(operation => {
        promises.push(
            new Promise(resolve => {
                new OpFormData(context, operation, (operation_data) => {                
                    data[operation] = operation_data;
                    console.log(operation_data);
                    resolve();
                });
            })
        )
    })
    Promise.all(promises).then(() => {
        //if (Object.keys(data).length == 1) {
        if (operations_id.length == 1) {
            const name = 'operation_' + operations_id[0] + '_' + today() + '.json';
            download(JSON.stringify(data[operations_id[0]], null,'\t'), name,'json');
        } else {
            const name = 'operations_' + today() + '.json';
            download(JSON.stringify(data, null,'\t'), name,'json');
        }        
        $("body").css("cursor","auto");
    })

});


// FETCHES THE DATA (JSON AND ASSETS) OF ALL SELECTED OPERATIONS
// DOWNLOAD THEIR ASSETS AND ZIP ALL OPERATIONS INTO DIFERENT FOLDERS
context.signals.onZip.add((operations_id, buttons = null) => {
    $("body").css("cursor","progress");
    const name = 'operations_' + today();
    const zip = new JSZip(); 
    const data = {};
    const promises = [];    
    const folder = {};    
    operations_id.forEach(operation => {
        promises.push(new Promise(resolve => {
            const images_promises = [];
            new OpFormData(context, operation, (operation_data) => {
                const imgs = [];
                let images = [];
                data[operation] = operation_data;
                operation_data.elements.forEach(element => {
                    switch (element.type) {
                        case ELEMENTS_TYPE.BARCODE_IMAGE.name:
                            if (element.value.image) {
                                const image = URL_OPERATIONS_ASSETS + operation + '/' + element.value.image;
                                imgs.push(image);
                            }
                            break;
                        case ELEMENTS_TYPE.SIGNATURE.name:
                        case ELEMENTS_TYPE.DRAWING.name:
                        case ELEMENTS_TYPE.USERIMAGE.name:
                            if (element.value) imgs.push(URL_OPERATIONS_ASSETS + operation + '/' + element.value);
                            break;
                    }
                });
                operation_data.annexes.forEach(annex => {
                    if (annex) imgs.push(URL_OPERATIONS_ASSETS + operation + '/' + annex);
                });

                if (imgs.length > 0) {
                    images = images.concat(imgs)
                    folder[operation] = zip.folder(operation);
                }

                images.forEach(imageUrl => {
                    images_promises.push(
                        fetch(imageUrl).then(response => {
                            return response.blob().then(function(myBlob) {
                                const parts = imageUrl.split('/');
                                const name = parts[parts.length-1];
                                const op = parts[parts.length-2];
                                const imageFile = new File([myBlob], name, {base64: true});
                                if (folder.hasOwnProperty(op)) folder[op].file(name, imageFile);                        
                            });
                        })
                    ); 
                });

                Promise.all(images_promises).then(() => {
                    resolve();
                });
            });
        }));

    });
    
    Promise.all(promises).then(() => {
        zip.file(name + '.json', JSON.stringify(data, null,'\t'));
        zip.generateAsync({type:"blob"})
        .then(function(content) {
            saveAs(content, name + '.zip');
            $("body").css("cursor","auto");
        }); 
    }).catch(error => {
        $("body").css("cursor","auto");
        context.signals.onError.dispatch(error,"[Operations::onZip]");
    })

});

context.signals.onEdit.add((operation_id, buttons = null) => {
    window.open(URL_EDITVIEW + operation_id, "_blank");    
});

// VALIDATE INPUTS OF THE SELECTED OPERATION
context.signals.onValidate.add((operation_id, buttons = null) => {
    $("body").css("cursor","progress");
    new OpFormData(context, operation_id, (data) => {
        const results = new Validate(data).getResults();
        validation_modal.show(results);
        $("body").css("cursor","auto");
    })  
});

// SET ALL SELECTED OPERATIONS TO COMPLETED STATE (IFF NOT COMPLETED)
// IF ERROR ON ONE, PRESENTS ERROR AND CONTINUE WITH IT
context.signals.onCompleted.add((operations_id, buttons = null) => {
    $("body").css("cursor","progress");
    operations_id.forEach(operation => {        
        fetchPOST(URL_SET_OPERATION_STATUS,
            {
                operation_id: operation,
                status: STATUS.COMPLETED,
            },
            (result) => {                
                $("body").css("cursor","auto");
                updateRow(operation, result, buttons);
            },
            (error) => {
                $("body").css("cursor","auto");
                context.signals.onError.dispatch(error,"[Operations::onCompleted]");
            }
        );
    })  
});

// REMOVE/DELETE ALL SELECTED OPERATIONS (IFF NOT COMPLETED)
context.signals.onRemove.add((operations_id, buttons = null) => {
    $("body").css("cursor","progress");
    operations_id.forEach(operation => {
        fetchPOST(URL_DELETE_OPERATION,
            {
                operation_id: operation,
            },
            (result) => {
                $("body").css("cursor","auto");
                if (buttons) {
                    const row = $(buttons.dom).closest('tr');
                    table.rows(row).remove().draw(false);
                }
                
            },
            (error) => {
                $("body").css("cursor","auto");
                context.signals.onError.dispatch(error,"[Operations::onRemove]");
            }
        );
    });
});

  
// --------------
// TABLE
// --------------

// ADD IMAGES TO THE STYLE
var sheet = window.document.styleSheets[0];
sheet.insertRule('td.details-control { background: url(' + OPEN_OPS_ASSETS_LIST_IMAGE + ') no-repeat center center; }', sheet.cssRules.length);
sheet.insertRule('tr.shown td.details-control { background: url(' + CLOSE_OPS_ASSETS_LIST_IMAGE + ') no-repeat center center; }', sheet.cssRules.length);

// INIT TABLE

const table = $('#table-forms').DataTable({
    "columnDefs": [
          {         
              "targets": [6,7],
              "visible": false,
          },
          {
            "targets": [1,8,9],
            "className": "dt-center",
          }
    ],
    "columns": [
      {
        "className":      'details-control',
        "orderable":      false,
        "data":           null,
        "defaultContent": ''
    },      
        { "data": "id", "orderable": true },
        { "data": "name", "orderable": true },
        { "data": "description", "orderable": true },
        { "data": "author", "orderable": true },
        { "data": "date_creation", "orderable": true },
        { "data": "updated_by", "orderable": true },
        { "data": "date_updated", "orderable": true },
        { "data": "status", "orderable": true },  
        { "data": "actions", "orderable": false },
    ],
    "scrollX": "100%",
    "order": [[ 1, "desc" ]],
    "buttons": ["copy", "csv", "excel", "pdf", "print", "pageLength", "colvis"],
    "language": {
            "lengthMenu": Translator.translate("Show _MENU_ operations per page"),
            "zeroRecords": "<h3><span class='badge badge-danger p-2'>" + Translator.translate("No Operations Available") + "!</span></h3>",
            "info": Translator.translate("Showing _PAGE_ of _PAGES_"),
            "infoEmpty": "<span class='badge badge-info p-1'>" + Translator.translate("Nothing Founded") + "!</span>",
            "infoFiltered": "(" + Translator.translate("filtered a total of _MAX_ operations") + ")",
             "paginate": {
                  "previous": "<i class='fas fa-angle-left'></i>",
                  "next": "<i class='fas fa-angle-right'></i>",
                  "first": "<i class='fas fa-angle-double-left'></i>",
                  "last": "<i class='fas fa-angle-double-right'></i>"
              },
            "search" : Translator.translate("Search"),
            buttons: {
                'pageLength': Translator.translate("Show") + " %d",
                'copy': Translator.translate("Copy"),
                'print': Translator.translate("Print"),
                'colvis': Translator.translate("Columns"),
            }
    },
    "drawCallback": function( settings ) {
        var api = this.api();
        var currentPageDataSet = api.rows( {page:'current'} ).data() ;
        if(currentPageDataSet.length < 3){               
            $('#table-forms tbody').css('height','130px');
        } else {
          $('#table-forms tbody').css('height','');
        }
      }     
})
table.buttons().container().appendTo('#table-forms_wrapper .col-md-6:eq(0)');

// FILTER TABLE
function filterBy(status = STATUS.OPEN) {
    if (status !== 'ALL') {
        $.fn.dataTable.ext.search.pop();
        $.fn.dataTable.ext.search.push(
            function(settings, data, dataIndex) {
                return $(table.row(dataIndex).node()).attr('data-status') === status;
            }
        ); 
    } else {
        $.fn.dataTable.ext.search = [];//.pop();
    }
    table.draw();
}

// CREATE THE STATUS BADGE AND OPERATION BUTTONS

table.rows().eq(0).each( function ( index ) {
    const row = table.row( index );
    const data = row.data();
    const status = data.status;
    table.row(row).cell(row, 8).data($(StatusBadge(status).dom).get(0).outerHTML);
    new ButtonsOperations(context, status, data.id).attachTo(table.row(row).cell(row, 9).node());
    table.draw();
} );

// SELECT/UNSELECT ROWS
$('#table-forms tbody').on('click', 'tr', function (e) {
    const index = table.cell($(e.target).closest('td')).index();
    // can't select rows from the operations cell or assets
    if (index.column == 0 || index.column == 9) return;

    if ($(this).hasClass('selected')) {
        $(this).removeClass('selected');
    } else {
        $(this).addClass('selected');
    }
    checkButtonsStatus();
} );


function nRowsSelected() {
    return table.rows('.selected')[0].length;
}


function getIDsSelectedRows() {
    const ids = [];
    table.rows().every(function() {
        if (this.nodes().to$().hasClass('selected')) {
            ids.push(this.data().id);
        }           
    })
    return ids;
}

// ------------------
// GLOBAL OPERATIONS
// ------------------

/**
 * Enable/disable the global buttons according to whether or not there are selected rows/operations.
 * @param {boolean} count
 * @param {number} n 
 */
 function checkButtonsStatus(count = true, n = 0) {
    if (count) {
        n = nRowsSelected();
    }
    if (n > 0) {
        $('#btn-unselect').removeClass("disabled");
        $('#btn-changeto').removeClass("disabled");
        $('#btn-operations').removeClass("disabled");
        $('#btn-delete').removeClass("disabled");
    } else {
        $('#btn-unselect').addClass("disabled");
        $('#btn-changeto').addClass("disabled");
        $('#btn-operations').addClass("disabled");
        $('#btn-delete').addClass("disabled");
    }
}


// SELECT ALL
$('#btn-select-all').click(function(){
    table.rows().every(function() {
        this.nodes().to$().addClass('selected')
    })
    checkButtonsStatus();
});

// UNSELECT ALL
$('#btn-unselect').click(function(){
    table.rows().every(function(){
        this.nodes().to$().removeClass('selected')
    })
    checkButtonsStatus(false, 0);
});


$('#btn-open').click(function(){
    context.signals.onAYS.dispatch(Translator.translate('Open all selected operations?'), () => {
        context.signals.onOpen.dispatch(getIDsSelectedRows());
    });    
});
$('#btn-close').click(function(){
    context.signals.onAYS.dispatch(Translator.translate('Close all selected operations?'), () => {
        context.signals.onClose.dispatch(getIDsSelectedRows());
    });    
});
$('#btn-complete').click(function(){
    context.signals.onAYS.dispatch(Translator.translate('Mark all selected operations as Completed?'), () => {
        context.signals.onCompleted.dispatch(getIDsSelectedRows());
    });    
});

$('#btn-database').click(function(){
    context.signals.onAYS.dispatch(Translator.translate('Send all selected operations to the database?'), () => {
        context.signals.onDatabase.dispatch(getIDsSelectedRows());
    });    
});
$('#btn-json').click(function(){
    context.signals.onAYS.dispatch(Translator.translate('Download the data of all selected operations as a Json file?'), () => {
        context.signals.onJson.dispatch(getIDsSelectedRows());
    });    
});
$('#btn-zip').click(function(){
    context.signals.onAYS.dispatch(Translator.translate('Download the data of all selected operations as a ZIP file (also includes any image)?'), () => {
        context.signals.onZip.dispatch(getIDsSelectedRows());
    });    
});

// DELETE ALL SELECTED OPERATIONS
$('#btn-delete').click(function(){
    context.signals.onAYS.dispatch(Translator.translate('Delete all selected operations?'), () => {
        context.signals.onRemove.dispatch(getIDsSelectedRows());
        // FETCH DELETE OP
        table.rows('.selected').remove().draw(false);
    })
});

// FILTER BY
$('#filter-status').on('change', function(e) {
    filterBy(e.target.value);
});


// -----------------
// LOCAL OPERATIONS
// -----------------

// SHOW/HIDE ASSETS
// it recreates the list everytime it displays => no to refresh the page
$('#table-forms tbody').on('click', 'td.details-control', function (e, close) {

    var tr = $(this).closest('tr');
    var row = table.row( tr );
  
    if ( row.child.isShown() || close ) {
        row.child.hide();
        tr.removeClass('shown');
    } else {
        DisplayDataFiles(context, tr.attr('data-id'), (ret) => {
          row.child( ret ).show();
          tr.addClass('shown');
        });
    }
  });
  

// --------------
// OPERATIONS
// --------------


/**
 * UPDATE ROW VALUES.
 * 
 * @param {object} data New data.
 * @param {ButtonsOperation} buttons ButtonsOperation.
 * @returns 
 */
 function updateRow(operation_id, data, buttons) {
    
    let row = null
    if (buttons) {
        row = $(buttons.dom).closest('tr');    
    } else {
        table.rows().every(function() {
            if (this.data().id == operation_id) {
                row = table.row(this).cell(this, 9).nodes()[0];
                return false;
            }
        })
    }

    if (!row) {
        console.error('[operations::updateRow] Unable to find row!');
        return;
    }

    const status = data['status_name'];

    table.row(row).cell(row, 6).data(data['updated_by_name']);
    table.row(row).cell(row, 7).data(data['date_updated']);
    const badge = StatusBadge(status);
    table.row(row).cell(row, 8).data($(badge.dom).get(0).outerHTML);
    table.draw(false);    
    
    if (buttons) {        
        buttons.setButtonStatus(status);
    }
}


// --------------
// READY
// --------------


// ONCE PAGE LOADING AND STYLES ARE APPLIED HIDE SPINNER
$( document ).ready(function() {  
    $('#manager-spinner').hide();
    $('#table-body').show();
    table.draw();
    checkButtonsStatus();
});
  