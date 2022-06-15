
import { FormBaseElement } from './FormBaseElement.js';
import { PROPERTIES_ID } from '/static/designer/js/constants/constants.js';


export class VerticalLineElement extends FormBaseElement {
    constructor(context, props, id) {
        super(context, props);

        const height = props[PROPERTIES_ID.HEIGHTPROPERTY];
        const width = props[PROPERTIES_ID.WIDTHPROPERTY];
        const color = props[PROPERTIES_ID.COLORPROPERTY];
        const border = props[PROPERTIES_ID.BORDERPROPERTY];
        const border_radius = props[PROPERTIES_ID.BORDERRADIUSPROPERTY];
        const border_width = props[PROPERTIES_ID.BORDERWIDTHPROPERTY];


        this.setStyle('height', height + 'px');
        this.setStyle('width', width + 'px');
        this.setStyle('color', color);
        this.dom.style.borderStyle = "none none none " + border;
        this.setStyle('border-width', border_width + 'px');
        this.setStyle('border-radius', border_radius + 'px');
        this.setStyle('-webkit-border-radius', border_radius + 'px');
        this.setStyle('-moz-border-radius', border_radius + 'px');

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
