
import { Modal, MODAL_SIZE } from '/static/js/modals/Modal.js';
import { Div, Img,
    Table, TableTr, TableTd,
} from '/static/js/ui/BuildingBlocks.js';
import { Alert } from '/static/js/ui/Alert.js';
import { Badge } from '/static/js/ui/Badge.js';
import { Translator } from '/static/js/Translator.js';
import { ERROR_IMAGE, WARNING_IMAGE, OK_IMAGE } from '/static/js/urls.js';
import { MESSAGE_ALL_OK } from '../validations/messages.js';
import { subStr } from '/static/js/jsutils.js';



/**
 * ValidationModal Modal.
 */
export class ValidationModal extends Modal { 

    /**
     * Constructor.
     * @param {string} title Title of the modal.
     * @param {string} help_text Helper text.
     * @param {Context} context Context.
     */
    constructor(title, help_text='', context) {
        super(title, help_text, MODAL_SIZE.LG); 

        this.has_messages = false;
        this.context = context;

        this.ok_btn.setTextContent(Translator.translate('Close'));

        this.no_data_alert = new Alert('danger',Translator.translate('NO DATA TO VALIDATE!')).attachTo(this.modal_body);
        this.no_data_alert.addClass('d-none')

        const resp = new Div().attachTo(this.modal_body);
        resp.addClass('table-responsive');
        this.validation_table = new Table({classes:['table','table-sm','borderless','mx-auto','w-auto']}).attachTo(resp);
        
    }

    /**
     * Show modal.
     * 
     * @param {object} validation_results 
     * @returns 
     */
    show(validation_results) {
        super.show();
        
        $(this.validation_table.dom).empty();
        this.has_messages = false;

        // no data to show
        if (!validation_results) {
            this.no_data_alert.addClass('d-block')
            return; 
        }
        
        this.no_data_alert.removeClass('d-block')

        $(this.validation_table.dom).empty();
        validation_results.elements.forEach(element => {
            if (!element.errors || !element.warnings) return true;
            this.displayValidationResult(element.id, element.name, element.label, element.errors, element.warnings);
            if (element.errors.length > 0 || element.warnings.length > 0)
                this.has_messages = true;
        })
        validation_results.groups.forEach(group => {
            if (!group.errors || !group.warnings) return true;
            this.displayValidationResult(group.id, group.name, null, group.errors, group.warnings);
            if (group.errors.length > 0 || group.warnings.length > 0)
                this.has_messages = true;
        })

    }
    
    displayValidationResult(id, name, label, errors, warnings) {
        console.log(id, errors, warnings);

        const row = new TableTr().attachTo(this.validation_table);
        const cell_1 = new TableTd().attachTo(row);
        const txt = subStr((label?label:name?name:''), 8, 16);        
        cell_1.setTextContent(txt + ' [' + id + ']');
        const cell_2 = new TableTd().attachTo(row);
        new Img(errors.length>0?ERROR_IMAGE:warnings.length>0?WARNING_IMAGE:OK_IMAGE,'32','32',{classes:['text-center']}).attachTo(cell_2);
        const cell_3 = new TableTd().attachTo(row);
        //cell_3.setTextContent(errors.length>0?errors:warnings.length>0?warnings:'');
        if (errors.length > 0) {
            errors.forEach(error => {
                const badge = new Badge('danger',error,'p-2').attachTo(cell_3);
                badge.addClass('mr-1');
            })
        }
        if (warnings.length > 0) {
            warnings.forEach(warning => {
                const badge = new Badge('warning',warning,'p-2').attachTo(cell_3);
                badge.addClass('mr-1');
            })
        }
        if (errors.length == 0 && warnings.length == 0) {
            const badge = new Badge('success',Translator.translate(MESSAGE_ALL_OK),'p-2').attachTo(cell_3);
            badge.addClass('mr-1');            
        }
    }

    
    
    /**
     * Hide modal.
     */
    hide() {
        super.hide();
    }
   
}


