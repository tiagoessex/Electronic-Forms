
import { Div, ButtonAndAwesomeIcon } from '/static/js/ui/BuildingBlocks.js';
import { EAElementSelector } from '../EAElementSelector.js';
import { ActionRow } from './ActionRow.js';
import { EA_TYPE, ROW_ACTION_CLASS } from '../constants.js';

/**
 * Format E/A Action Row.
 */
 export class FormatActionRow extends ActionRow {

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

        const col_fields = new Div({classes:['col-10']}).attachTo(this);
        this.field_selector = new EAElementSelector(context, null, EA_TYPE.FORMAT.elements_allowed.actions).attachTo(col_fields);
        if (data_restore) this.field_selector.setValue(data_restore).checkStatus();

        const col_ops = new Div({classes:['col-2','align-middle','text-center']}).attachTo(this);
        this.delete_field = new ButtonAndAwesomeIcon('','fa fa-trash', {classes:['btn','btn-danger','mr-1']}).attachTo(col_ops);
        this.add_field = new ButtonAndAwesomeIcon('','fa fa-plus', {classes:['btn','btn-primary']}).attachTo(col_ops);
  
        this.delete_field.dom.addEventListener('click', function (e) {
            onRemove(self);
            self.clear();
            self.context.signals.onChange.dispatch();
            if ($(self.dom).parent().find('.' + ROW_ACTION_CLASS).length == 1) {
                context.signals.onEAStatusChanged.dispatch(self, false);
            } else {
                self.field_selector.detach();
                context.signals.onEAStatusChanged.dispatch(self);
            }
            self.detach();            
        });

        this.add_field.dom.addEventListener('click', function (e) {
            const row = e.target.parentNode.parentNode;
            const anchor = row.nextElementSibling;
            const parent = self.dom.parentNode;
            const new_row = new FormatActionRow(self.context, onAdd, onRemove);
            onAdd(new_row);
            if (anchor)
                parent.insertBefore(new_row.dom, anchor);
            else
                new_row.attachTo(parent);
            context.signals.onEAStatusChanged.dispatch(self);
        });

        context.signals.onChange.dispatch();
    }

    /**
     * Prepares the data to be saved.
     * @returns The target field value.
     */       
    save() {
        return this.field_selector.getValue();
    }

    /**
     * Cleanups.
     */
    clear() {
        this.field_selector.clear();
    }    
 
}
