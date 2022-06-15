
import { PROPERTIES_ID } from '/static/designer/js/constants/constants.js';
import { ListBaseElement } from './ListBaseElement.js';
import { Img, Text, Button } from '/static/js/ui/BuildingBlocks.js';
import { BARCODE_INPUT } from '/static/js/urls.js';
import { ASSETTYPE } from '/static/js/assettype.js';
import { URL_OPERATION_UPLOAD_ASSET } from '/static/js/urls.js';
import { fetchPOST } from '/static/js/Fetch.js';
import { getFileFromUrl, URL_OPERATIONS_ASSETS } from '/static/js/urls.js';
import { loadImage2Dom } from '/static/js/jshtml.js';


export class BarcodeImageElement extends ListBaseElement {
    constructor(context, props, id) {
        super(context, props);

        this.value = {code: null, image: null};
        this.enabled = true;
        this.context = context;

        const _enabled = props[PROPERTIES_ID.ENABLEDPROPERTY] === 'yes';
        const height = props[PROPERTIES_ID.HEIGHTPROPERTY];
        const width = props[PROPERTIES_ID.WIDTHPROPERTY];

        let label =  props[PROPERTIES_ID.LABELPROPERTY];
        if (label === '') {
            label = props[PROPERTIES_ID.NAMEPROPERTY];
            if (label === '') {
                label = id.substring(0,id.lastIndexOf('_'));
            }                    
        } 

        const _label = new Text(label);
        _label.attachTo(this.body);
        

        this.img = new Img(BARCODE_INPUT).attachTo(this.body);
        this.img.setStyle('width', width + 'px');
        this.img.setStyle('height', height + 'px');           
        this.img.addClass('mx-auto');
        this.img.addClass('d-block');
        this.img.addClass('img-thumbnail');
        //this.img.setId(id);

        this.button = new Button('Clear').attachTo(this.body);
        this.button.addClass('btn');
        this.button.addClass('btn-warning');
        this.button.addClass('btn-sm');
        this.button.addClass('mx-auto');
        this.button.addClass('d-none');
        this.button.setStyle('width', width + 'px');
        
        /*
        const form = new Form();//.attachTo(this);
        form.setAttribute('name', 'form');
        form.setAttribute('enctype', 'multipart/form-data');

        this.input = new Input().attachTo(form);
        this.input.setAttribute('type','file');
        this.input.setAttribute('accept','image/*');
        this.input.setAttribute('name', 'asset-file');
        */

        this.code = new Text('-------------').attachTo(this);
        this.code.setStyle('background-color', 'black');
        this.code.setStyle('color', 'white');
        this.code.setStyle('text-align', 'center');
        this.code.addClass('mb-2');
        this.code.addClass('d-none');
        //this.text.setId(id);

        const ref = this;
        $(this.img.dom).on('click', function() { 
            if (!ref.enabled) return false;
            context.signals.onBarcodeReader.dispatch((code, image) => {
                ref.code.setValue(code);
                ref.value.code = code;
                ref.code.addClass('d-block');
                ref.button.addClass('d-block');
                if (context.is_preview) {
                    $(ref.img.dom).fadeIn("fast").attr('src',image);                        
                    context.signals.onListValueChanged.dispatch(ref.real_id, image, code, false); 
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
                        context.signals.onListValueChanged.dispatch(ref.real_id, result.asset, code, false);  
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
            ref.button.removeClass('d-block');
            ref.code.removeClass('d-block');
            ref.value.image = null;
            ref.value.code = null;            
            context.signals.onListValueChanged.dispatch(ref.real_id, BARCODE_INPUT, null, true); 
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

        context.signals.onFormValueChanged.add((id, value, code, reset) => {
            if (id === this.real_id) {
                if (reset) {
                    this.button.removeClass('d-block');
                    this.code.removeClass('d-block');
                    this.value.image = null;
                } else {
                    this.button.addClass('d-block');
                    this.code.addClass('d-block');
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
        const file = $(this.img.dom).attr('src');
        //file !== BARCODE_INPUT?(this.status.value = file): (this.status.value = null);
        this.status.value = this.value;
        this.status.value.image = getFileFromUrl(this.status.value.image);
        this.status.enabled = this.enabled = true;
        return new Promise((resolve) => resolve(this.status));
    }

    async restore(data) {
        super.restore(data);
        this.value = this.status.value?this.status.value:this.value;
        if (this.value && this.value.image) {
            this.button.addClass('d-block');
            this.code.addClass('d-block');
            /*
            const file = URL_OPERATIONS_ASSETS + this.context.form_operation_id + '/' + this.value.image;
            $(this.img.dom).attr('src',file);
            */
            await loadImage2Dom(this.img.dom, URL_OPERATIONS_ASSETS + this.context.form_operation_id + '/' + this.status.image);
            this.code.setValue(this.value.code);
        } else {
            this.button.removeClass('d-block');
            this.code.removeClass('d-block');
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
