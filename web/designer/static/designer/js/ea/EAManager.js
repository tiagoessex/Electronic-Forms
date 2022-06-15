
import { 
    EA_TYPE, 
    PRE_EA_ID, 
} from './constants.js';
import { PROPERTIES_ID } from '../constants/constants.js';
import { EASelection } from './EASelection.js';
import { EAVisibility } from './EAVisibility.js';
import { EAStatus } from './EAStatus.js';
import { EATemporal } from './EATemporal.js';
import { EAFormat } from './EAFormat.js';
import { EADBQuery } from './EADBQuery.js';
import { EATableQuery } from './EATableQuery.js';
import { EAAppend } from './EAAppend.js';
import { EARequired } from './EARequired.js';
import { ELEMENTS_TYPE } from '../elements/constants.js';
import { Translator } from '/static/js/Translator.js';

const EA_AREA = document.getElementById('ea-tab');


/**
 * EA factory and manager.
 */
export class EAManager {
    static counter = 0;	
    static field_options = null;
    /**
     * Constructor.
     * @param {Context} context Context
     */
    constructor(context) {
        this.context = context;
        this.eas = {};	// {id:{name, type, eaClass}}
        this.lock = false;  // if true => form is loading / creating multiple from db => no need to populate field_sections
        const self = this;
		

        // -------------------------
        // --- SET THE LISTENERS ---
        // -------------------------

        context.signals.onEARemoved.add(this.eaRemoved, this);

        // any change in the fields/sections? If so, then recreate the select lists
        // instead of tracking, like in sections, here we just recreate the field 
        // selections everytime there's a change --- PERFORMANCE???? quick dev time! so, move on, for now.
        context.signals.onElementRemoved.add((Element_id, type, group_id) => {
            if (!type.availability.ea) return;
            // recreate the list but don't clone it.
            this.createList(false);
            context.signals.onEAStatusChanged.dispatch();
        });
        // recreate the list and clone it.
        context.signals.onElementCreated.add(this.createList, this); 
        context.signals.onElementRenamed.add(() => {self.createList(false)}, this);
        context.signals.onElementSectionChanged.add(this.createList, this); 
        context.signals.onElementLabelChanged.add(this.createList, this);
        context.signals.onSectionCreated.add(this.createList, this); 
        context.signals.onSectionNameChanged.add(this.createList, this);
        context.signals.onSectionRemoved.add(this.createList, this); 
        context.signals.onSectionItemMoved.add(this.createList, this);
        context.signals.onLoadStarted.add(() => {self.lock = true;}); 
        context.signals.onElementsLoadEnded.add(() => {self.lock = false; self.createList()}, this); 
        context.signals.onEACloned.add(this.eaClone, this); 
        context.signals.onRepeatableCreated.add(self.createList, this);
        context.signals.onRepeatableRemoved.add(() => {self.createList(false)}, this);
        context.signals.onGroupCreated.add(self.createList, this); 
        context.signals.onGroupRemoved.add(() => {self.createList(false)}, this); 
        context.signals.onLockEAList.add(() => {self.lock = true;}); 
        context.signals.onUnlockEAList.add(() => {self.lock = false;self.createList();}); 

        // ---------------------
        // --- MANAGER READY ---
        // ---------------------
        this.context.signals.onStuffDone.dispatch('EAManager ready!');
    }


    /**
     * Create a new EA of a specific type.
     * @param {string} type E/A type. Check constants.js. 
     * @param {string} name Pre-specified some name (optional). 
     * @param {string} pre_defined_id Pre-specified id (optional).
     * @param {object} restore_data Object containing all the necessary data to restore the E/A.
     * @returns The newly created E/A or null if error.
     */
     createEA(type, name = null, pre_defined_id=null, restore_data = null) {

        let id = null;
        let ea = null;

        if (pre_defined_id) {
            id = pre_defined_id;
            // restore the counter
			if (pre_defined_id.split('-')[1] >= EAManager.counter) {
				EAManager.counter = parseInt(pre_defined_id.split('-')[1]);
			}
            if (!this.isIdAvailable(id)) {
                console.error("[ea->EAManager::createEA] Invalid EA ID!");
                return null;
            }
        } else {
            id = PRE_EA_ID + EAManager.counter;
        }

        switch (type) {
            case EA_TYPE.SELECTION.name:
                ea = new EASelection(this.context, id, Translator.translate('Selection') + ' #' + EAManager.counter, restore_data);
                break;
            case EA_TYPE.VISIBILITY.name:
                ea = new EAVisibility(this.context, id, Translator.translate('Visibility') + ' #' + EAManager.counter, restore_data);
                break;
            case EA_TYPE.STATUS.name:
                ea = new EAStatus(this.context, id, Translator.translate('Status') + ' #' + EAManager.counter, restore_data);
                break;
            case EA_TYPE.TEMPORAL.name:
                ea = new EATemporal(this.context, id, Translator.translate('Temporal') + ' #' + EAManager.counter, restore_data);
                break;
            case EA_TYPE.FORMAT.name:
                ea = new EAFormat(this.context, id, Translator.translate('Format') + ' #' + EAManager.counter, restore_data);
                break;                
            case EA_TYPE.DBQUERY.name:
                ea = new EADBQuery(this.context, id, Translator.translate('DB Query') + ' #' + EAManager.counter, restore_data);
                break;
            case EA_TYPE.TABLEQUERY.name:
                ea = new EATableQuery(this.context, id, Translator.translate('Table Query') + ' #' + EAManager.counter, restore_data);
                break;                
            case EA_TYPE.APPEND.name:
                ea = new EAAppend(this.context, id, Translator.translate('Append') + ' #' + EAManager.counter, restore_data);
                break;
            case EA_TYPE.REQUIRED.name:
                ea = new EARequired(this.context, id, Translator.translate('Required') + ' #' + EAManager.counter, restore_data);
                break;                
            default:
                console.error("[ea->EAManager::createEA] No type [" + type + "]!");
        }

        if (ea) {
            EA_AREA.insertBefore(ea.dom, EA_AREA.firstChild);
            this.eas[id] = {id:id, type:type, ea:ea};
            EAManager.counter++;
            this.context.signals.onEACreated.dispatch(id, name);
        } else {
            console.error("[ea->EAManager::createEA] Unable to create EA [" + id + "!");
        }
       
        this.context.properties.n_eas++;

        return ea;
    }

    /**
     * Check if there is a ea with a sepcific id.
     * @param {string} id Some id.
     * @returns True if there is no group with a specific id. 
     */
     isIdAvailable(id) {
        if (this.eas.hasOwnProperty(id)) 
            return false
        return true;
    }    


    /**
     * Resets the manager.
     */
    clear() {
        this.removeAllEAs();
        //for (var member in this.eas) delete this.eas[member];
        EAManager.counter = 0;        
    }

    /**
     * Removes all EAs.
     */
    removeAllEAs() {
        for (const k in this.eas) {
            //console.log(k);
            this.eas[k].ea.removeEA();  // it will dispatch a removedEA signal
        }        
    }

    /**
     * == Listener ==
     * An E/A was removed.
     * @param {string} ea_id E/A ID
     */
     eaRemoved (ea_id) {
        delete this.eas[ea_id];
        this.context.properties.n_eas--;
    }


    /**
     * == Listener ==
     * Requests to create an E/A clone
     * @param {string} ea_id E/A ID
     */
     eaClone (ea_id) {
        const ea = this.eas[ea_id];
        const type = ea.type;
        const data = ea.ea.save();
        this.createEA(type, null, null, data);
    }    
    
    /**
     * Expands all EA cards.
     */    
    expand() {
        for (const k in this.eas) {
            this.eas[k].ea.expand();
        }        
    }

    /**
     * Collapses all EA cards.
     */    
    collapse() {
        for (const k in this.eas) {
            this.eas[k].ea.collapse();
        }        
    }

    /**
     * Prepares the data to be saved.
     * @returns An object containing all the necessary data to restore the E/A view.
     */
    save() {
        let data = {};
        
        for (const k in this.eas) {
            data[k] = {
                id: this.eas[k].id,
                type: this.eas[k].type,//.name,
                ea: this.eas[k].ea.save(),
            }            
        }
        return data;
    }

    /**
     * Restores the E/A view.
     * @param {object} data Data to be restored.
     */
    restore(data) {
        //console.log("restore > ", data);
        for (let key in data) {
            this.createEA(EA_TYPE[data[key].type].name, data[key].id, data[key].id, data[key].ea);
        }
    }

    /**
     * Creates the dom options with all the sections and elements divided by sections, which
     * are going to be used by the EAElementSelector.js, by cloning it.
     * This process is resource intensive, so, only executed when really need it:
     * If a form is loading, then wait until it's finished, otherwise, this function, would be
     * executed everytime an element or a section was added during the load. (bad english)
     */
    createList(broadcastSignal = true) {
        if (this.lock) return;

        // clear and create a stamp - this stamp will be used by the select fields
        // to verify if something has really changed.
        EAManager.field_options = null;
        EAManager.field_options = {stamp: uuidv4(), dom: document.createElement('div')};        
        const fields = {};
        const elements = this.context.elements_manager.getElements();
        for (const id in elements) {
            if (!elements[id].type.availability.ea) continue;
            const name = elements[id].props[PROPERTIES_ID.NAMEPROPERTY];
            const label = elements[id].props[PROPERTIES_ID.LABELPROPERTY];
            const section = elements[id].props[PROPERTIES_ID.SECTIONPROPERTY];
            const type = elements[id].type.name;
            const repeatable = elements[id].isRepeatable();
            let field_name = '-- ' + Translator.translate('NO NAME/LABEL/GROUP') + ' --';
            if (name !=='' ) {
                field_name = name
            } else if (label !== '') {
                field_name = label;
            }
            if (!fields.hasOwnProperty(section)) {
                fields[section] = [];
            }
            fields[section].push({id, field_name, type, repeatable });
            //console.log(section, fields[section]);
        }      

        // form       
        const form = document.createElement('optgroup');
        form.setAttribute('label', Translator.translate(`Forms`));
        EAManager.field_options.dom.appendChild(form);
        const form_option = document.createElement('option');
        form_option.setAttribute('data-type', ELEMENTS_TYPE.FORM.name);
        form_option.setAttribute('value', 'form');
        form_option.innerHTML = Translator.translate(`Form`);
        form.appendChild(form_option); 
        form_option.classList.add('collapse');
        form_option.classList.add('show');


        // sections       
        const sections = document.createElement('optgroup');
        sections.setAttribute('label', Translator.translate(`Sections`));
        EAManager.field_options.dom.appendChild(sections);
        
        for (const section in this.context.sections_manager.sections) {
            const option = document.createElement('option');
            option.setAttribute('data-type', ELEMENTS_TYPE.SECTION.name);
            option.setAttribute('value', section);
            option.innerHTML = `${this.context.sections_manager.sections[section].name}`;
            sections.appendChild(option);
        }
        

        // groups       
        const groups = document.createElement('optgroup');
        groups.setAttribute('label', Translator.translate(`Groups`));
        EAManager.field_options.dom.appendChild(groups);
        //console.log(this.context.groups_manager.groups);
        for (const group in this.context.groups_manager.groups) {
            const option = document.createElement('option');
            option.setAttribute('data-type', ELEMENTS_TYPE.GROUP.name);
            option.setAttribute('value', group);
            option.innerHTML = `${this.context.groups_manager.groups[group].name}`;
            groups.appendChild(option);
            //console.log(option);
        }

        // checkboxes/radios
        const c_r = document.createElement('optgroup');
        c_r.setAttribute('label', `Checkboxes/Radios`);
        EAManager.field_options.dom.appendChild(c_r);


        // elements
        //console.log(fields);
        for (const key in fields) {
            //console.log("EA manager > ", key);
            const section = document.createElement('optgroup');
            section.setAttribute('label', Translator.translate("Section ") + this.context.sections_manager.sections[key].name);
            EAManager.field_options.dom.appendChild(section);
            fields[key].forEach((value) => {
                if (value.id === undefined) return;
                const option = document.createElement('option');
                option.setAttribute('data-type', value.type);
                option.setAttribute('data-id', value.id);
                option.setAttribute('data-repeatable', value.repeatable);
                option.setAttribute('value', value.id);
                option.innerHTML = `[${value.id}] ${value.field_name}`;
                if (value.type === ELEMENTS_TYPE.CHECKBOX.name || value.type === ELEMENTS_TYPE.RADIO.name) {
                    c_r.appendChild(option);
                } else {
                    section.appendChild(option);
                }
            });
        }

        this.context.signals.onAnyElementChanged.dispatch();
    }

}

