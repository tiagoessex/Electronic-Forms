import { Action } from './Action.js';
import { ID_FORMVIEW_APPEND, ID_LISTVIEW_APPEND } from '../../constants.js';
import { URL_GET_TABLE } from '/static/js/urls.js';
import { fetchGET } from '/static/js/Fetch.js';
import { OPERATORS } from '/static/designer/js/ea/constants.js';

/**
 * TableQuery Action Class.
 * 
* Subactions:
 *      - table_query
 * 
 */
export class TableQueryAction extends Action {
    /**
     * Constructor.
     * @param {Context} context Context.
     * @param {string} id Action ID.
     * @param {object} data Action object.
     */
    constructor(context, id, data) {
        super(context, id);
        this.context = context;
        this.data = data;
        context.signals.onStuffDone.dispatch("new TableQueryAction [" + id + "] ready!");
    }

    /**
     * Execute the action.
     */
    execute = () => {
        super.execute();

        const table = this.data.table;
        const conditionals = this.data.conditionals;
        const targets = this.data.targets;

        if (targets.length == 0) {
            console.error("[TableQueryAction::execute] No targets!");
            return;
        }
        if (conditionals.length == 0) {
            console.error("[TableQueryAction::execute] No conditionals!");
            return;
        }


        //const target_field_formview = document.getElementById(target_field + ID_FORMVIEW_APPEND);
        //const target_field_listview = document.getElementById(target_field + ID_LISTVIEW_APPEND);

        this.getTableContents(table, (results => {
            const values = {};


            results.forEach(row => {
                let bAdd = true;
                conditionals.forEach(condition => {
                    const condition_field = document.getElementById(condition.field + ID_FORMVIEW_APPEND);
                    if (!condition_field) return;
                    const value = condition_field.value.toString();
                    if (value === '') return;
                    const column = condition.column;
                    switch (condition.operator) {
                        case OPERATORS.EQUAL:
                            if (value !== row[column].toString()) bAdd = false;
                            break;
                        case OPERATORS.GREATER:
                            if (value < row[column].toString()) bAdd = false;
                            break;
                        case OPERATORS.LESSER:
                            if (value > row[column].toString()) bAdd = false;
                            break;
                        case OPERATORS.NOT:
                        default:
                            if (value === row[column].toString()) bAdd = false;
                    }
                })
                if (bAdd) {
                    targets.forEach(target => {
                        //values.add({target: target.field, value: line[target.column]});
                        if (!values.hasOwnProperty(target.field)) {
                            values[target.field] = new Set();
                        }
                        values[target.field].add(row[target.column]);
                    })

                }
            });

            targets.forEach(target => {
                if (!values.hasOwnProperty(target.field)) return;
                const target_form_dom = document.getElementById(target.field + ID_FORMVIEW_APPEND);
                const target_list_dom = document.getElementById(target.field + ID_LISTVIEW_APPEND);
                if (target_form_dom && target_list_dom) {
                    const target_element_type = target_form_dom.parentNode.dataset.type;
                    switch (target_element_type) {
                        case 'DROPDOWN':
                            $(target_form_dom).empty();
                            $(target_list_dom).empty();
                            for (let item of values[target.field]) {
                                const option = document.createElement('option');
                                option.textContent = item;
                                option.setAttribute('value', item);
                                target_form_dom.appendChild(option);
                                target_list_dom.appendChild(option.cloneNode(true));
                            }
                            break;
                        default:
                            // default => only use the first element
                            target_form_dom.value = values[target.field].values().next().value;
                            target_list_dom.value = values[target.field].values().next().value;
                    }

                } else {
                    console.error("[TableQueryAction::execute] field_dom error");
                }

                // dispatch an event that this element changed
                // required for example for chained events
                var event = new Event('change');
                target_form_dom.dispatchEvent(event);
            });


        }));

    }

    /**
     * Get all the table contents.
     * Data structure example:
     * [
     *   {
     *      col1: value1,
     *      col2: value2,
     *   },
     *   {
     *      col1: value3,
     *      col2: value4,
     *   }
     * ]
     * @param {number} table Table asset number.
     * @param {function} onReady Callback called when fetch is over.
     */
    getTableContents(table, onReady = null) {
        fetchGET(URL_GET_TABLE + this.context.form_id + '/' + table, 
            (result) => {
                //console.log(result);
                if (onReady) onReady(result);
            },
            (error) => {
                this.context.signals.onError.dispatch(error);
                console.error("[AppendAction::getTableContents] Fetch error! ", error);
            }
        );       
    }

}