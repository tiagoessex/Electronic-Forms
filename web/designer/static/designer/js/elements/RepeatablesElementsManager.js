
/**
 * Manages all repeated elements.
 * 
 * Once an element is defined as "repeatable", then it will create a clone in every existing and future pages.
 * These type of elements are targeted for headers and footers.
 * 
 * Chain = array of elements id => a property changes in one ... it replicates the 
 *  changes to all the elements in the chain.
 *  Ex: 
 *      chain = [box_1, box_2, box_3]
 *  
 *      if box_1 changes position then box_2 and box_3 also changes.
 * 
 * For a complete set of replicated properties, check PropertyTabActions.js
 * 
 * ATTENTION: ONLY STATIC AND AUTOFIELDS CAN BE REPEATABLES.
 * 
 */
export class RepeatablesElementsManager{    
    /**
     * Constructor.
     * @param {Context} context Context.
     */
    constructor(context) {
        this.rep_elements = [];   // container of the chains.
        this.context = context;

        context.repeatables_manager = this;

        context.signals.onElementRemoved.add((element_id, type, group_id, isRepeatable) => {            
            if (isRepeatable) {
                this.removeElement(element_id);
            }
        });

    }
   

    /**
     * Creates a new chain.
     * 
     * NOTES:
     *      - Check addElement
     * 
     * @param {string} element_id Element ID.
     * @returns Newly created chain.
     */
     createChain(element_id) {
        const chain = [element_id];
        this.rep_elements.push(chain);
        return chain;
    } 

    /**
     * Adds a new element to a chain.
     * 
     * NOTES:
     *      - It does not dispatch an onRepeatableCreated, because for the moment,
     *          only EAManager is the listener, and each call => rebuilds the elements list
     *          So, the FormView will dispatch the signal, once all "add" are completed.
     * 
     * @param {string} element_id Element ID.
     * @param {array} chain Array of element ID.
     */
    addElement(element_id, chain) {
        chain.push(element_id);
    }


    /**
     * Removes an element from its chain.
     * If there's only 1 element in the chain, then remove the chain althogether.
     * 
     * @param {string} element_id Element ID.
     * @param {boolean} remove_chain If true, remove all the chain this element is inserted in.
     */
    removeElement(element_id, remove_chain = false) {
        for (let i=0; i<this.rep_elements.length; i++) {
            const chain = this.rep_elements[i];
            if (chain.includes(element_id)) {
                if (remove_chain || chain.length == 1) {
                    this.rep_elements.splice(this.rep_elements.indexOf(chain),1);
                    break;
                }
                chain.splice(chain.indexOf(element_id),1);
                break;
            }
        }

        this.context.signals.onRepeatableRemoved.dispatch(element_id);
    }
    
    /**
     * Given an element ID, return the chain (array of elements ID) this element belongs to.
     * @param {string} element_id Element ID.
     * @returns Array of elements ID.
     */
    getChain(element_id) {
        for (let i=0; i<this.rep_elements.length; i++) {
            const chain = this.rep_elements[i];
            if (chain.includes(element_id)) {
               return chain;
            }
        }
        return null;
    }

    

    /**
     * Gets all chains.
     * @returns The collection of repeated elements.     
     */
    getChains() {
        return this.rep_elements;
    }

    /**
     * Sets the chains.
     * == Used when loading forms ==
     * @param {object} new_elements 
     */
    setChains(new_elements) {
        this.rep_elements = new_elements;
    }

    /**
     * Gets all repeatable elements.
     * @returns Array of all repeatable elements.
     */
    getList() {
        const list = [].concat.apply([], this.rep_elements);
        return list;
    }

    /**
     * Gets all data required to restore the manager.
     * @returns Chained elements.
     */
    save() {
        return this.getChains();
    }

    /**
     * Restores the chains.
     * @param {array} data Array of chains.
     */
    restore(data = []) {
        this.setChains(data);
    }    
}