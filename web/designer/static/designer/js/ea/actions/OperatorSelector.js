
import { Select } from '/static/js/ui/BuildingBlocks.js';
import { OPERATORS, EA_SELECTOR_X } from '../constants.js';

/**
 * Comparation operators
 */
export class OperatorSelector extends Select {

    /**
     * Constructor.
     * @param {function} selection_callback Called when a selection is made.
     */
    constructor(context, selection_callback=null) {
        super({classes:['form-control']});

        this.selection_callback = selection_callback;
        const self = this;
        this.addClass(EA_SELECTOR_X);

        this.setOptions(OPERATORS);
        this.setValue(OPERATORS.EQUAL);
      
        this.dom.addEventListener('change', function(e) {
            if (self.selection_callback) self.selection_callback(e.target.value);
            context.signals.onEAStatusChanged.dispatch(self);
            context.signals.onChange.dispatch();
        });

    }
  
}
