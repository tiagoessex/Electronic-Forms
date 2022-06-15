
import { FormBaseElement } from './FormBaseElement.js';
import { Table, TableTr, TableTd, TableTh, TextArea, AwesomeIconAndButton } from '/static/js/ui/BuildingBlocks.js';
import { PROPERTIES_ID } from '/static/designer/js/constants/constants.js';
import { DEFAULT_TABLE_ELEMENT_ROWS_FONT_SIZE } from '/static/designer/js/elements/constants.js';
import { DEFAULTBACKGROUNDCOLOR } from '/static/designer/js/constants/colors.js';



export class TableElement extends FormBaseElement {
  /**
   * Constructor.
   * @param {Context} context The Context.
   * @param {object} props Properties.
   * @param {string} id Element/Input ID.
   * @param {object} table_config Table configuration.
   * @returns 
   */
  constructor(context, props, id, table_config) {
        super(context, props);

        this.context = context;
        this.table_config = table_config;
        this.id = id;
        this.inputs = {};
        this.setId(id);
        const self = this;

        this._enabled = props[PROPERTIES_ID.ENABLEDPROPERTY] === 'yes';
        const height = this.props[PROPERTIES_ID.HEIGHTPROPERTY];

        const width = table_config.width;
        this.setStyle('width', width + 'px');
        this.setStyle('height', height + 'px');
        
        this.table = new Table().attachTo(this);
        this.table.addClass('table-element-fv');
        this.createTable();

        // add / remove rows at the end of the table
        const delete_row_btn = new AwesomeIconAndButton('','fas fa-times').attachTo(this);
        delete_row_btn.addClass('remove-row-btn-fv no-print float-left');
        delete_row_btn.setStyle('position','absolute');
        //delete_row_btn.setStyle('background-color','red');
        const add_row_btn = new AwesomeIconAndButton('','fas fa-plus').attachTo(this);
        add_row_btn.addClass('add-row-btn-fv no-print float-left');
        $(delete_row_btn.dom).on('click', function(e) {
          self.removeRow();
          self.context.signals.onRemoveRow.dispatch(self.real_id,self);
        });
        $(add_row_btn.dom).on('click', function(e) {          
          self.addRow();
          self.context.signals.onAddRow.dispatch(self.real_id,self);
        });

        // if exporting/printing => no need to set up the events
        if (context.isExport) return;


        context.signals.onEnabled.add((id) => {
          if (id === this.real_id || id === this.section || id === this.group) {
            for (const key in this.inputs)
              this.inputs[key].removeAttribute('disabled');
          }
        })
        context.signals.onDisabled.add((id) => {
            if (id === this.real_id || id === this.section || id === this.group) {
              for (const key in this.inputs)
                this.inputs[key].setAttribute('disabled','');
            }
        })
        context.signals.onListValueChanged.add((id, value, row_number, k) => {
            if (id === this.real_id) {
                this.inputs['row_' + row_number + "_col_" + k].dom.value = value;
            }
        })
        context.signals.onRemoveRow.add((id, who) => {          
          if (who != this && id === this.real_id) {
            this.removeRow();
          }
        })
        context.signals.onAddRow.add((id, who) => {
            if (who != this && id === this.real_id) {
              this.addRow();
            }
        })         

    }

    /**
     * Creates a table.
     * @param {object} data Table element data.
     */
    createTable(data=null) {        
        const n_rows = data?data.n_rows:this.table_config.n_rows;
        if (data) $(this.table.dom).empty();

        this.header = this.createHeader();
        for (let i=0; i<n_rows; i++) {
          this.inputs = {...this.inputs, ...this.createRow(i)};
        }
    }

    /**
     * Removes a row from the end.
     * @returns 
     */
    removeRow() {
      const rows =  Math.floor(Object.keys(this.inputs).length / this.table_config.n_cols);
        // there must be at least one row
        if (rows == 1) return;          
        $(this.table.dom).find("tr").last().remove();          
        for (const key in this.inputs) {
          const ind = key.indexOf('_');
          if (key.substring(ind+1, key.indexOf('_')+2) == rows-1) delete this.inputs[key];
        }        
    }

    /**
     * Adds a row at the end.
     */
    addRow() {
        const rows =  Math.floor(Object.keys(this.inputs).length / this.table_config.n_cols);
        this.inputs = {...this.inputs, ...this.createRow(rows)};        
    }


    /**
     * Saves the inputs and the configuration (rows, cols) of the element.
     * @returns A promise.
     */
    save() {
      super.save();
      for (const key in this.inputs) {
        this.status.value[key] = this.inputs[key].dom.value;
      }
      this.status.n_cols = this.table_config.n_cols;
      // since rows can change but cols not, then calculate n_rows using n_cols and total cells
      this.status.n_rows = Math.floor(Object.keys(this.status.value).length / this.table_config.n_cols);
      this.status.enabled = !this.inputs[Object.keys(this.inputs)[0]].hasAttribute('disabled');
      return new Promise((resolve) => resolve(this.status));
    }

    /**
     * Restore the element and its inputs.
     * @param {object} data Object containing all data necessary to restore the inputs and rows.
     */
     async restore(data) {
      super.restore(data);

      // only recreate table if config number of rows are different from data saved
      if (this.table_config.n_rows != data.n_rows) {
        this.createTable(data);
      }
        
      for (const key in data.value) {
        this.inputs[key].dom.value = data.value[key];
      }
      if (this.status.enabled) {
        for (const key in data.value) {
          this.inputs[key].removeAttribute('disabled');
        }
      } else {
        for (const key in data.value) {
          this.inputs[key].setAttribute('disabled','');
        }
      }

      return Promise.resolve();
    }



    /**
     * Creates the header.
     * @returns Header
     */
     createHeader() {
        const data = this.table_config;
        const header = new TableTr().attachTo(this.table);
        header.setStyle("height", data.header_height + "px");
        header.setStyle("text-align", data.header_alignment);
        header.setStyle("font-family", data.header_font);      
        header.setStyle("font-size", data.header_font_size + "px");
        header.setStyle("color", data.header_color);
        header.setStyle("background-color", data.header_back_color);
        for (let i=0; i<data.n_cols; i++) {
          const col = new TableTh().attachTo(header);        
          col.setStyle("font-style", data.header_style);
          col.setStyle("font-weight", data.header_weight);
          col.setAttribute("width", data.data_cols[i].col_width);
          col.setTextContent(data.data_cols[i].col_text);
          col.setStyle("border","1px solid black");
        }
        return header;
      }
  
      /**
       * Creates a single row.
       * @param {number} row_number Row number
       * @returns Object with all row inputs
       */  
      createRow (row_number){
          const row_inputs = {};
          const data = this.table_config;
          const row = new TableTr().attachTo(this.table);
          const self = this;
          row.setStyle("max-height", data.rows_height + "px");
          for (let k=0; k<data.n_cols; k++) {
            const cell = new TableTd().attachTo(row);
            cell.setStyle("width", data.data_cols[k].col_width + "%" );
            cell.setStyle("height", data.rows_height + "px");
            cell.setStyle("border","1px solid black");
            const input = new TextArea().attachTo(cell);
            input.setStyle("text-align", data.data_cols[k].col_alignment);
            input.setStyle("font-size", DEFAULT_TABLE_ELEMENT_ROWS_FONT_SIZE + "px");
            input.setStyle("width", (data.data_cols[k].col_width * data.width / 100) + 'px');
            input.setStyle("height", data.rows_height + "px");
            input.setStyle("border", "0px solid");
            input.setStyle("background-color", DEFAULTBACKGROUNDCOLOR);
            if (!this._enabled) input.setAttribute('disabled','');
            row_inputs['row_' + row_number + "_col_" + k] = input;
            input.setId(this.id + '_row_' + row_number + "_col_" + k);

            // connection to its equivalent in the formview
            $(input.dom).on('change', function(e) {
              self.context.signals.onFormValueChanged.dispatch(self.real_id, e.target.value, row_number, k); 
              //console.log(self.real_id, e.target.value, row_number, k);
            })
            $(input.dom).on('paste', function(e) {
              self.context.signals.onFormValueChanged.dispatch(self.real_id, e.target.value, row_number, k); 
            })

          }
        return row_inputs;
      }      

}
