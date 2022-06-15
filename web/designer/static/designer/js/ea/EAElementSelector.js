
import { Select } from '/static/js/ui/BuildingBlocks.js';
import { EAManager } from './EAManager.js';
import { EA_SELECTOR_X } from './constants.js';


/**
 * Field/Section select.
 */
export class EAElementSelector extends Select {

    /**
     * Constructor.
     * @param {Context} context Context.
     * @param {function} selection_callback Called when a selection is made.
     * @param {array} allowed_types Array of strings of allowed types (check ELEMENTS_TYPE in constants.js)
     * @param {array} not_allowed_types Array of strings of not allowed types (check ELEMENTS_TYPE in constants.js)
     */
    constructor(context, selection_callback = null, allowed_types=null, not_allowed_types = null) {//, type='actions') {
        super({classes:['form-control']});

        this.selection_callback = selection_callback;
        this.allowed_types = allowed_types;
        this.not_allowed_types = not_allowed_types;
        const self = this;
        this.stamp = null; 
        
        this.addClass(EA_SELECTOR_X);

        this.refresh();
      
        this.dom.addEventListener('change', function(e) {
            if (self.selection_callback) self.selection_callback(e.target.value);
            self.removeClass('bg-danger');
            self.removeClass('text-white');
            context.signals.onEAStatusChanged.dispatch(self);
            context.signals.onChange.dispatch();
        });

        this.signal_onAnyElementChanged = context.signals.onAnyElementChanged.add(() => this.refresh());  
        this.signal_onElementRemoved = context.signals.onElementRemoved.add((Element_id, type, group_id)=> {
            const a = $(this.dom).find('[data-id=' + Element_id + ']');            
            if (a.length > 0) {
                const currently_selected = this.getValue();
                a.remove(); 
                this.setValue(currently_selected);
            }
        });
        this.signal_onElementRenamed = context.signals.onElementRenamed.add((element, new_name) => {
            const a = $(this.dom).find('[data-id=' + element.dom.id + ']');    
            if (a.length > 0) {
                a.text(`[${element.dom.id}] ${new_name}`);
            }  
        });  


        this.signal_onGroupRemoved = context.signals.onGroupRemoved.add((group_id, group_name) => {
            const a = $(this.dom).find('[data-id=' + group_id + ']');            
            if (a.length > 0) {
                const currently_selected = this.getValue();
                a.remove(); 
                this.setValue(currently_selected);
            }            
        }); 

        // if the element is in the list and it exists, display it
        this.signal_onRepeatableRemoved = context.signals.onRepeatableRemoved.add((element_id) => {
            const element = $(this.dom).find("[data-id='" + element_id + "']");
            if (element.length > 0) {
                element.attr('data-repeatable', 'false');
                this.filter();
            }
        });
    }

    /**
     * Clear the select.
     */
    clear() {
        this.signal_onAnyElementChanged.detach();
        this.signal_onElementRemoved.detach();
        this.signal_onRepeatableRemoved.detach();
        this.signal_onGroupRemoved.detach();
        this.signal_onElementRenamed.detach();
    }


    /**
     * Recreates the list.
     * @returns 
     */
    refresh() {
        if (!EAManager.field_options) return;        

        // only recreate if there was some change
        if (this.stamp === EAManager.field_options.stamp) return;
        this.stamp = EAManager.field_options.stamp;    
           
        const currently_selected = this.getValue();

        $(this.dom).empty();

        const options = EAManager.field_options.dom.childNodes;
        for (let i=0; i<options.length; i++) {
            this.dom.appendChild(options[i].cloneNode(true));            
        }
        this.filter(currently_selected);
    }

    /**
     * Hides or shows options according to their type and nature.
     * @param {string} currently_selected Currently selected option.
     */
    filter(currently_selected) {
        // filter: hide all elements that are not allowed
        if (this.allowed_types && this.allowed_types[0] !== 'ALL' ) {
            this.dom.childNodes.forEach((child) => {
                child.childNodes.forEach((grandchild) => {
                    if (this.allowed_types.includes(grandchild.dataset.type)) {
                        grandchild.style.display = 'block';
                    } else {
                        grandchild.style.display = 'none';
                    }
                });
            });
        } else if (this.not_allowed_types && this.not_allowed_types[0] !== 'NONE' ) {
            this.dom.childNodes.forEach((child) => {
                child.childNodes.forEach((grandchild) => {
                    if (this.not_allowed_types.includes(grandchild.dataset.type)) {
                        grandchild.style.display = 'none';
                    } else {
                        grandchild.style.display = 'block';
                    }
                });
            });
        }
        // just filter the repeatables
        this.dom.childNodes.forEach((child) => {
            child.childNodes.forEach((grandchild) => {
                if (grandchild.dataset.repeatable === 'true') {
                    grandchild.style.display = 'none';
                }
            });
        });
        
        this.setValue(currently_selected);
        this.checkStatus();
    }
}
