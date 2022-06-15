/**
 * TODO:
 * 		- CACHE REFS TO AVOID SO MANY GETELEMENTBYID CALLS (check performance before)
 */
import { Section } from './Section.js';
import { ELEMENTS_TYPE } from '../elements/constants.js';
import { PROPERTIES_ID } from '../constants/constants.js';
import {
	DEFAULT_SECTION_ID,
	PRE_TABS_ID,
	PRE_CONTENT_ID,
	SECTION_ITEM_CLASS,
	PRE_SECTION_ID,
	SECTION_LINK_CLASS,
	DEFAULT_ITEM_ID
} from './constants.js';
import { DEFAULT_GROUP_NAME, DEFAULT_GROUP_ID } from '../groups/constants.js';
import { swapNodes } from '/static/js/jshtml.js';
import { Translator } from '/static/js/Translator.js';




/**
 * Sections factory and manager.
 */
export class SectionsManager {
	static counter = 0;	
	/**
	 * Constructor.
	 * @param {Context} context Context.
	 */
    constructor(context) {
        this.context = context;
		this.context.sections_manager = this;
		
		this.sections = {};

		// to track groups
		this.groups = {};	// group_id: {name, sectionClass}
		


		// -------------------------
		// --- SET THE LISTENERS ---
		// -------------------------
		context.signals.onElementRemoved.add(this.removeElement,this,5);     // remove it from section, before removing it from page
		context.signals.onElementCreated.add(this.elementCreated,this);
		context.signals.onElementSectionChanged.add(this.changeElementSection,this);
		context.signals.onElementRenamed.add(this.changeElementName,this);
		
		context.signals.onGroupCreated.add(this.groupCreated,this);
		context.signals.onGroupRemoved.add(this.groupRemoved,this);
		context.signals.onGroupRenamed.add(this.groupRenamed,this);
		context.signals.onElementAdded2Group.add(this.elementAdded2Group,this);
		context.signals.onElementRemovedFromGroup.add(this.elementRemovedFromGroup,this);
		
		context.signals.onSectionNameChanged.add(this.changeSectionName,this);
		
		// this manager is both a dispatcher and a listener - onSectionItemMoved
		context.signals.onSectionItemMoved.add(this.sectionItemMoved,this);		
		

        this.context.signals.onStuffDone.dispatch('SectionsManager ready!');
    }

    clear() {
		this.removeAllSections();
    }


    /**
     * == Listener ==
     * An Element was removed from a Page:
     *      - remove its corresponding Item in the respective Section.
	 * If it's either a checkbox or a radio, then special treatement.
     * @param {string} element_id Id of the removed element.
	 * @param {object} type Type of the removed object.
     */
	 removeElement(element_id, type) {
		if (!type.availability.list) return;

		if (type === ELEMENTS_TYPE.CHECKBOX || type === ELEMENTS_TYPE.RADIO) {
			this.gpElementRemoved(element_id);
		} else {
	        this.removeItem(element_id);
		}
    }

    /**
     * == Listener ==
     * An Element was created and added to a Page:
     *      - create a corresponding Item in the respective Section.
	 * If it's either a checkbox or a radio, then special treatement.
     * @param {Element} element Element created.
     * @param {string} page Page ID.
     * @param {string} section Section ID.
     */
    elementCreated (element, page, section) {
		// only add if this element type are to be viewed in the list view
		if (!element.type.availability.list) return;

		if (element.type === ELEMENTS_TYPE.CHECKBOX || element.type === ELEMENTS_TYPE.RADIO) {
			this.gpElementCreated(element, section);
		} else {
			const id = element['props'][PROPERTIES_ID.IDPROPERTY];
			//const name = element['props'][PROPERTIES_ID.NAMEPROPERTY]!=''?element['props'][PROPERTIES_ID.NAMEPROPERTY]:element['props'][PROPERTIES_ID.IDPROPERTY];
			const _label = element['props'][PROPERTIES_ID.LABELPROPERTY];
			const _name = element['props'][PROPERTIES_ID.NAMEPROPERTY];
			const name = _name!==''?_name:(_label!==''?_label:id);
	        this.addItem(id, name, section);
		}
    }

    /**
     * == Listener ==
     * The Section of an Element was changed from the properties tab:
     *      - change the Section of its corresponding Item.
     * @param {string} element_id Element ID.
     * @param {string} section Section ID.
     */
    changeElementSection (element_id, section) {
		console.log(element_id);
        this.moveItem(element_id, section);
    }

    /**
     * == Listener ==
     * The name of an Element was changed:
     *      - change the name of its corresponding Item.
     * @param {string} element Element.
     * @param {string} new_name New name.
     */
    changeElementName (element, new_name) {
		this.changeItemName(element.dom.id, new_name!=''?new_name:element.dom.id);
    }

	/**
	 * == Listener ==
	 * Changes the name of a Section.
	 * @param {string} section_id ID of the Section to change the name.
	 * @param {string} new_name New name.
	 */
	 changeSectionName = (section_id, new_name) => {
		const section = this.sections[section_id];
		section.name = new_name;
	}


	/**
	 * Adds a new section.
	 * @param {string} name Name of the new section.
	 * @param {bool} disabled If true, the section tab will be sortable.
	 * @param {bool} active If true, the section will be active.
	 * @param {string} pre_defined_id ID of the the new section (used when loading)
	 * @returns A reference to the new section.
	 */
    addNewSection = (name, disabled=false, active=false, pre_defined_id=null) => {
		let id = null;
		if (pre_defined_id) {
			id = pre_defined_id;			
			// restore the counter
			if (pre_defined_id.split('-')[1] >= SectionsManager.counter) {
				SectionsManager.counter = parseInt(pre_defined_id.split('-')[1]);
			}
		} else {
			id = PRE_SECTION_ID + SectionsManager.counter;	
		}
        const section = new Section(this.context, id, name, disabled, active);
		this.sections[id] = {name:name, section:section};
        // --------------------
        // add new section to the sections list
        this.context.signals.onSectionCreated.dispatch(id, name);
        // --------------------
		SectionsManager.counter++;

		this.context.properties.n_sections++;

		return section;
    }

	/**
	 * Removes a given section. All item inside that section will be 
	 * moved to the default section.
	 * @param {string} section_id ID of the section to be removed. 
	 */
    removeSection(section_id) {
		if (section_id === DEFAULT_SECTION_ID) return;
		// move all items from selected section to default section
		this.moveItems(section_id, DEFAULT_SECTION_ID);
		// remove section from the tab and the contents
		document.getElementById(PRE_CONTENT_ID + section_id).remove();
		document.getElementById(PRE_TABS_ID + section_id).remove();		
		// select and show the default section
		$('#' + PRE_TABS_ID + DEFAULT_SECTION_ID).tab('show');	
		delete this.sections[section_id];
        // -----------------------
        // remove selected_section from sections' list
        this.context.signals.onSectionRemoved.dispatch(section_id);	
		this.context.properties.n_sections--;				
		// -----------------------			
    }

	/**
	 * Moves all items from one section to another.
	 * @param {string} selected_section ID of the origin section.
	 * @param {string} to ID of the destination section.
	 */
    moveItems(selected_section, to) {
		// get all items in the selected section
        const nodes = document.getElementById(selected_section).querySelectorAll('div');
        const destination = document.getElementById(to);
		//const destination = this.sections[to].section.items_container.dom;
        for (let i = 0; i < nodes.length; i++) {
            nodes[i].parentNode.removeChild(nodes[i]);
            destination.appendChild(nodes[i]);
            // -----------------------
			// change the section's id in the element props
			const element_id = nodes[i].dataset.id;
			this.context.signals.onSectionItemMoved.dispatch(element_id, to);
			// -----------------------     
        }
    }

	/**
	 * Moves an item to a different section.
	 * @param {string} element_id ID of the element to move.
	 * @param {string} destination_section_id ID of the destination section.	 * 
	 */
    moveItem(element_id, destination_section_id) {
		const item = document.getElementById(SECTION_ITEM_CLASS + '-' + element_id);
		const destination_section = document.getElementById(destination_section_id);
		
		if (item && destination_section && item.parentNode !== destination_section) {
			item.parentNode.removeChild(item);
			destination_section.appendChild(item);
            // -----------------------
			this.context.signals.onSectionItemMoved.dispatch(element_id,destination_section_id);
			// -----------------------

		} else {
			console.warn("[SectionsManager->SectionsManager::moveItem] Unable to move item [" + element_id + "] to [" + destination_section_id + "]!");
		}
    }

	/**
	 * Removes an item from its section's.
	 * @param {string} element_id Element ID.
	 */
	removeItem(element_id) {
		const item = document.getElementById(SECTION_ITEM_CLASS + '-' + element_id);
		if (item) {
			item.parentNode.removeChild(item);	
		}
	}

	/**
	 * Adds a SectionItem to a given Section.
	 * @param {string} id ID for the Item.
	 * @param {string} name Name for the Item.
	 * @param {string} section_id ID of the Section.
	 */
	addItem(id, name, section_id, is_group=false) {
		this.sections[section_id].section.addItem(id, name, is_group);
	}


	/**
	 * Change the name of an Item (the ID remains the same).
	 * @param {string} item_id Id of the Item.
	 * @param {string} new_name New name.
	 */
	changeItemName(item_id, new_name) {
		const item = document.getElementById(SECTION_ITEM_CLASS + '-' + item_id);
		if (item) {
			item.textContent = new_name;
		}        
	}

	/**
	 * Remove all sections.
	 */
	removeAllSections() {
		for ( const key in this.sections) {
			if (key !== 'section-0') {
				this.removeSection(key);
			}
		}
	}

	/**
	 * Get the sections in order.
	 * @returns An array of objects {id, name}, representing the sections in order.
	 */
	getOrderedSections() {
		const ordered_sections = document.getElementsByClassName(SECTION_LINK_CLASS);
		let temp = [];
		for (let i=0; i < ordered_sections.length; i++) {
			const id = ordered_sections[i].dataset.id;
			const name = this.sections[id].name;
			temp.push({id:id, name:name});
		}
		return temp;
	}

	/**
	 * Get the elements in a section in order.
	 * @returns Array with the elements in order.
	 */
	getOrderedItems() {
		let temp = {};
		for (let key in this.sections) {
			const items = this.sections[key].section.items_container.dom.childNodes;
			let items_id = [];
			for (let i=0; i<items.length; i++) {
				items_id.push(items[i].dataset.id);
			}
			temp[key] = items_id;
		}
		return temp;		
	}	


	// --------------------------------------------------------
	// SECTION DEDICATED ONLY TO GROUPS
	// 	All checkboxes and radios elements must
	//	belong to a user defined group. 
	//	If some of them don't belong to a user defined group
	//	then they will be considered as members of 
	//  the default group: none.
	//	ATT: both radios and checkboxes without a group are represented 
	//	     in the same default group item (DGI).
	// ---------------------------------------------------------

	/**
	 * == Listener ==
	 * An element was created, so create a DGI (none) iff:
	 * 		- checkbox/radio.
	 * 		- if section === default section => new element, and not a copy/clone
	 * 		- if the element's group is default
	 * 		- if there isn't alredy a DGI then ignore
	 * @param {Element} element Element.
	 * @param {string} section Section ID.
	 * @returns Null. 
	 */
	gpElementCreated(element, section) {
		if (section !== DEFAULT_SECTION_ID) return null;
		if (element.props[PROPERTIES_ID.GROUPPROPERTY] !== DEFAULT_GROUP_ID) return null;
		if (document.getElementById(DEFAULT_ITEM_ID)) return null;
		//this.sections[DEFAULT_SECTION_ID].section.addItem(DEFAULT_GROUP_ID, '-- CHECKBOXES/RADIOS WITH NO GROUP --', true);
		this.sections[DEFAULT_SECTION_ID].section.addItem(DEFAULT_GROUP_ID, '<span class="badge badge-danger p-2">' + Translator.translate("CHECKBOXES/RADIOS WITH NO GROUP") + '</span>', true);
		this.groups[DEFAULT_GROUP_ID] = {name: DEFAULT_GROUP_NAME, section: DEFAULT_SECTION_ID};
		return null;
	}
	/**
	 * == Listener ==
	 * An element was deleted.
	 * If there are no more checkbox/radio elements, then remove the DGI.
	 * Note: (2) because an element is only actually removed from the collection after the signal broadcast.
	 * @param {Element} element Element.
	 * @param {string} section Section ID.
	 */
	gpElementRemoved(element, section) {
		if (!this.context.elements_manager.areCheckRadioInGroup(DEFAULT_GROUP_ID, 1)) {
			this.removeItem(DEFAULT_GROUP_ID);
			delete this.groups[DEFAULT_GROUP_ID];
		}
	}
	/**
	 * == Listener ==
	 * A group was created.
	 * Consider this group as an element and added it to the default section - DGI
	 * @param {string} group_id Group ID.
	 * @param {string} group_name Group name.
	 */
	groupCreated(group_id, group_name) {
		this.sections[DEFAULT_SECTION_ID].section.addItem(group_id, group_name, true);
		this.groups[group_id] = {name: group_name, section: DEFAULT_SECTION_ID};
	}
	/**
	 * == Listener ==
	 * A group was removed.
	 * @param {string} group_id Group ID.
	 */
	groupRemoved(group_id) {
		this.removeItem(group_id);
		delete this.groups[group_id];
	}
	/**
	 * == Listener ==
	 * A group was renamed.
	 * @param {string} group_id Group ID.
	 * @param {string} new_name New group name.
	 */
	groupRenamed(group_id, new_name) {
		this.groups[group_id].name = new_name;
		this.changeItemName(group_id, new_name!=''?new_name:group_id);
	}
	/**
	 * == Listener ==
	 * A group item was moved.
	 * @param {string} element_id Element ID.
	 * @param {string} target_id Section destination ID.
	 * @returns
	 */
	sectionItemMoved(element_id, target_id) {
		if (!this.groups.hasOwnProperty(element_id)) return;
		this.groups[element_id].section = target_id;
	}
	/**
	 * == Listener ==
	 * An element was added to a group.
	 * If there are no more elements without a group, then remove the DGI.
	 * Note: (1) because the signal is broadcast after the insertion of the element.
	 * @param {string} element_id Element ID.
	 * @param {string} group_id Group ID.
	 */
	elementAdded2Group(element_id, group_id) {
		if (!this.context.elements_manager.areCheckRadioInGroup(DEFAULT_GROUP_ID, 1)) {
			this.removeItem(DEFAULT_GROUP_ID);
			delete this.groups[DEFAULT_GROUP_ID];
		}
	}
	/**
	 * == Listener ==
	 * An element was removed from a group.
	 * If after the removal there are elements without a group, then create the DGI.
	 * If after the removal there are no more elements without a group, then remove the DGI.
	 * @param {string} element_id Element ID.
	 */
	elementRemovedFromGroup(element_id) {
		if (!this.groups.hasOwnProperty(DEFAULT_GROUP_ID)) {
			//this.sections[DEFAULT_SECTION_ID].section.addItem(DEFAULT_GROUP_ID, '-- CHECKBOXES/RADIOS WITH NO GROUP --', true);
			this.sections[DEFAULT_SECTION_ID].section.addItem(DEFAULT_GROUP_ID, '<span class="badge badge-danger p-2">' + Translator.translate("CHECKBOXES/RADIOS WITH NO GROUP") + '</span>', true);
			this.groups[DEFAULT_GROUP_ID] = {name: DEFAULT_GROUP_NAME, section: DEFAULT_SECTION_ID};
		} else if (!this.context.elements_manager.areCheckRadioInGroup(DEFAULT_GROUP_ID, 1)) {
			this.removeItem(DEFAULT_GROUP_ID);
			delete this.groups[DEFAULT_GROUP_ID];
		}
	}

	// --------------------------------------------------------
	// SAVE / RESTORE
	// ---------------------------------------------------------

	/**
	 * Get all data required to recreate the sections and their order.
	 * The elements are put it in the respective section as they are restored.
	 * @returns Object containing all data required to recreate the sections and their order.
	 */
	save() {
		return [this.getOrderedSections(), this.getOrderedItems(), this.groups];
	}

	restoreSections(data) {
		for (const key in data.sections) {
            if (data.sections[key].id !==DEFAULT_SECTION_ID)
                this.addNewSection(data.sections[key].name, false, false, data.sections[key].id);
        }
	}

	/**
	 * Restores the groups.
	 * @param {object} data Object containing all the necessary data the recreate the groups.
	 */
	restoreGroups(data) {
		if (data.hasOwnProperty('sections_groups')) {
            this.groups = data['sections_groups'];
            for (const key in data.sections_groups) {
                // no need to move if the group is still in the default section
                if (data.sections_groups[key].section !== DEFAULT_SECTION_ID)
                    this.moveItem(key, data.sections_groups[key].section);
            }
        }
	}

	/**
	 * Restores the order of the sections and the items.
	 * @param {object} data Object containing all the necessary data the restore the order.
	 */	
	restoreOrder(data) {
		if (data.hasOwnProperty('sections_items')) {
            for (const key in data.sections) {
                const section_id = data.sections[key].id;
                const items = this.sections[section_id].section.items_container.dom.childNodes;
                const order = data.sections_items[section_id];
                for (let i=0; i<items.length; i++) {
                    if (items[i].getAttribute('data-id') != order[i]) {
                        let temp = items[i].parentNode.querySelector('[data-id="' + order[i] + '"]');
                        swapNodes(items[i], temp);
                    }
                }
            }
        }
	}

}







