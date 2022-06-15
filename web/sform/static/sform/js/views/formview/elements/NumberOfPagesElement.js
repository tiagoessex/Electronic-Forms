
import { BaseTextElement } from './BaseTextElement.js';

export class NumberOfPagesElement extends BaseTextElement {
    constructor(context, props, id, numberofpages) {
        super(context, props, id, 'text');

        this.input.setAttribute('readonly');
        this.input.dom.value = numberofpages;
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
