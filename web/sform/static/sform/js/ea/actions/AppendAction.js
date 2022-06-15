import { Action } from './Action.js';
import { ID_FORMVIEW_APPEND, ID_LISTVIEW_APPEND } from '../../constants.js';


/**
 * Append Action Class.
 */
export class AppendAction extends Action {
    /**
     * Constructor.
     * @param {Context} context Context.
     * @param {string} id Action ID.
     * @param {object} data Action object.
     */
    constructor(context, id, data) {
        super(context, id);
        this.data = data;
        this.connector = data.connector;
        this.target_field_formview = document.getElementById(data.target_field + ID_FORMVIEW_APPEND);
        this.target_field_listview = document.getElementById(data.target_field + ID_LISTVIEW_APPEND);        
        context.signals.onStuffDone.dispatch("new AppendAction [" + id + "] ready!");
    }

    /**
     * Execute the action.
     */
    execute = () => {
        super.execute();
        if (this.target_field_formview && this.target_field_listview) {
            let appended_str = '';
            this.data.origin_fields.forEach((field, index) => { 
                const field_dom = document.getElementById(field + ID_FORMVIEW_APPEND);
                if (field_dom) {
                    const target_type_un = field_dom.dataset.type;
                    switch (target_type_un) {
                        case 'DROPDOWN':
                            if (field_dom.value !== '')
                                appended_str += field_dom.options[field_dom.selectedIndex].text;
                            break;
                        default:                        
                            appended_str += field_dom.value;
                            if (index < this.data.origin_fields.length-1)
                                appended_str += this.connector;
                    }
                } else {
                    console.error("[AppendAction::execute] - field_dom error");
                }             
            })
           this.target_field_formview.value = appended_str;
           this.target_field_listview.value = appended_str;

            // dispatch an event that this element changed
            // required for example for chained events
            var event = new Event('change');
            target_field_formview.dispatchEvent(event);

       } else {
            console.error("[AppendAction::execute] - target_field_X error");
       }
    }
}