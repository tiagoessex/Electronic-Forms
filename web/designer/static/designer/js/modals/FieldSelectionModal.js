/**
 * TODO:
 *      - FieldSelectionModal AND DBFields2UIModal SHOULD INHERIT FROM A COMMON CLASS 
 */

import { 
    Div, 
    Hx, Table, TableTbody, TableThead, TableTr 
} from '/static/js/ui/BuildingBlocks.js';
import { Modal, MODAL_SIZE } from '/static/js/modals/Modal.js';
import { TREE_ICON_DB, TREE_ICON_TABLE } from '/static/js/urls.js';
import { URL_DATABASES_TABLES, URL_TABLE_COLUMNS } from '/static/js/urls.js';
import { fetchGET } from '/static/js/Fetch.js';
import { Alert } from '/static/js/ui/Alert.js';
import { Translator } from '/static/js/Translator.js';
import { card, th, cell } from './helpers.js';

/**
 * To select a database field for a particular Element.
 */
export class FieldSelectionModal extends Modal { 

    /**
     * Constructor.
     * @param {string} title Title of the modal.
     * @param {string} help_text Helper text.
     * @param {function} updatevalue Callback to update the value in the properties.
     * @param {Context} context Context.
     */
    constructor(title, help_text='', callback=null, context=null) {
        super(title, help_text, MODAL_SIZE.XL);

        if (!callback || callback === undefined) {
            throw Error('Missing callback function!');
        } 

        if (!context || context === undefined) {
            throw Error('Missing the context!');
        }   

        this.full_path = null;
        this.callback = callback;
        this.context = context;
        const self = this;

        // build the UI
        const row = new Div().attachTo(this.modal_body);
        row.addClass('row');

        const col_4 = new Div().attachTo(row);
        col_4.addClass('col-4');

        const title_dbs = new Hx(2).attachTo(col_4);
        title_dbs.addClass('text-center');
        title_dbs.setTextContent(Translator.translate('Databases'));

        const card_tree = card(col_4, '60vh');

        const card_tree_body = new Div({classes:['card-body']}).attachTo(card_tree);
        
        this.alert = new Alert('danger', Translator.translate("No Databases Available!"), true, false, '1em').attachTo(card_tree_body);
        this.alert.setStyle('display', 'none');

        this.tree = new Div().attachTo(card_tree_body);
        this.tree.setId('jstree-0058A');

        const col_8 = new Div().attachTo(row);
        col_8.addClass('col-8');

        const title_table = new Hx(2).attachTo(col_8);
        title_table.addClass('text-center');
        title_table.setTextContent('Fields');


        const card_table = card(col_8, '40vh');

        const card_table_body = new Div().attachTo(card_table);
        card_table_body.addClass('card-body');

        const table = new Table().attachTo(card_table_body);
        table.addClass('table table-hover');

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

        const card_selected = card(col_8, '15vh');

        const card_selected_body = new Div().attachTo(card_selected);
        card_selected_body.addClass('card-body d-flex justify-content-center align-items-center');

        this.selected_field = new Div().attachTo(card_selected_body);
        this.selected_field.addClass('w-100 bg-success text-white font-weight-bold text-uppercase text-center');
        this.selected_field.setStyle('font-size','1.5em');

        // table rows clickable
        $(this.tbody.dom).on('click', function(e) {
            self.full_path = e.target.parentNode.dataset.fullpath;
            self.selected_field.setTextContent(self.full_path);            
        });

        // if ok and a valid field was selected, then set its value
        // on the corresponding place
        $(this.ok_btn.dom).on('click', function(e) {  
            if (self.full_path) {
                self.callback(self.full_path);
                self.context.signals.onDBFieldSelected.dispatch();
            }
        } );   

        // get all the available databases
       // this.getDatabasesData();
    }

    /**
     * Override - show model
     * @param {function} callback Function to pass the db field full path
     */
    show(callback = null) {
        // clear table
        $(this.tbody.dom).empty();        
        // get all the available databases
        this.getDatabasesData();        
        super.show();
        if (callback) {
            this.callback = callback;
        }
    }


    /**
     * Builds and displays the databases tree.
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
                this.context.signals.onError.dispatch(error,"[FieldSelectionModal::getDatabasesData]");
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
                this.context.signals.onError.dispatch(error,"[FieldSelectionModal::getTableFields]");
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
            const row = new TableTr().attachTo(this.tbody);
            row.setAttribute('data-fullpath',database+':'+table+':'+values.Field);
            cell(row, values.Field)
            cell(row, values.Types, 3)
            cell(row, values.Size)
            cell(row, values.Default)
            cell(row, values.Required);
            cell(row, values.Key)
            cell(row, values.Comment)
       })
    }
}

