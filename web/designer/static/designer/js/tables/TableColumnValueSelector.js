

import { Select } from '/static/js/ui/BuildingBlocks.js';
import { URL_GET_TABLE_COLUMN } from '/static/js/urls.js';
import { fetchGET } from '/static/js/Fetch.js';
import { MAX_SELECT_VALUES } from '../constants/limits.js';
import { Translator } from '/static/js/Translator.js';


/**
 * Column value selector.
 */
export class TableColumnValueSelector extends Select {

    /**
     * Constructor.
     * @param {Context} context Context
     */
    constructor(context) {
        super({classes:['form-control']});
        this.context = context;
    }

    /**
     * Clears the dom.
     */
    clear() {
        $(this.dom).empty();
    }

    /**
     * 
     * @param {number} asset_id Number of the table asset.
     * @param {string} column_name Column name.
     * @param {function} onReady Function to be called when fetch is completed & positive answer.
     * @param {function} onNo Function to be called when fetch is completed & negative answer.
     * @returns 
     */
    getColumnValues(table_name = null, column_name = null, onReady = null, onNo = null) {
        if (!table_name || table_name ==='') return;
        const URL = URL_GET_TABLE_COLUMN  + this.context.properties.id + '/' + table_name + '/' + column_name;
        fetchGET(URL, 
            (result) => {
                this.clear();
                const unique = new Set(result)
                if (unique.length > MAX_SELECT_VALUES) {
                    const msg = Translator.translate("There are more than") 
                    + " " + MAX_SELECT_VALUES  
                    + " " 
                    + Translator.translate("items") 
                    + " (" 
                    + unique.length 
                    + "). "
                    + Translator.translate("An high number may cause some issues. Show values anyway?");
                    this.context.signals.onAYS.dispatch(
                        msg,
                        () => { 
                            unique.forEach((value) => {                    
                            const option = document.createElement('option');
                            option.textContent = value;
                            option.setAttribute('value',value);
                            this.dom.appendChild(option);
                        })
                        this.context.signals.onEAStatusChanged.dispatch(this);
                        if (onReady) onReady();
                    }, () => {
                        if (onNo) onNo();
                    });
                } else {
                    result.forEach((value) => {                    
                        const option = document.createElement('option');
                        option.textContent = value;
                        option.setAttribute('value',value);
                        this.dom.appendChild(option);
                    })
                    this.context.signals.onEAStatusChanged.dispatch(this);
                    if (onReady) onReady();
                }
            },
            (error) => {
                this.context.signals.onError.dispatch(error,"[TableColumnValueSelector::getColumnValues]");
            }
        );       
    }

}
