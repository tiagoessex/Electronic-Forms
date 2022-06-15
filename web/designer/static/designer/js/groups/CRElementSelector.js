import { Select } from '/static/js/ui/BuildingBlocks.js';
import { ELEMENTS_TYPE } from '../elements/constants.js';
import { PROPERTIES_ID } from '../constants/constants.js';
import { GroupsManager } from './GroupsManager.js';
import { GROUP_TYPE } from './constants.js';
import { Translator } from '/static/js/Translator.js';


/**
 * Checkboxes / Radio Elements selector.
 */
export class CRElementSelector extends Select {

    /**
     * Construtor.
     * @param {Context} context Context.
     * @param {function} onSelect Function callback to be called when a new option is selected.
     */
    constructor(context, onSelect=null) {
        super({classes:['form-control']});

        this.context = context;
        const self = this;
        this.selector_type = GROUP_TYPE.NONE;
        this.update_filter = false;

        const default_option = document.createElement('option');        
        default_option.setAttribute('disabled', '');
        default_option.setAttribute('selected', '');
        default_option.setAttribute('value', '');
        default_option.innerHTML = '-- No elements --';
        this.dom.appendChild(default_option);        

        this.refresh(true);

        // An element was chosen to be added to the group
        this.dom.addEventListener('change', function(e) {
            const label = (this.options[this.selectedIndex].getAttribute('data-label'));
            const type = (this.options[this.selectedIndex].getAttribute('data-type'));
            if (onSelect) onSelect(e.target.value, label, type);//this.options[this.selectedIndex]);
            self.dom.value = '';
        });

        this.signal_onCheckRadioChanged = context.signals.onCheckRadioChanged.add(this.refresh, this);
        this.signal_onElementAdded2Group = context.signals.onElementAdded2Group.add(this.updateFilter, this);
        this.signal_onElementRemoved = context.signals.onElementRemoved.add(this.elementRemoved, this);
        this.signal_onElementLabelChanged = context.signals.onElementLabelChanged.add(this.elementLabelChanged, this);
        this.signal_onElementRemovedFromGroup = context.signals.onElementRemovedFromGroup.add(this.updateFilter, this);

    }
    
    /**
     * Sets the type of the group.
     * The type is determinated by the first element to be added to it.
     * If NONE => no element in the group => accepts either radios or checkboxes
     * If CHECKBOX => only acccepts checkboxes
     * If RADIO => only acccepts radios
     * @param {GROUP_TYPE} type 
     */
    setSelectorType(type) {
        if (this.selector_type !== type) {
            this.selector_type = type
            this.updateFilter();
        }
    }
    
    /**
     * Shows or hides the options depending on the type of the group.
     * @returns 
     */
    updateFilter() {
        const options = this.getOptions();
        if (options.length === 1) return
        let any_element_visible = false;
        for (let opt, i = 0; opt = options[i]; i++) {
            const id = $(options[i]).attr('data-id');
            if (typeof id === 'undefined') continue;
            const type = $(options[i]).attr('data-type');
            const in_group = this.context.elements_manager.isInGroup(id);
            if (in_group) {
                options[i].style.display = 'none';                
                continue;
            }
            
            if (this.selector_type === GROUP_TYPE.NONE) {
                options[i].style.display = 'block';
                any_element_visible = true;
            } else if (this.selector_type === GROUP_TYPE.CHECKBOX && type === ELEMENTS_TYPE.CHECKBOX.name) {
                options[i].style.display = 'block';
                any_element_visible = true;
            } else if (this.selector_type === GROUP_TYPE.RADIO && type === ELEMENTS_TYPE.RADIO.name) {
                options[i].style.display = 'block';
                any_element_visible = true;
            } else {
                options[i].style.display = 'none';
            }            
        }
        if (!any_element_visible) 
            $(options[0]).text(Translator.translate('-- No elements --'));
        else
            $(options[0]).text(Translator.translate('-- Select elements --'));
    }


    /**
     * == Listener ==
     * 
     * The label of an element changed.
     * 
     * @param {Element} element Element
     * @param {string} new_label New Label
     * @returns 
     */
    elementLabelChanged(element, new_label) {
        if (!element.type.availability.groups) return;
        const element_id = element.props[PROPERTIES_ID.IDPROPERTY];
        const ele = $(this.dom).find(`[data-id='${element_id}']`);
        if (ele.length == 0) return;
        ele.text('[' + element_id + '] ' + (new_label!==''?new_label:Translator.translate("-- NO LABEL DEFINED YET! --")));
        ele.attr('data-label', new_label);
    }

    /**
     * == Listener ==
     * 
     * An element was deleted.
     * 
     * @param {string} element_id Element ID.
     * @param {ELEMENT_TYPE} type ELEMENT_TYPE. Check constants.js.
     */
    elementRemoved(element_id, type) {
        if (!type.availability.groups) return;
        //console.log("removeing > ", element_id, type.name);
        this.removeOption(element_id);
    }


    /**
     * == Listener ==
     * 
     * Recreates the list of elements.
     * 
     * @param {boolean} forced If true, checks the stamp. Else, it clones regardless of its updated status.
     * @returns 
     */
    refresh(forced=false) {        
        if (!GroupsManager.field_options) return;
        
        // only recreate if there was some change
        if (!forced) {
            if (this.stamp === GroupsManager.field_options.stamp) return;
        }
        this.stamp = GroupsManager.field_options.stamp;

        $(this.dom).empty();

        // the default option
        const default_option = document.createElement('option');        
        default_option.setAttribute('disabled', '');
        default_option.setAttribute('selected', '');
        default_option.setAttribute('value', '');
        default_option.innerHTML = GroupsManager.field_options.dom.childNodes.length > 0?Translator.translate('-- Select elements --'):Translator.translate('-- No elements --');
        this.dom.appendChild(default_option);

        // all checkboxes and radios
        const options = GroupsManager.field_options.dom.childNodes;
        let any_element_visible = false;
        for (let i=0; i<options.length; i++) {
            const clone = options[i].cloneNode(true);
            this.dom.appendChild(clone);
            if (clone.style.display !== 'none') any_element_visible = true;
        }
        if (!any_element_visible) 
            default_option.textContent = Translator.translate('-- No elements --');
        else
            default_option.textContent = Translator.translate('-- Select elements --'); 
        
        this.updateFilter();
    }

    /**
     * Cleanups.
     */
    clear() {
        this.signal_onCheckRadioChanged.detach();
        this.signal_onElementAdded2Group.detach();
        this.signal_onElementRemoved.detach();
        this.signal_onElementLabelChanged.detach();
        this.signal_onElementRemovedFromGroup.detach();
    }

    /**
     * Get the options.
     * @returns Array with the options.
     */
    getOptions() {
        return this.dom.options;
    }


    /**
     * Removes an option, specified by its value (element_id), from the list.
     * @param {string} option_value Removes the option with the corresponding value.
     * @returns True if found, False otherwise.
     */
    removeOption(option_value) {
        const ele = $(this.dom).find(`[data-id='${option_value}']`);        
        if (ele.length == 0) return;
        ele.remove();
    }
}
