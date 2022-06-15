
import { Div, ButtonAndAwesomeIcon } from '/static/js/ui/BuildingBlocks.js';
import { LogicalOpSelector } from './LogicalOpSelector.js';
import { EAElementSelector } from '../EAElementSelector.js';
import { EventsSelector } from './EventsSelector.js';
import { ROW_EVENT_CLASS, EVENTS_ELEMENTS_ALLOWED } from '../constants.js';


/**
 * E/A Event Row.
 */
 export class EventRow extends Div {

    /**
     * Constructor.
     * @param {Context} context Context.
     * @param {function} onAdd Called when an row is added.
     * @param {function} onRemove Called when this row is removed.
     * @param {boolean} isFirst Is this row the first?
     * @param {Object} data_restore Object containing all the data required to restore this card.
     */
    constructor(context, onAdd, onRemove, isFirst = false, data_restore=null) {
        super({classes:['row','m-1', ROW_EVENT_CLASS]});
        this.context = context;

        const self = this;
        this.logic_operator = null;

        const col_logic = new Div({classes:['col-2']}).attachTo(this);
        if (!isFirst)
            this.logic_operator = new LogicalOpSelector(context).attachTo(col_logic);

        const col_fields = new Div({classes:['col-6']}).attachTo(this);
        this.field_selector = new EAElementSelector(context, null, EVENTS_ELEMENTS_ALLOWED).attachTo(col_fields);

        const col_events = new Div({classes:['col-2']}).attachTo(this);
        this.events_selector = new EventsSelector(context).attachTo(col_events);

        const col_ops = new Div({classes:['col-2','align-middle','text-center']}).attachTo(this);
        this.delete_event = new ButtonAndAwesomeIcon('','fa fa-trash', {classes:['btn','btn-danger','mr-1']}).attachTo(col_ops);
        this.add_event = new ButtonAndAwesomeIcon('','fa fa-plus', {classes:['btn','btn-primary']}).attachTo(col_ops);

        this.delete_event.dom.addEventListener('click', function (e) {
            onRemove(self);
            self.context.signals.onChange.dispatch();
            if ($(self.dom).parent().find('.' + ROW_EVENT_CLASS).length == 1) {
                context.signals.onEAStatusChanged.dispatch(self, false);
            } else {
                self.field_selector.detach();
                self.events_selector.detach();
                context.signals.onEAStatusChanged.dispatch(self);
            }
            self.detach();            
        });

        this.add_event.dom.addEventListener('click', function (e) {
            const row = e.target.parentNode.parentNode;
            const anchor = row.nextElementSibling;
            const parent = self.dom.parentNode;
            const new_row = new EventRow(self.context, onAdd, onRemove, false);
            onAdd(new_row);
            if (anchor)
                parent.insertBefore(new_row.dom, anchor);
            else
                new_row.attachTo(parent);
            context.signals.onEAStatusChanged.dispatch(self);
        });

        if (data_restore) this.restore(data_restore);
        context.signals.onChange.dispatch();
    }

    /**
     * Prepares the data to be saved.
     * @returns An object containing all the necessary data to restore this row.
     */       
    save() {
        return {
            logic: this.logic_operator?this.logic_operator.getValue():null,
            event: this.events_selector.getValue(),
            field: this.field_selector.getValue(),
        }
    }

    /**
     * Restores the row.
     * @param {object} data Data to be restored.
     */      
    restore(data) {
        if (data.logic) this.logic_operator.setValue(data.logic);
        this.events_selector.setValue(data.event);
        this.field_selector.setValue(data.field).checkStatus();
    }

    /**
     * Cleanups.
     */
    clear() {
        this.field_selector.clear();
    }
}
