
import { PROPERTIES_ID } from '/static/designer/js/constants/constants.js';
import { ListBaseElement } from './ListBaseElement.js';
import { Div, Canvas, Text, Button } from '/static/js/ui/BuildingBlocks.js';
import { ASSETTYPE } from '/static/js/assettype.js';
import { URL_OPERATION_UPLOAD_ASSET } from '/static/js/urls.js';
import { fetchPOST } from '/static/js/Fetch.js';
import { getFileFromUrl, URL_OPERATIONS_ASSETS } from '/static/js/urls.js';
import { loadImage } from '/static/js/jshtml.js';


export class SignatureElement extends ListBaseElement {
    constructor(context, props, id) {
        super(context, props);

        this.context = context;
        const ref = this;
        this.hascontent = false;
        this.enabled = true;

        const _enabled = props[PROPERTIES_ID.ENABLEDPROPERTY] === 'yes';
        const height = props[PROPERTIES_ID.HEIGHTPROPERTY];
        const width = props[PROPERTIES_ID.WIDTHPROPERTY];
        this.color = props[PROPERTIES_ID.COLORPROPERTY];
        

        let label =  props[PROPERTIES_ID.LABELPROPERTY];
        if (label === '') {
            label = props[PROPERTIES_ID.NAMEPROPERTY];
            if (label === '') {
                label = this.real_id;
            }                    
        } 

        const _label = new Text(label);
        _label.attachTo(this.body);

        const div = new Div();
        div.setAttribute('align','center');
        div.attachTo(this.body);

        this.input = new Canvas().attachTo(div);
        this.input.addClass('canvas');
        this.input.setStyle('border','1px dashed black');
        this.input.setStyle('height', height + 'px');
        this.input.setStyle('width', width + 'px');
        this.input.setId(id);

 
        this.button = new Button('Clear').attachTo(div);
        this.button.addClass('btn');
        this.button.addClass('btn-warning');
        this.button.addClass('btn-sm');
        this.button.addClass('mx-auto');
        this.button.addClass('d-none');
        this.button.setStyle('width', width + 'px');


        this.mousePressed = false;
        this.lastX;
        this.lastY;
        this.ctx = this.input.dom.getContext("2d");        

        this.ctx.canvas.width = width;
        this.ctx.canvas.height = height;

        $(this.button.dom).on('click', function(e) {
            ref.ctx.clearRect(0, 0, width, height);
            ref.hascontent = false;
            ref.button.removeClass('d-block');
            context.signals.onListValueChanged.dispatch(ref.real_id, ref.ctx.canvas, true);
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
            ref.hascontent = true;
            ref.button.addClass('d-block');
            ref.mousePressed = false;
            context.signals.onListValueChanged.dispatch(ref.real_id, ref.ctx.canvas, false);
        });
        $(this.input.dom).mouseleave(function(e) {
            if (!ref.mousePressed) return false;
            ref.hascontent = true;
            ref.button.addClass('d-block');
            ref.mousePressed = false;
            context.signals.onListValueChanged.dispatch(ref.real_id, ref.ctx.canvas, false);
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
        context.signals.onFormValueChanged.add((id, canvas, clear=false) => {
            if (id === this.real_id) {
                if (clear) {
                    this.ctx.clearRect(0, 0, width, height);
                    this.hascontent = false;
                    ref.button.removeClass('d-block');
                } else {
                    this.ctx.drawImage(canvas, 0, 0);   
                    this.hascontent = true;
                    ref.button.addClass('d-block');
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
                //this.status.value = result.asset;
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
        /*
        const img = new Image();
        //img.src = this.status.value;
        img.src = URL_OPERATIONS_ASSETS + this.context.form_operation_id + '/' + this.status.value;
        img.onload = () => {
            this.ctx.drawImage(img,0,0);
        };
        */
        const img = await loadImage(URL_OPERATIONS_ASSETS + this.context.form_operation_id + '/' + this.status.value);
        this.ctx.drawImage(img,0,0);
        
        return Promise.resolve();
    }


}
