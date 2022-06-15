
import { PROPERTIES_ID } from '/static/designer/js/constants/constants.js';
import { ListBaseElement } from './ListBaseElement.js';
import { Div, Input, Label, AwesomeIconAndButton } from '/static/js/ui/BuildingBlocks.js';

export class FoodexElement extends ListBaseElement {
    constructor(context, props, id) {
        super(context, props);

        this.context = context;

        const _enabled = props[PROPERTIES_ID.ENABLEDPROPERTY] === 'yes';
        const placeholder = props[PROPERTIES_ID.PLACEHODLERPROPERTY];
        const pattern = props[PROPERTIES_ID.PATTERNPROPERTY];
        const maxlength = props[PROPERTIES_ID.MAXLENGTHPROPERTY];
        let label =  props[PROPERTIES_ID.LABELPROPERTY];
        if (label === '') {
            label = props[PROPERTIES_ID.NAMEPROPERTY];
            if (label === '') {
                label = this.real_id;
            }
        } 

        const _label = new Label(label);
        _label.addClass('lv-label');
        _label.attachTo(this.body);

        const input_group = new Div();
        input_group.addClass('input-group');
        input_group.attachTo(this.body);

        this.input = new Input();
        this.input.setAttribute('type', 'text');
        this.input.setAttribute('placeholder', placeholder);
        this.input.setAttribute('pattern', pattern);
        this.input.setAttribute('maxlength', maxlength);        
        this.input.addClass('form-control');
        this.input.setId(id);
        this.input.attachTo(input_group);

        const div_append = new Div().attachTo(input_group);
        div_append.addClass('input-group-append');

        this.btn = new AwesomeIconAndButton('','fas fa-search').attachTo(div_append);
        this.btn.addClass('btn');
        this.btn.addClass('btn-success');
        this.btn.setAttribute('type','button');




        const ref = this;
        $(this.btn.dom).on('click', function() {
            context.signals.onFoodexModal.dispatch((value, what) => {
                ref.input.setValue(value);
                context.signals.onListValueChanged.dispatch(ref.real_id, value); 
            }, null, error => {
                context.signals.onError.dispatch(error,"[FoodexElement::ctor]");
            }); 
        })

        // connection to its equivalent in the formview
        $(this.input.dom).on('change', function(e) {
            ref.change(e.target.value);
        })
        $(this.input.dom).on('paste', function(e) {
            ref.change(e.target.value);
        })

        if (!_enabled) {
            this.input.setAttribute('disabled','');
            this.btn.setAttribute('disabled','');
        } 

        context.signals.onEnabled.add((id) => {
            if (id === this.real_id || id === this.section) {
                this.input.removeAttribute('disabled');
                this.btn.removeAttribute('disabled');
            }
        })
        context.signals.onDisabled.add((id) => {
            if (id === this.real_id || id === this.section) {                
                this.input.setAttribute('disabled','');
                this.btn.setAttribute('disabled','');
            }
        })

        context.signals.onFormValueChanged.add((id, value) => {
            if (id === this.real_id) {
                this.input.setValue(value);
            }
        })
        
    }

  
    
    change(value) {
        this.context.signals.onListValueChanged.dispatch(this.real_id, value);
    }
    
    save() {
        super.save();
        this.status.value = this.input.getValue();
        this.status.enabled = !this.input.hasAttribute('disabled');
        return new Promise((resolve) => resolve(this.status));
    }

    async restore(data) {
        super.restore(data);
        this.input.setValue(this.status.value);
        if (this.status.enabled) {
            this.input.removeAttribute('disabled');
            this.btn.removeAttribute('disabled');
        } else {
            this.input.setAttribute('disabled','');
            this.btn.setAttribute('disabled','');
        }

        return Promise.resolve();
    }     
}
