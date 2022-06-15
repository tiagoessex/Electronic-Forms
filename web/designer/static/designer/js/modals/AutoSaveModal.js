
import { Modal, MODAL_SIZE } from '/static/js/modals/Modal.js';
import { RadioCheckInput } from '/static/js/ui/RadioCheckInput.js';
import { FormGroupInput } from '../ui/FormGroupInput.js';
import { Translator } from '/static/js/Translator.js';

/**
 * Auto save configuration modal.
 */
export class AutoSaveModal extends Modal { 

    /**
     * Constructor.
     * @param {string} title Title of the modal.
     * @param {string} help_text Helper text.
     * @param {function} setTimer Called when a new time is set and started.
     * @param {function} stopTimer Called when timer stops.
     */
    constructor(title, help_text='', setTimer=null, stopTimer=null) {
        super(title, help_text, MODAL_SIZE.LG); 

        if (!setTimer || setTimer === undefined) {
            console.error('[AutoSaveModal->setTimer::ctor] - Missing setTimer callback function!');
            throw Error('Missing setTimer callback function!');
        } 

        if (!stopTimer || stopTimer === undefined) {
            console.error('[AutoSaveModal->stopTimer::ctor] - Missing the stopTimer callback function!');
            throw Error('Missing the stopTimer callback function!');
        } 

        this.activate = false;
        const self = this;

        const check =  new RadioCheckInput("checkbox", null, Translator.translate('Auto Save'), null, 'asm-auto-save', false).attachTo(this.modal_body);
        check.addClass('mb-3');

        const time = new FormGroupInput('asm_input_time', null, 5, Translator.translate('Minutes between saves:'), 'number', Translator.translate('Time in minutes')).attachTo(this.modal_body);
        time.enable(false);
        time.input.setAttribute('max','30');
        time.input.setAttribute('min','1');

        $(check.input.dom).on('change',function(){
            if ($(this).is(':checked')) {
                time.enable(true);
                self.activate = true;
                time.focus();
            } else {
                time.enable(false);
                self.activate = false;
            }            
        });

        $(this.ok_btn.dom).on('click', function(e) {  
            if (self.activate && setTimer) {
                setTimer(time.input.dom.value * 1000 * 60);
            } else if (!self.activate && stopTimer) {
                stopTimer();
            }
        } );
                
    }
}


