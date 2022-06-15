
import { Modal } from '/static/js/modals/Modal.js';
import { ASSETTYPE } from '/static/js/assettype.js';
import { ClickOrDragFileInput } from "/static/js/modals/ClickOrDragFileInput.js";
import { APP } from '/static/js/constants.js';
import { UploadAsset } from '/static/js/UploadAsset.js';
import { getFileFromUrl } from '/static/js/urls.js';

/**
 * Modal for selecting an image.
 */
export class ImageModal extends Modal { 

    /**
     * Constructor.
     * @param {string} title Title of the modal.
     * @param {string} help_text Helper text.
     * @param {function} setImage Callback to set the image.
     * @param {Context} context Context
     */
    constructor(title, help_text='', setImage = null, context = null) {
        super(title, help_text); 

        if (!setImage || setImage === undefined) {
            console.error('[ImageModal->ImageModal::ctor] - Missing setImage callback function!');
            throw Error('Missing setImage callback function!');
        } 
        if (!context || context === undefined) {
            console.error('[ImageModal->ImageModal::ctor] - Missing the context!');
            throw Error('Missing the context!');
        } 

        this.setImage = setImage;
        this.context = context;
        const self = this;

        new ClickOrDragFileInput('IM-raster-image-file', 'asset-file',  (file, data) => {
            context.signals.onChange.dispatch();
            UploadAsset(
                data, 
                self.context.properties.id,
                file.name, 
                ASSETTYPE.IMAGE, 
                APP.DESIGNER, 
                (result) => {
                    // get only the asset stored filename
                    const file = getFileFromUrl(result.asset);
                    self.setImage(result.asset,file);
                    self.hide();
                }, 
                (error) => {
                    self.hide();
                    self.context.signals.onError.dispatch(error,"[ImageModal::UploadAsset]");   
                }
            );
        }).attachTo(this.modal_body);        
    }

    /**
     * Override - show model
     */
    show() {
        super.show();
    }
}


