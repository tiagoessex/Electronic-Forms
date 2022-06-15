
import { PROPERTIES_ID } from '/static/designer/js/constants/constants.js';
import { ListBaseElement } from './ListBaseElement.js';
import { Img, Text, Input, Form, Button } from '/static/js/ui/BuildingBlocks.js';
import { USER_IMAGE_INPUT } from '/static/js/urls.js';
import { ASSETTYPE } from '/static/js/assettype.js';
import { APP } from '/static/js/constants.js';
import { UploadAsset } from '/static/js/UploadAsset.js';
import { getFileFromUrl, URL_OPERATIONS_ASSETS } from '/static/js/urls.js';
import { loadImage2Dom } from '/static/js/jshtml.js';


export class UserImageElement extends ListBaseElement {
    constructor(context, props, id) {
        super(context, props);

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

        this.img = new Img(USER_IMAGE_INPUT, width, height).attachTo(this.body);
        this.img.setStyle('width', width + 'px');
        this.img.setStyle('height', height + 'px');             
        this.img.addClass('mx-auto');
        this.img.addClass('d-block');
        this.img.addClass('img-thumbnail');
        this.img.setId(id);

        this.button = new Button('Clear').attachTo(this.body);
        this.button.addClass('btn');
        this.button.addClass('btn-warning');
        this.button.addClass('btn-sm');
        this.button.addClass('mx-auto');
        this.button.addClass('d-none');
        this.button.setStyle('width', width + 'px');
        

        const form = new Form();//.attachTo(this);
        form.setAttribute('name', 'form');
        form.setAttribute('enctype', 'multipart/form-data');

        this.input = new Input().attachTo(form);
        this.input.setAttribute('type','file');
        this.input.setAttribute('accept','image/*');
        this.input.setAttribute('name', 'asset-file');

        const ref = this;
        $(this.img.dom).on('click',function() {
            ref.input.dom.click();
        })

        $(this.button.dom).on('click',function() {
            $(ref.img.dom).attr('src',USER_IMAGE_INPUT);
            $(ref.button.dom).removeClass('d-block');
            context.signals.onListValueChanged.dispatch(ref.real_id, USER_IMAGE_INPUT, true); 
         });

        $(this.input.dom).on('change',  (ev) => {
            $(ref.button.dom).addClass('d-block');       
            if (ev.target.files && ev.target.files[0]) {
                const file = ev.target.files[0].name;

                if (context.is_preview) {
                    const file = URL.createObjectURL(ev.target.files[0]);
                    $(ref.img.dom).fadeIn("fast").attr('src',file);
                    context.signals.onListValueChanged.dispatch(ref.real_id, file, false); 
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
                        $(ref.img.dom).fadeIn("fast").attr('src', result.asset);
                        context.signals.onListValueChanged.dispatch(ref.real_id, result.asset, false); 
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

        context.signals.onFormValueChanged.add((id, value, reset) => {
            if (id === this.real_id) {
                reset?$(this.button.dom).removeClass('d-block'):$(this.button.dom).addClass('d-block');
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
            $(this.button.dom).addClass('d-block')
            //$(this.img.dom).attr('src',this.status.value);
            /*
            const file = URL_OPERATIONS_ASSETS + this.context.form_operation_id + '/' + this.status.value;
            $(this.img.dom).attr('src',file);
            */
            await loadImage2Dom(this.img.dom, URL_OPERATIONS_ASSETS + this.context.form_operation_id + '/' + this.status.value);
        } else {
            $(this.button.dom).removeClass('d-block')
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
