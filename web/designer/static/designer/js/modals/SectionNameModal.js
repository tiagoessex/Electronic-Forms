
import { Modal } from '/static/js/modals/Modal.js';
import { InputGroupAppend } from '../ui/InputGroupAppend.js';
import { DEFAULT_SECTION_NAME } from '../sections/constants.js';
import { Translator } from '/static/js/Translator.js';

/**
 * Modal for setting the name of a section
 */
 export class SectionNameModal extends Modal { 

    /**
     * Constructor.
     * @param {string} title Title of the modal.
     * @param {string} help_text Helper text.
     * @param {function} addNewSection Callback to add a new section (see SectionsManage.js).
     * @param {Context} context Context
     */
    constructor(title, help_text='', addNewSection=null, context = null) {
        super(title, help_text);
        
        if (!addNewSection || addNewSection === undefined) {
            console.error('[SectionNameModal->SectionNameModal::ctor] - Missing addNewSection callback function!');
            throw Error('Missing addNewSection callback function!');
        } 
        if (!context || context === undefined) {
            console.error('[SectionNameModal->SectionNameModal::ctor] - Missing the context!');
            throw Error('Missing the context!');
        }   


        this.context = context;
        this.addNewSection = addNewSection;
        const self = this;

        this.input = new InputGroupAppend(
            'section-name-modal', 
            'section-name-modal', 
            null, 
            'text', 
            Translator.translate("Section's name"), 
            'fa fa-plus',
            'success',
            (value) => {
                if (value.replaceAll(' ','') === '') {
                    self.context.signals.onError.dispatch(Translator.translate("Invalid name! It must be something!"),"[SectionNameModal::InputGroupAppend]");
                } else if (value === DEFAULT_SECTION_NAME) {
                    self.context.signals.onError.dispatch(Translator.translate("Invalid name! Chose another name!"),"[SectionNameModal::InputGroupAppend]");
                } else {
                    self.addNewSection(value, false, false);
                }
        }).attachTo(this.modal_body);

        $(this.dom).on('shown.bs.modal', function (e) {
            self.input.focus();
        })

    }

}


