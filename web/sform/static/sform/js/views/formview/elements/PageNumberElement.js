
import { BaseTextElement } from './BaseTextElement.js';
import { PROPERTIES_ID } from '/static/designer/js/constants/constants.js';

export class PageNumberElement extends BaseTextElement {
    constructor(context, props, id) {
        super(context, props, id, 'text');

        this.input.setAttribute('readonly');
        this.input.dom.value = props[PROPERTIES_ID.PAGENUMBERPROPERTY];
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
