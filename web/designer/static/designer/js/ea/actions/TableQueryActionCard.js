
import { Div, Text, ButtonAndAwesomeIcon } from '/static/js/ui/BuildingBlocks.js';
import { TableQueryConditionalActionRow } from './TableQueryConditionalActionRow.js';
import { TableQueryTargetActionRow } from './TableQueryTargetActionRow.js';
import { ActionCard } from './ActionCard.js';
import { TableSelector } from '../../tables/TableSelector.js';
import { STATIC_ACTION_COLOR, DYN_ACTION_COLOR } from '../colors.js';
import { Translator } from '/static/js/Translator.js';


/**
 * Action Card for Table Query E/A.
 */
export class TableQueryActionCard extends ActionCard {
    
    /**
     * Constructor.
     * @param {Context} context Context.
     * @param {string} id ActionCard ID
     * @param {Object} data_restore Object containing all the data required to restore this card.
     */
    constructor(context, id, data_restore) {
        super(context, id);

        this.rows_conditional = [];
        this.rows_target = [];
        this.context = context;
        const self = this;

        const add_conditional_btn = new ButtonAndAwesomeIcon('','fa fa-plus', {classes:['float-right','btn','btn-outline-warning']}).attachTo(this.header);
        const add_target_btn = new ButtonAndAwesomeIcon('','fa fa-plus', {classes:['float-right','btn','btn-outline-success','mr-1']}).attachTo(this.header);

        this.box_1 = new Div({classes:['border','m-1']}).attachTo(this);
        this.box_1.setStyle('background-color', STATIC_ACTION_COLOR);

        this.box_2 = new Div({classes:['border','m-1']}).attachTo(this);
        this.box_2.setStyle('background-color', DYN_ACTION_COLOR)

        // LABELS
        const row_static = new Div({classes:['row','m-2','text-center']}).attachTo(this.box_1);
        const table_col = new Div({classes:['col-2']}).attachTo(row_static);
        new Text(Translator.translate("Table"), {classes:['font-weight-bold']}).attachTo(table_col);        
        const fetch_col = new Div({classes:['col-2']}).attachTo(row_static);        
        new Text(Translator.translate("Fetch Column"), {classes:['font-weight-bold']}).attachTo(fetch_col); 
        const target_col = new Div({classes:['col-6']}).attachTo(row_static);        
        new Text(Translator.translate("Target Fields"), {classes:['font-weight-bold']}).attachTo(target_col); 
        const ops_target = new Div({classes:['col-2']}).attachTo(row_static);
        new Text("Ops.", {classes:['font-weight-bold']}).attachTo(ops_target);

        // actions
        const actions_static_row = new Div({classes:['row','m-2']}).attachTo(this.box_1);
        const col_table = new Div({classes:['col-2']}).attachTo(actions_static_row);
        this.col_targets = new Div({classes:['col-10']}).attachTo(actions_static_row);

        // initial row, if any
        if (data_restore) {
            if (data_restore.actions.targets.length > 0)
                this.rows_target.push(new TableQueryTargetActionRow(context, this.onAddTargetRow, this.onRemoveTargetRow, data_restore.actions.targets[0]).attachTo(this.col_targets));
        } else {
            this.rows_target.push(new TableQueryTargetActionRow(context, this.onAddTargetRow, this.onRemoveTargetRow, null).attachTo(this.col_targets));
        }


        // actions        
        this.table_sector = new TableSelector(context, (e) => {
            self.updateColumns();
        }).attachTo(col_table);
        
        this.table_sector.getTables(() => {
            if (data_restore) this.table_sector.setValue(data_restore.actions.table);
            this.updateColumns();
        });


        // labels
        const row_dyn = new Div({classes:['row','m-2','text-center']}).attachTo(this.box_2);
        const where_col = new Div({classes:['col-2']}).attachTo(row_dyn);
        new Text(Translator.translate("Where"), {classes:['font-weight-bold']}).attachTo(where_col);
        const operator = new Div({classes:['col-2']}).attachTo(row_dyn);
        new Text(Translator.translate("Operator"), {classes:['font-weight-bold']}).attachTo(operator);
        const field = new Div({classes:['col-6']}).attachTo(row_dyn);
        new Text(Translator.translate("Field"), {classes:['font-weight-bold']}).attachTo(field);
        const ops = new Div({classes:['col-2']}).attachTo(row_dyn);
        new Text("Ops.", {classes:['font-weight-bold']}).attachTo(ops);


        // initial row, if any
        if (data_restore) {
            if (data_restore.actions.conditionals.length > 0)
                this.rows_conditional.push(new TableQueryConditionalActionRow(context, this.onAddConditionalRow, this.onRemoveConditionalRow, data_restore.actions.conditionals[0]).attachTo(this.box_2));
        } else {
            this.rows_conditional.push(new TableQueryConditionalActionRow(context, this.onAddConditionalRow, this.onRemoveConditionalRow, null).attachTo(this.box_2));
        }

        if (data_restore && data_restore.actions) this.restore(data_restore.actions);

        add_conditional_btn.dom.addEventListener('click',() => {            
            self.onAddConditionalRow(new TableQueryConditionalActionRow(self.context, self.onAddConditionalRow, self.onRemoveConditionalRow).attachTo(self.box_2));
            context.signals.onEAStatusChanged.dispatch(self);
        })
        add_target_btn.dom.addEventListener('click',() => {            
            self.onAddTargetRow(new TableQueryTargetActionRow(self.context, self.onAddTargetRow, self.onRemoveTargetRow).attachTo(self.col_targets));
            context.signals.onEAStatusChanged.dispatch(self);
        })          

    }

    /**
     * When an action row is created, add it to the collection.
     * @param {TableQueryConditionalActionRow} row TableQueryConditionalActionRow to be saved.
     */    
    onAddConditionalRow = (row) =>  {
        this.rows_conditional.push(row);
        row.updateTableColumns(this.table_sector.getValue());
        this.context.signals.onEAStatusChanged.dispatch(this);
    }

    /**
     * When an event row is removed, remove it from the collection.
     * @param {TableQueryConditionalActionRow} row TableQueryConditionalActionRow to be removed.
     */    
    onRemoveConditionalRow = (row) => {
        row.clear();
        this.rows_conditional.splice (this.rows_conditional.indexOf(row), 1);
    }

    /**
     * When an action row is created, add it to the collection.
     * @param {TableQueryTargetActionRow} row TableQueryTargetActionRow to be saved.
     */    
     onAddTargetRow = (row) =>  {
        this.rows_target.push(row);
        row.updateTableColumns(this.table_sector.getValue());
        this.context.signals.onEAStatusChanged.dispatch(this);
    }


    /**
     * When an event row is removed, remove it from the collection.
     * @param {TableQueryTargetActionRow} row TableQueryTargetActionRow to be removed.
     */    
    onRemoveTargetRow = (row) => {
        row.clear();
        this.rows_target.splice (this.rows_target.indexOf(row), 1);
    }


    /**
     * 
     */
    updateColumns() {
        this.rows_conditional.forEach((row) => {
            row.updateTableColumns(this.table_sector.getValue());
        });
        this.rows_target.forEach((row) => {
            row.updateTableColumns(this.table_sector.getValue());
        });        
        this.context.signals.onEAStatusChanged.dispatch(this);
    }

    /**
     * Cleanups.
     */
    clear() {
        this.rows_conditional.forEach(row => {
            row.clear();
        });
        this.rows_target.forEach(row => {
            row.clear();
        });
    }

    /**
     * Prepares the data to be saved.
     * @returns An object containing all the necessary data to restore this card.
     */    
    save() {
        const data = {};
        data['table'] = this.table_sector.getValue();

        data['conditionals'] = []
        this.rows_conditional.forEach((row) => {
            data['conditionals'].push(row.save());
        })
        data['targets'] = []
        this.rows_target.forEach((row) => {
            data['targets'].push(row.save());
        })
        return data;
    }

    /**
     * Restores the card.
     * @param {object} data Data to be restored.
     */    
    restore(data) {
        // restore all
        data.conditionals.forEach((row, index) => {
            if (index != 0) {
                const ea = new TableQueryConditionalActionRow(this.context, this.onAddConditionalRow, this.onRemoveConditionalRow, row).attachTo(this.box_2);
                this.rows_conditional.push(ea);
            }
        })
        data.targets.forEach((row, index) => {
            if (index != 0) {
                const ea = new TableQueryTargetActionRow(this.context, this.onAddTargetRow, this.onRemoveTargetRow, row).attachTo(this.col_targets);
                this.rows_target.push(ea);
            }
        })         
        
    }    
}
