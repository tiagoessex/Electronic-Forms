
import { FormBaseElement } from './FormBaseElement.js';
import { Table, TableTr, TableTd, TableTh, TextArea, AwesomeIconAndButton } from '/static/js/ui/BuildingBlocks.js';
import { PROPERTIES_ID } from '/static/designer/js/constants/constants.js';
import { DEFAULT_TABLE_ELEMENT_ROWS_FONT_SIZE } from '/static/designer/js/elements/constants.js';
import { DEFAULTBACKGROUNDCOLOR } from '/static/designer/js/constants/colors.js';



export class StaticTableElement extends FormBaseElement {
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

        const height = this.props[PROPERTIES_ID.HEIGHTPROPERTY];

        const width = table_config.width;
        this.setStyle('width', width + 'px');
        this.setStyle('height', height + 'px');
        
        this.table = new Table().attachTo(this);
        this.table.addClass('table-element-fv');
        this.createTable();
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
          this.createRow(i);
        }
    }

    /**
     * Saves the inputs and the configuration (rows, cols) of the element.
     * @returns A promise.
     */
    save() {
      super.save();
      return new Promise((resolve) => resolve(this.status));
    }

    async restore(data) {
      super.restore(data);
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
       */  
      createRow (row_number){
          const data = this.table_config;
          const row = new TableTr().attachTo(this.table);
          row.setStyle("max-height", data.rows_height + "px");
          for (let k=0; k<data.n_cols; k++) {
            const cell = new TableTd().attachTo(row);
            cell.setStyle("width", data.data_cols[k].col_width + "%" );
            cell.setStyle("height", data.rows_height + "px");
            cell.setStyle("border","1px solid black");
          }
      }      

}
