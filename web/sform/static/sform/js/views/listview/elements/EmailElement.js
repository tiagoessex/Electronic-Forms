
import { BaseTextElement } from './BaseTextElement.js';

export class EmailElement extends BaseTextElement {
    constructor(context, props, id) {
        super(context, props, id, 'email');
    }

    save() {
        super.save();
        return new Promise((resolve) => resolve(this.status));
    }
    
    async restore(data) {
        super.restore(data);
    }     
}
