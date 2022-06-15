import { GRID_CLASS } from './constants.js';

const GRID_MOUSE_CONFIG = document.getElementById('grid-mouse-config');
const GRID_CURSOR_CONFIG = document.getElementById('grid-cursor-config');
const GRID_VISIBILITY_CONFIG = document.getElementById('grid-visibility-config');
const GRID_SELECTOR = '.' + GRID_CLASS;

/**
 * Manages the grid settings.
 */
export class Grid {
    /**
     * Constructor.
     * @param {Context} context Context object.
     */
    constructor(context) {
        this.isShow = false;
        const self = this;

        // GRID - mouse and cursor movements
        GRID_MOUSE_CONFIG.addEventListener("change",(e) => {
            context.grid = parseInt(GRID_MOUSE_CONFIG.value);
            context.signals.onMouseGridChanged.dispatch(GRID_MOUSE_CONFIG.value);
            console.log(GRID_MOUSE_CONFIG.value);
        });
        GRID_CURSOR_CONFIG.addEventListener("change",(e) => {
            context.grid_cursor = parseInt(GRID_CURSOR_CONFIG.value);
            context.signals.onCursorGridChanged.dispatch(GRID_CURSOR_CONFIG.value);
        });

        // show/hide grid on all pages
        GRID_VISIBILITY_CONFIG.addEventListener("change",(e) => {
            if (self.isShow) {
                $(GRID_SELECTOR).hide();
                self.isShow = false;
            } else {
                $(GRID_SELECTOR).show();
                self.isShow = true;
            }
        });
        
        // a new page was added => show grid in new page if isShow is true.
        context.signals.onPageAdded.add((page_number, page) => {
            if (this.isShow) $(page.dom).find(GRID_SELECTOR + ':first-child').show();
        });
    }
}
