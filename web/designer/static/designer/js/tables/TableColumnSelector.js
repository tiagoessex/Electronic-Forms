

import { Select } from '/static/js/ui/BuildingBlocks.js';
import { URL_LIST_TABLE_COLUMNS } from '/static/js/urls.js';
import { fetchGET } from '/static/js/Fetch.js';
import { EA_SELECTOR_X } from '../ea/constants.js';


/**
 * Table column selector.
 */
export class TableColumnSelector extends Select {

    /**
     * Constructor.
     * @param {Context} context Context
     * @param {function} onSelection Function to be called when an option is selected.
     */
    constructor(context, onSelection=null) {
        super({classes:['form-control']});
        this.context = context;
        this.onSelection = onSelection;
        const self = this;

        this.addClass(EA_SELECTOR_X);

        this.dom.addEventListener('change', function(e) {
            if (self.onSelection) self.onSelection(e.target.value);
            self.checkStatus();
            context.signals.onEAStatusChanged.dispatch(self);
        });
        
        this.checkStatus();
    }

    clear() {
        $(this.dom).empty();
    }

    /**
     * Fetches and populates the list with the columns of a specific table.
     * @param {number} table_name Number of the table asset.
     * @param {function} onReady Function to be called when fetch is completed.
     * @returns 
     */
    getColumns(table_name = null, onReady = null) {
        if (!table_name || table_name ==='') return;
        const URL = URL_LIST_TABLE_COLUMNS + this.context.properties.id + '/' + table_name;
        fetchGET(URL, 
            (result) => {
                this.clear();
                result.forEach((value) => {
                    const option = document.createElement('option');
                    option.textContent = value;
                    option.setAttribute('value',value);
                    this.dom.appendChild(option);
                })
                if (onReady) onReady();
                this.checkStatus();
                this.context.signals.onEAStatusChanged.dispatch(this);
            },
            (error) => {
                this.context.signals.onError.dispatch(error,"[TableColumnSelector::getColumns]");
            }
        );
       
    }

}
