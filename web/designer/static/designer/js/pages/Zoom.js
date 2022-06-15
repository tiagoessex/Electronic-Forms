
import { PAGES_AREA_ID, TAB_AREA_ID } from '../constants/constants.js';

const PAGES_AREA = document.getElementById(PAGES_AREA_ID);
const TAB_AREA = document.getElementById(TAB_AREA_ID);

const MAX_ZOOM = 3.5;
const MIN_ZOOM = 0.7;
const DELTA = 0.1;

/**
 * Zoom.
 * @param {Context} context Context.
 */
export function Zoom(context) {
    this.context = context;

}

Zoom.prototype = {
    /**
     * 
     */
    zoomIn() {
        if (this.context.zoom > MIN_ZOOM) {
            this.context.zoom -= DELTA;
        }
        PAGES_AREA.style['transform'] = `scale(${this.context.zoom})`;      

        const horizontal = ($(TAB_AREA).width() * this.context.zoom - $(PAGES_AREA).width()) / 2;
        setTimeout(() => {
            $(TAB_AREA).animate({scrollLeft: horizontal}, 0);
        }, 100);        

    },

    /**
     * 
     */
    zoomOut() {
        if (this.context.zoom < MAX_ZOOM) {
            this.context.zoom += DELTA;
        }
        PAGES_AREA.style['transform'] = `scale(${this.context.zoom})`;

        const horizontal = ($(TAB_AREA).width() * this.context.zoom - $(PAGES_AREA).width()) / 2;
        //$(TAB_AREA).animate({/*scrollTop: vertical, */scrollLeft: horizontal}, 0);
        setTimeout(() => {
            $(TAB_AREA).animate({scrollLeft: horizontal}, 0);
        }, 100);           
        
    },
}