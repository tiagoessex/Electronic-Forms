/**
 *  NOTES:
 *      - in order to prevent adding the same event to the same element multiple times,
 *          events are removed before adding then ... to lazy to implement a better solution
 * 
 * 
 *  MAYBE TODO:
 *      - use an object to keep track of whether or not a specific event was already added to an element, or
 *      - use a framework like mootools (https://mootools.net/) to do all the work
 * 
 */

import { Event } from './Event.js';
import { ID_FORMVIEW_APPEND, ID_LISTVIEW_APPEND } from '../constants.js';
import { ActionsFactory } from './ActionsFactory.js';
import { EVENTS } from '/static/designer/js/ea/constants.js';


/**
 * EA System.
 */
export class EASystem {

    /**
     * Constructor.
     */
    constructor (context) {
        this.context = context;

        this.track = {
            onChanged:[],
            onCleared:[],
            onFilled:[],
            onFormOpened:[],
            onUnSelected:[],
            onSelected:[],
        }

        // remove when in production
        this.signals_onStuffDone = this.context.signals.onStuffDone.add((msg) => console.log("Log message > ", msg));
    }

    /**
     * Sets the events and actions.
     * Each element has 2 event listeners, one for the form view and another for the list view.
     * @param {object} data E/A data.
     */
    setup(data) {
        const ref = this;
        for (let e_a in data) {
            const ea_type =  data[e_a].type; 
            const ea_id = data[e_a].id;
            const events_data = data[e_a].ea.events;
            const actions_data = data[e_a].ea.actions

            const action = new ActionsFactory(this.context, ea_type, ea_id, actions_data)
            new Event(this.context, ea_id, events_data, action.execute);
            
            // setup the events
            events_data.forEach(ev => {
                const form_element = document.getElementById(ev.field + ID_FORMVIEW_APPEND);
                const list_element = document.getElementById(ev.field + ID_LISTVIEW_APPEND);

                switch (ev.event) {
                    case EVENTS.onChanged: 
                        if (this.track.onChanged.includes(ev.field)) return;
                        this._setEvents(form_element, list_element, ev.field, 'change', ref.dispatchChanged, 'value')
                        this.track.onChanged.push(ev.field);                        
                        break;                      
                    case EVENTS.onCleared: 
                        if (this.track.onCleared.includes(ev.field)) return;
                        this._setEvents(form_element, list_element, ev.field, 'change', ref.dispatchCleared, 'value')
                        this.track.onCleared.push(ev.field);
                        break;                    
                    case EVENTS.onFilled:
                        if (this.track.onFilled.includes(ev.field)) return;
                        this._setEvents(form_element, list_element, ev.field, 'change', ref.dispatchFilled, 'value')
                        this.track.onFilled.push(ev.field);
                        break;
                    case EVENTS.onFormOpened: 
                        //if (this.track.onFormOpened.includes(ev.field)) return;
                        // ---- FOR NOW, IT SETS TO TRUE WHENEVER THE FORM OPENS ----
                        this.dispatchFormOpened (ev.field, true);
                        this.track.onFormOpened.push(ev.field);                        
                        break;
                    case EVENTS.onUnSelected: 
                        if (this.track.onUnSelected.includes(ev.field)) return;
                        this._setEvents(form_element, list_element, ev.field, 'change', ref.dispatchUnSelected, 'checked')
                        this.track.onUnSelected.push(ev.field);
                        break;                        
                    case EVENTS.onSelected: 
                        //if (this.track.onSelected.includes(ev.field)) return;
                        this._setEvents(form_element, list_element, ev.field, 'change', ref.dispatchSelected, 'checked')
                        this.track.onSelected.push(ev.field);
                        break;                                                                            
                    default:
                        console.error("[EASystem::process] - No event [" + ev.event + "]");
                }
            });

        }
    }

    _setEvents(form_element, list_element, field, event, callback=null, value) {
        if (form_element) {
            form_element.addEventListener(event, function(e) {
                if (callback) callback(field, e.target[value]);
            })
        }
        if (list_element) {
            list_element.addEventListener(event, function(e) {
                if (callback) callback(field, e.target[value]);
            })
        }
    }


    /**
     * Event listener handler.
     * On any change (applied after accept).
     * @param {string} field Element / Field ID.
     * @param {*} value 
     */
     dispatchChanged = (field, value) => {
        this.context.signals.onEventChanged.dispatch(field , EVENTS.onChanged, true);
    }

    /**
     * Event listener handler.
     * On any change and not empty.
     * @param {string} field Element / Field ID.
     * @param {*} value 
     */
     dispatchFilled = (field, value) => {
        if (value === '') {
            this.context.signals.onEventFilled.dispatch(field , EVENTS.onFilled, false);
        } else {
            this.context.signals.onEventFilled.dispatch(field , EVENTS.onFilled, true);
        }
    }    

    /**
     * Event listener handler.
     * On any change and empty.
     * @param {string} field Element / Field ID.
     * @param {*} value 
     */    
     dispatchCleared = (field, value) => {
        this.context.signals.onEventCleared.dispatch(field , EVENTS.onCleared, value === ''?true:false);
    }


    /**
     * Event listener handler.
     * @param {string} field Element / Field ID.
     * @param {*} value 
     */
    dispatchFormOpened = (field, value) => {
        this.context.signals.onEventFormOpened.dispatch(field , EVENTS.onFormOpened);
    }


    /**
     * Event listener handler.
     * @param {string} field Element / Field ID.
     * @param {*} value 
     */
    dispatchSelected = (field, value) => {
        this.context.signals.onEventSelected.dispatch(field , EVENTS.onSelected, value);
    }

    /**
     * Event listener handler.
     * @param {string} field Element / Field ID.
     * @param {*} value 
     */
     dispatchUnSelected = (field, value) => {
        this.context.signals.onEventUnselected.dispatch(field , EVENTS.onUnSelected, !value);
    }


    /**
     * EA system cleanups.
     */
    clear(cleanEventSignals = true) {        
        this.track = {
            onChanged:[],
            onCleared:[],
            onFilled:[],
            onFormOpened:[],
            onUnSelected:[],
            onSelected:[],
        }

        this.signals_onStuffDone.detach();

        if (cleanEventSignals) {
            // these signals are also cleaned by the context
            this.context.signals.onEventChanged.removeAll();
            this.context.signals.onEventCleared.removeAll();
            this.context.signals.onEventFilled.removeAll();
            this.context.signals.onEventFormOpened.removeAll();
            this.context.signals.onEventSelected.removeAll();
            this.context.signals.onEventUnselected.removeAll();
        }

        return this;
    }

}
