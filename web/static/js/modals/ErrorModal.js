
import { Hx, Div, Img } from '../ui/BuildingBlocks.js';
import { Modal } from './Modal.js';
import { ERROR_IMAGE } from  '../urls.js';
import { Translator } from '/static/js/Translator.js';


/**
 * Modal for displaying error messages.
 */
export class ErrorModal extends Modal { 

    /**
     * Constructor.
     * @param {string} title Title of the modal.
     * @param {string} help_text Helper text.
     */
    constructor() {
        super(Translator.translate('ERROR!'));

        this.modal_header.addClass('text-white bg-danger');
        this.close_btn.addClass('text-white');
        this.close_btn.setStyle('color','white');
        this.ok_btn.removeClass('btn-primary');
        this.ok_btn.addClass('btn-danger');        
        this.setStyle("z-index",9999999999);

        const row = new Div().attachTo(this.modal_body);
        row.addClass('row');
        const img_col = new Div().attachTo(row);
        img_col.addClass('col-2');
        //img_col.addClass('my-auto');  // vertically center
        const question_img = new Img(ERROR_IMAGE, 64, 64).attachTo(img_col);
        question_img.addClass('mx-auto d-block');

        const msg_col = new Div().attachTo(row);
        msg_col.addClass('col-10');

        this.message = new Hx(4).attachTo(msg_col);
    }

    show(msg) {
      console.error(msg);
      this.message.setTextContent(msg);
      super.show();
    }

  }