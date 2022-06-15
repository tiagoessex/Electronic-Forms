import { Div, Text } from '/static/js/ui/BuildingBlocks.js';
import { PROPERTIES_ID, TAB_AREA_ID } from '../../constants/constants.js';
import { 
    ELEMENTS_TYPE, 
    ELEMENT, 
    REPEATABLE_CLASS, 
    LOCKED_CLASS,
    DISABLED_CLASS,
    CROSSED_CLASS,
} from '../constants.js';
import { isElement } from '/static/js/jshtml.js';
import { DEFAULT_FONT_SIZE } from '../../constants/dimensions.js';
import { HEXtoRGBA } from '/static/js/jscolor.js';
import { CLEARBACKGROUNDCOLOR, DEFAULTBACKGROUNDCOLOR, SELECTEDELEMENTCOLOR } from '../../constants/colors.js';
import { UIPropertiesMenu } from '../../ui/UIPropertiesMenu.js';


const FORM_TAB = document.getElementById(TAB_AREA_ID);

/**
 * Base class representing a single Form Element.
 * 
 * For now, all repeatable structures are present in all elements. 
 * In the future, all repeatable elements should inherit from some RepeatableElement class.
 * The same for the lock.
 * 
 * Lock element => data-lock: true && bLocked = true && class = element-locked
 * Repetable element => bRep = true && class = element-repeatable 
 * 
 */
export class BaseElement extends Div {

    /**
     * Constructor.
     * @param {ELEMENTS_TYPE} type Type of element (defined in constants.js)
     * @param {object} props Object corresponding to the properties (see UIPropertiesMenu.js).
     * @param {node} parent Node parent of the Element.
     * @param {Context} context Context.
     * @param {number} left Left position coordinate.
     * @param {number} top Top postion coordinate.
     * @param {string} id Id of the element.
     * @param {rgb[a]} background Background color.
     * @param {string} text Text to present.
     */
    constructor(type=ELEMENTS_TYPE.NONE, props = null, parent=null, context=null, left, top, id, background=null) {
        super();
        this.type = type;
        this.props = props;
        this.context = context;
        this.parent = parent;   // original parent
        const self = this;
        this.bLocked = false;
        this.bMulti = false;   // currently part of a multi-selection group
        this.bRep = false;     // is repeatable
        this.parent_id = null;

        this.isSelected = false;
        

        // if neither copies nor loaded
        // then clone a default properties object
        if (this.props == null)
            this.props = Object.assign({}, UIPropertiesMenu.DEFAULTPROPS)

        // required, otherwise, if name changes => no more resizable
        this.text = new Text();
        this.text.attachTo(this);
        // prevent selection marquee to highlight selelect this text
        this.text.addClass('unselectable');

        if (props && props[PROPERTIES_ID.NAMEPROPERTY] !== '') {
            this.setText(props[PROPERTIES_ID.NAMEPROPERTY]);
        }

        // to allow binding key events in elements
        // -1 => no tab focus, only programmatic focus
        this.setAttribute('tabindex',0); 
        this.setAttribute('data-type', type.name);
        this.addClass(ELEMENT);
        this.setId(id);

   
        if (parent) {
            this.attachTo(this.parent);
            this.parent_id = isElement(this.parent)?this.parent.id:this.parent.dom.id; 
        } else {
            console.error('[Elements->Element::ctor] No parent specified!')
        }
        if (!context) {
            console.error('[Elements->Element::ctor] Context missing!')
        }

        // set the common look
        this.setStyle('z-index',props?props[PROPERTIES_ID.ZINDEXPROPERTY]:10);
        this.setStyle('font-size',(props?props[PROPERTIES_ID.FONTSIZEPROPERTY]:DEFAULT_FONT_SIZE) + 'px');
        this.setStyle('font-family',props?props[PROPERTIES_ID.FONTPROPERTY]:"initial");
        this.setStyle('font-style',props?props[PROPERTIES_ID.FONTSTYLEPROPERTY]:"normal");
        this.setStyle('text-decoration',props?props[PROPERTIES_ID.FONTDECORATIONPROPERTY]:"initial");
        this.setStyle('font-weight',props?props[PROPERTIES_ID.FONTWEIGHTPROPERTY]:"none");
        this.setStyle('text-align',props?props[PROPERTIES_ID.HORIZONTALALIGNMENTPROPERTY]:"left");
        this.setStyle('transform','rotate(' + (props?props[PROPERTIES_ID.ROTATIONPROPERTY]:0) + 'deg)');
        this.setStyle('msTransform','rotate(' + (props?props[PROPERTIES_ID.ROTATIONPROPERTY]:0) + 'deg)');        
        if (props) {
            const border = props[PROPERTIES_ID.BORDERPROPERTY];
            switch (props[PROPERTIES_ID.BORDERBORDERSPROPERTY]) {
                case 'top': this.dom.style.borderStyle = 'none'; this.dom.style.borderTop = border; break;
                case 'bottom': this.dom.style.borderStyle = 'none'; this.dom.style.borderBottom = border; break;
                case 'left': this.dom.style.borderStyle = 'none'; this.dom.style.borderLeft = border; break;
                case 'right': this.dom.style.borderStyle = 'none'; this.dom.style.borderRight = border; break;
                default:
                    this.dom.style.borderStyle = border;
            }
            this.dom.style.borderWidth = props[PROPERTIES_ID.BORDERWIDTHPROPERTY];
        } else {
            this.setStyle("border", "none");
        }
        this.setStyle("border-width",(props?props[PROPERTIES_ID.BORDERWIDTHPROPERTY]:"1") + 'px');
        this.setStyle("-webkit-border-radius",(props?props[PROPERTIES_ID.BORDERRADIUSPROPERTY]:"0") + 'px');
        this.setStyle("-moz-border-radius",(props?props[PROPERTIES_ID.BORDERRADIUSPROPERTY]:"0") + 'px');
        this.setStyle("border-radius",(props?props[PROPERTIES_ID.BORDERRADIUSPROPERTY]:"0") + 'px');        
        this.setStyle("top",(props?props[PROPERTIES_ID.TOPPROPERTY]:top)+"px");
        this.setStyle("left",(props?props[PROPERTIES_ID.LEFTPROPERTY]:left)+"px");
        this.setStyle("position","absolute");
        this.setStyle("width", (props?props[PROPERTIES_ID.WIDTHPROPERTY]:type.dimensions.width) + "px");
        this.setStyle("height", (props?props[PROPERTIES_ID.HEIGHTPROPERTY]:type.dimensions.height) + "px");
        this.setStyle("color", (props?props[PROPERTIES_ID.COLORPROPERTY]:'#000'));
        if (props) {
            const color = props[PROPERTIES_ID.BACKCOLORPROPERTY];
            const alpha = props[PROPERTIES_ID.BACKALPHAPROPERTY];
            this.setStyle("background-color", HEXtoRGBA(color, alpha));
        } else {
            if (background) {
                this.setStyle("background-color", background);
            } else {
                this.setStyle("background-color", CLEARBACKGROUNDCOLOR);
            }
        }

        this.current_background_color = this.dom.style.backgroundColor;
        // disabled class has !important => disabled background color has 
        // precedence display to current_background_color
        if (this.props[PROPERTIES_ID.ENABLEDPROPERTY] === 'no') {
            this.addClass(DISABLED_CLASS);
        }   
        if (this.props[PROPERTIES_ID.CROSSEDPROPERTY] === 'yes') {
            this.addClass(DISABLED_CLASS);
            this.addClass(CROSSED_CLASS);
        }


        this.makeDraggable();
        if (type !== ELEMENTS_TYPE.TABLE && type !== ELEMENTS_TYPE.STATICTABLE) this.makeResizable();
        this.makeMovable();
        
        this.dom.addEventListener('click', function(event) {
            if (event.shiftKey) {
                if (self.isSelected) {
                    self.context.signals.onElementShiftUnSelected.dispatch(self);
                } else {
                    self.context.signals.onElementShiftSelected.dispatch(self);
                }
            } else {
                self.context.signals.onElementSelected.dispatch(self, false);
            }
        })

        this.signal_onMouseGridChanged = context.signals.onMouseGridChanged.add((delta) => {
            $(this.dom).draggable( "option", "grid", [ delta, delta ] );
            if (type !== ELEMENTS_TYPE.TABLE && type !== ELEMENTS_TYPE.STATICTABLE) $(this.dom).resizable( "option", "grid", [ delta, delta ] );
        });
        this.signal_onCursorGridChanged = context.signals.onCursorGridChanged.add((delta) => {
            $(this.dom).draggable( "option", "grid", [ delta, delta ] );
            if (type !== ELEMENTS_TYPE.TABLE && type !== ELEMENTS_TYPE.STATICTABLE) $(this.dom).resizable( "option", "grid", [ delta, delta ] );
        });

        // element locked => no more resizable and movable
        this.signal_onLockElement = context.signals.onLockElement.add((_id) => {
            if (id === _id && !this.bLocked) {
                this.bLocked = true;
                $(this.dom).draggable('disable');
                if (type !== ELEMENTS_TYPE.TABLE && type !== ELEMENTS_TYPE.STATICTABLE) $(this.dom).resizable('disable');
                this.setAttribute('data-lock','true');  
                this.addClass(LOCKED_CLASS);
                this.setStyle('pointer-events','none');
                if (!type.availability.groups)
                    this.setStyle('overflow','hidden');
            }
        });
        // element unlocked => activate resizable and movable properties
        this.signal_onUnlockElement = context.signals.onUnlockElement.add((_id) => {            
            if (id === _id && this.bLocked) {
                this.bLocked = false;
                $(this.dom).draggable('enable');
                if (type !== ELEMENTS_TYPE.TABLE && type !== ELEMENTS_TYPE.STATICTABLE) $(this.dom).resizable('enable');
                this.removeAttribute('data-lock');
                this.removeClass(LOCKED_CLASS);
                this.setStyle('pointer-events','auto');
                if (!type.availability.groups)
                    this.dom.style.overflow = null;
            }
        });

        /**
         * If a page is removed, update the page property on all affected elements, i.e., 
         * all the elements present in the pages after the one removed.
         */
        this.signal_onPageRemoved = context.signals.onPageRemoved.add((page, page_number) => {
            const _page = parseInt(this.props[PROPERTIES_ID.PAGENUMBERPROPERTY]) - 1;            
            if (_page > page_number) {
                this.props[PROPERTIES_ID.PAGENUMBERPROPERTY] = _page;
            }
        });

        /**
         * If a page is added, update the page property on all affected elements, i.e., 
         * all the elements present in the next pages.
         */
        this.signal_onPageAdded = context.signals.onPageAdded.add((page_number, page) => {            
            const _page = parseInt(this.props[PROPERTIES_ID.PAGENUMBERPROPERTY]);
            if (_page > page_number) {
                this.props[PROPERTIES_ID.PAGENUMBERPROPERTY] = _page + 1;
            }
        }, null, 10);

        /**
         * 2 pages were swapped => check if this element is affected, and if so
         * update its page number.
         */
        this.signal_onPagesSwapped = context.signals.onPagesSwapped.add((from, to) => {            
            const _page = parseInt(this.props[PROPERTIES_ID.PAGENUMBERPROPERTY]);
            if (_page == from + 1) {
                this.props[PROPERTIES_ID.PAGENUMBERPROPERTY] = to + 1;
            } else if (_page == to + 1) {
                this.props[PROPERTIES_ID.PAGENUMBERPROPERTY] = from + 1;
            }
        });
        
    }

    /**
     * Make the Element draggable.
     * Jquery UI Draggable
     */
    makeDraggable() { 
        const self = this;
        
        const height = isElement(this.parent)?this.parent.clientHeight:this.parent.dom.clientHeight;
        const width = isElement(this.parent)?this.parent.clientWidth:this.parent.dom.clientWidth;
        

        $(this.dom).draggable({
            cancel: null,
            grid: [self.context.grid, self.context.grid],
            zIndex: 20000,
            //containment: isElement(self.parent)?self.parent:self.parent.dom,
            drag: function( event, ui ) {
                // snap to grid
                const grid_s = self.context.grid * self.context.zoom;
                const _top_drop = Math.round(ui.position.top / grid_s) * grid_s;
                const _top_left = Math.round(ui.position.left / grid_s) * grid_s;

                ui.position.top = Math.round(_top_drop / self.context.zoom);
                ui.position.left = Math.round(_top_left / self.context.zoom);
                
                // keep it inside the parent
                if (ui.position.left < 0) 
                    ui.position.left = 0;
                if (ui.position.left + $(this).width() > width)
                    ui.position.left = width - $(this).width();  
                if (ui.position.top < 0)
                    ui.position.top = 0;
                if (ui.position.top + $(this).height() > height)
                    ui.position.top = height - $(this).height();

                self.context.signals.onElementMoved.dispatch(self);
            },
            stop: function( event, ui ) {
                self.context.signals.onElementMoveStoped.dispatch(self);
            }
        });
    }

    /**
     * Make the Element resizable.
     * Jquery UI Resizable
     */
    makeResizable() {
        const self = this; 
        const height = isElement(this.parent)?this.parent.clientHeight:this.parent.dom.clientHeight;
        const width = isElement(this.parent)?this.parent.clientWidth:this.parent.dom.clientWidth;
        let last_valid_width = 0;
        let last_valid_height = 0;
        $(this.dom).resizable({
            autoHide: true,    // only show when mouse over the Element
            grid: [self.context.grid, self.context.grid],
            zIndex: 20000,
            handles: "e, s, se",
            start: function (event, ui) {
            },
            resize: function( event, ui ) {               

                var changeWidth = ui.size.width - ui.originalSize.width; // find change in width
                var newWidth = ui.originalSize.width + changeWidth / self.context.zoom; // adjust new width by our zoomScale        
                var changeHeight = ui.size.height - ui.originalSize.height; // find change in height
                var newHeight = ui.originalSize.height + changeHeight / self.context.zoom; // adjust new height by our zoomScale        

                // keep the resizable inside the parent
                if (ui.position.left + ui.size.width < width) {
                    ui.size.width = newWidth;
                    last_valid_width = newWidth;
                } else {
                    ui.size.width = last_valid_width;
                }

                if (ui.position.top + ui.size.height < height) {
                    ui.size.height = newHeight;
                    last_valid_height = newHeight;                    
                } else {
                    ui.size.height = last_valid_height;
                }

                self.context.signals.onElementResized.dispatch(self, ui.size.width, ui.size.height);
            },
            stop: function( event, ui ) {
                self.context.signals.onElementResizeStoped.dispatch(self);
            }        
        });        
    }

    /**
     * Make the Element movable, with the keyboard.
     */
    makeMovable() {
        const self = this;
        this.dom.addEventListener('keydown', function(e) {
            if (!self.bLocked && !self.bMulti) {
                self.getKeyAndMove(e, self.dom) 
            }
        });
    }

    /**
     * Move the Element with the arrow keys.
     * @param {event} e Event.
     */
    getKeyAndMove(e){
        e.preventDefault();			
		var key_code=e.which||e.keyCode;
		switch(key_code){
			case 37: //left arrow key
                this.dom.style.left = parseInt(this.dom.style.left) - this.context.grid_cursor + "px";
                this.context.signals.onElementMoved.dispatch(this);
				break;
			case 38: //Up arrow key
                this.dom.style.top = parseInt(this.dom.style.top) - this.context.grid_cursor + "px";
                this.context.signals.onElementMoved.dispatch(this);
				break;
			case 39: //right arrow key
                this.dom.style.left = parseInt(this.dom.style.left) + this.context.grid_cursor + "px";
                this.context.signals.onElementMoved.dispatch(this);
				break;
			case 40: //down arrow key
                this.dom.style.top = parseInt(this.dom.style.top) + this.context.grid_cursor + "px";
                this.context.signals.onElementMoved.dispatch(this);
				break;
		}        
	} 

    /**
     * Sets the text that appears in the Element.
     * This text can be the name | label | id depending on the element.
     * The location of the text also depends on the element.
     * If text/number input => inside the input box, else, top left corner.
     * @param {string} text Text.
     */
    setText(text) {
        if (this.type === ELEMENTS_TYPE.PHOTO || 
            this.type === ELEMENTS_TYPE.GPS_MAP || 
            this.type === ELEMENTS_TYPE.SIGNATURE || 
            this.type === ELEMENTS_TYPE.DRAWING || 
            this.type === ELEMENTS_TYPE.USERIMAGE || 
            this.type === ELEMENTS_TYPE.IMAGE ||  
            this.type === ELEMENTS_TYPE.BARCODE_IMAGE ||
            this.type === ELEMENTS_TYPE.VERTICALLINE ||
            this.type === ELEMENTS_TYPE.HORIZONTALLINE ||
            this.type === ELEMENTS_TYPE.BOX ||
            this.type === ELEMENTS_TYPE.CIRCLE || 
            this.type === ELEMENTS_TYPE.STATICTABLE ||
            this.type === ELEMENTS_TYPE.TABLE) {
            this.text.setStyle('position','absolute');
            this.text.setStyle('font-weight','bold');
            this.text.setStyle('font-size','0.75rem');
            this.text.setStyle('background-color','black');
            this.text.setStyle('color','white');
        }
        if (this.type !== ELEMENTS_TYPE.CHECKBOX && this.type !== ELEMENTS_TYPE.RADIO) {
            this.text.setTextContent(text);
        }
    }

    /**
     * Element selected => highlight it.
     * Not using classes, so any change in the properties can be seen in real time.
     * @param {boolean} bMulti If true, then the element is part of a multi-selection.
     */
    select(bMulti=false, scroll = true) {
        // classes have precedence => if disabled, it's encessary to remove the disabled class
        // otherwise the SELECTEDELEMENTCOLOR wouldn't be displayed.
        if (this.props[PROPERTIES_ID.ENABLEDPROPERTY] === 'no' || this.props[PROPERTIES_ID.CROSSEDPROPERTY] === 'yes') {
            this.removeClass(DISABLED_CLASS);        }
      
        if (this.type === ELEMENTS_TYPE.TABLE) {
            $(this.dom).css('background-color', SELECTEDELEMENTCOLOR); 
            $(this.dom).find('td').each(function( index ) {
                $(this).children().first().css('background-color', SELECTEDELEMENTCOLOR); 
            });       
            
           // $(this.dom).html(this.dom.innerHTML.replaceAll("rgba(51, 255, 255, 0.2)", SELECTEDELEMENTCOLOR));
        } else {
            this.current_background_color = this.dom.style.backgroundColor;
            this.dom.style.backgroundColor = SELECTEDELEMENTCOLOR;
        }
        //if (this.bRep) this.dom.style.outline = 'thick solid #00ff4063';

        // focus necessary to be able to move the element with the arrow keys     
        this.dom.focus();

        // without this the page would scroll and stay focuses on center of element
        // this way, we scroll the pages area back to where it was before selection
        //$('#form-tab').animate({scrollTop: this.context.scroll_top, scrollLeft: this.context.scroll_left}, 0);
        if (!scroll) {
            FORM_TAB.scrollTop = this.context.scroll_top;
            FORM_TAB.scrollLeft = this.context.scroll_left;
        }
        
        this.bMulti = bMulti;

        this.isSelected = true;
    }

    /**
     * Element unselected => remove the highlight.
     */    
    unselect() {
        if (this.props[PROPERTIES_ID.ENABLEDPROPERTY] === 'no' || this.props[PROPERTIES_ID.CROSSEDPROPERTY] === 'yes') {
            this.addClass(DISABLED_CLASS);
        }   
        this.dom.style.backgroundColor = this.current_background_color;
        this.bMulti = false;
        this.isSelected = false;

        if (this.type === ELEMENTS_TYPE.TABLE) {
            $(this.dom).find('td').each(function( index ) {
                $(this).children().first().css('background-color', DEFAULTBACKGROUNDCOLOR); 
            });
        }  
    }

    /**
     * Get the current background color.
     * @returns RGB color.
     */
    getBgColor() {
        return this.current_background_color;
    }

    /**
     * 
     * @param {string | rgb[a]} color RGB[A] color.
     * @param {boolean} apply Apply the color to the element?
     */
    setBgColor(color, apply = false) {
        this.current_background_color = color;
        if (apply) {
            this.dom.style.backgroundColor = color;
        }
    }

    /**
     * Cleanup operations.
     * To be called before deleting an element.
     */
    clear() {
        this.signal_onMouseGridChanged.detach();
        this.signal_onCursorGridChanged.detach();
        this.signal_onLockElement.detach();
        this.signal_onUnlockElement.detach();
        this.signal_onPageRemoved.detach();
        this.signal_onPageAdded.detach();
        this.signal_onPagesSwapped.detach();
    }

    /**
     * Is Element Locked?
     * @returns True if Element is locked. False otherwise.
     */
    isLocked() {
        return this.bLocked;
    }

    /**
     * Marks this element as repeatable?
     */
     setRepeatable(repeatable = true) {
        this.bRep = repeatable;
        repeatable?this.addClass(REPEATABLE_CLASS):this.removeClass(REPEATABLE_CLASS);
    }

    /**
     * Is Element repeatable?
     * @returns True if Element is repeatable. False otherwise.
     */
    isRepeatable() {
        return this.bRep;
    }

    /**
     * Get Element parent.
     * @returns Parent.
     */
    getParent() {
        return this.parent;
    }

    /**
     * Sets a new parent.
     * @param {node} new_parent New parent.
     */
    setParent(new_parent) {
        if (this.parent) this.parent.removeChild(this.dom);
        this.attachTo(new_parent);
        this.parent = new_parent;
    }


    /**
     * Sets the visual indication that the element is disabled.
     * Background selection color should work as normal.
     * @param {boolean} disable True if element is set disabled. False otherwise.
     */
    setDisabled(disable = true) {
        disable?this.addClass(DISABLED_CLASS):this.removeClass(DISABLED_CLASS);
    }

    /**
     * Sets the visual indication that the element is crossed: disabled + cross.
     * Background selection color should work as normal.
     * @param {boolean} crossed True if element is to be set crossed. False otherwise.
     */
    setCrossed(crossed = true) {
        crossed?this.addClass(DISABLED_CLASS):this.removeClass(DISABLED_CLASS);
        crossed?this.addClass(CROSSED_CLASS):this.removeClass(CROSSED_CLASS);
    }

}
