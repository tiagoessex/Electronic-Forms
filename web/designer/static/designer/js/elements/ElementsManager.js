/**
 * NOTE: by ELEMENT we are refering to a user's created element, which
 *       can be composed by several html elements and associated data
 * 
 * TODO: REMOVE CONNECTION BETWEEN PROPERTIES PANEL AND THIS CLASS
 */

import { PROPERTIES_ID } from '../constants/constants.js';
import {
    ELEMENTS_TYPE,
    ELEMENT
} from './constants.js';
import { isElement } from '/static/js/jshtml.js';
import { DEFAULTBACKGROUNDCOLOR } from '../constants/colors.js';
import { RGBAtoHEX, getColors } from '/static/js/jscolor.js';
import { 
    GPS_INPUT, 
    PHOTO_INPUT, 
    SIGNATURE_INPUT, 
    DRAWING_INPUT, 
    USER_IMAGE_INPUT, 
    IMAGE_MISSING,
    BARCODE_INPUT,
    URL_FORMS_ASSETS } from '/static/js/urls.js';
import { TextElement } from './elements/TextElement.js';
import { CheckboxElement } from './elements/CheckboxElement.js';
import { RadioElement } from './elements/RadioElement.js';
import { ImageElement } from './elements/ImageElement.js';
import { BoxElement } from './elements/BoxElement.js';
import { CircleElement } from './elements/CircleElement.js';
import { HorizontalLineElement } from './elements/HorizontalLineElement.js';
import { VerticalLineElement } from './elements/VerticalLineElement.js';
import { TableElement } from './elements/TableElement.js';
import { DEFAULT_GROUP_ID } from '../groups/constants.js';
import { Translator } from '/static/js/Translator.js';


const ELEMENT_SELECTOR = '.' + ELEMENT;

/**
 * Elements factory and manager.
 */
export class ElementsManager {
    static counter = {};    // always increasing - used to create the id for each element
  
    /**
     * Constructor.
     * @param {Context} context Context.
     */
    constructor(context) {
        this.context = context;
        // container of all elements. 
        // Each element is identified by its respective id and it also has a property obj assocated with it
        this.elements = {};                                
        context.elements_manager = this;

        context.signals.removeThisElement.add(this.removeElement,this);
        context.signals.onPageRemoved.add((page, page_number) => {
            this.removeAllElementsIn(page);
        });
        context.signals.onElementRenamed.add((element, new_name) => {
            element.props[PROPERTIES_ID.NAMEPROPERTY] = new_name;
        }, this, 10);

        // GROUPS
        context.signals.onElementAdded2Group.add(this.elementAdded2Group,this, 10);
        context.signals.onElementRemovedFromGroup.add(this.elementRemovedFromGroup,this,10);
        context.signals.onGroupRemoved.add(this.groupRemoved,this);

        // SECTIONS
        context.signals.onSectionItemMoved.add(this.sectionItemMoved,this);
        context.signals.onSectionRemoved.add(this.sectionRemoved,this);

        // READY!!!
        context.signals.onStuffDone.dispatch('ElementsManager ready!');
    }

    /**
     * Generates an ID, using the type of element as basis.
     * For example, for TEXT type, it will generate: text_0, text_1, ...
     * The counting is always increased.
     * @param {string} type Type of element (defined in constants.js)
     * @returns A string representing an unique ID.
     */
    generateID(type) {
        if (ElementsManager.counter.hasOwnProperty(type)) {
            ElementsManager.counter[type] += 1;
        } else {
            ElementsManager.counter[type] = 0;
        }
        return type.toLowerCase() + '_' + ElementsManager.counter[type];
    }

    getCounter() {
        return ElementsManager.counter;
    }
    setCounter(new_counter) {
        ElementsManager.counter = new_counter;
    }    

    /**
     * Return the Element corresponding to a given ID.
     * @param {string} element_id Element ID.
     * @returns Returns the element with a given id
     */
    getElement(element_id) {
        return this.elements[element_id];
    }

    /**
     * == Listener ==
     * Removes an Element from the collection.
     * @param {Element} element Element to be removed - can be either an Element or an HTMLElement.
     * @returns Returns true if successful, else false.
     */
    removeElement(element=null) {
        if (element) {
            // it's what?
            const ele = isElement(element)?element:element.dom;
            // notify all interested parties that this element is going to be removed
            //this.context.signals.onElementRemoved.dispatch(this.elements[ele.id]);
            const id = ele.id;
            const type = this.elements[ele.id].type;
            const group = this.elements[ele.id].props[PROPERTIES_ID.GROUPPROPERTY];
            const isRepeatable = this.elements[ele.id].isRepeatable();
            // clear
            this.elements[ele.id].clear();
            // remove it from the collection
            delete this.elements[ele.id];
            // remove it from the world
            ele.parentNode.removeChild(ele); 

            this.context.signals.onElementRemoved.dispatch(id, type, group, isRepeatable);

            this.context.properties.n_elements--;
            
            return true;
        }
        console.warn("[Elements->ElementsManager::removeElement] Invalid Element!")
        return false;
    }

    /**
     * Removes all Elements attached to a particular Page (only first level)
     * @param {node} parent Page of the elements to be removed.
     */
    removeAllElementsIn(parent) {
        if (parent) {
            const elements = parent.querySelectorAll(ELEMENT_SELECTOR);
            for (let i=0; i<elements.length; i++) {
                this.removeElement(elements[i]);
            }
        } else {
            console.warn("[Elements->ElementsManager::removeAllElementsIn] Invalid Parent!")
        }
    }

    /**
     * Get all Elements.
     * @returns The Elements collection.
     */
    getElements() {
        return this.elements;
    }


    /**
     * Get the number of Elements.
     * @returns Number of Elements.
     */
    getSize() {
        return Object.keys(this.elements);
    }
       

    /**
     * Creates an Element of a certain type.
     * The coordinates (top, left) are relative to the left upper corner of the parent.
     * Notes: if props != null => use it to setup the element
     * @param {string} type Type of element (defined in constants.js)
     * @param {object} props Object corresponding to the properties (see UIPropertiesMenu.js). Props not null => it was propably loaded from file or is a clone 
     * @param {number} left Left coordinate of the element.
     * @param {number} top Top coordinate of the element.
     * @param {node} parent Page where the Element will the attached to. 
     * @param {any} data Extra data or configuration, for example, to set the max lenght, default value, ... Data not null => it was probably an element created directly from the database/table
     * @param {object} table_data If not null => this element is a table, and this it its configuration.
     * @returns The newly created Element.
     */
    createElement(type, props = null, left="0", top="0", parent=null, data=null, table_data = null) {

        let id = null;
        if (props && props[PROPERTIES_ID.IDPROPERTY] !== '') {
            id = props[PROPERTIES_ID.IDPROPERTY];
        } else {
            id = this.generateID(type.name);
        }

        //const new_element = new Element(type, props, parent, this.context, left, top, id, background=null, text=null);
        let new_element = null;

        switch(type) {
            case ELEMENTS_TYPE.FOODEX:
                new_element = new TextElement(type, props, parent, this.context, left, top, id, DEFAULTBACKGROUNDCOLOR);
                break;            
            case ELEMENTS_TYPE.TEXT:
                new_element = new TextElement(type, props, parent, this.context, left, top, id, DEFAULTBACKGROUNDCOLOR);
                break;
            case ELEMENTS_TYPE.EMAIL:
                new_element = new TextElement(type, props, parent, this.context, left, top, id, DEFAULTBACKGROUNDCOLOR);
                break;
            case ELEMENTS_TYPE.PHONE:
                new_element = new TextElement(type, props, parent, this.context, left, top, id, DEFAULTBACKGROUNDCOLOR);
                break;
            case ELEMENTS_TYPE.WEBSITE:
                new_element = new TextElement(type, props, parent, this.context, left, top, id, DEFAULTBACKGROUNDCOLOR);
                break;
            case ELEMENTS_TYPE.TEXTBOX:
                new_element = new TextElement(type, props, parent, this.context, left, top, id, DEFAULTBACKGROUNDCOLOR);
                break;
            case ELEMENTS_TYPE.NUMBER:
                new_element = new TextElement(type, props, parent, this.context, left, top, id, DEFAULTBACKGROUNDCOLOR);
                break;
            case ELEMENTS_TYPE.DROPDOWN:
                new_element = new TextElement(type, props, parent, this.context, left, top, id, DEFAULTBACKGROUNDCOLOR);
                break;   
            case ELEMENTS_TYPE.CHECKBOX:
                new_element = new CheckboxElement(type, props, parent, this.context, left, top, id, DEFAULTBACKGROUNDCOLOR);
                break;   
            case ELEMENTS_TYPE.RADIO:
                new_element = new RadioElement(type, props, parent, this.context, left, top, id, DEFAULTBACKGROUNDCOLOR);
                break;   
            case ELEMENTS_TYPE.DATE:
                new_element = new TextElement(type, props, parent, this.context, left, top, id, DEFAULTBACKGROUNDCOLOR);
                break;   
            case ELEMENTS_TYPE.TIME:
                new_element = new TextElement(type, props, parent, this.context, left, top, id, DEFAULTBACKGROUNDCOLOR);
                break;  
            case ELEMENTS_TYPE.PHOTO:
                new_element = new ImageElement(type, props, parent, this.context, left, top, id, DEFAULTBACKGROUNDCOLOR, PHOTO_INPUT);
                break;   
            case ELEMENTS_TYPE.BARCODE_TEXT:
                new_element = new TextElement(type, props, parent, this.context, left, top, id, DEFAULTBACKGROUNDCOLOR);
                break;
            case ELEMENTS_TYPE.BARCODE_IMAGE:
                new_element = new ImageElement(type, props, parent, this.context, left, top, id, DEFAULTBACKGROUNDCOLOR, BARCODE_INPUT);
                break;                  
            case ELEMENTS_TYPE.GPS_TEXT:
                new_element = new TextElement(type, props, parent, this.context, left, top, id, DEFAULTBACKGROUNDCOLOR);
                break;
            case ELEMENTS_TYPE.GPS_MAP:
                new_element = new ImageElement(type, props, parent, this.context, left, top, id, DEFAULTBACKGROUNDCOLOR, GPS_INPUT);
                break;                
            case ELEMENTS_TYPE.SIGNATURE:
                new_element = new ImageElement(type, props, parent, this.context, left, top, id, DEFAULTBACKGROUNDCOLOR, SIGNATURE_INPUT);
                break;   
            case ELEMENTS_TYPE.DRAWING:
                new_element = new ImageElement(type, props, parent, this.context, left, top, id, DEFAULTBACKGROUNDCOLOR, DRAWING_INPUT);
                break;   
            case ELEMENTS_TYPE.USERIMAGE:
                new_element = new ImageElement(type, props, parent, this.context, left, top, id, DEFAULTBACKGROUNDCOLOR, USER_IMAGE_INPUT);
                break; 
            case ELEMENTS_TYPE.TEXTLABEL:
                new_element = new TextElement(type, props, parent, this.context, left, top, id, null);
                break;
            case ELEMENTS_TYPE.IMAGE:
                let image = IMAGE_MISSING;
                if (props) {
                    if (props[PROPERTIES_ID.IMAGEURLPROPERTY]!=='') {
                        image = URL_FORMS_ASSETS + this.context.properties.id + '/' + props[PROPERTIES_ID.IMAGEURLPROPERTY];
                    }
                }
                new_element = new ImageElement(type, props, parent, this.context, left, top, id, null, image);
                //new_element = new ImageElement(type, props, parent, this.context, left, top, id, DEFAULTBACKGROUNDCOLOR, IMAGE_INPUT);
                break;             
            case ELEMENTS_TYPE.BOX:
                new_element = new BoxElement(type, props, parent, this.context, left, top, id);
                break;
            case ELEMENTS_TYPE.CIRCLE:
                new_element = new CircleElement(type, props, parent, this.context, left, top, id);
                break;
            case ELEMENTS_TYPE.HORIZONTALLINE:
                new_element = new HorizontalLineElement(type, props, parent, this.context, left, top, id);
                break;                
            case ELEMENTS_TYPE.VERTICALLINE:
                new_element = new VerticalLineElement(type, props, parent, this.context, left, top, id);
                break;                   
            case ELEMENTS_TYPE.PAGENUMBER:
                new_element = new TextElement(type, props, parent, this.context, left, top, id, DEFAULTBACKGROUNDCOLOR);
                break;
            case ELEMENTS_TYPE.NUMBEROFPAGES:
                new_element = new TextElement(type, props, parent, this.context, left, top, id, DEFAULTBACKGROUNDCOLOR);
                break;
            case ELEMENTS_TYPE.TABLE:
                new_element = new TableElement(type, props, parent, this.context, left, top, id, null, table_data);
                break;
            case ELEMENTS_TYPE.STATICTABLE:
                new_element = new TableElement(type, props, parent, this.context, left, top, id, null, table_data);
                break;                  
            case ELEMENTS_TYPE.NOTIMPLEMENTED:
            default:
                new_element = new TextElement(type, props, parent, this.context, left, top, id, 'rgba(255,0,0,1)');
                new_element.setStyle("color","black"); 
                new_element.setStyle("text-align", "center");
                new_element.setStyle("font-weight","bold"); 
                new_element.setTextContent(Translator.translate("NOT IMPLEMENTED YET!"));
                console.warn("[Elements->ElementsManager::createElement] Type " + type + " does not exist! Not implemented yet?");
        }
        
       
        // set the values in the properties --- ONLY REQUIRED WHEN NOT DRAGGED OR LOADED
        new_element.props[PROPERTIES_ID.IDPROPERTY] = new_element.getId();
        new_element.props[PROPERTIES_ID.LEFTPROPERTY] = parseInt(new_element.dom.style.left);
        new_element.props[PROPERTIES_ID.TOPPROPERTY] = parseInt(new_element.dom.style.top);
        new_element.props[PROPERTIES_ID.WIDTHPROPERTY] = parseInt(new_element.dom.style.width);
        new_element.props[PROPERTIES_ID.HEIGHTPROPERTY] = parseInt(new_element.dom.style.height);

        
        // stupid border
        let border_parts = new_element.dom.style.borderStyle.split(" ");
        let border = 'none';
        for (let i=0; i<border_parts.length; i++) {
            if (border_parts[i] !== 'none') {
                border = border_parts[i];
                break;
            }                
        }
        new_element.props[PROPERTIES_ID.BORDERPROPERTY] = border;
        new_element.props[PROPERTIES_ID.BORDERRADIUSPROPERTY] = parseInt(new_element.dom.style.borderRadius);
        new_element.props[PROPERTIES_ID.SECTIONPROPERTY] = props?props[PROPERTIES_ID.SECTIONPROPERTY]:'section-0';

        
        if (new_element.dom.style.backgroundColor !=='') {
            new_element.props[PROPERTIES_ID.BACKCOLORPROPERTY] = RGBAtoHEX(new_element.dom.style.backgroundColor);
            const alpha = getColors(new_element.dom.style.backgroundColor)[3];
            new_element.props[PROPERTIES_ID.BACKALPHAPROPERTY] = alpha!==undefined?alpha:1.0;
        }      
        // ....

        // pre defined data, for example, when database -> element directly.
        // in FormView: const data = $(ui.draggable).data('data');
        // in UIFormElementsItem: this.setAttribute("data-data", JSON.stringify(data));
        // in UIFormElementsMenu: addDBField(..., data)
        // in DBFields2UIModal: self.addDBField(..., {"size":self.size, "default":self.default, "db": self.full_path,'required': self.required});
        if (data != null) {
            new_element.props[PROPERTIES_ID.DATABASEPROPERTY] = data.db;
            new_element.props[PROPERTIES_ID.MAXLENGTHPROPERTY] = data.size;
            new_element.props[PROPERTIES_ID.DEFAULTPROPERTY] = data.default;
            new_element.props[PROPERTIES_ID.REQUIREDPROPERTY] = data.required==='true'?'yes':'no';
        }

        // add element to the list
        this.elements[new_element.getId()] = new_element;
          
        this.context.signals.onStuffDone.dispatch('Element [' + new_element.dom.id + '] was added to page [' + new_element.parent_id + '] and is ready!');
        this.context.signals.onElementCreated.dispatch(new_element, new_element.parent_id, props?props[PROPERTIES_ID.SECTIONPROPERTY]:'section-0');
        
        this.context.properties.n_elements++;

        return new_element;
    }

    /**
     * Checks how many checkboxes and radio elements don't belong to a group.
     * @param {string} gp_id Group ID.
     * @param {number} min_count Minimum number of elements.
     * @returns True if there are at least min_count Checkboxes or Radio elements without a group, False otherwise.
     */
    areCheckRadioInGroup(gp_id, min_count = 0) {
        let counter = 0;
        for (let key in this.elements) {
			if (this.elements[key].type === ELEMENTS_TYPE.CHECKBOX || this.elements[key].type === ELEMENTS_TYPE.RADIO) {
				if (this.elements[key].props[PROPERTIES_ID.GROUPPROPERTY] === gp_id) {
					counter += 1;
                    if (counter >= min_count)
                        return true;
				}
			}
		}
        return false;
    }

    /**
     * Checks if a specific element is in a group (not in DEFAULT_GROUP_ID)
     * @param {string} element_id Element ID.
     * @returns Is the element in a group?
     */
    isInGroup(element_id) {
        if (this.elements[element_id])
        //console.log(element_id, this.elements[element_id].props[PROPERTIES_ID.GROUPPROPERTY]);
            return this.elements[element_id].props[PROPERTIES_ID.GROUPPROPERTY] !== DEFAULT_GROUP_ID;
        else
            null;
    }

  
    /**
     * == Listener ==
     * An element was added to a group.
     * @param {string} element_id Element ID
     * @param {string} group_id Group ID
     */
     elementAdded2Group(element_id, group_id) {
        const element = this.getElement(element_id);
        if (element != undefined && element) {
            element.props[PROPERTIES_ID.GROUPPROPERTY] = group_id;
        } else {
            console.warn("[ElementsManager::elementAdded2Group] Invalid Element!")
        }
    }

    /**
     * == Listener ==
     * An element was removed from a group, so put it in default group (none).
     * @param {string} element_id Element ID
     */
    elementRemovedFromGroup(element_id) {
        const element = this.getElement(element_id);
        if (element != undefined && element) {
            element.props[PROPERTIES_ID.GROUPPROPERTY] = DEFAULT_GROUP_ID;
        } else {
            console.warn("[ElementsManager::elementRemovedFromGroup] Invalid Element!")
        }
    }

    /**
     * == Listener ==
     * A group was removed => change the group of all its elements back to default: DEFAULT_GROUP_ID
     * @param {string} group_id 
     */
    groupRemoved(group_id) {
        // move all elements in group_id to DEFAULT_GROUP_ID
        for (const id in this.elements) {
            const element = this.elements[id];
            if (!element.type.availability.groups) continue;
            if (element.props[PROPERTIES_ID.GROUPPROPERTY] === group_id) {
                element.props[PROPERTIES_ID.GROUPPROPERTY] = DEFAULT_GROUP_ID;
            }
        }
    }

    /**
     * == Listener ==
     * An Element (Item) was moved to another section:
     *      - change its section property
     * @param {string} element_id Element ID.
     * @param {string} new_section Section ID.
     */
    sectionItemMoved(element_id, new_section) {
        const element = this.getElement(element_id);
        if (element)
            element.props[PROPERTIES_ID.SECTIONPROPERTY] = new_section;
    }

    /**
     * == Listener ==
     * A section was removed:
     *      - change the section of all elements of that section to the default section
     * @param {string} section_id Section ID
     */
    sectionRemoved(section_id) {
        // set all elements in section_id to DEFAULT_SECTION_ID
        for (const id in this.elements) {
            const element = elements[id];
            if (element.props[PROPERTIES_ID.SECTIONPROPERTY] === section_id) 
                element.props[PROPERTIES_ID.SECTIONPROPERTY] = DEFAULT_SECTION_ID;
        }
    }


    /**
     * Prepares the data to be saved.
     * @returns An object containing all the necessary data to restore the elements.
     */
    save() {
        const data = [];
        const tables = {};
        for (let ele in this.elements) {
            //if (this.elements[ele].type === ELEMENTS_TYPE.TABLE) return;
            const element_id = this.elements[ele].dom.id;
            const element_page = this.elements[ele].parent_id;
            const element_type = this.elements[ele].type.name;
            // if table save the table config
            if (element_type === 'TABLE' || element_type === 'STATICTABLE' ) {
                tables[element_id] = this.elements[ele].getTableConfig();
            }
            let element_props = this.elements[ele].props;
            const element_section = this.elements[ele].props[PROPERTIES_ID.SECTIONPROPERTY];
            data.push({id: element_id, page: element_page , section: element_section, type: element_type, props: element_props});
        }
        return [data, tables];
    }

    /**
     * Restores the manager and all elements.
     * @param {object} data Data to be restored.
     * @param {array} repeatable_elements Array with the IDs of all repeatable elements.
     */
    restore(data, repeatable_elements) {
        this.setCounter(data.counter);
        const table_elements = (data.tables && data.tables !== 'undefined')? data.tables: {};
        for (let i = 0; i<data.elements.length; i++) {
            const id = data.elements[i].id;
            const type = ELEMENTS_TYPE[data.elements[i].type];
            const props = data.elements[i].props;
            const page_id =  data.elements[i].page;
            const parent = document.getElementById(page_id);
            // if a table, then get the its data and pass it on
            const table_data = (table_elements && (data.elements[i].type === "TABLE" || data.elements[i].type === "STATICTABLE"))?table_elements[id]:null;
            const element = this.createElement(type, props, null, null, parent, null, table_data);
            
            if (repeatable_elements.includes(element.dom.id)) {
                element.setRepeatable(true);
            }            
        }
    }

}


