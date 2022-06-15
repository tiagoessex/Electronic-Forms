import { BaseElement } from './BaseElement.js';
import { Table, TableTd, TableTr, TableTh, Div } from '/static/js/ui/BuildingBlocks.js';
import { PROPERTIES_ID } from '../../constants/constants.js';
import { DEFAULTBACKGROUNDCOLOR } from '../../constants/colors.js';
import { 
  ELEMENTS_TYPE,
  DEFAULT_TABLE_ELEMENT_ROW_HEIGHT,
  DEFAULT_TABLE_ELEMENT_WIDTH,
  DEFAULT_TABLE_ELEMENT_HEADER_HEIGHT,
  DEFAULT_TABLE_ELEMENT_N_COLS,
  DEFAULT_TABLE_ELEMENT_N_ROWS,
  DEFAULT_TABLE_ELEMENT_HEADER_ALIGNMENT,
  DEFAULT_TABLE_ELEMENT_HEADER_FONT,
  DEFAULT_TABLE_ELEMENT_HEADER_FONT_SIZE,
  DEFAULT_TABLE_ELEMENT_HEADER_STYLE,
  DEFAULT_TABLE_ELEMENT_HEADER_WEIGHT,
  DEFAULT_TABLE_ELEMENT_HEADER_COLOR,
  DEFAULT_TABLE_ELEMENT_HEADER_BACK_COLOR,
  DEFAULT_TABLE_ELEMENT_COL_ALIGNMENT,
  DEFAULT_TABLE_ELEMENT_ROWS_FONT_SIZE,
 } from '../constants.js';

/**
 * Table Element.
 * 
 * Props that matter:
 *  - page
 *  - section
 *  - id
 *  - name
 *  - visible
 *  - z-index
 *  - top
 *  - left
 */
export class TableElement extends BaseElement {

  /**
   * Construtor.
   * @param {ELEMENTS_TYPE} type Element type.
   * @param {object} props Properties
   * @param {node} parent Attached to
   * @param {Context} context Context
   * @param {number} left Left coordinate
   * @param {number} top Top coordinate
   * @param {string} id Element's id
   * @param {rgb[a]} background Background color
   * @param {object} data Table configuration data (if element was loaded)
   */
  constructor(type=ELEMENTS_TYPE.NONE, props = null, parent=null, context=null, left, top, id, background=null, data=null) {
        super(type, props, parent, context, left, top, id, background);
               
        this.data = {};
        this.header = null;
        this.context = context;
        this.type = type;

        this.table = new Table().attachTo(this);
        this.table.addClass('table-element');
        this.table.setStyle('z-index',props?props[PROPERTIES_ID.ZINDEXPROPERTY]:10);
        this.table.setStyle("top",(props?props[PROPERTIES_ID.TOPPROPERTY]:top)+"px");
        this.table.setStyle("left",(props?props[PROPERTIES_ID.LEFTPROPERTY]:left)+"px");

        this.init(data, true);
        //this.createTable();
    }

    /**
     * Initializes the table. 
     * If no data to restore, then create a default table
     * @param {object} data Data to restore
     */
    init(data=null, create=false) {
      if (data) {
        this.data = {...data};
      } else {
        this.data.name = (this.props && this.props[PROPERTIES_ID.NAMEPROPERTY] !== '')?this.props[PROPERTIES_ID.NAMEPROPERTY]:'';//this.getId()';
        this.data.rows_height = DEFAULT_TABLE_ELEMENT_ROW_HEIGHT;
        //this.data.rows_font_size = DEFAULT_TABLE_ELEMENT_ROWS_FONT_SIZE
        this.data.width = DEFAULT_TABLE_ELEMENT_WIDTH;        
        this.data.n_cols = DEFAULT_TABLE_ELEMENT_N_COLS;
        this.data.n_rows = DEFAULT_TABLE_ELEMENT_N_ROWS;

        this.data.header_height = DEFAULT_TABLE_ELEMENT_HEADER_HEIGHT;
        this.data.header_alignment = DEFAULT_TABLE_ELEMENT_HEADER_ALIGNMENT;
        this.data.header_font = DEFAULT_TABLE_ELEMENT_HEADER_FONT;
        this.data.header_font_size = DEFAULT_TABLE_ELEMENT_HEADER_FONT_SIZE;
        this.data.header_style = DEFAULT_TABLE_ELEMENT_HEADER_STYLE;
        this.data.header_weight = DEFAULT_TABLE_ELEMENT_HEADER_WEIGHT;
        this.data.header_color = DEFAULT_TABLE_ELEMENT_HEADER_COLOR;
        this.data.header_back_color = DEFAULT_TABLE_ELEMENT_HEADER_BACK_COLOR;      

        this.data.data_cols = [];
        for (let i=0; i<this.data.n_cols; i++) {
          this.data.data_cols.push({
            'col_text': 'header ' + i,
            'col_width': 100 / this.data.n_cols,
            'col_alignment': DEFAULT_TABLE_ELEMENT_COL_ALIGNMENT,
          })
        }
      }

      if (create) this.createTable();
      //console.log(this.data);
    }

    /**
     * Creates the table.
     */
    createTable() {
      $(this.table.dom).empty();
      this.table.setStyle("width", this.data.width);
      this.header = TableElement.createHeader(this.data, this.table);
      TableElement.createRows(this.data, this.table, this.type);
      // updates height, otherwise the selection would be greater or lesser than the actual table size
      this.setStyle('height',this.table.dom.style.height);
      this.setStyle('width',this.table.dom.style.width);
      this.props[PROPERTIES_ID.HEIGHTPROPERTY] = parseInt(this.table.dom.style.height);
      this.props[PROPERTIES_ID.WIDTHPROPERTY] = parseInt(this.table.dom.style.width);
    }

    /**
     * Updates the table configuration
     */
    update() {
      this.createTable();
      this.context.signals.onChange.dispatch();
    }


    /**
     * Sets a table property
     * @param {string} property Property name
     * @param {string|number} value Property value
     * @param {number} index Column number (only relevant for data_cols' properties)
     */
    setProperty(property, value, index) {
      console.log(property, value, index);
      if (['col_width','col_alignment','col_text'].includes(property)) {
        this.data.data_cols[index][property] = value;
      } else {
        this.data[property] = value;
        if (property === 'n_cols') {
          const size = this.data.data_cols.length;
          const diff = size - value;
          if (diff > 0) {
            this.data.data_cols = this.data.data_cols.splice(0,size-diff);
          } else {            
            for (let i=size; i<(-diff + size); i++) {              
              this.data.data_cols.push({
                'col_text': 'header ' + (i + 1),
                'col_width': 100 / this.data.n_cols,
                'col_alignment': DEFAULT_TABLE_ELEMENT_COL_ALIGNMENT,
              })
            }
          }

        }
      }
      this.update();
    }

    /**
     * Gets the value of a specific value.
     * @param {string} property Property name.
     * @param {number} index Column number (only relevant for data_cols' properties).
     * @returns Property value.
     */
    getProperty(property, index) {
      if (['col_width','col_alignment','col_text'].includes(property)) {
        return this.data.data_cols[index][property]
      } else {
        return this.data[property];
      }
    }

    /**
     * Gets the table configuration.
     * @returns Table configuration.
     */
    getTableConfig() {      
      return this.data;
    }
    

    /**
     * Creates the header.
     * @param {object} data TableElement data
     * @param {element} parent Table
     * @returns Header
     */
    static createHeader = (data, parent) => {
      const header = new TableTr().attachTo(parent);
      header.setStyle("height", data.header_height + "px");
      header.setStyle("text-align", data.header_alignment);
      header.setStyle("font-family", data.header_font);      
      //header.setStyle("font-size", data.header_font_size + "px");
      header.setStyle("color", data.header_color);
      header.setStyle("background-color", data.header_back_color);
      for (let i=0; i<data.n_cols; i++) {
        const col = new TableTh().attachTo(header);        
        col.setStyle("font-style", data.header_style);
        col.setStyle("font-size", data.header_font_size + "px");
        col.setStyle("font-weight", data.header_weight);        
        col.setAttribute("width", data.data_cols[i].col_width + "%");
        col.setTextContent(data.data_cols[i].col_text);
      }
      return header;
    }

    /**
     * Creates the rows.
     * @param {object} data TableElement data
     * @param {element} parent Table
     */    
    static createRows = (data, parent, type=ELEMENTS_TYPE.TABLE) => {      
      for (let i=0; i<data.n_rows; i++) {
        const row = new TableTr().attachTo(parent);
        row.setStyle("max-height", data.rows_height);        
        for (let k=0; k<data.n_cols; k++) {
          const cell = new TableTd().attachTo(row);
          cell.setStyle("height", data.rows_height);
          const text = new Div().attachTo(cell);          
          text.setStyle("font-size", DEFAULT_TABLE_ELEMENT_ROWS_FONT_SIZE + "px");
          if (type == ELEMENTS_TYPE.TABLE) {
            text.setTextContent('row ' + (i+1));
            text.setStyle("background-color", DEFAULTBACKGROUNDCOLOR);
          }
          text.setStyle("text-align", data.data_cols[k].col_alignment);
          text.setStyle("height", "100%");
          text.setStyle("width", "100%");
          //data.data_cols[k].col_width = Math.floor(cell.dom.clientWidth / data.width * 100);
        }
      }
    }  

}
