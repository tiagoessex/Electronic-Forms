
import { Div, Text, Input, ButtonAndAwesomeIcon } from '/static/js/ui/BuildingBlocks.js';
import { AppendActionRow } from './AppendActionRow.js';
import { ActionCard } from './ActionCard.js';
import { EAElementSelector } from '../EAElementSelector.js';
import { EA_TYPE } from '../constants.js';
import { Translator } from '/static/js/Translator.js';


/**
 * Append Card for Auto E/A.
 */
export class AppendActionCard extends ActionCard {
    

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
        new Text(Translator.translate("Connector"), {classes:['font-weight-bold']}).attachTo(col_actions_label);
        const col_target_field_label = new Div({classes:['col-4']}).attachTo(label_row);
        new Text(Translator.translate("Target Field"), {classes:['font-weight-bold']}).attachTo(col_target_field_label);
        const col_fields_label = new Div({classes:['col-4']}).attachTo(label_row);
        new Text(Translator.translate("Origin Fields"), {classes:['font-weight-bold']}).attachTo(col_fields_label);
        const col_operation_label_2 = new Div({classes:['col-2']}).attachTo(label_row);
        new Text("Ops.", {classes:['font-weight-bold']}).attachTo(col_operation_label_2);

        // actions
        const actions_row = new Div({classes:['row','m-2']}).attachTo(this);
        const col_action = new Div({classes:['col-2']}).attachTo(actions_row);
        const col_target = new Div({classes:['col-4']}).attachTo(actions_row);
        this.col_fields = new Div({classes:['col-6']}).attachTo(actions_row);

        this.connector = new Input({classes:['form-control']}).attachTo(col_action);
        if (data_restore) this.connector.setValue(data_restore.actions.connector);

        this.target_field = new EAElementSelector(context, null, EA_TYPE.APPEND.elements_allowed.actions).attachTo(col_target);
        if (data_restore) this.target_field.setValue(data_restore.actions.target_field).checkStatus();
        
        // initial row
        this.rows.push(new AppendActionRow(context, this.onAddRow, this.onRemoveRow, data_restore?data_restore.actions.origin_fields[0]:null).attachTo(this.col_fields));

        if (data_restore && data_restore.actions) this.restore(data_restore.actions);

        add_btn.dom.addEventListener('click',() => {
            this.rows.push(new AppendActionRow(this.context, this.onAddRow, this.onRemoveRow).attachTo(this.col_fields));
            context.signals.onEAStatusChanged.dispatch(this);
        })        
    }

    /**
     * When an action row is created, add it to the collection.
     * @param {AppendActionRow} row AppendActionRow to be saved.
     */
    onAddRow = (row) =>  {
        this.rows.push(row);
    }

    /**
     * When an event row is removed, remove it from the collection.
     * @param {AppendActionRow} row AppendActionRow to be removed.
     */
    onRemoveRow = (row) => {
        row.clear();
        this.rows.splice(this.rows.indexOf(row), 1)
    }

    /**
     * Cleanups.
     */
    clear() {
        this.target_field.clear();
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
        data['connector'] = this.connector.getValue();
        data['target_field'] = this.target_field.getValue();
        data['origin_fields'] = []
        this.rows.forEach((row) => {
            data['origin_fields'].push(row.save());
        })
        return data;
    }

    /**
     * Restores the card.
     * @param {object} data Data to be restored.
     */    
    restore(data) {
        data.origin_fields.forEach((row, index) => {
            if (index != 0) {
                const ea = new AppendActionRow(this.context, this.onAddRow, this.onRemoveRow, row).attachTo(this.col_fields);
                this.rows.push(ea);
            }
        })
    }    
}
