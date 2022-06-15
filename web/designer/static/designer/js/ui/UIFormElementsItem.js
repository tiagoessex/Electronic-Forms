/**
 * uses JQUERY UI to make items draggable
 * make sure JQUERY and JQUERY UI are loaded before this module
 */
import { Div } from '/static/js/ui/BuildingBlocks.js';
import { ELEMENTS_TYPE } from '../elements/constants.js';
import { HELPERBACKGROUNDCOLOR } from '../constants/colors.js';
import { DELTA_C_R_X, DELTA_C_R_Y, MAX_Y_C_R } from '../constants/limits.js';


export class UIFormElementsItem extends Div {
    /**
     * Constructor
     * @param {Context} context Context.
     * @param {string} text Element name.
     * @param {ELEMENT_TYPE} ele_type ELEMENT_TYPE (see /elements/constants.js)
     * @param {any} data Extra data, configuration, usw.
     */
	constructor(context, text, ele_type=ELEMENTS_TYPE.TEXT, data=null) {
		super();
        this.addClass("UIFormElementsItem card shadow p-1 mx-1 bg-white rounded");
        this.setTextContent(text);
        this.setAttribute("data-type", ele_type.name);
        if (data) {
            this.setAttribute("data-data", JSON.stringify(data));
        }
        this.addClass('unselectable');
    
        // dimensions required for DB Fields, specifically for check/radios
        // where the element actually represents a group of check/radios
        // and not just one, so it's necessary to calculate the dimensions
        // of the group
        this.dimensions = {'width': null, 'height': null};
        if (data && data.hasOwnProperty('values') && ele_type !== ELEMENTS_TYPE.DROPDOWN) {
            const n = data['values'].length;
            const rows = n>MAX_Y_C_R?MAX_Y_C_R:n;
            const cols = parseInt(n/MAX_Y_C_R) > 0?parseInt(n/MAX_Y_C_R):null;
            this.dimensions['height'] = rows*DELTA_C_R_Y;
            this.dimensions['width'] = null?null:cols * DELTA_C_R_X;
        }

        // jquery ui - make this item draggable
        $(this.dom).draggable({
            cursor: 'move',
            containment: 'document',
            //revert: true,
            helper: () => createHelper(ele_type, context.zoom, this.dimensions).dom,
            scroll: false,
            appendTo: 'body',
            //grid: [ 10, 10 ],
            //grid: [context.grid, context.grid],
            zIndex: 10000,   // make sure it can be dragged into the pages area
            cursorAt:  { left: 0, top: 0 }, // mouse in the up left corner
            //snap: '.page',
            //snapMode: "inner",
            /*
            drag: function( event, ui ) {
                // snap to grid
                //return;
            },
            */  
                   
        });   
	}

}

/**
 * Creates the help that appears while dragging an element from
 * the Elements panel to the page.
 * @param {ELEMENT_TYPE} type Type of element.
 * @param {number} zoom Current page zoom.
 * @param {object} dimensions Helper dimensions (only relevant if DB Fields).
 * @returns The helper.
 */
function createHelper(type, zoom, dimensions) {
    const helper = new Div();
    helper.setStyle("opacity","0.25");
    helper.setStyle("border","dashed"); 
    helper.setStyle("background", HELPERBACKGROUNDCOLOR);
    helper.setStyle("width", (dimensions['width']?dimensions['width']:(type.dimensions.width * zoom)) + "px");
    helper.setStyle("height", (dimensions['height']?dimensions['height']:(type.dimensions.height * zoom)) + "px");
    return helper;
}
