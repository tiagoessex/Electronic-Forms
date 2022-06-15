

import { Select } from '/static/js/ui/BuildingBlocks.js';
import { URL_LIST_DB_TABLE_COLUMNS } from '/static/js/urls.js';
import { fetchGET } from '/static/js/Fetch.js';


/**
 * Database Table columns selector.
 */
export class DBTableColumnsSelector extends Select {

    /**
     * Constructor.
     * @param {Context} context Context
     * @param {function} onSelection Callback to be called when an option is selected.
     */
    constructor(context, onSelection=null) {
        super({classes:['form-control']});
        this.context = context;
        this.onSelection = onSelection;
        const self = this;

        this.dom.addEventListener('change', function(e) {
            if (self.onSelection) self.onSelection(e.target.value);
        });

    }

    clear() {
        $(this.dom).empty();
    }

    /**
     * Fetches and populates the list with all the tables of a specific database.
     * @param {string} database Database name (check FIELDS_ORIGIN_DATABASES in settings.py).
     * @param {string} table Table name.
     * @param {function} onReady Callback to be called when fetch is completed.
     * @returns 
     */
    getColumns(database = null, table = null, onReady = null) {
        if (!database || database === '') return;
        if (!table || table === '') return;
        const URL = URL_LIST_DB_TABLE_COLUMNS + database + '/' + table + '/';

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
            },
            (error) => {
                this.context.signals.onError.dispatch(error,"[DBTableColumnsSelector::getColumns]");
            }
        );
    }

}
