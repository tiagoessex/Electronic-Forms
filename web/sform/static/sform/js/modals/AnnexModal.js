
import { 
    Table, TableThead, TableTd, TableTh, TableTr, TableTbody, 
    ButtonAndAwesomeIcon,
    Div 
} from '/static/js/ui/BuildingBlocks.js';
import { Modal } from '/static/js/modals/Modal.js';
import { fetchGET } from '/static/js/Fetch.js';
import { 
    URL_LIST_OPERATION_ANNEXES,
    URL_DOWNLOAD_OPERATION_ASSET,
    getFileFromUrl } from '/static/js/urls.js';
import { ClickOrDragFileInput } from "/static/js/modals/ClickOrDragFileInput.js";
import { ASSETTYPE } from '/static/js/assettype.js';
import { RemoveAsset } from '/static/js/RemoveAsset.js';
import { APP } from '/static/js/constants.js';
import { UploadAsset } from '/static/js/UploadAsset.js';
import { Translator } from '/static/js/Translator.js';


/**
 * Manage all annexed associated with the current operation:
 *      - add
 *      - remove
 */
export class AnnexModal extends Modal { 

    /**
     * Constructor.
     * @param {string} title Title of the modal.
     * @param {string} help_text Helper text.
     * @param {Context} context Context.
     */
    constructor(title, help_text='', context = null) {
        super(title, help_text); 

        if (!context || context === undefined) {
            console.error('[AnnexModal->AnnexModal::ctor] - Missing the context!');
            throw Error('Missing the context!');
        } 

        this.context = context;        
        const self = this;
        this.operation_id = null;
        
        // IMPORT TABLE
        const import_row = new Div().attachTo(this.modal_body);
        
        this.input = new ClickOrDragFileInput('am-import-table-input', 'asset-file', (file, data, type) => {
            // find type
            let _type = ASSETTYPE.OTHER;
            if (type === 'text/csv')
                _type = ASSETTYPE.CSV;
            else if (['image/jpeg','image/png','image/gif'].includes(type))
                _type = ASSETTYPE.IMAGE;
            else if (type === 'application/pdf')
                _type = ASSETTYPE.PDF;

            data.append('is_annex', true);
            UploadAsset(
                data, 
                self.operation_id,
                file.name, 
                _type, 
                APP.OPERATION, 
                (result) => {
                    this.newRow(result.id, result.asset);
                    self.context.changed = true;
                    self.context.signals.onAnnexUploaded.dispatch(getFileFromUrl(result.asset), self.operation_id, result.id);
                    self.context.signals.saveOperation.dispatch();
                }, 
                (error) => {
                    self.hide();
                    self.context.signals.onError.dispatch(error,"[AnnexModal::UploadAsset]");  
                }
            );
        }, '*/*').attachTo(import_row);
        this.input.addClass('mb-2');


        // LIST ANNEXES
        const table = new Table(
            {classes:['table','table-bordered','table-hover','table-sm','display','nowrap']}).attachTo(this.modal_body);
        
        const thead = new TableThead().attachTo(table);

        const header_row = new TableTr().attachTo(thead);

        th(header_row, Translator.translate('Documents'), 75);
        th(header_row, Translator.translate('Operations'), 25);

        this.tbody = new TableTbody().attachTo(table);


        // OPS BUTTONS
        $(this.tbody.dom).on('click',function (e) {
            var target = e.target; 
            let row = e.target.parentNode.parentNode;

            if (target.classList.contains('tmm-remove-table')) {
                const table_id = row.dataset.id;
                RemoveAsset([table_id], null, APP.OPERATION, () => {
                    self.context.signals.onAnnexRemoved.dispatch(row.dataset.filename, self.operation_id, table_id);
                    self.tbody.dom.removeChild(row);
                    self.context.changed = true;
                    self.context.signals.saveOperation.dispatch();
                }, (error) => {
                    self.hide();
                    //console.error(error);
                    self.context.signals.onError.dispatch(error,"[AnnexModal::removeRow]");
                });                
                
            } else if (target.classList.contains('tmm-export-table')) {                
                self.download(row.dataset.id, row.dataset.filename);
            }            
        });

    }    

    /**
     * Show modal and show all current annex files associated with an operation.
     */
    show(operation_id) {
        this.operation_id = operation_id;
        const URL = URL_LIST_OPERATION_ANNEXES + operation_id + '/';
        fetchGET(URL, 
            (result) => {
                $(this.tbody.dom).empty();
                result.forEach((value) => {
                    //if (value.is_annex) {
                        this.newRow(value.id, value.asset);
                    //}
                })
                super.show();
            },
            (error) => {
                this.hide();
                this.context.signals.onError.dispatch(error,"[AnnexModal::show]");
            }
        );
    }

    /**
     * Add a new row to the table list.
     * @param {string} id Table asset id-
     * @param {string} filename Table name.
     */
    newRow(id, filename) {
        const file = getFileFromUrl(filename);
        const row = new TableTr().attachTo(this.tbody);
        row.setAttribute('data-id', id);
        row.setAttribute('data-filename', file);
        row.setAttribute('data-fullpath', filename);

        const name = new TableTd().attachTo(row);
        name.addClass('align-middle');
        name.setTextContent(file);

        const buttons = new TableTd({classes:['align-middle', 'text-center']}).attachTo(row);
        const delete_btn = new ButtonAndAwesomeIcon('','fa fa-trash',
            {classes:['btn','btn-danger','btn-sm','tmm-remove-table','m-1']}).attachTo(buttons);
        delete_btn.setAttribute('type','button');
        const export_btn = new ButtonAndAwesomeIcon('','fa fa-download',
            {classes:['btn','btn-success','btn-sm','tmm-export-table','m-1']}).attachTo(buttons);
        export_btn.setAttribute('type','button');

    }



    /**
     * Download an asset (table).
     * @param {number} id Asset ID.
     */
    download(id, filename) {
        const URL = URL_DOWNLOAD_OPERATION_ASSET + id + '/';
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
            //document.body.removeChild(a);
            a.remove();
        })
        .catch((error) => {
            this.hide();
            this.context.signals.onError.dispatch(error,"[AnnexModal::download]");
        })
    }  

}


const downloadBlobAsFile = function(data, filename){
    const contentType = 'application/octet-stream';
if(!data) {
console.error(' No data')
return;
}

if(!filename) filename = 'filetodonwload.txt'

if(typeof data === "object"){
data = JSON.stringify(data, undefined, 4)
}

var blob = new Blob([data], {type: contentType}),
e    = document.createEvent('MouseEvents'),
a    = document.createElement('a')

a.download = filename
a.href = window.URL.createObjectURL(blob)
a.dataset.downloadurl =  [contentType, a.download, a.href].join(':')
e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
a.dispatchEvent(e)
}

/**
 * Helper function.
 * @param {*} parent 
 * @param {*} text 
 */
const th = (parent, text, width=20) => {
    const _th = new TableTh({classes:['bg-light','text-center']}).attachTo(parent);
    _th.setTextContent(text);
    _th.setStyle("width", width + "%");
}

