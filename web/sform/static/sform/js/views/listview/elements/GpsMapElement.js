
import { PROPERTIES_ID } from '/static/designer/js/constants/constants.js';
import { ListBaseElement } from './ListBaseElement.js';
import { Img, Text, Div, Button } from '/static/js/ui/BuildingBlocks.js';
import { GPS_INPUT } from '/static/js/urls.js';
import { centerLeafletMapOnMarker } from '/static/js/jsmap.js';
import { Translator } from '/static/js/Translator.js';
import { GeoErrors } from '../../../GeoErrors.js';


export class GpsMapElement extends ListBaseElement {
    constructor(context, props, id) {
        super(context, props);

        this.context = context;

        this.map = null;
        this.marker = null;
        this.enabled = true;
        this.auto = true;

        const _enabled = props[PROPERTIES_ID.ENABLEDPROPERTY] === 'yes';
        const height = props[PROPERTIES_ID.HEIGHTPROPERTY];
        const width = props[PROPERTIES_ID.WIDTHPROPERTY];
        const border = props[PROPERTIES_ID.BORDERPROPERTY];
        const border_radius = props[PROPERTIES_ID.BORDERRADIUSPROPERTY];
        const border_width = props[PROPERTIES_ID.BORDERWIDTHPROPERTY];
        const color = props[PROPERTIES_ID.COLORPROPERTY];




        let label =  props[PROPERTIES_ID.LABELPROPERTY];
        if (label === '') {
            label = props[PROPERTIES_ID.NAMEPROPERTY];
            if (label === '') {
                label = id.substring(0,id.lastIndexOf('_'));
            }                    
        } 

        const _label = new Text(label);
        _label.attachTo(this.body);

        this.map_area = new Div().attachTo(this.body);
        this.map_area.setStyle('width', width + 'px');
        this.map_area.setStyle('height', height + 'px');
        this.map_area.setStyle('border', border);
        this.map_area.setStyle('border-width', border_width + 'px');
        this.map_area.setStyle('border-radius', border_radius + 'px');
        this.map_area.setStyle('-webkit-border-radius', border_radius + 'px');
        this.map_area.setStyle('-moz-border-radius', border_radius + 'px'); 
        this.map_area.setStyle('color', color);        
        this.map_area.addClass('mx-auto');
        this.map_area.addClass('d-block');
        this.map_area.addClass('mb-2');
        this.map_area.setId("lv-gps" + id);


        this.img = new Img(GPS_INPUT).attachTo(this.map_area);
        this.img.setStyle('width', width + 'px');
        this.img.setStyle('height', height + 'px');        
        this.img.addClass('mx-auto');
        this.img.addClass('d-block');
        this.img.addClass('img-thumbnail');

        this.button = new Button('Clear').attachTo(this.body);
        this.button.addClass('btn');
        this.button.addClass('btn-warning');
        this.button.addClass('btn-sm');
        this.button.addClass('mx-auto');
        this.button.addClass('d-none');
        this.button.setStyle('width', width + 'px');

        this.text = new Text().attachTo(this);
        this.text.setStyle('background-color', 'black');
        this.text.setStyle('color', 'white');
        this.text.setStyle('text-align', 'center');
        this.text.addClass('mb-2');
        this.text.setId(id);


        const ref = this;

        $(this.button.dom).on('click',function() {
            ref.clear();
            ref.auto = true;
            $(ref.button.dom).removeClass('d-block');
            context.signals.onListValueChanged.dispatch(ref.real_id, ref.getCoordinates(), true); 
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
                $(ref.button.dom).addClass('d-block');

                const crd = pos.coords;
                ref.setMarkCoord(crd.latitude, crd.longitude);
                ref.context.signals.onListValueChanged.dispatch(ref.real_id, ref.getCoordinates(), false);
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

        this.context.signals.onViewChanged.add((tab) => {
            if (ref.map) 
                setTimeout(function(){ 
                    ref.map.invalidateSize();
                }, 400);
        });
        this.context.signals.onSectionOpened.add((opened_section) => {
            if (ref.map && opened_section === props[PROPERTIES_ID.SECTIONPROPERTY]) 
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

        context.signals.onFormValueChanged.add((id, coord, reset) => {
            if (id === this.real_id) {
                if (reset) {
                    this.clear();
                    this.auto = true;
                    this.button.removeClass('d-block');
                } else {
                    this.setMarkCoord(coord.lat, coord.lng);
                    this.button.addClass('d-block');
                }
            }
        })      

    }

    clear() {
        if (this.map ){
            this.map.eachLayer(function(layer){
                layer.remove();
            });
            this.map.remove();
            this.map = null;
            this.marker = null;
        }
    }

    setMap() {        
        $(this.map_area.dom.id).empty();
        this.map = L.map(this.map_area.dom.id).setView([51.505, -0.09], 9);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(this.map);

        const ref = this;
        this.map.on("click", function(e){
            if (!ref.enabled) return false;
            ref.setMarkCoord(e.latlng.lat, e.latlng.lng);
            ref.context.signals.onListValueChanged.dispatch(ref.real_id, ref.getCoordinates(), false);
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
        const coord = latitude + ", " + longitude;
        this.text.setTextContent(coord);
        this.auto = false;
        //this.context.signals.onListValueChanged.dispatch(this.real_id, this.getCoordinates());
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
        return this.status;
    }

    async restore(data) {
        super.restore(data);
        this.setMarkCoord(this.status.value.lat, this.status.value.lng);
        this.status.value.lat?this.button.addClass('d-block'):this.button.removeClass('d-block');
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
