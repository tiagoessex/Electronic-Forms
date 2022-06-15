
import { EA_TEMPORAL_CLASS, PRE_ACTION_CARD_ID, PRE_EVENT_CARD_ID } from './constants.js';
import { EA } from './EA.js';
import { TemporalActionCard } from './actions/TemporalActionCard.js';
import { EventsCard } from './events/EventsCard.js';

/**
 * Temporal E/A.
 */
export class EATemporal extends EA {

    constructor(context, id, name, data_restore) {
        super(context, id, name);
        
        this.addClass(EA_TEMPORAL_CLASS);        
        this.header.removeClass('bg-warning');
        this.color_class = 'ea-temporal'; 

        this.events = new EventsCard(context, PRE_EVENT_CARD_ID + id, data_restore).attachTo(this.body);
        this.actions = new TemporalActionCard(context, PRE_ACTION_CARD_ID + id, data_restore).attachTo(this.body);
                
        this.checkStatus();
    }
   
}
