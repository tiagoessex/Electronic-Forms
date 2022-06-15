
import { 
    //MESSAGE_NO_DATABASE_FIELD,
    MESSAGE_NO_VALUE,
    MESSAGE_INCORRECT_FORMAT,
    MESSAGE_NO_UPPERCASE,
    MESSAGE_LENGTH_EXCEEED,
    MESSAGE_MAX_EXCEEDED,
    MESSAGE_MIN_EXCEEDED,
    MESSAGE_NOTHING_SELECTED,
 } from './messages.js';

import { Translator } from '/static/js/Translator.js';


/**
 * Client side validation.
 * 
 * @param {object} data Data processed by OpFormData.
 * @returns Object with the validation results: 2 arrays with the elements and the groups.
 */
export function Validate (data = null) {
         // no data to show
         if (!data || !data.hasOwnProperty('elements')) {            
            return null; 
        }

        this.has_errors = false;
        this.has_warnings = false;

        this.validation_results = {elements: [], groups: []};

        data.elements.forEach(element => {
            const [errors, warnings] = this.validateElement(element);
            this.validation_results.elements.push({id: element.id, name:element.name, label:element.label, errors, warnings});
        })
        data.groups.forEach(group => {
            const [errors, warnings] = this.validateGroup(group);
            this.validation_results.groups.push({id: group.id, name:group.name, errors, warnings});
        })
        return this;
}

Validate.prototype = {

    getResults: function() {
        return this.validation_results;
    },

    validateGroup: function(group) {
        //console.log("GP > ", group);
        const enabled = group.enabled;
        const visible = group.visible;
        if (!(enabled && visible)) return [null, null];
        const error_messages = [];
        const warning_messages = [];
        if (group.selected_elements.length == 0) {
            if (group.required) {// === 'yes') {
                error_messages.push(Translator.translate(MESSAGE_NOTHING_SELECTED));
                this.has_errors = true;
            } else {
                warning_messages.push(Translator.translate(MESSAGE_NOTHING_SELECTED));
                this.has_warnings = true;
            }
        }
        /*
        if (group.hasOwnProperty('database') && !group.database) {
            warning_messages.push(Translator.translate(MESSAGE_NO_DATABASE_FIELD));
            this.has_warnings = true;
        }
        */
        return [error_messages, warning_messages];
    },

    validateElement: function(element) {
        const validations = element.validations
        const enabled = element.enabled;
        const visible = element.visible;
        if (!(enabled && visible)) return [null, null];
        const value = element.value;
        const type = typeof value;
        const error_messages = [];
        const warning_messages = [];
        let _value = value;
        if (value) {
            if (type === 'object') {
                // if gps
                if (value.hasOwnProperty('lat') && value.lat) {
                    _value = value.lat + ',' + value.lng;
                } else
                    _value = null;
                // if barcode
                if (value.hasOwnProperty('code') && value.code) {
                    _value = value.code;
                } else
                    _value = null;
            }
        }

        if (!_value && validations.required) {// === 'yes') {
            error_messages.push(Translator.translate(MESSAGE_NO_VALUE));
            this.has_errors = true;
        } else if (!_value) {
            warning_messages.push(Translator.translate(MESSAGE_NO_VALUE));
            this.has_warnings = true;
        }

        if (validations.hasOwnProperty('uppercase') && validations.uppercase) {// === 'yes') {
            if (_value && _value !== _value.toUpperCase()) {
                error_messages.push(Translator.translate(MESSAGE_NO_UPPERCASE));
                this.has_errors = true;
            }
        }

        if (validations.hasOwnProperty('max-length')) {
            if (_value && _value.length > validations['max-length']) {
                error_messages.push(Translator.translate(MESSAGE_LENGTH_EXCEEED));
                this.has_errors = true;
            }
        }
        /*
        if (element.hasOwnProperty('database') && !element.database) {
            warning_messages.push(Translator.translate(MESSAGE_NO_DATABASE_FIELD));
            this.has_warnings = true;
        }
        */
        if (validations.hasOwnProperty('max') && _value > validations.max) {
            error_messages.push(Translator.translate(MESSAGE_MAX_EXCEEDED));
            this.has_errors = true;
        }
        if (validations.hasOwnProperty('min') && _value < validations.min) {
            error_messages.push(Translator.translate(MESSAGE_MIN_EXCEEDED));
            this.has_errors = true;
        }

        if (validations.hasOwnProperty('pattern') && validations.pattern && validations.pattern !=='' && validations.pattern !=='Default') {
            if (_value && !_value.match("^"+validations.pattern+"$")) {                
                error_messages.push(Translator.translate(MESSAGE_INCORRECT_FORMAT));
                this.has_errors = true;
            }
        }
        
        return [error_messages, warning_messages];
    },

    hasErrors: function() {
        return this.has_errors;
    }, 
    hasWarnings: function() {
        return this.has_warnings;
    }, 

}


