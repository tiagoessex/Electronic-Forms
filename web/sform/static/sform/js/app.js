
/**
 * TODO:
 *      - FSM implementation
 */

import { Context } from './Context.js'
import { Main } from './screens/Main.js';
import { FormSelection } from './screens/FormSelection.js';
import { OperationDetails } from './screens/OperationDetails.js';
import { FillForm } from './screens/FillForm.js';
import { ResumeOperationSelection } from './screens/ResumeOperationSelection.js';
import { Manager } from './screens/Manager.js';
import { AreYouSureModal } from '/static/js/modals/AreYouSureModal.js';
import { ErrorModal } from '/static/js/modals/ErrorModal.js';
import { WarningModal } from '/static/js/modals/WarningModal.js';
import { BarcodeModal } from './modals/BarcodeModal.js';
import { MODALS_CONTAINER } from './ids.js';
import { Translator } from '/static/js/Translator.js';
import { exportPRINTER, exportPDF, exportBase64PDF } from './printexport/PrintExportForm.js';

import { ValidationModal } from './modals/ValidationModal.js';
import { OpFormData } from './OpFormData.js';
import { Validate } from './validations/Validate.js';

import { AnnexModal } from './modals/AnnexModal.js';
import { SignModal } from './modals/SignModal.js';
import { FoodexModal } from './modals/FoodexModal.js';



// -----------------
// --- CONSTANTS ---
// -----------------


// -----------------
// --- CONTEXT ---
// -----------------

const context = new Context();
Translator.setLanguage($('#selected-lang-form').val());

// ----------------
// --- MESSAGES ---
// ----------------
/*
const broadcast = new BroadcastChannel('sw-app');
broadcast.addEventListener("message", function eventListener(event) {
    if (event.data.msg === 'action' && event.data.value === 'save_operation') { 
        context.signals.saveOperation.dispatch();
    }
});
*/

// -----------------
// --- MODALS ---
// -----------------
/**
* Global Error modal.
* Openning triggered by onError signal.
*/
const error_modal = new ErrorModal().attachTo($(MODALS_CONTAINER).get(0));

/**
 * Global Are you sure modal.
 * Openning triggered by onAYS signal.
 */
const ays_modal = new AreYouSureModal().attachTo($(MODALS_CONTAINER).get(0));

/**
 * Global warning modal.
 * Openning triggered by onWarning signal.
 */
 const warning_modal = new WarningModal().attachTo($(MODALS_CONTAINER).get(0));


const validation_modal = new ValidationModal(
    Translator.translate('Inputs Validation'),
    Translator.translate('Verify the result of the validations and correct the errors!'),
    context
).attachTo($(MODALS_CONTAINER).get(0));


/**
 * Barcode capture/read modal.
 */
 const barcode_modal = new BarcodeModal(
    Translator.translate('Barcode Capture/Reader'),
    Translator.translate('Chose capture mode!'),
 ).attachTo($(MODALS_CONTAINER).get(0));


/**
 * Annex manager modal.
 */
 const annex_modal = new AnnexModal(
    Translator.translate('Operation Annexes'),
    Translator.translate('Add/Remove/Download documents!'),
    context
 ).attachTo($(MODALS_CONTAINER).get(0));

/**
 * Signing modal.
 * This modal is not dynamically created.
 */
const sign_modal = new SignModal(context);

/**
 * Foodex modal.
 */
const foodex_modal = new FoodexModal(context);
/*await*/ foodex_modal.init();


// -------------------
// --- APPLICATION ---
// -------------------
const main = new Main(context);
const form_selection = new FormSelection(context);
const operation_details = new OperationDetails(context);
const fill_form = new FillForm(context);
const resume_operation_selection = new ResumeOperationSelection(context);
const manager = new Manager(context);

// for communication with the service worker
const broadcast = new BroadcastChannel('sync-channel');

// -----------------
// --- SIGNLAS ---
// -----------------
context.signals.onMain.add(() => {    
    main.show();
    // global sync everytime the user returns to the main screen
    if (navigator.onLine) {
       broadcast.postMessage('sync');
    }    
});
context.signals.onFormSelection.add(() => {
    form_selection.show();
})
context.signals.onOperationDetails.add(() => {
    operation_details.show();
})
context.signals.onFillForm.add(() => {
    fill_form.show();
})
context.signals.onResumeOperationSelection.add(() => {
    resume_operation_selection.show();
})
context.signals.onManager.add(() => {
    manager.show();
})

context.signals.onSync.add(() => {
    if (!navigator.onLine) {
        context.signals.onWarning.dispatch(Translator.translate("You are offline. You can only sync while online."));
    } else {
        broadcast.postMessage('sync');
    }
})



context.signals.onError.add((msg, origin=null) => {
    error_modal.show(msg);
    console.error((origin?origin:'') + msg);
});

context.signals.onAYS.add((text, ok_callback, cancel_callback) => {
    ays_modal.show(text, ok_callback, cancel_callback);
});

context.signals.onWarning.add((text) => {
    warning_modal.show(text);
});

context.signals.onBarcodeReader.add((setResults = null, onError = null) => {
    barcode_modal.show(setResults, onError);
});
context.signals.onAnnexModal.add((operation_id) => {
    annex_modal.show(operation_id);
});

context.signals.onSignModal.add((operation_id, form_view = null) => {
    sign_modal.show(operation_id, form_view);
});


context.signals.onFoodexModal.add((onSelection) => {
    foodex_modal.show(onSelection);
});
//foodex_modal.show();

//setTimeout(function(){ sign_modal.show(341); }, 3000);


// -------------------------------------
// -------------------------------------
// -------------------------------------
/*
context.signals.onTransferModal.add((operation_id, data = null) => {
    transfer_modal.show(operation_id, data);
});
*/
context.signals.onValidation.add((operation_id) => {
    $("body").css("cursor","progress");
    new OpFormData(context, operation_id, (data) => {
        const results = new Validate(data).getResults();
        validation_modal.show(results);
        $("body").css("cursor","auto");
    })    
});
//context.signals.onValidation.dispatch(67);
//validation_modal.show(null);
// -------------------------------------
// -------------------------------------
// -------------------------------------


context.signals.onPrint.add((form_id, form_view=null, onReady=null) => {
    $("body").css("cursor","progress");
    exportPRINTER(form_id, form_view, () => {
        $("body").css("cursor","auto");
        if (onReady) onReady();        
    }, (err) => {
        $("body").css("cursor","auto");        
        if (onReady) onReady();
        context.signals.onError.dispatch(Translator.translate("Printing error! ") + err,"[app::exportPRINTER]"); 
    }, context);
});
context.signals.onPdf.add((form_id, form_view=null, onReady=null, form_op_name='form.pdf') => {
    $("body").css("cursor","progress");
    exportPDF(form_id, form_view, () => {        
        $("body").css("cursor","auto");
        if (onReady) onReady();   
    }, (err) => {
        $("body").css("cursor","auto");
        if (onReady) onReady();           
        context.signals.onError.dispatch(Translator.translate("Error while creating the PDF! ") + err,"[app::exportPDF]"); 
    }, context, form_op_name);
});


context.signals.onBase64PDF.add((form_id, form_view=null, onReady=null) => {
    $("body").css("cursor","progress");
    exportBase64PDF(form_id, form_view, (pdf_data) => {        
        $("body").css("cursor","auto");
        if (onReady) onReady(pdf_data);   
    }, (err) => {
        $("body").css("cursor","auto");
        if (onReady) onReady();           
        context.signals.onError.dispatch(Translator.translate("Error while creating the PDF! ") + err,"[app::onBase64PDF]"); 
    }, context);
});




// GO TO MAIN SCREEN
context.signals.onMain.dispatch();



$(function(){
    const tab = $("a[data-toggle='tab'].active");
    var old_selected_tab = tab[0].id;    
    $("#views-tab a").click(function(e){
        e.preventDefault();
        const new_selected_tab = e.target.id;
        if (old_selected_tab != new_selected_tab) {
            context.signals.onViewChanged.dispatch(new_selected_tab);
            //console.log("changed > ", new_selected_tab);
            old_selected_tab = new_selected_tab;
        }
    });
});

