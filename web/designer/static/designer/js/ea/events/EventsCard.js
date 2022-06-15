

import { Card } from '../../ui/Card.js';
import { Div, Text, ButtonAndAwesomeIcon } from '/static/js/ui/BuildingBlocks.js';
import { EventRow } from './EventRow.js';
import { Translator } from '/static/js/Translator.js';


/**
 * Events Card.
 */
export class EventsCard extends Card {
    
    /**
     * Constructor.
     * @param {Context} context Context.
     * @param {string} id EA ID
     * @param {Object} data_restore Object containing all the data required to restore this card.
     */
    constructor(context, id, data_restore) {
        super(id,Translator.translate('Events'), 'bg-light','text-dark');

        this.context = context;
        this.rows = [];
        this.data_restore = data_restore;

        const add_btn = new ButtonAndAwesomeIcon('','fa fa-plus', {classes:['float-right','btn','btn-outline-primary']}).attachTo(this.header);

        // LABELS
        const row = new Div({classes:['row','m-2','text-center']}).attachTo(this);
        new Div({classes:['col-2']}).attachTo(row);
        const col_field_label = new Div({classes:['col-6']}).attachTo(row);
        new Text(Translator.translate("Fields"), {classes:['font-weight-bold']}).attachTo(col_field_label);
        const col_event_label = new Div({classes:['col-2']}).attachTo(row);
        new Text(Translator.translate("Events/Status"), {classes:['font-weight-bold']}).attachTo(col_event_label);
        const col_operation_label = new Div({classes:['col-2']}).attachTo(row);
        new Text("Ops.", {classes:['font-weight-bold']}).attachTo(col_operation_label);

        // initial row
        this.rows.push(new EventRow(this.context, this.onAddRow, this.onRemoveRow, true, data_restore?data_restore.events[0]:null).attachTo(this));

        if (data_restore && data_restore.events) this.restore(data_restore.events);

        add_btn.dom.addEventListener('click',() => {
            this.rows.push(new EventRow(this.context, this.onAddRow, this.onRemoveRow, this.rows.length>0?false:true).attachTo(this));
            context.signals.onEAStatusChanged.dispatch(this);
        })
    }

    /**
     * When an event row is created, add it to the collection.
     * @param {EventRow} row EventRow to be saved.
     */
    onAddRow = (row) =>  {
        this.rows.push(row);
    }

    /**
     * When an event row is removed, remove it from the collection.
     * @param {EventRow} row EventRow to be removed.
     */
    onRemoveRow = (row) => {
        row.clear();
        this.rows.splice(this.rows.indexOf(row), 1)
    }

    /**
     * Cleanups.
     */
    clear() {
        /*
        this.rows.forEach(row => row.dom.parentNode.removeChild(row.dom));
        this.rows = [];
        */
        this.rows.forEach(row => {
            row.clear();
        });
    }

    /**
     * Prepares the data to be saved.
     * @returns An object containing all the necessary data to restore this card.
     */    
    save() {
        const data = [];
        this.rows.forEach((row) => {
            data.push(row.save());
        })
        return data;
    }

    /**
     * Restores the card.
     * @param {object} data Data to be restored.
     */    
    restore(data) {
        data.forEach((row, index) => {
            if (index != 0) {
                const ea = new EventRow(this.context, this.onAddRow, this.onRemoveRow, false, row).attachTo(this);
                this.rows.push(ea);
            }
        })
    }
}
