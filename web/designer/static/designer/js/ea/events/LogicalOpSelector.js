

import { Select } from '/static/js/ui/BuildingBlocks.js';
import { LOGICAL_OPERATORS, EA_SELECTOR_X } from '../constants.js';


/**
 * Logical operator select.
 */
export class LogicalOpSelector extends Select {

    /**
     * Constructor.
     * @param {Context} context Context.
     * @param {function} selection_callback Called when a selection is made.
     */
    constructor(context, selection_callback) {
        super({classes:['form-control']});

        this.selection_callback = selection_callback;
        const self = this;
        this.addClass(EA_SELECTOR_X);

        this.setOptions(LOGICAL_OPERATORS);
        this.setValue('and');
      
        this.dom.addEventListener('change', function(e) {
            if (self.selection_callback) self.selection_callback(e.target.value);
            context.signals.onEAStatusChanged.dispatch(self);
            context.signals.onChange.dispatch();
        });

    }
}
