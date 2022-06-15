import { isElementPartiallyInViewport } from '/static/js/jshtml.js';
import { Page } from './Page.js';
import { PAGE_CLASS } from './constants.js';
import { GridPage } from '../grid/GridPage.js';
import { PAGES_AREA_ID } from '../constants/constants.js';
import { URL_FORMS_ASSETS } from '/static/js/urls.js';
import { getFileFromUrl } from '/static/js/urls.js';

const PAGES_AREA = document.getElementById(PAGES_AREA_ID);
const TAB_AREA = document.getElementById('form-tab');



/**
 * Pages factory and management.
 * 
 * ATTENTION:
 *      - THE PAGE NUMBER USED OR RETURNED BY SOME FUNCTIONS MAY DIFFER FROM EACH OTHER, I.E.,
 *          USER VIEW => FIRST PAGE IS 1, INTERNAL VIEW => FIRST PAGE IS 0.
 */
export class PagesManager {

    /**
     * Constructor.
     * @param {Context} context Context
     */
    constructor(context) {
        this.pages = null;    // HTMLCollection - to store a live collection of pages
        this.current_page = 0;
        this.page_counter=0;
        this.context = context;
        
        this.context.signals.onStuffDone.dispatch('PagesManager ready!');
    }

    /**
     * Inits the manager.
     * All current pages are made droppable.
     */
    init() {
        this.current_page = 0;
        this.pages = null;
        // get all current pages
        this.pages = PAGES_AREA.getElementsByClassName(PAGE_CLASS);
        for (var i=0; i<this.pages.length; i++) {
            this.makeDroppable(this.pages[i]);
        }
        this.page_counter = this.pages.length;
    }

    /**
     * Returns a live HTMLCollection representing all pages.
     * @returns Returns the pages collection
     */
    getPages() {
        return this.pages;
    }

    /**
     * Returns the current page number (user view => starts from 1 NOT 0).
     * @returns The current page (from 1).
     */
    getCurrentPageNumber = () => {
        return this.pages.length>0?this.current_page+1:0;
    }

    /**
     * Returns the current page ID.
     * @returns The current page ID.
     */
     getCurrentPageID = () => {
        return this.pages[this.current_page].id;
    }

    /**
     * Returns the total number of pages. No need to query the dom.
     *  @returns The total number of pages.
     */
    getTotalPages = () => {
        return this.pages.length;
    }

    /**
     * Add a page either at the end of in the current position, i.e., it becomes the next page.
     * @param {bool} atTheEnd If true, then add page at the end else between current and next page
     * @param {number} page_number == Used when loading forms ==
     * @returns The added page.
     */
    addPage = (atTheEnd=true, page_number = null) => { 
        let n = null;
        if (page_number) {
            if (page_number > n) {
                n = Number(page_number);
                this.page_counter = Number(n) + 1;
            }
        } else {
            this.page_counter += 1;
            n = Number(this.page_counter);
        }
        const new_page = new Page(n);//this.page_counter

        if (atTheEnd || this.getCurrentPageNumber() == this.getTotalPages() ) {
            new_page.attachTo(PAGES_AREA);
            this.gotoPage(this.pages.length-1);
        } else {
            const thisPage = this.pages[this.current_page+1];
            if (thisPage) {
                PAGES_AREA.insertBefore(new_page.dom, thisPage)
                this.gotoPage(this.current_page+1);
            }            
        }
        this.makeDroppable(new_page.dom);
        // attach a grid to the page
        new GridPage(new_page);
        if (!this.context.isLoading) {
            this.context.signals.onPageAdded.dispatch(this.current_page, new_page);
        }
        this.context.properties.n_pages++;

        return new_page;
    }

    /**
     * Scrolls to page n.
     * @param {number} n Number of the page (internal).
     */
    gotoPage(n) {
        const destination_page = this.pages[n];
        
        const topPos = destination_page.offsetTop * this.context.zoom - 100;// - 50;
        TAB_AREA.scrollTop = topPos;
        this.findCurrentPage();

       // destination_page.scrollIntoView();
        this.context.signals.onPagesChanged.dispatch();
    }

    /**
     * Removes page n and all elements in it will be deleted (check BaseElement.js)
     * @param {number} n Number of the page to be removed.
     * @returns True if successeful, false otherwise.
     */
    removePage = (n) => {
        if (n<0 || n >= this.getTotalPages()) {
            console.warn("[PagesManager->PagesManager::removePage] - Invalid page!");
            return false;
        }
        const page = this.pages[n];

        // remove actual page        
        PAGES_AREA.removeChild(page);
        this.findCurrentPage();

        if (this.current_page == undefined || this.current_page == NaN)
            this.current_page = 0;        
        
        this.context.signals.onPageRemoved.dispatch(page, n);
        this.context.signals.onPagesChanged.dispatch();
        this.context.properties.n_pages--;
        return true;
    }

    /**
     * Remove current page and deletes all elements in it.
     * @returns True if successeful, false otherwise.
     */
    removeCurrentPage() {
        return this.removePage(this.current_page);
    }

    /**
     * Removes all pages.
     */
    removeAllPages() {
        let counter = 0;
        while (PAGES_AREA.firstChild) {
            for (let i=0; i<this.pages.length; i++) {
                this.removePage(i);
            }
            counter++;
            if (counter > 10) break;
        }
    }

    /**
     * Goes to the previous page, if any.
     */
    gotoPreviousPage() {
        if (this.current_page > 0) {
            this.gotoPage(this.current_page-1)
        }
    }

    /**
     * Goes to the next page, if any.
     */
    gotoNextPage() {
        if (this.current_page < this.pages.length-1) {
            this.gotoPage(this.current_page+1);
        }
    }

    /**
     * Finds and returns the number of the current page (internal => starts from 0).
     * @returns The current page number (from 0).
     */
    findCurrentPage = () => {
        let visible_pages = [];
        let page = 0;   // first page
        for (var i=0; i<this.pages.length; i++) {        
            if (isElementPartiallyInViewport(this.pages[i], 200)) {
                visible_pages.push(i);
                page = i;
            }
        } 

        if (visible_pages.length == 0) return this.current_page;
        // only 1 page visible, then this is the one
        if (visible_pages.length == 1) {
            this.current_page = page;
        } else {
            // more than 1 page visible, then   
            page = visible_pages[0];
            const y_transition = PAGES_AREA.clientHeight * 0.5;
            for (var i=1; i<visible_pages.length; i++) {
                var rect1 = this.pages[page].getBoundingClientRect();
                var rect2 = this.pages[page].getBoundingClientRect();
            
                if (rect1.bottom<y_transition) 
                    page = visible_pages[i];
                else
                    if (rect1.bottom > rect2.bottom)
                        page = visible_pages[i];
            } 
            this.current_page=page;
        } 
        return this.current_page;
    }

    /**
     * Swaps 2 pages.
     * Example: swapPages(0,1)
     * @param {number} page1 Page number (internal)
     * @param {number} page2 Page number (internal)
     */
    swapPages = (page1, page2) => {
        const n_pages = this.getTotalPages();
        console.log(page1, page2, n_pages);
        if (page1 >= 0 && page1 < n_pages) {
            if (page2 >= 0 && page2 < n_pages) {
                if (page1 != page2) {
                    const p1 = this.pages[page1];
                    const p2 = this.pages[page2];
                    // taken from https://stackoverflow.com/questions/10716986/swap-two-html-elements-and-preserve-event-listeners-on-them/10717422#10717422
                    var temp = document.createElement("div");
                    p1.parentNode.insertBefore(temp, p1);                
                    p2.parentNode.insertBefore(p1, p2);                
                    temp.parentNode.insertBefore(p2, temp);                
                    temp.parentNode.removeChild(temp);
                    this.context.signals.onPagesSwapped.dispatch(page1, page2);
                } else {
                    console.warn("[PagesManager->PagesManager::swapPages] Same page!");
                }
            } else {
                console.warn("[PagesManager->PagesManager::swapPages] Invalid page number!");
            }
        } else {
            console.warn("[PagesManager->PagesManager::swapPages] Invalid page number!");
        }
    }

    /**
     * Get page n.
     * @param {number} n Number of the page (internal).
     * @returns Page or null if n is less than zero or greater than or equal to the length property. 
     */
    getPage(n) {
        return this.pages[n];
    }

    /**
     * Get current page (dom).
     * @returns Current page (dom).
     */
    getCurrentPage() {
        return this.pages[this.current_page];
    }


    /**
     * Get the page number of Page.
     * @param {page} page Page.
     * @returns Page number. -1 if none.
     */
    getPageNumber(page) {        
        for (let i=0; i<this.pages.length; i++) {
            if (page.dom === this.pages[i])
                return i;
        }
        return -1;
    }

    /**
     * Returns the page number of a certain page (internal).
     * @param {string} id ID of the page to find.
     * @returns Page number.
     */
    getPageNumberFromID(id) {
        for (let i=0; i<this.pages.length;i++) {
            if (this.pages[i].id === id)
                return i;
        }
        return -1;
    }

    /**
     * Sets a background image in the page page
     * @param {image} image Background image
     * @param {number} page Page number
     */
    setRasterImage = (image, page) => {
        // no image => remove the style completly
        if (image === '') {
            this.pages[this.current_page].style.backgroundImage = null;
            return;
        }
        if (this.pages.length > 0) {
            if (!page)
                this.pages[this.current_page].style.backgroundImage = "url(" + image + ")";
            else if  (page >=0 && page < this.pages.length) {
                this.pages[page].style.backgroundImage = "url(" + image + ")";
            }
        }
    }

    /**
     * Makes a page droppable => can drop elements in it.
     * @param {HTMLElement} page Page
     */
    makeDroppable(page) {
        const self = this;

        /**
         * THIS CODE IS REQUIRED TO SOLVE THE ZOOM ISSUE.
         * ORIGIN: https://stackoverflow.com/questions/27266009/jquery-droppable-area-wrong-if-zoomed
         * @param {*} t 
         * @param {*} event 
         */
        $.ui.ddmanager.prepareOffsets = function( t, event ) {
            var i, j,
                m = $.ui.ddmanager.droppables[ t.options.scope ] || [],
                type = event ? event.type : null, // workaround for #2317
                list = ( t.currentItem || t.element ).find( ":data(ui-droppable)" ).addBack();

            droppablesLoop: for ( i = 0; i < m.length; i++ ) {

                // No disabled and non-accepted
                if ( m[ i ].options.disabled || ( t && !m[ i ].accept.call( m[ i ].element[ 0 ], ( t.currentItem || t.element ) ) ) ) {
                    continue;
                }

                // Filter out elements in the current dragged item
                for ( j = 0; j < list.length; j++ ) {
                    if ( list[ j ] === m[ i ].element[ 0 ] ) {
                        m[ i ].proportions().height = 0;
                        continue droppablesLoop;
                    }
                }

                m[ i ].visible = m[ i ].element.css( "display" ) !== "none";
                if ( !m[ i ].visible ) {
                    continue;
                }

                // Activate the droppable if used directly from draggables
                if ( type === "mousedown" ) {
                    m[ i ]._activate.call( m[ i ], event );
                }

                m[ i ].offset = m[ i ].element.offset();
                m[ i ].proportions({ width: m[ i ].element[ 0 ].offsetWidth * self.context.zoom, height: m[ i ].element[ 0 ].offsetHeight * self.context.zoom });
            }

        };

        $(page).droppable( {
           accept: ".UIFormElementsItem",
           tolerance: "fit", 
       } );
    }


    /**
     * Prepares the data to be saved.
     * @returns An object containing all the necessary data to restore the pages.
     */
    save() {
        const pages = this.getPages();
        const data_raster = [];
        for (let i=0; i<pages.length; i++) {
            // only save the filename, not the complete url
            const image = pages[i].style.backgroundImage;
            /*
            if (image !== '') {
                //const file = image.substring(image.lastIndexOf('/') + 1, image.lastIndexOf("\")"))
                const file = getFileFromUrl(image, true);
                data_raster.push(file);
            }
            */
            data_raster.push(image !== '' ? getFileFromUrl(image, true) : null);
        }

        const data_pages = [];
        for (let i=0; i<pages.length; i++) {
            data_pages.push(pages[i].id);
        }
        
        return [data_raster, data_pages];
    }

    /**
     * Restores the pages.
     * @param {object} data Data to be restored.
     */
    restore(data) {
        // restore pages
        for (let i = 0; i<data.pages.length; i++) {
            const page_number = data.pages[i].split('-')[1];
            const new_page = this.addPage(true, page_number);
            if (data.rasters[i] && data.rasters[i] !== '' && typeof data.rasters[i] !== 'undefined') {
                const image = URL_FORMS_ASSETS + this.context.properties.id + '/' + data.rasters[i];
                /*
                new_page.setStyle("background-image", "url('" + image + "')");
                */
               // no image, then clear style, otherwise, it would still save as if it existed.
                $('<img/>').attr('src', image).on('load', function() {
                    $(this).remove(); // prevent memory leaks
                    $(new_page.dom).css('background-image', "url('" + image + "')");
                 }).on('error', function() { 
                    $(new_page.dom).css('background-image', "");
                 });
            }

            new_page.attachTo(PAGES_AREA);
        }
    }

}
