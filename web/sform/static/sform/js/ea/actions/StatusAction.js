import { Action } from './Action.js';


/**
 * Status Action Class.
 * 
 * Subactions:
 *      - cross
 *      - uncross
 *      - disable
 *      - enable
 * 
 * NOTES:
 *      - ATT TO parentNode.parentNode.parentNode in listview
 * 
 */
export class StatusAction extends Action {
    /**
     * Constructor.
     * @param {Context} context Context.
     * @param {string} id Action ID.
     * @param {object} data Action object.
     */
    constructor(context, id, data) {
        super(context, id);
        this.data = data;
        this.context = context;
        context.signals.onStuffDone.dispatch("new StatusAction [" + id + "] ready!");
    }

    /**
     * Execute the action.
     */
    execute = () => {
        super.execute();        
        this.data.target_fields.forEach(field => {                
            switch (this.data.action) {
                // cross => cross + disable
                case 'cross':
                    this.context.signals.onCrossed.dispatch(field);
                    this.context.signals.onDisabled.dispatch(field);
                    break
                // uncross => uncross + enable
                case 'uncross':
                    this.context.signals.onUncrossed.dispatch(field);
                    this.context.signals.onEnabled.dispatch(field);
                    break
                case 'disable':
                    this.context.signals.onDisabled.dispatch(field);                       
                    break
                case 'enable':
                    this.context.signals.onEnabled.dispatch(field);                        
                    break
                default: 
                    console.error("[StatusAction::execute] No type [" + this.data.action + "]!");                       
            }
        }) 
    }

}