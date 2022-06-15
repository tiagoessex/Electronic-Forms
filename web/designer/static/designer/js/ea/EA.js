
import { EA_CLASS, EA_SELECTOR_X, EA_INPUT_X } from './constants.js';
import { CollapsibleCard } from '../ui/CollapsibleCard.js';
import { ButtonAndAwesomeIcon } from '/static/js/ui/BuildingBlocks.js';


/**
 * Base E/A class.
 */
export class EA extends CollapsibleCard {    

    /**
     * Constructor.
     * @param {Context} context Context.
     * @param {string} id EA ID
     * @param {string} name EA Name
     */
    constructor(context, id, name = null) {
        super(id, EA_CLASS);
        this.context = context;
        this.color_class = 'bg-dark';
        const self = this;

        this.clone_btn = new ButtonAndAwesomeIcon('','fa fa-copy', {classes: ['float-right','btn','btn-success','mr-1']});
        this.header.dom.insertBefore(this.clone_btn.dom, this.collapse_btn.dom);
        
        if (name) this.setTitle(name + "   [" + id + "]");

        this.events = null;
        this.actions = null;

        // Remove this EA
        this.close_btn.dom.addEventListener('click', function(e) {
            self.removeEA();            
        });

        this.clone_btn.dom.addEventListener('click', function(e) {
            context.signals.onEACloned.dispatch(id);     
        });
        
        this.signal_onEAStatusChanged = context.signals.onEAStatusChanged.add((who=null, state=null) => {            
            // get the EA from where the signal originated
            if (who) {
                const parent = $(who.dom).parent().closest('.' + EA_CLASS);
                if (parent.get(0) === self.dom) {
                    if (state !== null) {
                        self.setState(state);
                    } else {
                        self.checkStatus();
                    } 
                }                
            } else if (!who) {
                self.checkStatus();
            }
        })
    }

    /**
     * Cleanups.
     */
    clear() {
        if (this.events) this.events.clear();
        if (this.actions) this.actions.clear();
        this.signal_onEAStatusChanged.detach();
    }

    /**
     * Removes and clears this EA.
     */
     removeEA() {
        const id = this.id;
        this.clear();
        this.detach();
        this.context.signals.onEARemoved.dispatch(id);
    }
    

    /**
     * Creates an object with the data to be saved.
     * @returns An object containing all the necessary data to restore this E/A.
     */
    save() {
        const data = {};
        if (this.events) data['events'] = this.events.save();
        if (this.actions) data['actions'] = this.actions.save();
        return data;
    }


    /**
     * Checks the status of the EA, by checcking if all required fields have
     * a value or a selection.
     */
    checkStatus() {
        let valid = true;
        $(this.dom).find('.' + EA_SELECTOR_X).each(function(index) {            
            if ($(this).val() === '' || !$(this).val()) {
                valid = false;
                return false;
            }
        });
        $(this.dom).find('.' + EA_INPUT_X).each(function(index) {            
            if ($(this).val() === '' || !$(this).val()) {
                valid = false;
                return false;
            }
        });         

        this.setState(valid);
    }

    /**
     * Changes the header color of the EA, according to its status.
     * @param {boolean} valid If true then EA is valid, else is invalid.
     */
    setState(valid = true) {
        if (valid) {
            $(this.header.dom).removeClass('is-empty');
            $(this.header.dom).addClass(this.color_class);
        } else {
            $(this.header.dom).removeClass(this.color_class);
            $(this.header.dom).addClass('is-empty');
        }
    }
}
