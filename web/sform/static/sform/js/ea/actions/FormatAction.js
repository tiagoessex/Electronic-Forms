import { Action } from './Action.js';
import { ID_FORMVIEW_APPEND, ID_LISTVIEW_APPEND } from '../../constants.js';

/**
 * Format Action Class.
 * 
 * Subactions:
 *      - uppercase
 *      - lowercase
 *      - firstletter
 * 
 */
export class FormatAction extends Action {
    /**
     * Constructor.
     * @param {Context} context Context.
     * @param {string} id Action ID.
     * @param {object} data Action object.
     */
    constructor(context, id, data) {
        super(context, id);
        this.data = data;
        context.signals.onStuffDone.dispatch("new FormatAction [" + id + "] ready!");
    }

    /**
     * Execute the action.
     */
    execute = () => {
        super.execute();        
        this.data.target_fields.forEach(field => {                
            const target_field_formview = document.getElementById(field + ID_FORMVIEW_APPEND);
            const target_field_listview = document.getElementById(field + ID_LISTVIEW_APPEND);
            if (target_field_formview && target_field_listview) {
                let new_value = target_field_formview.value;
                switch (this.data.action) {
                    case 'uppercase':
                        new_value = new_value.toUpperCase();
                        break
                    case 'lowercase':
                        new_value = new_value.toLowerCase();
                        break
                    case 'firstletter':                        
                        new_value = new_value.replace(/(^\w|\s\w)/g, m => m.toUpperCase());
                    default:
                        console.error("[FormatAction::execute] No type [" + this.data.action + "]!");
                }
                target_field_formview.value = new_value;
                target_field_listview.value = new_value;
                // dispatch an event that this element changed
                // required for example for chained events
                var event = new Event('change');
                target_field_formview.dispatchEvent(event);
            } else {
                console.error("[AppendAction::execute] - field_dom error");
            }
        }) 
    }
}