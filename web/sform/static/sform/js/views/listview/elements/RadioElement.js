
import { PROPERTIES_ID } from '/static/designer/js/constants/constants.js';
import { Input, Label, Span } from '/static/js/ui/BuildingBlocks.js';
import { ID_LISTVIEW_APPEND } from '../../../constants.js';
import { BaseElement } from '../../BaseElement.js';
import { EVENTS } from '/static/designer/js/ea/constants.js';

export class RadioElement extends BaseElement {
    constructor(context, props, id, group, type) {
        super(context, props);

        this.current = false;   // CURRENT CHECK STATUS - can't use ischeck in this case

        const _enabled = props[PROPERTIES_ID.ENABLEDPROPERTY] === 'yes';
        const _show_label = props[PROPERTIES_ID.SHOWLABELPROPERTY] === 'yes';
        const checked = props[PROPERTIES_ID.CHECKEDPROPERTY];
        
        // required for checks and radios
        this.real_id = props[PROPERTIES_ID.IDPROPERTY];
        this.section = props[PROPERTIES_ID.SECTIONPROPERTY];
        
        let label =  props[PROPERTIES_ID.NAMEPROPERTY];
        if (label === '') {
            label = props[PROPERTIES_ID.LABELPROPERTY];
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
        this.input.setAttribute('type', 'radio');
        this.input.setAttribute('name', group + ID_LISTVIEW_APPEND);
        this.input.setAttribute('value', id);
        if (checked === 'yes') this.input.setAttribute('checked', '')
        this.input.addClass('form-check-input');
        this.input.setId(id);
        this.input.attachTo(_label);
        this.input.setAttribute('data-type', type);
        
        const span = new Span();
        span.addClass('lv-checkradio-checkmark');
        span.attachTo(_label);
        span.setStyle('border-radius', '50%');
        span.setStyle('-webkit-border-radius', '50%');
        span.setStyle('-moz-border-radius', '50%');        

        const self = this;
        // connection to its equivalent in the formview
        $(this.input.dom).on('change', (event) => {
            context.signals.onListValueChanged.dispatch(this.real_id);
            $("input[name='" + group +  ID_LISTVIEW_APPEND + "']").trigger('custom', id);
        });

        // using custom event since radio does not trigger a change event when uncheck
        $(this.input.dom).bind("custom", function(event, checked_id){
            if (checked_id !== id && self.current) {
                self.current = false;
                context.signals.onEventUnselected.dispatch(self.real_id , EVENTS.onUnSelected, true);
            } else {
                self.current = true;
            }
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
        context.signals.onFormValueChanged.add((_id) => {
            if (_id === this.real_id) {
                this.input.dom.checked = true;
                $("input[name='" + group +  ID_LISTVIEW_APPEND + "']").trigger('custom', id);
            }
        })        
    }

    save() {
        super.save();
        this.status.enabled = !this.input.hasAttribute('disabled');
        this.status.selected = this.input.dom.checked;
        return this.status
    }

    async restore(data) {
        super.restore(data);

        if (this.status.enabled)
            this.input.removeAttribute('disabled');
        else
            this.input.setAttribute('disabled','');
        if (this.status.selected) {
            this.input.dom.checked = true;
            this.current = true;
        } else {
            this.input.dom.checked = false;
            this.current = false;            
        }

        return Promise.resolve();
    }      
}
