
import { EA_SELECTION_CLASS, PRE_ACTION_CARD_ID, PRE_EVENT_CARD_ID } from './constants.js';
import { EA } from './EA.js';
import { SelectionActionCard } from './actions/SelectionActionCard.js';
import { EventsCard } from './events/EventsCard.js';



/**
 * Selection E/A.
 */
export class EASelection extends EA {

    constructor(context, id, name, data_restore) {
        super(context, id, name);

        this.addClass(EA_SELECTION_CLASS);
        this.header.removeClass('bg-warning');
        this.color_class = 'ea-selection'; 

        this.events = new EventsCard(context, PRE_EVENT_CARD_ID + id, data_restore).attachTo(this.body);
        this.actions = new SelectionActionCard(context, PRE_ACTION_CARD_ID + id, data_restore).attachTo(this.body);

        this.checkStatus();
    }
   
}
