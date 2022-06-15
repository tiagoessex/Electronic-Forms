
import { Modal, MODAL_SIZE } from '/static/js/modals/Modal.js';
import { Div, Button, Hx, Img,
    Table, TableTr, TableTd,
} from '/static/js/ui/BuildingBlocks.js';
import { Alert } from '/static/js/ui/Alert.js';
import { Badge } from '/static/js/ui/Badge.js';
import { URL_VALIDATE_SAVE_DATA } from '/static/js/urls.js';
import { fetchPOST } from '/static/js/Fetch.js';
import { Translator } from '/static/js/Translator.js';
import { ERROR_IMAGE, WARNING_IMAGE, OK_IMAGE } from '/static/js/urls.js';


const ERROR_MESSAGE_NO_DATABASE_FIELD = 'No Database Field defined!';
const ERROR_MESSAGE_NO_VALUE = 'No value!';
const ERROR_MESSAGE_INCORRECT_FORMAT = 'Incorrect format!';
const ERROR_MESSAGE_NO_UPPERCASE = 'No uppercase!';
const ERROR_MESSAGE_LENGTH_EXCEEED = 'Max length exceed!';
const ERROR_MESSAGE_MAX_EXCEEDED = 'Max value exceeded!';
const ERROR_MESSAGE_MIN_EXCEEDED = 'Min value exceeded!';




/**
 * Database Transfer Modal.
 */
export class DatabaseTransferModal extends Modal { 

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

        this.no_data_alert = new Alert('danger',Translator.translate('NO DATA TO TRANSFER')).attachTo(this.modal_body);
        this.no_data_alert.addClass('d-none')

        this.validations_title = new Hx(3).attachTo(this.modal_body);
        this.validations_title.setTextContent(Translator.translate('Client side validations:'));
        this.validations_title.addClass('d-none')

        this.no_save = new Alert('danger',Translator.translate('THERE ARE CRITICAL ERRORS! NO DATA WAS SAVED!')).attachTo(this.modal_body);
        this.no_save.addClass('d-none text-center font-weight-bold');
        
        this.saved = new Alert('success',Translator.translate('NO ERRORS! DATA WAS SAVED SUCCESSFULLY!')).attachTo(this.modal_body);
        this.saved.addClass('d-none text-center font-weight-bold');

        const resp = new Div().attachTo(this.modal_body);
        resp.addClass('table-responsive');
        this.validation_table = new Table({classes:['table','table-sm','borderless','mx-auto','w-auto']}).attachTo(resp);


        
        this.send_btn = new Button(Translator.translate('Send to Database')).attachTo(this.modal_body);
        this.send_btn.addClass('btn btn-success my-2 anim-btn d-none mx-auto');
        //this.send_btn.addClass('d-flex');
        this.send_btn.addClass('justify-content-center');        
        this.send_btn.setStyle('width', '50%');

        this.ig_send_btn = new Button(Translator.translate('Ignore messages and send anyway')).attachTo(this.modal_body);
        this.ig_send_btn.addClass('btn btn-warning my-2 anim-btn d-none mx-auto justify-content-center');
       // this.ig_send_btn.addClass('d-flex');
        this.ig_send_btn.setStyle('width', '50%');



        
        const self = this;
        $(this.send_btn.dom).on('click', function() {
            self.sendData();
        })
        $(this.ig_send_btn.dom).on('click', function() {
            self.sendData();
        })

    }

    /**
     * Show modal.
     * 
     * @param {number} operation_id Operation ID.
     * @param {object} data 
     * @returns 
     */
    show(operation_id, data) {
        super.show();
        
        this.validations_title.setTextContent(Translator.translate('Client side validations:'));
        this.has_messages = false;
        this.ig_send_btn.removeClass('d-block');
        this.send_btn.removeClass('d-block');
        this.no_save.removeClass('d-block');
        this.saved.removeClass('d-block');


         // no data to show
        if (!data || !data.hasOwnProperty('elements')) {
            this.no_data_alert.addClass('d-block')
            return; 
        }

        this.operation_id = operation_id;

        $(this.validation_table.dom).empty();
        
        this.validations_title.addClass('d-block')
        data.elements.forEach(element => {
            const [errors, warnings] = this.validate(element, element.validations);
            this.displayValidationResult(element.id, errors, warnings);
            if (errors.length > 0 || warnings.length > 0)
                this.has_messages = true;
        })

        if (this.has_messages) {
            this.ig_send_btn.addClass('d-block');
        } else {
            this.send_btn.addClass('d-block');
        }
    }
    
    displayValidationResult(id, errors, warnings) {
        console.log(id, errors, warnings);

        const row = new TableTr().attachTo(this.validation_table);
        const cell_1 = new TableTd().attachTo(row);
        cell_1.setTextContent(id);
        const cell_2 = new TableTd().attachTo(row);
        new Img(errors.length>0?ERROR_IMAGE:warnings.length>0?WARNING_IMAGE:OK_IMAGE,'32','32',{classes:['text-center']}).attachTo(cell_2);
        const cell_3 = new TableTd().attachTo(row);
        //cell_3.setTextContent(errors.length>0?errors:warnings.length>0?warnings:'');
        if (errors.length > 0) {
            errors.forEach(error => {
                const badge = new Badge('danger',error).attachTo(cell_3);
                badge.addClass('mr-1');
            })
        }
        if (warnings.length > 0) {
            warnings.forEach(warning => {
                const badge = new Badge('warning',warning).attachTo(cell_3);
                badge.addClass('mr-1');
            })
        }
    }

    validate(element, validations) {
        const value = element.value;
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
            error_messages.push(ERROR_MESSAGE_NO_VALUE);
        } else if (!_value) {
            warning_messages.push(ERROR_MESSAGE_NO_VALUE);
        }

        if (validations.hasOwnProperty('uppercase') && validations.uppercase === 'yes') {
            if (_value && _value !== _value.toUpperCase())
                error_messages.push(ERROR_MESSAGE_NO_UPPERCASE);
        }

        if (validations.hasOwnProperty('max-length')) {
            if (_value && _value.length > validations['max-length'])
                error_messages.push(ERROR_MESSAGE_LENGTH_EXCEEED);
        }
        
        if (element.hasOwnProperty('database') && !element.database) {
            error_messages.push(ERROR_MESSAGE_NO_DATABASE_FIELD);            
        }

        if (validations.hasOwnProperty('max') && _value > validations.max) {
            error_messages.push(ERROR_MESSAGE_MAX_EXCEEDED);
        }
        if (validations.hasOwnProperty('min') && _value < validations.min) {
            error_messages.push(ERROR_MESSAGE_MIN_EXCEEDED);
        }

        if (validations.hasOwnProperty('pattern') && validations.pattern) {
            if (_value && !_value.match(validations.pattern))
                error_messages.push(ERROR_MESSAGE_INCORRECT_FORMAT);
        }


        
        return [error_messages, warning_messages];
    }
    
    
    /**
     * Hide modal.
     */
    hide() {
        super.hide();
    }

    sendData() {
        fetchPOST(URL_VALIDATE_SAVE_DATA,
            {
                operation_id: this.operation_id,
            },
            (result) => {
                this.validations_title.setTextContent(Translator.translate('Server side validations:'));
                this.has_messages = false;
                this.ig_send_btn.removeClass('d-block');
                this.send_btn.removeClass('d-block');        
                $(this.validation_table.dom).empty();
                let hasErrors = false;
                result.forEach(element => {
                    this.displayValidationResult(element.id, element.errors, element.warnings);
                    if (element.errors.length > 0) hasErrors = true;
                })

                if (hasErrors) {
                    this.no_save.addClass('d-block')
                } else {
                    this.saved.addClass('d-block')
                }
            },
            (error) => {
                this.context.signals.onError.dispatch(error,"[DatabaseTransferModal::sendData]");
            }
        );
    }

}


