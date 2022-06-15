

import { Select } from '/static/js/ui/BuildingBlocks.js';
import { EA_SELECTOR_X } from '../constants.js';

/**
 * Action selector.
 */
export class ActionSelector extends Select {

    /**
     * Constructor.
     * @param {function} selection_callback Called when a selection is made.
     * @param {EA_TYPE} type Type of action (see ea/constants.js).
     */
    constructor(context, selection_callback=null, type) {
        super({classes:['form-control']});

        this.selection_callback = selection_callback;
        const self = this;

        this.addClass(EA_SELECTOR_X);

        this.setOptions(type.actions);
      
        this.dom.addEventListener('change', function(e) {
            if (self.selection_callback) self.selection_callback(e.target.value);
            context.signals.onEAStatusChanged.dispatch(self);
            context.signals.onChange.dispatch();            
        });

    }
}
