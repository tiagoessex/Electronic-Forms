
import { EA_REQUIRED_CLASS, PRE_ACTION_CARD_ID, PRE_EVENT_CARD_ID } from './constants.js';
import { EA } from './EA.js';
import { RequiredActionCard } from './actions/RequiredActionCard.js';
import { EventsCard } from './events/EventsCard.js';



/**
 * EARequired E/A.
 */
export class EARequired extends EA {

    constructor(context, id, name, data_restore) {
        super(context, id, name);

        this.addClass(EA_REQUIRED_CLASS);
        this.header.removeClass('bg-warning');
        this.color_class = 'ea-required'; 

        this.events = new EventsCard(context, PRE_EVENT_CARD_ID + id, data_restore).attachTo(this.body);
        this.actions = new RequiredActionCard(context, PRE_ACTION_CARD_ID + id, data_restore).attachTo(this.body);

        this.checkStatus();
    }
   
}
