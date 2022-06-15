
import { Div, ButtonAndAwesomeIcon, Input } from '/static/js/ui/BuildingBlocks.js';
import { EAElementSelector } from '../EAElementSelector.js';
import { ActionRow } from './ActionRow.js';
import { EA_TYPE, ROW_ACTION_CLASS, EA_INPUT_X } from '../constants.js';


/**
 * Table Query E/A Action Row.
 */
 export class DBQueryOriginActionRow extends ActionRow {

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

        
        const form_origin_field_col = new Div({classes:['col-5']}).attachTo(this);
        this.form_origin_field = new EAElementSelector(context, null, null, EA_TYPE.DBQUERY.elements_not_allowed.actions).attachTo(form_origin_field_col);
        if (data_restore) this.form_origin_field.setValue(data_restore.form_origin_field);//.checkStatus();
        this.form_origin_field.checkStatus();

        const input_field_col = new Div({classes:['col-5']}).attachTo(this);
        this.query_origin_field = new Input({classes:['form-control',EA_INPUT_X]}).attachTo(input_field_col);
        if (data_restore) this.query_origin_field.setValue(data_restore.query_origin_field);
        this.query_origin_field.checkStatus();

        const col_ops = new Div({classes:['col-2','align-middle','text-center']}).attachTo(this);
        this.delete_field = new ButtonAndAwesomeIcon('','fa fa-trash', {classes:['btn','btn-danger','mr-1']}).attachTo(col_ops);
        this.add_field = new ButtonAndAwesomeIcon('','fa fa-plus', {classes:['btn','btn-primary']}).attachTo(col_ops);
 
        this.delete_field.dom.addEventListener('click', function (e) {
            onRemove(self);
            self.clear();
            self.context.signals.onChange.dispatch();
            self.form_origin_field.detach();
            self.query_origin_field.detach();
            context.signals.onEAStatusChanged.dispatch(self);
            self.detach();            
        });

        this.add_field.dom.addEventListener('click', function (e) {
            const row = e.target.parentNode.parentNode;
            const anchor = row.nextElementSibling;
            const parent = self.dom.parentNode;
            const new_row = new DBQueryOriginActionRow(self.context, onAdd, onRemove);
            onAdd(new_row);
            if (anchor)
                parent.insertBefore(new_row.dom, anchor);
            else
                new_row.attachTo(parent);
            context.signals.onEAStatusChanged.dispatch(self);
        });

        $(this.query_origin_field.dom).on('keyup change', function(e) {
            self.query_origin_field.checkStatus();
            context.signals.onEAStatusChanged.dispatch(self);
        });

        context.signals.onChange.dispatch();
    }

    /**
     * Prepares the data to be saved.
     * @returns An object containing all the necessary data to restore this row.
     */       
    save() {
        return {            
            form_origin_field: this.form_origin_field.getValue(),
            query_origin_field: this.query_origin_field.getValue(),
        }
    }

    /**
     * Cleanups.
     */
    clear() {
        this.form_origin_field.clear();
    }    

}
