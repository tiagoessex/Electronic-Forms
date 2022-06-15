
import { BaseTextElement } from './BaseTextElement.js';

export class WebsiteElement extends BaseTextElement {
    constructor(context, props, id) {
        super(context, props, id, 'url');
    }

    save() {
        super.save();
        return new Promise((resolve) => resolve(this.status));
    }  

    async restore(data) {
        super.restore(data);
    }     
}
