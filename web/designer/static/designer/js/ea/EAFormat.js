
import { EA_FORMAT_CLASS, PRE_ACTION_CARD_ID, PRE_EVENT_CARD_ID } from './constants.js';
import { EA } from './EA.js';
import { FormatActionCard } from './actions/FormatActionCard.js';
import { EventsCard } from './events/EventsCard.js';

/**
 * Format E/A.
 */
export class EAFormat extends EA {

    constructor(context, id, name, data_restore) {
        super(context, id, name);

        this.addClass(EA_FORMAT_CLASS);
        this.header.removeClass('bg-warning');
        this.color_class = 'ea-format'; 

        this.events = new EventsCard(context, PRE_EVENT_CARD_ID + id, data_restore).attachTo(this.body);
        this.actions = new FormatActionCard(context, PRE_ACTION_CARD_ID + id, data_restore).attachTo(this.body);

        this.checkStatus();
    }
   
}
