

import { Select } from '/static/js/ui/BuildingBlocks.js';
import { Translator } from '/static/js/Translator.js';

/**
 * Source of the data selector: manual | table | database
 */
export class DataSourceSelector extends Select {
    /**
     * Constructor.
     * @param {function} selection_callback Called when a selection is made.
     */
    constructor(selection_callback=null) {
        super({classes:['form-control']});

        this.selection_callback = selection_callback;
        const self = this;

        this.setStyle('width','150px');
        this.setOptions({"manual":Translator.translate("Manual"),"table":Translator.translate("Table"),"database":Translator.translate("Database")});
      
        $(this.dom).on('change', function(e) {
            if (self.selection_callback) self.selection_callback(e.target.value);
        });

    }

    /**
     * Get the currently selected option.
     * @returns The selected option.
     */
    getSelected() {
        return this.getValue();
    }

    /**
     * Selected a specific option.
     * @param {string} value Value of the option.
     */
    setSelected(value) {
        this.setValue(value);
    }    
}
