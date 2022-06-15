
import { FormBaseElement } from './FormBaseElement.js';
import { Label, Input, Span, Div } from '/static/js/ui/BuildingBlocks.js';
import { ELEMENTS_TYPE } from '/static/designer/js/elements/constants.js';
import { PROPERTIES_ID } from '/static/designer/js/constants/constants.js';
import { DEFAULT_FONT_SIZE } from '/static/designer/js/constants/dimensions.js';
import { ID_FORMVIEW_APPEND } from '../../../constants.js'
import { EVENTS } from '/static/designer/js/ea/constants.js';

export class RadioElement extends FormBaseElement {
    constructor(context, props, id, type) {
        super(context, props);

        this.current = false;   // CURRENT CHECK STATUS - can't use ischeck in this case

        const _enabled = props[PROPERTIES_ID.ENABLEDPROPERTY] === 'yes';
        const _show_label = props[PROPERTIES_ID.SHOWLABELPROPERTY] === 'yes';
        const height = props[PROPERTIES_ID.HEIGHTPROPERTY];
        const width = props[PROPERTIES_ID.WIDTHPROPERTY];
        const _label = props[PROPERTIES_ID.LABELPROPERTY];
        const name = props[PROPERTIES_ID.NAMEPROPERTY];
        const group = props[PROPERTIES_ID.GROUPPROPERTY]; 
        const font_family = props[PROPERTIES_ID.FONTPROPERTY];
        const font_size = props[PROPERTIES_ID.FONTSIZEPROPERTY];
        const font_style = props[PROPERTIES_ID.FONTSTYLEPROPERTY];
        const font_decoration = props[PROPERTIES_ID.FONTDECORATIONPROPERTY];
        const font_weight = props[PROPERTIES_ID.FONTWEIGHTPROPERTY];
        const horizontal_alignment = props[PROPERTIES_ID.HORIZONTALALIGNMENTPROPERTY]; 
        const checked = props[PROPERTIES_ID.CHECKEDPROPERTY];

        const border = props[PROPERTIES_ID.BORDERPROPERTY];
        const border_border = props[PROPERTIES_ID.BORDERBORDERSPROPERTY];
        const border_radius = props[PROPERTIES_ID.BORDERRADIUSPROPERTY];
        const border_width = props[PROPERTIES_ID.BORDERWIDTHPROPERTY];
        const color = props[PROPERTIES_ID.COLORPROPERTY];

        let text =  _label;
        if (text === '') {
            text = name;
            if (text === '') {
                text = this.real_id;
            }                    
        } 

        const shell = new Div().attachTo(this);
        switch (border_border) {
            case 'top': shell.dom.style.borderStyle = 'none'; shell.dom.style.borderTop = border; break;
            case 'bottom': shell.dom.style.borderStyle = 'none'; shell.dom.style.borderBottom = border; break;
            case 'left': shell.dom.style.borderStyle = 'none'; shell.dom.style.borderLeft = border; break;
            case 'right': shell.dom.style.borderStyle = 'none'; shell.dom.style.borderRight = border; break;
            default:
                shell.dom.style.borderStyle = border;
        }
        shell.setStyle('border-width', border_width + 'px');
        shell.setStyle('border-radius', border_radius + 'px');
        shell.setStyle('-webkit-border-radius', border_radius + 'px');
        shell.setStyle('-moz-border-radius', border_radius + 'px');
        shell.setStyle('border-color', color);
        shell.setStyle('width', width + 'px');
        shell.setStyle('height', height + 'px');


        const label = new Label(_show_label?text:'').attachTo(shell);
        label.addClass('fv-checkradio-container');

        this.input = new Input().attachTo(label);
        this.input.setAttribute('type', 'radio');
        this.input.setAttribute('name', group +  ID_FORMVIEW_APPEND);  
        this.input.setAttribute('value', id);
        if (checked === 'yes') this.input.setAttribute('checked', '');                  
        this.input.setId(id);        
        this.input.setAttribute('data-type', type);

        const scale_x = width / ELEMENTS_TYPE.RADIO.dimensions.width;
        const scale_y = height / ELEMENTS_TYPE.RADIO.dimensions.height;

        const span = new Span().attachTo(label);
        span.addClass('fv-checkradio-checkmark');
        span.setStyle('transform-origin','top left');
        span.setStyle('transform','scale(' + scale_x +',' + scale_y +')');
        //span.setStyle('border-width', border_width + 'px');
        span.setStyle('border-radius', border_radius + 'px');
        span.setStyle('-webkit-border-radius', border_radius + 'px');
        span.setStyle('-moz-border-radius', border_radius + 'px');

        label.setStyle('color', color);
        label.setStyle('font-size',font_size + 'px');
        label.setStyle('font-family',font_family);
        label.setStyle('font-style',font_style);
        label.setStyle('text-decoration',font_decoration);
        label.setStyle('font-weight',font_weight);
        label.setStyle('text-align',horizontal_alignment);

        // adjust the label position
        label.setStyle('padding-left', (parseInt(width) + 8) + 'px');
        let f_size = parseInt(label.dom.style.fontSize);
        if (f_size !== f_size)    // check if nan
            f_size = DEFAULT_FONT_SIZE;
        label.setStyle('padding-top',  (parseInt(height) / 2 - f_size) + 'px'); 

        if (context.isExport) return;

        const self = this;
        // connection to its equivalent in the formview
        $(this.input.dom).on('change', (event) => {
            context.signals.onFormValueChanged.dispatch(self.real_id);
            $("input[name='" + group +  ID_FORMVIEW_APPEND + "']").trigger('custom', id);
        });
        
        // using custom event since radio does not trigger a change event when uncheck
        $(this.input.dom).bind("custom", function(event, checked_id){
            if (checked_id !== id && self.current) {
                self.current = false;
                context.signals.onEventUnselected.dispatch(self.real_id , EVENTS.onUnSelected, true);
            } else {
                self.current = true;
            }
        });  
        

        if (!_enabled) {
            this.input.setAttribute('disabled','');
        } 

        context.signals.onEnabled.add((id) => {
            if (id === this.real_id || id === this.section || id === this.group) {
                this.input.removeAttribute('disabled');
            }
        })
        context.signals.onDisabled.add((id) => {
            if (id === this.real_id || id === this.section || id === this.group) {                
                this.input.setAttribute('disabled','');
            }
        })
        context.signals.onSelected.add((id) => {
            if (id === this.real_id || id === this.section || id === this.group) {
                this.input.dom.checked = true;
            }
        })
        context.signals.onUnselected.add((id) => {
            if (id === this.real_id || id === this.section || id === this.group) {                
                this.input.dom.checked = false;
            }
        })
        context.signals.onListValueChanged.add((_id) => {
            if (_id === this.real_id) {
                this.input.dom.checked = true;
                $("input[name='" + group +  ID_FORMVIEW_APPEND + "']").trigger('custom', id);
            }
        })

        // TODO: FIND BETTER WAY
        context.signals.onCrossed.add((id) => {
            if (id === this.real_id) {
                this.removeClass('cross');
                this.addClass('cross-check-radio');
            }
        })
        context.signals.onUncrossed.add((id) => {
            if (id === this.real_id) {
                this.removeClass('cross-check-radio');
            }
        })

    }

    save() {
        super.save();
        this.status.enabled = !this.input.hasAttribute('disabled');
        this.status.selected = this.input.dom.checked;
        return new Promise((resolve) => resolve(this.status));
    }

    async restore(data) {
        super.restore(data);

        if (this.status.enabled)
            this.input.removeAttribute('disabled');
        else
            this.input.setAttribute('disabled','');
        if (this.status.selected) {
            this.input.dom.checked = true;
            this.current = true;
        } else {
            this.input.dom.checked = false;
            this.current = false;            
        }
        return Promise.resolve();
    }       
}
