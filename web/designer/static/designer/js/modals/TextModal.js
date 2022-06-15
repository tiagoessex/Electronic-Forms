
import { Modal, MODAL_SIZE } from '/static/js/modals/Modal.js';
import { TextArea, Div, Label } from '/static/js/ui/BuildingBlocks.js';
import { Translator } from '/static/js/Translator.js';

/**
 * Modal for setting label/text.
 */
export class TextModal extends Modal { 

    /**
     * Constructor.
     * @param {string} title Title of the modal.
     * @param {string} help_text Helper text.
     * @param {function} nameChanged Called when Ok is pressed.
     * @param {Context} context Context
     */
    constructor(title, help_text='', nameChanged=null, context = null) {
        super(title, help_text, MODAL_SIZE.LG);
        
        if (!nameChanged || nameChanged === undefined) {
            console.error('[TextModal->TextModal::ctor] - Missing nameChanged callback function!');
            throw Error('Missing nameChanged callback function!');
        }
        if (!context || context === undefined) {
            console.error('[TextModal->TextModal::ctor] - Missing the context!');
            throw Error('Missing the context!');
        }   

        this.context = context;

        const self = this;

        const form_group = new Div().attachTo(this.modal_body);
        form_group.addClass('form-group');

        new Label(Translator.translate('Text/Label:')).attachTo(form_group);

        this.input = new TextArea().attachTo(form_group);
        this.input.addClass('form-control');

        // if some property was changed or is still temp, then  save 
        $(this.ok_btn.dom).on("click", function() {
            if (nameChanged) nameChanged(self.input.getValue());
        });

        $(this.dom).on('shown.bs.modal', function (e) {
            self.input.dom.focus();
        })

    }

    /**
     * Override - show model
     * @param {string} value Value already in place.
     */
    show(value = null) {
        if (value && value !== '') 
            this.input.setValue(value);
        else
            this.input.setValue('');
        super.show();
    }

}
