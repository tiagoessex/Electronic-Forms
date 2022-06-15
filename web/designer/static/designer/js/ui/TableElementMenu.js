
import { Table, TableTd, TableTr, InputNumber, InputText  } from '/static/js/ui/BuildingBlocks.js';
import { GeneralSelector } from './GeneralSelector.js';
import { Translator } from '/static/js/Translator.js';

const TABLE_MENU = document.getElementById('element-table-menu');

const TABLE_MENU_NAME = document.getElementById('element-table-menu-name');

const N_ROWS = document.getElementById('element-table-rows');
const N_COLS = document.getElementById('element-table-cols');
const TABLE_WIDTH = document.getElementById('element-table-width');

const HEADER_HEIGHT = document.getElementById('element-table-header-height');
const HEADER_ALIGNMENT = document.getElementById('element-table-header-alignment');
const HEADER_FONT = document.getElementById('element-table-header-font');
const HEADER_FONT_SIZE = document.getElementById('element-table-header-font-size');
const HEADER_STYLE = document.getElementById('element-table-header-style');
const HEADER_WEIGHT = document.getElementById('element-table-header-weight');
const HEADER_COLOR = document.getElementById('element-table-header-color');
const HEADER_BACK_COLOR = document.getElementById('element-table-header-back-color');

const ROWS_HEIGHT = document.getElementById('element-table-rows-height');
//const ROWS_FONT_SIZE = document.getElementById('element-table-rows-font-size');

const COLS_CONFIG = document.getElementById('element-table-cols-config');


export class TableElementMenu {
    /**
     * Constructor.
     * @param {Context} context Context.
     */
    constructor(context = null) {
        //context.table_element_menu = this;
        this.table = null;
        this.context = context;
        const self = this;


        N_ROWS.addEventListener('change', function(e){
            self.table.setProperty('n_rows', parseInt(e.target.value));
        })
        N_COLS.addEventListener('change', function(e){
            self.table.setProperty('n_cols', parseInt(e.target.value));
            self.setColsInput(self.table.data.data_cols);
        })
        TABLE_WIDTH.addEventListener('change', function(e){
            self.table.setProperty('width', parseInt(e.target.value));
        })
        HEADER_HEIGHT.addEventListener('change', function(e){
            self.table.setProperty('header_height',parseInt(e.target.value));
        })
        HEADER_ALIGNMENT.addEventListener('change', function(e){
            self.table.setProperty('header_alignment', e.target.value)
        })
        HEADER_FONT.addEventListener('change', function(e){
            self.table.setProperty('header_font', e.target.value)
        })
        HEADER_FONT_SIZE.addEventListener('change', function(e){
            self.table.setProperty('header_font_size', parseInt(e.target.value));
        })
        HEADER_STYLE.addEventListener('change', function(e){
            self.table.setProperty('header_style', e.target.value)
        })
        HEADER_WEIGHT.addEventListener('change', function(e){
            self.table.setProperty('header_weight', e.target.value)
        })
        HEADER_COLOR.addEventListener('change', function(e){
            self.table.setProperty('header_color', e.target.value)
        })
        HEADER_BACK_COLOR.addEventListener('change', function(e){
            self.table.setProperty('header_back_color', e.target.value)
        })
        ROWS_HEIGHT.addEventListener('change', function(e){
            self.table.setProperty('rows_height', parseInt(e.target.value));
        })

        context.signals.onElementRenamed.add((element, _value) => {
            // if the element is currently the selected table then change name
            if (element == this.table) {
                this.setName(_value);                
            }
        });
    }

    /**
     * Sets the name of the table, both in the table config but also
     * in the panel.
     * @param {string} name New name.
     */
    setName(name) {
        const _name = name!==''?name:this.table.getId();
        TABLE_MENU_NAME.textContent = _name;
        this.table.setProperty('name',_name);
    }


    /**
     * Sets which table element is currently selected and shows the panel.
     * @param {Element} table Table element
     */
    show(table) {
        this.table = table;
        // set the values
        this.setName(table.getProperty('name'));
        N_ROWS.value = table.getProperty('n_rows');
        N_COLS.value = table.getProperty('n_cols');
        TABLE_WIDTH.value = table.getProperty('width');
        HEADER_HEIGHT.value = table.getProperty('header_height');
        HEADER_ALIGNMENT.value = table.getProperty('header_alignment');
        HEADER_FONT.value = table.getProperty('header_font');
        HEADER_FONT_SIZE.value = table.getProperty('header_font_size');
        HEADER_STYLE.value = table.getProperty('header_style');
        HEADER_WEIGHT.value = table.getProperty('header_weight');
        HEADER_COLOR.value = table.getProperty('header_color');
        HEADER_BACK_COLOR.value = table.getProperty('header_back_color');
        ROWS_HEIGHT.value = table.getProperty('rows_height');
        // create the cols input
        // it also removes every event listner        
        this.setColsInput(table.data.data_cols);

        // set the props
        $(TABLE_MENU).show();
    }

    /**
     * Hides the panel and clear the selected table.
     */
    hide() {
        $(TABLE_MENU).hide();
        this.table = null;
    }

    /**
     * Creates the inputs and sets the events.
     * @param {array of objects} data Configuration for each row (col_width, col_alignment)
     */
    setColsInput(data) {
        $(COLS_CONFIG).empty();
        const table = new Table().attachTo(COLS_CONFIG);
        table.addClass('m-1');
        const self = this;
        const widths = [];
        

        data.forEach((col,index) => {
            // separator
            if (index < data.length) {
                const separator = new TableTr().attachTo(table);
                const label2 = new TableTd().attachTo(separator);
                label2.addClass('text-white font-weight-bold');
                label2.setAttribute('colspan','2');
                label2.setTextContent(Translator.translate("Column #") + (index + 1));
            }

            // header title
            const row_title = new TableTr().attachTo(table);            
            const label_title = new TableTd().attachTo(row_title);
            label_title.addClass('text-white');
            label_title.setTextContent("Text:");
            const value_title = new TableTd().attachTo(row_title);
            const col_title = new InputText().attachTo(value_title);
            col_title.dom.addEventListener('change', function(e){
                self.table.setProperty('col_text', e.target.value, index);
                // text without break => can change col width
                for (let i=0; i<widths.length; i++) {
                    widths[i].setValue(parseInt(self.table.getProperty('col_width', i)));
                };                
            })
            col_title.setStyle('width','100%');
            col_title.setValue(this.table.getProperty('col_text', index));

            // alignment
            const row = new TableTr().attachTo(table);            
            const label = new TableTd().attachTo(row);
            label.addClass('text-white');
            label.setTextContent(Translator.translate("Alignment:"));
            const value = new TableTd().attachTo(row);
            const selector = new GeneralSelector(
                this.context, (option) => {
                    this.table.setProperty('col_alignment', option, index);
                },
                [
                    {value:'left', text: Translator.translate('Left')},
                    {value:'right', text: Translator.translate('Right')},
                    {value:'center', text: Translator.translate('Center')},
                    {value:'justify', text: Translator.translate('Justify')}
                ],
                'center'
            ).attachTo(value);
            selector.setStyle('width','100%');
            selector.setValue(this.table.getProperty('col_alignment', index));

            // width
            const row2 = new TableTr().attachTo(table);            
            const label2 = new TableTd().attachTo(row2);
            label2.addClass('text-white');
            label2.setTextContent(Translator.translate("Width(%):"));
            const value2 = new TableTd().attachTo(row2);            
            const width = new InputNumber().attachTo(value2);
            width.setStyle('width','100%');
            width.setAttribute('min','5');
            width.setAttribute('max','95');
            width.setValue(parseInt(this.table.getProperty('col_width', index)));
            //console.warn(this.table.getProperty('col_width', index));
            width.dom.addEventListener('change', function(e){
                self.table.setProperty('col_width', e.target.value, index);
                // new values
                for (let i=0; i<widths.length; i++) {
                    widths[i].setValue(parseInt(self.table.getProperty('col_width', i)));
                };
            })
            widths.push(width);

            const spacer = new TableTr().attachTo(table);
            spacer.setStyle('height','15px');
        });
        
    }

}