
import { FormBaseElement } from './FormBaseElement.js';
import { TextArea } from '/static/js/ui/BuildingBlocks.js';
import { PROPERTIES_ID } from '/static/designer/js/constants/constants.js';
import { HEXtoRGBA } from '/static/js/jscolor.js';

export class TextBoxElement extends FormBaseElement {
    constructor(context, props, id) {
        super(context, props);

        const _enabled = props[PROPERTIES_ID.ENABLEDPROPERTY] === 'yes';
        const placeholder = props[PROPERTIES_ID.PLACEHODLERPROPERTY];
        const maxlength = props[PROPERTIES_ID.MAXLENGTHPROPERTY];
        const height = props[PROPERTIES_ID.HEIGHTPROPERTY];
        const width = props[PROPERTIES_ID.WIDTHPROPERTY];
        const backcolor = props[PROPERTIES_ID.BACKCOLORPROPERTY];
        const color = props[PROPERTIES_ID.COLORPROPERTY];
        const label = props[PROPERTIES_ID.LABELPROPERTY];
        const name = props[PROPERTIES_ID.NAMEPROPERTY];
        const border = props[PROPERTIES_ID.BORDERPROPERTY];
        const border_border = props[PROPERTIES_ID.BORDERBORDERSPROPERTY];
        const border_radius = props[PROPERTIES_ID.BORDERRADIUSPROPERTY];
        const border_width = props[PROPERTIES_ID.BORDERWIDTHPROPERTY];
        const back_alpha = props[PROPERTIES_ID.BACKALPHAPROPERTY];
        const font_family = props[PROPERTIES_ID.FONTPROPERTY];
        const font_size = props[PROPERTIES_ID.FONTSIZEPROPERTY];
        const font_style = props[PROPERTIES_ID.FONTSTYLEPROPERTY];
        const font_decoration = props[PROPERTIES_ID.FONTDECORATIONPROPERTY];
        const font_weight = props[PROPERTIES_ID.FONTWEIGHTPROPERTY];
        const horizontal_alignment = props[PROPERTIES_ID.HORIZONTALALIGNMENTPROPERTY]; 

        let text =  label;
        if (text === '') {
            text = name;
            if (text === '') {
                text = this.real_id;
            }                    
        } 

        this.input = new TextArea();
        this.input.setId(id);
        this.input.setAttribute('placeholder', placeholder!==''?placeholder:text);
        this.input.setAttribute('maxlength', maxlength);
        this.input.setStyle('color', color);
        this.input.setStyle("background-color", HEXtoRGBA(backcolor, back_alpha));
        this.input.setStyle('height', height + 'px');
        this.input.setStyle('width', width + 'px');

        this.input.setStyle('font-size',font_size + 'px');
        this.input.setStyle('font-family',font_family);
        this.input.setStyle('font-style',font_style);
        this.input.setStyle('text-decoration',font_decoration);
        this.input.setStyle('font-weight',font_weight);
        this.input.setStyle('text-align',horizontal_alignment);

        switch (border_border) {
            case 'top': this.input.dom.style.borderStyle = 'none'; this.input.dom.style.borderTop = border; break;
            case 'bottom': this.input.dom.style.borderStyle = 'none'; this.input.dom.style.borderBottom = border; break;
            case 'left': this.input.dom.style.borderStyle = 'none'; this.input.dom.style.borderLeft = border; break;
            case 'right': this.input.dom.style.borderStyle = 'none'; this.input.dom.style.borderRight = border; break;
            default:
                this.input.dom.style.borderStyle = border;
        }
        this.input.setStyle('border-width', border_width + 'px');
        this.input.setStyle('border-radius', border_radius + 'px');
        this.input.setStyle('-webkit-border-radius', border_radius + 'px');
        this.input.setStyle('-moz-border-radius', border_radius + 'px');
        this.input.setStyle('border-color', color);

        this.input.attachTo(this);

        if (context.isExport) return;

        const ref = this;
        // connection to its equivalent in the formview
        $(this.input.dom).on('change', function(e) {
            context.signals.onFormValueChanged.dispatch(ref.real_id, ref.input.dom.value);
        })

        if (!_enabled) {
            this.input.setAttribute('disabled','');
        }        

        context.signals.onEnabled.add((id) => {
            if (id === this.real_id || id === this.section) {
                this.input.removeAttribute('disabled');
            }
        })
        context.signals.onDisabled.add((id) => {
            if (id === this.real_id || id === this.section) {                
                this.input.setAttribute('disabled','');
            }
        })
        context.signals.onListValueChanged.add((id, value) => {
            if (id === this.real_id) {
                this.input.dom.value = value;
            }
        })        

    }

    save() {
        super.save();
        this.status.value = this.input.getValue();
        this.status.enabled = !this.hasAttribute('disabled');
        return new Promise((resolve) => resolve(this.status));
    }

    async restore(data) {
        super.restore(data);
        this.input.setValue(this.status.value);
        if (this.status.enabled)
            this.input.removeAttribute('disabled');
        else
            this.input.setAttribute('disabled','');

        return Promise.resolve();
    }        
}
