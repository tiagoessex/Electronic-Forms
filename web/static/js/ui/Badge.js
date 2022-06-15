
import { Span } from './BuildingBlocks.js';

/**
 * A simple bootstrap 4 badge.
 */
export class Badge extends Span {
    /**
     * Constructor.
     * @param {string} type Badge type: primary|info|danger|warning|success|light|dark|secondary
     * @param {string} text Badge text.
     */
    constructor(type, text, margin='p-0') {
        super();
        this.addClass('badge');
        this.addClass('badge-' + type);
        this.addClass(margin);
        this.setTextContent(text);
    }
}