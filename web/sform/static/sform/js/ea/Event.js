
/**
 * Event class.
 * Each event is composed by subevents. 
 * Only when the logic expression of subevents is true will the action be exectuted.
 * 
 * ATT: 
 *      EVENT X: TRUE => EXEC ACTION
 *          but NOT:
 *      EVENT X: FALSE => EXEC INVERSE ACTION   ---- NO NO NO ---- YOU WANT INVERSE, THEN CREATE
 *              CRETE A NEW EVENT FOR THAT
 */

import { EVENTS } from '/static/designer/js/ea/constants.js';


export class Event {
    /**
     * Constructor.
     * @param {Context} context Context.
     * @param {string} id Element/field ID.
     * @param {object} data Events data.
     * @param {function} action Callback function to execute when event is triggered.
     */
    constructor(context, id, data, action=null) {
        this.tracker = []; //[id, logic, event, status]
        this.action = action;
        
        data.forEach(ev => {
            this.tracker.push([ev.field, ev.logic, ev.event, false]);
            
            switch (ev.event) {                
                case EVENTS.onChanged:
                    context.signals.onEventChanged.add(this.setStatus);
                    break;                    
                case EVENTS.onCleared:
                    context.signals.onEventCleared.add(this.setStatus);
                    break;                
                case EVENTS.onFilled:
                    context.signals.onEventFilled.add(this.setStatus);
                    break;
                case EVENTS.onFormOpened: 
                    context.signals.onEventFormOpened.add(this.setStatus);
                    break;                
                case EVENTS.onSelected:
                    context.signals.onEventSelected.add(this.setStatus);
                    break;
                case EVENTS.onUnSelected: 
                    context.signals.onEventUnselected.add(this.setStatus);
                    break;                                                                                
                default:
                    console.error("[Event::ctor] - No event [" + ev.event + "]");
            }
        });
        context.signals.onStuffDone.dispatch("new event [" + id + "] ready!");
    }


    /**
     * === LISTENER ===
     * Set to true the subevent connected to element ID.
     * @param {string} element_id Element/field ID.
     * @param {string} event Event name.
     */
    setStatus = (element_id, event, operation = true) => {
        this.tracker.forEach(item => {
            if (item[0] === element_id && item[2] === event) {
                item[3] = operation;
                return;
            }            
        })
        this.check();
    }

    /**
     * Check the logical expression created by the subevents.
     * @returns True if action is executed, False otherwise.
     */
    check() {
        let expression = '((((';
        this.tracker.forEach(subevent => {
            expression += subevent[1]?subevent[1]:'';
            expression += ' ' + subevent[3] + ' ';
        })
        expression += '))))';
        expression = expression.replaceAll("and", ")) && ((");
        expression = expression.replaceAll("or", "))) || (((");        
        const result = looseJsonParse(expression);
        if (result) {
            this.action();
            this.reset();
        }
        return result
    }
    
    /**
     * Resets the event: all subevents set to false.
     */
    reset() {
        for (let i=0; i<this.tracker.length; i++) {
            this.tracker[i][3] = false;
        }
    }
    
}

/**
 * Evaluates an expression.
 * Same as eval, but without the security risk.
 * @param {string} obj String to evaluate
 * @returns The result of the evaluation.
 */
function looseJsonParse(obj){
    return Function('return (' + obj + ')')();
}


