import { fetchGET, fetchPOST } from '/static/js/Fetch.js';
import { URL_GET_FORM, URL_GET_OPERATION_DATA, URL_UPDATE_OPERATION, URL_GET_OPERATION } from '/static/js/urls.js';
import { FormViewBuilder } from '/static/sform/js/views/formview/FormViewBuilder.js';
import { ListViewBuilder } from '/static/sform/js/views/listview/ListViewBuilder.js';
import { EASystem } from '/static/sform/js/ea/EASystem.js';
import { ErrorModal } from '/static/js/modals/ErrorModal.js';
import { BarcodeModal } from '/static/sform/js/modals/BarcodeModal.js';
import { Translator } from '/static/js/Translator.js';
import { Context } from '/static/sform/js/Context.js'
import { getAllNumbers } from '/static/js/jsutils.js';
import { exportPRINTER, exportPDF } from '/static/sform/js/printexport/PrintExportForm.js';
import { AnnexModal } from '/static/sform/js/modals/AnnexModal.js';
// validations
import { ValidationModal } from '/static/sform/js/modals/ValidationModal.js';
import { OpFormData } from '/static/sform/js/OpFormData.js';
import { Validate } from '/static/sform/js/validations/Validate.js';
import { FoodexModal } from '/static/sform/js/modals/FoodexModal.js';


const SPINNER = $('#operation-spinner');

// ------------
// --- INIT ---
// ------------


Translator.setLanguage($('#selected-lang-form').val());

$(function() {
    new EditView();
});


function EditView() {
    this.context = new Context();
    const self = this;

    this.form_view = null;
    this.list_view = null;
    this.operation_name = null;

    // --------------
    // --- MODALS ---
    // --------------
    /**
    * Error modal.
    */
    const error_modal = new ErrorModal().attachTo($('#modals-container').get(0));
    /**
     * Barcode capture/read modal.
     */
    const barcode_modal = new BarcodeModal(
        Translator.translate('Barcode Capture/Reader'),
        Translator.translate('Chose capture mode!'),
    ).attachTo($('#modals-container').get(0));

    /**
     * Annex manager modal.
     */
    const annex_modal = new AnnexModal(
        Translator.translate('Operation Annexes'),
        Translator.translate('Add/Remove/Download documents!'),
        this.context
    ).attachTo($('#modals-container').get(0));

    /**
     * Validation modal.
     */
    const validation_modal = new ValidationModal(
        Translator.translate('Inputs Validation'),
        Translator.translate('Verify the result of the validations and correct the errors!'),
        self.context
    ).attachTo($('#modals-container').get(0));

    /**
     * Foodex modal.
     */
     const foodex_modal = new FoodexModal(this.context);
     foodex_modal.init();


    // ---------------
    // --- SIGNALS ---
    // ---------------    

    this.context.signals.saveOperation.add(() => {    
        $('#btn-operation-save').trigger('click');
    });

    this.context.signals.onError.add((msg, origin=null) => {
        error_modal.show(msg);
        console.error((origin?origin:'') + msg);
    });
    this.context.signals.onBarcodeReader.add((setResults = null, onError = null) => {
        barcode_modal.show(setResults, onError);
    });

    this.context.signals.onChange.add(() => {
        self.setButtonsState(true);        
    });

    this.context.signals.onFoodexModal.add((onSelection) => {
        foodex_modal.show(onSelection);
    });

    /*
    this.context.signals.onAnnexUploaded.add(() => {
        self.setButtonsState(true);
    });    
    this.context.signals.onAnnexRemoved.add(() => {
        self.setButtonsState(true);
    });      
    */
    // ---------------
    // --- BUTTONS ---
    // ---------------
    $('#btn-operation-validate').on('click', function() {
        $("body").css("cursor","progress");
        self.save(() => {
            self.swapSave(false);
            new OpFormData(self.context, self.context.form_operation_id, (data) => {
                const results = new Validate(data).getResults();
                validation_modal.show(results);
                $("body").css("cursor","auto");
            })
        }, () => {
            $("body").css("cursor","auto");
        });
    });

    $('#btn-operation-annexes').on('click', function() {
        annex_modal.show(self.context.form_operation_id);
    });    

    $('#btn-operation-reset').on('click', function() {
        $("body").css("cursor","progress");
        self.easystem = null;
        self.form_view = null;
        self.list_view = null;
        $('#form-view').empty();
        $('#list-view').empty();
        self.getForm(self.context.form_id, (form) => {
            if (form.form && form.form !== '') {
                self.setViews(form.form);
                self.setButtonsState(false, true, true, true);
            } else {
                throw Error(Translator.translate("Invalid form"));
            }
            $("body").css("cursor","auto");
        }, () => {
            $("body").css("cursor","auto");
            self.setButtonsState(false, false, false, false);
        });
    });

    $('#btn-operation-save').on('click', function() {
        $("body").css("cursor","progress");
        self.save(() => {
            //$('#btn-operation-save').addClass('disabled');
            self.swapSave(false);
            $("body").css("cursor","auto");
        }, () => {
            $("body").css("cursor","auto");
        });
    });

    $('#btn-operation-print').on('click', function() {
        $("body").css("cursor","progress");
        exportPRINTER(null, self.form_view, () => {
            $("body").css("cursor","auto");
        }, (err) => {
            $("body").css("cursor","auto");        
            self.context.signals.onError.dispatch(Translator.translate("Printing error! ") + err,"[opeditview::exportPRINTER]"); 
        }, self.context);
    })
    $('#btn-operation-pdf').on('click', function() {
        $("body").css("cursor","progress");
        exportPDF(self.context.form_id, self.form_view, () => {        
            $("body").css("cursor","auto");
        }, (err) => {
            $("body").css("cursor","auto");
            self.context.signals.onError.dispatch(Translator.translate("Error while creating the PDF! ") + err,"[opeditview::exportPDF]"); 
        }, self.context, self.operation_name);
    })
    // ------------------------------------
    // --- LOAD FORM AND OPERATION DATA ---
    // ------------------------------------
    
    if ($('#operation-id-hidden').val() !== '') {
        this.context.form_operation_id = $('#operation-id-hidden').val();
        this.getOperation(this.context.form_operation_id, (operation_details) => {
            $('#operation-name').text(operation_details.name);
            this.context.form_id = operation_details.form;
            this.operation_name = operation_details.name;
            this.getForm(operation_details.form, (form) => {
                if (form.form) {
                    this.setViews(form.form);
                    this.getOperationData(this.context.form_operation_id, (operation_data) => {
                        if (Object.entries(operation_data).length > 0) {
                            if (!operation_data.data) this.context.changed = true; 
                            this.form_view.restore(operation_data.data);
                            this.list_view.restore(operation_data.data);
                        }
                        SPINNER.hide();
                        this.setButtonsState(false, true, true, true);
                    }, () => {
                        SPINNER.hide();
                    });
                } else {
                    SPINNER.hide();
                }
            }, () => {
                SPINNER.hide();
            })
        }, () => {
            SPINNER.hide();
        })
    }
}


EditView.prototype = {

    /**
     * Sets the state of each of the dynamic 4 buttons: either enables or disables them
     * according to params.
     * @param {boolean} save 
     * @param {boolean} reset 
     * @param {boolean} print 
     * @param {boolean} pdf 
     */
    setButtonsState: function(save=null, reset=null, print=null, pdf=null) {
        if (save !== null) {
            this.swapSave(save);
        }
        if (reset !==null) reset?$('#btn-operation-reset').removeClass('disabled'):$('#btn-operation-reset').addClass('disabled');
        if (print !==null) print?$('#btn-operation-print').removeClass('disabled'):$('#btn-operation-print').addClass('disabled');
        if (pdf !==null) pdf?$('#btn-operation-pdf').removeClass('disabled'):$('#btn-operation-pdf').addClass('disabled');
    },

    /**
     * Toggles the state of the save button.
     * @param {boolen} need_save If true, then Save button enabled, else disabled.
     */
    swapSave: function(need_save = false) {
            if (need_save) {
                $('#btn-operation-save').removeClass('disabled');
                $('#btn-operation-save').removeClass('btn-outline-danger');
                $('#btn-operation-save').addClass('btn-danger');
            } else {
                $('#btn-operation-save').addClass('disabled');
                $('#btn-operation-save').removeClass('btn-danger');
                $('#btn-operation-save').addClass('btn-outline-danger');            
            }
    },

    /**
     * Parses and displays all views.
     * @param {object} data Json object representing a form.
     */
    setViews: function(data) {
        this.form_view = new FormViewBuilder($("#form-view")[0], data, this.context);
        this.list_view = new ListViewBuilder($("#list-view-accordion")[0], data, this.context);
        this.easystem = new EASystem(this.context).clear().setup(data['eas']);
        this.list_view.createHeader(this.form_view.lv_header_elements);
    },

    /**
     * Loads a form from database.
     */
    getForm: function(form_id, onReady = null, onError = null) {
        const url = URL_GET_FORM + form_id + '/';
        fetchGET(url, 
            (result) => {
                if (onReady) onReady(result);
            },
            (error) => {
                if (onError) onError();
                //this.context.signals.onError.dispatch(error);
                this.context.signals.onError.dispatch(error,"[opeditview::getForm]");
            }
        );
    },    

    /**
     * Get an operation from database.
     * @param {number} operation_id Operation ID.
     * @param {function} onReady Called when ready.
     * @param {function} onError Called when error.
     */
    getOperation: function(operation_id, onReady = nulll, onError = null) {
        const url = URL_GET_OPERATION + operation_id + '/';
        fetchGET(url, 
            (result) => {
                if (onReady) onReady(result);
            },
            (error) => {
                if (onError) onError();
                if (getAllNumbers(error.toString())[0] == 404) {
                    this.context.signals.onError.dispatch('Invalid Operation!',"[opeditview::getOperation]");
                } else {
                    this.context.signals.onError.dispatch(error,"[opeditview::getOperation]");
                }
            }
        );
    },

    /**
     * Saves the all the form's values.
     * Only saves the inputs of the form view, since fields(form view) C fields(list view)
     */
    save: function(onReady = nulll, onError = null) {
        // save iff something changed
        if (!this.context.changed) {
            if (onReady) onReady(null);
            return;
        } 

        this.form_view.save().then(data => {
            fetchPOST(URL_UPDATE_OPERATION,
                {
                    operation_id: this.context.form_operation_id,
                    data: data,
                },
                (result) => {
                    if (onReady) onReady();
                },
                (error) => {
                    if (onError) onError();
                    //this.context.signals.onError.dispatch(error);
                    this.context.signals.onError.dispatch(error,"[opeditview::save]");
                }
            );
        });
    },

    /**
     * Get the operation data from database.
     * @param {number} operation_id Operation ID.
     * @param {function} onReady Called when ready.
     * @param {function} onError Called when error.
     */
    getOperationData: function(operation_id, onReady=nulll, onError = null) {
        const url = URL_GET_OPERATION_DATA + operation_id + '/';        
        fetchGET(url, 
            (result) => {
                if (onReady) onReady(result);
            },
            (error) => {
                if (onError) onError();
                //this.context.signals.onError.dispatch(error);
                this.context.signals.onError.dispatch(error,"[opeditview::getOperationData]");
            }
        )
    },


}

