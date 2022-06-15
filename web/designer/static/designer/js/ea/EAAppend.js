
import { EA_APPEND_CLASS, PRE_ACTION_CARD_ID, PRE_EVENT_CARD_ID } from './constants.js';
import { EA } from './EA.js';
import { AppendActionCard } from './actions/AppendActionCard.js';
import { EventsCard } from './events/EventsCard.js';


/**
 * Append E/A.
 */
export class EAAppend extends EA {

    constructor(context, id, name, data_restore) {
        super(context, id, name);

        this.addClass(EA_APPEND_CLASS);
        this.header.removeClass('bg-warning');
        this.color_class = 'ea-append';

        this.events = new EventsCard(context, PRE_EVENT_CARD_ID + id, data_restore).attachTo(this.body);
        this.actions = new AppendActionCard(context, PRE_ACTION_CARD_ID + id, data_restore).attachTo(this.body);
        
        this.checkStatus();
    }
}
