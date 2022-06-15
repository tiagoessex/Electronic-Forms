import { Action } from './Action.js';
import { ID_FORMVIEW_APPEND, ID_LISTVIEW_APPEND } from '../../constants.js';
import { URL_EXEC_QUERY } from '/static/js/urls.js';
import { fetchPOST } from '/static/js/Fetch.js';
import { Translator } from '/static/js/Translator.js';


/**
 * DBQuery Action Class.
 */
export class DBQueryAction extends Action {
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
        this.context.signals.onStuffDone.dispatch("new DBQueryAction [" + id + "] ready!");
    }

    /**
     * Execute the action.
     */
    execute = () => {
        super.execute();
        const query = this.data.query;
        const targets = this.data.target;
        const origins = this.data.origin;
        if (targets.length == 0) {
            console.error("[DBQueryAction::execute] No targets!");
            return;
        }
        const _origins = [];
        origins.forEach(origin => {
            const origin_form_dom = document.getElementById(origin.form_origin_field + ID_FORMVIEW_APPEND);
            if (origin_form_dom) {
                _origins.push({
                    form_origin_value: origin_form_dom.value,
                    query_origin_field: origin.query_origin_field
                })
            } else {
                console.error("[DBQueryAction::execute] Error in origin_form_dom [" + origin.form_origin_field + "]!");
            }
        })

        this.execQuery(query, _origins, (results) => {
            //console.log(results);
            if (results.length == 0) {
                this.context.signals.onWarning.dispatch(Translator.translate("There are no records in the database that matches the inputs!"));
                return;
            }
            if (results.hasOwnProperty('error')) {
                this.context.signals.onError.dispatch("Something is wrong with the query. Check it!");
                console.error("[DBQueryAction::execute] Query error! ");
                return;
            }

            targets.forEach(target => {
                const target_form_dom = document.getElementById(target.form_target_field + ID_FORMVIEW_APPEND);
                const target_list_dom = document.getElementById(target.form_target_field + ID_LISTVIEW_APPEND);
                if (target_form_dom && target_list_dom) {
                    const target_field = target.query_target_field.substring(target.query_target_field.indexOf("$") + 1, target.query_target_field.lastIndexOf("$"));
                    const target_element_type = target_form_dom.parentNode.dataset.type;                    
                    switch (target_element_type) {
                        case 'DROPDOWN':
                            $(target_form_dom).empty();
                            $(target_list_dom).empty();
                            results.forEach(result => {                                
                                const option = document.createElement('option');
                                option.textContent = result[target_field];
                                option.setAttribute('value',result[target_field]);
                                target_form_dom.appendChild(option);
                                target_list_dom.appendChild(option.cloneNode(true));
                            }); 
                            break;
                        default:
                            // if the form's creator made a mistake and the mysql field doesn't exist
                            // then don't write nothing in the corresponding target field
                            if (typeof results[0][target_field] !== 'undefined') {
                                target_form_dom.value = results[0][target_field];
                                target_list_dom.value = results[0][target_field];
                            }
                    }
                    // dispatch an event that this element changed
                    // required for example for chained events
                    var event = new Event('change');
                    target_form_dom.dispatchEvent(event);
                } else {
                    console.error("[DBQueryAction::execute] field_dom error");
                }
            });
        })
    }
    

    /**
     * Execute a specific query.
     * @param {number} query Query ID.
     * @param {array} origins Array of strings with the origins fields [{field_value, #fieldname#}].
     * @param {function} onReady Function to be called once the query is done.
     */
    execQuery(query, origins, onReady) {
        
        fetchPOST(URL_EXEC_QUERY,
            {
                query_id: query,
                origins: origins,
            },
            (result) => {
                if (onReady) onReady(result);
            },
            (error) => {
                this.context.signals.onError.dispatch(error);
                console.error("[DBQueryAction::execQuery] Fetch error! ", error);
            }
        );

        /*
        fetch(URL_EXEC_QUERY, {
            method: 'POST',
            mode: 'same-origin',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: JSON.stringify({
                query_id: query,
                origins: origins,
            })
        })
        .then(handleErrors)
        .then(result => {
            if (onReady) onReady(result);
        })
        .catch((error) => {
            this.context.signals.onError.dispatch(error);
            console.error("[DBQueryAction::execQuery] Fetch error! ", error);
        });
        */

    }

}