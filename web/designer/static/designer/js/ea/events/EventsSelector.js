

import { Select } from '/static/js/ui/BuildingBlocks.js';
import { EVENTS, EA_SELECTOR_X } from '../constants.js';

/**
 * Events selector.
 */
export class EventsSelector extends Select {

    /**
     * Construtor.
     * @param {Context} context Context.
     * @param {function} selection_callback Called when changing select.
     */
    constructor(context, selection_callback=null) {
        super({classes:['form-control']});

        const self = this;
        this.addClass(EA_SELECTOR_X);
        this.setOptions(EVENTS);
        this.setValue('onChanged');     
        
        this.dom.addEventListener('change', function(e) {
            if (selection_callback) selection_callback(e.target.value);  
            context.signals.onEAStatusChanged.dispatch(self);
            context.signals.onChange.dispatch();
        });        

    }
}
