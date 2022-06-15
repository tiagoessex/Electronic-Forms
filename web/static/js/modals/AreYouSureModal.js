import { Div, Hx, Button, Img } from '../ui/BuildingBlocks.js';
import { QUESTION_MARK_IMAGE } from  '../urls.js';
import { Translator } from '/static/js/Translator.js';


/**
 * Are you sure dialog modal, with 2 buttons: Yes | No.
 */
export class AreYouSureModal extends Div { 
    /**
     * Constructor.
     * @param {function} ok_callback Function to call when Ok button.
     * @param {function} cancel_callback Function to call when Cancel button.
     */
    constructor(ok_callback=null, cancel_callback=null) {
        super(); 

        this.ok_callback = ok_callback;
        this.cancel_callback = cancel_callback;        
        const context = this;

		this.dom.className = 'AYSModal';
        this.addClass('modal fade');
        this.setStyle("z-index",9999999999);

        const modal_dialog = new Div().attachTo(this);
        modal_dialog.addClass('modal-dialog');
        //modal_dialog.addClass('modal-dialog-centered');

        const modal_content = new Div().attachTo(modal_dialog);
        modal_content.addClass('modal-content');

        const modal_header = new Div().attachTo(modal_content);
        modal_header.addClass('modal-header bg-info'); 
        const modal_title = new Hx(4).attachTo(modal_header);
        modal_title.addClass('modal-title text-white');
        modal_title.setTextContent(Translator.translate('CONFIRM!'));
        const close_btn = new Button().attachTo(modal_header);
        close_btn.addClass('close text-white');
        close_btn.setAttribute('type', 'button');
        close_btn.setAttribute('data-dismiss', 'modal');
        close_btn.dom.innerHTML = "&times;"

        
        const modal_body = new Div().attachTo(modal_content);
        modal_body.addClass('modal-body');

        const row = new Div().attachTo(modal_body);
        row.addClass('row');

        const img_col = new Div().attachTo(row);
        img_col.addClass('col-2');
        //img_col.addClass('my-auto');  // vertically center
        const question_img = new Img(QUESTION_MARK_IMAGE, 64, 64).attachTo(img_col);
        question_img.addClass('mx-auto d-block');

        const msg_col = new Div().attachTo(row);
        msg_col.addClass('col-10');
        this.text = new Hx(4).attachTo(msg_col);
        //this.text.addClass('text-center');    // center message text
        this.text.setTextContent(Translator.translate('Are you sure?'));

        const modal_footer = new Div().attachTo(modal_content);
        modal_footer.addClass('modal-footer d-flex justify-content-center');


        this.ok_btn = new Button(' ' + Translator.translate('Yes'),'fa fa-times').attachTo(modal_footer);
        this.ok_btn.addClass('btn btn-danger');
        this.ok_btn.setAttribute('data-dismiss', 'modal');
        this.ok_btn.setStyle('width','100px');

        this.cancel_btn = new Button(' ' + Translator.translate('No'),'fa fa-times').attachTo(modal_footer);
        this.cancel_btn.addClass('btn btn-primary');
        this.cancel_btn.setAttribute('data-dismiss', 'modal');
        this.cancel_btn.setStyle('width','100px');

        $(this.ok_btn.dom).on('click', function() {
            if (context.ok_callback)
                context.ok_callback();
        });
        $(this.cancel_btn.dom).on('click', function() {
            if (context.cancel_callback)
                context.cancel_callback();
        });

    }

    /**
     * Show [and set] the modal.
     * @param {string} text Text message.
     * @param {function} ok_callback Called if Ok button.
     * @param {function} cancel_callback Called if Cancel/No button.
     */
    show(text=null, ok_callback=null, cancel_callback=null) {      
        if (text) {
            this.text.setTextContent(text);
        }
        if (ok_callback)
            this.ok_callback = ok_callback;
        if (cancel_callback)            
            this.cancel_callback = cancel_callback;

        $(this.dom).modal('show');
    }

    /**
     * Hide the modal.
     */
    hide() {
        $(this.dom).modal('hide');
    }
}



