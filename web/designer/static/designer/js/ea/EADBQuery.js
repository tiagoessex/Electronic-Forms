
import { EA_DB_QUERY_CLASS, PRE_ACTION_CARD_ID, PRE_EVENT_CARD_ID } from './constants.js';
import { EA } from './EA.js';
import { DBQueryActionCard } from './actions/DBQueryActionCard.js';
import { EventsCard } from './events/EventsCard.js';




/**
 * Database Query E/A.
 */
export class EADBQuery extends EA {

    constructor(context, id, name, data_restore) {
        super(context, id, name);

        this.addClass(EA_DB_QUERY_CLASS);
        this.header.removeClass('bg-warning');
        this.color_class = 'ea-dbquery'; 

        this.events = new EventsCard(context, PRE_EVENT_CARD_ID + id, data_restore).attachTo(this.body);
        this.actions = new DBQueryActionCard(context, PRE_ACTION_CARD_ID + id, data_restore).attachTo(this.body);

        this.checkStatus();

    }
   
}
