import { ELEMENTS_TYPE } from './constants.js';


/**
 * Manages all dropdown elements options.
 */
export class DropBoxElementsManager{    
    /**
     * Constructor.
     * @param {Context} context Context.
     */
    constructor(context) {
        this.dropBoxElements = {};   // container of all elements.

        // a table was removed, so if any element is associated with that table clear it. 
        context.signals.onTableRemoved.add((table_name) => {
            for (let id in this.dropBoxElements) {
                const element = this.dropBoxElements[id];
                if (element.source === 'table' && element.table === table_name) {                    
                    this.clearElement(id);
                    console.warn("TABLE REMOVED AND ELEMENT CLEARED");
                }
            }
        }); 
        context.signals.onElementRemoved.add((element_id, type) => {
            if (type === ELEMENTS_TYPE.DROPDOWN) {
                this.removeElement(element_id);
            }
        }, this, 20);
        context.signals.onElementCreated.add((element, page) => {
            if (element.type === ELEMENTS_TYPE.DROPDOWN && !context.isLoading) {
                this.addElement(element.dom.id);
            }
        }, this, 20);        

    }

    /**
     * Add a dropdown Element to the collection.
     * @param {string} element_id Element ID.
     * @param {string} source Items datasource type: manual | table | database.
     * @param {array of strings} options Array of options text.
     * @param {string} selected Indication of which option is selected.
     * @param {string} table Table name.
     * @param {string} column Indication of which column of the table is selected.
     * @param {string} database Indication of which database field.
     * @param {boolean} unique Are the values unique?
     */
    addElement(element_id, source='manual', options=null, selected=null, table=null, column=null, database=null, unique=false) {
        this.dropBoxElements[element_id] = {
                source: source, 
                options: options, 
                selected: selected,
                table: table,
                column: column,
                database: database,
                unique: unique,
        }
    }

    /**
     * Clone the items/data source of.
     * It just replaces the data source of element_id by a deep copy of element_id_2_clone data source.
     * @param {string} element_id Element ID.
     * @param {string} element_id_2_clone Element ID.
     */
    cloneData(element_id, element_id_2_clone) {
        this.dropBoxElements[element_id] = { ...this.dropBoxElements[element_id_2_clone]};
    }

    /**
     * 
     * @param {string} element_id Element ID.
     * @param {string} source Data source: manual | table | database.
     * @param {array} options Array of options.
     * @param {string} selected Selected element.
     * @param {string} table Table name.
     * @param {string} column Table column name.
     * @param {string} database Database name.
     * @param {boolean} unique Are the values unique?
     */
    updateElement(element_id, source='manual', options=null, selected=null, table=null, column=null, database=null, unique=false) {
        const ele = this.dropBoxElements[element_id];
        ele.source = source;
        ele.options = options;
        ele.selected = selected;
        ele.table = table;
        ele.column = column;
        ele.database = database;
        ele.unique = unique;
    }

    /**
     * Removes an element from the collection.
     * @param {string} element_id Element ID.
     */
    removeElement(element_id) {
        delete this.dropBoxElements[element_id];
    }

    /**
     * Clears a dropdown element, or for the lack of a better word: sets it to a default state.
     * It happens when for example, the table it's associated with it, it's removed.
     * @param {string} element_id Element ID.
     */
    clearElement(element_id) {        
        if (element_id in this.dropBoxElements)
            this.dropBoxElements[element_id] = {
                source: 'manual', 
                options: null, 
                selected: null,
                table: null,
                column: null,
                database: null,
                unique: false,
            };
        //console.log("clear element > ", element_id, this.dropBoxElements[element_id]);
    }

    /**
     * Get the options and the selected option, for a given Element.
     * @param {string} element_id Element ID.
     * @returns An object with n fields.
     * If the element doesn't exists, returns null.
     */
    getElement(element_id) {
        if (element_id in this.dropBoxElements)
            return this.dropBoxElements[element_id];
        else
            return null;
    }

    /**
     * Get all elements.
     * @returns The collection of Dropdown elements and their respective options.     
     */
    getElements() {
        return this.dropBoxElements;
    }

    /**
     * Adds a new collection of elements.
     * == Used when loading forms ==
     * @param {object} new_elements 
     */
    setElements(new_elements) {
        this.dropBoxElements = new_elements;
    }


    /**
     * Get all data required to restore the manager.
     * @returns The data of all dropdown elements.
     */
     save() {
        return this.getElements();
    }

    /**
     * Restores the data of all dropdowns.
     * @param {object} data Dropdown data.
     */
    restore(data = {}) {
        this.setElements(data);
    }   
}