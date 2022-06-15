import { Action } from './Action.js';


/**
 * RequiredAction Action Class.
 * 
 * Subactions:
 *      - required
 *      - not required
 * 
 * NOTES:
 *      - ATT TO parentNode.parentNode.parentNode in listview
 * 
 */
export class RequiredAction extends Action {
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
        context.signals.onStuffDone.dispatch("new RequiredAction [" + id + "] ready!");
    }

    /**
     * Execute the action.
     */
    execute = () => {
        super.execute();
        this.data.target_fields.forEach(field => { 
            //console.log(field, this.data.action);               
            switch (this.data.action) {
                case 'required':
                    this.context.signals.onRequired.dispatch(field);
                    break;
                case 'not_required':
                    this.context.signals.onNotRequired.dispatch(field);                    
                    break;
                default: 
                    console.error("[RequiredAction::execute] No type [" + this.data.action + "]!");                       
            }
        }) 
    }

}