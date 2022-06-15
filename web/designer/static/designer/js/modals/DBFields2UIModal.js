/**
 * TODO:
 *      - FieldSelectionModal AND DBFields2UIModal SHOULD INHERIT FROM A COMMON CLASS 
 */

import { 
    Div, 
    Hx, Table, TableTbody, TableThead, TableTr, 
    Button, 
    Select 
} from '/static/js/ui/BuildingBlocks.js';
import { Modal, MODAL_SIZE } from '/static/js/modals/Modal.js';
import { 
    TREE_ICON_DB, 
    TREE_ICON_TABLE,
    URL_DATABASES_TABLES, 
    URL_TABLE_COLUMNS,
    URL_GET_DB_TABLE_COLUMN,
    URL_GET_DB_TABLE_COLUMN_UNIQUE
} from '/static/js/urls.js';
import { fetchGET } from '/static/js/Fetch.js';
import { Alert } from '/static/js/ui/Alert.js';
import { MAX_SELECT_VALUES } from '../constants/limits.js';
import { ELEMENTS_TYPE } from '../elements/constants.js';
import { Translator } from '/static/js/Translator.js';
import { RadioCheckInput } from '/static/js/ui/RadioCheckInput.js';
import { card, th, cell } from './helpers.js';

/**
 * Adding/removing Databases/Tables Fields to Elements
 */
export class DBFields2UIModal extends Modal { 

    /**
     * Constructor.
     * @param {string} title Title of the modal.
     * @param {string} help_text Helper text.
     * @param {function} addDBField Callback to add a field to the Elements.
     * @param {Context} context Context.
     */
     constructor(title, help_text='', addDBField=null, context=null) {
        super(title, help_text, MODAL_SIZE.XL);

        if (!addDBField || addDBField === undefined) {
            throw Error('Missing addDBField callback function!');
        } 

        if (!context || context === undefined) {
            throw Error('Missing the context!');
        }         

        //this.modal_content.setStyle('height','80vh');
        this.size = null;
        this.type = null;
        this.default = null;
        this.database = null;
        this.table = null;
        this.field = null;
        this.full_path = null;  // db:table:field
        this.required = null;

        this.addDBField = addDBField;
        this.context = context;        

        const self = this;

        // build the UI
        const row = new Div();
        row.addClass('row');
        row.attachTo(this.modal_body);

        const col_4 = new Div({classes:['col-4']}).attachTo(row);

        const title_dbs = new Hx(2,{classes:['text-center']}).attachTo(col_4);
        title_dbs.setTextContent(Translator.translate('Databases'));

        const card_tree = card(col_4, '60vh');

        const card_tree_body = new Div({classes:['card-body']}).attachTo(card_tree);
        
        this.alert = new Alert('danger', Translator.translate("No Databases Available!"), true, false, '1.5em').attachTo(card_tree_body);
        this.alert.setStyle('display', 'none');

        this.tree = new Div().attachTo(card_tree_body);
        this.tree.setId('jstree-0058A');

        const col_8 = new Div({classes:['col-8']}).attachTo(row);

        const title_table = new Hx(2, {classes:['text-center']}).attachTo(col_8);
        title_table.setTextContent('Fields');

        const card_table = card(col_8, '35vh');        

        const card_table_body = new Div().attachTo(card_table);
        card_table_body.addClass('card-body');

        const table = new Table({classes: ['table','table-hover']}).attachTo(card_table_body);

        const thead = new TableThead().attachTo(table);

        const tr_head = new TableTr().attachTo(thead);

        th(tr_head, Translator.translate('Column'));
        th(tr_head, Translator.translate('Primary Type'));
        th(tr_head, Translator.translate('Size'));
        th(tr_head, Translator.translate('Default'));
        th(tr_head, Translator.translate('Required'));
        th(tr_head, Translator.translate('Key'));
        th(tr_head, Translator.translate('Comments'));

        this.tbody = new TableTbody().attachTo(table);

        const card_selected = card(col_8, '10vh');

        const card_selected_body = new Div(
            {classes:['card-body','d-flex','justify-content-center','align-items-center']}).attachTo(card_selected);

        this.selected_field = new Div(
            {classes:['w-100','bg-success','text-white','font-weight-bold','text-uppercase','text-center']}).attachTo(card_selected_body);
        this.selected_field.setStyle('font-size','1.5em');


        const div_op = new Div({classes:['row']}).attachTo(col_8);
        const col_op_1 = new Div({classes:['col-6']}).attachTo(div_op);
        const col_op_2 = new Div({classes:['col-6']}).attachTo(div_op);


        const types = new Div({classes:['form-group']}).attachTo(col_op_1);
        this.select = new Select({classes:['form-control']}).attachTo(types);


        this.add_btn = new Button(Translator.translate('Add Field')).attachTo(col_op_2);
        this.add_btn.addClass('btn btn-primary btn-block shadow p-2 mb-4 rounded disabled');

        // unique values?
        // through query 
        this.unique =  new RadioCheckInput(
            "checkbox", 
            null, 
            Translator.translate('Unique values'), 
            null, 
            'asm-auto-save', 
            false
        ).attachTo(div_op);
        this.unique.addClass('ml-3');
        $(this.unique.dom).hide();


        // table rows clickable
        this.tbody.dom.addEventListener('click', function(e) {
            self.size = e.target.parentNode.dataset.size;
            self.default = e.target.parentNode.dataset.default;
            self.database = e.target.parentNode.dataset.database;
            self.table = e.target.parentNode.dataset.table;
            self.field = e.target.parentNode.dataset.field;
            self.required = e.target.parentNode.dataset.required;
            self.full_path = self.database + ":" + self.table + ":" + self.field;

            self.selected_field.setTextContent(self.full_path);

            const types = e.target.parentNode.dataset.types.split(',');
           
            self.add_btn.removeClass('disabled');

            const options = {};
            for (let i=0; i<types.length; i++) {
                options[types[i]] = types[i];
            }
            self.select.setValue(types[0]);
            self.select.setOptions(options);
            if (self.select.dom.value===ELEMENTS_TYPE.DROPDOWN.name || 
                self.select.dom.value===ELEMENTS_TYPE.CHECKBOX.name || 
                self.select.dom.value===ELEMENTS_TYPE.RADIO.name) {
                    $(self.unique.dom).show();
            }

        });
        
        // element type selector changed.
        // unique is only available and showed for lists, checks and radios
        $(this.select.dom).on('change', function(e) {
            if (self.select.dom.value===ELEMENTS_TYPE.DROPDOWN.name || 
                self.select.dom.value===ELEMENTS_TYPE.CHECKBOX.name || 
                self.select.dom.value===ELEMENTS_TYPE.RADIO.name) {
                    $(self.unique.dom).show();
            } else {
                $(self.unique.dom).hide();
                this.unique.uncheck();
            }
        });

        // field selected => tell designer to create element
        $(this.add_btn.dom).on('click', function(e) {
            self.type = self.select.dom.value;
            if (self.select.dom.value===ELEMENTS_TYPE.DROPDOWN.name || 
                self.select.dom.value===ELEMENTS_TYPE.CHECKBOX.name || 
                self.select.dom.value===ELEMENTS_TYPE.RADIO.name) {
                    $("body").css("cursor","progress");
                    $(self.add_btn.dom).css("cursor","progress");
                    self.getColumnValues(self.database, self.table, self.field, (values) => {
                        if (values) {
                            $("body").css("cursor","auto");
                            $(self.add_btn.dom).css("cursor","auto");
                            self.addDBField(self.table, self.field, self.type, {"size":self.size, "default":self.default, "db": self.full_path,'required': self.required, 'values': values, 'unique': self.unique.isChecked()});
                            self.context.signals.onDBFieldSelected.dispatch();                
                        }
                    });
            } else {
                self.addDBField(self.table, self.field, self.type, {"size":self.size, "default":self.default, "db": self.full_path,'required': self.required});
                self.context.signals.onDBFieldSelected.dispatch();             
            }

            $(self.selected_field.dom).removeClass('bg-success').addClass('bg-warning');
            setTimeout(function(){
                $(self.selected_field.dom).removeClass('bg-warning').addClass('bg-success');
            }, 1000);            

        });

    }

    /**
     * Override - show model
     */
    show() {
        // clear table        
        $(this.tbody.dom).empty();
        // get all the available databases
        this.getDatabasesData();        
        super.show();
    }


    /**
     * Build and display the databases tree.
     * @param {object} data Json with the data to build the tree
     */
    setDatabasesTree = (data) => {  
        const self = this;

        $(this.tree.dom).jstree('destroy');

        for (let i=0; i<data.length; i++) {
            if (data[i].parent === '#') {
                data[i].icon = TREE_ICON_DB;
            } else {
                data[i].icon = TREE_ICON_TABLE;
            }
        }
    
        $(this.tree.dom).jstree({ 'core' : {
            "themes" : {
                  "variant" : "large"
            },		
            'data' : data
        }});
    
        $(this.tree.dom).on('select_node.jstree', function (e, data) {
                var loMainSelected = data;
                const selected = loMainSelected.node.parents.reverse();
                selected.shift();
                selected.push(loMainSelected.node.id);
                const [database, table] = selected;
                //[this.database, this.table] = selected;
                if (database && table) {
                    self.getTableFields(database, table);
                }
            });
    }

    /**
     * Get all the databases and their respective tables.
     */
    getDatabasesData = () => {
        fetchGET(URL_DATABASES_TABLES, 
            (result) => {
                if ('databases' in result) {
                    if (result['databases'].length == 0) {
                        $(this.alert.dom).show();
                    } else {
                        //$(this.tree.dom).empty();
                        $(this.alert.dom).hide();
                        this.setDatabasesTree(result['databases']);
                    }                        
                } else {
                    throw Error('No databases and/or tables!');
                }
            },
            (error) => {
                this.context.signals.onError.dispatch(error,"[DBFields2UIModal::getDatabasesData]");
            }
        );

    }

    /**
     * Get the columns of a given database table.
     * @param {string} database Database.
     * @param {string} table Table.
     */
    getTableFields = (database, table) => {
       const url = URL_TABLE_COLUMNS + '?database=' + database + '&table=' + table;
       fetchGET(url, 
            (result) => {
                if ('fields' in result) {
                    this.populateTable(database, table, result['fields']);
                } else {
                    throw Error('No fields!');
                }
            },
            (error) => {
                this.context.signals.onError.dispatch(error,"[DBFields2UIModal::getTableFields]");
            }
        );        
      }    
      

    /**
     * Builds a table the fields of a given table.
     * @param {string} database Name of the selected database.
     * @param {string} table Name of the selected table.
     * @param {object} data Object containing the data to populate the table.
     */
    populateTable = (database, table, data) => {
        // clear table
        $(this.tbody.dom).empty();
        data.forEach((values) => {
            const row = new TableTr();
            row.setAttribute('data-size',values.Size);
            row.setAttribute('data-types',values.Types);
            row.setAttribute('data-default',values.Default);
            row.setAttribute('data-database',database);
            row.setAttribute('data-table',table);
            row.setAttribute('data-field',values.Field);
            row.setAttribute('data-required',values.Required);
            cell(row, values.Field)
            cell(row, values.Types, 3)
            cell(row, values.Size)
            cell(row, values.Default)
            cell(row, values.Required);
            cell(row, values.Key)
            cell(row, values.Comment)
            row.attachTo(this.tbody);
        });
    }

    /**
     * Get all the values of a specific column.
     * @param {string} database Database name.
     * @param {string} table Table name.
     * @param {string} column Column name.
     * @param {function} onReady Called when the values are ready.
     * @returns 
     */
    getColumnValues(database = null, table = null, column = null, onReady = null) {
        if (!database || database === '') return;
        if (!table || table === '') return;
        if (!column || column === '') return;
        const URL = (this.unique.isChecked()?URL_GET_DB_TABLE_COLUMN_UNIQUE:URL_GET_DB_TABLE_COLUMN) + database + '/' + table + '/' + column + '/';
        fetchGET(URL, 
            (result) => {
                if (result.length > MAX_SELECT_VALUES) {
                    const msg = Translator.translate("There are more than") 
                                + " " + MAX_SELECT_VALUES  
                                + " " 
                                + Translator.translate("items") 
                                + " (" 
                                + result.length 
                                + "). "
                                + Translator.translate("An high number may cause some issues. Show values anyway?");
                    this.context.signals.onAYS.dispatch(
                        msg,
                        () => {
                            if (onReady) onReady(result);
                        },
                        () => {
                            if (onReady) onReady(null);
                        }
                    );                    
                } else {
                    if (onReady) onReady(result);
                }
            },
            (error) => {
                this.context.signals.onError.dispatch(error,"[DBFields2UIModal::getColumnValues]");
            }
        );      
    }


}
