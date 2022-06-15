
import { EA_TABLE_QUERY_CLASS, PRE_ACTION_CARD_ID, PRE_EVENT_CARD_ID } from './constants.js';
import { EA } from './EA.js';
import { TableQueryActionCard } from './actions/TableQueryActionCard.js';
import { EventsCard } from './events/EventsCard.js';


/**
 * Table Query E/A.
 */
export class EATableQuery extends EA {

    constructor(context, id, name, data_restore) {
        super(context, id, name);

        this.addClass(EA_TABLE_QUERY_CLASS);
        this.header.removeClass('bg-warning');
        this.color_class = 'ea-tablequery'; 
        
        this.events = new EventsCard(context, PRE_EVENT_CARD_ID + id, data_restore).attachTo(this.body);
        this.actions = new TableQueryActionCard(context, PRE_ACTION_CARD_ID + id, data_restore).attachTo(this.body);

        this.checkStatus();
    }
   
}
