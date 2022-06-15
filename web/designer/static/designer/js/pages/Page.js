import { Div } from '/static/js/ui/BuildingBlocks.js';
import { PAGE_CLASS } from './constants.js';

/**
 * Single Page.
 */
export class Page extends Div{
    /**
     * Single Page.
     * @param {number} number Unique number, for id purpose.
     */
    constructor(number) {
        super();
        const id = "page-" + number;
        this.addClass(PAGE_CLASS);
        this.setId(id);
        this.setStyle("background-image",'');
        this.setStyle("left",'0px');
        this.setStyle("right",'0px');
        this.setStyle("background-size",'100% 100%');
        this.setStyle("position",'relative');
    }
}





