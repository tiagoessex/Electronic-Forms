
import { Table, TableThead, TableTd, TableTh, TableTr, TableTbody } from '/static/js/ui/BuildingBlocks.js';
import { Modal, MODAL_SIZE } from '/static/js/modals/Modal.js';
import { fetchGET } from '/static/js/Fetch.js';
import { URL_GET_TABLE } from '/static/js/urls.js';
import { Translator } from '/static/js/Translator.js';

/**
 * Show table contents.
 */
export class TableModal extends Modal { 

    /**
     * Constructor.
     * @param {string} title Title of the modal.
     * @param {string} help_text Helper text.
     * @param {Context} context Context.
     */
    constructor(title, help_text='', context = null) {
        super(title, help_text, MODAL_SIZE.LG); 

        if (!context || context === undefined) {
            console.error('[TableModal->TableModal::ctor] - Missing the context!');
            throw Error('Missing the context!');
        } 

        this.context = context;        

        const table = new Table(
            {classes:['table','table-bordered','table-hover','display','nowrap']}).attachTo(this.modal_body);
        
        this.thead = new TableThead().attachTo(table);

        this.tbody = new TableTbody().attachTo(table);
    }

    /**
     * Show modal.
     * @param {number} id Table asset ID.
     * @param {string} filename Table name.
     */
    show(id, filename) {
        this.modal_title.dom.innerHTML = Translator.translate('Table') + ': <b>' + filename + '</b>';
        const URL = URL_GET_TABLE + this.context.properties.id + '/' + filename + '/';
        fetchGET(URL, 
            (result) => {
                $(this.thead.dom).empty();
                $(this.tbody.dom).empty();
                // create the header
                const cols = result[0];
                const header_row = new TableTr().attachTo(this.thead);
                for (const key in cols) {                       
                    th(header_row, key);
                }
                // the body
                result.forEach((row) => {
                    const new_row = new TableTr().attachTo(this.thead);
                    for (const key in row) {                       
                        const field = new TableTd().attachTo(new_row);
                        field.setTextContent(row[key]);
                    }                
                })
                super.show();
            },
            (error) => {
                this.hide();
                this.context.signals.onError.dispatch(error,"[TableModal::show]");
            }
        );       
    }

}


// -------------------
// HELPER CONSTRUTORS
// -------------------

/**
 * Table column.
 * @param {*} parent 
 * @param {*} text 
 */
const th = (parent, text) => {
    const _th = new TableTh({classes:['bg-info','text-center', 'text-white']}).attachTo(parent);
    _th.setTextContent(text);
}

