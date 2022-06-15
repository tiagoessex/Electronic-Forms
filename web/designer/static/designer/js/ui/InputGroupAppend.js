import { Div, Input, ButtonAndAwesomeIcon } from '/static/js/ui/BuildingBlocks.js';

/**
 * A bootstrap 4 input group with an appended button.
 */
export class InputGroupAppend extends Div {
    /**
     * 
     * @param {string} id ID of the input
     * @param {string} name Name of the input.
     * @param {string} value Default value of the input.
     * @param {string} type Input type.
     * @param {string} placeholder Placeholder.
     * @param {string} icon Font awesome.
     * @param {string} btn_color Bootstrap 4 color scheme: primary | success | ...
     * @param {function} onChange Called when input changes.
     * @param {function} onClickButton Called when button clicked.
     */
    constructor(id=null, name=null, value=null, type='text', placeholder=null, 
            icon='fa fa-plus', btn_color='success', 
            onChange = null, onClickButton = null) {
        super();

        this.onChange = onChange;
        this.onClickButton = onClickButton;
        const self = this;

        this.addClass('input-group');

        this.input = new Input().attachTo(this);
        this.input.addClass("form-control");
        this.input.setAttribute('type',type);
        if (name) this.input.setAttribute('name', name);
        if (value) this.input.setAttribute('value', value);
        if (id) this.input.setAttribute('id',id);
        if (placeholder) this.input.setAttribute('placeholder',placeholder);

        const append = new Div().attachTo(this);
        append.addClass('input-group-append');

        const btn = new ButtonAndAwesomeIcon('',icon).attachTo(append);
        btn.addClass('btn');
        btn.addClass('btn-' + btn_color);
        btn.setAttribute('type','button');

        this.input.dom.addEventListener('change', function(e) {
            if (self.onChange) self.onChange(e.target.value);
            e.target.value = '';
        } );

        btn.dom.addEventListener('click', function(e) {
            // also pass the reference to self
            if (self.onClickButton) self.onClickButton(self.input.value, self);
            self.input.dom.focus();
        } );
    }
    
    /**
     * Focuses the input.
     */
    focus() {
        this.input.dom.focus();
    }

    /**
     * Sets the input value.
     * @param {string} value Input value.
     */
    setValue(value) {
        this.input.setValue(value);
    }
}