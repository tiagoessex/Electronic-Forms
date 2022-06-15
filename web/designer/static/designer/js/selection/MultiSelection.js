
import { Div } from '/static/js/ui/BuildingBlocks.js';
//import { PROPERTIES_ID } from '../constants/constants.js';
import { MULTISELECTION_CLASS } from './constants.js';
import { TAB_AREA_ID } from '../constants/constants.js';


const FORM_TAB = document.getElementById(TAB_AREA_ID);


/**
 * MultiSelection class.
 * 
 * All selected elements become children of this class and this class
 * becomes a child of the elements page (current page).
 * On deselection, it returns its elements to the page.
 * 
 * ATT: 
 *      - no multipage elements selection.
 *      - while selected, all elements lost their draggable property
 *          which will be restored once deselected.
 * 
 */
export class MultiSelection extends Div {
    /**
     * Constructor.
     * @param {Context} context Context.
     */
    constructor(context) {
        super();       
        this.page = null;
        this.elements = [];
        this.context = context;

        this.addClass(MULTISELECTION_CLASS);

        this.setStyle('position', 'absolute');

        $(this.dom).draggable({
             containment: "parent",
             grid: [context.grid, context.grid],

             drag: function( event, ui ) { 
                // snap to grid
                const grid_s = self.context.grid * self.context.zoom;
                const _top_drop = Math.round(ui.position.top / grid_s) * grid_s;
                const _top_left = Math.round(ui.position.left / grid_s) * grid_s;

                ui.position.top = Math.round(_top_drop / self.context.zoom);
                ui.position.left = Math.round(_top_left / self.context.zoom);
             },
           
             stop: function( event, ui ) {
                self.context.signals.onMultiMoveStoped.dispatch(parseInt(ui.position.top), parseInt(ui.position.left));
            }
        });

        const self = this;
        this.dom.addEventListener('keydown', function(e) {
            if (!this.isLocked)
            self.getKeyAndMove(e, self.dom) 
        });        

        context.signals.onMouseGridChanged.add((delta) => {
            $(this.dom).draggable( "option", "grid", [ delta, delta ] );
        });
        context.signals.onCursorGridChanged.add((delta) => {
            $(this.dom).draggable( "option", "grid", [ delta, delta ] );
        });

    }


    /**
     * Moves the selection with the arrow keys.
     * @param {event} e Event.
     */
    getKeyAndMove(e){
        e.preventDefault();			
		var key_code=e.which||e.keyCode;
		switch(key_code){
			case 37: //left arrow key
                this.dom.style.left = parseInt(this.dom.style.left) - this.context.grid_cursor + "px";
                this.context.signals.onMultiMoveStoped.dispatch();
				break;
			case 38: //Up arrow key
                this.dom.style.top = parseInt(this.dom.style.top) - this.context.grid_cursor + "px";
                this.context.signals.onMultiMoveStoped.dispatch();
				break;
			case 39: //right arrow key
                this.dom.style.left = parseInt(this.dom.style.left) + this.context.grid_cursor + "px";
                this.context.signals.onMultiMoveStoped.dispatch();
				break;
			case 40: //down arrow key
                this.dom.style.top = parseInt(this.dom.style.top) + this.context.grid_cursor + "px";
                this.context.signals.onMultiMoveStoped.dispatch();
				break;
		}        
	}    

    /**
     * Selects an array of elements.
     * It calculates a draggable bounding box that encompasses all elements and makes
     * all elements its children.
     * @param {array} elements Array of Elements.
     * @param {string} page_id Page ID.
     */
    select(elements, page) {
        this.page = page;
        this.elements = elements;
        
        this.attachTo(this.page);

        this.setAttribute('tabindex',-1);

        let m_left = Number.MAX_SAFE_INTEGER;
        let m_top = Number.MAX_SAFE_INTEGER;
        let m_width = Number.MIN_SAFE_INTEGER;
        let m_height = Number.MIN_SAFE_INTEGER;
        for (let i=0; i<elements.length; i++) {
            const e = elements[i].dom;
            if (e.parentNode !== this.page) continue;
                
            const left = parseInt(e.style.left);
            const top = parseInt(e.style.top);
            const width = parseInt(e.style.width);
            // because of the tables ...
            const height = parseInt(e.style.height) == parseInt(e.style.height) ? parseInt(e.style.height) : elements[i].dom.clientHeight;
            if (m_left > left) m_left = left;
            if (m_top > top ) m_top = top;
            if (m_width < left + width) m_width = left + width;
            if (m_height < top + height) m_height = top + height

            $(e).draggable('disable');
            if ($(e).data('type') !== 'TABLE' && $(e).data('type') !== 'STATICTABLE') $(e).resizable('disable');
        }
        
        this.dom.style.left = m_left;
        this.dom.style.top = m_top;
        this.dom.style.width = m_width - m_left;
        this.dom.style.height = m_height - m_top;
        this.dom.style.border = 'dashed';
        this.dom.style.backgroundColor = 'transparent';

        for (let i=0; i<elements.length; i++) {			 
            this.dom.appendChild(elements[i].dom);
            elements[i].dom.style.left = parseInt(elements[i].dom.style.left) - m_left;
            elements[i].dom.style.top = parseInt(elements[i].dom.style.top) - m_top;
            elements[i].select(true);
        }

        this.dom.focus();
        FORM_TAB.scrollTop = this.context.scroll_top;
        FORM_TAB.scrollLeft = this.context.scroll_left;
    }

    /**
     * On deselection, return elements to their page.     * 
     * @param {function} onDeselect Function.
     */
    deselect(onDeselect = null) {
        this.elements.forEach(element => {
            const e1 = this.page.appendChild(element.dom);
            e1.style.left = parseInt(e1.style.left) + parseInt(this.dom.style.left);
            e1.style.top = parseInt(e1.style.top) + parseInt(this.dom.style.top);
            $(e1).draggable('enable');
            if ($(e1).data('type') !== 'TABLE' && $(e1).data('type') !== 'STATICTABLE') $(e1).resizable('enable');
            element.unselect();
            //console.log("M > ", element.props[PROPERTIES_ID.IDPROPERTY]);
        });

        if (onDeselect) onDeselect(this.elements);

        this.elements = [];
        if (this.dom.parentNode) this.detach();
        
    }

    /**
     * Are there elements selected?
     * @returns True if some element is currently selected. False otherwise.
     */
    hasElements() {
        return this.elements.length > 0;
    }

    /**
     * Get all elements encompassed by the selection.
     * @returns Array with all selected elements.
     */
    getElements() {
        return this.elements;
    }

}

