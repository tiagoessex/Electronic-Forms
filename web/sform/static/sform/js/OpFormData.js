
import { URL_GET_OPERATION_FORM_DATA } from '/static/js/urls.js';
import { fetchGET } from '/static/js/Fetch.js';
import { ELEMENTS_TYPE } from '/static/designer/js/elements/constants.js';
import { PROPERTIES_ID } from '/static/designer/js/constants/constants.js';
import { getAllNumbers } from '/static/js/jsutils.js';

/**
 * Get all relevant data from the form (id, name, label, database field, type)
 * and operations (input data, status, visibility) 
 * and includes all validations associated with each field
 * and annexes.
 * 
 * Radios and checkpoints are validated by their respective groups.
 * 
 * Required for offline purposes.
 * 
 */
export class OpFormData {
    /**
     * Constructor.
     * @param {Context} context Context.
     * @param {number} operation_id Operation ID.
     * @param {function} onReady Called after processing all data.
     */
    constructor(context, operation_id, onReady = null) {
        this.context = context;
        this.operation_id = operation_id;
        this.onReady = onReady;

        this.fetch();
    }

    /**
     * Fetch the form and the operation data.
     */
    fetch() {
        const url = URL_GET_OPERATION_FORM_DATA + this.operation_id  + '/';
        fetchGET(url, 
            (result) => {
                if (this.onReady) this.onReady(this.processData(result));
            },
            (error) => {
                if (error_codes && error_codes.length > 0 && error_codes[0] == 404) {
                    // no data to process
                    if (this.onReady) this.onReady(this.processData(null));
                } else {
                    this.context.signals.onError.dispatch(error,"[OpFormData::fetch]");
                }
                /*
                if (error && getAllNumbers(error.toString())[0] == 404) {
                    // no data to process
                    if (this.onReady) this.onReady(this.processData(null));
                } else {
                    this.context.signals.onError.dispatch(error,"[OpFormData::fetch]");
                }  
                */              
            })
    }

    /**
     * Process the operation data.
     * @param {object} data 
     * @returns 
     */
    processData(data) {
        //console.log(data);
        if (!data) return [];
        if (!data.hasOwnProperty('data') || 
            !data.data ||
            !data.data.data || 
            !data.hasOwnProperty('form') ||
            !data.form) return [];
        if (data.data.data.length < 1) return {}
        const _data = {elements:[], groups:[]};
        const form_elements = data.form.form.elements;
        const operation_data_elements = data.data.data.elements;
        const operation_data_extras = data.data.data.extras;
        const annexes = data.data.data.annexes;
        //console.log("extras > ",operation_data_extras);

        const groups = data.form.form.groups;

        operation_data_elements.forEach(element => {
            const obj = {};
            const id = element.id;
            const value = element.value;
            const selected = element.selected;
            const enabled = element.enabled;
            const visible = element.visible;

            let element_index = null;
            for (let i=0; i<form_elements.length; i++) {
                if (form_elements[i].id === id) {
                    element_index = i;
                    break;
                }
            };
            const _element = form_elements[element_index];
            const group = _element.props[PROPERTIES_ID.GROUPPROPERTY];
            const type = form_elements[element_index].type;
            const validations = ELEMENTS_TYPE[type].validations; 

            // transfer iff marked as transferable (see designer/constants.js)
            const transfer = ELEMENTS_TYPE[type].availability.transfer;
            if (!transfer) return false;

            // if radio or checkbox, it will set in the groups list and not in the elements list
            // 'RADIO','CHECKBOX'
            if ([ELEMENTS_TYPE.RADIO.name, ELEMENTS_TYPE.CHECKBOX.name].includes(type)) {
                //if (!selected) return false;
                for (let i=0; i<groups.length; i++) {
                    if (groups[i].id === group) {
                        // groups[i]['required']==true --- REQUIRED, SINCE groups[i]['required']=='X' IS ALSO TRUE
                        groups[i]['required'] = (groups[i]['required']==='yes'||groups[i]['required']==true)?true:false;
                        if (!groups[i].hasOwnProperty('selected_elements')) {
                            groups[i]['selected_elements'] = [];

                            // extra required validation (from E/A)
                            if (operation_data_extras.hasOwnProperty(group) && operation_data_extras[group].hasOwnProperty('REQUIRED')) {
                                if (operation_data_extras[group].REQUIRED) {
                                    groups[i]['required'] = true;//'yes';
                                } else {
                                    groups[i]['required'] = false;//'no';
                                }
                            }

                        }

                        if (!groups[i].hasOwnProperty('type')) {
                            groups[i]['type'] = type;
                        }                            
                        groups[i].enabled = enabled;
                        groups[i].visible = visible;    

                        if (!selected) break;

                        obj.name = _element.props[PROPERTIES_ID.NAMEPROPERTY]?_element.props[PROPERTIES_ID.NAMEPROPERTY]:null;
                        obj.label = _element.props[PROPERTIES_ID.LABELPROPERTY]?_element.props[PROPERTIES_ID.LABELPROPERTY]:null;
                        obj['id'] = id

                        groups[i]['selected_elements'].push(obj);

                        break;
                    }                    
                };
                //console.log("gp added > ", obj);
            } else {
                obj.id = id;
                obj.value = value?value:null;
                obj.name = _element.props[PROPERTIES_ID.NAMEPROPERTY]?_element.props[PROPERTIES_ID.NAMEPROPERTY]:null;
                obj.label = _element.props[PROPERTIES_ID.LABELPROPERTY]?_element.props[PROPERTIES_ID.LABELPROPERTY]:null;
                obj['database'] = _element.props[PROPERTIES_ID.DATABASEPROPERTY]?_element.props[PROPERTIES_ID.DATABASEPROPERTY]:null;
                obj.type = _element.type;
                obj.enabled = enabled;
                obj.visible = visible;
                obj.validations = {};
                if (validations & 32) obj.validations['max-length'] = _element.props[PROPERTIES_ID.MAXLENGTHPROPERTY];
                if (validations & 16) obj.validations['max'] = _element.props[PROPERTIES_ID.MAXPROPERTY];
                if (validations & 8) obj.validations['min'] = _element.props[PROPERTIES_ID.MINPROPERTY];
                if (validations & 4) obj.validations['uppercase'] = _element.props[PROPERTIES_ID.UPPERCASEPROPERTY]=='yes'?true:false;
                if (validations & 2) obj.validations['required'] = _element.props[PROPERTIES_ID.REQUIREDPROPERTY]=='yes'?true:false;
                if (validations & 1) obj.validations['pattern'] = _element.props[PROPERTIES_ID.PATTERNPROPERTY]==='Default'?null:_element.props['properties-pattern'];
                    
                // extra required validation (from E/A)
                if (operation_data_extras.hasOwnProperty(id) && operation_data_extras[id].hasOwnProperty('REQUIRED')) {
                    if (operation_data_extras[id].REQUIRED) {
                        obj.validations['required'] = true;//'yes';
                    } else {
                        obj.validations['required'] = false;//'no';
                    }
                }
            
                _data.elements.push(obj);
            }
        })
        _data.groups = groups;
        _data.annexes = annexes;
        return _data;
    }

}

