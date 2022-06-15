
import { BaseTextElement } from './BaseTextElement.js';

export class PhoneElement extends BaseTextElement {
    constructor(context, props, id) {
        super(context, props, id, 'tel');
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
