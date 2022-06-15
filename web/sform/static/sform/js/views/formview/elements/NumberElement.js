
import { BaseTextElement } from './BaseTextElement.js';
import { PROPERTIES_ID } from '/static/designer/js/constants/constants.js';

export class NumberElement extends BaseTextElement {
    constructor(context, props, id) {
        super(context, props, id, 'number');

        const max = props[PROPERTIES_ID.MAXPROPERTY];
        const min = props[PROPERTIES_ID.MINPROPERTY];
        const step = props[PROPERTIES_ID.STEPPROPERTY];

        this.input.setAttribute('max', max);
        this.input.setAttribute('min', min);
        this.input.setAttribute('step', step);

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
