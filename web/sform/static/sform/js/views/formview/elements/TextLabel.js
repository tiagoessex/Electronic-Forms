
import { FormBaseElement } from './FormBaseElement.js';
import { PROPERTIES_ID } from '/static/designer/js/constants/constants.js';
import { HEXtoRGBA } from '/static/js/jscolor.js';

export class TextLabel extends FormBaseElement {
    constructor(context, props, id) {
        super(context, props);

        const height = props[PROPERTIES_ID.HEIGHTPROPERTY];
        const width = props[PROPERTIES_ID.WIDTHPROPERTY];
        const backcolor = props[PROPERTIES_ID.BACKCOLORPROPERTY];
        const color = props[PROPERTIES_ID.COLORPROPERTY];
        const label = props[PROPERTIES_ID.LABELPROPERTY];
        const name = props[PROPERTIES_ID.NAMEPROPERTY];
        /*
        const border = props[PROPERTIES_ID.BORDERPROPERTY];
        const border_radius = props[PROPERTIES_ID.BORDERRADIUSPROPERTY];
        const border_width = props[PROPERTIES_ID.BORDERWIDTHPROPERTY];
        */
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
                text = id.substring(0,id.lastIndexOf('_'));
            }                    
        } 
        this.setStyle('height', height + 'px');
        this.setStyle('width', width + 'px');
        this.setStyle('text-align',horizontal_alignment);
        this.setStyle('word-wrap','break-word');
        this.setStyle('color', color);
        this.setStyle("background-color", HEXtoRGBA(backcolor, back_alpha));

        this.setTextContent(text);
        this.setStyle('font-size',font_size + 'px');
        this.setStyle('font-family',font_family);
        this.setStyle('font-style',font_style);
        this.setStyle('text-decoration',font_decoration);
        this.setStyle('font-weight',font_weight);

        /*
        const input = new Text(text);
        input.setStyle('font-size',font_size + 'px');
        input.setStyle('font-family',font_family);
        input.setStyle('font-style',font_style);
        input.setStyle('text-decoration',font_decoration);
        input.setStyle('font-weight',font_weight);
        input.setStyle('text-align',font_alignment);
        input.attachTo(this);
        */

    }

    save() {
        super.save();
        return new Promise((resolve) => resolve(this.status));
    } 
    
    async restore(data) {
        super.restore(data);
        return Promise.resolve();
    }        
}
