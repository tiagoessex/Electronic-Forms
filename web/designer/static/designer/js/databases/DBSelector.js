

import { Select } from '/static/js/ui/BuildingBlocks.js';
import { URL_LIST_DBS } from '/static/js/urls.js';
import { fetchGET } from '/static/js/Fetch.js';

/**
 * Database selector.
 */
export class DBSelector extends Select {
    /**
     * Constructor.
     * @param {Context} context Context
     * @param {function} onSelection Callback to be called when an option is selected.
     */
    constructor(context, onSelection=null) {
        super({classes:['form-control']});

        this.onSelection = onSelection;
        const self = this;
        this.context = context;

      
        this.dom.addEventListener('change', function(e) {
            if (self.onSelection) self.onSelection(e.target.value);
        });

    }

    clear() {
        $(this.dom).empty();
    }


    /**
     * Fetches and populates the list with all available databases 
     * (defined in settings.py by FIELDS_ORIGIN_DATABASES).
     * @param {function} onReady Callback to be called when fetch is completed.
     */
     getDatabases(onReady=null) {

        fetchGET(URL_LIST_DBS, 
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
                this.context.signals.onError.dispatch(error,"[DBSelector::getDatabases]");
            }
        );        
    }

}
