import { Div} from '/static/js/ui/BuildingBlocks.js';
import { ELEMENTS_TYPE } from '/static/designer/js/elements/constants.js';
import { PROPERTIES_ID } from '/static/designer/js/constants/constants.js';
import { Section } from './Section.js';
import { ListBaseElement } from './elements/ListBaseElement.js';
import { TextElement } from './elements/TextElement.js';
import { EmailElement } from './elements/EmailElement.js';
import { PhoneElement } from './elements/PhoneElement.js';
import { WebsiteElement } from './elements/WebsiteElement.js';
import { NumberElement } from './elements/NumberElement.js';
import { DateElement } from './elements/DateElement.js';
import { TimeElement } from './elements/TimeElement.js';
import { BarcodeTextElement } from './elements/BarcodeTextElement.js';
import { BarcodeImageElement } from './elements/BarcodeImageElement.js';
import { TextBoxElement } from './elements/TextBoxElement.js';
import { DropDownElement } from './elements/DropDownElement.js';
import { PhotoElement } from './elements/PhotoElement.js';
import { GpsMapElement } from './elements/GpsMapElement.js';
import { UserImageElement } from './elements/UserImageElement.js';
import { SignatureElement } from './elements/SignatureElement.js';
import { DrawElement } from './elements/DrawElement.js';
import { RadioElement } from './elements/RadioElement.js';
import { CheckboxElement } from './elements/CheckboxElement.js';
import { GpsTextElement } from './elements/GpsTextElement.js';
import { TableElement } from './elements/TableElement.js';
import { FoodexElement } from './elements/FoodexElement.js';

import { ID_LISTVIEW_APPEND } from '../../constants.js';

import { Header } from './Header.js';



/**
 * Create the list view.
 * @param {node} parent Attach form to.
 * @param {object} data Object representing the form.
 * @param {Context} context Context.
 */
export function ListViewBuilder(parent, data, context) {
    const sections = {};
    const dropdowns = {};
    let radio_groups = {};
    let check_groups = {};
    let elements_by_section = {};  // section_id: [{element_id:element}]
    this.values = {};      // data storage
    this.parent = parent;

    //parent.appendChild(new Header().dom);
    for (const key in data.sections) {
        sections[data.sections[key].id] = new Section(context, data.sections[key].id, data.sections[key].name);
        parent.appendChild(sections[data.sections[key].id].dom);
    }

    //console.log(parent);


    for (let i = 0; i<data.elements.length; i++) {
        let id = data.elements[i].id + ID_LISTVIEW_APPEND;
        const type = ELEMENTS_TYPE[data.elements[i].type];

        //if (type.availability.lv_header) this.lv_header.push(data.elements[i]);
        if (!type.availability.list) continue;

        let section = data.elements[i].section;
        const group = data.elements[i].props[PROPERTIES_ID.GROUPPROPERTY];


        let element = null;
        switch (type) {
            case ELEMENTS_TYPE.FOODEX:
                element = new FoodexElement(context, data.elements[i].props, id);
                break;            
            case ELEMENTS_TYPE.TEXT:
                element = new TextElement(context, data.elements[i].props, id);
                break;
            case ELEMENTS_TYPE.EMAIL:
                element = new EmailElement(context, data.elements[i].props, id);
                break;
            case ELEMENTS_TYPE.PHONE:
                element = new PhoneElement(context, data.elements[i].props, id);
                break;
            case ELEMENTS_TYPE.WEBSITE:
                element = new WebsiteElement(context, data.elements[i].props, id);
                break;
            case ELEMENTS_TYPE.TEXTBOX:
                element = new TextBoxElement(context, data.elements[i].props, id);
                break;                            
            case ELEMENTS_TYPE.NUMBER:
                element = new NumberElement(context, data.elements[i].props, id);
                break;
            case ELEMENTS_TYPE.DROPDOWN:
                element = new DropDownElement(context, data.elements[i].props, id, type.name, data.dropdowns[data.elements[i].id]);
                dropdowns[data.elements[i].id] = element;
                break;
            case ELEMENTS_TYPE.CHECKBOX:                
               {
                        let ch_id = id;
                        if (!check_groups.hasOwnProperty(group)) {
                            const base = new ListBaseElement(context)
                            const new_group = new Div();
                            new_group.setId('radio-' + group);
                            new_group.dom.innerHTML = getGroupName(group, data.groups);
                            new_group.addClass("mb-2");
                            new_group.attachTo(base.body);
                            check_groups[group] = base;
                            element = check_groups[group];
                            id = group + "_gp-check-listview";
                            section = data.sections_groups[group].section;
                        }
                        const r_ele = new CheckboxElement(context, data.elements[i].props, ch_id, type.name);// group);
                        r_ele.attachTo(check_groups[group].body);
                        this.values[data.elements[i].id] = r_ele;
                }                
                break;
            case ELEMENTS_TYPE.RADIO:
                {
                    let ch_id = id;
                    if (!radio_groups.hasOwnProperty(group)) {
                        const base = new ListBaseElement(context, data.elements[i].props)
                        const new_group = new Div();
                        new_group.setId('radio-' + group);
                        new_group.dom.innerHTML = getGroupName(group, data.groups);
                        new_group.addClass("mb-2");
                        new_group.attachTo(base.body);
                        radio_groups[group] = base;
                        element = radio_groups[group];
                        id = group + "_gp-radio-listview";
                        section = data.sections_groups[group].section;
                    }
                    const r_ele = new RadioElement(context, data.elements[i].props, ch_id, group, type.name);
                    r_ele.attachTo(radio_groups[group].body);
                    this.values[data.elements[i].id] = r_ele;
                }
                break;
            case ELEMENTS_TYPE.DATE:
                element = new DateElement(context, data.elements[i].props, id);
                break;
            case ELEMENTS_TYPE.TIME:
                element = new TimeElement(context, data.elements[i].props, id);
                break;
            case ELEMENTS_TYPE.PHOTO:
                element = new PhotoElement(context, data.elements[i].props, id);
                break;
            case ELEMENTS_TYPE.BARCODE_TEXT:
                element = new BarcodeTextElement(context, data.elements[i].props, id);
                break;
            case ELEMENTS_TYPE.BARCODE_IMAGE:
                element = new BarcodeImageElement(context, data.elements[i].props, id);
                break;                
            case ELEMENTS_TYPE.GPS_MAP:
                element = new GpsMapElement(context, data.elements[i].props, id);
                break;
            case ELEMENTS_TYPE.GPS_TEXT:
                element = new GpsTextElement(context, data.elements[i].props, id);
                break;                
            case ELEMENTS_TYPE.SIGNATURE:
                element = new SignatureElement(context, data.elements[i].props, id); 
                break;
            case ELEMENTS_TYPE.DRAWING:
                element = new DrawElement(context, data.elements[i].props, id); 
                break;
            case ELEMENTS_TYPE.USERIMAGE:
                element = new UserImageElement(context, data.elements[i].props, id);
                break;
            case ELEMENTS_TYPE.TABLE:
                element = new TableElement(context, data.elements[i].props, id, data.tables[data.elements[i].id]);
                break;                                 
            default:
                console.warn('[' + type.name + '] NOT IMPLEMENTED');
                element = new ListBaseElement(context, data.elements[i].props, id);
                element.addClass('lv-not-implemented');
                element.setTextContent('[' + type.name + '] NOT IMPLEMENTED');
        }

        if (element) {
            //element.attachTo(sections[section].body);
            if (elements_by_section.hasOwnProperty(section)) {
                elements_by_section[section].push({id:id.substring(0,id.lastIndexOf('_')), element:element});
            } else {
                elements_by_section[section] = [{id:id.substring(0,id.lastIndexOf('_')), element:element}];
            }
            element.setAttribute('data-type', type.name);
            //element.status.type = type.name;

            if (!this.values.hasOwnProperty(data.elements[i].id))
                this.values[data.elements[i].id] = element;

        }        
    }    

    
    // append elements in order
    for (const section_id in sections) {
        const order = data.sections_items[section_id];
        
        for (let i = 0; i < order.length; i++) {            
            for (let k=0; k<elements_by_section[section_id].length; k++) {
                if (order[i] === elements_by_section[section_id][k].id) {
                    elements_by_section[section_id][k].element.attachTo(sections[section_id].body);
                    // founded, so break, unless it's none group, which means continue
                    // because there can be another none.
                    // this happens, when there are radios and checkboxes not in an user defined group.
                    if (order[i] !== 'none') break;
                }
            }
        }       
    }

    // present only sections with elements in it
    for (const i in sections) {
        if (sections[i].body.dom.childNodes.length == 0) {
            /*parent.removeChild(sections[i].dom);
            delete sections[i];*/
           sections[i].dom.classList.add('collapse');
        }
    }   

}



ListViewBuilder.prototype = {

    // setup the list view header
    // creates an iframe, sets the elements in this frame
    // takes an image and uses that image as the header 
    // issues with firefox
    // chrome works fine   
    createHeader: async function(elements) {
        if (elements.length > 0) {
            let min_top = Number.MAX_SAFE_INTEGER;
            let max_top = Number.MIN_SAFE_INTEGER;
            const header = new Header();
            this.parent.insertBefore(header.dom, this.parent.firstChild);    
            var ifrm = $('<iframe />');
            ifrm.css({ "position": "absolute", "top": "-1000000px"});
            //const self = this;
           // await delay(2000);
            $("body").append(ifrm);
            const body = ifrm.contents().find("body");
            elements.forEach(element => {
                    body.append(element);
                    const _y = parseInt(element.css('top'));
                    const _height = parseInt(element.css('height'));
                    if (_y < min_top) min_top = _y;
                    if (max_top < _height + _y) max_top = _height + _y;
            });
            var node = body.get(0);                
            const canvas =  await html2canvas(node, { allowTaint: true, y: min_top - 10, height: max_top - min_top + 20  });
            header.setImage(canvas.toDataURL(), canvas.width, canvas.height, () => {
                ifrm.remove();  // cleanup
            });                                  
                             
        }
    },

    restore: async function (data) {
        if (!data || !data.elements) return;
        /*
        data.elements.forEach(element_data => {
            if (element_data) { // maybe something was added after the form filled (only happens during dev)
                if (element_data.id) {
                    if (this.values.hasOwnProperty(element_data.id)) {
                        this.values[element_data.id].restore(element_data);
                    }
                }
            }
        })
        */

        await [...Array(data.elements.length)].reduce( (p, _, i) => 
        p.then(
            () => {
                if (data.elements[i]) { // maybe something was added after the form filled (only happens during dev)
                    if (data.elements[i].id) {
                        if (this.values.hasOwnProperty(data.elements[i].id)) {
                            this.values[data.elements[i].id].restore(data.elements[i]);
                            return this.values[data.elements[i].id].restore(data.elements[i]);
                        }
                    }
                }
                return null;
            })
        , Promise.resolve());     
    },


    clear: function () {
        for (let ele in this.values) {
            this.values[ele].clear();
        }
        this.values = null;
    },
}




function getGroupName(id, array) {
    for (let i=0; i<array.length; i++) {
        if (array[i].id === id)
            return array[i].name;
    }
    //return "-- GROUP NAME DOES NOT EXIST --";
    return '<span class="badge badge-danger p-2">DEFAULT GROUP</span>';
}