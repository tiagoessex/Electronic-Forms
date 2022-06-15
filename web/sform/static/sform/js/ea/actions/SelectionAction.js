import { Action } from './Action.js';
//import { ID_FORMVIEW_APPEND, ID_LISTVIEW_APPEND } from '../../constants.js';

/**
 * Selection Action Class.
 * 
 * Subactions:
 *      - select
 *      - unselect
 * 
 * NOTES:
 *      - ATT TO parentNode.parentNode.parentNode in listview
 * 
 */
export class SelectionAction extends Action {
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
        context.signals.onStuffDone.dispatch("new SelectionAction [" + id + "] ready!");
    }

    /**
     * Execute the action.
     */
    execute = () => {
        super.execute();        
        this.data.target_fields.forEach(field => {
            switch (this.data.action) {
                case 'unselect':
                    this.context.signals.onUnselected.dispatch(field);                        
                    break
                case 'select':
                    this.context.signals.onSelected.dispatch(field);
                    /*
                    const event = new Event('change');
                    const target_field_formview = document.getElementById(field + ID_FORMVIEW_APPEND);
                    target_field_formview.dispatchEvent(event);
                    */
                    break;
                default:
                    console.error("[SelectionAction::execute] No type [" + this.data.action + "]!");                     
            }
        }) 
    }

}