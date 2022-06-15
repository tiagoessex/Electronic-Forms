
import { Div, Text, ButtonAndAwesomeIcon } from '/static/js/ui/BuildingBlocks.js';
import { RequiredActionRow } from './RequiredActionRow.js';
import { ActionCard } from './ActionCard.js';
import { ActionSelector } from './ActionSelector.js';
import { EA_TYPE } from '../constants.js';
import { Translator } from '/static/js/Translator.js';


/**
 * Required Action Card for Basic E/A.
 */
export class RequiredActionCard extends ActionCard {
    
    /**
     * Constructor.
     * @param {Context} context Context.
     * @param {string} id ActionCard ID
     * @param {Object} data_restore Object containing all the data required to restore this card.
     */
    constructor(context, id, data_restore) {
        super(context, id);

        this.context = context;
        this.rows = [];

        const add_btn = new ButtonAndAwesomeIcon('','fa fa-plus', {classes:['float-right','btn','btn-outline-primary']}).attachTo(this.header);


        // labels
        const label_row = new Div({classes:['row','m-2','text-center']}).attachTo(this);
        const col_actions_label = new Div({classes:['col-2']}).attachTo(label_row);
        new Text(Translator.translate("Action"), {classes:['font-weight-bold']}).attachTo(col_actions_label);
        const col_fields_label = new Div({classes:['col-8']}).attachTo(label_row);
        new Text(Translator.translate("Fields"), {classes:['font-weight-bold']}).attachTo(col_fields_label);
        const col_operation_label_2 = new Div({classes:['col-2']}).attachTo(label_row);
        new Text("Ops.", {classes:['font-weight-bold']}).attachTo(col_operation_label_2);

        // actions
        const actions_row = new Div({classes:['row','m-2']}).attachTo(this);
        const col_action = new Div({classes:['col-2']}).attachTo(actions_row);
        this.col_fields = new Div({classes:['col-10']}).attachTo(actions_row);

        this.action_selector = new ActionSelector(context, null, EA_TYPE.REQUIRED).attachTo(col_action);
        if (data_restore) this.action_selector.setValue(data_restore.actions.action);

        // initial row
        this.rows.push(new RequiredActionRow(context, this.onAddRow, this.onRemoveRow, data_restore?data_restore.actions.target_fields[0]:null).attachTo(this.col_fields));

        if (data_restore && data_restore.actions) this.restore(data_restore.actions);

        add_btn.dom.addEventListener('click',() => {
            this.rows.push(new RequiredActionRow(this.context, this.onAddRow, this.onRemoveRow).attachTo(this.col_fields));
            context.signals.onEAStatusChanged.dispatch(this);
        }) 

    }  


    /**
     * When an action row is created, add it to the collection.
     * @param {RequiredActionRow} row RequiredActionRow to be saved.
     */
     onAddRow = (row) =>  {
        this.rows.push(row);
    }

    /**
     * When an event row is removed, remove it from the collection.
     * @param {RequiredActionRow} row RequiredActionRow to be removed.
     */
    onRemoveRow = (row) => {
        row.clear();
        this.rows.splice(this.rows.indexOf(row), 1)
    }

    /**
     * Cleanups.
     */
     clear() {
        this.rows.forEach(row => {
            row.clear();
        });
    }


    /**
     * Prepares the data to be saved.
     * @returns An object containing all the necessary data to restore this card.
     */    
    save() {
        const data = {};
        data['action'] = this.action_selector.getValue();
        data['target_fields'] = []
        this.rows.forEach((row) => {
            data['target_fields'].push(row.save());
        })
        return data;
    }

    /**
     * Restores the card.
     * @param {object} data Data to be restored.
     */    
    restore(data) {      
        data.target_fields.forEach((row, index) => {
            if (index != 0) {
                const ea = new RequiredActionRow(this.context, this.onAddRow, this.onRemoveRow, row).attachTo(this.col_fields);
                this.rows.push(ea);
            }
        })
    }

}
