
import { Div, ButtonAndAwesomeIcon } from '/static/js/ui/BuildingBlocks.js';
import { EAElementSelector } from '../EAElementSelector.js';
import { ActionRow } from './ActionRow.js';
import { OperatorSelector } from './OperatorSelector.js';
import { TableColumnSelector } from '../../tables/TableColumnSelector.js';
import { EA_TYPE, ROW_ACTION_CLASS } from '../constants.js';


/**
 * Table Query E/A Action Row.
 */
 export class TableQueryConditionalActionRow extends ActionRow {

    /**
     * Constructor.
     * @param {Context} context Context.
     * @param {function} onAdd Called when an row is added.
     * @param {function} onRemove Called when this row is removed.
     * @param {Object} data_restore Object containing all the data required to restore this card.
     */
    constructor(context, onAdd, onRemove, data_restore=null) {
        super(context);
        this.context = context;
        const self = this;
        this.data_restore = data_restore;

     
        const col_column_2 = new Div({classes:['col-2']}).attachTo(this);
        this.column_selector = new TableColumnSelector(context).attachTo(col_column_2);

        const col_operator = new Div({classes:['col-2']}).attachTo(this);
        this.operator_selector = new OperatorSelector(context).attachTo(col_operator);
        if (data_restore) this.operator_selector.setValue(data_restore.operator);

        const col_fields = new Div({classes:['col-6']}).attachTo(this);
        this.field_selector = new EAElementSelector(context, null, EA_TYPE.TABLEQUERY.elements_allowed.actions).attachTo(col_fields);
        if (data_restore) {
            this.field_selector.setValue(data_restore.field).checkStatus();
        } else {
            this.field_selector.checkStatus();
        }
        
        const col_ops = new Div({classes:['col-2','align-middle','text-center']}).attachTo(this);
        this.delete_field = new ButtonAndAwesomeIcon('','fa fa-trash', {classes:['btn','btn-danger','mr-1']}).attachTo(col_ops);
        this.add_field = new ButtonAndAwesomeIcon('','fa fa-plus', {classes:['btn','btn-primary']}).attachTo(col_ops);
  
        this.delete_field.dom.addEventListener('click', function (e) {
            onRemove(self);
            self.clear();
            self.context.signals.onChange.dispatch();
            if ($(self.dom).parent().find('.' + ROW_ACTION_CLASS).length == 1) {
                context.signals.onEAStatusChanged.dispatch(self,false);
            } else {
                self.column_selector.detach();
                self.operator_selector.detach();
                self.field_selector.detach();
                context.signals.onEAStatusChanged.dispatch(self);
            }
            self.detach();
        });

        this.add_field.dom.addEventListener('click', function (e) {
            const row = e.target.parentNode.parentNode;
            const anchor = row.nextElementSibling;
            const parent = self.dom.parentNode;
            const new_row = new TableQueryConditionalActionRow(self.context, onAdd, onRemove);
            onAdd(new_row);
            if (anchor)
                parent.insertBefore(new_row.dom, anchor);
            else
                new_row.attachTo(parent);
            context.signals.onEAStatusChanged.dispatch(self);
        });

        context.signals.onChange.dispatch();
    }

    updateTableColumns(table) {
        this.column_selector.getColumns(table, () => {
            if (this.data_restore) {
                this.column_selector.setValue(this.data_restore.column);
            }
        });
        this.context.signals.onEAStatusChanged.dispatch(this);
    }

     /**
     * Prepares the data to be saved.
     * @returns An object containing all the necessary data to restore this row.
     */       
      save() {
        return {
            column: this.column_selector.getValue(),
            operator: this.operator_selector.getValue(),
            field: this.field_selector.getValue(),

        }
    }

    /**
     * Cleanups.
     */
    clear() {
        this.field_selector.clear();
    }     
       
}
