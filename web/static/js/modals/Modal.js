/**
 * Requires JQUERY
 * 
 */
import {Div, Hx, Button } from '../ui/BuildingBlocks.js';

/**
 * Modal sizes.
 */
export const MODAL_SIZE = {    
    XL: "-xl",
    LG: "-lg",
    SM: "-sm"
}

/**
 * Creates a barebone bootstrap 4 modal, with a single Ok button.
 */
export class Modal extends Div { 
    /**
     * Constructor.
     * @param {string} title Title of the modal.
     * @param {string} help_text Help text in the footer.
     */
    constructor(title='', help_text='', SIZE=null) {//SIZE=MODAL_SIZE.LG) {
        super(); 

        this.modal_helper = null;

		this.dom.className = 'Modal';
        this.addClass('modal fade');        
        this.setAttribute('tabindex','-1'); // to enable close by escape

        const modal_dialog = new Div().attachTo(this);
        modal_dialog.addClass('modal-dialog');
        modal_dialog.addClass('modal-dialog-scrollable');
        if (SIZE && SIZE !== '')
            modal_dialog.addClass('modal' + SIZE);

        this.modal_content = new Div().attachTo(modal_dialog);
        this.modal_content.addClass('modal-content');

        this.modal_header = new Div().attachTo(this.modal_content);
        this.modal_header.addClass('modal-header'); 

        this.modal_title = new Hx(4).attachTo(this.modal_header);
        this.modal_title.addClass('modal-title');
        this.modal_title.setTextContent(title)

        this.close_btn = new Button().attachTo(this.modal_header);
        this.close_btn.addClass('close');        
        this.close_btn.setAttribute('type', 'button');
        this.close_btn.setAttribute('data-dismiss', 'modal');
        this.close_btn.dom.innerHTML = "&times;"
        
        this.modal_body = new Div().attachTo(this.modal_content);
        this.modal_body.addClass('modal-body');

        const modal_footer = new Div().attachTo(this.modal_content);
        modal_footer.addClass('modal-footer d-flex justify-content-between');
  
        
        this.modal_helper = new Div().attachTo(modal_footer);
        this.modal_helper.addClass('float-left');
        this.modal_helper.setTextContent(help_text);

        this.ok_btn = new Button('Ok').attachTo(modal_footer);
        this.ok_btn.addClass('btn btn-primary');
        this.ok_btn.setAttribute('data-dismiss', 'modal');
    }

    /**
     * Show the modal.
     */
    show() {
        $(this.dom).modal('show');
    }

    /**
     * Hide the modal.
     */
    hide() {
        $(this.dom).modal('hide');
    }
}
