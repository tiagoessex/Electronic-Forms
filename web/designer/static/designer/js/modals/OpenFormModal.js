
import { Table, TableThead, TableTd, TableTh, TableTr, TableTbody } from '/static/js/ui/BuildingBlocks.js';
import { Modal, MODAL_SIZE } from '/static/js/modals/Modal.js';
import { fetchGET } from '/static/js/Fetch.js';
import { URL_EDITABLES_FORMS } from '/static/js/urls.js';
import { RadioCheckInput } from '/static/js/ui/RadioCheckInput.js';
import { Translator } from '/static/js/Translator.js';
import { th } from './helpers.js';


/**
 * Present a table with all available editable forms.
 * Editable => is_locked='F' && is_in_use='F' && 'is_disabled'='F' && is_temp='F'
 */
export class OpenFormModal extends Modal { 

    /**
     * Constructor.
     * @param {string} title Title of the modal.
     * @param {string} help_text Helper text.
     * @param {function} openForm Callback to open a form.
     */
    constructor(title, help_text='', openForm=null ) {
        super(title, help_text, MODAL_SIZE.LG); 

        if (!openForm || openForm === undefined) {
            console.error('[OpenFormModal->OpenFormModal::ctor] - Missing openForm callback function!');
            throw Error('Missing openForm callback function!');
        } 

        this.openForm = openForm;
        const self = this;
        
        this.check = new RadioCheckInput('checkbox', null, Translator.translate('Show Temporary')).attachTo(this.modal_body);
        this.check.addClass('mb-2');

        const table = new Table(
            {classes:['table','table-bordered','table-hover','display','nowrap']}).attachTo(this.modal_body);
        
        const thead = new TableThead().attachTo(table);

        new TableTr().attachTo(thead);

        th(thead, Translator.translate('ID'), 'bg-warning');
        th(thead, Translator.translate('Name'), 'bg-warning');
        th(thead, Translator.translate('Description'), 'bg-warning');

        this.tbody = new TableTbody().attachTo(table);

        $(this.tbody.dom).on('click', function(event) { 
            self.openForm(event.target.parentNode.dataset.id);
        }); 
        
        $(this.check.input.dom).on('change', (event) => {
            if (event.currentTarget.checked) {
              const row = self.tbody.dom.querySelectorAll('.temporary');
              for (let i=0; i<row.length; i++) {
                  $(row[i]).show();
              }
            } else {
              const row = self.tbody.dom.querySelectorAll('.temporary');
              for (let i=0; i<row.length; i++) {
                  $(row[i]).hide();
              }              
            }
        })        
        
    }

    /**
     * Show modal.
     */
    show() {
        // fetch and build the table
        fetchGET(URL_EDITABLES_FORMS, 
            (result) => {
                $(this.tbody.dom).empty();
                result.reduceRight((_, values) => {
                    const row = new TableTr().attachTo(this.tbody);
                    row.setAttribute('data-id',values.id)
                    
                    if (values.status_name === 'TEMPORARY') {
                        row.setStyle("background-color", '#ffeaee');
                        row.addClass('temporary');
                        $(row.dom).hide();
                    }
                    
                    const id = new TableTd().attachTo(row);
                    id.setTextContent(values.id)
                    const name = new TableTd().attachTo(row);
                    name.setTextContent(values.name)
                    const desc = new TableTd().attachTo(row); 
                    desc.setTextContent(values.description)
                }, null)
                super.show();
            },
            (error) => {
                console.error(error);
            }
        );        
    }
}




