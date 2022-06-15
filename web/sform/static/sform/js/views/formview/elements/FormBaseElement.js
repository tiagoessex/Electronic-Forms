
import { PROPERTIES_ID } from '/static/designer/js/constants/constants.js';
import { BaseElement } from '../../BaseElement.js';
import { FORM_ELEMENT } from '../../../constants.js';


export class FormBaseElement extends BaseElement {
    constructor(context, props=null) {
        super(context, props);

        this.addClass(FORM_ELEMENT);

        const top = props[PROPERTIES_ID.TOPPROPERTY];
        const left = props[PROPERTIES_ID.LEFTPROPERTY];
        const z_index = props[PROPERTIES_ID.ZINDEXPROPERTY];
        const rotation = props[PROPERTIES_ID.ROTATIONPROPERTY];
        
        this.setStyle('position','absolute');
        this.setStyle('top', top + 'px');
        this.setStyle('left', left + 'px');
        this.setStyle('z-index', z_index);
        this.setStyle('transform','rotate(' + rotation + 'deg)');
        this.setStyle('msTransform','rotate(' + rotation + 'deg)');         

    }

    save() {
        super.save();
    }

    async restore(data) {
        super.restore(data);
    } 

}

