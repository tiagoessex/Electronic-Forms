import { TAB_AREA_ID } from '../constants/constants.js';

const FORM_TAB = document.getElementById(TAB_AREA_ID);
const SCROLL_DELTA = 2;

/**
 * Signals to all interested when scrolling.
 */
export class PagesScroller {
    /**
     * Constructor.
     * @param {Context} context Context.
     */
    constructor(context) {        
        
        // scrolling pages
        // findCurrentPage requires too many calcs, so to avoid 
        // a performance hit, only call it after SCROLL_DELTA scrolls
        let counter = 0;
        FORM_TAB.addEventListener("scroll", () => {
            // save scroll positions for focus reasons (check baseelement.js)
            context.scroll_top = FORM_TAB.scrollTop;
            context.scroll_left = FORM_TAB.scrollLeft;
            counter += 1;
            if (counter > SCROLL_DELTA) {
                context.signals.onPagesScrolled.dispatch(true);
                counter = 0;
            }
        });
    }

}