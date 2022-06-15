
import { FormBaseElement } from './FormBaseElement.js';
import { Img, AwesomeIconAndButton, Div, Text } from '/static/js/ui/BuildingBlocks.js';
import { PROPERTIES_ID } from '/static/designer/js/constants/constants.js';
import { BARCODE_INPUT } from '/static/js/urls.js';
import { HEXtoRGBA } from '/static/js/jscolor.js';
import { ASSETTYPE } from '/static/js/assettype.js';
import { URL_OPERATION_UPLOAD_ASSET } from '/static/js/urls.js';
import { fetchPOST } from '/static/js/Fetch.js';
import { getFileFromUrl, URL_OPERATIONS_ASSETS } from '/static/js/urls.js';
import { loadImage2Dom } from '/static/js/jshtml.js';


export class BarcodeImageElement extends FormBaseElement {
    constructor(context, props, id) {
        super(context, props);

        this.value = {code: null, image: null};
        this.enabled = true;
        this.context = context;
        

        const _enabled = props[PROPERTIES_ID.ENABLEDPROPERTY] === 'yes';
        const height = props[PROPERTIES_ID.HEIGHTPROPERTY];
        const width = props[PROPERTIES_ID.WIDTHPROPERTY];
        const backcolor = props[PROPERTIES_ID.BACKCOLORPROPERTY];
        const color = props[PROPERTIES_ID.COLORPROPERTY];
        const border = props[PROPERTIES_ID.BORDERPROPERTY];
        const border_radius = props[PROPERTIES_ID.BORDERRADIUSPROPERTY];
        const border_width = props[PROPERTIES_ID.BORDERWIDTHPROPERTY];
        const back_alpha = props[PROPERTIES_ID.BACKALPHAPROPERTY];

        const div = new Div().attachTo(this);
        div.setStyle('position','relative');

        this.img = new Img(BARCODE_INPUT, width, height).attachTo(div);
        this.img.setStyle('border', border);
        this.img.setStyle('border-color', color);
        this.img.setStyle('border-width', border_width + 'px');
        this.img.setStyle('border-radius', border_radius + 'px');
        this.img.setStyle('-webkit-border-radius', border_radius + 'px');
        this.img.setStyle('-moz-border-radius', border_radius + 'px');   
        this.img.setStyle("background-color", HEXtoRGBA(backcolor, back_alpha));
        this.img.setStyle('color', color);
        this.img.setId(id);
        
        this.button = new AwesomeIconAndButton('','fas fa-times').attachTo(div);
        this.button.addClass('fv-remove-button no-print');
        this.button.setStyle('display','none');

        this.code = new Text('----------').attachTo(div);
        this.code.addClass('fv-center-info');
        this.code.setStyle('display','none');

        if (context.isExport) return;
        
        const ref = this;
        $(this.img.dom).on('click', function(e) {
            if (!ref.enabled) return false;
            context.signals.onBarcodeReader.dispatch((code, image) => {
                ref.button.setStyle('display','inline');
                ref.code.setValue(code);
                ref.value.code = code;
                ref.code.setStyle('display','inline');
                
                if (context.is_preview) {
                    $(ref.img.dom).fadeIn("fast").attr('src',image);
                    //ref.value.image = image;    // ************** //
                    context.signals.onFormValueChanged.dispatch(ref.real_id, image, code, false); 
                    return false;
                }
               
                const name = "barcode_" + ref.real_id + "_" + context.form_operation_id + ".png"; 
                const data = {
                    id: context.form_operation_id, 
                    name: name,
                    type: ASSETTYPE.IMAGE,
                    file: image,//.toDataURL("image/png"),
                };
                fetchPOST(URL_OPERATION_UPLOAD_ASSET,
                    data,
                    (result) => {
                        $(ref.img.dom).fadeIn("fast").attr('src',result.asset);
                        ref.value.image = result.asset;
                        context.signals.onFormValueChanged.dispatch(ref.real_id, result.asset, code, false); 
                    },
                    (error) => {
                        context.signals.onError.dispatch(error,"[BarcodeImageElement::ctor]");
                    }
                ); 
            }, error => {
                context.signals.onError.dispatch(error,"[BarcodeImageElement::ctor]");
            }); 
        })


         $(this.button.dom).on('click',function() {
            $(ref.img.dom).attr('src',BARCODE_INPUT);
            ref.button.setStyle('display','none');
            ref.code.setStyle('display','none');
            ref.value.image = null;
            ref.value.code = null;
            context.signals.onFormValueChanged.dispatch(ref.real_id, BARCODE_INPUT, null, true); 
         });

         if (!_enabled) {
            this.enabled = false;
            this.button.setAttribute('disabled','');
            this.img.addClass('elementdisabled');
         }


        context.signals.onEnabled.add((id) => {
            if (id === this.real_id || id === this.section) {
                this.enabled = true;
                this.button.removeAttribute('disabled');
                this.img.removeClass('elementdisabled');
            }
        })
        context.signals.onDisabled.add((id) => {
            if (id === this.real_id || id === this.section) {
                this.enabled = false;
                this.button.setAttribute('disabled','');
                this.img.addClass('elementdisabled');
            }
        })

        context.signals.onListValueChanged.add((id, value, code, reset) => {
            if (id === this.real_id) {
                if (reset) {
                    this.button.setStyle('display','none');
                    this.code.setStyle('display','none');
                    this.value.image = null;
                } else {
                    this.button.setStyle('display','inline');
                    this.code.setStyle('display','inline');
                    this.code.setValue(code);
                    this.value.image = value;                    
                }
                this.value.code = code;
                $(ref.img.dom).fadeIn("fast").attr('src',value);                
            }
        })
    }

    save() {
        super.save();
        this.status.value = this.value;
        this.status.value.image = getFileFromUrl(this.status.value.image);
        this.status.enabled = this.enabled;//!this.img.hasAttribute('disabled');
        return new Promise((resolve) => resolve(this.status));
    }

    async restore(data) {
        super.restore(data);
        this.value = this.status.value?this.status.value:this.value;
        if (this.value && this.value.image) {
            this.button.setStyle('display','inline');
            this.code.setStyle('display','inline');
            /*
            const file = await loadImage(URL_OPERATIONS_ASSETS + this.context.form_operation_id + '/' + this.value.image);
            //const file = URL_OPERATIONS_ASSETS + this.context.form_operation_id + '/' + this.value.image;
            $(this.img.dom).attr('src',file);
            */
            await loadImage2Dom(this.img.dom, URL_OPERATIONS_ASSETS + this.context.form_operation_id + '/' + this.status.image);
            this.code.setValue(this.value.code);
        } else {
            this.button.setStyle('display','none');
            this.code.setStyle('display','none');
            $(this.img.dom).attr('src',BARCODE_INPUT);
        }
        this.enabled = this.status.enabled;
        if (this.status.enabled) {
            this.enabled = true;
            this.button.removeAttribute('disabled');
            this.img.removeClass('elementdisabled');
        } else {
            this.enabled = false;
            this.button.setAttribute('disabled','');
            this.img.addClass('elementdisabled');
        }

        return Promise.resolve();
    }         
}
