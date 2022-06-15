

import { Select } from '/static/js/ui/BuildingBlocks.js';
import { ASSETTYPE } from '/static/js/assettype.js';
import { URL_LIST_FORM_ASSETS, getFileFromUrl } from '/static/js/urls.js';
import { fetchGET } from '/static/js/Fetch.js';
import { EA_SELECTOR_X } from '../ea/constants.js';


/**
 * Table selector.
 */
export class TableSelector extends Select {
    /**
     * Constructor.
     * @param {Context} context Context
     * @param {function} onSelection Called when an option is selected.
     */
    constructor(context, onSelection=null) {
        super({classes:['form-control']});

        this.onSelection = onSelection;
        const self = this;
        this.context = context;

        this.addClass(EA_SELECTOR_X);
      
        this.dom.addEventListener('change', function(e) {
            if (self.onSelection) self.onSelection(e.target.value);
            self.checkStatus();
            context.signals.onEAStatusChanged.dispatch(self);
        });


        /**
         * A new table was added => 
         *      refresh selector but make sure to keep it's current selection.
         */
        this.signal_onTableAdded = context.signals.onTableAdded.add(() => {
            const selected = this.getValue();
            self.getTables(() => {
                this.setValue(selected);
                this.checkStatus();
            });
            this.context.signals.onEAStatusChanged.dispatch(this);
        });

        if (this.context.properties.id) {
            self.getTables(() => {
                this.checkStatus();
            });
        }

    }

    /**
     * Clears the selector.
     */
    clear() {
        this.signal_onTableAdded.detach();
    }

    /**
     * Removes all options from the dom.
     */
    clearDom() {
        $(this.dom).empty();
    }

    /**
     * Fetches and populates the list with all the tables associated with the current form.
     * @param {function} onReady Called when fetch is completed.
     */
    getTables(onReady=null) {
        const URL = URL_LIST_FORM_ASSETS + this.context.properties.id + '/' + ASSETTYPE.CSV;
        fetchGET(URL, 
            (result) => {
                this.clearDom();
                result.forEach((value) => {
                    const option = document.createElement('option');
                    const table = getFileFromUrl(value.asset);
                    option.textContent = table;
                    option.setAttribute('value',table);
                    this.dom.appendChild(option);
                })
                if (onReady) onReady();
                this.checkStatus();
            },
            (error) => {
                this.context.signals.onError.dispatch(error,"[TableSelector::getTables]");
            }
        );       
    }

}
