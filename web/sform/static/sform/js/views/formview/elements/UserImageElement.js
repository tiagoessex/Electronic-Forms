
import { FormBaseElement } from './FormBaseElement.js';
import { Img, Input, Form, AwesomeIconAndButton, Div  } from '/static/js/ui/BuildingBlocks.js';
import { PROPERTIES_ID } from '/static/designer/js/constants/constants.js';
import { USER_IMAGE_INPUT } from '/static/js/urls.js';
import { HEXtoRGBA } from '/static/js/jscolor.js';
import { ASSETTYPE } from '/static/js/assettype.js';
import { APP } from '/static/js/constants.js';
import { UploadAsset } from '/static/js/UploadAsset.js';
import { getFileFromUrl, URL_OPERATIONS_ASSETS } from '/static/js/urls.js';
import { loadImage2Dom } from '/static/js/jshtml.js';


export class UserImageElement extends FormBaseElement {
    constructor(context, props, id) {
        super(context, props);

        this.context = context;

        const _enabled = props[PROPERTIES_ID.ENABLEDPROPERTY] === 'yes';
        const height = props[PROPERTIES_ID.HEIGHTPROPERTY];
        const width = props[PROPERTIES_ID.WIDTHPROPERTY];
        const border = props[PROPERTIES_ID.BORDERPROPERTY];
        const border_radius = props[PROPERTIES_ID.BORDERRADIUSPROPERTY];
        const border_width = props[PROPERTIES_ID.BORDERWIDTHPROPERTY];
        const backcolor = props[PROPERTIES_ID.BACKCOLORPROPERTY];
        const back_alpha = props[PROPERTIES_ID.BACKALPHAPROPERTY];
        const color = props[PROPERTIES_ID.COLORPROPERTY];

        const div = new Div().attachTo(this);
        div.setStyle('position','relative');


        this.img = new Img(USER_IMAGE_INPUT, width, height).attachTo(div);
       //img.setStyle('object-fit','cover');
       //img.setStyle('height', height + 'px');
       //img.setStyle('width', width + 'px');
       this.img.setStyle('border', border);
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

       const form = new Form();//.attachTo(this);
       form.setAttribute('name', 'form');
       form.setAttribute('enctype', 'multipart/form-data');

       this.input = new Input().attachTo(form);
       this.input.setAttribute('type','file');
       this.input.setAttribute('accept','image/*');
       this.input.setAttribute('name', 'asset-file');

       if (context.isExport) return;

        const ref = this;
        $(this.img.dom).on('click',function() {
            ref.input.dom.click();
        })

        $(this.button.dom).on('click',function() {
            $(ref.img.dom).attr('src',USER_IMAGE_INPUT);
            ref.button.setStyle('display','none');
            context.signals.onFormValueChanged.dispatch(ref.real_id, USER_IMAGE_INPUT, true);
         });
 
        $(this.input.dom).on('change',  (ev) => {
            ref.button.setStyle('display','inline');
            if (ev.target.files && ev.target.files[0]) {
                const file = ev.target.files[0].name;

                if (context.is_preview) {
                    const file = URL.createObjectURL(ev.target.files[0]);
                    $(ref.img.dom).fadeIn("fast").attr('src',file);
                    ref.status.value = file;
                    context.signals.onFormValueChanged.dispatch(ref.real_id, file, false); 
                    return false;
                }

                const data = new FormData(form.dom);                
                UploadAsset(
                    data, 
                    context.form_operation_id, 
                    file, 
                    ASSETTYPE.IMAGE, 
                    APP.OPERATION, 
                    (result) => {
                        $(ref.img.dom).fadeIn("fast").attr('src',result.asset);
                        context.signals.onFormValueChanged.dispatch(ref.real_id, result.asset, false); 
                        context.signals.saveOperation.dispatch();
                    }, 
                    (error) => {
                        context.signals.onError.dispatch(error,"[UserImageElement::ctor]");
                    }
                );
            }
         });
        
        if (!_enabled) {
            this.input.setAttribute('disabled','');
            this.img.addClass('elementdisabled');
        }   

        context.signals.onEnabled.add((id) => {
            if (id === this.real_id || id === this.section) {
                this.input.removeAttribute('disabled');
                this.img.removeClass('elementdisabled');
            }
        })
        context.signals.onDisabled.add((id) => {
            if (id === this.real_id || id === this.section) {
                this.input.setAttribute('disabled','');
                this.img.addClass('elementdisabled');
            }
        })

        context.signals.onListValueChanged.add((id, value, reset) => {
            if (id === this.real_id) {
                ref.button.setStyle('display',reset?'none':'inline');
                $(ref.img.dom).fadeIn("fast").attr('src',value);
            }
        })        
    }

    save() {
        super.save();
        //const file = $(this.img.dom).attr('src');
        const file = getFileFromUrl($(this.img.dom).attr('src'));
        file !== getFileFromUrl(USER_IMAGE_INPUT)?(this.status.value = file): (this.status.value = null);
        this.status.enabled = !this.input.hasAttribute('disabled');
        return new Promise((resolve) => resolve(this.status));
    }

    async restore(data) {
        super.restore(data);
        if (this.status.value) {
            this.button.setStyle('display','inline');
            //$(this.img.dom).attr('src',this.status.value);
            //const file = URL_OPERATIONS_ASSETS + this.context.form_operation_id + '/' + this.status.value;
            await loadImage2Dom(this.img.dom, URL_OPERATIONS_ASSETS + this.context.form_operation_id + '/' + this.status.value);
            //console.error(file,file,file);
            //$(this.img.dom).attr('src',file);
            //this.img.dom = file;
        } else {
            this.button.setStyle('display','none');
            $(this.img.dom).attr('src',USER_IMAGE_INPUT);
        }
        this.enabled = this.status.enabled;
        if (this.status.enabled) {
            this.input.removeAttribute('disabled');
            this.img.removeClass('elementdisabled');
        } else {
            this.input.setAttribute('disabled','');
            this.img.addClass('elementdisabled');
        }

        return Promise.resolve();
    }     
}
