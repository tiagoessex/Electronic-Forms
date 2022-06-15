
import { PROPERTIES_ID } from '/static/designer/js/constants/constants.js';
import { ListBaseElement } from './ListBaseElement.js';
import { Div, Canvas, Text, Select, Button, Form } from '/static/js/ui/BuildingBlocks.js';
import { ASSETTYPE } from '/static/js/assettype.js';
import { URL_OPERATION_UPLOAD_ASSET } from '/static/js/urls.js';
import { fetchPOST } from '/static/js/Fetch.js';
import { getFileFromUrl, URL_OPERATIONS_ASSETS } from '/static/js/urls.js';
import { loadImage } from '/static/js/jshtml.js';


export class DrawElement extends ListBaseElement {
    constructor(context, props, id) {
        super(context, props);

        this.hascontent = false;
        const ref = this;
        this.enabled = true;
        this.context = context;

        const _enabled = props[PROPERTIES_ID.ENABLEDPROPERTY] === 'yes';
        const height = props[PROPERTIES_ID.HEIGHTPROPERTY];
        const width = props[PROPERTIES_ID.WIDTHPROPERTY];
        //this.color = props[PROPERTIES_ID.COLORPROPERTY];
        this.lineWidth = '4';
        this.color = 'black';
        
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
        

        const form = new Form().attachTo(div);
        form.addClass('form-inline');
        form.addClass('d-flex');
        form.addClass('align-items-center');
        form.addClass('justify-content-center');
        //form.addClass('w-50');
        //form.setStyle('display', 'inline');   

        const form_gp_width = new Div().attachTo(form);
        form_gp_width.addClass('form-group'); 
        this.line_width = new Select().attachTo(form_gp_width);
        this.line_width.setOptions({"1":"1 px","4":"4 px","8":"8 px","16":"16 px",});
        this.line_width.setValue(this.lineWidth);
        this.line_width.addClass('form-control'); 

        const form_gp_color = new Div().attachTo(form);
        form_gp_color.addClass('form-group');
        this.line_color = new Select().attachTo(form_gp_color);
        this.line_color.setOptions({"black":"Black","blue":"Blue","red":"Red","green":"Green"});
        this.line_color.setValue(this.color);
        this.line_color.addClass('form-control'); 

        const form_gp_clear = new Div().attachTo(form);
        form_gp_clear.addClass('form-group');
        this.button = new Button('Clear').attachTo(form_gp_clear);
        this.button.addClass('btn');
        this.button.addClass('btn-warning');
        this.button.setAttribute('type','button');

        $(this.line_width.dom).on('change', function(e) {
            ref.lineWidth = e.target.value;
        });
        $(this.line_color.dom).on('change', function(e) {
            ref.color = e.target.value;
        });   
        $(this.button.dom).on('click', function(e) {
            ref.ctx.clearRect(0, 0, width, height);
            ref.hascontent = false;
            context.signals.onListValueChanged.dispatch(ref.real_id, ref.ctx.canvas, true);
         });  
 
        this.mousePressed = false;
        this.lastX;
        this.lastY;
        this.ctx = this.input.dom.getContext("2d");

        this.ctx.canvas.width = width;
        this.ctx.canvas.height = height;

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
            context.signals.onListValueChanged.dispatch(ref.real_id, ref.ctx.canvas, false);
        });
        $(this.input.dom).mouseleave(function(e) {
            if (!ref.mousePressed) return false;
            ref.hascontent = true;
            ref.mousePressed = false;
            context.signals.onListValueChanged.dispatch(ref.real_id, ref.ctx.canvas, false);
        });


        if (!_enabled) {
            this.line_width.setAttribute('disabled','');
            this.line_color.setAttribute('disabled','');
            this.button.setAttribute('disabled','');
            this.enabled = false;
            this.input.addClass('elementdisabled');   
        } 
      

        context.signals.onEnabled.add((id) => {
            if (id === this.real_id || id === this.section) {
                this.line_width.removeAttribute('disabled');
                this.line_color.removeAttribute('disabled');
                this.button.removeAttribute('disabled');
                this.enabled = true;
                this.input.removeClass('elementdisabled');
            }
        })
        context.signals.onDisabled.add((id) => {
            if (id === this.real_id || id === this.section) {                
                this.line_width.setAttribute('disabled','');
                this.line_color.setAttribute('disabled','');
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
                } else {
                    this.ctx.drawImage(canvas, 0, 0);   
                    this.hascontent = true;
                }
            }
        })

    }

    draw(x, y, isDown) {
        if (isDown) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = this.color;
            this.ctx.lineWidth = this.lineWidth;
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
        const name = "photo_" + this.real_id + "_" + this.context.form_operation_id + ".png"; 
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
                this.status.enabled = !this.input.hasAttribute('disabled');
                return this.status;
            },
            (error) => {
                this.context.signals.onError.dispatch(error,"[DrawElement::save]");
            }
        );        
    
    }   
   
    async restore(data) {
        super.restore(data);
        if (this.status.enabled) {
            this.line_width.removeAttribute('disabled');
            this.line_color.removeAttribute('disabled');
            this.button.removeAttribute('disabled');
            this.enabled = true;
        } else {
            this.line_width.setAttribute('disabled','');
            this.line_color.setAttribute('disabled','');
            this.button.setAttribute('disabled','');
            this.enabled = false;
            this.input.addClass('elementdisabled');            
        }
        if (!this.status.value) return;
        /*
        const img = new Image();        
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
