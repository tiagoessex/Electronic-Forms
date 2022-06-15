
import { EA_VISIBILITY_CLASS, PRE_ACTION_CARD_ID, PRE_EVENT_CARD_ID } from './constants.js';
import { EA } from './EA.js';
import { VisibilityActionCard } from './actions/VisibilityActionCard.js';
import { EventsCard } from './events/EventsCard.js';

/**
 * Visibility E/A.
 */
export class EAVisibility extends EA {

    constructor(context, id, name, data_restore) {
        super(context, id, name);

        this.addClass(EA_VISIBILITY_CLASS);
        this.header.removeClass('bg-warning');
        this.color_class = 'ea-visibility'; 

        this.events = new EventsCard(context, PRE_EVENT_CARD_ID + id, data_restore).attachTo(this.body);
        this.actions = new VisibilityActionCard(context, PRE_ACTION_CARD_ID + id, data_restore).attachTo(this.body);

        this.checkStatus();
    }
   
}
