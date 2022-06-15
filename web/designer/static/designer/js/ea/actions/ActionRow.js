
import { Div } from '/static/js/ui/BuildingBlocks.js';
import { ROW_ACTION_CLASS } from '../constants.js';


/**
 * Base E/A Action Row.
 */
 export class ActionRow extends Div {
    /**
     * Constructor.
     * @param {Context} context Context.
     */
    constructor(context) {
        super({classes:['row','m-1',ROW_ACTION_CLASS]});      
    }
}
