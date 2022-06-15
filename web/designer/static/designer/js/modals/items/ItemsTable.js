
import {
    TableTr, TableTd, Table, TableTh, TableThead, TableTbody,
    Input, InputText, 
    ButtonAndAwesomeIcon
} from '/static/js/ui/BuildingBlocks.js';
import { Translator } from '/static/js/Translator.js';

/**
 * Table for the manual source.
 */
export class ItemsTable extends Table {
    /**
     * Constructor.
     * @param {function} onBodyClick Called when clicked on any part of the table.
     */
    constructor(onBodyClick=null) {
        super({classes:['table','mt-2','collapse','show']});
        const self = this;
        
        const thead = new TableThead().attachTo(this);	        
        const tr = new TableTr().attachTo(thead);
        
        const th1 = new TableTh().attachTo(tr);
        th1.setTextContent(Translator.translate('Order'));
        
        const th2 = new TableTh().attachTo(tr);
        th2.setTextContent(Translator.translate('Name'));
        
        const th3 = new TableTh().attachTo(tr);
        th3.setTextContent(Translator.translate('Selected'));
        
        const th4 = new TableTh().attachTo(tr);
        th4.setTextContent(Translator.translate('Operations'));
        
        this.tbody = new TableTbody().attachTo(this);	
        this.tbody.setId("dropdown-items-body");

        this.items = this.tbody.dom.getElementsByTagName('tr');

        $(this.tbody.dom).on('click', function (e) {
            if (onBodyClick) onBodyClick(e.target, self);
        });
    }

    /**
     * Get all items.
     * @returns Array of items.
     */
    getItems() {
        return this.items;
    }

    /**
     * Get the table body.
     * @returns TableTbody.
     */
    getBody() {
        return this.tbody;
    }

    /**
     * Creates an option.
     * @param {string} value Value and text for an option.
     * @returns TableTr
     */
    createRow(value='') {
        const row = new TableTr();        
        new TableTd({classes:["text-center"]}).attachTo(row);        
        const col_2 = new TableTd().attachTo(row);    
        const item_name = new InputText().attachTo(col_2);
        item_name.setStyle('width','100%');
        item_name.setAttribute('value',value);    
        const col_3 = new TableTd({classes:["text-center"]}).attachTo(row);    
        const item_radio = new Input().attachTo(col_3);	;
        item_radio.setAttribute('type','radio');
        item_radio.setAttribute('name','dropdown-items-optradio');
        item_radio.setAttribute('value',value);
        if (this.items.length == 0) {
            item_radio.setAttribute('checked','true');
        }    
        const col_4 = new TableTd().attachTo(row);    
        const delete_btn = new ButtonAndAwesomeIcon('','fa fa-trash',
            {classes:['btn','btn-danger','dropdown-items-remove-item','m-1']}).attachTo(col_4);
        delete_btn.setAttribute('type','button');    
        const up_btn = new ButtonAndAwesomeIcon('','fa fa-arrow-up',
            {classes:['btn','btn-info','dropdown-items-move-up','m-1']}).attachTo(col_4);
        up_btn.setAttribute('type','button');        
        const down_btn = new ButtonAndAwesomeIcon('','fa fa-arrow-down', 
            {classes:['btn','btn-info','dropdown-items-move-down','m-1']}).attachTo(col_4);
        down_btn.setAttribute('type','button');

        item_name.dom.addEventListener('change',function(e){
            item_radio.setAttribute('value',e.target.value);
        })

        return row;
    }


    /**
     * Adds a row to the table.
     * @param {string} value Value and text for an option.
     */
    add(value) {		
        this.createRow(value).attachTo(this.tbody);
        this.updateOrder();
    }    
    
    /**
     * Updates the order of the row.
     */
    updateOrder() {	
        for (let i=0; i<this.items.length; i++) {
            this.items[i].firstElementChild.textContent = i;
        }
    
        // if nothing selected, then select first
        if (this.items.length > 0 && !document.querySelector('input[name="dropdown-items-optradio"]:checked')) {
            const radio = this.items[0].childNodes[2].firstChild;
            radio.checked = true;
        }
    }

    /**
     * Get all options and which one is currently selected.
     * @returns [[options values], value of the selected option]
     */
    getOptions() {
        const options = [];
        for (let i=0; i<this.items.length; i++) {		
            options.push(this.items[i].childNodes[1].firstChild.value);
        }
        if (!document.querySelector('input[name="dropdown-items-optradio"]:checked'))
            return [null, null];

        const checked = document.querySelector('input[name="dropdown-items-optradio"]:checked').value;
        return [options, checked];
    }

    /**
     * Clears the table - clears the dom.
     */
    clear() {
        $(this.tbody.dom).empty();
    }

}
