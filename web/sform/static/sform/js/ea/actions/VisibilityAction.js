import { Action } from './Action.js';


/**
 * Visibility Action Class.
 * 
 * Subactions:
 *      - hide
 *      - show
 * 
 * NOTES:
 *      - ATT TO parentNode.parentNode.parentNode in listview
 * 
 */
export class VisibilityAction extends Action {
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
        context.signals.onStuffDone.dispatch("new VisibilityAction [" + id + "] ready!");
    }

    /**
     * Execute the action.
     */
    execute = () => {
        super.execute();        
        this.data.target_fields.forEach(field => {  
            switch (this.data.action) {
                case 'hide':
                    this.context.signals.onHidden.dispatch(field);                  
                    break
                case 'show':
                    this.context.signals.onShowed.dispatch(field);                    
                    break
                default:
                    console.error("[VisibilityAction::execute] No type [" + this.data.action + "]!"); 
            }
        }) 
    }

}