
import { Div } from './BuildingBlocks.js';

/**
 * Bootstrap 4 alert.
 */
export class Alert extends Div {
    /**
     * Constructor.
     * @param {string} text Text to present.
     * @param {string} color Bootstrap 4 colors: primary | danger | ....
     * @param {boolean} center True to center text.
     * @param {boolean} bold True for Bold text.
     * @param {number} size Text size in em. Default: 1em.
     */
    constructor(color, text=null, center=true, bold=false, size='1em') {
        super();
        this.addClass('alert');
        this.addClass('alert-' + color);
        this.setAttribute('role','alert');
        if (center) this.addClass('text-center');
        if (bold) this.addClass('font-weight-bold');    
        this.setStyle('font-size', size);       
        if (text) this.setTextContent(text);
    }
}

