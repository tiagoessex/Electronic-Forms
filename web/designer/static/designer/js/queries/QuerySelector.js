

import { Select } from '/static/js/ui/BuildingBlocks.js';
import { URL_LIST_QUERIES } from '/static/js/urls.js';
import { fetchGET } from '/static/js/Fetch.js';

/**
 * Query selector.
 */
export class QuerySelector extends Select {
    /**
     * Constructor.
     * @param {Context} context Context
     * @param {function} onSelection Function to be called when an option is selected.
     */
    constructor(context, onSelection=null) {
        super({classes:['form-control']});

        this.onSelection = onSelection;
        const self = this;
        this.context = context;
     
        this.dom.addEventListener('change', function(e) {
            const query = e.target.options[e.target.selectedIndex].dataset.query;
            if (self.onSelection) self.onSelection(e.target.value, query);
            self.checkStatus();
        });

        this.checkStatus();
    }

    clear() {
        $(this.dom).empty();
    }

    getSelectedQuery() {
        return this.dom[this.dom.selectedIndex].dataset.query;
    }

    /**
     * Fetches and populates the list with all available queries.
     * @param {function} onReady Function to be called when fetch is completed.
     */
     getQueries(onReady=null) {
        fetchGET(URL_LIST_QUERIES, 
            (result) => {
                this.clear();
                result.forEach((value) => {
                    const option = document.createElement('option');
                    option.textContent = value.name;
                    option.setAttribute('value',value.id);
                    this.dom.appendChild(option);
                    // ---- TODO: WHAT IF TOO MANY AND TOO LARGE????  --- 
                    option.setAttribute('data-query',value.query);
                })
                if (onReady) onReady();
                this.checkStatus();
            },
            (error) => {
                this.context.signals.onError.dispatch(error,"[QuerySelector::getQueries]");
            }
        );       
    }

}
