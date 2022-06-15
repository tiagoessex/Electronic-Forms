import { PAGE_CLASS } from '../pages/constants.js';
import { ELEMENT } from '../elements/constants.js';
import { GRID_CLASS } from '../grid/constants.js';
import { PAGES_AREA_ID } from '../constants/constants.js';

const MARQUEE = document.getElementById('marquee');
const PAGES = document.getElementById(PAGES_AREA_ID);

const ELEMENT_SELECTOR = '.' + ELEMENT;

/**
 * Rectangular marquee selection tool.
 * 
 * NOTES:
 * 		- only able to select element in the same page.
 * 		- if the rectangle also encompasses elements form other pages, these will be discarted.
 * 
 */
export class SelectionMarquee {
	/**
	 * Constructor.
	 * @param {Context} context Context.
	 * @param {function} onStart Called when mouse down. Args: ().
	 * @param {function} onSelected Called when mouse up. Args: (array of elements, parent).
	 */
	constructor(context, onStart=null, onSelected=null) {
		this.context = context;
		this.onSelected = onSelected;
		this.x1 = 0;
		this.y1 = 0;
		this.x2 = 0;
		this.y2 = 0;
		this.elements = [];
		const self = this;
		this.selecting = false;
				
		PAGES.addEventListener("mousedown", function(e) {
			if (e.button != 0) return true;
            if (e.target.classList.contains(PAGE_CLASS) || 
				e.target.classList.contains(GRID_CLASS) ||
				e.target.classList.contains('pages-area')) {
					if (onStart) onStart();
					MARQUEE.hidden = 0;
					self.x1 = e.clientX;
					self.y1 = e.clientY;
					self.x2 = self.x1;
					self.y2 = self.y1;
					self.reCalc();
					self.elements = [];
					self.selecting = true;
            }
		});		


		MARQUEE.addEventListener("mousemove", function(e) {
			if (self.selecting) {
				self.x2 = e.clientX;
                self.y2 = e.clientY;
				self.reCalc();
			}			
		});		

		PAGES.addEventListener("mousemove", function(e) {
			//e.preventDefault();
			if (self.selecting) {
				self.x2 = e.clientX;
                self.y2 = e.clientY;
				self.reCalc();
			}			
		});
		
		// release mouse button
		PAGES.addEventListener("mouseup", function(e) {
			self.exit();
		});
		// prevents marquee freeze if up outside area
		document.body.onmouseup = function() { 
			self.exit();
		}
		// exists the browser
		document.body.onmouseleave = function() { 
			self.exit();
		}		

	}

	exit() {
		if (!this.selecting) return;
		MARQUEE.hidden = 1;
		const [elements, page] = this.rectangleSelect(ELEMENT_SELECTOR, this.x1, this.y1, this.x2, this.y2);
		if (this.onSelected) this.onSelected(elements, page);
		this.selecting = false;
		this.x1 = 0;
		this.y1 = 0;
		this.x2 = 0;
		this.y2 = 0;
	}
	
	reCalc() { 
		//This will restyle the div
		var x3 = Math.min(this.x1,this.x2); 
		var x4 = Math.max(this.x1,this.x2); 
		var y3 = Math.min(this.y1,this.y2);
		var y4 = Math.max(this.y1,this.y2);
		MARQUEE.style.left = x3 + 'px';
		MARQUEE.style.top = y3 + 'px';
		MARQUEE.style.width = x4 - x3 + 'px';
		MARQUEE.style.height = y4 - y3 + 'px';
	}
	

	rectangleSelect(selector, x1, y1, x2, y2) {
		const self = this;
		var elements = [];
		if (x1 > x2) [x1, x2] = [x2, x1];
		if (y1 > y2) [y1, y2] = [y2, y1];

		let parent = null;

		jQuery(selector).each(function(index) {
			var $this = jQuery(this);
			var offset = $this.offset();
			var x = offset.left;
			var y = offset.top;
			var w = $this.width();
			var h = $this.height();
	
			// select only if not locked
			if (!($this.get(0).hasAttribute('data-lock'))
				&& x >= x1 
				&& y >= y1 
				&& x + w <= x2 
				&& y + h <= y2) {
				// this element fits inside the selection rectangle
				const id = $this.get(0).id;				
				if (!parent || (parent && $this.parent().get(0) === parent)) {
					const _element = self.context.elements_manager.getElement(id);
					elements.push(_element);
				}
				if (!parent) {
					parent = $this.parent().get(0);
				}
			}
		});
		return [elements, parent];
	}	

};	