
import { PROPERTIES_ID } from '/static/designer/js/constants/constants.js';
import { ListBaseElement } from './ListBaseElement.js';
import { Div, Select, Label } from '/static/js/ui/BuildingBlocks.js';
import { 
    URL_GET_TABLE_COLUMN, 
    URL_GET_DB_TABLE_COLUMN, 
    URL_GET_DB_TABLE_COLUMN_UNIQUE 
} from '/static/js/urls.js';
import { fetchGET } from '/static/js/Fetch.js';


export class DropDownElement extends ListBaseElement {
    constructor(context, props, id, type, data) {
        super(context, props);

        const _enabled = props[PROPERTIES_ID.ENABLEDPROPERTY] === 'yes';
        
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

        this.input = new Select();
        this.input.setAttribute('name', id);
        this.input.addClass('form-control');
        this.input.setId(id);
        this.input.attachTo(form_group);
        this.input.setAttribute('data-type', type);


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
        context.signals.onFormValueChanged.add((id, value) => {
            if (id === this.real_id) {
                this.input.dom.value = value;  
            }
        })

        // connection to its equivalent in the formview
        const ref = this;        
        $(this.input.dom).on('change', function(e) {
            context.signals.onListValueChanged.dispatch(ref.real_id, ref.input.dom.value);
        })

    }

    save() {
        super.save();
        this.status.value = this.input.getValue();
        this.status.enabled = !this.input.hasAttribute('disabled');
        return this.status;
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
