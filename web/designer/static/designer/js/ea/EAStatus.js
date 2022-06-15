
import { EA_STATUS_CLASS, PRE_ACTION_CARD_ID, PRE_EVENT_CARD_ID } from './constants.js';
import { EA } from './EA.js';
import { StatusActionCard } from './actions/StatusActionCard.js';
import { EventsCard } from './events/EventsCard.js';

/**
 * Status E/A.
 */
export class EAStatus extends EA {

    constructor(context, id, name, data_restore) {
        super(context, id, name);

        this.addClass(EA_STATUS_CLASS);
        this.header.removeClass('bg-warning');
        this.color_class = 'ea-status'; 

        this.events = new EventsCard(context, PRE_EVENT_CARD_ID + id, data_restore).attachTo(this.body);
        this.actions = new StatusActionCard(context, PRE_ACTION_CARD_ID + id, data_restore).attachTo(this.body);

        this.checkStatus();
    }
   
}
