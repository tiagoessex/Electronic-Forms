
import { Modal } from '/static/js/modals/Modal.js';
import { ASSETTYPE } from '/static/js/assettype.js';
import { APP } from '/static/js/constants.js';
import { UploadAsset } from '/static/js/UploadAsset.js';
import { ClickOrDragFileInput } from "/static/js/modals/ClickOrDragFileInput.js";



/**
 * Modal for setting/removing a raster image to current page
 */
export class RasterModal extends Modal { 

    /**
     * Constructor.
     * @param {string} title Title of the modal.
     * @param {string} help_text Helper text.
     * @param {function} setRasterImage Callback to add a page (see PagesManager.js).
     * @param {Context} context Context.
     */
    constructor(title, help_text='', setRasterImage = null, context=null) {
        super(title, help_text); 
        
        if (!setRasterImage || setRasterImage === undefined) {
            console.error('[RasterModal->RasterModal::ctor] - Missing setRasterImage callback function!');
            throw Error('Missing setRasterImage callback function!');
        }
        if (!context || context === undefined) {
            console.error('[RasterModal->RasterModal::ctor] - Missing the context!');
            throw Error('Missing the context!');
        }   

        this.setRasterImage = setRasterImage;
        this.context = context;
        const self = this;

        new ClickOrDragFileInput('RM-raster-image-file', 'asset-file',  (file, data) => {
            context.signals.onChange.dispatch();
            UploadAsset(
                data, 
                self.context.properties.id,
                file.name, 
                ASSETTYPE.IMAGE, 
                APP.DESIGNER, 
                (result) => {
                    self.setRasterImage(result.asset);
                    //this.clear();
                    self.hide();
                }, 
                (error) => {
                    self.hide();
                    self.context.signals.onError.dispatch(error,"[RasterModal::UploadAsset]"); 
                }
            );
        }).attachTo(this.modal_body);
    }
}
