
import { Div } from '/static/js/ui/BuildingBlocks.js';
import { BaseElement } from '../../BaseElement.js';
import { LIST_ELEMENT } from '../../../constants.js';

export class ListBaseElement extends BaseElement {
    constructor(context, props=null) {
        super(context, props);

        this.addClass(LIST_ELEMENT);

        this.addClass('card');
        this.addClass('bg-light');
        this.addClass('shadow');
        this.addClass('p-1');
        this.addClass('mb-2');
        this.addClass('bg-white');
        this.addClass('rounded');

        this.body = new Div();
        this.body.addClass('card-body');
        this.body.attachTo(this);
       
    }


    save() {
        super.save();
    }

    async restore(data) {
        super.restore(data);
    } 

}
