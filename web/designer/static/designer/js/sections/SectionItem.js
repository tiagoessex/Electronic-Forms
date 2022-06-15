import { Div } from '/static/js/ui/BuildingBlocks.js';
import { SECTION_ITEM_CLASS } from './constants.js';

/**
 * Each SectionItem corresponds to an Element.
 */
export class SectionItem extends Div {
    /**
     * Constructor.
     * @param {node} container Container of for the Item (Section items container).
     * @param {string} element_id ID of the SectionItem/Element.
     * @param {string} element_name Name of the SectionItem/Element.
     * @param {boolean} is_group If true then this item represents a group.
     */
    constructor(container, element_id, element_name, is_group=false) {
        super();
        this.addClass(SECTION_ITEM_CLASS);
        this.addClass('shadow bg-light p-3 mb-1 rounded text-wrap');    
        this.setId(SECTION_ITEM_CLASS + '-' + element_id);
        this.setAttribute('data-id', element_id);
        this.dom.innerHTML = element_name;
        this.attachTo(container);

        if (is_group) {
            this.addClass('lv-gp-item')
        }        
    }
}

