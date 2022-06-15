/**
 *  ---- TODO:
 *          - DRY
 */

import { TITLE_OPERATION_DETAILS } from "../constants.js";
import {    
    OPERATION_DETAILS_SECTION,
    FORM_NAME_2_MAIN_BTN,
    FORM_NAME_OK_BTN,
    FORM_OPERATION_NAME,
    FORM_NAME,
    FORM_OPERATION_DESCRIPTION,
    FORM_NAME_ALERT,
    BACK_BTN,
} from "../ids.js";
import { Title } from '../Title.js';
import { URL_NEW_OPERATION, URL_UPDATE_OPERATION } from '/static/js/urls.js';
import { fetchPOST } from '/static/js/Fetch.js';
import { Translator } from '/static/js/Translator.js';


export function OperationDetails(context) {
    this.context = context;
    const ref = this;

    this.title = new Title(TITLE_OPERATION_DETAILS, () => {
        if (!context.new_operation) {
            context.signals.onAYS.dispatch(Translator.translate("Leave the current operation and discard any changes?"), () => {
                $(OPERATION_DETAILS_SECTION).collapse('hide');
                this.title.hide();
                if (context.resume)
                    context.signals.onFillForm.dispatch();
                else
                    context.signals.onFormSelection.dispatch();
            }, () => {
                
            });
        } else {
            $(OPERATION_DETAILS_SECTION).collapse('hide');
            this.title.hide();
            context.signals.onFormSelection.dispatch();  
        }    
    });

    $(FORM_OPERATION_NAME).on("change paste keyup", function() {
        $(FORM_NAME_ALERT).collapse('hide');
    });

    $(FORM_NAME_2_MAIN_BTN).on('click', function(e) {

        $(OPERATION_DETAILS_SECTION).collapse('hide');
        ref.title.hide();
        if (context.new_operation)
            context.signals.onMain.dispatch();
        else
            context.signals.onFillForm.dispatch();

    });
    $(FORM_NAME_OK_BTN).on('click', function(e) {
        if ($(FORM_OPERATION_NAME).val() === '') {
            $(FORM_NAME_ALERT).collapse('show');
        } else {
            ref.context.form_operation_name = $(FORM_OPERATION_NAME).val();
            ref.context.form_operation_description = $(FORM_OPERATION_DESCRIPTION).val();
            if (ref.context.new_operation) {
                ref.new(() => {
                    $(FORM_NAME_ALERT).collapse('hide');    
                    $(OPERATION_DETAILS_SECTION).collapse('hide');
                    ref.title.hide();
                    context.signals.onFillForm.dispatch();
                });
            } else {
                fetchPOST(URL_UPDATE_OPERATION,
                    {
                        operation_id: ref.context.form_operation_id,
                        name: ref.context.form_operation_name,
                        description: ref.context.form_operation_description,
                    },
                    (result) => {
                        $(FORM_NAME_ALERT).collapse('hide');    
                        $(OPERATION_DETAILS_SECTION).collapse('hide');
                        ref.title.hide();
                        context.signals.onFillForm.dispatch();
                    },
                    (error) => {
                        this.context.signals.onError.dispatch(error,"[OperationDetails::ctor]");
                    }
                );

            }
        }
    });
}

OperationDetails.prototype = {

    /**
     * Show the screen.
     */
    show: function () {

        $(FORM_OPERATION_NAME).val(this.context.form_operation_name);
        $(FORM_OPERATION_DESCRIPTION).val(this.context.form_operation_description);
        $(FORM_NAME).val(this.context.form_name);

        this.title.show();
        $(OPERATION_DETAILS_SECTION).collapse('show');
        $(FORM_OPERATION_NAME).focus();    
        $(BACK_BTN).collapse('show');        
    },


    /**
     * Create new operation.
     * @param {function} onReady Function to be called when fetch completed.
     */
    new: function(onReady = null) {

        fetchPOST(URL_NEW_OPERATION,
            {
                form_id: this.context.form_id,
                name: this.context.form_operation_name,
                description: this.context.form_operation_description,
            },
            (result) => {
                this.context.form_operation_id = result.id;
                if (onReady) onReady();
            },
            (error) => {
                this.context.signals.onError.dispatch(error,"[OperationDetails::new]");
            }
        );
    },
}

