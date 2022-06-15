
import { FormBaseElement } from './FormBaseElement.js';
import { Img } from '/static/js/ui/BuildingBlocks.js';
import { PROPERTIES_ID } from '/static/designer/js/constants/constants.js';
import { IMAGE_MISSING } from '/static/js/urls.js';
import { HEXtoRGBA } from '/static/js/jscolor.js';
import { URL_FORMS_ASSETS } from '/static/js/urls.js';
//import { fetchBlob } from '/static/js/Fetch.js';


export class ImageElement extends FormBaseElement {
    constructor(context, props, id, form_id) {
        super(context, props);

        const height = props[PROPERTIES_ID.HEIGHTPROPERTY];
        const width = props[PROPERTIES_ID.WIDTHPROPERTY];
        //const label = props[PROPERTIES_ID.LABELPROPERTY];
        //const name = props[PROPERTIES_ID.NAMEPROPERTY];
        const border = props[PROPERTIES_ID.BORDERPROPERTY];
        const border_radius = props[PROPERTIES_ID.BORDERRADIUSPROPERTY];
        const border_width = props[PROPERTIES_ID.BORDERWIDTHPROPERTY];
        const backcolor = props[PROPERTIES_ID.BACKCOLORPROPERTY];
        const back_alpha = props[PROPERTIES_ID.BACKALPHAPROPERTY];
        const color = props[PROPERTIES_ID.COLORPROPERTY];
        const image_url = props[PROPERTIES_ID.IMAGEURLPROPERTY];

        let image = IMAGE_MISSING;
        if (image_url !== '') {
            image = URL_FORMS_ASSETS + form_id + '/' + image_url;
        }
        const input = new Img(image, width, height);
        input.setStyle('object-fit','cover');
        input.setStyle('height', height + 'px');
        input.setStyle('width', width + 'px');
        input.setStyle('border', border);
        input.setStyle('border-width', border_width + 'px');
        input.setStyle('border-radius', border_radius + 'px');
        input.setStyle('-webkit-border-radius', border_radius + 'px');
        input.setStyle('-moz-border-radius', border_radius + 'px'); 
        input.setStyle("background-color", HEXtoRGBA(backcolor, back_alpha));
        input.setStyle('color', color);

        input.attachTo(this);      

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

