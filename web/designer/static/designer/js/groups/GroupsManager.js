
import { PROPERTIES_ID } from '../constants/constants.js';
import { ELEMENTS_TYPE } from '../elements/constants.js';
import { 
    PRE_GROUP_ID, 
    DEFAULT_PRE_GROUP_NAME, 
    DEFAULT_GROUP_ID, 
    GROUP_TYPE} from './constants.js';    
import { Group } from './Group.js';
import { Translator } from '/static/js/Translator.js';

const GROUPS_AREA = document.getElementById('groups-tab');


/**
 * Groups factory and manager.
 */
export class GroupsManager {
    static counter = 0;
    static field_options = null;	

    /**
     * Constructor.
     * @param {Context} context Context
     */
    constructor(context) {
        this.context = context;

        context.groups_manager = this;
		
		this.groups = {};	// groups[id] = groupClass
        this.lock = false;  // if true => form is loading => no need to populate field_sections

        // -------------------------
        // --- SET THE LISTENERS ---
        // -------------------------
        
        context.signals.onElementGroupChanged.add(this.elementGroupChanged,this);
        
        context.signals.onElementCreated.add((element) => {
            if (!element.type.availability.groups) return;
            this.createList();
        });
        context.signals.onElementRemoved.add((Element_id, type, group_id) => {
            if (!type.availability.groups) return;
            this.createList(false);
        });
        context.signals.onElementLabelChanged.add((element, new_label) => {
            if (!element.type.availability.groups) return;
            this.createList(false);
        });
        context.signals.onElementAdded2Group.add(() => {
            this.createList(false);
        });
        context.signals.onElementRemovedFromGroup.add(() => {
            this.createList(false);
        });
        context.signals.onGroupRemoved.add(this.groupRemoved,this);

        context.signals.onLoadStarted.add(() => {
            this.lock = true;
        }); 
        context.signals.onElementsLoadEnded.add(() => {
            this.lock = false; 
            this.createList()
        }, this); 

        context.signals.onLockGroupsList.add(() => {this.lock = true;}); 
        context.signals.onUnlockGroupsList.add(() => {this.lock = false;this.createList(false)}); 

        // ---------------------
        // --- MANAGER READY ---
        // ---------------------
        this.context.signals.onStuffDone.dispatch('GroupsManager ready!');

    }


    /**
     * Resets the manager.
     */
    clear() {
        GroupsManager.counter = 0;
    }

    /**
     * Creates a new group.
     * @param {string} name Pre-specified some name (optional). 
     * @param {string} pre_defined_id Pre-specified id (optional).
     * @param {Array} elements Array of elements [{id,label}, ...] to add to the newly created group (optional).
     * @returns The newly created group or null if error.
     */
    createGroup(name = null, pre_defined_id=null) {        
        let id = null;
        if (pre_defined_id) {
            id = pre_defined_id;
            // restore the counter
			if (pre_defined_id.split('-')[1] >= GroupsManager.counter) {
				GroupsManager.counter = parseInt(pre_defined_id.split('-')[1]);
			}
            if (!this.isIdAvailable(id)) {
                console.error("[groups->GroupsManager::createGroup] Invalid Group ID!");
                return null;
            }
        } else {
            id = PRE_GROUP_ID + GroupsManager.counter;
        }
        if (!name) {
            name = DEFAULT_PRE_GROUP_NAME + GroupsManager.counter;
        }

        const gp = new Group(this.context, id, name);
        GROUPS_AREA.insertBefore(gp.dom, GROUPS_AREA.firstChild);

        this.groups[id] = gp;

        this.context.signals.onGroupCreated.dispatch(id, name);

        GroupsManager.counter++;

        this.context.properties.n_groups++;
     
        return gp;
    }

    /**
     * Checks if there is a group with a sepcific id.
     * @param {string} id Some id.
     * @returns True if there is no group with a specific id. 
     */
    isIdAvailable(id) {
        if (this.groups.hasOwnProperty(id)) 
            return false
        return true;
    }


    /**
     * Creates the dom list to be cloned and appended to each CRSelector.
     * Only when checkboxes and radios change, is this list created.
     * 
     * @param {boolean} broadcastSignal If true, dispatches signal for components to update their lists.
     */
    createList(broadcastSignal = true) {
        if (this.lock) return;

        // clear and create a stamp - this stamp will be used by the select fields
        // to verify if something has really changed.
        GroupsManager.field_options = null;
        GroupsManager.field_options = {stamp: uuidv4(), dom: document.createElement('div')};        
        const fields = {};
        const elements = this.context.elements_manager.getElements();
        for (let id in elements) {
            if (!elements[id].type.availability.groups) continue;
            //const name = elements[id].props[PROPERTIES_ID.NAMEPROPERTY];
            const label = elements[id].props[PROPERTIES_ID.LABELPROPERTY];
            const type = elements[id].type.name;

            const option = document.createElement('option');
            option.setAttribute('data-type', type);
            option.setAttribute('data-label', label);
            option.setAttribute('data-id', id);            
            //option.setAttribute('data-group', 'true');
            option.setAttribute('value', id);            
            option.innerHTML = '[' + id + '] ' + (label!==''?label:Translator.translate("-- NO LABEL DEFINED YET! --"));

            // already in a group, then hide it
            if (this.context.elements_manager.isInGroup(id)) {
                option.style.display = 'none';
            }

            GroupsManager.field_options.dom.appendChild(option);
        };

        if (broadcastSignal) this.context.signals.onCheckRadioChanged.dispatch();
    }

    /**
     * Removes all groups.
     */
    removeAllGroups() {
        for (const id in this.groups) {
            this.groups[id].remove();
        }
    }

    /**
     * == Listener ==
     * A group was removed.
     * @param {string} group_id Group ID
     */
     groupRemoved (group_id) {
        delete this.groups[group_id];
        this.context.properties.n_groups--;
    }

    /**
     * == Listener ==
     * The group of an Element was changed at the properties tab.
     * @param {Element} element Element.
     * @param {string} section New Group ID.
     */
     elementGroupChanged (element, group_id) {
        const element_id = element.props[PROPERTIES_ID.IDPROPERTY];        
        const label = element.props[PROPERTIES_ID.LABELPROPERTY];
        const type = element.type;
        
        // make sure this element is allowed to be added to the group
        // --- required for multi-selection elements + group change (see PropertyTabActions.js)
        const gp_type = this.groups[group_id].getType();
        if (!((gp_type === GROUP_TYPE.CHECKBOX && type === ELEMENTS_TYPE.CHECKBOX) ||
            (gp_type === GROUP_TYPE.RADIO && type === ELEMENTS_TYPE.RADIO) ||
            (gp_type === GROUP_TYPE.NONE))) {
            return;
        } 

        for (const k in this.groups) {
            if (this.groups[k].elementRemoved(element_id, type)) {
                this.context.signals.onElementRemovedFromGroup.dispatch(element_id);
                break;
            }
        }
        if (group_id !== DEFAULT_GROUP_ID) {
            this.groups[group_id].addElement(element_id, label, type.name);
        } else {

        }
    }    


    /**
     * Saves the data.
     * The elements in each group is identified in their props(GROUPPROPERTY)
     * @returns Object containing all data to recreate the groups.
     */
    save() {
        const data = [];
        for (const gp in this.groups) {            
            data.push({id: gp, name:this.groups[gp].name, database:this.groups[gp].db_field.input.dom.value, required: this.groups[gp].required_check.getValue()});
        }
        return data;
    }

    /**
     * Restores the groups except the elements.
     * The elements are restored by restoreElements.
     * @param {object} data All data required to recreate the groups.
     */
    restore(data) {
        for (const key in data) {            
            const gp = this.createGroup(data[key].name, data[key].id);
            if (data[key].db_field !== undefined)
                gp.db_field.input.dom.value = data[key].database;
                gp.required_check.setValue(data[key].hasOwnProperty('required')?data[key].required:'no');
        }
    }

    /**
     * Adds the elements to the groups.
     */
    restoreElements() {
        const elements = this.context.elements_manager.getElements();
        for (const element_id in elements) {
            if (!elements[element_id].type.availability.groups) continue;
            const group_id = elements[element_id].props[PROPERTIES_ID.GROUPPROPERTY];
            const label = elements[element_id].props[PROPERTIES_ID.LABELPROPERTY];
            const type = elements[element_id].type.name;
            if (group_id !== DEFAULT_GROUP_ID)
                this.groups[group_id].addElement(element_id, label, type, false);
        }
    }

    

    /**
     * Expands all groups cards.
     */    
    expand() {
        for (const k in this.groups) {
            this.groups[k].expand();
        }
    }

    /**
     * Collapses all groups cards.
     */    
    collapse() {
        for (const k in this.groups) {
            this.groups[k].collapse();
        }
    }

}

