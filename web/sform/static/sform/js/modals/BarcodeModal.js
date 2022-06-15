
import { Modal, MODAL_SIZE } from '/static/js/modals/Modal.js';
import { FileInput2 } from "/static/js/ui/FileInput2.js";
import { Div, Text, Button } from '/static/js/ui/BuildingBlocks.js';
import { BarcodeDecoder } from '../BarcodeDecoder.js';
import { Translator } from '/static/js/Translator.js';


/**
 * Modal for barcode capture/read.
 */
export class BarcodeModal extends Modal { 

    /**
     * Constructor.
     * @param {string} title Modal title.
     * @param {string} helper Modal help text.
     */
    constructor(title, helper) {
        super(title, helper, MODAL_SIZE.LG); 

        const self = this;

        // setR and onE are set on show() => 1 modal / application even if n elements required it.
        this.setResults = null;
        this.onError = null;

        // resulting barcode
        this.code = null;
        // resulting image, either from local file or camera snapshoot
        this.file_image = null;
        // barcode decoder
        this.decoder = null;

        const group = new Div().attachTo(this.modal_body);
        group.addClass('btn-group d-flex');

        // if file input => show viewport, stop decoder if currently using camera and decode selected image.
        const file_input = new FileInput2('BCM-raster-image-file', 'asset-file',  (file, data) => {
            this.viewport.addClass('d-block');
            const imageurl = URL.createObjectURL(file);
            this.decoder.stop();
            this.decoder.decodeImage(imageurl);
        }, false, Translator.translate('Select/Take image ...'), 'primary',true).attachTo(group);
        file_input.addClass('my-3 w-100');
        //file_input.setStyle('min-height','100%');
        
        this.camera_btn = new Button(Translator.translate('Use PC Camera in RT')).attachTo(group);
        this.camera_btn.addClass('btn btn-outline-success my-3 w-100 font-weight-bold');

        // By default Quagga creates either a video ou a canvas component inside
        // the #interactive element.
        this.viewport = new Div().attachTo(this.modal_body);
        this.viewport.addClass('viewport d-none');
        this.viewport.setId('interactive');

        // display the resulting code.
        this.code_text = new Text().attachTo(this.modal_body);
        this.code_text.setStyle('background-color', 'black');
        this.code_text.setStyle('color', 'white');
        this.code_text.setStyle('text-align', 'center');
        this.code_text.addClass('my-2 d-none mx-auto');
        this.code_text.setStyle('width', '50%');

        //
        this.accept_btn = new Button(Translator.translate('Accept')).attachTo(this.modal_body);
        this.accept_btn.addClass('btn btn-success my-2 d-none mx-auto');
        this.accept_btn.setStyle('width', '25%');

        // errors display
        this.alert = new Div({classes:['alert','alert-danger','text-center','d-none']}).attachTo(this.modal_body);
        this.alert.setAttribute('role','alert');       

        // 
        this.decoder = new BarcodeDecoder((code, file_image) => {
            self.alert.removeClass('d-block');
            self.code_text.setTextContent(code);
            self.code_text.addClass('d-block');
            self.accept_btn.addClass('d-block');
            self.code = code;
            self.file_image = file_image;
        }, (error) => {
            self.code_text.removeClass('d-block');
            self.accept_btn.removeClass('d-block');
            self.alert.addClass('d-block');
            self.alert.setTextContent(error);
        });
        
        // accept btn => send code + image.
        $(this.accept_btn.dom).on('click', function() {
            if (self.setResults) self.setResults(self.code, self.file_image);
            self.hide();
         });

        // if camera => show viewport, start Quagga in livestream mode.
        $(this.camera_btn.dom).on('click', function() {
            self.viewport.addClass('d-block');
            self.code_text.removeClass('d-block');
            self.accept_btn.removeClass('d-block');
            self.alert.removeClass('d-block');
            self.decoder.init();
        });


        $(this.dom).on('hidden.bs.modal', function (e) {            
            self.hide();
        })
        
    }

    /**
     * Show modal.
     * @param {function} setResults On result, call function.
     * @param {function} onError On error, call function.
     */
    show(setResults, onError) {
        super.show();
        this.setResults = setResults;
        this.onError = onError;
    }
    
    /**
     * Hide modal.
     */
    hide() {
        super.hide();
        this.code_text.removeClass('d-block');
        this.accept_btn.removeClass('d-block');
        this.viewport.removeClass('d-block');
        this.alert.removeClass('d-block');
        this.decoder.stop();
    }    

}
