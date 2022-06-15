import { fetchGET } from '/static/js/Fetch.js';
import { URL_LIST_IN_USE_FORMS } from '/static/js/urls.js';
import { TableTr, TableTd } from '/static/js/ui/BuildingBlocks.js';
import { 
        FORM_SELECTION_SECTION,
        NO_CONTENT,
        HAS_CONTENT,
        FORMS_AVAILABLE,
        BACK_BTN,
} from "../ids.js";
import { TITLE_FORM_SELECTION } from "../constants.js";
import { Title } from '../Title.js';
import { ButtonsPrinting } from './ButtonsPrinting.js';


export function FormSelection(context) {
    this.context = context;
    const ref = this;

    this.title = new Title(TITLE_FORM_SELECTION, () => {
        $(FORM_SELECTION_SECTION).collapse('hide');
        ref.title.hide();
        context.signals.onMain.dispatch();  
    });

    $(FORMS_AVAILABLE).on('click', function(e) {
        context.form_id = $(e.target.parentNode).data('id');
        context.form_name = $(e.target.parentNode).data('name');
        $(FORM_SELECTION_SECTION).collapse('hide');
        ref.title.hide();
        context.new_operation = true;
        context.resume = false;
        context.signals.onOperationDetails.dispatch();
    });

}

FormSelection.prototype = {

    show: function () {
        this.context.clear();
        this.title.show();
        $(FORM_SELECTION_SECTION).collapse('show');    
        $(BACK_BTN).collapse('show');        
        this.getForms();          
    },

    getForms: function () {
        $('#form-selection-spinner').show();
        fetchGET(URL_LIST_IN_USE_FORMS, 
            (result) => {
                $(FORMS_AVAILABLE).empty();
                if (result.length > 0) {
                    $(NO_CONTENT).collapse('hide');
                    $(HAS_CONTENT).collapse('show');      
                } else {
                    $(HAS_CONTENT).collapse('hide');
                    $(NO_CONTENT).collapse('show'); 
                }
                const table = $(FORMS_AVAILABLE)[0];
                // order by the most recent
                result.reduceRight((_, form) => {
                    const row = new TableTr().attachTo(table);
                    row.setAttribute('data-id', form.id);
                    row.setAttribute('data-name', form.name);
                    const id = new TableTd({classes:["align-middle"]}).attachTo(row);
                    const name = new TableTd({classes:["align-middle"]}).attachTo(row);
                    const description = new TableTd({classes:["align-middle"]}).attachTo(row);
                    const printing = new TableTd({classes:["align-middle text-center"]}).attachTo(row);
                    id.setTextContent(form.id);      
                    name.setTextContent(form.name);      
                    description.setTextContent(form.description);
                    new ButtonsPrinting(this.context, form.id, form.name).attachTo(printing);
                }, null)
                $('#form-selection-spinner').hide();
            },
            (error) => {
                $('#form-selection-spinner').hide();
                this.context.signals.onError.dispatch(error,"[FormSelection::getForms]");
            })
    },
   
}

