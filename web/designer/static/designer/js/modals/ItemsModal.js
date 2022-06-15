/**
 * TODO:
 *      - reduce the number of onChange dispatches
 */
import { Div, Button, Label } from '/static/js/ui/BuildingBlocks.js';
import { Modal, MODAL_SIZE } from '/static/js/modals/Modal.js';
import { RadioCheckInput } from '/static/js/ui/RadioCheckInput.js';
import { DataSourceSelector } from './items/DataSourceSelector.js';
import { TableSelector } from '../tables/TableSelector.js';
import { TableColumnSelector } from '../tables/TableColumnSelector.js';
import { ItemsTable } from './items/ItemsTable.js';
import { TableColumnValueSelector } from '../tables/TableColumnValueSelector.js';
import { DBSelector } from '../databases/DBSelector.js';
import { DBTableSelector } from '../databases/DBTableSelector.js';
import { DBTableColumnsSelector } from '../databases/DBTableColumnsSelector.js';
import { DBTableColumnValuesSelector } from '../databases/DBTableColumnValuesSelector.js';
import { Translator } from '/static/js/Translator.js';

 
 
 /**
  * Modal for managing the Items of a dropdown/list Element
  */
  export class ItemsModal extends Modal { 
     static counter = 0;
     /**
      * Constructor.
      * @param {string} title Title of the modal.
      * @param {string} help_text Helper text.
      * @param {function} dopbox_elements_manager Elements manager.
      * @param {Context} context Context.
      */
     constructor(title, help_text='', dopbox_elements_manager=null, context=null) {
         super(title, help_text, MODAL_SIZE.LG); 
 
         if (!dopbox_elements_manager || dopbox_elements_manager === undefined) {
             console.error('[ItemsModal->ItemsModal::ctor] - Missing dopbox_elements_manager!');
             throw Error('Missing dopbox_elements_manager!');
         }
         if (!context || context === undefined) {
             console.error('[ItemsModal->ItemsModal::ctor] - Missing the context!');
             throw Error('Missing the context!');
         }           
 
         this.dopbox_elements_manager = dopbox_elements_manager;
         this.element_id = null;
         this.context = context;
         this.update_table = false;
         this.update_db = false;
 
         const self = this;
 
         // DATASOURCE
        
         const top_row = new Div().attachTo(this.modal_body);
 
         this.datasource = new DataSourceSelector((choice) => {
             this.visibility(choice);
             self.context.signals.onChange.dispatch();
         }).attachTo(this.modal_body);
 
       
 
         // MANUAL
         this.add_item_btn = new Button(Translator.translate('Add Item'),{classes:['btn','btn-success','float-right','collapse','show']}).attachTo(top_row); 
         this.source_manual = new Div({classes:['mt-2','collapse','show']}).attachTo(this.modal_body);
         this.items_table = new ItemsTable((target, table) => {
            if (target.classList.contains('dropdown-items-move-up')) {
                 let row = target.parentNode.parentNode;
                 let sibling = row.previousElementSibling;
                 let parent = row.parentNode;
                 parent.insertBefore(row, sibling);
                 table.updateOrder();		
            } else if (target.classList.contains('dropdown-items-move-down')) {
                 let row = target.parentNode.parentNode;
                 let anchor = row.nextElementSibling;
                 let parent = row.parentNode;
                 parent.insertBefore(row, anchor?anchor.nextElementSibling:parent.firstChild);
                 table.updateOrder();
            } else if (target.classList.contains('dropdown-items-remove-item')) {			
                 let row = target.parentNode.parentNode;		  
                 table.getBody().dom.removeChild(row);
                 table.updateOrder();
            } 
            self.context.signals.onChange.dispatch();
         }).attachTo(this.source_manual);
        
         this.add_item_btn.dom.addEventListener('click',function() {
            self.items_table.add("Option " + (ItemsModal.counter++));
            self.context.signals.onChange.dispatch();
         });
 
 
         // TABLE
         this.source_table = new Div({classes:['mt-2','collapse']}).attachTo(this.modal_body);
         new Label(Translator.translate('Chose Table:')).attachTo(this.source_table);
         this.table_selector = new TableSelector(context,(table)=> {
            this.update_table = true;
             this.column_selector.getColumns(table);
             this.show_table_items.uncheck();
             this.table_column_values.clear();
             self.context.signals.onChange.dispatch();
         }).attachTo(this.source_table);
         new Label(Translator.translate('Chose Column:'),{classes:['mt-2']}).attachTo(this.source_table);
         this.column_selector = new TableColumnSelector(context, (column) => {
            this.update_table = true;
             if (this.show_table_items.isChecked())
                 this.table_column_values.getColumnValues(this.table_selector.getValue(), column, ()=> {
                     this.update_table = true;
                     self.context.signals.onChange.dispatch();
                 },
                 () => {
                    this.show_table_items.uncheck();
                 });
         }).attachTo(this.source_table);
 
         this.show_table_items = new RadioCheckInput('checkbox', null,Translator.translate('Show values?'),null,null, null, () => {
             if (this.show_table_items.isChecked()) {
                 this.table_column_values.getColumnValues(this.table_selector.getValue(), this.column_selector.getValue(), () => {
                     this.update_table = true;
                     self.context.signals.onChange.dispatch();
                 },
                 () => {
                    this.show_table_items.uncheck();
                 });
             } else {
                 this.table_column_values.clear();
             }
         }).attachTo(this.source_table);
         this.show_table_items.addClass('my-2');
         this.table_column_values = new TableColumnValueSelector(context).attachTo(this.source_table);
 
 
         // DATABASE
         this.source_database = new Div({classes:['mt-2','collapse']}).attachTo(this.modal_body);
         new Label(Translator.translate('Chose Database:')).attachTo(this.source_database);
         this.db_selector = new DBSelector(context, (db)=> {
            this.update_db = true;
            this.show_database_items.uncheck();
            this.database_column_values.clear();
            this.db_table_selector.getTables(db, () => {
                this.db_column_selector.getColumns(db, this.db_table_selector.getValue());
                this.context.signals.onChange.dispatch();
            });
         }).attachTo(this.source_database);        
         new Label(Translator.translate('Chose Table:'),{classes:['mt-2']}).attachTo(this.source_database);
         this.db_table_selector = new DBTableSelector(context, (table) => {
            this.update_db = true;
            this.show_database_items.uncheck();
            this.database_column_values.clear();
            this.db_column_selector.getColumns(this.db_selector.getValue(), table);
            this.context.signals.onChange.dispatch();
         }).attachTo(this.source_database);
         new Label(Translator.translate('Chose Column:'),{classes:['mt-2']}).attachTo(this.source_database);
         this.db_column_selector = new DBTableColumnsSelector(context, (column) => {
            this.update_db = true;
            this.context.signals.onChange.dispatch();
            if (this.show_database_items.isChecked()) {
                this.database_column_values.getColumnValues(this.db_selector.getValue(), this.db_table_selector.getValue(), column, this.unique.isChecked(), () => {
                    this.update_db = true;
                    this.context.signals.onChange.dispatch();
                },
                () => {
                    this.show_database_items.uncheck();
                });
            }
         }).attachTo(this.source_database);
 
         this.unique = new RadioCheckInput('checkbox', null,Translator.translate('Unique values'),null,null, false, (unique) => {
            self.context.signals.onChange.dispatch();
            if (this.show_database_items.isChecked()) {
                this.database_column_values.getColumnValues(this.db_selector.getValue(), this.db_table_selector.getValue(), this.db_column_selector.getValue(), unique, () => {
                    this.update_db = true;
                    this.context.signals.onChange.dispatch();
                },
                () => {
                    this.show_database_items.uncheck();
                });
            } else {
                this.database_column_values.clear();
            }


         }).attachTo(this.source_database);
         this.unique.addClass('pt-2');

         this.show_database_items = new RadioCheckInput('checkbox', null,Translator.translate('Show values?'),null,null, null, () => {
            if (this.show_database_items.isChecked()) {
                this.database_column_values.getColumnValues(this.db_selector.getValue(), this.db_table_selector.getValue(), this.db_column_selector.getValue(), this.unique.isChecked(), () => {
                    this.update_db = true;
                    this.context.signals.onChange.dispatch();
                },
                () => {
                    this.show_database_items.uncheck();
                });
            } else {
                this.database_column_values.clear();
            }
        }).attachTo(this.source_database);

        this.show_database_items.addClass('my-2');
        this.database_column_values = new DBTableColumnValuesSelector(context).attachTo(this.source_database);
            
         // DONE
         $(this.ok_btn.dom).on('click', function(e) {
             if (self.element_id) {
                 const source = self.datasource.getValue();
                 switch (source) {
                     case 'table':
                        self.update_table = false;
                         const table = self.table_selector.getValue();
                         const column = self.column_selector.getValue();
                         const selected = self.table_column_values.getValue();
                         self.dopbox_elements_manager.updateElement(self.element_id, source, null, selected, table, column);
                         break;
                     case 'database':
                        self.update_db = false
                         const database = self.db_selector.getValue();
                         const db_table = self.db_table_selector.getValue();
                         const db_column = self.db_column_selector.getValue();
                         const db_selected = self.database_column_values.getValue();
                         const unique = self.unique.isChecked();
                         self.dopbox_elements_manager.updateElement(self.element_id, source, null, db_selected, db_table, db_column, database, unique);
                         break;
                     case 'manual':
                     default:
                        const [options, checked] = self.items_table.getOptions();
                        self.dopbox_elements_manager.updateElement(self.element_id, source, options, checked);
                 }
             }
         } );
         
         context.signals.onTableRemoved.add((table_name) => {
            self.update_table = true;
         });
         context.signals.onSaved.add(() => {
            self.update_table = true;
         });         
         
     }
 
     /**
      * Controls the visibility of the 3 sections.
      *  ---- Using this instead of tabs, because I'm sick of tabs. ---
      * @param {string} source Which section?
      * @param {string} table 
      * @param {string} column 
      * @param {string} database 
      * @param {string} selected
      * @param {boolean} unique
      * @returns True if the saved values were set, False otherwise.
      */
     visibility(source, table=null, column=null, database=null, selected=null, unique=false) {
         if (source === 'table') {
             this.add_item_btn.removeClass('show');
             this.source_manual.removeClass('show');
             this.source_table.addClass('show');
             this.source_database.removeClass('show');
             if (selected) this.show_table_items.check();
             if (this.table_selector.length() == 0 || this.update_table)  {
                 this.table_selector.getTables(() => {
                     if (table) this.table_selector.setValue(table);
                     this.column_selector.getColumns(
                         this.table_selector.getValue(),
                         () => {                            
                             if (column) this.column_selector.setValue(column);
                             this.context.signals.onChange.dispatch();
                             if (this.show_table_items.isChecked()) {
                                 this.table_column_values.getColumnValues(this.table_selector.getValue(), this.column_selector.getValue(), () => {
                                     this.table_column_values.setValue(selected);
                                     this.context.signals.onChange.dispatch();
                                     return true;
                                },
                                () => {
                                    this.show_table_items.uncheck();
                                });
                             }
                         })
                 });
             }            
         } else if (source === 'database') {
            unique?this.unique.check():this.unique.uncheck();
             this.add_item_btn.removeClass('show');
             this.source_manual.removeClass('show');
             this.source_table.removeClass('show');
             this.source_database.addClass('show');
             if (selected) this.show_database_items.check();
             if (this.db_selector.length() == 0 || this.update_db) {
                 this.setDatabase(database, table, column, selected, unique, () => {
                    this.context.signals.onChange.dispatch();
                    return true;
                 })
             }
         } else {
             this.add_item_btn.addClass('show');
             this.source_manual.addClass('show');
             this.source_table.removeClass('show');
             this.source_database.removeClass('show');
         } 
         return false;
     }
 
     /**
      * 
      * @param {string} table 
      * @param {string} column 
      * @param {string} database 
      * @param {string} selected
      * @param {boolean} unique
      * @param {function} onReady 
      */
     setDatabase(database, table, column, selected, unique, onReady = null) {
        unique?this.unique.check():this.unique.uncheck();
         this.db_selector.getDatabases(() => {
             if (database) this.db_selector.setValue(database);
             this.db_table_selector.getTables(this.db_selector.getValue(), () => {
                 if (table) this.db_table_selector.setValue(table);
                 this.db_column_selector.getColumns(this.db_selector.getValue(), this.db_table_selector.getValue(), () => {
                         if (column) {
                            this.db_column_selector.setValue(column);
                            if (this.show_database_items.isChecked()) {
                                this.database_column_values.getColumnValues(
                                    this.db_selector.getValue(), 
                                    this.db_table_selector.getValue(), 
                                    this.db_column_selector.getValue(),
                                    unique,
                                    null,
                                    () => {
                                        this.show_database_items.uncheck();
                                    });
                                if (selected) {
                                    this.database_column_values.setValue(selected);
                                }
                                if (onReady) onReady();
                            }
                         }                         
                     });
             });
         });
     }
 
     /**
      * Show modal.
      * @param {Element} selected_element Selected Element.
      */
     show(selected_element) {
         this.element_id = selected_element.dom.id;   
         
         // clear any item
         this.items_table.clear();
 
         const {source, options, selected, table, column, database, unique} = this.dopbox_elements_manager.getElement(this.element_id); 
         this.datasource.setValue(source);
         if (this.visibility(source, table, column, database, selected, unique)) {
             if (source === 'table') {
                 this.table_selector.setValue(table);
                 this.column_selector.setValue(column);
                 this.table_column_values.setValue(selected);
             } else if (source === 'database') {
                 this.db_selector.setValue(database);
                 this.db_table_selector.setValue(table);
                 this.db_column_selector.setValue(column);
                 this.database_column_values.setValue(selected);
                 unique?this.unique.check():this.unique.uncheck();
             } 
         }
 
         if (options && selected) {
             for (let i=0; i<options.length; i++) {
                 this.items_table.add(options[i]);
             }	
             $("input[name='dropdown-items-optradio'][value='" + selected + "']").prop('checked', true);
         }
         super.show();
 
     }
 }
 
 
 