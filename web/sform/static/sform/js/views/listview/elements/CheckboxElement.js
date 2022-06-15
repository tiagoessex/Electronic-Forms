
import { PROPERTIES_ID } from '/static/designer/js/constants/constants.js';
import { Input, Label, Span } from '/static/js/ui/BuildingBlocks.js';
import { BaseElement } from '../../BaseElement.js';


export class CheckboxElement extends BaseElement {
    constructor(context, props, id, type) {
        super(context, props);

        const _enabled = props[PROPERTIES_ID.ENABLEDPROPERTY] === 'yes';
        const _show_label = props[PROPERTIES_ID.SHOWLABELPROPERTY] === 'yes';
        const checked = props[PROPERTIES_ID.CHECKEDPROPERTY];

        // required for checks and radios
        this.real_id = props[PROPERTIES_ID.IDPROPERTY];
        this.section = props[PROPERTIES_ID.SECTIONPROPERTY];

        let label =  props[PROPERTIES_ID.LABELPROPERTY];
        if (label === '') {
            label = props[PROPERTIES_ID.NAMEPROPERTY];
            if (label === '') {
                label = this.real_id;
            }                    
        } 

        

        this.addClass('form-check');

        //const _label = new Label(_show_label?label:'').attachTo(this);
        const _label = new Label(label).attachTo(this);
        //_label.addClass('lv-label');
        _label.addClass('lv-checkradio-container');
        _label.setStyle('height','100%');


        this.input = new Input();
        this.input.setAttribute('type', 'checkbox');
        if (checked === 'yes') this.input.setAttribute('checked', '');
        this.input.setId(id);
        this.input.attachTo(_label);
        this.input.setAttribute('data-type', type);
        
        

        const span = new Span();
        span.addClass('lv-checkradio-checkmark');
        span.attachTo(_label);


        // connection to its equivalent in the listview
        $(this.input.dom).on('change', (event) => {
            context.signals.onListValueChanged.dispatch(this.real_id, event.currentTarget.checked);
            /*
            if (event.currentTarget.checked) {
                document.getElementById(this.real_id + ID_FORMVIEW_APPEND).checked = true;
            } else {
                document.getElementById(this.real_id + ID_FORMVIEW_APPEND).checked = false;
            }
            */
        });

        if (!_enabled) {
            this.input.setAttribute('disabled',''); 
        } 

        context.signals.onEnabled.add((id) => {
            if (id === this.real_id || id === this.section || id === this.group) {
                this.input.removeAttribute('disabled');
            }
        })
        context.signals.onDisabled.add((id) => {
            if (id === this.real_id || id === this.section || id === this.group) {                
                this.input.setAttribute('disabled','');                
            }
        })
        context.signals.onSelected.add((id) => {
            if (id === this.real_id || id === this.section || id === this.group) {
                this.input.dom.checked = true;
            }
        })
        context.signals.onUnselected.add((id) => {
            if (id === this.real_id || id === this.section || id === this.group) {                
                this.input.dom.checked = false;
            }
        })

        context.signals.onFormValueChanged.add((id, value) => {
            if (id === this.real_id) {
                this.input.dom.checked = value;
            }
        })        

    }


    save() {
        super.save();
        this.status.enabled = !this.input.hasAttribute('disabled');
        this.status.selected = this.input.dom.checked;
        return this.status;
    }

    async restore(data) {
        super.restore(data);

        if (this.status.enabled)
            this.input.removeAttribute('disabled');
        else
            this.input.setAttribute('disabled','');
        if (this.status.selected)
            this.input.dom.checked = true;
        else
            this.input.dom.checked = false;

        return Promise.resolve();
    }     
}
