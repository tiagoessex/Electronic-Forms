
import { Div, Text, TextArea, AwesomeIconAndButton, ButtonAndAwesomeIcon } from '/static/js/ui/BuildingBlocks.js';
import { ActionCard } from './ActionCard.js';
import { STATIC_ACTION_COLOR, DYN_ACTION_COLOR, DYN_ACTION_COLOR_2 } from '../colors.js';
import { QuerySelector } from '../../queries/QuerySelector.js';
import { DBQueryOriginActionRow } from './DBQueryOriginActionRow.js';
import { DBQueryTargetActionRow } from './DBQueryTargetActionRow.js';
import { Translator } from '/static/js/Translator.js';


/**
 * Action Card for Database Query E/A.
 */
export class DBQueryActionCard extends ActionCard {
    

    /**
     * Constructor.
     * @param {Context} context Context.
     * @param {string} id ActionCard ID
     * @param {Object} data_restore Object containing all the data required to restore this card.
     */
    constructor(context, id, data_restore) {
        super(context, id);

        this.rows_target = [];
        this.rows_origin = [];
        this.context = context;
        const self = this;

        const add_origin_btn = new ButtonAndAwesomeIcon('','fa fa-plus', {classes:['float-right','btn','btn-outline-warning']}).attachTo(this.header);
        const add_target_btn = new ButtonAndAwesomeIcon('','fa fa-plus', {classes:['float-right','btn','btn-outline-success','mr-1']}).attachTo(this.header);


        const box_query = new Div({classes:['border','m-1']}).attachTo(this);
        box_query.setStyle('background-color', STATIC_ACTION_COLOR);

        this.box_target = new Div({classes:['border','m-1']}).attachTo(this);
        this.box_target.setStyle('background-color', DYN_ACTION_COLOR);

        this.box_origin = new Div({classes:['border','m-1']}).attachTo(this);
        this.box_origin.setStyle('background-color', DYN_ACTION_COLOR_2)

        // LABELS
        const row_label_query = new Div({classes:['row','m-2','text-center']}).attachTo(box_query);
        const query_select_label_col = new Div({classes:['col-2']}).attachTo(row_label_query);
        new Text(Translator.translate("Query"), {classes:['font-weight-bold']}).attachTo(query_select_label_col);        
        const query_watch_label_col = new Div({classes:['col-10']}).attachTo(row_label_query);        
        new Text(Translator.translate("Query Description"), {classes:['font-weight-bold']}).attachTo(query_watch_label_col); 

        
        // actions
        const actions_query_row = new Div({classes:['row','m-2']}).attachTo(box_query);
        const col_query_selector = new Div({classes:['col-2']}).attachTo(actions_query_row);
        const row_1 = new Div({classes:['row']}).attachTo(col_query_selector);
        const row_2 = new Div({classes:['row']}).attachTo(col_query_selector);
        
        const col_query_description = new Div({classes:['col-10']}).attachTo(actions_query_row);

        this.query_selector = new QuerySelector(context, (selected, query) => {
            query_description.setTextContent(query);
        }).attachTo(row_1);
        
        this.query_selector.getQueries(() => {
            if (data_restore) {
                this.query_selector.setValue(data_restore.actions.query);
            }
            query_description.setTextContent(this.query_selector.getSelectedQuery());
        });

        const auto_btn = new AwesomeIconAndButton(' ' + Translator.translate('Auto Populate'), 'fa fa-gears', {classes:['btn','btn-success', 'mt-1', 'btn-block']}).attachTo(row_2);
        auto_btn.dom.addEventListener('click', function() {
            self.clearDom();
            // parse query
            const query = query_description.dom.value;            
            var target_regex = /\$(.*?)\$/g;
            var conditional_regex = /\#(.*?)\#/g;
            const target = [...query.matchAll(target_regex)];
            const conditionals = [...query.matchAll(conditional_regex)];
            target.forEach((item, index) => {
                const data = {query_target_field: item[0], target_field: ''};
                self.rows_target.push(new DBQueryTargetActionRow(context, self.onAddTargetRow, self.onRemoveTargetRow, data).attachTo(self.box_target));
            })
            conditionals.forEach((item, index) => {
                const data = {query_origin_field: item[0], origin_field: ''};
                self.rows_origin.push(new DBQueryOriginActionRow(context, self.onAddOriginRow, self.onRemoveOriginRow, data).attachTo(self.box_origin));
            })
            context.signals.onEAStatusChanged.dispatch(self);         
        });

        const query_description = new TextArea(null, null, {classes:['form-control']}).attachTo(col_query_description);
        query_description.setAttribute('readonly','');

       
        // labels
        const row_dyn_target = new Div({classes:['row','m-2','text-center']}).attachTo(this.box_target);
        const query_field_label_col = new Div({classes:['col-5']}).attachTo(row_dyn_target);
        new Text(Translator.translate("Query Target Fields") + " ($X$)", {classes:['font-weight-bold']}).attachTo(query_field_label_col);
        const target_field_label_col = new Div({classes:['col-5']}).attachTo(row_dyn_target);
        new Text(Translator.translate("Form Target Fields"), {classes:['font-weight-bold']}).attachTo(target_field_label_col);

        // initial rows
        if (data_restore) {
            if (data_restore.actions.target.length > 0)
                this.rows_target.push(new DBQueryTargetActionRow(context, this.onAddTargetRow, this.onRemoveTargetRow, data_restore.actions.target[0]).attachTo(this.box_target));
        } else {
            this.rows_target.push(new DBQueryTargetActionRow(context, this.onAddTargetRow, this.onRemoveTargetRow, null).attachTo(this.box_target));
        }


        // labels
        const row_dyn_origin = new Div({classes:['row','m-2','text-center']}).attachTo(this.box_origin);
        const origin_field_label_col = new Div({classes:['col-5']}).attachTo(row_dyn_origin);
        new Text(Translator.translate("Form Conditional Fields"), {classes:['font-weight-bold']}).attachTo(origin_field_label_col);        
        const condition_field_label_col = new Div({classes:['col-5']}).attachTo(row_dyn_origin);
        new Text(Translator.translate("Query Conditional Fields") + " (#X#)", {classes:['font-weight-bold']}).attachTo(condition_field_label_col);


        // initial rows
        if (data_restore) {
            if (data_restore.actions.origin.length > 0) 
                this.rows_origin.push(new DBQueryOriginActionRow(context, this.onAddOriginRow, this.onRemoveOriginRow, data_restore.actions.origin[0]).attachTo(this.box_origin));
        } else {
            this.rows_origin.push(new DBQueryOriginActionRow(context, this.onAddOriginRow, this.onRemoveOriginRow, null).attachTo(this.box_origin));
        }


        if (data_restore && data_restore.actions) this.restore(data_restore.actions);

        add_origin_btn.dom.addEventListener('click',() => {
            self.rows_origin.push(new DBQueryOriginActionRow(self.context, self.onAddOriginRow, self.onRemoveOriginRow).attachTo(self.box_origin));
            this.context.signals.onEAStatusChanged.dispatch(self);  /** XXX */
        })
        add_target_btn.dom.addEventListener('click',() => {
            self.rows_target.push(new DBQueryTargetActionRow(self.context, self.onAddTargetRow, self.onRemoveTargetRow).attachTo(self.box_target));
            this.context.signals.onEAStatusChanged.dispatch(self);  /** XXX */
        })         

    }


    /**
     * When an action row is created, add it to the collection.
     * @param {DBQueryTargetActionRow} row DBQueryTargetActionRow to be saved.
     */    
     onAddTargetRow = (row) =>  {
        this.rows_target.push(row);
    }

    /**
     * When an event row is removed, remove it from the collection.
     * @param {DBQueryTargetActionRow} row DBQueryTargetActionRow to be removed.
     */    
    onRemoveTargetRow = (row) => {
        row.clear();
        this.rows_target.splice (this.rows_target.indexOf(row), 1)
    }


    /**
     * When an action row is created, add it to the collection.
     * @param {DBQueryOriginActionRow} row DBQueryOriginActionRow to be saved.
     */    
     onAddOriginRow = (row) =>  {
        this.rows_origin.push(row);
        //this.context.signals.onEAStatusChanged.dispatch(self);  /** XXX */
    }

    /**
     * When an event row is removed, remove it from the collection.
     * @param {DBQueryOriginActionRow} row DBQueryOriginActionRow to be removed.
     */    
    onRemoveOriginRow = (row) => {
        row.clear();
        this.rows_origin.splice (this.rows_origin.indexOf(row), 1);
        //this.context.signals.onEAStatusChanged.dispatch(self);  /** XXX */
    }


    /**
     * Clear all rows.
     */
     clearDom() {
        this.rows_target.forEach(row => {
            row.clear();
            let a = row.dom.parentNode.removeChild(row.dom); 
        });
        this.rows_origin.forEach(row => {
            row.clear();
            row.dom.parentNode.removeChild(row.dom)
        });
        this.rows_target = [];
        this.rows_origin = [];        
    }   
    
    /**
     * Cleanups.
     */
    clear() {
        this.rows_target.forEach(row => {
            row.clear();
        });
        this.rows_origin.forEach(row => {
            row.clear();
        });
    }


    /**
     * Prepares the data to be saved.
     * @returns An object containing all the necessary data to restore this card.
     */    
     save() {
        const data = {};
        data['query'] = this.query_selector.getValue();

        data['target'] = []
        this.rows_target.forEach((row) => {
            data['target'].push(row.save());
        })

        data['origin'] = []
        this.rows_origin.forEach((row) => {
            data['origin'].push(row.save());
        })        

        return data;
    }

    /**
     * Restores the card.
     * @param {object} data Data to be restored.
     */    
    restore(data) {

        // restore all
        data.target.forEach((row, index) => {
            if (index != 0) {
                const ea = new DBQueryTargetActionRow(this.context, this.onAddTargetRow, this.onRemoveTargetRow, row).attachTo(this.box_target);
                this.rows_target.push(ea);
            }
        })
        data.origin.forEach((row, index) => {
            if (index != 0) {
                const ea = new DBQueryOriginActionRow(this.context, this.onAddOriginRow, this.onRemoveOriginRow, row).attachTo(this.box_origin);
                this.rows_origin.push(ea);
            }
        })        
    } 

}
