
import { FormBaseElement } from './FormBaseElement.js';
import { Canvas, Div, AwesomeIconAndButton } from '/static/js/ui/BuildingBlocks.js';
import { PROPERTIES_ID } from '/static/designer/js/constants/constants.js';
import { HEXtoRGBA } from '/static/js/jscolor.js';
import { ASSETTYPE } from '/static/js/assettype.js';
import { URL_OPERATION_UPLOAD_ASSET } from '/static/js/urls.js';
import { fetchPOST } from '/static/js/Fetch.js';
import { getFileFromUrl, URL_OPERATIONS_ASSETS } from '/static/js/urls.js';
import { loadImage } from '/static/js/jshtml.js';


export class SignatureElement extends FormBaseElement {
    constructor(context, props, id) {
        super(context, props);

        this.context = context;
        const ref = this;
        this.hascontent = false;
        this.enabled = true;
        
        const _enabled = props[PROPERTIES_ID.ENABLEDPROPERTY] === 'yes';
        const height = props[PROPERTIES_ID.HEIGHTPROPERTY];
        const width = props[PROPERTIES_ID.WIDTHPROPERTY];
        const border = props[PROPERTIES_ID.BORDERPROPERTY];
        const border_radius = props[PROPERTIES_ID.BORDERRADIUSPROPERTY];
        const border_width = props[PROPERTIES_ID.BORDERWIDTHPROPERTY];
        const backcolor = props[PROPERTIES_ID.BACKCOLORPROPERTY];
        const back_alpha = props[PROPERTIES_ID.BACKALPHAPROPERTY];
        this.color = props[PROPERTIES_ID.COLORPROPERTY];

        const div = new Div().attachTo(this);
        div.setStyle('position','relative');

        this.input = new Canvas().attachTo(div);
        this.input.addClass('canvas');
        this.input.setStyle('height', height + 'px');
        this.input.setStyle('width', width + 'px');
        this.input.setStyle('border', border);
        this.input.setStyle('border-width', border_width + 'px');
        this.input.setStyle('border-radius', border_radius + 'px');
        this.input.setStyle('-webkit-border-radius', border_radius + 'px');
        this.input.setStyle('-moz-border-radius', border_radius + 'px'); 
        this.input.setStyle("background-color", HEXtoRGBA(backcolor, back_alpha));
        this.input.setStyle('color', this.color);
        this.input.setId(id);

        if (context.isExport) return;

        this.button = new AwesomeIconAndButton('','fas fa-times').attachTo(div);
        this.button.addClass('fv-remove-button no-print');
        this.button.setStyle('display','none');      
        
        this.mousePressed = false;
        this.lastX;
        this.lastY;
        this.ctx = this.input.dom.getContext("2d");        

        this.ctx.canvas.width = width;
        this.ctx.canvas.height = height;        

        $(this.button.dom).on('click', function(e) {
            ref.ctx.clearRect(0, 0, width, height);
            ref.hascontent = false;
            ref.button.setStyle('display','none');
            context.signals.onFormValueChanged.dispatch(ref.real_id, ref.ctx.canvas, true);
         });
        $(this.input.dom).mousedown(function(e) {
            if (!ref.enabled) return false;
            ref.mousePressed = true;
            ref.draw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, false);
        });
        $(this.input.dom).mousemove(function(e) {
            if (ref.mousePressed) {
                ref.draw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, true);
            }
        });
        $(this.input.dom).mouseup(function(e) {
            if (!ref.mousePressed) return false;
            ref.mousePressed = false;
            ref.hascontent = true;
            ref.button.setStyle('display','inline');
            context.signals.onFormValueChanged.dispatch(ref.real_id, ref.ctx.canvas, false);
        });
        $(this.input.dom).mouseleave(function(e) {
            if (!ref.mousePressed) return false;
            ref.hascontent = true;
            ref.button.setStyle('display','inline');     
            ref.mousePressed = false;
            context.signals.onFormValueChanged.dispatch(ref.real_id, ref.ctx.canvas, false);
        });

        if (!_enabled) {
            this.button.setAttribute('disabled','');
            this.enabled = false;
            this.input.addClass('elementdisabled');
        }

        context.signals.onEnabled.add((id) => {
            if (id === this.real_id || id === this.section) {
                this.button.removeAttribute('disabled');
                this.enabled = true;
                this.input.removeClass('elementdisabled');                
            }
        })
        context.signals.onDisabled.add((id) => {
            if (id === this.real_id || id === this.section) {                
                this.button.setAttribute('disabled','');
                this.enabled = false;
                this.input.addClass('elementdisabled');                
            }
        })
        context.signals.onListValueChanged.add((id, canvas, clear=false) => {
            if (id === this.real_id) {
                if (clear) {
                    this.ctx.clearRect(0, 0, width, height);
                    this.hascontent = false;
                    this.button.setStyle('display','none');
                } else {
                    this.ctx.drawImage(canvas, 0, 0);   
                    this.hascontent = true;
                    this.button.setStyle('display','inline');
                }
            }
        })        

    }

    draw(x, y, isDown) {
        if (isDown) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = this.color;
            this.ctx.lineWidth = "4px";
            this.ctx.lineJoin = "round";
            this.ctx.moveTo(this.lastX, this.lastY);
            this.ctx.lineTo(x, y);
            this.ctx.closePath();
            this.ctx.stroke();
        }
        this.lastX = x;
        this.lastY = y;
    }


    save() {
        super.save();
        if (!this.hascontent) {
            this.status.value = null;
            this.status.enabled = this.enabled;
            return new Promise((resolve) => resolve(this.status));
        }        
        const name = "signature_" + this.real_id + "_" + this.context.form_operation_id + ".png"; 
        const data = {
            id: this.context.form_operation_id, 
            name: name,
            type: ASSETTYPE.IMAGE,
            file: this.input.dom.toDataURL("image/png"),
        };
        return fetchPOST(URL_OPERATION_UPLOAD_ASSET,
            data,
            (result) => {
                this.status.value = getFileFromUrl(result.asset);
                this.status.enabled = this.enabled;
                return this.status;
            },
            (error) => {
                this.context.signals.onError.dispatch(error,"[SignatureElement::save]");
            }
        ); 
    }   
   
    async restore(data) {
        super.restore(data);
        if (this.status.enabled) {
            this.button.removeAttribute('disabled');
            this.enabled = true;
        } else {
            this.button.setAttribute('disabled','');
            this.enabled = false;
            this.input.addClass('elementdisabled');            
        }
        if (!this.status.value) return;
        //const img = new Image();
        //img.src = this.status.value;        
        //img.src = URL_OPERATIONS_ASSETS + this.context.form_operation_id + '/' + this.status.value;
        const img = await loadImage(URL_OPERATIONS_ASSETS + this.context.form_operation_id + '/' + this.status.value);
        //img.onload = () => {
            this.ctx.drawImage(img,0,0);
        //};
        this.button.setStyle('display','inline');
        return Promise.resolve();
    }


}
