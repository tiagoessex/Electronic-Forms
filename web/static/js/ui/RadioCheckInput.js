
import { Div, Label, Input } from './BuildingBlocks.js';

/**
 * Create a bootstrap form-check, either a radio or a checkbox.
 * Label on the right.
 * Example:
 *      new RadioCheckInput('XXXXXXXXX', '\d{9}', 'prop-pattern', 'radio').attachTo(something);
 * 
 * Note: uses the Bootstrap 4 Custom Forms style.
 */
export class RadioCheckInput extends Div {
    /**
     * Constructor
     * @param {string} type radio | checkbox (default: radio).
     * @param {string} id Id. If null, then a randomly generated one will be provided.
     * @param {string} label_text Label.
     * @param {string} value Value.
     * @param {string} name Input name.     
     * @param {bool} checked Whether or not it's checked (default: false).
     */    
    constructor (type="radio", id=null, label_text=null, value=null, name=null, checked = false, onChange=null) {
        super();
        const self = this;
        
        if (!id) 
            this.id = uuidv4();
        else
            this.id = id;

        this.addClass('custom-control');
        this.addClass('custom-' + type);
     
        this.input = new Input();
        this.input.setAttribute('type', type);
        if (name) this.input.setAttribute('name', name);
        if (value) this.input.setAttribute('value', value);
        if (checked) this.input.setAttribute('checked', '');
        this.input.setId(this.id);
        this.input.addClass('custom-control-input');  
        this.input.attachTo(this);                

        if (label_text) {
            const label = new Label();
            label.addClass('custom-control-label')
            label.setAttribute('for', this.id);
            label.setTextContent(label_text);
            label.attachTo(this);
        }

        if (onChange) {
            $(this.input.dom).change(function() {
                onChange(self.isChecked());
            })
        }
    }

    isChecked() {
        return this.input.dom.checked;
    }

    check() {
        this.input.dom.checked = true;
    }

    uncheck() {
        this.input.dom.checked = false;
    }
    
  }
  
  
  