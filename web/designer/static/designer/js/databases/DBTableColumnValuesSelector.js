

import { Select } from '/static/js/ui/BuildingBlocks.js';
import { URL_GET_DB_TABLE_COLUMN, URL_GET_DB_TABLE_COLUMN_UNIQUE } from '/static/js/urls.js';
import { fetchGET } from '/static/js/Fetch.js';
import { MAX_SELECT_VALUES } from '../constants/limits.js';
import { Translator } from '/static/js/Translator.js';

/**
 * Database Table columns values selector.
 */
export class DBTableColumnValuesSelector extends Select {

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
     * @param {string} column Column name.
     * @param {boolean} unique Only show unique values?
     * @param {function} onReady Callback to be called when fetch is completed & positive answer.
     * @param {function} onNo Callback to be called when fetch is completed & negative answer.
     * @returns 
     */
     getColumnValues(database = null, table = null, column = null, unique=false, onReady = null, onNo = null) {
        if (!database || database === '') return;
        if (!table || table === '') return;
        const URL = (unique?URL_GET_DB_TABLE_COLUMN_UNIQUE:URL_GET_DB_TABLE_COLUMN) + database + '/' + table + '/' + column + '/';
        fetchGET(URL, 
            (result) => {
                this.clear();
                if (result.length > MAX_SELECT_VALUES) {
                    const msg = Translator.translate("There are more than") 
                    + " " + MAX_SELECT_VALUES  
                    + " " 
                    + Translator.translate("items") 
                    + " (" 
                    + result.length 
                    + "). "
                    + Translator.translate("An high number may cause some issues. Show values anyway?");                    
                    this.context.signals.onAYS.dispatch(
                        msg, 
                        () => {                            
                            result.forEach((value) => {
                                const option = document.createElement('option');
                                option.textContent = value;
                                option.setAttribute('value',value);
                                this.dom.appendChild(option);
                            })
                            if (onReady) onReady();
                        }, 
                        () => {
                            if (onNo) onNo();
                        }
                    );
                } else {
                    result.forEach((value) => {
                        const option = document.createElement('option');
                        option.textContent = value;
                        option.setAttribute('value',value);
                        this.dom.appendChild(option);
                    })
                    if (onReady) onReady();
                }
            },
            (error) => {
                this.context.signals.onError.dispatch(error,"[DBTableColumnValuesSelector::getColumnValues]");
            }
        );      
    }

}
