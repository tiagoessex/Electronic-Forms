/**
 * No lock when restoring the views.
 * Lock only while saving.
 */

import { TITLE_FILL_FORM } from "../constants.js";
import {    
    FILL_FORM_SECTION,
    FORM_VIEW,
    LIST_VIEW,
    FILL_FORM_NAME,
    FILL_OPERATION_NAME
} from "../ids.js";
import { 
    URL_GET_FORM, 
    URL_UPDATE_OPERATION, 
    URL_GET_OPERATION_DATA, 
    URL_SET_OPERATION_STATUS 
} from '/static/js/urls.js';
import { fetchGET, fetchPOST } from '/static/js/Fetch.js';
import { FormViewBuilder } from '../views/formview/FormViewBuilder.js';
import { ListViewBuilder } from '../views/listview/ListViewBuilder.js';
import { EASystem } from '../ea/EASystem.js';
import { Title } from '../Title.js';
import { Translator } from '/static/js/Translator.js';
import { OpFormData } from '../OpFormData.js';
import { Validate } from '../validations/Validate.js';


export function FillForm(context) {
    this.context = context;
    const ref = this;
    this.form_id = null;
    this.form_view = null;
    this.list_view = null;
    this.saved_data_fv = null;

    this.title = new Title(TITLE_FILL_FORM, () => {
        if (this.context.new_operation) {
            this.context.new_operation = false;
            $(FILL_FORM_SECTION).collapse('hide');
            ref.title.hide();
            context.signals.onOperationDetails.dispatch();
        } else {
            if (context.resume) {
                if (context.changed) {
                    context.signals.onAYS.dispatch(Translator.translate("Save changes?"), () => {
                        this.save(() => {
                            this.exit(context.signals.onResumeOperationSelection);
                        });
                    }, () => {
                        this.exit(context.signals.onResumeOperationSelection);
                    });
                } else {
                    this.exit(context.signals.onResumeOperationSelection);
                }
            } else {
                this.context.new_operation = false;
                $(FILL_FORM_SECTION).collapse('hide');
                ref.title.hide();
                context.signals.onOperationDetails.dispatch();
            }
        }
    }, [{name:'<i class="fas fa-save" aria-hidden="true"></i> ' + Translator.translate('Save'),callback:()=> {
        if (!this.form_view) return;
        this.save();
    }}, {name:'<span class="text-primary"><i class="fas fa-check" aria-hidden="true"></i> ' + Translator.translate('Close') + '</span>',callback:()=> {
        if (!this.form_view) return;
        $("body").css("cursor","progress");
        this.save(() => {

            new OpFormData(context, context.form_operation_id, (data) => {
                const validation = new Validate(data);
                if (validation.hasErrors()) {
                    context.signals.onAYS.dispatch(Translator.translate("There are some input errors. Close anyway?"), () => {
                            // ---CHANGE STATUS TO CLOSED ----
                            this.close(() => {
                                $("body").css("cursor","auto");
                                this.exit(context.signals.onMain);
                            });
                    }, () => {
                        $("body").css("cursor","auto");
                    });
                } else {
                    context.signals.onAYS.dispatch(Translator.translate("This action will close the operation. Are you sure?"), () => {
                            // ---CHANGE STATUS TO CLOSED ----
                            this.close(() => {
                                $("body").css("cursor","auto");
                                this.exit(context.signals.onMain);
                            });
                    }, () => {
                        $("body").css("cursor","auto");
                    });
                }
            })
        });
    }}, {name:'<i class="fas fa-trash-restore-alt" aria-hidden="true"></i> ' + Translator.translate('Reset'),callback:()=> {
        if (!this.form_view) return;
        context.signals.onAYS.dispatch(Translator.translate("Clear eveything, are you sure?"), () => {
            this.clear();
            this.loadForm();
        });
    }}, {name:'<i class="fas fa-check" aria-hidden="true"></i> Validate',callback:()=> {
        this.save(() => {
            context.signals.onValidation.dispatch(context.form_operation_id);
        });
    }}, {name:'<i class="fas fa-print" aria-hidden="true"></i> ' + Translator.translate('Print'),callback:()=> {
        if (!this.form_view) return;
        context.signals.onPrint.dispatch(null, this.form_view, null);
    }}, {name:'<i class="far fa-file-pdf" aria-hidden="true"></i> PDF',callback:()=> {
        if (!this.form_view) return;
        context.signals.onPdf.dispatch(null, this.form_view, null, context.form_operation_name);
    }}, {name:'<i class="fas fa-paperclip" aria-hidden="true"></i> ' + Translator.translate('Annexes'),callback:()=> {
        if (!this.form_view) return;
        //context.changed = true;
        context.signals.onAnnexModal.dispatch(context.form_operation_id);
    }}, {name:'<i class="fas fa-signature" aria-hidden="true"></i> ' + Translator.translate('Sign'),callback:()=> {
        if (!this.form_view) return;
        $("body").css("cursor","progress");
        this.save(() => {
            $("body").css("cursor","auto");
            context.signals.onSignModal.dispatch(context.form_operation_id, this.form_view);
        })

    }}, {name:'<span class="text-danger"><i class="fa fa-home" aria-hidden="true"></i> ' + Translator.translate('Back to Main') + '</span>',callback:()=> {
        if (context.changed /*|| this.context.new_operation*/) {
            context.signals.onAYS.dispatch(Translator.translate("Save changes?"), () => {
                this.save(() => {
                    this.exit(context.signals.onMain);
                });
            }, () => {
                this.exit(context.signals.onMain);
            });
        } else {
            this.exit(context.signals.onMain);
        }
    }}]
    )

    context.signals.saveOperation.add(() => {    
        this.save();
    });
    
}

FillForm.prototype = {

    show: function () {        
        this.title.show();
        $(FILL_FORM_NAME).text(this.context.form_name);
        $(FILL_OPERATION_NAME).text(this.context.form_operation_name);
        $(FILL_FORM_SECTION).collapse('show');
        $('#fill-form-spinner').show();
        // did we just went back? No, then ...
        if (this.form_id !== this.context.form_id) {    // REMOVE THIS IF - IF BACK, IT CLEARS ANYWAY
            this.clear();
            // create form
            this.loadForm(() => {
                console.log("LOAD FORM");
                // resume => fetch already existing data/state and set it up
                if (!this.context.new_operation) {
                    console.log("RESTORE");
                    this.restore();
                } else {
                    // always make the first save if new
                    this.save(null, true);
                    this.context.changed = true;    // no input yet
                }
            });
        } else {
            if (!this.form_id && !this.context.form_id) {
                $('#fill-form-spinner').hide();
                this.context.signals.onError.dispatch("Form is missing! Contact the administrator!","[FillForm::show]");
            }            
        }
    },




    /**
     * Parse and display all views.
     * @param {object} data Json object representing a form.
     */    
     setViews: function(data) {
        // clear signals iff new operation
        this.context.clearSignals();
        this.form_view = new FormViewBuilder($(FORM_VIEW)[0], data, this.context);
        this.list_view = new ListViewBuilder($(LIST_VIEW)[0], data, this.context);
        this.easystem = new EASystem(this.context).clear().setup(data['eas']);
        // always make the first save
        //this.save(null, true);
        this.list_view.createHeader(this.form_view.lv_header_elements);
    },

    /**
     * Resets everything ... including all form's contents.
     */
    clear: function() {
        //this.context.clear();
        this.form_id = null;
        this.easystem = null;
        this.form_view = null;
        this.list_view = null;
        this.saved_data_fv = null;
        $(FORM_VIEW).empty();
        $(LIST_VIEW).empty();
        console.log("---- CLEAR -----");
    },


    /**
     * Load a form from database.
     */
    loadForm: function(onReady = null) {
        $('#fill-form-spinner').show();
        this.form_id = this.context.form_id;
        const url = URL_GET_FORM + this.context.form_id + '/';
        fetchGET(url, 
            (result) => {
                const form = result.form;
                if (form && form !== '') {
                    this.setViews(form);
                    //this.save(null, true);
                    if (onReady) onReady();
                    $('#fill-form-spinner').hide();                    
                } else {
                    throw Error(Translator.translate("Invalid form"));
                }
            },
            (error) => {
                $('#fill-form-spinner').hide();
                this.context.signals.onError.dispatch(Translator.translate("Error when loading the form. Does it exists?"),
                "[FillForm::loadForm]");
            }
        );
    },


    /**
     * Save the all the form's values.
     * Only saves the inputs of the form view, since fields(form view) C fields(list view)
     */
    save: function(onReady = null, force=false) {
        // save iff something changed
        if (!this.context.changed && !force) {
            console.log("not saved");
            if (onReady) onReady();            
            return;
        }        
        console.log("saved");
        $('#fill-form-spinner').show();
        this.form_view.save().then(data => {
            this.saved_data_fv = data;
            fetchPOST(URL_UPDATE_OPERATION,
                {
                    operation_id: this.context.form_operation_id,
                    data: this.saved_data_fv,
                },
                (result) => {
                    $('#fill-form-spinner').hide();
                    // IN CASE FULL LOCAL OPERATIONS => ID < 0 => AFTER REMOTE SAVE => NEW ID > 0
                    // CHECK SERVICEWORKER.JS [URL_UPDATE_OPERATION, ...]
                    // WORKS BOTH FOR ONLINE AND OFFLINE
                    if (result.hasOwnProperty('operation_description')) {
                        this.context.form_operation_id = result.operation_description.id;
                    } else {
                        this.context.form_operation_id = result.id;
                    }                    
                    if (onReady) onReady();
                    this.context.changed = false;
                    console.log("SAVED > ", data);
                    //console.log(result);
                },
                (error) => {
                    $('#fill-form-spinner').hide();
                    this.context.signals.onError.dispatch(error,"[FillForm::save]");
                }
            );
        });
    },

    restore: function(onReady = null) {
        $('#fill-form-spinner').show();
        const url = URL_GET_OPERATION_DATA + this.context.form_operation_id + '/';        
        fetchGET(url, 
            (result) => {
                if (Object.entries(result).length > 0) {
                    // IN CASE FULL LOCAL OPERATIONS => ID < 0 => AFTER REMOTE SAVE => NEW ID > 0
                    // CHECK SERVICEWORKER.JS [URL_GET_OPERATION_DATA, ...]
                    if (result.hasOwnProperty('operation_id')) {
                        this.context.form_operation_id = result.operation_id;
                    }                     
                    if (!result.data) this.context.changed = true; 
                    this.saved_data_fv = result.data;
                    this.form_view.restore(this.saved_data_fv).then(() => {    
                        this.list_view.restore(this.saved_data_fv).then(() => {                            
                            if (onReady) onReady();
                            $('#fill-form-spinner').hide();
                            console.log("RESTORED >", this.saved_data_fv);
                        });
                    });
                }
            },
            (error) => {
                $('#fill-form-spinner').hide();
                this.context.signals.onError.dispatch(error,"[FillForm::restore]");
            })
    },

    close: function(onReady = null) {
        fetchPOST(URL_SET_OPERATION_STATUS,
            {
                operation_id: this.context.form_operation_id,
                status: "CLOSED",
            },
            (result) => {
                if (onReady) onReady();
            },
            (error) => {
                this.context.signals.onError.dispatch(error,"[FillForm::close]");
            }
        );
    },

    exit: function (signal) {
        $(FILL_FORM_SECTION).collapse('hide');
        this.title.hide();
        this.clear();
        this.context.clear();
        signal.dispatch();
    },
}

