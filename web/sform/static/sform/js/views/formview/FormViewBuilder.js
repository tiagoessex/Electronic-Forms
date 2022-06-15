/**
 * ATTENTION:
 *      - FOR SAVE OPERATIONS, THE CONTEXT OBJECT MUST PASS VALID:
 *          FORM_ID: form id
 *          FORM_OPERATION_ID: operation id
 * 
 * 
 * TODO:
 *      - ASYNC CREATION TO ALLOW PRINT/EXPORT OPERATIONS WITHOUT THE NEED TO OPEN FIRST
 */

import { Page } from '/static/designer/js/pages/Page.js';
import { ELEMENTS_TYPE } from '/static/designer/js/elements/constants.js';
import { PROPERTIES_ID } from '/static/designer/js/constants/constants.js';
import { FormBaseElement } from './elements/FormBaseElement.js';
import { TextElement } from './elements/TextElement.js';
import { EmailElement } from './elements/EmailElement.js';
import { PhoneElement } from './elements/PhoneElement.js';
import { WebsiteElement } from './elements/WebsiteElement.js';
import { TextBoxElement } from './elements/TextBoxElement.js';
import { NumberElement } from './elements/NumberElement.js';
import { DropDownElement } from './elements/DropDownElement.js';
import { CheckboxElement } from './elements/CheckboxElement.js';
import { RadioElement } from './elements/RadioElement.js';
import { DateElement } from './elements/DateElement.js';
import { TimeElement } from './elements/TimeElement.js';
import { BarcodeTextElement } from './elements/BarcodeTextElement.js';
import { BarcodeImageElement } from './elements/BarcodeImageElement.js';
import { PhotoElement } from './elements/PhotoElement.js';
import { GpsMapElement } from './elements/GpsMapElement.js';
import { SignatureElement } from './elements/SignatureElement.js';
import { DrawElement } from './elements/DrawElement.js';
import { UserImageElement } from './elements/UserImageElement.js';
import { TextLabel } from './elements/TextLabel.js';
import { ImageElement } from './elements/ImageElement.js';
import { BoxElement } from './elements/BoxElement.js';
import { CircleElement } from './elements/CircleElement.js';
import { HorizontalLineElement } from './elements/HorizontalLineElement.js';
import { VerticalLineElement } from './elements/VerticalLineElement.js';
import { PageNumberElement } from './elements/PageNumberElement.js';
import { NumberOfPagesElement } from './elements/NumberOfPagesElement.js';
import { GpsTextElement } from './elements/GpsTextElement.js';
import { TableElement } from './elements/TableElement.js';
import { StaticTableElement } from './elements/StaticTableElement.js';
import { FoodexElement } from './elements/FoodexElement.js';

import { ID_FORMVIEW_APPEND } from '../../constants.js';

import { copyAttrs } from '/static/js/jsutils.js';
import { Print } from '../../printexport/Print.js';

import { URL_FORMS_ASSETS } from '/static/js/urls.js';
import { Img } from '/static/js/ui/BuildingBlocks.js';

import { fetchBlob } from '/static/js/Fetch.js';


/**
 * Create the form view.
 * @param {node} parent Attach form to (ATT: do not use a building element).
 * @param {object} data Object representing the form.
 * @param {Context} context Context.
 */
export function FormViewBuilder(parent, data, context) {
    
    const dropdowns = {};
    this.values = {};      // data storage
    this.parent = parent;
    this.context = context;
    this.extras = {}; // extra stuff to be added to the operation data
    this.annexes = [];
    this.lv_header_elements = [];

    // create the necessary Pages
    for (let i = 0; i<data.pages.length; i++) {
        const page_number = data.pages[i].split('-')[1];
        const new_page = new Page(page_number);

        if (data.rasters[i] && data.rasters[i] !== '' && data.rasters[i] !== undefined) {
            const image = URL_FORMS_ASSETS + data.id + '/' + data.rasters[i];
            //new_page.setStyle("background-image","url('" + image + "')");
            //console.log("BACK IMAGE > ", image);
            
            // to work in case offline
            fetchBlob(image, (blob) => {
                const objectURL = URL.createObjectURL(blob);
                new_page.setStyle("background-image","url('" + objectURL + "')");
            }, (error) => {
                console.error("[FormViewBuilder] Error fetching image!", error);
            })            
        }

        new_page.attachTo(parent);       

    }

    // create and add the elements to their respective page
    for (let i = 0; i<data.elements.length; i++) {

        //if (!type.availability.form) continue;

        const id = data.elements[i].id + ID_FORMVIEW_APPEND;
        const type = ELEMENTS_TYPE[data.elements[i].type];
        const page_id =  data.elements[i].page;
        
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
                element = new CheckboxElement(context, data.elements[i].props, id, type.name);   
                break;                 
            case ELEMENTS_TYPE.RADIO:
                element = new RadioElement(context, data.elements[i].props, id, type.name); 
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
            case ELEMENTS_TYPE.TEXTLABEL:
                element = new TextLabel(context, data.elements[i].props, id);
                break;
            case ELEMENTS_TYPE.IMAGE: 
                element = new ImageElement(context, data.elements[i].props, id, data.id);
                break;                
            case ELEMENTS_TYPE.BOX:
                element = new BoxElement(context, data.elements[i].props, id);
                break;
            case ELEMENTS_TYPE.CIRCLE:
                element = new CircleElement(context, data.elements[i].props, id);
                break;
            case ELEMENTS_TYPE.HORIZONTALLINE:
                element = new HorizontalLineElement(context, data.elements[i].props, id);
                break;
            case ELEMENTS_TYPE.VERTICALLINE:
                element = new VerticalLineElement(context, data.elements[i].props, id);
                break;
            case ELEMENTS_TYPE.PAGENUMBER:
                element = new PageNumberElement(context, data.elements[i].props, id);
                break; 
            case ELEMENTS_TYPE.NUMBEROFPAGES:
                element = new NumberOfPagesElement(context, data.elements[i].props, id, data.pages.length);
                break; 
            case ELEMENTS_TYPE.TABLE:
                element = new TableElement(context, data.elements[i].props, id, data.tables[data.elements[i].id]);
                break;
            case ELEMENTS_TYPE.STATICTABLE:
                element = new StaticTableElement(context, data.elements[i].props, id, data.tables[data.elements[i].id]);
                break;                 
            default:
                element = new FormBaseElement(context, data.elements[i].props, id);
                element.addClass('fv-not-implemented');
                element.setTextContent('[' + type.name + '] NOT IMPLEMENTED');

        }
        element.setAttribute('data-type', type.name);
        //element.status.type = type.name;

        document.getElementById(page_id).appendChild(element.dom);
        //$(parent).find(page_id).get(0).appendChild(element.dom);

        this.values[data.elements[i].id] = element;

        if (type.availability.lv_header &&
            data.elements[i].props[PROPERTIES_ID.LISTHEADERPROPERTY] === 'yes') {                
                this.lv_header_elements.push($(element.dom).clone());
            }

    }
   

    // extras
    // ex: dynamic validations set by the e/a system
    // for now, it's only if element/group must have a value/selected
    context.signals.onRequired.add((element_id) => {        
        this.extras[element_id] = {"REQUIRED":true};
    })
    context.signals.onNotRequired.add((element_id) => {
        this.extras[element_id] = {"REQUIRED":false};
    })

    context.signals.onAnnexUploaded.add((file) => {        
        this.annexes.push(file);
    })
    context.signals.onAnnexRemoved.add((file) => {
        this.annexes.splice(this.annexes.indexOf(file), 1);
    })    

}


FormViewBuilder.prototype = {

    // --- TODO --- ARRAY OF PROMISES
    /**
     * Save the values.
     * Sync save.
     * TODO: async save.
     * @returns Object will all the values/element.
     */
    save: async function () {
        const data = {elements:[], extras: this.extras, annexes: this.annexes};
        for (let ele in this.values) {
            //await this.values[ele].save().then(data_2_save => data.elements.push(data_2_save));
            const data_2_save = await this.values[ele].save();
            data.elements.push(data_2_save);
        }
        //console.warn(data);
        return data;       
    },

    /**
     * Restores the view.
     * @param {object} data Object with all the data required to restore the view.
     * @returns 
     */
    restore: async function (data) {
        if (!data || !data.elements) return;
        await [...Array(data.elements.length)].reduce( (p, _, i) => 
        p.then(
            () => {
                return this.values[data.elements[i].id].restore(data.elements[i]);
            })
        , Promise.resolve());        

        this.extras = data.extras;
        this.annexes = data.annexes;
    },

    /**
     * Clears all elements.
     */
    clear: function () {
        for (let ele in this.values) {
            this.values[ele].clear();
        }
        this.values = null;
    },


    // --------------------------------------------
    // --------------- PRINT / PDF ----------------
    // --------------------------------------------

    // The elements preparations for the print/export, includes
    // @media print, conditionals during construction, exchanging node/containers, ...
    // There are several occasions where these overlap.


    /**
     * Prints the form.
     * @param {function} onReady 
     * @param {function} onError 
     */
    printForm: function(onReady=null, onError=null) {
        this.context.isExport = true;        
        let p = new Print($(this.parent));
        p.init().then((dom) => {
            this.prepare2Print(dom, false).then(() => {
                p.print();
                p.end();
                p=null;
                if (onReady) onReady();
                this.context.isExport = false;
            });
        }).catch(err => {            
            p=null;
            if (onError) onError(err);
            this.context.isExport = false;
        });
    },

    /**
     * Exports form as a PDF file.
     * @param {function} onReady 
     * @param {function} onError 
     * @param {string} filename
     */
    pdfForm: function(onReady=null, onError=null, filename='form.pdf') {
        this.context.isExport = true;
        let p = new Print($(this.parent));
        p.init().then((dom) => {
            this.prepare2Print(dom, true).then(() => {
                p.pdf(filename).then(() => {
                    p.end();
                    p=null;
                    if (onReady) onReady();
                    this.context.isExport = false;
                });          
           })           
        }).catch(err => {
            p=null;
            if (onError) onError(err);
            this.context.isExport = false;
        });
    },    


    base64PDFForm: function(onReady=null, onError=null) {
        this.context.isExport = true;
        let p = new Print($(this.parent));
        p.init().then((dom) => {
            this.prepare2Print(dom, true).then(() => {
                p.base64PDF().then((pdf_data) => {
                    p.end();
                    p=null;
                    if (onReady) onReady(pdf_data);
                    this.context.isExport = false;
                });          
           })           
        }).catch(err => {
            p=null;
            if (onError) onError(err);
            this.context.isExport = false;
        });
    },  

    /**
     * Prepares for printing/pdf:
     *  - replicate the values of the elements, and.
     *  - prepare the elements for printing/exporting.
     * 
     * isPdf is required, since there is no @media pdf, which means, several elements, require
     * extra actions.
     * 
     * @param {HTMLDocument} destination_dom Destination page.
     * @param {boolean} isPdf If true, then process the elements as it's for pdf, else is printer.
     */
     prepare2Print: async function(destination_dom=null, isPdf = false) {
        // add an image as background image, if any. Otherwise, it won't print
        
            const pages = destination_dom.getElementsByClassName('page');            
            for (let i=0; i<pages.length; i++) {
                // remove page border
                pages[i].style.borderStyle = "none";
                // if print => background/raster images are not printed
                // => create a img element to cover the entire page as a replacement
                if (!isPdf) {
                    const url = pages[i].style.backgroundImage;
                    if (url === '') continue;
                    const image = url.slice(4, -1).replace(/"/g, "");
                    if (image === '') continue;
                    const img = new Img(image).attachTo(pages[i]);
                    img.setAttribute('width',pages[i].clientWidth);
                    img.setAttribute('height',pages[i].clientHeight * 0.95); // why??????
                    img.setStyle('position','absolute');
                    img.setStyle('left','0px');
                    img.setStyle('top','0px');
                    img.setStyle('z-index','0');
                    img.setStyle('margin','0');
                    img.setStyle('padding','0');
                }
            }
        /*
        const elements = destination_dom.getElementsByClassName('form-element');
        for (let i=0; i<elements.length; i++) {
            elements[i].style.position = 'relative';
        };
        */
        

        for (let ele in this.values) {
            await this.processElement(destination_dom, ele, this.values[ele], pages.length)
        }
        // all tables have the same border - single line
        // doing it in code because of the PDF export
        $(destination_dom).find('table').each(function () {
           $(this).css('border-collapse','collapse');
        });
        
        if (isPdf) $(destination_dom).find('.no-print').hide();
    },

    /**
     * Prepares element to print/export.
     * Includes: replicate values, set/remove styles and attributes, change types, ...
     * 
     * @param {HTMLDocument} destination_dom Builded form to print/export.
     * @param {string} element_id Element ID.
     * @param {Element} element Element.
     * @returns 
     */
    processElement: async (destination_dom, element_id, element, number_of_pages) => {
        return new Promise(async (resolve, reject) => {
            const type = ELEMENTS_TYPE[element.dom.dataset.type];
            const original_element = element;
            const destination_element = destination_dom.getElementById(element_id + ID_FORMVIEW_APPEND);
            switch (type) {
                case ELEMENTS_TYPE.DATE:
                case ELEMENTS_TYPE.TIME:
                    destination_element.setAttribute('type','text');
                case ELEMENTS_TYPE.TEXT: 
                case ELEMENTS_TYPE.EMAIL:
                case ELEMENTS_TYPE.PHONE:
                case ELEMENTS_TYPE.WEBSITE:
                case ELEMENTS_TYPE.NUMBER:
                case ELEMENTS_TYPE.TEXTBOX:
                case ELEMENTS_TYPE.BARCODE_TEXT:
                case ELEMENTS_TYPE.GPS_TEXT:
                case ELEMENTS_TYPE.FOODEX:
                    // text based elements is just a direct copy
                    destination_element.setAttribute('placeholder','');
                    destination_element.value = original_element.input.getValue();
                    resolve();
                    break;
                case ELEMENTS_TYPE.SIGNATURE:
                case ELEMENTS_TYPE.DRAWING:
                    // canvas based elements => convert canvas to image
                    // if empty, then it's a clear image
                    const drawing = "<img id=" + element_id + " src = '" + original_element.input.dom.toDataURL() + "'/>";                    
                    $(destination_element).replaceWith(drawing);
                    copyAttrs(destination_dom.getElementById(element_id), original_element.input.dom);
                    //const dest = destination_dom.getElementById(element_id);
                    resolve();
                    break;
                case ELEMENTS_TYPE.CHECKBOX:
                case ELEMENTS_TYPE.RADIO:
                    // simple input check
                    destination_element.checked = original_element.input.dom.checked;
                    resolve();
                    break;
                case ELEMENTS_TYPE.DROPDOWN:
                    // only show the selected value
                    // if no selection => empty
                    destination_element.value = original_element.input.getValue();
                    if (destination_element.value === '') {
                        destination_element.innerHTML='';
                    }                    
                    resolve();
                    break;
                case ELEMENTS_TYPE.GPS_MAP:
                    // if there's a map, then convert it to an image
                    // and replace the map with it
                    const _destination = destination_dom.getElementById('fv-gps-' + element_id + ID_FORMVIEW_APPEND);                    
                    if (original_element.map) {
                        leafletImage(original_element.map, function(err, canvas) {                           
                            const image = "<img id=" + element_id + " src = '" + canvas.toDataURL() + "'/>";                    
                            $(_destination).replaceWith(image);                            
                            copyAttrs(destination_dom.getElementById(element_id), original_element.dom);
                            resolve();
                        });
                    } else {
                        // not map => empty space
                        const image = "<img id=" + element_id + " '/>";                    
                        $(_destination).replaceWith(image);                            
                        copyAttrs(destination_dom.getElementById(element_id), original_element.dom);
                        resolve();
                    }
                    break;
                case ELEMENTS_TYPE.BARCODE_IMAGE:
                    // no code/image => clear image
                    if (!original_element.value.code) {
                        destination_dom.getElementById(element_id + ID_FORMVIEW_APPEND).src="";
                    }                    
                    resolve();
                    break;
                case ELEMENTS_TYPE.PHOTO:
                case ELEMENTS_TYPE.USERIMAGE:
                    // no image set => clear image
                    if (!original_element.status.value) {
                        destination_dom.getElementById(element_id + ID_FORMVIEW_APPEND).src="";
                    }                    
                    resolve();
                    break;
                    case ELEMENTS_TYPE.NUMBEROFPAGES:
                        destination_element.value = number_of_pages;
                        resolve();
                        break;
                    case ELEMENTS_TYPE.PAGENUMBER:
                        destination_element.value = element.props[PROPERTIES_ID.PAGENUMBERPROPERTY];
                        resolve();
                        break;
                    case ELEMENTS_TYPE.TABLE:
                        //destination_dom.style.border = 'solid 2px black';
                        $(original_element.dom).find('textarea').each(function () {
                            //console.log(this.value, $(this).attr('id'));                            
                            const cell_id = $(this).attr('id');
                            if (cell_id) {
                                const _destination_cell = destination_dom.getElementById(cell_id);
                                _destination_cell.value = this.value;
                            }                            
                        });
                        resolve();
                        break;
                        /*
                    case ELEMENTS_TYPE.STATICTABLE:
                        console.log( $(destination_dom).find('table'));
                        //$(destination_dom).find('table').css('border','solid 2px black');
                        resolve();
                        break;
                        */
                default:
                    resolve();
            }
        });
        
    },
    
}

