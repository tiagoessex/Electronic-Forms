
import { FormBaseElement } from './FormBaseElement.js';
import { Img, AwesomeIconAndButton } from '/static/js/ui/BuildingBlocks.js';
import { PROPERTIES_ID } from '/static/designer/js/constants/constants.js';
import { GPS_INPUT } from '/static/js/urls.js';
import { HEXtoRGBA } from '/static/js/jscolor.js';
import { centerLeafletMapOnMarker } from '/static/js/jsmap.js';
import { Translator } from '/static/js/Translator.js';
import { GeoErrors } from '../../../GeoErrors.js';


export class GpsMapElement extends FormBaseElement {
    constructor(context, props, id) {
        super(context, props);

        this.context = context;

        this.map = null;
        this.marker = null;
        this.enabled = true;
        this.auto = true;

        this.setId("fv-gps-" + id);

        const _enabled = props[PROPERTIES_ID.ENABLEDPROPERTY] === 'yes';
        const height = props[PROPERTIES_ID.HEIGHTPROPERTY];
        const width = props[PROPERTIES_ID.WIDTHPROPERTY];
        const border = props[PROPERTIES_ID.BORDERPROPERTY];
        const border_radius = props[PROPERTIES_ID.BORDERRADIUSPROPERTY];
        const border_width = props[PROPERTIES_ID.BORDERWIDTHPROPERTY];
        const backcolor = props[PROPERTIES_ID.BACKCOLORPROPERTY];
        const back_alpha = props[PROPERTIES_ID.BACKALPHAPROPERTY];
        const color = props[PROPERTIES_ID.COLORPROPERTY];

        //this.addClass('fv-gps-coordinates');
        this.setStyle('width', width + 'px');
        this.setStyle('height', height + 'px');
        this.setStyle('border', border);
        this.setStyle('border-width', border_width + 'px');
        this.setStyle('border-radius', border_radius + 'px');
        this.setStyle('-webkit-border-radius', border_radius + 'px');
        this.setStyle('-moz-border-radius', border_radius + 'px'); 
        this.setStyle("background-color", HEXtoRGBA(backcolor, back_alpha));
        this.setStyle('color', color);

        this.img = new Img(GPS_INPUT).attachTo(this);
        this.img.setStyle("background-repeat","no-repeat");
        this.img.setStyle("background-position","center");
        this.img.setStyle('-webkit-background-size','cover');
        this.img.setStyle('-moz-background-size','cover');
        this.img.setStyle('-o-background-size','cover');
        this.img.setStyle('background-size','cover');
        this.img.setStyle('width','100%');
        this.img.setStyle('height','100%');        

        if (context.isExport) return;

        this.button = new AwesomeIconAndButton('','fas fa-times').attachTo(this);
        this.button.addClass('fv-remove-button no-print');
        this.button.setStyle('display','none');
        this.button.setStyle('z-index','9999');         

        const ref = this;        

        $(this.button.dom).on('click',function() {
            ref.clear();
            ref.auto = true;
            ref.button.setStyle('display','none');
            context.signals.onFormValueChanged.dispatch(ref.real_id, ref.getCoordinates(), true); 
         });

        $(this.img.dom).on('click',function(e) {
            if (!ref.enabled || !ref.auto) return false;
            if (!window.isSecureContext) {
                context.signals.onError.dispatch(Translator.translate("You are working in a non secure context. Geolocation is not available."),"[GpsMapElement::ctor]");
                return false;
              }            
            if (!navigator.geolocation) {
                context.signals.onError.dispatch(Translator.translate("Geolocation not supported in this browser!"),"[GpsMapElement::ctor]");
                return false;
            }
            navigator.geolocation.getCurrentPosition((pos) => {
                ref.button.setStyle('display','inline');
                //img.detach();
                const crd = pos.coords;
                //const accuracy = crd.accuracy;
                ref.setMarkCoord(crd.latitude, crd.longitude);
                ref.context.signals.onFormValueChanged.dispatch(ref.real_id, ref.getCoordinates(), false);                
            }, (err) => {
                const error_msg = GeoErrors(err);
                context.signals.onError.dispatch(error_msg,"[GpsMapElement::ctor]");
                //context.signals.onError.dispatch(err.code + ': ' + err.message);
            }, 
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            });
        })

        if (!_enabled) {
            this.enabled = false;
            this.img.addClass('elementdisabled');
        }        

        context.signals.onViewChanged.add((tab) => {
            if (ref.map) 
                setTimeout(function(){ 
                    ref.map.invalidateSize();
                }, 400);
        });

        context.signals.onEnabled.add((id) => {
            if (id === this.real_id || id === this.section) {
                this.enabled = true;
                this.img.removeClass('elementdisabled');
            }
        })
        context.signals.onDisabled.add((id) => {
            if (id === this.real_id || id === this.section) {                
                this.enabled = false;
                this.img.addClass('elementdisabled');
            }
        })
        
        context.signals.onListValueChanged.add((id, coord, reset) => {
            if (id === this.real_id) {
                this.button.setStyle('display',reset?'none':'inline');
                if (reset) {
                    this.clear();
                    this.auto = true;
                } else {
                    this.setMarkCoord(coord.lat, coord.lng);
                }
            }
        })
    }

    clear() {
        if (this.map){
            this.map.eachLayer(function(layer){
                layer.remove();
            });
            this.map.remove();
            this.map = null;
            this.marker = null;
        }
    }    

    setMap() {        
        //$(this.dom.id).empty();
        this.map = L.map(this.dom.id).setView([51.505, -0.09], 9);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(this.map);

        const ref = this;
        this.map.on("click", function(e){
            if (!ref.enabled) return false;
            ref.setMarkCoord(e.latlng.lat, e.latlng.lng);
            ref.context.signals.onFormValueChanged.dispatch(ref.real_id, ref.getCoordinates(), false);
         })        
    }

    setMarkCoord(latitude, longitude) {
        if (!latitude || !longitude) return;
        if (!this.map) {
            this.setMap();
        }
        if (!this.marker) {
            this.marker = L.marker([latitude, longitude]).addTo(this.map);
        } else {
            const newLatLng = new L.LatLng(latitude, longitude);
            this.marker.setLatLng(newLatLng);
        }
        centerLeafletMapOnMarker(this.map, this.marker);
        this.auto = false;
        //this.context.signals.onFormValueChanged.dispatch(this.real_id, this.getCoordinates());
    }

    getCoordinates() {
        if (this.marker)
            return this.marker.getLatLng();
        else
            return {lat: null, lng: null}
    }


    save() {
        super.save();
        this.status.value = this.getCoordinates();
        this.status.enabled = this.enabled;
        return new Promise((resolve) => resolve(this.status));
    }

    async restore(data) {
        super.restore(data);
        this.setMarkCoord(this.status.value.lat, this.status.value.lng);
        this.button.setStyle('display',this.status.value.lat?'inline':'none');
        this.enabled = this.status.enabled;
        if (this.status.enabled) {
            this.enabled = true;
            this.button.removeAttribute('disabled');
            this.img.removeClass('elementdisabled');
        } else {
            this.enabled = false;
            this.button.setAttribute('disabled','');
            this.img.addClass('elementdisabled');
        }
        return Promise.resolve();
    }      
}

