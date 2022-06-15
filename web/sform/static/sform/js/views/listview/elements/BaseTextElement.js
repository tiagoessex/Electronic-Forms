
import { PROPERTIES_ID } from '/static/designer/js/constants/constants.js';
import { ListBaseElement } from './ListBaseElement.js';
import { Div, Input, Label } from '/static/js/ui/BuildingBlocks.js';
import { ID_FORMVIEW_APPEND } from '../../../constants.js';

export class BaseTextElement extends ListBaseElement {
    constructor(context, props, id, type) {
        super(context, props);

        this.context = context;

        const _enabled = props[PROPERTIES_ID.ENABLEDPROPERTY] === 'yes';        
        const placeholder = props[PROPERTIES_ID.PLACEHODLERPROPERTY];
        const pattern = props[PROPERTIES_ID.PATTERNPROPERTY];
        const maxlength = props[PROPERTIES_ID.MAXLENGTHPROPERTY];
        let label =  props[PROPERTIES_ID.LABELPROPERTY];
        if (!label || label === '') {
            label = props[PROPERTIES_ID.NAMEPROPERTY];
            if (!label || label === '') {
                label = this.real_id;
            }
        } 
        //console.log(props[PROPERTIES_ID.LABELPROPERTY], props[PROPERTIES_ID.NAMEPROPERTY]);

        const form_group = new Div();
        form_group.addClass('form-group');
        form_group.attachTo(this.body);

        const _label = new Label(label);
        _label.addClass('lv-label');
        _label.attachTo(form_group);

        this.input = new Input().attachTo(form_group);
        this.input.setAttribute('type', type);
        this.input.setAttribute('placeholder', placeholder);
        if (pattern !== '' && pattern !== 'Default') this.input.setAttribute('pattern', pattern);
        this.input.setAttribute('maxlength', maxlength);        
        this.input.addClass('form-control');
        this.input.setId(id);

        if (!_enabled) this.input.setAttribute('disabled','');


        // connection to its equivalent in the formview
        const ref = this;
        $(this.input.dom).on('change', function(e) {
            ref.change(e.target.value);
        })
        $(this.input.dom).on('paste', function(e) {
            ref.change(e.target.value);
        })        

        context.signals.onEnabled.add((id) => {
            if (id === this.real_id || id === this.section) {
                this.input.removeAttribute('disabled');
            }
        })
        context.signals.onDisabled.add((id) => {
            if (id === this.real_id || id === this.section) {                
                this.input.setAttribute('disabled','');
            }
        })
        context.signals.onFormValueChanged.add((id, value) => {
            if (id === this.real_id) {
                this.input.dom.value = value;
            }
        })        
        
    }

    change(value) {
        //document.getElementById(this.real_id + ID_FORMVIEW_APPEND).value=value;
        this.context.signals.onListValueChanged.dispatch(this.real_id, value); 
    }    

    save() {
        super.save();
        this.status.value = this.input.getValue();
        this.status.enabled = !this.input.hasAttribute('disabled');
        //return this.status;
    }

    async restore(data) {
        super.restore(data);
        this.input.setValue(this.status.value);
        if (this.status.enabled)
            this.input.removeAttribute('disabled');
        else
            this.input.setAttribute('disabled','');

        return Promise.resolve();
    }     
}
