
const PAGES_COUNTER = document.getElementById('pages-counter');

/**
 * Responsable for updating the page counter (current page / total pages).
 */
export class PagesCounterDisplay {
    /**
     * Constructor.
     * @param {Context} context Context.
     * @param {function} findCurrentPage Find the current pages.
     * @param {function} getTotalPages Returns the total pages.
     */
    constructor(context, findCurrentPage = null, getTotalPages = null) {        
        this.findCurrentPage = findCurrentPage;
        this.getTotalPages = getTotalPages;

        context.signals.onPagesScrolled.add(this.update);
        context.signals.onPagesChanged.add(this.update);
    }

    /**
     * === LISTENER ===
     * Update the counter.
     */
    update = () => {
        PAGES_COUNTER.innerHTML = (this.findCurrentPage() + 1) + "/" + this.getTotalPages();
    }    
}