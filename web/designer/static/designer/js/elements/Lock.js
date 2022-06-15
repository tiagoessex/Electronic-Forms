import { PROPERTIES_ID } from '../constants/constants.js';


/**
 * Manages the lock/unlock of elements.
 */
 export class Lock{
     /**
      * Constructor
      * @param {Context} context Context.
      */
    constructor(context) {
        this.context = context;
    }

    /**
     * Locks elements.
     * @param {array} elements Array of Elements to lock.
     */
    lock(elements) {
        elements.forEach(element => {
            this.context.signals.onLockElement.dispatch(element.dom.id);
        });
    }

    /**
     * Locks all elements of a specific page.
     * @param {number} page_number Page number.
     */
    lockPage(page_number) {
        const elements = this.context.elements_manager.getElements();
        for (const id in elements) {
            const page = elements[id].props[PROPERTIES_ID.PAGENUMBERPROPERTY];
            //if ("page-" + page === page_id) {
            if (Number(page) === Number(page_number)) {
                this.context.signals.onLockElement.dispatch(id);
            }
        }
    }

    /**
     * Locks all elements.
     */
    lockAll() {
        const elements = this.context.elements_manager.getElements();
        for (const id in elements) {
            this.context.signals.onLockElement.dispatch(id);
        }
    }    

    /**
     * Unlock a series of elements.
     * @param {array of Element} elements Elements to unlock
     */
    unlock(elements) {
        elements.forEach(element => {
            this.context.signals.onUnlockElement.dispatch(element.dom.id);
        });
    }

    /**
     * Unlocks all elements of a specific page. 
     * @param {number} page_number Page number.
     */
    unlockPage(page_number) {        
        const elements = this.context.elements_manager.getElements();
        for (const id in elements) {
            const page = elements[id].props[PROPERTIES_ID.PAGENUMBERPROPERTY];
            //if ("page-" + page === page_id)
            if (Number(page) === Number(page_number)) {
                this.context.signals.onUnlockElement.dispatch(id);
            }
        }
    }

    /**
     * Unlocks all elements.
     */
    unlockAll() {
        const elements = this.context.elements_manager.getElements();
        for (const id in elements) {
            this.context.signals.onUnlockElement.dispatch(id);
        }
    }
}