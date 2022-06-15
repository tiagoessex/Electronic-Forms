import { Action } from './Action.js';
import { ID_FORMVIEW_APPEND, ID_LISTVIEW_APPEND } from '../../constants.js';


/**
 * Temporal Action Class.
 *
 * Subactions:
 *      - now
 * 
 */
export class TemporalAction extends Action {
    /**
     * Constructor.
     * @param {Context} context Context.
     * @param {string} id Action ID.
     * @param {object} data Action object.
     */
    constructor(context, id, data) {
        super(context, id);
        this.data = data;
        context.signals.onStuffDone.dispatch("new TemporalAction [" + id + "] ready!");
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
                let date = new Date();
                let new_value = null;
                const target_element_type = target_field_formview.parentNode.dataset.type;
                //console.log(target_element_type);
                switch (target_element_type) {
                    case 'DATE':
                        new_value = date.toISOString().slice(0,10);
                        break;
                    case 'TIME':
                        new_value = date.toISOString().substring(11,16);
                        //runconsole.log(new_value);
                        break;
                    default:
                        console.error("[TemporalAction::execute] Element type [" + target_element_type + "] action not implemented!");
                }
                target_field_formview.value = new_value;
                target_field_listview.value = new_value;
                // dispatch an event that this element changed
                // required for example for chained events
                var event = new Event('change');
                target_field_formview.dispatchEvent(event);                
            } else {
                console.error("[TemporalAction::execute] - field_dom error");
            }
        }) 
    }
}