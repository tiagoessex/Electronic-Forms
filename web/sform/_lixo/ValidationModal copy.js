
import { Modal, MODAL_SIZE } from '/static/js/modals/Modal.js';
import { Div, Button, Hx, Img,
    Table, TableTr, TableTd,
} from '/static/js/ui/BuildingBlocks.js';
import { Alert } from '/static/js/ui/Alert.js';
import { Badge } from '/static/js/ui/Badge.js';
import { Translator } from '/static/js/Translator.js';
import { ERROR_IMAGE, WARNING_IMAGE, OK_IMAGE } from '/static/js/urls.js';


const MESSAGE_NO_DATABASE_FIELD = 'No Database Field defined!';
const MESSAGE_NO_VALUE = 'No value!';
const MESSAGE_INCORRECT_FORMAT = 'Incorrect format!';
const MESSAGE_NO_UPPERCASE = 'No uppercase!';
const MESSAGE_LENGTH_EXCEEED = 'Max length exceed!';
const MESSAGE_MAX_EXCEEDED = 'Max value exceeded!';
const MESSAGE_MIN_EXCEEDED = 'Min value exceeded!';
const MESSAGE_NOTHING_SELECTED = 'No value selected!';
const MESSAGE_ALL_OK = 'OK!';



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

        const ref = this;
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
     * @param {object} data 
     * @returns 
     */
    show(data) {
        super.show();
        
        this.has_messages = false;

         // no data to show
        if (!data || !data.hasOwnProperty('elements')) {
            this.no_data_alert.addClass('d-block')
            return; 
        }

        $(this.validation_table.dom).empty();
        data.elements.forEach(element => {
            const [errors, warnings] = this.validate(element, element.validations);
            if (!errors && !warnings) return true;
            this.displayValidationResult(element.id, element.name, element.label, errors, warnings);
            if (errors.length > 0 || warnings.length > 0)
                this.has_messages = true;
        })
        data.radios_checkboxes.forEach(element => {
            const [errors, warnings] = this.validateGroup(element);
            //if (!errors && !warnings) return true;
            this.displayValidationResult(element.id, element.name, null, errors, warnings);
            if (errors.length > 0 || warnings.length > 0)
                this.has_messages = true;
        })

    }
    
    displayValidationResult(id, name, label, errors, warnings) {
        console.log(id, errors, warnings);

        const row = new TableTr().attachTo(this.validation_table);
        const cell_1 = new TableTd().attachTo(row);
        cell_1.setTextContent((label?label:name?name:'') + ' [' + id + ']');
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
            const badge = new Badge('success',MESSAGE_ALL_OK,'p-2').attachTo(cell_3);
            badge.addClass('mr-1');            
        }
    }

    validateGroup(element) {
        const enabled = element.enabled;
        const visible = element.visible;
        if (!(enabled && visible)) return [null, null];        
        const error_messages = [];
        const warning_messages = [];
        if (element.required === 'true' && element.selected_elements.length == 0) {
            error_messages.push(MESSAGE_NOTHING_SELECTED);
        }
        return [error_messages, warning_messages];
    }

    validate(element, validations) {
        const value = element.value;
        const enabled = element.enabled;
        const visible = element.visible;
        if (!(enabled && visible)) return [null, null];
        const type = typeof value;
        const error_messages = [];
        const warning_messages = [];
        let _value = value;
        if (value) {
            if (type === 'object') {
                // if gps
                if (value.hasOwnProperty('lat') && value.lat) {
                    _value = str(value.lat) + ',' + str(value.lng);
                } else
                    _value = null;
                // if barcode
                if (value.hasOwnProperty('code') && value.code) {
                    _value = value.code;
                } else
                    _value = null;
            }
        }
        if (!_value && validations.required === 'yes') {
            error_messages.push(MESSAGE_NO_VALUE);
        } else if (!_value) {
            warning_messages.push(MESSAGE_NO_VALUE);
        }

        if (validations.hasOwnProperty('uppercase') && validations.uppercase === 'yes') {
            if (_value && _value !== _value.toUpperCase())
                error_messages.push(MESSAGE_NO_UPPERCASE);
        }

        if (validations.hasOwnProperty('max-length')) {
            if (_value && _value.length > validations['max-length'])
                error_messages.push(MESSAGE_LENGTH_EXCEEED);
        }
        
        if (element.hasOwnProperty('database') && !element.database) {
            warning_messages.push(MESSAGE_NO_DATABASE_FIELD);            
        }

        if (validations.hasOwnProperty('max') && _value > validations.max) {
            error_messages.push(MESSAGE_MAX_EXCEEDED);
        }
        if (validations.hasOwnProperty('min') && _value < validations.min) {
            error_messages.push(MESSAGE_MIN_EXCEEDED);
        }

        if (validations.hasOwnProperty('pattern') && validations.pattern) {
            if (_value && !_value.match(validations.pattern))
                error_messages.push(MESSAGE_INCORRECT_FORMAT);
        }
        
        return [error_messages, warning_messages];
    }
    
    
    /**
     * Hide modal.
     */
    hide() {
        super.hide();
    }
   
}


