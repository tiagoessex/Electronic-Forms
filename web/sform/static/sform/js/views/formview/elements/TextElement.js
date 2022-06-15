
import { BaseTextElement } from './BaseTextElement.js';

export class TextElement extends BaseTextElement {
    constructor(context, props, id) {
        super(context, props, id, 'text');
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
