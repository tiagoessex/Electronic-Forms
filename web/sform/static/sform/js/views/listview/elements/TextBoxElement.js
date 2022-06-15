
import { PROPERTIES_ID } from '/static/designer/js/constants/constants.js';
import { ListBaseElement } from './ListBaseElement.js';
import { Div, TextArea, Label } from '/static/js/ui/BuildingBlocks.js';


export class TextBoxElement extends ListBaseElement {
    constructor(context, props, id) {
        super(context, props);


        const _enabled = props[PROPERTIES_ID.ENABLEDPROPERTY] === 'yes';
        const placeholder = props[PROPERTIES_ID.PLACEHODLERPROPERTY];
        const maxlength = props[PROPERTIES_ID.MAXLENGTHPROPERTY];
        let label =  props[PROPERTIES_ID.LABELPROPERTY];
        if (label === '') {
            label = props[PROPERTIES_ID.NAMEPROPERTY];
            if (label === '') {
                label = this.real_id;
            }                    
        } 

        const form_group = new Div();
        form_group.addClass('form-group');
        form_group.attachTo(this.body);

        const _label = new Label(label);
        _label.addClass('lv-label');
        _label.attachTo(form_group);

        this.input = new TextArea();
        this.input.setAttribute('placeholder', placeholder);
        this.input.setAttribute('maxlength', maxlength);  
        this.input.addClass('form-control');
        this.input.setId(id);
        this.input.attachTo(form_group);
        
        const ref = this;

        // connection to its equivalent in the formview
        $(this.input.dom).on('change', function() {
            context.signals.onListValueChanged.dispatch(ref.real_id, ref.input.dom.value);
        })

        if (!_enabled) {
            this.input.setAttribute('disabled','');
        }         
        
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

    save() {
        super.save();
        this.status.value = this.input.getValue();
        this.status.enabled = !this.hasAttribute('disabled');
        return this.status
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
