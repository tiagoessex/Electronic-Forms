
import { Div, Input, Label } from '/static/js/ui/BuildingBlocks.js';

/**
 * Bootstrap 4 input from group, with optional label.
 */
export class FormGroupInput extends Div {
    /**
     * Constructor.
     * @param {string} id ID.
     * @param {string} name Input name.
     * @param {string} value Default value.
     * @param {string} label Label text.
     * @param {string} type Input type: text | number | date | ....
     * @param {string} placeholder Input placeholder.
     */
    constructor(id, name=null, value=null, label=null, type='text', placeholder=null) {
        super();

        this.addClass('form-group');

        if (label) {
            const _label = new Label(label).attachTo(this);
            _label.setAttribute('for',id) 
        }

        this.input = new Input().attachTo(this);
        this.input.setAttribute('type',type);
        if (name) this.input.setAttribute('name',name);
        if (value) this.input.setAttribute('value', value)
        if (placeholder && placeholder !== '') this.input.setAttribute('placeholder', placeholder)
        this.input.addClass('form-control');
        this.input.setId(id);
    }

    /**
     * Enables/disables the input.
     * @param {boolean} bEnable True to enable editing.
     */
    enable(bEnable=true) {
        if (bEnable) this.input.removeAttribute('disabled','');
        else this.input.setAttribute('disabled','');
    }

    /**
     * Focus the input.
     */
    focus() {
        this.input.dom.focus();
    }    
}