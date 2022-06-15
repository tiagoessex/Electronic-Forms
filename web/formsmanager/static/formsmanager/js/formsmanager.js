
import { 
    URL_FORM_USE,
    URL_FORM_DISABLE,
    URL_FORM_DELETE,
    URL_FORM_REMOVE_TEMPS,
    URL_FORM_CLONE,
    URL_NEW_FORM,
    URL_DESIGNER,
    URL_PREVIEW,
    OPEN_ASSETS_LIST_IMAGE,
    CLOSE_ASSETS_LIST_IMAGE
  } from '/static/js/urls.js';
import { ErrorModal } from '/static/js/modals/ErrorModal.js';
import { AreYouSureModal } from '/static/js/modals/AreYouSureModal.js';
import { ChangeModal } from './ChangeModal.js';
import { fetchPOST } from '/static/js/Fetch.js';
import { ButtonsOperations } from './ButtonsOperations.js';
import { StatusBadge } from './StatusBadge.js';
import { DisplayAssets } from './DisplayAssets.js';
import { Context } from './Context.js';
import { STATUS } from '/static/js/status.js';
import { Translator } from '/static/js/Translator.js';
import { exportPRINTER, exportPDF } from '/static/sform/js/printexport/PrintExportForm.js';



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

// CHANGES NAME/DESCRIPTION MODAL
const change_modal = new ChangeModal(
  Translator.translate('Change Name/Description'),
  Translator.translate('Change the name/description and click Ok!'),
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


// USES FORM
context.signals.onUsed.add((id, buttons) => {
  ays_modal.show(Translator.translate("Once you execute this operation, it will lock this form and editing it will not be possible. Continue?"), () => {
    const row = $(buttons.dom).closest('tr');
    //const _buttons = $(buttons.dom).closest('td').find('button'); 
    //$('#manager-spinner').show();
    $("body").css("cursor","progress");
    fetchPOST(
      URL_FORM_USE, 
      {id: id}, 
      result => {
        updateRow(result, row, buttons);
        //$('#manager-spinner').hide();
        $("body").css("cursor","auto");
      },
      error => {
        context.signals.onError.dispatch(error,"[formsmanager::onUsed]");
      }
    )
  }); 
});

// DISABLES FORM
context.signals.onDisabled.add((id, buttons) => {
  ays_modal.show(Translator.translate("Are you sure you want to disable this form?"), () => {
    const row = $(buttons.dom).closest('tr');
    //const _buttons = $(buttons.dom).closest('td').find('button');    
    //$('#manager-spinner').show();
    $("body").css("cursor","progress");
    fetchPOST(
      URL_FORM_DISABLE, 
      {id: id}, 
      result => {
        updateRow(result, row, buttons);
        //$('#manager-spinner').hide();
        $("body").css("cursor","auto");
      },
      error => {
        context.signals.onError.dispatch(error,"[formsmanager::onDisabled]");
      }
    ) 
  });
});


// DELETES FORM
context.signals.onRemoved.add((id, buttons) => {
  ays_modal.show(Translator.translate("Are you sure you want to delete this form?"), () => {
    const row = $(buttons.dom).closest('tr');
    table.rows(row).remove().draw(false);
    $("body").css("cursor","progress");
    fetchPOST(
      URL_FORM_DELETE, 
      {id: id}, 
      result => $("body").css("cursor","auto"),
      error => {
        context.signals.onError.dispatch(error,"[formsmanager::onRemoved]");
      }
    )
  });
}); 

// OPENS AND EDITS FORM WITH THE DESIGNER
context.signals.onEditForm.add((id) => {
  window.open(URL_DESIGNER + id, "_blank");
});

// CLONES FORM
context.signals.onClone.add((id) => {
  //$('#manager-spinner').show();
  $("body").css("cursor","progress");
  fetchPOST(
    URL_FORM_CLONE, 
    {id: id}, 
    result => {
      addRow(result);
      //$('#manager-spinner').hide();
      $("body").css("cursor","auto");
    },
    error => {
      context.signals.onError.dispatch(error,"[formsmanager::onClone]");
    }
  )
});

// PREVIEWS FORM
context.signals.onPreview.add((id) => {
  window.open(URL_PREVIEW + id, "_blank");
});

// CHANGES NAME/DESCRIPTION
context.signals.onChanged.add((id, self) => {
  const tr = $(self.dom).closest('tr');
  const row = table.row( tr );
  const data = row.data();
  const name = data.name;
  const description = data.description;
  change_modal.show(id, name, description, (new_name, new_desc) => {
    table.row(row).cell(row, 2).data(new_name);
    table.row(row).cell(row, 3).data(new_desc);
  });
});

// PRINT FORM
context.signals.onPrint.add((form_id) => {
  $("body").css("cursor","progress");
  exportPRINTER(form_id, null, () => {
      $("body").css("cursor","auto");
  }, (err) => {
      $("body").css("cursor","auto");        
      context.signals.onError.dispatch(Translator.translate("Printing error! ") + err,"[formsmanager::exportPRINTER]"); 
  }, context);
});

// EXPORT FORM TO PDF
context.signals.onPdf.add((form_id) => {
  $("body").css("cursor","progress");
  exportPDF(form_id, null, () => {        
      $("body").css("cursor","auto");
  }, (err) => {
      $("body").css("cursor","auto");
      context.signals.onError.dispatch(Translator.translate("Error while creating the PDF! ") + err,"[formsmanager::exportPDF]"); 
  }, context);  
});

// --------------
// TABLE
// --------------

// ADDS IMAGES TO THE STYLE
var sheet = window.document.styleSheets[0];
sheet.insertRule('td.details-control { background: url(' + OPEN_ASSETS_LIST_IMAGE + ') no-repeat center center; }', sheet.cssRules.length);
sheet.insertRule('tr.shown td.details-control { background: url(' + CLOSE_ASSETS_LIST_IMAGE + ') no-repeat center center; }', sheet.cssRules.length);

// INITS TABLE
const table = $('#table-forms').DataTable({
    "columnDefs": [
          {         
              "targets": [4,5,6,7,8,9,10,11],
              "visible": false,
          },
          {
            "targets": [1,12,13],
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
        { "data": "date_created", "orderable": true },
        { "data": "updated_by", "orderable": true },
        { "data": "date_updated", "orderable": true },
        { "data": "locked_by", "orderable": true },
        { "data": "date_locked", "orderable": true },
        { "data": "disabled_by", "orderable": true },
        { "data": "date_disabled", "orderable": true },  
        { "data": "status", "orderable": true },  
        { "data": "actions", "orderable": false },
    ],
    "scrollX": "100%",
   /* "responsive": true, 
    "lengthChange": false, 
    "autoWidth": false,*/
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
          $('#table-forms tbody').css('height','110px');
      } else {
        $('#table-forms tbody').css('height','');
      }
    }  

})
table.buttons().container().appendTo('#table-forms_wrapper .col-md-6:eq(0)');



// CREATES THE STATUS BADGE AND OPERATION BUTTONS
table.rows().eq(0).each( function ( index ) {
  const row = table.row( index );
  const data = row.data();
  const status = data.status;
  table.row(row).cell(row, 12).data($(StatusBadge(status).dom).get(0).outerHTML);
  new ButtonsOperations(context, status, data.id).attachTo(table.row(row).cell(row, 13).node());
  table.draw();
} );

// FILTERS TABLE
function filterBy(status = STATUS.TEMPORARY) {
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



// ------------------
// GLOBAL OPERATIONS
// ------------------


// NEW FORM
$('#btn-new-form').on('click', function(e) {    
  fetchPOST(
    URL_NEW_FORM, 
    {is_temp: 'F'}, 
    result => addRow(result),
    error => {
      context.signals.onError.dispatch(error,"[formsmanager::NEW FORM]");
    }
  )
});


// DELETES TEMPORARY FORMS
$('#btn-remove-temps').on('click', function(e) {
  ays_modal.show(Translator.translate("Are you sure you want to delete all temporary files?"), () => {
    fetchPOST(
      URL_FORM_REMOVE_TEMPS, 
      '', 
      result => window.location.reload(true),
      error => {
        console.log("[formsmanager::DELETE TEMPORARY FORMS] ", error);
        context.signals.onError.dispatch(error,"[formsmanager::DELETE TEMPORARY FORMS]");
      }
    )
  });

});

// FILTERS BY
$('#filter-status').on('change', function(e) {
    filterBy(e.target.value);
});


// -----------------
// LOCAL OPERATIONS
// -----------------

// SHOWS/HIDES ASSETS
// it recreates the list everytime it displays => no need to refresh the page
$('#table-forms tbody').on('click', 'td.details-control', function () {
  var tr = $(this).closest('tr');
  var row = table.row( tr );
  if ( row.child.isShown() ) {
      row.child.hide();
      tr.removeClass('shown');
  } else {
      DisplayAssets(context, tr.attr('data-id'), (ret) => {
        row.child( ret ).show();
        tr.addClass('shown');
      });
  }
});


// --------------
// OPERATIONS
// --------------

/**
 * ADDS NEW ROW TO TABLE.
 * 
 * @param {object} data Object with a direct correspondence to the table fields.
 */
function addRow(data) {
  const row = table.row.add({
    "id": data.id,
    "name": data.name,
    "description": data.description,
    "author": data.author_name?data.author_name:null,
    "date_created": data.date_created,
    "updated_by":data.updated_by_name !== undefined?data.updated_by_name:null,
    "date_updated": data.date_updated,
    "locked_by": data.locked_by_name !== undefined?data.locked_by_name:null,
    "date_locked": data.date_locked,
    "disabled_by":data.disabled_by_name !== undefined?data.disabled_by_name:null,
    "date_disabled": data.date_disabled,
    "status": $(StatusBadge(data.status_name).dom).get(0).outerHTML,
    "actions":''
  });
  // append the operations buttons dom directly 
  new ButtonsOperations(context, status, data.id).attachTo(row.cell(row, 13).node());
  // center 
  for (let i=0; i<14; i++)
    $(row.cell(row, i).node()).addClass('align-middle');

  table.rows(row).nodes().to$().attr("id", data.id);
  table.rows(row).nodes().to$().attr("data-id", data.id);

  if (data.status_name === STATUS.TEMPORARY) {
    table.rows(row).nodes().to$().addClass('temporary-row');
  }

  table.draw(false);
}


/**
 * UPDATES ROW VALUES.
 * 
 * @param {object} data New data.
 * @param {object} row Row idenfication.
 * @param {ButtonsOperation} buttons ButtonsOperation.
 * @returns 
 */
function updateRow(data, row, buttons = null) {
    table.rows(row).nodes().to$().removeClass('added-row');
    table.rows(row).nodes().to$().removeClass('temporary-row');
    //const form_id = row[0].dataset.id;
    //console.log(form_id);
    table.row(row).cell(row, 2).data(data['name']);
    table.row(row).cell(row, 3).data(data['description']);
    table.row(row).cell(row, 6).data(data['updated_by_name']);
    table.row(row).cell(row, 7).data(data['date_updated']);
    table.row(row).cell(row, 8).data(data['locked_by_name']);
    table.row(row).cell(row, 9).data(data['date_locked']);
    table.row(row).cell(row, 10).data(data['disabled_by_name']);
    table.row(row).cell(row, 11).data(data['date_disabled']);
    const badge = StatusBadge(data['status_name']);
    table.row(row).cell(row, 12).data($(badge.dom).get(0).outerHTML);
    table.draw(false);    
  
    if (!buttons) return;

    const status = data['status_name'];
    buttons.setButtonStatus(status);
}



// --------------
// PAGE READY
// --------------


// ONCE PAGE LOADING AND STYLES ARE APPLIED HIDE SPINNER
$( document ).ready(function() {  
  $('#manager-spinner').hide();
  $('#table-body').show();
  table.draw();
});

