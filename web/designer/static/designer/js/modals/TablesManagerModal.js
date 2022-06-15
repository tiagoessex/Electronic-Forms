
import { 
    Table, TableThead, TableTd, TableTh, TableTr, TableTbody, 
    ButtonAndAwesomeIcon,
    Div 
} from '/static/js/ui/BuildingBlocks.js';
import { Modal, MODAL_SIZE } from '/static/js/modals/Modal.js';
import { fetchGET } from '/static/js/Fetch.js';
import { 
    URL_LIST_FORM_ASSETS,
    URL_DOWNLOAD,
    getFileFromUrl } from '/static/js/urls.js';
import { ClickOrDragFileInput } from "/static/js/modals/ClickOrDragFileInput.js";
import { ASSETTYPE } from '/static/js/assettype.js';
import { TableModal } from './TableModal.js';
import { RemoveAsset } from '/static/js/RemoveAsset.js';
import { APP } from '/static/js/constants.js';
import { UploadAsset } from '/static/js/UploadAsset.js';
import { Translator } from '/static/js/Translator.js';


/**
 * Manage all tables associated with the current form:
 *      - add
 *      - remove
 *      - view
 */
export class TablesManagerModal extends Modal { 

    /**
     * Constructor.
     * @param {string} title Title of the modal.
     * @param {string} help_text Helper text.
     * @param {Context} context Context.
     */
    constructor(title, help_text='', context = null) {
        super(title, help_text, MODAL_SIZE.LG); 

        if (!context || context === undefined) {
            console.error('[TablesManagerModal->TablesManagerModal::ctor] - Missing the context!');
            throw Error('Missing the context!');
        } 

        this.context = context;  
        const self = this;
        
        // TABLE MODAL
        this.table_modal = new TableModal(Translator.translate('Table Contents'), '', context);

        // IMPORT TABLE
        const import_row = new Div().attachTo(this.modal_body);
        
        this.input = new ClickOrDragFileInput('tmm-import-table-input', 'asset-file', (file, data) => {
            UploadAsset(
                data, 
                self.context.properties.id,
                file.name, 
                ASSETTYPE.CSV, 
                APP.DESIGNER, 
                (result) => {
                    this.newRow(result.id, getFileFromUrl(result.asset));
                    self.context.signals.onTableAdded.dispatch();
                }, 
                (error) => {
                    self.hide();
                    self.context.signals.onError.dispatch(error,"[TablesManagerModal::UploadAsset]");  
                }
            );
        },'.csv').attachTo(import_row);
        this.input.addClass('mb-2');


        // AVAILABLE TABLES
        const table = new Table(
            {classes:['table','table-bordered','table-sm','table-hover','display','nowrap']}).attachTo(this.modal_body);
        
        const thead = new TableThead().attachTo(table);

        const header_row = new TableTr().attachTo(thead);

        th(header_row, Translator.translate('Tables'), 75);
        th(header_row, Translator.translate('Operations'), 25);

        this.tbody = new TableTbody().attachTo(table);


        // OPS BUTTONS
        $(this.tbody.dom).on('click',function (e) {
            var target = e.target; 
            let row = e.target.parentNode.parentNode;

            if (target.classList.contains('tmm-remove-table')) {
                self.removeRow(row);
            } else if (target.classList.contains('tmm-view-table')) {
                self.table_modal.show(row.dataset.id, row.dataset.filename);
            } else if (target.classList.contains('tmm-export-table')) {                
                self.download(row.dataset.id, row.dataset.filename);
            }            
        });

    }    

    /**
     * Show modal and show all current tables associated with the opened form.
     */
    show() {
        const URL = URL_LIST_FORM_ASSETS + this.context.properties.id + '/' + ASSETTYPE.CSV;
        fetchGET(URL, 
            (result) => {
                $(this.tbody.dom).empty();
                result.forEach((value) => {
                    this.newRow(value.id, getFileFromUrl(value.asset));
                })
                super.show();
            },
            (error) => {
                this.hide();
                this.context.signals.onError.dispatch(error,"[TablesManagerModal::show]");
            }
        );
    }

    /**
     * Add a new row to the table list.
     * @param {string} id Table asset id.
     * @param {string} filename Table name.
     */
    newRow(id, filename) {
        const row = new TableTr().attachTo(this.tbody);
        row.setAttribute('data-id', id);
        row.setAttribute('data-filename', filename);

        const name = new TableTd().attachTo(row);
        name.addClass('align-middle');
        name.setTextContent(filename);

        const buttons = new TableTd({classes:['align-middle', 'text-center']}).attachTo(row);
        const delete_btn = new ButtonAndAwesomeIcon('','fa fa-trash',
            {classes:['btn','btn-danger','tmm-remove-table','m-1']}).attachTo(buttons);
        delete_btn.setAttribute('type','button');
        const view_btn = new ButtonAndAwesomeIcon('','fa fa-eye',
            {classes:['btn','btn-primary','tmm-view-table','m-1']}).attachTo(buttons);
        view_btn.setAttribute('type','button');
        const export_btn = new ButtonAndAwesomeIcon('','fa fa-download',
            {classes:['btn','btn-success','tmm-export-table','m-1']}).attachTo(buttons);
        export_btn.setAttribute('type','button');

    }

    /**
     * Removes a row and the asset.
     * @param {node} row Table row.
     */
    removeRow(row) {
        const table_name = row.dataset.filename;
        //RemoveAsset([table_id], null, APP.DESIGNER, () => {
            console.warn(table_name);
        RemoveAsset(null, [table_name], APP.DESIGNER, () => {
            this.tbody.dom.removeChild(row);
            //this.context.signals.onTableRemoved.dispatch(table_id);
            this.context.signals.onTableRemoved.dispatch(table_name);
        }, (error) => {
            this.hide();
            //console.error(error);
            this.context.signals.onError.dispatch(error,"[TablesManagerModal::removeRow]");
        }, this.context.properties.id);
    }

    /**
     * Downloads an asset (table).
     * @param {number} id Asset ID.
     */
    download(id, filename) {
        const URL = URL_DOWNLOAD + id + '/';
        fetch(URL, {
                method: 'GET',
                mode: 'same-origin',
                headers: {
            },
        })
        .then( res => res.blob() )
        .then( blob => {            
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();    
            a.remove();
        })
        .catch((error) => {
            this.hide();
            this.context.signals.onError.dispatch(error,"[TablesManagerModal::download]");
        })
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
const th = (parent, text, width=20) => {
    const _th = new TableTh({classes:['bg-light','text-center']}).attachTo(parent);
    _th.setTextContent(text);
    _th.setStyle("width", width + "%");
}

