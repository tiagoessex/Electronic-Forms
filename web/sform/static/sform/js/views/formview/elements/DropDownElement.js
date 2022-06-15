
import { FormBaseElement } from './FormBaseElement.js';
import { Select } from '/static/js/ui/BuildingBlocks.js';
import { PROPERTIES_ID } from '/static/designer/js/constants/constants.js';
import { HEXtoRGBA } from '/static/js/jscolor.js';
import { 
    URL_GET_TABLE_COLUMN, 
    URL_GET_DB_TABLE_COLUMN, 
    URL_GET_DB_TABLE_COLUMN_UNIQUE 
} from '/static/js/urls.js';
import { fetchGET } from '/static/js/Fetch.js';


export class DropDownElement extends FormBaseElement {
    constructor(context, props, id, type, data) {
        super(context, props);

        const _enabled = props[PROPERTIES_ID.ENABLEDPROPERTY] === 'yes';
        const height = props[PROPERTIES_ID.HEIGHTPROPERTY];
        const width = props[PROPERTIES_ID.WIDTHPROPERTY];
        const backcolor = props[PROPERTIES_ID.BACKCOLORPROPERTY];
        const color = props[PROPERTIES_ID.COLORPROPERTY];
        //const label = props[PROPERTIES_ID.LABELPROPERTY];
        //const name = props[PROPERTIES_ID.NAMEPROPERTY];
        const border = props[PROPERTIES_ID.BORDERPROPERTY];
        const border_radius = props[PROPERTIES_ID.BORDERRADIUSPROPERTY];
        const border_width = props[PROPERTIES_ID.BORDERWIDTHPROPERTY];
        const back_alpha = props[PROPERTIES_ID.BACKALPHAPROPERTY];
        const font_family = props[PROPERTIES_ID.FONTPROPERTY];
        const font_size = props[PROPERTIES_ID.FONTSIZEPROPERTY];
        const font_style = props[PROPERTIES_ID.FONTSTYLEPROPERTY];
        const font_decoration = props[PROPERTIES_ID.FONTDECORATIONPROPERTY];
        const font_weight = props[PROPERTIES_ID.FONTWEIGHTPROPERTY];
        const horizontal_alignment = props[PROPERTIES_ID.HORIZONTALALIGNMENTPROPERTY]; 


        
        /*
        let text =  label;
        if (text === '') {
            text = name;
            if (text === '') {
                text = real_id;
            }                    
        } 
        */

        this.input = new Select();
        this.input.setStyle('height', height + 'px');
        this.input.setStyle('width', width + 'px');
        this.input.setId(id);
        this.input.setAttribute('name', id);
        this.input.setAttribute('data-type', type);

        this.input.setStyle('font-size',font_size + 'px');
        this.input.setStyle('font-family',font_family);
        this.input.setStyle('font-style',font_style);
        this.input.setStyle('text-decoration',font_decoration);
        this.input.setStyle('font-weight',font_weight);
        this.input.setStyle('text-align',horizontal_alignment);
        this.input.setStyle("background-color", HEXtoRGBA(backcolor, back_alpha));
        this.input.setStyle("color", color);

        this.input.dom.style.borderStyle = border;
        this.input.setStyle('border-width', border_width + 'px');
        this.input.setStyle('border-radius', border_radius + 'px');
        this.input.setStyle('-webkit-border-radius', border_radius + 'px');
        this.input.setStyle('-moz-border-radius', border_radius + 'px');
        this.input.setStyle('border-color', color);

        this.input.attachTo(this);


        if (context.isExport) return;

        const source = data.source;
        if (source === 'table') {
            const URL = URL_GET_TABLE_COLUMN  + context.form_id + '/' + data.table + '/' + data.column;
            fetchGET(URL, 
                (result) => {
                    const option = document.createElement('option');
                    option.textContent = '--- SELECT ---';
                    option.setAttribute('value','');
                    option.setAttribute('selected','true');
                    this.input.dom.appendChild(option);
                    const _results_unique = new Set(result);
                    _results_unique.forEach((value) => {
                        if (!value || value ==='undefined') return;
                        const option = document.createElement('option');
                        option.textContent = value;
                        option.setAttribute('value',value);
                        this.input.dom.appendChild(option);
                    })
                    //this.input.setValue(data.selected);
                },
                (error) => {
                    console.error(error);
                    const option = document.createElement('option');
                    option.textContent = '---ERROR---';
                    option.setAttribute('value','error');
                    this.input.dom.style.color = "white";
                    this.input.dom.style.backgroundColor = "red";
                    this.input.dom.appendChild(option); 
                })
        } else if (source === 'database') {
            //const URL = URL_GET_DB_TABLE_COLUMN + data.database + '/' + data.table + '/' + data.column;
            const URL = (data.unique?URL_GET_DB_TABLE_COLUMN_UNIQUE:URL_GET_DB_TABLE_COLUMN) + data.database + '/' + data.table + '/' + data.column;
            fetchGET(URL, 
                (result) => {
                    const option = document.createElement('option');
                    option.textContent = '--- SELECT ---';
                    option.setAttribute('value','');
                    option.setAttribute('selected','true');
                    this.input.dom.appendChild(option);                
                    result.forEach((value) => {
                        const option = document.createElement('option');
                        option.textContent = value;
                        option.setAttribute('value',value);
                        this.input.dom.appendChild(option);
                    })
                    //this.input.setValue(data.selected);
                },
                (error) => {
                    console.error(error);
                    const option = document.createElement('option');
                    option.textContent = '---ERROR---';
                    option.setAttribute('value','error');
                    this.input.dom.style.color = "white";
                    this.input.dom.style.backgroundColor = "red";
                    this.input.dom.appendChild(option); 
                })           
        } else {
            const options=data.options;
            const selected=data.selected;
            if (options) {
                const option = document.createElement('option');
                option.textContent = '--- SELECT ---';
                option.setAttribute('value','');
                option.setAttribute('selected','true');
                this.input.dom.appendChild(option);                
                for (let i=0; i<options.length; i++) {
                    const option = document.createElement('option');
                    option.textContent = options[i];
                    //option.setAttribute('value',options[i]);
                    if (options[i]===selected)
                        option.setAttribute('selected','true');
                    this.input.dom.appendChild(option);
                } 
            } else {
                const option = document.createElement('option');
                option.textContent = '--- NOTHING TO SELECT ---';
                option.setAttribute('value','');
                option.setAttribute('selected','true');
                this.input.dom.appendChild(option);
            }
        }

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

        context.signals.onListValueChanged.add((id, value) => {
            if (id === this.real_id) {
                this.input.dom.value = value;  
            }
        })

        // connection to its equivalent in the formview
        
        const ref = this;        
        $(this.input.dom).on('change', function(e) {
            context.signals.onFormValueChanged.dispatch(ref.real_id, ref.input.dom.value);
        })
                 

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
        if (this.status.enabled)
            this.input.removeAttribute('disabled');
        else
            this.input.setAttribute('disabled','');
        
        return Promise.resolve();

    } 


}
