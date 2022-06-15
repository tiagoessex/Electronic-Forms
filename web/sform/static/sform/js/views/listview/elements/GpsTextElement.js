
import { PROPERTIES_ID } from '/static/designer/js/constants/constants.js';
import { ListBaseElement } from './ListBaseElement.js';
import { Div, Input, Label, AwesomeIconAndButton } from '/static/js/ui/BuildingBlocks.js';
import { Translator } from '/static/js/Translator.js';
import { GeoErrors } from '../../../GeoErrors.js';


export class GpsTextElement extends ListBaseElement {
    constructor(context, props, id) {
        super(context, props);

        this.context = context;
        this.value = {lat: null, lng: null};

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
       // _label.addClass('float-left');
        _label.attachTo(this.body);

        const input_group = new Div();
        input_group.addClass('input-group');
        input_group.attachTo(this.body);

        this.input = new Input();
        this.input.setAttribute('type', 'text');
        this.input.setAttribute('placeholder', placeholder);
        if (pattern !== '' && pattern !== 'Default') this.input.setAttribute('pattern', pattern);
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
            if (!window.isSecureContext) {
                context.signals.onError.dispatch(Translator.translate("You are working in a non secure context. Geolocation is not available."),"[GpsTextElement::ctor]");
                return false;
              }            
            if (!navigator.geolocation) {
                context.signals.onError.dispatch(Translator.translate("Geolocation not supported in this browser!"),"[GpsTextElement::ctor]");
                return false;
            }            
            navigator.geolocation.getCurrentPosition((pos) => {
                const crd = pos.coords;
                ref.setCoordinates(crd.latitude, crd.longitude);
                ref.context.signals.onFormValueChanged.dispatch(ref.real_id, ref.getCoordinates());
            }, (err) => {
                const error_msg = GeoErrors(err);
                context.signals.onError.dispatch(error_msg,"[GpsTextElement::ctor]");
                //context.signals.onError.dispatch(err.code + ': ' + err.message);
            }, 
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            });
        })


        // connection to its equivalent in the formview
        $(this.input.dom).on('change', function(e) {
            ref.change(change);
        })
        $(this.input.dom).on('paste', function(e) {
            ref.change(change);
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

        context.signals.onFormValueChanged.add((id, coord) => {
            if (id === this.real_id) {
                this.setCoordinates(coord.lat, coord.lng);
            }
        })
        
    }

    getCoordinates() {
        return this.value;
    }

    setCoordinates(lat, lng) {
        if (!lat || !lng) return;          
        this.value = {lat, lng};
        this.input.setValue(lat + ', ' + lng);
        //this.context.signals.onListValueChanged.dispatch(this.real_id, this.value);
    }
    
    change(value) {
        const coords = value.split(",");
        if (coords.length > 1) {
            this.setCoordinates(coords[0], coords[1]);
            this.context.signals.onFormValueChanged.dispatch(this.real_id, this.getCoordinates());
        }
    }
    
    save() {
        super.save();
        this.status.value = this.getCoordinates();
        this.status.enabled = !this.input.hasAttribute('disabled');
        return this.status
    }

    async restore(data) {
        super.restore(data);
        this.setCoordinates(this.status.value.lat, this.status.value.lng);
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
